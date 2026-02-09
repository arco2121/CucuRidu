const StatoStanza = Object.freeze({
    WAIT: 1,
    END: 5,
    CHOOSING_WINNER: 3,
    WINNER: 4,
    CHOOSING_CARDS: 2
});
const { Giocatore } = require('Giocatore');
const { Mazzo, TipoMazzo } = require('Mazzo');
const { generateId } = require('generazione');

class Stanza {

    constructor(pack, username) {
        this.id = generateId(7);
        this.pack = pack || "standard";
        this.giocatori = [];
        this.stato = StatoStanza.WAIT;
        this.master = new Giocatore(username);
        this.mazzoCompletamenti = {
            mazzo: new Mazzo({
                pack: pack,
                tipoMazzo: TipoMazzo.COMPLETAMENTI
            }),
            scarto: new Mazzo(TipoMazzo.COMPLETAMENTI)
        }
        this.mazzoFrasi = {
            mazzo: new Mazzo({
                pack: pack,
                tipoMazzo: TipoMazzo.FRASI
            }),
            scarto: new Mazzo(TipoMazzo.FRASI)
        }
        let maxOccorrenze = 0;
        this.mazzoFrasi.mazzo.carte.map(carta => carta[1]).forEach(occorrenza => maxOccorrenze += occorrenza);
        this.round = {
            domanda: this.mazzoFrasi.mazzo.prendiCarte(1),
            risposte: [],
            chiStaInterrogando: this.master.id
        }
        this.master.aggiungiMano(this.mazzoCompletamenti.mazzo.prendiCarte(12));
        this.giocatori.push(this.master);
        this.numeroRound = [1, maxOccorrenze * this.giocatori.length];
    }

    aggiungiGiocatore(username) {
        if(this.stato !== StatoStanza.WAIT)
            return false;
        const giocatore = new Giocatore(username);
        giocatore.aggiungiMano(this.mazzoCompletamenti.mazzo.prendiCarte(12))
        this.numeroRound = [this.numeroRound[0], (this.numeroRound[1] / this.giocatori.length) * (this.giocatori.length + 1)];
        this.giocatori.push(giocatore);
        return giocatore;
    }

    eliminaGiocatore() {
        //todo logica con cambio ruoli
    }

    terminaPartita() {
        if(this.stato !== StatoStanza.END) {
            this.stato = StatoStanza.END;
            return this.giocatori.toSorted((a, b) => a.punti - b.punti);
        }
        return false;
    }

    iniziaTurno(chiStaChidedendo) {
        if(this.numeroRound[0] === this.numeroRound[1])
            return this.terminaPartita();
        if(this.stato === StatoStanza.WAIT && chiStaChidedendo === this.round.chiStaInterrogando) {
            this.stato = StatoStanza.CHOOSING_CARDS;
            return this.round.chiStaInterrogando;
        }
        return false;
    }

    aggiungiRisposta(giocatoreId, ... indexCarte) {
        if(this.stato === StatoStanza.CHOOSING_CARDS && this.giocatori.find(giocatore => giocatore.id === giocatoreId)
            && !this.round.risposte.find(risposta => risposta.chi === giocatoreId)) {
            this.round.risposte.push({
                carte: this.giocatori[giocatoreId].prendiMano(indexCarte),
                chi: giocatoreId
            });
            if(this.round.risposte.length === (this.giocatori.length - 1)) return true;
        }
        return false;
    }

    scegliVincitore(chiStaChiedendo, indiceRisposta) {
        if(this.stato !== StatoStanza.CHOOSING_WINNER ||
            this.round.risposte.length !== (this.giocatori.length - 1) || chiStaChiedendo !== this.round.chiStaInterrogando) return false;
        this.stato = StatoStanza.WAIT;
        const vincitoreRound = this.giocatori.findIndex(giocatore => giocatore.id === this.round.risposte[indiceRisposta].chi);
        this.giocatori[vincitoreRound].punti++;
        this.mazzoCompletamenti.scarto.aggiungiCarte(this.round.risposte.map(risposta => risposta.carta))
        this.mazzoFrasi.scarto.aggiungiCarte(this.round.domanda);
        this.round = {
            domanda: this.mazzoFrasi.mazzo.prendiCarte(1),
            risposte: [],
            chiStaInterrogando: this.giocatori[vincitoreRound].id
        }
        this.numeroRound[0]++;
        return [this.round.risposte[indiceRisposta], this.giocatori[vincitoreRound].username] || false;
    }
}

module.exports = { Stanza };