//Import
const { createServer } = require("node:http");
const path = require("path");
const { Server } = require("socket.io");
const express = require("express");
const { Session } = require(path.join(__dirname, "/include/script/Session"));
const { generateId } = require(path.join(__dirname, "/include/script/generazione"));
const appConfig = require(path.join(__dirname, "/configurations/appConfig"));
const serverConfig = require(path.join(__dirname, "/configurations/serverConfig"));
const { LocalStanze } = require(path.join(__dirname, "/include/script/LocalStanze"));
const { SegnalazioniLocali } = require(path.join(__dirname, "/include/script/Segnalazioni"));

const singleApp = async (local, port, allowedOrigins, env = {}, timeout = 3600000) => {
    const generationMemory = new Set();
    const app = express();
    const httpServer = createServer(app);
    const serverSession = new Session(timeout, env.JWTKEY || await generateId(64, generationMemory));

    const Stanze = new LocalStanze();
    // Con un token casuale a ogni avvio, il primo riavvio del server (Render free
    // si riaddormenta di continuo) rendeva invalido l'handshake di tutti i client
    // gia in partita: INVALID_KEY e fuori tutti. Con JWTKEY il token resta stabile
    // fra riavvii e fra istanze diverse.
    const TEMPORARY_TOKEN = env.JWTKEY || await generateId(64, generationMemory);
    if (!env.JWTKEY) console.warn("ATTENZIONE: JWTKEY non impostata. Dopo un riavvio del server i giocatori in partita verranno disconnessi.");

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

    // in RAM: le segnalazioni si perdono al riavvio, in cluster finiscono su Supabase
    const segnalazioni = new SegnalazioniLocali();

    //App Config
    appConfig(app, serverSession, TEMPORARY_TOKEN, Stanze, allowedOrigins, local, timeout,
        { version: env.npm_package_version }, segnalazioni, env.SEGNALAZIONI_KEY || null);

    //ServerIO Config
    serverConfig(server, serverSession, TEMPORARY_TOKEN, Stanze, generationMemory, timeout, segnalazioni);

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