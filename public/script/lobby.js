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