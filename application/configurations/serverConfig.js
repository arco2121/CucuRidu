const path = require("path");
const { Stanza, StatoStanza } = require(path.join(__dirname, "../include/script/Stanza"));

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
                    reference: socket.data.referenceGiocatore.toJSON(),
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
                        chiStaInterrogando: Stanza.trovaGiocatore(Stanza.round.chiStaInterrogando).toJSON(),
                        domanda: Stanza.round.domanda,
                        reference: socket.data.referenceGiocatore.toJSON(),
                        stanza: Stanza.id
                    });
                return next();
            }
            case StatoStanza.CHOOSING_WINNER : {
                socket.emit("sceltaVincitore", {
                    risposte: Array.from(Stanza.round.risposte.entries()),
                    domanda: Stanza.round.domanda,
                    chiInterroga: Stanza.trovaGiocatore(Stanza.round.chiStaInterrogando).toJSON(),
                    reference: socket.data.referenceGiocatore.toJSON(),
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
        const exist = (await Stanze.get(stanzaId))?.trovaGiocatoreAnchePassato(userId);
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
                const stanza = await new Stanza().init(username, pfp, generationMemory);
                await Stanze.set(stanza.id, stanza);
                user.join(stanza.id);
                user.data.referenceGiocatore = stanza.master;
                user.emit("confermaStanza", {
                    stanzaId: stanza.id,
                    reference: user.data.referenceGiocatore.toJSON(),
                    primoRound: stanza.numeroRound[0] === 0,
                    interroghi: stanza.round.chiStaInterrogando === user.data.referenceGiocatore.id
                });
                server.to(stanza.id).emit("aggiornamentoAttesa", {
                    numeroGiocatori: stanza.giocatori.size,
                    minimoGiocatori: stanza.minimoGiocatori,
                    giocatori: stanza.classifica().map(giocatore => giocatore.toJSON())
                });
                server.to(stanza.id).emit("listaGiocatoriAggiornamento", {
                    giocatori: stanza.classifica().map(giocatore => giocatore.toJSON())
                });
                console.log("Stanza creata => " + stanza.id);
            } catch {
                user.emit("errore", {
                    message: "Impossibile creare la stanza, non va niente porcaccio al catamarano ubriaco"
                });
            }
        });

        user.on("partecipaStanza", async (data) => {
            try {
                const stanzaId = data["id"];
                const Stanza = await Stanze.get(stanzaId);
                user.data.referenceGiocatore = await Stanza.aggiungiGiocatore(data["username"], data["pfp"], generationMemory);
                if(user.data.referenceGiocatore === false) {
                    user.emit("impossibileAggiungersi", {
                        message: "Impossibile aggiungersi alla stanza, le regole giustamente non ammettono schifi umani"
                    });
                    return;
                }
                user.join(stanzaId);
                user.emit("confermaStanza", {
                    reference: user.data.referenceGiocatore.toJSON(),
                    interroghi: Stanza.round.chiStaInterrogando === user.data.referenceGiocatore.id,
                    primoRound: Stanza.numeroRound[0] === 0
                });
                server.to(stanzaId).emit("aggiornamentoAttesa", {
                    numeroGiocatori: Stanza.giocatori.size,
                    minimoGiocatori: Stanza.minimoGiocatori,
                    giocatori: Stanza.classifica().map(giocatore => giocatore.toJSON())
                });
                server.to(stanzaId).emit("listaGiocatoriAggiornamento", {
                    giocatori: Stanza.classifica().map(giocatore => giocatore.toJSON())
                });
                await Stanze.set(stanzaId, Stanza);
                console.log("Giocatore aggiunto a Stanza => " + stanzaId);
            } catch (e) {
                console.log(e)
            }
        });

        user.on("iniziaTurno", async (data) => {
            try {
                const stanzaId = data["id"];
                const Stanza = await Stanze.get(stanzaId);
                const result = Stanza.iniziaTurno(user.data.referenceGiocatore?.id);
                if(typeof result === "object") {
                    server.to(stanzaId).emit("partitaTerminata", {
                        classifica: result
                    });
                    for(const id of Stanza.giocatoriPassati.values()) await generationMemory.delete(id);
                    await Stanze.delete(stanzaId);
                    await generationMemory.delete(stanzaId);
                    server.socketsLeave(stanzaId);
                    console.log("Stanza " + stanzaId + " chiusa");
                }
                else if(result)
                    server.in(stanzaId).fetchSockets().then(sockets => {
                        const round = Stanza.round;
                        for(const socket of sockets) {
                            socket.data.referenceGiocatore = Stanza.trovaGiocatore(socket.data.referenceGiocatore.id);
                            socket.emit("roundIniziato", {
                                chiStaInterrogando: Stanza.trovaGiocatore(round.chiStaInterrogando).toJSON(),
                                domanda: round.domanda,
                                reference: socket.data.referenceGiocatore.toJSON()
                            });
                        }
                    });
                else
                    user.emit("aspettaAltri", {
                        message: "Girl non ci sono chatbot ai che fingano di esserti amico. Go touch some grass e non fare come Calipso"
                    });

                await Stanze.set(stanzaId, Stanza);
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
                        chiInterroga: Stanza.trovaGiocatore(result[2]).toJSON(),
                    });
                } else if(result)
                    user.emit("rispostaRegistrata");
                else {
                    user.emit("giaRegistrata", {
                        message: "Non puoi rispondere 2 volte giuseppino coltivatore di carote in un campo di reclusione ucraino"
                    });
                }
                await Stanze.set(stanzaId, Stanza);
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
                                reference: socket.data.referenceGiocatore.toJSON()
                            });
                        }
                    });
                } else {
                    user.emit("errore", {
                        message: "Aspetta e spera che tutti quanti rispondano, selezionane un'altro (tanto ti ghostano perchè gli stai sul cabbo)"
                    });
                }
                await Stanze.set(stanzaId, Stanza);
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
                    for(const id of Stanza.giocatoriPassati.values()) await generationMemory.delete(id);
                    await Stanze.delete(stanzaId);
                    await generationMemory.delete(stanzaId);
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
                minimoGiocatori: Stanza?.minimoGiocatori,
                giocatori: Stanza?.classifica().map(giocatore => giocatore.toJSON())
            })
        });

        user.on("listaGiocatori", async (data) => {
            const Stanza = await Stanze.get(data["stanzaId"]);

            user.emit("listaGiocatoriAggiornamento", {
                giocatori: Stanza?.classifica().map(giocatore => giocatore.toJSON())
            });
        });

        user.on("aggiornaAttesaRisposta", async (data) => {
            const Stanza = await Stanze.get(data["stanzaId"]);

            server.to(data["stanzaId"]).emit("aggiornamentoAttesaRisposta", {
                numeroGiocatori: Stanza?.round.risposte.size,
                giocatori: Array.from(Stanza?.round.risposte.keys()).map(giocatore => Stanza.trovaGiocatore(giocatore).toJSON())
            })
        });

        user.on("aggiungiMazzo", async (data) => {
            const stanza = await Stanze.get(data['id']);
            const result = stanza?.modificaMazzo(data["packs"]);
            if(result)
                user.emit("mazzoAggiunto");
            else
                user.emit("mazzoErrore", {
                    message: "Mannaggia, mi sa che al server non sono piaciuti :("
                });
        });

        user.on("lasciaStanza", async (data) => {
            try {
                const stanzaId = data["id"];
                const giocatoreId = data["giocatore"] || user.data.referenceGiocatore?.id;
                const stanza = await Stanze.get(stanzaId);
                const result = stanza.eliminaGiocatore(giocatoreId);
                if(result) {
                    await Stanze.set(stanzaId, stanza);
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
            const stanze = await Stanze.values();
            const stanzaId = Stanza.trovaDaGiocatore(user.data.referenceGiocatore?.id, stanze);
            const stanza = await Stanze.get(stanzaId);
            const giocatore = stanza?.trovaGiocatore(user.data.referenceGiocatore?.id);
            if (giocatore && stanzaId) {
                giocatore.online = false;
                await Stanze.set(stanzaId, stanza);
                setTimeout(async () => {
                    if (stanza && !giocatore.isOnline() && stanza.trovaGiocatore(giocatore.id)) {
                        stanza.eliminaGiocatore(giocatore.id);
                        await Stanze.set(stanzaId, stanza);
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

module.exports = serverConfig;