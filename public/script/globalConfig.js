const fromBackEnd = (() => {
    const data = document.querySelector("meta[name='dataFromBackEnd']").getAttribute("content");
    document.querySelector("meta[name='dataFromBackEnd']").remove();
    return JSON.parse(data);
})();
const cssVars = (fileName) => {
    const variableNames = new Set();
    const sheets = fileName
        ? Array.from(document.styleSheets).filter(s => s.href && s.href.includes(fileName))
        : Array.from(document.styleSheets);
    sheets.forEach(sheet => {
        try {
            const rules = Array.from(sheet.cssRules ?? []);

            rules.forEach(rule => {
                if (rule.style) {
                    for (const propName of rule.style) {
                        if (propName.startsWith('--')) {
                            variableNames.add(propName);
                        }
                    }
                }
            });
        } catch (e) {
            console.warn(sheet.href, e);
        }
    });
    return Array.from(variableNames);
};
const fragmentsCache = {};
const renderFragment = async (root, page, params = {}) => {
    try {
        if(!fragmentsCache[page]) {
            const input = await fetch("/fragments/" + page + ".ejs");
            if(!input.ok) throw new Error("fragment not found");
            fragmentsCache[page] = await input.text();
        }
        const rendering = ejs.render(fragmentsCache[page], params);
        root.innerHTML = rendering;
        return rendering;
    } catch (e) {
        console.error(e);
    }
}
/*
(async () => {
    const colors = await (await fetch('/assets/colors.json')).json();
    const usedColorNames = new Set();
    const randomColor = () => {
        const available = colors['colors'].filter(c => !usedColorNames.has(c.name));
        if (available.length === 0) return colors['colors'][0];
        const color = available[Math.floor(Math.random() * available.length)];
        usedColorNames.add(color.name);
        return color;
    }
    const textColors = colors['texts'];
    const staticColors = colors['staticColors'];
    const vars = cssVars("global.css");
    let colorRandom = randomColor();
    vars.filter(colore => colore.includes('--background-variant'))
        .forEach(color => {
            document.documentElement.style.setProperty(color, color.includes("-dark") ? colorRandom["dark"] : colorRandom["normal"]);
            vars.splice(vars.indexOf(color), 1);
        });

    colorRandom = randomColor();
    vars.filter(colore => colore.includes('--background'))
        .forEach(color => {
            document.documentElement.style.setProperty(color, color.includes("-dark") ? colorRandom["dark"] : colorRandom["normal"]);
            vars.splice(vars.indexOf(color), 1);
        });

    colorRandom = JSON.parse(localStorage.getItem("cucuRiduSettings"))["loadingColorBack"] || randomColor();
    vars.filter(colore => colore.includes('--loadingScreen-background'))
        .forEach(color => {
            document.documentElement.style.setProperty(color, color.includes("-dark") ? colorRandom["dark"] : colorRandom["normal"]);
            vars.splice(vars.indexOf(color), 1);
        });
    localStorage.setItem("cucuRiduSettings", JSON.stringify({
        ...JSON.parse(localStorage.getItem("cucuRiduLoding")),
        loadingColorBack: colorRandom
    }));

    colorRandom = JSON.parse(localStorage.getItem("cucuRiduSettings"))["loadingColorAccent"] || randomColor();
    vars.filter(colore => colore.includes('--loadingScreen-accent'))
        .forEach(color => {
            document.documentElement.style.setProperty(color, color.includes("-outline") ? colorRandom["outline"] : colorRandom["normal"]);
            vars.splice(vars.indexOf(color), 1);
        });
    localStorage.setItem("cucuRiduSettings", JSON.stringify({
        ...JSON.parse(localStorage.getItem("cucuRiduSettings")),
        loadingColorAccent: colorRandom
    }));

    for(let i = 1; i <= 3; i++) {
        colorRandom = randomColor();
        vars.filter(colore => colore.includes("--accent-color-" + i)).forEach(color => {
            let variante = "normal";
            if(color.includes("-dark")) variante = "dark";
            else if(color.includes("-outline")) variante = "outline";
            else if(color.includes("-text")) variante = "text";
            else if(color.includes("-middle")) variante = "middle";
            document.documentElement.style.setProperty(color, colorRandom[variante]);
            vars.splice(vars.indexOf(color), 1);
        });
    }

    vars.filter(colore => colore.includes("--text-color")).forEach(color => {
        let variante = "normal";
        if(color.includes("-dark")) variante = "dark";
        else if(color.includes("-light")) variante = "light";
        document.documentElement.style.setProperty(color, textColors[variante]);
        vars.splice(vars.indexOf(color), 1);
    })
    vars.filter(colore => colore.includes("--accent-color"))
        .forEach(color => document.documentElement.style.setProperty(color, color.includes("confirm") ? staticColors["confirm"] : staticColors["critical"]));
})();
*/

(async () => {
    // --- SETUP DATI ---
    const colorsData = await (await fetch('/assets/colors.json')).json();
    const colorsList = colorsData['colors'];
    const textColors = colorsData['texts'];
    const staticColors = colorsData['staticColors'];

    const usedColorNames = new Set();

    // Funzione helper
    const getRandomUniqueColor = () => {
        const available = colorsList.filter(c => !usedColorNames.has(c.name));
        if (available.length === 0) return colorsList[0];
        const color = available[Math.floor(Math.random() * available.length)];
        usedColorNames.add(color.name);
        return color;
    }

    // --- 1. GESTIONE LOADING SCREEN ---
    const savedSettings = JSON.parse(localStorage.getItem("cucuRiduSettings")) || {};

    const loadingBack = savedSettings["loadingColorBack"] || getRandomUniqueColor();
    const loadingAccent = savedSettings["loadingColorAccent"] || getRandomUniqueColor();

    if (savedSettings["loadingColorBack"]) usedColorNames.add(loadingBack.name);
    if (savedSettings["loadingColorAccent"]) usedColorNames.add(loadingAccent.name);

    localStorage.setItem("cucuRiduSettings", JSON.stringify({
        ...savedSettings,
        loadingColorBack: loadingBack,
        loadingColorAccent: loadingAccent
    }));

    // --- 2. CASTING ALTRI COLORI ---
    const bgMain = getRandomUniqueColor();
    const bgVariant = getRandomUniqueColor();
    const accentsMap = {
        1: getRandomUniqueColor(),
        2: getRandomUniqueColor(),
        3: getRandomUniqueColor()
    };

    // --- 3. ASSIGNMENT ---
    const setCSS = (name, value) => document.documentElement.style.setProperty(name, value);

    // > LOADING SCREEN
    setCSS('--loadingScreen-background', loadingBack.normal);
    setCSS('--loadingScreen-background-dark', loadingBack.dark);
    setCSS('--loadingScreen-accent', loadingAccent.normal);
    setCSS('--loadingScreen-accent-outline', loadingAccent.outline);

    // > BACKGROUNDS
    setCSS('--background', bgMain.normal);
    setCSS('--background-dark', bgMain.dark);
    setCSS('--background-middle', bgMain.middle);
    setCSS('--background-outline', bgMain.outline);

    setCSS('--background-variant', bgVariant.normal);
    setCSS('--background-variant-middle', bgVariant.middle);
    setCSS('--background-variant-dark', bgVariant.dark);
    setCSS('--background-variant-outline', bgVariant.outline);

    // > ACCENT COLORS 1, 2, 3
    [1, 2, 3].forEach(i => {
        const palette = accentsMap[i];
        setCSS(`--accent-color-${i}`, palette.normal);
        setCSS(`--accent-color-${i}-dark`, palette.dark);
        setCSS(`--accent-color-${i}-middle`, palette.middle);
        setCSS(`--accent-color-${i}-text`, palette.text);
        setCSS(`--accent-color-${i}-outline`, palette.outline);
    });

    // > STATIC COLORS & TEXTS
    setCSS('--accent-color-confirm', staticColors.confirm);
    setCSS('--accent-color-confirm-middle', staticColors.confirm_middle);
    setCSS('--accent-color-confirm-outline', staticColors.confirm_outline);
    setCSS('--accent-color-critical', staticColors.critical);
    setCSS('--accent-color-critical-middle', staticColors.critical_middle);
    setCSS('--accent-color-critical-outline', staticColors.critical_outline);

    setCSS('--text-color-normal', textColors.normal);
    setCSS('--text-color-dark', textColors.dark);
    setCSS('--text-color-light', textColors.light);

})();

document.addEventListener("DOMContentLoaded", () => {
    [...document.querySelectorAll("button"), ...document.querySelectorAll("a"), ...document.querySelectorAll("img")].forEach(button => {
        button.addEventListener("click", () => navigator.vibrate([10, 5, 10]));
    });
});