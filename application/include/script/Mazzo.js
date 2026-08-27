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

    /**
     * Riporta un mazzo, in qualunque forma arrivi, a { frasi, completamenti }.
     * Le forme possibili sono tre:
     *   "standard"                       -> mazzo di casa, letto da disco
     *   { frasi, completamenti, hash }   -> mazzo personalizzato gia creato
     *   [ frasi, completamenti, [nome] ] -> blocchi grezzi dalla pagina
     *                                       /creaMazzo, l'hash non c'e ancora
     */
    static contenutoMazzo(mazzo) {
        if (typeof mazzo === "string") {
            Mazzo.recuperaInCache(mazzo);
            const dati = packsCache[mazzo];
            return { frasi: dati?.frasi ?? [], completamenti: dati?.completamenti ?? [] };
        }
        if (Array.isArray(mazzo))
            return { frasi: mazzo[0] ?? [], completamenti: mazzo[1] ?? [] };
        if (mazzo && typeof mazzo === "object")
            return { frasi: mazzo.frasi ?? [], completamenti: mazzo.completamenti ?? [] };
        return null;
    }

    /**
     * Ha senso giocare con QUESTA selezione di mazzi? Ritorna null se va bene,
     * altrimenti la frase da mostrare a chi ha scelto.
     *
     * Si guarda il TOTALE dei mazzi selezionati, non un mazzo alla volta.
     * Prima la regola era: basta che UNO dei mazzi scelti abbia piu di 10
     * completamenti E almeno il doppio dei completamenti rispetto alle frasi.
     * Due problemi, tutti e due esplosi il 2026-08-27:
     *   - il rapporto 2:1 non c'entra niente con quello che serve davvero al
     *     gioco (gli scarti rientrano nel mazzo da soli, vedi
     *     Stanza.controllaMazzi), ed e' bastato aggiungere frasi allo
     *     standard - arrivato a 524 frasi e 1038 completamenti, dieci
     *     completamenti sotto la soglia - per far rifiutare al server
     *     QUALSIASI selezione, standard compreso;
     *   - un mazzo piccolo a tema (7 carte) non poteva essere "salvato" dal
     *     mazzo grande scelto insieme a lui, perche' il conto si faceva per
     *     mazzo e non sull'insieme.
     * Quello che serve davvero: almeno una frase, e abbastanza completamenti
     * da riempire le mani (Stanza.CARTE_IN_MANO a testa) senza rimescolare
     * gli scarti a ogni giro.
     */
    static problemaMazzo(...mazzi) {
        if (!mazzi.length) return "Non hai selezionato nessun mazzo";

        let frasi = 0;
        let completamenti = 0;
        for (const mazzo of mazzi) {
            let contenuto;
            try { contenuto = Mazzo.contenutoMazzo(mazzo); }
            catch { return "Uno dei mazzi non si riesce proprio a leggere"; }
            if (!contenuto || !Array.isArray(contenuto.frasi) || !Array.isArray(contenuto.completamenti))
                return "Uno dei mazzi non e' fatto come si deve";
            frasi += contenuto.frasi.length;
            completamenti += contenuto.completamenti.length;
        }

        if (frasi < 1)
            return "Nei mazzi che hai scelto non c'e' nemmeno una frase da completare";
        if (completamenti < Mazzo.MINIMO_COMPLETAMENTI)
            return "In tutto fanno solo " + completamenti + " completamenti, ne servono almeno "
                + Mazzo.MINIMO_COMPLETAMENTI + ": scegli anche uno dei mazzi grandi insieme a questo";
        return null;
    }

    /**
     * I mazzi personalizzati arrivano dal client, quindi vanno firmati: senza
     * questo controllo chiunque potrebbe mandarsi un mazzo cucito su misura.
     * I mazzi di casa (stringhe) sono file nostri sul server, non c'e' niente
     * da verificare.
     */
    static firmeValide(...mazzi) {
        return mazzi.every(mazzo => {
            if (typeof mazzo === "string") return true;
            if (!mazzo || typeof mazzo !== "object" || Array.isArray(mazzo)) return false;

            const { hash: hashOriginale, ...dati } = mazzo;
            if (!hashOriginale) return false;
            const datiString = JSON.stringify(dati, Object.keys(dati).sort());
            const hashRicalcolato = crypto.createHash("sha256")
                .update(datiString)
                .digest("hex");

            return hashOriginale === hashRicalcolato;
        });
    }

    /** Contenuto sensato E firma valida: e' quello che serve in partita. */
    static controllaMazzo(...frasiCompletamenti) {
        if (Mazzo.problemaMazzo(...frasiCompletamenti) !== null) return false;
        return Mazzo.firmeValide(...frasiCompletamenti);
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

/*
 * Quanti completamenti servono, in tutto, perche' una selezione di mazzi
 * stia in piedi. Le mani sono da Stanza.CARTE_IN_MANO (11) carte e il minimo
 * di giocatori nel codice e' 2, quindi 22 e' il primo giro completo: si tiene
 * 20 apposta per essere di manica larga, perche' gli scarti rientrano nel
 * mazzo da soli (Stanza.controllaMazzi) e i mazzetti a tema sono nati per
 * essere scelti INSIEME a uno grande, non da soli. Serve solo a fermare il
 * caso senza speranza (il mazzo da 6 carte scelto da solo), non a fare la
 * morale su quante carte e' bello avere. (Non si importa Stanza per non fare
 * un giro circolare fra i due file.)
 */
Mazzo.MINIMO_COMPLETAMENTI = 20;

module.exports = { Mazzo, TipoMazzo, normalizzaCarta };
