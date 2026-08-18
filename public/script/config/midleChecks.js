/**
 * Controllo dell'host corrente.
 *
 * Prima bastava UN ping fallito (tab in background, passaggio wifi/4G, server
 * che ci mette piu di 5 secondi) per fare window.location.replace su un altro
 * deploy: dal punto di vista del giocatore era una disconnessione dal nulla,
 * senza aver toccato niente. Ora il salto avviene solo se l'host attuale e'
 * davvero irraggiungibile per piu controlli di fila, la pagina e' visibile e
 * il browser si considera online.
 */
const FALLIMENTI_PRIMA_DI_CAMBIARE_HOST = 3;
let fallimentiConsecutivi = 0;
let cambioHostInCorso = false;

const raggiungibile = async (origine, ms) => {
    try {
        await fetch(origine + '/ping', { mode: 'no-cors', cache: 'no-store', signal: AbortSignal.timeout(ms) });
        return true;
    } catch (e) { return false; }
};

const checkHost = async (hosts) => {
    if (cambioHostInCorso) return;
    if (document.hidden) return;               // in background i fetch vengono strozzati
    if (navigator.onLine === false) return;    // e' caduta la rete del giocatore, non il server

    if (await raggiungibile(window.location.origin, 8000)) {
        fallimentiConsecutivi = 0;
        return;
    }

    fallimentiConsecutivi++;
    if (fallimentiConsecutivi < FALLIMENTI_PRIMA_DI_CAMBIARE_HOST) return;

    for (const host of hosts || []) {
        if (!host || host === window.location.origin) continue;
        if (!(await raggiungibile(host, 4000))) continue;
        cambioHostInCorso = true;
        const newUrl = new URL(host + location.pathname + location.search);
        if (token) newUrl.searchParams.set("token", token);
        window.location.replace(newUrl.href);
        return;
    }
    fallimentiConsecutivi = 0;
};

const settings = JSON.parse(localStorage.getItem("cucuRiduSettings") || "{}");
if (fromBackEnd["deleteToken"] === true) {
    settings["savingToken"] = null;
    localStorage.setItem("cucuRiduSettings", JSON.stringify(settings));
}

const token = settings.savingToken;
const params = new URLSearchParams(window.location.search);
if (!params.has("token") && token && fromBackEnd["loadToken"] !== false) {
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set("token", token);
    window.location.replace(newUrl.href);
}

setInterval(() => checkHost(fromBackEnd["allowedOrigins"]), 30000);
document.addEventListener("visibilitychange", () => {
    if (!document.hidden) fallimentiConsecutivi = 0;
});