const { generateId } = require("generazione");
const { Mazzo } = require("Mazzo");

class Giocatore {

    constructor(tipologiaMazzo) {
        this.id = generateId(32);
        this.punti = 0;
        this.mazzo = new Mazzo(tipologiaMazzo);
    }
}