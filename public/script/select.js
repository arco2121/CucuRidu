const readText = async (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("Errore durante la lettura del file"));
        reader.readAsText(file);
    });
};
const tiles = document.querySelectorAll(".tile");
const confirmPacks = document.getElementById("confirmPacks");
const customTile = document.getElementById("customPack");
const inputFile = document.getElementById("inputFile");
const packs = [];
let standardPack = false;

document.addEventListener("DOMContentLoaded", () => {
    tiles.forEach((tile) => {
        tile.addEventListener("click", () => {
            if(tile.classList.contains("selectedPack")) {
                if(tile.id !== customTile.id) standardPack = false;
                tile.classList.remove("selectedPack");
            } else {
                if(tile.id !== customTile.id) standardPack = true;
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
        if(!standardPack && packs.length === 0)
            alert("") //TODO messaggio silly per non aver selezionato un cazzo
        else
            window.location.href = "/creaStanza?packs=" + JSON.stringify([standardPack, ...packs]);
    })

    document.dispatchEvent(unloadScreen);
})