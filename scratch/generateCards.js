/*
    Simple script to generate the json resources of the cards from the raw txt file
*/
const fs = require('node:fs');
const {join} = require("node:path");
const generateCards = (files) => {
    try {
        for (const file of files) {
            const lines = fs.readFileSync(join(__dirname, "/raw/cards/" + file), "utf-8")
                .split("\n").map(line => line.trim());
            let array = [];
            for (const line of lines) {
                const string = line[0]?.toUpperCase() + line.slice(1);
                const completamenti = (line.match(/_/g) || []).length;
                array.push(completamenti > 0 ? [
                    string,
                    completamenti
                ] : string);
            }
            fs.mkdirSync(join(__dirname, "../include/cards/"), {
                recursive: true,
            });
            fs.writeFileSync(join(__dirname, "../include/cards/" + file.replace(".txt", ".json")), JSON.stringify(array));
        }
        return true;
    } catch(e) {
        console.error(e)
        return false;
    }
};

const data = [];
process.argv.slice(2).forEach(val => {
    const input =  val.includes(".txt") ? val : null;
    data.push(input);
});
const files = [data[0] || "frasi.txt", data[1] || "completamenti.txt"];

const result = generateCards(files);
console.log("Result => " + result);