const fromBackEnd = (() => {
    const data = document.querySelector("meta[name='dataFromBackEnd']").getAttribute("content");
    document.querySelector("meta[name='dataFromBackEnd']").remove();
    return JSON.parse(data);
})();

const utilize = "QWERTYUIOPASDFGHJKLZXCVBNM1234567890qwertyuiopasdfghjklzxcvbnm";
const bannedSymbols = "§$";
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
};
const fillBlanks = (templateText, replacements) => {
    let index = 0;
    replacements = replacements.filter(rep => rep !== null);
    console.log(replacements);

    return templateText.replace(/_/g, (match, offset, fullString) => {
        if (index >= replacements.length) return match;

        let word = replacements[index];
        index++;

        if (bannedSymbols.split("").some(symbol => word.startsWith(symbol))) {
            const cleanedWord = word.slice(1);
            return cleanedWord.charAt(0).toUpperCase() + cleanedWord.slice(1);
        }
        const textBefore = fullString.slice(0, offset);

        const isStartOfSentence = textBefore.trim().length === 0 || /[.!?]\s*$/.test(textBefore);

        if (isStartOfSentence) {
            return word;
        } else {
            return word.charAt(0).toLowerCase() + word.slice(1);
        }
    });
};
const memory = new Set();
const wait = async (time) => await new Promise(resolve => setTimeout(resolve, time));

const fragmentsCache = {};
const renderFragment = async (root, page, params = {}) => {
    params = {
        animation: true,
        notInject: false,
        ...params
    };
    try {
        if(!fragmentsCache[page]) {
            const input = await fetch("/fragments/" + page + ".ejs");
            if(!input.ok) throw new Error("fragment not found");
            fragmentsCache[page] = await input.text();
        }
        if(root === null) return fragmentsCache[page];
        if(params.animation) {
            root.dispatchEvent(hideOpacity);
            await wait(170);
        }
        const paths = {
            scripts: fromBackEnd["scripts"],
            styles: fromBackEnd["styles"]
        };
        if(params.notInject) {
            return ejs.render(fragmentsCache[page], {
                ...params,
                ...paths
            });
        }
        const header = await renderFragment(null, "header");
        const processed = ejs.render(header, {
            params: {
                ...params,
                ...paths
            },
            ...paths,
            data: fragmentsCache[page],
            id: generateId(memory)
        });
        const old = root.querySelectorAll(".fragment");
        for (const fragment of old)
            clearAllFragmentInterval(fragment.id);
        root.innerHTML = "";
        const fragment = document.createRange().createContextualFragment(processed);
        root.appendChild(fragment);
        if(params.animation) root.dispatchEvent(showOpacity);
    } catch (e) {
        console.error(e);
    }
    document.dispatchEvent(fragmentRendered);
};

//Intervals
const fragmentIntervalsMemory = new Map();
const fragmentInterval = (call, interval, fragmentId) => {
    let internal = null;
    internal = setInterval(() => {
        try {
            call();
        } catch {
           clearFragmentInterval(internal, fragmentId);
        }
    }, interval);
    const temporary = fragmentIntervalsMemory.get(fragmentId) || [];
    temporary.push(internal);
    fragmentIntervalsMemory.set(fragmentId, temporary);
    return internal;
};
const clearFragmentInterval = (id, fragmentId) => {
    clearInterval(id);
    const temporary = fragmentIntervalsMemory.get(fragmentId);
    if(temporary) {
        temporary.splice(temporary.indexOf(id), 1);
        fragmentIntervalsMemory.set(fragmentId, temporary);
    }
};
const clearAllFragmentInterval = (fragmentId) => {
    const temporary = fragmentIntervalsMemory.get(fragmentId);
    if(temporary) {
        for(const id of temporary)
            clearInterval(id)
        fragmentIntervalsMemory.delete(fragmentId);
    }
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

//Alert Override
const defaultAlert = window.alert;
window.alert = (message) => {
    (async () => {
        const settings = JSON.parse(localStorage.getItem("cucuRiduSettings") || '{}');
        let newMessage = message;
        if(settings.translate) newMessage = await translateDom(message);
        defaultAlert(newMessage);
    })();
};