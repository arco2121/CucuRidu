class GiocatoriAdapt {

    constructor(dataFromServer) {
        this.id = dataFromServer["identificativo"];
        this.username = dataFromServer["username"];
        this.mazzo = dataFromServer["mazzo"].flat();
        dataFromServer = null;
    }
}