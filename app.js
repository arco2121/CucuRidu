//Import
const { createServer } = require("node:http");
const path = require("path");
const { Server } = require("socket.io");
const express = require("express");
const session = require('express-session');
const { Stanza, StatoStanza } = require(path.join(__dirname, "include/script/Stanza"));
const { getIcon, generateName, generatePfp, generateId, getAllPfp, getknownPacks } = require(path.join(__dirname, "include/script/generazione"));
const renderPage = (res, page, params = {}) => res.render("header", {
    params: params,
    page: page,
    headerIcon: getIcon(true)
});
const resumeGame = (req, res, next) => {
    const { userId, stanzaId } = req.session.storeData || {};
    if(userId && Stanze.get(stanzaId) && Stanze.get(stanzaId).trovaGiocatore(userId)) return res.redirect("/game");
    next();
};
const emitStatoStanza = (stanzaId, socket, next = () => {}) => {
    if (!Stanze.get(stanzaId)) return next();
    switch (Stanze.get(stanzaId).stato) {
        case StatoStanza.WAIT : {
            socket.emit("confermaStanza", {
                reference: socket.data.referenceGiocatore.adaptToClient(),
                stanza: Stanze.get(stanzaId).id
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
                round: Stanze.get(stanzaId).round,
                reference: socket.data.referenceGiocatore.adaptToClient()
            });
            return next();
        }
        case StatoStanza.CHOOSING_WINNER : {
            socket.emit("sceltaVincitore", {
                risposte: Array.from(Stanze.get(stanzaId).round.risposte.entries()),
                domanda: Stanze.get(stanzaId).round.domanda,
                chiInterroga: Stanze.get(stanzaId).round.chiStaInterrogando,
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
const port = process.env.PORT || 7860;
const Stanze = new Map();
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
app.set('trust proxy', 1);
app.use(express.urlencoded({extended : true}));
app.use(express.json());
app.use(session({
    secret: "CucuRiduSuperSecret123",
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: true,
        sameSite: 'none',
        maxAge: timeout * 60
    }
}));

server.use((socket, next) => {
    const { token, stanzaId, userId } = socket.handshake.auth;
    if(token !== TEMPORARY_TOKEN) return next(new Error("INVALID_KEY"));
    if(!stanzaId) return next();
    const exist = Stanze.get(stanzaId)?.trovaGiocatoreAnchePassato(userId);
    if(exist === null) return next();
    if(!exist) return next(new Error("SESSION_EXPIRED"));
    exist.online = true;
    socket.data.referenceGiocatore = exist;
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
    if(userId && stanzaId && Stanze.has(stanzaId) && Stanze.get(stanzaId).trovaGiocatore(userId)) renderPage(res, "lobby", {
        userId: userId,
        stanzaId: stanzaId,
        token: TEMPORARY_TOKEN,
        knownPacks: getknownPacks(),
        bgm: "GameMusic-Candy_Bazaar"
    });
    else if(nome && pfp) {
        renderPage(res, "lobby", {
            nome: nome,
            pfp: pfp,
            stanzaId: stanzaId,
            token: TEMPORARY_TOKEN,
            action: !stanzaId ? "Crea" : "Partecipa",
            knownPacks: getknownPacks(),
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
    const stato = Boolean(Stanze.has(roomId) && Stanze.get(roomId).stato !== StatoStanza.END);
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
            Stanze.set(stanza.id, stanza);
            user.join(stanza.id);
            user.data.referenceGiocatore = stanza.master;
            user.emit("confermaStanza", {
                stanzaId: stanza.id,
                reference: user.data.referenceGiocatore.adaptToClient()
            });
            server.to(stanza.id).emit("aggiornamentoAttesa", {
                numeroGiocatori: Stanze.get(stanza.id).giocatori.size,
                giocatori: Array.from(Stanze.get(stanza.id).giocatori.values()).map(giocatore => giocatore.adaptToClient())
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
            user.data.referenceGiocatore = Stanze.get(stanzaId).aggiungiGiocatore(data["username"], data["pfp"], generationMemory);
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
                numeroGiocatori: Stanze.get(stanzaId).giocatori.size,
                giocatori: Array.from(Stanze.get(stanzaId).giocatori.values()).map(giocatore => giocatore.adaptToClient())
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
            const result = Stanze.get(stanzaId).iniziaTurno(user.data.referenceGiocatore.id);
            if(typeof result === "object") {
                server.to(stanzaId).emit("partitaTerminata", {
                    classifica: result
                });
                Stanze.delete(stanzaId);
                server.socketsLeave(stanzaId);
            }
            else if(result)
                server.in(stanzaId).fetchSockets().then((sockets) => {
                    const round = Stanze.get(stanzaId).round;
                    for(const socket of sockets) {
                        socket.data.referenceGiocatore = Stanze.get(stanzaId).trovaGiocatore(socket.data.referenceGiocatore.id);
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
           const result = Stanze.get(stanzaId).aggiungiRisposta(user.data.referenceGiocatore.id, ...carte);
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
            const result = Stanze.get(stanzaId).scegliVincitore(user.data.referenceGiocatore.id, vincitore);
            if(result) {
                server.in(stanzaId).fetchSockets().then(sockets => {
                    for(const socket of sockets) {
                        socket.data.referenceGiocatore = Stanze.get(stanzaId).trovaGiocatore(socket.data.referenceGiocatore.id);
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
            const result = Stanze.get(stanzaId).terminaPartita(user.data.referenceGiocatore.id);
            if(result) {
                server.to(stanzaId).emit("partitaTerminata", {
                    classifica: result
                });
                Stanze.delete(stanzaId);
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
        numeroGiocatori: Stanze.get(data["stanzaId"])?.giocatori.size,
        giocatori: Array.from(Stanze.get(data["stanzaId"])?.giocatori.values()).map(giocatore => giocatore.adaptToClient())
    }));
    user.on("lasciaStanza", (data) => {
        try {
            const stanzaId = data["id"];
            Stanze.get(stanzaId).eliminaGiocatore(user.data.referenceGiocatore.id);
            if(Stanze.get(stanzaId).giocatori.size < Stanze.get(stanzaId).minimoGiocatori) {
                server.to(stanzaId).emit("stanzaChiusa");
                Stanze.delete(stanzaId);
                server.socketsLeave(stanzaId);
                console.log("Stanza eliminata => " + stanzaId);
                return;
            }
            user.leave(stanzaId);
            user.emit("stanzaLasciata");
            server.in(stanzaId).fetchSockets().then(sockets => {
                for(const socket of sockets) {
                    socket.data.referenceGiocatore = Stanze.get(stanzaId).giocatori.get(socket.data.referenceGiocatore.id);
                    emitStatoStanza(stanzaId, socket);
                }
            });
            console.log("Giocatore eliminato da Stanza => " + stanzaId);
        } catch (e) {
            user.emit("errore", {
                message: e
            });
        }
    });
    user.on("disconnect", () => {
        const stanzaId = Stanza.trovaDaGiocatore(user.data.referenceGiocatore?.id, Stanze.values());
        const giocatore = Stanze.get(stanzaId)?.trovaGiocatore(user.data.referenceGiocatore?.id);
        if (giocatore && stanzaId) {
            giocatore.online = false;
            setTimeout(() => {
                if (Stanze.get(stanzaId) && !giocatore.isOnline() && Stanze.get(stanzaId).trovaGiocatore(giocatore.id)) {
                    Stanze.get(stanzaId).eliminaGiocatore(giocatore.id);
                    console.log("Giocatore eliminato da Stanza => " + stanzaId);
                    server.in(stanzaId).fetchSockets().then(sockets => {
                        for(const socket of sockets) {
                            socket.data.referenceGiocatore = Stanze.get(stanzaId).giocatori.get(socket.data.referenceGiocatore.id);
                            emitStatoStanza(stanzaId, socket);
                        }
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
    console.log(`Cucu Ridu lanciato sulla porta => ${port}`);
    if (error) {
        console.log(error.message);
    }
});
