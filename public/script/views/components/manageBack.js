document.body.style.overscrollBehaviorX = "none";
const preventBack = new CustomEvent("activatePreventBack");
let exitFrom = false;
(() => {
    let oneConfirm = false;
    let active = false;

    const confirmMessgaes = [
        "Vuoi davvero abbandonare il gioco in questa balorda maniera?",
        "Teresa non ladciarmi per favore",
        "Papi non ci serve il latte, resta",
        "Pretty pls non uscire",
        "Guarda che scappi a tuo rischio e pericolo",
        "你這混蛋，別離開網站!",
        "Suriin bago ka lumabas nang random, bakla",
        "Te ne vai? È proprio vero che i tradimenti non arrivano mai da un nemico",
        "Davvero te ne vai? Ci abbiamo lavorato tanto pls :c",
        "Nuuuuu che fai??? vuoi usciree???? :CCCCC",
        "Ah, quindi mi ghosti così? Wow.",
        "Se esci sei ufficialmente un NPC.",
        "It's giving abbandono, e non mi piace per niente.",
        "Ma sei serio? Proprio davanti alla mia insalata?",
        "Guarda che ho problemi di abbandono, non farmi questo 😭",
        "Questa mancanza di commitment è preoccupante, tesoro...",
        "Andartene ora? Da rimasti tbh",
        "Il tasto esci è solo per chi non ha taste 💅🏻"
    ];

    const currentFullPath = () =>
        window.location.pathname + window.location.search + window.location.hash;

    const isPanelVisible = (el) => {
        if (!el) return false;
        if (el.classList.contains("visible") || el.classList.contains("in")) return true;
        return !el.classList.contains("hidden") && !el.classList.contains("out") && el.offsetParent !== null;
    };

    const closeTopOverlay = () => {
        const lightbox = document.getElementById("pfpLightbox");
        if (lightbox && (lightbox.classList.contains("in") || !lightbox.classList.contains("hidden"))) {
            lightbox.dispatchEvent(hideOutOpacity);
            return true;
        }

        const gameSection = document.getElementById("game_section");
        const waitMenu = document.getElementById("waitMenu");
        const qrCode = document.getElementById("qrCode");
        if (isPanelVisible(qrCode)) {
            qrCode.dispatchEvent(hidePanel);
            waitMenu?.dispatchEvent(showPanel);
            return true;
        }

        const gamePanels = ["packsPanel", "segnalaMenu", "suggerisciMenu", "chatMenu", "pauseMenu"];
        for (const panelId of gamePanels) {
            const panel = document.getElementById(panelId);
            if (isPanelVisible(panel)) {
                panel.dispatchEvent(hidePanel);
                gameSection?.dispatchEvent(showPanel);
                return true;
            }
        }

        for (const settingsId of ["optionPanel", "settings"]) {
            const panel = document.getElementById(settingsId);
            if (isPanelVisible(panel)) {
                panel.dispatchEvent(hidePanel);
                (gameSection || document.querySelector(".sectionToHide"))?.dispatchEvent(showPanel);
                return true;
            }
        }

        const profile = document.getElementById("profile");
        for (const profPanelId of ["selectPfp", "selectUsername"]) {
            const panel = document.getElementById(profPanelId);
            if (isPanelVisible(panel)) {
                panel.dispatchEvent(hidePanel);
                profile?.dispatchEvent(showPanel);
                return true;
            }
        }

        return false;
    };

    const confirmLeave = () => {
        if (oneConfirm) return false;
        const ok = confirm(confirmMessgaes[Math.floor(Math.random() * confirmMessgaes.length)]);
        if (ok) oneConfirm = true;
        return ok;
    };

    const performExitOrLeave = () => {
        if (typeof lasciaStanza === "function") {
            lasciaStanza();
            return;
        }
        if (exitFrom) {
            if (window.CucuNativeAndroid?.exitApp) {
                window.CucuNativeAndroid.exitApp();
                return;
            }
            if (window.Capacitor?.Plugins?.App?.exitApp) {
                window.Capacitor.Plugins.App.exitApp();
                return;
            }
            window.close();
            setTimeout(() => { oneConfirm = false; }, 500);
            return;
        }
        history.back();
    };

    const handleBackAction = () => {
        if (closeTopOverlay()) return;

        const path = window.location.pathname;
        const isHome = path === "/" || path.endsWith("/index.html");
        const isGame = path === "/game" || path.endsWith("/game.html");

        if (isGame) {
            if (typeof vistaCorrente !== "undefined" && vistaCorrente === "endGame") {
                performExitOrLeave();
                return;
            }
            if (confirmLeave()) performExitOrLeave();
            return;
        }

        if (isHome) {
            if (confirmLeave()) performExitOrLeave();
            return;
        }

        const target = path.endsWith("/partecipaStanzaProfile.html")
            ? "/partecipaStanza.html"
            : (window.CucuRiduLan ? "/index.html" : "/");
        if (typeof navigateWithLoading === "function") navigateWithLoading(target, true);
        else window.location.replace(target);
    };

    document.addEventListener("activatePreventBack", () => {
        history.pushState({ page: 1 }, null, currentFullPath());
        active = true;
    });
    window.addEventListener("beforeunload", () => {
        if (window.self !== window.top)
            history.pushState({ page: 1 }, null, currentFullPath());
    });
    window.addEventListener("popstate", (e) => {
        if (closeTopOverlay()) {
            history.pushState({ page: 1 }, null, currentFullPath());
            return;
        }
        if (!active) return;
        e.preventDefault();
        if (oneConfirm) return;
        if (confirmLeave()) {
            performExitOrLeave();
        } else {
            history.pushState({ page: 1 }, null, currentFullPath());
        }
    });

    window.CucuRiduBack = {
        closeTopOverlay,
        confirmLeave,
        handleBackAction
    };
})();