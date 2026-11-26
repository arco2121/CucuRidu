/**
 * Controllo dell'host corrente e sincronizzazione token cross-cluster.
 * I token viaggiano nell'URL SOLO durante un salto tra domini diversi
 * (portale -> nodo o failover checkHost) e vengono subito rimossi dalla
 * barra degli indirizzi tramite history.replaceState senza ricaricare.
 */
const FALLIMENTI_PRIMA_DI_CAMBIARE_HOST = 3;
let fallimentiConsecutivi = 0;
let cambioHostInCorso = false;

const parseJwtPayload = (jwt) => {
    try {
        const part = String(jwt || "").split(".")[1];
        if (!part) return null;
        const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
        return JSON.parse(atob(base64));
    } catch {
        return null;
    }
};

(() => {
    // In modalità LAN Android i token non vanno sincronizzati su host esterni
    if (window.__cucuRiduSsoRedirecting || fromBackEnd?.lanMode) return;

    const currentUrl = new URL(window.location.href);
    const params = currentUrl.searchParams;
    const settings = JSON.parse(localStorage.getItem("cucuRiduSettings") || "{}");

    if (fromBackEnd["deleteToken"] === true) {
        settings["savingToken"] = null;
        localStorage.setItem("cucuRiduSettings", JSON.stringify(settings));
    }

    // 1. Se arriviamo da un altro host (portale o failover), salva i token in
    //    localStorage e ripulisci subito l'URL senza ricaricare la pagina.
    const urlToken = params.get("token");
    const urlIdToken = params.get("idToken");
    let urlModificato = false;

    if (urlToken && fromBackEnd["deleteToken"] !== true) {
        settings["savingToken"] = urlToken;
        localStorage.setItem("cucuRiduSettings", JSON.stringify(settings));
    }
    if (urlIdToken) {
        localStorage.setItem("cucuRiduToken", urlIdToken);
    }

    if (params.has("token")) {
        params.delete("token");
        urlModificato = true;
    }
    if (params.has("idToken")) {
        params.delete("idToken");
        urlModificato = true;
    }
    if (urlModificato) {
        window.history.replaceState(null, "", currentUrl.pathname + currentUrl.search + currentUrl.hash);
    }

    // 2. Solo sulla Home (loadToken !== false): se in localStorage c'e' una
    //    partita salvata e non siamo appena arrivati con ?token=, verifica in
    //    background se la stanza esiste ancora prima di aprire /game.
    const activeToken = settings.savingToken;
    if (!urlToken && activeToken && fromBackEnd["loadToken"] !== false && fromBackEnd["deleteToken"] !== true) {
        const payload = parseJwtPayload(activeToken);
        if (payload?.stanzaId) {
            fetch("/doRoomExists", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ roomId: payload.stanzaId })
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data?.result) {
                        const gameUrl = new URL("/game", window.location.origin);
                        gameUrl.searchParams.set("token", activeToken);
                        window.location.replace(gameUrl.href);
                    } else {
                        const latest = JSON.parse(localStorage.getItem("cucuRiduSettings") || "{}");
                        latest["savingToken"] = null;
                        localStorage.setItem("cucuRiduSettings", JSON.stringify(latest));
                    }
                })
                .catch(() => {});
        }
    }
})();

const raggiungibile = async (origine, ms) => {
    try {
        await fetch(origine + '/ping', { mode: 'no-cors', cache: 'no-store', signal: AbortSignal.timeout(ms) });
        return true;
    } catch {
        return false;
    }
};

const checkHost = async (hosts) => {
    if (window.__cucuRiduSsoRedirecting || fromBackEnd?.lanMode) return;
    if (cambioHostInCorso) return;
    if (document.hidden) return;
    if (navigator.onLine === false) return;

    if (await raggiungibile(window.location.origin, 8000)) {
        fallimentiConsecutivi = 0;
        return;
    }

    fallimentiConsecutivi++;
    if (fallimentiConsecutivi < FALLIMENTI_PRIMA_DI_CAMBIARE_HOST) return;

    const currentSettings = JSON.parse(localStorage.getItem("cucuRiduSettings") || "{}");
    const currentToken = currentSettings.savingToken;
    const currentIdToken = localStorage.getItem("cucuRiduToken");

    for (const host of hosts || []) {
        if (!host || host === window.location.origin) continue;
        if (!(await raggiungibile(host, 4000))) continue;
        cambioHostInCorso = true;
        const targetUrl = new URL(host + location.pathname + location.search);
        if (currentToken) targetUrl.searchParams.set("token", currentToken);
        if (currentIdToken) targetUrl.searchParams.set("idToken", currentIdToken);
        window.location.replace(targetUrl.href);
        return;
    }
    fallimentiConsecutivi = 0;
};

setInterval(() => checkHost(fromBackEnd["allowedOrigins"]), 30000);
document.addEventListener("visibilitychange", () => {
    if (!document.hidden) fallimentiConsecutivi = 0;
});