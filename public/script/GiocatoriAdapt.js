class GiocatoriAdapt {

    constructor(dataFromServer) {
        this.id = dataFromServer["id"];
        this.username = dataFromServer["username"];
        this.mazzo = dataFromServer["mazzo"];
        dataFromServer = null;
    }
}