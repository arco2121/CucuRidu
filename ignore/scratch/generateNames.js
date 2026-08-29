/*
 * Genera application/include/names/names.json a partire dai due CSV in
 * ignore/scratch/raw/names/ :
 *
 *   nomi.csv       nome,genere,raro                  genere: m | f | n | p | fp
 *   aggettivi.csv  neutro,maschile,femminile,plurale,femminileplurale,raro
 *
 *   fp = "femminile plurale": per i nomi che sono un gruppo di sole donne
 *   (es. "Le Amazzoni"), cosi' l'aggettivo concorda sia in genere che in
 *   numero (es. "Le Amazzoni Stronze", non "Le Amazzoni Stronzi").
 *
 *   raro: invece di duplicare tutte le altre righe per "diluire" quella
 *   rara (che gonfierebbe il JSON e funziona solo con rapporti interi), ogni
 *   nome/aggettivo ha un peso nell'estrazione casuale. Vuoto = peso 1
 *   (normale). Si puo' scrivere "raro" (peso 0.2, cioe' circa 1 volta su 5
 *   rispetto a uno normale), "molto raro"/"rarissimo" (peso 0.05), oppure un
 *   numero a piacere (es. 0.02 per rarissimo su misura, o anche >1 per un
 *   nome/aggettivo piu' comune del normale). Il numero finisce nel JSON come
 *   "peso" solo se diverso da 1, il resto degli oggetti resta come prima.
 *
 * Gli stessi CSV si possono tenere su Google Sheets: in quel caso il JSON lo
 * genera lo script in ignore/scratch/AppsScript_names.gs, che fa esattamente
 * le stesse cose (compresa la rimozione dei nomi doppi).
 *
 * Uso:  node ignore/scratch/generateNames.js
 */
const fs = require('node:fs');
const path = require('node:path');

const GENERI_VALIDI = ["m", "f", "n", "p", "fp"];

// come scrivere il genere nel foglio: a sinistra quello che puoi digitare,
// a destra quello che finisce nel JSON
const ALIAS_GENERE = {
    m: "m", maschile: "m", maschio: "m", uomo: "m",
    f: "f", femminile: "f", femmina: "f", donna: "f",
    n: "n", neutro: "n", neutrale: "n", "": "n",
    p: "p", plurale: "p", plurali: "p",
    fp: "fp", "plurale femminile": "fp", "femminile plurale": "fp",
    "plurali femminili": "fp", donne: "fp"
};

// come scrivere la rarita' nel foglio: a sinistra quello che puoi digitare,
// a destra il peso che finisce nel JSON (1 = normale, meno di 1 = piu' raro)
const ALIAS_RARITA = {
    "": 1, no: 1, normale: 1, comune: 1,
    raro: 0.2, r: 0.2, si: 0.2, x: 0.2,
    "molto raro": 0.05, rarissimo: 0.05, mr: 0.05
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

/**
 * Legge la colonna "raro": vuoto/non scritto => 1 (normale), una delle parole
 * di ALIAS_RARITA => il peso associato, altrimenti un numero a piacere
 * (accetta sia la virgola che il punto come separatore decimale). Ritorna
 * null se il valore non e' vuoto ma non si riesce a interpretare, cosi' chi
 * chiama puo' avvisare e usare 1 di default.
 */
const normalizzaPeso = (valore) => {
    const testo = String(valore ?? "").trim().toLowerCase();
    if (testo === "") return 1;
    if (testo in ALIAS_RARITA) return ALIAS_RARITA[testo];
    const numero = parseFloat(testo.replace(",", "."));
    return Number.isFinite(numero) && numero > 0 ? numero : null;
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
        const pesiNomiNonRiconosciuti = [];

        for (const riga of leggiFile("nomi.csv")) {
            const nome = String(riga["nome"] ?? "").trim();
            if (!nome) continue;

            const chiave = nome.toLowerCase().replace(/\s+/g, " ");
            if (visti.has(chiave)) { doppioni.push(nome); continue; }
            visti.set(chiave, true);

            let peso = normalizzaPeso(riga["raro"]);
            if (peso === null) { pesiNomiNonRiconosciuti.push(nome); peso = 1; }

            const oggetto = {
                nome: nome.charAt(0).toUpperCase() + nome.slice(1),
                genere: normalizzaGenere(riga["genere"])
            };
            if (peso !== 1) oggetto.peso = peso;
            nomi.push(oggetto);
        }

        // --- AGGETTIVI: le forme mancanti ricadono sul neutro ----------------
        const aggettivi = [];
        const incompleti = [];
        const pesiAggettiviNonRiconosciuti = [];

        for (const riga of leggiFile("aggettivi.csv")) {
            const neutro = String(riga["neutro"] ?? "").trim();
            const maschile = String(riga["maschile"] ?? "").trim();
            const femminile = String(riga["femminile"] ?? "").trim();
            const plurale = String(riga["plurale"] ?? "").trim();
            const femminilePlurale = String(riga["femminileplurale"] ?? "").trim();

            const base = neutro || maschile || femminile || plurale;
            if (!base) continue;
            if (!maschile || !femminile || !plurale || !femminilePlurale) incompleti.push(base);

            let peso = normalizzaPeso(riga["raro"]);
            if (peso === null) { pesiAggettiviNonRiconosciuti.push(base); peso = 1; }

            const oggetto = {
                n: neutro || base,
                m: maschile || neutro || base,
                f: femminile || neutro || base,
                p: plurale || maschile || neutro || base,
                fp: femminilePlurale || plurale || femminile || neutro || base
            };
            if (peso !== 1) oggetto.peso = peso;
            aggettivi.push(oggetto);
        }

        if (!nomi.length) throw new Error("nomi.csv non contiene nessun nome valido");
        if (!aggettivi.length) throw new Error("aggettivi.csv non contiene nessun aggettivo valido");

        const finalData = { version: 3, names: nomi, adjectives: aggettivi };

        if (!fs.existsSync(outputFolder)) fs.mkdirSync(outputFolder, { recursive: true });
        const outputPath = path.join(outputFolder, "names.json");
        fs.writeFileSync(outputPath, JSON.stringify(finalData, null, 2) + "\n");

        const perGenere = GENERI_VALIDI
            .map(g => `${g}: ${nomi.filter(n => n.genere === g).length}`)
            .join(", ");

        const nomiRari = nomi.filter(n => n.peso && n.peso < 1).length;
        const aggettiviRari = aggettivi.filter(a => a.peso && a.peso < 1).length;

        console.log(`Tutto pronto tesoro! Il file è stato generato in: ${outputPath}`);
        console.log(`  nomi: ${nomi.length} (${perGenere}) — rari: ${nomiRari}`);
        console.log(`  aggettivi: ${aggettivi.length} — rari: ${aggettiviRari}`);
        if (doppioni.length)
            console.log(`  doppioni tolti: ${doppioni.length} => ${doppioni.join(", ")}`);
        if (incompleti.length)
            console.log(`  aggettivi con qualche forma vuota (ho usato il neutro): ${incompleti.join(", ")}`);
        if (pesiNomiNonRiconosciuti.length)
            console.log(`  nomi con colonna "raro" non capita (ho usato peso 1): ${pesiNomiNonRiconosciuti.join(", ")}`);
        if (pesiAggettiviNonRiconosciuti.length)
            console.log(`  aggettivi con colonna "raro" non capita (ho usato peso 1): ${pesiAggettiviNonRiconosciuti.join(", ")}`);
        return true;

    } catch (error) {
        console.error(`C'è stato un problemino: ${error.message}`);
        return false;
    }
};

generateCombinedJSON();
