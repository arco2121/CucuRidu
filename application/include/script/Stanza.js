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

    constructor(minimoGiocatori = 2) {
        this.giocatori = new Map();
        this.giocatoriPassati = new Set();
        this.stato = StatoStanza.WAIT;
        this.minimoGiocatori = minimoGiocatori;
        this.mazzoCompletamenti = {
            mazzo: new Mazzo({
                pack: "standard",
                tipoMazzo: TipoMazzo.COMPLETAMENTI
            }),
            // lo scarto deve sapere che tipo di carte accoglie, altrimenti una
            // frase che ci passa dentro viene appiattita a stringa
            scarto: new Mazzo({ tipoMazzo: TipoMazzo.COMPLETAMENTI })
        };
        this.mazzoFrasi = {
            mazzo: new Mazzo({
                pack: "standard",
                tipoMazzo: TipoMazzo.FRASI
            }),
            scarto: new Mazzo({ tipoMazzo: TipoMazzo.FRASI })
        };
    }

    async init(username, pfp, memory) {
        this.id = typeof memory === "string" ? memory : await generateId(6, memory);
        this.master = await new Giocatore(username, pfp, true, true).init(memory);
        this.round = {
            domanda: null,
            risposte: null,
            chiStaInterrogando: this.master.id
        };
        this.giocatori.set(this.master.id, this.master);
        this.chat = {
            messaggi: []
        };
        this.numeroRound = [0, this.giocatori.size];
        return this;
    }

    async aggiungiGiocatore(username, pfp, memory) {
        const giocatore = await new Giocatore(username, pfp).init(memory);
        return this.aggiungiGiocatorePronto(giocatore);
    }

    /**
     * Versione sincrona di aggiungiGiocatore, con il Giocatore gia costruito.
     * Serve perche' le modifiche alla stanza devono poter essere rieseguite
     * (vedi ClusterStanze.mutate) e quindi non possono contenere await.
     */
    aggiungiGiocatorePronto(giocatore) {
        if(this.stato !== StatoStanza.WAIT) return false;
        if(!giocatore?.id) return false;
        if(this.giocatori.has(giocatore.id)) return this.giocatori.get(giocatore.id);
        let maxOccorrenze = 0;
        this.mazzoFrasi.mazzo.carte.map(carta => carta[1]).forEach(occorrenza => {
            if(!isNaN(parseInt(occorrenza))) maxOccorrenze += parseInt(occorrenza)
        });
        this.numeroRound = [this.numeroRound[0], Math.floor(maxOccorrenze / (this.giocatori.size + 1))];
        this.giocatori.set(giocatore.id, giocatore);
        return giocatore;
    }

    /**
     * Rete di sicurezza contro le stanze bloccate: se tutti quelli che devono
     * rispondere hanno risposto ma lo stato e' rimasto indietro (perche' nel
     * frattempo qualcuno e' uscito o si e' persa una scrittura), avanza.
     */
    sincronizzaStato() {
        if(this.stato !== StatoStanza.CHOOSING_CARDS) return false;
        if(!(this.round?.risposte instanceof Map)) return false;
        const attesi = this.giocatori.size - 1;
        if(attesi > 0 && this.round.risposte.size >= attesi) {
            this.stato = StatoStanza.CHOOSING_WINNER;
            return true;
        }
        return false;
    }

    eliminaGiocatore(giocatoreId) {
        const giocatore = this.trovaGiocatore(giocatoreId);
        if(!giocatore) return false;

        this.mazzoCompletamenti.mazzo.aggiungiCarte(...giocatore.prendiTuttaLaMano())
        this.giocatoriPassati.add(giocatore.id);
        this.giocatori.delete(giocatoreId);
        this.chat = {
            messaggi: (this.chat?.messaggi ?? []).map(messaggio => {
                if(messaggio["giocatoreId"] === giocatoreId) messaggio.eliminato = true;
                return messaggio;
            }),
        };

        if(giocatore.id === this.master?.id) {
            this.master = this.giocatori.values().next().value;
            if (this.master) this.master.masterRole = true;
        }
        if(giocatore.id === this.round?.chiStaInterrogando) {
            this.round.chiStaInterrogando = this.giocatori.values().next()?.value?.id;
            const nuovoInterrogante = this.trovaGiocatore(this.round.chiStaInterrogando);
            if (nuovoInterrogante) nuovoInterrogante.interrogationRole = true;
        }

        if (this.round?.risposte?.has(giocatoreId)) {
            const carteGiocate = this.round.risposte.get(giocatoreId);
            this.mazzoCompletamenti.mazzo.aggiungiCarte(...carteGiocate);
            this.round.risposte.delete(giocatoreId);
        }

        if(this.giocatori.size < this.minimoGiocatori) {
            this.stato = StatoStanza.WAIT;
            this.numeroRound[0] = Math.max(0, this.numeroRound[0] - 1);
            Array.from(this.round?.risposte?.entries() || []).forEach(([key, value]) => {
                this.trovaGiocatore(key)?.aggiungiMano(...value);
            });
            this.round?.risposte?.clear();
        }
        else if (this.stato === StatoStanza.CHOOSING_CARDS) {
            // >= e non ===: se lo stato e' rimasto indietro non deve restare bloccato
            if ((this.round?.risposte?.size ?? 0) >= (this.giocatori.size - 1)
                && this.giocatori.size > 1) {
                this.stato = StatoStanza.CHOOSING_WINNER;
            }
        }

        if(this.giocatori.size === 0) return true;
        let maxOccorrenze = 0;
        this.mazzoFrasi.mazzo.carte.map(carta => carta[1]).forEach(occorrenza => {
            if(!isNaN(parseInt(occorrenza))) maxOccorrenze += parseInt(occorrenza)
        });
        this.numeroRound = [this.numeroRound[0], Math.floor(maxOccorrenze / this.giocatori.size)];
        return true;
    }

    trovaGiocatore(idGiocatore) {
        return this.giocatori.get(idGiocatore);
    }

    trovaGiocatoreAnchePassato(idGiocatore) {
        if(this.giocatori.has(idGiocatore))
            return this.giocatori.get(idGiocatore);
        if(this.giocatoriPassati.has(idGiocatore))
            return false;
        return null;
    }

    terminaPartita(idGiocatore, forzato = false) {
        if(this.stato !== StatoStanza.END
            && (forzato || (!!this.master && this.trovaGiocatore(idGiocatore)?.id === this.master.id))) {
            this.stato = StatoStanza.END;
            const classifica = this.classifica();
            this.giocatori.clear();
            this.mazzoFrasi = null;
            this.mazzoCompletamenti = null;
            this.master = null;
            return classifica;
        }
        return false;
    }

    classifica() {
        return [...Array.from(this.giocatori.values() || [])?.sort((a, b) => b.punti - a.punti)];
    }

    iniziaTurno(chiStaChidedendo) {
        if(this.stato !== StatoStanza.WAIT || this.giocatori.size < this.minimoGiocatori)
            return false;
        if(this.numeroRound[0] === 0) {
            let maxOccorrenze = 0;
            this.mazzoFrasi.mazzo.carte.map(carta => carta[1]).forEach(occorrenza => {
                if(!isNaN(parseInt(occorrenza))) maxOccorrenze += parseInt(occorrenza)
            });
            this.numeroRound = [1, Math.floor(maxOccorrenze / this.giocatori.size)];
            this.mazzoCompletamenti.mazzo.shuffle();
            this.mazzoFrasi.mazzo.shuffle();
            this.round = {
                domanda: this.mazzoFrasi.mazzo.prendiCarte(1)[0],
                risposte: new Map(),
                chiStaInterrogando: this.master.id
            }
        }
        // fine partita per numero di round esaurito: va forzata, qui non e' il
        // master a chiedere ma il sistema (prima tornava sempre false e la
        // partita restava appesa)
        if(this.numeroRound[0] === this.numeroRound[1])
            return this.terminaPartita(null, true);
        this.controllaMazzi(this.round.domanda[1]);
        this.ripristinaMani();
        if(chiStaChidedendo === this.round.chiStaInterrogando) {
            this.stato = StatoStanza.CHOOSING_CARDS;
            return true;
        }
        return false;
    }

    aggiungiRisposta(giocatoreId, ...indexCarte) {
        if(!(this.round?.risposte instanceof Map)) return false;
        if(giocatoreId === this.round.chiStaInterrogando) return false;
        if(this.stato === StatoStanza.CHOOSING_CARDS && this.giocatori.has(giocatoreId)
            && !this.round.risposte.has(giocatoreId)) {
            const giocatore = this.trovaGiocatore(giocatoreId);

            // Gli indici arrivano dal client e vanno controllati: devono essere
            // tanti quanti gli spazi vuoti della frase, interi, distinti e
            // dentro la mano. Senza questo controllo un client disallineato
            // (per esempio dopo una riconnessione) faceva sparire carte dalla
            // mano e infilava dei null nello scarto.
            const spaziAttesi = parseInt(this.round.domanda?.[1]) || 1;
            if(indexCarte.length !== spaziAttesi) return false;

            const carte = giocatore.prendiMano(...indexCarte);
            if(!carte || carte.length !== spaziAttesi) return false;
            if(carte.some(c => typeof c !== "string" || !c)) return false;
            this.round.risposte.set(giocatoreId, carte);
            if(this.round.risposte.size >= (this.giocatori.size - 1)) {
                this.stato = StatoStanza.CHOOSING_WINNER;
                return [
                    this.round.domanda,
                    Mazzo.shuffle([...Array.from(this.round.risposte.entries())]),
                    this.round.chiStaInterrogando
                ];
            }
            return true;
        }
        return false;
    }

    scegliVincitore(chiStaChiedendo, idGiocatore) {
        if(!(this.round?.risposte instanceof Map)) return false;
        if(this.stato !== StatoStanza.CHOOSING_WINNER ||
            this.round.risposte.size < (this.giocatori.size - 1) || !chiStaChiedendo ||
            chiStaChiedendo !== this.round.chiStaInterrogando || !this.round.risposte.has(idGiocatore)) return false;

        const risposte = this.round.risposte.get(idGiocatore);
        // tutte le risposte del round, non solo quella del vincitore: servono
        // per l'immagine riepilogativa che si scarica dalla schermata vincitore,
        // dopo questo punto this.round viene azzerato e andrebbero perse
        const tutteLeRisposte = Array.from(this.round.risposte.entries());
        const vincitoreRound = this.trovaGiocatore(idGiocatore);
        const domandaScartata = this.round.domanda;

        this.stato = StatoStanza.WAIT;

        if (vincitoreRound) {
            vincitoreRound.punti++;
            vincitoreRound.interrogationRole = true;
        }

        this.controllaMazzi(domandaScartata[1]);
        this.ripristinaMani();

        this.mazzoCompletamenti.scarto.aggiungiCarte(...Array.from(this.round.risposte.values()).flat());
        this.mazzoFrasi.scarto.aggiungiCarte(domandaScartata);

        this.trovaGiocatore(this.round.chiStaInterrogando).interrogationRole = false;

        this.round = {
            domanda: this.mazzoFrasi.mazzo.prendiCarte(1)[0],
            risposte: new Map(),
            chiStaInterrogando: idGiocatore
        }
        this.numeroRound[0] += 1;

        return [vincitoreRound.toJSON(), domandaScartata, risposte, tutteLeRisposte];
    }

    /**
     * Riporta ogni mano a CARTE_IN_MANO. Prima le carte venivano date solo a
     * chi aveva la mano completamente vuota, quindi col passare dei round le
     * mani si sbilanciavano e gli indici del client non corrispondevano piu a
     * quello che aveva il server.
     */
    ripristinaMani(quante = Stanza.CARTE_IN_MANO) {
        for (const giocatore of this.giocatori.values()) {
            const mancanti = quante - giocatore.mazzo.carte.length;
            if (mancanti <= 0) continue;
            if (this.mazzoCompletamenti.mazzo.carte.length < mancanti)
                this.controllaMazzi(mancanti);
            giocatore.aggiungiMano(...this.mazzoCompletamenti.mazzo.prendiCarte(mancanti));
        }
    }

    controllaMazzi(spaziNecessari) {
        if(this.mazzoCompletamenti.mazzo.carte.length < this.giocatori.size * spaziNecessari) {
            this.mazzoCompletamenti.mazzo.aggiungiCarte(...this.mazzoCompletamenti.scarto.prendiCarte(this.mazzoCompletamenti.scarto.carte.length));
            this.mazzoCompletamenti.mazzo.shuffle();
        }
        if(this.mazzoFrasi.mazzo.carte.length - 1 <= 0) {
            this.mazzoFrasi.mazzo.aggiungiCarte(...this.mazzoFrasi.scarto.prendiCarte(this.mazzoFrasi.scarto.carte.length));
            this.mazzoFrasi.mazzo.shuffle();
        }
    }

    modificaMazzo(mazzi) {
        if(this.stato !== StatoStanza.WAIT || this.numeroRound[0] > 0)
            return false;
        try {
            if(!Mazzo.controllaMazzo(...mazzi))
                return false;
            const mazziFrasi = mazzi.map(mazzo => new Mazzo({
                pack: mazzo,
                tipoMazzo: TipoMazzo.FRASI
            }));
            const mazziCompletamenti = mazzi.map(mazzo => new Mazzo({
                pack: mazzo,
                tipoMazzo: TipoMazzo.COMPLETAMENTI
            }));
            this.mazzoFrasi.mazzo = Mazzo.unisciMazzi(...mazziFrasi);
            this.mazzoFrasi.scarto = new Mazzo({ tipoMazzo: TipoMazzo.FRASI });
            this.mazzoCompletamenti.mazzo = Mazzo.unisciMazzi(...mazziCompletamenti);
            this.mazzoCompletamenti.scarto = new Mazzo({ tipoMazzo: TipoMazzo.COMPLETAMENTI });
            return true;
        } catch {
            return false;
        }
    }

    scriviInChat(messaggio, giocatoreId) {
        const giocatore = this.trovaGiocatore(giocatoreId);
        if(!giocatore) return false;
        if(!this.chat?.messaggi) this.chat = { messaggi: [] };
        this.chat.messaggi.push({
            pfp: giocatore?.pfp,
            username: giocatore?.username,
            messaggio: messaggio,
            giocatoreId: giocatoreId,
            timestamp: Date.now(),
            eliminato: false
        });
        return this.chat.messaggi;
    }

    static trovaDaGiocatore(idGiocatore, Stanze) {
        for (const stanza of Stanze) {
            if (stanza.giocatori?.has(idGiocatore)) {
                return stanza.id;
            }
        }
        return null;
    }

    static async pulisciStanza(callback, memory, Stanze, ...stanzeId) {
        const check = async (stanzaId) => {
            const stanza = await Stanze.get(stanzaId);
            if(stanza?.stato === StatoStanza.END || stanza?.giocatori.size === 0 && stanza?.giocatoriPassati.size > 0) {
                for (const id of stanza.giocatoriPassati.values()) await memory.delete(id);
                await Stanze.delete(stanza.id);
                await memory.delete(stanza.id);
                await callback(stanza.id);
            }
        };
        if(stanzeId.length === 0) for (const stanzaId of await Stanze.keys()) await check(stanzaId);
        else for (const stanzaId of stanzeId) await check(stanzaId);
    }

    toString() {
        return JSON.stringify({
            numeroGiocatori: this.giocatori.size,
            stato: Object.keys(StatoStanza).filter(chiave => StatoStanza[chiave] === this.stato)[0]
        })
    }

    toJSON() {
        return {
            id: this.id,
            stato: this.stato,
            minimoGiocatori: this.minimoGiocatori,
            numeroRound: this.numeroRound,
            giocatori: Array.from(this.giocatori.entries()),
            giocatoriPassati: Array.from(this.giocatoriPassati),
            masterId: this.master ? this.master.id : null,
            mazzoCompletamenti: this.mazzoCompletamenti,
            mazzoFrasi: this.mazzoFrasi,
            round: {
                ...this.round,
                risposte: this.round.risposte ? Array.from(this.round.risposte.entries()) : null
            },
            chat: this.chat
        };
    }

    static async fromJSON(data) {
        const s = await new Stanza(data.minimoGiocatori).init(null, null, data.id);

        s.stato = data.stato;
        s.numeroRound = data.numeroRound;
        s.giocatori = new Map(data.giocatori.map(([id, gData]) => [id, Giocatore.fromJSON(gData)]));
        s.giocatoriPassati = new Set(data.giocatoriPassati);
        s.master = s.giocatori.get(data.masterId);

        const ripristinaMazzo = (obj, tipo) => ({
            mazzo: Mazzo.fromJSON(obj?.mazzo, tipo),
            scarto: Mazzo.fromJSON(obj?.scarto, tipo)
        });
        s.mazzoCompletamenti = ripristinaMazzo(data.mazzoCompletamenti, TipoMazzo.COMPLETAMENTI);
        s.mazzoFrasi = ripristinaMazzo(data.mazzoFrasi, TipoMazzo.FRASI);

        s.round = {
            domanda: data.round.domanda,
            chiStaInterrogando: data.round.chiStaInterrogando,
            risposte: data.round.risposte ? new Map(data.round.risposte) : new Map()
        };
        s.chat = data.chat?.messaggi ? data.chat : { messaggi: [] };

        return s;
    }
}

Stanza.CARTE_IN_MANO = 11;

module.exports = { Stanza, StatoStanza };