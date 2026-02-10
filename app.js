//Import
const { createServer } = require("node:http");
const { Server } = require("socket.io");
const express = require("express");
const { Stanza, StatoStanza } = require("include/script/Stanza");

//Configuration
const app = express();
const serverConfig = createServer(app);
const port = process.env.PORT || 3000;
const Stanze = {};
const generationMemory = new Set();
const server = new Server(serverConfig, {
    cors: {
        methods: ["GET", "POST"]
    },
    pingInterval: 10000,
    pingTimeout: 8000
});
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(express.urlencoded({extended : true}));
app.use(express.json());
server.use((socket, next) => {
    const { token, stanza, userId } = socket.handshake.auth.token;
    if(token !== process.env.APP_KEY) return next(new Error("Chiave non valida"));
    if(!Stanze[stanza] || Stanze[stanza].stato === StatoStanza.END) return next();
    const exist = Stanze[stanza].giocatori.find(giocatore => giocatore.id === userId).length;
    if(!exist) return next();
    socket.data.referenceUtente = exist;
    switch (Stanze[stanza].stato) {
        case StatoStanza.WAIT : {
            socket.emit("confermaPartecipazione", {
                reference: socket.data.referenceUtente
            });
            return next();
        }
        case StatoStanza.CHOOSING_CARDS : {
            socket.emit("roundIniziato", {
                round: Stanze[stanza].round,
                reference: socket.data.referenceUtente
            });
            return next();
        }
        case StatoStanza.CHOOSING_WINNER : {
            socket.emit("sceltaVincitore", {
                risposte: Stanze[stanza].round.risposte.map(risposta => [risposta, Stanze[stanza].giocatori.find(giocatori => giocatori.id === risposta.chi).username]),
                domanda: Stanze[stanza].round.domanda,
                chiInterroga: Stanze[stanza].round.chiStaInterrogando,
                reference: socket.data.referenceUtente
            });
            return next();
        }
    }
});

//Endpoints
app.get("/", (req, res) => {
    res.render("index", {
        token: process.env.APP_KEY
    });
});
app.get(['/home', '/index'], (req, res) => res.redirect('/'));

server.on("connection", (user) => {
    user.on("creaStanza", (data) => {
        try {
            const { username, packs } = data;
            const stanza = new Stanza(packs, username, generationMemory);
            Stanze[stanza.id] = stanza;
            user.join(stanza.id);
            user.data.referenceUtente = stanza.master;
            user.emit("stanzaCreata", {
                reference: user.data.referenceUtente
            });
        } catch {
            user.emit("errore", {
                message: "Impossibile creare la stanza, non va niente quel porco di un bastardo maledetto del dio cristo impalato su uno spiedino di sushi marcito come l'utero della madonna troia"
            });
        }
    });
    user.on("partecipaStanza", (data) => {
        try {
            const stanzaId = data["id"];
            user.data.referenceUtente = Stanze[stanzaId].aggiungiGiocatore(data["username"], generationMemory);
            if(user.data.referenceUtente === false) {
                user.emit("impossibileAggiungersi", {
                    message: "Impossibile aggiungersi alla stanza, le regole giustamente non ammettono schifi umani"
                });
                return;
            }
            user.join(stanzaId);
            user.emit("confermaPartecipazione", {
                reference: user.data.referenceUtente
            });
        } catch (e) {
            user.emit("errore", {
                message: e
            });
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
                delete Stanze[stanzaId];
                server.socketsLeave(stanzaId);
            }
            else if(result)
                server.in(stanzaId).fetchSockets().then((sockets) => {
                    for(const socket of sockets)
                        socket.emit("roundIniziato", {
                            round: result
                        });
                });
        } catch (e) {
            user.emit("errore", {
                message: e
            });
        }
    });
    user.on("inviaRisposta", (data) => {
       try {
           const stanzaId = data["id"];
           const carte = data["indexCarta"];
           const result = Stanze[stanzaId].aggiungiRisposta(user.data.referenceUtente.id, ...carte);
           if(typeof result === "object") {
               server.in(stanzaId).fetchSockets().then(sockets => {
                   for(const socket of sockets)
                       socket.emit("sceltaVincitore", {
                           domanda: result[0],
                           risposte: result[1],
                           chiInterroga: result[2]
                       });
               });
           } else if(result) {
               user.emit("rispostaRegistrata", {
                  message: "Risposta registrata, contento?"
               });
           }
           else {
               user.emit("giaRegistrata", {
                   message: "Non puoi rispondere 2 volte dio coltivatore di carote in un campo di reclusione ucraino"
               });
           }
       } catch (e) {
           user.emit("errore", {
               message: e
           })
       }
    });
    user.on("scegliVincitore", (data) => {
        try {
            const stanzaId = data["id"];
            const vincitore = data["rispostaIndex"];
            const result = Stanze[stanzaId].scegliVincitore(user.data.referenceUtente.id, vincitore);
            if(result) {
                server.in(stanzaId).fetchSockets().then(sockets => {
                    for(const socket of sockets) {
                        socket.data.referenceUtente = Stanza[stanzaId].giocatori.find(giocatore => giocatore.id === socket.data.referenceUtente.id);
                        socket.emit("fineTurno", {
                            vincitore: result[0],
                            usernameVincitore: result[1],
                            domanda: result[2],
                            risposte: result[3],
                            reference: socket.data.referenceUtente
                        });
                    }
                });
            } else {
                user.emit("errore", {
                    message: "Aspetta e spera che tutti quanti rispondano (tanto ti ghostano perchè gli stai sul cazzo)"
                });
            }
        } catch (e) {
            user.emit("errore", {
                message: e
            });
        }
    });
    user.on("terminaPartita", (data) => {
        try {
            const stanzaId = data["id"];
            const result = Stanze[stanzaId].terminaPartita();
            if(result) {
                server.in(stanzaId).fetchSockets().then(sockets => {
                    for (const socket of sockets)
                        socket.emit("partitaTerminata", {
                            classifica: result
                        });
                });
                delete Stanze[stanzaId];
                server.socketsLeave(stanzaId);
            }
        } catch (e) {
            user.emit("errore", {
                message: e
            });
        }
    })
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