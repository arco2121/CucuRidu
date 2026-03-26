//Works only if using the cluster
const cleanStanzeOnCluster = () => {
    const cleanUpIfOld = async (Stanze, timeout) => {
        try {
           await Stanze.checkOld();
        } catch (err) { console.error(err); } finally {
            setTimeout(cleanUpIfOld, timeout/60);
        }
    };

    cleanUpIfOld();
};

module.exports = cleanStanzeOnCluster;