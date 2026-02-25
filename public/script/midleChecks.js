const settings = JSON.parse(localStorage.getItem("cucuRiduSettings") || "{}");
const token = settings.savingToken;
const params = new URLSearchParams(window.location.search);
if (!params.has("token") && token && fromBackEnd["loadToken"] !== false) {
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set("token", token);
    window.location.replace(newUrl.href);
}

/*
if(window.self !== window.top) {
    try {
        window.top.location.href = window.location.href;
    } catch {
        (async () => await renderFragment(document.body, "absolutePanel", {
            title: "Accesso negato",
            message: "Scusa, ma niente compenetrazioni ammesse",
            redirect: fromBackEnd["knownOrigin"] || window.location.href
        }))();
    }
}*/