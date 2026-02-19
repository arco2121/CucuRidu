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
        this.giocatori = [];
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
        this.giocatori.push(this.master);
        this.numeroRound = [1, this.giocatori.length];
    }

    aggiungiGiocatore(username, pfp, memory) {
        if(this.stato !== StatoStanza.WAIT)
            return false;
        const giocatore = new Giocatore(username, pfp, memory);
        this.numeroRound = [this.numeroRound[0], (this.numeroRound[1] / this.giocatori.length) * (this.giocatori.length + 1)];
        this.giocatori.push(giocatore);
        return giocatore;
    }

    eliminaGiocatore(giocatoreId) {
        const giocatore = this.trovaGiocatore(giocatoreId);
        if(giocatore === this.master)
            this.master = this.giocatori[this.giocatori.indexOf(giocatore)];
        this.mazzoCompletamenti.mazzo.aggiungiCarte(...giocatore.prendiTuttaLaMano())
        this.giocatori.splice(this.giocatori.findIndex(giocatoreDaEliminare => giocatoreDaEliminare.id === giocatoreId), 1);
    }

    trovaGiocatore(idGiocatore) {
        return this.giocatori.find(giocatore => giocatore.id === idGiocatore);
    }

    terminaPartita(idGiocatore) {
        if(this.stato !== StatoStanza.END && this.trovaGiocatore(idGiocatore) === this.master) {
            this.stato = StatoStanza.END;
            return this.giocatori.toSorted((a, b) => a.punti - b.punti);
        }
        return false;
    }

    iniziaTurno(chiStaChidedendo) {
        if(this.stato !== StatoStanza.WAIT || this.giocatori.length < this.minimoGiocatori)
            return false;
        if(this.numeroRound[0] === this.numeroRound[1])
            return this.terminaPartita();
        if(this.numeroRound[0] === 1) {
            let maxOccorrenze = 0;
            this.mazzoFrasi.mazzo.carte.map(carta => carta[1]).forEach(occorrenza => maxOccorrenze += occorrenza);
            this.numeroRound = [1, maxOccorrenze * this.giocatori.length];
            this.mazzoCompletamenti.mazzo.shuffle();
            this.mazzoFrasi.mazzo.shuffle();
            this.round = {
                domanda: this.mazzoFrasi.mazzo.prendiCarte(1),
                risposte: [],
                chiStaInterrogando: this.master.id
            }
        }
        for (const giocatore of this.giocatori)
            giocatore.mazzo.carte.length === 0 ? giocatore.aggiungiMano(this.mazzoCompletamenti.mazzo.prendiCarte(12)) : null;
        if(chiStaChidedendo === this.round.chiStaInterrogando) {
            this.stato = StatoStanza.CHOOSING_CARDS;
            return true;
        }
        return false;
    }

    aggiungiRisposta(giocatoreId, ... indexCarte) {
        if(this.stato === StatoStanza.CHOOSING_CARDS && this.giocatori.find(giocatore => giocatore.id === giocatoreId)
            && !this.round.risposte.find(risposta => risposta.chi === giocatoreId)) {
            this.round.risposte.push({
                carte: this.giocatori.find(giocatore => giocatore.id === giocatoreId).prendiMano(...indexCarte),
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

    static trovaDaGiocatore(idGiocatore, ...Stanze) {
        return Stanze.find(stanza => stanza.giocatori.filter(giocatore => giocatore.id === idGiocatore).length > 0)?.id;
    }
}

module.exports = { Stanza, StatoStanza };