const session = require('express-session');
const jwt = require('jsonwebtoken');
const MemoryStore = require('memorystore')(session)
const pgSession = require('connect-pg-simple')(session);

/*
 * ---- PERCHE' ESISTE QUESTO STORE ----
 *
 * 1) connect-pg-simple (v10) con `createTableIfMissing: true` controlla che la
 *    tabella esista alla PRIMA query e si tiene in memoria la promessa di quel
 *    controllo (`#tableCreationPromise`). Se quel primo controllo fallisce (un
 *    timeout del pooler di Supabase durante un deploy e' bastato,
 *    2026-09-20: "ECHECKOUTTIMEOUT ... in Transaction mode"), la promessa
 *    RIFIUTATA resta in memoria per sempre: da quel momento OGNI get/set/touch
 *    sul database delle sessioni fallisce all'istante con lo stesso errore,
 *    anche a Supabase tornato sano, fino al riavvio del processo. Nei log
 *    si vede lo stesso stack ripetuto ogni pochi secondi.
 *    Per questo la tabella qui si controlla per conto nostro (`assicuraTabella`,
 *    con nuovi tentativi) e a connect-pg-simple si passa
 *    `createTableIfMissing: false`.
 *
 * 2) express-session, quando lo store restituisce un errore in lettura,
 *    risponde 500 a QUALSIASI pagina. Chi arriva senza cookie non tocca lo
 *    store in lettura e vede tutto normale, chi ha gia il cookie (chiunque
 *    abbia aperto la home un secondo prima di cliccare "Crea stanza") prende
 *    "Internal Server Error".
 *
 * 3) Anche senza errori, un pooler lento fa aspettare la pagina 15 secondi.
 *
 * StoreTollerante mette Postgres davanti e un MemoryStore dietro: ogni
 * operazione su Postgres ha un tempo massimo; se fallisce o scade, l'errore
 * va nei log, Postgres viene lasciato stare per `pausaMs` (le richieste non
 * ci si accodano) e nel frattempo le sessioni vivono in memoria. Il gioco non
 * dipende comunque dalla sessione lato server: il fallback e' il token JWT
 * nell'URL (?token=). Quando Postgres torna a rispondere si riparte da solo.
 */
class StoreTollerante extends session.Store {

    constructor(primario, { nome = "postgres", timeoutMs = 3000, pausaMs = 15000 } = {}) {
        super();
        this.primario = primario;
        this.nome = nome;
        this.timeoutMs = timeoutMs;
        this.pausaMs = pausaMs;
        this.locale = new MemoryStore({ checkPeriod: 3600 * 1000 });
        this.riprovaDopo = 0;
        this.ultimoLog = 0;
    }

    get inPausa() {
        return Date.now() < this.riprovaDopo;
    }

    segnala(operazione, errore) {
        const adesso = Date.now();
        // pausa piena solo al primo guasto, non prorogata da chi era gia in volo
        if (!this.inPausa) this.riprovaDopo = adesso + this.pausaMs;
        if (adesso - this.ultimoLog > 10000) {
            this.ultimoLog = adesso;
            console.error(`[session:${this.nome}] ${operazione} fallito, uso la memoria per ${Math.round(this.pausaMs / 1000)}s ->`,
                errore?.message || errore);
        }
    }

    /** Chiama un metodo dello store primario con un tempo massimo. Risolve con l'array degli argomenti del callback. */
    chiama(operazione, args) {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => reject(new Error(`nessuna risposta dopo ${this.timeoutMs}ms`)), this.timeoutMs);
            const fine = (errore, ...resto) => {
                clearTimeout(timer);
                if (errore) reject(errore); else resolve(resto);
            };
            try { this.primario[operazione](...args, fine); }
            catch (errore) { fine(errore); }
        });
    }

    get(sid, callback) {
        if (this.inPausa) return this.locale.get(sid, callback);
        this.chiama("get", [sid]).then(
            ([sessione]) => sessione ? callback(null, sessione) : this.locale.get(sid, callback),
            (errore) => { this.segnala("get", errore); this.locale.get(sid, callback); }
        );
    }

    set(sid, sessione, callback) {
        if (this.inPausa) return this.locale.set(sid, sessione, callback);
        this.chiama("set", [sid, sessione]).then(
            () => callback && callback(null),
            (errore) => { this.segnala("set", errore); this.locale.set(sid, sessione, callback); }
        );
    }

    touch(sid, sessione, callback) {
        const finito = () => callback && callback(null);
        if (this.inPausa) return this.locale.touch(sid, sessione, finito);
        this.chiama("touch", [sid, sessione]).then(finito,
            (errore) => { this.segnala("touch", errore); this.locale.touch(sid, sessione, finito); });
    }

    destroy(sid, callback) {
        const finito = () => callback && callback(null);
        this.locale.destroy(sid, () => {});
        if (this.inPausa) return finito();
        this.chiama("destroy", [sid]).then(finito, (errore) => { this.segnala("destroy", errore); finito(); });
    }
}

/**
 * Crea la tabella delle sessioni se manca, riprovando finche' ci riesce (un
 * timeout del pooler non deve lasciare il server senza tabella ne' fermarlo).
 * Stessa definizione di connect-pg-simple.
 */
const assicuraTabella = async (pool, tabella = "sessions") => {
    const attese = [3000, 6000, 12000, 30000, 60000];
    for (let tentativo = 0; ; tentativo++) {
        try {
            const { rows } = await pool.query("SELECT to_regclass($1::text) AS esiste", [`"${tabella}"`]);
            if (rows[0]?.esiste === null) {
                await pool.query(`CREATE TABLE IF NOT EXISTS "${tabella}" (
                    "sid" varchar NOT NULL COLLATE "default" PRIMARY KEY,
                    "sess" json NOT NULL,
                    "expire" timestamp(6) NOT NULL)`);
                await pool.query(`CREATE INDEX IF NOT EXISTS "IDX_${tabella}_expire" ON "${tabella}" ("expire")`);
                console.log(`[session] tabella "${tabella}" creata`);
            }
            return;
        } catch (errore) {
            const attesa = attese[Math.min(tentativo, attese.length - 1)];
            console.error(`[session] controllo tabella "${tabella}" fallito (tentativo ${tentativo + 1}), riprovo fra ${attesa / 1000}s ->`, errore?.message || errore);
            await new Promise(resolve => setTimeout(resolve, attesa));
        }
    }
};

class Session {

    constructor(timeout = 3600000, token, blacklist = new Map(), pool = false) {
        this.timeout = timeout;
        this.pool = pool;
        this.blackList = blacklist;
        this.tokenKey = token;
        const clearBlacklist = async () => {
            try {
                await this._clearBlackList();
            } catch (error) { console.error(error.message); }
            finally {
                setTimeout(clearBlacklist, timeout);
            }
        };

        clearBlacklist();
    }

    setupSession(config = {}) {
        let store;
        if (this.pool) {
            assicuraTabella(this.pool, "sessions");
            store = new StoreTollerante(new pgSession({
                pool: this.pool,
                tableName: 'sessions',
                // vedi il commento su StoreTollerante: la tabella la controlla assicuraTabella
                createTableIfMissing: false,
                pruneSessionInterval: this.timeout/1000
            }));
        } else {
            store = new MemoryStore({
                checkPeriod: this.timeout/1000
            });
        }

        return session({
            ...config,
            secret: this.tokenKey,
            store
        });
    }

    set(req, data = {}) {
        if (req && req.session)
            req.session.storeData = { ...data };
        const seconds = Math.floor(this.timeout / 1000);
        return jwt.sign({ ...data }, this.tokenKey, { expiresIn: seconds });
    }

    async get(req, token = null) {
        if (req?.session?.storeData)
            return req.session.storeData;
        if (token) {
            if (await this.blackList.has(token)) return {};
            try {
                return jwt.verify(token, this.tokenKey);
            } catch {
                return {};
            }
        }
        return {};
    }

    async invalidate(req, token) {
        if (req?.session)
            req.session.destroy();
        if (token)
            await this.blackList.set(token, Date.now() + this.timeout);
    }

    async validate(keys, ...sources) {
        const result = {};
        const params = Array.isArray(keys) ? keys : Object.keys(keys);
        for (const source of sources) {
            let data = {};
            if (typeof source === "string") {
                data = await this.get(null, source);
            } else if (source && typeof source === "object") {
                data = source.session?.storeData || source;
            }
            for (const key of params) {
                if (data[key] !== undefined && data[key] !== null) {
                    if (result[key] === undefined) {
                        result[key] = data[key];
                    }
                }
            }
        }
        return result;
    }

    async _clearBlackList() {
        const now = Date.now();
        for (const [token, expiry] of await this.blackList.entries()) {
            if (now > expiry) await this.blackList.delete(token);
        }
    }
}

module.exports = { Session };