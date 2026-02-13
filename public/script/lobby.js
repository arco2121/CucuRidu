const socket = io({
    auth: {
        token: fromBackEnd["token"],
        stanza: fromBackEnd["stanzaId"],
        userId: fromBackEnd["userId"]
    }
});
const base = document.getElementById("landpoint");
const fragmentsCache = {};
const renderFragment = async (page, params = {}) => {
    if(!isLoadScreen()) document.dispatchEvent(loadScreen);
    try {
        if(!fragmentsCache[page]) {
            const input = await fetch("/fragments/" + page + ".ejs");
            if(!input.ok) throw new Error("fragment not found");
            fragmentsCache[page] = await input.text();
        }
        return ejs.render(fragmentsCache[page], params);
    } catch (e) {
        console.error(e);
    }
    if(isLoadScreen()) document.dispatchEvent(unloadScreen);
}
let referenceGiocatore;
switch (fromBackEnd["action"]) {
    case "Crea": {
        socket.emit("creaStanza", {
            username: fromBackEnd["nome"],
            packs: fromBackEnd["packages"]
        });
        break;
    }
    case "Partecipa": {
        socket.emit("creaStanza", {
            username: fromBackEnd["nome"],
            id: fromBackEnd["stanzaId"]
        });
    }
}

socket.on("confermaStanza", (data) => {
    const { reference } = data;
    referenceGiocatore = new GiocatoriAdapt(reference);
    fetch("/saveGameReference", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: {
            userId: referenceGiocatore.id,
            stanzaId: fromBackEnd["stanzaId"]
        }
    }).then(async () => {
        base.innerHTML = await renderFragment("wait");
    });
});