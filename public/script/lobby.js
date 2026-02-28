const base = document.getElementById("landpoint");
const game_section = document.getElementById("game_section");
const pauseMenu = document.getElementById("pauseMenu");

const leaveBtn = document.getElementById("leaveBtn");
const exitPauseBtn = document.getElementById("exitPauseBtn");

exitPauseBtn.addEventListener("click", () => {
    pauseMenu.dispatchEvent(hidePanel);
    game_section.dispatchEvent(showPanel);
})


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
});

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
    const { reference } = data;
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
    }).then(async (response) => {
        const result = (await response.json());
        if(result?.result) {
            await renderFragment(base, "wait", {
                stanzaId: referenceStanza
            });
            if(result.fallback) {
                const settings = JSON.parse(localStorage.getItem("cucuRiduSettings") || "{}");
                localStorage.setItem("cucuRiduSettings", JSON.stringify({
                    ...settings,
                    savingToken: result.fallback
                }));
            }
            document.dispatchEvent(unloadScreen);
        }
        else navigateWithLoading("/");
    });
});

socket.on("stanzaLasciata", lasciaStanza);

socket.on("stanzaChiusa", () => {
    alert("NOOOOOOO, la chiusura della stanza NOOOOOOO");
    lasciaStanza();
});

socket.on("errore", (error) => {
    alert(error.message);
    navigateWithLoading("/");
});

socket.on("roundIniziato", async (data) => {
    referenceGiocatore = new GiocatoreInterface(data["reference"]);
    const informazioniSuChiInterroga = new GiocatoreInterface(data["chiStaInterrogandoInfo"]);
    const domanda = data["domanda"];
    await renderFragment(base, "showTurn", {
        domanda: domanda,
        risposte: informazioniSuChiInterroga.interrogationRole ? referenceGiocatore.carte : null,
        informazioniSuChiInterroga: informazioniSuChiInterroga
    });
});

window.addEventListener("offline", () => socket.disconnect());
window.addEventListener("offline", () => {
    if(!socket.connected)
        socket.connect();
});

leaveBtn.addEventListener("click", () => socket.emit("lasciaStanza", {
    id: referenceStanza
}));

document.dispatchEvent(preventBack);