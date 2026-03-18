const generatePacks = (packs) => {
    try {
        const results = [];
        for (const stringa of packs) {
            if(typeof stringa !== "string") {
                results.push(stringa);
                continue;
            }
            const lines = stringa.split("\n");
            let array = [];
            for (const line of lines) {
                const string = line[0]?.toUpperCase() + line.slice(1);
                const completamenti = (line.match(/_/g) || []).length;
                array.push(completamenti !== 0 ? [
                    string,
                    completamenti,
                ] : string)
            }
            results.push(array);
        }
        return results;
    } catch (error) {
        console.log(error)
        return false;
    }
};

module.exports = { generatePacks };