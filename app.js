//Import
const { createServer } = require("node:http");
const path = require("path");
const { Server } = require("socket.io");
const express = require("express");
const { Session } = require(path.join(__dirname, "include/script/Session"));
const { generateId } = require(path.join(__dirname, "include/script/generazione"));
const { appConfig, serverConfig, terminate } = require(path.join(__dirname, "configurations"));

//Configuration
const timeout = 3600000;
const generationMemory = new Set();

const app = express();
const httpServer = createServer(app);
const serverSession = new Session(generationMemory, timeout);

const host = "http://localhost:";
const local = process.env.NODE_ENV !== "production";
const port = !local ? 7860 : 0

const Stanze = new Map();
const TEMPORARY_TOKEN = generateId(64, generationMemory);

const server = new Server(httpServer, {
    cors: {
        methods: ["GET", "POST"]
    },
    pingInterval: 15000,
    pingTimeout: 10000
});

//App Config
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set('trust proxy', 1);
app.use(express.urlencoded({extended: true}));
app.use(express.json());
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
    console.log(`Cucu Ridu lanciato => ${local ? host + listeningPort : listeningPort}`);
    if (error) console.log(error.message);
});

process.on('SIGINT', () => terminate(listening, server, Stanze));
process.on('SIGTERM', () => terminate(listening, server, Stanze));