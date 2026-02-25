const StatoStanza = Object.freeze({
    WAIT: 1,
    END: 4,
    CHOOSING_WINNER: 3,
    CHOOSING_CARDS: 2
});
const path = require('path');
const { Giocatore } = require(path.join(__dirname, "/Giocatore"));
const { Mazzo, TipoMazzo } = require(path.join(__dirname, "/Mazzo"));
const { generateId } = require(path.join(__dirname, '/generazione'));

class Stanza {

    constructor(username, pfp, memory, minimoGiocatori = 3) {
        this.id = typeof memory === "string" ? memory : generateId(6, memory);
        this.giocatori = new Map();
        this.giocatoriPassati = new Set();
        this.stato = StatoStanza.WAIT;
        this.minimoGiocatori = minimoGiocatori;
        this.master = new Giocatore(username, pfp, memory, true);
        this.mazzoCompletamenti = {
            mazzo: new Mazzo({
                pack: "standard",
                tipoMazzo: TipoMazzo.COMPLETAMENTI
            }),
            scarto: new Mazzo()
        }
        this.mazzoFrasi = {
            mazzo: new Mazzo({
                pack: "standard",
                tipoMazzo: TipoMazzo.FRASI
            }),
            scarto: new Mazzo()
        }
        this.giocatori.set(this.master.id, this.master);
        this.numeroRound = [0, this.giocatori.size];
    }

    aggiungiGiocatore(username, pfp, memory) {
        if(this.stato !== StatoStanza.WAIT)
            return false;
        const giocatore = new Giocatore(username, pfp, memory);
        this.numeroRound = [this.numeroRound[0], Math.max(1, Math.floor(this.numeroRound[1] / this.giocatori.size) * (this.giocatori.size + 1))];
        this.giocatori.set(giocatore.id, giocatore);
        return giocatore;
    }

    eliminaGiocatore(giocatoreId) {
        const giocatore = this.trovaGiocatore(giocatoreId);
        if(!giocatore) return false;
        this.giocatori.delete(giocatoreId);
        if(giocatore === this.master) {
            this.master = this.giocatori.values().next().value;
            if (this.master) this.master.masterRole = true;
        }
        this.mazzoCompletamenti.mazzo.aggiungiCarte(...giocatore.prendiTuttaLaMano())
        this.giocatoriPassati.add(giocatore.id);
        return true;
    }

    trovaGiocatore(idGiocatore) {
        return this.giocatori.get(idGiocatore);
    }

    trovaGiocatoreAnchePassato(idGiocatore) {
        if(this.giocatori.has(idGiocatore))
            return this.giocatori.get(idGiocatore);
        if(this.giocatoriPassati.has(idGiocatore))
            return false;
        return null;
    }

    terminaPartita(idGiocatore) {
        if(this.stato !== StatoStanza.END && this.trovaGiocatore(idGiocatore) === this.master) {
            this.stato = StatoStanza.END;
            const classifica = Array.from(this.giocatori.values()).sort((a, b) => b.punti - a.punti);
            this.giocatori.clear();
            this.mazzoFrasi = null;
            this.mazzoCompletamenti = null;
            this.master = null;
            return classifica;
        }
        return false;
    }

    iniziaTurno(chiStaChidedendo) {
        if(this.stato !== StatoStanza.WAIT || this.giocatori.size < this.minimoGiocatori)
            return false;
        if(this.numeroRound[0] === 0) {
            let maxOccorrenze = 0;
            this.mazzoFrasi.mazzo.carte.map(carta => carta[1]).forEach(occorrenza => maxOccorrenze += occorrenza);
            this.numeroRound = [1, maxOccorrenze * this.giocatori.size];
            this.mazzoCompletamenti.mazzo.shuffle();
            this.mazzoFrasi.mazzo.shuffle();
            this.round = {
                domanda: this.mazzoFrasi.mazzo.prendiCarte(1)[0],
                risposte: new Map(),
                chiStaInterrogando: this.master.id
            }
        }
        if(this.numeroRound[0] === this.numeroRound[1])
            return this.terminaPartita();
        this.controllaMazzi(this.round.domanda[1]);
        for (const giocatore of this.giocatori.values())
            if(giocatore.mazzo.carte.length === 0) giocatore.aggiungiMano(this.mazzoCompletamenti.mazzo.prendiCarte(12));
        if(chiStaChidedendo === this.round.chiStaInterrogando) {
            this.stato = StatoStanza.CHOOSING_CARDS;
            return true;
        }
        return false;
    }

    aggiungiRisposta(giocatoreId, ... indexCarte) {
        if(this.stato === StatoStanza.CHOOSING_CARDS && this.giocatori.has(giocatoreId)
            && !this.round.risposte.has(giocatoreId)) {
            this.round.risposte.set(giocatoreId, this.trovaGiocatore(giocatoreId).prendiMano(...indexCarte));
            if(this.round.risposte.size === (this.giocatori.size - 1)) {
                this.stato = StatoStanza.CHOOSING_WINNER;
                return [
                    this.round.domanda,
                    Array.from(this.round.risposte.entries()),
                    this.round.chiStaInterrogando
                ];
            }
            return true;
        }
        return false;
    }

    scegliVincitore(chiStaChiedendo, idGiocatore) {
        if(this.stato !== StatoStanza.CHOOSING_WINNER ||
            this.round.risposte.size !== (this.giocatori.size - 1) || chiStaChiedendo !== this.round.chiStaInterrogando) return false;
        this.stato = StatoStanza.WAIT;
        const vincitoreRound = this.trovaGiocatore(idGiocatore);
        vincitoreRound.punti++;
        this.controllaMazzi(this.round.domanda[1]);
        for (const giocatore of this.giocatori.values())
            giocatore.aggiungiMano(this.mazzoCompletamenti.mazzo.prendiCarte(this.round.domanda[1]));
        this.mazzoCompletamenti.scarto.aggiungiCarte(...Array.from(this.round.risposte.values()).flatMap(x => x));
        this.mazzoFrasi.scarto.aggiungiCarte(this.round.domanda);
        const risposte = this.round.risposte.get(idGiocatore);
        const domanda = this.round.domanda
        this.round = {
            domanda: this.mazzoFrasi.mazzo.prendiCarte(1)[0],
            risposte: new Map(),
            chiStaInterrogando: vincitoreRound.id
        }
        this.numeroRound[0]++;
        return [vincitoreRound.id, vincitoreRound.username, domanda, risposte] || false;
    }

    controllaMazzi(spaziNecessari) {
        if(this.mazzoCompletamenti.mazzo.carte.length < this.giocatori.size * spaziNecessari) {
            this.mazzoCompletamenti.mazzo.aggiungiCarte(...this.mazzoCompletamenti.scarto.prendiCarte(this.mazzoCompletamenti.scarto.carte.length));
            this.mazzoCompletamenti.mazzo.shuffle();
        }
        if(this.mazzoFrasi.mazzo.carte.length - 1 <= 0) {
            this.mazzoFrasi.mazzo.aggiungiCarte(...this.mazzoFrasi.scarto.prendiCarte(this.mazzoFrasi.scarto.carte.length));
            this.mazzoFrasi.mazzo.shuffle();
        }
    }

    static trovaDaGiocatore(idGiocatore, Stanze) {
        for (const stanza of Stanze) {
            if (stanza.giocatori.has(idGiocatore)) {
                return stanza.id;
            }
        }
        return null;
    }

    static pulisciStanza(callback, memory, Stanze, ...stanzeId) {
        const check = (stanzaId) => {
            const stanza = Stanze.get(stanzaId);
            if(stanza?.stato === StatoStanza.END || stanza?.giocatori.size === 0 && stanza?.giocatoriPassati.size > 0) {
                for (const id of stanza.giocatoriPassati.values()) memory.delete(id);
                Stanze.delete(stanza.id);
                memory.delete(stanza.id);
                callback(stanza.id);
            }
        };
        if(stanzeId.length === 0) for (const stanzaId of Stanze.keys()) check(stanzaId);
        else for (const stanzaId of stanzeId) check(stanzaId);
    }

    toString() {
        return JSON.stringify({
            numeroGiocatori: this.giocatori.size,
            stato: Object.keys(StatoStanza).filter(chiave => StatoStanza[chiave] === this.stato)[0]
        })
    }
}

module.exports = { Stanza, StatoStanza };