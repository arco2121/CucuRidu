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
            this.carte = JSON.parse(carte);
        }
    }
}