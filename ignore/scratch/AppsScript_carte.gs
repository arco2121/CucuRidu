/**
 * Cucu Ridu - pubblica le carte (frasi/completamenti) direttamente su GitHub
 * ============================================================================
 *
 * COME SI INSTALLA (da ripetere su ognuno dei fogli con le carte: standard,
 * cinesi_xxx, melanie_martinez, o qualsiasi nuovo pack)
 *   1. Apri il foglio del pack che vuoi collegare
 *   2. Estensioni > Apps Script
 *   3. Cancella quello che c'e' dentro Codice.gs e incolla tutto questo file
 *   4. Cambia SOLO la riga "var GRUPPO = ..." qui sotto con il nome del pack
 *      cosi' come si chiama la cartella dentro
 *      CucuRidu/ignore/scratch/raw/cards/ nel repo (es. "standard",
 *      "cinesi_xxx", "melanie_martinez", oppure un nome nuovo se stai
 *      aggiungendo un pack che non esiste ancora)
 *   5. Salva, poi ricarica il foglio: in alto compare il menu "Cucu Ridu"
 *   6. Cucu Ridu > Imposta token GitHub: incolla il token (vedi sotto come
 *      crearlo), va fatto una volta sola per ogni foglio
 *   7. Cucu Ridu > Controlla i dati: verifica che trovi le schede giuste e
 *      quante righe ha letto, senza pubblicare niente
 *   8. Cucu Ridu > Pubblica su GitHub: primo test manuale
 *
 * COSA PUBBLICA
 *   Non solo i .txt grezzi in ignore/scratch/raw/cards/<GRUPPO>/: lo script
 *   fa anche il lavoro di generateAllCards.js e scrive direttamente anche
 *   frasi.json e completamenti.json dentro
 *   application/include/cards/<GRUPPO>/ (stessa identica trasformazione:
 *   maiuscola iniziale automatica, conteggio dei "_" per sapere quanti
 *   completamenti servono). Cosi' il repo resta sempre coerente da solo,
 *   senza dover fidarsi che il server rigeneri tutto da capo all'avvio (lo fa
 *   comunque, ma qui non serve piu' contarci). I 4 file (2 .txt + 2 .json)
 *   vengono scritti in un unico commit, cosi' il deploy parte una volta sola
 *   e non quattro.
 *
 * COME CREARE IL TOKEN GITHUB (una volta sola, va bene per tutti i fogli)
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
 *   modifichi una riga dal telefono (anche solo con l'app Sheets, i menu
 *   custom non servono per editare celle), entro ~10 minuti la modifica
 *   arriva da sola su GitHub (txt + json) e parte il deploy. Se qualcosa va
 *   storto ti arriva una mail di errore in automatico, e in ogni caso trovi
 *   lo storico nella scheda "Log" che lo script si crea da solo in questo
 *   foglio.
 *
 * COME DEVE ESSERE FATTO IL FOGLIO
 *   Due schede, una colonna A con una frase/completamento per riga (niente
 *   intestazione, prima riga = primo elemento). I nomi delle schede possono
 *   essere quelli standard "Frasi" / "Completamenti", oppure quelli usati
 *   nel foglio di Melanie Martinez ("Foglio2" per le frasi, "Melanie
 *   Completamenti" per i completamenti): lo script prova piu' nomi da solo,
 *   vedi FOGLI_FRASI / FOGLI_COMPLETAMENTI qui sotto. Se il tuo foglio ha un
 *   nome di scheda diverso da tutti questi, aggiungilo semplicemente alla
 *   lista.
 *   Le stesse regole di sempre per il testo: `_` per lo spazio da riempire,
 *   `§` davanti per forzare le maiuscole. La maiuscola iniziale della frase
 *   la mette gia' da sola questo script (e anche il server, e' ridondante
 *   apposta), non serve scriverla a mano.
 */

// ---------------------------------------------------------------- CONFIG ---

var GRUPPO = "standard"; // <-- cambia questo per ogni foglio

var GITHUB_OWNER = "arco2121";
var GITHUB_REPO = "CucuRidu";
var GITHUB_BRANCH = "main";

var FOGLI_FRASI = ["Frasi", "frasi", "Foglio2"];
var FOGLI_COMPLETAMENTI = ["Completamenti", "completamenti", "Melanie Completamenti"];

// ------------------------------------------------------------------ MENU ---

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Cucu Ridu")
    .addItem("Pubblica su GitHub", "pubblicaManuale")
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
  ui.alert("Fatto", "Token salvato per il gruppo \"" + GRUPPO + "\".", ui.ButtonSet.OK);
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

/** Legge la colonna A di un foglio come lista di stringhe non vuote, in ordine. */
function leggiColonna_(foglio) {
  var ultimaRiga = foglio.getLastRow();
  if (ultimaRiga < 1) return [];
  var valori = foglio.getRange(1, 1, ultimaRiga, 1).getDisplayValues();
  var righe = [];
  for (var i = 0; i < valori.length; i++) {
    var testo = String(valori[i][0] == null ? "" : valori[i][0]).trim();
    if (testo) righe.push(testo);
  }
  return righe;
}

function trovaDoppioni_(righe) {
  var visti = {};
  var doppioni = [];
  for (var i = 0; i < righe.length; i++) {
    var chiave = righe[i].toLowerCase().replace(/\s+/g, " ");
    if (visti[chiave]) doppioni.push(righe[i]);
    visti[chiave] = true;
  }
  return doppioni;
}

/** Ritorna { foglioFrasi, foglioCompletamenti, frasi, completamenti, avvisi } o lancia errore. */
function leggiDati_() {
  var foglioFrasi = trovaFoglio_(FOGLI_FRASI);
  var foglioCompletamenti = trovaFoglio_(FOGLI_COMPLETAMENTI);

  if (!foglioFrasi)
    throw new Error("Non trovo la scheda delle frasi. Provo questi nomi: " + FOGLI_FRASI.join(", ") + ". Aggiungi il nome giusto a FOGLI_FRASI nello script.");
  if (!foglioCompletamenti)
    throw new Error("Non trovo la scheda dei completamenti. Provo questi nomi: " + FOGLI_COMPLETAMENTI.join(", ") + ". Aggiungi il nome giusto a FOGLI_COMPLETAMENTI nello script.");

  var frasi = leggiColonna_(foglioFrasi);
  var completamenti = leggiColonna_(foglioCompletamenti);

  if (!frasi.length) throw new Error("La scheda \"" + foglioFrasi.getName() + "\" e' vuota.");
  if (!completamenti.length) throw new Error("La scheda \"" + foglioCompletamenti.getName() + "\" e' vuota.");

  var avvisi = [];
  var doppiFrasi = trovaDoppioni_(frasi);
  var doppiCompletamenti = trovaDoppioni_(completamenti);
  if (doppiFrasi.length) avvisi.push("Frasi doppie: " + doppiFrasi.join(" | "));
  if (doppiCompletamenti.length) avvisi.push("Completamenti doppi: " + doppiCompletamenti.join(" | "));

  return {
    foglioFrasi: foglioFrasi,
    foglioCompletamenti: foglioCompletamenti,
    frasi: frasi,
    completamenti: completamenti,
    avvisi: avvisi
  };
}

// --------------------------------------------------------- TRASFORMAZIONE --

/**
 * Stessa identica logica di generateCards.js / generateAllCards.js:
 * maiuscola iniziale automatica, conta i "_" per sapere quanti completamenti
 * servono. Le righe arrivano gia' trimmate da leggiColonna_.
 */
function costruisciArrayCarte_(righe) {
  var array = [];
  for (var i = 0; i < righe.length; i++) {
    var riga = righe[i];
    var stringa = riga.charAt(0).toUpperCase() + riga.slice(1);
    var numCompletamenti = (riga.match(/_/g) || []).length;
    array.push(numCompletamenti !== 0 ? [stringa, numCompletamenti] : stringa);
  }
  return array;
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
function pubblicaCarte_() {
  var dati = leggiDati_();
  var baseTxt = "ignore/scratch/raw/cards/" + GRUPPO + "/";
  var baseJson = "application/include/cards/" + GRUPPO + "/";

  var candidati = [
    { percorso: baseTxt + "frasi.txt", contenuto: dati.frasi.join("\n") + "\n" },
    { percorso: baseTxt + "completamenti.txt", contenuto: dati.completamenti.join("\n") + "\n" },
    { percorso: baseJson + "frasi.json", contenuto: JSON.stringify(costruisciArrayCarte_(dati.frasi)) },
    { percorso: baseJson + "completamenti.json", contenuto: JSON.stringify(costruisciArrayCarte_(dati.completamenti)) }
  ];

  var daScrivere = [];
  for (var i = 0; i < candidati.length; i++) {
    var attuale = githubLeggiContenuto_(candidati[i].percorso);
    if (attuale !== candidati[i].contenuto) daScrivere.push(candidati[i]);
  }

  var righeRiepilogo = [
    "Frasi: " + dati.frasi.length,
    "Completamenti: " + dati.completamenti.length
  ];
  if (dati.avvisi.length) righeRiepilogo.push("Avvisi: " + dati.avvisi.join(" / "));

  if (!daScrivere.length) {
    righeRiepilogo.push("Nessuna modifica rispetto a GitHub.");
    return { testo: righeRiepilogo.join("\n"), pubblicato: false };
  }

  githubCommitAtomico_(daScrivere, "Aggiorna carte: " + GRUPPO + " (da Google Sheets)");

  righeRiepilogo.push("Pubblicati " + daScrivere.length + " file:");
  for (var j = 0; j < daScrivere.length; j++) righeRiepilogo.push("  " + daScrivere[j].percorso);

  return { testo: righeRiepilogo.join("\n"), pubblicato: true };
}

// -------------------------------------------------------------- MANUALE ----

function pubblicaManuale() {
  var ui = SpreadsheetApp.getUi();
  try {
    var risultato = pubblicaCarte_();
    ui.alert(
      risultato.pubblicato ? "Pubblicato" : "Nessuna modifica",
      "Gruppo: " + GRUPPO + "\n\n" + risultato.testo,
      ui.ButtonSet.OK
    );
  } catch (e) {
    ui.alert("Ops", e.message, ui.ButtonSet.OK);
  }
}

function mostraControlli() {
  var ui = SpreadsheetApp.getUi();
  try {
    var dati = leggiDati_();
    var righe = [
      "Gruppo: " + GRUPPO,
      "Scheda frasi trovata: \"" + dati.foglioFrasi.getName() + "\" (" + dati.frasi.length + " righe)",
      "Scheda completamenti trovata: \"" + dati.foglioCompletamenti.getName() + "\" (" + dati.completamenti.length + " righe)",
      ""
    ];
    righe.push(dati.avvisi.length ? dati.avvisi.join("\n") : "Nessun problema trovato.");
    ui.alert("Controllo dei dati", righe.join("\n"), ui.ButtonSet.OK);
  } catch (e) {
    ui.alert("Ops", e.message, ui.ButtonSet.OK);
  }
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
    var risultato = pubblicaCarte_();
    scrivoLog_(risultato.pubblicato ? "pubblicato" : "invariato", risultato.testo);
  } catch (e) {
    scrivoLog_("errore", e.message);
    try {
      MailApp.sendEmail(
        Session.getActiveUser().getEmail(),
        "Cucu Ridu: errore pubblicazione carte (" + GRUPPO + ")",
        e.message
      );
    } catch (e2) {
      // se anche la mail fallisce non c'e' molto altro da fare, resta il log
    }
  }
}
