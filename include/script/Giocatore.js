const path = require("path");
const { generateId } = require(path.join(__dirname, '/generazione'));
const { Mazzo, TipoMazzo } = require((path.join(__dirname, '/Mazzo')));

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

    adaptToClient() {
        return {
            id: this.id,
            username: this.username,
            mazzo: this.mazzo.toArray()
        }
    }
}

module.exports = { Giocatore };