const fs = require('node:fs');
const path = require('node:path');

const generateCombinedJSON = () => {
    const inputFolder = path.join(__dirname, "raw/names");
    const outputFolder = path.join(__dirname, "../include/names/");

    try {
        // Funzione helper per leggere e pulire i file
        const parseFile = (fileName) => {
            const filePath = path.join(inputFolder, fileName);

            if (!fs.existsSync(filePath)) {
                throw new Error(`Amo, non trovo il file: ${fileName} nella cartella raw/names 😭`);
            }

            return fs.readFileSync(filePath, "utf-8")
                .split(/\r?\n/) // Funziona sia su Windows che Linux/Mac
                .map(line => line.trim())
                .filter(line => line.length > 0) // Salta le righe vuote
                .map(line => line.charAt(0).toUpperCase() + line.slice(1));
        };

        const namesArray = parseFile("names.txt");
        const adjectivesArray = parseFile("adjectives.txt");

        const finalData = {
            names: namesArray,
            adjectives: adjectivesArray
        };

        // Crea la cartella di output se non esiste
        if (!fs.existsSync(outputFolder)) {
            fs.mkdirSync(outputFolder, { recursive: true });
        }

        const outputPath = path.join(outputFolder, "names.json");
        fs.writeFileSync(outputPath, JSON.stringify(finalData, null, 2));

        console.log(`Tutto pronto tesoro! Il file è stato generato in: ${outputPath} 🩷`);
        return true;

    } catch (error) {
        console.error(`C'è stato un problemino: ${error.message}`);
        return false;
    }
};

generateCombinedJSON();