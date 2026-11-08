off("aggiornamentoAttesaRisposta");
const attesaView = document.getElementById("attesa");
const numeroGiocatoriCount = document.getElementById("numeroGiocatori");
const showGiocatori = document.getElementById("showGiocatori");
const idStanza = fromFragments["stanzaId"];
// la lista si ridisegna SOLO se e' cambiata: ridisegnarla svuota il
// riquadro e lo riempie di nuovo, e con transition:all il box si
// restringe e si riallarga (il "glitch" ogni secondo o due) oltre a
// riportare lo scroll in cima
let firmaCompletati = null;
const firmaDi = (lista) => JSON.stringify((lista || []).map(g => [g?.id, g?.username, g?.pfp]));

on("aggiornamentoAttesaRisposta", (data) => {
    const {numeroGiocatori, totaleAttesi, giocatori} = data || {};
    numeroGiocatoriCount.textContent = numeroGiocatoriCount.textContent.split(":")[0] + ": "
        + (numeroGiocatori ?? 0)
        + (typeof totaleAttesi === "number" ? " / " + totaleAttesi : "");
    const firma = firmaDi(giocatori);
    if (firma === firmaCompletati) return;
    firmaCompletati = firma;
    renderFragment(showGiocatori, "components/giocatoreRow", {
        giocatori: giocatori || [],
        animation: false
    });
});
emit("aggiornaAttesaRisposta", {
    stanzaId: idStanza
});
// se un aggiornamento si perde, non si resta con un conteggio vecchio addosso
fragmentInterval(() => emit("aggiornaAttesaRisposta", { stanzaId: idStanza }),
    8000, fromFragments["pageId"]);