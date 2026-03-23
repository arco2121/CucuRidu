const path = require("path");
const { generateId } = require(path.join(__dirname, '/generazione'));
const { Mazzo, TipoMazzo } = require((path.join(__dirname, '/Mazzo')));

class Giocatore {

    constructor(username, pfp, role = false, interrogating = false) {
        this.username = username;
        this.punti = 0;
        this.pfp = pfp;
        this.online = true;
        this.masterRole = role;
        this.interrogationRole = interrogating;
        this.mazzo = new Mazzo(TipoMazzo.COMPLETAMENTI);
    }

    async init(memory) {
        this.id = await generateId(32, memory);
        return this;
    }

    aggiungiMano(...carte) {
        this.mazzo.aggiungiCarte(...carte);
    }

    prendiMano(...indexCarte) {
        return this.mazzo.prendiCarteByIndex(...indexCarte);
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
            masterRole: this.masterRole,
            interrogationRole: this.interrogationRole,
            punti: this.punti,
            aaaaa: "aaaaa"
        }
    }

    toJSON() {
        return {
            id: this.id,
            username: this.username,
            punti: this.punti,
            pfp: this.pfp,
            online: this.online,
            masterRole: this.masterRole,
            interrogationRole: this.interrogationRole,
            mazzo: this.mazzo
        };
    }

    static fromJSON(data) {
        const g = new Giocatore(data.username, data.pfp, null);
        Object.assign(g, data);
        g.mazzo = Mazzo.fromJSON(data.mazzo);
        return g;
    }
}

module.exports = { Giocatore };