const { generateId } = require("generazione");
const { Mazzo, TipoMazzo } = require("Mazzo");

class Giocatore {

    constructor(username) {
        this.id = generateId(32);
        this.username = username;
        this.punti = 0;
        this.mazzo = new Mazzo(TipoMazzo.COMPLETAMENTI);
    }

    aggiungiMano(...carte) {
        this.mazzo.aggiungiCarte(carte);
    }

    prendiMano(...indexCarte) {
        return this.mazzo.prendiCarteByIndex(indexCarte);
    }
}

module.exports = { Giocatore };