off("aggiornamentoAttesa");

const numeroGiocatoriCount = document.getElementById("numeroGiocatori");
const attesaView = document.getElementById("attesa");
const shareButton = document.getElementById("shareButton");
const showQrcode = document.getElementById("showQrcode");
const showGiocatori = document.getElementById("showGiocatori");
const startButton = document.getElementById("startButton");
const chiudiButton = document.getElementById("chiudiButton");
const packsButton = document.getElementById("packsButton");
const game_section = document.getElementById("game_section");
const qrcodeSharing = document.getElementById("qrCode");
const idStanza = fromFragments["stanzaId"];
const waitMenu = document.getElementById("waitMenu");
const url = "/partecipaStanza/" + idStanza;

on("aggiornamentoAttesa", (data) => {
    const {numeroGiocatori, minimoGiocatori, giocatori} = data || {};
    numeroGiocatoriCount.textContent = numeroGiocatoriCount.textContent.split(":")[0] + ": " + numeroGiocatori;
    if(numeroGiocatori < minimoGiocatori)
        attesaView.textContent = "Wait per altri giocatori ✨";
    else {
        if(fromFragments["interroghi"]) attesaView.textContent = "Muoviti a far partire ✨";
        else attesaView.textContent = "Wait per il prossimo turno ✨";
    }
    renderFragment(showGiocatori, "components/giocatoreRow", {
        giocatori: giocatori,
        animation: false
    });
});

emit("aggiornaAttesa", {
    stanzaId: idStanza
});

shareButton.addEventListener("click", async () => {
    const shareText = "Muovi il culo ed entra nella stanza per giocare inconcepibile sgorbio nato dall'errare umano che non sei altro :))";
    const copytext = "Codice copiato, ora usalo saggiamente scarto umano :))";
    const failText = "Codice non copiato, fai meno il fannullone e faglielo semplicemente vedere :))";
    const shareData = {
        title: "Cucu Ridu",
        text: shareText,
        url: url,
    };
    if (navigator.canShare(shareData)) await navigator.share(shareData).catch(_ => null);
    else await navigator.clipboard.writeText(idStanza).then(() => alert(copytext)).catch(_ => alert(failText));
});

showQrcode.addEventListener("click", () => {
    const qrCode = qrcodeSharing.querySelector("img");
    qrcodeSharing.classList.remove("instant");
qrcodeSharing.classList.remove("hidden_text");
    qrCode.onload = () => {
        waitMenu.dispatchEvent(hidePanel);
        qrcodeSharing.dispatchEvent(showPanel);
    };
    qrCode.onerror = () => alert("Evitiamo di piangere sul un QrCode rotto 😭");

    qrCode.src = "/qrCode?padding=2&url=" + encodeURIComponent(window.location.origin + url);
});

qrcodeSharing.addEventListener("click", () => {
    qrcodeSharing.dispatchEvent(hidePanel);
    waitMenu.dispatchEvent(showPanel);
});

startButton?.addEventListener("click", () => emit("iniziaTurno", {
    id: referenceStanza
}));

chiudiButton?.addEventListener("click", () => emit("terminaPartita", {
    id: referenceStanza
}));

packsButton?.addEventListener("click", () => {
    game_section.dispatchEvent(hidePanel);
    packsPanel.dispatchEvent(showPanel);
});