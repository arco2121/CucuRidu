const socket = io({
    auth: {
        token: fromBackEnd["token"],
        stanza: fromBackEnd["stanzaId"],
        userId: fromBackEnd["userId"]
    }
});
const base = document.getElementById("landpoint");
let referenceGiocatore;

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
    const stanzaId = data["stanzaId"] || fromBackEnd["stanzaId"];
    referenceGiocatore = new GiocatoriAdapt(reference);
    fetch("/saveGameReference", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userId: referenceGiocatore.id,
            stanzaId: stanzaId
        })
    }).then(async (response) => {
        const result = (await response.json())["result"];
        if(result === true) {
            await renderFragment(base, "wait", {
                stanzaId: stanzaId
            });
            document.dispatchEvent(unloadScreen);
        }
        else navigateWithLoading("/");
    });
});

socket.on("errore", (data) => {
    alert(data.message);
    navigateWithLoading("/");
});

window.addEventListener('beforeunload', (e) => {
    e.preventDefault();
    e.returnValue = '';
});