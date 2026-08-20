const TipoMazzo = Object.freeze({
    COMPLETAMENTI: 0,
    FRASI: 1
})
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const packsCache = {};

/*
 * Forma delle carte:
 *   COMPLETAMENTI -> una stringa
 *   FRASI         -> [testo, numeroDiSpaziVuoti]
 *
 * Una coppia finita per sbaglio fra i completamenti diventa "testo,1" appena
 * viene stampata a schermo: e' cosi che nascevano le carte con la virgola in
 * mezzo. Per questo ogni carta viene normalizzata quando entra nel mazzo e
 * quello che non torna finisce nei log invece di arrivare ai giocatori.
 */
const normalizzaCarta = (carta, tipo) => {
    if (tipo === TipoMazzo.FRASI) {
        if (Array.isArray(carta)) {
            const testo = String(carta[0] ?? "").trim();
            const spazi = parseInt(carta[1]);
            if (!testo) return null;
            return [testo, Number.isInteger(spazi) && spazi > 0 ? spazi : (testo.match(/_/g) || []).length || 1];
        }
        if (typeof carta === "string" && carta.trim()) {
            const testo = carta.trim();
            return [testo, (testo.match(/_/g) || []).length || 1];
        }
        return null;
    }

    // completamenti: sempre e solo una stringa
    if (typeof carta === "string") return carta.trim() || null;
    if (Array.isArray(carta)) {
        const testo = String(carta[0] ?? "").trim();
        return testo || null;
    }
    if (carta === null || carta === undefined) return null;
    return String(carta).trim() || null;
};

class Mazzo {

    constructor(data) {
        this.carte = [];
        this.tipo = data && data["tipoMazzo"] === TipoMazzo.FRASI ? TipoMazzo.FRASI : TipoMazzo.COMPLETAMENTI;
        if (data) {
            if(typeof data["pack"] === "string") {
                Mazzo.recuperaInCache(data["pack"]);
                const carte = data["tipoMazzo"] === TipoMazzo.COMPLETAMENTI ? packsCache[data["pack"]].completamenti : packsCache[data["pack"]].frasi;
                this.aggiungiCarte(...carte);
            } else if(typeof data["pack"] === "object" && data["pack"] !== null) {
                const type = data["tipoMazzo"] === TipoMazzo.COMPLETAMENTI ? "completamenti" : "frasi";
                this.aggiungiCarte(...(data["pack"][type] || []));
            }
        }
    }

    aggiungiCarte(... carte) {
        for(const carta of carte) {
            const pulita = normalizzaCarta(carta, this.tipo);
            if (pulita === null) {
                console.warn("[Mazzo] carta scartata perche' malformata:", JSON.stringify(carta));
                continue;
            }
            if (this.tipo === TipoMazzo.COMPLETAMENTI && typeof carta !== "string")
                console.warn("[Mazzo] completamento non testuale, corretto in:", JSON.stringify(pulita),
                    "era:", JSON.stringify(carta));
            this.carte.push(pulita);
        }
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
        numeroCarte = Math.max(0, Math.min(parseInt(numeroCarte) || 0, this.carte.length));
        return this.carte.splice(0, numeroCarte);
    }

    /**
     * Toglie dalla mano le carte alle posizioni indicate e le restituisce.
     * Gli indici arrivano dal client, quindi vanno trattati come non fidati:
     * si accettano solo interi validi, distinti e dentro la mano. Se qualcosa
     * non torna non si tocca niente e si restituisce null, cosi chi chiama puo
     * rifiutare la giocata invece di rovinare il mazzo.
     */
    prendiCarteByIndex(...indici) {
        const puliti = [];
        for (const grezzo of indici) {
            const i = typeof grezzo === "number" ? grezzo : parseInt(grezzo);
            if (!Number.isInteger(i) || i < 0 || i >= this.carte.length) return null;
            if (puliti.includes(i)) return null;
            puliti.push(i);
        }
        if (!puliti.length) return null;

        const prese = puliti.map(i => this.carte[i]);
        const daTogliere = new Set(puliti);
        // si ricostruisce la mano saltando le posizioni giocate: niente splice
        // ripetuti, quindi niente indici che scalano sotto i piedi
        this.carte = this.carte.filter((_, i) => !daTogliere.has(i));
        return prese;
    }

    static unisciMazzi(...mazzi) {
        const temp = new Mazzo({ tipoMazzo: mazzi[0]?.tipo ?? TipoMazzo.COMPLETAMENTI });
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

        const first = frasiCompletamentiPair.some(m => {
            const f = m.frasi || m[0] || [];
            const c = m.completamenti || m[1] || [];
            return c.length > 10 && c.length >= (f.length * 2);
        });

        const second = frasiCompletamentiPair.every(mazzo => {
            const { hash: hashOriginale, ...dati } = mazzo;
            if (!hashOriginale) return false;
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
            const mazzo = {
                completamenti : JSON.parse(fs.readFileSync(path.join(__dirname, "../cards/" + data + "/completamenti.json"), "utf-8")),
                frasi: JSON.parse(fs.readFileSync(path.join(__dirname, "../cards/" + data + "/frasi.json"), "utf-8"))
            };
            const datiString = JSON.stringify(mazzo, Object.keys(mazzo).sort());
            const hash = crypto.createHash('sha256')
                .update(datiString)
                .digest('hex');

            packsCache[data] = { ...mazzo, hash };
        }
    }

    toJSON() {
        return { carte: [...this.carte], tipo: this.tipo };
    }

    /**
     * @param data       quello che c'era in database
     * @param tipoForzato tipo del mazzo, da passare sempre: le stanze salvate
     *                    prima di questa modifica non hanno il campo tipo e un
     *                    mazzo di frasi letto come completamenti verrebbe
     *                    appiattito a stringhe, mandando in pezzi il round
     */
    static fromJSON(data, tipoForzato) {
        const carte = Array.isArray(data?.carte) ? data.carte : [];
        let tipo = tipoForzato;
        if (tipo !== TipoMazzo.FRASI && tipo !== TipoMazzo.COMPLETAMENTI) tipo = data?.tipo;
        if (tipo !== TipoMazzo.FRASI && tipo !== TipoMazzo.COMPLETAMENTI)
            tipo = carte.length && carte.every(c => Array.isArray(c)) ? TipoMazzo.FRASI : TipoMazzo.COMPLETAMENTI;

        const mazzo = new Mazzo({ tipoMazzo: tipo });
        // si ricopia invece di agganciare l'array che arriva dal JSON, e si
        // ripassa dalla normalizzazione: se in database e' finita una carta
        // storta viene raddrizzata qui
        mazzo.aggiungiCarte(...carte);
        return mazzo;
    }
}

module.exports = { Mazzo, TipoMazzo, normalizzaCarta };
