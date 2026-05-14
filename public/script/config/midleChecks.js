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
const syncAll = async () => {
    const data = JSON.parse(localStorage.getItem("cucuRiduSettings") || "{}");
    const currentOrigin = window.location.origin;

    const syncPromises = fromBackEnd.allowedOrigins
        .filter(origin => origin !== currentOrigin)
        .map(origin => {
            return new Promise((resolve) => {
                const iframe = document.createElement("iframe");
                iframe.src = origin;
                iframe.style.display = "none";
                document.body.appendChild(iframe);

                const handleResponse = (e) => {
                    if (e.origin === origin && e.data.action === "sync_complete") {
                        window.removeEventListener("message", handleResponse);
                        document.body.removeChild(iframe);
                        resolve();
                    }
                };

                window.addEventListener("message", handleResponse);
                iframe.onload = () => iframe.contentWindow.postMessage({ action: "sync", value: data }, origin);

                setTimeout(() => {
                    if (document.body.contains(iframe)) document.body.removeChild(iframe);
                    resolve();
                }, 7000);
            });
        });

    await Promise.all(syncPromises);
};

window.addEventListener("message", (e) => {
    if (!fromBackEnd.allowedOrigins.includes(e.origin) || e.data.action !== "sync") return;

    const local = JSON.parse(localStorage.getItem("cucuRiduSettings") || "{}");
    const merged = { ...local, ...e.data.value };

    localStorage.setItem("cucuRiduSettings", JSON.stringify(merged));
    alert("Complete")
    e.source.postMessage({ action: "sync_complete" }, e.origin);
});

(async () => {
    await syncAll();
    
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
})();

setInterval(() => checkHost(fromBackEnd["allowedOrigins"]), 20000);