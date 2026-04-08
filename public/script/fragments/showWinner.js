const domandaAttuale = document.querySelector(".domanda");
const vaiAvanti = document.getElementById("vaiAvanti");
const risposte = fromFragments["risposte"];
const vincitore = fromFragments["vincitore"];

const displayPfp = document.getElementById("displayPfp");
const winnerText = document.getElementById("winnerText");

displayPfp.src = vincitore.pfp;
winnerText.textContent = `✦ ${vincitore.username} ha vinto il round ✦`;

domandaAttuale.textContent = fillBlanks(domandaAttuale.textContent, risposte);

vaiAvanti.addEventListener("click", () => renderFragment(base, "wait", {
    stanzaId: referenceStanza,
    interroghi: fromFragments["interroghi"],
    primoRound: false,
    seiMaster: referenceGiocatore.masterRole,
}));