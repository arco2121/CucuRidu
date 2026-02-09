const StatoStanza = Object.freeze({
    WAIT: 1,
    END: 5,
    CHOOSING_WINNER: 3,
    WINNER: 4,
    CHOOSING_CARDS: 2
});
const { Giocatore } = require('./Giocatore');

/**
 * Classe della stanza, le risposte ai turni hanno la seguente struttura :
 *
 * {
 *     risposta: Carta,
 *     chi: Giocatore
 * }
 */
class Stanza {

    constructor() {
        this.id = generateId(7);
        this.giocatori = Array.of(Giocatore);
        this.stato = StatoStanza.WAIT;
        this.master = new Giocatore();
        //todo aggiunta carte al master
        this.giocatori.push(this.master);
        this.round = {
            mazzo: [], //todo mazzo;
            scarto: [],
            domanda: "", //todo carta
            risposte: [],
            chiStaInterrogando: this.master
        }
    }

    aggiungiGiocatore() {
        if(this.stato !== StatoStanza.WAIT)
            return false;
        const giocatore = new Giocatore();
        giocatore.aggiungiMano(this.round.mazzo.prendiMano())
        this.giocatori.push(giocatore);
        return giocatore;
    }

    eliminaGiocatore() {
        //todo logica con cambio ruoli
    }

    numeroGiocatori() {
        return this.giocatori.length;
    }

    terminaPartita() {
        if(this.stato !== StatoStanza.END) {
            this.stato = StatoStanza.END;
            return this.giocatori.toSorted((a, b) => a.punti - b.punti > 0);
        }
        return false;
    }

    aggiungiRisposta(carta, giocatoreId) {
        if(this.stato === StatoStanza.CHOOSING_CARDS) {
            this.round.risposte.push({
                carta: carta,
                chi: this.giocatori.find(giocatore => giocatore.id === giocatoreId)
            });
            if(this.round.risposte.length === (this.giocatori.length - 1)) return true;
        }
        return false;
    }

    scegliVincitore(chiStaChiedendo, indiceRisposta) {
        if(this.stato !== StatoStanza.CHOOSING_WINNER ||
            this.round.risposte.length !== (this.giocatori.length - 1) || chiStaChiedendo !== this.round.chiStaInterrogando) return false;
        this.stato = StatoStanza.WAIT;
        return this.round.risposte[indiceRisposta] || false;
    }
}