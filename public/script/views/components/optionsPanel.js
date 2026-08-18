const optionPanel = document.getElementById("settings");
document.addEventListener("DOMContentLoaded", async () => {
    const musicBtn = document.getElementById("musicbtn");
    const soundBtn = document.getElementById("soundbtn");
    const exitOptionsBtn = document.getElementById("exitOptionsBtn");
    const vibrationBtn = document.getElementById("vibrationbtn");
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

        // impostazioni rimosse: non devono restare in giro nel localStorage
        delete settings.translate;
        delete settings.notifications;
        delete settings.clientId;

        updateButtonUI(musicBtn, !!settings["audio"]);
        updateButtonUI(soundBtn, !!settings["sound"]);
        updateButtonUI(vibrationBtn, !!settings["vibration"]);
        localStorage.setItem("cucuRiduSettings", JSON.stringify(settings));
    };

    initSettingsUI();

    // Event Listeners
    musicBtn?.addEventListener("click", async (e) => {
        toggleSetting(e, "audio");
        await playAudio("audio");
    });
    soundBtn?.addEventListener("click", (e) => toggleSetting(e, "sound"));
    vibrationBtn?.addEventListener("click", (e) => toggleSetting(e, "vibration"));

    exitOptionsBtn?.addEventListener("click", () => {
        optionPanel.dispatchEvent(hidePanel);
        sectionDefault.dispatchEvent(showPanel);
    });
});
