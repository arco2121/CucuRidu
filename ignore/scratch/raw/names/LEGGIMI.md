# Nomi e aggettivi

I nomi casuali dei giocatori nascono da due CSV in questa cartella. Da questi
si genera `application/include/names/names.json`, che è il file che il gioco
legge davvero.

## I due file

### `nomi.csv`

| colonna | cosa ci va |
| --- | --- |
| `nome` | il nome, così come deve comparire |
| `genere` | `m`, `f`, `n` (neutro) oppure `p` (plurale) |

Nella colonna `genere` puoi anche scrivere per esteso (`maschile`,
`femminile`, `neutro`, `plurale`). Se la lasci vuota vale neutro.

### `aggettivi.csv`

| colonna | cosa ci va |
| --- | --- |
| `neutro` | la forma con l'asterisco, es. `Stronz*` |
| `maschile` | `Stronzo` |
| `femminile` | `Stronza` |
| `plurale` | `Stronzi` |

Per gli aggettivi che non cambiano (`Ebete`, `Termosifone`, `Che salta sui
tetti`) ripeti la stessa parola nelle prime tre colonne e cambia solo il
plurale. Se lasci vuote maschile, femminile o plurale, viene usato il neutro
al loro posto: comodo per buttare dentro un aggettivo al volo e sistemarlo
dopo.

Il gioco sceglie un nome a caso e poi l'aggettivo nella forma che concorda con
il suo genere: **Petunia** (f) + **Stronz\*** diventa *Petunia Stronza*.

## Come si rigenera il JSON

### Da locale

```
node ignore/scratch/generateNames.js
```

Legge i due CSV, toglie i nomi doppi, riempie le forme mancanti e riscrive
`application/include/names/names.json`. In console ti dice quanti nomi ha
trovato per genere, quali doppioni ha tolto e quali aggettivi erano
incompleti.

### Da Google Sheets

1. Crea un foglio con due schede: **Nomi** e **Aggettivi**
2. Importa dentro i due CSV (File > Importa > Sostituisci foglio)
3. Estensioni > Apps Script, incolla tutto `ignore/scratch/AppsScript_names.gs`
4. Salva e ricarica il foglio: compare il menu **Cucu Ridu**

Poi **Cucu Ridu > Genera names.json** apre una finestra con il JSON pronto e
un bottone per copiarlo. **Cucu Ridu > Controlla i dati** fa gli stessi
controlli senza generare niente.

L'ordine delle colonne non conta, vengono cercate per nome, e le colonne in
più (note, appunti) vengono ignorate: puoi aggiungerne quante vuoi.

Le due strade producono esattamente lo stesso file, scegli quella che ti
comoda.

## Nota

I vecchi `names.txt` e `adjectives.txt` non vengono più letti da nessuno: li
hanno sostituiti i CSV. Sono rimasti lì come storico, se non ti servono
buttali.
