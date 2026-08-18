/**
 * Cucu Ridu - generatore di names.json da Google Sheets
 * ============================================================================
 *
 * COME SI INSTALLA
 *   1. Apri il foglio con i nomi e gli aggettivi
 *   2. Estensioni > Apps Script
 *   3. Cancella quello che c'e' dentro Codice.gs e incolla tutto questo file
 *   4. Salva, poi ricarica il foglio: in alto compare il menu "Cucu Ridu"
 *
 * COME DEVE ESSERE FATTO IL FOGLIO
 *   Un foglio chiamato "Nomi" con le colonne:        nome | genere
 *   Un foglio chiamato "Aggettivi" con le colonne:   neutro | maschile | femminile | plurale
 *
 *   Le intestazioni vanno sulla prima riga. L'ordine delle colonne non conta,
 *   vengono cercate per nome. Le colonne in piu (note, appunti, quello che vuoi)
 *   vengono ignorate.
 *
 *   Nella colonna genere puoi scrivere m / f / n / p oppure per esteso
 *   (maschile, femminile, neutro, plurale). Se la lasci vuota vale neutro.
 *
 * COSA FA
 *   Menu "Cucu Ridu" > "Genera names.json": apre una finestra con il JSON gia
 *   pronto e un bottone per copiarlo. I nomi doppi vengono tolti da soli
 *   (senza guardare maiuscole e spazi doppi) e ti dice quali ha tolto.
 *   Per gli aggettivi, le forme lasciate vuote ricadono sul neutro.
 */

// ---------------------------------------------------------------- CONFIG ---

// Nomi dei fogli. Il primo che esiste vince, il confronto ignora le maiuscole.
var FOGLI_NOMI = ["Nomi", "nomi", "nomi.csv", "Names"];
var FOGLI_AGGETTIVI = ["Aggettivi", "aggettivi", "aggettivi.csv", "Adjectives"];

var GENERI_VALIDI = ["m", "f", "n", "p"];

var ALIAS_GENERE = {
  "m": "m", "maschile": "m", "maschio": "m", "uomo": "m",
  "f": "f", "femminile": "f", "femmina": "f", "donna": "f",
  "n": "n", "neutro": "n", "neutrale": "n", "": "n",
  "p": "p", "plurale": "p", "plurali": "p"
};

// ------------------------------------------------------------------ MENU ---

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Cucu Ridu")
    .addItem("Genera names.json", "mostraJson")
    .addItem("Controlla i dati", "mostraControlli")
    .addToUi();
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

// --------------------------------------------------------- COSTRUZIONE -----

/**
 * Costruisce i dati finali.
 * Ritorna { json, nomi, aggettivi, doppioni, avvisi }
 */
function costruisciDati_() {
  var foglioNomi = trovaFoglio_(FOGLI_NOMI);
  var foglioAgg = trovaFoglio_(FOGLI_AGGETTIVI);

  if (!foglioNomi)
    throw new Error("Non trovo il foglio dei nomi. Deve chiamarsi \"Nomi\" e avere le colonne nome e genere.");
  if (!foglioAgg)
    throw new Error("Non trovo il foglio degli aggettivi. Deve chiamarsi \"Aggettivi\" e avere le colonne neutro, maschile, femminile, plurale.");

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

    nomi.push({
      nome: nome.charAt(0).toUpperCase() + nome.slice(1),
      genere: normalizzaGenere_(grezzo)
    });
  }

  // --- AGGETTIVI, le forme vuote ricadono sul neutro ------------------------
  var aggettivi = [];

  for (var k = 0; k < righeAgg.length; k++) {
    var r = righeAgg[k];
    var neutro = String(r["neutro"] || "").trim();
    var maschile = String(r["maschile"] || "").trim();
    var femminile = String(r["femminile"] || "").trim();
    var plurale = String(r["plurale"] || "").trim();

    var base = neutro || maschile || femminile || plurale;
    if (!base) continue;

    var mancanti = [];
    if (!maschile) mancanti.push("maschile");
    if (!femminile) mancanti.push("femminile");
    if (!plurale) mancanti.push("plurale");
    if (mancanti.length)
      avvisi.push("Riga " + r._riga + " degli aggettivi (" + base + "): manca " + mancanti.join(", ") + ", ho usato il neutro");

    aggettivi.push({
      n: neutro || base,
      m: maschile || neutro || base,
      f: femminile || neutro || base,
      p: plurale || maschile || neutro || base
    });
  }

  if (!nomi.length) throw new Error("Il foglio dei nomi e' vuoto.");
  if (!aggettivi.length) throw new Error("Il foglio degli aggettivi e' vuoto.");

  var finale = { version: 2, names: nomi, adjectives: aggettivi };

  return {
    json: JSON.stringify(finale, null, 2),
    nomi: nomi,
    aggettivi: aggettivi,
    doppioni: doppioni,
    avvisi: avvisi
  };
}

function contaGeneri_(nomi) {
  var conteggi = { m: 0, f: 0, n: 0, p: 0 };
  for (var i = 0; i < nomi.length; i++) conteggi[nomi[i].genere]++;
  return conteggi;
}

// -------------------------------------------------------------- FINESTRE ---

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
  var riepilogo = dati.nomi.length + " nomi (m " + g.m + ", f " + g.f + ", n " + g.n + ", p " + g.p + ")"
    + " e " + dati.aggettivi.length + " aggettivi";

  var note = [];
  if (dati.doppioni.length)
    note.push("<b>Nomi doppi tolti (" + dati.doppioni.length + "):</b> " + escapeHtml_(dati.doppioni.join(", ")));
  if (dati.avvisi.length)
    note.push("<b>Da controllare (" + dati.avvisi.length + "):</b><br>" + escapeHtml_(dati.avvisi.join("\n")).replace(/\n/g, "<br>"));

  var html = paginaJson_(dati.json, riepilogo, note.join("<hr>"));
  ui.showModalDialog(
    HtmlService.createHtmlOutput(html).setWidth(760).setHeight(620),
    "names.json pronto"
  );
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
    "Aggettivi validi: " + dati.aggettivi.length,
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
    '<div class="riepilogo" style="margin-top:8px">',
    'Incollalo in <code>application/include/names/names.json</code>',
    '</div>',
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
