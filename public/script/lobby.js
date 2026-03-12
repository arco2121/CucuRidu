const base = document.getElementById("landpoint");
const socket = io({
    auth: {
        validation: fromBackEnd["token"],
        stanzaId: fromBackEnd["stanzaId"],
        userId: fromBackEnd["userId"],
        token: JSON.parse(localStorage.getItem("cucuRiduSettings") || "{}")["savingToken"] || null
    },
    transports: ["websocket", "polling"]
});
let referenceGiocatore;
let referenceStanza = "";

const lasciaStanza = () => {
    fetch("/deleteGameReference", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: "include",
        body: JSON.stringify({
            token: JSON.parse(localStorage.getItem("cucuRiduSettings") || "{}")["savingToken"] || null
        })
    }).then(async (response) => {
        const result = (await response.json())["result"];
        if(result) {
            const settings = JSON.parse(localStorage.getItem("cucuRiduSettings") || "{}");
            localStorage.setItem("cucuRiduSettings", JSON.stringify({
                ...settings,
                savingToken: null
            }));
            navigateWithLoading("/");
        }
    });
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

socket.on("connect_error", (err) => {
    switch(err.message) {
        case "SESSION_EXPIRED" : {
            alert("La tua sessione è scaduta o la stanza è stata chiusa. Come al solito in ritardo");
            return lasciaStanza();
        }
        case "INVALID_KEY" : {
            alert("La chiave per la connessione al server è sbagliata o scaduta");
            return lasciaStanza();
        }
        case "ALREADY_CONNECTED" : {
            window.location.replace("/error?alreadyConnected=true");
            break;
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
    }).then((response) => response.json().then((result) => {
        if(result?.result) {
            renderFragment(base, "wait", {
                stanzaId: referenceStanza,
                interroghi: interroghi || false,
                primoRound: primoRound || true
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

socket.on("errore", (error) => {
    alert(error.message);
    navigateWithLoading("/");
});

socket.on("roundIniziato", async (data) => {
    const { chiStaInterrogando, stanza, reference, domanda } = data;
    if(reference) referenceGiocatore = new GiocatoreInterface(reference);
    if(stanza) referenceStanza = stanza
    await renderFragment(base, "showTurn", {
        domanda: domanda,
        risposte: !referenceGiocatore.interrogationRole ? referenceGiocatore.mazzo : null,
        chiStaInterrogando: chiStaInterrogando
    });
});

socket.on("rispostaRegistrata", (data) => {
    alert(data.message);
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
        staiInterrogando: chiInterroga.id === referenceGiocatore.id
    });
});

window.addEventListener("offline", () => socket.disconnect());
window.addEventListener("online", () => {
    if(!socket.connected)
        socket.connect();
});

document.addEventListener("DOMContentLoaded", () => {
    const game_section = document.getElementById("game_section");
    const pauseMenu = document.getElementById("pauseMenu");
    const leaveBtn = document.getElementById("leaveBtn");
    const exitPauseBtn = document.getElementById("exitPauseBtn");
    const menuBtn = document.getElementById("menuBtn");
    const codiceStanzaPause = document.getElementById("codiceStanzaPause");

    leaveBtn.addEventListener("click", () => socket.emit("lasciaStanza", {
        id: referenceStanza
    }));

    exitPauseBtn.addEventListener("click", () => {
        pauseMenu.dispatchEvent(hidePanel);
        game_section.dispatchEvent(showPanel);
    });

    menuBtn.addEventListener("click", () => {
        socket.emit("listaGiocatori", {
            stanzaId: referenceStanza
        });
        game_section.dispatchEvent(hidePanel);
        codiceStanzaPause.textContent = referenceStanza;
        pauseMenu.dispatchEvent(showPanel);
    });
});

document.dispatchEvent(preventBack);
document.dispatchEvent(unloadScreen);