//Import
const { createServer } = require("node:http");
const path = require("path");
const { Server } = require("socket.io");
const express = require("express");
const session = require('express-session');
const { Stanza, StatoStanza } = require(path.join(__dirname, "include/script/Stanza"));
const { getIcon, generateName, generatePfp, generateId, getAllPfp } = require(path.join(__dirname, "include/script/generazione"));
const renderPage = (res, page, params = {}) => res.render("header", {
    params: params,
    page: page,
    headerIcon: getIcon(true)
});
const resumeGame = (req, res, next) => {
    const { userId } = req.session.storeData || {};
    if(userId) return res.redirect("/game");
    next();
};

//Configuration
const app = express();
const serverConfig = createServer(app);
const port = process.env.PORT || 3000;
const Stanze = {};
const generationMemory = new Set();
const TEMPORARY_TOKEN = generateId(64, generationMemory);
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
app.use(session({
    secret: generateId(64, generationMemory),
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false,
        maxAge: 3600000
    }
}));
server.use((socket, next) => {
    const { token, stanza, userId } = socket.handshake.auth;
    if(token !== TEMPORARY_TOKEN) return next(new Error("Chiave non valida"));
    if(!stanza || !Stanze[stanza] || Stanze[stanza].stato === StatoStanza.END) return next();
    const exist = Stanze[stanza].giocatori.find(giocatore => giocatore.id === userId);
    if(!exist) return next();
    socket.data.referenceUtente = exist;
    switch (Stanze[stanza].stato) {
        case StatoStanza.WAIT : {
            socket.emit("confermaStanza", {
                reference: socket.data.referenceUtente.adaptToClient(),
                stanza: Stanze[stanza].id
            });
            return next();
        }
        case StatoStanza.CHOOSING_CARDS : {
            socket.emit("roundIniziato", {
                round: Stanze[stanza].round,
                reference: socket.data.referenceUtente.adaptToClient()
            });
            return next();
        }
        case StatoStanza.CHOOSING_WINNER : {
            socket.emit("sceltaVincitore", {
                risposte: Stanze[stanza].round.risposte.map(risposta => [risposta, Stanze[stanza].giocatori.find(giocatori => giocatori.id === risposta.chi).username]),
                domanda: Stanze[stanza].round.domanda,
                chiInterroga: Stanze[stanza].round.chiStaInterrogando,
                reference: socket.data.referenceUtente.adaptToClient()
            });
            return next();
        }
    }
    next();
});

//Endpoints
app.get("/", resumeGame, (req, res) => renderPage(res, "index", {
    icon: getIcon()
}));
app.get(['/home', '/index'], resumeGame, (req, res) => res.redirect('/'));

app.get("/partecipaStanza/:codiceStanza", resumeGame, (req, res) => {
    const stanza = req.params["codiceStanza"];
    if(stanza) renderPage(res, "profile", {
        stanza: stanza
    });
    else res.redirect("/");
});

app.get("/partecipaStanza", resumeGame, (req, res) => {
    const { nome, pfp, stanza } = req.query;
    if(nome && pfp && stanza) {
        req.session.storeData = {
            ...req.session.storeData,
            nome: nome,
            pfp: pfp,
            stanza: stanza
        };
        res.redirect("/game");
    } else if(stanza) renderPage(res, "profile", {
        stanza: stanza,
        setOfPfp: getAllPfp()
    }); else renderPage(res, "join");
});

app.get("/creaStanza", resumeGame, (req, res) => {
    const { nome, pfp, packs } = req.query;
    if(nome && pfp) {
        req.session.storeData = {
            ...req.session.storeData,
            nome: nome,
            pfp: pfp
        };
        res.redirect("/game");
    } else renderPage(res, "profile", {
        setOfPfp: getAllPfp()
    });
});

app.get("/game", (req, res) => {
    const { nome, pfp, stanza, userId } = req.session.storeData || {};
    if(userId && stanza) renderPage(res, "lobby", {
        userId: userId,
        stanzaId: stanza,
        token: TEMPORARY_TOKEN,
    });
    else if(nome && pfp) {
        renderPage(res, "lobby", {
            nome: nome,
            pfp: pfp,
            stanzaId: stanza,
            token: TEMPORARY_TOKEN,
            action: !stanza ? "Crea" : "Partecipa"
        });
    }
    else {
        req.session.destroy();
        res.redirect("/");
    }
})

app.post("/generateInfo", (req, res) => {
    res.status(200).json({ nome: generateName(), pfp: generatePfp() });
});

app.post("/doRoomExists", (req, res) => {
    const { roomId } = req.body;
    const stato = Boolean(Stanze[roomId] && Stanze[roomId].stato !== StatoStanza.END);
    res.status(200).json({ result: stato });
})

app.post("/saveGameReference", (req, res) => {
   const { userId, stanzaId } = req.body || {};
   if(userId && stanzaId) {
       req.session.storeData = {
           userId: userId,
           stanza: stanzaId
       };
       return res.status(200).json({ result: true });
   }
   req.session.destroy();
   res.status(406).json({ result: false });
});

server.on("connection", (user) => {
    user.on("creaStanza", (data) => {
        try {
            const { username } = data;
            const stanza = new Stanza(username, generationMemory);
            Stanze[stanza.id] = stanza;
            user.join(stanza.id);
            user.data.referenceUtente = stanza.master;
            user.emit("confermaStanza", {
                reference: user.data.referenceUtente.adaptToClient(),
                stanzaId: stanza.id
            });
            server.to(stanza.id).emit("aggiornamentoNumeroGiocatori", {
                numeroGiocatori: Stanze[stanza.id].giocatori.length
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
            user.emit("confermaStanza", {
                reference: user.data.referenceUtente.adaptToClient()
            });
            server.to(stanzaId).emit("aggiornamentoNumeroGiocatori", {
                numeroGiocatori: Stanze[stanzaId].giocatori.length
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
                        socket.data.referenceUtente = Stanze[stanzaId].giocatori.find(giocatore => giocatore.id === socket.data.referenceUtente.id);
                        socket.emit("fineTurno", {
                            vincitore: result[0],
                            usernameVincitore: result[1],
                            domanda: result[2],
                            risposte: result[3],
                            reference: socket.data.referenceUtente.adaptToClient()
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
    });
    user.on("aggiornaNumeroGiocatori", (data) => server.to(data["stanzaId"]).emit("aggiornamentoNumeroGiocatori", {
        numeroGiocatori: Stanze[data["stanzaId"]].giocatori.length
    }));
});

//Listening
app.use((req, res) => renderPage(res, "error", {
    error: 104,
    icon: getIcon(),
    message: "Questa pagina non esiste, brutta sottospecie di spermatozoo di elefante con la disfunzione erettile"
}));

serverConfig.listen(port, (error) => {
    console.log(`Server started on port ${port}`);
    if (error) {
        console.log(error.message);
    }
});