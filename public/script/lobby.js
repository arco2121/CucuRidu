const base = document.getElementById("landpoint");
const leaveBtn = document.getElementById("leaveBtn");
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

const readText = async (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("Errore durante la lettura del file"));
        reader.readAsText(file);
    });
};
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
        default: {
            alert("Errore inaspettato dal server");
            return lasciaStanza();
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

socket.on("errore", (error) => {
    alert(error);
    navigateWithLoading("/");
});

leaveBtn?.addEventListener("click", () => socket.emit("lasciaStanza", {
    id: referenceStanza
}));

document.dispatchEvent(preventBack);