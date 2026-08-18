/*
 * Genera application/include/names/names.json a partire dai due CSV in
 * ignore/scratch/raw/names/ :
 *
 *   nomi.csv       nome,genere                       genere: m | f | n | p
 *   aggettivi.csv  neutro,maschile,femminile,plurale
 *
 * Gli stessi CSV si possono tenere su Google Sheets: in quel caso il JSON lo
 * genera lo script in ignore/scratch/AppsScript_names.gs, che fa esattamente
 * le stesse cose (compresa la rimozione dei nomi doppi).
 *
 * Uso:  node ignore/scratch/generateNames.js
 */
const fs = require('node:fs');
const path = require('node:path');

const GENERI_VALIDI = ["m", "f", "n", "p"];

// come scrivere il genere nel foglio: a sinistra quello che puoi digitare,
// a destra quello che finisce nel JSON
const ALIAS_GENERE = {
    m: "m", maschile: "m", maschio: "m", uomo: "m",
    f: "f", femminile: "f", femmina: "f", donna: "f",
    n: "n", neutro: "n", neutrale: "n", "": "n",
    p: "p", plurale: "p", plurali: "p"
};

/** Parser CSV completo: gestisce virgolette, virgole dentro le celle e a capo. */
const leggiCsv = (testo) => {
    const pulito = testo.replace(/^﻿/, "");   // via il BOM se c'e'
    const righe = [];
    let riga = [];
    let cella = "";
    let dentroVirgolette = false;

    for (let i = 0; i < pulito.length; i++) {
        const c = pulito[i];

        if (dentroVirgolette) {
            if (c === '"') {
                if (pulito[i + 1] === '"') { cella += '"'; i++; }
                else dentroVirgolette = false;
            } else cella += c;
            continue;
        }

        if (c === '"') { dentroVirgolette = true; continue; }
        if (c === ',' || c === ';') { riga.push(cella); cella = ""; continue; }
        if (c === '\r') continue;
        if (c === '\n') { riga.push(cella); righe.push(riga); riga = []; cella = ""; continue; }
        cella += c;
    }
    if (cella !== "" || riga.length) { riga.push(cella); righe.push(riga); }

    if (!righe.length) return [];

    const intestazioni = righe[0].map(h => h.trim().toLowerCase());
    return righe.slice(1)
        .filter(r => r.some(c => String(c).trim() !== ""))
        .map(r => {
            const oggetto = {};
            intestazioni.forEach((nome, i) => { oggetto[nome] = String(r[i] ?? "").trim(); });
            return oggetto;
        });
};

const normalizzaGenere = (valore) => {
    const chiave = String(valore ?? "").trim().toLowerCase();
    const genere = ALIAS_GENERE[chiave];
    return GENERI_VALIDI.includes(genere) ? genere : "n";
};

const generateCombinedJSON = () => {
    const inputFolder = path.join(__dirname, "raw/names");
    const outputFolder = path.join(__dirname, "..", "../application/include/names/");

    try {
        const leggiFile = (nomeFile) => {
            const filePath = path.join(inputFolder, nomeFile);
            if (!fs.existsSync(filePath))
                throw new Error(`Amo, non trovo il file: ${nomeFile} nella cartella raw/names 😭`);
            return leggiCsv(fs.readFileSync(filePath, "utf-8"));
        };

        // --- NOMI: si tolgono i doppioni ignorando maiuscole e spazi ---------
        const visti = new Map();
        const doppioni = [];
        const nomi = [];

        for (const riga of leggiFile("nomi.csv")) {
            const nome = String(riga["nome"] ?? "").trim();
            if (!nome) continue;

            const chiave = nome.toLowerCase().replace(/\s+/g, " ");
            if (visti.has(chiave)) { doppioni.push(nome); continue; }
            visti.set(chiave, true);

            nomi.push({
                nome: nome.charAt(0).toUpperCase() + nome.slice(1),
                genere: normalizzaGenere(riga["genere"])
            });
        }

        // --- AGGETTIVI: le forme mancanti ricadono sul neutro ----------------
        const aggettivi = [];
        const incompleti = [];

        for (const riga of leggiFile("aggettivi.csv")) {
            const neutro = String(riga["neutro"] ?? "").trim();
            const maschile = String(riga["maschile"] ?? "").trim();
            const femminile = String(riga["femminile"] ?? "").trim();
            const plurale = String(riga["plurale"] ?? "").trim();

            const base = neutro || maschile || femminile || plurale;
            if (!base) continue;
            if (!maschile || !femminile || !plurale) incompleti.push(base);

            aggettivi.push({
                n: neutro || base,
                m: maschile || neutro || base,
                f: femminile || neutro || base,
                p: plurale || maschile || neutro || base
            });
        }

        if (!nomi.length) throw new Error("nomi.csv non contiene nessun nome valido");
        if (!aggettivi.length) throw new Error("aggettivi.csv non contiene nessun aggettivo valido");

        const finalData = { version: 2, names: nomi, adjectives: aggettivi };

        if (!fs.existsSync(outputFolder)) fs.mkdirSync(outputFolder, { recursive: true });
        const outputPath = path.join(outputFolder, "names.json");
        fs.writeFileSync(outputPath, JSON.stringify(finalData, null, 2) + "\n");

        const perGenere = GENERI_VALIDI
            .map(g => `${g}: ${nomi.filter(n => n.genere === g).length}`)
            .join(", ");

        console.log(`Tutto pronto tesoro! Il file è stato generato in: ${outputPath}`);
        console.log(`  nomi: ${nomi.length} (${perGenere})`);
        console.log(`  aggettivi: ${aggettivi.length}`);
        if (doppioni.length)
            console.log(`  doppioni tolti: ${doppioni.length} => ${doppioni.join(", ")}`);
        if (incompleti.length)
            console.log(`  aggettivi con qualche forma vuota (ho usato il neutro): ${incompleti.join(", ")}`);
        return true;

    } catch (error) {
        console.error(`C'è stato un problemino: ${error.message}`);
        return false;
    }
};

generateCombinedJSON();
