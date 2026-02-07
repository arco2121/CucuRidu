//Simple script to generate the json resources of the cards from the raw txt file
const fs = require('fs');
const path = require('path');
const questionsFile = "questions.txt";
const answersFile = "answers.txt";
const generateJSON = (type) => {
    const lines = fs.readFileSync(type, "utf8");
    let result = [];
    for(const line of lines) {
        result.push([
            line.trim(),
            line.match("/_/g").length,
            ""
        ])
    }
};