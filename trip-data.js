// trip-data.js — dati del viaggio InterAir, 3-23 agosto 2026.
// Il piano di ogni giorno viene dalle guide Notion "Viaggi" (Norvegia, camper Spagna del Nord)
// dove esistono; altrimenti resta solo la logistica finché non si scrive il diario.

const giornoCorrente = 6; // ultimo giorno "sbloccato" nel Diario — aggiornare su richiesta esplicita dell'utente, un giorno alla volta

const planBlocks = {
  "danzica-4ago": [
    { nome: "Fontana di Nettuno", dettaglio: "nel cuore della Città Vecchia." },
    { nome: "Punto panoramico", dettaglio: "vista dall'alto sul fiume Motława e sul porto." },
    { nome: "Westerplatte", dettaglio: "il luogo dove ha avuto inizio la seconda guerra mondiale." },
    { nome: "Giro in centro", dettaglio: "passeggiata nella Città Vecchia." }
  ],
  "bergen-5ago": [
    { nome: "Partita Brann - Apollon Limassol", dettaglio: "allo stadio, sotto la pioggia." },
    { nome: "Bryggen", dettaglio: "il vecchio molo anseatico, patrimonio UNESCO, di sera." }
  ],
  "bergen-6ago": [
    { nome: "Porto e centro storico", dettaglio: "passeggiata tra il porto e la città vecchia di Bergen." },
    { nome: "Stoltzekleiven", dettaglio: "scalinata di pietra ripidissima (~900 gradini) a Sandviken, l'allenamento preferito dai bergensi." },
    { nome: "Fløyen", dettaglio: "panorama sulla città e sul fiordo dall'alto, raggiunta dopo la scalinata." },
    { nome: "Cena", dettaglio: "bistecca di balena." }
  ],
  "eidfjord-transfer-7ago": [
    { nome: "Steindalsfossen", dettaglio: "cascata che si attraversa a piedi da dietro, vicino Norheimsund.",
      difficolta: "Facile", tempo: "pochi minuti a piedi", prenotazione: "no", costo: "gratis, imperdibile" },
    { nome: "Chicca — Hardangerbrua", dettaglio: "il ponte sospeso più lungo di Norvegia, sosta fotografica vicino Eidfjord.",
      difficolta: "Facile", tempo: "10-15 min", prenotazione: "no", costo: "gratis" },
    { nome: "Vøringsfossen", dettaglio: "una delle cascate più famose di Norvegia (182 m), piattaforma raggiungibile con breve camminata.",
      difficolta: "Facile", tempo: "15-30 min", prenotazione: "no", costo: "gratis (parcheggio a pagamento, pochi NOK)" }
  ],
  "eidfjord-8ago": [
    { nome: "Trolltunga", dettaglio: "roccia sospesa sopra il fiordo, raggiunta con una camminata lunga e impegnativa, sotto pioggia e freddo per 7 ore." }
  ],
  "eidfjord-opzioni": [
    { nome: "Giorno cascate e ghiacciai", dettaglio: "Husedalen (4 cascate da Kinsarvik, versione corta 2-3 ore o lunga fino a Hardangervidda 5-6 ore), Buarbreen (lingua del ghiacciaio, corde/catene) o Bondhusbreen/Folgefonna (vista su un altro ghiacciaio, più semplice).",
      difficolta: "da facile/medio a difficile secondo l'opzione", tempo: "2-6 ore", prenotazione: "no",
      costo: "gratis (parcheggio Buarbreen ~14€; tour guidato sul ghiaccio vero richiede prenotazione)" },
    { nome: "Giorno Kjeåsen + Hardangerfjord", dettaglio: "sentiero verso una fattoria di montagna isolata (corde e scalini fissi) o solo la strada a singola corsia per arrivarci; Låtefossen (cascata doppia dalla strada); Tyssedal (museo idroelettrico) o Hardangervidda Natursenter come piano B pioggia.",
      difficolta: "Difficile per Kjeåsen, facile per il resto", tempo: "1-2 ore per il sentiero", prenotazione: "no",
      costo: "gratis (Tyssedal e Natursenter a pagamento)" }
  ],
  "eidfjord-partenza-11ago": [
    { nome: "Passeggiata breve del mattino", dettaglio: "ultima mattinata a Eidfjord prima del trasferimento verso Bergen — si parte entro le 12:00-12:30.",
      difficolta: "Facile", tempo: "poco tempo", prenotazione: "no", costo: "gratis" }
  ],
  "camper-14ago": [
    { nome: "Parte Vieja", dettaglio: "giro di pintxos nel centro storico di San Sebastián.",
      difficolta: "Facile", prenotazione: "no", costo: "pintxos ~3-4€ l'uno, cena in giro ~15-25€ a testa" }
  ],
  "camper-15ago": [
    { nome: "Monte Igueldo", dettaglio: "funicolare + belvedere su La Concha.",
      difficolta: "Facile", tempo: "mezza mattina", prenotazione: "no", costo: "~4,50€ a/r a testa" },
    { nome: "Spiaggia La Concha", dettaglio: "la spiaggia simbolo di San Sebastián.",
      difficolta: "Facile", prenotazione: "no", costo: "gratis" },
    { nome: "Zumaia", dettaglio: "formazioni rocciose flysch sul mare, location di Game of Thrones.",
      difficolta: "Facile", tempo: "1 ora", prenotazione: "no", costo: "gratis" },
    { nome: "Getaria", dettaglio: "paese di pescatori, patria di Juan Sebastián Elcano.",
      difficolta: "Facile", tempo: "1 ora", prenotazione: "no", costo: "gratis" }
  ],
  "camper-16ago": [
    { nome: "Península de la Magdalena", dettaglio: "parco + Palacio Real (esterno).",
      difficolta: "Facile", tempo: "1-2 ore", prenotazione: "no", costo: "gratis il parco (palazzo a pagamento)" },
    { nome: "Spiaggia El Sardinero", dettaglio: "la spiaggia principale di Santander.",
      difficolta: "Facile", prenotazione: "no", costo: "gratis" },
    { nome: "Racing Santander - Villarreal", dettaglio: "Primera División, 1ª giornata, ore 17:00 a El Sardinero — prima gara casalinga del Racing in Primera dopo 14 anni, comprare i biglietti il prima possibile.",
      difficolta: "-", tempo: "ore 17:00", prenotazione: "obbligatoria (realracingclub.es o SeatPick)",
      costo: "presumibile 30-90€ a testa" }
  ],
  "camper-17ago": [
    { nome: "Santillana del Mar", dettaglio: "borgo medievale, \"il paese delle tre bugie\" secondo Sartre.",
      difficolta: "Facile", tempo: "1-2 ore", prenotazione: "no", costo: "gratis passeggiare (musei a pagamento)" },
    { nome: "Comillas — El Capricho di Gaudí", dettaglio: "una delle opere di Gaudí fuori dalla Catalogna.",
      difficolta: "Facile", tempo: "1 ora", prenotazione: "consigliata online in alta stagione",
      costo: "7€ ingresso semplice / 10€ con audioguida" }
  ],
  "camper-18ago": [
    { nome: "Bus per l'amico verso Bilbao", dettaglio: "drop-off mattutino da Torrelavega, il suo volo da Bilbao è alle 18:20 — 8 corse dirette al giorno.",
      prenotazione: "verificare orario su alsa.es" },
    { nome: "Teleférico di Fuente Dé", dettaglio: "salita panoramica sul massiccio dei Picos de Europa.",
      difficolta: "Facile", tempo: "10:00-17:00, ultima salita 16:30", prenotazione: "no ma consigliato arrivare presto",
      costo: "20€ a/r a testa (alta stagione)" }
  ],
  "camper-19ago": [
    { nome: "Garganta del Cares", dettaglio: "trekking Poncebos → Caín e ritorno, ~70 gallerie scavate nella roccia, sentiero largo ma con salti a precipizio — portare acqua.",
      difficolta: "Medio-alto (lungo ma non tecnico)", tempo: "6-7 ore (~21 km a/r)", prenotazione: "no", costo: "gratis" }
  ],
  "camper-20ago": [
    { nome: "Lagos di Covadonga", dettaglio: "accesso in navetta obbligatorio dai parcheggi P1-P4 (auto/camper privato vietato).",
      difficolta: "Facile", tempo: "mattina", prenotazione: "biglietti ai parcheggi o su alsa.es",
      costo: "parcheggio 3€/auto + biglietto bus" },
    { nome: "Alternativa — Descenso del Sella in canoa", dettaglio: "discesa del fiume Sella da Arriondas fino a Ribadesella/Toves, soste ai bar lungo il percorso.",
      difficolta: "Facile/medio", tempo: "2-3 ore", prenotazione: "consigliata in anticipo" },
    { nome: "Ribadesella", dettaglio: "centro, ponte, spiaggia — sulla strada verso Gijón.",
      difficolta: "Facile", tempo: "1 ora", prenotazione: "no", costo: "gratis" },
    { nome: "Gijón di sera — Cimavilla", dettaglio: "quartiere storico + passeggiata sul lungomare di San Lorenzo.",
      difficolta: "Facile", prenotazione: "no", costo: "gratis" }
  ],
  "camper-21ago": [
    { nome: "Gijón — Cimavilla ed Elogio del Horizonte", dettaglio: "spiaggia San Lorenzo e la scultura di Chillida sulla scogliera. Da provare cachopo e pan pregnao.",
      difficolta: "Facile", tempo: "mattina", prenotazione: "no", costo: "gratis (eventuale acquario a pagamento)" },
    { nome: "Cudillero", dettaglio: "paesino colorato di pescatori.",
      difficolta: "Facile", tempo: "~45 min da Gijón", prenotazione: "no", costo: "gratis" },
    { nome: "Opzione — Santoña, Faro del Caballo", dettaglio: "percorso panoramico tra i più belli della costa nord, verificare quanto si discosta dal rientro.",
      difficolta: "Facile/medio", tempo: "~2 ore", prenotazione: "no", costo: "gratis" }
  ],
  "bilbao-extra": [
    { nome: "San Juan de Gaztelugatxe", dettaglio: "la \"Roccia del Drago\", location di Game of Thrones, vicino Bakio.",
      difficolta: "Facile", tempo: "~35-40 min da Bilbao", prenotazione: "no", costo: "gratis" },
    { nome: "El Globo", dettaglio: "pinchos in centro a Bilbao.",
      prenotazione: "no", costo: "pochi euro a pincho" },
    { nome: "Aste Nagusia", dettaglio: "il festival grande di Bilbao, dal 22 al 30 agosto — coincide con questi giorni.",
      prenotazione: "no", costo: "gratis (evento di piazza)" }
  ]
};

const days = [
  { n: 1, date: "2026-08-03", tappa: "Partenza · Danzica",
    logistica: [
      { text: "Volo Wizz Air W6 1714, 22:00 → 00:15 (Milano → Danzica)", url: "https://www.flightradar24.com/data/flights/w61714" },
      "Alloggio: Luxury Aura, Danzica"
    ],
    planBlock: null,
    diario: {
      titolo: "Arrivo a Danzica",
      foto: ["foto/giorno1-1.jpg", "foto/giorno1-2.jpg", "foto/giorno1-3.jpg", "foto/giorno1-4.jpg"],
      paragrafi: [
        "Con rischio di ritardi, abitudini al contrario e certezze che crollano, siamo arrivati a Danzica.",
        "Velocità media 85 km/h e tombini a livello. Ora si dorme."
      ]
    } },
  { n: 2, date: "2026-08-04", tappa: "Danzica",
    logistica: ["Alloggio: Luxury Aura, Danzica"], planBlock: "danzica-4ago",
    diario: {
      titolo: "Giornata a Danzica",
      foto: ["foto/giorno2-1.jpg", "foto/giorno2-2.jpg", "foto/giorno2-3.jpg", "foto/giorno2-4.jpg", "foto/giorno2-5.jpg", "foto/giorno2-6.jpg"],
      paragrafi: [
        "Oggi giornata di visita a Danzica: otto pasti fatti, tra pranzo al museo, trippa alle quattro del pomeriggio e pierogi.",
        "Nel tempo libero abbiamo anche visitato la città — centro davvero carino e vivibile, molto bella la zona intorno al fiume.",
        "Momento culturale a Westerplatte, dove ha avuto inizio la seconda guerra mondiale (ottime bacche in zona)."
      ]
    } },
  { n: 3, date: "2026-08-05", tappa: "Danzica → Bergen",
    logistica: [
      { text: "Volo Wizz Air W6 1757, 12:20 → 14:15 (Danzica → Bergen)", url: "https://www.flightradar24.com/data/flights/w61757" },
      "Alloggio: Årstad, Bergen"
    ],
    planBlock: "bergen-5ago",
    diario: {
      titolo: "Arrivo in Norvegia",
      foto: ["foto/giorno3-1.jpg", "foto/giorno3-2.jpg", "foto/giorno3-3.jpg", "foto/giorno3-4.jpg", "foto/giorno3-5.jpg"],
      paragrafi: [
        "Giorno di trasferimento: siamo arrivati in Norvegia, in particolare a Bergen, dopo aver disfatto lo zaino per evitare il supplemento bagaglio.",
        "Prima spesa fatta, per cercare di sopravvivere in Norvegia e tenerci i soldi per i biglietti di un fantastico Brann - Apollon Limassol, che Teo ha tirato fuori dal cilindro salvandoci un pomeriggio bagnato.",
        "Ci aspetta una settimana piovosa, di cui oggi abbiamo già avuto un assaggio."
      ]
    } },
  { n: 4, date: "2026-08-06", tappa: "Bergen",
    logistica: ["Ritiro auto a noleggio, ore 10:00", "Alloggio: Årstad, Bergen"], planBlock: "bergen-6ago",
    diario: {
      titolo: "Le due anime di Bergen",
      foto: ["foto/giorno4-1.jpg", "foto/giorno4-2.jpg", "foto/giorno4-3.jpg", "foto/giorno4-4.jpg", "foto/giorno4-5.jpg", "foto/giorno4-6.jpg", "foto/giorno4-7.jpg"],
      paragrafi: [
        "Oggi giornata interamente dedicata a Bergen: la mattina comincia con un'emorragia data dal noleggio auto, che ci servirà nei prossimi giorni.",
        "Da mezzogiorno ci siamo dedicati alle due anime della città — quella del porto e del centro (più turistica), e poi su per il percorso di allenamento dei bergensi, 900 scalini per goderci il panorama dall'alto (più autentica).",
        "La serata è finita con una bella bistecca di balena cucinata dai nostri chef (non abbiamo fatto la foto)."
      ]
    } },
  { n: 5, date: "2026-08-07", tappa: "Bergen → Eidfjord",
    logistica: ["Trasferimento in auto verso l'Hardangerfjord (~3h)", "Arrivo a Eidfjord nel pomeriggio"],
    planBlock: "eidfjord-transfer-7ago",
    diario: {
      titolo: "Verso Eidfjord",
      foto: ["foto/giorno5-1.jpg", "foto/giorno5-2.jpg", "foto/giorno5-3.jpg", "foto/giorno5-4.jpg", "foto/giorno5-5.jpg", "foto/giorno5-6.jpg", "foto/giorno5-7.jpg", "foto/giorno5-8.jpg", "foto/giorno5-9.jpg"],
      paragrafi: [
        "Oggi giornata di trasferimento, questa volta in macchina: siamo partiti in mattinata da Bergen verso una Norvegia meno abitata, verso Eidfjord.",
        "In particolare abbiamo una casa con il tetto di torba, un po' dispersa nel nulla, a 30 minuti dalla città.",
        "Il viaggio è iniziato tra cascate e rotonde nelle gallerie, per poi fare nel pomeriggio un impervio trekking per vedere il fiordo dall'alto.",
        "In serata, un primo assaggio della spesa norvegese, all'unico supermercatino aperto non discount."
      ]
    } },
  { n: 6, date: "2026-08-08", tappa: "Eidfjord", logistica: [], planBlock: "eidfjord-8ago",
    diario: {
      titolo: "Trolltunga",
      foto: ["foto/giorno6-1.jpg", "foto/giorno6-2.jpg", "foto/giorno6-3.jpg"],
      paragrafi: [
        "Giornata impegnativa, con la sveglia alle 4:30 per arrivare a un buon orario ed evitare troppa gente a uno dei punti simbolo della zona: il Trolltunga, una roccia sospesa sopra il fiordo.",
        "Camminata impegnativa, perché lunga e perché ci siamo presi 7 ore di pioggia e freddo.",
        "A differenza del Canada, qui indiani e cinesi si spingono anche su camminate più lunghe di 10 minuti."
      ]
    } },
  { n: 7, date: "2026-08-09", tappa: "Eidfjord", logistica: [], planBlock: "eidfjord-opzioni", diario: null },
  { n: 8, date: "2026-08-10", tappa: "Eidfjord", logistica: [], planBlock: "eidfjord-opzioni", diario: null },
  { n: 9, date: "2026-08-11", tappa: "Eidfjord → Bergen → Oslo",
    logistica: ["Trasferimento Eidfjord → Bergen (2,5-3h di guida)", "Riconsegna auto a noleggio, ore 15:00", "Volo Norwegian 16:20 → 17:15 (Bergen → Oslo)"],
    planBlock: "eidfjord-partenza-11ago", diario: null },
  { n: 10, date: "2026-08-12", tappa: "Oslo",
    logistica: [
      { text: "Volo Vueling VY8539, 21:25 → 00:55 (Oslo → Barcellona, atterraggio dopo mezzanotte)", url: "https://www.flightradar24.com/data/flights/vy8539" }
    ],
    planBlock: null, diario: null },
  { n: 11, date: "2026-08-13", tappa: "Barcellona → Bilbao",
    logistica: [
      "Atterraggio a Barcellona 00:55, notte breve",
      { text: "Volo Vueling VY1422, 09:10 → 10:25 (Barcellona → Bilbao)", url: "https://www.flightradar24.com/data/flights/vy1422" },
      "Pernottamento del 13-14 a Bilbao: ancora da organizzare"
    ],
    planBlock: null, diario: null },
  { n: 12, date: "2026-08-14", tappa: "Bilbao → San Sebastián",
    logistica: ["Ritiro camper a Zamudio (Bilbao), ore 15:00 — già prenotato (Roadsurfer)", "Pernottamento: area camper San Sebastián (Camperstop Donosti)"],
    planBlock: "camper-14ago", diario: null },
  { n: 13, date: "2026-08-15", tappa: "San Sebastián e costa basca",
    logistica: ["Pernottamento: Santander o Castro Urdiales"], planBlock: "camper-15ago", diario: null },
  { n: 14, date: "2026-08-16", tappa: "Santander",
    logistica: ["Pernottamento: Santander, zona Parque de las Llamas o parcheggio a pagamento"], planBlock: "camper-16ago", diario: null },
  { n: 15, date: "2026-08-17", tappa: "Santillana del Mar, Comillas",
    logistica: ["Pernottamento: Torrelavega"], planBlock: "camper-17ago", diario: null },
  { n: 16, date: "2026-08-18", tappa: "Potes, Fuente Dé",
    logistica: ["Pernottamento: Potes"], planBlock: "camper-18ago", diario: null },
  { n: 17, date: "2026-08-19", tappa: "Garganta del Cares",
    logistica: ["Pernottamento: area camper Llerau, Cangas de Onís"], planBlock: "camper-19ago", diario: null },
  { n: 18, date: "2026-08-20", tappa: "Covadonga, Ribadesella, Gijón",
    logistica: ["Pernottamento: Gijón, Parking El Rinconín"], planBlock: "camper-20ago", diario: null },
  { n: 19, date: "2026-08-21", tappa: "Gijón, Cudillero",
    logistica: ["Pernottamento: zona Santander/Castro Urdiales"], planBlock: "camper-21ago", diario: null },
  { n: 20, date: "2026-08-22", tappa: "Riconsegna camper, Bilbao",
    logistica: ["Riconsegna camper a Zamudio, ore 12:00 — già prenotato (Roadsurfer)", "Alloggio: Bilbao (ultima notte)"], planBlock: "bilbao-extra", diario: null },
  { n: 21, date: "2026-08-23", tappa: "Rientro a Milano",
    logistica: [
      { text: "Volo Vueling VY1454, 17:35 → 19:30 (Bilbao → Milano)", url: "https://www.flightradar24.com/data/flights/vy1454" }
    ],
    planBlock: "bilbao-extra", diario: null }
];

const stops = [
  { place: "Danzica (Polonia)", dayRange: [1, 2], note: "Wizz Air W6 1714, 22:00→00:15 · Luxury Aura" },
  { place: "Bergen (Norvegia)", dayRange: [3, 4], note: "Wizz Air W6 1757, 12:20→14:15, poi auto · Årstad" },
  { place: "Eidfjord (Norvegia)", dayRange: [5, 9], note: "Auto · tra i fiordi" },
  { place: "Oslo (Norvegia)", dayRange: [9, 10], note: "Norwegian 16:20→17:15" },
  { place: "Barcellona", dayRange: [10, 11], note: "Vueling VY8539, 21:25→00:55, senza dormire" },
  { place: "Bilbao (Spagna)", dayRange: [11, 12], note: "Vueling VY1422, 09:10→10:25" },
  { place: "In camper, Spagna del nord", dayRange: [12, 20], note: "Camper" },
  { place: "Rientro a Milano", dayRange: [21, 21], note: "Vueling VY1454, 17:35→19:30" }
];

if (typeof module !== "undefined" && module.exports) {
  module.exports = { days, planBlocks, stops, giornoCorrente };
}
