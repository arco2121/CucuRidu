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
    const { userId, stanzaId } = req.session.storeData || {};
    if(userId && Stanze[stanzaId] && Stanze[stanzaId].trovaGiocatore(userId)) return res.redirect("/game");
    next();
};
const emitStatoStanza = (stanzaId, socket, next = () => {}) => {
    switch (Stanze[stanzaId].stato) {
        case StatoStanza.WAIT : {
            socket.emit("confermaStanza", {
                reference: socket.data.referenceGiocatore.adaptToClient(),
                stanza: Stanze[stanzaId].id
            });
            return next();
        }
        case StatoStanza.END : {
            socket.emit("stanzaChiusa");
            socket.data.referenceGiocatore = null;
            socket.leave(stanzaId);
            return next();
        }
        case StatoStanza.CHOOSING_CARDS : {
            socket.emit("roundIniziato", {
                round: Stanze[stanzaId].round,
                reference: socket.data.referenceGiocatore.adaptToClient()
            });
            return next();
        }
        case StatoStanza.CHOOSING_WINNER : {
            socket.emit("sceltaVincitore", {
                risposte: Stanze[stanzaId].round.risposte.map(risposta => [risposta, Stanze[stanzaId].giocatori.find(giocatori => giocatori.id === risposta.chi).username]),
                domanda: Stanze[stanzaId].round.domanda,
                chiInterroga: Stanze[stanzaId].round.chiStaInterrogando,
                reference: socket.data.referenceGiocatore.adaptToClient()
            });
            return next();
        }
    }
    next();
};

//Configuration
const app = express();
const serverConfig = createServer(app);
const port = process.env.PORT || 3000;
const Stanze = {};
const generationMemory = new Set();
const TEMPORARY_TOKEN = generateId(64, generationMemory);
const timeout = 60000;
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
        maxAge: timeout * 60
    }
}));
server.use((socket, next) => {
    const { token, stanzaId, userId } = socket.handshake.auth;
    if(token !== TEMPORARY_TOKEN) return next(new Error("INVALID_KEY"));
    if(!stanzaId) return next();
    const exist = Stanze[stanzaId].trovaGiocatoreAnchePassato(userId);
    if(exist === null) return next();
    if(exist && !exist[1]) return next(new Error("SESSION_EXPIRED"));
    exist[0].online = true;
    socket.data.referenceGiocatore = exist[0];
    socket.join(stanzaId);
    emitStatoStanza(stanzaId, socket, next);
});

//Endpoints
app.get("/", resumeGame, (req, res) => renderPage(res, "index", {
    icon: getIcon(),
    bgm: "MainMenu-City_Stroll"
}));
app.get(['/home', '/index'], resumeGame, (req, res) => res.redirect('/'));

app.get("/partecipaStanza/:codiceStanza", resumeGame, (req, res) => {
    const stanza = req.params["codiceStanza"];
    if(stanza) renderPage(res, "profile", {
        stanza: stanza,
        setOfPfp: getAllPfp(),
        bgm: "Choosing_Menu-Feeling_Good"
    });
    else res.redirect("/");
});

app.get("/partecipaStanza", resumeGame, (req, res) => {
    const { nome, pfp, stanza } = req.query;
    if(nome && pfp && stanza) {
        req.session.storeData = {
            nome: nome,
            pfp: pfp,
            stanzaId: stanza,
            bgm: "Choosing_Menu-Feeling_Good"
        };
        res.redirect("/game");
    } else if(stanza) renderPage(res, "profile", {
        stanza: stanza,
        setOfPfp: getAllPfp(),
        bgm: "Choosing_Menu-Feeling_Good"
    }); else renderPage(res, "join", {
        bgm: "Choosing_Menu-Feeling_Good"
    });
});

app.get("/creaStanza", resumeGame, (req, res) => {
    const { nome, pfp } = req.query;
    if(nome && pfp) {
        req.session.storeData = {
            ...req.session.storeData,
            nome: nome,
            pfp: pfp,
            bgm: "Choosing_Menu-Feeling_Good"
        };
        res.redirect("/game");
    } else renderPage(res, "profile", {
        setOfPfp: getAllPfp(),
        bgm: "Choosing_Menu-Feeling_Good"
    });
});

app.get("/game", (req, res) => {
    const { nome, pfp, stanzaId, userId } = req.session.storeData || {};
    if(userId && stanzaId && Stanze[stanzaId] && Stanze[stanzaId].trovaGiocatore(userId)) renderPage(res, "lobby", {
        userId: userId,
        stanzaId: stanzaId,
        token: TEMPORARY_TOKEN,
        bgm: "GameMusic-Candy_Bazaar"
    });
    else if(nome && pfp) {
        renderPage(res, "lobby", {
            nome: nome,
            pfp: pfp,
            stanzaId: stanzaId,
            token: TEMPORARY_TOKEN,
            action: !stanzaId ? "Crea" : "Partecipa",
            bgm: "GameMusic-Candy_Bazaar"
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
           stanzaId: stanzaId
       };
       return res.status(200).json({ result: true });
   }
   req.session.destroy();
   res.status(406).json({ result: false });
});

app.post("/deleteGameReference", (req, res) => {
    req.session.destroy();
    res.status(200).json({ result: true });
});

//Socket Endpoints
server.on("connection", (user) => {
    user.on("creaStanza", (data) => {
        try {
            const { username, pfp } = data;
            const stanza = new Stanza(username, pfp, generationMemory);
            Stanze[stanza.id] = stanza;
            user.join(stanza.id);
            user.data.referenceGiocatore = stanza.master;
            user.emit("confermaStanza", {
                stanzaId: stanza.id,
                reference: user.data.referenceGiocatore.adaptToClient()
            });
            server.to(stanza.id).emit("aggiornamentoAttesa", {
                numeroGiocatori: Stanze[stanza.id].giocatori.length,
                giocatori: Stanze[stanza.id]?.giocatori.map(giocatore => giocatore.adaptToClient())
            });
            console.log("Stanza creata => " + stanza.id);
        } catch {
            user.emit("errore", {
                message: "Impossibile creare la stanza, non va niente quel porco di un bastardo maledetto del dio cristo impalato su uno spiedino di sushi marcito come l'utero della madonna troia"
            });
        }
    });
    user.on("partecipaStanza", (data) => {
        try {
            const stanzaId = data["id"];
            user.data.referenceGiocatore = Stanze[stanzaId].aggiungiGiocatore(data["username"], data["pfp"], generationMemory);
            if(user.data.referenceGiocatore === false) {
                user.emit("impossibileAggiungersi", {
                    message: "Impossibile aggiungersi alla stanza, le regole giustamente non ammettono schifi umani"
                });
                return;
            }
            user.join(stanzaId);
            user.emit("confermaStanza", {
                reference: user.data.referenceGiocatore.adaptToClient()
            });
            server.to(stanzaId).emit("aggiornamentoAttesa", {
                numeroGiocatori: Stanze[stanzaId].giocatori.length,
                giocatori: Stanze[stanzaId]?.giocatori.map(giocatore => giocatore.adaptToClient())
            });
            console.log("Giocatore aggiunto a Stanza => " + stanzaId);
        } catch (e) {
            user.emit("errore", {
                message: e
            });
        }
    });
    user.on("iniziaTurno", (data) => {
        try {
            const stanzaId = data["id"];
            const result = Stanze[stanzaId].iniziaTurno(user.data.referenceGiocatore.id);
            if(typeof result === "object") {
                server.to(stanzaId).emit("partitaTerminata", {
                    classifica: result
                });
                delete Stanze[stanzaId];
                server.socketsLeave(stanzaId);
            }
            else if(result)
                server.in(stanzaId).fetchSockets().then((sockets) => {
                    const round = Stanze[stanzaId].round;
                    for(const socket of sockets) {
                        socket.data.referenceGiocatore = Stanze[stanzaId].trovaGiocatore(socket.data.referenceGiocatore.id);
                        socket.emit("roundIniziato", {
                            round: round,
                            reference: socket.data.referenceGiocatore.adaptToClient()
                        });
                    }
                });
            else user.emit("aspettaAltri", {
                    message: "Aspetta altri giocatori" //TODO Messaggio silly per aspettare almeno 3 giocatori
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
           const result = Stanze[stanzaId].aggiungiRisposta(user.data.referenceGiocatore.id, ...carte);
           if(typeof result === "object") {
               server.to(stanzaId).emit("sceltaVincitore", {
                   domanda: result[0],
                   risposte: result[1],
                   chiInterroga: result[2]
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
            const result = Stanze[stanzaId].scegliVincitore(user.data.referenceGiocatore.id, vincitore);
            if(result) {
                server.in(stanzaId).fetchSockets().then(sockets => {
                    for(const socket of sockets) {
                        socket.data.referenceGiocatore = Stanze[stanzaId].trovaGiocatore(socket.data.referenceGiocatore.id);
                        socket.emit("fineTurno", {
                            vincitore: result[0],
                            usernameVincitore: result[1],
                            domanda: result[2],
                            risposte: result[3],
                            reference: socket.data.referenceGiocatore.adaptToClient()
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
            const result = Stanze[stanzaId].terminaPartita(user.data.referenceGiocatore.id);
            if(result) {
                server.to(stanzaId).emit("partitaTerminata", {
                    classifica: result
                });
                delete Stanze[stanzaId];
                server.socketsLeave(stanzaId);
                console.log("Stanza eliminata => " + stanzaId);
            }
        } catch (e) {
            user.emit("errore", {
                message: e
            });
        }
    });
    user.on("aggiornaAttesa", (data) => server.to(data["stanzaId"]).emit("aggiornamentoAttesa", {
        numeroGiocatori: Stanze[data["stanzaId"]]?.giocatori.length,
        giocatori: Stanze[data["stanzaId"]]?.giocatori.map(giocatore => giocatore.adaptToClient())
    }));
    user.on("lasciaStanza", (data) => {
        try {
            const stanzaId = data["id"];
            Stanze[stanzaId].eliminaGiocatore(user.data.referenceGiocatore.id);
            if(Stanze[stanzaId].giocatori.length < Stanze[stanzaId].minimoGiocatori) {
                server.to(stanzaId).emit("stanzaChiusa");
                delete Stanze[stanzaId];
                server.socketsLeave(stanzaId);
                console.log("Stanza eliminata => " + stanzaId);
                return;
            }
            user.leave(stanzaId);
            user.emit("stanzaLasciata");
            server.in(stanzaId).fetchSockets().then(sockets => {
                for(const socket of sockets)
                    emitStatoStanza(stanzaId, socket);
            });
            console.log("Giocatore eliminato da Stanza => " + stanzaId);
        } catch (e) {
            user.emit("errore", {
                message: e
            });
        }
    });
    user.on("disconnect", () => {
        const stanzaId = Stanza.trovaDaGiocatore(user.data.referenceGiocatore?.id, ...Object.values(Stanze));
        const giocatore = Stanze[stanzaId]?.trovaGiocatore(user.data.referenceGiocatore?.id);
        if (giocatore && stanzaId) {
            giocatore.online = false;
            setTimeout(() => {
                if (Stanze[stanzaId] && !giocatore.online && Stanze[stanzaId].trovaGiocatore(giocatore.id)) {
                    Stanze[stanzaId].eliminaGiocatore(giocatore.id);
                    console.log("Giocatore eliminato da Stanza => " + stanzaId);
                    server.in(stanzaId).fetchSockets().then(sockets => {
                        for(const socket of sockets)
                            emitStatoStanza(stanzaId, socket);
                    });
                }
            }, timeout);
        }
    });
});

//Listening
app.use((req, res) => renderPage(res, "error", {
    error: 104,
    icon: getIcon(),
    message: "Questa pagina non esiste, brutta sottospecie di spermatozoo di elefante con la disfunzione erettile",
    bgm: "Error-Tough_Decisions"
}));

serverConfig.listen(port, (error) => {
    console.log(`Server started on port ${port}`);
    if (error) {
        console.log(error.message);
    }
});