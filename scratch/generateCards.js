//Simple script to generate the json resources of the cards from the raw txt file
const fs = require('fs');
const path = require('path');
const questionsFile = "frasi.txt";
const answersFile = "completamenti.txt";
const generateJSON = (type) => {
    try {
        const lines = fs.readFileSync(type, "utf8");
        let array = [];
        for(const line of lines) {
            let string = line.trim();
            string = string[0].toUpperCase() + string.slice(1);
            array.push([
                string,
                line.match("/_/g").length,
                type === questionsFile ? "frase" : "completamento"
            ])
        }
        fs.writeFileSync(type.replace(".txt", ".json"), JSON.stringify(array));
        return true;
    } catch {
        return false;
    }
};