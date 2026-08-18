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

module.exports = { cleanUpStanze };
