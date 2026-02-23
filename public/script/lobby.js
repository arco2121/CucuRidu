const packPanel = document.getElementById("selectPacks");
const confirmPacks = document.getElementById("confirmPacks");
const sectionPacks = document.getElementById("packs")
const customTile = document.getElementById("customPack");
const inputFile = document.getElementById("inputFile");
const exitBtn = document.getElementById("exitBtn");
const tiles = document.querySelectorAll(".tile");
const base = document.getElementById("landpoint");
const leaveBtn = document.getElementById("leaveBtn");
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
    fetch("/deleteGameReference", {
        credentials: 'include'
    }).then(async (response) => {
        const result = (await response.json())["result"];
        if(result) navigateWithLoading("/");
    });
};
const socket = io({
    auth: {
        token: fromBackEnd["token"],
        stanzaId: fromBackEnd["stanzaId"],
        userId: fromBackEnd["userId"]
    }
});

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

socket.on("confermaStanza", (data) => {
    const { reference } = data;
    referenceStanza = data["stanzaId"] || fromBackEnd["stanzaId"];
    referenceGiocatore = new GiocatoreInterface(reference);
    fetch("/saveGameReference", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
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
                throw new Error(`${mazzo.name} non è un mazzo valido`) //TODO Messaggio silly per errore nell'inserimento di un mazzo;
        }
    } catch (error) {
        alert(error);
        packs.slice(0, packs.length);
        customTile.classList.remove("selectedPack");
    }
});

confirmPacks.addEventListener("click", () => {
    if(standardPacks.size === 0 && packs.length === 0)
        alert("") //TODO messaggio silly per non aver selezionato un cazzo
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