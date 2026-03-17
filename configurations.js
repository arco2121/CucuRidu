const path = require("path");
const { getIcon, generateName, generatePfp, getAllPfp, getknownPacks } = require(path.join(__dirname, "include/script/generazione"));
const { Stanza, StatoStanza } = require(path.join(__dirname, "include/script/Stanza"));

/* --- CONFIGURAZIONE ROTTE HTTP (EXPRESS) --- */

// Helper: renderizza la pagina iniettando icone, parametri e musica di sottofondo (bgm)
// resumeGame: Middleware che riconnette l'utente se ha già una sessione attiva

// GET / : Home page (Index)
// GET /partecipaStanza/:codiceStanza : Accesso diretto tramite link (manda al profilo)
// GET /partecipaStanza : Gestisce l'ingresso in una stanza (mostra form o salva dati sessione)
// GET /creaStanza : Inizia la procedura per creare una nuova stanza
// GET /game : La rotta principale di gioco. Valida i dati e carica la Lobby o il tavolo di gioco

/* --- ENDPOINT PER CHIAMATE AJAX (POST) --- */

// POST /generateInfo : Ritorna un oggetto {nome, pfp} randomici per il frontend
// POST /doRoomExists : Verifica se un ID stanza esiste ed è ancora attiva (non finita)
// POST /saveGameReference : Salva l'ID utente e stanza nel server per gestire i refresh di pagina
// POST /deleteGameReference : Cancella la sessione di gioco (logout)
/**
 * Configura gli endpoint dell' app Express
 * @param app
 * @param serverSession
 * @param TEMPORARY_TOKEN
 * @param Stanze
 */
const appConfig = (app, serverSession, TEMPORARY_TOKEN, Stanze) => {

    const renderPage = (res, page, params = {}) => res.render("header", {
        params: params,
        page: page,
        headerIcon: getIcon(true),
        knownOrigin: process.env.HOSTING || null
    });

    const resumeGame = async (req, res, next) => {
        const { userId, stanzaId } = serverSession.get(req, req.query?.token);
        const redirecting = req.query?.token ? "?token=" + req.query.token : "";
        if(userId && await Stanze.get(stanzaId) && await Stanze.get(stanzaId).trovaGiocatore(userId)) return res.redirect("/game" + redirecting);
        req.deleteToken = !!req.query?.token;
        next();
    };

    app.get("/ping", resumeGame, (req, res) => res.status(200));

    app.get("/", resumeGame, (req, res) => renderPage(res, "index", {
        icon: getIcon(),
        deleteToken: req.deleteToken,
        bgm: "MainMenu-City_Stroll"
    }));
    app.get(['/home', '/index'], (req, res) => res.redirect('/'));

    app.get("/partecipaStanza/:codiceStanza", resumeGame, (req, res) => {
        const stanza = req.params["codiceStanza"];
        if (stanza) renderPage(res, "profile", {
            stanza: stanza,
            setOfPfp: getAllPfp(),
            deleteToken: req.deleteToken,
            bgm: "Choosing_Menu-Feeling_Good"
        });
        else res.redirect("/");
    });

    app.get("/partecipaStanza", resumeGame, (req, res) => {
        const {nome, pfp, stanza} = req.query;
        if (nome && pfp && stanza) {
            const token = serverSession.set(req, {
                nome: nome,
                pfp: pfp,
                stanzaId: stanza,
                deleteToken: req.deleteToken,
                bgm: "Choosing_Menu-Feeling_Good"
            });
            res.redirect("/game?token=" + token);
        } else if (stanza) renderPage(res, "profile", {
            stanza: stanza,
            setOfPfp: getAllPfp(),
            deleteToken: req.deleteToken,
            bgm: "Choosing_Menu-Feeling_Good"
        }); else renderPage(res, "join", {
            bgm: "Choosing_Menu-Feeling_Good",
            deleteToken: req.deleteToken
        });
    });

    app.get("/creaStanza", resumeGame, (req, res) => {
        const {nome, pfp} = req.query;
        if (nome && pfp) {
            const token = serverSession.set(req, {
                nome: nome,
                pfp: pfp,
                bgm: "Choosing_Menu-Feeling_Good"
            });
            res.redirect("/game?token=" + token);
        } else renderPage(res, "profile", {
            setOfPfp: getAllPfp(),
            deleteToken: req.deleteToken,
            bgm: "Choosing_Menu-Feeling_Good"
        });
    });

    app.get("/game", async (req, res) => {
        const check = ["nome", "pfp", "stanzaId", "userId"];
        const {nome, pfp, stanzaId, userId} = serverSession.validate(check, req.session.storeData, req.query?.token);
        if (userId && stanzaId && await Stanze.has(stanzaId) && await Stanze.get(stanzaId).trovaGiocatore(userId))
            renderPage(res, "lobby", {
                userId: userId,
                stanzaId: stanzaId,
                token: TEMPORARY_TOKEN,
                knownPacks: getknownPacks(),
                bgm: "GameMusic-Candy_Bazaar"
            });
        else if (nome && pfp) {
            renderPage(res, "lobby", {
                nome: nome,
                pfp: pfp,
                stanzaId: stanzaId,
                token: TEMPORARY_TOKEN,
                action: !stanzaId ? "Crea" : "Partecipa",
                knownPacks: getknownPacks(),
                bgm: "GameMusic-Candy_Bazaar"
            });
        } else {
            serverSession.invalidate(req, req.query?.token);
            res.redirect("/");
        }
    })

    app.get("/error", (req, res) => {
        let status = 104;
        let message = "Questa pagina non esiste, brutta sottospecie di spermatozoo di elefante con la disfunzione erettile";
        if (req.query["alreadyConnected"]) {
            status = 420;
            message = "Allora signora, si scanti fora e torni alla pagina del gioco";
        }
        renderPage(res, "error", {
            error: status,
            icon: getIcon(),
            message: message,
            loadToken: false,
            bgm: "Error-Tough_Decisions"
        });
    })

    app.post("/generateInfo", (req, res) => {
        res.status(200).json({nome: generateName(), pfp: generatePfp()});
    });

    app.post("/doRoomExists", async (req, res) => {
        const {roomId} = req.body;
        const stato = Boolean(await Stanze.has(roomId) && await Stanze.get(roomId).stato !== StatoStanza.END);
        res.status(200).json({result: stato});
    })

    app.post("/saveGameReference", (req, res) => {
        const {userId, stanzaId} = req.body || {};
        if (userId && stanzaId) {
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
        res.status(406).json({result: false});
    });

    app.post("/deleteGameReference", (req, res) => {
        serverSession.invalidate(req, req.body?.token);
        res.status(200).json({result: true});
    });

    app.use((req, res) => res.redirect("/error"));
};

/* --- CONFIGURAZIONE LOGICA REAL-TIME (SOCKET.IO) --- */

// emitStatoStanza: Sincronizza il frontend con lo stato del gioco (WAIT, CHOOSING_CARDS, CHOOSING_WINNER, END)
// socket.use: Middleware di autenticazione. Verifica il token e gestisce la riconnessione automatica

/* --- GESTIONE EVENTI IN ENTRATA (CLIENT -> SERVER) --- */

// creaStanza: Crea una stanza, assegna il ruolo di Master e notifica la lobby
// partecipaStanza: Aggiunge un nuovo giocatore alla stanza esistente (se c'è posto)
// iniziaTurno: (Solo Interrogante) Avvia il round, distribuisce la domanda o chiude la partita se finita
// inviaRisposta: Riceve gli indici delle carte scelte dal giocatore
// scegliVincitore: (Solo Interrogante) Riceve l'ID del giocatore che ha vinto il round
// terminaPartita: (Solo Master) Forza la chiusura della stanza per tutti
// aggiornaAttesa / listaGiocatori: Richieste manuali per aggiornare la lista partecipanti nella UI
// lasciaStanza: Gestisce l'uscita volontaria o l'espulsione di un utente
// disconnect: Gestisce la caduta di connessione (aspetta un breve periodo prima di eliminare il player)

/* --- EVENTI IN USCITA (SERVER -> CLIENT) --- */

// confermaStanza: Inviato dopo l'unione corretta, contiene i dati del giocatore (pfp, nome, id)
// aggiornamentoAttesa: Notifica cambiamenti nel numero di giocatori in lobby
// roundIniziato: Invia la domanda del round a tutti i partecipanti
// sceltaVincitore: Invia le risposte anonime all'interrogante per la valutazione
// fineTurno: Comunica a tutti chi ha vinto il round e mostra il riepilogo
// partitaTerminata: Invia la classifica finale a tutti i partecipanti
// stanzaChiusa: Notifica che la stanza non è più disponibile
/**
 * Configura gli endpoint del ServerIO
 * @param server
 * @param serverSession
 * @param TEMPORARY_TOKEN
 * @param Stanze
 * @param generationMemory
 * @param timeout
 */
const serverConfig = (server, serverSession, TEMPORARY_TOKEN, Stanze, generationMemory, timeout = 3600000) => {

    const emitStatoStanza = async (stanzaId, socket, next = () => {}) => {
        const Stanza = await Stanze.get(stanzaId);
        if (!Stanza) return next();
        //console.log(`Stanza ${stanzaId} => ${Stanza.toString()}`)
        if(!socket.data.referenceGiocatore) return next();

        switch (Stanza.stato) {
            case StatoStanza.WAIT : {
                socket.emit("confermaStanza", {
                    reference: socket.data.referenceGiocatore.adaptToClient(),
                    stanzaId: Stanza.id,
                    primoRound: Stanza.numeroRound[0] === 0,
                    interroghi: Stanza.round.chiStaInterrogando === socket.data.referenceGiocatore.id
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
                if(Stanza.round.risposte.has(socket.data.referenceGiocatore.id))
                    socket.emit("rispostaRegistrata");
                else
                    socket.emit("roundIniziato", {
                        chiStaInterrogando: Stanza.trovaGiocatore(Stanza.round.chiStaInterrogando).adaptToClient(),
                        domanda: Stanza.round.domanda,
                        reference: socket.data.referenceGiocatore.adaptToClient(),
                        stanza: Stanza.id
                    });
                return next();
            }
            case StatoStanza.CHOOSING_WINNER : {
                socket.emit("sceltaVincitore", {
                    risposte: Array.from(Stanza.round.risposte.entries()),
                    domanda: Stanza.round.domanda,
                    chiInterroga: Stanza.trovaGiocatore(Stanza.round.chiStaInterrogando).adaptToClient(),
                    reference: socket.data.referenceGiocatore.adaptToClient(),
                    stanza: Stanza.id
                });
                return next();
            }
        }
        next();
    };

    server.use(async (socket, next) => {
        const checks = ["validation", "stanzaId", "userId"];
        const {
            validation,
            stanzaId,
            userId
        } = serverSession.validate(checks, socket.handshake.auth, socket.handshake.auth?.token)
        if (validation !== TEMPORARY_TOKEN) return next(new Error("INVALID_KEY"));
        if (!stanzaId) return next();
        const exist = await Stanze.get(stanzaId)?.trovaGiocatoreAnchePassato(userId);
        if (exist === null) return next();
        if (!exist) return next(new Error("SESSION_EXPIRED"));
        if (exist.online === true) return next(new Error("ALREADY_CONNECTED"));
        exist.online = true;
        socket.data.referenceGiocatore = exist;
        socket.join(stanzaId);
        await emitStatoStanza(stanzaId, socket, next);
    });

    server.on("connection", async (user) => {
        user.on("creaStanza", async (data) => {
            try {
                const { username, pfp } = data;
                const stanza = new Stanza(username, pfp, generationMemory);
                await Stanze.set(stanza.id, stanza);
                user.join(stanza.id);
                user.data.referenceGiocatore = stanza.master;
                user.emit("confermaStanza", {
                    stanzaId: stanza.id,
                    reference: user.data.referenceGiocatore.adaptToClient(),
                    primoRound: stanza.numeroRound[0] === 0,
                    interroghi: stanza.round.chiStaInterrogando === user.data.referenceGiocatore.id
                });
                server.to(stanza.id).emit("aggiornamentoAttesa", {
                    numeroGiocatori: stanza.giocatori.size,
                    minimoGiocatori: stanza.minimoGiocatori,
                    giocatori: stanza.classifica().map(giocatore => giocatore.adaptToClient())
                });
                server.to(stanza.id).emit("listaGiocatoriAggiornamento", {
                    giocatori: stanza.classifica().map(giocatore => giocatore.adaptToClient())
                });
                console.log("Stanza creata => " + stanza.id);
            } catch {
                user.emit("errore", {
                    message: "Impossibile creare la stanza, non va niente quel porco di un bastardo maledetto del dio cristo impalato su uno spiedino di sushi marcito come l'utero della madonna troia"
                });
            }
        });

        user.on("partecipaStanza", async (data) => {
            try {
                const stanzaId = data["id"];
                const Stanza = await Stanze.get(stanzaId);
                user.data.referenceGiocatore = Stanza.aggiungiGiocatore(data["username"], data["pfp"], generationMemory);
                if(user.data.referenceGiocatore === false) {
                    user.emit("impossibileAggiungersi", {
                        message: "Impossibile aggiungersi alla stanza, le regole giustamente non ammettono schifi umani"
                    });
                    return;
                }
                user.join(stanzaId);
                user.emit("confermaStanza", {
                    reference: user.data.referenceGiocatore.adaptToClient(),
                    interroghi: Stanza.round.chiStaInterrogando === user.data.referenceGiocatore.id,
                    primoRound: Stanza.numeroRound[0] === 0
                });
                server.to(stanzaId).emit("aggiornamentoAttesa", {
                    numeroGiocatori: Stanza.giocatori.size,
                    minimoGiocatori: Stanza.minimoGiocatori,
                    giocatori: Stanza.classifica().map(giocatore => giocatore.adaptToClient())
                });
                server.to(stanzaId).emit("listaGiocatoriAggiornamento", {
                    giocatori: Stanza.classifica().map(giocatore => giocatore.adaptToClient())
                });
                console.log("Giocatore aggiunto a Stanza => " + stanzaId);
            } catch (e) {
                console.log(e)
            }
        });

        user.on("iniziaTurno", async (data) => {
            try {
                const stanzaId = data["id"];
                const Stanza = await Stanze.get(stanzaId);
                const result = Stanza.iniziaTurno(user.data.referenceGiocatore.id);
                if(typeof result === "object") {
                    server.to(stanzaId).emit("partitaTerminata", {
                        classifica: result
                    });
                    for(const id of Stanza.giocatoriPassati.values()) generationMemory.delete(id);
                    await Stanze.delete(stanzaId);
                    generationMemory.delete(stanzaId);
                    server.socketsLeave(stanzaId);
                    console.log("Stanza " + stanzaId + " chiusa");
                }
                else if(result)
                    server.in(stanzaId).fetchSockets().then(sockets => {
                        const round = Stanza.round;
                        for(const socket of sockets) {
                            socket.data.referenceGiocatore = Stanza.trovaGiocatore(socket.data.referenceGiocatore.id);
                            socket.emit("roundIniziato", {
                                chiStaInterrogando: Stanza.trovaGiocatore(round.chiStaInterrogando).adaptToClient(),
                                domanda: round.domanda,
                                reference: socket.data.referenceGiocatore.adaptToClient()
                            });
                        }
                    });
                else
                    user.emit("aspettaAltri", {
                        message: "Girl non ci sono chatbot ai che fingano di scoparti qui. Go touch some grass or smt"
                    });
            } catch (e) {
                console.log(e)
            }
        });

        user.on("inviaRisposta", async (data) => {
            try {
                const stanzaId = data["id"];
                const carte = data["indexCarte"];
                const Stanza =  await Stanze.get(stanzaId);
                const result = Stanza.aggiungiRisposta(user.data.referenceGiocatore.id, ...carte);
                if(typeof result === "object") {
                    server.to(stanzaId).emit("sceltaVincitore", {
                        domanda: result[0],
                        risposte: result[1],
                        chiInterroga: Stanza.trovaGiocatore(result[2]).adaptToClient(),
                    });
                } else if(result) {
                    user.emit("rispostaRegistrata");
                }
                else {
                    user.emit("giaRegistrata", {
                        message: "Non puoi rispondere 2 volte dio coltivatore di carote in un campo di reclusione ucraino"
                    });
                }
            } catch (e) {
                console.log(e)
            }
        });

        user.on("scegliVincitore", async (data) => {
            try {
                const stanzaId = data["id"];
                const vincitore = data["vincitore"];
                const Stanza = await Stanze.get(stanzaId);
                const result = Stanza.scegliVincitore(user.data.referenceGiocatore.id, vincitore);
                if(result) {
                    server.in(stanzaId).fetchSockets().then(sockets => {
                        for(const socket of sockets) {
                            socket.data.referenceGiocatore = Stanza.trovaGiocatore(socket.data.referenceGiocatore.id);
                            socket.emit("fineTurno", {
                                vincitore: result[0],
                                domanda: result[1],
                                risposte: result[2],
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
                console.log(e)
            }
        });

        user.on("terminaPartita", async (data) => {
            try {
                const stanzaId = data["id"];
                const Stanza = await Stanze.get(stanzaId);
                const result = Stanza.terminaPartita(user.data.referenceGiocatore.id);
                if(result) {
                    server.to(stanzaId).emit("partitaTerminata", {
                        classifica: result
                    });
                    for(const id of Stanza.giocatoriPassati.values()) generationMemory.delete(id);
                    await Stanze.delete(stanzaId);
                    generationMemory.delete(stanzaId);
                    server.socketsLeave(stanzaId);
                    console.log("Stanza eliminata => " + stanzaId);
                }
            } catch (e) {
                console.log(e)
            }
        });

        user.on("aggiornaAttesa", async (data) => {
            const Stanza = await Stanze.get(data["stanzaId"]);

            server.to(data["stanzaId"]).emit("aggiornamentoAttesa", {
                numeroGiocatori: Stanza?.giocatori.size,
                minimoGiocatori: Stanza.minimoGiocatori,
                giocatori: Stanza.classifica().map(giocatore => giocatore.adaptToClient())
            })
        });

        user.on("listaGiocatori", async (data) => user.emit("listaGiocatoriAggiornamento", {
            giocatori: await Stanze.get(data["stanzaId"])?.classifica().map(giocatore => giocatore.adaptToClient())
        }));

        user.on("aggiornaAttesaRisposta", async (data) => {
            const Stanza = await Stanze.get(data["stanzaId"]);

            server.to(data["stanzaId"]).emit("aggiornamentoAttesaRisposta", {
                numeroGiocatori: Stanza?.round.risposte.size,
                giocatori: Array.from(Stanza.round.risposte.keys()).map(giocatore => Stanza.trovaGiocatore(giocatore).adaptToClient())
            })
        });

        user.on("aggiungiMazzo", async (data) => {
            const stanza = await Stanze.get(data['id']);
            const result = stanza?.modificaMazzo(data["packs"]);
            if(result)
                user.emit("mazzoAggiunto");
            else
                user.emit("mazzoErrore", {
                    message: "Mannaggia, mi sa che si userà lo standard hehe"
                });
        });

        user.on("lasciaStanza", async (data) => {
            try {
                const stanzaId = data["id"];
                const giocatoreId = data["giocatore"] || user.data.referenceGiocatore.id;
                const stanza = await Stanze.get(stanzaId);
                const result = stanza.eliminaGiocatore(giocatoreId);
                if(result) {
                    let deleted = false;
                    await Stanza.pulisciStanza((id) => {
                        server.to(id).emit("stanzaChiusa");
                        server.socketsLeave(id);
                        console.log("Stanza eliminata => " + id);
                        deleted = true;
                    }, generationMemory, Stanze, stanzaId);
                    if(deleted) return;
                    server.in(stanzaId).fetchSockets().then(sockets => {
                        const persona = sockets.find(socket =>
                            socket.data?.referenceGiocatore.id === giocatoreId);
                        if(persona) {
                            persona.emit("stanzaLasciata");
                            persona.leave(stanzaId);
                        }
                    });
                    server.in(stanzaId).fetchSockets().then(sockets => {
                        for(const socket of sockets) {
                            socket.data.referenceGiocatore = stanza.giocatori.get(socket.data.referenceGiocatore.id);
                            emitStatoStanza(stanzaId, socket);
                        }
                    });
                    console.log("Giocatore eliminato da Stanza => " + stanzaId);
                }
            } catch (e) {
                console.log(e)
            }
        });

        user.on("disconnect", async () => {
            const stanzaId = Stanza.trovaDaGiocatore(user.data.referenceGiocatore?.id, await Stanze.values());
            const giocatore = await Stanze.get(stanzaId)?.trovaGiocatore(user.data.referenceGiocatore?.id);
            const stanza = await Stanze.get(stanzaId);
            if (giocatore && stanzaId) {
                giocatore.online = false;
                setTimeout(() => {
                    if (stanza && !giocatore.isOnline() && stanza.trovaGiocatore(giocatore.id)) {
                        stanza.eliminaGiocatore(giocatore.id);
                        console.log("Giocatore eliminato da Stanza => " + stanzaId);
                        server.in(stanzaId).fetchSockets().then(sockets => {
                            for(const socket of sockets) {
                                socket.data.referenceGiocatore = stanza.giocatori.get(socket.data.referenceGiocatore.id);
                                emitStatoStanza(stanzaId, socket);
                            }
                        });
                    }
                }, timeout/60);
            }
        });
    });

    //Pulizia stanze automatica
    setInterval(async () => {
        try {
            await Stanza.pulisciStanza((id) => {
                server.to(id).emit("stanzaChiusa");
                server.socketsLeave(id);
                console.log("Stanza eliminata => " + id);
            }, generationMemory, Stanze);
        } catch(err) {
            console.error(err);
        }
    }, timeout/30/60);
};

module.exports = { appConfig, serverConfig };