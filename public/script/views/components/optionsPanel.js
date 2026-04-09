const optionPanel = document.getElementById("settings");
document.addEventListener("DOMContentLoaded", async () => {
    const musicBtn = document.getElementById("musicbtn");
    const soundBtn = document.getElementById("soundbtn");
    const exitOptionsBtn = document.getElementById("exitOptionsBtn");
    const vibrationBtn = document.getElementById("vibrationbtn");
    const notificationBtn = document.getElementById("notificationbtn");
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

    const initSettingsUI = async () => {
        const settings = JSON.parse(localStorage.getItem("cucuRiduSettings")) || {};
        const permesso = await concediPermesso();

        if (settings.audio === undefined) settings.audio = true;
        if (settings.sound === undefined) settings.sound = true;
        if (settings.vibration === undefined) settings.vibration = true;
        if (settings.notifications === undefined) settings.notifications = Boolean(permesso);
        if(permesso === false) settings.notifications = false;
        localStorage.setItem("cucuRiduSettings", JSON.stringify(settings));

        updateButtonUI(musicBtn, !!settings["audio"]);
        updateButtonUI(soundBtn, !!settings["sound"]);
        updateButtonUI(vibrationBtn, !!settings["vibration"]);
        updateButtonUI(notificationBtn, settings["notifications"] && Boolean(permesso));
    };

    await initSettingsUI();

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
    exitOptionsBtn.addEventListener("click", () => {
        optionPanel.dispatchEvent(hidePanel);
        sectionDefault.dispatchEvent(showPanel);
    });
});