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
    vars.filter(colore => colore === '--background' || colore === '--background-dark')
        .forEach(color => {
            document.documentElement.style.setProperty(color, color.includes("-dark") ? colorRandom["dark"] : colorRandom["normal"]);
            vars.splice(vars.indexOf(color), 1);
        });
    colorRandom = randomColor();
    vars.filter(colore => colore === '--background-variant' || colore === '--background-variant-dark')
        .forEach(color => {
            document.documentElement.style.setProperty(color, color.includes("-dark") ? colorRandom["dark"] : colorRandom["normal"]);
            vars.splice(vars.indexOf(color), 1);
        });
    for(let i = 1; i <= 3; i++) {
        colorRandom = randomColor();
        vars.filter(colore => colore.includes("--accent-color-" + i)).forEach(color => {
            let variante = "normal";
            if(color.includes("-dark")) variante = "dark";
            else if(color.includes("-outline")) variante = "outline";
            else if(color.includes("-text")) variante = "text";
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