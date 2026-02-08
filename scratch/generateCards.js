//Simple script to generate the json resources of the cards from the raw txt file
const fs = require('node:fs');
const generateJSON = (type) => {
    try {
        const lines = fs.readFileSync("scratch/raw/" + type, "utf-8")
            .split("\n").map(line => line.trim());
        let array = [];
        for (const line of lines) {
            const string = line[0]?.toUpperCase() + line.slice(1);
            const completamento = (line.match("/_/g") || []).length;
            array.push([
                string,
                completamento,
                completamento === 0 ? "completamento" : "frase"
            ])
        }
        fs.writeFileSync("public/include/cards/" + type.replace(".txt", ".json"), JSON.stringify(array));
        return true;
    } catch (error) {
        return error;
    }
};

const questionsFile = "frasi.txt";
const answersFile = "completamenti.txt";

const result = generateJSON(answersFile);
console.log("Success => " + result);