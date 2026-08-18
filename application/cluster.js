const { createServer } = require("node:http");
const path = require("path");
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
const { cleanUpStanze } = require(path.join(__dirname, "/configurations/clusterExtensions"));
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
    const pool = new Pool({
        connectionString: poolStringForSessions
    });

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
            await generationMemory.clear()
            await sessionsMap.clear();
            console.error('Chiusura normale');
            process.exit(0);
        });

        setTimeout(async () => {
            await Stanze.clear();
            await generationMemory.clear();
            await sessionsMap.clear();
            console.error('Chiusura forzata');
            process.exit(1);
        }, 10000);
    };

    process.on('SIGINT',  async () => await terminate(listening, server, Stanze));
    process.on('SIGTERM', async () => await terminate(listening, server, Stanze));
};

module.exports = clusterApp;