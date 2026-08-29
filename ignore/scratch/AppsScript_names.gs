/**
 * Cucu Ridu - pubblica nomi e aggettivi direttamente su GitHub
 * ============================================================================
 *
 * COME SI INSTALLA
 *   1. Apri il foglio con i nomi e gli aggettivi
 *   2. Estensioni > Apps Script
 *   3. Cancella quello che c'e' dentro Codice.gs e incolla tutto questo file
 *   4. Salva, poi ricarica il foglio: in alto compare il menu "Cucu Ridu"
 *   5. Cucu Ridu > Imposta token GitHub: incolla il token (vedi sotto come
 *      crearlo). Se hai gia' un token creato per il foglio delle carte, va
 *      benissimo lo stesso: basta che abbia accesso al repo CucuRidu.
 *   6. Cucu Ridu > Controlla i dati: verifica che trovi le schede giuste e
 *      quante righe ha letto, senza pubblicare niente
 *   7. Cucu Ridu > Pubblica su GitHub: primo test manuale
 *
 * COSA PUBBLICA
 *   Non piu' solo un popup da copiare a mano: lo script scrive DIRETTAMENTE
 *   su GitHub, in un unico commit atomico, tutti e tre i file che prima si
 *   rischiava di lasciare fuori sincrono tra loro:
 *     - ignore/scratch/raw/names/nomi.csv
 *     - ignore/scratch/raw/names/aggettivi.csv
 *     - application/include/names/names.json  (quello che il gioco legge
 *       davvero)
 *   Il motivo per cui serve scrivere anche i due CSV, e non solo il JSON: il
 *   server rigenera names.json DAI CSV a ogni avvio/deploy (npm start esegue
 *   generateNames.js). Se si pubblica solo il JSON e i CSV restano vecchi, il
 *   primo riavvio del server cancella la modifica senza preavviso: e' esattamente
 *   il bug scoperto il 22/08/2026 (nomi nuovi spariti, "Rosaana" mai
 *   corretto in "Rossana" perche' il fix era stato incollato solo nel JSON,
 *   mai nel CSV).
 *
 * COME CREARE IL TOKEN GITHUB (una volta sola, va bene anche per il foglio carte)
 *   1. github.com > icona profilo > Settings > Developer settings >
 *      Personal access tokens > Fine-grained tokens > Generate new token
 *   2. Repository access: "Only select repositories" > arco2121/CucuRidu
 *   3. Permissions > Repository permissions > "Contents" > Read and write
 *   4. Genera e copia il token (inizia con "github_pat_"), non si rivede piu'
 *
 * COME AUTOMATIZZARE (cosi' basta editare da telefono, senza aprire il menu)
 *   Estensioni > Apps Script > icona orologio "Trigger" a sinistra >
 *   Aggiungi trigger > funzione "pubblicaAutomatica" > Sorgente evento:
 *   "basata sul tempo" > timer minuti > ogni 10 minuti. Da qui in poi, se
 *   modifichi una riga dal telefono (anche solo con l'app Sheets), entro
 *   ~10 minuti la modifica arriva da sola su GitHub e parte il deploy. Se
 *   qualcosa va storto arriva una mail di errore in automatico, e in ogni
 *   caso trovi lo storico nella scheda "Log" che lo script si crea da solo
 *   in questo foglio.
 *
 * COME DEVE ESSERE FATTO IL FOGLIO
 *   Un foglio chiamato "Nomi" con le colonne:        nome | genere | raro
 *   Un foglio chiamato "Aggettivi" con le colonne:
 *       neutro | maschile | femminile | plurale | femminileplurale | raro
 *
 *   Le intestazioni vanno sulla prima riga. L'ordine delle colonne non conta,
 *   vengono cercate per nome. Le colonne in piu (note, appunti) vengono ignorate.
 *
 *   Nella colonna genere puoi scrivere m / f / n / p / fp oppure per esteso
 *   (maschile, femminile, neutro, plurale, femminile plurale). Se la lasci
 *   vuota vale neutro. "fp" e' la categoria nuova: serve per i nomi che sono
 *   un GRUPPO DI SOLE DONNE (es. "Le Amazzoni"), cosi' l'aggettivo concorda
 *   sia in genere che in numero: "Le Amazzoni Stronze" invece di "Le Amazzoni
 *   Stronzi" o "Le Amazzoni Stronza". Per un gruppo misto o generico continua
 *   a andare bene "p" (plurale) come prima.
 *
 *   Per gli aggettivi che non cambiano forma ripeti la stessa parola nelle
 *   prime tre colonne (e anche in plurale/femminileplurale se restano
 *   uguali). Se lasci vuote maschile, femminile, plurale o femminileplurale,
 *   il gioco usa la forma migliore che trova al loro posto (per
 *   femminileplurale l'ordine di ripiego e' plurale, poi femminile, poi
 *   neutro): comodo per buttare dentro un aggettivo al volo e sistemarlo dopo
 *   (i CSV pubblicati mantengono le caselle vuote cosi' come sono nel foglio,
 *   solo names.json ha le forme gia' riempite).
 *
 *   La colonna "raro" (sia per i nomi che per gli aggettivi) e' facoltativa:
 *   vuota = normale. Ci puoi scrivere "raro" (esce circa 1 volta su 5
 *   rispetto a uno normale), "molto raro"/"rarissimo" (1 su 20), oppure un
 *   numero a piacere per un controllo piu' fine (es. 0.02 per rarissimo su
 *   misura, o anche un numero maggiore di 1 per renderlo PIU' comune del
 *   normale). Invece di duplicare tutte le altre righe per "diluire" quella
 *   rara (che gonfierebbe il file e funziona solo con rapporti interi), ogni
 *   nome/aggettivo porta il suo peso e il gioco estrae pesando le probabilita'.
 */

// ---------------------------------------------------------------- CONFIG ---

var GITHUB_OWNER = "arco2121";
var GITHUB_REPO = "CucuRidu";
var GITHUB_BRANCH = "main";

var PERCORSO_CSV_NOMI = "ignore/scratch/raw/names/nomi.csv";
var PERCORSO_CSV_AGGETTIVI = "ignore/scratch/raw/names/aggettivi.csv";
var PERCORSO_JSON = "application/include/names/names.json";

// Nomi dei fogli. Il primo che esiste vince, il confronto ignora le maiuscole.
var FOGLI_NOMI = ["Nomi", "nomi", "nomi.csv", "Names"];
var FOGLI_AGGETTIVI = ["Aggettivi", "aggettivi", "aggettivi.csv", "Adjectives"];

var GENERI_VALIDI = ["m", "f", "n", "p", "fp"];

var ALIAS_GENERE = {
  "m": "m", "maschile": "m", "maschio": "m", "uomo": "m",
  "f": "f", "femminile": "f", "femmina": "f", "donna": "f",
  "n": "n", "neutro": "n", "neutrale": "n", "": "n",
  "p": "p", "plurale": "p", "plurali": "p",
  "fp": "fp", "plurale femminile": "fp", "femminile plurale": "fp",
  "plurali femminili": "fp", "donne": "fp"
};

// come scrivere la rarita' nel foglio: a sinistra quello che puoi digitare,
// a destra il peso che finisce nel JSON (1 = normale, meno di 1 = piu' raro)
var ALIAS_RARITA = {
  "": 1, "no": 1, "normale": 1, "comune": 1,
  "raro": 0.2, "r": 0.2, "si": 0.2, "x": 0.2,
  "molto raro": 0.05, "rarissimo": 0.05, "mr": 0.05
};

// ------------------------------------------------------------------ MENU ---

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Cucu Ridu")
    .addItem("Pubblica su GitHub", "pubblicaManuale")
    .addItem("Anteprima JSON (senza pubblicare)", "mostraJson")
    .addItem("Controlla i dati", "mostraControlli")
    .addSeparator()
    .addItem("Imposta token GitHub", "impostaToken")
    .addToUi();
}

function impostaToken() {
  var ui = SpreadsheetApp.getUi();
  var risposta = ui.prompt(
    "Token GitHub",
    "Incolla il fine-grained personal access token (Contents: read/write su " +
      GITHUB_OWNER + "/" + GITHUB_REPO + "). Resta salvato solo in questo foglio.",
    ui.ButtonSet.OK_CANCEL
  );
  if (risposta.getSelectedButton() !== ui.Button.OK) return;

  var token = risposta.getResponseText().trim();
  if (!token) {
    ui.alert("Token vuoto, non ho salvato niente.");
    return;
  }
  PropertiesService.getScriptProperties().setProperty("GITHUB_TOKEN", token);
  ui.alert("Fatto", "Token salvato.", ui.ButtonSet.OK);
}

// ------------------------------------------------------------- LETTURA -----

function trovaFoglio_(possibiliNomi) {
  var fogli = SpreadsheetApp.getActiveSpreadsheet().getSheets();
  for (var i = 0; i < possibiliNomi.length; i++) {
    var cercato = String(possibiliNomi[i]).toLowerCase().trim();
    for (var j = 0; j < fogli.length; j++) {
      if (fogli[j].getName().toLowerCase().trim() === cercato) return fogli[j];
    }
  }
  return null;
}

/** Legge un foglio come lista di oggetti, usando la prima riga come intestazioni. */
function leggiFoglio_(foglio) {
  var valori = foglio.getDataRange().getDisplayValues();
  if (!valori.length) return [];

  var intestazioni = valori[0].map(function (h) {
    return String(h).replace(/^﻿/, "").trim().toLowerCase();
  });

  var righe = [];
  for (var r = 1; r < valori.length; r++) {
    var riga = valori[r];
    var vuota = riga.every(function (c) { return String(c).trim() === ""; });
    if (vuota) continue;

    var oggetto = { _riga: r + 1 };
    for (var c = 0; c < intestazioni.length; c++) {
      if (!intestazioni[c]) continue;
      oggetto[intestazioni[c]] = String(riga[c] == null ? "" : riga[c]).trim();
    }
    righe.push(oggetto);
  }
  return righe;
}

function normalizzaGenere_(valore) {
  var chiave = String(valore == null ? "" : valore).trim().toLowerCase();
  var genere = ALIAS_GENERE[chiave];
  return GENERI_VALIDI.indexOf(genere) !== -1 ? genere : "n";
}

/**
 * Legge la colonna "raro": vuoto/non scritto => 1 (normale), una delle parole
 * di ALIAS_RARITA => il peso associato, altrimenti un numero a piacere
 * (accetta sia la virgola che il punto come separatore decimale). Ritorna
 * null se il valore non e' vuoto ma non si riesce a interpretare.
 */
function normalizzaPeso_(valore) {
  var testo = String(valore == null ? "" : valore).trim().toLowerCase();
  if (testo === "") return 1;
  if (testo in ALIAS_RARITA) return ALIAS_RARITA[testo];
  var numero = parseFloat(testo.replace(",", "."));
  return isFinite(numero) && numero > 0 ? numero : null;
}

// --------------------------------------------------------- COSTRUZIONE -----

/**
 * Costruisce i dati finali.
 * Ritorna { json, nomi, aggettivi, csvNomi, csvAggettivi, doppioni, avvisi }
 *   - nomi/aggettivi: forme gia' risolte, quelle che finiscono in names.json
 *   - csvNomi/csvAggettivi: righe grezze cosi' come stanno nel foglio (le
 *     caselle vuote degli aggettivi restano vuote), quelle che finiscono
 *     nei due CSV
 */
function costruisciDati_() {
  var foglioNomi = trovaFoglio_(FOGLI_NOMI);
  var foglioAgg = trovaFoglio_(FOGLI_AGGETTIVI);

  if (!foglioNomi)
    throw new Error("Non trovo il foglio dei nomi. Deve chiamarsi \"Nomi\" e avere le colonne nome e genere.");
  if (!foglioAgg)
    throw new Error("Non trovo il foglio degli aggettivi. Deve chiamarsi \"Aggettivi\" e avere le colonne neutro, maschile, femminile, plurale, femminileplurale.");

  var avvisi = [];
  var righeNomi = leggiFoglio_(foglioNomi);
  var righeAgg = leggiFoglio_(foglioAgg);

  if (righeNomi.length && !("nome" in righeNomi[0]))
    throw new Error("Nel foglio \"" + foglioNomi.getName() + "\" manca la colonna \"nome\".");
  if (righeAgg.length && !("neutro" in righeAgg[0]))
    throw new Error("Nel foglio \"" + foglioAgg.getName() + "\" manca la colonna \"neutro\".");

  // --- NOMI, senza doppioni -------------------------------------------------
  var visti = {};
  var doppioni = [];
  var nomi = [];
  var csvNomi = [];

  for (var i = 0; i < righeNomi.length; i++) {
    var riga = righeNomi[i];
    var nome = String(riga["nome"] || "").trim();
    if (!nome) continue;

    var chiave = nome.toLowerCase().replace(/\s+/g, " ");
    if (visti[chiave]) {
      doppioni.push(nome + " (riga " + riga._riga + ")");
      continue;
    }
    visti[chiave] = true;

    var grezzo = String(riga["genere"] || "");
    if (grezzo.trim() !== "" && !(grezzo.trim().toLowerCase() in ALIAS_GENERE))
      avvisi.push("Riga " + riga._riga + " dei nomi: genere \"" + grezzo + "\" non riconosciuto, uso neutro (" + nome + ")");

    var nomeFinale = nome.charAt(0).toUpperCase() + nome.slice(1);
    var genereFinale = normalizzaGenere_(grezzo);

    var pesoGrezzo = riga["raro"];
    var peso = normalizzaPeso_(pesoGrezzo);
    if (peso === null) {
      avvisi.push("Riga " + riga._riga + " dei nomi: \"raro\" = \"" + pesoGrezzo + "\" non riconosciuto, uso peso 1 (" + nomeFinale + ")");
      peso = 1;
    }

    var oggettoNome = { nome: nomeFinale, genere: genereFinale };
    if (peso !== 1) oggettoNome.peso = peso;
    nomi.push(oggettoNome);
    csvNomi.push([nomeFinale, genereFinale, String(riga["raro"] || "").trim()]);
  }

  // --- AGGETTIVI, le forme vuote ricadono su quella migliore disponibile ---
  var aggettivi = [];
  var csvAggettivi = [];

  for (var k = 0; k < righeAgg.length; k++) {
    var r = righeAgg[k];
    var neutro = String(r["neutro"] || "").trim();
    var maschile = String(r["maschile"] || "").trim();
    var femminile = String(r["femminile"] || "").trim();
    var plurale = String(r["plurale"] || "").trim();
    var femminilePlurale = String(r["femminileplurale"] || "").trim();

    var base = neutro || maschile || femminile || plurale;
    if (!base) continue;

    var mancanti = [];
    if (!maschile) mancanti.push("maschile");
    if (!femminile) mancanti.push("femminile");
    if (!plurale) mancanti.push("plurale");
    if (!femminilePlurale) mancanti.push("femminile plurale");
    if (mancanti.length)
      avvisi.push("Riga " + r._riga + " degli aggettivi (" + base + "): manca " + mancanti.join(", ") + ", ho usato la forma migliore disponibile");

    var pesoGrezzoAgg = r["raro"];
    var pesoAgg = normalizzaPeso_(pesoGrezzoAgg);
    if (pesoAgg === null) {
      avvisi.push("Riga " + r._riga + " degli aggettivi: \"raro\" = \"" + pesoGrezzoAgg + "\" non riconosciuto, uso peso 1 (" + base + ")");
      pesoAgg = 1;
    }

    var oggettoAgg = {
      n: neutro || base,
      m: maschile || neutro || base,
      f: femminile || neutro || base,
      p: plurale || maschile || neutro || base,
      fp: femminilePlurale || plurale || femminile || neutro || base
    };
    if (pesoAgg !== 1) oggettoAgg.peso = pesoAgg;
    aggettivi.push(oggettoAgg);
    csvAggettivi.push([neutro, maschile, femminile, plurale, femminilePlurale, String(r["raro"] || "").trim()]);
  }

  if (!nomi.length) throw new Error("Il foglio dei nomi e' vuoto.");
  if (!aggettivi.length) throw new Error("Il foglio degli aggettivi e' vuoto.");

  var finale = { version: 3, names: nomi, adjectives: aggettivi };

  return {
    json: JSON.stringify(finale, null, 2) + "\n",
    nomi: nomi,
    aggettivi: aggettivi,
    csvNomi: csvNomi,
    csvAggettivi: csvAggettivi,
    doppioni: doppioni,
    avvisi: avvisi
  };
}

function contaGeneri_(nomi) {
  var conteggi = { m: 0, f: 0, n: 0, p: 0, fp: 0 };
  for (var i = 0; i < nomi.length; i++) conteggi[nomi[i].genere]++;
  return conteggi;
}

function contaRari_(lista) {
  var rari = 0;
  for (var i = 0; i < lista.length; i++) if (lista[i].peso && lista[i].peso < 1) rari++;
  return rari;
}

// -------------------------------------------------------------------- CSV --

function csvCella_(valore) {
  var testo = String(valore == null ? "" : valore);
  if (/[",\n\r]/.test(testo)) return '"' + testo.replace(/"/g, '""') + '"';
  return testo;
}

function csvRiga_(celle) {
  return celle.map(csvCella_).join(",");
}

function costruisciCsvNomi_(csvNomi) {
  var righe = ["nome,genere,raro"];
  for (var i = 0; i < csvNomi.length; i++) righe.push(csvRiga_(csvNomi[i]));
  return righe.join("\n") + "\n";
}

function costruisciCsvAggettivi_(csvAggettivi) {
  var righe = ["neutro,maschile,femminile,plurale,femminileplurale,raro"];
  for (var i = 0; i < csvAggettivi.length; i++) righe.push(csvRiga_(csvAggettivi[i]));
  return righe.join("\n") + "\n";
}

// -------------------------------------------------------------- GITHUB -----

function githubToken_() {
  var token = PropertiesService.getScriptProperties().getProperty("GITHUB_TOKEN");
  if (!token) throw new Error("Manca il token GitHub: Cucu Ridu > Imposta token GitHub.");
  return token;
}

function githubHeaders_() {
  return {
    "Authorization": "Bearer " + githubToken_(),
    "Accept": "application/vnd.github+json"
  };
}

function githubChiamata_(percorso, opzioni) {
  opzioni = opzioni || {};
  opzioni.headers = githubHeaders_();
  opzioni.muteHttpExceptions = true;
  if (opzioni.corpo) {
    opzioni.contentType = "application/json";
    opzioni.payload = JSON.stringify(opzioni.corpo);
    delete opzioni.corpo;
  }
  var risposta = UrlFetchApp.fetch("https://api.github.com" + percorso, opzioni);
  return { codice: risposta.getResponseCode(), testo: risposta.getContentText() };
}

function githubOk_(risposta, contesto) {
  if (risposta.codice < 200 || risposta.codice >= 300)
    throw new Error("GitHub (" + contesto + "): HTTP " + risposta.codice + " " + risposta.testo);
  return JSON.parse(risposta.testo);
}

/** Legge il contenuto testuale di un file dal repo. Ritorna la stringa, oppure null se non esiste. */
function githubLeggiContenuto_(percorso) {
  var risposta = githubChiamata_("/repos/" + GITHUB_OWNER + "/" + GITHUB_REPO + "/contents/" + percorso + "?ref=" + GITHUB_BRANCH, { method: "get" });
  if (risposta.codice === 404) return null;
  var dati = githubOk_(risposta, "lettura " + percorso);
  var puliti = dati.content.replace(/\n/g, "");
  var bytes = Utilities.base64Decode(puliti);
  return Utilities.newBlob(bytes).getDataAsString("UTF-8");
}

/**
 * Crea un unico commit su GITHUB_BRANCH con tutti i file passati (path + contenuto
 * testuale), cosi' il push (e quindi il deploy) scatta una volta sola invece che
 * una volta per file.
 */
function githubCommitAtomico_(file, messaggio) {
  var rifRisposta = githubChiamata_("/repos/" + GITHUB_OWNER + "/" + GITHUB_REPO + "/git/ref/heads/" + GITHUB_BRANCH, { method: "get" });
  var rif = githubOk_(rifRisposta, "lettura ref " + GITHUB_BRANCH);
  var commitAttualeSha = rif.object.sha;

  var commitRisposta = githubChiamata_("/repos/" + GITHUB_OWNER + "/" + GITHUB_REPO + "/git/commits/" + commitAttualeSha, { method: "get" });
  var commitAttuale = githubOk_(commitRisposta, "lettura commit " + commitAttualeSha);
  var treeAttualeSha = commitAttuale.tree.sha;

  var entries = file.map(function (f) {
    return { path: f.percorso, mode: "100644", type: "blob", content: f.contenuto };
  });

  var treeRisposta = githubChiamata_("/repos/" + GITHUB_OWNER + "/" + GITHUB_REPO + "/git/trees", {
    method: "post",
    corpo: { base_tree: treeAttualeSha, tree: entries }
  });
  var nuovoTree = githubOk_(treeRisposta, "creazione tree");

  var nuovoCommitRisposta = githubChiamata_("/repos/" + GITHUB_OWNER + "/" + GITHUB_REPO + "/git/commits", {
    method: "post",
    corpo: { message: messaggio, tree: nuovoTree.sha, parents: [commitAttualeSha] }
  });
  var nuovoCommit = githubOk_(nuovoCommitRisposta, "creazione commit");

  var aggiornaRisposta = githubChiamata_("/repos/" + GITHUB_OWNER + "/" + GITHUB_REPO + "/git/refs/heads/" + GITHUB_BRANCH, {
    method: "patch",
    corpo: { sha: nuovoCommit.sha }
  });
  githubOk_(aggiornaRisposta, "aggiornamento ref " + GITHUB_BRANCH);
}

/** Nucleo: legge il foglio, confronta con GitHub e pubblica solo cio' che e' cambiato. */
function pubblicaNomi_() {
  var dati = costruisciDati_();

  var candidati = [
    { percorso: PERCORSO_CSV_NOMI, contenuto: costruisciCsvNomi_(dati.csvNomi) },
    { percorso: PERCORSO_CSV_AGGETTIVI, contenuto: costruisciCsvAggettivi_(dati.csvAggettivi) },
    { percorso: PERCORSO_JSON, contenuto: dati.json }
  ];

  var daScrivere = [];
  for (var i = 0; i < candidati.length; i++) {
    var attuale = githubLeggiContenuto_(candidati[i].percorso);
    if (attuale !== candidati[i].contenuto) daScrivere.push(candidati[i]);
  }

  var g = contaGeneri_(dati.nomi);
  var righeRiepilogo = [
    "Nomi: " + dati.nomi.length + " (m " + g.m + ", f " + g.f + ", n " + g.n + ", p " + g.p + ", fp " + g.fp + ") — rari: " + contaRari_(dati.nomi),
    "Aggettivi: " + dati.aggettivi.length + " — rari: " + contaRari_(dati.aggettivi)
  ];
  if (dati.doppioni.length) righeRiepilogo.push("Nomi doppi tolti: " + dati.doppioni.join(", "));
  if (dati.avvisi.length) righeRiepilogo.push("Avvisi: " + dati.avvisi.join(" / "));

  if (!daScrivere.length) {
    righeRiepilogo.push("Nessuna modifica rispetto a GitHub.");
    return { testo: righeRiepilogo.join("\n"), pubblicato: false };
  }

  githubCommitAtomico_(daScrivere, "Aggiorna nomi e aggettivi (da Google Sheets)");

  righeRiepilogo.push("Pubblicati " + daScrivere.length + " file:");
  for (var j = 0; j < daScrivere.length; j++) righeRiepilogo.push("  " + daScrivere[j].percorso);

  return { testo: righeRiepilogo.join("\n"), pubblicato: true };
}

// -------------------------------------------------------------- MANUALE ----

function pubblicaManuale() {
  var ui = SpreadsheetApp.getUi();
  try {
    var risultato = pubblicaNomi_();
    ui.alert(
      risultato.pubblicato ? "Pubblicato" : "Nessuna modifica",
      risultato.testo,
      ui.ButtonSet.OK
    );
  } catch (e) {
    ui.alert("Ops", e.message, ui.ButtonSet.OK);
  }
}

function mostraControlli() {
  var ui = SpreadsheetApp.getUi();
  var dati;
  try {
    dati = costruisciDati_();
  } catch (e) {
    ui.alert("Ops", e.message, ui.ButtonSet.OK);
    return;
  }

  var g = contaGeneri_(dati.nomi);
  var righe = [
    "Nomi validi: " + dati.nomi.length,
    "  maschili: " + g.m,
    "  femminili: " + g.f,
    "  neutri: " + g.n,
    "  plurali: " + g.p,
    "  plurali femminili: " + g.fp,
    "  rari: " + contaRari_(dati.nomi),
    "Aggettivi validi: " + dati.aggettivi.length,
    "  rari: " + contaRari_(dati.aggettivi),
    ""
  ];

  righe.push(dati.doppioni.length
    ? "Nomi doppi tolti (" + dati.doppioni.length + "):\n  " + dati.doppioni.join("\n  ")
    : "Nessun nome doppio.");
  righe.push("");
  righe.push(dati.avvisi.length
    ? "Cose da controllare (" + dati.avvisi.length + "):\n  " + dati.avvisi.join("\n  ")
    : "Nessun problema trovato.");

  ui.alert("Controllo dei dati", righe.join("\n"), ui.ButtonSet.OK);
}

// ------------------------------------------------------------------ HTML ---

function escapeHtml_(testo) {
  return String(testo)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function mostraJson() {
  var ui = SpreadsheetApp.getUi();
  var dati;
  try {
    dati = costruisciDati_();
  } catch (e) {
    ui.alert("Ops", e.message, ui.ButtonSet.OK);
    return;
  }

  var g = contaGeneri_(dati.nomi);
  var riepilogo = dati.nomi.length + " nomi (m " + g.m + ", f " + g.f + ", n " + g.n + ", p " + g.p + ", fp " + g.fp + ", rari " + contaRari_(dati.nomi) + ")"
    + " e " + dati.aggettivi.length + " aggettivi (rari " + contaRari_(dati.aggettivi) + ")";

  var note = [];
  if (dati.doppioni.length)
    note.push("<b>Nomi doppi tolti (" + dati.doppioni.length + "):</b> " + escapeHtml_(dati.doppioni.join(", ")));
  if (dati.avvisi.length)
    note.push("<b>Da controllare (" + dati.avvisi.length + "):</b><br>" + escapeHtml_(dati.avvisi.join("\n")).replace(/\n/g, "<br>"));
  note.push("Questa e' solo un'anteprima: per pubblicare davvero usa \"Cucu Ridu &gt; Pubblica su GitHub\".");

  var html = paginaJson_(dati.json, riepilogo, note.join("<hr>"));
  ui.showModalDialog(
    HtmlService.createHtmlOutput(html).setWidth(760).setHeight(620),
    "names.json (anteprima)"
  );
}

function paginaJson_(json, riepilogo, note) {
  return [
    '<!DOCTYPE html><html><head><meta charset="utf-8"><style>',
    'body{font-family:Roboto,Arial,sans-serif;margin:0;padding:14px;color:#222;font-size:13px}',
    '.riga{display:flex;align-items:center;gap:10px;margin-bottom:10px;flex-wrap:wrap}',
    'button{font-family:inherit;font-size:13px;padding:8px 16px;border-radius:6px;border:none;cursor:pointer}',
    '#copia{background:#1a73e8;color:#fff}',
    '#copia:hover{background:#1765cc}',
    '#esito{color:#188038;font-weight:600}',
    'textarea{width:100%;height:360px;box-sizing:border-box;font-family:Menlo,Consolas,monospace;',
    'font-size:11px;white-space:pre;border:1px solid #dadce0;border-radius:6px;padding:8px}',
    '.note{background:#fef7e0;border:1px solid #feefc3;border-radius:6px;padding:10px;margin-bottom:10px;line-height:1.5}',
    '.riepilogo{color:#5f6368}',
    'hr{border:none;border-top:1px solid #feefc3;margin:8px 0}',
    '</style></head><body>',
    '<div class="riga">',
    '<button id="copia">Copia il JSON</button>',
    '<span id="esito"></span>',
    '<span class="riepilogo">', escapeHtml_(riepilogo), '</span>',
    '</div>',
    note ? '<div class="note">' + note + '</div>' : '',
    '<textarea id="json" readonly>', escapeHtml_(json), '</textarea>',
    '<script>',
    'var area=document.getElementById("json");',
    'var esito=document.getElementById("esito");',
    'document.getElementById("copia").addEventListener("click",function(){',
    '  area.focus();area.select();area.setSelectionRange(0,area.value.length);',
    '  var fatto=false;',
    '  try{fatto=document.execCommand("copy");}catch(e){}',
    '  if(fatto){esito.textContent="Copiato";setTimeout(function(){esito.textContent="";},2500);return;}',
    '  if(navigator.clipboard&&navigator.clipboard.writeText){',
    '    navigator.clipboard.writeText(area.value).then(function(){',
    '      esito.textContent="Copiato";setTimeout(function(){esito.textContent="";},2500);',
    '    }).catch(function(){esito.textContent="Copialo a mano con Ctrl+C";});',
    '    return;',
    '  }',
    '  esito.textContent="Copialo a mano con Ctrl+C";',
    '});',
    '<\/script>',
    '</body></html>'
  ].join("");
}

// ----------------------------------------------------------- AUTOMATICA ----

function scrivoLog_(esito, dettaglio) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var log = ss.getSheetByName("Log");
  if (!log) {
    log = ss.insertSheet("Log");
    log.appendRow(["Quando", "Esito", "Dettaglio"]);
  }
  log.appendRow([new Date(), esito, dettaglio]);
}

/** Da collegare a un trigger a tempo (vedi header). Nessuna UI: logga su una scheda e manda una mail se fallisce. */
function pubblicaAutomatica() {
  try {
    var risultato = pubblicaNomi_();
    scrivoLog_(risultato.pubblicato ? "pubblicato" : "invariato", risultato.testo);
  } catch (e) {
    scrivoLog_("errore", e.message);
    try {
      MailApp.sendEmail(
        Session.getActiveUser().getEmail(),
        "Cucu Ridu: errore pubblicazione nomi/aggettivi",
        e.message
      );
    } catch (e2) {
      // se anche la mail fallisce non c'e' molto altro da fare, resta il log
    }
  }
}
