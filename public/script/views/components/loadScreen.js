const loadingScreen = document.querySelector(".loadingscreen");
const timing = 250;
const isLoadScreen = () => document.body.contains(loadingScreen);
(() => {
    window.addEventListener("beforeunload", () => {
        if (!isLoadScreen()) {
            loadingScreen.style.animation = "none";
            loadingScreen.style.opacity = "1";
            document.body.appendChild(loadingScreen);
            intervalId = setInterval(update, timing);
        }
    });
    window.addEventListener("pageshow", (event) => {
        if (event.persisted) {
            document.dispatchEvent(unloadScreen);
        }
    });
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
    document.addEventListener("loadScreenEnd", () => {
        setTimeout(() => {
            clearInterval(intervalId);
            loadingScreen.style.animation = "disappear " + timing + "ms ease-out forwards";
            setTimeout(() => {
                try { document.body.removeChild(loadingScreen); }
                catch { clearInterval(intervalId); }
            }, timing);
        }, timing);
    });
    document.addEventListener("loadScreenStart", () => {
        loadingScreen.style.animation = "appear " + timing + "ms ease-in forwards";
        document.body.appendChild(loadingScreen);
        intervalId = setInterval(update, timing);
    });
})();