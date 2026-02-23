class GiocatoreInterface {

    constructor(dataFromServer) {
        this.id = dataFromServer["id"];
        this.username = dataFromServer["username"];
        this.mazzo = dataFromServer["mazzo"].flat();
        this.masterRole = dataFromServer["masterRole"];
        dataFromServer = null;
    }
}