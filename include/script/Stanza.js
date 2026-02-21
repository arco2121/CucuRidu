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

    constructor(username, pfp, memory) {
        this.id = generateId(6, memory);
        this.giocatori = new Map();
        this.giocatoriPassati = new Set();
        this.stato = StatoStanza.WAIT;
        this.minimoGiocatori = 3
        this.master = new Giocatore(username, pfp, memory);
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
        this.numeroRound = [1, this.giocatori.size];
    }

    aggiungiGiocatore(username, pfp, memory) {
        if(this.stato !== StatoStanza.WAIT)
            return false;
        const giocatore = new Giocatore(username, pfp, memory);
        this.numeroRound = [this.numeroRound[0], (this.numeroRound[1] / this.giocatori.size) * (this.giocatori.size + 1)];
        this.giocatori.set(giocatore.id, giocatore);
        return giocatore;
    }

    eliminaGiocatore(giocatoreId) {
        const giocatore = this.trovaGiocatore(giocatoreId);
        this.giocatori.delete(giocatoreId);
        if(giocatore === this.master)
            this.master = this.giocatori.values().next().value;
        this.mazzoCompletamenti.mazzo.aggiungiCarte(...giocatore.prendiTuttaLaMano())
        this.giocatoriPassati.add(giocatore);
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
        if(this.numeroRound[0] === this.numeroRound[1])
            return this.terminaPartita();
        if(this.numeroRound[0] === 1) {
            let maxOccorrenze = 0;
            this.mazzoFrasi.mazzo.carte.map(carta => carta[1]).forEach(occorrenza => maxOccorrenze += occorrenza);
            this.numeroRound = [1, maxOccorrenze * this.giocatori.size];
            this.mazzoCompletamenti.mazzo.shuffle();
            this.mazzoFrasi.mazzo.shuffle();
            this.round = {
                domanda: this.mazzoFrasi.mazzo.prendiCarte(1),
                risposte: [],
                chiStaInterrogando: this.master.id
            }
        }
        for (const giocatore of this.giocatori.values())
            if(giocatore.mazzo.carte.length === 0)  giocatore.aggiungiMano(this.mazzoCompletamenti.mazzo.prendiCarte(12));
        if(chiStaChidedendo === this.round.chiStaInterrogando) {
            this.stato = StatoStanza.CHOOSING_CARDS;
            return true;
        }
        return false;
    }

    aggiungiRisposta(giocatoreId, ... indexCarte) {
        if(this.stato === StatoStanza.CHOOSING_CARDS && this.trovaGiocatore(giocatoreId)
            && !this.round.risposte.find(risposta => risposta.chi === giocatoreId)) {
            this.round.risposte.push({
                carte: this.trovaGiocatore(giocatoreId).prendiMano(...indexCarte),
                chi: giocatoreId
            });
            if(this.round.risposte.length === (this.giocatori.length - 1)) {
                this.stato = StatoStanza.CHOOSING_WINNER;
                return [
                    this.round.domanda,
                    this.round.risposte.map(risposta => [risposta, this.giocatori.find(giocatori => giocatori.id === risposta.chi).username]),
                    this.round.chiStaInterrogando
                ];
            }
            return true;
        }
        return false;
    }

    scegliVincitore(chiStaChiedendo, indiceRisposta) {
        if(this.stato !== StatoStanza.CHOOSING_WINNER ||
            this.round.risposte.length !== (this.giocatori.length - 1) || chiStaChiedendo !== this.round.chiStaInterrogando) return false;
        this.stato = StatoStanza.WAIT;
        const vincitoreRound = this.giocatori.findIndex(giocatore => giocatore.id === this.round.risposte[indiceRisposta].chi);
        this.giocatori[vincitoreRound].punti++;
        for (const giocatore of this.giocatori)
            this.giocatori[this.giocatori.indexOf(giocatore)].aggiungiMano(this.mazzoCompletamenti.mazzo.prendiCarte(this.round.domanda[1]));
        this.mazzoCompletamenti.scarto.aggiungiCarte(... this.round.risposte.map(risposta => risposta.carte).flat())
        this.mazzoFrasi.scarto.aggiungiCarte(...this.round.domanda);
        const risposte = this.round.risposte[indiceRisposta];
        const domanda = this.round.domanda
        this.round = {
            domanda: this.mazzoFrasi.mazzo.prendiCarte(1),
            risposte: [],
            chiStaInterrogando: this.giocatori[vincitoreRound].id
        }
        this.numeroRound[0]++;
        return [this.giocatori[vincitoreRound].id, this.giocatori[vincitoreRound].username, domanda, risposte] || false;
    }

    static trovaDaGiocatore(idGiocatore, Stanze) {
        for (const stanza of Stanze) {
            if (stanza.giocatori.some(g => g.id === idGiocatore)) {
                return stanza.id;
            }
        }
        return null;
    }
}

module.exports = { Stanza, StatoStanza };