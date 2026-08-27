const parametri = {
    validation: fromBackEnd["token"],
    stanzaId: fromBackEnd["stanzaId"],
    userId: fromBackEnd["userId"],
    token: JSON.parse(localStorage.getItem("cucuRiduSettings") || "{}")["savingToken"] || null
};
const receivers = {};

const initializeIO = () => {
    const socket = io({
        auth: parametri,
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionDelay: 300,
        reconnectionDelayMax: 4000,
        randomizationFactor: 0.5,
        reconnectionAttempts: Infinity,
        timeout: 20000
    });
    socket.on("disconnect", (motivo) => {
        if (motivo === "io server disconnect")
            setTimeout(() => { try { socket.connect(); } catch (e) {} }, 1000);
    });
    Object.keys(receivers).forEach(event => {
        if (event === "any") socket.onAny((name, data) => receivers["any"].forEach(cb => cb(data)));
        else receivers[event].forEach(cb => socket.on(event, cb));
    });
    return socket;
};

let controller = (() => {
    if('Worker' in window)
        return new Worker(fromBackEnd["scripts"] + '/game/socketController.js');
    else return initializeIO()
})();
if (controller instanceof Worker)
    controller.onerror = () => {
        controller.terminate();
        controller = initializeIO();
    };

const base = document.getElementById("landpoint");

//Controller
const on = (event = "default", callback = (data) => {}) => {
    if(controller instanceof Worker) {
        if(!receivers[event]) receivers[event] = [];
        receivers[event].push(callback);
    }
    else if(event === "any")
        controller.onAny((event, ...args) => callback(args[0]));
    else controller.on(event, callback);
}
const emit = (event = "deafult", params = {}) => {
    if(controller instanceof Worker)
        controller.postMessage({
            type: event,
            params: params
        });
    else controller.emit(event, params);
}
const off = (event) => {
    if(controller instanceof Worker)
        receivers[event] = null;
    else controller.off(event);
}
/**
 * Chiede al socket "sei davvero connesso?" invece di fidarsi ciecamente
 * degli eventi online/offline del browser (che sono solo lo stato di rete,
 * non lo stato vero di Socket.IO). Se e' gia connesso rifa scattare
 * doConnected subito; se non lo e' lo spinge a riconnettersi ORA invece di
 * aspettare il ping/pong naturale (fino a ~50s, vedi pingInterval/
 * pingTimeout lato server) — a spegnere davvero il pannello offline ci
 * pensa comunque il vero evento connect/reconnect qui sotto.
 */
const checkConnection = () => {
    if(controller instanceof Worker)
        controller.postMessage({ type: "__checkConnection__" });
    else if(controller) {
        if(controller.connected) document.dispatchEvent(stateConnected);
        else try { controller.connect(); } catch (e) {}
    }
}

if(controller instanceof Worker)
    controller.onmessage = (event) => {
        const { event: eventName, params } = event.data;
        if (receivers[eventName])
            for(const call of receivers[eventName])
                call(params);
    };

//Utility
let referenceGiocatore = new GiocatoreInterface(null);
let referenceStanza = "";
/*
 * Che schermata stiamo mostrando in questo momento. Non serve a disegnare
 * niente: serve solo a poterlo dire al server ogni tanto, che controlla se
 * combacia con lo stato vero della stanza (vedi la sincronizzazione in fondo
 * al file).
 */
let vistaCorrente = null;
// finita la partita la stanza non esiste piu: da li in poi non ha senso
// continuare a chiedere "sono in pari?"
let sincronizzazioneAttiva = true;
// la frase del round in corso, serve al pannello delle segnalazioni
let fraseCorrente = null;
const ricordaFrase = (domanda) => {
    const testo = Array.isArray(domanda) ? domanda[0] : domanda;
    if (typeof testo === "string" && testo.trim()) fraseCorrente = testo;
};
const lasciaStanza = () => {
    const settings = JSON.parse(localStorage.getItem("cucuRiduSettings") || "{}");
    const token = settings["savingToken"];
    settings["savingToken"] = null;
    localStorage.setItem("cucuRiduSettings", JSON.stringify(settings));

    const controller = new AbortController();
    setTimeout(() => controller.abort(), 5000);

    fetch("/deleteGameReference", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: "include",
        signal: controller.signal,
        body: JSON.stringify({
            token: token || null
        })
    }).catch(err => console.error(err))
        .finally(() => navigateWithLoading("/"));
};

//Listeners
on("connect", () => {
    emit('socketId');
    document.dispatchEvent(stateConnected);
    switch (fromBackEnd["action"]) {
        case "Crea": {
            emit("creaStanza", {
                username: fromBackEnd["nome"],
                pfp: fromBackEnd["pfp"]
            });
            break;
        }
        case "Partecipa": {
            emit("partecipaStanza", {
                username: fromBackEnd["nome"],
                id: fromBackEnd["stanzaId"],
                pfp: fromBackEnd["pfp"]
            });
        }
    }
    fromBackEnd["action"] = null;
});

on("disconnect", () => document.dispatchEvent(stateDisconnected));

on("reconnect", () => document.dispatchEvent(stateConnected));

// risposta di checkConnection() quando il worker conferma che il socket
// era gia connesso (non serve riconnettersi, basta aggiornare la UI)
on("__connectionCheck__", (data) => {
    if(data?.connected) document.dispatchEvent(stateConnected);
});

on("reconnect_attempt", () => document.dispatchEvent(stateDisconnected));

on("reconnect_failed", () => {
    // con i tentativi infiniti non dovrebbe piu succedere: se succede non
    // buttiamo fuori nessuno, mostriamo solo lo stato disconnesso
    document.dispatchEvent(stateDisconnected);
});

/**
 * Solo due errori sono davvero definitivi: la sessione scaduta e la chiave
 * sbagliata. Tutti gli altri sono problemi di rete temporanei e socket.io sta
 * gia riprovando. Prima il ramo default faceva location.replace("/"), quindi
 * un qualsiasi errore di trasporto passeggero (timeout, transport error,
 * server temporaneamente giu) sbatteva il giocatore fuori dalla partita: era
 * uno dei modi in cui la gente "si disconnetteva dal nulla".
 */
on("connect_error", (err) => {
    const messaggio = err?.message || String(err || "");
    switch(messaggio) {
        case "SESSION_EXPIRED" : {
            alert("La tua sessione è scaduta o la stanza è stata chiusa. Come al solito in ritardo");
            return lasciaStanza();
        }
        case "INVALID_KEY" : {
            alert("Impossibile riconnettersi al server, STACCA STACCA!");
            return lasciaStanza();
        }
        case "ALREADY_CONNECTED" : {
            window.location.replace("/error?alreadyConnected=true");
            break;
        }
        default: {
            console.warn("connect_error =>", messaggio);
            document.dispatchEvent(stateDisconnected);
        }
    }
});

on("confermaStanza", async (data) => {
    const { reference, interroghi, primoRound } = data;
    referenceStanza = data["stanzaId"] || fromBackEnd["stanzaId"];
    referenceGiocatore = new GiocatoreInterface(reference);
    // segnata subito, prima della fetch qui sotto: se quella ci mette troppo
    // non vogliamo che nel frattempo il giro di sincronizzazione continui a
    // dichiarare la schermata vecchia e a farsi riallineare di nuovo
    vistaCorrente = "wait";
    const result = await (await fetch("/saveGameReference", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: "include",
        body: JSON.stringify({
            userId: referenceGiocatore.id,
            stanzaId: referenceStanza
        })
    })).json();
    await renderFragment(base, "wait", {
        stanzaId: referenceStanza,
        interroghi: interroghi,
        primoRound: primoRound,
        seiMaster: referenceGiocatore.masterRole,
        animation: !isLoadScreen()
    });
    if(result.fallback) {
        const settings = JSON.parse(localStorage.getItem("cucuRiduSettings") || "{}");
        localStorage.setItem("cucuRiduSettings", JSON.stringify({
            ...settings,
            savingToken: result.fallback
        }));
    }
});

on("stanzaLasciata", () => {
    sincronizzazioneAttiva = false;
    lasciaStanza();
});

on("stanzaChiusa", () => {
    sincronizzazioneAttiva = false;
    alert("NOOOOOOO, la chiusura della stanza NOOOOOOO");
    lasciaStanza();
});

on("aspettaAltri", (data) => {
    alert(data.message);
});

on("impossibileAggiungersi", (error) => {
    alert(error.message);
    window.location.replace("/partecipaStanza");
});

on("errore", (error) => {
    alert(error.message);
    window.location.replace("/");
});

on("roundIniziato", async (data) => {
    const { chiStaInterrogando, stanza, reference, domanda } = data;
    if(reference) referenceGiocatore = new GiocatoreInterface(reference);
    if(stanza) referenceStanza = stanza
    ricordaFrase(domanda);
    vistaCorrente = "choosingCards";
    await renderFragment(base, "choosingCards", {
        domanda: domanda,
        risposte: !referenceGiocatore.interrogationRole ? referenceGiocatore.mazzo : null,
        chiStaInterrogando: chiStaInterrogando,
        animation: !isLoadScreen()
    });
});

on("rispostaRegistrata", async (data) => {
    const { stanzaId } = data;
    if(stanzaId) referenceStanza = stanzaId;
    vistaCorrente = "waitWinner";
    await renderFragment(base, "waitWinner", {
        stanzaId: referenceStanza
    });
});

on("giaRegistrata", (data) => {
    alert(data.message);
});

on("sceltaVincitore", async (data) => {
    const { reference, stanza, domanda, chiInterroga, risposte } = data;
    if(reference) referenceGiocatore = new GiocatoreInterface(reference);
    if(stanza) referenceStanza = stanza
    ricordaFrase(domanda);
    vistaCorrente = "chooseWinner";
    await renderFragment(base, "chooseWinner", {
        domanda: domanda,
        risposte: risposte,
        chiStaInterrogando: chiInterroga,
        animation: !isLoadScreen(),
        staiInterrogando: chiInterroga.id === referenceGiocatore.id
    });
});

on("fineTurno", async (data) => {
    const { reference, vincitore, domanda, risposte, tutteLeRisposte, giocatori } = data;
    if(reference) referenceGiocatore = new GiocatoreInterface(reference);
    ricordaFrase(domanda);
    vistaCorrente = "showWinner";
    await renderFragment(base, "showWinner", {
        domanda: domanda,
        risposte: risposte,
        tutteLeRisposte: tutteLeRisposte || [],
        giocatori: giocatori || [],
        animation: !isLoadScreen(),
        interroghi: vincitore.id === referenceGiocatore.id,
        vincitore: vincitore
    });
});

on("partitaTerminata", async (data) => {
    const { classifica } = data;
    const puntiMassimi = classifica[0]?.punti || 0;
    vistaCorrente = "endGame";
    sincronizzazioneAttiva = false;
    await renderFragment(base, "endGame", {
        classifica: classifica,
        primoPosto: classifica.filter(giocatore => giocatore.punti >= puntiMassimi),
        puntiMassimi: puntiMassimi,
        idPrimoGiocatore: classifica[0].id
    });
});

/* ---------------------------------------------------------------------------
 * Sincronizzazione della schermata
 *
 * Il server manda gli eventi di gioco (roundIniziato, fineTurno...) una volta
 * sola: chi in quel momento aveva il socket morto o in riconnessione non li
 * riceve piu e resta fermo alla schermata di prima - il classico "sono ancora
 * in lobby mentre gli altri stanno gia giocando", che si risolveva solo
 * ricaricando a mano.
 *
 * Qui diciamo al server, ogni tanto, che schermata stiamo mostrando. Se non
 * combacia con lo stato vero della stanza ci rimanda lo stato giusto e la
 * pagina si rimette in pari da sola, senza ricaricare. Se combacia il server
 * non risponde nemmeno.
 *
 * Non chiediamo niente a scheda nascosta (non serve a nessuno aggiornare una
 * pagina che non si sta guardando, e il telefono la congela comunque): al
 * ritorno pero' chiediamo subito, che e' proprio il momento in cui e' piu
 * probabile essersi persi qualcosa.
 * --------------------------------------------------------------------------- */
const INTERVALLO_SINCRONIZZAZIONE = 7000;

const sincronizzaVista = () => {
    if(!sincronizzazioneAttiva) return;
    if(!referenceStanza || !vistaCorrente) return;
    emit("__sincronizza__", {
        id: referenceStanza,
        vista: vistaCorrente
    });
};

setInterval(() => {
    if(document.hidden) return;
    sincronizzaVista();
}, INTERVALLO_SINCRONIZZAZIONE);

document.addEventListener("visibilitychange", () => {
    if(!document.hidden) sincronizzaVista();
});

// dopo una riconnessione il server manda gia lo stato da solo, ma se per
// qualche motivo non arriva questo lo richiede
on("connect", () => setTimeout(sincronizzaVista, 1000));
on("reconnect", () => setTimeout(sincronizzaVista, 1000));

if(controller instanceof Worker)
    controller.postMessage({
        type: "init",
        params: parametri
    });
