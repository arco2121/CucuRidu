const path = require("path");
const { generateId } = require(path.join(__dirname, '/generazione'));
const { Mazzo } = require((path.join(__dirname, '/Mazzo')));

class Giocatore {

    constructor(username, pfp, role = false, interrogating = false) {
        this.username = username;
        this.punti = 0;
        this.pfp = pfp;
        this.online = true;
        this.socketId = "";
        this.masterRole = role;
        this.interrogationRole = interrogating;
        this.mazzo = new Mazzo();
    }

    async init(memory) {
        this.id = typeof memory === "string" ? memory : await generateId(32, memory);
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

    assegnaSocket(id) {
        this.socketId = id ?? "";
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
            mazzo: this.mazzo,
            socketId: this.socketId
        };
    }

    static fromJSON(data) {
        const g = new Giocatore(data.username, data.pfp);
        Object.assign(g, data);
        g.mazzo = Mazzo.fromJSON(data.mazzo);
        return g;
    }
}

module.exports = { Giocatore };