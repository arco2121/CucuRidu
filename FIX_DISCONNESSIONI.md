# Fix disconnessioni Cucu Ridu 2.5

## Da fare prima di ripartire

1. **Esegui `application/database/migrazione_disconnessioni.sql` su Supabase**
   (SQL Editor). Non cancella niente, aggiunge la colonna `version` alla tabella
   `stanze` e sostituisce le funzioni `update_stanza` e `set_presenza`.
   Il codice nuovo senza questa migrazione non funziona.
2. **Imposta `JWTKEY` nelle variabili d'ambiente di ogni deploy**, con lo
   **stesso valore** su Render e su Hugging Face. Basta una stringa lunga a caso.
   Senza, ogni istanza e ogni riavvio generano un token diverso e i giocatori
   gia in partita vengono cacciati con "STACCA STACCA".

`application/database/dump.sql` e' aggiornato allo stesso schema, ma cancella le
tabelle: usalo solo su un database nuovo.

---

## Il bug della risposta che spariva

Ogni handler faceva `Stanze.get()` -> modifica in memoria -> `Stanze.set()`.
Con Supabase quel `get` e quel `set` sono due viaggi in rete, e in mezzo ci
stanno comodamente gli invii degli altri giocatori:

```
Bea   get()  -> risposte: {}
Cri   get()  -> risposte: {}          <- legge lo stesso stato vecchio
Bea   set()  -> risposte: {Bea}
Cri   set()  -> risposte: {Cri}       <- la risposta di Bea e' sparita
```

Peggio: la vecchia funzione SQL `update_stanza` faceva un merge JSONB **shallow**
(`stanza || nuovo`), quindi la chiave `round` veniva sostituita in blocco.

Da qui viene esattamente quello che vedevate: uno a caso risulta "non ha ancora
inviato" anche se ha inviato, il contatore non arriva mai al totale e la partita
si pianta. Chi ricaricava, se il server lo ritrovava ancora nella stanza poteva
rifare; se nel frattempo era scattato il timeout di rimozione (3 minuti) veniva
buttato fuori con SESSION_EXPIRED. Ecco perche' "a volte viene cacciata, altre
volte puo' rifare".

**Test riproduttivo:** con la vecchia logica, 3 invii simultanei lasciavano
**1 risposta su 3**. Con la nuova, 3 su 3, sia su una sola istanza sia con tre
istanze diverse sullo stesso database.

### Come e' stato risolto

- Nuova RPC `update_stanza_cas`: la stanza viene scritta solo se nessun altro
  l'ha modificata nel frattempo (compare-and-swap sulla colonna `version`). In
  caso di conflitto ritorna `-1`.
- `ClusterStanze.mutate(id, mutatore)`: legge, applica la modifica, riscrive, e
  se becca un conflitto ripete tutto su uno stato fresco (fino a 8 tentativi con
  backoff). Il mutatore deve essere sincrono, per questo `partecipaStanza` ora
  genera l'id del giocatore prima di entrare nella mutate.
- Lock per stanza dentro il singolo processo (`concorrenza.js`), cosi due
  giocatori sulla stessa istanza non sprecano nemmeno un tentativo.
- `LocalStanze` espone la stessa interfaccia in modalita' single: serverConfig
  non deve piu sapere in quale modalita' gira.
- Tutti gli handler di `serverConfig` sono stati riscritti su `mutate`.

---

## Le disconnessioni "dal nulla"

Erano almeno cinque cause diverse, tutte sistemate.

### 1. Il disconnect di un socket morto cacciava chi era gia rientrato

Quando la linea cade, il server se ne accorge solo dopo `pingInterval +
pingTimeout`. Nel frattempo il client si e' gia riconnesso con un socket nuovo.
Poi arriva il `disconnect` del socket vecchio, che marcava il giocatore offline,
e tre minuti dopo `eliminaGiocatore` lo toglieva dalla stanza **mentre stava
giocando**. La guardia in `set_presenza` era basata su `event_time`, che in
questo scenario non serve a niente: il disconnect tardivo ha sempre il timestamp
piu recente.

Ora l'offline viene applicato solo se:
- il socket che si e' disconnesso e' ancora quello registrato per il giocatore
  (controllo sia in JS sia dentro `set_presenza`), e
- il giocatore non ha nessun altro socket vivo nella stanza (`fetchSockets`,
  che con l'adapter Postgres vede anche le altre istanze).

### 2. Il redirect automatico su un altro host

`midleChecks.js` faceva un ping ogni 20 secondi con timeout di 5, e **al primo
fallimento** faceva `window.location.replace` su un altro deploy. Tab in
background, passaggio wifi/4G, server un po' lento: bastava quello per
teletrasportare il giocatore su un'altra istanza. Dal suo punto di vista era una
disconnessione dal nulla senza aver toccato niente.

Ora il salto avviene solo dopo 3 fallimenti consecutivi, mai con la pagina
nascosta, mai se `navigator.onLine` e' false, e con timeout piu larghi.

### 3. Qualsiasi errore di connessione riportava alla home

In `socketEvents.js` il `default` di `connect_error` faceva
`window.location.replace("/")`. Un `timeout`, un `transport error`, un errore
temporaneo del server: fuori dalla partita. Ora solo `SESSION_EXPIRED` e
`INVALID_KEY` sono definitivi, tutto il resto mostra lo stato "disconnesso" e
lascia riprovare a socket.io.

### 4. Il token che cambiava a ogni riavvio

`TEMPORARY_TOKEN` era generato a caso a ogni avvio del processo. Render free si
riaddormenta di continuo: al riavvio l'handshake di tutti i client in partita
diventava invalido (`INVALID_KEY`) e uscivano tutti insieme. Con piu istanze lo
stesso problema si presentava anche senza riavvii. Ora si usa `JWTKEY` (vedi
sopra) e il server avvisa nei log se non e' impostata.

### 5. Un errore in un handler faceva cadere tutto il server

Diversi handler socket async non avevano `try/catch`: `aggiornaAttesaRisposta`,
`messaggioChat`, `aggiungiMazzo`, `aggiornaChat`. Una `Stanza` nulla bastava a
generare una `unhandledRejection`, che su Node chiude il processo. Risultato:
**tutti** disconnessi insieme e stanze perse. Ora c'e' un wrapper `sicuro()` su
ogni handler, piu le guardie `unhandledRejection` / `uncaughtException` in
`app.js`.

### Altri parametri

- `pingTimeout` da 10s a 30s e `pingInterval` da 15s a 20s: con 10 secondi
  bastava un buco di rete su 4G per far dichiarare morto un client vivissimo.
- `reconnectionDelay` da 50ms a 300ms con backoff fino a 4s e tentativi
  infiniti: prima si martellava il server con decine di tentativi al secondo.
- `reconnect` / `reconnect_attempt` / `reconnect_failed` erano registrati sul
  socket, ma in socket.io v4 stanno sul manager: non si attivavano mai. Ora sono
  su `socket.io`.
- Se e' il server a chiudere il socket, socket.io non riprova da solo: aggiunta
  la riconnessione manuale.
- Il cleanup delle stanze girava ogni **2 secondi** (`timeout/30/60`),
  scansionando tutta la tabella `stanze` da ogni istanza. Ora ogni 2 minuti.

---

## Cose sistemate lungo la strada

- `emitStatoStanza` rimandava al client la copia del giocatore agganciata al
  socket, che in modalita' cluster e' un oggetto staccato e potenzialmente
  vecchio: si poteva vedere la mano sbagliata dopo una riconnessione. Ora il
  giocatore viene sempre riletto dalla stanza corrente.
- `inviaRisposta` e' idempotente: un reinvio dopo una riconnessione non da piu
  "Non puoi rispondere 2 volte", rimanda semplicemente lo stato giusto.
- Il client ora **ripete l'invio** finche' il server non conferma (fino a 5
  volte, ogni 3,5s), col pulsante che mostra "Invio...".
- `aggiungiRisposta` / `eliminaGiocatore` usano `>=` invece di `===` sul
  conteggio, e c'e' `sincronizzaStato()` come rete di sicurezza: una stanza non
  puo' piu restare bloccata con tutti che hanno risposto.
- Fine partita per round esauriti: `iniziaTurno` chiamava `terminaPartita()`
  senza argomenti, quindi tornava sempre `false` e la partita restava appesa.
- `update_item` inseriva nella colonna `id_item`, che non esiste (la colonna e'
  `item_id`): la blacklist delle sessioni non ha mai funzionato in cluster.
- `/doRoomExists` leggeva `.stato` su una Promise: il controllo sullo stato non
  ha mai funzionato.
- `Stanza.fromJSON` poteva ricostruire una chat `undefined` e far esplodere
  `scriviInChat`.

---

## Cosa manca dalla tua lista

Fatto:
- il lettore ora vede quante persone hanno inviato e chi (contatore "Completati:
  X / Y" e lista nella schermata di attesa).

Non toccato in questo giro:
- togliere la chat
- il simbolo per il completamento tutto maiuscolo
- i fix di UI generici
- varianti e tag delle frasi
