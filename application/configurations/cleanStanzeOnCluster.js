//Works only if using the cluster
const cleanStanzeOnCluster = (Stanze, timeout = 3600000) => {
    const cleanUpIfOld = async () => {
        try {
           await Stanze.checkOld();
        } catch (err) { console.error(err); } finally {
            setTimeout(cleanUpIfOld, timeout/60);
        }
    };

    cleanUpIfOld();
};

module.exports = cleanStanzeOnCluster;