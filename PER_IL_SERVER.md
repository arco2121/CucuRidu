# Cucu Ridu, cose da fare su Supabase e sui deploy

Ciao, questo file è per te che gestisci il database e i server. Sono state
fatte un po' di modifiche, alcune richiedono che tu faccia qualcosa prima che
il gioco riparta. Ho messo in cima solo quello che devi fare, il perché sta
tutto più sotto.

---

## TL;DR

1. **Non lanciare `dump.sql` sul database vero**, serve solo per creare un
   database da zero. Se l'hai già fatto e ti ha dato l'errore 23503 su
   `presenza`, la migrazione qui sotto lo sistema
2. Esegui due file SQL su Supabase (il primo va rilanciato anche se l'avevi
   già fatto: ci ho aggiunto dei fix)
3. Aggiungi `SEGNALAZIONI_KEY` alle variabili d'ambiente, e controlla che
   `JWTKEY` sia impostata **con lo stesso valore su tutti i deploy**
4. Fai partire il deploy **subito dopo** l'SQL, su tutte le istanze
5. Al primo caricamento fai un ricaricamento forzato (Ctrl+F5)

---

## 0. L'errore che hai visto: `presenza_stanza_id_fkey`

```text
ERROR: 23503: insert or update on table "presenza" violates foreign key
constraint "presenza_stanza_id_fkey"
DETAIL: Key (stanza_id)=(G7PNML) is not present in table "stanze".
```

Colpa mia, era un difetto di `dump.sql`. Quel file ricreava `stanze` da zero
(`DROP TABLE ... CASCADE`) ma su `presenza` faceva solo
`CREATE TABLE IF NOT EXISTS`: la tabella esisteva già, quindi restava lì con
dentro le righe vecchie. A quel punto `ADD CONSTRAINT` provava ad agganciare
la chiave esterna a stanze che non esistevano più e si fermava. Il codice di
`G7PNML` è proprio una riga rimasta orfana in `presenza`, non un problema
della stanza in sé, ed è per questo che il gioco intanto girava lo stesso.

Due cose sono cambiate:

- **`dump.sql`** ora droppa anche `presenza` e ripulisce le righe orfane prima
  di creare il vincolo. Resta comunque un file per **partire da zero**: sul
  database in produzione non serve e cancella le stanze aperte
- **`migrazione_disconnessioni.sql`** ha una sezione nuova che fa la pulizia
  senza distruggere niente: cancella le righe di `presenza` che puntano a
  stanze inesistenti e poi ricrea il vincolo. È quello che devi lanciare tu

Se vuoi vedere quante righe orfane hai prima di lanciarla:

```sql
SELECT count(*) FROM public.presenza p
 WHERE NOT EXISTS (SELECT 1 FROM public.stanze s WHERE s."stanza_Id" = p.stanza_id);
```

In più `set_presenza` ora controlla che la stanza esista prima di scrivere: se
arriva un disconnect in ritardo per una stanza già chiusa non tira su un errore,
cancella la riga di presenza e basta. Prima quello stesso errore 23503 poteva
comparire nei log del server durante le partite normali.

Ho riprodotto l'errore identico al tuo su un Postgres 16 con il file vecchio, e
verificato che con quelli nuovi non succede più, sia su database pulito che su
database con dentro i dati vecchi.

---

## 1. SQL da eseguire su Supabase

**Nell'ordine, e prima del deploy.** Sono tutti e due idempotenti, li puoi
rilanciare senza fare danni. Li ho provati su un Postgres 16 vero, sia su
database pulito che sullo schema vecchio con dentro dei dati.

### `application/database/migrazione_disconnessioni.sql`

**Va eseguito anche se l'avevi già fatto**: ci ho aggiunto in fondo il fix di
`update_item` e la pulizia di `presenza` (vedi sopra). È idempotente,
rilanciarlo non rompe niente.

Cosa fa:

- aggiunge la colonna `version` a `stanze`
- crea la funzione `update_stanza_cas(target_id, new_json, id_of_machine, expected_version)`
- riscrive `update_stanza` perché **sovrascriva** invece di fondere: prima
  faceva un merge JSONB shallow (`stanza || nuovo`) e la chiave `round` veniva
  sostituita in blocco, il che faceva sparire le risposte dei giocatori
- **sostituisce `set_presenza`**: prima aveva 5 parametri, ora ne ha 6
  (l'ultimo è `p_expected_socket_id`). La versione a 5 parametri viene
  droppata
- **corregge `update_item`**: inseriva nella colonna `id_item`, che non esiste
  (quella vera si chiama `item_id`), quindi ogni chiamata falliva. La usa
  `ClusterMap` per la blacklist dei token di sessione, che di conseguenza non
  ha mai funzionato in cluster. Se vuoi vederlo con i tuoi occhi, prima della
  migrazione questa riga dà errore:

  ```sql
  SELECT update_item('prova', '{"a":1}', 'test');
  ```

- **ripulisce `presenza`** dalle righe orfane e ricrea
  `presenza_stanza_id_fkey`, che è l'errore 23503 di cui sopra
- **mette una guardia dentro `set_presenza`**: se la stanza non esiste più la
  funzione ritorna `false` invece di sbattere contro la chiave esterna

Per controllare se la parte vecchia era già stata applicata:

```sql
SELECT column_name FROM information_schema.columns
 WHERE table_name = 'stanze' AND column_name = 'version';
```

### `application/database/migrazione_segnalazioni.sql`

Questo è nuovo. Crea la tabella `segnalazioni`, dove finiscono le frasi e i
completamenti che i giocatori marcano come sbagliati durante la partita.

Verifica:

```sql
SELECT count(*) FROM public.segnalazioni;
```

### Ordine e finestra di disservizio

Serve un minimo di attenzione perché il codice vecchio e quello nuovo parlano
al database in modo diverso:

- il **codice nuovo senza SQL** non funziona: chiama `update_stanza_cas` che
  non esiste, e le partite si piantano
- il **codice vecchio con SQL nuovo** funziona quasi tutto, si rompe solo il
  rilevamento di chi va offline (chiama `set_presenza` con 5 parametri e non
  la trova più)

Quindi: **prima l'SQL, poi il deploy il prima possibile**, e deploya tutte le
istanze insieme. Nel mezzo il gioco resta giocabile, semplicemente non si
accorge di chi si disconnette.

---

## 2. Variabili d'ambiente

Da mettere su **ogni** deploy (Render, Hugging Face, e gli altri).

| Variabile | Stato | A cosa serve |
| --- | --- | --- |
| `JWTKEY` | **obbligatoria**, stesso valore ovunque | Firma le sessioni e il token di handshake dei socket |
| `SEGNALAZIONI_KEY` | nuova | Chiave per aprire la pagina `/segnalazioni` |
| `NOTIFICATION_PUBLIC` | **da togliere** | Le notifiche push non esistono più |
| `NOTIFICATION_PRIVATE` | **da togliere** | Come sopra |

### Su `JWTKEY` insisto

Se non c'è, ogni istanza si genera un token casuale all'avvio. Risultato: al
primo riavvio di Render (che sul piano free si riaddormenta di continuo) tutti
i giocatori in partita si beccano `INVALID_KEY` e vengono buttati fuori. Stessa
cosa se un giocatore viene spostato da un host all'altro. Va bene una stringa
lunga a caso, l'importante è che sia **identica** su tutti i deploy.

All'avvio il server scrive un warning nei log se manca:

```text
ATTENZIONE: JWTKEY non impostata. Con piu istanze o dopo un riavvio i giocatori verranno disconnessi.
```

### Su `SEGNALAZIONI_KEY`

Se non la imposti, la pagina `/segnalazioni` semplicemente non esiste (redirect
a `/error`), così non resta aperta al pubblico per sbaglio. Con la chiave
impostata la apri così:

```text
https://cucuridu.onrender.com/segnalazioni?chiave=QUELLO_CHE_HAI_MESSO
```

È una tabella con data, tipo (frase o completamento), testo, nota e chi l'ha
segnalata. Quando hai sistemato le carte puoi fare pulizia:

```sql
DELETE FROM public.segnalazioni WHERE risolta = true;
```

---

## 3. Deploy

Niente di diverso dal solito, `npm start` fa già tutto. Una cosa da sapere:

`npm start` esegue `generateAll`, che fra le altre cose lancia
`ignore/scratch/generateNames.js`. **Quello script ora legge due CSV** invece
dei vecchi `.txt`:

```text
ignore/scratch/raw/names/nomi.csv        nome,genere
ignore/scratch/raw/names/aggettivi.csv   neutro,maschile,femminile,plurale
```

Sono nel repo (la cartella `ignore/` non è gitignorata), quindi arrivano sul
server da soli. Se un domani sparissero, lo script scrive un errore nei log ma
non blocca l'avvio: il gioco userebbe il `names.json` committato.

I vecchi `names.txt` e `adjectives.txt` non li legge più nessuno, sono rimasti
lì solo come storico.

### Il ricaricamento forzato

Il service worker cachava tutto con una strategia "prima la cache, poi
aggiorno di nascosto". In pratica dopo ogni deploy il primo caricamento serviva
ancora il CSS e il JS vecchi, e la versione nuova compariva solo al
ricaricamento successivo. È il motivo per cui sembrava che i fix grafici non
fossero stati applicati: erano online, ma i browser mostravano la roba vecchia.

Adesso `css`, `js`, `ejs` e `json` vanno di rete e usano la cache solo se sei
offline. Font, immagini e audio restano su cache. Il nome della cache è
versionato in `public/script/config/worker.js`:

```js
const VERSIONE_CACHE = 'v2';
```

**Questa volta serve ancora un Ctrl+F5** perché il service worker vecchio è
ancora installato nei browser. Dalla prossima in poi non servirà più. Se in
futuro cambi qualcosa di grosso negli asset e vuoi essere sicuro, alza quel
numero e le vecchie cache vengono cancellate all'attivazione.

---

## 4. Pulizia facoltativa

Roba che non serve più ma che non fa danni se la lasci:

```sql
-- le notifiche push sono state rimosse del tutto dal codice
DROP TABLE IF EXISTS public.push_subscriptions;
```

Nel repo c'è anche una cartella `CucuRidu/_to_delete/` con i file rimossi
(`translationConfig.js`, `notificationsManager.js` e una copia di backup del
CSS). Buttala pure.

---

## Cosa è cambiato lato server, in breve

### Il bug delle risposte che sparivano

Ogni handler faceva `Stanze.get()` → modifica → `Stanze.set()`, che con
Supabase sono due viaggi in rete. Se due giocatori confermavano nello stesso
momento leggevano entrambi lo stato vecchio e la seconda scrittura cancellava
la prima. Da qui il classico "manca una persona sola" con la partita piantata.

Adesso c'è un compare-and-swap sulla colonna `version`: la scrittura passa solo
se nessun altro ha toccato la stanza nel frattempo, altrimenti si rilegge e si
riprova (fino a 8 tentativi con backoff). In più c'è un lock per stanza dentro
il singolo processo, così due giocatori sulla stessa istanza non sprecano
nemmeno un tentativo.

Con un test che simula tre invii simultanei con latenza di rete: prima
sopravviveva **1 risposta su 3**, adesso 3 su 3, sia su una sola istanza sia
con tre istanze diverse sullo stesso database.

### Carico su Supabase

Il cleanup delle stanze girava ogni **2 secondi** (`timeout/30/60`, quasi
sicuramente un errore di calcolo), e a ogni giro scansionava tutta la tabella
`stanze` e faceva un `get` per stanza, **da ogni istanza**. Ora gira ogni 2
minuti. Se hai visto query lente o rate limit su Supabase, probabilmente era
quello.

### Presenza legata al socket

`set_presenza` ora accetta un `p_expected_socket_id`: un "offline" viene
applicato solo se il socket che si è disconnesso è ancora quello registrato per
quel giocatore. Prima la guardia era solo su `event_time`, che in questo
scenario non serve a niente, perché il disconnect di un socket morto arriva
sempre *dopo* la riconnessione (il server se ne accorge solo dopo
`pingInterval + pingTimeout`). Il risultato era che gente che stava giocando
tranquillamente veniva marcata offline e, tre minuti dopo, buttata fuori dalla
stanza.

### Le carte che si fondevano con la virgola

Capitava di vedere in partita un completamento tipo `Gerry Scotti,Il Gabibbo`,
cioè due carte attaccate da una virgola. Non era il gioco che le fondeva: era
lo script che genera i mazzi.

Le carte hanno due forme diverse. I **completamenti** sono stringhe, le
**frasi** sono coppie `[testo, numeroDiSpaziVuoti]`. I generatori
(`ignore/scratch/generateAllCards.js`, che gira a ogni `npm start`) applicavano
la regola degli spazi vuoti a **tutti** i file, quindi un completamento che
conteneva un `_` diventava una coppia, e quando la pagina la stampava usciva
`testo,1`, perché in JavaScript un array messo in una stringa si unisce con le
virgole. Stessa cosa in `translateToPack`, il pezzo che gestisce i mazzi
personalizzati creati dagli utenti.

Adesso la regola vale solo per i file di frasi, e in più:

- ogni carta viene normalizzata quando entra nel mazzo, quindi una coppia
  finita per sbaglio fra i completamenti viene raddrizzata invece di arrivare
  ai giocatori, con un warning nei log (`[Mazzo] completamento non testuale`)
- i mazzi degli scarti sono tipizzati: prima uno scarto senza tipo poteva
  appiattire una frase e mandare in pezzi il round
- gli indici delle carte che arrivano dal client vengono validati (interi,
  distinti, dentro la mano, nel numero giusto per gli spazi della frase): prima
  un indice sballato poteva far sparire carte o lasciarne di vuote in mano

I `.json` dei mazzi nel repo sono stati rigenerati e controllati: 987
completamenti nel pack standard, 474 nel safe, tutti stringhe, tutte le frasi
in forma corretta. Se avevi copiato i `.json` a mano da qualche parte,
riprendili dal repo.

Test: 340 round simulati in sei configurazioni diverse (fino a 8 giocatori,
in cluster con serializzazione JSON a ogni operazione, e con un client che
manda indici a caso), controllando dopo ogni singola mossa che ogni carta sia
una stringa nota e che il totale non cambi mai. Zero corruzioni.

### Altre cose sul server

- `pingInterval` da 15s a 20s e `pingTimeout` da 10s a 30s: con 10 secondi
  bastava un buco di rete su 4G per far dichiarare morto un client vivo
- tutti gli handler socket sono avvolti in un try/catch. Prima quattro di loro
  non ce l'avevano e una `Stanza` nulla bastava a generare una
  `unhandledRejection`, che su Node chiude il processo: cadevano **tutti**
  insieme. Ci sono anche le guardie `unhandledRejection` e `uncaughtException`
  in `app.js`
- il timeout di grazia prima di togliere davvero un giocatore disconnesso resta
  3 minuti

### Endpoint

Rimossi (erano tutti per le notifiche push):

```text
POST /registraNotifica
POST /eliminaNotifica
POST /inviaBroadcast
POST /ottieniClientId
POST /inviaSingola
```

Aggiunto:

```text
GET  /segnalazioni?chiave=...
```

### Eventi socket

Nuovi: `segnala` (client → server) e `segnalazioneEsito` (server → client).
Rimosso niente. `aggiornamentoAttesaRisposta` ora porta anche `totaleAttesi`.

### Dipendenze

Tolta `web-push` da `package.json`. Al prossimo `npm install` sparisce.

---

## Come verificare che sia andato tutto bene

Dopo il deploy, nei log dell'istanza:

- **non** deve comparire `ATTENZIONE: JWTKEY non impostata`
- **non** devono comparire righe `Troppi conflitti in scrittura sulla stanza`
  (se ne vedi tante, il database sta rispondendo lentissimo e vale la pena
  guardare i grafici di Supabase)
- `[socket:qualcosa]` seguito da un messaggio d'errore è un handler che ha
  fallito: non è fatale, ma se si ripete vale la pena segnalarlo
- `[Mazzo] carta scartata` o `[Mazzo] completamento non testuale` vuol dire che
  in qualche `.json` di carte è rimasta una riga nella forma sbagliata. Il
  gioco la raddrizza da solo, ma il log ti dice esattamente quale sistemare

Sul database, dopo aver lanciato la migrazione, questa deve dare `0`:

```sql
SELECT count(*) FROM public.presenza p
 WHERE NOT EXISTS (SELECT 1 FROM public.stanze s WHERE s."stanza_Id" = p.stanza_id);
```

Poi una partita di prova in tre, con qualcuno che mette il telefono in
aereo per venti secondi e torna: deve rientrare nella stanza senza essere
buttato fuori.

Se hai dubbi o qualcosa non torna, chiedi pure.
