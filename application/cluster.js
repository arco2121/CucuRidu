const { createServer } = require("node:http");
const path = require("path");
const { Server } = require("socket.io");
const express = require("express");
const cors = require("cors");
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

const clusterApp = async (local, port, allowedOrigins, env = {}, timeout = 3600000) => {
    const key = env.DATABASE_KEY;
    const url = env.DATABASE_URL;
    const password = env.DATABASE_PASSWORD;
    const poolString = env.DATABASE_POOL?.replace("[PASSWORD]", password || "");
    if(!key || !url || !poolString || !password) throw new Error("Chiavi per il server mancanti");

    const database = createClient(url, key);
    const generationMemory = new ClusterSet(database, await generateId(64));
    const pool = new Pool({
        connectionString: poolString,
        idleTimeoutMillis: timeout/100,
        connectionTimeoutMillis: timeout/1000,
    });
    const machineId = await generateId(64);

    const app = express();
    const sessionsMap = new ClusterMap(database, machineId);
    const httpServer = createServer(app);
    const serverSession = await new Session(timeout, sessionsMap).init(generationMemory);

    const Stanze = new ClusterStanze(database, machineId);
    const TEMPORARY_TOKEN = await generateId(64, generationMemory);

    const server = new Server(httpServer, {
        cors: {
            methods: ["GET", "POST"],
            origin: allowedOrigins,
            credentials: true,
        },
        pingInterval: 15000,
        pingTimeout: 10000,
        connectionStateRecovery: {
            maxDisconnectionDuration: timeout/120,
            skipMiddlewares: false,
        }
    });
    server.adapter(createAdapter(pool));

    app.use(express.static(path.join(__dirname, "../public"), {
        setHeaders: (res, path) => {
            if (path.endsWith('serviceWorker.js')) {
                res.setHeader('Cache-Control', 'no-cache');
            }
        }
    }));
    app.set("view engine", "ejs");
    app.set('trust proxy', 1);
    app.use(express.urlencoded({extended: true}));
    app.use(express.json());
    if(!local)
        app.use(cors({
            origin: (origin, callback) => {
                if (!origin || allowedOrigins.indexOf(origin) !== -1) {
                    callback(null, true);
                } else {
                    callback(new Error('Non consentito dalla policy CORS'));
                }
            },
            credentials: true
        }));
    app.use(serverSession.setupSession({
        resave: false,
        saveUninitialized: true,
        cookie: {
            secure: !local,
            sameSite: !local ? 'none' : null,
            maxAge: timeout
        }
    }));
    appConfig(app, serverSession, TEMPORARY_TOKEN, Stanze);

    serverConfig(server, serverSession, TEMPORARY_TOKEN, Stanze, generationMemory, timeout);

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