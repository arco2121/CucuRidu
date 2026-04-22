const lang = (navigator.language || navigator.userLanguage).split('-')[0];
const originalTexts = new Map();

const restoreOriginal = () => {
    if (originalTexts.size === 0) return;
    document.documentElement.lang = "it";
    originalTexts.forEach((value, node) => {
        node.nodeValue = value;
    });
};

const translateDom = async (nodo = null, tolanguage = lang, ignore = false) => {
    try {
        const defaultLang = "it";

        if (typeof nodo === "string") {
            const translator = await Translator.create({
                sourceLanguage: defaultLang,
                targetLanguage: tolanguage,
            });
            return await translator.translate(nodo);
        }

        if (tolanguage === document.documentElement.lang && !ignore) return;

        if (tolanguage === defaultLang && originalTexts.size > 0) {
            restoreOriginal();
            return;
        }

        const translator = await Translator.create({
            sourceLanguage: document.documentElement.lang || defaultLang,
            targetLanguage: tolanguage,
        });

        const nd = nodo || document.body;
        const walker = document.createTreeWalker(nd, NodeFilter.SHOW_TEXT, null);

        let node;
        const translationPromises = [];

        while ((node = walker.nextNode())) {
            const originalText = node.nodeValue.trim();

            if (originalText.length > 1) {
                if (!originalTexts.has(node))
                    originalTexts.set(node, node.nodeValue);

                const currentNode = node;
                const promise = translator.translate(originalText)
                    .then(translatedText => {
                        if(document.documentElement.lang === lang)
                            currentNode.nodeValue = translatedText;
                    })
                    .catch(err => console.error(err));

                translationPromises.push(promise);
            }
        }

        document.documentElement.lang = tolanguage;
        await Promise.all(translationPromises);
    } catch(e) {
        console.error(e.message);
    }
};