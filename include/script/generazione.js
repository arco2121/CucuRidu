const path = require("node:path");
const alphabet = "QWERTYUIOPASDFGHJKLZXCVBNM1234567890qwertyuiopasdfghjklzxcvbnm@#!£$%&/";

const generateId = (length, memory) => {
    if(!memory) return;
    let code = "";
    const utilize = length < 7 ? alphabet.slice(0, alphabet.indexOf("0")) : alphabet;
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
    } while (memory.has(code));
    memory.add(code);
    return code;
}

// Generazione Nome Casuale
const generateName = () => {
    const fs = require('node:fs');
    const path = require('node:path');

    try {
        const filePath = path.join(__dirname, '../names/names.json');
        const rawData = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(rawData);

        //console.log(data.names);
        //console.log(data.adjectives);

        // Scelta random
        let name = data.names[Math.floor(Math.random()*data.names.length)];
        let adjective = data.adjectives[Math.floor(Math.random()*data.adjectives.length)];

        let finalName = name + " " + adjective;
        console.log(finalName);
        return finalName;
    } catch (error) {
        console.error('Errore durante la lettura del file JSON:', error);
    }
}

// Generazione Foto Profilo
const generatePfp = () => {
    const pfpNumber = 37;
    const pfpPath = path.join('./assets/pfps/');

    let rdmNumber = Math.floor(Math.random() * (pfpNumber + 1));
    return pfpPath + rdmNumber + "jpg";
}

const getIcon = () => String("/assets/icon_imgs/" + Math.floor(Math.random() * (7 - 1) + 1) + ".png");

module.exports = { generateId, generatePfp, generateName, getIcon };