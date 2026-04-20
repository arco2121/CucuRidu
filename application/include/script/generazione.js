const fs = require("fs");
const path = require("path");
const alphabet = "QWERTYUIOPASDFGHJKLZXCVBNM1234567890qwertyuiopasdfghjklzxcvbnm@#!£$%&/";

const generateId = async (length, memory = new Set()) => {
    let code = "";
    const utilize = length <= 7 ? alphabet.slice(0, alphabet.indexOf("0")) : alphabet;
    length = length > utilize.length ? utilize.length : length;
    do {
        code = "";
        for (let i = 0; i < length; i++) {
            let index;
            do {
                index = Math.floor(Math.random() * utilize.length);
            } while (utilize[index] === code[i - 1]);

            code += utilize[index];
        }
    } while (await memory.has(code));
    await memory.add(code);
    return code;
}

const getknownPacks = () => {
    const dirs = fs.readdirSync(path.join(__dirname, "../cards/"), { withFileTypes: true });
    return dirs.filter(dir => dir.isDirectory()).map(dir => dir.name);
};

// Generazione Nome Casuale
const generateName = () => {
    const fs = require('node:fs');
    const path = require('node:path');

    try {
        const filePath = path.join(__dirname, '../names/names.json');
        const rawData = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(rawData);

        // Scelta random
        let name = data.names[Math.floor(Math.random() * (data.names.length))];
        let adjective = data.adjectives[Math.floor(Math.random() * data.adjectives.length)];

        return name + " " + adjective;
    } catch (error) {
        console.error('Errore durante la lettura del file JSON:', error);
    }
}

const translateToPack = (packs) => {
    try {
        const results = [];
        for (const stringa of packs) {
            if(typeof stringa !== "string") {
                results.push(stringa);
                continue;
            }
            const lines = stringa.split(/\r?\n/).filter(line => line.trim() !== "");
            let array = [];
            for (let line of lines) {
                line = line.trim();
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

// Generazione Foto Profilo
const generatePfp = () => {
    const pfpNumber = 132;
    const pfpPath = '/assets/pfps/';
    let rdmNumber = Math.floor(Math.random() * (pfpNumber - 1) + 1);
    return pfpPath + rdmNumber + ".jpg";
}

const getAllPfp = () => {
    const pfpNumber = 132;
    const pfpPath = '/assets/pfps/';
    return Array.from({ length: pfpNumber }, (v, i) => `${pfpPath}${i + 1}.jpg`);
}

const getIcon = (defaultIcon) => String("/assets/icon_imgs/" + (defaultIcon ? 1 : Math.floor(Math.random() * (22 - 1) + 1)) + ".png");

module.exports = { generateId, generatePfp, generateName, getIcon, getAllPfp, getknownPacks, translateToPack };