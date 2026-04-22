const optionPanel = document.getElementById("settings");
document.addEventListener("DOMContentLoaded", async () => {
    const musicBtn = document.getElementById("musicbtn");
    const soundBtn = document.getElementById("soundbtn");
    const exitOptionsBtn = document.getElementById("exitOptionsBtn");
    const vibrationBtn = document.getElementById("vibrationbtn");
    const notificationBtn = document.getElementById("notificationbtn");
    const translationBtn = document.getElementById("translationbtn");
    const sectionDefault = document.querySelector(".sectionToHide");
    const updateButtonUI = (btn, isOn) => {
        if(!btn) return;
        btn.textContent = isOn ? "On" : "Off";
        if(isOn) {
            btn.classList.add("btn_style_confirm");
            btn.classList.remove("btn_style_critical");
        } else {
            btn.classList.add("btn_style_critical");
            btn.classList.remove("btn_style_confirm");
        }
    };

    const toggleSetting = (event, property, value = null) => {
        const settings = JSON.parse(localStorage.getItem("cucuRiduSettings")) || {};
        settings[property] = value !== null ? (value && !settings[property]) : !settings[property];
        localStorage.setItem("cucuRiduSettings", JSON.stringify(settings));
        updateButtonUI(event?.currentTarget ?? event, settings[property]);
    };

    const initSettingsUI = () => {
        const settings = JSON.parse(localStorage.getItem("cucuRiduSettings")) || {};
        if (settings.audio === undefined) settings.audio = true;
        if (settings.sound === undefined) settings.sound = true;
        if (settings.vibration === undefined) settings.vibration = true;
        if (settings.translate === undefined) settings.translate = false;

        updateButtonUI(musicBtn, !!settings["audio"]);
        updateButtonUI(soundBtn, !!settings["sound"]);
        updateButtonUI(vibrationBtn, !!settings["vibration"]);
        updateButtonUI(translationBtn, !!settings["translate"]);
        localStorage.setItem("cucuRiduSettings", JSON.stringify(settings));

        (async () => {
            const settingsAfter = JSON.parse(localStorage.getItem("cucuRiduSettings")) || {};
            const permesso = await concediPermesso();
            if (settings.notifications === undefined) settingsAfter.notifications = Boolean(permesso);
            if (permesso === false) settingsAfter.notifications = false;
            localStorage.setItem("cucuRiduSettings", JSON.stringify(settingsAfter));
            updateButtonUI(notificationBtn, settingsAfter["notifications"] && Boolean(permesso))
        })();
    };

    initSettingsUI();

    // Event Listeners
    musicBtn.addEventListener("click", async (e) => {
        toggleSetting(e, "audio");
        await playAudio("audio");
    });
    soundBtn.addEventListener("click", (e) => toggleSetting(e, "sound"));
    vibrationBtn.addEventListener("click", (e) => toggleSetting(e, "vibration"));

    notificationBtn.addEventListener("click", async () => {
        const permesso = await concediPermesso();
        if(permesso === false) alert("Non so se hai notato che il permesso lo hai disattivato TU!");
        toggleSetting(notificationBtn, "notifications", Boolean(permesso));
        const settings = JSON.parse(localStorage.getItem("cucuRiduSettings")) || {};
        if(fromBackEnd["notifications"]) {
            if(settings.notifications) await concediPush();
            else await revocaPush();
        }
    });

    translationBtn.addEventListener("click", async (e) => {
        toggleSetting(e, "translate");
        const settings = JSON.parse(localStorage.getItem("cucuRiduSettings")) || {};
        if(settings["translate"]) await translateDom(null, lang);
        else restoreOriginal();
    });

    exitOptionsBtn.addEventListener("click", () => {
        optionPanel.dispatchEvent(hidePanel);
        sectionDefault.dispatchEvent(showPanel);
    });
});