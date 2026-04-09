document.addEventListener("DOMContentLoaded", () => {
    document.dispatchEvent(unloadScreen);

    const inputFrasi = document.getElementById("inputFrasi");
    const inputCompletamenti = document.getElementById("inputCompletamenti");

    document.getElementById("tileFrasi").addEventListener("click", () => inputFrasi.click());
    document.getElementById("tileCompletamenti").addEventListener("click", () => inputCompletamenti.click());

    const caricaMazzi = document.getElementById("caricaMazzi");
    const readText = async (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error("Errore durante la lettura del file"));
            reader.readAsText(file);
        });
    };
    const packsFrasi = [];
    const packsCompletamenti = [];

    inputFrasi.addEventListener("change", () => {
        const files = Array.from(inputFrasi.files);
        if (files.length === 0) return;
        if (files.filter(mazzo => !mazzo.name.includes("_frasi.txt")).length > 0) {
            alert(`Ma ce la fai? Hai una malattia grave? Dei cormosomi di troppo su per il culo? Alcuni non sono file validi, pirla!`);
            packsFrasi.splice(0, packsFrasi.length);
            return;
        }
        packsFrasi.push(...files);
    });
    inputFrasi.addEventListener("cancel", () => {
        packsFrasi.splice(0, packsFrasi.length);
    });

    inputCompletamenti.addEventListener("change", () => {
        const files = Array.from(inputCompletamenti.files);
        if (files.length === 0) return;
        if (files.filter(mazzo => !mazzo.name.includes("_completamenti.txt")).length > 0) {
            alert(`Ma ce la fai? Hai una malattia grave? Dei cormosomi di troppo su per il sedere? Alcuni non sono file validi, pirla!`);
            packsCompletamenti.splice(0, packsCompletamenti.length);
            return;
        }
        packsCompletamenti.push(...files);
    });
    inputCompletamenti.addEventListener("cancel", () => {
        packsCompletamenti.splice(0, packsCompletamenti.length);
    });

    caricaMazzi.addEventListener("click", async () => {
        try {
            if (packsCompletamenti.length !== packsFrasi.length || packsCompletamenti.length + packsFrasi.length === 0)
                throw new Error("Teso, magari il numero di ambo frasi e completamenti deve essere uguale");

            const risultatiMazzi = [];
            for (const pack of packsFrasi) {
                const name = pack.name.split("_")[0];
                const file = packsCompletamenti.find(file => file.name.startsWith(name));

                if (!file) throw new Error("A quanto pare alcuni mazzi non hanno i completamenti con lo stesso nome delle frasi :(");

                risultatiMazzi.push([
                    await readText(pack),
                    await readText(file),
                    name
                ]);
                packsCompletamenti.splice(packsCompletamenti.indexOf(file), 1);
            }

            const json = await (await fetch("/createPack", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(risultatiMazzi)
            })).json();

            if (!json.success) throw new Error("A quanto pare al server non gli va bene, mi spiace carissimo");

            const mazzi = JSON.parse(json.packs);
            for (const pack of mazzi) {
                const blob = new Blob([JSON.stringify(pack)], {type: "application/json"});
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = pack["name"] + ".json";
                link.click();
            }
        } catch (e) {
            alert(e.message)
        }
    });
});