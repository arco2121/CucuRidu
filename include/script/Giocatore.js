const path = require("path");
const { generateId } = require(path.join(__dirname, '/generazione'));
const { Mazzo, TipoMazzo } = require((path.join(__dirname, '/Mazzo')));

class Giocatore {

    constructor(username, pfp, memory, role = false) {
        this.id = generateId(32, memory);
        this.username = username;
        this.punti = 0;
        this.pfp = pfp;
        this.online = true;
        this.masterRole = role;
        this.mazzo = new Mazzo(TipoMazzo.COMPLETAMENTI);
    }

    aggiungiMano(...carte) {
        this.mazzo.aggiungiCarte(...carte);
    }

    prendiMano(...indexCarte) {
        return this.mazzo.prendiCarteByIndex(indexCarte);
    }

    prendiTuttaLaMano() {
        return this.mazzo.prendiCarte(this.mazzo.carte.length);
    }

    isOnline() {
        return this.online;
    }

    adaptToClient() {
        return {
            id: this.id,
            username: this.username,
            mazzo: this.mazzo.toArray(),
            pfp: this.pfp,
            masterRole: this.masterRole
        }
    }
}

module.exports = { Giocatore };