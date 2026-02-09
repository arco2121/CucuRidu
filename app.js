//Import
const { createServer } = require("node:http");
const { Server } = require("socket.io");
const express = require("express");
const ejs = require('ejs');
const { Stanza } = require("public/script/Stanza");

//Configuration
const app = express();
const serverConfig = createServer(app);
const port = process.env.PORT || 3000;
const Stanze = {};
const server = new Server(serverConfig, {
    cors: {
        methods: ["GET", "POST"]
    },
    connectionStateRecovery: {},
    pingInterval: 10000,
    pingTimeout: 8000
});
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(express.urlencoded({extended : true}))
app.use(express.json())

//Endpoints
app.get("/", (req, res) => {
    res.render("index");
});
app.get(['/home', '/index'], (req, res) => res.redirect('/'));

server.on("connection", (user) => {
    user.data.referenceUtente = false;
    user.on("creaStanza", (data) => {
        try {
            const stanza = new Stanza("standard", data.username);
            Stanze[stanza.id] = stanza;
            user.join(stanza.id);
            user.data.referenceUtente = stanza.master;
            user.emit("stanzaCreata", {
                reference: user.data.referenceUtente
            });
        } catch {
            user.emit("errore", {
                message: "Impossibile creare la stanza"
            });
        }
    });
    user.on("partecipaStanza", (data) => {
        try {
            const stanzaId = data["id"];
            user.data.referenceUtente = Stanze[stanzaId].aggiungiGiocatore(data.username);
            if(user.data.referenceUtente === false) throw new Error("Impossibile aggiungersi alla stanza");
            user.join(stanzaId);
            user.emit("confermaPartecipazione", {
                reference: user.data.referenceUtente
            });
        } catch (e) {
            user.emit("errore", {
                message: e
            })
        }
    });
    user.on("iniziaTurno", (data) => {
        try {
            const stanzaId = data["id"];
            const result = Stanze[stanzaId].iniziaTurno(user.data.referenceUtente.id);
            if(typeof result === "object") {
                server.to(stanzaId).emit("partitaTerminata", {
                    classifica: result
                });
            }
            else if(result)
                server.in(stanzaId).fetchSockets().then((sockets) => {
                    for(const socket of sockets) {
                        socket.emit("roundIniziato", {
                            chiInterroga: result,
                            reference: user.data.referenceUtente
                        })
                    }
                });
            else throw new Error("Non puoi iniziare un nuovo round");
        } catch (e) {
            user.emit("errore", {
                message: e
            })
        }
    });
    user.on("inviaRisposta", (data) => {
       try {
           const stanzaId = data["id"];
           const carta = data["indexCarta"];
           const result = Stanze[stanzaId].aggiungiRisposta(user.data.referenceUtente.carte[carta])
       } 
    });
});

//Listening
app.use((req, res) => res.status(104).render("error", {
    error: 104,
    message: "Questa pagina non esiste, brutta sottospecie di spermatozoo di elefante con la disfunzione erettile"
}));

app.listen(port, (error) => {
    console.log(`Server started on port ${port}`);
    if (error) {
        console.log(error.message);
    }
});