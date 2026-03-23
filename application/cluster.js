const { createServer } = require("node:http");
const path = require("path");
const { Server } = require("socket.io");
const express = require("express");
const cors = require("cors");
const { Session } = require(path.join(__dirname, "/include/script/Session"));
const { generateId } = require(path.join(__dirname, "/include/script/generazione"));
const { appConfig, serverConfig } = require(path.join(__dirname, "configurations"));
const { Pool } = require("pg");
const { createAdapter } = require("@socket.io/postgres-adapter");
const { createClient } = require("@supabase/supabase-js");
const { ClusterStanze } = require(path.join(__dirname, "/include/script/ClusterStanze"));
const { ClusterMemory } = require(path.join(__dirname, "/include/script/ClusterMemory"));

const clusterApp = async (allowedOrigins) => {
    const timeout = 3600000;

    const url = 'https://rgghtuapygsrudncfqny.supabase.co';
    const databaseKey = process.env.DATABASE_KEY || '';
    const database = createClient(url, databaseKey);
    const generationMemory = new ClusterMemory(database, 'cluster');

    const poolString = `postgresql://postgres.rgghtuapygsrudncfqny:${process.env.DATABASE_PASSWORD || ''}@aws-1-eu-west-1.pooler.supabase.com:6543/postgres`;
    const pool = new Pool({
        connectionString: poolString,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    });

    const app = express();
    const httpServer = createServer(app);
    const serverSession = await new Session(timeout).init(generationMemory);
    const port = 7860;

    const Stanze = new ClusterStanze(database);
    const TEMPORARY_TOKEN = await generateId(64, generationMemory);

    const server = new Server(httpServer, {
        cors: {
            methods: ["GET", "POST"],
            origin: allowedOrigins,
            credentials: true,
        },
        pingInterval: 15000,
        pingTimeout: 10000
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
        console.log(`Cucu Ridu lanciato => ${local ? host + listeningPort : listeningPort}`);
        if (error) console.log(error.message);
    });

    const terminate = (server, serverIo, Stanze) => {
        for (const id of Stanze.keys()) serverIo.to(id).emit("stanzaChiusa");
        serverIo.close();

        server.close(() => {
            Stanze.clear();
            console.error('Chiusura normale');
            process.exit(0);
        });

        setTimeout(() => {
            console.error('Chiusura forzata');
            process.exit(1);
        }, 10000);
    };

    process.on('SIGINT', () => terminate(listening, server, Stanze));
    process.on('SIGTERM', () => terminate(listening, server, Stanze));
};

module.exports = clusterApp;