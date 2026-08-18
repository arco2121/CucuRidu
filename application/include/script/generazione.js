const fs = require("fs");
const path = require("path");
const alphabet = "QWERTYUIOPASDFGHJKLZXCVBNM1234567890qwertyuiopasdfghjklzxcvbnm@#!£$%&/";
const pfpPathServer = './public/assets/pfps/';
const pfpPath = '/assets/pfps/';

const generateId = async (length, memory = new Set()) => {
    let code = "";
    const utilize = length <= 7 ? alphabet.slice(0, alphabet.indexOf("0")) : alphabet;
    length = length > utilize.length ? utilize.length : length;
    do {
        code = "";
        for (let i = 0; i < length; i++) {
            let index;
            do {
                index = Math.floor(Math.random() * utilize.length);
            } while (utilize[index] === code[i - 1]);

            code += utilize[index];
        }
    } while (await memory.has(code));
    await memory.add(code);
    return code;
}

const getknownPacks = () => {
    const dirs = fs.readdirSync(path.join(__dirname, "../cards/"), { withFileTypes: true });
    return dirs.filter(dir => dir.isDirectory()).map(dir => dir.name);
};

/*
 * Generazione Nome Casuale
 *
 * names.json versione 2:
 *   names:      { nome, genere }  con genere m | f | n | p
 *   adjectives: { m, f, n, p }    n = forma neutra, quella con l'asterisco
 * L'aggettivo viene scelto nella forma che concorda col genere del nome, cosi
 * non serve piu l'asterisco per cavarsela: "Petunia Stronza" invece di
 * "Petunia Stronz*". Il vecchio formato a liste di stringhe continua a
 * funzionare, viene trattato come tutto neutro.
 */
let datiNomi = null;

const caricaNomi = () => {
    if (datiNomi) return datiNomi;
    try {
        const filePath = path.join(__dirname, '../names/names.json');
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        datiNomi = {
            names: (data.names || [])
                .map(n => typeof n === "string" ? { nome: n, genere: "n" } : n)
                .filter(n => n && n.nome),
            adjectives: (data.adjectives || [])
                .map(a => typeof a === "string" ? { n: a, m: a, f: a, p: a } : a)
                .filter(Boolean)
        };
    } catch (error) {
        console.error('Errore durante la lettura del file JSON:', error.message);
        datiNomi = { names: [], adjectives: [] };
    }
    return datiNomi;
};

const scegliACaso = (lista) => lista[Math.floor(Math.random() * lista.length)];

const generateName = () => {
    const dati = caricaNomi();
    if (!dati.names.length) return "Giocatore Anonimo";

    const nome = scegliACaso(dati.names);
    if (!dati.adjectives.length) return nome.nome;

    const aggettivo = scegliACaso(dati.adjectives);
    const genere = ["m", "f", "n", "p"].includes(nome.genere) ? nome.genere : "n";
    const forma = aggettivo[genere] || aggettivo.n || aggettivo.m || aggettivo.f || "";

    return (nome.nome + " " + forma).trim();
}

const translateToPack = (packs) => {
    try {
        const results = [];
        for (const stringa of packs) {
            if(typeof stringa !== "string") {
                results.push(stringa);
                continue;
            }
            const lines = stringa.split(/\r?\n/).filter(line => line.trim() !== "");
            let array = [];
            for (let line of lines) {
                line = line.trim();
                const string = line[0]?.toUpperCase() + line.slice(1);
                const completamenti = (line.match(/_/g) || []).length;
                array.push(completamenti !== 0 ? [
                    string,
                    completamenti,
                ] : string)
            }
            results.push(array);
        }
        return results;
    } catch (error) {
        console.log(error)
        return false;
    }
};

const contaPfp = (cartella) => {
    try {
        const fileJpg = fs.readdirSync(cartella)
            .filter(file => path.extname(file).toLowerCase() === '.jpg')
            .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

        const totale = fileJpg.length;
        if (totale === 0) return 0;

        fileJpg.forEach((nome, i) => {
            const vecchioPath = path.join(cartella, nome);
            const tempPath = path.join(cartella, `TEMP_${i}_${Date.now()}.tmp`);
            fs.renameSync(vecchioPath, tempPath);
        });

        const fileTemp = fs.readdirSync(cartella)
            .filter(file => file.endsWith('.tmp'))
            .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

        fileTemp.forEach((nome, i) => {
            const vecchioPath = path.join(cartella, nome);
            const nuovoPath = path.join(cartella, `${i + 1}.jpg`);
            fs.renameSync(vecchioPath, nuovoPath);
        });

        return totale;
    } catch (error) {
        console.error(error);
        return 0;
    }
};

const pfpNumber = contaPfp(pfpPathServer);

const generatePfp = () => {
    let rdmNumber = Math.round(Math.random() * (pfpNumber - 1) + 1);
    return pfpPath + rdmNumber + ".jpg";
}

const getAllPfp = () => Array.from({ length: pfpNumber }, (v, i) => `${pfpPath}${i + 1}.jpg`);

const getIcon = (defaultIcon) => String("/assets/icon_imgs/" + (defaultIcon ? 1 : Math.floor(Math.random() * (22 - 1) + 1)) + ".png");

module.exports = { generateId, generatePfp, generateName, getIcon, getAllPfp, getknownPacks, translateToPack };
