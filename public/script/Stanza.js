const StatoStanza = Object.freeze({
    WAIT: 1,
    END: 5,
    CHOOSING_WINNER: 3,
    WINNER: 4,
    CHOOSING_CARDS: 2
});
const { Giocatore } = require('Giocatore');
const { Mazzo, TipoMazzo } = require('Mazzo');

class Stanza {

    constructor(pack) {
        this.id = generateId(7);
        this.pack = pack || "standard";
        this.giocatori = Array.of(Giocatore);
        this.stato = StatoStanza.WAIT;
        this.master = new Giocatore();
        this.master.aggiungiMano()
        this.giocatori.push(this.master);
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
        this.round = {
            domanda: this.mazzoFrasi.mazzo.prendiCarte(1),
            risposte: [],
            chiStaInterrogando: this.master
        }
    }

    aggiungiGiocatore() {
        if(this.stato !== StatoStanza.WAIT)
            return false;
        const giocatore = new Giocatore();
        giocatore.aggiungiMano(this.mazzoCompletamenti.mazzo.prendiCarte())
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
            return this.giocatori.toSorted((a, b) => a.punti - b.punti);
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