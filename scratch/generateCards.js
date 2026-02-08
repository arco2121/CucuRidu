/*
    Simple script to generate the json resources of the cards from the raw txt file
*/
const fs = require('node:fs');
const {join} = require("node:path");
const generateJSON = (group, files) => {
    try {
        for (const file of files) {
            const lines = fs.readFileSync(join(__dirname, "/raw/" + group + "/" + file), "utf-8")
                .split("\n").map(line => line.trim());
            let array = [];
            for (const line of lines) {
                const string = line[0]?.toUpperCase() + line.slice(1);
                const completamento = (line.match(/_/g) || []).length;
                array.push([
                    string,
                    completamento,
                    completamento === 0 ? "completamento" : "frase"
                ])
            }
            fs.mkdirSync(join(__dirname, "../public/include/cards/" + group + "/"), {
                recursive: true,
            });
            fs.writeFileSync(join(__dirname, "../public/include/cards/" + group + "/" + file.replace(".txt", ".json")), JSON.stringify(array));
        }
        return true;
    } catch (error) {
        return error;
    }
};

const data = [];
process.argv.slice(2).forEach((val, index) => {
    const input =  index === 0 ? (val || null) : (val.includes(".txt") ? val : null);
    data.push(input);
});
const groupName = data[0] || "standard";
const files = [data[1] || "frasi.txt", data[2] || "completamenti.txt"];

const result = generateJSON(groupName, files);
console.log("Result => " + result);