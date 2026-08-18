const path = require('path');
const { Stanza } = require(path.join(__dirname, 'Stanza'));
const { ClusterMap } = require(path.join(__dirname, 'ClusterMap'));
const { conLock, attendi, NESSUNA_MODIFICA } = require(path.join(__dirname, 'concorrenza'));

const CONFLITTO = -1;
const SPARITA = -2;

class ClusterStanze extends ClusterMap {

    constructor(client, machine_id) {
        super(client, machine_id);
        this.table = "stanze";
        this.keyField = "stanza_Id";
        this.valueField = "stanza";
        this.tentativiMassimi = 8;
    }

    async get(key) {
        if (!key) return null;
        const { data, error } = await this.supabase
            .from(this.table).select(`${this.valueField}, version`).eq(this.keyField, key).maybeSingle();
        if (error || !data) return null;

        const stanza = await Stanza.fromJSON(data[this.valueField]);
        // la version non deve finire nel toJSON: la teniamo fuori dalle chiavi enumerabili
        Object.defineProperty(stanza, "__version", {
            value: typeof data.version === "number" ? data.version : null,
            writable: true,
            enumerable: false,
            configurable: true
        });

        const { data: presenze } = await this.supabase
            .from('presenza').select('giocatore_id, online, socket_id').eq('stanza_id', key);
        for (const p of presenze || []) {
            const g = stanza.trovaGiocatore(p.giocatore_id);
            if (g) { g.online = p.online; g.socketId = p.socket_id || ""; }
        }
        return stanza;
    }

    /**
     * Presenza online/offline di un giocatore.
     * Per un "offline" va passato expectedSocketId: il cambio viene accettato
     * solo se quel socket e' ancora quello registrato, altrimenti il disconnect
     * tardivo di un socket morto butterebbe fuori un giocatore che nel
     * frattempo si e' gia riconnesso con un socket nuovo.
     */
    async setPresenza(giocatoreId, stanzaId, online, socketId, eventTime, expectedSocketId = null) {
        const { data, error } = await this.supabase.rpc('set_presenza', {
            p_giocatore_id: giocatoreId, p_stanza_id: stanzaId,
            p_online: online, p_socket_id: socketId, p_event_time: eventTime,
            p_expected_socket_id: expectedSocketId
        });
        if (error) throw error;
        return data !== false;
    }

    /** Scrittura incondizionata: da usare solo per creare una stanza nuova. */
    async set(key, value) {
        const jsonToMerge = value?.toJSON ? value.toJSON() : value;

        const { data, error } = await this.supabase.rpc('update_stanza_cas', {
            target_id: key,
            new_json: jsonToMerge,
            id_of_machine: this.machine_id,
            expected_version: null
        });

        if (error) throw error;
        if (value && typeof value === "object") {
            try { value.__version = typeof data === "number" ? data : null; } catch { /* ignora */ }
        }
        return value;
    }

    /** Scrittura condizionata alla version letta. Ritorna la nuova version, oppure CONFLITTO / SPARITA. */
    async setSeNonCambiata(key, stanza) {
        const attesa = typeof stanza?.__version === "number" ? stanza.__version : null;
        const { data, error } = await this.supabase.rpc('update_stanza_cas', {
            target_id: key,
            new_json: stanza.toJSON(),
            id_of_machine: this.machine_id,
            expected_version: attesa
        });
        if (error) throw error;
        if (typeof data === "number" && data > 0) stanza.__version = data;
        return data;
    }

    /**
     * Legge la stanza, applica la modifica e la riscrive in modo atomico.
     * Il mutatore DEVE essere sincrono e senza effetti collaterali esterni,
     * perche' in caso di conflitto viene rieseguito su uno stato piu fresco.
     *
     * Ritorna null se la stanza non esiste, altrimenti { stanza, risultato, scritto }.
     */
    async mutate(key, mutatore) {
        if (!key) return null;
        return conLock("stanza:" + key, async () => {
            for (let tentativo = 0; tentativo < this.tentativiMassimi; tentativo++) {
                const stanza = await this.get(key);
                if (!stanza) return null;

                const risultato = mutatore(stanza);
                if (risultato === NESSUNA_MODIFICA)
                    return { stanza, risultato: undefined, scritto: false };

                const esito = await this.setSeNonCambiata(key, stanza);
                if (esito === SPARITA) return null;
                if (esito === CONFLITTO) {
                    await attendi(15 + Math.floor(Math.random() * 40) * (tentativo + 1));
                    continue;
                }
                return { stanza, risultato, scritto: true };
            }
            throw new Error("Troppi conflitti in scrittura sulla stanza " + key);
        });
    }

    async checkOld() {
        const { error } = await this.supabase.rpc('delete_old_stanze');
        if (error) throw error;
        const { error: presError } = await this.supabase.rpc('delete_old_presenza');
        if (presError) throw presError;
    }

    async values() {
        return (await this.entries()).map(entry => entry[1]);
    }

    async entries() {
        const { data, error } = await this.supabase
            .from(this.table)
            .select(`${this.keyField}, ${this.valueField}`);

        if (error || !data) return [];

        return Promise.all(data.map(async (item) => [
            item[this.keyField],
            await Stanza.fromJSON(item[this.valueField])
        ]));
    }
}

ClusterStanze.NESSUNA_MODIFICA = NESSUNA_MODIFICA;
ClusterStanze.CONFLITTO = CONFLITTO;
ClusterStanze.SPARITA = SPARITA;

module.exports = { ClusterStanze };
