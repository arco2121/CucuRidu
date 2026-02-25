const packPanel = document.getElementById("selectPacks");
const confirmPacks = document.getElementById("confirmPacks");
const sectionPacks = document.getElementById("packs")
const customTile = document.getElementById("customPack");
const inputFile = document.getElementById("inputFile");
const exitBtn = document.getElementById("exitBtn");
const tiles = document.querySelectorAll(".tile");
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
const packs = [];
let standardPacks = new Set();
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
    socket.emit("lasciaStanza");
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
            alert("La chiave per la connessione al server è sbagliata");
            return lasciaStanza();
        }
        case "ALREADY_CONNECTED" : {
            window.location.replace("/alreadyConnected?origin=" + fromBackEnd["token"]);
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
    alert(error.message);
    navigateWithLoading("/");
});

//GESTIONE MAZZI
tiles.forEach((tile) => {
    tile.addEventListener("click", () => {
        if(tile.classList.contains("selectedPack")) {
            if(tile.classList.contains("defaultPack")) standardPacks.add(tile.getAttribute("pack"));
            tile.classList.remove("selectedPack");
        } else {
            if(tile.classList.contains("defaultPack")) standardPacks.delete(tile.getAttribute("pack"));
            tile.classList.remove("selectedPack");
        }
    });
});

customTile.addEventListener("click", () => {
    if(customTile.classList.contains("selectedPack")) {
        packs.slice(0, packs.length);
    } else {
        inputFile.click();
    }
})

inputFile.addEventListener("cancel", () => {
    packs.slice(0, packs.length);
    customTile.classList.remove("selectedPack");
});

inputFile.addEventListener("change", async () => {
    const files = Array.from(inputFile.files);
    if(files.length === 0) {
        packs.slice(0, packs.length);
        customTile.classList.remove("selectedPack");
        return;
    }
    try {
        const mazzi = files.map(async (file) => {
            return { name: file.name, content: await readText(file) };
        });
        const risultatiMazzi = await Promise.all(mazzi);
        for (const mazzo of risultatiMazzi) {
            const check = (mazzo.name.includes(".cucuridupack") || mazzo.name.includes(".json"))
                && (JSON.parse(mazzo.content)["frasi"] !== null && JSON.parse(mazzo.content)["completamenti"] !== null);
            if(check)
                packs.push(JSON.parse(mazzo.content));
            else
                throw new Error(`Ma ce la fai? Hai una malattia grave? Dei cormosomi di troppo su per il culo? ${mazzo.name} non è un mazzo valido, pirla!`)
        }
    } catch (error) {
        alert(error);
        packs.slice(0, packs.length);
        customTile.classList.remove("selectedPack");
    }
});

confirmPacks.addEventListener("click", () => {
    if(standardPacks.size === 0 && packs.length === 0)
        alert("Ma porchino il dio piccolino... devi selezionare qualcosa... NO?")
    else {
        socket.emit("aggiungiMazzo", {
            id: referenceStanza,
            packs: [...standardPacks.values(), ...packs]
        })
    }
});

exitBtn.addEventListener("click", () => {
    packPanel.dispatchEvent(hidePanel);
    sectionPacks.dispatchEvent(showPanel);
});

leaveBtn?.addEventListener("click", () => socket.emit("lasciaStanza", {
    id: referenceStanza
}));

document.dispatchEvent(preventBack);