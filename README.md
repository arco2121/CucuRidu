# Cucu Ridu

> *Il gioco di carte più trash, irriverente e assolutamente necessario d'Italia.*

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-green.svg)](https://nodejs.org)
[![Socket.IO](https://img.shields.io/badge/socket.io-4.x-black.svg)](https://socket.io)
[![HuggingFace](https://img.shields.io/badge/🤗%20HuggingFace-arco2120%2Fcucuridu-yellow)](https://huggingface.co/spaces/arco2120/cucuridu)

**Cucu Ridu** è un gioco di carte multiplayer in tempo reale ispirato a *Cards Against Humanity*. Un giocatore legge una frase con degli spazi vuoti, gli altri la completano con le carte più assurde che hanno in mano — e chi fa fare la pipì ai pantaloni all'interrogante vince il round.

Semplice. Devastante. Adatto a persone con poco senso del pudore e tanta voglia di ridere.

🔗 **Gioca subito — senza scuse:** [Cucu Ridu](https://cucuridu.web.app)

---

> ⚠️ **Avviso sul contenuto**
>
> Le carte di Cucu Ridu sono volutamente eccessive, irriverenti e spesso politicamente scorrettissime. È umorismo nero e assurdo. Se sei facilmente offendibile, questo gioco probabilmente non fa per te — e probabilmente neanche questa wiki. Sii consapevole, e soprattutto non prenderti sul serio.

---

## ✨ Funzionalità

- 🌐 **Multiplayer in tempo reale** — WebSocket, nessun refresh, nessuna pietà
- 🎨 **Tema grafico randomico** ad ogni partita — 9 palette di colori, mai uguale a prima
- 🎵 **Musica e suoni** — disattivabili per chi non li merita
- 📦 **Espansioni ufficiali** — più mazzi, più danni
- 🃏 **Mazzi personalizzati** — crea le tue carte, condividi i tuoi traumi
- 🔄 **Riconnessione automatica** — perché la connessione cade sempre nel momento peggiore
- 📱 **PWA** — installabile su mobile, così ce l'hai sempre in tasca

---

## 🎮 Come si gioca (versione breve)

1. Qualcuno **crea una stanza** e manda il codice agli amici
2. Gli altri **si uniscono** — servono almeno 3 persone (sì, devi avere amici)
3. L'**interrogante** legge la carta-frase del round
4. Tutti gli altri **completano la frase** con le carte peggiori che hanno in mano
5. L'interrogante **sceglie la risposta più esilarante** — o quella più disturbante, a seconda della serata
6. Chi vince il round diventa il prossimo interrogante
7. Quando finiscono le carte, vince chi ha più punti — e meno dignità

📖 [Regole complete nella Wiki →](https://github.com/arco2121/CucuRidu/wiki/Come-Giocare)

---

## 🃏 Mazzi disponibili

| Mazzo | Descrizione |
|-------|-------------|
| **Standard** | Il mazzo base. Centinaia di carte. Nessun freno |
| **Melanie Martinez** | Per i fan della cantante. Molto di nicchia, molto pesante |
| **Cinesi XXX** | Mini espansione. Piccola ma vivace |

Vuoi creare il tuo mazzo? [Qui c'è la guida →](https://github.com/arco2121/CucuRidu/wiki/Mazzi-Personalizzati)

---

## 🚀 Installazione locale

```bash
git clone https://github.com/arco2121/CucuRidu.git
cd CucuRidu
npm install
node app.js
```

Il server parte su una porta casuale e te la dice in console. Aprila nel browser e il gioco è fatto.

📖 [Guida completa all'installazione →](https://github.com/arco2121/CucuRidu/wiki/Installazione)

---

## 🏗️ Struttura del progetto

```
CucuRidu/
├── app.js                  # Entry point
├── application/
│   ├── single.js           # Setup server Express + Socket.IO
│   └── configurations.js   # Route HTTP e logica Socket.IO
├── include/
│   ├── cards/              # Mazzi in formato JSON
│   ├── names/              # Nomi e aggettivi per username casuali
│   └── script/             # Logica di gioco server-side
│       ├── Stanza.js       # Gestione stanza e stato partita
│       ├── Giocatore.js    # Entità giocatore
│       ├── Mazzo.js        # Gestione mazzi e carte
│       ├── Session.js      # Sessioni (express-session + JWT)
│       └── generazione.js  # Utility: ID, nomi, pfp
├── public/                 # Asset statici, CSS, JS client
├── views/                  # Template EJS
└── ignore/                 # Script di sviluppo e raw data
```

📖 [Documentazione tecnica completa →](https://github.com/arco2121/CucuRidu/wiki/Struttura-Tecnica)

---

## 🛠️ Stack tecnologico

- **Backend:** Node.js, Express 5, Socket.IO 4
- **Template Engine:** EJS
- **Sessioni:** express-session + JWT
- **Frontend:** Vanilla JS, CSS custom, EJS client-side
- **Deploy:** Docker → Render / HuggingFace Spaces

---

## 🤝 Contribuire

Pull request benvenute. Per modifiche grosse, apri prima una issue così ne parliamo da persone civili.

Per aggiungere carte al mazzo standard: [guida contribuire →](https://github.com/arco2121/CucuRidu/wiki/Contribuire-al-Mazzo-Standard)

---

## 👥 Autori

- [**arco2121**](https://github.com/arco2121) 🍂
- [**Abcia2**](https://abcia2.com) ✨

Fatti da loro con amore, caffè e probabilmente troppo tempo libero.

---

## 📄 Licenza

Distribuito sotto licenza [Apache 2.0](LICENSE). Usalo, forkalo, rompilo — ma citaci almeno.


---
title: Cucuridu
emoji: ✨️
colorFrom: yellow
colorTo: green
sdk: docker
app_port: 7860
pinned: true
license: apache-2.0
short_description: Silly card game similar to Coco Rido✨
allow_custom_scripts: true
---