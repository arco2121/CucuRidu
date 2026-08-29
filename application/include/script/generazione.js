const fs = require("fs");
const path = require("path");
const alphabet = "QWERTYUIOPASDFGHJKLZXCVBNM1234567890qwertyuiopasdfghjklzxcvbnm@#!£$%&/";
const pfpPathServer = './public/assets/pfps/';
const pfpPath = '/assets/pfps/';
const iconPathServer = './public/assets/icon_imgs/';
const iconPath = '/assets/icon_imgs/';

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
 * names.json versione 3:
 *   names:      { nome, genere, peso? }  con genere m | f | n | p | fp
 *   adjectives: { n, m, f, p, fp, peso? }    n = forma neutra, quella con l'asterisco
 *   fp = femminile plurale, per i nomi che sono un gruppo di sole donne
 *   (es. "Le Amazzoni Stronze" invece di "Le Amazzoni Stronzi").
 *   peso: quanto e' probabile che esca in un'estrazione, di default 1. Un
 *   nome/aggettivo "raro" ha un peso minore di 1 (es. 0.2 = circa 1 volta su
 *   5 rispetto a uno normale) invece di duplicare tutti gli altri per
 *   diluirlo: stesso risultato, ma senza gonfiare il file ne' limitarsi a
 *   rapporti interi. Il peso e' assente sulla stragrande maggioranza delle
 *   voci (equivale a 1), quindi manca quasi ovunque nel JSON.
 * L'aggettivo viene scelto nella forma che concorda col genere del nome, cosi
 * non serve piu l'asterisco per cavarsela: "Petunia Stronza" invece di
 * "Petunia Stronz*". Il vecchio formato a liste di stringhe continua a
 * funzionare, viene trattato come tutto neutro e peso 1.
 */
let datiNomi = null;

/** Precalcola i pesi cumulativi di una lista, per estrarre un elemento a caso ma pesato. */
const preparaEstrazione = (lista, pesoDi) => {
    let totale = 0;
    const cumulativi = lista.map(elemento => {
        totale += pesoDi(elemento);
        return totale;
    });
    return { lista, cumulativi, totale };
};

/**
 * Estrae un elemento pesato: piu' alto e' il peso, piu' probabile e' che
 * esca. Le liste sono poche centinaia di elementi, quindi una scansione
 * lineare del cumulativo va benissimo, non serve una ricerca binaria.
 */
const scegliPesato = ({ lista, cumulativi, totale }) => {
    if (!lista.length) return undefined;
    const punto = Math.random() * totale;
    for (let i = 0; i < cumulativi.length; i++) {
        if (punto < cumulativi[i]) return lista[i];
    }
    return lista[lista.length - 1]; // margine per arrotondamenti in virgola mobile
};

const pesoDi = (elemento) => (elemento.peso > 0 ? elemento.peso : 1);

const caricaNomi = () => {
    if (datiNomi) return datiNomi;
    try {
        const filePath = path.join(__dirname, '../names/names.json');
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        const names = (data.names || [])
            .map(n => typeof n === "string" ? { nome: n, genere: "n" } : n)
            .filter(n => n && n.nome);
        const adjectives = (data.adjectives || [])
            .map(a => typeof a === "string" ? { n: a, m: a, f: a, p: a, fp: a } : a)
            .filter(Boolean);
        datiNomi = {
            names,
            adjectives,
            estrazioneNomi: preparaEstrazione(names, pesoDi),
            estrazioneAggettivi: preparaEstrazione(adjectives, pesoDi)
        };
    } catch (error) {
        console.error('Errore durante la lettura del file JSON:', error.message);
        datiNomi = {
            names: [], adjectives: [],
            estrazioneNomi: preparaEstrazione([], pesoDi),
            estrazioneAggettivi: preparaEstrazione([], pesoDi)
        };
    }
    return datiNomi;
};

const generateName = () => {
    const dati = caricaNomi();
    if (!dati.names.length) return "Giocatore Anonimo";

    const nome = scegliPesato(dati.estrazioneNomi);
    if (!dati.adjectives.length) return nome.nome;

    const aggettivo = scegliPesato(dati.estrazioneAggettivi);
    const genere = ["m", "f", "n", "p", "fp"].includes(nome.genere) ? nome.genere : "n";
    const forma = aggettivo[genere] || aggettivo.n || aggettivo.m || aggettivo.f || aggettivo.p || "";

    return (nome.nome + " " + forma).trim();
}

/*
 * Trasforma i testi incollati in un mazzo personalizzato.
 * L'ordine dei blocchi e' quello che manda createPacks: frasi, completamenti,
 * nome. Solo il primo blocco e' fatto di frasi, quindi solo li' l'underscore
 * va contato come spazio da riempire.
 *
 * Prima la regola valeva per tutti: un completamento che conteneva un _
 * diventava la coppia [testo, 1] e in partita si vedeva come "testo,1".
 */
const INDICE_DELLE_FRASI = 0;

const translateToPack = (packs) => {
    try {
        const results = [];
        let indice = -1;
        for (const stringa of packs) {
            indice++;
            if(typeof stringa !== "string") {
                results.push(stringa);
                continue;
            }
            const perFrasi = indice === INDICE_DELLE_FRASI;
            const lines = stringa.split(/\r?\n/).filter(line => line.trim() !== "");
            let array = [];
            for (let line of lines) {
                line = line.trim();
                const string = line[0]?.toUpperCase() + line.slice(1);
                if(!perFrasi) { array.push(string); continue; }
                const spazi = (line.match(/_/g) || []).length;
                array.push(spazi !== 0 ? [
                    string,
                    spazi,
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

/*
 * Conta quanti file con una certa estensione ci sono in una cartella e li
 * rinumera da 1 in poi (1.jpg, 2.jpg, ...): cosi' basta buttare dentro nuovi
 * file, senza toccare il codice, e al riavvio del server vengono contati e
 * rinominati da soli. Usata sia per le pfp (jpg) che per i loghi (png).
 */
const contaFile = (cartella, estensione) => {
    try {
        const suffisso = "." + estensione.toLowerCase();
        const file = fs.readdirSync(cartella)
            .filter(file => path.extname(file).toLowerCase() === suffisso)
            .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

        const totale = file.length;
        if (totale === 0) return 0;

        file.forEach((nome, i) => {
            const vecchioPath = path.join(cartella, nome);
            const tempPath = path.join(cartella, `TEMP_${i}_${Date.now()}.tmp`);
            fs.renameSync(vecchioPath, tempPath);
        });

        const fileTemp = fs.readdirSync(cartella)
            .filter(file => file.endsWith('.tmp'))
            .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

        fileTemp.forEach((nome, i) => {
            const vecchioPath = path.join(cartella, nome);
            const nuovoPath = path.join(cartella, `${i + 1}${suffisso}`);
            fs.renameSync(vecchioPath, nuovoPath);
        });

        return totale;
    } catch (error) {
        console.error(error);
        return 0;
    }
};

const pfpNumber = contaFile(pfpPathServer, 'jpg');
const iconNumber = contaFile(iconPathServer, 'png');

const generatePfp = () => {
    let rdmNumber = Math.round(Math.random() * (pfpNumber - 1) + 1);
    return pfpPath + rdmNumber + ".jpg";
}

const getAllPfp = () => Array.from({ length: pfpNumber }, (v, i) => `${pfpPath}${i + 1}.jpg`);

const getIcon = (defaultIcon) => String(iconPath + (defaultIcon ? 1 : Math.round(Math.random() * (iconNumber - 1) + 1)) + ".png");

module.exports = { generateId, generatePfp, generateName, getIcon, getAllPfp, getknownPacks, translateToPack };
