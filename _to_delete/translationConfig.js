const lang = (navigator.language || navigator.userLanguage).split('-')[0];
const defaultLang = document.documentElement.lang + "";
const originalTexts = new Map();
const trConfig = {
    sourceLanguage: defaultLang,
    targetLanguage: lang,
};

const restoreDom = () => {
    if (originalTexts.size === 0) return;
    document.documentElement.lang = "it";
    originalTexts.forEach((value, node) => {
        node.nodeValue = value;
    });
};
const translateDom = async (nodo = null, tolanguage = lang, ignore = false) => {
    try {
        if (tolanguage === document.documentElement.lang && !ignore) return;
        if (tolanguage === defaultLang && originalTexts.size > 0) {
            restoreDom();
            return;
        }
        const translator = await Translator.create({
            ...trConfig,
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
        translator.destroy();
    } catch(e) {
        console.error(e.message);
        return nodo;
    }
};
const translate = async (text = "", tolanguage = lang) => {
    if (tolanguage === document.documentElement.lang) return;
    const translator = await Translator.create({
        ...trConfig,
        targetLanguage: tolanguage,
    });
    const res = await translator.translate(text + "");
    translator.destroy();
    return res;
};
const canTranslate = async (tolanguage = lang) => {
  try {
      const state = await Translator.availability({
          ...trConfig,
          targetLanguage: tolanguage,
      });
      return state === "available";
  } catch {
      return false;
  }
};