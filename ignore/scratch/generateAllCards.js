const fs = require('node:fs');
const { join } = require("node:path");

/*
 * Come si trasforma una riga di testo in carta:
 *
 *   frasi         -> [testo, numeroDiSpaziVuoti]   (il _ conta gli spazi)
 *   completamenti -> testo e basta
 *
 * Prima la regola dell'underscore veniva applicata a TUTTI i file: un
 * completamento che conteneva un _ diventava una coppia [testo, 1] e in
 * partita compariva come "testo,1", cioe' la carta con la virgola in mezzo.
 */
const eUnFileDiFrasi = (nomeFile) => /frasi/i.test(nomeFile);

const rigaInCarta = (riga, perFrasi) => {
    const testo = riga[0]?.toUpperCase() + riga.slice(1);
    if (!perFrasi) return testo;
    const spazi = (riga.match(/_/g) || []).length;
    return spazi !== 0 ? [testo, spazi] : testo;
};


const generateCards = () => {
    try {
        const basePath = join(__dirname, "/raw/cards");

        const groups = fs.readdirSync(basePath, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);

        for (const group of groups) {
            const groupDir = join(basePath, group);
            const files = fs.readdirSync(groupDir).filter(file => file.endsWith(".txt"));

            for (const file of files) {
                const lines = fs.readFileSync(join(groupDir, file), "utf-8")
                    .split("\n").map(line => line.trim());

                const perFrasi = eUnFileDiFrasi(file);
                let array = [];
                for (const line of lines) {
                    if (!line) continue;
                    array.push(rigaInCarta(line, perFrasi));
                }

                const outputDir = join(__dirname, "..", "../application/include/cards/" + group + "/");
                fs.mkdirSync(outputDir, {
                    recursive: true,
                });
                fs.writeFileSync(join(outputDir, file.replace(".txt", ".json")), JSON.stringify(array));
            }
            console.log(`Generated JSON for group: ${group}`);
        }
        return true;
    } catch (error) {
        console.log(`Error: ${error}`);
        return false;
    }
};

const result = generateCards();
console.log(`Result => ${result}`);