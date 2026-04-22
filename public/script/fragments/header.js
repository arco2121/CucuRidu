(async function () {
    const currentScript = document.currentScript;
    const id = currentScript?.getAttribute("name");

    if (!id) return;

    const getMetaJson = (name) => {
        const el = document.querySelector(`meta[name='${name}_${id}']`);
        if (!el) return null;
        try {
            const content = JSON.parse(el.getAttribute("content"));
            el.remove();
            return content;
        } catch(e) { return null; }
    };

    const fromRendering = getMetaJson('dataFromFragment');
    const raw = getMetaJson('rawFragment');
    const container = document.getElementById(id);

    if (!raw || !container) return;

    const pars = new DOMParser().parseFromString(ejs.render(raw, fromRendering), "text/html");
    const scripts = Array.from(pars.querySelectorAll("script"));
    const execFunctions = [];

    for (const script of scripts) {
        let code = "";
        if (script.src) {
            try {
                const response = await fetch(script.src);
                if (response.ok && !response.headers.get('content-type')?.includes('text/html')) {
                    code = await response.text();
                } else {
                    console.error(`Script esterno non valido o errore 503 su: ${script.src}`);
                    continue;
                }
            } catch (e) {
                console.error(e);
                continue;
            }
        } else {
            code = script.textContent;
        }

        if (code.trim()) {
            execFunctions.push(() => {
                try {
                    const fromFragments = { ...fromRendering, pageId: container.id };
                    const runner = new Function('fromFragments', 'with(fromFragments) { ' + code + ' }');
                    runner(fromFragments);
                } catch (e) {
                    console.error("Errore nell'esecuzione dello script:", e);
                }
            });
        }
        script.remove();
    }

    container.innerHTML = pars.body.innerHTML;
    execFunctions.forEach(fn => fn());

    const settings = JSON.parse(localStorage.getItem("cucuRiduSettings") || '{}');
    if(settings.translate) await translateDom(container, lang);
    currentScript?.remove();
})();