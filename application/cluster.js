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

const clusterApp = async (allowedOrigins) => {
    const timeout = 3600000;

    const key = process.env.DATABASE_KEY;
    const url = process.env.DATABASE_URL;
    const password = process.env.DATABASE_PASSWORD;
    const poolString = process.env.DATABASE_POOL?.replace("[PASSWORD]", password || "");
    if(!key || !url || !poolString || !password) throw new Error("Chiavi per il server mancanti");

    const database = createClient(url, key);
    const generationMemory = new ClusterSet(database, await generateId(64));
    const pool = new Pool({
        connectionString: poolString,
        idleTimeoutMillis: timeout/100,
        connectionTimeoutMillis: timeout/1000,
    });

    const app = express();
    const httpServer = createServer(app);
    const serverSession = await new Session(timeout).init(generationMemory);

    const host = "http://localhost:";
    const local = process.env.ON_PLATFORM !== "true";
    const port = !local ? 7860 : 0

    const Stanze = new ClusterStanze(database);
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
            secure: true,
            sameSite: 'none',
            maxAge: timeout
        }
    }));
    appConfig(app, serverSession, TEMPORARY_TOKEN, Stanze);

    serverConfig(server, serverSession, TEMPORARY_TOKEN, Stanze, generationMemory, timeout);

    const listening = httpServer.listen(port, (error) => {
        const listeningPort = httpServer.address().port;
        console.log(`Cucu Ridu (CLUSTER) lanciato => ${local ? host + listeningPort : listeningPort}`);
        if (error) console.log(error.message);
    });

    const terminate = (server, serverIo, Stanze) => {
        for (const id of Stanze.tempKeys()) serverIo.to(id).emit("stanzaChiusa");
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

    process.on('SIGINT',  () => terminate(listening, server, Stanze));
    process.on('SIGTERM', () => terminate(listening, server, Stanze));
};

module.exports = clusterApp;