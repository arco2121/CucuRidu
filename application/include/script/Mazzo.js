const TipoMazzo = Object.freeze({
    COMPLETAMENTI: 0,
    FRASI: 1
})
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const packsCache = {};

class Mazzo {

    constructor(data) {
        this.carte = [];
        if (data) {
            if(typeof data["pack"] === "string") {
                Mazzo.recuperaInCache(data["pack"]);
                const carte = data["tipoMazzo"] === TipoMazzo.COMPLETAMENTI ? packsCache[data["pack"]].completamenti : packsCache[data["pack"]].frasi;
                this.aggiungiCarte(...carte.map(carta => typeof carta === "string" ? carta.trim() : [carta[0].toString().trim(), carta[1]]));
            } else if(typeof data["pack"] === "object") {
                const type = data["tipoMazzo"] === TipoMazzo.COMPLETAMENTI ? "completamenti" : "frasi";
                this.aggiungiCarte(...data["pack"][type]);
            }
        }
    }

    aggiungiCarte(... carte) {
        for(const carta of carte) this.carte.push(carta);
    }

    static shuffle(array = []) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    shuffle() {
        Mazzo.shuffle(this.carte);
    }

    prendiCarte(numeroCarte) {
        numeroCarte = Math.min(numeroCarte, this.carte.length);
        return this.carte.splice(0, numeroCarte);
    }

    prendiCarteByIndex(...indexCarte) {
        const result = indexCarte.map(index => this.carte[index]);
        indexCarte.forEach(index => this.carte[index] = null);
        this.carte = this.carte.filter(carta => carta !== null);
        return result;
    }

    static unisciMazzi(...mazzi) {
        const temp = new Mazzo();
        for (const mazzo of mazzi) temp.aggiungiCarte(...mazzo.prendiCarte(mazzo.carte.length));
        return temp;
    }

    static controllaMazzo(...frasiCompletamenti) {
        const frasiCompletamentiPair = frasiCompletamenti.map(value => {
            if(typeof value === "string") {
                Mazzo.recuperaInCache(value);
                return packsCache[value];
            }
            return value;
        });
        let occorrenze = frasiCompletamentiPair.reduce((acc, m) => {
            const val = m.frasi ? m.frasi.length : (m[0] ? m[0].length : 0);
            return acc + val;
        }, 0);

        const first = frasiCompletamentiPair.some(mazzo => {
            const f = mazzo.frasi || mazzo[0];
            const c = mazzo.completamenti || mazzo[1];
            return f && f.length > 5 && (33 + occorrenze * 3) >= c.length;
        });
        const second = frasiCompletamentiPair.every(mazzo => {
            const { hash: hashOriginale, ...dati } = mazzo;
            if (!hashOriginale) return true;
            const datiString = JSON.stringify(dati, Object.keys(dati).sort());
            const hashRicalcolato = crypto.createHash("sha256")
                .update(datiString)
                .digest("hex");

            return hashOriginale === hashRicalcolato;
        });
        return first && second;
    }

    static recuperaInCache(data = "") {
        if(!packsCache[data]) {
            packsCache[data] = {
                completamenti : JSON.parse(fs.readFileSync(path.join(__dirname, "../cards/" + data + "/completamenti.json"), "utf-8")),
                frasi: JSON.parse(fs.readFileSync(path.join(__dirname, "../cards/" + data + "/frasi.json"), "utf-8"))
            };
        }
    }

    toArray() {
        return Array.from(this.carte).flat();
    }

    toJSON() {
        return { carte: this.carte };
    }

    static fromJSON(data) {
        const mazzo = new Mazzo();
        mazzo.carte = data.carte || [];
        return mazzo;
    }
}

module.exports = { Mazzo, TipoMazzo };