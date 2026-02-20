const socket = io({
    auth: {
        token: fromBackEnd["token"],
        stanzaId: fromBackEnd["stanzaId"],
        userId: fromBackEnd["userId"]
    }
});
const base = document.getElementById("landpoint");
const leaveBtn = document.getElementById("leaveBtn");
const lasciaStanza = () => {
    fetch("/deleteGameReference").then(async (response) => {
        const result = (await response.json())["result"];
        if(result) navigateWithLoading("/");
    });
};
let referenceGiocatore;
let referenceStanza = "";

leaveBtn?.addEventListener("click", () => socket.emit("lasciaStanza", {
    id: referenceStanza
}));

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

socket.on("confermaStanza", (data) => {
    const { reference } = data;
    referenceStanza = data["stanzaId"] || fromBackEnd["stanzaId"];
    referenceGiocatore = new GiocatoreInterface(reference);
    fetch("/saveGameReference", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userId: referenceGiocatore.id,
            stanzaId: referenceStanza
        })
    }).then(async (response) => {
        const result = (await response.json())["result"];
        if(result) {
            await renderFragment(base, "wait", {
                stanzaId: referenceStanza
            });
            document.dispatchEvent(unloadScreen);
        }
        else navigateWithLoading("/");
    });
});

socket.on("stanzaLasciata", lasciaStanza);

socket.on("errore", (error) => {
    alert(error.message);
    navigateWithLoading("/");
});

socket.on("connect_error", (err) => {
    switch(err.message) {
        case "SESSION_EXPIRED" : {
            alert("La tua sessione è scaduta o la stanza è stata chiusa."); //TODO Messaggio silly per la sessione che non vale più
            return lasciaStanza();
        }
        case "INVALID_KEY" : {
            alert("La chiave per la connessione al server è sbagliata");
            return lasciaStanza();
        }
    }
});