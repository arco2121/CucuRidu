/*
 * Archivio delle segnalazioni su frasi e completamenti sbagliati.
 *
 * Due implementazioni con la stessa interfaccia:
 *   SegnalazioniCluster  -> tabella "segnalazioni" su Supabase
 *   SegnalazioniLocali   -> in RAM, per la modalita' single (si perdono al riavvio)
 *
 * Ogni riga e' un singolo elemento segnalato:
 *   { id, stanza_id, giocatore, tipo: "frase" | "completamento", testo, nota, risolta }
 */

const crypto = require("crypto");

/*
 * Due famiglie di righe nella stessa tabella:
 *   frase / completamento                              -> "questo e' sbagliato"
 *   suggerimento_frase / suggerimento_completamento    -> "aggiungete questo"
 * Le teniamo insieme perche' il giro e' lo stesso (arrivano dal gioco, si
 * leggono da /segnalazioni, si spuntano quando sono state sistemate); a
 * separarle basta la colonna tipo.
 */
const TIPI_SEGNALAZIONE = ["frase", "completamento"];
const TIPI_SUGGERIMENTO = ["suggerimento_frase", "suggerimento_completamento"];

const MASSIMO_PER_INVIO = 15;
const LUNGHEZZA_TESTO = 400;
const LUNGHEZZA_NOTA = 500;

const taglia = (valore, massimo) => String(valore ?? "").trim().slice(0, massimo);

/**
 * Ripulisce quello che arriva dal client prima di salvarlo.
 * `tipiAmmessi` decide quale famiglia di tipi puo passare: un tipo fuori
 * lista non viene salvato com'e', ricade sull'ultimo della lista. Cosi il
 * client non puo infilare tipi inventati nel database.
 */
const normalizzaRighe = (righe, contesto = {}, tipiAmmessi = TIPI_SEGNALAZIONE) => {
    if (!Array.isArray(righe)) return [];
    const ammessi = Array.isArray(tipiAmmessi) && tipiAmmessi.length ? tipiAmmessi : TIPI_SEGNALAZIONE;
    const ripiego = ammessi[ammessi.length - 1];
    return righe
        .slice(0, MASSIMO_PER_INVIO)
        .map(riga => ({
            stanza_id: taglia(contesto.stanzaId, 12) || null,
            giocatore: taglia(contesto.giocatore, 80) || null,
            tipo: ammessi.includes(riga?.tipo) ? riga.tipo : ripiego,
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
        const conData = righe.map(r => ({ ...r, id: crypto.randomUUID(), risolta: false, creato_at: new Date().toISOString() }));
        this.righe.unshift(...conData);
        if (this.righe.length > this.massimo) this.righe.length = this.massimo;
        return conData.length;
    }

    async leggi(limite = 200) {
        return this.righe.slice(0, limite);
    }

    /** Segna (o smarca) una segnalazione come risolta. */
    async segna(id, risolta) {
        const riga = this.righe.find(r => r.id === id);
        if (!riga) return false;
        riga.risolta = !!risolta;
        return true;
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

    /** Segna (o smarca) una segnalazione come risolta. */
    async segna(id, risolta) {
        const { error } = await this.supabase
            .from(this.tabella)
            .update({ risolta: !!risolta })
            .eq("id", id);
        if (error) throw error;
        return true;
    }
}

module.exports = {
    SegnalazioniLocali, SegnalazioniCluster, normalizzaRighe,
    MASSIMO_PER_INVIO, TIPI_SEGNALAZIONE, TIPI_SUGGERIMENTO
};
