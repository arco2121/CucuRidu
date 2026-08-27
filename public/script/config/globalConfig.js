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
/*
 * Marcatori di formattazione:
 *   §  davanti a un COMPLETAMENTO  -> il completamento tiene sempre l'iniziale
 *                                     maiuscola (nome proprio). Es. "§Gabibbo"
 *   §  davanti a uno SPAZIO VUOTO  -> tutto il completamento va in maiuscolo.
 *                                     Es. "NON PUOI METTERTI A §_"
 * I marcatori non devono mai finire sotto gli occhi di chi gioca: pulisciFrase
 * li toglie dal testo mostrato, fillBlanks li consuma mentre riempie.
 */
const marcatoriFrase = /[§$]+(?=_)/g;

const pulisciFrase = (testo = "") => String(testo).replace(marcatoriFrase, "");

/*
 * La POSIZIONE conta: replacements[0] riempie il primo spazio, replacements[1]
 * il secondo e cosi via. Un buco (null/undefined) lascia quello spazio vuoto
 * invece di far scalare avanti tutti gli altri.
 *
 * Prima i buchi venivano filtrati via prima di riempire: se selezionavi due
 * carte e poi toglievi quella col numerino 1, la carta rimasta continuava a
 * mostrare il numerino 2 ma finiva a riempire lo spazio 1. Il numerino diceva
 * una cosa e la frase ne faceva un'altra.
 */
const fillBlanks = (templateText, replacements) => {
    let index = 0;
    replacements = replacements || [];

    return String(templateText).replace(/([§$]?)_/g, (match, marcatore, offset, fullString) => {
        const corrente = replacements[index];
        index++;

        // spazio non ancora riempito: mostriamo il trattino nudo, senza marcatore
        if (corrente === null || corrente === undefined) return "_";

        let word = String(corrente);

        const tuttoMaiuscolo = marcatore === "§";
        const nomeProprio = bannedSymbols.split("").some(symbol => word.startsWith(symbol));
        if (nomeProprio) word = word.slice(1);

        if (tuttoMaiuscolo) return word.toUpperCase();
        if (nomeProprio) return word.charAt(0).toUpperCase() + word.slice(1);

        const textBefore = pulisciFrase(fullString.slice(0, offset));
        const isStartOfSentence = textBefore.trim().length === 0 || /[.!?]\s*$/.test(textBefore);

        if (isStartOfSentence) {
            return word.charAt(0).toUpperCase() + word.slice(1);
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
        addOverride: false,
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
        if(!params.addOverride) root.innerHTML = "";

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
window.alert = (message) => defaultAlert(message);