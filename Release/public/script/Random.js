const nounsAndAdjectives = {
    names: [
      "Gianfranco",
      "Petunia",
      "Matilda",
      "Gesù",
      "Patrizia",
      "Anastasia ",
      "Tancredi",
      "Geltrude",
      "San bartolomeo",
      "Stefania",
      "Sandrina",
      "Gervasio",
      "Tibetino",
      "Filiberto",
      "Demetra",
      "Carlina",
      "Peppone",
      "Brumilda",
      "Ermenegilda",
      "Loretta",
      "Juan",
      "Gonzago",
      "Carmeletto",
      "Clarissa",
      "Asdrubale",
      "Osvaldo",
      "Moreno",
      "Gilberto",
      "Lucresia",
      "Esposito",
      "Proserpina",
      "Annunziata",
      "Pasqualino",
      "Simonetta",
      "Giovanni",
      "Natalia",
      "Anastasia",
      "Girolamo",
      "Ernesto",
      "Ambrogio",
      "Ettorina",
      "Onorino",
      "Giandomenica",
      "Natalino",
      "Romualda",
      "Melania",
      "Reginaldo",
      "Percivaldo",
      "Flaviana",
      "Manuela",
      "Madonna",
      "Gabibbo",
      "Calimero",
      "Mussolini",
      "Marilina",
      "Michael Jackson",
      "Orietta Berti",
      "Gerry Scotti",
      "Maria de Filippi",
      "Ormina",
      "Rosita",
      "Hello Kitty",
      "Cesare",
      "Chiara Facchetti",
      "Onorio",
      "Adolfo",
      "Teodolinda",
      "Iolanda",
      "Domiziano",
      "Diocleziano",
      "Mafalda",
      "Apollonia",
      "Eufrasio",
      "Mirandolina",
      "Torquato",
      "Beppe",
      "Giampiertolda",
      "Mariano",
      "Lancillotto",
      "Vernelia",
      "Marcantonio",
      "Perpetua",
      "Cassiopea",
      "Papa Francesco",
      "Ampelietto",
      "Don Abbondio",
      "Maria Luisa Pia",
      "Ludmilla",
    ],
    adjectives: [
      "Vibrante",
      "Caliente",
      "Eccitante",
      "Segante",
      "Scopante",
      "Cagarellante",
      "Macchiante",
      "Incontinente",
      "Gemente",
      "Performante",
      "Sniffante",
      "Folgorante",
      "Gocciolante",
      "Rizzante",
      "Scompisciante",
      "Sburrante",
      "Ninfomane",
      "Abominevole",
      "Gigante",
      "Piacevole",
      "Sensuale",
      "Omosessuale",
      "Petulante",
      "Pizzicolante",
      "Orgasmante",
      "Vegetante",
      "Indulgente",
      "Bocca larga",
      "Culo stretto",
      "Mani rapide",
      "Imprecante",
      "Salivante",
      "Ortofruttante",
      "Strimpellante",
      "Seno esplosivo",
      "Passione fisting",
      "Saccente",
      "Orifizio dilatato",
      "Comunista",
      "Fascista",
      "Eccessivamente omosessuale",
      "Che salta sui tetti",
      "Che corre nei campi",
      "Provocante",
      "Effervescente",
      "Con la felpa di Salvini",
      "Fessa dentata",
      "Culo peloso",
      "Down",
      "Su una sedia a rotelle",
      "Intollerante al lattosio",
      "Bocchinante",
      "Naso imponente",
      "Dissacrante",
      "Elefante",
      "Feticista",
      "Sconvolgente",
      "Saltasburellante",
      "Necromante",
      "Che picchia i bambini",
      "Che deruba le vecchie",
      "Pluriomicida",
      "Sodomita"
    ],
}

const getRandomNamea = () => {
  const u = Math.floor(Math.random() * nounsAndAdjectives.adjectives.length)
  return nounsAndAdjectives.names[Math.floor(Math.random() * nounsAndAdjectives.names.length)] + " " + (nounsAndAdjectives.adjectives[u][0].toLowerCase() + nounsAndAdjectives.adjectives[u].slice(1))
}

const getRandomPfp = (old) => {
    while(true)
    {
        const y = Math.floor(Math.random() * (38-1) + 1)
        if(y != old)
        {
            return y
        }
    }
}