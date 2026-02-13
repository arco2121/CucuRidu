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

(async () => {
    const colors = await (await fetch('/assets/colors.json')).json();
    const randomColor = () => colors['colors'][Math.floor(Math.random() * colors['colors'].length)];
    const textColors = colors['texts'];
    const staticColors = colors['staticColors'];
    const vars = cssVars("global.css");
    vars.forEach(variable => {
        let color;
        switch (variable) {
            case "--text-color-normal": {
                color = textColors["normal"];
                break;
            }
            case "--text-color-ligth": {
                color = textColors["light"];
                break;
            }
            case "--accent-color-confirm": {
                color = staticColors["confirm"];
                break;
            }
            case "--accent-color-critical": {
                color = textColors["critical"];
                break;
            }
            default : color = randomColor();
        }
        document.documentElement.style.setProperty(variable, color);
    });
})();