const base = document.getElementById("landpoint");
const socket = io({
    auth: {
        validation: fromBackEnd["token"],
        stanzaId: fromBackEnd["stanzaId"],
        userId: fromBackEnd["userId"],
        token: JSON.parse(localStorage.getItem("cucuRiduSettings") || "{}")["savingToken"] || null
    },
    tryAllTransports: true,
    transports: ["websocket", "polling"]
});
let referenceGiocatore;
let referenceStanza = "";

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

//Endpoints
socket.on("connect", () => {
    document.dispatchEvent(stateConnected);
    switch (fromBackEnd["action"]) {
        case "Crea": {
            socket.emit("creaStanza", {
                username: fromBackEnd["nome"],
                pfp: fromBackEnd["pfp"]
            });
            break;
        }
        case "Partecipa": {
            socket.emit("partecipaStanza", {
                username: fromBackEnd["nome"],
                id: fromBackEnd["stanzaId"],
                pfp: fromBackEnd["pfp"]
            });
        }
    }
    fromBackEnd["action"] = null;
});

socket.on("disconnect", () => document.dispatchEvent(stateDisconnected));

socket.on("reconnect", () => document.dispatchEvent(stateConnected));

socket.on("reconnect_attempt", () => document.dispatchEvent(stateDisconnected));

socket.on("reconnect_failed", () => {
    alert("Impossibile riconnettersi al server, STACCA STACCA!");
    lasciaStanza();
});

socket.on("connect_error", (err) => {
    switch(err.message) {
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
        case "xhr poll error" : {
            document.dispatchEvent(stateDisconnected);
            break;
        }
        case "websocket error" : {
            document.dispatchEvent(stateDisconnected);
            break;
        }
        default: {
            window.location.replace("/");
        }
    }
});

socket.on("confermaStanza", (data) => {
    const { reference, interroghi, primoRound } = data;
    referenceStanza = data["stanzaId"] || fromBackEnd["stanzaId"];
    referenceGiocatore = new GiocatoreInterface(reference);
    fetch("/saveGameReference", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: "include",
        body: JSON.stringify({
            userId: referenceGiocatore.id,
            stanzaId: referenceStanza
        })
    }).then((response) => response.json().then(async (result) => {
        if(result?.result) {
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
        }
        else navigateWithLoading("/");
    }));
});

socket.on("stanzaLasciata", lasciaStanza);

socket.on("stanzaChiusa", () => {
    alert("NOOOOOOO, la chiusura della stanza NOOOOOOO");
    lasciaStanza();
});

socket.on("aspettaAltri", (data) => {
    alert(data.message);
});

socket.on("impossibileAggiungersi", (error) => {
    alert(error.message);
    window.location.replace("/partecipaStanza");
});

socket.on("errore", (error) => {
    alert(error.message);
    window.location.replace("/");
});

socket.on("roundIniziato", async (data) => {
    const { chiStaInterrogando, stanza, reference, domanda } = data;
    if(reference) referenceGiocatore = new GiocatoreInterface(reference);
    if(stanza) referenceStanza = stanza
    await renderFragment(base, "choosingCards", {
        domanda: domanda,
        risposte: !referenceGiocatore.interrogationRole ? referenceGiocatore.mazzo : null,
        chiStaInterrogando: chiStaInterrogando,
        animation: !isLoadScreen()
    });
});

socket.on("rispostaRegistrata", async () => {
    await renderFragment(base, "waitWinner", {
        stanzaId: referenceStanza
    });
});

socket.on("giaRegistrata", (data) => {
    alert(data.message);
});

socket.on("sceltaVincitore", async (data) => {
    const { reference, stanza, domanda, chiInterroga, risposte } = data;
    if(reference) referenceGiocatore = new GiocatoreInterface(reference);
    if(stanza) referenceStanza = stanza
    await renderFragment(base, "chooseWinner", {
        domanda: domanda,
        risposte: risposte,
        chiStaInterrogando: chiInterroga,
        animation: !isLoadScreen(),
        staiInterrogando: chiInterroga.id === referenceGiocatore.id
    });
});

socket.on("fineTurno", async (data) => {
    const { reference, vincitore, domanda, risposte } = data;
    if(reference) referenceGiocatore = new GiocatoreInterface(reference);
    await renderFragment(base, "showWinner", {
        domanda: domanda,
        risposte: risposte,
        animation: !isLoadScreen(),
        interroghi: vincitore.id === referenceGiocatore.id,
        vincitore: vincitore
    });
});

socket.on("partitaTerminata", async (data) => {
    const { classifica } = data;
    const puntiMassimi = classifica[0]?.punti || 0;
    await renderFragment(base, "endGame", {
        classifica: classifica,
        primoPosto: classifica.filter(giocatore => giocatore.punti >= puntiMassimi),
        puntiMassimi: puntiMassimi,
        idPrimoGiocatore: classifica[0].id
    });
});