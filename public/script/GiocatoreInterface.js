class GiocatoreInterface {

    constructor(dataFromServer) {
        this.id = dataFromServer["id"];
        this.username = dataFromServer["username"];
        this.mazzo = dataFromServer["mazzo"]["carte"];
        this.masterRole = dataFromServer["masterRole"];
        this.interrogationRole = dataFromServer["interrogationRole"];
        dataFromServer = null;
    }
}