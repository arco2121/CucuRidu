const { generateId } = require("public/script/generazione");
const { Mazzo, TipoMazzo } = require("include/script/Mazzo");

class Giocatore {

    constructor(username, memory) {
        this.id = generateId(32, memory);
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