const fs = require('node:fs');
const { join } = require("node:path");

const generateCards = () => {
    try {
        const basePath = join(__dirname, "/raw/cards");

        const groups = fs.readdirSync(basePath, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);

        for (const group of groups) {
            const groupDir = join(basePath, group);
            const files = fs.readdirSync(groupDir).filter(file => file.endsWith(".txt"));

            for (const file of files) {
                const lines = fs.readFileSync(join(groupDir, file), "utf-8")
                    .split("\n").map(line => line.trim());

                let array = [];
                for (const line of lines) {
                    if (!line) continue;

                    const string = line[0]?.toUpperCase() + line.slice(1);
                    const completamenti = (line.match(/_/g) || []).length;
                    array.push(completamenti !== 0 ? [
                        string,
                        completamenti,
                    ] : string);
                }

                const outputDir = join(__dirname, "..", "../application/include/cards/" + group + "/");
                fs.mkdirSync(outputDir, {
                    recursive: true,
                });
                fs.writeFileSync(join(outputDir, file.replace(".txt", ".json")), JSON.stringify(array));
            }
            console.log(`Generated JSON for group: ${group}`);
        }
        return true;
    } catch (error) {
        console.log(`Error: ${error}`);
        return false;
    }
};

const result = generateCards();
console.log(`Result => ${result}`);