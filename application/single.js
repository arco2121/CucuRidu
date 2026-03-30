//Import
const { createServer } = require("node:http");
const path = require("path");
const { Server } = require("socket.io");
const express = require("express");
const { Session } = require(path.join(__dirname, "/include/script/Session"));
const { generateId } = require(path.join(__dirname, "/include/script/generazione"));
const appConfig = require(path.join(__dirname, "/configurations/appConfig"));
const serverConfig = require(path.join(__dirname, "/configurations/serverConfig"));

const singleApp = async (local, port, allowedOrigins, env = {}, timeout = 3600000) => {
    const generationMemory = new Set();
    const app = express();
    const httpServer = createServer(app);
    const serverSession = new Session(timeout, env.JWTKEY || await generateId(64, generationMemory));

    const Stanze = new Map();
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
            skipMiddlewares: true,
        }
    });

    //App Config
    appConfig(app, serverSession, TEMPORARY_TOKEN, Stanze, allowedOrigins, local, timeout);

    //ServerIO Config
    serverConfig(server, serverSession, TEMPORARY_TOKEN, Stanze, generationMemory, timeout);

    //Listening
    const listening = httpServer.listen(port, (error) => {
        const listeningPort = httpServer.address().port;
        console.log(`Cucu Ridu (SINGLE) lanciato => ${local ? local + listeningPort : listeningPort}`);
        if (error) console.log(error.message);
    });

    //Terminate
    const terminate = (server, serverIo, Stanze) => {
        for (const id of Stanze.keys()) serverIo.to(id).emit("stanzaChiusa");
        serverIo.close();

        server.close(() => {
            Stanze.clear();
            generationMemory.clear();
            console.error('Chiusura normale');
            process.exit(0);
        });

        setTimeout(() => {
            Stanze.clear();
            generationMemory.clear();
            console.error('Chiusura forzata');
            process.exit(1);
        }, 10000);
    };

    process.on('SIGINT', () => terminate(listening, server, Stanze));
    process.on('SIGTERM', () => terminate(listening, server, Stanze));
};

module.exports = singleApp;