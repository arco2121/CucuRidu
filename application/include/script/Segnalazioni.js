/*
 * Archivio delle segnalazioni su frasi e completamenti sbagliati.
 *
 * Due implementazioni con la stessa interfaccia:
 *   SegnalazioniCluster  -> tabella "segnalazioni" su Supabase
 *   SegnalazioniLocali   -> in RAM, per la modalita' single (si perdono al riavvio)
 *
 * Ogni riga e' un singolo elemento segnalato:
 *   { stanza_id, giocatore, tipo: "frase" | "completamento", testo, nota }
 */

const MASSIMO_PER_INVIO = 15;
const LUNGHEZZA_TESTO = 400;
const LUNGHEZZA_NOTA = 500;

const taglia = (valore, massimo) => String(valore ?? "").trim().slice(0, massimo);

/** Ripulisce quello che arriva dal client prima di salvarlo. */
const normalizzaRighe = (righe, contesto = {}) => {
    if (!Array.isArray(righe)) return [];
    return righe
        .slice(0, MASSIMO_PER_INVIO)
        .map(riga => ({
            stanza_id: taglia(contesto.stanzaId, 12) || null,
            giocatore: taglia(contesto.giocatore, 80) || null,
            tipo: riga?.tipo === "frase" ? "frase" : "completamento",
            testo: taglia(riga?.testo, LUNGHEZZA_TESTO),
            nota: taglia(contesto.nota, LUNGHEZZA_NOTA) || null
        }))
        .filter(riga => riga.testo.length > 0);
};

class SegnalazioniLocali {

    constructor(massimo = 500) {
        this.massimo = massimo;
        this.righe = [];
    }

    async aggiungi(righe) {
        if (!righe.length) return 0;
        const conData = righe.map(r => ({ ...r, creato_at: new Date().toISOString() }));
        this.righe.unshift(...conData);
        if (this.righe.length > this.massimo) this.righe.length = this.massimo;
        return conData.length;
    }

    async leggi(limite = 200) {
        return this.righe.slice(0, limite);
    }
}

class SegnalazioniCluster {

    constructor(client) {
        this.supabase = client;
        this.tabella = "segnalazioni";
    }

    async aggiungi(righe) {
        if (!righe.length) return 0;
        const { error } = await this.supabase.from(this.tabella).insert(righe);
        if (error) throw error;
        return righe.length;
    }

    async leggi(limite = 200) {
        const { data, error } = await this.supabase
            .from(this.tabella)
            .select("*")
            .order("creato_at", { ascending: false })
            .limit(limite);
        if (error) throw error;
        return data || [];
    }
}

module.exports = { SegnalazioniLocali, SegnalazioniCluster, normalizzaRighe, MASSIMO_PER_INVIO };
