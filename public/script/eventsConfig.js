const unloadScreen = new Event("loadScreenEnd");
const loadScreen = new Event("loadScreenStart");
const loadingScreen = document.querySelector(".loadingscreen");
const hideRendering = new Event("hideRenderingStart", {
    bubbles: true
});
const unhideRendering = new Event("hideRenderingEnd", {
    bubbles: true
});
const showPanel = new Event("showPanel", {
    bubbles: true
});
const hidePanel = new Event("hidePanel", {
    bubbles: true
});
const navigateWithLoading = (url) => {
    document.dispatchEvent(loadScreen);

    setTimeout(() => {
        if(typeof url === "function")
            return url();
        else
            window.location.href = url;
    }, timing);
};
const fragmentsCache = {};
const loadedScripts = new Set();
const renderFragment = async (root, page, params = {}) => {
    try {
        if(!fragmentsCache[page]) {
            const input = await fetch("/fragments/" + page + ".ejs");
            if(!input.ok) throw new Error("fragment not found");
            fragmentsCache[page] = await input.text();
        }
        const rendering = ejs.render(fragmentsCache[page], { ...params });
        root.innerHTML = rendering;
        const scripts = root.querySelectorAll("script");
        for (const oldScript of scripts) {
            const scriptId = oldScript.id || oldScript.getAttribute("src") || oldScript.textContent.trim();
            if (loadedScripts.has(scriptId)) continue;
            const newScript = document.createElement("script");
            Array.from(oldScript.attributes).forEach(attr => {
                newScript.setAttribute(attr.name, attr.value);
            });
            newScript.textContent = oldScript.textContent;
            loadedScripts.add(scriptId);
            document.body.appendChild(newScript);
            newScript.remove();
        }
        return rendering;
    } catch (e) {
        console.error(e);
    }
};

(() => {
    document.addEventListener("hideRenderingStart", (e) => {
        const container = e.target;
        container.classList.add("hideRendering");
    });
    document.addEventListener("hideRenderingEnd", (e) => {
        const container = e.target;
        container.classList.remove("hideRendering");
    });
    document.addEventListener('hidePanel', (e) => {
        const section = e.target;
        section.classList.replace('visible', 'hidden');
    });
    document.addEventListener("showPanel", (e) => {
        const panel = e.target;
        setTimeout(() => panel.classList.replace('hidden', 'visible'), timing);
    });
})();

const settings = JSON.parse(localStorage.getItem("cucuRiduSettings") || "{}");
const token = settings.savingToken;
const params = new URLSearchParams(window.location.search);
if (!params.has("token") && token) {
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