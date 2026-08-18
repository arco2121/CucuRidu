off("aggiornamentoAttesaRisposta");
const attesaView = document.getElementById("attesa");
const numeroGiocatoriCount = document.getElementById("numeroGiocatori");
const showGiocatori = document.getElementById("showGiocatori");
const idStanza = fromFragments["stanzaId"];

on("aggiornamentoAttesaRisposta", (data) => {
    const {numeroGiocatori, totaleAttesi, giocatori} = data || {};
    numeroGiocatoriCount.textContent = numeroGiocatoriCount.textContent.split(":")[0] + ": "
        + (numeroGiocatori ?? 0)
        + (typeof totaleAttesi === "number" ? " / " + totaleAttesi : "");
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