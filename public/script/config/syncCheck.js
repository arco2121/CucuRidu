const syncAll = async () => {
    const data = JSON.parse(localStorage.getItem("cucuRiduSettings") || "{}");
    const currentOrigin = window.location.origin;

    const syncPromises = fromBackEnd.allowedOrigins
        .filter(origin => origin !== currentOrigin)
        .map(origin => {
            return new Promise((resolve) => {
                const iframe = document.createElement("iframe");
                iframe.src = origin + '/localStorageSync';
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
    setTimeout(() => {
        e.source.postMessage({ action: "sync_complete" }, e.origin);
    }, 0);
});