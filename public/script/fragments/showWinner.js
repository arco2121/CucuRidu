const domandaAttuale = document.querySelector(".domanda");
const vaiAvanti = document.getElementById("vaiAvanti");
const risposte = fromFragments["risposte"];
const vincitore = fromFragments["vincitore"];

const displayPfp = document.getElementById("displayPfp");
const winnerText = document.getElementById("winnerText");

displayPfp.src = vincitore.pfp;
winnerText.textContent = `✦ ${vincitore.username} ha vinto il round ✦`;

domandaAttuale.textContent = fillBlanks(domandaAttuale.textContent, risposte);

vaiAvanti.addEventListener("click", () => renderFragment(base, "wait", {
    stanzaId: referenceStanza,
    interroghi: fromFragments["interroghi"],
    primoRound: false,
    seiMaster: referenceGiocatore.masterRole,
}));

/*
 * Immagine riepilogativa del round: tutte le frasi complete, vincitore in
 * cima, con nome e foto profilo di ognuno, in stile col sito (colori presi
 * dalle variabili CSS del momento, che cambiano ad ogni partita).
 */
const scaricaFrasiBtn = document.getElementById("scaricaFrasiBtn");

const templateGrezzo = fromFragments["domanda"][0];
// il testo pulito serve SOLO dove la frase si mostra ancora coi buchi, cioe'
// il titolo dell'immagine: li' i marcatori § non devono vedersi
const templatePulito = pulisciFrase(templateGrezzo);

/*
 * Qui invece si riempie, e a riempire deve essere sempre il testo GREZZO:
 * e' fillBlanks che legge il § davanti allo spazio vuoto per mettere in
 * maiuscolo il completamento, e poi si mangia il marcatore da solo.
 * Passandogli il testo gia' pulito i marcatori erano gia' spariti e la
 * formattazione non veniva applicata: sullo schermo funzionava (li' si parte
 * dal testo grezzo), nell'immagine scaricata no.
 */
const testoDiRisposta = (carte) => {
    const parole = [].concat(carte).map(c => Array.isArray(c) ? c[0] : String(c));
    return fillBlanks(templateGrezzo, parole);
};

const rosterMap = new Map((fromFragments["giocatori"] || []).map(g => [g.id, g]));
const righeImmagine = (fromFragments["tutteLeRisposte"] || [])
    .map(([giocatoreId, carte]) => {
        const info = rosterMap.get(giocatoreId) || (giocatoreId === vincitore.id ? vincitore : null);
        if (!info) return null;
        return {
            username: info.username,
            pfp: info.pfp,
            testo: testoDiRisposta(carte),
            vincitore: giocatoreId === vincitore.id
        };
    })
    .filter(Boolean)
    // il vincitore va in cima, per il resto l'ordine non conta
    .sort((a, b) => (b.vincitore ? 1 : 0) - (a.vincitore ? 1 : 0));

const caricaImmagine = (src) => new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
});

const disegnaRoundRect = (ctx, x, y, w, h, r) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
};

const avvolgiTesto = (ctx, testo, maxWidth) => {
    const parole = String(testo).split(/\s+/).filter(Boolean);
    const linee = [];
    let corrente = "";
    parole.forEach(parola => {
        const prova = corrente ? corrente + " " + parola : parola;
        if (ctx.measureText(prova).width > maxWidth && corrente) {
            linee.push(corrente);
            corrente = parola;
        } else corrente = prova;
    });
    if (corrente) linee.push(corrente);
    return linee;
};

const generaEScaricaImmagine = async () => {
    if (!righeImmagine.length) {
        alert("Non ho abbastanza dati per fare l'immagine di questo round, sorry");
        return;
    }

    const testoOriginale = scaricaFrasiBtn.textContent;
    scaricaFrasiBtn.disabled = true;
    scaricaFrasiBtn.textContent = "Genero...";

    try {
        const stile = getComputedStyle(document.documentElement);
        const colore = (nome, fallback) => stile.getPropertyValue(nome).trim() || fallback;
        const fontFamily = "'Sour Gummy', 'Nunito', sans-serif";

        const larghezza = 900;
        const padding = 40;
        const larghezzaContenuto = larghezza - padding * 2;
        const testoX_offset = 24 + 60 + 18; // margine + diametro pfp + respiro

        const misura = document.createElement("canvas").getContext("2d");
        misura.font = `600 18px ${fontFamily}`;
        const righeConTesto = righeImmagine.map(r => ({
            ...r,
            linee: avvolgiTesto(misura, r.testo, larghezzaContenuto - testoX_offset - 20)
        }));
        const altezzeRighe = righeConTesto.map(r => Math.max(96, 44 + r.linee.length * 24));

        misura.font = `800 30px ${fontFamily}`;
        const titoloLinee = avvolgiTesto(misura, templatePulito, larghezzaContenuto).slice(0, 3);

        const altezzaTitolo = padding + 40 + titoloLinee.length * 36 + 20;
        const altezzaRighe = altezzeRighe.reduce((tot, h) => tot + h + 14, 0);
        const altezzaFooter = 90;
        const altezza = Math.round(altezzaTitolo + altezzaRighe + altezzaFooter);

        const canvas = document.createElement("canvas");
        canvas.width = larghezza;
        canvas.height = altezza;
        const ctx = canvas.getContext("2d");

        const sfondo = ctx.createLinearGradient(0, 0, 0, altezza);
        sfondo.addColorStop(0, colore("--background", "#FFEA8F"));
        sfondo.addColorStop(1, colore("--background-dark", "#FFDB57"));
        ctx.fillStyle = sfondo;
        ctx.fillRect(0, 0, larghezza, altezza);

        ctx.textAlign = "center";
        ctx.textBaseline = "alphabetic";
        ctx.fillStyle = colore("--text-color-dark", "#080808");
        ctx.font = `800 30px ${fontFamily}`;
        let y = padding + 40;
        titoloLinee.forEach(linea => {
            ctx.fillText(linea, larghezza / 2, y);
            y += 36;
        });
        y += 20;

        for (const riga of righeConTesto) {
            const h = Math.max(96, 44 + riga.linee.length * 24);
            const x = padding;
            const w = larghezzaContenuto;

            ctx.fillStyle = riga.vincitore ? colore("--accent-color-1", "#ADFF7D") : colore("--background-variant", "#A0FFA9");
            disegnaRoundRect(ctx, x, y, w, h, 18);
            ctx.fill();
            ctx.lineWidth = 4;
            ctx.strokeStyle = riga.vincitore ? colore("--accent-color-1-outline", "#438E30") : colore("--background-variant-outline", "#7ED286");
            disegnaRoundRect(ctx, x, y, w, h, 18);
            ctx.stroke();

            const raggio = 30;
            const cx = x + 24 + raggio;
            const cy = y + h / 2;
            const img = await caricaImmagine(riga.pfp);
            ctx.save();
            ctx.beginPath();
            ctx.arc(cx, cy, raggio, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            if (img) ctx.drawImage(img, cx - raggio, cy - raggio, raggio * 2, raggio * 2);
            else {
                ctx.fillStyle = "#cccccc";
                ctx.fillRect(cx - raggio, cy - raggio, raggio * 2, raggio * 2);
            }
            ctx.restore();
            ctx.lineWidth = 3;
            ctx.strokeStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(cx, cy, raggio, 0, Math.PI * 2);
            ctx.stroke();

            const testoX = x + testoX_offset;
            ctx.textAlign = "left";
            ctx.fillStyle = riga.vincitore ? colore("--accent-color-1-outline", "#438E30") : colore("--background-variant-outline", "#7ED286");
            ctx.font = `800 17px ${fontFamily}`;
            ctx.fillText((riga.vincitore ? "★ " : "") + riga.username, testoX, y + 30);

            ctx.fillStyle = colore("--text-color-dark", "#080808");
            ctx.font = `600 18px ${fontFamily}`;
            riga.linee.forEach((linea, idx) => ctx.fillText(linea, testoX, y + 58 + idx * 24));

            y += h + 14;
        }

        y += 16;
        const logo = await caricaImmagine("/assets/icon.png");
        const logoSize = 46;
        const centroX = larghezza / 2;
        if (logo) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(centroX - 70, y + logoSize / 2, logoSize / 2, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(logo, centroX - 70 - logoSize / 2, y, logoSize, logoSize);
            ctx.restore();
        }
        ctx.textAlign = "left";
        ctx.fillStyle = colore("--text-color-dark", "#080808");
        ctx.font = `800 26px ${fontFamily}`;
        ctx.fillText("Cucù Ridù", centroX - 40, y + 32);

        const dataUrl = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = `cucu-ridu-round-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
    } catch (e) {
        console.error(e);
        alert("Non sono riuscito a generare l'immagine, riprova");
    } finally {
        scaricaFrasiBtn.disabled = false;
        scaricaFrasiBtn.textContent = testoOriginale;
    }
};

scaricaFrasiBtn?.addEventListener("click", generaEScaricaImmagine);
