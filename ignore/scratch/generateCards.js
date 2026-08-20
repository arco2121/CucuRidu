/*
    Simple script to generate the json resources of the cards from the raw txt file
*/
const fs = require('node:fs');
const {join} = require("node:path");

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


const generateCards = (group, files) => {
    try {
        for (const file of files) {
            const lines = fs.readFileSync(join(__dirname, "/raw/cards/" + group + "/" + file), "utf-8")
                .split("\n").map(line => line.trim());
            const perFrasi = eUnFileDiFrasi(file);
            let array = [];
            for (const line of lines) {
                if(!line) continue;
                array.push(rigaInCarta(line, perFrasi));
            }
            fs.mkdirSync(join(__dirname, "..", "../application/include/cards/" + group + "/"), {
                recursive: true,
            });
            fs.writeFileSync(join(__dirname, "..", "../application/include/cards/" + group + "/" + file.replace(".txt", ".json")), JSON.stringify(array));
        }
        return true;
    } catch (error) {
        console.log(error)
        return false;
    }
};

const data = [];
process.argv.slice(2).forEach((val, index) => {
    const input =  index === 0 ? (val || null) : (val.includes(".txt") ? val : null);
    data.push(input);
});
const groupName = data[0] || "standard";
const files = [data[1] || "frasi.txt", data[2] || "completamenti.txt"];

const result = generateCards(groupName, files);
console.log("Result => " + result);