const TipoMazzo = Object.freeze({
    COMPLETAMENTI: 0,
    FRASI: 1
})
const fs = require('fs');
const path = require('path');

class Mazzo {

    constructor(data) {
        this.carte = [];
        if (data) {
            const pack = data["pack"] || "standard";
            if (!data["tipoMazzo"] instanceof TipoMazzo) throw new Error("Non è un tipo di mazzo. Pirla");
            const carte = fs.readFileSync(path.join(__dirname, "../include/cards/" + pack + "/", data["tipoMazzo"] === TipoMazzo.COMPLETAMENTI ? "completamenti.json" : "frasi.json"), "utf-8");
            this.aggiungiCarte(...JSON.parse(carte));
        }
    }

    aggiungiCarte(... carte) {
        for(const carta of carte) this.carte.push(carta);
    }

    shuffle() {
        this.carte.sort(() => Math.random() - 0.5);
    }

    prendiCarte(numeroCarte) {
        const temp = [];
        numeroCarte = Math.min(numeroCarte, this.carte.length);
        for(let i = 0; i < numeroCarte; i++) temp.push(this.carte.shift());
        return temp;
    }

    prendiCarteByIndex(...indexCarte) {
        const temp = [];
        for(const carta of indexCarte) temp.push(this.carte.slice(carta, 1)[0]);
        return temp;
    }

    static unisciMazzi(...mazzi) {
        const temp = new Mazzo();
        for (const mazzo of mazzi) temp.aggiungiCarte(...mazzo.prendiCarte(mazzo.carte.length));
        return temp;
    }

    toArray() {
        return [...this.carte];
    }
}

module.exports = { Mazzo, TipoMazzo };