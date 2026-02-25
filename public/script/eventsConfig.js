const unloadScreen = new CustomEvent("loadScreenEnd");
const loadScreen = new CustomEvent("loadScreenStart");
const loadingScreen = document.querySelector(".loadingscreen");
const hideRendering = new CustomEvent("hideRenderingStart", {
    bubbles: true
});
const unhideRendering = new CustomEvent("hideRenderingEnd", {
    bubbles: true
});
const showPanel = new CustomEvent("showPanel", {
    bubbles: true
});
const hidePanel = new CustomEvent("hidePanel", {
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