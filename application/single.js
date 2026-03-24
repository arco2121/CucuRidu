//Import
const { createServer } = require("node:http");
const path = require("path");
const { Server } = require("socket.io");
const express = require("express");
const cors = require("cors");
const { Session } = require(path.join(__dirname, "/include/script/Session"));
const { generateId } = require(path.join(__dirname, "/include/script/generazione"));
const { appConfig, serverConfig } = require(path.join(__dirname, "configurations"));

const singleApp = async (allowedOrigins) => {
    //Configuration
    const timeout = 3600000;
    const generationMemory = new Set();

    const app = express();
    const httpServer = createServer(app);
    const serverSession = await new Session(timeout).init(generationMemory);

    const host = "http://localhost:";
    const local = process.env.ON_PLATFORM !== "true";
    const port = !local ? 7860 : 0

    const Stanze = new Map();
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

    //App Config
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

    //ServerIO Config
    serverConfig(server, serverSession, TEMPORARY_TOKEN, Stanze, generationMemory, timeout);

    //Listening
    const listening = httpServer.listen(port, (error) => {
        const listeningPort = httpServer.address().port;
        console.log(`Cucu Ridu (SINGLE) lanciato => ${local ? host + listeningPort : listeningPort}`);
        if (error) console.log(error.message);
    });

    //Terminate
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

module.exports = singleApp;