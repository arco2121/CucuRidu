const loadingScreen = document.querySelector(".loadingscreen");
const timing = 250;
const isLoadScreen = () => document.body.contains(loadingScreen);
(() => {
    const update = () => {
        try {
            if (document.getElementById("textLoading").textContent === "Caricando...")
                document.getElementById("textLoading").textContent = "Caricando";
            else
                document.getElementById("textLoading").textContent += '.';
        } catch {
            clearInterval(intervalId);
        }
    };
    let intervalId = setInterval(update, timing);

    window.addEventListener("beforeunload", () => {
        if (window.__cucuExternalNav) return;
        if (!isLoadScreen()) {
            clearInterval(intervalId);
            loadingScreen.style.animation = "none";
            loadingScreen.style.opacity = "1";
            document.body.appendChild(loadingScreen);
            intervalId = setInterval(update, timing);
        }
    });

    window.addEventListener("pageshow", (event) => {
        if (event.persisted || (document.readyState === "complete" && !window.__cucuInternalNav)) {
            document.dispatchEvent(unloadScreen);
        }
    });

    // Quando si torna da un link esterno (es. GitHub Regole su Android),
    // la pagina non ricarica ma torna visibile con la loading screen ancora appesa
    const nascondiSeBloccata = () => {
        if (document.hidden) return;
        if (document.readyState === "complete" && isLoadScreen() && !window.__cucuInternalNav) {
            document.dispatchEvent(unloadScreen);
        }
    };
    document.addEventListener("visibilitychange", nascondiSeBloccata);
    window.addEventListener("focus", nascondiSeBloccata);

    document.addEventListener("loadScreenEnd", () => {
        setTimeout(() => {
            clearInterval(intervalId);
            loadingScreen.style.animation = "disappear " + timing + "ms ease-out forwards";
            setTimeout(() => {
                try { document.body.removeChild(loadingScreen); window?.Capacitor?.Plugins?.SplashScreen?.hide?.(); }
                catch { clearInterval(intervalId); }
            }, timing);
        }, timing);
    });

    document.addEventListener("loadScreenStart", () => {
        clearInterval(intervalId);
        loadingScreen.style.animation = "appear " + timing + "ms ease-in forwards";
        document.body.appendChild(loadingScreen);
        intervalId = setInterval(update, timing);
    });
})();