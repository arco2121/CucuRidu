const SESSION_CACHE = new Map(); // customId -> { sid, jwt, metadata, cachedAt }
const CACHE_TTL_MS = 45 * 1000;
const REFRESH_THRESHOLD_MS = 12 * 60 * 60 * 1000; // rinnova expire solo sotto le 12h residue

function extractCucuriduCode(req) {
    const raw = req.headers['x-cucuridu-code']
        || req.cookies?.cucuriduCode
        || req.query?.cucuriduCode
        || req.body?.cucuriduCode;

    if (typeof raw !== 'string') return null;
    const clean = raw.trim();
    return clean.length >= 8 && clean.length <= 256 ? clean : null;
}

async function resolveCustomSession(pool, customId) {
    const now = Date.now();
    const cached = SESSION_CACHE.get(customId);
    if (cached && (now - cached.cachedAt) < CACHE_TTL_MS) {
        return cached;
    }

    // Singola query JOIN: recupera SID, sessione Express e JWT in un unico round-trip
    const { rows } = await pool.query(
        `SELECT
            si.custom_id,
            si.sid,
            si.jwt,
            si.metadata,
            si.expire AS custom_expire,
            s.sess AS express_sess
         FROM public.session_identificativi si
         LEFT JOIN public.session s ON s.sid = si.sid AND s.expire > NOW()
         WHERE si.custom_id = $1
           AND si.expire > NOW()
         ORDER BY si.updated_at DESC
         LIMIT 1`,
        [customId]
    );

    if (!rows.length) {
        SESSION_CACHE.delete(customId);
        return null;
    }

    const row = rows[0];
    const entry = {
        sid: row.sid,
        jwt: row.jwt,
        metadata: row.metadata || {},
        expressSess: row.express_sess || null,
        cachedAt: now
    };
    SESSION_CACHE.set(customId, entry);

    // Write-throttling: aggiorna expire su DB solo se mancano meno di 12 ore
    if (row.custom_expire && (new Date(row.custom_expire).getTime() - now) < REFRESH_THRESHOLD_MS) {
        pool.query(
            `UPDATE public.session_identificativi
             SET expire = NOW() + INTERVAL '7 days', updated_at = NOW()
             WHERE custom_id = $1`,
            [customId]
        ).catch(() => {});
    }

    return entry;
}

function invalidateSessionCache(customId) {
    if (customId) SESSION_CACHE.delete(customId);
}