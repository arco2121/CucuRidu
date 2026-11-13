const path = require('path');

const cleanUpStanze = (Stanze, timeout = 3600000) => {
    const cleanUpIfOld = async () => {
        try {
           await Stanze.checkOld();
        } catch (err) { console.error(err?.message || err); } finally {
            const t = setTimeout(cleanUpIfOld, timeout/60);
            if (t.unref) t.unref();
        }
    };

    cleanUpIfOld();
};

// Gli ID generati che non appartengono piu' a una stanza attiva non servono
// per controllare collisioni: li rimuoviamo periodicamente, lasciando intatti
// gli ID ancora referenziati dalle stanze nel database.
const cleanUpMemory = (memory, interval = 3600000) => {
    const cleanUpOldMemory = async () => {
        try {
            await memory.cleanOld();
        } catch (err) {
            console.error('[memory:cleanup]', err?.message || err);
        } finally {
            const timer = setTimeout(cleanUpOldMemory, interval);
            if (timer.unref) timer.unref();
        }
    };

    cleanUpOldMemory();
};

module.exports = { cleanUpStanze, cleanUpMemory };
