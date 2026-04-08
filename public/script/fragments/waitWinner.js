off("aggiornamentoAttesaRisposta");
const attesaView = document.getElementById("attesa");
const numeroGiocatoriCount = document.getElementById("numeroGiocatori");
const showGiocatori = document.getElementById("showGiocatori");
const idStanza = fromFragments["stanzaId"];

on("aggiornamentoAttesaRisposta", (data) => {
    const {numeroGiocatori, giocatori} = data || {};
    numeroGiocatoriCount.textContent = numeroGiocatoriCount.textContent.split(":")[0] + ": " + numeroGiocatori;
    renderFragment(showGiocatori, "components/giocatoreRow", {
        giocatori: giocatori,
        animation: false
    });
});
emit("aggiornaAttesaRisposta", {
    stanzaId: idStanza
});