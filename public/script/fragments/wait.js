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

const resolveFullShareUrl = async () => {
    if (window.CucuRiduLan) {
        const lanOrigin = window.CucuRiduLan.refreshHostUrl
            ? await window.CucuRiduLan.refreshHostUrl()
            : window.CucuRiduLan.getHostJoinUrl?.();
        if (!lanOrigin || !/^https?:\/\/\d+\.\d+\.\d+\.\d+/i.test(lanOrigin)) {
            return null;
        }
        return lanOrigin.replace(/\/$/, "") + url;
    }
    return window.location.origin.replace(/\/$/, "") + url;
};

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
    const copytext = "Link copiato, ora usalo saggiamente scarto umano :))";
    const failText = "Link non copiato, fai meno il fannullone e faglielo semplicemente vedere :))";
    const fullUrl = await resolveFullShareUrl();

    if (!fullUrl) {
        alert("Connettiti a un Wi-Fi o attiva l'Hotspot del telefono prima di condividere il link!");
        return;
    }

    const shareData = {
        title: "Cucu Ridu",
        text: shareText,
        url: fullUrl,
    };

    if (typeof navigator.share === "function" && (!navigator.canShare || navigator.canShare(shareData))) {
        try {
            await navigator.share(shareData);
            return;
        } catch (err) {
            if (err?.name === "AbortError") return;
        }
    }

    await navigator.clipboard.writeText(fullUrl)
        .then(() => alert(copytext))
        .catch(() => alert(failText));
});

showQrcode.addEventListener("click", async () => {
    const fullUrl = await resolveFullShareUrl();
    if (!fullUrl) {
        alert("Connettiti a un Wi-Fi o attiva l'Hotspot del telefono prima di mostrare il QR Code!");
        return;
    }

    const qrCode = qrcodeSharing.querySelector("img");
    qrCode.onload = () => {
        waitMenu.dispatchEvent(hidePanel);
        qrcodeSharing.dispatchEvent(showPanel);
        setTimeout(() => {
            qrcodeSharing.classList.remove("hidden_text");
            qrcodeSharing.classList.remove("instant");
        }, timeOut);
    };
    qrCode.onerror = () => alert("Evitiamo di piangere sul un QrCode rotto 😭");

    qrCode.src = "/qrCode?padding=2&url=" + encodeURIComponent(fullUrl);
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