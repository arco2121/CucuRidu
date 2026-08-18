const path = require('path');
const { conLock, NESSUNA_MODIFICA } = require(path.join(__dirname, 'concorrenza'));

/**
 * Stanze tenute in RAM (modalita' single), con la stessa interfaccia
 * asincrona di ClusterStanze: cosi serverConfig non deve sapere in quale
 * modalita' sta girando il server.
 */
class LocalStanze extends Map {

    async setPresenza(giocatoreId, stanzaId, online, socketId, eventTime, expectedSocketId = null) {
        const stanza = super.get(stanzaId);
        const giocatore = stanza?.trovaGiocatore?.(giocatoreId);
        if (!giocatore) return false;

        // un "offline" vale solo se arriva dal socket ancora registrato
        if (expectedSocketId && giocatore.socketId && giocatore.socketId !== expectedSocketId)
            return false;

        giocatore.online = online;
        giocatore.socketId = socketId || "";
        return true;
    }

    set(key, value) {
        super.set(key, value);
        return value;
    }

    async mutate(key, mutatore) {
        if (!key) return null;
        return conLock("stanza:" + key, async () => {
            const stanza = super.get(key);
            if (!stanza) return null;
            const risultato = mutatore(stanza);
            if (risultato === NESSUNA_MODIFICA)
                return { stanza, risultato: undefined, scritto: false };
            return { stanza, risultato, scritto: true };
        });
    }

    async checkOld() { /* in RAM ci pensa gia cleanUp in serverConfig */ }
}

module.exports = { LocalStanze };
