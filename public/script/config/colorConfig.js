const colorsData = await (await fetch('/assets/colors.json')).json();
const colorsList = colorsData['colors'];
const textColors = colorsData['texts'];
const staticColors = colorsData['staticColors'];

const usedColorNames = new Set();

const getRandomUniqueColor = () => {
    const available = colorsList.filter(c => !usedColorNames.has(c.name));
    if (available.length === 0) return colorsList[0];
    const color = available[Math.floor(Math.random() * available.length)];
    usedColorNames.add(color.name);
    return color;
}

const bgMain = getRandomUniqueColor();
const bgVariant = getRandomUniqueColor();
const accentsMap = {
    1: getRandomUniqueColor(),
    2: getRandomUniqueColor(),
    3: getRandomUniqueColor()
};

// --- 3. ASSIGNMENT ---
const setCSS = (name, value) => document.documentElement.style.setProperty(name, value);
const setAttribute = (name, color, media = "") => {
    let metaThemeColor = document.querySelector("meta[name=" + name + "]");
    if (!metaThemeColor) {
        metaThemeColor = document.createElement("meta");
        metaThemeColor.name = name;
        document.head.appendChild(metaThemeColor);
    }

    metaThemeColor.setAttribute("content", color);
    if(media) metaThemeColor.setAttribute("media", media);
};

// > BACKGROUNDS
setCSS('--background', bgMain.normal);
setCSS('--background-dark', bgMain.dark);
setCSS('--background-middle', bgMain.middle);
setCSS('--background-outline', bgMain.outline);
setAttribute("theme-color", bgMain.normal);
setAttribute("theme-color", bgMain.dark, '(prefers-color-scheme: dark)');

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