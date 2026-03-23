const path = window.location.pathname;
const HOSTS = [
    'https://cucuridu.onrender.com',
    'https://arco2120-cucuridu.hf.space'
];

const pingHost = async (host) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);
    try {
        const response = await fetch(host + "/ping", {
            method: 'head',
            mode: "cors",
            signal: controller.signal
        });
        if (response.ok) return host;
        throw new Error("Host non pronto");
    } finally {
        clearTimeout(timeoutId);
    }
};

(async () => {
    try {
        const fastestHost = await Promise.any(HOSTS.map(pingHost));
        window.location.replace(fastestHost + path);
    } catch (e) {
        document.body.innerText = "Nessun server disponibile. Riprova più tardi.";
        console.error("Tutti gli host sono offline", e);
    }
})();