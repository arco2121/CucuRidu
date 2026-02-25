//Import
const { createServer } = require("node:http");
const path = require("path");
const { Server } = require("socket.io");
const express = require("express");
const { Stanza, StatoStanza } = require(path.join(__dirname, "include/script/Stanza"));
const { Session } = require(path.join(__dirname, "include/script/Session"));
const { getIcon, generateName, generatePfp, generateId, getAllPfp, getknownPacks } = require(path.join(__dirname, "include/script/generazione"));

const renderPage = (res, page, params = {}) => res.render("header", {
    params: params,
    page: page,
    headerIcon: getIcon(true),
    knownOrigin: process.env.HOSTING || null
});
const resumeGame = (req, res, next) => {
    const { userId, stanzaId } = serverSession.get(req, req.query?.token);
    const redirecting = req.query?.token ? "?token=" + req.query.token : "";
    if(userId && Stanze.get(stanzaId) && Stanze.get(stanzaId).trovaGiocatore(userId)) return res.redirect("/game" + redirecting);
    next();
};
const emitStatoStanza = (stanzaId, socket, next = () => {}) => {
    if (!Stanze.get(stanzaId)) return next();
    console.log(`Stanza ${stanzaId} => ${Stanze.get(stanzaId).toString()}`)
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
const host = "http://localhost:";
const local = process.env.NODE_ENV !== "production";
const Stanze = new Map();
const generationMemory = new Set();
const TEMPORARY_TOKEN = generateId(64, generationMemory);
const timeout = 3600000;
const serverSession = new Session(generationMemory, timeout);
const server = new Server(serverConfig, {
    cors: {
        methods: ["GET", "POST"]
    },
    pingInterval: 25000,
    pingTimeout: 20000
});

app.use(express.static("public"));
app.set("view engine", "ejs");
app.set('trust proxy', 1);
app.use(express.urlencoded({extended : true}));
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

server.use((socket, next) => {
    const checks = ["validation", "stanzaId", "userId"];
    const { validation, stanzaId, userId } = serverSession.validate(checks, socket.handshake.auth, socket.handshake.auth?.token)
    if(validation !== TEMPORARY_TOKEN) return next(new Error("INVALID_KEY"));
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
        const token = serverSession.set(req, {
            nome: nome,
            pfp: pfp,
            stanzaId: stanza,
            bgm: "Choosing_Menu-Feeling_Good"
        });
        res.redirect("/game?token=" + token);
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
        const token = serverSession.set(req, {
            nome: nome,
            pfp: pfp,
            bgm: "Choosing_Menu-Feeling_Good"
        });
        res.redirect("/game?token=" + token);
    } else renderPage(res, "profile", {
        setOfPfp: getAllPfp(),
        bgm: "Choosing_Menu-Feeling_Good"
    });
});

app.get("/game", (req, res) => {
    const check = ["nome", "pfp", "stanzaId", "userId"];
    const { nome, pfp, stanzaId, userId } = serverSession.validate(check, req.session.storeData, req.query?.token);
    if(userId && stanzaId && Stanze.has(stanzaId) && Stanze.get(stanzaId).trovaGiocatore(userId))
        renderPage(res, "lobby", {
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
        serverSession.invalidate(req, req.query?.token);
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
        const token = serverSession.set(req, {
            userId: userId,
            stanzaId: stanzaId,
        });
        return res.status(200).json({
            result: true,
            fallback: token
        });
    }
    serverSession.invalidate(req);
    res.status(406).json({ result: false });
});

app.post("/deleteGameReference", (req, res) => {
    serverSession.invalidate(req, req.body?.token);
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
                for(const id of Stanze.get(stanzaId).giocatoriPassati.values()) generationMemory.delete(id);
                Stanze.delete(stanzaId);
                generationMemory.delete(stanzaId);
                server.socketsLeave(stanzaId);
                console.log("Stanza " + stanzaId + " chiusa");
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
                    message: "Girl non ci sono chatbot ai che fingano di scoparti qui. Go touch some grass or smt"
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
                for(const id of Stanze.get(stanzaId).giocatoriPassati.values()) generationMemory.delete(id);
                Stanze.delete(stanzaId);
                generationMemory.delete(stanzaId);
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
            const giocatoreId = data["giocatore"] || user.data.referenceGiocatore.id;
            const result = Stanze.get(stanzaId).eliminaGiocatore(giocatoreId);
            if(result) {
                let deleted = false;
                Stanza.pulisciStanza((id) => {
                    server.to(id).emit("stanzaChiusa");
                    server.socketsLeave(id);
                    console.log("Stanza eliminata => " + id);
                    deleted = true;
                }, generationMemory, Stanze, stanzaId);
                if(deleted) return;
                server.in(stanzaId).fetchSockets().then(sockets => {
                    const persona = sockets.filter(socket =>
                        socket.data?.referenceGiocatore.id === giocatoreId).at(0);
                    if(persona) {
                        persona.emit("stanzaLasciata");
                        persona.leave(stanzaId);
                    }
                });
                server.in(stanzaId).fetchSockets().then(sockets => {
                    for(const socket of sockets) {
                        socket.data.referenceGiocatore = Stanze.get(stanzaId).giocatori.get(socket.data.referenceGiocatore.id);
                        emitStatoStanza(stanzaId, socket);
                    }
                });
                console.log("Giocatore eliminato da Stanza => " + stanzaId);
            }
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
            }, timeout/2/60);
        }
    });
});

setInterval(async () => {
    try {
        Stanza.pulisciStanza((id) => {
            server.to(id).emit("stanzaChiusa");
            server.socketsLeave(id);
            console.log("Stanza eliminata => " + id);
        }, generationMemory, Stanze);
    } catch(err) {
        console.error(err);
    }
}, timeout/30/60);

//Listening
app.use((req, res) => renderPage(res, "error", {
    error: 104,
    icon: getIcon(),
    message: "Questa pagina non esiste, brutta sottospecie di spermatozoo di elefante con la disfunzione erettile",
    bgm: "Error-Tough_Decisions"
}));

serverConfig.listen(port, (error) => {
    console.log(`Cucu Ridu lanciato => ${local ? host + port : port}`);
    if (error) {
        console.log(error.message);
    }
});