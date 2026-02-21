const TipoMazzo = Object.freeze({
    COMPLETAMENTI: 0,
    FRASI: 1
})
const fs = require('fs');
const path = require('path');
const packsCache = {};

class Mazzo {

    constructor(data) {
        this.carte = [];
        if (data) {
            if(typeof data["pack"] === "string") {
                if(!packsCache[data["pack"]]) {
                    packsCache[data["pack"]] = {
                        completamenti : JSON.parse(fs.readFileSync(path.join(__dirname, "../cards/" + data["pack"] + "/completamenti.json"), "utf-8")),
                        frasi: JSON.parse(fs.readFileSync(path.join(__dirname, "../cards/" + data["pack"] + "/frasi.json"), "utf-8"))
                    };
                }
                const carte = data["tipoMazzo"] === TipoMazzo.COMPLETAMENTI ? packsCache[data["pack"]].completamenti : packsCache[data["pack"]].frasi;
                this.aggiungiCarte(...[...carte]);
            } else if(typeof data["pack"] === "object") {
                const type = data["tipoMazzo"] === TipoMazzo.COMPLETAMENTI ? "completamenti" : "frasi";
                this.aggiungiCarte(...data["pack"][type]);
            }
        }
    }

    aggiungiCarte(... carte) {
        for(const carta of carte) this.carte.push(carta);
    }

    shuffle() {
        for (let i = this.carte.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.carte[i], this.carte[j]] = [this.carte[j], this.carte[i]];
        }
    }

    prendiCarte(numeroCarte) {
        numeroCarte = Math.min(numeroCarte, this.carte.length);
        return this.carte.splice(0, numeroCarte);
    }

    prendiCarteByIndex(...indexCarte) {
        return indexCarte
            .sort((a, b) => b - a)
            .map(index => this.carte.splice(index, 1)[0]);
    }

    static unisciMazzi(...mazzi) {
        const temp = new Mazzo();
        for (const mazzo of mazzi) temp.aggiungiCarte(...mazzo.prendiCarte(mazzo.carte.length));
        return temp;
    }

    toArray() {
        return Array.from(this.carte).flat();
    }
}

module.exports = { Mazzo, TipoMazzo };