const fromBackEnd = (() => {
    const data = document.querySelector("meta[name='dataFromBackEnd']").getAttribute("content");
    document.querySelector("meta[name='dataFromBackEnd']").remove();
    return JSON.parse(data);
})();
const utilize = "QWERTYUIOPASDFGHJKLZXCVBNM1234567890qwertyuiopasdfghjklzxcvbnm";
const generateId = (memory) => {
    let code = "";
    do {
        code = "";
        for (let i = 0; i < 64; i++) {
            let index;
            do {
                index = Math.floor(Math.random() * utilize.length);
            } while (utilize[index] === code[i - 1]);

            code += utilize[index];
        }
    } while (memory.has(code));
    memory.add(code);
    return code;
}
const memory = new Set();

const fragmentsCache = {};
const renderFragment = async (root, page, params = {}) => {
    try {
        if(!fragmentsCache[page]) {
            const input = await fetch("/fragments/" + page + ".ejs");
            if(!input.ok) throw new Error("fragment not found");
            fragmentsCache[page] = await input.text();
        }
        if(!root) return fragmentsCache[page];
        const header = await renderFragment(null, "header");
        const processed = ejs.render(header, {
            params: params,
            data: fragmentsCache[page],
            id: generateId(memory)
        });
        root.innerHTML = "";
        const fragment = document.createRange().createContextualFragment(processed);
        root.appendChild(fragment);
    } catch (e) {
        console.error(e);
    }
    document.dispatchEvent(fragmentRendered);
};

//COLORS
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