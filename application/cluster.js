const { createServer } = require("node:http");
const path = require("path");
const crypto = require("node:crypto");
const { Server } = require("socket.io");
const express = require("express");
const { Session } = require(path.join(__dirname, "/include/script/Session"));
const { generateId } = require(path.join(__dirname, "/include/script/generazione"));
const appConfig = require(path.join(__dirname, "/configurations/appConfig"));
const serverConfig = require(path.join(__dirname, "/configurations/serverConfig"));
const { Pool } = require("pg");
const { createAdapter } = require("@socket.io/postgres-adapter");
const { createClient } = require("@supabase/supabase-js");
const { ClusterStanze } = require(path.join(__dirname, "/include/script/ClusterStanze"));
const { ClusterSet } = require(path.join(__dirname, "/include/script/ClusterSet"));
const { Stanza } = require(path.join(__dirname, "/include/script/Stanza"));
const { cleanUpStanze, cleanUpMemory } = require(path.join(__dirname, "/configurations/clusterExtensions"));
const { ClusterMap } = require(path.join(__dirname, "/include/script/ClusterMap"));
const { SegnalazioniCluster } = require(path.join(__dirname, "/include/script/Segnalazioni"));

const clusterApp = async (local, port, allowedOrigins, env = {}, timeout = 3600000) => {
    const key = env.DATABASE_KEY;
    const url = env.DATABASE_URL;
    const password = env.DATABASE_PASSWORD;
    if(!key || !url || !password) throw new Error("Chiavi per il server mancanti");
    const poolStringForAdapter = env.DATABASE_POOL_ADAPTER?.replace("[PASSWORD]", encodeURIComponent(password));
    const poolStringForSessions = env.DATABASE_POOL_SESSION?.replace("[PASSWORD]", encodeURIComponent(password));

    const machineId = await generateId(64);
    const database = createClient(url, key);
    const generationMemory = new ClusterSet(database, machineId);
    const adapter = new Pool({
        connectionString: poolStringForAdapter,
        idleTimeoutMillis: timeout/100,
        connectionTimeoutMillis: timeout/1000,
    });
    // Senza un listener 'error' un errore su una connessione INATTIVA (il pooler
    // che la chiude, un blip di rete) e' un'eccezione non gestita e fa cadere
    // tutto il processo.
    adapter.on("error", (e) => console.error("[pg:adapter] errore su connessione inattiva ->", e?.message || e));
    const pool = new Pool({
        connectionString: poolStringForSessions,
        max: 5,
        idleTimeoutMillis: 10000,
        // meglio un errore rapido (gestito da StoreTollerante) di una coda infinita
        connectionTimeoutMillis: 5000
    });
    pool.on("error", (e) => console.error("[pg:sessioni] errore su connessione inattiva ->", e?.message || e));

    const app = express();
    const sessionsMap = new ClusterMap(database, machineId);
    const httpServer = createServer(app);
    const serverSession = new Session(timeout, env.JWTKEY || await generateId(64, generationMemory), sessionsMap, pool);

    const Stanze = new ClusterStanze(database, machineId);
    // Senza JWTKEY ogni istanza ha un token diverso: un giocatore spostato da
    // un host all'altro (o rimasto in piedi durante un riavvio) si ritrova con
    // INVALID_KEY e viene cacciato. Con piu deploy attivi e' obbligatoria.
    const TEMPORARY_TOKEN = env.JWTKEY || await generateId(64, generationMemory);
    if (!env.JWTKEY) console.warn("ATTENZIONE: JWTKEY non impostata. Con piu istanze o dopo un riavvio i giocatori verranno disconnessi.");

    /*
     * Il portale statico non puo' leggere il localStorage dei domini dei nodi.
     * Gli passiamo per POST un identificatore casuale (mai il JWT); il database
     * cluster lo associa alla partita dopo il primo /saveGameReference.
     */
    const PORTAL_COOKIE = "cucu_portal_id";
    const PORTAL_TTL = 30 * 24 * 60 * 60 * 1000;
    const portalKey = (id) => "portal-session:" + crypto.createHash("sha256").update(id).digest("hex");
    const readCookie = (req, name) => {
        const pair = String(req.headers.cookie || "").split(";").map(part => part.trim())
            .find(part => part.startsWith(name + "="));
        if (!pair) return null;
        try { return decodeURIComponent(pair.slice(name.length + 1)); } catch { return null; }
    };
    const validePortalId = (id) => typeof id === "string" && /^[a-f0-9-]{36}$/i.test(id);
    const redirectPath = (value) => {
        if (typeof value !== "string" || value.length > 2048 || !value.startsWith("/") || value.startsWith("//")) return "/";
        try {
            const parsed = new URL(value, "https://portal.invalid");
            return parsed.origin === "https://portal.invalid" ? parsed.pathname + parsed.search + parsed.hash : "/";
        } catch { return "/"; }
    };
    const cookieHeader = (id) => `${PORTAL_COOKIE}=${encodeURIComponent(id)}; Path=/; Max-Age=${PORTAL_TTL / 1000}; HttpOnly; Secure; SameSite=Lax`;
    const gameExists = async (data) => {
        if (!data?.userId || !data?.stanzaId) return false;
        const stanza = await Stanze.get(data.stanzaId);
        return !!stanza?.trovaGiocatore(data.userId);
    };
    const loadPortalSession = async (portalId) => {
        const stored = await sessionsMap.get(portalKey(portalId));
        if (!stored || Number(stored.data) <= Date.now() || !stored.session) {
            if (stored) await sessionsMap.delete(portalKey(portalId));
            return null;
        }
        if (!(await gameExists(stored.session))) {
            await sessionsMap.delete(portalKey(portalId));
            return null;
        }
        return stored.session;
    };

    // I due parser sono qui per rendere disponibili i body ai soli endpoint
    // cluster aggiunti subito sotto; appConfig aggiunge poi le sue route usuali.
    app.use(express.urlencoded({ extended: false, limit: "16kb" }));
    app.use(express.json({ limit: "16kb" }));
    app.post("/session/portal", async (req, res) => {
        const portalId = req.body?.portalId;
        if (!validePortalId(portalId)) return res.status(400).send("Identificativo portale non valido");

        res.setHeader("Cache-Control", "no-store");
        res.setHeader("Referrer-Policy", "no-referrer");
        res.setHeader("Set-Cookie", cookieHeader(portalId));

        const nextPath = redirectPath(req.body?.next);
        try {
            const saved = await loadPortalSession(portalId);
            if (!saved) return res.redirect(303, nextPath);
            const token = serverSession.set(null, saved);
            return res.redirect(303, "/game?token=" + encodeURIComponent(token));
        } catch (e) {
            console.error("[session:portal] ripristino fallito ->", e?.message || e);
            return res.redirect(303, nextPath);
        }
    });

    // La stanza e il giocatore vengono verificati sul database, poi la
    // corrispondenza anonima viene salvata in modo condiviso fra le istanze.
    app.post("/saveGameReference", async (req, res, next) => {
        try {
            const { userId, stanzaId } = req.body || {};
            if (!userId || !stanzaId || !(await gameExists({ userId, stanzaId })))
                return res.status(406).json({ result: false });

            const data = { userId, stanzaId };
            const token = serverSession.set(req, data);
            const portalId = readCookie(req, PORTAL_COOKIE);
            if (validePortalId(portalId)) {
                await sessionsMap.set(portalKey(portalId), {
                    data: Date.now() + PORTAL_TTL,
                    session: data
                });
            }
            return res.status(200).json({ result: true, fallback: token });
        } catch (e) {
            next(e);
        }
    });
    app.post("/deleteGameReference", async (req, res, next) => {
        try {
            await serverSession.invalidate(req, req.body?.token);
            const portalId = readCookie(req, PORTAL_COOKIE);
            if (validePortalId(portalId)) await sessionsMap.delete(portalKey(portalId));
            return res.status(200).json({ result: true });
        } catch (e) {
            next(e);
        }
    });

    const server = new Server(httpServer, {
        cors: {
            methods: ["GET", "POST"],
            origin: allowedOrigins,
            credentials: true,
        },
        // valori piu tolleranti: con pingTimeout a 10s bastava un buco di rete
        // di pochi secondi su 4G per far dichiarare morto un client vivissimo
        pingInterval: 20000,
        pingTimeout: 30000,
        maxHttpBufferSize: 5e6
    });
    server.adapter(createAdapter(adapter));

    const segnalazioni = new SegnalazioniCluster(database);

    appConfig(app, serverSession, TEMPORARY_TOKEN, Stanze, allowedOrigins, local, timeout, {
        version: env.npm_package_version,
        cluster: true
    }, segnalazioni, env.SEGNALAZIONI_KEY || null);

    serverConfig(server, serverSession, TEMPORARY_TOKEN, Stanze, generationMemory, timeout, segnalazioni);
    cleanUpStanze(Stanze, timeout);
    cleanUpMemory(generationMemory, timeout);

    const listening = httpServer.listen(port, (error) => {
        const listeningPort = httpServer.address().port;
        console.log(`Cucu Ridu (CLUSTER) lanciato => ${local ? local + listeningPort : listeningPort}`);
        if (error) console.log(error.message);
    });

    const terminate = async (server, serverIo, Stanze) => {
        await Stanza.pulisciStanza((id) => {
            server.to(id).emit("stanzaChiusa");
            server.socketsLeave(id);
            console.log("Stanza eliminata => " + id);
        }, generationMemory, Stanze);
        serverIo.close();

        server.close(async () => {
            await Stanze.clear();
            await generationMemory.clear();
            console.error('Chiusura normale');
            process.exit(0);
        });

        setTimeout(async () => {
            await Stanze.clear();
            await generationMemory.clear();
            console.error('Chiusura forzata');
            process.exit(1);
        }, 10000);
    };

    process.on('SIGINT',  async () => await terminate(listening, server, Stanze));
    process.on('SIGTERM', async () => await terminate(listening, server, Stanze));
};

module.exports = clusterApp;
