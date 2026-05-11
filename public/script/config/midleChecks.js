const checkHost = async (hosts) => {
    try {await fetch(window.location.origin + '/ping', { mode: 'no-cors', signal: AbortSignal.timeout(5000) });} catch (e) {
        for (const host of hosts) {
            if (host === window.location.origin) continue;
            try {
                await fetch(host + '/ping', { mode: 'no-cors', signal: AbortSignal.timeout(3000) });
                const newUrl = new URL(host + location.pathname + location.search);
                newUrl.searchParams.set("token", token);
                window.location.replace(newUrl.href);
                break;
            } catch (err) {}
        }
    }
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

if(settings.translate) document.addEventListener("DOMContentLoaded", () => translateDom(null, lang));

setInterval(() => checkHost(fromBackEnd["allowedOrigins"]), 20000);