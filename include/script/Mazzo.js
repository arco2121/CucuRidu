const TipoMazzo = Object.freeze({
    COMPLETAMENTI: 0,
    FRASI: 1
})
const fs = require('fs');
const path = require('path');

class Mazzo {

    constructor(data) {
        if (data instanceof TipoMazzo) {
            if (!data instanceof TipoMazzo) throw new Error("Non è un tipo di mazzo");
            this.tipoMazzo = data;
            this.carte = [];
        }
        else if (typeof data === "object") {
            let pack = data["pack"] || "standard";
            if (!data["tipoMazzo"] instanceof TipoMazzo) throw new Error("Non è un tipo di mazzo");
            const carte = fs.readFileSync(path.join(__dirname, "../include/cards/" + pack + "/" + data["tipoMazzo"] === TipoMazzo.COMPLETAMENTI ? "completamenti.json" : "frasi.json"), "utf-8");
            this.carte = [];
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
        for(const carta of indexCarte) this.carte.push(this.carte.slice(carta, 1)[0]);
        return temp;
    }
}

module.exports = { Mazzo, TipoMazzo };