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

    const emitStatoStanza = async (stanzaId, ...sockets) => {
        const Stanza = typeof stanzaId === "string" ? await Stanze.get(stanzaId) : stanzaId;
        if (!Stanza) return;

        await Promise.all(sockets.map(socket => {
            switch (Stanza.stato) {
                case StatoStanza.WAIT : {
                    socket.emit("confermaStanza", {
                        reference: socket.data?.referenceGiocatore?.toJSON(),
                        stanzaId: Stanza.id,
                        primoRound: Stanza.numeroRound[0] === 0,
                        interroghi: Stanza.round.chiStaInterrogando === socket.data.referenceGiocatore.id
                    });
                    break;
                }
                case StatoStanza.END : {
                    socket.emit("stanzaChiusa");
                    socket.data.referenceGiocatore = null;
                    socket.leave(stanzaId);
                    break;
                }
                case StatoStanza.CHOOSING_CARDS : {
                    if(Stanza.round.risposte.has(socket.data?.referenceGiocatore.id))
                        socket.emit("rispostaRegistrata");
                    else
                        socket.emit("roundIniziato", {
                            chiStaInterrogando: Stanza.trovaGiocatore(Stanza.round.chiStaInterrogando).toJSON(),
                            domanda: Stanza.round.domanda,
                            reference: socket.data?.referenceGiocatore?.toJSON(),
                            stanza: Stanza.id
                        });
                    break;
                }
                case StatoStanza.CHOOSING_WINNER : {
                    socket.emit("sceltaVincitore", {
                        risposte: Array.from(Stanza.round.risposte.entries()),
                        domanda: Stanza.round.domanda,
                        chiInterroga: Stanza.trovaGiocatore(Stanza.round.chiStaInterrogando).toJSON(),
                        reference: socket.data?.referenceGiocatore?.toJSON(),
                        stanza: Stanza.id
                    });
                    break;
                }
            }

            server.to(Stanza.id).emit("segnaleAudio", {
                socketId: socket.id,
                playerId: socket.data.referenceGiocatore?.id
            });
        }));
    };

    const cleanUp = async () => {
        try {
            await Stanza.pulisciStanza((id) => {
                server.to(id).emit("stanzaChiusa");
                server.socketsLeave(id);
                console.log("Stanza eliminata => " + id);
            }, generationMemory, Stanze);
        } catch (err) { console.error(err); } finally {
            setTimeout(cleanUp, timeout/30/60);
        }
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
        const stanza = await Stanze.get(stanzaId);
        const exist = stanza?.trovaGiocatoreAnchePassato(userId);
        if (exist === null) return next();
        if (!exist) return next(new Error("SESSION_EXPIRED"));
        if (exist.online === true) return next(new Error("ALREADY_CONNECTED"));
        exist.online = true;
        exist.assegnaSocket(socket.id);
        socket.join(stanzaId);
        await Stanze.set(stanzaId, stanza);
        socket.data.referenceGiocatore = exist;
        socket.data.referenceStanza = stanzaId;
        next();
    });

    server.on("connection", (user) => {
        if(user.data?.referenceStanza) user.join(user.data?.referenceStanza);
        (async () => await emitStatoStanza(user.data.referenceStanza, user))();

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
                server.to(stanza.id).emit("segnaleAudio", {
                    socketId: user.id,
                    playerId: user.data.referenceGiocatore.id
                });
                console.log("Stanza creata => " + stanza.id);
            } catch(e) {
                console.log(e)
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
                server.to(stanzaId).emit("segnaleAudio", {
                    socketId: user.id,
                    playerId: user.data.referenceGiocatore.id
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
                        classifica: result.map(giocatore => giocatore.toJSON())
                    });
                    for(const id of Stanza.giocatoriPassati.values()) await generationMemory.delete(id);
                    await Stanze.delete(stanzaId);
                    await generationMemory.delete(stanzaId);
                    server.socketsLeave(stanzaId);
                    console.log("Stanza " + stanzaId + " chiusa");
                }
                else if(result) {
                    const sockets = await server.in(stanzaId).fetchSockets();
                    const round = Stanza.round;
                    for (const socket of sockets) {
                        socket.data.referenceGiocatore = Stanza.trovaGiocatore(socket.data.referenceGiocatore?.id);
                        socket.emit("roundIniziato", {
                            chiStaInterrogando: Stanza.trovaGiocatore(round.chiStaInterrogando).toJSON(),
                            domanda: round.domanda,
                            reference: socket.data.referenceGiocatore.toJSON()
                        });
                    }
                }
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
                    const sockets = await server.in(stanzaId).fetchSockets();
                    for (const socket of sockets) {
                        socket.data.referenceGiocatore = Stanza.trovaGiocatore(socket.data.referenceGiocatore.id);
                        socket.emit("fineTurno", {
                            vincitore: result[0],
                            domanda: result[1],
                            risposte: result[2],
                            reference: socket.data.referenceGiocatore.toJSON()
                        });
                    }
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
                        classifica: result.map(giocatore => giocatore.toJSON())
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
            const Stanza = await Stanze.get(data["stanzaId"] || user.data?.referenceStanza);

            server.to(data["stanzaId"] || user.data?.referenceStanza).emit("aggiornamentoAttesa", {
                numeroGiocatori: Stanza?.giocatori.size,
                minimoGiocatori: Stanza?.minimoGiocatori,
                giocatori: Stanza?.classifica().map(giocatore => giocatore.toJSON())
            })
        });

        user.on("listaGiocatori", async (data) => {
            const Stanza = await Stanze.get(data["stanzaId"] || user.data?.referenceStanza);

            server.to(data["stanzaId"] || user.data?.referenceStanza).emit("listaGiocatoriAggiornamento", {
                giocatori: Stanza?.classifica().map(giocatore => giocatore.toJSON())
            });
        });

        user.on("aggiornaAttesaRisposta", async (data) => {
            const Stanza = await Stanze.get(data["stanzaId"] || user.data?.referenceStanza);

            server.to(data["stanzaId"] || user.data?.referenceStanza).emit("aggiornamentoAttesaRisposta", {
                numeroGiocatori: Stanza?.round.risposte.size,
                giocatori: Array.from(Stanza?.round.risposte.keys()).map(giocatore => Stanza.trovaGiocatore(giocatore).toJSON())
            })
        });

        user.on("aggiornaChat", async (data) => {
            const Stanza = await Stanze.get(data["stanzaId"] || user.data?.referenceStanza);

            server.to(data["stanzaId"] || user.data?.referenceStanza).emit("aggiornamentoChat", {
                chat: Stanza?.chat.messaggi.toReversed()
            });
        });

        user.on("aggiungiMazzo", async (data) => {
            const stanza = await Stanze.get(data["id"] || user.data?.referenceStanza);
            const result = stanza?.modificaMazzo(data["packs"]);
            if(result)
                user.emit("mazzoAggiunto");
            else
                user.emit("mazzoErrore", {
                    message: "Mannaggia, mi sa che al server non sono piaciuti :("
                });
        });

        user.on("webrtcOfferta", (data) => {
            server.to(data['targetSocketId']).emit("webrtcRiceviOfferta", {
                signal: data.signal,
                callerId: user.id
            });
        });

        user.on("webrtcRisposta", (data) => {
            server.to(data['callerSocketId']).emit("webrtcRiceviRisposta", {
                signal: data.signal,
                responderSocketId: user.id
            });
        });

        user.on("messaggioChat", async (data) => {
            const stanza = await Stanze.get(data["id"] || user.data?.referenceStanza);
            const result = stanza.scriviInChat(data["message"], user.data?.referenceGiocatore?.id)
            if(result)
                server.to(data["id"] || user.data?.referenceStanza).emit("aggiornamentoChat", {
                    chat: result
                });
            await Stanze.set(stanza.id, stanza);
        });

        user.on("lasciaStanza", async (data) => {
            try {
                const stanzaId = data["id"] ?? user.data.referenceStanza;
                const giocatoreId = data["giocatore"] ?? user.data.referenceGiocatore?.id;
                const stanza = await Stanze.get(stanzaId);
                const result = stanza?.eliminaGiocatore(giocatoreId);
                if(result) {
                    user.emit("stanzaLasciata");
                    console.log("Giocatore ha abbandonato la Stanza => " + stanzaId);
                    user.leave(stanzaId);
                    const sockets = await server.in(stanzaId).fetchSockets();
                    for(const socket of sockets) socket.data.referenceGiocatore = stanza.giocatori.get(socket.data.referenceGiocatore.id);
                    const stanzaNuova = await Stanze.set(stanzaId, stanza);
                    const stanzona = stanzaNuova instanceof Stanza ? stanzaNuova : (stanzaNuova[stanzaId] ?? null);
                    await emitStatoStanza(stanzona ?? stanzaId, ...sockets);
                    console.log("Giocatore eliminato da Stanza => " + stanzaId);
                }
            } catch (e) {
                console.log(e)
            }
        });

        user.on("disconnect", async () => {
            const giocatoreId = user.data.referenceGiocatore?.id;
            let stanzaId = user.data?.referenceStanza;
            if (!giocatoreId) return;
            if(!stanzaId) stanzaId = Stanza.trovaDaGiocatore(giocatoreId, await Stanze.values());
            try {
                user.leave(stanzaId);
                const stanza = await Stanze.get(stanzaId);
                if (stanza) {
                    const giocatore = stanza.trovaGiocatore(giocatoreId);
                    if (giocatore) {
                        giocatore.online = false;
                        await Stanze.set(stanzaId, stanza);
                    }
                }
                setTimeout(async () => {
                    try {
                        const stanzaDopo = await Stanze.get(stanzaId);
                        const giocatoreDopo = stanzaDopo?.trovaGiocatore(giocatoreId);
                        if (stanzaDopo && giocatoreDopo && !giocatoreDopo.isOnline(giocatoreId)) {
                            stanzaDopo.eliminaGiocatore(giocatoreId);
                            const sockets = await server.in(stanzaId).fetchSockets();
                            for (const s of sockets) {
                                s.data.referenceGiocatore = stanzaDopo.giocatori.get(s.data.referenceGiocatore.id);
                            }
                            const nuova = await Stanze.set(stanzaId, stanzaDopo);
                            const stanzona = nuova instanceof Stanza ? nuova : (nuova[stanzaId] ?? null);
                            await emitStatoStanza(stanzona ?? stanzaId, ...sockets);
                        }
                    } catch (innerError) {
                        console.error("Errore nel timeout disconnessione:", innerError);
                    }
                }, timeout / 60);
            } catch (e) {
                console.error("Errore generale disconnect:", e);
            }
        });
    });

    (async () => cleanUp())();
};

module.exports = serverConfig;