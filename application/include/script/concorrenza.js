/**
 * Utilita' per le modifiche concorrenti sulle stanze.
 *
 * conLock: lock asincrono per chiave, valido dentro un singolo processo.
 * Serve a non far partire due read-modify-write sulla stessa stanza in
 * parallelo sulla stessa istanza: senza questo, due giocatori che inviano la
 * risposta nello stesso istante leggono entrambi lo stato vecchio e uno dei
 * due invii sparisce. Fra istanze diverse ci pensa il compare-and-swap sulla
 * colonna version (vedi ClusterStanze.mutate).
 *
 * NESSUNA_MODIFICA: valore che un mutatore puo' restituire per dire
 * "non ho toccato niente, non riscrivere".
 */
const code = new Map();

const conLock = (chiave, azione) => {
    const precedente = code.get(chiave) || Promise.resolve();
    const risultato = precedente.then(azione, azione);
    const coda = risultato.then(() => {}, () => {});
    code.set(chiave, coda);
    coda.then(() => {
        if (code.get(chiave) === coda) code.delete(chiave);
    });
    return risultato;
};

const attendi = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const NESSUNA_MODIFICA = Symbol("nessunaModifica");

module.exports = { conLock, attendi, NESSUNA_MODIFICA };
