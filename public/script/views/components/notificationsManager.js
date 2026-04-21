const notificationsKey = fromBackEnd["notificationsKey"];
const settingsToCeck = JSON.parse(localStorage.getItem("cucuRiduSettings") || '{}');
let clientId = settings["clientId"];
if(!clientId)
    fetch("/ottieniClientId", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
    }).then(res => res.json()).then(json => {
        clientId = json["id"];
        localStorage.setItem("cucuRiduSettings", JSON.stringify({
            ...settingsToCeck,
            clientId: clientId
        }));
    }).catch(() => null);

const base64Encode = (base64String) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

const concediPush = async () => {
    try {
        const worker = await navigator.serviceWorker.ready;
        const subscription = await worker.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: base64Encode(notificationsKey),
        });

        await fetch("/registraNotifica", {
            method: "POST",
            body: JSON.stringify({
                subscription: subscription,
                clientId: clientId
            }),
            headers: { "Content-Type": "application/json" },
        });
    } catch (err) {
        console.error("Errore durante l'iscrizione:", err);
    }
}

const revocaPush = async () => {
    try {
        const worker = await navigator.serviceWorker.ready;
        const subscription = await worker.pushManager.getSubscription();

        if (subscription) {
            await fetch("/eliminaNotifica", {
                method: "POST",
                body: JSON.stringify({
                    endpoint: subscription.endpoint,
                    clientId: clientId
                }),
                headers: { "Content-Type": "application/json" },
            });
            await subscription.unsubscribe();
            const settings = JSON.parse(localStorage.getItem("cucuRiduSettings") || {});
            localStorage.setItem("cucuRiduSettings", JSON.stringify({
                ...settings,
                clientId: null
            }));
        }
    } catch (err) {
        console.error("Errore durante la disattivazione:", err);
    }
}

const concediPermesso = async () => {
    if (!("Notification" in window)) return false;

    const permesso = Notification.permission !== "default"
        ? Notification.permission
        : await Notification.requestPermission();

    return permesso === "granted" ? true : (permesso === "default" ? 0 : false);
};

const sendNotifica = async (title, message, icon = null, url = "") => {
    if (!(await concediPermesso())) return;
    const notifica = new Notification(title, {
        body: message,
        icon: icon ? icon : "/assets/icon_notification.png",
        badge: "/assets/icon_notification_mono.png",
        renotify: true,
        tag: 'cucuridu'
    });
    notifica.onclick = () => {
        window.focus();
        if (url) window.location.assign(url);
        notifica.close();
    };

    notifica.onerror = (err) => console.log("Errore notifica:", err);
    const handleVisibility = () => {
        if (!document.hidden) {
            notifica.close();
            document.removeEventListener("visibilitychange", handleVisibility);
        }
    };
    document.addEventListener("visibilitychange", handleVisibility);
};