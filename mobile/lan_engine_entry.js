const appConfig = require("../application/configurations/appConfig");
const serverConfig = require("../application/configurations/serverConfig");
const { SingleStanze } = require("../application/include/script/SingleStanze");
const { SegnalazioniLocali } = require("../application/include/script/Segnalazioni");
const { Stanza, StatoStanza } = require("../application/include/script/Stanza");
const { Giocatore } = require("../application/include/script/Giocatore");
const { Mazzo, TipoMazzo } = require("../application/include/script/Mazzo");
const generazione = require("../application/include/script/generazione");
const QRCode = require("qrcode-svg");

window.CucuRiduEngine = {
    appConfig,
    serverConfig,
    SingleStanze,
    SegnalazioniLocali,
    Stanza,
    StatoStanza,
    Giocatore,
    Mazzo,
    TipoMazzo,
    generazione,
    QRCode
};