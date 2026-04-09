off("mazzoAggiunto");
off("mazzoErrore");

const confirmPacks = document.getElementById("confirmPacks");
const sectionDefault = document.getElementById("game_section");
const customTile = document.getElementById("customPack");
const inputFile = document.getElementById("inputFile");
const customFileName = document.getElementById("customFileName");
const customImg = document.getElementById("customPackImg");
const exitBtn = document.getElementById("exitPacksBtn");
const tiles = document.querySelectorAll(".tile");
const packsPanel = document.getElementById("packsPanel");
const packs = [];
let standardPacks = new Set();

const readText = async (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("Errore durante la lettura del file"));
        reader.readAsText(file);
    });
};

const resetCustomView = () => {
    customTile.classList.remove("selectedPack");
    customImg.src = "/assets/packs/personalizzato.jpg";
    customFileName.classList.add("hidden_text");
    customFileName.innerText = "Personalizzati";
    inputFile.value = "";
};

customTile.addEventListener("click", () => {
    if (customTile.classList.contains("selectedPack")) {
        packs.splice(0, packs.length);
        resetCustomView();
    } else {
        inputFile.click();
    }
});

tiles.forEach((tile) => {
    if (tile !== customTile) {
        tile.addEventListener("click", () => {
            if (!tile.classList.contains("selectedPack")) {
                if (tile.classList.contains("normalPack")) standardPacks.add(tile.getAttribute("pack"));
                tile.classList.add("selectedPack");
            } else {
                if (tile.classList.contains("normalPack")) standardPacks.delete(tile.getAttribute("pack"));
                tile.classList.remove("selectedPack");
            }
        });

        if(tile.classList.contains("standard"))
            tile.click();
    }
});

inputFile.addEventListener("cancel", () => {
    packs.splice(0, packs.length);
    resetCustomView();
});

inputFile.addEventListener("change", async () => {
    const files = Array.from(inputFile.files);
    packs.splice(0, packs.length);
    if (files.length === 0) {
        packs.splice(0, packs.length);
        resetCustomView();
        return;
    }
    try {
        const mazzi = files.map(async (file) => {
            return {name: file.name, content: await readText(file)};
        });
        const risultatiMazzi = await Promise.all(mazzi);
        for (const mazzo of risultatiMazzi) {
            const check = mazzo.name.includes(".json") && JSON.parse(mazzo.content)["frasi"] !== null && JSON.parse(mazzo.content)["completamenti"] !== null;
            if (check)
                packs.push(JSON.parse(mazzo.content));
            else
                throw new Error(`Ma ce la fai? Hai una malattia grave? Dei cormosomi di troppo su per il culo? ${mazzo.name} non è un mazzo valido, pirla!`);
        }
        customTile.classList.add("selectedPack");
        customFileName.innerText = files.map(f => f.name).join(', ');
        customFileName.classList.remove("hidden_text");
        customImg.src = "/assets/packs/personalizzato_empty.jpg";

    } catch (error) {
        alert(error.message);
        packs.splice(0, packs.length);
        resetCustomView();
    }
});

confirmPacks.addEventListener("click", () => {
    if (standardPacks.size === 0 && packs.length === 0)
        alert("Ma porchino il dirimpetaio piccolino... devi selezionare qualcosa... NO?")
    else {
        emit("aggiungiMazzo", {
            id: referenceStanza,
            packs: [...standardPacks.values(), ...packs]
        });
    }
});

exitBtn.addEventListener("click", () => {
    packsPanel.dispatchEvent(hidePanel);
    sectionDefault.dispatchEvent(showPanel);
});

on("mazzoAggiunto", () => {
    packsPanel.dispatchEvent(hidePanel);
    sectionDefault.dispatchEvent(showPanel);
});

on("mazzoErrore", (data) => {
    alert(data.message);
    tiles.forEach(tile => {
        if (tile !== customTile) {
            tile.classList.remove("selectedPack");
            if(tile.classList.contains("standard"))
                tile.click();
        }
    });
    packs.splice(0, packs.length);
    resetCustomView();
});