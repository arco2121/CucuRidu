const path = require("path");
const { Stanza, StatoStanza } = require(path.join(__dirname, "../include/script/Stanza"));
const { Giocatore } = require(path.join(__dirname, "../include/script/Giocatore"));
const { Mazzo } = require(path.join(__dirname, "../include/script/Mazzo"));
const { NESSUNA_MODIFICA } = require(path.join(__dirname, "../include/script/concorrenza"));
const { normalizzaRighe, TIPI_SUGGERIMENTO } = require(path.join(__dirname, "../include/script/Segnalazioni"));

/**
 * Configura gli endpoint del ServerIO
 * @param server
 * @param serverSession
 * @param TEMPORARY_TOKEN
 * @param Stanze
 * @param generationMemory
 * @param timeout
 * @param archivioSegnalazioni
 */
const serverConfig = (server, serverSession, TEMPORARY_TOKEN, Stanze, generationMemory, timeout = 3600000, archivioSegnalazioni = null) => {

    // quanto aspettiamo prima di togliere davvero dalla stanza chi si e' disconnesso
    const GRAZIA_DISCONNESSIONE = Math.min(Math.max((timeout / 60) * 3, 60000), 300000);
    // per non farsi riempire l'archivio da chi spamma il bottone
    const PAUSA_SEGNALAZIONI = 4000;
    // ogni quanto, al massimo, un singolo socket puo chiedere di essere
    // riallineato: il client chiede ogni ~7s, questo tiene a bada il resto
    const PAUSA_SINCRONIZZA = 2500;

    /**
     * Nessun handler socket deve poter far cadere il processo: prima di questa
     * modifica una singola eccezione dentro un handler async diventava una
     * unhandledRejection e Node chiudeva tutto, buttando fuori l'intera partita.
     */
    const sicuro = (nome, handler) => async (...args) => {
        try { await handler(...args); }
        catch (e) { console.error(`[socket:${nome}]`, e?.message || e); }
    };

    const giocatoreDi = (socket, stanza) => {
        const id = socket.data?.giocatoreId || socket.data?.referenceGiocatore?.id;
        if (!id) return null;
        return stanza?.trovaGiocatore(id) || null;
    };

    /** Riallinea la copia del giocatore appesa al socket con lo stato vero della stanza. */
    const aggiornaReference = (stanza, sockets) => {
        for (const socket of sockets) {
            const giocatore = giocatoreDi(socket, stanza);
            if (giocatore) socket.data.referenceGiocatore = giocatore;
        }
    };

    /**
     * Il giocatore ha ancora un socket vivo nella stanza (magari su un'altra
     * istanza del cluster)? Se si', il disconnect che stiamo gestendo riguarda
     * una connessione vecchia e va ignorato.
     */
    const haAncoraUnSocket = async (stanzaId, giocatoreId, escluso) => {
        try {
            const sockets = await server.in(stanzaId).fetchSockets();
            return sockets.some(s => s.id !== escluso && s.data?.giocatoreId === giocatoreId);
        } catch { return false; }
    };

    const inviaListe = (stanza) => {
        if (!stanza?.id) return;
        const classifica = stanza.classifica().map(giocatore => giocatore.toJSON());
        server.to(stanza.id).emit("aggiornamentoAttesa", {
            numeroGiocatori: stanza.giocatori.size,
            minimoGiocatori: stanza.minimoGiocatori,
            giocatori: classifica
        });
        server.to(stanza.id).emit("listaGiocatoriAggiornamento", { giocatori: classifica });
    };

    /** Chi ha gia inviato i completamenti: lo vede tutta la stanza, lettore compreso. */
    const inviaAttesaRisposte = (stanza) => {
        if (!stanza?.id || !stanza.round) return;
        const risposte = stanza.round.risposte instanceof Map ? stanza.round.risposte : new Map();
        server.to(stanza.id).emit("aggiornamentoAttesaRisposta", {
            numeroGiocatori: risposte.size,
            totaleAttesi: Math.max(0, stanza.giocatori.size - 1),
            giocatori: Array.from(risposte.keys())
                .map(id => stanza.trovaGiocatore(id)?.toJSON())
                .filter(Boolean)
        });
    };

    /*
     * Quali schermate hanno senso, per QUESTO giocatore, con la stanza in
     * questo stato. Serve alla risincronizzazione: il client dice cosa sta
     * mostrando, e se non e' in questa lista vuol dire che si e' perso un
     * evento per strada e va rimesso in pari.
     *
     * In WAIT le schermate valide sono tre perche' lo stato della stanza non
     * distingue "sto aspettando in lobby" da "sto guardando chi ha vinto il
     * round": sono la stessa cosa per il server, e nessuna delle due e'
     * bloccata.
     */
    const vistaAttesa = (stanza, giocatore) => {
        switch (stanza?.stato) {
            case StatoStanza.WAIT: return ["wait", "showWinner", "endGame"];
            case StatoStanza.CHOOSING_CARDS:
                return stanza.round?.risposte?.has?.(giocatore?.id)
                    ? ["waitWinner"]
                    : ["choosingCards"];
            case StatoStanza.CHOOSING_WINNER: return ["chooseWinner"];
            default: return [];
        }
    };

    const emitStatoStanza = async (stanzaId, ...sockets) => {
        const stanza = typeof stanzaId === "string" ? await Stanze.get(stanzaId) : stanzaId;
        if (!stanza) {
            for (const socket of sockets) {
                try { socket.emit("stanzaChiusa"); } catch { /* ignora */ }
            }
            return;
        }

        for (const socket of sockets) {
            try {
                const giocatore = giocatoreDi(socket, stanza);
                if (giocatore) socket.data.referenceGiocatore = giocatore;

                switch (stanza.stato) {
                    case StatoStanza.WAIT: {
                        socket.emit("confermaStanza", {
                            reference: giocatore?.toJSON() ?? null,
                            stanzaId: stanza.id,
                            primoRound: stanza.numeroRound[0] === 0,
                            interroghi: !!giocatore && stanza.round?.chiStaInterrogando === giocatore.id
                        });
                        break;
                    }
                    case StatoStanza.END: {
                        socket.emit("stanzaChiusa");
                        socket.data.referenceGiocatore = null;
                        socket.leave(stanza.id);
                        break;
                    }
                    case StatoStanza.CHOOSING_CARDS: {
                        if (!giocatore) { socket.emit("stanzaChiusa"); break; }
                        if (stanza.round?.risposte?.has(giocatore.id))
                            socket.emit("rispostaRegistrata", { stanzaId: stanza.id });
                        else
                            socket.emit("roundIniziato", {
                                chiStaInterrogando: stanza.trovaGiocatore(stanza.round.chiStaInterrogando)?.toJSON() ?? null,
                                domanda: stanza.round.domanda,
                                reference: giocatore.toJSON(),
                                stanza: stanza.id
                            });
                        break;
                    }
                    case StatoStanza.CHOOSING_WINNER: {
                        socket.emit("sceltaVincitore", {
                            risposte: Array.from(stanza.round?.risposte?.entries() ?? []),
                            domanda: stanza.round?.domanda ?? null,
                            chiInterroga: stanza.trovaGiocatore(stanza.round?.chiStaInterrogando)?.toJSON() ?? null,
                            reference: giocatore?.toJSON() ?? null,
                            stanza: stanza.id
                        });
                        break;
                    }
                }

                server.to(stanza.id).emit("segnaleAudio", {
                    socketId: socket.id,
                    playerId: giocatore?.id ?? null
                });
            } catch (e) {
                console.error("[emitStatoStanza]", e?.message || e);
            }
        }
    };

    const chiudiStanza = async (stanza) => {
        if (!stanza) return;
        for (const id of stanza.giocatoriPassati.values()) {
            try { await generationMemory.delete(id); } catch { /* ignora */ }
        }
        try { await Stanze.delete(stanza.id); } catch { /* ignora */ }
        try { await generationMemory.delete(stanza.id); } catch { /* ignora */ }
        server.socketsLeave(stanza.id);
    };

    const cleanUp = async () => {
        try {
            await Stanza.pulisciStanza((id) => {
                server.to(id).emit("stanzaChiusa");
                server.socketsLeave(id);
                console.log("Stanza eliminata => " + id);
            }, generationMemory, Stanze);
        } catch (err) { console.error(err?.message || err); } finally {
            // era timeout/30/60, cioe' ogni 2 secondi: su Supabase voleva dire
            // scansionare tutta la tabella stanze 30 volte al minuto da ogni
            // istanza, rallentando tutte le altre query del gioco
            const t = setTimeout(cleanUp, Math.max(timeout / 30, 60000));
            if (t.unref) t.unref();
        }
    };

    server.use(async (socket, next) => {
        try {
            const checks = ["validation", "stanzaId", "userId"];
            const { validation, stanzaId, userId } = await serverSession.validate(
                checks, socket.handshake.auth, socket.handshake.auth?.token
            );
            if (validation !== TEMPORARY_TOKEN) return next(new Error("INVALID_KEY"));
            if (!stanzaId) return next();

            const stanza = await Stanze.get(stanzaId);
            const exist = stanza?.trovaGiocatoreAnchePassato(userId);
            if (exist === null) return next();          // stanza c'e', il giocatore deve ancora entrare
            if (!exist) return next(new Error("SESSION_EXPIRED"));

            exist.assegnaSocket(socket.id);
            try { await Stanze.setPresenza(userId, stanzaId, true, socket.id, Date.now(), null); }
            catch { exist.online = true; try { await Stanze.set(stanzaId, stanza); } catch { /* ignora */ } }
            socket.join(stanzaId);
            socket.data.giocatoreId = exist.id;
            socket.data.referenceGiocatore = exist;
            socket.data.referenceStanza = stanzaId;
            next();
        } catch (e) {
            console.error("[middleware]", e?.message || e);
            next(new Error("SESSION_EXPIRED"));
        }
    });

    server.on("connection", (user) => {
        if (user.data?.referenceStanza) user.join(user.data.referenceStanza);
        (async () => {
            try {
                if (!user.data?.referenceStanza) return;
                const stanza = await Stanze.get(user.data.referenceStanza);
                if (!stanza) return user.emit("stanzaChiusa");
                await emitStatoStanza(stanza, user);
                inviaListe(stanza);
                inviaAttesaRisposte(stanza);
            } catch (e) { console.error("[connection]", e?.message || e); }
        })();

        user.on("creaStanza", sicuro("creaStanza", async (data) => {
            try {
                const { username, pfp } = data || {};
                const stanza = await new Stanza().init(username, pfp, generationMemory);
                await Stanze.set(stanza.id, stanza);
                user.join(stanza.id);
                user.data.referenceGiocatore = stanza.master;
                user.data.giocatoreId = stanza.master.id;
                user.data.referenceStanza = stanza.id;
                try { await Stanze.setPresenza(stanza.master.id, stanza.id, true, user.id, Date.now(), null); }
                catch { /* in RAM basta l'oggetto */ }
                user.emit("confermaStanza", {
                    stanzaId: stanza.id,
                    reference: stanza.master.toJSON(),
                    primoRound: stanza.numeroRound[0] === 0,
                    interroghi: stanza.round.chiStaInterrogando === stanza.master.id
                });
                inviaListe(stanza);
                server.to(stanza.id).emit("segnaleAudio", {
                    socketId: user.id,
                    playerId: stanza.master.id
                });
                console.log("Stanza creata => " + stanza.id);
            } catch (e) {
                console.log(e);
                user.emit("errore", {
                    message: "Impossibile creare la stanza, non va niente porcaccio al catamarano ubriaco"
                });
            }
        }));

        user.on("partecipaStanza", sicuro("partecipaStanza", async (data) => {
            const stanzaId = data?.["id"];
            if (!stanzaId) return;

            // l'id del giocatore va generato PRIMA della mutate: il mutatore
            // deve restare sincrono per poter essere rieseguito in caso di conflitto
            const nuovo = await new Giocatore(data["username"], data["pfp"]).init(generationMemory);

            let rifiutato = false;
            const esito = await Stanze.mutate(stanzaId, (stanza) => {
                rifiutato = false;
                if (!stanza.aggiungiGiocatorePronto(nuovo)) {
                    rifiutato = true;
                    return NESSUNA_MODIFICA;
                }
                return true;
            });

            if (!esito || rifiutato) {
                user.emit("impossibileAggiungersi", {
                    message: "Impossibile aggiungersi alla stanza, le regole giustamente non ammettono schifi umani"
                });
                return;
            }

            const stanza = esito.stanza;
            const giocatore = stanza.trovaGiocatore(nuovo.id) || nuovo;
            user.data.referenceGiocatore = giocatore;
            user.data.giocatoreId = giocatore.id;
            user.data.referenceStanza = stanzaId;
            user.join(stanzaId);
            try { await Stanze.setPresenza(giocatore.id, stanzaId, true, user.id, Date.now(), null); }
            catch { /* in RAM basta l'oggetto */ }

            user.emit("confermaStanza", {
                stanzaId: stanzaId,
                reference: giocatore.toJSON(),
                interroghi: stanza.round?.chiStaInterrogando === giocatore.id,
                primoRound: stanza.numeroRound[0] === 0
            });
            inviaListe(stanza);
            server.to(stanzaId).emit("segnaleAudio", {
                socketId: user.id,
                playerId: giocatore.id
            });
            console.log("Giocatore aggiunto a Stanza => " + stanzaId);
        }));

        user.on("iniziaTurno", sicuro("iniziaTurno", async (data) => {
            const stanzaId = data?.["id"] ?? user.data?.referenceStanza;
            const giocatoreId = user.data?.giocatoreId;
            if (!stanzaId) return;

            const esito = await Stanze.mutate(stanzaId, (stanza) => stanza.iniziaTurno(giocatoreId));
            if (!esito) return user.emit("stanzaChiusa");
            const { stanza, risultato } = esito;

            if (typeof risultato === "object" && risultato) {
                server.to(stanzaId).emit("partitaTerminata", {
                    classifica: risultato.map(giocatore => giocatore.toJSON())
                });
                await chiudiStanza(stanza);
                console.log("Stanza " + stanzaId + " chiusa");
                return;
            }

            if (risultato) {
                const sockets = await server.in(stanzaId).fetchSockets();
                const round = stanza.round;
                for (const socket of sockets) {
                    const giocatore = giocatoreDi(socket, stanza);
                    if (!giocatore) continue;
                    socket.data.referenceGiocatore = giocatore;
                    socket.emit("roundIniziato", {
                        chiStaInterrogando: stanza.trovaGiocatore(round.chiStaInterrogando)?.toJSON() ?? null,
                        domanda: round.domanda,
                        reference: giocatore.toJSON(),
                        stanza: stanza.id
                    });
                }
                inviaAttesaRisposte(stanza);
                return;
            }

            user.emit("aspettaAltri", {
                message: "Girl non ci sono chatbot ai che fingano di esserti amico. Go touch some grass"
            });
        }));

        user.on("inviaRisposta", sicuro("inviaRisposta", async (data) => {
            const stanzaId = data?.["id"] ?? user.data?.referenceStanza;
            const giocatoreId = user.data?.giocatoreId;
            const carte = data?.["indexCarte"] ?? [];
            if (!stanzaId || !giocatoreId) return;

            let motivo = null;
            const esito = await Stanze.mutate(stanzaId, (stanza) => {
                motivo = null;
                // reinvio dopo una riconnessione: non e' un errore, e' idempotente
                if (stanza.round?.risposte?.has(giocatoreId)) {
                    motivo = "gia";
                    return NESSUNA_MODIFICA;
                }
                const risultato = stanza.aggiungiRisposta(giocatoreId, ...carte);
                if (risultato === false) {
                    motivo = "rifiutata";
                    return NESSUNA_MODIFICA;
                }
                return risultato;
            });

            if (!esito) return user.emit("stanzaChiusa");
            const { stanza, risultato } = esito;

            if (motivo === "gia") {
                if (stanza.stato === StatoStanza.CHOOSING_WINNER) await emitStatoStanza(stanza, user);
                else user.emit("rispostaRegistrata", { stanzaId: stanza.id });
                inviaAttesaRisposte(stanza);
                return;
            }

            if (motivo === "rifiutata") {
                // lo stato reale e' diverso da quello che crede il client: riallineiamolo
                await emitStatoStanza(stanza, user);
                inviaAttesaRisposte(stanza);
                return;
            }

            if (typeof risultato === "object" && risultato) {
                server.to(stanzaId).emit("sceltaVincitore", {
                    domanda: risultato[0],
                    risposte: risultato[1],
                    chiInterroga: stanza.trovaGiocatore(risultato[2])?.toJSON() ?? null,
                    stanza: stanza.id
                });
            } else {
                user.emit("rispostaRegistrata", { stanzaId: stanza.id });
            }
            inviaAttesaRisposte(stanza);
        }));

        user.on("scegliVincitore", sicuro("scegliVincitore", async (data) => {
            const stanzaId = data?.["id"] ?? user.data?.referenceStanza;
            const vincitore = data?.["vincitore"];
            const giocatoreId = user.data?.giocatoreId;
            if (!stanzaId) return;

            const esito = await Stanze.mutate(stanzaId, (stanza) => {
                const risultato = stanza.scegliVincitore(giocatoreId, vincitore);
                return risultato === false ? NESSUNA_MODIFICA : risultato;
            });

            if (!esito) return user.emit("stanzaChiusa");
            const { stanza, risultato } = esito;

            if (!risultato) {
                user.emit("errore", {
                    message: "Aspetta e spera che tutti quanti rispondano, selezionane un'altro (tanto ti ghostano perche' gli stai sul cabbo)"
                });
                return;
            }

            // roster completo, serve al client per abbinare pfp/nome a chi ha
            // risposto quando genera l'immagine riepilogativa del round
            const rosterCompleto = stanza.classifica().map(giocatore => giocatore.toJSON());
            const sockets = await server.in(stanzaId).fetchSockets();
            for (const socket of sockets) {
                const giocatore = giocatoreDi(socket, stanza);
                if (!giocatore) continue;
                socket.data.referenceGiocatore = giocatore;
                socket.emit("fineTurno", {
                    vincitore: risultato[0],
                    domanda: risultato[1],
                    risposte: risultato[2],
                    tutteLeRisposte: risultato[3],
                    giocatori: rosterCompleto,
                    reference: giocatore.toJSON()
                });
            }
            inviaListe(stanza);
        }));

        user.on("terminaPartita", sicuro("terminaPartita", async (data) => {
            const stanzaId = data?.["id"] ?? user.data?.referenceStanza;
            const giocatoreId = user.data?.giocatoreId;
            if (!stanzaId) return;

            const esito = await Stanze.mutate(stanzaId, (stanza) => {
                const risultato = stanza.terminaPartita(giocatoreId);
                return risultato === false ? NESSUNA_MODIFICA : risultato;
            });
            if (!esito || !esito.risultato) return;

            server.to(stanzaId).emit("partitaTerminata", {
                classifica: esito.risultato.map(giocatore => giocatore.toJSON())
            });
            await chiudiStanza(esito.stanza);
            console.log("Stanza eliminata => " + stanzaId);
        }));

        user.on("aggiornaAttesa", sicuro("aggiornaAttesa", async (data) => {
            const stanzaId = data?.["stanzaId"] || user.data?.referenceStanza;
            const stanza = await Stanze.get(stanzaId);
            if (!stanza) return;
            inviaListe(stanza);
        }));

        user.on("listaGiocatori", sicuro("listaGiocatori", async (data) => {
            const stanzaId = data?.["stanzaId"] || user.data?.referenceStanza;
            const stanza = await Stanze.get(stanzaId);
            if (!stanza) return;
            server.to(stanzaId).emit("listaGiocatoriAggiornamento", {
                giocatori: stanza.classifica().map(giocatore => giocatore.toJSON())
            });
        }));

        user.on("aggiornaAttesaRisposta", sicuro("aggiornaAttesaRisposta", async (data) => {
            const stanzaId = data?.["stanzaId"] || user.data?.referenceStanza;
            const stanza = await Stanze.get(stanzaId);
            if (!stanza) return;
            inviaAttesaRisposte(stanza);
        }));

        /*
         * Rete di sicurezza contro la schermata rimasta indietro.
         *
         * Capitava (e capitava spesso) che uno restasse fermo in lobby mentre
         * gli altri erano gia al turno dopo: bastava ricaricare la pagina, ma
         * e' brutto e non e' colpa di chi gioca. Succede quando un evento
         * (roundIniziato, fineTurno...) parte mentre quel socket e' morto o
         * si sta riconnettendo: il server lo manda una volta sola e chi non
         * c'era in quel momento non lo riceve piu.
         *
         * Qui il client dice ogni tanto "sto mostrando questa schermata"; se
         * non e' una di quelle che ci aspettiamo per lo stato attuale della
         * stanza, gli ributtiamo addosso lo stato vero e si rimette in pari
         * da solo. Se invece e' tutto a posto non rispondiamo proprio, cosi
         * il giro non costa niente.
         *
         * Se la stanza non esiste piu NON mandiamo stanzaChiusa: una lettura
         * andata storta butterebbe fuori un giocatore che stava benissimo.
         */
        user.on("__sincronizza__", sicuro("__sincronizza__", async (data) => {
            const adesso = Date.now();
            if (adesso - (user.data.ultimaSincronizzazione || 0) < PAUSA_SINCRONIZZA) return;
            user.data.ultimaSincronizzazione = adesso;

            const stanzaId = data?.["id"] || user.data?.referenceStanza;
            const vista = String(data?.["vista"] || "");
            if (!stanzaId || !vista) return;

            let stanza = await Stanze.get(stanzaId);
            if (!stanza) return;

            /*
             * Prima di giudicare il client, controlliamo la stanza: se tutti
             * quelli che dovevano rispondere hanno risposto ma lo stato e'
             * rimasto a CHOOSING_CARDS, il bloccato non e' il giocatore, e'
             * la stanza. In quel caso avanza e lo dice a tutti.
             */
            if (stanza.stato === StatoStanza.CHOOSING_CARDS
                && stanza.giocatori.size > 1
                && (stanza.round?.risposte?.size ?? 0) >= stanza.giocatori.size - 1) {
                const esito = await Stanze.mutate(stanzaId,
                    (attuale) => attuale.sincronizzaStato() ? true : NESSUNA_MODIFICA);
                if (esito?.stanza) stanza = esito.stanza;
                if (esito?.risultato) {
                    const tutti = await server.in(stanzaId).fetchSockets();
                    await emitStatoStanza(stanza, ...tutti);
                    console.log("Stanza sbloccata dalla sincronizzazione => " + stanzaId);
                    return;
                }
            }

            const giocatore = giocatoreDi(user, stanza);
            if (vistaAttesa(stanza, giocatore).includes(vista)) return;

            console.log("Riallineo " + (giocatore?.username || "un giocatore")
                + " (era su " + vista + ") nella stanza " + stanzaId);
            await emitStatoStanza(stanza, user);
            inviaListe(stanza);
            inviaAttesaRisposte(stanza);
        }));

        user.on("aggiornaChat", sicuro("aggiornaChat", async (data) => {
            const stanzaId = data?.["stanzaId"] || user.data?.referenceStanza;
            const stanza = await Stanze.get(stanzaId);
            if (!stanza) return;
            const sockets = await server.in(stanzaId).fetchSockets();
            for (const socket of sockets)
                socket.emit("aggiornamentoChat", {
                    chat: stanza.chat?.messaggi ?? [],
                    renderAll: !!user.data?.giocatoreId && socket.data?.giocatoreId === user.data.giocatoreId
                });
        }));

        user.on("messaggioChat", sicuro("messaggioChat", async (data) => {
            const stanzaId = data?.["id"] || user.data?.referenceStanza;
            const giocatoreId = user.data?.giocatoreId;
            if (!stanzaId) return;

            const esito = await Stanze.mutate(stanzaId, (stanza) => {
                const risultato = stanza.scriviInChat(data?.["message"], giocatoreId);
                return risultato === false ? NESSUNA_MODIFICA : risultato;
            });
            if (!esito || !esito.risultato) return;

            server.to(stanzaId).emit("aggiornamentoChat", {
                chat: esito.risultato,
                renderAll: false
            });
        }));

        user.on("aggiungiMazzo", sicuro("aggiungiMazzo", async (data) => {
            const stanzaId = data?.["id"] || user.data?.referenceStanza;
            if (!stanzaId) return;

            const esito = await Stanze.mutate(stanzaId, (stanza) => {
                const risultato = stanza.modificaMazzo(data?.["packs"]);
                return risultato === false ? NESSUNA_MODIFICA : risultato;
            });

            if (esito && esito.risultato) {
                user.emit("mazzoAggiunto");
                console.log("Mazzo cambiato nella stanza => " + stanzaId);
            } else {
                // un "non mi piacciono" e basta non aiuta nessuno a capire
                // cosa fare: se il problema e' il contenuto lo diciamo
                let motivo = null;
                try { motivo = Mazzo.problemaMazzo(...(Array.isArray(data?.["packs"]) ? data["packs"] : [])); }
                catch { motivo = null; }
                user.emit("mazzoErrore", {
                    message: motivo
                        || "Non riesco a cambiare i mazzi adesso: a partita iniziata non si puo' piu fare"
                });
            }
        }));

        user.on("segnala", sicuro("segnala", async (data) => {
            if (!archivioSegnalazioni) return user.emit("segnalazioneEsito", { ok: false });

            const adesso = Date.now();
            if (adesso - (user.data.ultimaSegnalazione || 0) < PAUSA_SEGNALAZIONI)
                return user.emit("segnalazioneEsito", { ok: false, messaggio: "Aspetta un attimo prima di segnalare ancora" });
            user.data.ultimaSegnalazione = adesso;

            const stanzaId = data?.["id"] ?? user.data?.referenceStanza;
            const righe = normalizzaRighe(data?.["elementi"], {
                stanzaId: stanzaId,
                giocatore: user.data?.referenceGiocatore?.username,
                nota: data?.["nota"]
            });

            if (!righe.length)
                return user.emit("segnalazioneEsito", { ok: false, messaggio: "Non hai selezionato niente da segnalare" });

            await archivioSegnalazioni.aggiungi(righe);
            console.log("Segnalazioni ricevute => " + righe.length + " da " + stanzaId);
            user.emit("segnalazioneEsito", { ok: true, quante: righe.length });
        }));

        /*
         * Frasi e completamenti NUOVI proposti dai giocatori. Stessa tabella
         * delle segnalazioni, tipi diversi (suggerimento_*): li' dentro
         * restano separati e li si spunta allo stesso modo quando entrano
         * davvero nel gioco.
         */
        user.on("suggerisci", sicuro("suggerisci", async (data) => {
            if (!archivioSegnalazioni) return user.emit("suggerimentoEsito", { ok: false });

            const adesso = Date.now();
            if (adesso - (user.data.ultimoSuggerimento || 0) < PAUSA_SEGNALAZIONI)
                return user.emit("suggerimentoEsito", { ok: false, messaggio: "Aspetta un attimo prima di mandarne altri" });
            user.data.ultimoSuggerimento = adesso;

            const stanzaId = data?.["id"] ?? user.data?.referenceStanza;
            const righe = normalizzaRighe(data?.["elementi"], {
                stanzaId: stanzaId,
                giocatore: user.data?.referenceGiocatore?.username,
                nota: data?.["nota"]
            }, TIPI_SUGGERIMENTO);

            if (!righe.length)
                return user.emit("suggerimentoEsito", { ok: false, messaggio: "Non hai scritto niente da suggerire" });

            await archivioSegnalazioni.aggiungi(righe);
            console.log("Suggerimenti ricevuti => " + righe.length + " da " + stanzaId);
            user.emit("suggerimentoEsito", { ok: true, quante: righe.length });
        }));

        user.on("webrtcOfferta", (data) => {
            if (!data?.targetSocketId) return;
            server.to(data['targetSocketId']).emit("webrtcRiceviOfferta", {
                signal: data.signal,
                callerId: user.id
            });
        });

        user.on("webrtcRisposta", (data) => {
            if (!data?.callerSocketId) return;
            server.to(data['callerSocketId']).emit("webrtcRiceviRisposta", {
                signal: data.signal,
                responderSocketId: user.id
            });
        });

        user.on("lasciaStanza", sicuro("lasciaStanza", async (data) => {
            const stanzaId = data?.["id"] ?? user.data?.referenceStanza;
            const giocatoreId = data?.["giocatore"] ?? user.data?.giocatoreId;
            user.emit("stanzaLasciata");
            if (!stanzaId || !giocatoreId) return;

            const esito = await Stanze.mutate(stanzaId, (stanza) => {
                const risultato = stanza.eliminaGiocatore(giocatoreId);
                if (risultato === false) return NESSUNA_MODIFICA;
                stanza.sincronizzaStato();
                return risultato;
            });
            if (!esito || !esito.risultato) return;

            user.leave(stanzaId);
            console.log("Giocatore ha abbandonato la Stanza => " + stanzaId);
            const sockets = await server.in(stanzaId).fetchSockets();
            aggiornaReference(esito.stanza, sockets);
            await emitStatoStanza(esito.stanza, ...sockets);
            inviaListe(esito.stanza);
            inviaAttesaRisposte(esito.stanza);
        }));

        user.on("disconnect", sicuro("disconnect", async () => {
            const giocatoreId = user.data?.giocatoreId || user.data?.referenceGiocatore?.id;
            const socketMorto = user.id;
            let stanzaId = user.data?.referenceStanza;
            if (!giocatoreId) return;
            if (!stanzaId) stanzaId = Stanza.trovaDaGiocatore(giocatoreId, await Stanze.values());
            if (!stanzaId) return;

            user.leave(stanzaId);

            const stanza = await Stanze.get(stanzaId);
            const giocatore = stanza?.trovaGiocatore(giocatoreId);
            if (!giocatore) return;

            // Il disconnect di un socket morto arriva SEMPRE dopo che il client si e'
            // gia riconnesso: il server se ne accorge solo dopo pingInterval + pingTimeout.
            // Se nel frattempo il giocatore ha un socket nuovo, questo evento non lo
            // riguarda piu. Senza questo controllo veniva marcato offline e, tre minuti
            // dopo, buttato fuori dalla stanza mentre stava giocando.
            if (giocatore.socketId && giocatore.socketId !== socketMorto) return;
            if (await haAncoraUnSocket(stanzaId, giocatoreId, socketMorto)) return;

            try { await Stanze.setPresenza(giocatoreId, stanzaId, false, null, Date.now(), socketMorto); }
            catch {
                giocatore.online = false;
                try { await Stanze.set(stanzaId, stanza); } catch { /* ignora */ }
            }

            inviaListe(stanza);

            const attesa = setTimeout(async () => {
                try {
                    const stanzaDopo = await Stanze.get(stanzaId);
                    const giocatoreDopo = stanzaDopo?.trovaGiocatore(giocatoreId);
                    if (!stanzaDopo || !giocatoreDopo) return;
                    // rientrato nel frattempo (anche con un socket diverso): non si tocca
                    if (giocatoreDopo.isOnline()) return;
                    if (giocatoreDopo.socketId && giocatoreDopo.socketId !== socketMorto) return;
                    if (await haAncoraUnSocket(stanzaId, giocatoreId, socketMorto)) return;

                    const esito = await Stanze.mutate(stanzaId, (s) => {
                        const g = s.trovaGiocatore(giocatoreId);
                        if (!g || g.isOnline()) return NESSUNA_MODIFICA;
                        const risultato = s.eliminaGiocatore(giocatoreId);
                        if (risultato === false) return NESSUNA_MODIFICA;
                        s.sincronizzaStato();
                        return risultato;
                    });
                    if (!esito || !esito.risultato) return;

                    console.log("Giocatore rimosso per inattivita => " + stanzaId);
                    const sockets = await server.in(stanzaId).fetchSockets();
                    aggiornaReference(esito.stanza, sockets);
                    await emitStatoStanza(esito.stanza, ...sockets);
                    inviaListe(esito.stanza);
                    inviaAttesaRisposte(esito.stanza);
                } catch (innerError) {
                    console.error("Errore nel timeout disconnessione:", innerError?.message || innerError);
                }
            }, GRAZIA_DISCONNESSIONE);
            if (attesa.unref) attesa.unref();
        }));
    });

    (async () => cleanUp())();
};

module.exports = serverConfig;
