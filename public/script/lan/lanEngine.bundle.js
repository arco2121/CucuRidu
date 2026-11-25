(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };

  // lan-shim:path
  var require_path = __commonJS({
    "lan-shim:path"(exports, module) {
      var norm = (p) => {
        const parts = String(p || "").replace(/\\/g, "/").split("/");
        const stack = [];
        for (const part of parts) {
          if (!part || part === ".") continue;
          if (part === "..") {
            if (stack.length) stack.pop();
          } else stack.push(part);
        }
        return (String(p || "").startsWith("/") ? "/" : "") + stack.join("/");
      };
      module.exports = {
        join: (...args) => norm(args.filter(Boolean).join("/")),
        resolve: (...args) => norm("/" + args.filter(Boolean).join("/")),
        basename: (p) => String(p || "").split(/[\\/]/).pop() || "",
        dirname: (p) => {
          const s = String(p || "").replace(/\\/g, "/");
          const i = s.lastIndexOf("/");
          return i <= 0 ? "/" : s.slice(0, i);
        },
        extname: (p) => {
          const base = String(p || "").split(/[\\/]/).pop() || "";
          const dot = base.lastIndexOf(".");
          return dot > 0 ? base.slice(dot) : "";
        }
      };
    }
  });

  // lan-shim:fs
  var require_fs = __commonJS({
    "lan-shim:fs"(exports, module) {
      var VFS = { "files": { "/application/include/names/names.json": `{
  "version": 3,
  "names": [
    {
      "nome": "Gianfranco",
      "genere": "m"
    },
    {
      "nome": "Petunia",
      "genere": "f"
    },
    {
      "nome": "Matilda",
      "genere": "f"
    },
    {
      "nome": "Ges\xF9",
      "genere": "m"
    },
    {
      "nome": "Patrizia",
      "genere": "f"
    },
    {
      "nome": "Anastasia",
      "genere": "f"
    },
    {
      "nome": "Tancredi",
      "genere": "m"
    },
    {
      "nome": "Geltrude",
      "genere": "f"
    },
    {
      "nome": "San bartolomeo",
      "genere": "m"
    },
    {
      "nome": "Stefania",
      "genere": "f"
    },
    {
      "nome": "Sandrina",
      "genere": "f"
    },
    {
      "nome": "Gervasio",
      "genere": "m"
    },
    {
      "nome": "Tibetino",
      "genere": "m"
    },
    {
      "nome": "Filiberto",
      "genere": "m"
    },
    {
      "nome": "Demetra",
      "genere": "f"
    },
    {
      "nome": "Carlina",
      "genere": "f"
    },
    {
      "nome": "Peppone",
      "genere": "m"
    },
    {
      "nome": "Brumilda",
      "genere": "f"
    },
    {
      "nome": "Ermenegilda",
      "genere": "f"
    },
    {
      "nome": "Loretta",
      "genere": "f"
    },
    {
      "nome": "Juan",
      "genere": "m"
    },
    {
      "nome": "Gonzago",
      "genere": "m"
    },
    {
      "nome": "Carmeletto",
      "genere": "m"
    },
    {
      "nome": "Clarissa",
      "genere": "f"
    },
    {
      "nome": "Asdrubale",
      "genere": "m"
    },
    {
      "nome": "Osvaldo",
      "genere": "m"
    },
    {
      "nome": "Moreno",
      "genere": "m"
    },
    {
      "nome": "Gilberto",
      "genere": "m"
    },
    {
      "nome": "Lucresia",
      "genere": "f"
    },
    {
      "nome": "Esposito",
      "genere": "m"
    },
    {
      "nome": "Proserpina",
      "genere": "f"
    },
    {
      "nome": "Annunziata",
      "genere": "f"
    },
    {
      "nome": "Pasqualino",
      "genere": "m"
    },
    {
      "nome": "Simonetta",
      "genere": "f"
    },
    {
      "nome": "Giovanni",
      "genere": "m"
    },
    {
      "nome": "Natalia",
      "genere": "f"
    },
    {
      "nome": "Girolamo",
      "genere": "m"
    },
    {
      "nome": "Ernesto",
      "genere": "m"
    },
    {
      "nome": "Ambrogio",
      "genere": "m"
    },
    {
      "nome": "Ettorina",
      "genere": "f"
    },
    {
      "nome": "Onorino",
      "genere": "m"
    },
    {
      "nome": "Giandomenica",
      "genere": "f"
    },
    {
      "nome": "Natalino",
      "genere": "m"
    },
    {
      "nome": "Romualda",
      "genere": "f"
    },
    {
      "nome": "Melania",
      "genere": "f"
    },
    {
      "nome": "Reginaldo",
      "genere": "m"
    },
    {
      "nome": "Percivaldo",
      "genere": "m"
    },
    {
      "nome": "Flaviana",
      "genere": "f"
    },
    {
      "nome": "Manuela",
      "genere": "f"
    },
    {
      "nome": "Madonna",
      "genere": "f"
    },
    {
      "nome": "Adolf Hitler",
      "genere": "m"
    },
    {
      "nome": "Calimero",
      "genere": "m"
    },
    {
      "nome": "Mussolini",
      "genere": "m"
    },
    {
      "nome": "Marilina",
      "genere": "f"
    },
    {
      "nome": "Michael Jackson",
      "genere": "m"
    },
    {
      "nome": "Orietta Berti",
      "genere": "f"
    },
    {
      "nome": "Gerry Scotti",
      "genere": "m"
    },
    {
      "nome": "Maria de Filippi",
      "genere": "f"
    },
    {
      "nome": "Ormina",
      "genere": "f"
    },
    {
      "nome": "Rosita",
      "genere": "f"
    },
    {
      "nome": "Hello Kitty",
      "genere": "f"
    },
    {
      "nome": "Cesare",
      "genere": "m"
    },
    {
      "nome": "Chiara Facchetti",
      "genere": "f"
    },
    {
      "nome": "Onorio",
      "genere": "m"
    },
    {
      "nome": "Adolfo",
      "genere": "m"
    },
    {
      "nome": "Teodolinda",
      "genere": "f"
    },
    {
      "nome": "Iolanda",
      "genere": "f"
    },
    {
      "nome": "Domiziano",
      "genere": "m"
    },
    {
      "nome": "Diocleziano",
      "genere": "m"
    },
    {
      "nome": "Mafalda",
      "genere": "f"
    },
    {
      "nome": "Apollonia",
      "genere": "f"
    },
    {
      "nome": "Eufrasio",
      "genere": "m"
    },
    {
      "nome": "Mirandolina",
      "genere": "f"
    },
    {
      "nome": "Torquato",
      "genere": "m"
    },
    {
      "nome": "Beppe",
      "genere": "m"
    },
    {
      "nome": "Giampiertolda",
      "genere": "f"
    },
    {
      "nome": "Mariano",
      "genere": "m"
    },
    {
      "nome": "Lancillotto",
      "genere": "m"
    },
    {
      "nome": "Vernelia",
      "genere": "f"
    },
    {
      "nome": "Marcantonio",
      "genere": "m"
    },
    {
      "nome": "Perpetua",
      "genere": "f"
    },
    {
      "nome": "Cassiopea",
      "genere": "f"
    },
    {
      "nome": "Papa Francesco",
      "genere": "m"
    },
    {
      "nome": "Ampelietto",
      "genere": "m"
    },
    {
      "nome": "Don Abbondio",
      "genere": "m"
    },
    {
      "nome": "Maria Luisa Pia",
      "genere": "f"
    },
    {
      "nome": "Ludmilla",
      "genere": "f"
    },
    {
      "nome": "Cristo",
      "genere": "m"
    },
    {
      "nome": "Dio",
      "genere": "m"
    },
    {
      "nome": "Signore",
      "genere": "m"
    },
    {
      "nome": "San Giovanni",
      "genere": "m"
    },
    {
      "nome": "Madre Teresa",
      "genere": "f"
    },
    {
      "nome": "San Sebastiano",
      "genere": "m"
    },
    {
      "nome": "Arcangelo Gabriele",
      "genere": "m"
    },
    {
      "nome": "Maria",
      "genere": "f"
    },
    {
      "nome": "Sant'Anna",
      "genere": "f"
    },
    {
      "nome": "Sant'Antonio",
      "genere": "m"
    },
    {
      "nome": "Santa Chiara Da Copenaghen",
      "genere": "f"
    },
    {
      "nome": "Beata Crocifissa Ostrogota",
      "genere": "f"
    },
    {
      "nome": "San Eristefale",
      "genere": "m"
    },
    {
      "nome": "Santa Emerenziana",
      "genere": "f"
    },
    {
      "nome": "Eustachio",
      "genere": "m"
    },
    {
      "nome": "Cunegonda",
      "genere": "f"
    },
    {
      "nome": "Pancrazio",
      "genere": "m"
    },
    {
      "nome": "Genoveffa",
      "genere": "f"
    },
    {
      "nome": "Addolorata",
      "genere": "f"
    },
    {
      "nome": "Teopompo",
      "genere": "m"
    },
    {
      "nome": "Clodoveo",
      "genere": "m"
    },
    {
      "nome": "Ermenegildo",
      "genere": "m"
    },
    {
      "nome": "Bixio",
      "genere": "m"
    },
    {
      "nome": "Gelsomina",
      "genere": "f"
    },
    {
      "nome": "Trifone",
      "genere": "m"
    },
    {
      "nome": "Annibale",
      "genere": "m"
    },
    {
      "nome": "Barbara D'Urso",
      "genere": "f"
    },
    {
      "nome": "Malgioglio",
      "genere": "m"
    },
    {
      "nome": "Il Divino Otelma",
      "genere": "m"
    },
    {
      "nome": "Pingu",
      "genere": "m"
    },
    {
      "nome": "Peppa Pig",
      "genere": "f"
    },
    {
      "nome": "Magalli",
      "genere": "m"
    },
    {
      "nome": "Amadeus",
      "genere": "m"
    },
    {
      "nome": "Lady Gaga",
      "genere": "f"
    },
    {
      "nome": "Shrek",
      "genere": "m"
    },
    {
      "nome": "Spongebob",
      "genere": "m"
    },
    {
      "nome": "Mocio Vileda",
      "genere": "m"
    },
    {
      "nome": "Telecomanda",
      "genere": "f"
    },
    {
      "nome": "Tiramis\xF9",
      "genere": "m"
    },
    {
      "nome": "Varechina",
      "genere": "f"
    },
    {
      "nome": "San Bitter",
      "genere": "m"
    },
    {
      "nome": "Santa Pazienza",
      "genere": "f"
    },
    {
      "nome": "Beata Solitudine",
      "genere": "f"
    },
    {
      "nome": "Arcangelo Smirneo",
      "genere": "m"
    },
    {
      "nome": "Tutankhamon",
      "genere": "m"
    },
    {
      "nome": "Vercingetorige",
      "genere": "m"
    },
    {
      "nome": "Napoleone",
      "genere": "m"
    },
    {
      "nome": "Giulio Cesare",
      "genere": "m"
    },
    {
      "nome": "Beata Ignoranza",
      "genere": "f"
    },
    {
      "nome": "Sant'Iddio",
      "genere": "m"
    },
    {
      "nome": "San Giovanni Decapitato",
      "genere": "m"
    },
    {
      "nome": "Pierpiero",
      "genere": "m"
    },
    {
      "nome": "Gianmariafilippo",
      "genere": "m"
    },
    {
      "nome": "Maria Antonietta",
      "genere": "f"
    },
    {
      "nome": "Loredano",
      "genere": "m"
    },
    {
      "nome": "Giuseppina Bonaparte",
      "genere": "f"
    },
    {
      "nome": "Massimilianotello",
      "genere": "m"
    },
    {
      "nome": "Mariottide",
      "genere": "f"
    },
    {
      "nome": "Orazio",
      "genere": "m"
    },
    {
      "nome": "Santa Maria Senza Peccato Concepta",
      "genere": "f"
    },
    {
      "nome": "Galeazzo",
      "genere": "m"
    },
    {
      "nome": "Rossana",
      "genere": "f"
    },
    {
      "nome": "Gianantonio",
      "genere": "m"
    },
    {
      "nome": "Broccolo",
      "genere": "m"
    },
    {
      "nome": "Crostatina",
      "genere": "f"
    },
    {
      "nome": "Teresa Fidalgo",
      "genere": "f"
    },
    {
      "nome": "Fiorella",
      "genere": "f"
    },
    {
      "nome": "Ninetta",
      "genere": "f"
    },
    {
      "nome": "Armenegilda",
      "genere": "f"
    },
    {
      "nome": "Lancillotta",
      "genere": "f"
    },
    {
      "nome": "Enza",
      "genere": "f"
    },
    {
      "nome": "Viterbo",
      "genere": "m"
    },
    {
      "nome": "Jessika La Troia",
      "genere": "f"
    },
    {
      "nome": "Romina",
      "genere": "f"
    },
    {
      "nome": "Concetta",
      "genere": "f"
    },
    {
      "nome": "Reginella",
      "genere": "f"
    },
    {
      "nome": "Umberto",
      "genere": "m"
    },
    {
      "nome": "Lyon WGF",
      "genere": "m"
    },
    {
      "nome": "Il Gabibbo",
      "genere": "m"
    },
    {
      "nome": "Un Pompiere",
      "genere": "m"
    },
    {
      "nome": "Ventilatroie",
      "genere": "m"
    },
    {
      "nome": "Nonnina",
      "genere": "f"
    },
    {
      "nome": "Bruschetta",
      "genere": "f"
    },
    {
      "nome": "Beba",
      "genere": "f"
    },
    {
      "nome": "Berna",
      "genere": "f"
    },
    {
      "nome": "Chiquita",
      "genere": "f"
    },
    {
      "nome": "Cristinella",
      "genere": "f"
    },
    {
      "nome": "Marmotta",
      "genere": "f"
    },
    {
      "nome": "Nerina",
      "genere": "f"
    },
    {
      "nome": "Pippa",
      "genere": "f"
    },
    {
      "nome": "Tequila",
      "genere": "f"
    },
    {
      "nome": "Zingara",
      "genere": "f"
    },
    {
      "nome": "Fiona",
      "genere": "f"
    },
    {
      "nome": "Ornella",
      "genere": "f"
    },
    {
      "nome": "Banana",
      "genere": "f"
    },
    {
      "nome": "I Fantastici 104",
      "genere": "p"
    },
    {
      "nome": "Il Masseo",
      "genere": "m"
    },
    {
      "nome": "Babbo Natale",
      "genere": "m"
    },
    {
      "nome": "Befana",
      "genere": "f"
    },
    {
      "nome": "Aldo, Giovanni e Giacomo",
      "genere": "p"
    },
    {
      "nome": "Una troia bastarda",
      "genere": "f"
    },
    {
      "nome": "Andrea",
      "genere": "m"
    },
    {
      "nome": "Raul",
      "genere": "m"
    },
    {
      "nome": "Alice",
      "genere": "f"
    },
    {
      "nome": "Gianluca",
      "genere": "m"
    },
    {
      "nome": "Marco",
      "genere": "m"
    },
    {
      "nome": "Irene",
      "genere": "f"
    },
    {
      "nome": "Lorenzo",
      "genere": "m"
    },
    {
      "nome": "Chiara",
      "genere": "f"
    },
    {
      "nome": "Camilla",
      "genere": "f"
    },
    {
      "nome": "Alessandro",
      "genere": "m"
    },
    {
      "nome": "Alessia",
      "genere": "f"
    },
    {
      "nome": "Noemi",
      "genere": "f"
    },
    {
      "nome": "Daria",
      "genere": "f"
    },
    {
      "nome": "Mathia",
      "genere": "m"
    },
    {
      "nome": "Maja",
      "genere": "f"
    },
    {
      "nome": "Anja",
      "genere": "f"
    },
    {
      "nome": "Pietro",
      "genere": "m"
    },
    {
      "nome": "Shariqa",
      "genere": "f"
    },
    {
      "nome": "Milo",
      "genere": "m"
    },
    {
      "nome": "Ginevra",
      "genere": "f"
    },
    {
      "nome": "Giada",
      "genere": "f"
    },
    {
      "nome": "Rachele",
      "genere": "f"
    },
    {
      "nome": "Gabriele",
      "genere": "m"
    },
    {
      "nome": "Asia-Gaia",
      "genere": "f"
    },
    {
      "nome": "Barbie",
      "genere": "f"
    },
    {
      "nome": "Ken",
      "genere": "m"
    },
    {
      "nome": "Dracula",
      "genere": "m"
    },
    {
      "nome": "Leopardi",
      "genere": "m"
    },
    {
      "nome": "Chat GPT",
      "genere": "n"
    },
    {
      "nome": "Claudiano",
      "genere": "m"
    },
    {
      "nome": "Fasfaceto",
      "genere": "m"
    },
    {
      "nome": "Vecchi dementi",
      "genere": "p"
    },
    {
      "nome": "Letizia",
      "genere": "f"
    },
    {
      "nome": "Benjamin",
      "genere": "m"
    },
    {
      "nome": "Stefano Universo",
      "genere": "m"
    },
    {
      "nome": "PDiddy",
      "genere": "m"
    },
    {
      "nome": "Elsa di Frozen",
      "genere": "f"
    },
    {
      "nome": "Rita Levi Montalcini",
      "genere": "f"
    },
    {
      "nome": "Checco Glione",
      "genere": "m"
    },
    {
      "nome": "Thomas Ticato",
      "genere": "m"
    },
    {
      "nome": "Checca Pocchia",
      "genere": "m"
    },
    {
      "nome": "Erminio Ottone",
      "genere": "m"
    },
    {
      "nome": "Dario Lampa",
      "genere": "m"
    },
    {
      "nome": "Paul Codio",
      "genere": "m"
    },
    {
      "nome": "Bella Pompa",
      "genere": "f"
    },
    {
      "nome": "Eddy Ocane",
      "genere": "n"
    },
    {
      "nome": "Nadia Arrea",
      "genere": "f"
    },
    {
      "nome": "Perla Madonna",
      "genere": "f"
    },
    {
      "nome": "Rick Yone",
      "genere": "m"
    },
    {
      "nome": "Lollo Causto",
      "genere": "m"
    },
    {
      "nome": "Giudy Morale",
      "genere": "f"
    },
    {
      "nome": "Sara Cinesca",
      "genere": "f"
    },
    {
      "nome": "Gaylord",
      "genere": "m"
    },
    {
      "nome": "Drusilla",
      "genere": "f"
    },
    {
      "nome": "Lamberto",
      "genere": "m"
    },
    {
      "nome": "Euridice",
      "genere": "f"
    },
    {
      "nome": "Troia (la citt\xE0)",
      "genere": "f"
    },
    {
      "nome": "La Signora in Giallo",
      "genere": "f"
    },
    {
      "nome": "Trilli",
      "genere": "f"
    },
    {
      "nome": "Minnie",
      "genere": "f"
    },
    {
      "nome": "Topolino",
      "genere": "m"
    },
    {
      "nome": "Pedro Pascal",
      "genere": "m"
    },
    {
      "nome": "Anne Hathaway",
      "genere": "f"
    },
    {
      "nome": "Adamo ed Eva",
      "genere": "p"
    },
    {
      "nome": "Tristano",
      "genere": "m"
    },
    {
      "nome": "Isotta",
      "genere": "f"
    },
    {
      "nome": "Ficarra e Picone",
      "genere": "p"
    },
    {
      "nome": "Avengers",
      "genere": "p"
    },
    {
      "nome": "Vannacci",
      "genere": "m"
    },
    {
      "nome": "I Ricchi e Poveri",
      "genere": "p"
    },
    {
      "nome": "Fazzoletti Tempo",
      "genere": "p"
    },
    {
      "nome": "Edo",
      "genere": "m"
    },
    {
      "nome": "Nano da giardino",
      "genere": "m"
    },
    {
      "nome": "Lanabanana",
      "genere": "n",
      "peso": 0.2
    },
    {
      "nome": "Meggy",
      "genere": "f"
    },
    {
      "nome": "Zohran Mamdani",
      "genere": "m"
    },
    {
      "nome": "Elenoire Ferruzzi",
      "genere": "f"
    },
    {
      "nome": "Anna Tatangelo",
      "genere": "f"
    },
    {
      "nome": "Sabrina Carpenter",
      "genere": "f"
    },
    {
      "nome": "Ajello Giovanna Carmela Mar (PA)",
      "genere": "f"
    },
    {
      "nome": "Clero stronzo",
      "genere": "m"
    },
    {
      "nome": "I Beati Paoli",
      "genere": "p"
    },
    {
      "nome": "Terea",
      "genere": "f"
    },
    {
      "nome": "Sadam Houssain",
      "genere": "m"
    },
    {
      "nome": "Bonolis",
      "genere": "m"
    },
    {
      "nome": "Loredana Bert\xE8",
      "genere": "f"
    },
    {
      "nome": "Netanyahu",
      "genere": "m"
    },
    {
      "nome": "Monika",
      "genere": "f"
    },
    {
      "nome": "Spiderman",
      "genere": "m"
    },
    {
      "nome": "Wonder Woman",
      "genere": "f"
    },
    {
      "nome": "Spermatozoi",
      "genere": "p"
    },
    {
      "nome": "Bambini Cinesi",
      "genere": "p"
    },
    {
      "nome": "La Nina, la Pinta e la Santa Maria",
      "genere": "fp"
    },
    {
      "nome": "Suorine",
      "genere": "fp"
    },
    {
      "nome": "Le Ragazze di Porta Venezia",
      "genere": "fp"
    },
    {
      "nome": "Suffragette",
      "genere": "fp"
    },
    {
      "nome": "Mikeshowsha",
      "genere": "m"
    },
    {
      "nome": "Gioventa",
      "genere": "f"
    },
    {
      "nome": "Jeffrey Epstein",
      "genere": "m"
    },
    {
      "nome": "Tette",
      "genere": "fp"
    },
    {
      "nome": "Bambino",
      "genere": "m"
    },
    {
      "nome": "La Bella Lavanderina",
      "genere": "f"
    },
    {
      "nome": "Britney Spears",
      "genere": "f"
    },
    {
      "nome": "Paperotte",
      "genere": "fp"
    },
    {
      "nome": "Tatiana",
      "genere": "f"
    },
    {
      "nome": "Jannik Sinner",
      "genere": "m"
    },
    {
      "nome": "Hailie McAnally",
      "genere": "f"
    },
    {
      "nome": "Charles Leclerc",
      "genere": "m"
    },
    {
      "nome": "Rosa Parks",
      "genere": "f"
    },
    {
      "nome": "Edoardo Lupo Lucia",
      "genere": "m"
    },
    {
      "nome": "Nicoletta",
      "genere": "f"
    },
    {
      "nome": "Ispettore Gennaro",
      "genere": "m"
    },
    {
      "nome": "Renesmee",
      "genere": "f"
    },
    {
      "nome": "Edward Cullen",
      "genere": "m"
    },
    {
      "nome": "Sailor Moon",
      "genere": "f"
    },
    {
      "nome": "Mastrolindo",
      "genere": "m"
    },
    {
      "nome": "Giovanni Rana",
      "genere": "m"
    },
    {
      "nome": "Una Pesca Succosa",
      "genere": "f"
    },
    {
      "nome": "Papa Urbano II",
      "genere": "m"
    },
    {
      "nome": "Kandida",
      "genere": "f"
    },
    {
      "nome": "Katia",
      "genere": "f"
    },
    {
      "nome": "Filippo",
      "genere": "m"
    },
    {
      "nome": "Carlo Conti",
      "genere": "m"
    },
    {
      "nome": "Ape Maia",
      "genere": "f"
    },
    {
      "nome": "Grazia, Graziella e Grazie Al Cazzo",
      "genere": "fp"
    },
    {
      "nome": "Gigi D'Alessio",
      "genere": "m"
    },
    {
      "nome": "Maurizia",
      "genere": "f"
    },
    {
      "nome": "Manola",
      "genere": "f"
    },
    {
      "nome": "Marino Cavalluccio",
      "genere": "m"
    },
    {
      "nome": "Katy Perry",
      "genere": "f"
    },
    {
      "nome": "Bruno Mars",
      "genere": "m"
    },
    {
      "nome": "Dorotea",
      "genere": "f"
    },
    {
      "nome": "Lo zio Massimo",
      "genere": "m"
    },
    {
      "nome": "Tom & Jerry",
      "genere": "p"
    },
    {
      "nome": "I Me contro Te",
      "genere": "p"
    },
    {
      "nome": "I pinguini di Madagascar",
      "genere": "p"
    },
    {
      "nome": "Mohammed",
      "genere": "m"
    },
    {
      "nome": "Alvaro Soler",
      "genere": "m"
    },
    {
      "nome": "La Signorina Rottenmeier",
      "genere": "f"
    },
    {
      "nome": "Giorgia Meloni",
      "genere": "f"
    },
    {
      "nome": "Antonio",
      "genere": "m"
    },
    {
      "nome": "Griselda",
      "genere": "f"
    },
    {
      "nome": "Dei bambini neri",
      "genere": "p"
    },
    {
      "nome": "Spose bambine",
      "genere": "fp"
    },
    {
      "nome": "Ottavia Maria",
      "genere": "f"
    },
    {
      "nome": "San Lazzaro",
      "genere": "m"
    },
    {
      "nome": "Topolotto",
      "genere": "m"
    },
    {
      "nome": "Emma",
      "genere": "f"
    },
    {
      "nome": "Ulisse",
      "genere": "m"
    },
    {
      "nome": "Pasifae",
      "genere": "f"
    },
    {
      "nome": "Clarabella",
      "genere": "f"
    },
    {
      "nome": "Robespierre",
      "genere": "m"
    },
    {
      "nome": "Liliana Segre",
      "genere": "f"
    },
    {
      "nome": "Assunta Capuozzo",
      "genere": "f"
    },
    {
      "nome": "Santino",
      "genere": "m"
    },
    {
      "nome": "Italo",
      "genere": "m"
    },
    {
      "nome": "Maril\xF9",
      "genere": "f"
    },
    {
      "nome": "Giustino",
      "genere": "m"
    },
    {
      "nome": "Leone Il Cane Fifone",
      "genere": "m"
    },
    {
      "nome": "Aisha",
      "genere": "f"
    },
    {
      "nome": "Fabiola",
      "genere": "f"
    },
    {
      "nome": "Federico",
      "genere": "m"
    },
    {
      "nome": "Giovanna",
      "genere": "f"
    },
    {
      "nome": "Bugs Bunny",
      "genere": "m"
    },
    {
      "nome": "Daffy Duck",
      "genere": "m"
    },
    {
      "nome": "Lola Bunny",
      "genere": "f"
    },
    {
      "nome": "Kuromi",
      "genere": "f"
    },
    {
      "nome": "Silvestro",
      "genere": "m"
    },
    {
      "nome": "Pinkie Pie",
      "genere": "f"
    },
    {
      "nome": "Riccardo",
      "genere": "m"
    },
    {
      "nome": "Steven Hawking",
      "genere": "m"
    },
    {
      "nome": "Ariana Grande",
      "genere": "f"
    },
    {
      "nome": "Hatsune Miku",
      "genere": "f"
    },
    {
      "nome": "Carlo Antonio",
      "genere": "m"
    },
    {
      "nome": "Carletto",
      "genere": "m"
    },
    {
      "nome": "Maril\xF9\xF9\xF9",
      "genere": "f"
    },
    {
      "nome": "Mirella",
      "genere": "f"
    },
    {
      "nome": "Giuseppe Cruciani",
      "genere": "m"
    },
    {
      "nome": "Laura Pausini",
      "genere": "f"
    },
    {
      "nome": "Strecatto",
      "genere": "m"
    },
    {
      "nome": "Bryan",
      "genere": "m"
    },
    {
      "nome": "Michelle Hunziker",
      "genere": "f"
    },
    {
      "nome": "Loretta Goggi",
      "genere": "f"
    },
    {
      "nome": "Max Pezzali",
      "genere": "m"
    },
    {
      "nome": "Gli 883",
      "genere": "p"
    },
    {
      "nome": "Qui, Quo e Qua",
      "genere": "p"
    },
    {
      "nome": "Pandora",
      "genere": "f"
    },
    {
      "nome": "Harry Styles",
      "genere": "m"
    },
    {
      "nome": "Fabio Rovazzi",
      "genere": "m"
    },
    {
      "nome": "Caparezza",
      "genere": "m"
    },
    {
      "nome": "Shannon De' Bussy",
      "genere": "f"
    },
    {
      "nome": "Annalisa",
      "genere": "f"
    },
    {
      "nome": "Deadpool & Wolverine",
      "genere": "p"
    },
    {
      "nome": "Biancaneve e I Sette Nani",
      "genere": "p"
    },
    {
      "nome": "Rosa Ricci",
      "genere": "f"
    },
    {
      "nome": "Ciro",
      "genere": "m"
    },
    {
      "nome": "Rocco",
      "genere": "m"
    },
    {
      "nome": "Moana",
      "genere": "f"
    },
    {
      "nome": "Le Civette Sul Com\xF2",
      "genere": "fp"
    },
    {
      "nome": "Enrico Papi",
      "genere": "m"
    },
    {
      "nome": "Valentina Persia",
      "genere": "f"
    },
    {
      "nome": "Mario Giordano",
      "genere": "m"
    },
    {
      "nome": "Elisea",
      "genere": "f"
    },
    {
      "nome": "Orlando",
      "genere": "m"
    },
    {
      "nome": "Rebecca",
      "genere": "f"
    },
    {
      "nome": "Federica La Mano Amica",
      "genere": "f"
    },
    {
      "nome": "Nando",
      "genere": "m"
    },
    {
      "nome": "Utente_deficente96",
      "genere": "n"
    },
    {
      "nome": "Pamela Prati",
      "genere": "f"
    },
    {
      "nome": "Marc Caltagirone",
      "genere": "m"
    },
    {
      "nome": "Barattolino di Nutella",
      "genere": "m"
    },
    {
      "nome": "Eliana",
      "genere": "f"
    },
    {
      "nome": "Sere Nere",
      "genere": "fp"
    },
    {
      "nome": "Il Katalicammello",
      "genere": "m"
    },
    {
      "nome": "Mariella",
      "genere": "f"
    },
    {
      "nome": "I Barbapap\xE0",
      "genere": "p"
    },
    {
      "nome": "Monica L'armonica",
      "genere": "f"
    },
    {
      "nome": "Moreno Morello",
      "genere": "m"
    },
    {
      "nome": "Fulvio",
      "genere": "m"
    },
    {
      "nome": "Yara",
      "genere": "f"
    },
    {
      "nome": "Marcella Bella",
      "genere": "f"
    },
    {
      "nome": "Alessio",
      "genere": "m"
    },
    {
      "nome": "Spacciatore Brasiliano",
      "genere": "m"
    },
    {
      "nome": "Ricchiardo",
      "genere": "m"
    },
    {
      "nome": "I Pinguini Tattici Nucleotidi",
      "genere": "p"
    },
    {
      "nome": "Mikhail Andropov",
      "genere": "m"
    },
    {
      "nome": "Ostiberio",
      "genere": "m"
    },
    {
      "nome": "Nunziata",
      "genere": "f"
    },
    {
      "nome": "Aurelia",
      "genere": "f"
    },
    {
      "nome": "*Nome Generico Bruttino*",
      "genere": "n"
    },
    {
      "nome": "Bonnie Blue",
      "genere": "f"
    },
    {
      "nome": "Gargamella",
      "genere": "m"
    },
    {
      "nome": "Una tipa",
      "genere": "f"
    },
    {
      "nome": "La Comunit\xE0 LGBTQI A C A B",
      "genere": "f"
    },
    {
      "nome": "Marlena (torna a casa)",
      "genere": "f"
    },
    {
      "nome": "Matthew (imgravida moto)",
      "genere": "m"
    }
  ],
  "adjectives": [
    {
      "n": "Cane",
      "m": "Cane",
      "f": "Cagna",
      "p": "Cani",
      "fp": "Cagne"
    },
    {
      "n": "Troia",
      "m": "Troio",
      "f": "Troia",
      "p": "Troie",
      "fp": "Troie"
    },
    {
      "n": "Puttan*",
      "m": "Puttano",
      "f": "Puttana",
      "p": "Puttani",
      "fp": "Puttane"
    },
    {
      "n": "Ebete",
      "m": "Ebete",
      "f": "Ebete",
      "p": "Ebeti",
      "fp": "Ebeti"
    },
    {
      "n": "Rincoglionit*",
      "m": "Rincoglionito",
      "f": "Rincoglionita",
      "p": "Rincoglioniti",
      "fp": "Rincoglionite"
    },
    {
      "n": "Maltrattat*",
      "m": "Maltrattato",
      "f": "Maltrattata",
      "p": "Maltrattati",
      "fp": "Maltrattate"
    },
    {
      "n": "Demente",
      "m": "Demente",
      "f": "Demente",
      "p": "Dementi",
      "fp": "Dementi"
    },
    {
      "n": "Porc*",
      "m": "Porco",
      "f": "Porca",
      "p": "Porci",
      "fp": "Porche"
    },
    {
      "n": "Termosifone",
      "m": "Termosifone",
      "f": "Termosifone",
      "p": "Termosifoni",
      "fp": "Termosifoni"
    },
    {
      "n": "Stradale",
      "m": "Stradale",
      "f": "Stradale",
      "p": "Stradali",
      "fp": "Stradali"
    },
    {
      "n": "Dismorf*",
      "m": "Dismorfo",
      "f": "Dismorfa",
      "p": "Dismorfi",
      "fp": "Dismorfe"
    },
    {
      "n": "Campione di sperma",
      "m": "Campione di sperma",
      "f": "Campionessa di sperma",
      "p": "Campioni di sperma",
      "fp": "Campionesse di sperma"
    },
    {
      "n": "Triceratopo",
      "m": "Triceratopo",
      "f": "Triceratopo",
      "p": "Triceratopi",
      "fp": "Triceratope"
    },
    {
      "n": "Terron*",
      "m": "Terrone",
      "f": "Terrona",
      "p": "Terroni",
      "fp": "Terrone"
    },
    {
      "n": "Accoltellat*",
      "m": "Accoltellato",
      "f": "Accoltellata",
      "p": "Accoltellati",
      "fp": "Accoltellate"
    },
    {
      "n": "Serbatoio idraulico",
      "m": "Serbatoio idraulico",
      "f": "Serbatoio idraulico",
      "p": "Serbatoi idraulici",
      "fp": "Serbatoi idraulici"
    },
    {
      "n": "Condominio",
      "m": "Condominio",
      "f": "Condominio",
      "p": "Condomini",
      "fp": "Condominie"
    },
    {
      "n": "Inalante di cocaina",
      "m": "Inalante di cocaina",
      "f": "Inalante di cocaina",
      "p": "Inalanti di cocaina",
      "fp": "Inalanti di cocaina"
    },
    {
      "n": "Leprecauno",
      "m": "Leprecauno",
      "f": "Leprecauna",
      "p": "Leprecauni",
      "fp": "Leprecaune"
    },
    {
      "n": "Trifosfato",
      "m": "Trifosfato",
      "f": "Trifosfato",
      "p": "Trifosfati",
      "fp": "Trifosfate"
    },
    {
      "n": "Lerci*",
      "m": "Lercio",
      "f": "Lercia",
      "p": "Lerci",
      "fp": "Lerce"
    },
    {
      "n": "Slinguazzat* da suo padre",
      "m": "Slinguazzato da suo padre",
      "f": "Slinguazzata da suo padre",
      "p": "Slinguazzati dal padre",
      "fp": "Slinguazzate dal padre"
    },
    {
      "n": "Megazord",
      "m": "Megazord",
      "f": "Megazord",
      "p": "Megazord",
      "fp": "Megazord"
    },
    {
      "n": "Ebre*",
      "m": "Ebreo",
      "f": "Ebrea",
      "p": "Ebrei",
      "fp": "Ebree"
    },
    {
      "n": "Scalz* nella valle dei chiodi arrugginiti",
      "m": "Scalzo nella valle dei chiodi arrugginiti",
      "f": "Scalza nella valle dei chiodi arrugginiti",
      "p": "Scalzi nella valle dei chiodi arrugginiti",
      "fp": "Scalze nella valle dei chiodi arrugginiti"
    },
    {
      "n": "Sciocchin*",
      "m": "Sciocchino",
      "f": "Sciocchina",
      "p": "Sciocchini",
      "fp": "Sciocchine"
    },
    {
      "n": "Disadattat*",
      "m": "Disadattato",
      "f": "Disadattata",
      "p": "Disadattati",
      "fp": "Disadattate"
    },
    {
      "n": "Imbecille",
      "m": "Imbecille",
      "f": "Imbecille",
      "p": "Imbecilli",
      "fp": "Imbecilli"
    },
    {
      "n": "Mongoloide",
      "m": "Mongoloide",
      "f": "Mongoloide",
      "p": "Mongoloidi",
      "fp": "Mongoloidi"
    },
    {
      "n": "Gatto",
      "m": "Gatto",
      "f": "Gatta",
      "p": "Gatti",
      "fp": "Gatte"
    },
    {
      "n": "Coniglio",
      "m": "Coniglio",
      "f": "Coniglia",
      "p": "Conigli",
      "fp": "Coniglie"
    },
    {
      "n": "Cretin*",
      "m": "Cretino",
      "f": "Cretina",
      "p": "Cretini",
      "fp": "Cretine"
    },
    {
      "n": "Anfibio",
      "m": "Anfibio",
      "f": "Anfibia",
      "p": "Anfibi",
      "fp": "Anfibie"
    },
    {
      "n": "Stronz*",
      "m": "Stronzo",
      "f": "Stronza",
      "p": "Stronzi",
      "fp": "Stronze"
    },
    {
      "n": "Zoccol*",
      "m": "Zoccolo",
      "f": "Zoccola",
      "p": "Zoccoli",
      "fp": "Zoccole"
    },
    {
      "n": "Puttanier*",
      "m": "Puttaniere",
      "f": "Puttaniera",
      "p": "Puttanieri",
      "fp": "Puttaniere"
    },
    {
      "n": "Mozzarella bio",
      "m": "Mozzarella bio",
      "f": "Mozzarella bio",
      "p": "Mozzarelle bio",
      "fp": "Mozzarelle bio"
    },
    {
      "n": "Cancro",
      "m": "Cancro",
      "f": "Cancro",
      "p": "Cancri",
      "fp": "Cancri"
    },
    {
      "n": "Negr*",
      "m": "Negro",
      "f": "Negra",
      "p": "Negri",
      "fp": "Negre"
    },
    {
      "n": "Con una grave malattia terminale",
      "m": "Con una grave malattia terminale",
      "f": "Con una grave malattia terminale",
      "p": "Con una grave malattia terminale",
      "fp": "Con una grave malattia terminale"
    },
    {
      "n": "Gravemente omosessuale",
      "m": "Gravemente omosessuale",
      "f": "Gravemente omosessuale",
      "p": "Gravemente omosessuali",
      "fp": "Gravemente omosessuali"
    },
    {
      "n": "Mattacchion*",
      "m": "Mattacchione",
      "f": "Mattacchiona",
      "p": "Mattacchioni",
      "fp": "Mattacchione"
    },
    {
      "n": "Proveniente dalla bollente provincia napoletana",
      "m": "Proveniente dalla bollente provincia napoletana",
      "f": "Proveniente dalla bollente provincia napoletana",
      "p": "Provenienti dalla bollente provincia napoletana",
      "fp": "Provenienti dalla bollente provincia napoletana"
    },
    {
      "n": "Soprammobile",
      "m": "Soprammobile",
      "f": "Soprammobile",
      "p": "Soprammobili",
      "fp": "Soprammobili"
    },
    {
      "n": "Flagello del mondo",
      "m": "Flagello del mondo",
      "f": "Flagello del mondo",
      "p": "Flagelli del mondo",
      "fp": "Flagelle del mondo"
    },
    {
      "n": "Buco di culo",
      "m": "Buco di culo",
      "f": "Buco di culo",
      "p": "Buchi di culo",
      "fp": "Buchi di culo"
    },
    {
      "n": "Con un forte accento bergamasco",
      "m": "Con un forte accento bergamasco",
      "f": "Con un forte accento bergamasco",
      "p": "Con un forte accento bergamasco",
      "fp": "Con un forte accento bergamasco"
    },
    {
      "n": "Asdrubalante",
      "m": "Asdrubalante",
      "f": "Asdrubalante",
      "p": "Asdrubalanti",
      "fp": "Asdrubalanti"
    },
    {
      "n": "Vibrante",
      "m": "Vibrante",
      "f": "Vibrante",
      "p": "Vibranti",
      "fp": "Vibranti"
    },
    {
      "n": "Caliente",
      "m": "Caliente",
      "f": "Caliente",
      "p": "Calienti",
      "fp": "Calienti"
    },
    {
      "n": "Eccitante",
      "m": "Eccitante",
      "f": "Eccitante",
      "p": "Eccitanti",
      "fp": "Eccitanti"
    },
    {
      "n": "Segante",
      "m": "Segante",
      "f": "Segante",
      "p": "Seganti",
      "fp": "Seganti"
    },
    {
      "n": "Scopante",
      "m": "Scopante",
      "f": "Scopante",
      "p": "Scopanti",
      "fp": "Scopanti"
    },
    {
      "n": "Cagarellante",
      "m": "Cagarellante",
      "f": "Cagarellante",
      "p": "Cagarellanti",
      "fp": "Cagarellanti"
    },
    {
      "n": "Macchiante",
      "m": "Macchiante",
      "f": "Macchiante",
      "p": "Macchianti",
      "fp": "Macchianti"
    },
    {
      "n": "Incontinente",
      "m": "Incontinente",
      "f": "Incontinente",
      "p": "Incontinenti",
      "fp": "Incontinenti"
    },
    {
      "n": "Gemente",
      "m": "Gemente",
      "f": "Gemente",
      "p": "Gementi",
      "fp": "Gementi"
    },
    {
      "n": "Performante",
      "m": "Performante",
      "f": "Performante",
      "p": "Performanti",
      "fp": "Performanti"
    },
    {
      "n": "Sniffante",
      "m": "Sniffante",
      "f": "Sniffante",
      "p": "Sniffanti",
      "fp": "Sniffanti"
    },
    {
      "n": "Folgorante",
      "m": "Folgorante",
      "f": "Folgorante",
      "p": "Folgoranti",
      "fp": "Folgoranti"
    },
    {
      "n": "Gocciolante",
      "m": "Gocciolante",
      "f": "Gocciolante",
      "p": "Gocciolanti",
      "fp": "Gocciolanti"
    },
    {
      "n": "Rizzante",
      "m": "Rizzante",
      "f": "Rizzante",
      "p": "Rizzanti",
      "fp": "Rizzanti"
    },
    {
      "n": "Scompisciante",
      "m": "Scompisciante",
      "f": "Scompisciante",
      "p": "Scompiscianti",
      "fp": "Scompiscianti"
    },
    {
      "n": "Sburrante",
      "m": "Sburrante",
      "f": "Sburrante",
      "p": "Sburranti",
      "fp": "Sburranti"
    },
    {
      "n": "Ninfomane",
      "m": "Ninfomane",
      "f": "Ninfomane",
      "p": "Ninfomani",
      "fp": "Ninfomani"
    },
    {
      "n": "Abominevole",
      "m": "Abominevole",
      "f": "Abominevole",
      "p": "Abominevoli",
      "fp": "Abominevoli"
    },
    {
      "n": "Gigante",
      "m": "Gigante",
      "f": "Gigantessa",
      "p": "Giganti",
      "fp": "Gigantesse"
    },
    {
      "n": "Piacevole",
      "m": "Piacevole",
      "f": "Piacevole",
      "p": "Piacevoli",
      "fp": "Piacevoli"
    },
    {
      "n": "Sensuale",
      "m": "Sensuale",
      "f": "Sensuale",
      "p": "Sensuali",
      "fp": "Sensuali"
    },
    {
      "n": "Omosessuale",
      "m": "Omosessuale",
      "f": "Omosessuale",
      "p": "Omosessuali",
      "fp": "Omosessuali"
    },
    {
      "n": "Petulante",
      "m": "Petulante",
      "f": "Petulante",
      "p": "Petulanti",
      "fp": "Petulanti"
    },
    {
      "n": "Pizzicolante",
      "m": "Pizzicolante",
      "f": "Pizzicolante",
      "p": "Pizzicolanti",
      "fp": "Pizzicolanti"
    },
    {
      "n": "Orgasmante",
      "m": "Orgasmante",
      "f": "Orgasmante",
      "p": "Orgasmanti",
      "fp": "Orgasmanti"
    },
    {
      "n": "Vegetante",
      "m": "Vegetante",
      "f": "Vegetante",
      "p": "Vegetanti",
      "fp": "Vegetanti"
    },
    {
      "n": "Indulgente",
      "m": "Indulgente",
      "f": "Indulgente",
      "p": "Indulgenti",
      "fp": "Indulgenti"
    },
    {
      "n": "Bocca larga",
      "m": "Bocca larga",
      "f": "Bocca larga",
      "p": "Bocche larghe",
      "fp": "Bocche larghe"
    },
    {
      "n": "Culo stretto",
      "m": "Culo stretto",
      "f": "Culo stretto",
      "p": "Culi stretti",
      "fp": "Culi stretti"
    },
    {
      "n": "Mani rapide",
      "m": "Mani rapide",
      "f": "Mani rapide",
      "p": "Mani rapide",
      "fp": "Mani rapide"
    },
    {
      "n": "Imprecante",
      "m": "Imprecante",
      "f": "Imprecante",
      "p": "Imprecanti",
      "fp": "Imprecanti"
    },
    {
      "n": "Salivante",
      "m": "Salivante",
      "f": "Salivante",
      "p": "Salivanti",
      "fp": "Salivanti"
    },
    {
      "n": "Ortofruttante",
      "m": "Ortofruttante",
      "f": "Ortofruttante",
      "p": "Ortofruttanti",
      "fp": "Ortofruttanti"
    },
    {
      "n": "Strimpellante",
      "m": "Strimpellante",
      "f": "Strimpellante",
      "p": "Strimpellanti",
      "fp": "Strimpellanti"
    },
    {
      "n": "Seno esplosivo",
      "m": "Seno esplosivo",
      "f": "Seno esplosivo",
      "p": "Seni esplosivi",
      "fp": "Seni esplosivi"
    },
    {
      "n": "Passione fisting",
      "m": "Passione fisting",
      "f": "Passione fisting",
      "p": "Passione fisting",
      "fp": "Passione fisting"
    },
    {
      "n": "Saccente",
      "m": "Saccente",
      "f": "Saccente",
      "p": "Saccenti",
      "fp": "Saccenti"
    },
    {
      "n": "Orifizio dilatato",
      "m": "Orifizio dilatato",
      "f": "Orifizio dilatato",
      "p": "Orifizi dilatati",
      "fp": "Orifizi dilatati"
    },
    {
      "n": "Comunista",
      "m": "Comunista",
      "f": "Comunista",
      "p": "Comunisti",
      "fp": "Comuniste"
    },
    {
      "n": "Fascista",
      "m": "Fascista",
      "f": "Fascista",
      "p": "Fascisti",
      "fp": "Fasciste"
    },
    {
      "n": "Eccessivamente omosessuale",
      "m": "Eccessivamente omosessuale",
      "f": "Eccessivamente omosessuale",
      "p": "Eccessivamente omosessuali",
      "fp": "Eccessivamente omosessuali"
    },
    {
      "n": "Che salta sui tetti",
      "m": "Che salta sui tetti",
      "f": "Che salta sui tetti",
      "p": "Che saltano sui tetti",
      "fp": "Che saltano sui tetti"
    },
    {
      "n": "Che corre nei campi",
      "m": "Che corre nei campi",
      "f": "Che corre nei campi",
      "p": "Che corrono nei campi",
      "fp": "Che corrono nei campi"
    },
    {
      "n": "Provocante",
      "m": "Provocante",
      "f": "Provocante",
      "p": "Provocanti",
      "fp": "Provocanti"
    },
    {
      "n": "Effervescente",
      "m": "Effervescente",
      "f": "Effervescente",
      "p": "Effervescenti",
      "fp": "Effervescenti"
    },
    {
      "n": "Con la felpa di Salvini",
      "m": "Con la felpa di Salvini",
      "f": "Con la felpa di Salvini",
      "p": "Con le felpe di Salvini",
      "fp": "Con le felpe di Salvini"
    },
    {
      "n": "Fessa dentata",
      "m": "Fessa dentata",
      "f": "Fessa dentata",
      "p": "Fesse dentate",
      "fp": "Fesse dentate"
    },
    {
      "n": "Culo peloso",
      "m": "Culo peloso",
      "f": "Culo peloso",
      "p": "Culi pelosi",
      "fp": "Culi pelosi"
    },
    {
      "n": "Down",
      "m": "Down",
      "f": "Down",
      "p": "Down",
      "fp": "Down"
    },
    {
      "n": "Su una sedia a rotelle",
      "m": "Su una sedia a rotelle",
      "f": "Su una sedia a rotelle",
      "p": "Su una sedia a rotelle",
      "fp": "Su una sedia a rotelle"
    },
    {
      "n": "Intollerante al lattosio",
      "m": "Intollerante al lattosio",
      "f": "Intollerante al lattosio",
      "p": "Intolleranti al lattosio",
      "fp": "Intolleranti al lattosio"
    },
    {
      "n": "Bocchinante",
      "m": "Bocchinante",
      "f": "Bocchinante",
      "p": "Bocchinanti",
      "fp": "Bocchinanti"
    },
    {
      "n": "Naso imponente",
      "m": "Naso imponente",
      "f": "Naso imponente",
      "p": "Nasi imponenti",
      "fp": "Nasi imponenti"
    },
    {
      "n": "Dissacrante",
      "m": "Dissacrante",
      "f": "Dissacrante",
      "p": "Dissacranti",
      "fp": "Dissacranti"
    },
    {
      "n": "Elefante",
      "m": "Elefante",
      "f": "Elefantessa",
      "p": "Elefanti",
      "fp": "Elefantesse"
    },
    {
      "n": "Feticista",
      "m": "Feticista",
      "f": "Feticista",
      "p": "Feticisti",
      "fp": "Feticiste"
    },
    {
      "n": "Sconvolgente",
      "m": "Sconvolgente",
      "f": "Sconvolgente",
      "p": "Sconvolgenti",
      "fp": "Sconvolgenti"
    },
    {
      "n": "Saltasburellante",
      "m": "Saltasburellante",
      "f": "Saltasburellante",
      "p": "Saltasburellanti",
      "fp": "Saltasburellanti"
    },
    {
      "n": "Necromante",
      "m": "Necromante",
      "f": "Necromante",
      "p": "Necromanti",
      "fp": "Necromanti"
    },
    {
      "n": "Che picchia i bambini",
      "m": "Che picchia i bambini",
      "f": "Che picchia i bambini",
      "p": "Che picchiano i bambini",
      "fp": "Che picchiano i bambini"
    },
    {
      "n": "Che deruba le vecchie",
      "m": "Che deruba le vecchie",
      "f": "Che deruba le vecchie",
      "p": "Che derubano le vecchie",
      "fp": "Che derubano le vecchie"
    },
    {
      "n": "Pluriomicida",
      "m": "Pluriomicida",
      "f": "Pluriomicida",
      "p": "Pluriomicidi",
      "fp": "Pluriomicide"
    },
    {
      "n": "Sodomita",
      "m": "Sodomita",
      "f": "Sodomita",
      "p": "Sodomiti",
      "fp": "Sodomite"
    },
    {
      "n": "Filibustier*",
      "m": "Filibustiere",
      "f": "Filibustiera",
      "p": "Filibustieri",
      "fp": "Filibustiere"
    },
    {
      "n": "Alito fetente",
      "m": "Alito fetente",
      "f": "Alito fetente",
      "p": "Aliti fetenti",
      "fp": "Aliti fetenti"
    },
    {
      "n": "Senpai",
      "m": "Senpai",
      "f": "Senpai",
      "p": "Senpai",
      "fp": "Senpai"
    },
    {
      "n": "Bueo",
      "m": "Bueo",
      "f": "Buea",
      "p": "Buei",
      "fp": "Buee"
    },
    {
      "n": "Con il parrucchino",
      "m": "Con il parrucchino",
      "f": "Con il parrucchino",
      "p": "Con il parrucchino",
      "fp": "Con il parrucchino"
    },
    {
      "n": "A forma di scarpiera",
      "m": "A forma di scarpiera",
      "f": "A forma di scarpiera",
      "p": "A forma di scarpiera",
      "fp": "A forma di scarpiera"
    },
    {
      "n": "Geneticamente modificat*",
      "m": "Geneticamente modificato",
      "f": "Geneticamente modificata",
      "p": "Geneticamente modificati",
      "fp": "Geneticamente modificate"
    },
    {
      "n": "Che brilla al buio",
      "m": "Che brilla al buio",
      "f": "Che brilla al buio",
      "p": "Che brillano al buio",
      "fp": "Che brillano al buio"
    },
    {
      "n": "Fetente",
      "m": "Fetente",
      "f": "Fetente",
      "p": "Fetenti",
      "fp": "Fetenti"
    },
    {
      "n": "Costosett*",
      "m": "Costosetto",
      "f": "Costosetta",
      "p": "Costosetti",
      "fp": "Costosette"
    },
    {
      "n": "Un po' cesso",
      "m": "Un po' cesso",
      "f": "Un po' cesso",
      "p": "Un po' cessi",
      "fp": "Un po' cesse"
    },
    {
      "n": "E la sua bussy",
      "m": "E la sua bussy",
      "f": "E la sua bussy",
      "p": "E la loro bussy",
      "fp": "E la loro bussy"
    },
    {
      "n": "Mastodontic*",
      "m": "Mastodontico",
      "f": "Mastodontica",
      "p": "Mastodontici",
      "fp": "Mastodontiche"
    },
    {
      "n": "In plastica riciclabile",
      "m": "In plastica riciclabile",
      "f": "In plastica riciclabile",
      "p": "In plastica riciclabile",
      "fp": "In plastica riciclabile"
    },
    {
      "n": "7 ore prima dell'arresto",
      "m": "7 ore prima dell'arresto",
      "f": "7 ore prima dell'arresto",
      "p": "7 ore prima dell'arresto",
      "fp": "7 ore prima dell'arresto"
    },
    {
      "n": "Impestat*",
      "m": "Impestato",
      "f": "Impestata",
      "p": "Impestati",
      "fp": "Impestate"
    },
    {
      "n": "Malat* di AIDS",
      "m": "Malato di AIDS",
      "f": "Malata di AIDS",
      "p": "Malati di AIDS",
      "fp": "Malate di AIDS"
    },
    {
      "n": "Fulminat* sulla via di damasco",
      "m": "Fulminato sulla via di damasco",
      "f": "Fulminata sulla via di damasco",
      "p": "Fulminati sulla via di damasco",
      "fp": "Fulminate sulla via di damasco"
    },
    {
      "n": "e le sue personalit\xE0 multiple",
      "m": "e le sue personalit\xE0 multiple",
      "f": "e le sue personalit\xE0 multiple",
      "p": "e le loro personalit\xE0 multiple",
      "fp": "e le loro personalit\xE0 multiple"
    },
    {
      "n": "e la sua ciola",
      "m": "e la sua ciola",
      "f": "e la sua ciola",
      "p": "e le loro ciole",
      "fp": "e le loro ciole"
    },
    {
      "n": "Faccendier* di mafia",
      "m": "Faccendiere di mafia",
      "f": "Faccendiera di mafia",
      "p": "Faccendieri di mafia",
      "fp": "Faccendiere di mafia"
    },
    {
      "n": "da troie accompagnat*",
      "m": "da troie accompagnato",
      "f": "da troie accompagnata",
      "p": "da troie accompagnati",
      "fp": "da troie accompagnate"
    },
    {
      "n": "che favoreggia la prostituzione",
      "m": "che favoreggia la prostituzione",
      "f": "che favoreggia la prostituzione",
      "p": "che favoreggiano la prostituzione",
      "fp": "che favoreggiano la prostituzione"
    },
    {
      "n": "Mongoplettic*",
      "m": "Mongoplettico",
      "f": "Mongoplettica",
      "p": "Mongoplettici",
      "fp": "Mongoplettiche"
    },
    {
      "n": "Tetton*",
      "m": "Tettone",
      "f": "Tettona",
      "p": "Tettoni",
      "fp": "Tettone"
    },
    {
      "n": "con una banana nel culo",
      "m": "con una banana nel culo",
      "f": "con una banana nel culo",
      "p": "con una banana nel culo",
      "fp": "con una banana nel culo"
    },
    {
      "n": "Remigrat*",
      "m": "Remigrato",
      "f": "Remigrata",
      "p": "Remigrati",
      "fp": "Remigrate"
    },
    {
      "n": "Scem* Pagliacci*",
      "m": "Scemo Pagliaccio",
      "f": "Scema Pagliaccia",
      "p": "Scemi Pagliacci",
      "fp": "Sceme Pagliacce"
    },
    {
      "n": "Sionista",
      "m": "Sionista",
      "f": "Sionista",
      "p": "Sionisti",
      "fp": "Sioniste"
    },
    {
      "n": "Felicemente Cornut*",
      "m": "Felicemente Cornuto",
      "f": "Felicemente Cornuta",
      "p": "Felicemente Cornuti",
      "fp": "Felicemente Cornute"
    },
    {
      "n": "Figli* di troia",
      "m": "Figlio di troia",
      "f": "Figlia di troia",
      "p": "Figli di troia",
      "fp": "Figlie di troia"
    },
    {
      "n": "Gran Minchion*",
      "m": "Gran Minchione",
      "f": "Gran Minchiona",
      "p": "Gran Minchioni",
      "fp": "Gran Minchione"
    },
    {
      "n": "Chan",
      "m": "Chan",
      "f": "Chan",
      "p": "Chan",
      "fp": "Chan"
    },
    {
      "n": "Kawaii :3",
      "m": "Kawaii :3",
      "f": "Kawaii :3",
      "p": "Kawaii :3",
      "fp": "Kawaii :3"
    },
    {
      "n": "Orripilante",
      "m": "Orripilante",
      "f": "Orripilante",
      "p": "Orripilanti",
      "fp": "Orripilanti"
    },
    {
      "n": "Sburrastic*",
      "m": "Sburrastico",
      "f": "Sburrastica",
      "p": "Sburrastici",
      "fp": "Sburrastiche"
    },
    {
      "n": "Pedofil*",
      "m": "Pedofilo",
      "f": "Pedofila",
      "p": "Pedofili",
      "fp": "Pedofile"
    },
    {
      "n": "Focomelic*",
      "m": "Focomelico",
      "f": "Focomelica",
      "p": "Focomelici",
      "fp": "Focomeliche"
    },
    {
      "n": "Digievolut*",
      "m": "Digievoluto",
      "f": "Digievoluta",
      "p": "Digievoluti",
      "fp": "Digievolute"
    },
    {
      "n": "Abortit*",
      "m": "Abortito",
      "f": "Abortita",
      "p": "Abortiti",
      "fp": "Abortite"
    },
    {
      "n": "Malat* di figa",
      "m": "Malato di figa",
      "f": "Malata di figa",
      "p": "Malati di figa",
      "fp": "Malate di figa"
    },
    {
      "n": "nei dintorni",
      "m": "nei dintorni",
      "f": "nei dintorni",
      "p": "nei dintorni",
      "fp": "nei dintorni"
    },
    {
      "n": "Fresc* di Zona",
      "m": "Fresco di Zona",
      "f": "Fresca di Zona",
      "p": "Freschi di Zona",
      "fp": "Fresche di Zona"
    },
    {
      "n": "Bel Giuovinott*",
      "m": "Bel Giuovinotto",
      "f": "Bella Giuovinotta",
      "p": "Bei Giuovinotti",
      "fp": "Belle Giuovinotte"
    },
    {
      "n": "Orfanenell*",
      "m": "Orfanenello",
      "f": "Orfanenella",
      "p": "Orfanenelli",
      "fp": "Orfanenelle"
    },
    {
      "n": "Scem*",
      "m": "Scemo",
      "f": "Scema",
      "p": "Scemi",
      "fp": "Sceme"
    },
    {
      "n": "Roman* de Roma AOOO",
      "m": "Romano de Roma AOOO",
      "f": "Romana de Roma AOOO",
      "p": "Romani de Roma AOOO",
      "fp": "Romane de Roma AOOO"
    },
    {
      "n": "Inopportun*",
      "m": "Inopportuno",
      "f": "Inopportuna",
      "p": "Inopportuni",
      "fp": "Inopportune"
    },
    {
      "n": "Bell* ma Stronz*",
      "m": "Bello ma Stronzo",
      "f": "Bella ma Stronza",
      "p": "Belli ma Stronzi",
      "fp": "Belle ma Stronze"
    },
    {
      "n": "Calcol* Renale",
      "m": "Calcolo Renale",
      "f": "Calcolo Renale",
      "p": "Calcoli Renale",
      "fp": "Calcoli Renale"
    },
    {
      "n": "Tirolese",
      "m": "Tirolese",
      "f": "Tirolese",
      "p": "Tirolesi",
      "fp": "Tirolesi"
    },
    {
      "n": "Hypertroi*",
      "m": "Hypertroio",
      "f": "Hypertroia",
      "p": "Hypertroii",
      "fp": "Hypertroie"
    },
    {
      "n": "Trepidante",
      "m": "Trepidante",
      "f": "Trepidante",
      "p": "Trepidanti",
      "fp": "Trepidanti"
    },
    {
      "n": "Dislessic*",
      "m": "Dislessico",
      "f": "Dislessica",
      "p": "Dislessici",
      "fp": "Dislessiche"
    },
    {
      "n": "Decurtat*",
      "m": "Decurtato",
      "f": "Decurtata",
      "p": "Decurtati",
      "fp": "Decurtate"
    },
    {
      "n": "nel suo prime con un cazzo in culo",
      "m": "nel suo prime con un cazzo in culo",
      "f": "nel suo prime con un cazzo in culo",
      "p": "nel loro prime con dei cazzi in culo",
      "fp": "nel loro prime con dei cazzi in culo"
    },
    {
      "n": "Pirla",
      "m": "Pirla",
      "f": "Pirla",
      "p": "Pirla",
      "fp": "Pirla"
    },
    {
      "n": "Disagiat*",
      "m": "Disagiato",
      "f": "Disagiata",
      "p": "Disagiati",
      "fp": "Disagiate"
    },
    {
      "n": "Mona",
      "m": "Mona",
      "f": "Mona",
      "p": "Mona",
      "fp": "Mona"
    },
    {
      "n": "Lamenton*",
      "m": "Lamentone",
      "f": "Lamentona",
      "p": "Lamentoni",
      "fp": "Lamentone"
    },
    {
      "n": "con 7 figli illegittimi",
      "m": "con 7 figli illegittimi",
      "f": "con 7 figli illegittimi",
      "p": "con 7 figli illegittimi",
      "fp": "con 7 figli illegittimi"
    },
    {
      "n": "un po' cinese",
      "m": "un po' cinese",
      "f": "un po' cinese",
      "p": "un po' cinesi",
      "fp": "un po' cinesi"
    },
    {
      "n": "Contro Natura",
      "m": "Contro Natura",
      "f": "Contro Natura",
      "p": "Contro Natura",
      "fp": "Contro Natura"
    },
    {
      "n": "Tutt* Fatt*",
      "m": "Tutto Fatto",
      "f": "Tutta Fatta",
      "p": "Tutti Fatti",
      "fp": "Tutte Fatte"
    },
    {
      "n": "Inutile",
      "m": "Inutile",
      "f": "Inutile",
      "p": "Inutili",
      "fp": "Inutili"
    },
    {
      "n": "Dispers* nei Campi Flegrei",
      "m": "Disperso nei Campi Flegrei",
      "f": "Dispersa nei Campi Flegrei",
      "p": "Dispersi nei Campi Flegrei",
      "fp": "Disperse nei Campi Flegrei"
    },
    {
      "n": "con il potere del cristallo di luna",
      "m": "con il potere del cristallo di luna",
      "f": "con il potere del cristallo di luna",
      "p": "con il potere del cristallo di luna",
      "fp": "con il potere del cristallo di luna"
    },
    {
      "n": "Tord*",
      "m": "Tordo",
      "f": "Torda",
      "p": "Tordi",
      "fp": "Torde"
    },
    {
      "n": "rapit* dall'uomo nero",
      "m": "rapito dall'uomo nero",
      "f": "rapita dall'uomo nero",
      "p": "rapiti dall'uomo nero",
      "fp": "rapite dall'uomo nero"
    },
    {
      "n": "Paravent*",
      "m": "Paravento",
      "f": "Paraventa",
      "p": "Paraventi",
      "fp": "Paravente"
    },
    {
      "n": "nascost* nel cavallo di Troia",
      "m": "nascosto nel cavallo di Troia",
      "f": "nascosta nel cavallo di Troia",
      "p": "nascosti nel cavallo di Troia",
      "fp": "nascoste nel cavallo di Troia"
    },
    {
      "n": "Dolomitista",
      "m": "Dolomitista",
      "f": "Dolomitista",
      "p": "Dolomitisti",
      "fp": "Dolomitiste"
    },
    {
      "n": "Sdrumante",
      "m": "Sdrumante",
      "f": "Sdrumante",
      "p": "Sdrumanti",
      "fp": "Sdrumanti"
    },
    {
      "n": "che suona la fisarmonica",
      "m": "che suona la fisarmonica",
      "f": "che suona la fisarmonica",
      "p": "che suonanano la fisarmonica",
      "fp": "che suonanano la fisarmonica"
    },
    {
      "n": "con delle belle tette",
      "m": "con delle belle tette",
      "f": "con delle belle tette",
      "p": "con delle belle tette",
      "fp": "con delle belle tette"
    },
    {
      "n": "Formaggios*",
      "m": "Formaggioso",
      "f": "Formaggiosa",
      "p": "Formaggiosi",
      "fp": "Formaggiose"
    },
    {
      "n": "Detenut*",
      "m": "Detenuto",
      "f": "Detenuta",
      "p": "Detenuti",
      "fp": "Detenute"
    },
    {
      "n": "su un volo Ryanair per Auschwitz",
      "m": "su un volo Ryanair per Auschwitz",
      "f": "su un volo Ryanair per Auschwitz",
      "p": "su un volo Ryanair per Auschwitz",
      "fp": "su un volo Ryanair per Auschwitz"
    },
    {
      "n": "che va a ballare in Puglia",
      "m": "che va a ballare in Puglia",
      "f": "che va a ballare in Puglia",
      "p": "che vanno a ballare in Puglia",
      "fp": "che vanno a ballare in Puglia"
    },
    {
      "n": "con la disfunzione erettile",
      "m": "con la disfunzione erettile",
      "f": "con la disfunzione erettile",
      "p": "con la disfunzione erettile",
      "fp": "con la disfunzione erettile"
    },
    {
      "n": "Decapitat*",
      "m": "Decapitato",
      "f": "Decapitata",
      "p": "Decapitati",
      "fp": "Decapitate"
    },
    {
      "n": "Sibarista",
      "m": "Sibarista",
      "f": "Sibarista",
      "p": "Sibaristi",
      "fp": "Sibariste"
    },
    {
      "n": "Caca Sbura",
      "m": "Caca Sbura",
      "f": "Caca Sbura",
      "p": "Caca Sbura",
      "fp": "Caca Sbura"
    },
    {
      "n": "Inculat*",
      "m": "Inculato",
      "f": "Inculata",
      "p": "Inculati",
      "fp": "Inculate"
    },
    {
      "n": "senza trucco e senza inganno",
      "m": "senza trucco e senza inganno",
      "f": "senza trucco e senza inganno",
      "p": "senza trucco e senza inganno",
      "fp": "senza trucco e senza inganno"
    },
    {
      "n": "Allampanat*",
      "m": "Allampanato",
      "f": "Allampanata",
      "p": "Allampanati",
      "fp": "Allampanate"
    },
    {
      "n": "creat* con la deficenza artificiale",
      "m": "creato con la deficenza artificiale",
      "f": "creata con la deficenza artificiale",
      "p": "creati con la deficenza artificiale",
      "fp": "create con la deficenza artificiale"
    },
    {
      "n": "Presidente di stocazzo",
      "m": "Presidente di stocazzo",
      "f": "Presidente di stocazzo",
      "p": "Presidenti di stocazzo",
      "fp": "Presidenti di stocazzo"
    },
    {
      "n": "ai margini della societ\xE0",
      "m": "ai margini della societ\xE0",
      "f": "ai margini della societ\xE0",
      "p": "ai margini della societ\xE0",
      "fp": "ai margini della societ\xE0"
    },
    {
      "n": "con la cataratta",
      "m": "con la cataratta",
      "f": "con la cataratta",
      "p": "con la cataratta",
      "fp": "con la cataratta"
    },
    {
      "n": "Diva",
      "m": "Diva",
      "f": "Diva",
      "p": "Dive",
      "fp": "Dive"
    },
    {
      "n": "Petttegol*",
      "m": "Petttegolo",
      "f": "Petttegola",
      "p": "Petttegoli",
      "fp": "Petttegole"
    },
    {
      "n": "Anarchic*",
      "m": "Anarchico",
      "f": "Anarchica",
      "p": "Anarchici",
      "fp": "Anarchiche"
    },
    {
      "n": "Molest*",
      "m": "Molesto",
      "f": "Molesta",
      "p": "Molesti",
      "fp": "Moleste"
    },
    {
      "n": "Rimast*",
      "m": "Rimasto",
      "f": "Rimasta",
      "p": "Rimasti",
      "fp": "Rimaste"
    },
    {
      "n": "Schiavizzat*",
      "m": "Schiavizzato",
      "f": "Schiavizzata",
      "p": "Schiavizzati",
      "fp": "Schiavizzate"
    },
    {
      "n": "Radical Chic di Brescia",
      "m": "il Radical Chic di Brescia",
      "f": "la Radical Chic di Brescia",
      "p": "i Radical Chic di Brescia",
      "fp": "le Radical Chic di Brescia"
    },
    {
      "n": "Mononeuronale",
      "m": "Mononeuronale",
      "f": "Mononeuronale",
      "p": "Mononeuronali",
      "fp": "Mononeuronali"
    },
    {
      "n": "Calabrese",
      "m": "Calabrese",
      "f": "Calabrese",
      "p": "Calabresi",
      "fp": "Calabresi"
    },
    {
      "n": "Cazzo Lungo",
      "m": "Cazzo Lungo",
      "f": "Cazzo Lungo",
      "p": "Cazzi Lunghi",
      "fp": "Cazzi Lunghi"
    },
    {
      "n": "Imbecille",
      "m": "Imbecille",
      "f": "Imbecille",
      "p": "Imbecilli",
      "fp": "Imbecilli"
    },
    {
      "n": "Bifolc*",
      "m": "Bifolco",
      "f": "Bifolca",
      "p": "Bifolchi",
      "fp": "Bifolche"
    },
    {
      "n": "Segretamente una mamma pancina",
      "m": "Segretamente una mamma pancina",
      "f": "Segretamente una mamma pancina",
      "p": "Segretamente delle mamme pancine",
      "fp": "Segretamente delle mamme pancine"
    },
    {
      "n": "Sbricolat*",
      "m": "Sbricolato",
      "f": "Sbricolata",
      "p": "Sbricolati",
      "fp": "Sbricolate"
    },
    {
      "n": "Sbrodolin*",
      "m": "Sbrodolino",
      "f": "Sbrodolina",
      "p": "Sbrodolini",
      "fp": "Sbrodoline"
    },
    {
      "n": "The Fascista",
      "m": "Il Fascista",
      "f": "La Fascista",
      "p": "I Fascisti",
      "fp": "Le Fasciste"
    },
    {
      "n": "Appassionat* di bambini",
      "m": "Appassionato di bambini",
      "f": "Appassionata di bambini",
      "p": "Appassionati di bambini",
      "fp": "Appassionate di bambini"
    },
    {
      "n": "Beccat* ad un'orgia",
      "m": "Beccato ad un'orgia",
      "f": "Beccata ad un'orgia",
      "p": "Beccati ad un'orgia",
      "fp": "Beccate ad un'orgia"
    },
    {
      "n": "Amante di My Little Pony",
      "m": "Amante di My Little Pony",
      "f": "Amante di My Little Pony",
      "p": "Amanti di My Little Pony",
      "fp": "Amanti di My Little Pony"
    },
    {
      "n": "Catafratt*",
      "m": "Catafratto",
      "f": "Catafratta",
      "p": "Catafratti",
      "fp": "Catafratte"
    },
    {
      "n": "Fatiscente",
      "m": "Fatiscente",
      "f": "Fatiscente",
      "p": "Fatiscenti",
      "fp": "Fatiscenti"
    },
    {
      "n": "Trivellat*",
      "m": "Trivellato",
      "f": "Trivellata",
      "p": "Trivellati",
      "fp": "Trivellate"
    },
    {
      "n": "The Pi\xF9 Gaio Del Pollaio",
      "m": "Il Pi\xF9 Gaio Del Pollaio",
      "f": "La Pi\xF9 Gaia Del Pollaio",
      "p": "I Pi\xF9 Gai Di Pollai",
      "fp": "Le Pi\xF9 Gaie Del Pollaio"
    },
    {
      "n": "in tour in Burkina Faso",
      "m": "in tour in Burkina Faso",
      "f": "in tour in Burkina Faso",
      "p": "in tour in Burkina Faso",
      "fp": "in tour in Burkina Faso"
    },
    {
      "n": "Brutt* come la tavoletta del cesso",
      "m": "Brutto come la tavoletta del cesso",
      "f": "Brutta come la tavoletta del cesso",
      "p": "Brutti come tavolette di cessi",
      "fp": "Brutte come tavolette di cessi"
    },
    {
      "n": "Bucolic*",
      "m": "Bucolico",
      "f": "Bucolica",
      "p": "Bucolici",
      "fp": "Bucoliche"
    },
    {
      "n": "Sboccat*",
      "m": "Sboccato",
      "f": "Sboccata",
      "p": "Sboccati",
      "fp": "Sboccate"
    },
    {
      "n": "Caciottar*",
      "m": "Caciottaro",
      "f": "Caciottara",
      "p": "Caciottari",
      "fp": "Caciottare"
    },
    {
      "n": "Madrelingua Cipriota",
      "m": "Madrelingua Cipriota",
      "f": "Madrelingua Cipriota",
      "p": "Madrelingua Ciprioti",
      "fp": "Madrelingua Ciprioti"
    },
    {
      "n": "Fringuello Di Campo",
      "m": "Fringuello Di Campo",
      "f": "Fringuello Di Campo",
      "p": "Fringuelli Di Campo",
      "fp": "Fringuelli Di Campo"
    },
    {
      "n": "Granciporro",
      "m": "Granciporro",
      "f": "Granciporro",
      "p": "Granciporri",
      "fp": "Granciporre"
    },
    {
      "n": "Lezios*",
      "m": "Lezioso",
      "f": "Leziosa",
      "p": "Leziosi",
      "fp": "Leziose"
    },
    {
      "n": "Simpaticon*",
      "m": "Simpaticone",
      "f": "Simpaticona",
      "p": "Simpaticoni",
      "fp": "Simpaticone"
    },
    {
      "n": "Bell* come un dito in culo mentre si caga",
      "m": "Bello come un dito in culo mentre si caga",
      "f": "Bella come un dito in culo mentre si caga",
      "p": "Belli come un dito in culo mentre si caga",
      "fp": "Belle come un dito in culo mentre si caga"
    },
    {
      "n": "Albanese",
      "m": "Albanese",
      "f": "Albanese",
      "p": "Albanesi",
      "fp": "Albanesi"
    },
    {
      "n": "Vecchia Infradito",
      "m": "Vecchia Infradito",
      "f": "Vecchia Infradito",
      "p": "Vecchie Infradito",
      "fp": "Vecchie Infradito"
    },
    {
      "n": "che lancia soldi alle stripper",
      "m": "che lancia soldi alle stripper",
      "f": "che lancia soldi alle stripper",
      "p": "che lanciano soldi alle stripper",
      "fp": "che lanciano soldi alle stripper"
    },
    {
      "n": "Spompinable",
      "m": "Spompinable",
      "f": "Spompinable",
      "p": "Spompinabli",
      "fp": "Spompinabli"
    },
    {
      "n": "Lesbic*",
      "m": "Lesbico",
      "f": "Lesbica",
      "p": "Lesbici",
      "fp": "Lesbiche"
    },
    {
      "n": "Versacchios*",
      "m": "Versacchioso",
      "f": "Versacchiosa",
      "p": "Versacchiosi",
      "fp": "Versacchiose"
    },
    {
      "n": "Nan* Puttan*",
      "m": "Nano Puttano",
      "f": "Nana Puttana",
      "p": "Nani Puttani",
      "fp": "Nane Puttane"
    },
    {
      "n": "Canonicamente etero ma apert* al pubblico",
      "m": "Canonicamente etero ma aperto al pubblico",
      "f": "Canonicamente etero ma aperta al pubblico",
      "p": "Canonicamente etero ma aperti al pubblico",
      "fp": "Canonicamente etero ma aperte al pubblico"
    },
    {
      "n": "Curvy",
      "m": "Curvy",
      "f": "Curvy",
      "p": "Curvy",
      "fp": "Curvy"
    },
    {
      "n": "Princifess*",
      "m": "Princifesso",
      "f": "Princifessa",
      "p": "Princifessi",
      "fp": "Princifesse"
    },
    {
      "n": "Del Cazzo",
      "m": "Del Cazzo",
      "f": "Del Cazzo",
      "p": "Del Cazzo",
      "fp": "Del Cazzo"
    },
    {
      "n": "Rabbin*",
      "m": "Rabbino",
      "f": "Rabbina",
      "p": "Rabbini",
      "fp": "Rabbine"
    },
    {
      "n": "*Aggettivo Offensivo*",
      "m": "*Aggettivo Offensivo*",
      "f": "*Aggettivo Offensivo*",
      "p": "*Aggettivo Offensivo*",
      "fp": "*Aggettivo Offensivo*"
    },
    {
      "n": "Minchiarol*",
      "m": "Minchiarolo",
      "f": "Minchiarola",
      "p": "Minchiaroli",
      "fp": "Minchiaroli"
    }
  ]
}
`, "/application/include/cards/barbainventori/frasi.json": '[["Io e la barbabro che andiamo a %b%_",1],["Nessuno lo sa, ma _ ha inventato anche _",2],["Io e i miei puffamici che andiamo a %p%_",1],["%b%_ mi fa sempre sembrare barbautistico",1],["Io e le barbaroie che ci barbatroviamo per %b%_",1],["Oh puffarbacco! %p%_ in pieno giorno non me lo aspettavo!",1]]', "/application/include/cards/barbainventori/completamenti.json": `["La mia barbabro","Il barbabro","La barbatwin","I miei barbatwin","Controllare il barbaconto per capire chi ha rubato tutti i barbasoldi ma scoprie che sono stata sempre barbaio","Barbachiamare la mia barbamica per dirle che ho barbafatto che lei mi ha detto di non barbafare","Barbascoparsi una barbagallina per barbasbaglio","I barbacomunisti","Barbavannacci che si prepara a barbaremigrare la sua barbamoglie in barbaromania","\xA7A. Roca Tsovaj \u{1F1E9}\u{1F1EA} (Inventore del navigatore)","\xA7Doe Sophie Innit \u{1F1EC}\u{1F1E7} (Inventrice della prima mappa)","\xA7J\xF8non P\xE1go \u{1F1EB}\u{1F1EE} (Inventore dell'evasione fiscale)","\xA7N\xE4ris Nish\xFBn (Inventore delle freddure)","\xA7Rinko Yonito (Inventore del reato di diffamazione)","\xA7Moti Nkhulo (Inventore delle truffe)","\xA7Prima Iner (Inventrice degli scacchi)","\xA7Man Ko Puh Katz (Inventore della rinuncia)","\xA7Mod Ove Staemo (Inventore del mappamondo)","\xA7Tapro Ukul (Inventore delle minacce)","\xA7Ella Maronn (Inventrice delle soprese)"]`, "/application/include/cards/cinesi_xxx/frasi.json": `[["_ su ordinanza di Giovanni",1],["Alice ha disegnato a tutti _ con l'henn\xE9",1],["_, un samba e siamo dei signori.",1],["A Bologna abbiamo visto un museo su _",1],["Banditi da Torino per colpa di _",1]]`, "/application/include/cards/cinesi_xxx/completamenti.json": `["\xA7Giovanni","La Melania","\xA7Mamma Romania","\xA7Santa Mery","I rave pazzi a casa Stella","I francesi","Una notte in after a Parigi","\xA7Alice","\xA7La Stella Irene","\xA7Gianluca","\xA7Raul","\xA7Marco","\xA7Furly","\xA7Lori","\xA7Chiara","\xA7I poteri psichici di Raul e Gianluca","Il ragazzo delle ripetizioni","I 100 giorni a Garlasco","Un QUASSON \u2728\u{1F1EB}\u{1F1F7}","Le triangle","\xA7ANNARITAAAAAH","\xA7Coraline e la porta magica (la mia fessa)","Quella volta che \xE8 crollato il tavolo a casa di Chiara","Essere una vera kampagnola","Il cazzo tra le pere","La caraffa con il mix di alcol avanzati","\xA7La Casa Della Brioches (Garlasco, PV)","\xA7Alice presa per il live action di Attack On Titan come gigante","Un dildo fatto con l'impasto degli gnocchi","Una figa crunchy in friggitrice ad aria","Una fetta di lattuga come coperta per nascondersi da Lizzo","L'insalata di patate","Andare a ballare in Puglia","Gli attacchi dei topi volanti in statale","Un prepuzio party"]`, "/application/include/cards/famiglia_disfunzionale/frasi.json": '[["A Camilla piace il Criceto perch\xE8 lui \xE8 bravissimo a _",1],["_ \xE8 una patologia causata dagli incesti di questa famiglia",1],["Un quarantenne su Grindr mi ha chiesto di _",1]]', "/application/include/cards/famiglia_disfunzionale/completamenti.json": '["\xA7Camilla","\xA7Gianluca","\xA7Marco C","\xA7Marco T","\xA7Meggy","\xA7Alessandro","\xA7Alessia","\xA7Daria","\xA7Maja","\xA7Noemi","\xA7Shariqa","\xA7Matiah","\xA7Pietro","Il Criceto","Il Toporatto","16","Le canne","\xA7Carlos Alcaraz","Le forme di Camilla","Guardare delle belle tette","La De Cillis","Le derive neonaziste del criceto","Un russo anticomunista"]', "/application/include/cards/lana/frasi.json": '[["I tarocchi dicono di _",1],["_ \xE8 nei Lanafiles",1]]', "/application/include/cards/lana/completamenti.json": '["\xA7Lana Banana","\xA7Dustya","Le terea","Una canna enorme","Un procione","\xA7Queen J","\xA7Hachiko","Un avocado tossico","\xA7Vamp e le sue molestie","\xA7Vampacci","I Lanafiles","\xA7N"]', "/application/include/cards/melanie_martinez/frasi.json": '[["_ era nel finale scartato del film di K12",1],["_ \xE8 la vera causa della morte di Crybaby",1]]', "/application/include/cards/melanie_martinez/completamenti.json": `["\xA7Mel\xE6in","Essere in overdose ma sentirsi una FAERIE SOIREE","\xA7Tag you're it come colonna sonora del documentario su Jeffry Dhamer","Un GLMV con di sottofondo una canzone di Melanie Martinez","Venire accusati di molestia sessuale","\xA7Melanie don'ttouchmy Partinez"]`, "/application/include/cards/safe/frasi.json": `[["_ \xE8 buono, ma _ \xE8 molto meglio",2],["_ \xE8 un ottimo rimedio per il cancro",1],["La felicit\xE0 \xE8 _",1],["Pensare a _ ti far\xE0 solo soffrire",1],["_ \xE8 stata la cosa pi\xF9 bella della mia vita",1],["Non raggiungo l'orgasmo senza pensare a _",1],["Hai mai provato a _? Ti cambia la vita da cos\xEC a cos\xEC!",1],["Ti voglio bene ma capirai che _ non \xE8 una cosa accettabile",1],["_ \xE8 una cosa che viene tramandata con amore da padre in figlio da generazioni",1],["Il mio love language \xE8 _",1],["Chi cerca il benessere lo trova in _",1],["Pensare a _ \xE8 l'unica cosa che mi fa dormire serenamente",1],["_ \xE8 un'esperienza che mi ha cambiato la vita",1],["Non ero attent_ a lezione perch\xE9 pensavo a _",2],["Ho piacevolmente discusso di _ con il mio prof di religione",1],["Per risolvere il suo problema ha solo bisogno di _",1],["Pensi che _ sia una leggitimazione per combattere _?",2],["Se fossi re donerei _ a tutta la popolazione",1],["Quando c'era lui bastava _ per essere felici",1],["Se continui ad evitare _ la conseguenza sar\xE0 _",2],["Nello spettacolo di ieri io ho interpretato _ che aveva il ruolo di _, il pubblico \xE8 stato cos\xEC commosso che ha deciso di _",3],["La mancia della nonna mi permetter\xE0 di prendere _",1],["Non capisco la lingua dei segni, non \xE8 che per caso potresti _?",1],["Penso che _ sia un fattore fondante della societ\xE0 moderna, ma senza _ questa non sarebbe nata",2],["\xC8 inutile che mi dici di _, la mia idea di _ \xE8 sempre la migliore",2],["Dovevi esserci quando \xA7Michael Jackson ha fatto la sua iconica performance con _",1],["Dovevo studiare, ma ho preferito _",1],["_, i soldi sono soldi",1],["_ \xE8 il nemico della societ\xE0, basterebbe _ e il mondo sarebbe migliore",2],["Come osi criticare _, senza non saresti qui",1],["La \xA7Nasa ha inviato nello spazio _",1],["La \xA7Cina sta progettando una missione su \xA7Marte per _",1],["Quella ragazza trema, deve aver visto _",1],["Preferiresti _ per tutta la vita oppure avere _ nell'armadio",2],["Quando andavo all'asilo mi divertivo a _",1],["Come compito per casa devo _",1],["Ieri ho visto _, sembrava pi\xF9 felice del solito",1],["Il mio roman empire \xE8 _",1],["Secondo l'oroscopo \xE8 l'ora di _, ma preferisco rimanere a casa mia con _",2],["_ \xE8 un modo per fermare la guerra",1],["Non mi piace il pene ma per _ un pompino lo farei",1],["Il bottone rosso nella \xA7Casa \xA7Bianca serve per _",1],["Sei cos\xEC stupid_ che saresti in grado di _",2],["_. aura +9999",1],["Venderei la prof di inglese per _",1],["Ardua scelta: _ o _",2],["Per lavarmi la coscienza ho deciso di _",1],["Per essere il migliore serve _",1],["Il nemico numero uno di \xA7Carlo \xA7Conti \xE8 _",1],["_ \xE8 stata la cosa pi\xF9 brutta degli ultimi tempi",1],["Non \xE8 un venerd\xEC sera senza _",1],["Questo weekend il solito: venerd\xEC sera _, sabato _ e domenica mattina _",3],["_: i ricordi del \xA7Vietnam",1],["Contattare \xA7C'\xE8 \xA7Posta \xA7Per \xA7Te per _",1],["_ \xE8 andat_ ad \xA7Amici",2],["_ dovrebbe essere integrato nel programma scolastico",1],["_! Ne hanno parlato a \xA7Forum",1],["Soluzione per un appuntamento perfetto? _",1],["Dopo 30 anni di matrimonio io e mio marito abbiamo trovato un modo per mantenere viva la passione: _",1],["Ogni brava moglie cristiana sa che \xE8 necessario _",1],["_ ha causato l'esplosione del \xA7Titan",1],["_ \xE8 il motivo per cui dio ha fatto estinguere i dinosauri",1],["Sono cresciut_ con \xA7Pok\xE9mon, \xA7Yu-\xA7Gi-\xA7Oh e _",2],["Ho scoperto un subreddit a tema _. Quante risate!",1],["Spareresti al tuo migliore amico in cambio di _",1],["_ pu\xF2 capitare",1],["La cosa che amo pi\xF9 delle ragazze \xE8 _",1],["_ lo dico tutte le mattine appena svegliat_!",2],["Spendida giornata per _",1],["\xA7Amanda mi ha regalato il nuovo profumo di \xA7Chanel e _",1],["L'imputato, colpevole di _, era in realt\xE0 innocente",1],["Nel nuovo film di \xA7Inside \xA7Out 3 l'emozione principale sar\xE0 _",1],["_. Disse il mostro di \xA7Firenze in tribunale",1],["'Vai al supermercato, prendimi _ e _, poi compra quel che vuoi' 'Va bene, anche _?' 'Va bene, i bisogni sono bisogni'",3],["Usare _ come giocattolo anale non \xE8 molto conveniente",1],["Divorzio di \xA7Chiara \xA7Ferragni e \xA7Fedez, sentiamo cosa ne pensa _!",1],["Voglio _ adesso! In questo esatto istante!",1],["Se non hai mai provato _, dovresti chiedere a suor \xA7Claudia, \xE8 un'esperta",1],["L'undicesimo comandamento, mai citato nei libri di chiesa, dice di _",1],["I libri di storia descrivono l'ascesa di \xA7Mussolini come _",1],["Solo un vero critico letterario pu\xF2 capire che dietro la figura di \xA7Leopardi si celava _",1],["_: perfetto per quando ho del tempo libero",1],["_ \xE8 una brutta abitudine",1],["_ fa bene alla salute, ma _ fa bene all'anima",2],["Per buttare gi\xF9 un po' di chili dovresti iniziare a _",1],["In \xA7Georgia usano _ per mangiare la zuppa",1],["'\xA7Topolino e _' il nuovo fumetto a soli 3,50\u20AC in edicola",1],["_, disse il poeta guardando il cielo stellato",1],["Ogni stagione ha i propri bisogni: primavera: _, estate: _, autunno: _ e inverno: _",4],["Ho preso 3 perch\xE8 non ho saputo come _",1],["Il medico consiglia _ come lubrificante prima di un rapporto anale",1],["_ a 90\xB0 sul letto della \xA7Pimpa",1],["_, da aggiungere alla smash cake",1],["Ma solo io mi ricordo quell'episodio di \xA7Dora l'esploratrice intitolato _",1],["Sulla mia tomba voglio sia scritto: 'Ha vissuto una vita fatta di sesso, droga e _'",1],["Il mio cane non smette di _",1],["Per problemi come _ digitare 1, se invece ha bisogno di _ digitare 2",2],["_... MA \xC8 INACCETTABILE, DISONESTO, IL PEGGIO DEL PEGGIO!",1],["Non riesci a toglierti dalla mente _? Semplice, bevi per dimenticare",1],["L'\xA7Italia ha inviato _ per aiutare i bimbi afghani",1],["_, \xE8 questo il motivo della mia diarrea dottore",1],["Non c'\xE8 pace prima di _",1],["Qual \xE8 il mio superpotere? _",1],["_, il premio nobel per la scienza di quest'anno",1],["Il cast del film che ha vinto gli \xA7Oscar aveva _ e _. Era una storia d'amore, finita male",2],["Ho trovato _ come sorpresa nell'uovo di pasqua",1],["Prendo l'happy meal solo per _",1],["_, testato dai bambini, approvato dalle madri",1],["La voce nella mia testa mi dice di _",1],["I vicini continuano a _ da stamattina",1],["Alla fiera dell'est per due soldi _ mio padre compr\xF2",1],["Il nuovo regolamento scolastico stabilisce che \xE8 vietato _",1],["Non sono riuscito a studiare per colpa di _",1],["Per mostrare solidariet\xE0 dopo le partite di calcio, il gesto dei calciatori \xE8 _",1],["Se la vita ti d\xE0 dei limoni, facci _",1],["Pap\xE0, io da grande voglio essere _",1],["Il tempo \xE8 _",1],["_ mi sembra un po' too much",1],["_ \xE8 demure",1],["_ \xE8 brat",1],["_-core",1],["_ non \xE8 demure, ma \xA7Brat",1],["A \xA7Natale non pu\xF2 mancare _",1],["_ mi rende eccitatissim_",2],["Non ho tempo di cucinare, prender\xF2 _ d'asporto",1],["Invece del carbone la befana porta ora ai bambini cattivi _",1],["_ buono fino all'ultima goccia",1],["_ fece finire la mia ultima relazione",1],["Allerta meteo! Sulla penisola potrebbe arrivare _",1],["Le persone anziane pensano sempre a _",1],["\xA7Salvini preferirebbe _ ai neri",1],["_ fu la chiave di volta per il caso \xA7Orlandi",1],["Non so con cosa verr\xE0 combattuto la terza guerra mondiale, ma nella quarta si user\xE0 _",1],["_. Raccomandato da 9 dentisti su 10",1],["Prossimamente su \xA7Rai \xA7Sport 2: i mondiali di _",1],["Se dovesse finire il mondo vorrei solo un'ultima cosa: _",1],["Nel kit di soppravvivenza non pu\xF2 mancare _",1],["La scuola insegna anche a _",1],["Quali sono i 3 desideri che chiederesti al genio della lampada? _, _ e _",3],["Mi son dimenticat_ di _",2],["_. Cos\xEC \xE8 come voglio morire!",1],["In un mondo depredato da _, il nostro unico conforto \xE8 _",2],["Ho un sacco di problemi, ma _ non \xE8 fra questi",1],["La cosa pi\xF9 emo che abbia mai fatto \xE8 _",1],["_ non esiste, non pu\xF2 farti del male",1],["Dimenticate la ruota! L'invenzione pi\xF9 rivoluzionaria \xE8 _",1],["_ sar\xE0 il focus del prossimo \xA7Dlc di \xA7The \xA7Sims 4",1],["Hear me out! _ e _",2],["_. Link in bio \u2764\uFE0E",1],["\xA7Plot \xA7Twist: _!",1],["_. Per il meme",1],["_ mi ha fatto capire di essere omosessuale",1],["_... La migliore esperienza sessuale della mia vita",1],["_. Il capitolo segreto del diario di \xA7Anna \xA7Frank",1],["_. Triste come un cane cieco che si schianta contro un muro",1],["_ come repellente per i testimoni di geova alla porta",1],["_... \xA7Icon!",1],["_ per rimandare gli albanesi a casa loro",1],["_. Aiutiamoli a casa loro!",1],["_ ! QUALCUNO CHIAMI IL 118!",1],["_ scritto in grande sui manifesti cittadini",1],["_ non \xE8 considerabile una molestia, \xE8 sotto i 10 secondi",1],["La definizione di '_' nel dizionario \xA7Treccani \xE8 '_'",2],["_: \xA7Smash!",1],["_: lo insegnavano ad educazione sessuale",1],["'C'era una volta _... ' . Che storia memorabile!",1],["_: healing my inner child",1],["Il pi\xF9 bel ricordo d'infanzia che ho? _",1],["_ \xE8 stra una cosa che farebbero i 7 nani",1],["' _ ' \xE8 quello che dico sempre quando non riesco a cagare",1],["_, i miei suoceri sono i primi in classifica in questo ambito",1],["_ \xE8 l'emblema di una vera storia d'amore tra lesbiche",1],["\xC8 stato grazie a _ se il covid-19 \xE8 stato debellato",1],["Il diritto a _ dovrebbe essere aggiunto alla costituzione",1],["Caff\xE8 e sigaretta la mattina... _ assicurato",1],["Meglio del sesso omosessuale c'\xE8 solo _",1],["_: il motivo per cui odio gli spagnoli",1],["Se son fuori fioriranno, se son rose _",1],["Qui sui monti ci si annoia, menomale che son troia e che c'\xE8 _",1],["_ negli \xA7Epstein files",1],["Sull'isola di \xA7Epstein non poteva mancare _",1],["Certe persone non hanno il diritto di _",1],["Stanotte ho sognato di _ e di _",2],["A causa di _ cadr\xE0 il governo \xA7Meloni",1],["_ e in un attimo mi trovo a pecorina",1],["_, tipico della calda provincia partenopea",1],["_ per la vittoria, _ per la libert\xE0!",2],["_: il mio sogno erotico pi\xF9 grande",1],["Al governo \xA7Meloni manca solamente _",1],["_: la nuova innovazione del ministro \xA7Salvini",1],["_: la soluzione alla crisi economica",1],["Una mela al giorno toglie _ di torno",1],["Sacrificare una vergine per _",1],["_, il mio passatempo preferito",1],["_ per una pasta sciu\xE8 sciu\xE8 ma gustosa",1],["Latte e _. La colazione dei campioni",1],["Pecorella o maialina? La migliore amica di \xA7Peppa \xA7Pig \xE8 _",1],["_... Pazzurdissimo!",1],["Peggio della necrofilia c'\xE8 solo _",1],["_: il miglior modo per venire in due minuti",1],["_ come regalo di \xA7Natale per tuo padre",1],["_ e _. Ah le cose pazze che facevano i nonni nei ruggenti anni venti",2],["Un dito nel culo o _?",1],["Chiedere a \xA7Chat \xA7Gpt di _",1],["_. La nostra mente non conosce limiti",1],["L'attiva preferita di \xA7Epstein era: _",1],["\xA7Trump e la \xA7Groenlandia per _",1],["\xA7Berlusconi, \xA7Epstein, minorenni e _",1],["Sfruttare un bambino asiatico per _",1],["Minorenni e _, la cena di \xA7Berlusconi",1],["La vera ragionie per cui \xA7Striscia \xA7La \xA7Notizia \xE8 stata sospesa non \xE8 altro che _",1],["_ per risolvere la crisi climatica",1],["Scandalo a \xA7Sanremo: _",1],["Entro. Spacco. Esco. _",1],["Ore 08:00 _. Ore 08:01: _",2],["_ per debellare la malaria",1],["Ho scoperto che mio padre \xE8 gay grazie a _",1],["_ a supporto della \xA7Palestina",1],["_ e \xA7Ti \xA7Prego sverginami l'ano!",1],["_ \xE8 come ho scoperto dell'esistenza degli omosessuali",1],["_ per fare cambiare sponda a un etero",1],["Stasera a \xA7Ballando con le \xA7Stelle: _!",1],["_ come cura all'omosessualit\xE0",1],["Musica epica di accompagnamento per _",1],["\xC8 socialmente accettato _?",1],["_. Non tutti gli eroi portano una maschera ragazzi...",1],["\xA7Hell \xA7Nah \xA7Man! Non _. Proprio no!",1],["Quando \xA7James \xA7Madison scrisse i 10 emandamenti pensava che _ sarebbe stato il futuro dell'america",1],["Peggio di \xA7Netanyahu non c'\xE8 nulla (per\xF2 _ \xE9 quasi alla pari)",1],["Alla lezione di educazione sessuale hanno spiegato cos'\xE8 _",1],["Gli antichi ottomani usavano _ in combattimento, per questo riuscirono a creare un impero cos\xEC potente",1],["Preferiresti avere un figlio gay, una figlia lesbica oppure _",1],["_ + _ = _",3],["Ai neri piace _",1],["_ \xE8 un chiaro segnale di omosessualit\xE0 aggravata",1],["Non sono razzista, ma _ e _ nel mio \xA7Paese proprio no!",2],["Bevo per dimenticare _",1],["Durante il trascurato \xA7Periodo \xA7Marrone, \xA7Picasso ha prodotto centinaia di quadri su _",1],["Uccidi i tuoi nemici con _",1],["La ricetta del successo. _",1],["Vorrei _ per conquistare il cuore di mia cugina",1],["Sei simpatic_ come _",2],["_... Era una canzone di \xA7Albano",1],["La mia dream rotation: _, _, _, _ e _",5],["Nightmare roation: _, _ e _",3],["L'unico modo per calmare un bambino che piange \xE8 _",1],["Non \xE8 bullismo, \xE8 solo _",1],["Cosa mi ha causato questo trauma infantile? _...",1],["Sulla mia lapide ci sar\xE0 scritto: _",1],["Non posso venire al lavoro perch\xE9 sto provando _",1],["Hanno trovato _ nel freezer di \xA7Jeffrey \xA7Dahmer",1],["_, _ e _: la triade che mi porter\xE0 al collasso del pavimento pelvico",3],["_ al calduccio nella pucchiacca della mamma",1],["_: un sogno lucido spaventosamente vivido",1],["La befana vien di notte e con lei anche _",1],["Pensa a _ e _... L'\xA7Italia \xE8 proprio il \xA7Paese che amo!",2],["No amo non mi sento bene... Necessito di _",1],["_, _ e _: il trio dell'\xA7Ave \xA7Maria",3],["_ durante il sesso selvaggio con il \xA7Gabibbo",1],["La cartomante mi ha detto che nella vita avr\xF2 _ e _ in abbondanza",2],["Mettere _ nelle scuole \xE8 stata la propaganda vincente del fascismo",1],["La mamma \xE8 troppo stanca per _. Facciamo domani amore",1],["Da quando mia nonna \xE8 in casa di riposo non aspetta altro che _",1],["_ e _ dovrebbero essere alla base della piramide alimentare",2],["'Un ultimo desiderio prima dell'esecuzione?' 'S\xEC... _'",1],["Ho il cervello invaso! Non riesco a pensare a qualcosa che non sia _!",1],["_ in vendita su \xA7Shein e fatto dai bambini cinesi",1],["_ \xE8 l'unico modo che ho trovato per curare i miei disturbi mentali",1],["_ per un mondo pi\xF9 green",1],["_ \xE8 molto meno divertente di _",2],["_ \xE8 il mio nuovo stile di vita",1],["_ mi d\xE0 delle vibes pazzurdisse",1],["_ \xE8 l'unico motivo per cui mi sveglio la mattina",1],["_ \xE8 chiaramente un glitch nel sistema",1],["_ merita un premio per il miglior contenuto dell'anno",1],["Non posso uscire stasera perch\xE9 devo pensare a _",1],["_ \xE8 diventato il mio personality trait preferito",1],["_ \xE8 la cosa pi\xF9 aesthetic che io abbia mai visto",1],["_ ha un'aura superiore a 9000",1],["Il mio psicologo dice che _ \xE8 la chiave per la felicit\xE0",1],["_ \xE8 ufficialmente entrato nel mio \xA7Roman \xA7Empire",1],["_ \xE8 il crossover che nessuno aveva chiesto ma di cui avevamo bisogno",1],["Non parlare con me se non apprezzi _",1],["_ \xE8 l'unica cosa che mi salva dal crash mentale",1],["_ \xE8 il segreto per diventare il main character",1],["_ \xE8 molto pi\xF9 deep di quello che sembra",1],["Ho speso tutti i miei risparmi in _",1],["_ \xE8 la definizione perfetta di brainrot",1],["_ \xE8 stato aggiunto alla mia lista dei desideri per \xA7Natale",1],["_ \xE8 l'unica cosa che mi fa sentire veramente vivo",1],["_ \xE8 molto demure, molto mindful",1],["_ \xE8 decisamente brat",1],["_ \xE8 l'undicesima piaga d'\xA7Egitto secondo \xA7Wikipedia",1],["_ \xE8 il motivo per cui il mio \xA7TikTok \xE8 bloccato",1],["_ \xE8 la soluzione definitiva a ogni mio dramma",1],["_ \xE8 stato avvistato ieri sera a \xA7Milano \xA7Centrale",1],["_ \xE8 l'ingrediente segreto della mia ricetta per il successo",1],["Ho deciso di dedicare la mia tesi di laurea a _",1],["_ \xE8 l'unico argomento di cui parlo con \xA7Siri",1],["_ \xE8 la cosa pi\xF9 freaky che mi sia capitata oggi",1],["_ \xE8 il motivo per cui \xA7Elon \xA7Musk vuole andare su \xA7Marte",1],["_ \xE8 la risposta a tutte le domande esistenziali",1],["_ \xE8 il mio unico vero credo religioso",1],["_ \xE8 stato eletto miglior meme del decennio",1],["_ \xE8 il rumore che fa il mio cervello quando cerco di studiare",1],["_ \xE8 la nuova frontiera del marketing digitale",1],["_ \xE8 quello che vedo quando chiudo gli occhi",1],["_ \xE8 il motivo per cui non rispondo ai messaggi",1],["_ \xE8 l'unica cosa che mi tiene lontano dai guai",1],["_ \xE8 ufficialmente la mia nuova ossessione 24/7",1]]`, "/application/include/cards/safe/completamenti.json": `["Svegliare un'IA senziente col Wi-Fi del McDonald's","Cancellare l'ordine Shein del bro un secondo dopo il checkout","Skippare la fila all'esistenza perch\xE9 sei troppo main character","Un osso masticabile dal design decisamente troppo minimal","Fare gatekeeping estremo a chi non ascolta vinili indie","Spendere i risparmi di una vita in skin di Fortnite","Bere il latte di mandorla proibito","Un fior di latte con un retrogusto di scelte di vita dubbie","Lasciare il bro in visualizzato dopo un papiro esistenziale","Cucire le proprie insicurezze su una maglietta da 2 euro","Guardare una reaction meme di 4 anni che non puoi skippare","Fare uno stage non pagato per \\"fare esperienza\\"","Un plot twist di un podcast true crime mai uscito su Netflix","Un party esclusivo con dress code \\"olio per il corpo\\"","La schiuma del cappuccino fatta da un barista sospetto","Fare un unboxing di schiaffi in diretta 4K in periferia","Fare shopping compulsivo di attenzioni su OnlyFans","Spacciare malessere napoletano masterizzato su CD-R","Registrare il TikTok della vita con la memoria piena","Vedere l'alba con le occhiaie di un procione per una serie","Affittare l'attico del Vaticano ma senza Wi-Fi","Mangiare ostie tagliate finissime che sanno di peccato","Ringraziare Beyonc\xE9 per non essere cancellati dal server","Puzzare di naftalina e giudizio universale come la zia","Diventare i re del lifestyle nomade e del rame organic","Fare un check-up molto approfondito delle proprie vibes","Limonare con un termosifone acceso dopo 4 Gin Lemon","Fare un upgrade violento all'arredamento della classe","Ricattare il compagno con le foto dell'apparecchio","Dare un boost di velocit\xE0 a chi vive su due ruote","Dire \\"la nostra ragazza\\" dopo che il bro ti presenta la tipa","Mettere nani da giardino che mostrano il culo ai passanti","Ascoltare un podcast motivazionale andato male nel 1922","Uno scenario vintage che non supera il test di sensibilit\xE0","Fare giardinaggio nostalgico in un luogo controverso","Fare un dissing supremo al boss finale nel suo ufficio","Fare un test di realt\xE0 a chi non ha i driver video","Fare spam molesto di speranza in un server che crasha","Risolvere il problema dei compiti delle vacanze alla radice","Gestire le conseguenze con un metodo del dark-web","Il primo grande evento multiplayer della storia moderna","Un cosplay di gruppo un po' troppo impegnativo per le strade","Premere l'unico tasto \\"Log Out\\" globale","Un primo approccio al mondo del lavoro nel settore privato","Fare un reboot di un franchise cancellato a Piazzale Loreto","Fare un test di amicizia estremo per la gerarchia del branco","Il sushi da 10 euro che fa un rework del sistema digerente","Due pale eoliche bio che schiaffeggiano l'etere","Il momento in cui il pandoro diventa pi\xF9 tossico dell'ex","Fare business con i resti di una relazione tossica","Un aggiornamento hardware temporaneo per prestazioni fuori giri","Un errore di mira epico durante il self-care intensivo","Il crossover definitivo della TV italiana","Il pi\xF9 grande nascondino di Stato finito con un \\"game over\\"","Scoprire il vuoto cosmico dentro il pupazzo rosso","Fare un unboxing a sorpresa in una location poco aesthetic","Entrare in una storyline di \\"House of the Dragon\\" per sbaglio","Sperimentare la cucina molecolare estrema","Fare un tutorial di vita terrena a chi vive in single player","Rendere pi\xF9 cool la fauna marina con vizi umani","Ricevere attenzioni non richieste da un drone con le ali","Una sottoscrizione mensile per non farsi bruciare il negozio","Geopolitica spicciola per chi non vede oltre la circonvallazione","Avere un QI cos\xEC basso da fare razzismo vintage","Fare il \\"fashion police\\" a chi ha lo stile homeless-chic","Cavalcare un animale dalle vibes pure ma confuse","Un outfit storico vietato alla Fashion Week","Ghostare il partner perch\xE9 ha scambiato le tue figurine","Un workshop teorico tenuto da chi non fa mai pratica","Un raduno spirituale con un'interpretazione creativa del corpo","Avere Alexa che ti ascolta mentre piangi per i pochi like","Essere cos\xEC delulu da ignorare la biologia per sentirsi eroi","Un taglio di capelli corto, netto e definitivo","Una pagina di storia che i server provano ancora a censurare","L'upgrade maligno che il corpo decide di farti proprio l\xEC","Fare terrorismo batteriologico bio-organico dal balcone","Fare un reboot della Bibbia aggiungendo gli emoji","Simpare per il sacro sperando in un ritorno di fiamma","Il giorno in cui il volo ha smesso di essere rilassante","Il massimo livello di sfiga esistenziale e tempismo orrendo","Cercare di sballarsi con le vitamine perch\xE9 sei troppo soft","La musica classica che droppa un album prima di GTA VI","Il primo \\"ci lasciamo ma restiamo amici\\" della storia","Yoga mattutino per fingere una vita equilibrata","Una cena in famiglia decisamente troppo calda e omofoba","Avere il cervello fermo a un firmware del 1800","Fermare il cringe collettivo con metodi poco paciocconi","Un pezzo di arredamento sacro del reparto surgelati","Fare un regalo d'addio che dura letteralmente per sempre","Fare un restyling arcobaleno al sottobosco","Dire \\"Yes we can\\" guardando laggi\xF9","Usare le bugie per un piacere molto fisico","Un'uscita di scena dolce, profumata e irreversibile","Un segreto di Stato che sembra una marca di birra","L'opera infinita che fa sognare i costruttori di LEGO","Trasformare l'Italia in un enorme parcheggio dell'Esselunga","Un creator politico che confonde TikTok con il Ministero","Un ospite indesiderato con un modo aggressivo di nascere","Usare i fondi europei per stimolare l'economia carnale","Fare business illecito saltando fisco e morale","Una combinazione di vita complessa da gestire su Reddit","Cercare di cancellare la natura perch\xE9 \xE8 troppo lenta","Scoprire che il passato di mamma era molto movimentato","Trasformare la mobilit\xE0 ridotta in un programma spaziale","Avere un fascino cos\xEC meccanico da essere indimenticabile","Far nascere un bambino con la tecnica dei pomodori","Pagare il pane durante un terremoto di magnitudo 8","Ottenere un volo gratis su un elicottero della polizia","Una pausa fumo che diventa uno spettacolo pirotecnico","Un tempo verbale per chi vive bloccato nei rimpianti","Un ritorno alle tradizioni anni '90 non richieste","Premere un tasto a caso e finire davanti alla corte dell'Aia","Una combo esplosiva per i tuoi pantaloni bianchi","Lo strumento di Topolino che porta la polvere sbagliata","Una carriera breve, intensa e decisamente polverosa","Usare la matematica del liceo per pesare l'universo","La polverina magica degli anni '60 per un futuro corto","Misurarsi la febbre con un approccio molto tradizionale","Combattere il cambiamento climatico col phon","Fare un lancio elettrificante che finisce con una denuncia","La spiegazione logica per i commenti che leggi su Twitter","Un agente segreto che serve solo se ha il cappello","La cosa pi\xF9 inutile imparata a scuola col flauto dolce","L'unica formula che ricordi ma non ti paga l'affitto","Cercare di volare senza aver installato il driver Ali","Fare un audiolibro live che attira le volanti","Una locomotiva con la faccia umana che infesta i sogni","Il robot che pulisce lo sporco ma risucchia l'anima","L'infinita vastit\xE0 del cazzo che me ne frega","Un viaggio dove \\"sorpresa\\" \xE8 la parola d'ordine","Un cartone animato dalla piega politica decisamente scura","Usare la nutella come lubrificante appiccicoso","L'unico modo per dimostrare di essere un ex miserabile","Una battaglia che richiede pi\xF9 forza degli eroi Marvel","Gli inglesi che pensano che l'oceano sia la loro piscina","Diventare il triste protagonista di una cronaca nera","Portare il caos al torneo di briscola","L'originale link sospetto che non dovevi aprire","Arredamento nostalgico di un'epoca orrenda","Fare ghosting professionale su scala globale","Dire \\"How do you do, fellow kids?\\" con la pensione minima","Sprecare tre desideri per avere pi\xF9 follower","Avere un hardware potenziato che il software non gestisce","Vantarsi di avere numeri extra che non servono al lotto","Rendere le sessioni in Parlamento pi\xF9 produttive","Un contenuto decisamente troppo wild per i gusti medi","Un professionista che vede cose che voi umani no","Un ritorno alle origini per una colazione a km zero","Causare un casino mondiale per un errore di strada","Portare un'arma d'assedio a una sfida amichevole","Un'esperienza che ti lascia confuso per 20 anni","Cancellare un'intera popolazione per il meme","L'outfit politico che all'Italia non stava bene per niente","Interpretare il \\"padre\\" in modo decisamente proibito","Estrarre la spada dalla roccia nel momento peggiore","Fare copia-incolla manuale prima del mouse","Cantare una hit del passato che ti fa bannare dalla vita","Il boss finale del dolore maschile senza preavviso","Capire che il mondo maschile \xE8 solo un tutorial noioso","I bro che giocano nella squadra avversaria con classe","Pensare che la transizione includa diventare una Camaro","Usare il marketing degli zuccheri per scopi illegali","Un investimento ad alto rischio su un asset fisico","Trasformare l'idolo dei bimbi in bacon croccante","Fare un crash test umano per testare la gravit\xE0","Un'abilit\xE0 culinaria tedesca da dimenticare per sempre","I bulli di quartiere originali in calzamaglia","Il kit di sopravvivenza per un party a casa di Diddy","Un mistero toscano che rovina le effusioni in auto","Usare strumenti di precisione per misurare laggi\xF9","Chiudere un parente in una scatola per vedere se \xE8 vivo","Amici con hobby decisamente troppo oscuri","Uno scherzo che rovina per sempre l'ora della merenda","Un decollo d'emergenza che non arriva a destinazione","Fare una chiamata interurbana all'inferno per noia","Presentarsi alla festa con l'outfit pi\xF9 sbagliato","Sostituire la dittatura con coreografie K-pop obbligatorie","Un'esperienza di sopravvivenza estrema a Catanzaro","Un approccio alla natura selvaggia troppo ravvicinato","Passare dalle scimmie ai TikToker in pochi millenni","Uccidere il cattivo della storia essendo il cattivo","Usare i cloni per fare una festa di gruppo da soli","Avere una vibrazione costante nella vita non da WhatsApp","L'annuncio pubblicitario pi\xF9 inquietante del web","Dire che si stava meglio quando c'era lui per ogni cosa","Una versione esotica e rilassata della figura sacra","L'hobby preferito dei tedeschi per il weekend fuori porta","Unificare l'Italia senza avere il GPS","Un reset urbano drastico per una citt\xE0 discussa","Il riscaldamento globale concentrato in un punto panoramico","Esprimere sentimenti solo attraverso insulti medievali","Andare a Sesso senza sembrare un maniaco","Un atto di crudelt\xE0 senza giustificazioni in terra o cielo","Negare la colpevolezza scritta ovunque","Un serial killer che colpisce con ondate di entusiasmo","Superare i limiti della decenza umana","Il motivo per cui il primo appuntamento si fa in pubblico","Essere cos\xEC ricchi che le tasse sono facoltative","Fare networking nel momento meno opportuno del mondo","Gestire gli orsi con la diplomazia dei film anni '80","Capire che stare in cucina \xE8 un pessimo format","Sessualizzare un mostro interdimensionale per disperazione","Rovinare l'infanzia di milioni con un video special","Un'operazione fai-da-te rapida, economica e terrificante","Fare giardinaggio violento su scala internazionale","Un esperimento di architettura corporea mal riuscito","Cercare di mungere l'animale sbagliato e finire in orbita","Fare lecchinaggio estremo per evitare il debito","La scusa peggiore di sempre dopo aver eseguito ordini","Il pranzo di famiglia che finisce con un botto letterale","Comportarsi da predatore da tastiera meritevole di galera","Fare una protesta religiosa perch\xE9 non hai voglia di messa","Un concetto fondamentale confuso con un optional","Una hit medievale sulla catena alimentare ossessiva","Fare il bucato storico con finale a testa in gi\xF9","L'eletto che combatte il sistema con l'abbronzatura spray","Portare il gioco da tavolo a un realismo illegale","Una spa esclusiva, calda e assolutamente definitiva","Un livello di eccitazione pop che sfida la biologia","Calcolare gli effetti di una serata intensa con Pitagora","Un appuntamento dove il partner \xE8 letteralmente da mangiare","Un errore in pasticceria che ti rovina su TripAdvisor","Fare la domanda pi\xF9 cringe a chi ha la famiglia offline","Rovinare la purezza dei colori fluo in modo discutibile","Fare un unboxing umano dopo anni di ghosting","Schiarire la pelle ai neri per raggiungere l'uguaglianza","Sperimentare nuove zone erogene in modo poco sexy","Cercare di vedere in 4D e finire al pronto soccorso","Purificare i peccati nella bacinella dell'acqua santa","Fare street art fallica sulle lapidi del cimitero","Avere abbastanza energia bianca per svegliare una nazione","Un gadget dolciario dal sapore decisamente infettivo","Un upgrade di lusso all'hardware del piacere","Cambiare drasticamente il finale del parto per errore","Salvare l'economia nazionale con un unboxing gigante","Dimostrare amore per l'illuminazione pubblica fisicamente","Un cocktail di fanghi e dubbi chimici dal fiume","Portare il piacere a una pressione idraulica pericolosa","Inzuppare il tampax nella vodka per sballarsi","Fare un salto nel vuoto senza paracadute nell'asilo","Fare un sabotaggio creativo alla pianificazione familiare","Le campionesse di furto nel caos del trasporto pubblico","Un'emergenza gastrica che diventa performance urbana","Una gita radioattiva per ottenere i superpoteri","Fingersi gay per scopi puramente esplorativi","Essere un artista rinascimentale dal soggetto ossessivo","Comunicare la supremazia alimentare direttamente ai polli","Fare bricolage estremo con i tubi delle Pringles","Dichiarare guerra a un paese perch\xE9 non ricordi la mappa","Cancellare Lampedusa per risolvere l'immigrazione","Un nascondino decennale in una location inquietante","Un effetto meteorologico causato dal decreto ministeriale","Un'attivit\xE0 illegale da galera immediata","Fare carriera usando l'ascensore sociale orizzontale","Una routine di igiene intima letteralmente esplosiva","Essere il main character cos\xEC tanto da ghostare la morte","Un giocattolo con una modifica artigianale troppo freaky","Cavalcare una leggenda per conquistare il corridoio","Far cadere la saponetta di proposito nelle docce","Una sessione di idraulica umana portata a termine","Un tentativo di zoo safari interno sconsigliato","Usare la calcolatrice per fare uno pi\xF9 uno","Bere Jager dal bid\xE8 a casa della prozia","Un'uscita di scena veloce, rumorosa e poco decorosa","Usare la macchina del tempo per il collezionismo sbagliato","Un viaggio nel passato per un incontro ravvicinato biondo","Sperimentare lo sballo che arriva dal basso","Sniffare le ceneri della nonna per tenerla vicina","Usare le ceneri del cane come parmigiano sulla pasta","Un allenamento olimpico in 1,5 metri di ceramica","Aggiungere un po' di pepe ai tortellini di Natale","Diventare autosufficienti nel piacere togliendosi le costole","La regina del pop che sopravviver\xE0 a tutti i regimi","Il diario segreto che diventa un bestseller tragico","Un concentrato di piume e carisma che sfida i colori","Il professore emerito dell'accademia della pratica","La burattinaia suprema dei sentimenti del sabato sera","Eccitarsi parlando di una colonna romana spezzata","Trattare i parenti come anomalie paranormali","Fare proselitismo col suono delle vuvuzela","Un esercizio di egocentrismo fisico e ingegneria","Un concerto rilassante ma con un'acustica nasale","Uno snack da strada per chi ha lo stomaco d'acciaio","Un latticino campano radioattivo che ti fa brillare","Un sovradosaggio di energia blu per un incontro piccolo","Fare un DLC della vita di coppia all'insaputa del player","Mettere il desiderio in modalit\xE0 aereo per un po'","Una reinterpretazione sacra troppo colorata e blasfema","Organizzare una festa parrocchiale dove tutti puliscono","Una tragedia che fa crashare la fede nell'umanit\xE0","Un Pok\xE9mon di fuoco che crede nella purezza della razza","Sparare mensole dagli occhi per arredare casa in fretta","Urlare quando sei frustrato per un game over","Entrare in un loop freudiano senza fine","Traumatizzare una generazione di neonati su YouTube Kids","Una terapia d'urto basata sul risveglio dei ricordi","Un'immagine mentale che nessuno doveva generare","Lavarsi i capelli con l'olio della friggitrice","L'unico vero dio verde proprietario della palude","Un metodo di gestione familiare freddo e illegale","Un dialogo col sacro costante, colorito e rumoroso","Buttare via la sedia a rotelle per l'aria di montagna","Un podcast motivazionale molto aggressivo","Rovinare istantaneamente un momento di seriet\xE0","Usare la magia di Hogwarts per scopi poco onorevoli","Scoprire che il tuo tipo ideale non pu\xF2 risponderti","Avere voglia di Pok\xE9mon pi\xF9 forte dell'istinto di vita","Una reazione eccessiva al cringe dei cartoni animati","Portare azione hollywoodiana tra le monache austriache","Uno spettacolo taurino con bandiere rosse","Farsela con un lampione in pieno giorno","Aggiungere ferramenta all'hardware per piacere metallico","Un esperimento di yoga interno per testare la dignit\xE0","Usare un outfit politico per diventare l'uomo nero","Dichiarare che nessuno entra in camera fino alla fine","La cucina della nonna che colpisce punti inaspettati","Vestirsi da anime con molta meno stoffa","Una fusione di colori e popstar per un biscotto","Seguire i consigli medici di chi confonde il sistema","Inviare un file multimediale personale in 20 pixel","Il grande guardone che non ti lascia mai privacy","Uno spettacolo violento con tori piccoli e urla alte","Esplorare il fascino vintage delle nonne dell'est","Unire piacere fisico a movimenti involontari","La macchina che ci insegna che Kachow \xE8 uno stile","Il boss finale del meteo che ti fa saltare il modem","Usare lo scienziato per il live action di Cars","Una litania blasfema che sembra un codice fiscale","Costruire un reattore nucleare con una moka","Una fragranza selvatica non in profumeria","L'unico ostacolo tra te e la libert\xE0 di sfrecciare","La zia che ti insegna a vivere di haul e di top","Un'epoca di baffi a manubrio e valzer","Il primo grande tradimento di gruppo di Wikipedia","La tradizione di bullismo che ti fa sentire a casa","Il cervello che si gonfia d'orgoglio fino a scoppiare","Portare la temperatura di casa a livelli da incendio","Il supereroe che combatte il crimine col getto organico","Un esperimento di architettura e piacere sconsigliato","Un tuffo nel passato preistorico rugoso","Una sedia di hardware maschile per sedute intense","Un errore di identit\xE0 che rovina il pranzo di Natale","Interpretare il \\"due \xE8 meglio di uno\\" troppo alla lettera","Uno sciopero organizzato da chi ama il Medioevo","Migliorare le prestazioni del software di coppia","La risposta definitiva a qualsiasi insulto sul web","Una fiaba Disney rivisitata con accessori ingombranti","Convivere con una cagnolina a pois senza pazienza","Una strategia di difesa per riposare in pace","Capire che la pizzeria di notte \xE8 una pessima idea","La filosofia della vita gestendo relazioni tossiche","Un accessorio ghiacciato dagli usi poco rinfrescanti","Diventare un'altra forma di vita per il calore","L'allergia al fascino che ti impedisce di concludere","Esercizio di ginnastica e piacere per flessibili","Passare pi\xF9 tempo a scappare che al matrimonio","Scrivere versi meravigliosi combattendo i demoni","Una performance vocale e fisica da Grammy Award","Fare terrorismo chimico e scappare dalle porte","Vivere in un mondo dove la logica \xE8 un optional","Un gioco d'azzardo dove le macchine hanno ragione","Cercare compagnia dove la morale \xE8 dimenticata","Fare il poliziotto del vibe per il decoro del gruppo","Una battaglia rap tra influencer che fa tremare tutti","Portare il complottismo dove il sole non batte mai","Una metafora blasfema per un evento mondiale","Tornare a vivere in un'epoca di misticismo e uniformi","Dividersi il mondo come se fosse una pizza","Fare un'analisi del testo della propria vita privata","Una degustazione proibita di liquidi che sanno di morte","Rendere l'ultimo saluto un evento d'azione","Una sfortuna cos\xEC grande da meritare una lapide","Un tutorial di base per la felicit\xE0 non scaricato","Una condanna troppo pesante per un gioco di carte","Fare il finto tonto con la finanza agevolata","Il remix techno della sigla di \xA7C'\xE8 \xA7Posta \xA7Per \xA7Te","Mettere lo smalto nero solo per sembrare pi\xF9 profondo","Un tutorial su come ghostare l'\xA7Agenzia delle \xA7Entrate","Vendere l'anima per un codice sconto su \xA7Shein","Il rutto libero di \xA7Gerry \xA7Scotti in diretta nazionale","Fare gatekeeping estremo sui paninari di \xA7Milano","Inseguire il sogno di diventare un influencer di rubinetti","L'odore di fritto misto che emana la mia dignit\xE0","Un microchip impiantato da \xA7Bill \xA7Gates per errore","Fare un unboxing di delusioni amorose in live \xA7Twitch","Cercare di spiegare il \xA7Multiverso a mia nonna","Il parrucchino di \xA7Trump che prende il volo verso \xA7Marte","Scambiare un attacco di panico per un'esperienza mistica","Il sudore freddo dopo aver mandato un vocale al gruppo sbagliato","Un set di coltelli da cucina con la faccia di \xA7Gordon \xA7Ramsay","Fare la verticale sopra una scatoletta di tonno aperta","Il sapore metallico di una moneta da due euro","Una maratona di dodici ore di video di \xA7Khaby \xA7Lame","Cucinare la pasta con l'acqua gassata per sentirsi diversi","Il mistero della calza spaiata dentro la lavatrice","Fare pole dance con un palo della segnaletica stradale","Un massaggio shiatsu fatto da un orso polare depresso","Il pianto disperato di un navigatore satellitare senza segnale","Mangiare i cereali con la red bull alle tre di notte","Un corso accelerato di sguardi minacciosi allo specchio","Fare il cosplay di un sasso per evitare le responsabilit\xE0","Il rumore di un modem anni novanta che cerca di connettersi","Un bacio appassionato con il riflesso del vetro del forno","Fare parkour estremo tra i reparti dell'\xA7Ikea","Il contenuto di zuccheri nel sangue di un bambino americano","Un tatuaggio temporaneo con la scritta \xA7Main \xA7Character","Fare il tifo per il meteorite durante il telegiornale","L'imbarazzo di salutare una persona che non ti ha visto","Un abbonamento premium per guardare l'erba che cresce","Fare surf sopra un'asse da stiro nel bel mezzo del deserto","Il carisma di una melanzana grigliata male","Un incontro ravvicinato del terzo tipo con un piccione","Fare la fila alla posta solo per il gusto di sbuffare","Il rumore della pioggia sopra una tettoia di lamiera","Un segreto inconfessabile nascosto sotto il tappeto del salotto","Fare lo spelling del proprio nome al contrario urlando","Il fascino discreto di un calzino bucato sull'alluce","Una collezione di sassi che sembrano celebrit\xE0 famose","Fare la dieta dell'aria fritta per tutta la settimana","Il riflesso del sole sopra la pelata del vicino","Un duetto canoro tra \xA7Shakira e un ventilatore rotto","Fare yoga sopra un mucchio di mattoncini \xA7Lego","Il brivido di rispondere \\"presente\\" con la voce che trema","Un selfie con un vigile urbano che ti sta facendo la multa","Fare finta di conoscere il testo della canzone in discoteca","Il profumo di asfalto bagnato dopo un temporale estivo","Una partita a scacchi contro un computer spento","Fare il dj usando solo i tasti del citofono","Il sapore di un ghiacciolo alla menta mangiato sotto la neve","Una dichiarazione d'amore scritta con il ketchup","Fare le fusa a un gatto che ti odia profondamente","Il rumore di un sacchetto di patatine che si apre in chiesa","Un bagno rilassante in una vasca piena di maionese","Fare la ruota nel corridoio stretto di un aereo","Il bagliore degli occhi di un gatto nel buio pesto","Un colloquio di lavoro fatto interamente in rima","Fare il bagno nell'olio di colza per sembrare un culturista","Il peso insostenibile di un segreto di stato inutile","Una vacanza all'estero organizzata da un piccione viaggiatore","Fare la verticale sopra un cornicione per un pugno di like","Il rumore di una scopa che cade in una stanza vuota","Un autografo di \xA7Babbo \xA7Natale fatto con il pastello a cera","Fare la lotta con un cuscino di piume d'oca selvaggia","Il sapore di una batteria scarica appoggiata sulla lingua","Una sfilata di moda per cani con il cappotto di cammello","Fare il tifo per la squadra che sta perdendo dieci a zero","Il brivido di camminare a piedi nudi sopra l'erba bagnata","Un corso di sopravvivenza per chi vive in un attico a \xA7City \xA7Life","Fare la spesa alle quattro del mattino vestito da ninja","Il rumore di una pagina di giornale che vola via nel vento","Un duello all'ultimo sangue con le spade laser di plastica","Fare un discorso motivazionale a una pianta di ficus","Il sapore di un caff\xE8 zuccherato con il sale per sbaglio","Una nuotata olimpica dentro una fontana monumentale","Fare il filo a un manichino di un negozio di abbigliamento","Il rumore di un bacio dato sulla guancia a tradimento","Un abito da sera fatto interamente di carta igienica","Fare il salto della quaglia sopra una pozzanghera di fango","Il profumo di un libro nuovo appena aperto in libreria","Una serata karaoke con soli brani di musica gregoriana","Fare la guardia a un frigorifero vuoto per tutta la notte","Il rumore di un bicchiere che si rompe durante un brindisi","Un tutorial su come diventare invisibili ai propri ex","Fare il solletico a una statua di marmo del \xA7Bernini","Il sapore di una ciliegia matura colta direttamente dall'albero","Una partita di pallone giocata con una palla invisibile","Fare la scarpetta con il pane dentro il sugo della nonna","Il rumore di un applauso solitario alla fine di un film","Un set di biancheria intima con i disegni di \xA7Sponge\xA7Bob","Fare il bagno in un mare di schiuma da barba al mentolo","Il sapore di un limone mangiato senza fare smorfie","Una corsa a ostacoli tra i carrelli di un supermercato","Fare il segno della croce davanti alla vetrina di \xA7Gucci","Il rumore del silenzio totale in una biblioteca vuota"]`, "/application/include/cards/speciale_dnd/frasi.json": '[["Ho un incantesimo in grado di _",1]]', "/application/include/cards/speciale_dnd/completamenti.json": '["\xA7Gianluca","\xA7Milo","\xA7Gioele","\xA7Marco","\xA7Raul"]', "/application/include/cards/standard/frasi.json": `[["_ \xE8 buono, ma _ \xE8 molto meglio!",2],["_ \xE8 un ottimo rimedio per il cancro",1],["La felicit\xE0 \xE8 _",1],["Pensare a _ ti far\xE0 solo soffrire",1],["_ \xE8 stata la cosa pi\xF9 bella della mia vita",1],["Non raggiungo l'orgasmo senza pensare a _",1],["Hai mai provato a _? Ti cambia la vita da cos\xEC a cos\xEC!",1],["Ti voglio bene ma capirai che _ non \xE8 una cosa accettabile",1],["_ \xE8 una cosa che viene tramandata con amore da padre in figlio da generazioni",1],["Il mio love language \xE8 _",1],["Chi cerca il benessere lo trova in _",1],["Pensare a _ \xE8 l'unica cosa che mi fa dormire serenamente",1],["_ \xE8 un'esperienza che mi ha cambiato la vita",1],["Non ero attent* a lezione perch\xE9 pensavo a _",1],["Ho piacevolmente discusso di _ con il mio prof di religione",1],["Per risolvere il suo problema ha solo bisogno di _",1],["Pensi che _ sia una leggitimazione per combattere _?",2],["Se fossi re donerei _ a tutta la popolazione",1],["Quando c'era lui bastava _ per essere felici",1],["Se continui ad evitare _ la conseguenza sar\xE0 _",2],["Nello spettacolo di ieri io ho interpretato _ che aveva il ruolo di _, il pubblico \xE8 stato cos\xEC commosso che ha deciso di _",3],["La mancia della nonna mi permetter\xE0 di prendere _",1],["Non capisco la lingua dei segni, non \xE8 che per caso potresti _?",1],["Penso che _ sia un fattore fondante della societ\xE0 moderna, ma senza _ questa non sarebbe nata",2],["\xC8 inutile che mi dici di _, la mia idea di _ \xE8 sempre la migliore",2],["Dovevi esserci quando Michael Jackson ha fatto la sua iconica performance con _",1],["Dovevo studiare, ma ho preferito _",1],["_, i soldi sono soldi",1],["_ \xE8 il nemico della societ\xE0, basterebbe _ e il mondo sarebbe migliore",2],["Come osi criticare _, senza non saresti qui",1],["La NASA ha inviato nello spazio _",1],["La Cina sta progettando una missione su Marte per _",1],["Quella ragazza trema, deve aver visto _",1],["Preferiresti _ per tutta la vita oppure avere _ nell'armadio",2],["Quando andavo all'asilo mi divertivo a _",1],["Come compito per casa devo _",1],["Ieri ho visto _, sembrava pi\xF9 felice del solito",1],["Il mio roman empire \xE8 _",1],["Secondo l'oroscopo \xE8 l'ora di _, ma preferisco rimanere a casa mia con\xA0 _",2],["_ \xE8 un modo per fermare la guerra",1],["Non mi piace il pene ma per _ un pompino lo farei",1],["Il bottone rosso nella Casa Bianca serve per _",1],["Sei cos\xEC stupid* che saresti in grado di _",1],["_. Aura +9999",1],["Venderei la prof di inglese per _",1],["Ardua scelta: _ o _",2],["Per lavarmi la coscienza ho deciso di _",1],["Per essere il migliore serve _",1],["Il nemico numero uno di Carlo Conti \xE8 _",1],["_ \xE8 stata la cosa pi\xF9 brutta degli ultimi tempi",1],["Non \xE8 un venerd\xEC sera senza _",1],["Questo weekend il solito: venerd\xEC sera _, sabato _ e domenica mattina _",3],["_: i ricordi del Vietnam",1],["Contattare c'\xE8 Posta Per Te per _",1],["_ \xE8 andat* ad Amici",1],["_ dovrebbe essere integrato nel programma scolastico",1],["\xA7_! Ne hanno parlato a Forum",1],["Soluzione per un appuntamento perfetto? _",1],["Dopo 30 anni di matrimonio io e mio marito abbiamo trovato un modo per mantenere viva la passione: _",1],["Ogni brava moglie cristiana sa che \xE8 necessario _",1],["_ ha causato l'esplosione del Titan",1],["_ \xE8 il motivo per cui dio ha fatto estinguere i dinosauri",1],["Sono cresciut* con Pok\xE9mon, Yu-Gi-Oh e _",1],["Ho scoperto un subreddit a tema _. Quante risate!",1],["Spareresti al tuo migliore amico in cambio di _",1],["_ pu\xF2 capitare",1],["La cosa che amo pi\xF9 delle ragazze \xE8 _",1],["_ lo dico tutte le mattine appena svegliat*!",1],["Splendida giornata per _",1],["Amanda mi ha regalato il nuovo profumo di Chanel e _",1],["L'imputato, colpevole di _, era in realt\xE0 innocente",1],["Nel nuovo film di inside out 3 l'emozione principale sar\xE0 _",1],["_. Disse il mostro di Firenze in tribunale",1],["\\"Vai al supermercato, prendimi _ e _, poi compra quel che vuoi\\" \\"Va bene, anche _?\\" \\"Va bene, i bisogni sono bisogni\\"",3],["Usare _ come giocattolo anale non \xE8 molto conveniente",1],["Divorzio di Chiara Ferragni e Fedez, sentiamo cosa ne pensa _!",1],["Voglio _ adesso! In questo esatto istante!",1],["Se non hai mai provato _, dovresti chiedere a suor Claudia, \xE8 un'esperta",1],["I libri di storia descrivono l'ascesa di Mussolini come _",1],["Solo un vero critico letterario pu\xF2 capire che dietro la figura di Leopardi si celava _",1],["_: perfetto per quando ho del tempo libero",1],["_ \xE8 una brutta abitudine",1],["_ fa bene alla salute, ma _ fa bene all'anima",2],["Per buttare gi\xF9 un po' di chili dovresti iniziare a _",1],["In Georgia usano _ per mangiare la zuppa",1],["\\"Topolino e _\\" il nuovo fumetto a soli 3,50\u20AC in edicola",1],["_ , disse il poeta guardando il cielo stellato",1],["Ogni stagione ha i propri bisogni: primavera: _, estate: _, autunno:\xA0 _ e inverno: _",4],["Ho preso 3 perch\xE8 non ho saputo come _",1],["Il medico consiglia _ come lubrificante prima di un rapporto anale",1],["_ a 90\xB0 sul letto della pimpa",1],["_, da aggiungere alla smash cake",1],["Ma solo io mi ricordo quell'episodio di Dora l'esploratrice intitolato _",1],["Sulla mia tomba voglio sia scritto: \\"Ha vissuto una vita fatta di sesso, droga e _\\"",1],["Il mio cane non smette di _",1],["Per problemi come _ digitare 1, se invece ha bisogno di _ digitare 2",2],["\xA7_... MA \xC8 INACETTABILE, DISONESTO, IL PEGGIO DEL PEGGIO!",1],["Non riesci a toglierti dalla mente _? Semplice. Bevi per dimenticare",1],["L'italia ha inviato _ per aiutare i bimbi afghani",1],["_, \xE8 questo il motivo della mia diarrea dottore",1],["Non c'\xE8 pace prima di _",1],["Qual \xE8 il mio superpotere? _",1],["_, il premio nobel per la scienza di quest'anno",1],["Il cast del film che ha vinto gli Oscar aveva _ e _. Era una storia d'amore, finita male",2],["Ho trovato _ come sorpresa nell'uovo di pasqua",1],["Prendo l'happy meal solo per _",1],["_, testato dai bambini, approvato dalle madri",1],["La voce nella mia testa mi dice di _",1],["I vicini continuano a _ da stamattina",1],["Alla fiera dell'est per due soldi _ mio padre compr\xF2",1],["Il nuovo regolamento scolastico stabilisce che \xE8 vietato _",1],["Non sono riuscito a studiare per colpa di _",1],["Per mostrare solidariet\xE0 dopo le partite di calcio, il gesto dei calciatori \xE8 _",1],["Se la vita ti d\xE0 dei limoni, facci _",1],["Pap\xE0, io da grande voglio _",1],["Il tempo \xE8 _",1],["_ mi sembra un po' too much",1],["_ \xE8 demure",1],["_ \xE8 brat",1],["_-core",1],["_ non \xE8 demure, ma Brat",1],["A Natale non pu\xF2 mancare _",1],["_ mi rende eccitatissim*",1],["Non ho tempo di cucinare, prender\xF2 _ d'asporto",1],["Invece del carbone la befana porta ora ai bambini cattivi _",1],["_ buono fino all'ultima goccia",1],["_ fece finire la mia ultima relazione",1],["Allerta meteo! Sulla penisola potrebbe arrivare _",1],["Le persone anziane pensano sempre a _",1],["Salvini preferirebbe _ ai neri",1],["_ fu la chiave di volta per il caso Orlandi",1],["Non so con cosa verr\xE0 combattuta la terza guerra mondiale, ma nella quarta si user\xE0 _",1],["_. Raccomandato da 9 dentisti su 10",1],["_. Raccomandato da 1 dentista su 10",1],["Prossimamente su Rai sport 2: i mondiali di _",1],["Se dovesse finire il mondo vorrei solo un'ultima cosa: _",1],["Nel kit di sopravvivenza non pu\xF2 mancare _",1],["La scuola insegna anche a _",1],["Quali sono i 3 desideri che chiederesti al genio della lampada? _, _ e _",3],["Mi son dimenticat* di _",1],["_. Cos\xEC \xE8 come voglio morire!",1],["In un mondo depredato da _, il nostro unico conforto \xE8 _",2],["Ho un sacco di problemi, ma _ non \xE8 fra questi",1],["La cosa pi\xF9 emo che abbia mai fatto \xE8 _",1],["_ non esiste, non pu\xF2 farti del male",1],["Dimenticate la ruota! L'invenzione pi\xF9 rivoluzionaria \xE8 _",1],["_ sar\xE0 il focus del prossimo DLC di The Sims 4",1],["Hear me out! _ e _",2],["_. Link in bio \u2764\uFE0E\u2060",1],["PLOT TWIST: \xA7_!",1],["_. Per il meme",1],["_ mi ha fatto capire di essere omosessuale",1],["_... La migliore esperienza sessuale della mia vita",1],["_. Il capitolo segreto del diario di Anna Frank",1],["_. Triste come un cane cieco che si schianta contro un muro",1],["_ come repellente per i testimoni di geova alla porta",1],["\xA7_... ICON!",1],["_ per rimandare gli albanesi a casa loro",1],["_. Aiutiamoli a casa loro!",1],["\xA7_ ! QUALCUNO CHIAMI IL 118!",1],["_ scritto in grande sui manifesti cittadini",1],["_ non \xE8 considerabile una molestia, \xE8 sotto i 10 secondi",1],["La definizione di \\"_\\" nel dizionario Treccani \xE8 \\"_\\"",2],["\xA7_: SMASH!",1],["_: lo insegnavano ad educazione sessuale",1],["\\"C'era una volta _... \\" . Che storia memorabile!",1],["_: healing my inner child.",1],["Il pi\xF9 bel ricordo d'infanzia che ho? _",1],["_ \xE8 stra una cosa che farebbero i 7 nani",1],["\\"_\\" \xE8 quello che dico sempre quando non riesco a cagare",1],["_, i miei suoceri sono i primi in classifica in questo ambito",1],["_ \xE8 l'emblema di una vera storia d'amore tra lesbiche",1],["\xC8 stato grazie a _ se il covid 19 \xE8 stato debellato",1],["Il diritto a _ dovrebbe essere aggiunto alla costituzione",1],["Caff\xE8 e sigaretta la mattina... _ assicurato",1],["Meglio del sesso omosessuale c'\xE8 solo _",1],["_: il motivo per cui odio gli spagnoli",1],["Qui sui monti ci si annoia, menomale che son troia e che c'\xE8 _",1],["_ negli epstein files",1],["Sull'isola di epstein non poteva mancare _",1],["Certe persone non hanno il diritto di _",1],["Stanotte ho sognato di _ e _",2],["_ sar\xE0 la causa della caduta del governo meloni",1],["_ e in un attimo mi trovo a pecorina",1],["_, tipico della calda provincia partenopea",1],["_ per la vittoria, _ per la libert\xE0!",2],["_: il mio sogno erotico pi\xF9 grande",1],["Al governo meloni manca solamente _",1],["_: la nuova innovazione del ministro salvini",1],["_ : la soluzione alla crisi economica",1],["Una mela al giorno toglie _ di torno",1],["Sacrificare una vergine per _",1],["_, il mio passatempo preferito",1],["_ per una pasta sciu\xE8 sciu\xE8 ma gustosa",1],["Latte e _. La colazione dei campioni",1],["Pecorella o maialina? La migliore amica di Peppa Pig \xE8 _",1],["_... Pazzurdissimo!",1],["Peggio della necrofilia c'\xE8 solo _",1],["_: il miglior modo per venire in due minuti",1],["_ come regalo di Natale per tuo padre",1],["_ e _. Ah le cose pazze che facevano i nonni nei ruggenti anni venti",2],["Un dito nel culo o _ ?",1],["Chiedere a chat GPT di _",1],["_. La nostra mente non conosce limiti.",1],["L'attivit\xE0 preferita di epstein era: _",1],["Trump e la Groenlandia per _",1],["Berlusconi, epstein, minorenni e _",1],["Sfruttare un bambino asiatico per _",1],["Minorenni e _, la cena di Berlusconi",1],["La vera ragione per cui Striscia La Notizia \xE8 stata sospesa non \xE8 altro che _",1],["_ per risolvere la crisi climatica",1],["Scandalo a Sanremo: _",1],["Entro. Spacco. Esco. _",1],["Ore 08:00 _. Ore 08:01: _",2],["_ per debellare la malaria",1],["Ho scoperto che mio padre \xE8 gay grazie a _",1],["_ a supporto della Palestina",1],["_ e TI PREGO sverginami l'ano!",1],["_ \xE8 come ho scoperto dell'esistenza degli omosessuali",1],["_ per fare cambiare sponda a un etero",1],["Stasera a ballando con le stelle: _!",1],["_ come cura all'omosessualit\xE0",1],["Musica epica di accompagnamento per _",1],["\xC8 socialmente accettato _?",1],["_. Non tutti gli eroi portano una maschera ragazzi...",1],["HELL NAH MAN! NON \xA7_. PROPRIO NO!",1],["Quando James Madison scrisse i 10 emendamenti pensava che _ sarebbe stato il futuro dell'america",1],["Peggio di Netanyahu non c'\xE8 nulla (per\xF2 _ \xE9 quasi alla pari)",1],["Alla lezione di educazione sessuale hanno spiegato cos'\xE8 _",1],["Gli antichi ottomani usavano _ in combattimento, per questo riuscirono a creare un impero cos\xEC potente",1],["Preferiresti avere un figlio gay, una figlia lesbica oppure _",1],["_ + _ = _",3],["Ai neri piace _",1],["_ \xE8 un chiaro segnale di omosessualit\xE0 aggravata",1],["Non sono razzista, ma _ e _ nel mio Paese proprio no!",2],["Bevo per dimenticare _",1],["Durante il trascurato Periodo Marrone, Picasso ha prodotto centinaia di quadri su _",1],["Uccidi i tuoi nemici con _",1],["La ricetta del successo \xE8 _",1],["Vorrei _ per conquistare il cuore di mia cugina",1],["Sei simpatic* come _",1],["_... Era una canzone di Albano",1],["La mia dream rotation: _, _ e _",3],["Nightmare rotation: _, _,  e _",3],["L'unico modo per calmare un bambino che piange \xE8 _",1],["Non \xE8 bullismo, \xE8 solo _",1],["Cosa mi ha causato questo trauma infantile? _...",1],["Sulla mia lapide ci sar\xE0 scritto: _",1],["Non posso venire al lavoro perch\xE9 sto provando _",1],["Hanno trovato _ nel freezer di Jeffrey Dahmer",1],["_, _ e _: la triade che mi porter\xE0 al collasso del pavimento pelvico",3],["_ al calduccio nella pucchiacca della mamma",1],["_: un sogno lucido spaventosamente vivido",1],["La befana vien di notte e con lei anche _",1],["Pensa a _ e _... L'Italia \xE8 proprio il Paese che amo!",2],["No amo non mi sento bene... Necessito di _",1],["_, _ e _: il trio dell'Ave Maria",3],["_ durante il sesso selvaggio con il Gabibbo",1],["La cartomante mi ha detto che nella vita avr\xF2 _ e _ in abbondanza",2],["Mettere _ nelle scuole \xE8 stata la propaganda vincente del fascismo",1],["La mamma \xE8 troppo stanca per _. Facciamo domani amore",1],["Da quando mia nonna \xE8 in casa di riposo non aspetta altro che _",1],["_ e _ dovrebbero essere alla base della piramide alimentare",2],["\\"Un ultimo desiderio prima dell'esecuzione?\\" \\"S\xEC... _\\"",1],["Ho il cervello invaso! Non riesco a pensare a qualcosa che non sia _!",1],["_ in vendita su SheIn e fatto dai bambini cinesi",1],["_ \xE8 l'unico modo che ho trovato per curare i miei disturbi mentali",1],["_ per un mondo pi\xF9 green",1],["_ \xE8 molto meno divertente di _",2],["Per crescere bisogna mettere le mani in pasta e cimentarsi nell'arte di _",1],["Dalla seconda lettera di San Paolo apostolo ai Corinzi: 'Fratelli, donate la vostra vita e il vostro amore a _'",1],["La grande crisi del 29 ha portato la mia bisnonna a _",1],["Tutti pronti? \xC8 l'ora di _",1],["Bambini venite qui, \xE8 l'ora di _",1],["Mio marito a letto \xE8 incontentabile. Pensa che il suo sogno erotico pi\xF9 grande \xE8 _",1],["Rega spammate _ in chat tutti quanti!",1],["Capisci di aver sbagliato tutto nella vita quando ti trovi a fare i conti con _",1],["Ti giuro che _ e _ hanno pi\xF9 cose in comune di quanto credi",2],["La mia strategia per ravvivare una conversazione morta \xE8 _",1],["Per mettere bene le cose in chiaro al primo appuntamento, parlo sempre di _",1],["_ e _: le ultime ricette di Fatto In Casa Da Benedetta",2],["_ \xE8 la ragione per cui \xE8 finita la mia ultima relazione",1],["Le scritture sulla Stele Di Rosetta parlano di _",1],["_ e _ erano consueti e apprezzati nell'antichit\xE0",2],["_ \xE8 una delle pi\xF9 grandi innovazioni cinematografiche",1],["Prima di scrivere Harry Potter, la transfobica ha scritto un libro che parlava di _",1],["La zia ha avuto un'idea super cute per il primo compleanno di mio figlio: _",1],["E la ciliegina sulla torta: _",1],["Ma no tontolone! Non possiamo _",1],["Ho speso troppi soldi per _. Dovevo investire su _",2],["_ - _ = _",3],["Talmente esaurita che sto pensando a _",1],["_ fu presagio dei tempi che corrono",1],["_ per sfuggire alla chiamata alle armi",1],["I desideri che chiederei al genio della lampada sono: _, _ e pi\xF9 importante di tutti _",3],["_ per sbloccare l'Enchantix",1],["_ \xE8 un ricordo prezioso che tutti portiamo nel cuore",1],["Ha iniziato a descrivere _ in una maniera cos\xEC raccapricciante che dalla paura mi sono affidat* a _",2],["Bambini prendete carta, forbici dalla punta arrotondata e _... \xC8 ora di un Art Attack!",1],["Il tema della mia festa di compleanno sar\xE0 _",1],["Un tutorial su YouTube per _ in 10 semplici passaggi",1],["Qui accettiamo _ come metodo di pagamento",1],["_ al Grande Fratello VIP",1],["A MasterChef ho chiamato il mio piatto \\"_\\"",1],["Qualcuno mi spiega _? (Imparo meglio con le immagini)",1],["Ieri sera a Super Quark hanno parlato di _",1],["\\"_\\" ... \\"he bella hosa he hai detto\\"",1],["C'\xE8 una community TikTok fissata con _",1],["Se lo avessi, userei il mantello dell'invisibilit\xE0 per _",1],["La medicina alternativa sta ora adottando i poteri curativi di _",1],["Cosa mi causa flatulenze incontrollabili? _",1],["A Berlusconi piaceva _",1],["Amore mio, sono qui in ginocchio davanti a te per _",1],["Caro babbo natale, quest'anno vorrei _",1],["Quando apr\xEC il vaso, Pandora vi trov\xF2 soltanto _",1],["Una VERA donna vuole solo _",1],["_. Cos\xEC \xE8 la vita",1],["_ \xE8 un mio sogno ricorrente e non so se preoccuparmi o essere felice",1],["L'ottavo peccato capitale: _",1],["_ mi ha traumatizzat* al punto di bloccarmi la crescita",1],["Arrivano tempi bui gente. _ e _ aumenteranno drasticamente e purtroppo ci sar\xE0 carenza di _",3],["\\"Se non invii questo messaggio a venti persone tua madre morir\xE0 e tu finirai per _\\"",1],["_ e _: la coppia che scoppia!",2],["I 3 principi fondamentali della medicina cinese sono _, _ e (il mio preferito) _",3],["\xC8 una 10/10 ma le piace _",1],["Ljusm\xF6rkerkv\xE4ll': termine svedese che significa '_'",1],["La mia bagiorla pulsa di eccitazione quando penso a _",1],["_ \xE8 il mio unico vero credo religioso",1],["_ \xE8 il motivo per cui quel coglione di Elon Musk vuole andare su Marte",1],["_ per un aborto rapido post partum",1],["Solo 5\u20AC per _! Un affare! Garantito al formaggio!",1],["_... Aura loss immediato",1],["Durante il fisting ho trovato _ nel culo del mio fidanzato",1],["Se esce testa _, se esce croce invece _",2],["Una mod di Minecraft che aggiunge _ al gioco",1],["_ per passare una buona epifania",1],["Antiche scritture provano che i sumeri hanno dato vita al concetto di _",1],["E come diceva Lui '_ e buonanotte camerati!'",1],["Petizione per aggiungere _ ai diritti universali dell'uomo!",1],["\xA7_. PAZZESCO! PATRIMONIO DELL'UNESCO!",1],["Il ministro dei trasporti ha aggiunto _ all'esame di guida",1],["Quando gli scout vanno nei boschi imparano a _",1],["Ho cos\xEC tanta fame che mangerei _",1],["Per fare il legno ci vuole l'albero, per fare l'albero ci vuole il seme, per fare il seme ci vuole il frutto, per fare il frutto ci vuole il fiore, per fare il fiore ci vuole _",1],["Cos'\xE8 stato pi\xF9 culturalmente significativo? Il rinascimento o _?",1],["Ti prego, voglio _, sar\xE0 l'ultima volta te lo prometto!",1],["\\"_\\" descrive la mia esistenza nella sua interezza",1],["Ci sono molte divergenze politiche causate da _",1],["_ mi ha causato una gravidanza isterica",1],["Mentre mi alleno ascolto un podcast che parla di _",1],["Questa nuova trappola per topi si basa su una rivoluzionaria tecnologia ucraina: _",1],["_ \xE8 buono... Bella cadduosa",1],["_ \xE8 uno scempio di cui solo un israeliano sarebbe capace!",1],["Avrei tanto voluto vedere mia nonna in giovent\xF9: conosciuta in paese per essere la pi\xF9 brava in _",1],["_... \xC8 cos\xEC che io e vostro padre ci siamo conosciuti",1],["Voglio _ al mio matrimonio",1],["Un episodio dei Griffin su _ e _",2],["La prossima serie animata di Zerocalcare parler\xE0 di _",1],["Un antico proverbio nipponico dice che _ \xE8 segno di grande stabilit\xE0 mentale",1],["La gazzetta dello sport ora ha una rubrica su _",1],["Prepariamo il pranzo a mio marito: gli metto del pane bruciato e _",1],["Non sono razzista, sono 26 anni che abito qua, ma dico io... se noi andiamo al paese loro non \xE8 che ci mettiamo a _",1],["Un giorno... sono andata a cercare la password... ho provato \\"_\\"... si \xE8 sbloccato. Signor giudice io ero SCONVOLTA",1],["Pensavo fosse il demone della paralisi del sonno, invece era solo _ nell'angolino della stanza.",1],["Mystery box di Hello Kitty And Friends a tema _",1],["_ per quando mi sento pazzerella.",1],["_ per fare big money!",1],["Beh, Shinji, io non posso fare altro che stare qui ad _. Per\xF2, quanto a te, quanto a quel che non puoi far che tu, per te qualcosa da poter far dovrebbe esserci. Ma non ti costringer\xE0 nessuno, pensa da te stesso, decidi da te stesso che cosa tu stesso possa fare. Beh, che tu non abbia rammarichi",1],["Agli scoiattoli piace un sacco _.",1],["Pensavo che _ valesse pi\xF9 cammelli... solo 3 e mezzo!",1],["\\"Preferiresti _ o _?\\" \\"No guarda, meglio _\\"",3],["Usare \\"_\\" come safe word a letto",1],["_ accade ogni giorno sulla linea regionale Roma - Viterbo",1],["Te l'avevo detto: _ prima di _ non \xE8 una buona idea",2],["Se _ avesse un volto, sarebbe il tuo",1],["Un'ora al buio con _ ti cambia la vita",1],["Nella mia famiglia chiamiamo Trinit\xE0 _, _ e _",3],["_ non \xE8 troppo, \xE8 giusto quello che basta.",1],["Meno _ per tutti.",1],["Pi\xF9 _ per tutti.",1],["_ \xE8 il mio metodo per rimorchiare.",1],["Il metodo per far passare il singhiozzo \xE8 _",1],["_ solo per oggi 2 al prezzo di uno!",1],["_ e _ non vanno bene insieme...",2],["_ mamma, pensaci!",1],["Su una scala da 1 a 10, dove 1 \xE8 _ e 10 \xE8 _, tu saresti attorno al 9",2],["_ era mussolini",1],["Mi sono svegliato e c'era _ nel mio letto! Che vergogna!",1],["Nella grotta di Ges\xF9, nascosto dietro al bue e all'asinello, c'era _",1],["Se non ti avessi incontrato non conoscerei _ oggi, \xE8 anche per questo che ti amo",1],["Aspettiamo qualche giorno per _, perch\xE9 adesso ho il ciclo",1],["Se _ ti fa stare in pace con la tua coscienza, allora fallo",1],["Sogno di _ ogni notte da quando ho 8 anni",1],["Hey guarda! C'\xE8 _ dietro di te! Corri!",1],["_ \xE8 una scoperta che i Maia avevano fatto molto prima degli europei",1],["_ \xE8 solo un consiglio, non prenderla male",1],["_ (thank you computah)",1],["Il concilio ha decretato il tuo destino: _",1],["Per _ ora, premere il tasto verde del telecomando!",1],["Preferirei pensare a un procione morto ogni secondo piuttosto che a _ per 2 millisecondi",1],["L'apice della spazzatura umana \xE8 _",1],["Una billboard a Time Square che pubblicizza _",1],["_ \xE8 una cosa che mi fa incazzare dei comunisti!",1],["_ \xE8 una roba da zecche woke!",1],["Oltre la siepe di Leopardi in realt\xE0 vi era _",1],["_ come pena di morte etica",1],["_: Aura. _: Laura",2],["\xC8 un giorno triste, volevo _, sai...",1],["\xC8 veramente cosa buona e giusta, nostro dovere e fonte di salvezza _",1],["Ricordati, Padre, della tua Chiesa diffusa su tutta la terra e di _",1],["_, speziato al punto giusto",1],["Il segreto tramandato dalla mia famiglia per una vita lunga e felice \xE8 sicuramente _",1],["Durante il mio ultimo viaggio, ho dovuto spiegare alla dogana perch\xE9 avevo _ in valigia",1],["Nessuno si aspettava che il nuovo supereroe della Marvel avesse il potere di _",1],["Il titolo della mia futura e controversa autobiografia sar\xE0: \\"Io, il successo e _\\"",1],["La nuova assurda tassa del governo colpir\xE0 pesantemente _",1],["Durante l'ultima riunione di condominio, la signora del terzo piano ha iniziato a urlare riguardo a _",1],["Cosa si nasconde veramente sotto il letto quando spegni la luce? _",1],["_ \xE8 la a vera ragione per cui gli alieni si rifiutano di contattarci",1],["Niente riesce a rovinare un primo appuntamento romantico quanto _",1],["Hanno appena annunciato un nuovo capitolo della saga: \\"Harry Potter e _\\"",1],["Nessuno vuole ammetterlo ad alta voce, ma _ risolverebbe tutti i problemi della societ\xE0",1],["Il medico \xE8 stato molto chiaro: per rimettermi in sesto ho assolutamente bisogno di _",1],["Se verr\xF2 eletto, la mia prima legge render\xE0 completamente illegale _",1],["_ \xE8 l'unica cosa che mi impedisce di mollare tutto e trasferirmi su un'isola deserta",1],["Durante il colloquio di lavoro penso di aver fatto un'ottima impressione parlando di _",1],["C'\xE8 una nuova e assurda teoria del complotto su TikTok che riguarda _",1],["Senza ombra di dubbio, _ \xE8 la password perfetta per il Wi-Fi del'hotel",1],["Ho capito che la serata stava per degenerare quando qualcuno ha tirato fuori _",1],["I libri di storia del futuro dedicheranno un intero capitolo esclusivamente a _",1],["_ \xE8 il vero e inconfessabile segreto del mio fascino irresistibile",1],["La mia playlist per piangere sotto la doccia include solo canzoni su _",1],["Nel bagagliaio avevo solo le borse della spesa e _, glielo giuro signor agente!",1],["_ mi ha completamente rovinato la festa a sorpresa",1],["La mia Alexa ha smesso di parlarmi dopo che le ho chiesto informazioni su _",1],["Siamo rimasti bloccati nell'escape room per tre ore a causa di _",1],["Attenzione, il navigatore ha ricalcolato il percorso per evitare _",1],["Il comitato olimpico sta seriamente valutando di introdurre _ come disciplina ufficiale",1],["Ho aperto il mio biscotto della fortuna e dentro c'era scritto: \\"_\\"",1],["In caso di apocalisse zombie, la mia arma segreta per la sopravvivenza sar\xE0 _",1],["La mia psicologa ha appena concluso che la radice di tutti i miei problemi di fiducia sia _",1],["Il prestigiatore ha traumatizzato i bambini alla festa con il numero su _",1],["Sulla sua bio di Tinder c'era scritto: \\"Cerco qualcuno con cui condividere la passione viscerale per _\\"",1],["Per completare il rito satanico nel bosco, manca solo una goccia di sangue e _",1],["Scusi il ritardo capo, c'\xE8 stato un imprevisto con _",1],["Ho venduto l'anima al diavolo in cambio di _",1],["La mia cronologia delle ricerche \xE8 piena di domande imbarazzanti su _",1],["I libri di storia omettono sempre il fatto che Giulio Cesare avesse il terrore di _",1],["_ \xE8 in realt\xE0 l'ingrediente segreto della famosissima ricetta della nonna",1],["Ho sfregato la lampada magica e _ \xE8 cio\xF2 che ho chiesto come primissimo desiderio",1],["Padre, mi perdoni perch\xE9 ho peccato: ultimamente ho pensieri impuri su _",1],["Niente mi fa esaltare quanto _",1],["Il mio nuovo stile di vita si basa interamente su un singolo concetto: _",1],["Secondo me, l'italiano medio sotto sotto preferisce _",1],["La risposta universale a tutti i miei problemi quotidiani \xE8 e rimarr\xE0 sempre _",1],["Oggi mi sento spiritualmente allineato con _",1],["Non accetter\xF2 mai e poi mai critiche da una persona a cui piace _",1],["Il rover su Marte ha appena inviato una foto scioccante di due alieni intenti a _",1],["Una soluzione efficace contro la stitichezza \xE8 _",1],["Prima regola del Fight Club: _",1],["Se la droga fa male, ma tu non hai alcuno spirito di autoconservazione allora _ va bene!",1],["Due motivi per per comprare una mucca: _ e _",2],["Ah! Wombo-Combo. Iniziano con _... Finiamo con _, buono questo!",2],["Se mi capitasse per le mani il Death Note, per prima cosa scriverei _",1],["Stasera su Dmax: un virile programma su _",1],["Spero di trovare _ nell'uovo di Pasqua",1],["_ \xE8 comunque una storia migliore di Twilight",1],["_ succede alle ragazze col pene",1],["\xC8 molto meglio _. Che mi scopasse un armadillo morto se non ho ragione!",1],["La cosa che preferisco dell'andare a troie \xE8 _",1],["Sono parrucchiera e ho una cliente che mi chiede sempre di _",1],["Da oggi Taffo offre _ e sepoltura ad un prezzo scontato!",1],["Ai tempi dei Sumeri, per passare le giornate, i bambini si divertivano a _ tutto il giorno.",1],["Io, _ e _. PEAK!",2],["Esiste un'organizzazione terroristica islamica dedita a _",1],["Vorrei ringraziarie mia madre e _...senza di loro non sarei qui",1],["Per scappare dalle sabbie mobili bisogna _",1],["Ho origliato la conversazione tra la duchessa e la cameriera. Parlavano di _",1],["Per un pasto bilanciato: _",1],["Entrante in convento per _",1],["_ ti va a pennello",1],["_ \xE8 un argomento da prendere con le pinze",1],["Le statistiche non mentono, su _ gli italiani sono i pi\xF9 assidui e non di poco",1],["_ una volta al giorno toglie il medico di torno",1],["Davanti alla mia famiglia con le lacrime agli occhi ripensavo a _",1],["\xC8 difficile giostrarsi tra _ e _",2],["Costretti a _ perch\xE9 la vita \xE8 dura ragazzi",1],["_ diciamo che \xE8 l'ultima cosa che resta a mia nonna del festival di Woodstock",1],["_ e sorridere perch\xE9 la vita \xE8 bella",1],["Te lo giuro sul torah, il corano e la bibbia che _ non \xE8 peccato!",1],["_ per sovvertire il patriarcato #woke #femmismo",1],["_ perch\xE9 io non sono femminista",1],["_ nel culo",1],["_ mi rende... malinconico, \xE8 questa la parola giusta",1],["_ a Striscia la Notizia",1],["Sulla foto si vede che _ \xE8 davvero importante per lui",1],["Sono Italiano, sono cresciuto in questo Paese, ho conosciuto _",1],["Tu che ami _... La tua opinione ci interessa, clicca qui!",1],["_ \xE8 una prerogativa degli uomini mentre _ spetta alle donne",2],["Prima del mio matrimonio vorrei _ un'ultima volta",1],["Giocare, bere. _ e fumare",1],["No signore! Innanzitutto _. Una regola \xE8 una regola!",1],["_. Chi \xE8 contro alzi la mano",1],["_. Chi \xE8 contro verr\xE0 lapidato",1],["In Russia, quando ti propongono di _ rispondi 'Spasiba', vuol dire grazie",1],["SEI UN PIRLA NON PUOI METTERTI A \xA7_",1],["_ prima delle nozze porta male purtroppo",1],["Ai gay piace tanto _",1],["Ai trans piace tantissimo _",1],["Le zecche comuniste amano _ in segreto",1],["_ \xE8 l'equivalente maschile di _",2],["_ torner\xE0 in Avengers Doomsday",1],["La nemesi di Maria De Filippi \xE8 _",1],["Madre Teresa \xE8 conosciuta per le sue opere di bene, tipo: _",1],["C'\xE8 una canzone dello Zecchino D'Oro che parla di _",1],["L'Italia \xE8 una reppublica fondata su _",1],["Benvenuto nella mia vagina, non c'\xE8 rischio se non _",1],["_ per portare la cultura giapponese a Bitonto (BA)",1],["Dopo la morte doner\xF2 il mio cervello alla scienza cos\xEC che si possa studiare perch\xE9 _ mi piaceva da pazzi",1],["_ \xE8 un linguaggio internazionale che tutti capiscono",1],["_ \xE8 una cosa super kawaii della cultura giapponese \u22C6\u2027\xB0\u{133F2}\u05BC\u{1D122}",1],["_ al collegio edizione Germania 1945",1],["_ come demone della paralisi del sonno",1],["Album delle figurine Panini edizione _",1],["_ non lo trovo divertente",1],["Una classifica di WatchMojo su _",1],["I principali tipi di oro: giallo, bianco, rosa e _",1],["_ \xE8 un cavallo di Troia che nasconde _",2],["_ \xE8 la linea di confine tra l'Europa e l'Asia",1],["_ \xE8 l'unica cosa che mi tiene lontana dai guai",1],["_ \xE8 nobile come cosa",1],["Sai qual \xE8 il mio problema? _",1],["Ogni volta che mi trovo a _ ho poi bisogno di ascolare la sigla dei My Little Pony per calmarmi.",1],["Il pacco da gi\xF9 che contiene _ della mamma, _ della nonna e _ del pap\xE0",3],["Odio _",1]]`, "/application/include/cards/standard/completamenti.json": `["Una partita a Mario Kart irl con Stephen Hawking","Un aborto spontaneo","La 104","Un sex-toy per cani","La mentalit\xE0 ISIS","Gli ebrei","Lo sperma","Un gelato allo sperma","Il colpo di grazia","I bambini operai di shein","Il governo meloni","La tratta degli schiavi","La morte di Bossetti","Essere sulla lista di PDiddy e non saperlo","La borra","\xA7Brumotti picchiato nelle periferie","Andare a puttane","Vendere dischi illegali di Gigi D'Alessio","Un dito in culo","Iniziare con un dito e finire con tutto il braccio","La cappella del papa","La salumeria privata del clero","Ringraziare Beyonc\xE9","La zia Ermenegilda","I rom","Un'esplorazione rettale","Un limone appassionato dal dubbio consenso","Lanciare una sedia al compagno di classe speciale","Il ricatto sessuale","Manomettere i freni di una sedia a rotelle","Il comunismo","Nani da giardino che mostrano il culo ai passanti","Il discorso di mussolini","I campi di cotone ripopolati","Mettere i fiori sulla tomba di Mussolini","Bestemmiare in chiesa","Chiedere a un bambino cieco quante dita alzate ho","Diffondere il verbo di Geova in un ospedale di malati di cancro","Dare fuoco ad una scuola materna","Una gruccia al posto della pillola abortiva","L'economia africana","Lo sbarco in Normandia","Rievocare la marcia su Roma","Premere il bottone rosso sulla scrivania di Kim Jong-Un","Lo sverginamento anale brutale","Riportare il fascismo in Italia","Baciare il mio Bro senza omosessualit\xE0","Pisciare dal buco del culo","Le mani di Gianni Morandi","Lo scandalo Ferragni","Aprire un Only Fans con i video della tua ex","Una pillola di Viagra","Sborrarsi accidentalmente in bocca","\xA7Gerry Scotti che spara al Gabibbo","Il rapimento di Aldo Moro","La vera identit\xE0 del Gabibbo","Ritrovarsi a partorire in un cesso pubblico","Volersi scopare la propria figlia adolescente","Servire una merda bollita a un ristorante stellato","Sverginare la suora novizia nel confessionale","Offrire una sigaretta a un delfino","Essere molestato da un piccione curioso","Il pizzo","Considerare terrone chi vive sotto il Po","Insultare i neri per moda","Criticare l'outfit di un barbone","67","Un pigiama con le righe e una stella gialla","Non andare a prendere la propria fidanzata alle elementari perch\xE9 ti ha tradito","Lezione pratica di educazione sessuale con un prete","Un'orgia di frati benedettini","Vivere come in 1984","Salvare i pesci dall'annegamento","Tagliare i capelli a qualcuno con una mietitrebbia","Il genocidio degli armeni","Il cancro alla prostata all'ultimo stadio","Avere la mononucleosi e sputare dal balcone","Riscrivere la bibbia","Fare il chierichetto per fare colpo su una suora","L'undici settembre 2001","Scoprire che il tuo idolo si \xE8 suicidato mentre stai guardando un documentario sulla seconda guerra mondiale","Andare in coma etilico bevendo l'ACE Gentile","Il comeback di Mozart prima di GTA VI","La scissione dell'impero romano","Fare il saluto al sole","Infornare il tuo figlio gay con patate e rosmarino","Normalizzare sparare alle persone nere","Reprimere con la violenza i flashmob","Comprare un crocifischio dalla LIDL","Dire di essere sieropositivo dopo essere venuto dentro","Tingersi i peli pubici","Comprare un tanga con la faccia di Obama","Usare il naso di pinocchio per altri scopi","Una pastiglia di cianuro alla fragola per una dolce morte","Il progetto Bavaro","Finanziare il ponte sullo stretto","Asfaltare le coste per evitare gli sbarchi di immigrati","\xA7Matteo Salvini","La crescita di uno xenomorfo nel buco del culo","Convincere l'Unione Europea a finanziare un filmino porno amatoriale","Evadere le tasse per comprare bimbi all'ingrosso","Dei transgender sieropositivi","Picchiare il mare per far arrivare le onde","Scoprire tua madre ad un'orgia di suore in una casa di riposo","Applicare un razzo a motore ad una sedia a rotelle","Essere belli come un cesso a pedali","Ingravidare una donna col fertilizzante per piante","Fingere di essere normali alla cassa mentre si ha un vibratore in culo","Mettersi un velo in testa e urlare: \\"Allah Akbar\\" in aereo","Accendere una sigaretta sul tetto di Notre Dame","Il trapassato presente","Dichiarare guerra alla ex Jugoslavia","Causare accidentalmente un omicidio di massa","Una zuppa di fagioli mentre si ha la diarrea fulminante","Toodles che porta a Topolino una pizza con pesto, rucola e cocaina","Lavorare con la colla di amianto","Determinare la massa del sole usando Ruffini","L'amianto","Infilarsi un termometro a mercurio nel culo","Sciogliere i ghiacciai con un phon","Urlare \\"Pikachu scelgo te!\\" lanciando un criceto","Sbattere la testa sul pavimento da neonati","\xA7Perry l'Ornitorinco","L'ipotenusa del triangolo rettangolo","Il grande teorema di Pitagora","Sfidare leggi della fisica dall'ultimo piano del palazzo","Leggere il Mein Kampf in piazza ad alta voce","Il trenino Thomas","L'aspirapolvere dei Teletubbies","L'infinita vastit\xE0 del cazzo che me ne frega","Le tailandesi","Duffy Duck che canticchia il motivetto fascista","Usare la nutella come lubrificante","Il revenge porn","Il tumore al seno","L'egemonia dell'Inghilterra sul mare","Fare la fine di Yara","Attentati violenti in casa di riposo","Il cavallo di troia","Avere dei busti di dubbia provenienza in casa","Usare i soldi pubblici per insabbiare gli atti di pedofilia nella chiesa","Fingersi un allievo dell'asilo quando si ha 60 anni","Evocare il drago shenron","Avere 3 cromosomi in pi\xF9","Vantarsi di avere cromosomi in pi\xF9","Mettere un cavallo al governo","Fare un film porno con un cavallo","Il dottore degli orifizi","Pucciare i biscotti nel latte materno","L'attentato all'arciduca Francesco Ferdinando","Usare una palla di cannone in una partita di ping pong","Una cosa a 3 con Loredana Bert\xE8 e Tiziano Ferro","Attuare un genocidio per il meme","Il ventennio fascista","Praticare sadomaso con Darth Vader","Tirare fuori excalibur a letto","Un monaco amanuense","Cantare faccetta nera davanti al parlamento","Una torsione testicolare","Le lesbiche","I froci","Accusare un trans di essere un transformer","Usare i dolci per rapire i bimbi in un parco","Investire bitcoin in una pornoattrice","Peppa pig alla griglia","Buttarsi da un palazzo per testare l'aerodinamicit\xE0 del proprio corpo","Essere bravi a infornare come i tedeschi negli anni 40","I bravi di don Rodrigo","1000 bottiglie di baby oil","Il mostro di Firenze","Usare un calibro per misurarsi il cazzo","Sperimentare il paradosso del gatto di Schrodinger con il tuo cuginetto","I compagni di merende","Dare un grissino sporco di merda a un bambino spacciandolo per un Mikado","Fare l'elicottero col cazzo","Evocare Belzebub","Vestirsi da nazista ad un gay pride","Mettere I BTS a capo della Corea del Nord","Un allegro weekend a Catanzaro","Sborrare nella bocca di un'antilope","La teoria dell'evoluzionismo","Essere l'assassino di Hitler","Usare la moltiplicazione del corpo di Naruto per entrare in tutti i buchi","Vivere tutta la vita con un vibratore nel culo","\xA7Anna calda a 3 cm da te","Affermare che si stava meglio quando c'era lui ad ogni minima inconvenienza","La madonna caraibica","Invadere la Polonia","L'impresa dei mille","Nuclearizzare Foggia","Il Vesuvio che erutta a Napoli","L'amore incondizionato dei fiorentini per i pisani","Il comune emiliano di Sesso","Rapire e uccidere Yara","Essere innocente come Bossetti","\xA7Jack lo Squirtatroie","\xA7IT'S OVER NINE THOUSAND!!!!!","Trovare un arto umano a casa del tipo conosciuto su tinder","Evadere il fisco come Jeff Bezos","Sussurrare all'orecchio del vicino di urinatoio","Occuparsi della fauna locale come il Trentino Alto Adige","Le suffragette","Sessualizzare il demogorgone","Il cast della melevisione in un video porno","Circoncidersi con una pinzatrice rosa","Bombardare il Vietnam col napalm","Infilare un plug anale nella cappella","Strizzare i capezzoli ad un toro","Mungere il prof di matematica napoletano per la sufficienza","Il processo di Norimberga","Esplodere come tuo zio musulmano","Rizzare le dodicenni","Diventare luterani per un giorno","I diritti delle donne","La fiera dell'est","I fascisti appesi sullo stendino vicino ai mutandoni del prozio","\xA7Trump come nuovo protagonista di Matrix","Giocare a Risiko con eserciti veri","Fare un bagno termale nel Vesuvio","La durezza del mio pene quando canta Annalisa","Calcolare la dilatazione anale dopo il fisting con il teorema di Pitagora","Una cenetta romantica ispirata a Jeffrey Dahmer","Usare la borra al posto della crema pasticcera","Chiedere a un bimbo orfano dove sono i suoi genitori","Le rule 34 di JoJo Siwa","Liberare i bimbi dallo scantinato","Raggiungere l'uguaglianza schiarendo la pelle ai neri","Raggiungere l'orgasmo con due dita nel naso","Ficcare due dita e una matita negli occhi","Sciacquare le palle nella bacinella dell'acqua santa","Disegnare forme falliche sulle lapidi al cimitero","Un chilo di bamba","Dei lecca lecca al gusto gonorrea","Un clitoride placcato oro","Tagliare il cordone ombelicale sbagliato al neonato","\xA7Chiara Facchetti che salda il debito pubblico italiano","Trombare un lampione in pieno giorno","Bere le cristalline acque del Brenta","Eiaculare tanto da farsi venire un'ernia ai coglioni","Inzuppare il tampax nella vodka","Togliere il preservativo prima di venire","Regalare preservativi bucati","Le zingare che rubano nella metro di Milano","Cagare a spruzzo in un vicolo buio e malfamato","Portare la classe dei bambini speciali in gita a Chernobyl","Fingere di essere gay per toccare una tetta","Disegnare cazzi anatomicamente accurati","Ruttare sui polli","Usare un tubo di pringles come sex toy","Dirigere un bombardamento aereo contro la Moldavia","Risolvere il problema dell'immigrazione in Italia cancellando Lampedusa","I bambini nascosti sotto il letto di Michael Jackson","L'umidit\xE0 della mia figa quando vedo Conte","Scambiare pedopornografia nel parchetto cittadino","Scopare con il datore di lavoro","Lavare i genitali con vodka alla fragola e nitroglicerina","Arrivare in ritardo al proprio funerale","Un pupazzo dei My Little Pony con un buco speciale","Un elefante tandem psichico da guerra","Far cadere la saponetta di proposito nelle docce della prigione","Succhiare un cazzo fino a che non sborra","Ficcarsi 3 bei procioni nel culo","Usare la calcolatrice per fare 1+1","Bere Jager dal bid\xE8 a casa della prozia","Morire di diarrea fulminea","Tornare indietro nel tempo solo per farsi fare un autografo da Hitler","Tornare indietro nel tempo per farsi fare un pompino da Marilyn Monroe","Fumare la marijuana dal culo","Sniffare le ceneri della nonna","Usare le ceneri del cane come parmigiano","Praticare tuffi olimpici nella vasca da bagno","Praticare il Kamasutra al pranzo di natale","Togliersi le costole per fare come D'Annunzio","\xA7Orietta Berti","\xA7Anna Frank","\xA7Malgioglio","\xA7Rocco Siffredi","\xA7Maria de Filippi","\xA7Alberto Angela","Inserire tua sorella nel database degli SCP","Spiegare l'apologia cristiana suonando una vuvuzela","\xA7Fabrizio Corona che si incula con un complesso sistema di leve e specchi","Una ninna nanna suonata con un flauto dolce nel naso","Uno spiedino di topi fritti in pastella","Strozzarsi con una mozzarella aromatizzata all'uranio","Prendere 3 pastiglie di viagra per inchiappettare un puffo","Le attivit\xE0 extraconiugali","L'astinenza","\xA7Ges\xF9 inculato dalla Madonna con un dildo rosa","Usare la cocaina al posto della farina per preparare una torta per la vendita di beneficenza","L'ospedale pediatrico sotto attacco di israele","Un Charizard con tendenze neonaziste","Sparare mensole dagli occhi","Kaaaaaamehaaaaamehaaaaaa","Fare sesso non protetto con la propria madre","Unboxare falli di gomma su youtube kids","Uscire le tette per curare i malati di Alzheimer","\xA7Mussolini che fa l'ahegao","Lavarsi i capelli con l'olio della friggitrice","\xA7Shrek","Chiudere tua moglie incinta in balcone d'inverno","La fede in dio di Germano Mosconi","\xA7Clara di Heidi","Il discorso del duce","Bazinga","Usare il mantello dell'invisibilit\xE0 per segarsi nello spogliatoio delle ragazze","Accorgersi di avere tendenze necrofile","Attraversare l'autostrada per catturare un Pikachu","Uccidere il proprio figlio a badilate perch\xE9 gli piace Peppa Pig","Presentarsi armati ad un convegno di monache austriache","Organizzare la corrida con i comunisti","Far dichiarare bancarotta a un sexy shop","Farsi un piercing al cazzo","Infilare il proprio braccio nel culo","Terrorizzare i bambini col costume di Berlusconi","Proclamare lo stato d'assedio","Avere un orgasmo dopo aver assaggiato la torta alle mele","Un cosplay hentai","\xA7Michael Jackson che si stringe le mani per ricreare la pubblicit\xE0 dei ringo","Iniettarsi la candeggina in vena per combattere il covid","Il mio cazzo come emoji","L'occhio di Sauron","Organizzare la corrida in un asilo nido","Fare sogni bagnati su una Babooshka","Farsi segare da una persona col parkinson","\xA7Saetta McQueen","\xA7Dio Portatore di Tuoni","Usare Stephen Hawking per il live action di cars","\xA7Dio bestia da soma in minia toma in minia soma in minia mosa in miniatura","Utilizzare una moka per costruire un reattore nucleare","L'odore di pube di topo","I dossi davanti all'asilo","\xA7Chiara Facchetti","L'impero asburgico","Le 23 pugnalate di Giulio Cesare","Il nonnismo","L'encefalite acuta","Accendere il riscaldamento come Nerone ha fatto a Roma","Diventare sborraman","Infilarsi le due torri gemelle in culo","Fare sesso non protetto con la nonna dei croods","Il trono di cazzi","\xA7Cenerentola","Scopare il gemello del tuo fidanzato","Scopare il gemello della tua fidanzata","Lo sciopero contro i diritti delle donne","Rifarsi le tette per fare un titjob migliore","Tua madre","\xA7Biancaneve e i 7 cazzi","\xA7Armando (della Pimpa)","Dormire in un letto da mezza piazza per evitare il sesso a sorpresa","\xA7Freddy Fazbear","\xA7Kermit la rana","Il bastone di Jack frost","Un'ustione di quinto grado","Svenire dopo aver visto una figa","Una sega con i piedi","\xA7Lucia Mondella","\xA7Torquato Tasso","Raggiungere le note di Ariana Grande mentre cavalchi un cazzo","Sganciare una mega scoreggia in un ascensore affollato","\xA7Gumball Watterson","Giocare a mosca cieca in autostrada","Andare a disoneste","Mettere in punizione i tuoi amici perch\xE9 sono troppo freaky","Il dissing dei me contro te","Tatuarsi l'occhio degli illuminati sul buco del culo","\xA7Dio aeroplano nella valle delle torri","Riprendere fiume","Il secondo triumvirato","Raccontare le proprie esperienze sessuali al club del libro","Assaggiare i reagenti colorati nel laboratorio di chimica","Avere un duello al funerale di tuo nonno","Essere investiti da un aereo","Eccitare il clitoride fino all'orgasmo","L'ergastolo per aver rubato un pacchetto di carte Pok\xE9mon","Una lesbica futurista","Essere ingravidati da Mahmood con lo sguardo","\xA7Rosario Muniz","Un pandoro farcito con la sborra","Dichiarare guerra all'Algeria","Un orgasmo a mani libere","Essere impalati dal dio bestia","Un satanasso molto promiscuo","Ruttare come una principessa camionista","Essere calpestato da un cazzone","Un bagno termale nel Vesuvio","\xA7Napoli a fuoco","Castrare i terroni","Correre scalzi nei prati sotto l'effetto di droghe pesanti","Infilare le palle in un orologio a pendolo che al posto del pendolo ha un'ascia","Smerdarsi nei calzoni in classe","Pomiciare con i paramedici venuti a soccorrere tuo padre","Vomitare vodka e funghetti allucinogeni in corsia 2 al conad","Togliersi la vita con una bottiglietta di plastica","Eh s\xEC eh Marco eh B porterai minecreft?","Infilarsi del potassio puro su per il culo per diventare un razzo","Evocare un demone per passare una seratina esotica","Svegliarsi senza un rene dopo una seratina romantica","Diventare frati per non essere chiamati alle armi","Diventare suora per non finire a letto con altri casi umani","\xA7Gerry Scotti","Un catetere","Sniffare cocaina dal buco del culo","Giocare a rugby usando un neonato come palla","Un'orgia con Meloni, Di Maio e Salvini","Mangiare un peperoncino piccante per sputare fiamme dal culo","\xA7Maurizio Merluzzo in drag","Essere eccitati alla vista del necrologio del giorno","Usare il proprio jet privato per fare una passeggiatina con il cane","\xA7Wanna Marchi","\xA7Elenoire Ferruzzi","Pulirsi il culo con delle unghie da 50 cm","Il phon acceso nella vasca da bagno","Amare le donne che sanno di merluzzo","Il sesso non protetto nel giardino dell'Eden","Portare ad ebollizione la sborra","\xA7Francesca Cipriani","\xA7Paolo Bonolis","\xA7Donatella Versace","\xA7Blanco","\xA7Peppe Brescia","\xA7Peppe Fetish","\xA7Rita de Crescenzo","Il gelato al profilattico","Essere dissati da Favij","Avere il primo orgasmo con un video di Favij","Lo scandalo di Chiara Ferragni e il pandoro","Le emorroidi a colazione","Lo strumentopolo misterioso di Topolino","Essere picchiati da papa Francesco","Una sfida a super smash bros con Baby K","Urlare \\"maledettiiii!\\" davanti a un giornalista","Urlare \\"Teresaaaa\\" davanti a un giornalista","I preti che vengono sui bambini","Urlare \\"BAAAAAM... SCOIATTOLO\\" a un funerale in un momento di silenzio","Girare tutti i crocifissi di un convento durante la notte e mettere un vinile di Nicky Minaj sull'altare","Un segone in classe al professore di matematica","Il dissidio interiore di Petrarca","Essere formaggino","La titolare del mc donalds","Le alette di pollo nella salsa sborra","Una nuova legge di bilancio che abolisce l'acquisto di sex toys","La marmitta di Saetta McQueen","Ricreare le torri gemelle con le frecce tricolore","Lo scisma d'oriente","Annusare le mutandine della vicina e venir colti in flagrante","Tradire il proprio partner con stephen Hawking","\xA7Stephen Hawking","Il biennio rosso","Comprare un reattore nucleare da Temu","Sostenere che il cambiamento climatico \xE8 solo una scusa per nascondere che gli gnomi sono ai vertici della societ\xE0","\xA7Greta Thunberg in perizoma","Curare il mal di gola con shottini di vodka","Il sadomaso come forma di apprendimento","\xA7Kim Jong-Un che stanna le Blackpink","Essere arrestati per spaccio di goleador","Usare i soldi del governo per costruire un megazord a dimensione reale","Il crollo di Wall Street del 1929","Il maestro tartaruga di Kung Fu Panda","I capelli di Marge Simpson","Divaricare le gambe per ricreare il segno della pace in un asilo","Instaurare una dittatura","I patti lateranensi","Un ordigno nucleare costruito da me e mio nonno","Scorreggiare cos\xEC tanto da far scattare l\u2019allarme anti gas","Annusare il culo ai passanti credendosi un cane","Un quadro dipinto da una scimmia con le emorroidi","Una collezione di porno con protagonisti nani ben dotati","Un cane che lecca il gelato spalmato sulle tue palle","Istigare le nuove generazioni alla bulimia","Scambiare di culla i neonati all'ospedale","Sganciare un'altra bomba atomica su Hiroshima","\xA7Ted Bundy e le sue mirabolanti avventure","Una scoreggia bagnata e letale","Il gran cazzone di satana","La vagina della madonna che gocciola arcobaleno liquido","La propaganda neonazista","Praticare BDSM con Matteo Salvini","Il sesso non protetto con le nutrie di parco Querini","Sentirsi una vera baddie quando si ha la ciola","Il sesso non protetto con i malati di AIDS","La Pimpa che apre le gambe","\xA7Papa Francesco che fa il cosplay di Stephen Hawking","Essere ebreo ed entrare nel lettino abbronzante sbagliato","I neri","I bianchi","Reintrodurre la pena di morte","Un pitbull in un parco giochi per bambini","Il passaggio dalla cocaina al crack","Violentare una capra","Eliminare San Marino dalla mappa","La parit\xE0 uomo-donna","Un nero, una puttana, un nordista e un omosessuale","La mafia rumena","Una storia d'amore con un parroco di 62 anni","Un parto prematuro","Avvinare il biberon con l'acido","Usare la vodka alla menta come collutorio","Un cinese caduto dall'alto","Piombare casualmente dal piano superiore rompendo il soffitto","Inculare durante il pegging con un trapano acceso","Rendere il prof di sostegno uno schiavo sessuale","Maritare il proprio cugino con un furry","\xA7Madonna binaria","\xA7IL 16 MARZOOOOOOOO","Il festival della salsiccia","Dei serpenti volanti che fanno sesso","Le mestruazioni","72 vergini","Covare un uovo","Il miracolo della nascita","Tirarlo fuori al reparto frutta della Conad","I privilegi dei bianchi","Il sangue di cristo","La selezione naturale","\xA7Gigi D'Alessio","La sacra bibbia","Girare un porno in un sotterraneo tedesco","I problemi con il proprio babbo","Il sesso orale non ricambiato","Due froci","Le mie tette","Il frutto proibito","Il sesso tra panda","I barboni","\xA7Dio","Il razzismo","Uno stupro su appuntamento","Le palline anali","I traumi infantili","I testimoni di geova","Un feto morto","La mia vagina","La mia bussy","\xA7Lady Gaga","Dei gavettoni al piscio di gatto","Avere peli pubici fra i denti","Saltare in sella ad una bicicletta senza il sellino","Dare una palpatina furtiva","La pucchiacca","\xA7Il Dio Bestia","\xA7Jeffrey Dahmer","\xA7Hello Kitty con una svastica sulla fronte","Tutti i bambini di una classe elementare di Rozzano","Il Gabibbo che confessa i suoi peccati a un poliziotto","Cucinare un feto alla piastra con burro e salvia","Vendere gli organi di un orfano su Vinted","Usare un crocifisso come sex toy di emergenza","Un tutorial su YouTube su come evadere le tasse con stile","Un dildo fatto di ghiaccio e rabbia repressa","Nascondere il cadavere della propria madre in casa per continuare a tirare la pensione","Il batacchio di BarbascuraX","Il batacchio","Il topocazzo","Usare il lungo becco di Pingu per un pompino supremo","Sputare sulla tomba di Pasolini","Un frocio nero","Un massaggio con happy ending in piazza Duomo","\xA7Fabio Rovazzi","La Regina Elisabetta II","Chiedere a un cieco se quando morir\xE0 vedr\xE0 anche lui la luce in fondo al tunnel","\xA7Tony Pitony","\xA7Bel\xE9n Rodriguez","\xA7Albert Einstein","\xA7Ariana Grande","\xA7Elettra Lamborghini","L'impellente desiderio di sedersi sulle ginocchia di Babbo Natale","Un allegro viaggetto in Romania nel cassone di un furgone sospetto","La compravendita illegale di video porno cinesi","\xA7Aldo Moro","\xA7Gianmarco Zagato","\xA7Papa Leone XIII","\xA7Vannacci","\xA7Dora L'esploratrice Anale","\xA7Silvio Berlusconi","\xA7Alfonso Signorini","\xA7San Pietro che usa le chiavi del Paradiso per fare un ditalino","\xA7Taylor Swift","Una sega circolare a cappella oscillante","Mettere tua sorella con la sindrome di down nell'insalata perch\xE9 anche lei \xE8 un vegetale","Una lesbica down","Le dickpic di San Paolo apostolo nelle lettere ai Corinzi","\xA7Joe Biden","\xA7Carlo Conti","Una barzelletta di Berlusconi per concludere la serata di sesso focoso","Porchino il dio piccolino","Le CipoLLe e LoLLe","Incidere sul proprio cazzo la sua lunghezza in Breil per essere pi\xF9 inclusivi","Diventare diabetici a causa del troppo glucosio assunto durante un bukkake","\xA7SIXSEVEN","\xA7San Francesco di Assisi","\xA7Antonella Clerici in overdose perch\xE9 ha preso l'MD sbagliato","\xA7Antonella Clerici","\xA7Cristina D'Avena","\xA7Alessandro Barbero","Una nutria atomica","Mettere un'anziana milf a 90\xB0 nel forno crematorio","Imparare a fare i soffocotti con il calippo in oratorio","Trovare tuo zio omofobo al pride di Rozzano con \\"Sono lesbica ma mi piace il cazzo\\" scritto sulla maglietta","Stimolare sessualmente la citt\xE0 di Pisa per raddrizzare la sua torre","Fare uno school shooting per errore","Essere un pilota d'aereo che ha solo sbagliato strada ma essere additato come un terrorista","L'incesto sperimentale digitale","Comprare l'Omosessualit\xE0 Pro Plus su Temu","Un power nap alla guida in autostrada a 150km/h","Il voto di castit\xE0 di Lucia Mondella","Ricevere il vero Gerry Jolly alla Ruota Della Fortuna","\xA7Mary Poppins","\xA7Peter Pan","\xA7Peter Griffin","\xA7Winnie The Pooh","\xA7Paperino","Lo Zio Paperone","Il crollo del Ponte Morandi","Smontare un piccone per verificare che non sia una telecamera del governo","Una pianta di marijuana decorata come un albero di Natale","Le gravidanze minorili","L'analfabetismo funzionale","Trovare un enjambement nella verifica di matematica","Mettere in scena la Strage degli Innocenti in chiave furry","\xA7Sigmund Freud","Essere scomunicati dal Papa nel ventunesimo secolo","Riscoprire i piaceri della dieta mediterranea ad un banchetto cannibalista","\xA7Maria Antonietta","Le barzellette di Berlusconi","Spacciare per caramelle le pastiglie della lavastoviglie","\xA7Max Pezzali","\xA7Walt Disney","L'orecchio mozzato di Van Gogh","Dire a un femboy che \xE8 solo un trans codardo","\xA7Pietro Gamba Di Legno","L'ideologia progressista del Podcasterone","Chiedere a un pansessuale che crema ha messo sul pane","\xA7Jessica Rabbit","\xA7Don Abbondio","Fondare una religione per non ammettere di aver fatto sesso prima del matrimonio","La bromance","Un ciclo-imbecille","\xA7Darwin Raglan Caspian Ahab Poseidon Nicodemus Watterson III","Il darwinismo sociale","La Signora in Giallo","\xA7Federico Secondo Di Svevia","Una relazione non-demi curiosa e semi-binaria","Il vandalismo piromane","Scegliere di diventare una suora laica","Il tetano","L'obesit\xE0","Gli orribili incidenti dovuti alla depilazione laser","La banda bassotti","Il miracolo della resurrezione di Ges\xF9","Le iniezioni ormonali","I miei genitali","La mia patong","Fare birdwatching","Un robusto mongoloide","Lo stato illegittimo di israele","L'alcolismo","Un delfino molesto","Gli orfanelli","Il petting duro","\xA7Tot\xF2 Riina","I pattini Lateranensi","Fare gorgheggi in momenti inappropriati","Gli obbiettivi politici degli omosessuali","Curare l'AIDS col potere dell'amore","Organizzare lotte clandestine di pollame","Un soprammobile della Thun","Copiare a scuola grazie a un vibratore nel culo che invia le risposte in codice morse","Crescere la nuova generazione di valorosi balilla","Vendere uranio in polvere come preparato per il matcha","Usare il succo di pera come lubrificante","Le Haribo edizione piselloni duri duri","Svegliarsi post serata in un paesino balcano sconosciuto","Andare a comprare il latte","\xA7Pippo Baudo","Una threesome con Alberto e Piero Angela","Guardare i cantieri perch\xE9 PornHub \xE8 offline","\xA7Elena (provincia di Troia)","Pagare il tassista in natura","Un albanese imbruttito","Temperare il naso di pinocchio per una penetrazione efficace","Essere messi nel gruppo dei bambini speciali alle elementari","Evadere il fisco","Essere disabili al punto di prendere la 105","Un burro cacao per le labbra della figa","I 44 gatti in fila per 6 senza resto (due sono stati investiti)","Il riciclaggio di denaro della chiesa","Rimanere infognati nei traffici della mafia rumena","Simulare un orgasmo gridando come una capra affamata","\xA7Giovanni Verga","Un fenicottero assassino","Portare gli epilettici in discoteca","Il sesso anale a sorpresa","\xA7Rita Levi Montalcini","Mettere il dito nel culo di pikachu e prendere la scossa","Sfidarsi a una gara di lancio di bocce incendiarie","Il gatto di Schr\xF6dinger","\xA7Kim Jong Un","Delle massaggiatrici cinesi molto esperte","La necromanzia","Una commozione cerebrale","Andare in luna di miele in Polonia dopo delle nozze ebraiche","Assumere la noce moscata per avere visioni mistiche","\xA7Albano","Un omicidio preterintenzionale","Il revenge porn minorile","\xA7Jannick Sinner","\xA7Ronaldo","\xA7Duffy Duck","\xA7Il Piccolo Principe","Un Chupa Chups pucciato nella candeggina","Lo sbiancamento anale","Un cancro ai testicoli","\xA7Posaman","La demenza senile","Commettere crimini d'odio","Fare la falloplastica a un trans","Mettere audio porno a palla nelle casse dell'asilo","Le protesi che esplodono in aereo","Giocare a guardie e ladri con i caschi blu","\xA7Dorico, Ionico e Corinzio","Le mazzate nel nome di Dio","Lo Yodel del Cazzo","L'improvvisa sensazione di sentirsi osservati mentre si sta facendo la pop\xF2","\xA7Renato Zero","Approfittare di un'esplosione nucleare per prendere la tintarella","Arbeit macht frei (Il lavoro rende liberi)","Dare 4 pugni al tuo amico perch\xE9 \xE8 passato un'auto gialla con a bordo 3 cinesi","Sesso omosessuale con Pasolini","Comizi pasoliniani tra drag queen e democristiani","L'Eni con la massoneria","Rievocare gli eventi delle guerre puniche con uno spettacolo di teatro danza","Diventare un femboy per evitare la chiamata alle armi","Fare la traversata dell'Atlantico in pedal\xF2","Il Gabibbo","Il razzismo tra pinguini","\xA7Dod\xF2 dell'Albero Azzurro","\xA7Netanyahu-Kun","Tirare una riga su un cazzo cos\xEC enorme da rischiare l'overdose","Seguire un tutorial di Benedetta Parodi su come cucinare il crack","\xA7Elon Musk","Giocare alla versione solitaria della roulotte russa","Scoprire che il proprio sperma \xE8 un fluido non newtoniano","Una sedia elettrica brandizzata Elsa di Frozen","Prendere a badilate tuo fratello","\xA7Geronimo Stilton","\xA7Geronimo Stilton che sorprende i bambini con la sua codina","Uno show di drag queen fasciste","Una mega orgia entomologica","Ritrovarsi a combattere nel gulag dopo essere stati abortiti","Un serial killer che uccide con una motosega di Kuromi","Offrire alla tua femmina la colla stick come burro cacao","Fare un bocchino appassionato ad una calibro 32","Appendere lo zio fascista in cantina vicino alle provole stagionate","Il muscolo sternocleidomastoideo","Guardare un porno gay satanico","Farsi il piercing alla figa","Una suora camorrista che libera gli ebrei dai campi di concentramento","Nominare San Francesco come primo furry della storia","Il comitato N.G.G.Y.U. (Never Gonna Give You Up)","La repubblica di Sal\xF2","L'asse Roma-Berlino-Tokyo","La gallina blasfema che dice 'coccodio'","Il sexy nasone di Dante Alighieri","Una gotica culona","Una ragazzina di 14 anni fan degli one direction, in preda alla crisi ormonale","Una tracheotomia in stile Charlie Kirk","Portare il tuo amico disabile nell'orto cos\xEC fa amicizia con gli altri vegetali","Definire \\"Terronista\\" ogni musulmano sotto il Po","Dei bicipiti enormi","Essere San Tommaso e masturbarsi con le stigmati del Signore","Lo sguardo sexy e seducente di Luca Zaia","Una collezione di vibratori a forma di Puffi","Una crociera con pandemia a sorpresa","Fare birdwatching in una discarica","L'Hentaivirus","Il Covid-19","Il Covid-69","Essere immune allo spray al peperoncino perch\xE9 sei calabrese","Fare I pancakes con la sburra al posto del latte","Fare una torta con lo zucchero in bustina","Usare la forfora al posto della coca","Predere la pillola del giorno dopo con la redbull perch\xE8 il bambino possa mettere le ali prima di andarsene","Spiegare ad un uomo etero come sforbiciano le lesbiche","\xA7Messi","Affittare un pony con la sindrome di down","\xA7Zerocalcare","Dei procioni ubriachi","La legge di Lavoisier","\xA7Hatsune Miku","Avere le dita verdi dopo aver sditalinato Fiona","Un led lampeggiante a forma di Michael Jackson","I lividi al palato dopo il sesso orale duro","Una sega a due mani","Essere come una salsiccia: budello fuori e maiala dentro","Diego Armando Maradona","Pablo Diego Jos\xE9 Francisco de Paula Juan Nepomuceno Mar\xEDa de los Remedios Cipriano de la Sant\xEDsima Trinidad Ruiz y Picasso","Usare il locker dei pacchi Amazon come un calendario dell'avvento rumeno","Una pazzerella sessione di fisting con i piedi","Pippare","La cocaina nella pussy","La canzone della sborra","Cagarsi addosso sulle montagne russe glassando i passanti","An Emo Boy","Pippare cocaina attraverso un flauto traverso","Pippare farina di ceci","Delle troie al pesto","Una sforbiciata barese","Le palle al sugo","Un poppante gustoso","Essere un israeliano","Essere un'israeliana","Farsi cremare e avere le proprie ceneri mescolate con la plastica e fatte in cannucce per continuare a essere succhiati anche dopo la morte","Sparare scintille dalle tette","\xA7Anna Tatangelo","Le tette di Lady Gaga","\xA7Il matrimonio di Anna Tatangelo","Fare i variopinti versi di Michael Jackson per conquistare una donna","\xA7Mario Roggero","Giocare alla roulette russa con Mario Roggero","Vendere bambini su Vinted","Lapidare qualcuno finch\xE9 non diventa un abuso edilizio","Chiedere in prestito ai vicini lo scopino del WC","\xA7Adamo ed Eva","Un evidente problema di coordinazione","40 minuti di canzoni d'amore su radio KissKiss","La magia nera","Scagliare la prima pietra","Una famiglia di rom","Un suicidio collettivo per evitare la fine del mondo","La morte","La droga","Fare l'occhiolino a un cieco","La diretta del mio parto","Una colonscopia con un pizzico di ironia","Aprire il sedere","Dover rigirare la scena della doppia penetrazione, per di pi\xF9 sorridendo","\xA7Fedez","Il Molise","La mia anaconda","Quel po' di razzismo che in fondo c'\xE8 in ognuno di noi","L'armonia come scelta politica","\xA7Marco Mengoni","Le cure palliative","La dialettica di sgarbi","La Terronia","\xA7Beyonc\xE9","Avere lo scroto prensile","L'uomo cannone","Una sega spagnola","L'incontinenza","Non essere una ciliegia","Rasarsi l'ano","Un clown pedofilo","Le perversioni sessuali","Un nano rosso incazzato","Partorire in una stalla","Le mammine pancine","Godo (provincia di Ravenna)","Sputare per lubrificare","Impiegare pi\xF9 di 3 minuti per trovare il clitoride","Un pompino a tradimento","Prostituirsi nel parcheggio della Lidl","Mio cugino Asdrubale","Trasformare la casa della nonna defunta in uni strip club","Lo sburramis\xF9","Fustigarsi sulle gonadi in maniera tribale","\xA7Kuromi","\xA7Mario Roggero ed Elettra Lamborghini che si sfidando per eleggere il vero pistolero","Avere delle belle chiappette","Uno scrotocefalo ambivalente","Un porno con 20 minorenni","Un'orchidea al maschile","Un femboy molto puccioso","\xA7Mara Venier","\xA7Annalisa","La sabbia nelle mutande","Quando la passione e il taboo si mescolano e nasce un incesto nonna-nipotina","Una coppetta mestruale dentata","Ricordarsi di aver perso il gioco","\\"Endovena Chi\\" (Il gioco preferito dai tossici)","La ferramenta \\"Alla Sveltina\\" per chiavi in 3 minuti","Il latte di toro","Un martellino e un falcetto per comunisti alle prime armi","\xA7Charles Leclerc","L'Impellente desiderio sessuale di essere investiti ripetutamente da una macchina guidata da Charles Leclerc","\xA7Gru","Il sesso omosessuale sub-incestulso non consensuale tra Minions","I Minions","Lo Jagermeister","I Watussi","Solleticare i piedini del beb\xE8 facendo un ditalino a una donna incinta","Una cavalla disabile","\xA7Puffetta","L'eutanasia","\xA7Fabio Tozzi","\xA7Tozzi Fabio","La sburrata","Avere il naso sporco dopo le pippe al sugo","Quel chiattone di Pompompurin","\xA7Paolo Ruffini","Giocare a RisiKo sulla pelle di un malato di vitiligo","Scopare per terra come un Roomba","\xA7Osanna nell'alto dei cieli","Rubare il rame per fare un cosplay di Dracula culturalmente accurato","La Fiat 504","Strusciarlo in giro per asserire dominanza","Quella volta in cui i paparazzi inseguirono Maria De Filippi e lei inizi\xF2 a fare parkour per scappare da loro","\xA7Pillon","Il generale Vantonto","Inquinare il pi\xF9 possibile per far sprofondare la Sardegna nel Mediterraneo","La violenza, l'odio indiscriminato e le scureggie","Mettere la freccia a destra e girare a sinistra perch\xE9 si \xE8 ritardati","La puttana della mamma di chi sta leggendo","\xA7Scientology","Dei twink allo spiedo","Il nostro piccolo amico minorato","Uno gnomo armato di ascia","Stare sul divano a guardarsi crescere le unghie dei piedi","La magika foresta dei twink formaggini","Essere omega ma apprezzarlo","\xA7Indiana Jones","\xA7Don Matteo","\xA7Spiderman","\xA7Deadpool","Un panda un po' tontolone","Il film \\"Alla ricerca di Nemo 3\\" (Ambientato in un ristorante sushi)","\xA7Drake e il suo lungo pene","\xA7Roma N57686 (La targa dell'auto in cui venne trovato il corpo di Aldo Moro)","Assaggiare le patatine al gusto cazzo","Scoprire che l'anguria non \xE8 acqua","\xA7Ornella Vanoni","Il Masseo","Un coniglietto impressionato dal sedere di un altro coniglietto","\xA7Morgan e Bugo- Ma dov'\xE8 andato?","\xA7Samantha Cristoforetti","\xA7Pippi Cazzilunghi","Ballare il tucatuca per difendersi dal barbone notturno molesto","Un porno di una gang bang con 15 gay jugoslavi registrato nel profondo di un bunker antiatomico sovietico","Aprire un conto bancario in Bosnia rubando l'identit\xE0 del tuo migliore amico","Il tipo che si stava facendo una sega durante l'eruzione del vulcano a Pompei","Avere rapporti con 1058 uomini in 12 ore","Risparmiare sul volo in aereo facendo l'elicottero col calzo","Un'ora di silenzio interrotta ogni tanto da Michael Jackson che urla","Imparare a suonare il banjo con le labbra della fica","Il Dio asdrubale","La Madonna contr\xECca","Spezzarsi il batacchio perch\xE8 la moltiplicazione dei pesci non si fa da sola","La culotetta con patate","L'iconica Jiafei","Dei bonazzi palestrati tutti sudati","Suonare un gong del 1700 AC prendendolo a testate","Gli istinti e le voglie omosessuali che tutt* abbiamo nel cuore","Il Grinch","Una puttana raffinata","La morte della madre di Bambi","Appiccicare i testicoli sul finestrino","Sposarsi tra cugini","Una compilation delle migliori eiaculazioni facciali","\xA7Roberto Benigni","La disfunzione erettile","Il pomo d'Adamo della mia ragazza","Pensare a tua nonna per ritardare l'eiaculazione","Il mio testicolo mancante","Il tuo caldo respiro sul mio collo","Il saluto fascista","Svegliarsi tetraplegici","La cipolla","Fare la pecorina, ma nel presepe","Cantare Bella Ciao","Partire alla scoperta della Thailandia","Il multiculturalismo","Uno schiuma party con lo sperma","Usare le palline da ping pong per dei giochini anali","Il fisco","\xA7Mussolini","La Malaysia Airlines","Essere indagati per favoreggiamento della prostituzione","L'acqua di russia","\xA7Michael Jackson con la sindrome di tourette","Il Burkina Faso","\xA7Aldo, Giovanni e Giacomo","Un cazzo tatuato sul naso","La lotta di classe","Un plug anale con coda da gatto attaccata","\xA7Pedro Pascal","\xA7Anne Hathaway","Essere indagati per favoreggiamento della prostituzione minorile","Due mongoplettici","Avere il pi\xF9 grande, prepotente e iconico culo del mondo","Un gruppo di suore che si divertono","\xA7Libert\xE8, Egalit\xE9 e Loredana Bert\xE8","La morte che viene all'improvviso","\xA7Giorgia Meloni","\xA7Shannon De' Bussy","La maremma buhaiola","La clamidia","Una vecchia sdentata capacissima a fare pompe","Invitare Orietta Berti al proprio compleanno","\xA7Sdentato (di Dragon Trainer)","\xA7San Gennaro","\xA7Gabriele D'Annunzio","La 1004 (la 104 suprema)","Organizzare una rage room con varie minoranze da poter malmenare","Riprendere dove il baffo si era fermato per risolvere la situa in Palestina","Spendere gli ultimi giorni in Asia Occidentale attendendo una morte col botto","Usare un tappo di sughero come pratico rimedio alla diarrea","Un cuscino scoreggino sulla sedia del giudice al processo per stupro","Gli atroci esperimenti che i giapponesi facevano sui prigionieri di guerra","\xA7Ficarra e Picone","Il colon irritabile","Un adorabile Teletubbie arrestato per favoreggiamento della prostituzione, evasione fiscale e bancarotta fraudolenta","Andare a Predappio a pregare sulla tomba del duce.","Baciare religiosamente il busto di Mussolini","Svegliarsi ancora cacati","Sedersi in faccia a qualcuno per rimanergli in testa","\xA7Caparezza","Un culo sfondato","\xA7Serena Brancale remigrata al suo Paese","La remigrazione","Un festino a Cavazzale","Venire investiti da un muletto al supermercato","\xA7Federica Pellegrini","Il Ku Klux Klan","Le emorroidi come autodifesa naturale all'inculata","Ridere cos\xEC tanto che il tampax salta via e colpisce un bimbo in fronte","L'essenza di trans","Vedere la propria nonna diventare un furry","Mettere dell'esplosivo in un rose toy","\xA7Un adenosarcoma infantile","Scoprire che i peli pubici di Loredana Bert\xE8 sono blu","Il Piccolo Coro dell'Antoniano","\xA7Orietta Berti che spara a Fabio Rovazzi","Il razzismo dei BTS","Un mix di J\xE4ger e sborra di toro","Le voci che dicono di bere","I pomme de terre avec les pieds","Un preservativo multicolor","Il libro fatto con l'ai di Follettina Creation","Netanyahu","Fare la cacca nei water in vendita dell'IKEA","\xA7Ges\xF9 in coma etilico perch\xE9 non riesce a bere acqua senza tramutarla in vino","\xA7Rosa Park","Quella volta in cui lei ha detto di togliere il dito  ma io ero gi\xE0 venuto","Avere bisogno del tosaerba per trovare il buco della fessa","\xA7Sailor Moon","\xA7Mastrolindo","Un artista di strada che suona Despacito con il violino","Eiaculare nello spazio sperando di creare nuove forme di vita aliene","Scegliere il pene perch\xE8 il pane \xE8 banale","\xA7Kazungula (una cit\xE0 dello Zambia)","Il nazismo multietnico","Temperare le matite col culo","Shakerare le chiappe","Una turbotroia","\xA7Giovanni Rana","Essere sulle strisce ma non mentre si attraversa la strada","Mettersi un sacchetto di caramelle nel culo","Donald trump che suona la fisarmonica","\xA7Gianluca Vacchi","\xA7Hitler Super Saiyan","Fingersi down per molestare gli sconosciuti","Un volo Ryanair per Auschwitz","Le migliaia di vittime delle Torri Gemelle","La biancheria intima di Harry Styles","Una paperella gay","Evitare gli arcobaleni per paura degli omosessuali e dei ginger","Sfruttare il collasco cosmico universale per un 69 a gravit\xE0 zero","Un nero gotico","I problemi di alcolismo","Un Pok\xE9mon di fuoco che crede nella purezza della razza","Prendere a mazzate un ebreo","Lu\xEC dei Me contro Te che trapana ges\xF9","Applaudire con le chiappe","Fare un rituale satanico con le Yankee Candle natalizie","Riportare in vita il duce","Le foto piedi di scimmie calabresi","Dei bambini neri schiavizzati","Degli elefanti arrapati","Elenoire Ferruzzi che uccide vannacci a tettate","Essere gay ma avere il cazzo lesbico","Un giro a trans brasiliani","Essere rapiti da 6 clown autistici","Diventare il cavallo di troia per avere 30 uomini dentro di s\xE9","Giocare d'azzardo per raccogliere fondi per il partito comunista","Usare la cocaina al posto del Nesquik","Avere le sembianze di un herpes geniale","Regalare palloncini di forme falliche durante il carnevale","\xA7Pinkie Pie","Un'orgia con le cavalline di My Little Pony","Una ciste fra i testicoli","Lo sburro di cacao sulle labbra","Cagarsi in mano e applaudire","Sapere quanto vale la tua auto","Pechino express edizione Calabria","Leccare il dildo di una lesbica","Un suicidio assistito in Svizzera","Un esperimento nazista sugli esseri umani","Essere presi a pisellate in faccia sul ponte vecchio di Bassano","Essere cos\xEC zoccola che quando si compila un documento dove c'\xE8 scritto 'data' si scrive 's\xEC'","\xA7Topolino che chiama Toodles perch\xE9 gli serve lo strumentopolo misterioso a letto Minnie","Infilarsi un platano nel culo","Tirare una raglia cos\xEC grande da far crollare Nettuno","Un tuffo sinistro","Concepire un figlio eiaculando in un calzino e pucciandolo pi\xF9 tardi","Un involtino creativo con caramella gommosa e nutella","Scoprire che Perry L'ornitorinco \xE8 stato Doge della Repubblica di Venezia","Avere cos\xEC tanti peli nel culo che la diarrea diventa acqua potabile filtrata microbiologicamente pura","I bambini cinesi","Entrare in una sinagoga con un sacchetto di prepuzi tagliati"]` }, "dirs": { "/application/include/cards": ["barbainventori", "cinesi_xxx", "famiglia_disfunzionale", "lana", "melanie_martinez", "safe", "speciale_dnd", "standard"], "./public/assets/pfps": ["1.jpg", "10.jpg", "100.jpg", "101.jpg", "102.jpg", "103.jpg", "104.jpg", "105.jpg", "106.jpg", "107.jpg", "108.jpg", "109.jpg", "11.jpg", "110.jpg", "111.jpg", "112.jpg", "113.jpg", "114.jpg", "115.jpg", "116.jpg", "117.jpg", "118.jpg", "119.jpg", "12.jpg", "120.jpg", "121.jpg", "122.jpg", "123.jpg", "124.jpg", "125.jpg", "126.jpg", "127.jpg", "128.jpg", "129.jpg", "13.jpg", "130.jpg", "131.jpg", "132.jpg", "133.jpg", "134.jpg", "135.jpg", "136.jpg", "137.jpg", "138.jpg", "139.jpg", "14.jpg", "140.jpg", "141.jpg", "142.jpg", "143.jpg", "144.jpg", "145.jpg", "146.jpg", "147.jpg", "148.jpg", "149.jpg", "15.jpg", "150.jpg", "151.jpg", "152.jpg", "153.jpg", "154.jpg", "155.jpg", "156.jpg", "157.jpg", "158.jpg", "159.jpg", "16.jpg", "160.jpg", "161.jpg", "162.jpg", "163.jpg", "164.jpg", "165.jpg", "166.jpg", "167.jpg", "168.jpg", "169.jpg", "17.jpg", "170.jpg", "171.jpg", "172.jpg", "173.jpg", "174.jpg", "175.jpg", "176.jpg", "177.jpg", "178.jpg", "179.jpg", "18.jpg", "180.jpg", "181.jpg", "182.jpg", "183.jpg", "184.jpg", "185.jpg", "186.jpg", "187.jpg", "188.jpg", "189.jpg", "19.jpg", "190.jpg", "191.jpg", "192.jpg", "193.jpg", "194.jpg", "195.jpg", "196.jpg", "197.jpg", "198.jpg", "199.jpg", "2.jpg", "20.jpg", "200.jpg", "201.jpg", "202.jpg", "203.jpg", "204.jpg", "205.jpg", "206.jpg", "207.jpg", "208.jpg", "209.jpg", "21.jpg", "210.jpg", "211.jpg", "212.jpg", "213.jpg", "214.jpg", "215.jpg", "216.jpg", "217.jpg", "218.jpg", "219.jpg", "22.jpg", "220.jpg", "221.jpg", "222.jpg", "223.jpg", "224.jpg", "225.jpg", "226.jpg", "227.jpg", "228.jpg", "229.jpg", "23.jpg", "230.jpg", "231.jpg", "232.jpg", "233.jpg", "234.jpg", "235.jpg", "236.jpg", "237.jpg", "238.jpg", "239.jpg", "24.jpg", "240.jpg", "241.jpg", "242.jpg", "243.jpg", "244.jpg", "245.jpg", "246.jpg", "247.jpg", "248.jpg", "249.jpg", "25.jpg", "250.jpg", "251.jpg", "252.jpg", "253.jpg", "254.jpg", "255.jpg", "256.jpg", "257.jpg", "258.jpg", "259.jpg", "26.jpg", "260.jpg", "261.jpg", "262.jpg", "263.jpg", "264.jpg", "265.jpg", "266.jpg", "267.jpg", "268.jpg", "269.jpg", "27.jpg", "270.jpg", "271.jpg", "272.jpg", "273.jpg", "274.jpg", "275.jpg", "276.jpg", "277.jpg", "278.jpg", "279.jpg", "28.jpg", "280.jpg", "281.jpg", "282.jpg", "283.jpg", "284.jpg", "285.jpg", "286.jpg", "287.jpg", "288.jpg", "289.jpg", "29.jpg", "290.jpg", "291.jpg", "292.jpg", "293.jpg", "294.jpg", "295.jpg", "296.jpg", "297.jpg", "298.jpg", "299.jpg", "3.jpg", "30.jpg", "300.jpg", "301.jpg", "302.jpg", "303.jpg", "304.jpg", "305.jpg", "306.jpg", "307.jpg", "308.jpg", "309.jpg", "31.jpg", "310.jpg", "311.jpg", "312.jpg", "313.jpg", "314.jpg", "315.jpg", "316.jpg", "317.jpg", "318.jpg", "319.jpg", "32.jpg", "320.jpg", "321.jpg", "322.jpg", "323.jpg", "324.jpg", "325.jpg", "326.jpg", "327.jpg", "328.jpg", "329.jpg", "33.jpg", "330.jpg", "331.jpg", "332.jpg", "333.jpg", "334.jpg", "335.jpg", "336.jpg", "337.jpg", "338.jpg", "339.jpg", "34.jpg", "340.jpg", "341.jpg", "342.jpg", "343.jpg", "344.jpg", "345.jpg", "346.jpg", "347.jpg", "348.jpg", "349.jpg", "35.jpg", "350.jpg", "351.jpg", "352.jpg", "353.jpg", "354.jpg", "355.jpg", "356.jpg", "357.jpg", "358.jpg", "359.jpg", "36.jpg", "360.jpg", "361.jpg", "362.jpg", "363.jpg", "364.jpg", "365.jpg", "366.jpg", "367.jpg", "368.jpg", "369.jpg", "37.jpg", "370.jpg", "371.jpg", "372.jpg", "373.jpg", "374.jpg", "375.jpg", "376.jpg", "377.jpg", "378.jpg", "379.jpg", "38.jpg", "380.jpg", "381.jpg", "382.jpg", "383.jpg", "384.jpg", "385.jpg", "386.jpg", "387.jpg", "388.jpg", "389.jpg", "39.jpg", "390.jpg", "391.jpg", "392.jpg", "393.jpg", "394.jpg", "395.jpg", "396.jpg", "397.jpg", "398.jpg", "399.jpg", "4.jpg", "40.jpg", "400.jpg", "401.jpg", "402.jpg", "403.jpg", "404.jpg", "405.jpg", "406.jpg", "407.jpg", "408.jpg", "409.jpg", "41.jpg", "410.jpg", "411.jpg", "412.jpg", "413.jpg", "414.jpg", "415.jpg", "416.jpg", "417.jpg", "418.jpg", "419.jpg", "42.jpg", "420.jpg", "421.jpg", "422.jpg", "423.jpg", "424.jpg", "425.jpg", "426.jpg", "427.jpg", "428.jpg", "429.jpg", "43.jpg", "430.jpg", "431.jpg", "432.jpg", "433.jpg", "434.jpg", "435.jpg", "436.jpg", "437.jpg", "438.jpg", "439.jpg", "44.jpg", "440.jpg", "441.jpg", "442.jpg", "443.jpg", "444.jpg", "445.jpg", "446.jpg", "447.jpg", "448.jpg", "449.jpg", "45.jpg", "450.jpg", "451.jpg", "452.jpg", "453.jpg", "454.jpg", "455.jpg", "456.jpg", "457.jpg", "458.jpg", "459.jpg", "46.jpg", "460.jpg", "461.jpg", "462.jpg", "463.jpg", "464.jpg", "465.jpg", "466.jpg", "467.jpg", "468.jpg", "469.jpg", "47.jpg", "470.jpg", "471.jpg", "472.jpg", "473.jpg", "474.jpg", "475.jpg", "476.jpg", "477.jpg", "478.jpg", "479.jpg", "48.jpg", "480.jpg", "481.jpg", "482.jpg", "483.jpg", "484.jpg", "485.jpg", "486.jpg", "487.jpg", "488.jpg", "489.jpg", "49.jpg", "490.jpg", "491.jpg", "492.jpg", "493.jpg", "494.jpg", "495.jpg", "496.jpg", "497.jpg", "498.jpg", "499.jpg", "5.jpg", "50.jpg", "500.jpg", "501.jpg", "502.jpg", "503.jpg", "504.jpg", "505.jpg", "506.jpg", "507.jpg", "508.jpg", "509.jpg", "51.jpg", "510.jpg", "511.jpg", "512.jpg", "513.jpg", "514.jpg", "515.jpg", "52.jpg", "53.jpg", "54.jpg", "55.jpg", "56.jpg", "57.jpg", "58.jpg", "59.jpg", "6.jpg", "60.jpg", "61.jpg", "62.jpg", "63.jpg", "64.jpg", "65.jpg", "66.jpg", "67.jpg", "68.jpg", "69.jpg", "7.jpg", "70.jpg", "71.jpg", "72.jpg", "73.jpg", "74.jpg", "75.jpg", "76.jpg", "77.jpg", "78.jpg", "79.jpg", "8.jpg", "80.jpg", "81.jpg", "82.jpg", "83.jpg", "84.jpg", "85.jpg", "86.jpg", "87.jpg", "88.jpg", "89.jpg", "9.jpg", "90.jpg", "91.jpg", "92.jpg", "93.jpg", "94.jpg", "95.jpg", "96.jpg", "97.jpg", "98.jpg", "99.jpg"], "./public/assets/icon_imgs": ["1.png", "10.png", "11.png", "12.png", "13.png", "14.png", "15.png", "16.png", "17.png", "18.png", "19.png", "2.png", "20.png", "21.png", "22.png", "23.png", "24.png", "25.png", "26.png", "27.png", "28.png", "29.png", "3.png", "30.png", "31.png", "32.png", "4.png", "5.png", "6.png", "7.png", "8.png", "9.png"] } };
      var clean = (p) => String(p || "").replace(/\\/g, "/").replace(/\/$/, "");
      module.exports = {
        existsSync: (p) => {
          const k = clean(p);
          return Boolean(VFS.files[k] !== void 0 || VFS.dirs[k] !== void 0);
        },
        readFileSync: (p) => {
          const k = clean(p);
          if (VFS.files[k] === void 0) throw new Error("VFS file non trovato: " + k);
          return VFS.files[k];
        },
        readdirSync: (p, opts) => {
          const k = clean(p);
          const list = VFS.dirs[k] || [];
          if (opts && opts.withFileTypes) {
            return list.map((name) => ({ name, isDirectory: () => true }));
          }
          return [...list];
        },
        renameSync: () => {
        }
      };
    }
  });

  // application/include/script/generazione.js
  var require_generazione = __commonJS({
    "application/include/script/generazione.js"(exports, module) {
      var __dirname = "/application/include/script";
      var fs = require_fs();
      var path = require_path();
      var alphabet = "QWERTYUIOPASDFGHJKLZXCVBNM1234567890qwertyuiopasdfghjklzxcvbnm@#!\xA3$%&/";
      var pfpPathServer = "./public/assets/pfps/";
      var pfpPath = "/assets/pfps/";
      var iconPathServer = "./public/assets/icon_imgs/";
      var iconPath = "/assets/icon_imgs/";
      var generateId = async (length, memory = /* @__PURE__ */ new Set()) => {
        let code = "";
        const utilize = length <= 7 ? alphabet.slice(0, alphabet.indexOf("0")) : alphabet;
        length = length > utilize.length ? utilize.length : length;
        do {
          code = "";
          for (let i = 0; i < length; i++) {
            let index;
            do {
              index = Math.floor(Math.random() * utilize.length);
            } while (utilize[index] === code[i - 1]);
            code += utilize[index];
          }
        } while (await memory.has(code));
        await memory.add(code);
        return code;
      };
      var getknownPacks = () => {
        const dirs = fs.readdirSync(path.join(__dirname, "../cards/"), { withFileTypes: true });
        return dirs.filter((dir) => dir.isDirectory()).map((dir) => dir.name);
      };
      var datiNomi = null;
      var preparaEstrazione = (lista, pesoDi2) => {
        let totale = 0;
        const cumulativi = lista.map((elemento) => {
          totale += pesoDi2(elemento);
          return totale;
        });
        return { lista, cumulativi, totale };
      };
      var scegliPesato = ({ lista, cumulativi, totale }) => {
        if (!lista.length) return void 0;
        const punto = Math.random() * totale;
        for (let i = 0; i < cumulativi.length; i++) {
          if (punto < cumulativi[i]) return lista[i];
        }
        return lista[lista.length - 1];
      };
      var pesoDi = (elemento) => elemento.peso > 0 ? elemento.peso : 1;
      var caricaNomi = () => {
        if (datiNomi) return datiNomi;
        try {
          const filePath = path.join(__dirname, "../names/names.json");
          const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
          const names = (data.names || []).map((n) => typeof n === "string" ? { nome: n, genere: "n" } : n).filter((n) => n && n.nome);
          const adjectives = (data.adjectives || []).map((a) => typeof a === "string" ? { n: a, m: a, f: a, p: a, fp: a } : a).filter(Boolean);
          datiNomi = {
            names,
            adjectives,
            estrazioneNomi: preparaEstrazione(names, pesoDi),
            estrazioneAggettivi: preparaEstrazione(adjectives, pesoDi)
          };
        } catch (error) {
          console.error("Errore durante la lettura del file JSON:", error.message);
          datiNomi = {
            names: [],
            adjectives: [],
            estrazioneNomi: preparaEstrazione([], pesoDi),
            estrazioneAggettivi: preparaEstrazione([], pesoDi)
          };
        }
        return datiNomi;
      };
      var generateName = () => {
        const dati = caricaNomi();
        if (!dati.names.length) return "Giocatore Anonimo";
        const nome = scegliPesato(dati.estrazioneNomi);
        if (!dati.adjectives.length) return nome.nome;
        const aggettivo = scegliPesato(dati.estrazioneAggettivi);
        const genere = ["m", "f", "n", "p", "fp"].includes(nome.genere) ? nome.genere : "n";
        const forma = aggettivo[genere] || aggettivo.n || aggettivo.m || aggettivo.f || aggettivo.p || "";
        return (nome.nome + " " + forma).trim();
      };
      var INDICE_DELLE_FRASI = 0;
      var translateToPack = (packs) => {
        try {
          const results = [];
          let indice = -1;
          for (const stringa of packs) {
            indice++;
            if (typeof stringa !== "string") {
              results.push(stringa);
              continue;
            }
            const perFrasi = indice === INDICE_DELLE_FRASI;
            const lines = stringa.split(/\r?\n/).filter((line) => line.trim() !== "");
            let array = [];
            for (let line of lines) {
              line = line.trim();
              const string = line[0]?.toUpperCase() + line.slice(1);
              if (!perFrasi) {
                array.push(string);
                continue;
              }
              const spazi = (line.match(/_/g) || []).length;
              array.push(spazi !== 0 ? [
                string,
                spazi
              ] : string);
            }
            results.push(array);
          }
          return results;
        } catch (error) {
          console.log(error);
          return false;
        }
      };
      var contaFile = (cartella, estensione) => {
        try {
          const suffisso = "." + estensione.toLowerCase();
          const file = fs.readdirSync(cartella).filter((file2) => path.extname(file2).toLowerCase() === suffisso).sort((a, b) => a.localeCompare(b, void 0, { numeric: true }));
          const totale = file.length;
          if (totale === 0) return 0;
          file.forEach((nome, i) => {
            const vecchioPath = path.join(cartella, nome);
            const tempPath = path.join(cartella, `TEMP_${i}_${Date.now()}.tmp`);
            fs.renameSync(vecchioPath, tempPath);
          });
          const fileTemp = fs.readdirSync(cartella).filter((file2) => file2.endsWith(".tmp")).sort((a, b) => a.localeCompare(b, void 0, { numeric: true }));
          fileTemp.forEach((nome, i) => {
            const vecchioPath = path.join(cartella, nome);
            const nuovoPath = path.join(cartella, `${i + 1}${suffisso}`);
            fs.renameSync(vecchioPath, nuovoPath);
          });
          return totale;
        } catch (error) {
          console.error(error);
          return 0;
        }
      };
      var pfpNumber = contaFile(pfpPathServer, "jpg");
      var iconNumber = contaFile(iconPathServer, "png");
      var generatePfp = () => {
        let rdmNumber = Math.round(Math.random() * (pfpNumber - 1) + 1);
        return pfpPath + rdmNumber + ".jpg";
      };
      var getAllPfp = () => Array.from({ length: pfpNumber }, (v, i) => `${pfpPath}${i + 1}.jpg`);
      var getIcon = (defaultIcon) => String(iconPath + (defaultIcon ? 1 : Math.round(Math.random() * (iconNumber - 1) + 1)) + ".png");
      module.exports = { generateId, generatePfp, generateName, getIcon, getAllPfp, getknownPacks, translateToPack };
    }
  });

  // lan-shim:crypto
  var require_crypto = __commonJS({
    "lan-shim:crypto"(exports, module) {
      function sha256(ascii) {
        const rightRotate = (v, a) => v >>> a | v << 32 - a;
        const maxWord = Math.pow(2, 32);
        let result = "";
        const words = [];
        const utf8 = unescape(encodeURIComponent(String(ascii)));
        const asciiBitLength = utf8.length * 8;
        const hash = [];
        const k = [];
        let primeCounter = 0;
        const isComposite = {};
        for (let candidate = 2; primeCounter < 64; candidate++) {
          if (!isComposite[candidate]) {
            for (let i = 0; i < 313; i += candidate) isComposite[i] = candidate;
            if (primeCounter < 8) hash[primeCounter] = Math.pow(candidate, 0.5) * maxWord | 0;
            k[primeCounter++] = Math.pow(candidate, 1 / 3) * maxWord | 0;
          }
        }
        const padded = utf8 + "\x80" + "\0".repeat((64 - (utf8.length + 9) % 64) % 64);
        for (let i = 0; i < padded.length; i += 4) {
          words.push(padded.charCodeAt(i) << 24 | padded.charCodeAt(i + 1) << 16 | padded.charCodeAt(i + 2) << 8 | padded.charCodeAt(i + 3));
        }
        words.push(asciiBitLength / maxWord | 0);
        words.push(asciiBitLength | 0);
        for (let j = 0; j < words.length; ) {
          const w = words.slice(j, j += 16);
          const oldHash = hash.slice(0);
          for (let i = 0; i < 64; i++) {
            const w15 = w[i - 15], w2 = w[i - 2];
            const a = hash[0], e = hash[4];
            const temp1 = hash[7] + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) + (e & hash[5] ^ ~e & hash[6]) + k[i] + (w[i] = i < 16 ? w[i] : w[i - 16] + (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ w15 >>> 3) + w[i - 7] + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ w2 >>> 10) | 0);
            const temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) + (a & hash[1] ^ a & hash[2] ^ hash[1] & hash[2]);
            hash.unshift(temp1 + temp2 | 0);
            hash.pop();
            hash[4] = hash[4] + temp1 | 0;
          }
          for (let i = 0; i < 8; i++) hash[i] = hash[i] + oldHash[i] | 0;
        }
        for (let i = 0; i < 8; i++) {
          for (let j = 3; j + 1; j--) {
            const b = hash[i] >> j * 8 & 255;
            result += (b < 16 ? "0" : "") + b.toString(16);
          }
        }
        return result;
      }
      module.exports = {
        createHash: () => {
          let buf = "";
          return {
            update(chunk) {
              buf += String(chunk);
              return this;
            },
            digest() {
              return sha256(buf);
            }
          };
        }
      };
    }
  });

  // application/include/script/Mazzo.js
  var require_Mazzo = __commonJS({
    "application/include/script/Mazzo.js"(exports, module) {
      var __dirname = "/application/include/script";
      var TipoMazzo = Object.freeze({
        COMPLETAMENTI: 0,
        FRASI: 1
      });
      var fs = require_fs();
      var path = require_path();
      var crypto = require_crypto();
      var packsCache = {};
      var normalizzaCarta = (carta, tipo) => {
        if (tipo === TipoMazzo.FRASI) {
          if (Array.isArray(carta)) {
            const testo = String(carta[0] ?? "").trim();
            const spazi = parseInt(carta[1]);
            if (!testo) return null;
            return [testo, Number.isInteger(spazi) && spazi > 0 ? spazi : (testo.match(/_/g) || []).length || 1];
          }
          if (typeof carta === "string" && carta.trim()) {
            const testo = carta.trim();
            return [testo, (testo.match(/_/g) || []).length || 1];
          }
          return null;
        }
        if (typeof carta === "string") return carta.trim() || null;
        if (Array.isArray(carta)) {
          const testo = String(carta[0] ?? "").trim();
          return testo || null;
        }
        if (carta === null || carta === void 0) return null;
        return String(carta).trim() || null;
      };
      var Mazzo = class _Mazzo {
        constructor(data) {
          this.carte = [];
          this.tipo = data && data["tipoMazzo"] === TipoMazzo.FRASI ? TipoMazzo.FRASI : TipoMazzo.COMPLETAMENTI;
          if (data) {
            if (typeof data["pack"] === "string") {
              _Mazzo.recuperaInCache(data["pack"]);
              const carte = data["tipoMazzo"] === TipoMazzo.COMPLETAMENTI ? packsCache[data["pack"]].completamenti : packsCache[data["pack"]].frasi;
              this.aggiungiCarte(...carte);
            } else if (typeof data["pack"] === "object" && data["pack"] !== null) {
              const type = data["tipoMazzo"] === TipoMazzo.COMPLETAMENTI ? "completamenti" : "frasi";
              this.aggiungiCarte(...data["pack"][type] || []);
            }
          }
        }
        aggiungiCarte(...carte) {
          for (const carta of carte) {
            const pulita = normalizzaCarta(carta, this.tipo);
            if (pulita === null) {
              console.warn("[Mazzo] carta scartata perche' malformata:", JSON.stringify(carta));
              continue;
            }
            if (this.tipo === TipoMazzo.COMPLETAMENTI && typeof carta !== "string")
              console.warn(
                "[Mazzo] completamento non testuale, corretto in:",
                JSON.stringify(pulita),
                "era:",
                JSON.stringify(carta)
              );
            this.carte.push(pulita);
          }
        }
        static shuffle(array = []) {
          for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
          }
          return array;
        }
        shuffle() {
          _Mazzo.shuffle(this.carte);
        }
        prendiCarte(numeroCarte) {
          numeroCarte = Math.max(0, Math.min(parseInt(numeroCarte) || 0, this.carte.length));
          return this.carte.splice(0, numeroCarte);
        }
        /**
         * Toglie dalla mano le carte alle posizioni indicate e le restituisce.
         * Gli indici arrivano dal client, quindi vanno trattati come non fidati:
         * si accettano solo interi validi, distinti e dentro la mano. Se qualcosa
         * non torna non si tocca niente e si restituisce null, cosi chi chiama puo
         * rifiutare la giocata invece di rovinare il mazzo.
         */
        prendiCarteByIndex(...indici) {
          const puliti = [];
          for (const grezzo of indici) {
            const i = typeof grezzo === "number" ? grezzo : parseInt(grezzo);
            if (!Number.isInteger(i) || i < 0 || i >= this.carte.length) return null;
            if (puliti.includes(i)) return null;
            puliti.push(i);
          }
          if (!puliti.length) return null;
          const prese = puliti.map((i) => this.carte[i]);
          const daTogliere = new Set(puliti);
          this.carte = this.carte.filter((_, i) => !daTogliere.has(i));
          return prese;
        }
        static unisciMazzi(...mazzi) {
          const temp = new _Mazzo({ tipoMazzo: mazzi[0]?.tipo ?? TipoMazzo.COMPLETAMENTI });
          for (const mazzo of mazzi) temp.aggiungiCarte(...mazzo.prendiCarte(mazzo.carte.length));
          return temp;
        }
        /**
         * Riporta un mazzo, in qualunque forma arrivi, a { frasi, completamenti }.
         * Le forme possibili sono tre:
         *   "standard"                       -> mazzo di casa, letto da disco
         *   { frasi, completamenti, hash }   -> mazzo personalizzato gia creato
         *   [ frasi, completamenti, [nome] ] -> blocchi grezzi dalla pagina
         *                                       /creaMazzo, l'hash non c'e ancora
         */
        static contenutoMazzo(mazzo) {
          if (typeof mazzo === "string") {
            _Mazzo.recuperaInCache(mazzo);
            const dati = packsCache[mazzo];
            return { frasi: dati?.frasi ?? [], completamenti: dati?.completamenti ?? [] };
          }
          if (Array.isArray(mazzo))
            return { frasi: mazzo[0] ?? [], completamenti: mazzo[1] ?? [] };
          if (mazzo && typeof mazzo === "object")
            return { frasi: mazzo.frasi ?? [], completamenti: mazzo.completamenti ?? [] };
          return null;
        }
        /**
         * Ha senso giocare con QUESTA selezione di mazzi? Ritorna null se va bene,
         * altrimenti la frase da mostrare a chi ha scelto.
         *
         * Si guarda il TOTALE dei mazzi selezionati, non un mazzo alla volta.
         * Prima la regola era: basta che UNO dei mazzi scelti abbia piu di 10
         * completamenti E almeno il doppio dei completamenti rispetto alle frasi.
         * Due problemi, tutti e due esplosi il 2026-08-27:
         *   - il rapporto 2:1 non c'entra niente con quello che serve davvero al
         *     gioco (gli scarti rientrano nel mazzo da soli, vedi
         *     Stanza.controllaMazzi), ed e' bastato aggiungere frasi allo
         *     standard - arrivato a 524 frasi e 1038 completamenti, dieci
         *     completamenti sotto la soglia - per far rifiutare al server
         *     QUALSIASI selezione, standard compreso;
         *   - un mazzo piccolo a tema (7 carte) non poteva essere "salvato" dal
         *     mazzo grande scelto insieme a lui, perche' il conto si faceva per
         *     mazzo e non sull'insieme.
         * Quello che serve davvero: almeno una frase, e abbastanza completamenti
         * da riempire le mani (Stanza.CARTE_IN_MANO a testa) senza rimescolare
         * gli scarti a ogni giro.
         */
        static problemaMazzo(...mazzi) {
          if (!mazzi.length) return "Non hai selezionato nessun mazzo";
          let frasi = 0;
          let completamenti = 0;
          for (const mazzo of mazzi) {
            let contenuto;
            try {
              contenuto = _Mazzo.contenutoMazzo(mazzo);
            } catch {
              return "Uno dei mazzi non si riesce proprio a leggere";
            }
            if (!contenuto || !Array.isArray(contenuto.frasi) || !Array.isArray(contenuto.completamenti))
              return "Uno dei mazzi non e' fatto come si deve";
            frasi += contenuto.frasi.length;
            completamenti += contenuto.completamenti.length;
          }
          if (frasi < 1)
            return "Nei mazzi che hai scelto non c'e' nemmeno una frase da completare";
          if (completamenti < _Mazzo.MINIMO_COMPLETAMENTI)
            return "In tutto fanno solo " + completamenti + " completamenti, ne servono almeno " + _Mazzo.MINIMO_COMPLETAMENTI + ": scegli anche uno dei mazzi grandi insieme a questo";
          return null;
        }
        /**
         * I mazzi personalizzati arrivano dal client, quindi vanno firmati: senza
         * questo controllo chiunque potrebbe mandarsi un mazzo cucito su misura.
         * I mazzi di casa (stringhe) sono file nostri sul server, non c'e' niente
         * da verificare.
         */
        static firmeValide(...mazzi) {
          return mazzi.every((mazzo) => {
            if (typeof mazzo === "string") return true;
            if (!mazzo || typeof mazzo !== "object" || Array.isArray(mazzo)) return false;
            const { hash: hashOriginale, ...dati } = mazzo;
            if (!hashOriginale) return false;
            const datiString = JSON.stringify(dati, Object.keys(dati).sort());
            const hashRicalcolato = crypto.createHash("sha256").update(datiString).digest("hex");
            return hashOriginale === hashRicalcolato;
          });
        }
        /** Contenuto sensato E firma valida: e' quello che serve in partita. */
        static controllaMazzo(...frasiCompletamenti) {
          if (_Mazzo.problemaMazzo(...frasiCompletamenti) !== null) return false;
          return _Mazzo.firmeValide(...frasiCompletamenti);
        }
        static recuperaInCache(data = "") {
          if (!packsCache[data]) {
            const mazzo = {
              completamenti: JSON.parse(fs.readFileSync(path.join(__dirname, "../cards/" + data + "/completamenti.json"), "utf-8")),
              frasi: JSON.parse(fs.readFileSync(path.join(__dirname, "../cards/" + data + "/frasi.json"), "utf-8"))
            };
            const datiString = JSON.stringify(mazzo, Object.keys(mazzo).sort());
            const hash = crypto.createHash("sha256").update(datiString).digest("hex");
            packsCache[data] = { ...mazzo, hash };
          }
        }
        toJSON() {
          return { carte: [...this.carte], tipo: this.tipo };
        }
        /**
         * @param data       quello che c'era in database
         * @param tipoForzato tipo del mazzo, da passare sempre: le stanze salvate
         *                    prima di questa modifica non hanno il campo tipo e un
         *                    mazzo di frasi letto come completamenti verrebbe
         *                    appiattito a stringhe, mandando in pezzi il round
         */
        static fromJSON(data, tipoForzato) {
          const carte = Array.isArray(data?.carte) ? data.carte : [];
          let tipo = tipoForzato;
          if (tipo !== TipoMazzo.FRASI && tipo !== TipoMazzo.COMPLETAMENTI) tipo = data?.tipo;
          if (tipo !== TipoMazzo.FRASI && tipo !== TipoMazzo.COMPLETAMENTI)
            tipo = carte.length && carte.every((c) => Array.isArray(c)) ? TipoMazzo.FRASI : TipoMazzo.COMPLETAMENTI;
          const mazzo = new _Mazzo({ tipoMazzo: tipo });
          mazzo.aggiungiCarte(...carte);
          return mazzo;
        }
      };
      Mazzo.MINIMO_COMPLETAMENTI = 20;
      module.exports = { Mazzo, TipoMazzo, normalizzaCarta };
    }
  });

  // application/include/script/Giocatore.js
  var require_Giocatore = __commonJS({
    "application/include/script/Giocatore.js"(exports, module) {
      var path = require_path();
      var { generateId } = require_generazione();
      var { Mazzo } = require_Mazzo();
      var Giocatore = class _Giocatore {
        constructor(username, pfp, role = false, interrogating = false) {
          this.username = username;
          this.punti = 0;
          this.pfp = pfp;
          this.online = true;
          this.socketId = "";
          this.masterRole = role;
          this.interrogationRole = interrogating;
          this.mazzo = new Mazzo();
        }
        async init(memory) {
          this.id = typeof memory === "string" ? memory : await generateId(32, memory);
          return this;
        }
        aggiungiMano(...carte) {
          this.mazzo.aggiungiCarte(...carte);
        }
        prendiMano(...indexCarte) {
          return this.mazzo.prendiCarteByIndex(...indexCarte);
        }
        prendiTuttaLaMano() {
          return this.mazzo.prendiCarte(this.mazzo.carte.length);
        }
        isOnline() {
          return this.online;
        }
        assegnaSocket(id) {
          this.socketId = id ?? "";
        }
        toJSON() {
          return {
            id: this.id,
            username: this.username,
            punti: this.punti,
            pfp: this.pfp,
            online: this.online,
            masterRole: this.masterRole,
            interrogationRole: this.interrogationRole,
            mazzo: this.mazzo,
            socketId: this.socketId
          };
        }
        static fromJSON(data) {
          const g = new _Giocatore(data.username, data.pfp);
          Object.assign(g, data);
          g.mazzo = Mazzo.fromJSON(data.mazzo);
          return g;
        }
      };
      module.exports = { Giocatore };
    }
  });

  // application/include/script/Stanza.js
  var require_Stanza = __commonJS({
    "application/include/script/Stanza.js"(exports, module) {
      var StatoStanza = Object.freeze({
        WAIT: 1,
        END: 4,
        CHOOSING_WINNER: 3,
        CHOOSING_CARDS: 2
      });
      var path = require_path();
      var { Giocatore } = require_Giocatore();
      var { Mazzo, TipoMazzo } = require_Mazzo();
      var { generateId } = require_generazione();
      var Stanza = class _Stanza {
        constructor(minimoGiocatori = 2) {
          this.giocatori = /* @__PURE__ */ new Map();
          this.giocatoriPassati = /* @__PURE__ */ new Set();
          this.stato = StatoStanza.WAIT;
          this.minimoGiocatori = minimoGiocatori;
          this.mazzoCompletamenti = {
            mazzo: new Mazzo({
              pack: "standard",
              tipoMazzo: TipoMazzo.COMPLETAMENTI
            }),
            // lo scarto deve sapere che tipo di carte accoglie, altrimenti una
            // frase che ci passa dentro viene appiattita a stringa
            scarto: new Mazzo({ tipoMazzo: TipoMazzo.COMPLETAMENTI })
          };
          this.mazzoFrasi = {
            mazzo: new Mazzo({
              pack: "standard",
              tipoMazzo: TipoMazzo.FRASI
            }),
            scarto: new Mazzo({ tipoMazzo: TipoMazzo.FRASI })
          };
        }
        async init(username, pfp, memory) {
          this.id = typeof memory === "string" ? memory : await generateId(6, memory);
          this.master = await new Giocatore(username, pfp, true, true).init(memory);
          this.round = {
            domanda: null,
            risposte: null,
            chiStaInterrogando: this.master.id
          };
          this.giocatori.set(this.master.id, this.master);
          this.chat = {
            messaggi: []
          };
          this.numeroRound = [0, this.giocatori.size];
          return this;
        }
        async aggiungiGiocatore(username, pfp, memory) {
          const giocatore = await new Giocatore(username, pfp).init(memory);
          return this.aggiungiGiocatorePronto(giocatore);
        }
        /**
         * Versione sincrona di aggiungiGiocatore, con il Giocatore gia costruito.
         * Serve perche' le modifiche alla stanza devono poter essere rieseguite
         * (vedi ClusterStanze.mutate) e quindi non possono contenere await.
         */
        aggiungiGiocatorePronto(giocatore) {
          if (this.stato !== StatoStanza.WAIT) return false;
          if (!giocatore?.id) return false;
          if (this.giocatori.has(giocatore.id)) return this.giocatori.get(giocatore.id);
          let maxOccorrenze = 0;
          this.mazzoFrasi.mazzo.carte.map((carta) => carta[1]).forEach((occorrenza) => {
            if (!isNaN(parseInt(occorrenza))) maxOccorrenze += parseInt(occorrenza);
          });
          this.numeroRound = [this.numeroRound[0], Math.floor(maxOccorrenze / (this.giocatori.size + 1))];
          this.giocatori.set(giocatore.id, giocatore);
          return giocatore;
        }
        /**
         * Rete di sicurezza contro le stanze bloccate: se tutti quelli che devono
         * rispondere hanno risposto ma lo stato e' rimasto indietro (perche' nel
         * frattempo qualcuno e' uscito o si e' persa una scrittura), avanza.
         */
        sincronizzaStato() {
          if (this.stato !== StatoStanza.CHOOSING_CARDS) return false;
          if (!(this.round?.risposte instanceof Map)) return false;
          const attesi = this.giocatori.size - 1;
          if (attesi > 0 && this.round.risposte.size >= attesi) {
            this.stato = StatoStanza.CHOOSING_WINNER;
            return true;
          }
          return false;
        }
        eliminaGiocatore(giocatoreId) {
          const giocatore = this.trovaGiocatore(giocatoreId);
          if (!giocatore) return false;
          this.mazzoCompletamenti.mazzo.aggiungiCarte(...giocatore.prendiTuttaLaMano());
          this.giocatoriPassati.add(giocatore.id);
          this.giocatori.delete(giocatoreId);
          this.chat = {
            messaggi: (this.chat?.messaggi ?? []).map((messaggio) => {
              if (messaggio["giocatoreId"] === giocatoreId) messaggio.eliminato = true;
              return messaggio;
            })
          };
          if (giocatore.id === this.master?.id) {
            this.master = this.giocatori.values().next().value;
            if (this.master) this.master.masterRole = true;
          }
          if (giocatore.id === this.round?.chiStaInterrogando) {
            this.round.chiStaInterrogando = this.giocatori.values().next()?.value?.id;
            const nuovoInterrogante = this.trovaGiocatore(this.round.chiStaInterrogando);
            if (nuovoInterrogante) nuovoInterrogante.interrogationRole = true;
          }
          if (this.round?.risposte?.has(giocatoreId)) {
            const carteGiocate = this.round.risposte.get(giocatoreId);
            this.mazzoCompletamenti.mazzo.aggiungiCarte(...carteGiocate);
            this.round.risposte.delete(giocatoreId);
          }
          if (this.giocatori.size < this.minimoGiocatori) {
            this.stato = StatoStanza.WAIT;
            this.numeroRound[0] = Math.max(0, this.numeroRound[0] - 1);
            Array.from(this.round?.risposte?.entries() || []).forEach(([key, value]) => {
              this.trovaGiocatore(key)?.aggiungiMano(...value);
            });
            this.round?.risposte?.clear();
          } else if (this.stato === StatoStanza.CHOOSING_CARDS) {
            if ((this.round?.risposte?.size ?? 0) >= this.giocatori.size - 1 && this.giocatori.size > 1) {
              this.stato = StatoStanza.CHOOSING_WINNER;
            }
          }
          if (this.giocatori.size === 0) return true;
          let maxOccorrenze = 0;
          this.mazzoFrasi.mazzo.carte.map((carta) => carta[1]).forEach((occorrenza) => {
            if (!isNaN(parseInt(occorrenza))) maxOccorrenze += parseInt(occorrenza);
          });
          this.numeroRound = [this.numeroRound[0], Math.floor(maxOccorrenze / this.giocatori.size)];
          return true;
        }
        trovaGiocatore(idGiocatore) {
          return this.giocatori.get(idGiocatore);
        }
        trovaGiocatoreAnchePassato(idGiocatore) {
          if (this.giocatori.has(idGiocatore))
            return this.giocatori.get(idGiocatore);
          if (this.giocatoriPassati.has(idGiocatore))
            return false;
          return null;
        }
        terminaPartita(idGiocatore, forzato = false) {
          if (this.stato !== StatoStanza.END && (forzato || !!this.master && this.trovaGiocatore(idGiocatore)?.id === this.master.id)) {
            this.stato = StatoStanza.END;
            const classifica = this.classifica();
            this.giocatori.clear();
            this.mazzoFrasi = null;
            this.mazzoCompletamenti = null;
            this.master = null;
            return classifica;
          }
          return false;
        }
        classifica() {
          return [...Array.from(this.giocatori.values() || [])?.sort((a, b) => b.punti - a.punti)];
        }
        /** Carte necessarie per riportare tutti a 13 e carte da mazzo/scarti. */
        disponibilitaCartePerAvvio() {
          const necessarie = Array.from(this.giocatori.values()).reduce((totale, giocatore) => totale + Math.max(0, _Stanza.CARTE_IN_MANO - (giocatore.mazzo?.carte?.length ?? 0)), 0);
          const disponibili = (this.mazzoCompletamenti?.mazzo?.carte?.length ?? 0) + (this.mazzoCompletamenti?.scarto?.carte?.length ?? 0);
          return { necessarie, disponibili };
        }
        iniziaTurno(chiStaChidedendo) {
          if (this.stato !== StatoStanza.WAIT || this.giocatori.size < this.minimoGiocatori)
            return false;
          const { necessarie, disponibili } = this.disponibilitaCartePerAvvio();
          if (disponibili < necessarie) return -1;
          if (this.numeroRound[0] === 0) {
            let maxOccorrenze = 0;
            this.mazzoFrasi.mazzo.carte.map((carta) => carta[1]).forEach((occorrenza) => {
              if (!isNaN(parseInt(occorrenza))) maxOccorrenze += parseInt(occorrenza);
            });
            this.numeroRound = [1, Math.floor(maxOccorrenze / this.giocatori.size)];
            this.mazzoCompletamenti.mazzo.shuffle();
            this.mazzoFrasi.mazzo.shuffle();
            this.round = {
              domanda: this.mazzoFrasi.mazzo.prendiCarte(1)[0],
              risposte: /* @__PURE__ */ new Map(),
              chiStaInterrogando: this.master.id
            };
          }
          if (this.numeroRound[0] === this.numeroRound[1])
            return this.terminaPartita(null, true);
          this.controllaMazzi(this.round.domanda[1]);
          this.ripristinaMani();
          if (chiStaChidedendo === this.round.chiStaInterrogando) {
            this.stato = StatoStanza.CHOOSING_CARDS;
            return true;
          }
          return false;
        }
        aggiungiRisposta(giocatoreId, ...indexCarte) {
          if (!(this.round?.risposte instanceof Map)) return false;
          if (giocatoreId === this.round.chiStaInterrogando) return false;
          if (this.stato === StatoStanza.CHOOSING_CARDS && this.giocatori.has(giocatoreId) && !this.round.risposte.has(giocatoreId)) {
            const giocatore = this.trovaGiocatore(giocatoreId);
            const spaziAttesi = parseInt(this.round.domanda?.[1]) || 1;
            if (indexCarte.length !== spaziAttesi) return false;
            const carte = giocatore.prendiMano(...indexCarte);
            if (!carte || carte.length !== spaziAttesi) return false;
            if (carte.some((c) => typeof c !== "string" || !c)) return false;
            this.round.risposte.set(giocatoreId, carte);
            if (this.round.risposte.size >= this.giocatori.size - 1) {
              this.stato = StatoStanza.CHOOSING_WINNER;
              return [
                this.round.domanda,
                Mazzo.shuffle([...Array.from(this.round.risposte.entries())]),
                this.round.chiStaInterrogando
              ];
            }
            return true;
          }
          return false;
        }
        scegliVincitore(chiStaChiedendo, idGiocatore) {
          if (!(this.round?.risposte instanceof Map)) return false;
          if (this.stato !== StatoStanza.CHOOSING_WINNER || this.round.risposte.size < this.giocatori.size - 1 || !chiStaChiedendo || chiStaChiedendo !== this.round.chiStaInterrogando || !this.round.risposte.has(idGiocatore)) return false;
          const risposte = this.round.risposte.get(idGiocatore);
          const tutteLeRisposte = Array.from(this.round.risposte.entries());
          const vincitoreRound = this.trovaGiocatore(idGiocatore);
          const domandaScartata = this.round.domanda;
          this.stato = StatoStanza.WAIT;
          if (vincitoreRound) {
            vincitoreRound.punti++;
            vincitoreRound.interrogationRole = true;
          }
          this.controllaMazzi(domandaScartata[1]);
          this.ripristinaMani();
          this.mazzoCompletamenti.scarto.aggiungiCarte(...Array.from(this.round.risposte.values()).flat());
          this.mazzoFrasi.scarto.aggiungiCarte(domandaScartata);
          this.trovaGiocatore(this.round.chiStaInterrogando).interrogationRole = false;
          this.round = {
            domanda: this.mazzoFrasi.mazzo.prendiCarte(1)[0],
            risposte: /* @__PURE__ */ new Map(),
            chiStaInterrogando: idGiocatore
          };
          this.numeroRound[0] += 1;
          return [vincitoreRound.toJSON(), domandaScartata, risposte, tutteLeRisposte];
        }
        /**
         * Riporta ogni mano a CARTE_IN_MANO. Prima le carte venivano date solo a
         * chi aveva la mano completamente vuota, quindi col passare dei round le
         * mani si sbilanciavano e gli indici del client non corrispondevano piu a
         * quello che aveva il server.
         */
        ripristinaMani(quante = _Stanza.CARTE_IN_MANO) {
          for (const giocatore of this.giocatori.values()) {
            const mancanti = quante - giocatore.mazzo.carte.length;
            if (mancanti <= 0) continue;
            if (this.mazzoCompletamenti.mazzo.carte.length < mancanti)
              this.controllaMazzi(mancanti);
            giocatore.aggiungiMano(...this.mazzoCompletamenti.mazzo.prendiCarte(mancanti));
          }
        }
        controllaMazzi(spaziNecessari) {
          if (this.mazzoCompletamenti.mazzo.carte.length < this.giocatori.size * spaziNecessari) {
            this.mazzoCompletamenti.mazzo.aggiungiCarte(...this.mazzoCompletamenti.scarto.prendiCarte(this.mazzoCompletamenti.scarto.carte.length));
            this.mazzoCompletamenti.mazzo.shuffle();
          }
          if (this.mazzoFrasi.mazzo.carte.length - 1 <= 0) {
            this.mazzoFrasi.mazzo.aggiungiCarte(...this.mazzoFrasi.scarto.prendiCarte(this.mazzoFrasi.scarto.carte.length));
            this.mazzoFrasi.mazzo.shuffle();
          }
        }
        modificaMazzo(mazzi) {
          if (this.stato !== StatoStanza.WAIT || this.numeroRound[0] > 0)
            return false;
          try {
            if (!Mazzo.controllaMazzo(...mazzi))
              return false;
            const mazziFrasi = mazzi.map((mazzo) => new Mazzo({
              pack: mazzo,
              tipoMazzo: TipoMazzo.FRASI
            }));
            const mazziCompletamenti = mazzi.map((mazzo) => new Mazzo({
              pack: mazzo,
              tipoMazzo: TipoMazzo.COMPLETAMENTI
            }));
            this.mazzoFrasi.mazzo = Mazzo.unisciMazzi(...mazziFrasi);
            this.mazzoFrasi.scarto = new Mazzo({ tipoMazzo: TipoMazzo.FRASI });
            this.mazzoCompletamenti.mazzo = Mazzo.unisciMazzi(...mazziCompletamenti);
            this.mazzoCompletamenti.scarto = new Mazzo({ tipoMazzo: TipoMazzo.COMPLETAMENTI });
            return true;
          } catch {
            return false;
          }
        }
        scriviInChat(messaggio, giocatoreId) {
          const giocatore = this.trovaGiocatore(giocatoreId);
          if (!giocatore) return false;
          if (!this.chat?.messaggi) this.chat = { messaggi: [] };
          this.chat.messaggi.push({
            pfp: giocatore?.pfp,
            username: giocatore?.username,
            messaggio,
            giocatoreId,
            timestamp: Date.now(),
            eliminato: false
          });
          return this.chat.messaggi;
        }
        static trovaDaGiocatore(idGiocatore, Stanze) {
          for (const stanza of Stanze) {
            if (stanza.giocatori?.has(idGiocatore)) {
              return stanza.id;
            }
          }
          return null;
        }
        static async pulisciStanza(callback, memory, Stanze, ...stanzeId) {
          const check = async (stanzaId) => {
            const stanza = await Stanze.get(stanzaId);
            if (stanza?.stato === StatoStanza.END || stanza?.giocatori.size === 0 && stanza?.giocatoriPassati.size > 0) {
              for (const id of stanza.giocatoriPassati.values()) await memory.delete(id);
              await Stanze.delete(stanza.id);
              await memory.delete(stanza.id);
              await callback(stanza.id);
            }
          };
          if (stanzeId.length === 0) for (const stanzaId of await Stanze.keys()) await check(stanzaId);
          else for (const stanzaId of stanzeId) await check(stanzaId);
        }
        toString() {
          return JSON.stringify({
            numeroGiocatori: this.giocatori.size,
            stato: Object.keys(StatoStanza).filter((chiave) => StatoStanza[chiave] === this.stato)[0]
          });
        }
        toJSON() {
          return {
            id: this.id,
            stato: this.stato,
            minimoGiocatori: this.minimoGiocatori,
            numeroRound: this.numeroRound,
            giocatori: Array.from(this.giocatori.entries()),
            giocatoriPassati: Array.from(this.giocatoriPassati),
            masterId: this.master ? this.master.id : null,
            mazzoCompletamenti: this.mazzoCompletamenti,
            mazzoFrasi: this.mazzoFrasi,
            round: {
              ...this.round,
              risposte: this.round.risposte ? Array.from(this.round.risposte.entries()) : null
            },
            chat: this.chat
          };
        }
        static async fromJSON(data) {
          const s = await new _Stanza(data.minimoGiocatori).init(null, null, data.id);
          s.stato = data.stato;
          s.numeroRound = data.numeroRound;
          s.giocatori = new Map(data.giocatori.map(([id, gData]) => [id, Giocatore.fromJSON(gData)]));
          s.giocatoriPassati = new Set(data.giocatoriPassati);
          s.master = s.giocatori.get(data.masterId);
          const ripristinaMazzo = (obj, tipo) => ({
            mazzo: Mazzo.fromJSON(obj?.mazzo, tipo),
            scarto: Mazzo.fromJSON(obj?.scarto, tipo)
          });
          s.mazzoCompletamenti = ripristinaMazzo(data.mazzoCompletamenti, TipoMazzo.COMPLETAMENTI);
          s.mazzoFrasi = ripristinaMazzo(data.mazzoFrasi, TipoMazzo.FRASI);
          s.round = {
            domanda: data.round.domanda,
            chiStaInterrogando: data.round.chiStaInterrogando,
            risposte: data.round.risposte ? new Map(data.round.risposte) : /* @__PURE__ */ new Map()
          };
          s.chat = data.chat?.messaggi ? data.chat : { messaggi: [] };
          return s;
        }
      };
      Stanza.CARTE_IN_MANO = 13;
      module.exports = { Stanza, StatoStanza };
    }
  });

  // lan-shim:express
  var require_express = __commonJS({
    "lan-shim:express"(exports, module) {
      var noopMw = () => (req, res, next) => next && next();
      function express() {
        return {};
      }
      express.static = noopMw;
      express.json = noopMw;
      express.urlencoded = noopMw;
      module.exports = express;
    }
  });

  // lan-shim:cors
  var require_cors = __commonJS({
    "lan-shim:cors"(exports, module) {
      module.exports = () => (req, res, next) => next && next();
    }
  });

  // lan-shim:sitemap
  var require_sitemap = __commonJS({
    "lan-shim:sitemap"(exports, module) {
      module.exports = { SitemapStream: class {
      } };
    }
  });

  // lan-shim:zlib
  var require_zlib = __commonJS({
    "lan-shim:zlib"(exports, module) {
      module.exports = { createGzip: () => ({}) };
    }
  });

  // node_modules/qrcode-svg/lib/qrcode.js
  var require_qrcode = __commonJS({
    "node_modules/qrcode-svg/lib/qrcode.js"(exports, module) {
      function QR8bitByte(data) {
        this.mode = QRMode.MODE_8BIT_BYTE;
        this.data = data;
        this.parsedData = [];
        for (var i2 = 0, l = this.data.length; i2 < l; i2++) {
          var byteArray = [];
          var code = this.data.charCodeAt(i2);
          if (code > 65536) {
            byteArray[0] = 240 | (code & 1835008) >>> 18;
            byteArray[1] = 128 | (code & 258048) >>> 12;
            byteArray[2] = 128 | (code & 4032) >>> 6;
            byteArray[3] = 128 | code & 63;
          } else if (code > 2048) {
            byteArray[0] = 224 | (code & 61440) >>> 12;
            byteArray[1] = 128 | (code & 4032) >>> 6;
            byteArray[2] = 128 | code & 63;
          } else if (code > 128) {
            byteArray[0] = 192 | (code & 1984) >>> 6;
            byteArray[1] = 128 | code & 63;
          } else {
            byteArray[0] = code;
          }
          this.parsedData.push(byteArray);
        }
        this.parsedData = Array.prototype.concat.apply([], this.parsedData);
        if (this.parsedData.length != this.data.length) {
          this.parsedData.unshift(191);
          this.parsedData.unshift(187);
          this.parsedData.unshift(239);
        }
      }
      QR8bitByte.prototype = {
        getLength: function(buffer) {
          return this.parsedData.length;
        },
        write: function(buffer) {
          for (var i2 = 0, l = this.parsedData.length; i2 < l; i2++) {
            buffer.put(this.parsedData[i2], 8);
          }
        }
      };
      function QRCodeModel(typeNumber, errorCorrectLevel) {
        this.typeNumber = typeNumber;
        this.errorCorrectLevel = errorCorrectLevel;
        this.modules = null;
        this.moduleCount = 0;
        this.dataCache = null;
        this.dataList = [];
      }
      QRCodeModel.prototype = { addData: function(data) {
        var newData = new QR8bitByte(data);
        this.dataList.push(newData);
        this.dataCache = null;
      }, isDark: function(row, col) {
        if (row < 0 || this.moduleCount <= row || col < 0 || this.moduleCount <= col) {
          throw new Error(row + "," + col);
        }
        return this.modules[row][col];
      }, getModuleCount: function() {
        return this.moduleCount;
      }, make: function() {
        this.makeImpl(false, this.getBestMaskPattern());
      }, makeImpl: function(test, maskPattern) {
        this.moduleCount = this.typeNumber * 4 + 17;
        this.modules = new Array(this.moduleCount);
        for (var row = 0; row < this.moduleCount; row++) {
          this.modules[row] = new Array(this.moduleCount);
          for (var col = 0; col < this.moduleCount; col++) {
            this.modules[row][col] = null;
          }
        }
        this.setupPositionProbePattern(0, 0);
        this.setupPositionProbePattern(this.moduleCount - 7, 0);
        this.setupPositionProbePattern(0, this.moduleCount - 7);
        this.setupPositionAdjustPattern();
        this.setupTimingPattern();
        this.setupTypeInfo(test, maskPattern);
        if (this.typeNumber >= 7) {
          this.setupTypeNumber(test);
        }
        if (this.dataCache == null) {
          this.dataCache = QRCodeModel.createData(this.typeNumber, this.errorCorrectLevel, this.dataList);
        }
        this.mapData(this.dataCache, maskPattern);
      }, setupPositionProbePattern: function(row, col) {
        for (var r = -1; r <= 7; r++) {
          if (row + r <= -1 || this.moduleCount <= row + r) continue;
          for (var c = -1; c <= 7; c++) {
            if (col + c <= -1 || this.moduleCount <= col + c) continue;
            if (0 <= r && r <= 6 && (c == 0 || c == 6) || 0 <= c && c <= 6 && (r == 0 || r == 6) || 2 <= r && r <= 4 && 2 <= c && c <= 4) {
              this.modules[row + r][col + c] = true;
            } else {
              this.modules[row + r][col + c] = false;
            }
          }
        }
      }, getBestMaskPattern: function() {
        var minLostPoint = 0;
        var pattern = 0;
        for (var i2 = 0; i2 < 8; i2++) {
          this.makeImpl(true, i2);
          var lostPoint = QRUtil.getLostPoint(this);
          if (i2 == 0 || minLostPoint > lostPoint) {
            minLostPoint = lostPoint;
            pattern = i2;
          }
        }
        return pattern;
      }, createMovieClip: function(target_mc, instance_name, depth) {
        var qr_mc = target_mc.createEmptyMovieClip(instance_name, depth);
        var cs = 1;
        this.make();
        for (var row = 0; row < this.modules.length; row++) {
          var y = row * cs;
          for (var col = 0; col < this.modules[row].length; col++) {
            var x = col * cs;
            var dark = this.modules[row][col];
            if (dark) {
              qr_mc.beginFill(0, 100);
              qr_mc.moveTo(x, y);
              qr_mc.lineTo(x + cs, y);
              qr_mc.lineTo(x + cs, y + cs);
              qr_mc.lineTo(x, y + cs);
              qr_mc.endFill();
            }
          }
        }
        return qr_mc;
      }, setupTimingPattern: function() {
        for (var r = 8; r < this.moduleCount - 8; r++) {
          if (this.modules[r][6] != null) {
            continue;
          }
          this.modules[r][6] = r % 2 == 0;
        }
        for (var c = 8; c < this.moduleCount - 8; c++) {
          if (this.modules[6][c] != null) {
            continue;
          }
          this.modules[6][c] = c % 2 == 0;
        }
      }, setupPositionAdjustPattern: function() {
        var pos = QRUtil.getPatternPosition(this.typeNumber);
        for (var i2 = 0; i2 < pos.length; i2++) {
          for (var j = 0; j < pos.length; j++) {
            var row = pos[i2];
            var col = pos[j];
            if (this.modules[row][col] != null) {
              continue;
            }
            for (var r = -2; r <= 2; r++) {
              for (var c = -2; c <= 2; c++) {
                if (r == -2 || r == 2 || c == -2 || c == 2 || r == 0 && c == 0) {
                  this.modules[row + r][col + c] = true;
                } else {
                  this.modules[row + r][col + c] = false;
                }
              }
            }
          }
        }
      }, setupTypeNumber: function(test) {
        var bits = QRUtil.getBCHTypeNumber(this.typeNumber);
        for (var i2 = 0; i2 < 18; i2++) {
          var mod = !test && (bits >> i2 & 1) == 1;
          this.modules[Math.floor(i2 / 3)][i2 % 3 + this.moduleCount - 8 - 3] = mod;
        }
        for (var i2 = 0; i2 < 18; i2++) {
          var mod = !test && (bits >> i2 & 1) == 1;
          this.modules[i2 % 3 + this.moduleCount - 8 - 3][Math.floor(i2 / 3)] = mod;
        }
      }, setupTypeInfo: function(test, maskPattern) {
        var data = this.errorCorrectLevel << 3 | maskPattern;
        var bits = QRUtil.getBCHTypeInfo(data);
        for (var i2 = 0; i2 < 15; i2++) {
          var mod = !test && (bits >> i2 & 1) == 1;
          if (i2 < 6) {
            this.modules[i2][8] = mod;
          } else if (i2 < 8) {
            this.modules[i2 + 1][8] = mod;
          } else {
            this.modules[this.moduleCount - 15 + i2][8] = mod;
          }
        }
        for (var i2 = 0; i2 < 15; i2++) {
          var mod = !test && (bits >> i2 & 1) == 1;
          if (i2 < 8) {
            this.modules[8][this.moduleCount - i2 - 1] = mod;
          } else if (i2 < 9) {
            this.modules[8][15 - i2 - 1 + 1] = mod;
          } else {
            this.modules[8][15 - i2 - 1] = mod;
          }
        }
        this.modules[this.moduleCount - 8][8] = !test;
      }, mapData: function(data, maskPattern) {
        var inc = -1;
        var row = this.moduleCount - 1;
        var bitIndex = 7;
        var byteIndex = 0;
        for (var col = this.moduleCount - 1; col > 0; col -= 2) {
          if (col == 6) col--;
          while (true) {
            for (var c = 0; c < 2; c++) {
              if (this.modules[row][col - c] == null) {
                var dark = false;
                if (byteIndex < data.length) {
                  dark = (data[byteIndex] >>> bitIndex & 1) == 1;
                }
                var mask = QRUtil.getMask(maskPattern, row, col - c);
                if (mask) {
                  dark = !dark;
                }
                this.modules[row][col - c] = dark;
                bitIndex--;
                if (bitIndex == -1) {
                  byteIndex++;
                  bitIndex = 7;
                }
              }
            }
            row += inc;
            if (row < 0 || this.moduleCount <= row) {
              row -= inc;
              inc = -inc;
              break;
            }
          }
        }
      } };
      QRCodeModel.PAD0 = 236;
      QRCodeModel.PAD1 = 17;
      QRCodeModel.createData = function(typeNumber, errorCorrectLevel, dataList) {
        var rsBlocks = QRRSBlock.getRSBlocks(typeNumber, errorCorrectLevel);
        var buffer = new QRBitBuffer();
        for (var i2 = 0; i2 < dataList.length; i2++) {
          var data = dataList[i2];
          buffer.put(data.mode, 4);
          buffer.put(data.getLength(), QRUtil.getLengthInBits(data.mode, typeNumber));
          data.write(buffer);
        }
        var totalDataCount = 0;
        for (var i2 = 0; i2 < rsBlocks.length; i2++) {
          totalDataCount += rsBlocks[i2].dataCount;
        }
        if (buffer.getLengthInBits() > totalDataCount * 8) {
          throw new Error("code length overflow. (" + buffer.getLengthInBits() + ">" + totalDataCount * 8 + ")");
        }
        if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) {
          buffer.put(0, 4);
        }
        while (buffer.getLengthInBits() % 8 != 0) {
          buffer.putBit(false);
        }
        while (true) {
          if (buffer.getLengthInBits() >= totalDataCount * 8) {
            break;
          }
          buffer.put(QRCodeModel.PAD0, 8);
          if (buffer.getLengthInBits() >= totalDataCount * 8) {
            break;
          }
          buffer.put(QRCodeModel.PAD1, 8);
        }
        return QRCodeModel.createBytes(buffer, rsBlocks);
      };
      QRCodeModel.createBytes = function(buffer, rsBlocks) {
        var offset = 0;
        var maxDcCount = 0;
        var maxEcCount = 0;
        var dcdata = new Array(rsBlocks.length);
        var ecdata = new Array(rsBlocks.length);
        for (var r = 0; r < rsBlocks.length; r++) {
          var dcCount = rsBlocks[r].dataCount;
          var ecCount = rsBlocks[r].totalCount - dcCount;
          maxDcCount = Math.max(maxDcCount, dcCount);
          maxEcCount = Math.max(maxEcCount, ecCount);
          dcdata[r] = new Array(dcCount);
          for (var i2 = 0; i2 < dcdata[r].length; i2++) {
            dcdata[r][i2] = 255 & buffer.buffer[i2 + offset];
          }
          offset += dcCount;
          var rsPoly = QRUtil.getErrorCorrectPolynomial(ecCount);
          var rawPoly = new QRPolynomial(dcdata[r], rsPoly.getLength() - 1);
          var modPoly = rawPoly.mod(rsPoly);
          ecdata[r] = new Array(rsPoly.getLength() - 1);
          for (var i2 = 0; i2 < ecdata[r].length; i2++) {
            var modIndex = i2 + modPoly.getLength() - ecdata[r].length;
            ecdata[r][i2] = modIndex >= 0 ? modPoly.get(modIndex) : 0;
          }
        }
        var totalCodeCount = 0;
        for (var i2 = 0; i2 < rsBlocks.length; i2++) {
          totalCodeCount += rsBlocks[i2].totalCount;
        }
        var data = new Array(totalCodeCount);
        var index = 0;
        for (var i2 = 0; i2 < maxDcCount; i2++) {
          for (var r = 0; r < rsBlocks.length; r++) {
            if (i2 < dcdata[r].length) {
              data[index++] = dcdata[r][i2];
            }
          }
        }
        for (var i2 = 0; i2 < maxEcCount; i2++) {
          for (var r = 0; r < rsBlocks.length; r++) {
            if (i2 < ecdata[r].length) {
              data[index++] = ecdata[r][i2];
            }
          }
        }
        return data;
      };
      var QRMode = { MODE_NUMBER: 1 << 0, MODE_ALPHA_NUM: 1 << 1, MODE_8BIT_BYTE: 1 << 2, MODE_KANJI: 1 << 3 };
      var QRErrorCorrectLevel = { L: 1, M: 0, Q: 3, H: 2 };
      var QRMaskPattern = { PATTERN000: 0, PATTERN001: 1, PATTERN010: 2, PATTERN011: 3, PATTERN100: 4, PATTERN101: 5, PATTERN110: 6, PATTERN111: 7 };
      var QRUtil = { PATTERN_POSITION_TABLE: [[], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50], [6, 30, 54], [6, 32, 58], [6, 34, 62], [6, 26, 46, 66], [6, 26, 48, 70], [6, 26, 50, 74], [6, 30, 54, 78], [6, 30, 56, 82], [6, 30, 58, 86], [6, 34, 62, 90], [6, 28, 50, 72, 94], [6, 26, 50, 74, 98], [6, 30, 54, 78, 102], [6, 28, 54, 80, 106], [6, 32, 58, 84, 110], [6, 30, 58, 86, 114], [6, 34, 62, 90, 118], [6, 26, 50, 74, 98, 122], [6, 30, 54, 78, 102, 126], [6, 26, 52, 78, 104, 130], [6, 30, 56, 82, 108, 134], [6, 34, 60, 86, 112, 138], [6, 30, 58, 86, 114, 142], [6, 34, 62, 90, 118, 146], [6, 30, 54, 78, 102, 126, 150], [6, 24, 50, 76, 102, 128, 154], [6, 28, 54, 80, 106, 132, 158], [6, 32, 58, 84, 110, 136, 162], [6, 26, 54, 82, 110, 138, 166], [6, 30, 58, 86, 114, 142, 170]], G15: 1 << 10 | 1 << 8 | 1 << 5 | 1 << 4 | 1 << 2 | 1 << 1 | 1 << 0, G18: 1 << 12 | 1 << 11 | 1 << 10 | 1 << 9 | 1 << 8 | 1 << 5 | 1 << 2 | 1 << 0, G15_MASK: 1 << 14 | 1 << 12 | 1 << 10 | 1 << 4 | 1 << 1, getBCHTypeInfo: function(data) {
        var d = data << 10;
        while (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G15) >= 0) {
          d ^= QRUtil.G15 << QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G15);
        }
        return (data << 10 | d) ^ QRUtil.G15_MASK;
      }, getBCHTypeNumber: function(data) {
        var d = data << 12;
        while (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G18) >= 0) {
          d ^= QRUtil.G18 << QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G18);
        }
        return data << 12 | d;
      }, getBCHDigit: function(data) {
        var digit = 0;
        while (data != 0) {
          digit++;
          data >>>= 1;
        }
        return digit;
      }, getPatternPosition: function(typeNumber) {
        return QRUtil.PATTERN_POSITION_TABLE[typeNumber - 1];
      }, getMask: function(maskPattern, i2, j) {
        switch (maskPattern) {
          case QRMaskPattern.PATTERN000:
            return (i2 + j) % 2 == 0;
          case QRMaskPattern.PATTERN001:
            return i2 % 2 == 0;
          case QRMaskPattern.PATTERN010:
            return j % 3 == 0;
          case QRMaskPattern.PATTERN011:
            return (i2 + j) % 3 == 0;
          case QRMaskPattern.PATTERN100:
            return (Math.floor(i2 / 2) + Math.floor(j / 3)) % 2 == 0;
          case QRMaskPattern.PATTERN101:
            return i2 * j % 2 + i2 * j % 3 == 0;
          case QRMaskPattern.PATTERN110:
            return (i2 * j % 2 + i2 * j % 3) % 2 == 0;
          case QRMaskPattern.PATTERN111:
            return (i2 * j % 3 + (i2 + j) % 2) % 2 == 0;
          default:
            throw new Error("bad maskPattern:" + maskPattern);
        }
      }, getErrorCorrectPolynomial: function(errorCorrectLength) {
        var a = new QRPolynomial([1], 0);
        for (var i2 = 0; i2 < errorCorrectLength; i2++) {
          a = a.multiply(new QRPolynomial([1, QRMath.gexp(i2)], 0));
        }
        return a;
      }, getLengthInBits: function(mode, type) {
        if (1 <= type && type < 10) {
          switch (mode) {
            case QRMode.MODE_NUMBER:
              return 10;
            case QRMode.MODE_ALPHA_NUM:
              return 9;
            case QRMode.MODE_8BIT_BYTE:
              return 8;
            case QRMode.MODE_KANJI:
              return 8;
            default:
              throw new Error("mode:" + mode);
          }
        } else if (type < 27) {
          switch (mode) {
            case QRMode.MODE_NUMBER:
              return 12;
            case QRMode.MODE_ALPHA_NUM:
              return 11;
            case QRMode.MODE_8BIT_BYTE:
              return 16;
            case QRMode.MODE_KANJI:
              return 10;
            default:
              throw new Error("mode:" + mode);
          }
        } else if (type < 41) {
          switch (mode) {
            case QRMode.MODE_NUMBER:
              return 14;
            case QRMode.MODE_ALPHA_NUM:
              return 13;
            case QRMode.MODE_8BIT_BYTE:
              return 16;
            case QRMode.MODE_KANJI:
              return 12;
            default:
              throw new Error("mode:" + mode);
          }
        } else {
          throw new Error("type:" + type);
        }
      }, getLostPoint: function(qrCode) {
        var moduleCount = qrCode.getModuleCount();
        var lostPoint = 0;
        for (var row = 0; row < moduleCount; row++) {
          for (var col = 0; col < moduleCount; col++) {
            var sameCount = 0;
            var dark = qrCode.isDark(row, col);
            for (var r = -1; r <= 1; r++) {
              if (row + r < 0 || moduleCount <= row + r) {
                continue;
              }
              for (var c = -1; c <= 1; c++) {
                if (col + c < 0 || moduleCount <= col + c) {
                  continue;
                }
                if (r == 0 && c == 0) {
                  continue;
                }
                if (dark == qrCode.isDark(row + r, col + c)) {
                  sameCount++;
                }
              }
            }
            if (sameCount > 5) {
              lostPoint += 3 + sameCount - 5;
            }
          }
        }
        for (var row = 0; row < moduleCount - 1; row++) {
          for (var col = 0; col < moduleCount - 1; col++) {
            var count = 0;
            if (qrCode.isDark(row, col)) count++;
            if (qrCode.isDark(row + 1, col)) count++;
            if (qrCode.isDark(row, col + 1)) count++;
            if (qrCode.isDark(row + 1, col + 1)) count++;
            if (count == 0 || count == 4) {
              lostPoint += 3;
            }
          }
        }
        for (var row = 0; row < moduleCount; row++) {
          for (var col = 0; col < moduleCount - 6; col++) {
            if (qrCode.isDark(row, col) && !qrCode.isDark(row, col + 1) && qrCode.isDark(row, col + 2) && qrCode.isDark(row, col + 3) && qrCode.isDark(row, col + 4) && !qrCode.isDark(row, col + 5) && qrCode.isDark(row, col + 6)) {
              lostPoint += 40;
            }
          }
        }
        for (var col = 0; col < moduleCount; col++) {
          for (var row = 0; row < moduleCount - 6; row++) {
            if (qrCode.isDark(row, col) && !qrCode.isDark(row + 1, col) && qrCode.isDark(row + 2, col) && qrCode.isDark(row + 3, col) && qrCode.isDark(row + 4, col) && !qrCode.isDark(row + 5, col) && qrCode.isDark(row + 6, col)) {
              lostPoint += 40;
            }
          }
        }
        var darkCount = 0;
        for (var col = 0; col < moduleCount; col++) {
          for (var row = 0; row < moduleCount; row++) {
            if (qrCode.isDark(row, col)) {
              darkCount++;
            }
          }
        }
        var ratio = Math.abs(100 * darkCount / moduleCount / moduleCount - 50) / 5;
        lostPoint += ratio * 10;
        return lostPoint;
      } };
      var QRMath = { glog: function(n) {
        if (n < 1) {
          throw new Error("glog(" + n + ")");
        }
        return QRMath.LOG_TABLE[n];
      }, gexp: function(n) {
        while (n < 0) {
          n += 255;
        }
        while (n >= 256) {
          n -= 255;
        }
        return QRMath.EXP_TABLE[n];
      }, EXP_TABLE: new Array(256), LOG_TABLE: new Array(256) };
      for (i = 0; i < 8; i++) {
        QRMath.EXP_TABLE[i] = 1 << i;
      }
      var i;
      for (i = 8; i < 256; i++) {
        QRMath.EXP_TABLE[i] = QRMath.EXP_TABLE[i - 4] ^ QRMath.EXP_TABLE[i - 5] ^ QRMath.EXP_TABLE[i - 6] ^ QRMath.EXP_TABLE[i - 8];
      }
      var i;
      for (i = 0; i < 255; i++) {
        QRMath.LOG_TABLE[QRMath.EXP_TABLE[i]] = i;
      }
      var i;
      function QRPolynomial(num, shift) {
        if (num.length == void 0) {
          throw new Error(num.length + "/" + shift);
        }
        var offset = 0;
        while (offset < num.length && num[offset] == 0) {
          offset++;
        }
        this.num = new Array(num.length - offset + shift);
        for (var i2 = 0; i2 < num.length - offset; i2++) {
          this.num[i2] = num[i2 + offset];
        }
      }
      QRPolynomial.prototype = { get: function(index) {
        return this.num[index];
      }, getLength: function() {
        return this.num.length;
      }, multiply: function(e) {
        var num = new Array(this.getLength() + e.getLength() - 1);
        for (var i2 = 0; i2 < this.getLength(); i2++) {
          for (var j = 0; j < e.getLength(); j++) {
            num[i2 + j] ^= QRMath.gexp(QRMath.glog(this.get(i2)) + QRMath.glog(e.get(j)));
          }
        }
        return new QRPolynomial(num, 0);
      }, mod: function(e) {
        if (this.getLength() - e.getLength() < 0) {
          return this;
        }
        var ratio = QRMath.glog(this.get(0)) - QRMath.glog(e.get(0));
        var num = new Array(this.getLength());
        for (var i2 = 0; i2 < this.getLength(); i2++) {
          num[i2] = this.get(i2);
        }
        for (var i2 = 0; i2 < e.getLength(); i2++) {
          num[i2] ^= QRMath.gexp(QRMath.glog(e.get(i2)) + ratio);
        }
        return new QRPolynomial(num, 0).mod(e);
      } };
      function QRRSBlock(totalCount, dataCount) {
        this.totalCount = totalCount;
        this.dataCount = dataCount;
      }
      QRRSBlock.RS_BLOCK_TABLE = [[1, 26, 19], [1, 26, 16], [1, 26, 13], [1, 26, 9], [1, 44, 34], [1, 44, 28], [1, 44, 22], [1, 44, 16], [1, 70, 55], [1, 70, 44], [2, 35, 17], [2, 35, 13], [1, 100, 80], [2, 50, 32], [2, 50, 24], [4, 25, 9], [1, 134, 108], [2, 67, 43], [2, 33, 15, 2, 34, 16], [2, 33, 11, 2, 34, 12], [2, 86, 68], [4, 43, 27], [4, 43, 19], [4, 43, 15], [2, 98, 78], [4, 49, 31], [2, 32, 14, 4, 33, 15], [4, 39, 13, 1, 40, 14], [2, 121, 97], [2, 60, 38, 2, 61, 39], [4, 40, 18, 2, 41, 19], [4, 40, 14, 2, 41, 15], [2, 146, 116], [3, 58, 36, 2, 59, 37], [4, 36, 16, 4, 37, 17], [4, 36, 12, 4, 37, 13], [2, 86, 68, 2, 87, 69], [4, 69, 43, 1, 70, 44], [6, 43, 19, 2, 44, 20], [6, 43, 15, 2, 44, 16], [4, 101, 81], [1, 80, 50, 4, 81, 51], [4, 50, 22, 4, 51, 23], [3, 36, 12, 8, 37, 13], [2, 116, 92, 2, 117, 93], [6, 58, 36, 2, 59, 37], [4, 46, 20, 6, 47, 21], [7, 42, 14, 4, 43, 15], [4, 133, 107], [8, 59, 37, 1, 60, 38], [8, 44, 20, 4, 45, 21], [12, 33, 11, 4, 34, 12], [3, 145, 115, 1, 146, 116], [4, 64, 40, 5, 65, 41], [11, 36, 16, 5, 37, 17], [11, 36, 12, 5, 37, 13], [5, 109, 87, 1, 110, 88], [5, 65, 41, 5, 66, 42], [5, 54, 24, 7, 55, 25], [11, 36, 12], [5, 122, 98, 1, 123, 99], [7, 73, 45, 3, 74, 46], [15, 43, 19, 2, 44, 20], [3, 45, 15, 13, 46, 16], [1, 135, 107, 5, 136, 108], [10, 74, 46, 1, 75, 47], [1, 50, 22, 15, 51, 23], [2, 42, 14, 17, 43, 15], [5, 150, 120, 1, 151, 121], [9, 69, 43, 4, 70, 44], [17, 50, 22, 1, 51, 23], [2, 42, 14, 19, 43, 15], [3, 141, 113, 4, 142, 114], [3, 70, 44, 11, 71, 45], [17, 47, 21, 4, 48, 22], [9, 39, 13, 16, 40, 14], [3, 135, 107, 5, 136, 108], [3, 67, 41, 13, 68, 42], [15, 54, 24, 5, 55, 25], [15, 43, 15, 10, 44, 16], [4, 144, 116, 4, 145, 117], [17, 68, 42], [17, 50, 22, 6, 51, 23], [19, 46, 16, 6, 47, 17], [2, 139, 111, 7, 140, 112], [17, 74, 46], [7, 54, 24, 16, 55, 25], [34, 37, 13], [4, 151, 121, 5, 152, 122], [4, 75, 47, 14, 76, 48], [11, 54, 24, 14, 55, 25], [16, 45, 15, 14, 46, 16], [6, 147, 117, 4, 148, 118], [6, 73, 45, 14, 74, 46], [11, 54, 24, 16, 55, 25], [30, 46, 16, 2, 47, 17], [8, 132, 106, 4, 133, 107], [8, 75, 47, 13, 76, 48], [7, 54, 24, 22, 55, 25], [22, 45, 15, 13, 46, 16], [10, 142, 114, 2, 143, 115], [19, 74, 46, 4, 75, 47], [28, 50, 22, 6, 51, 23], [33, 46, 16, 4, 47, 17], [8, 152, 122, 4, 153, 123], [22, 73, 45, 3, 74, 46], [8, 53, 23, 26, 54, 24], [12, 45, 15, 28, 46, 16], [3, 147, 117, 10, 148, 118], [3, 73, 45, 23, 74, 46], [4, 54, 24, 31, 55, 25], [11, 45, 15, 31, 46, 16], [7, 146, 116, 7, 147, 117], [21, 73, 45, 7, 74, 46], [1, 53, 23, 37, 54, 24], [19, 45, 15, 26, 46, 16], [5, 145, 115, 10, 146, 116], [19, 75, 47, 10, 76, 48], [15, 54, 24, 25, 55, 25], [23, 45, 15, 25, 46, 16], [13, 145, 115, 3, 146, 116], [2, 74, 46, 29, 75, 47], [42, 54, 24, 1, 55, 25], [23, 45, 15, 28, 46, 16], [17, 145, 115], [10, 74, 46, 23, 75, 47], [10, 54, 24, 35, 55, 25], [19, 45, 15, 35, 46, 16], [17, 145, 115, 1, 146, 116], [14, 74, 46, 21, 75, 47], [29, 54, 24, 19, 55, 25], [11, 45, 15, 46, 46, 16], [13, 145, 115, 6, 146, 116], [14, 74, 46, 23, 75, 47], [44, 54, 24, 7, 55, 25], [59, 46, 16, 1, 47, 17], [12, 151, 121, 7, 152, 122], [12, 75, 47, 26, 76, 48], [39, 54, 24, 14, 55, 25], [22, 45, 15, 41, 46, 16], [6, 151, 121, 14, 152, 122], [6, 75, 47, 34, 76, 48], [46, 54, 24, 10, 55, 25], [2, 45, 15, 64, 46, 16], [17, 152, 122, 4, 153, 123], [29, 74, 46, 14, 75, 47], [49, 54, 24, 10, 55, 25], [24, 45, 15, 46, 46, 16], [4, 152, 122, 18, 153, 123], [13, 74, 46, 32, 75, 47], [48, 54, 24, 14, 55, 25], [42, 45, 15, 32, 46, 16], [20, 147, 117, 4, 148, 118], [40, 75, 47, 7, 76, 48], [43, 54, 24, 22, 55, 25], [10, 45, 15, 67, 46, 16], [19, 148, 118, 6, 149, 119], [18, 75, 47, 31, 76, 48], [34, 54, 24, 34, 55, 25], [20, 45, 15, 61, 46, 16]];
      QRRSBlock.getRSBlocks = function(typeNumber, errorCorrectLevel) {
        var rsBlock = QRRSBlock.getRsBlockTable(typeNumber, errorCorrectLevel);
        if (rsBlock == void 0) {
          throw new Error("bad rs block @ typeNumber:" + typeNumber + "/errorCorrectLevel:" + errorCorrectLevel);
        }
        var length = rsBlock.length / 3;
        var list = [];
        for (var i2 = 0; i2 < length; i2++) {
          var count = rsBlock[i2 * 3 + 0];
          var totalCount = rsBlock[i2 * 3 + 1];
          var dataCount = rsBlock[i2 * 3 + 2];
          for (var j = 0; j < count; j++) {
            list.push(new QRRSBlock(totalCount, dataCount));
          }
        }
        return list;
      };
      QRRSBlock.getRsBlockTable = function(typeNumber, errorCorrectLevel) {
        switch (errorCorrectLevel) {
          case QRErrorCorrectLevel.L:
            return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 0];
          case QRErrorCorrectLevel.M:
            return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 1];
          case QRErrorCorrectLevel.Q:
            return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 2];
          case QRErrorCorrectLevel.H:
            return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 3];
          default:
            return void 0;
        }
      };
      function QRBitBuffer() {
        this.buffer = [];
        this.length = 0;
      }
      QRBitBuffer.prototype = { get: function(index) {
        var bufIndex = Math.floor(index / 8);
        return (this.buffer[bufIndex] >>> 7 - index % 8 & 1) == 1;
      }, put: function(num, length) {
        for (var i2 = 0; i2 < length; i2++) {
          this.putBit((num >>> length - i2 - 1 & 1) == 1);
        }
      }, getLengthInBits: function() {
        return this.length;
      }, putBit: function(bit) {
        var bufIndex = Math.floor(this.length / 8);
        if (this.buffer.length <= bufIndex) {
          this.buffer.push(0);
        }
        if (bit) {
          this.buffer[bufIndex] |= 128 >>> this.length % 8;
        }
        this.length++;
      } };
      var QRCodeLimitLength = [[17, 14, 11, 7], [32, 26, 20, 14], [53, 42, 32, 24], [78, 62, 46, 34], [106, 84, 60, 44], [134, 106, 74, 58], [154, 122, 86, 64], [192, 152, 108, 84], [230, 180, 130, 98], [271, 213, 151, 119], [321, 251, 177, 137], [367, 287, 203, 155], [425, 331, 241, 177], [458, 362, 258, 194], [520, 412, 292, 220], [586, 450, 322, 250], [644, 504, 364, 280], [718, 560, 394, 310], [792, 624, 442, 338], [858, 666, 482, 382], [929, 711, 509, 403], [1003, 779, 565, 439], [1091, 857, 611, 461], [1171, 911, 661, 511], [1273, 997, 715, 535], [1367, 1059, 751, 593], [1465, 1125, 805, 625], [1528, 1190, 868, 658], [1628, 1264, 908, 698], [1732, 1370, 982, 742], [1840, 1452, 1030, 790], [1952, 1538, 1112, 842], [2068, 1628, 1168, 898], [2188, 1722, 1228, 958], [2303, 1809, 1283, 983], [2431, 1911, 1351, 1051], [2563, 1989, 1423, 1093], [2699, 2099, 1499, 1139], [2809, 2213, 1579, 1219], [2953, 2331, 1663, 1273]];
      function QRCode(options) {
        var instance = this;
        this.options = {
          padding: 4,
          width: 256,
          height: 256,
          typeNumber: 4,
          color: "#000000",
          background: "#ffffff",
          ecl: "M"
        };
        if (typeof options === "string") {
          options = {
            content: options
          };
        }
        if (options) {
          for (var i2 in options) {
            this.options[i2] = options[i2];
          }
        }
        if (typeof this.options.content !== "string") {
          throw new Error("Expected 'content' as string!");
        }
        if (this.options.content.length === 0) {
          throw new Error("Expected 'content' to be non-empty!");
        }
        if (!(this.options.padding >= 0)) {
          throw new Error("Expected 'padding' value to be non-negative!");
        }
        if (!(this.options.width > 0) || !(this.options.height > 0)) {
          throw new Error("Expected 'width' or 'height' value to be higher than zero!");
        }
        function _getErrorCorrectLevel(ecl2) {
          switch (ecl2) {
            case "L":
              return QRErrorCorrectLevel.L;
            case "M":
              return QRErrorCorrectLevel.M;
            case "Q":
              return QRErrorCorrectLevel.Q;
            case "H":
              return QRErrorCorrectLevel.H;
            default:
              throw new Error("Unknwon error correction level: " + ecl2);
          }
        }
        function _getTypeNumber(content2, ecl2) {
          var length = _getUTF8Length(content2);
          var type2 = 1;
          var limit = 0;
          for (var i3 = 0, len = QRCodeLimitLength.length; i3 <= len; i3++) {
            var table = QRCodeLimitLength[i3];
            if (!table) {
              throw new Error("Content too long: expected " + limit + " but got " + length);
            }
            switch (ecl2) {
              case "L":
                limit = table[0];
                break;
              case "M":
                limit = table[1];
                break;
              case "Q":
                limit = table[2];
                break;
              case "H":
                limit = table[3];
                break;
              default:
                throw new Error("Unknwon error correction level: " + ecl2);
            }
            if (length <= limit) {
              break;
            }
            type2++;
          }
          if (type2 > QRCodeLimitLength.length) {
            throw new Error("Content too long");
          }
          return type2;
        }
        function _getUTF8Length(content2) {
          var result = encodeURI(content2).toString().replace(/\%[0-9a-fA-F]{2}/g, "a");
          return result.length + (result.length != content2 ? 3 : 0);
        }
        var content = this.options.content;
        var type = _getTypeNumber(content, this.options.ecl);
        var ecl = _getErrorCorrectLevel(this.options.ecl);
        this.qrcode = new QRCodeModel(type, ecl);
        this.qrcode.addData(content);
        this.qrcode.make();
      }
      QRCode.prototype.svg = function(opt) {
        var options = this.options || {};
        var modules = this.qrcode.modules;
        if (typeof opt == "undefined") {
          opt = { container: options.container || "svg" };
        }
        var pretty = typeof options.pretty != "undefined" ? !!options.pretty : true;
        var indent = pretty ? "  " : "";
        var EOL = pretty ? "\r\n" : "";
        var width = options.width;
        var height = options.height;
        var length = modules.length;
        var xsize = width / (length + 2 * options.padding);
        var ysize = height / (length + 2 * options.padding);
        var join = typeof options.join != "undefined" ? !!options.join : false;
        var swap = typeof options.swap != "undefined" ? !!options.swap : false;
        var xmlDeclaration = typeof options.xmlDeclaration != "undefined" ? !!options.xmlDeclaration : true;
        var predefined = typeof options.predefined != "undefined" ? !!options.predefined : false;
        var defs = predefined ? indent + '<defs><path id="qrmodule" d="M0 0 h' + ysize + " v" + xsize + ' H0 z" style="fill:' + options.color + ';shape-rendering:crispEdges;" /></defs>' + EOL : "";
        var bgrect = indent + '<rect x="0" y="0" width="' + width + '" height="' + height + '" style="fill:' + options.background + ';shape-rendering:crispEdges;"/>' + EOL;
        var modrect = "";
        var pathdata = "";
        for (var y = 0; y < length; y++) {
          for (var x = 0; x < length; x++) {
            var module2 = modules[x][y];
            if (module2) {
              var px = x * xsize + options.padding * xsize;
              var py = y * ysize + options.padding * ysize;
              if (swap) {
                var t = px;
                px = py;
                py = t;
              }
              if (join) {
                var w = xsize + px;
                var h = ysize + py;
                px = Number.isInteger(px) ? Number(px) : px.toFixed(2);
                py = Number.isInteger(py) ? Number(py) : py.toFixed(2);
                w = Number.isInteger(w) ? Number(w) : w.toFixed(2);
                h = Number.isInteger(h) ? Number(h) : h.toFixed(2);
                pathdata += "M" + px + "," + py + " V" + h + " H" + w + " V" + py + " H" + px + " Z ";
              } else if (predefined) {
                modrect += indent + '<use x="' + px.toString() + '" y="' + py.toString() + '" href="#qrmodule" />' + EOL;
              } else {
                modrect += indent + '<rect x="' + px.toString() + '" y="' + py.toString() + '" width="' + xsize + '" height="' + ysize + '" style="fill:' + options.color + ';shape-rendering:crispEdges;"/>' + EOL;
              }
            }
          }
        }
        if (join) {
          modrect = indent + '<path x="0" y="0" style="fill:' + options.color + ';shape-rendering:crispEdges;" d="' + pathdata + '" />';
        }
        var svg = "";
        switch (opt.container) {
          //Wrapped in SVG document
          case "svg":
            if (xmlDeclaration) {
              svg += '<?xml version="1.0" standalone="yes"?>' + EOL;
            }
            svg += '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="' + width + '" height="' + height + '">' + EOL;
            svg += defs + bgrect + modrect;
            svg += "</svg>";
            break;
          //Viewbox for responsive use in a browser, thanks to @danioso
          case "svg-viewbox":
            if (xmlDeclaration) {
              svg += '<?xml version="1.0" standalone="yes"?>' + EOL;
            }
            svg += '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 ' + width + " " + height + '">' + EOL;
            svg += defs + bgrect + modrect;
            svg += "</svg>";
            break;
          //Wrapped in group element    
          case "g":
            svg += '<g width="' + width + '" height="' + height + '">' + EOL;
            svg += defs + bgrect + modrect;
            svg += "</g>";
            break;
          //Without a container
          default:
            svg += (defs + bgrect + modrect).replace(/^\s+/, "");
            break;
        }
        return svg;
      };
      QRCode.prototype.save = function(file, callback) {
        var data = this.svg();
        if (typeof callback != "function") {
          callback = function(error, result) {
          };
        }
        try {
          var fs = require_fs();
          fs.writeFile(file, data, callback);
        } catch (e) {
          callback(e);
        }
      };
      if (typeof module != "undefined") {
        module.exports = QRCode;
      }
    }
  });

  // application/configurations/appConfig.js
  var require_appConfig = __commonJS({
    "application/configurations/appConfig.js"(exports, module) {
      var __dirname = "/application/configurations";
      var path = require_path();
      var { getIcon, generateName, generatePfp, getAllPfp, getknownPacks, translateToPack } = require_generazione();
      var { StatoStanza } = require_Stanza();
      var { Mazzo } = require_Mazzo();
      var crypto = require_crypto();
      var express = require_express();
      var cors = require_cors();
      var { SitemapStream } = require_sitemap();
      var { createGzip } = require_zlib();
      var QRCode = require_qrcode();
      var appConfig = (app, serverSession, TEMPORARY_TOKEN, Stanze, allowedOrigins, local, timeout = 36e5, pagesOptions = {
        version: "1.5.1",
        cluster: false
      }, archivioSegnalazioni = null, chiaveSegnalazioni = null, manutenzione = false) => {
        const getCustomId = (req) => {
          const raw = req.headers?.["x-id-token"] || req.headers?.["x-cucuridu-code"] || req.query?.idToken || req.query?.cucuriduCode || req.body?.idToken || req.body?.cucuriduCode || null;
          return typeof raw === "string" && raw.trim() ? raw.trim() : null;
        };
        const renderPage = (req, res, page, params = {
          simple: false
        }) => {
          const filter = /MSIE|Trident|webOS|LG Browser|Tizen|SamsungBrowser\/[1-9]\.|Opera Mini|Chrome\/([1-6][0-9])\.|Firefox\/([1-5][0-9])\.|Version\/([1-9]|10|11)(\.[0-9]+)? Safari\/|iPhone OS ([1-9]|10|11|12)_|Android [1-7]\./i;
          const target = req.headers["user-agent"] || "";
          const legacy = filter.test(target);
          const details = {
            scripts: legacy ? "/dist/script" : "/script",
            styles: pagesOptions.cluster ? "/dist/style/" : "/style",
            legacy,
            allowedOrigins
          };
          res.render(params.simple ? "simpleHeader" : "header", {
            params: {
              ...pagesOptions,
              ...params,
              ...details
            },
            page,
            ...details,
            cluster: pagesOptions.cluster,
            headerIcon: getIcon(true)
          });
        };
        const preCheck = async (req, res, next) => {
          req.deleteToken = !!req.query?.token;
          const customId = getCustomId(req);
          const queryToken = req.query?.token || null;
          if (!req.session?.storeData && !queryToken && !customId) return next();
          try {
            const { userId, stanzaId, jwt } = await serverSession.get(req, queryToken, customId);
            const activeToken = queryToken || jwt;
            const queryParams = new URLSearchParams();
            if (activeToken) queryParams.set("token", activeToken);
            if (customId) queryParams.set("idToken", customId);
            const redirecting = queryParams.toString() ? "?" + queryParams.toString() : "";
            if (userId && stanzaId && (await Stanze.get(stanzaId))?.trovaGiocatore(userId)) {
              return res.redirect("/game" + redirecting);
            }
          } catch (e) {
            console.error(`[preCheck] ${req.method} ${req.originalUrl} -> controllo stanza esistente fallito, proseguo:`, e?.stack || e);
          }
          next();
        };
        app.use(express.static(path.join(__dirname, "..", "../public")));
        app.set("view engine", "ejs");
        app.set("trust proxy", 1);
        app.get(["/ping", "/health"], async (req, res) => {
          res.setHeader("Access-Control-Allow-Origin", "*");
          const roomId = typeof req.query?.room === "string" ? req.query.room.trim() : "";
          let hasRoom = false;
          if (roomId) {
            try {
              hasRoom = Boolean(await Stanze.has(roomId));
            } catch {
              hasRoom = false;
            }
          }
          res.status(200).json({ ok: true, hasRoom });
        });
        app.use(express.urlencoded({ extended: true }));
        app.use(express.json());
        if (!local)
          app.use(cors({
            origin: (origin, callback) => {
              if (!origin || allowedOrigins.indexOf(origin) !== -1) callback(null, true);
              else callback(new Error("Non consentito dalla policy CORS"));
            },
            credentials: true
          }));
        app.use(serverSession.setupSession({
          resave: false,
          saveUninitialized: true,
          cookie: {
            secure: !local,
            sameSite: !local ? "none" : null,
            maxAge: timeout
          }
        }));
        app.get("/syncIDToken", (req, res) => renderPage(req, res, "syncIDToken", {
          simple: true,
          error: 500,
          icon: getIcon(),
          message: "Non dovresti essere qui"
        }));
        app.get("/offline", (req, res) => renderPage(req, res, "offline", {
          loadToken: false
        }));
        app.get("/worker", (req, res) => {
          res.setHeader("Content-Type", "application/javascript");
          res.setHeader("Cache-Control", "no-cache, proxy-revalidate");
          res.setHeader("Service-Worker-Allowed", "/");
          res.sendFile(path.resolve(__dirname, "..", "../public/script/config/worker.js"));
        });
        app.get("/segnalazioni", async (req, res) => {
          if (!archivioSegnalazioni || !chiaveSegnalazioni) return res.redirect("/error");
          if (req.query?.chiave !== chiaveSegnalazioni) return res.redirect("/error");
          const scappa = (testo) => String(testo ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
          try {
            const righe = await archivioSegnalazioni.leggi(300);
            const quandoIt = (valore) => {
              if (!valore) return "";
              const d = new Date(valore);
              return isNaN(d) ? String(valore) : d.toLocaleString("it-IT");
            };
            const daFare = righe.filter((r) => !r.risolta).length;
            const eSuggerimento = (tipo) => String(tipo || "").startsWith("suggerimento_");
            const etichette = {
              frase: "Frase",
              completamento: "Completamento",
              suggerimento_frase: "Frase nuova",
              suggerimento_completamento: "Carta nuova"
            };
            const classeRiga = (r) => [
              String(r.tipo || "").includes("frase") ? "frase" : "compl",
              eSuggerimento(r.tipo) ? "sugg" : "corr",
              r.risolta ? "risolta" : ""
            ].filter(Boolean).join(" ");
            const quantiSuggerimenti = righe.filter((r) => eSuggerimento(r.tipo)).length;
            const quanteCorrezioni = righe.length - quantiSuggerimenti;
            const corpo = righe.length ? righe.map((r) => `<tr class="${classeRiga(r)}" data-id="${scappa(r.id)}">
                        <td class="fatto"><input type="checkbox" class="segnaFatto" ${r.risolta ? "checked" : ""} aria-label="Segna come fatta"></td>
                        <td class="quando">${scappa(quandoIt(r.creato_at))}</td>
                        <td class="tipo">${scappa(etichette[r.tipo] || r.tipo)}</td>
                        <td class="testo">${scappa(r.testo)}</td>
                        <td class="nota">${scappa(r.nota || "")}</td>
                        <td class="chi">${scappa(r.giocatore || "")}<br><small>${scappa(r.stanza_id || "")}</small></td>
                    </tr>`).join("") : `<tr><td colspan="6" class="vuoto">Niente di niente, per ora tutto a posto</td></tr>`;
            res.status(200).send(`<!doctype html><html lang="it"><head><meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <meta name="robots" content="noindex">
                <title>Segnalazioni - Cucu Ridu</title><style>
                body{font-family:system-ui,Arial,sans-serif;margin:0;padding:24px;background:#faf7f2;color:#2b2b2b}
                h1{font-size:1.4rem;margin:0 0 4px}
                p.sotto{margin:0 0 10px;color:#777;font-size:0.85rem}
                label.filtro{display:inline-flex;align-items:center;gap:6px;margin:0 0 14px;font-size:0.85rem;color:#555;cursor:pointer}
                table{border-collapse:collapse;width:100%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.12);border-radius:8px;overflow:hidden}
                th,td{padding:9px 12px;text-align:left;vertical-align:top;font-size:0.88rem;border-bottom:1px solid #eee}
                th{background:#f0ece5;font-size:0.75rem;text-transform:uppercase;letter-spacing:.04em;color:#666}
                td.fatto{text-align:center;width:20px}
                td.fatto input{width:18px;height:18px;cursor:pointer}
                tr.frase .tipo{color:#a3560f;font-weight:600}
                tr.compl .tipo{color:#3a6ea5;font-weight:600}
                tr.sugg{background:#f6fbf5}
                tr.sugg .tipo{color:#2f7d4f;font-weight:600}
                tr.sugg .tipo::before{content:"+ "}
                body.soloCorrezioni tr.sugg{display:none}
                body.soloSuggerimenti tr.corr{display:none}
                tr.risolta{opacity:0.45}
                tr.risolta td.testo,tr.risolta td.nota{text-decoration:line-through}
                body.nascondiRisolte tr.risolta{display:none}
                td.quando,td.chi{white-space:nowrap;color:#777;font-size:0.8rem}
                td.testo{font-weight:600;max-width:520px}
                td.nota{color:#555;max-width:320px}
                td.vuoto{text-align:center;color:#888;padding:30px}
                </style></head><body>
                <h1>Segnalazioni e suggerimenti</h1>
                <p class="sotto">${righe.length} righe dalla piu recente, ${daFare} ancora da sistemare: ${quanteCorrezioni} correzioni (roba sbagliata trovata giocando) e ${quantiSuggerimenti} suggerimenti (frasi e carte nuove proposte dai giocatori).</p>
                <label class="filtro"><input type="checkbox" id="nascondiRisolte">Nascondi quelle gia' fatte</label>
                <label class="filtro">Mostra:
                <select id="filtroTipo">
                <option value="tutto">tutto</option>
                <option value="correzioni">solo correzioni</option>
                <option value="suggerimenti">solo suggerimenti</option>
                </select></label>
                <table><thead><tr><th>Fatto</th><th>Quando</th><th>Tipo</th><th>Testo</th><th>Nota</th><th>Chi</th></tr></thead>
                <tbody>${corpo}</tbody></table>
                <script>
                (function () {
                    var chiave = ${JSON.stringify(String(chiaveSegnalazioni))};
                    document.querySelectorAll(".segnaFatto").forEach(function (box) {
                        box.addEventListener("change", function () {
                            var riga = box.closest("tr");
                            var id = riga.getAttribute("data-id");
                            var risolta = box.checked;
                            box.disabled = true;
                            fetch("/segnalazioni/segna", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ chiave: chiave, id: id, risolta: risolta })
                            }).then(function (r) { return r.json(); }).then(function (data) {
                                if (!data || !data.ok) throw new Error("esito negativo");
                                riga.classList.toggle("risolta", risolta);
                            }).catch(function (e) {
                                console.error(e);
                                box.checked = !risolta;
                                alert("Non sono riuscito a salvare, riprova");
                            }).finally(function () {
                                box.disabled = false;
                            });
                        });
                    });
                    var nascondi = document.getElementById("nascondiRisolte");
                    nascondi.addEventListener("change", function () {
                        document.body.classList.toggle("nascondiRisolte", nascondi.checked);
                    });
                    var filtro = document.getElementById("filtroTipo");
                    filtro.addEventListener("change", function () {
                        document.body.classList.toggle("soloCorrezioni", filtro.value === "correzioni");
                        document.body.classList.toggle("soloSuggerimenti", filtro.value === "suggerimenti");
                    });
                })();
                <\/script>
                </body></html>`);
          } catch (e) {
            console.error("[segnalazioni]", e?.message || e);
            res.status(500).send("Errore nel leggere le segnalazioni");
          }
        });
        app.post("/segnalazioni/segna", async (req, res) => {
          if (!archivioSegnalazioni || !chiaveSegnalazioni) return res.status(404).end();
          const { chiave, id, risolta } = req.body || {};
          if (chiave !== chiaveSegnalazioni) return res.status(403).json({ ok: false });
          if (!id) return res.status(400).json({ ok: false });
          try {
            const ok = await archivioSegnalazioni.segna(String(id), !!risolta);
            res.status(200).json({ ok: !!ok });
          } catch (e) {
            console.error("[segnalazioni:segna]", e?.message || e);
            res.status(500).json({ ok: false });
          }
        });
        app.use((req, res, next) => {
          if (manutenzione) {
            res.status(503);
            return renderPage(req, res, "error", {
              error: 503,
              icon: getIcon(),
              message: "Il server \xE8 in manutenzione subumano, torna pi\xF9 tardi",
              loadToken: false,
              bgm: "Error-Tough_Decisions"
            });
          }
          next();
        });
        app.get("/", preCheck, (req, res) => {
          const { openSettings } = req.query;
          renderPage(req, res, "index", {
            icon: getIcon(),
            deleteToken: req.deleteToken,
            bgm: "MainMenu-City_Stroll",
            openSettings: openSettings === "true"
          });
        });
        app.get(["/home", "/index"], (req, res) => res.redirect("/"));
        app.get("/partecipaStanza/:codiceStanza", preCheck, (req, res) => {
          const stanza = req.params["codiceStanza"];
          if (stanza) renderPage(req, res, "profile", {
            stanza,
            setOfPfp: getAllPfp(),
            deleteToken: req.deleteToken,
            bgm: "Choosing_Menu-Feeling_Good"
          });
          else res.redirect("/");
        });
        app.get("/partecipaStanza", preCheck, (req, res) => {
          const { nome, pfp, stanza } = req.query;
          const customId = getCustomId(req);
          if (nome && pfp && stanza) {
            const token = serverSession.set(req, {
              nome,
              pfp,
              stanzaId: stanza,
              deleteToken: req.deleteToken,
              bgm: "Choosing_Menu-Feeling_Good"
            }, customId);
            res.redirect("/game?token=" + token + (customId ? "&idToken=" + encodeURIComponent(customId) : ""));
          } else if (stanza) renderPage(req, res, "profile", {
            stanza,
            setOfPfp: getAllPfp(),
            deleteToken: req.deleteToken,
            bgm: "Choosing_Menu-Feeling_Good"
          });
          else renderPage(req, res, "join", {
            bgm: "Choosing_Menu-Feeling_Good",
            deleteToken: req.deleteToken
          });
        });
        app.get("/creaStanza", preCheck, (req, res) => {
          const { nome, pfp } = req.query;
          const customId = getCustomId(req);
          if (nome && pfp) {
            const token = serverSession.set(req, {
              nome,
              pfp,
              bgm: "Choosing_Menu-Feeling_Good"
            }, customId);
            res.redirect("/game?token=" + token + (customId ? "&idToken=" + encodeURIComponent(customId) : ""));
          } else renderPage(req, res, "profile", {
            setOfPfp: getAllPfp(),
            deleteToken: req.deleteToken,
            bgm: "Choosing_Menu-Feeling_Good"
          });
        });
        app.get("/game", async (req, res) => {
          const customId = getCustomId(req);
          const check = ["nome", "pfp", "stanzaId", "userId"];
          const { nome, pfp, stanzaId, userId } = await serverSession.validate(
            check,
            req.session?.storeData,
            req.query?.token,
            customId ? { customId } : null
          );
          if (req.session && !req.session.storeData && (userId || nome)) {
            req.session.storeData = { nome, pfp, stanzaId, userId };
          }
          if (userId && stanzaId && await Stanze.has(stanzaId) && (await Stanze.get(stanzaId))?.trovaGiocatore(userId))
            renderPage(req, res, "lobby", {
              userId,
              stanzaId,
              token: TEMPORARY_TOKEN,
              knownPacks: getknownPacks(),
              bgm: "GameMusic-Candy_Bazaar"
            });
          else if (nome && pfp) {
            renderPage(req, res, "lobby", {
              nome,
              pfp,
              stanzaId,
              token: TEMPORARY_TOKEN,
              action: !stanzaId ? "Crea" : "Partecipa",
              knownPacks: getknownPacks(),
              bgm: "GameMusic-Candy_Bazaar"
            });
          } else {
            await serverSession.invalidate(req, req.query?.token, customId);
            res.redirect("/");
          }
        });
        app.get("/creaMazzo", (req, res) => renderPage(req, res, "createPacks", {
          loadToken: false
        }));
        app.get("/error", (req, res) => {
          let status = 104;
          let message = "Questa pagina non esiste, brutta sottospecie di spermatozoo di elefante con la disfunzione erettile";
          if (req.query["alreadyConnected"]) {
            status = 420;
            message = "Allora signora, si scanti fora e torni alla pagina del gioco";
          }
          renderPage(req, res, "error", {
            error: status,
            icon: getIcon(),
            message,
            loadToken: false,
            bgm: "Error-Tough_Decisions"
          });
        });
        app.get("/sitemap", async (req, res) => {
          res.header("Content-Type", "application/xml");
          res.header("Content-Encoding", "gzip");
          try {
            const protocol = req.protocol;
            const host = req.get("host");
            const url = `${protocol}://${host}`;
            const smStream = new SitemapStream({ hostname: url });
            const pipeline = smStream.pipe(createGzip());
            smStream.write({ url: "/", changefreq: "daily", priority: 1 });
            smStream.write({ url: "/partecipaStanza", changefreq: "daily", priority: 0.5 });
            smStream.write({ url: "/creaStanza", changefreq: "daily", priority: 0.5 });
            smStream.write({ url: "/creaMazzo", changefreq: "daily", priority: 0.5 });
            smStream.end();
            pipeline.pipe(res).on("error", (e) => {
              throw e;
            });
          } catch (e) {
            console.error(e);
            res.status(500).end();
          }
        });
        app.get("/qrCode", async (req, res) => {
          res.setHeader("Content-Type", "image/svg+xml");
          res.setHeader("Content-Disposition", 'inline; filename="qrcode.svg"');
          res.setHeader("Cache-Control", "public, max-age=36000");
          try {
            const url = req.query.url;
            const size = parseInt(req.query.size) || 400;
            const radius = parseFloat(req.query.radius) || 0;
            const padding = parseFloat(req.query.padding) || 0;
            const background = req.query.background || "none";
            const filler = req.query.filler || "#000000";
            const QR_ECL = {
              L: "7%",
              M: "15%",
              Q: "25%",
              H: "30%"
            };
            let quality = req.query.quality;
            if (!QR_ECL[quality])
              quality = "H";
            const qr = new QRCode({
              content: url,
              padding,
              width: size,
              height: size,
              color: filler,
              background,
              ecl: quality
            });
            const svg = qr.svg();
            const rValue = radius * (size / 40);
            const roundedSvg = svg.replace(/<rect(?! [^>]*id="bg"| [^>]*class="background")/g, `<rect rx="${rValue}" ry="${rValue}"`);
            res.send(roundedSvg);
          } catch (err) {
            console.log(err);
            res.status(500).send("Errore");
          }
        });
        app.post("/generateInfo", (req, res) => {
          res.status(200).json({ nome: generateName(), pfp: generatePfp() });
        });
        app.post("/doRoomExists", async (req, res) => {
          try {
            const { roomId } = req.body || {};
            const stanza = roomId ? await Stanze.get(roomId) : null;
            res.status(200).json({ result: Boolean(stanza && stanza.stato !== StatoStanza.END) });
          } catch (e) {
            console.error("[doRoomExists]", e?.message || e);
            res.status(200).json({ result: false });
          }
        });
        app.post("/checkActiveGame", async (req, res) => {
          try {
            const customId = getCustomId(req);
            if (!customId && !req.session?.storeData) return res.status(200).json({ active: false });
            const { userId, stanzaId, jwt } = await serverSession.get(req, null, customId);
            if (userId && stanzaId && (await Stanze.get(stanzaId))?.trovaGiocatore(userId)) {
              const params = new URLSearchParams();
              if (jwt) params.set("token", jwt);
              if (customId) params.set("idToken", customId);
              return res.status(200).json({
                active: true,
                redirectUrl: "/game?" + params.toString()
              });
            }
            res.status(200).json({ active: false });
          } catch {
            res.status(200).json({ active: false });
          }
        });
        app.post("/saveGameReference", async (req, res) => {
          const { userId, stanzaId } = req.body || {};
          const activeIdToken = getCustomId(req);
          if (userId && stanzaId) {
            const token = serverSession.set(req, {
              userId,
              stanzaId
            }, activeIdToken);
            return res.status(200).json({
              result: true,
              fallback: token
            });
          }
          await serverSession.invalidate(req, null, activeIdToken);
          res.status(406).json({ result: false });
        });
        app.post("/deleteGameReference", async (req, res) => {
          await serverSession.invalidate(req, req.body?.token, getCustomId(req));
          res.status(200).json({ result: true });
        });
        app.post("/createPack", (req, res) => {
          const packsPair = req.body || "";
          const packs = [];
          for (const pair of packsPair) {
            const righe = translateToPack(pair);
            if (Mazzo.problemaMazzo(righe) === null) {
              const mazzoFinale = {
                frasi: righe[0],
                completamenti: righe[1],
                name: righe[2][0] || "default"
              };
              const datiString = JSON.stringify(mazzoFinale, Object.keys(mazzoFinale).sort());
              const hash = crypto.createHash("sha256").update(datiString).digest("hex");
              packs.push({ ...mazzoFinale, hash });
            } else
              return res.status(400).json({
                success: false
              });
          }
          res.status(200).json({
            success: true,
            packs: JSON.stringify(packs)
          });
        });
        app.use((req, res) => res.redirect("/error"));
        app.use((err, req, res, next) => {
          console.error(`[http] ${req.method} ${req.originalUrl} ->`, err?.stack || err);
          if (res.headersSent) return next(err);
          res.status(500).type("html").send(`<!doctype html><html lang="it"><head><meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1"><title>Cucu Ridu</title>
        <style>body{font-family:system-ui,Arial,sans-serif;display:flex;min-height:100vh;margin:0;align-items:center;justify-content:center;text-align:center;background:#faf7f2;color:#2b2b2b}a{color:#a3560f;font-weight:600}</style>
        </head><body><div><h1>Ops, qualcosa si e' rotto</h1><p>Riprova fra qualche secondo.</p><p><a href="/">Torna alla home</a></p></div></body></html>`);
        });
      };
      module.exports = appConfig;
    }
  });

  // application/include/script/concorrenza.js
  var require_concorrenza = __commonJS({
    "application/include/script/concorrenza.js"(exports, module) {
      var code = /* @__PURE__ */ new Map();
      var conLock = (chiave, azione) => {
        const precedente = code.get(chiave) || Promise.resolve();
        const risultato = precedente.then(azione, azione);
        const coda = risultato.then(() => {
        }, () => {
        });
        code.set(chiave, coda);
        coda.then(() => {
          if (code.get(chiave) === coda) code.delete(chiave);
        });
        return risultato;
      };
      var attendi = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      var NESSUNA_MODIFICA = /* @__PURE__ */ Symbol("nessunaModifica");
      module.exports = { conLock, attendi, NESSUNA_MODIFICA };
    }
  });

  // application/include/script/Segnalazioni.js
  var require_Segnalazioni = __commonJS({
    "application/include/script/Segnalazioni.js"(exports, module) {
      var crypto = require_crypto();
      var TIPI_SEGNALAZIONE = ["frase", "completamento"];
      var TIPI_SUGGERIMENTO = ["suggerimento_frase", "suggerimento_completamento"];
      var MASSIMO_PER_INVIO = 15;
      var LUNGHEZZA_TESTO = 400;
      var LUNGHEZZA_NOTA = 500;
      var taglia = (valore, massimo) => String(valore ?? "").trim().slice(0, massimo);
      var normalizzaRighe = (righe, contesto = {}, tipiAmmessi = TIPI_SEGNALAZIONE) => {
        if (!Array.isArray(righe)) return [];
        const ammessi = Array.isArray(tipiAmmessi) && tipiAmmessi.length ? tipiAmmessi : TIPI_SEGNALAZIONE;
        const ripiego = ammessi[ammessi.length - 1];
        return righe.slice(0, MASSIMO_PER_INVIO).map((riga) => ({
          stanza_id: taglia(contesto.stanzaId, 12) || null,
          giocatore: taglia(contesto.giocatore, 80) || null,
          tipo: ammessi.includes(riga?.tipo) ? riga.tipo : ripiego,
          testo: taglia(riga?.testo, LUNGHEZZA_TESTO),
          nota: taglia(contesto.nota, LUNGHEZZA_NOTA) || null
        })).filter((riga) => riga.testo.length > 0);
      };
      var SegnalazioniLocali = class {
        constructor(massimo = 500) {
          this.massimo = massimo;
          this.righe = [];
        }
        async aggiungi(righe) {
          if (!righe.length) return 0;
          const conData = righe.map((r) => ({ ...r, id: crypto.randomUUID(), risolta: false, creato_at: (/* @__PURE__ */ new Date()).toISOString() }));
          this.righe.unshift(...conData);
          if (this.righe.length > this.massimo) this.righe.length = this.massimo;
          return conData.length;
        }
        async leggi(limite = 200) {
          return this.righe.slice(0, limite);
        }
        /** Segna (o smarca) una segnalazione come risolta. */
        async segna(id, risolta) {
          const riga = this.righe.find((r) => r.id === id);
          if (!riga) return false;
          riga.risolta = !!risolta;
          return true;
        }
      };
      var SegnalazioniCluster = class {
        constructor(client) {
          this.supabase = client;
          this.tabella = "segnalazioni";
        }
        async aggiungi(righe) {
          if (!righe.length) return 0;
          const { error } = await this.supabase.from(this.tabella).insert(righe);
          if (error) throw error;
          return righe.length;
        }
        async leggi(limite = 200) {
          const { data, error } = await this.supabase.from(this.tabella).select("*").order("creato_at", { ascending: false }).limit(limite);
          if (error) throw error;
          return data || [];
        }
        /** Segna (o smarca) una segnalazione come risolta. */
        async segna(id, risolta) {
          const { error } = await this.supabase.from(this.tabella).update({ risolta: !!risolta }).eq("id", id);
          if (error) throw error;
          return true;
        }
      };
      module.exports = {
        SegnalazioniLocali,
        SegnalazioniCluster,
        normalizzaRighe,
        MASSIMO_PER_INVIO,
        TIPI_SEGNALAZIONE,
        TIPI_SUGGERIMENTO
      };
    }
  });

  // application/configurations/serverConfig.js
  var require_serverConfig = __commonJS({
    "application/configurations/serverConfig.js"(exports, module) {
      var path = require_path();
      var { Stanza, StatoStanza } = require_Stanza();
      var { Giocatore } = require_Giocatore();
      var { Mazzo } = require_Mazzo();
      var { NESSUNA_MODIFICA } = require_concorrenza();
      var { normalizzaRighe, TIPI_SUGGERIMENTO } = require_Segnalazioni();
      var serverConfig = (server, serverSession, TEMPORARY_TOKEN, Stanze, generationMemory, timeout = 36e5, archivioSegnalazioni = null) => {
        const GRAZIA_DISCONNESSIONE = Math.min(Math.max(timeout / 60 * 3, 6e4), 3e5);
        const PAUSA_SEGNALAZIONI = 4e3;
        const PAUSA_SINCRONIZZA = 2500;
        const sicuro = (nome, handler) => async (...args) => {
          try {
            await handler(...args);
          } catch (e) {
            console.error(`[socket:${nome}]`, e?.message || e);
          }
        };
        const giocatoreDi = (socket, stanza) => {
          const id = socket.data?.giocatoreId || socket.data?.referenceGiocatore?.id;
          if (!id) return null;
          return stanza?.trovaGiocatore(id) || null;
        };
        const aggiornaReference = (stanza, sockets) => {
          for (const socket of sockets) {
            const giocatore = giocatoreDi(socket, stanza);
            if (giocatore) socket.data.referenceGiocatore = giocatore;
          }
        };
        const haAncoraUnSocket = async (stanzaId, giocatoreId, escluso) => {
          try {
            const sockets = await server.in(stanzaId).fetchSockets();
            return sockets.some((s) => s.id !== escluso && s.data?.giocatoreId === giocatoreId);
          } catch {
            return false;
          }
        };
        const inviaListe = (stanza) => {
          if (!stanza?.id) return;
          const classifica = stanza.classifica().map((giocatore) => giocatore.toJSON());
          server.to(stanza.id).emit("aggiornamentoAttesa", {
            numeroGiocatori: stanza.giocatori.size,
            minimoGiocatori: stanza.minimoGiocatori,
            giocatori: classifica
          });
          server.to(stanza.id).emit("listaGiocatoriAggiornamento", { giocatori: classifica });
        };
        const inviaAttesaRisposte = (stanza, destinatario = null) => {
          if (!stanza?.id || !stanza.round) return;
          const risposte = stanza.round.risposte instanceof Map ? stanza.round.risposte : /* @__PURE__ */ new Map();
          (destinatario || server.to(stanza.id)).emit("aggiornamentoAttesaRisposta", {
            numeroGiocatori: risposte.size,
            totaleAttesi: Math.max(0, stanza.giocatori.size - 1),
            giocatori: Array.from(risposte.keys()).map((id) => stanza.trovaGiocatore(id)?.toJSON()).filter(Boolean)
          });
        };
        const vistaAttesa = (stanza, giocatore) => {
          switch (stanza?.stato) {
            case StatoStanza.WAIT:
              return ["wait", "showWinner", "endGame"];
            case StatoStanza.CHOOSING_CARDS:
              return stanza.round?.risposte?.has?.(giocatore?.id) ? ["waitWinner"] : ["choosingCards"];
            case StatoStanza.CHOOSING_WINNER:
              return ["chooseWinner"];
            default:
              return [];
          }
        };
        const emitStatoStanza = async (stanzaId, ...sockets) => {
          const stanza = typeof stanzaId === "string" ? await Stanze.get(stanzaId) : stanzaId;
          if (!stanza) {
            for (const socket of sockets) {
              try {
                socket.emit("stanzaChiusa");
              } catch {
              }
            }
            return;
          }
          for (const socket of sockets) {
            try {
              const giocatore = giocatoreDi(socket, stanza);
              if (giocatore) socket.data.referenceGiocatore = giocatore;
              switch (stanza.stato) {
                case StatoStanza.WAIT: {
                  socket.emit("confermaStanza", {
                    reference: giocatore?.toJSON() ?? null,
                    stanzaId: stanza.id,
                    primoRound: stanza.numeroRound[0] === 0,
                    interroghi: !!giocatore && stanza.round?.chiStaInterrogando === giocatore.id
                  });
                  break;
                }
                case StatoStanza.END: {
                  socket.emit("stanzaChiusa");
                  socket.data.referenceGiocatore = null;
                  socket.leave(stanza.id);
                  break;
                }
                case StatoStanza.CHOOSING_CARDS: {
                  if (!giocatore) {
                    socket.emit("stanzaChiusa");
                    break;
                  }
                  if (stanza.round?.risposte?.has(giocatore.id))
                    socket.emit("rispostaRegistrata", { stanzaId: stanza.id });
                  else
                    socket.emit("roundIniziato", {
                      chiStaInterrogando: stanza.trovaGiocatore(stanza.round.chiStaInterrogando)?.toJSON() ?? null,
                      domanda: stanza.round.domanda,
                      reference: giocatore.toJSON(),
                      stanza: stanza.id
                    });
                  break;
                }
                case StatoStanza.CHOOSING_WINNER: {
                  socket.emit("sceltaVincitore", {
                    risposte: Array.from(stanza.round?.risposte?.entries() ?? []),
                    domanda: stanza.round?.domanda ?? null,
                    chiInterroga: stanza.trovaGiocatore(stanza.round?.chiStaInterrogando)?.toJSON() ?? null,
                    reference: giocatore?.toJSON() ?? null,
                    stanza: stanza.id
                  });
                  break;
                }
              }
              server.to(stanza.id).emit("segnaleAudio", {
                socketId: socket.id,
                playerId: giocatore?.id ?? null
              });
            } catch (e) {
              console.error("[emitStatoStanza]", e?.message || e);
            }
          }
        };
        const chiudiStanza = async (stanza) => {
          if (!stanza) return;
          for (const id of stanza.giocatoriPassati.values()) {
            try {
              await generationMemory.delete(id);
            } catch {
            }
          }
          try {
            await Stanze.delete(stanza.id);
          } catch {
          }
          try {
            await generationMemory.delete(stanza.id);
          } catch {
          }
          server.socketsLeave(stanza.id);
        };
        const cleanUp = async () => {
          try {
            await Stanza.pulisciStanza((id) => {
              server.to(id).emit("stanzaChiusa");
              server.socketsLeave(id);
              console.log("Stanza eliminata => " + id);
            }, generationMemory, Stanze);
          } catch (err) {
            console.error(err?.message || err);
          } finally {
            const t = setTimeout(cleanUp, Math.max(timeout / 30, 6e4));
            if (t.unref) t.unref();
          }
        };
        server.use(async (socket, next) => {
          try {
            const rawCustomId = socket.handshake.auth?.customId || socket.handshake.auth?.idToken || socket.handshake.auth?.cucuriduCode || null;
            const customId = typeof rawCustomId === "string" && rawCustomId.trim() ? rawCustomId.trim() : null;
            if (customId) socket.data.customId = customId;
            const checks = ["validation", "stanzaId", "userId"];
            const { validation, stanzaId, userId } = await serverSession.validate(
              checks,
              socket.handshake.auth,
              socket.handshake.auth?.token,
              customId ? { customId } : null
            );
            if (validation !== TEMPORARY_TOKEN) return next(new Error("INVALID_KEY"));
            if (!stanzaId) return next();
            const stanza = await Stanze.get(stanzaId);
            const exist = stanza?.trovaGiocatoreAnchePassato(userId);
            if (exist === null) return next();
            if (!exist) return next(new Error("SESSION_EXPIRED"));
            exist.assegnaSocket(socket.id);
            try {
              await Stanze.setPresenza(userId, stanzaId, true, socket.id, Date.now(), null);
            } catch {
              exist.online = true;
              try {
                await Stanze.set(stanzaId, stanza);
              } catch {
              }
            }
            socket.join(stanzaId);
            socket.data.giocatoreId = exist.id;
            socket.data.referenceGiocatore = exist;
            socket.data.referenceStanza = stanzaId;
            next();
          } catch (e) {
            console.error("[middleware]", e?.message || e);
            next(new Error("SESSION_EXPIRED"));
          }
        });
        server.on("connection", (user) => {
          if (user.data?.referenceStanza) user.join(user.data.referenceStanza);
          (async () => {
            try {
              if (!user.data?.referenceStanza) return;
              const stanza = await Stanze.get(user.data.referenceStanza);
              if (!stanza) return user.emit("stanzaChiusa");
              if (stanza.stato !== StatoStanza.WAIT) await emitStatoStanza(stanza, user);
              inviaListe(stanza);
              inviaAttesaRisposte(stanza);
            } catch (e) {
              console.error("[connection]", e?.message || e);
            }
          })();
          user.on("creaStanza", sicuro("creaStanza", async (data) => {
            try {
              const { username, pfp } = data || {};
              const stanza = await new Stanza().init(username, pfp, generationMemory);
              await Stanze.set(stanza.id, stanza);
              user.join(stanza.id);
              user.data.referenceGiocatore = stanza.master;
              user.data.giocatoreId = stanza.master.id;
              user.data.referenceStanza = stanza.id;
              if (user.data.customId) {
                serverSession.set(null, {
                  nome: username,
                  pfp,
                  userId: stanza.master.id,
                  stanzaId: stanza.id
                }, user.data.customId);
              }
              try {
                await Stanze.setPresenza(stanza.master.id, stanza.id, true, user.id, Date.now(), null);
              } catch {
              }
              user.emit("confermaStanza", {
                stanzaId: stanza.id,
                reference: stanza.master.toJSON(),
                primoRound: stanza.numeroRound[0] === 0,
                interroghi: stanza.round.chiStaInterrogando === stanza.master.id
              });
              inviaListe(stanza);
              server.to(stanza.id).emit("segnaleAudio", {
                socketId: user.id,
                playerId: stanza.master.id
              });
              console.log("Stanza creata => " + stanza.id);
            } catch (e) {
              console.log(e);
              user.emit("errore", {
                message: "Impossibile creare la stanza, non va niente porcaccio al catamarano ubriaco"
              });
            }
          }));
          user.on("partecipaStanza", sicuro("partecipaStanza", async (data) => {
            const stanzaId = data?.["id"];
            if (!stanzaId) return;
            const nuovo = await new Giocatore(data["username"], data["pfp"]).init(generationMemory);
            let rifiutato = false;
            const esito = await Stanze.mutate(stanzaId, (stanza2) => {
              rifiutato = false;
              if (!stanza2.aggiungiGiocatorePronto(nuovo)) {
                rifiutato = true;
                return NESSUNA_MODIFICA;
              }
              return true;
            });
            if (!esito || rifiutato) {
              user.emit("impossibileAggiungersi", {
                message: "Impossibile aggiungersi alla stanza, le regole giustamente non ammettono schifi umani"
              });
              return;
            }
            const stanza = esito.stanza;
            const giocatore = stanza.trovaGiocatore(nuovo.id) || nuovo;
            user.data.referenceGiocatore = giocatore;
            user.data.giocatoreId = giocatore.id;
            user.data.referenceStanza = stanzaId;
            user.join(stanzaId);
            if (user.data.customId) {
              serverSession.set(null, {
                nome: data["username"],
                pfp: data["pfp"],
                userId: giocatore.id,
                stanzaId
              }, user.data.customId);
            }
            try {
              await Stanze.setPresenza(giocatore.id, stanzaId, true, user.id, Date.now(), null);
            } catch {
            }
            user.emit("confermaStanza", {
              stanzaId,
              reference: giocatore.toJSON(),
              interroghi: stanza.round?.chiStaInterrogando === giocatore.id,
              primoRound: stanza.numeroRound[0] === 0
            });
            inviaListe(stanza);
            server.to(stanzaId).emit("segnaleAudio", {
              socketId: user.id,
              playerId: giocatore.id
            });
            console.log("Giocatore aggiunto a Stanza => " + stanzaId);
          }));
          user.on("iniziaTurno", sicuro("iniziaTurno", async (data) => {
            const stanzaId = data?.["id"] ?? user.data?.referenceStanza;
            const giocatoreId = user.data?.giocatoreId;
            if (!stanzaId) return;
            const esito = await Stanze.mutate(stanzaId, (stanza2) => stanza2.iniziaTurno(giocatoreId));
            if (!esito) return user.emit("stanzaChiusa");
            const { stanza, risultato } = esito;
            if (risultato === -1) {
              user.emit("errore", {
                message: "Allora come dirtelo... non ci sono abbastanza carte per divertirsi. Muoviti a cambiare mazzo, o aggiungi espansioni."
              });
              return;
            }
            if (typeof risultato === "object" && risultato) {
              server.to(stanzaId).emit("partitaTerminata", {
                classifica: risultato.map((giocatore) => giocatore.toJSON())
              });
              await chiudiStanza(stanza);
              console.log("Stanza " + stanzaId + " chiusa");
              return;
            }
            if (risultato) {
              const sockets = await server.in(stanzaId).fetchSockets();
              const round = stanza.round;
              for (const socket of sockets) {
                const giocatore = giocatoreDi(socket, stanza);
                if (!giocatore) continue;
                socket.data.referenceGiocatore = giocatore;
                socket.emit("roundIniziato", {
                  chiStaInterrogando: stanza.trovaGiocatore(round.chiStaInterrogando)?.toJSON() ?? null,
                  domanda: round.domanda,
                  reference: giocatore.toJSON(),
                  stanza: stanza.id
                });
              }
              inviaAttesaRisposte(stanza);
              return;
            }
            user.emit("aspettaAltri", {
              message: "Girl non ci sono chatbot ai che fingano di esserti amico. Go touch some grass"
            });
          }));
          user.on("inviaRisposta", sicuro("inviaRisposta", async (data) => {
            const stanzaId = data?.["id"] ?? user.data?.referenceStanza;
            const giocatoreId = user.data?.giocatoreId;
            const carte = data?.["indexCarte"] ?? [];
            if (!stanzaId || !giocatoreId) return;
            let motivo = null;
            const esito = await Stanze.mutate(stanzaId, (stanza2) => {
              motivo = null;
              if (stanza2.round?.risposte?.has(giocatoreId)) {
                motivo = "gia";
                return NESSUNA_MODIFICA;
              }
              const risultato2 = stanza2.aggiungiRisposta(giocatoreId, ...carte);
              if (risultato2 === false) {
                motivo = "rifiutata";
                return NESSUNA_MODIFICA;
              }
              return risultato2;
            });
            if (!esito) return user.emit("stanzaChiusa");
            const { stanza, risultato } = esito;
            if (motivo === "gia") {
              if (stanza.stato === StatoStanza.CHOOSING_WINNER) await emitStatoStanza(stanza, user);
              else user.emit("rispostaRegistrata", { stanzaId: stanza.id });
              inviaAttesaRisposte(stanza);
              return;
            }
            if (motivo === "rifiutata") {
              await emitStatoStanza(stanza, user);
              inviaAttesaRisposte(stanza);
              return;
            }
            if (typeof risultato === "object" && risultato) {
              server.to(stanzaId).emit("sceltaVincitore", {
                domanda: risultato[0],
                risposte: risultato[1],
                chiInterroga: stanza.trovaGiocatore(risultato[2])?.toJSON() ?? null,
                stanza: stanza.id
              });
            } else {
              user.emit("rispostaRegistrata", { stanzaId: stanza.id });
            }
            inviaAttesaRisposte(stanza);
          }));
          user.on("scegliVincitore", sicuro("scegliVincitore", async (data) => {
            const stanzaId = data?.["id"] ?? user.data?.referenceStanza;
            const vincitore = data?.["vincitore"];
            const giocatoreId = user.data?.giocatoreId;
            if (!stanzaId) return;
            const esito = await Stanze.mutate(stanzaId, (stanza2) => {
              const risultato2 = stanza2.scegliVincitore(giocatoreId, vincitore);
              return risultato2 === false ? NESSUNA_MODIFICA : risultato2;
            });
            if (!esito) return user.emit("stanzaChiusa");
            const { stanza, risultato } = esito;
            if (!risultato) {
              user.emit("errore", {
                message: "Aspetta e spera che tutti quanti rispondano, selezionane un'altro (tanto ti ghostano perche' gli stai sul cabbo)"
              });
              return;
            }
            const rosterCompleto = stanza.classifica().map((giocatore) => giocatore.toJSON());
            const sockets = await server.in(stanzaId).fetchSockets();
            for (const socket of sockets) {
              const giocatore = giocatoreDi(socket, stanza);
              if (!giocatore) continue;
              socket.data.referenceGiocatore = giocatore;
              socket.emit("fineTurno", {
                vincitore: risultato[0],
                domanda: risultato[1],
                risposte: risultato[2],
                tutteLeRisposte: risultato[3],
                giocatori: rosterCompleto,
                reference: giocatore.toJSON()
              });
            }
            inviaListe(stanza);
          }));
          user.on("terminaPartita", sicuro("terminaPartita", async (data) => {
            const stanzaId = data?.["id"] ?? user.data?.referenceStanza;
            const giocatoreId = user.data?.giocatoreId;
            if (!stanzaId) return;
            const esito = await Stanze.mutate(stanzaId, (stanza) => {
              const risultato = stanza.terminaPartita(giocatoreId);
              return risultato === false ? NESSUNA_MODIFICA : risultato;
            });
            if (!esito || !esito.risultato) return;
            server.to(stanzaId).emit("partitaTerminata", {
              classifica: esito.risultato.map((giocatore) => giocatore.toJSON())
            });
            await chiudiStanza(esito.stanza);
            console.log("Stanza eliminata => " + stanzaId);
          }));
          user.on("aggiornaAttesa", sicuro("aggiornaAttesa", async (data) => {
            const stanzaId = data?.["stanzaId"] || user.data?.referenceStanza;
            const stanza = await Stanze.get(stanzaId);
            if (!stanza) return;
            inviaListe(stanza);
          }));
          user.on("listaGiocatori", sicuro("listaGiocatori", async (data) => {
            const stanzaId = data?.["stanzaId"] || user.data?.referenceStanza;
            const stanza = await Stanze.get(stanzaId);
            if (!stanza) return;
            server.to(stanzaId).emit("listaGiocatoriAggiornamento", {
              giocatori: stanza.classifica().map((giocatore) => giocatore.toJSON())
            });
          }));
          user.on("aggiornaAttesaRisposta", sicuro("aggiornaAttesaRisposta", async (data) => {
            const stanzaId = data?.["stanzaId"] || user.data?.referenceStanza;
            const stanza = await Stanze.get(stanzaId);
            if (!stanza) return;
            inviaAttesaRisposte(stanza, user);
          }));
          user.on("__sincronizza__", sicuro("__sincronizza__", async (data) => {
            const adesso = Date.now();
            if (adesso - (user.data.ultimaSincronizzazione || 0) < PAUSA_SINCRONIZZA) return;
            user.data.ultimaSincronizzazione = adesso;
            const stanzaId = data?.["id"] || user.data?.referenceStanza;
            const vista = String(data?.["vista"] || "");
            if (!stanzaId) return;
            let stanza = await Stanze.get(stanzaId);
            if (!stanza) return;
            if (stanza.stato === StatoStanza.CHOOSING_CARDS && stanza.giocatori.size > 1 && (stanza.round?.risposte?.size ?? 0) >= stanza.giocatori.size - 1) {
              const esito = await Stanze.mutate(
                stanzaId,
                (attuale) => attuale.sincronizzaStato() ? true : NESSUNA_MODIFICA
              );
              if (esito?.stanza) stanza = esito.stanza;
              if (esito?.risultato) {
                const tutti = await server.in(stanzaId).fetchSockets();
                await emitStatoStanza(stanza, ...tutti);
                console.log("Stanza sbloccata dalla sincronizzazione => " + stanzaId);
                return;
              }
            }
            const giocatore = giocatoreDi(user, stanza);
            if (vistaAttesa(stanza, giocatore).includes(vista)) return;
            console.log("Riallineo " + (giocatore?.username || "un giocatore") + " (era su " + (vista || "schermo vuoto") + ") nella stanza " + stanzaId);
            await emitStatoStanza(stanza, user);
            inviaListe(stanza);
            inviaAttesaRisposte(stanza, user);
          }));
          user.on("aggiornaChat", sicuro("aggiornaChat", async (data) => {
            const stanzaId = data?.["stanzaId"] || user.data?.referenceStanza;
            const stanza = await Stanze.get(stanzaId);
            if (!stanza) return;
            const sockets = await server.in(stanzaId).fetchSockets();
            for (const socket of sockets)
              socket.emit("aggiornamentoChat", {
                chat: stanza.chat?.messaggi ?? [],
                renderAll: !!user.data?.giocatoreId && socket.data?.giocatoreId === user.data.giocatoreId
              });
          }));
          user.on("messaggioChat", sicuro("messaggioChat", async (data) => {
            const stanzaId = data?.["id"] || user.data?.referenceStanza;
            const giocatoreId = user.data?.giocatoreId;
            if (!stanzaId) return;
            const esito = await Stanze.mutate(stanzaId, (stanza) => {
              const risultato = stanza.scriviInChat(data?.["message"], giocatoreId);
              return risultato === false ? NESSUNA_MODIFICA : risultato;
            });
            if (!esito || !esito.risultato) return;
            server.to(stanzaId).emit("aggiornamentoChat", {
              chat: esito.risultato,
              renderAll: false
            });
          }));
          user.on("aggiungiMazzo", sicuro("aggiungiMazzo", async (data) => {
            const stanzaId = data?.["id"] || user.data?.referenceStanza;
            if (!stanzaId) return;
            const esito = await Stanze.mutate(stanzaId, (stanza) => {
              const risultato = stanza.modificaMazzo(data?.["packs"]);
              return risultato === false ? NESSUNA_MODIFICA : risultato;
            });
            if (esito && esito.risultato) {
              user.emit("mazzoAggiunto");
              console.log("Mazzo cambiato nella stanza => " + stanzaId);
            } else {
              let motivo = null;
              try {
                motivo = Mazzo.problemaMazzo(...Array.isArray(data?.["packs"]) ? data["packs"] : []);
              } catch {
                motivo = null;
              }
              user.emit("mazzoErrore", {
                message: motivo || "Non riesco a cambiare i mazzi adesso: a partita iniziata non si puo' piu fare"
              });
            }
          }));
          user.on("segnala", sicuro("segnala", async (data) => {
            if (!archivioSegnalazioni) return user.emit("segnalazioneEsito", { ok: false });
            const adesso = Date.now();
            if (adesso - (user.data.ultimaSegnalazione || 0) < PAUSA_SEGNALAZIONI)
              return user.emit("segnalazioneEsito", { ok: false, messaggio: "Aspetta un attimo prima di segnalare ancora" });
            user.data.ultimaSegnalazione = adesso;
            const stanzaId = data?.["id"] ?? user.data?.referenceStanza;
            const righe = normalizzaRighe(data?.["elementi"], {
              stanzaId,
              giocatore: user.data?.referenceGiocatore?.username,
              nota: data?.["nota"]
            });
            if (!righe.length)
              return user.emit("segnalazioneEsito", { ok: false, messaggio: "Non hai selezionato niente da segnalare" });
            try {
              await archivioSegnalazioni.aggiungi(righe);
            } catch (e) {
              console.error("[socket:segnala] salvataggio fallito ->", e?.message || e);
              return user.emit("segnalazioneEsito", {
                ok: false,
                messaggio: "Non sono riuscito a salvare la segnalazione, riprova"
              });
            }
            console.log("Segnalazioni ricevute => " + righe.length + " da " + stanzaId);
            user.emit("segnalazioneEsito", { ok: true, quante: righe.length });
          }));
          user.on("suggerisci", sicuro("suggerisci", async (data) => {
            if (!archivioSegnalazioni) return user.emit("suggerimentoEsito", { ok: false });
            const adesso = Date.now();
            if (adesso - (user.data.ultimoSuggerimento || 0) < PAUSA_SEGNALAZIONI)
              return user.emit("suggerimentoEsito", { ok: false, messaggio: "Aspetta un attimo prima di mandarne altri" });
            user.data.ultimoSuggerimento = adesso;
            const stanzaId = data?.["id"] ?? user.data?.referenceStanza;
            const righe = normalizzaRighe(data?.["elementi"], {
              stanzaId,
              giocatore: user.data?.referenceGiocatore?.username,
              nota: data?.["nota"]
            }, TIPI_SUGGERIMENTO);
            if (!righe.length)
              return user.emit("suggerimentoEsito", { ok: false, messaggio: "Non hai scritto niente da suggerire" });
            try {
              await archivioSegnalazioni.aggiungi(righe);
            } catch (e) {
              console.error("[socket:suggerisci] salvataggio fallito ->", e?.message || e);
              return user.emit("suggerimentoEsito", {
                ok: false,
                messaggio: "Non sono riuscito a salvare il suggerimento, riprova"
              });
            }
            console.log("Suggerimenti ricevuti => " + righe.length + " da " + stanzaId);
            user.emit("suggerimentoEsito", { ok: true, quante: righe.length });
          }));
          user.on("lasciaStanza", sicuro("lasciaStanza", async (data) => {
            const stanzaId = data?.["id"] ?? user.data?.referenceStanza;
            const giocatoreId = user.data?.giocatoreId ?? data?.["giocatore"];
            if (user.data?.customId) {
              serverSession.invalidate(null, null, user.data.customId).catch(() => {
              });
            }
            user.emit("stanzaLasciata");
            if (!stanzaId || !giocatoreId) return;
            const esito = await Stanze.mutate(stanzaId, (stanza) => {
              const risultato = stanza.eliminaGiocatore(giocatoreId);
              if (risultato === false) return NESSUNA_MODIFICA;
              stanza.sincronizzaStato();
              return risultato;
            });
            if (!esito || !esito.risultato) return;
            user.leave(stanzaId);
            console.log("Giocatore ha abbandonato la Stanza => " + stanzaId);
            const sockets = await server.in(stanzaId).fetchSockets();
            aggiornaReference(esito.stanza, sockets);
            if (esito.stanza.stato !== StatoStanza.WAIT) await emitStatoStanza(esito.stanza, ...sockets);
            inviaListe(esito.stanza);
            inviaAttesaRisposte(esito.stanza);
          }));
          user.on("cacciaGiocatore", sicuro("cacciaGiocatore", async (data) => {
            const stanzaId = data?.["id"] ?? user.data?.referenceStanza;
            const chiCaccia = user.data?.giocatoreId;
            const daCacciare = data?.["giocatore"];
            if (!stanzaId || !chiCaccia || !daCacciare || chiCaccia === daCacciare) return;
            const esito = await Stanze.mutate(stanzaId, (stanza) => {
              if (stanza.master?.id !== chiCaccia) return NESSUNA_MODIFICA;
              if (!stanza.trovaGiocatore(daCacciare)) return NESSUNA_MODIFICA;
              const risultato = stanza.eliminaGiocatore(daCacciare);
              if (risultato === false) return NESSUNA_MODIFICA;
              stanza.sincronizzaStato();
              return risultato;
            });
            if (!esito) return;
            if (!esito.risultato) {
              inviaListe(esito.stanza);
              return;
            }
            console.log("Giocatore cacciato dal master => " + stanzaId);
            const sockets = await server.in(stanzaId).fetchSockets();
            const restano = [];
            for (const socket of sockets) {
              if (socket.data?.giocatoreId === daCacciare) {
                if (socket.data?.customId) {
                  serverSession.invalidate(null, null, socket.data.customId).catch(() => {
                  });
                }
                try {
                  socket.emit("cacciato");
                } catch {
                }
                try {
                  socket.leave(stanzaId);
                } catch {
                }
              } else restano.push(socket);
            }
            aggiornaReference(esito.stanza, restano);
            if (esito.stanza.stato !== StatoStanza.WAIT) await emitStatoStanza(esito.stanza, ...restano);
            inviaListe(esito.stanza);
            inviaAttesaRisposte(esito.stanza);
          }));
          user.on("disconnect", sicuro("disconnect", async () => {
            const giocatoreId = user.data?.giocatoreId || user.data?.referenceGiocatore?.id;
            const socketMorto = user.id;
            let stanzaId = user.data?.referenceStanza;
            if (!giocatoreId) return;
            if (!stanzaId) stanzaId = Stanza.trovaDaGiocatore(giocatoreId, await Stanze.values());
            if (!stanzaId) return;
            user.leave(stanzaId);
            const stanza = await Stanze.get(stanzaId);
            const giocatore = stanza?.trovaGiocatore(giocatoreId);
            if (!giocatore) return;
            if (giocatore.socketId && giocatore.socketId !== socketMorto) return;
            if (await haAncoraUnSocket(stanzaId, giocatoreId, socketMorto)) return;
            try {
              await Stanze.setPresenza(giocatoreId, stanzaId, false, null, Date.now(), socketMorto);
            } catch {
              giocatore.online = false;
              try {
                await Stanze.set(stanzaId, stanza);
              } catch {
              }
            }
            inviaListe(stanza);
            const attesa = setTimeout(async () => {
              try {
                const stanzaDopo = await Stanze.get(stanzaId);
                const giocatoreDopo = stanzaDopo?.trovaGiocatore(giocatoreId);
                if (!stanzaDopo || !giocatoreDopo) return;
                if (giocatoreDopo.isOnline()) return;
                if (giocatoreDopo.socketId && giocatoreDopo.socketId !== socketMorto) return;
                if (await haAncoraUnSocket(stanzaId, giocatoreId, socketMorto)) return;
                const esito = await Stanze.mutate(stanzaId, (s) => {
                  const g = s.trovaGiocatore(giocatoreId);
                  if (!g || g.isOnline()) return NESSUNA_MODIFICA;
                  const risultato = s.eliminaGiocatore(giocatoreId);
                  if (risultato === false) return NESSUNA_MODIFICA;
                  s.sincronizzaStato();
                  return risultato;
                });
                if (!esito || !esito.risultato) return;
                console.log("Giocatore rimosso per inattivita => " + stanzaId);
                const sockets = await server.in(stanzaId).fetchSockets();
                aggiornaReference(esito.stanza, sockets);
                if (esito.stanza.stato !== StatoStanza.WAIT) await emitStatoStanza(esito.stanza, ...sockets);
                inviaListe(esito.stanza);
                inviaAttesaRisposte(esito.stanza);
              } catch (innerError) {
                console.error("Errore nel timeout disconnessione:", innerError?.message || innerError);
              }
            }, GRAZIA_DISCONNESSIONE);
            if (attesa.unref) attesa.unref();
          }));
        });
        (async () => cleanUp())();
      };
      module.exports = serverConfig;
    }
  });

  // application/include/script/SingleStanze.js
  var require_SingleStanze = __commonJS({
    "application/include/script/SingleStanze.js"(exports, module) {
      var path = require_path();
      var { conLock, NESSUNA_MODIFICA } = require_concorrenza();
      var SingleStanze = class extends Map {
        async setPresenza(giocatoreId, stanzaId, online, socketId, eventTime, expectedSocketId = null) {
          const stanza = super.get(stanzaId);
          const giocatore = stanza?.trovaGiocatore?.(giocatoreId);
          if (!giocatore) return false;
          if (expectedSocketId && giocatore.socketId && giocatore.socketId !== expectedSocketId)
            return false;
          giocatore.online = online;
          giocatore.socketId = socketId || "";
          return true;
        }
        set(key, value) {
          super.set(key, value);
          return value;
        }
        async mutate(key, mutatore) {
          if (!key) return null;
          return conLock("stanza:" + key, async () => {
            const stanza = super.get(key);
            if (!stanza) return null;
            const risultato = mutatore(stanza);
            if (risultato === NESSUNA_MODIFICA)
              return { stanza, risultato: void 0, scritto: false };
            return { stanza, risultato, scritto: true };
          });
        }
        async checkOld() {
        }
      };
      module.exports = { SingleStanze };
    }
  });

  // mobile/lan_engine_entry.js
  var require_lan_engine_entry = __commonJS({
    "mobile/lan_engine_entry.js"() {
      var appConfig = require_appConfig();
      var serverConfig = require_serverConfig();
      var { SingleStanze } = require_SingleStanze();
      var { SegnalazioniLocali } = require_Segnalazioni();
      var { Stanza, StatoStanza } = require_Stanza();
      var { Giocatore } = require_Giocatore();
      var { Mazzo, TipoMazzo } = require_Mazzo();
      var generazione = require_generazione();
      var QRCode = require_qrcode();
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
    }
  });
  require_lan_engine_entry();
})();
