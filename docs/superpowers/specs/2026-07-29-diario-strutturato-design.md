# Diario di viaggio strutturato — design

## Obiettivo

Il diario attuale (`index.html`, file unico, due tab Diario/Programma) resta nello stile e
nell'impostazione a due tab, ma diventa più strutturato: ogni giorno del viaggio (3–23 agosto,
21 giorni) ottiene una pagina dedicata con logistica, piano previsto (dove disponibile dalle
guide su Notion) e il resoconto della serata (testo + foto), scritto via via che il viaggio
procede.

## Non-obiettivi

- Nessun backend, nessun build step, nessun framework: resta un sito statico puro.
- Nessuna generazione di contenuti turistici per le tappe senza guida su Notion (Danzica, Oslo,
  Barcellona, Bilbao, giorni di trasferimento): quelle pagine mostrano solo la logistica finché
  non viene scritto il resoconto.
- Nessun redesign visivo: stessi font (serif/mono), stessa palette (parchment/brass/teal/sky),
  stessi componenti (`.card`, `.photostrip`, `.stamp`), solo estesi con i nuovi blocchi necessari.

## Architettura

Da un unico file a quattro file statici, serviti così come sono (GitHub Pages, nessun build):

- **`index.html`** — scheletro: masthead, tab nav (Diario/Programma), contenitori vuoti per le
  viste, `<script>` che carica `trip-data.js` poi `app.js`.
- **`style.css`** — CSS attuale spostato qui, esteso con i nuovi componenti (vedi sotto).
- **`trip-data.js`** — tutti i dati del viaggio: array `days` (21 elementi), dizionario
  `planBlocks`, array `stops` (le 8 tappe già presenti in Programma). Nessuna logica, solo dati.
- **`app.js`** — rendering delle tre viste e router basato su hash (`#/`, `#/programma`,
  `#/giorno/N`). Nessuna dipendenza esterna.

Aggiornare il diario la sera diventa: aprire `trip-data.js`, trovare l'oggetto del giorno,
riempire `diario: {...}` e aggiungere eventuali foto — senza toccare HTML/CSS/routing.

## Modello dati (`trip-data.js`)

```js
const days = [
  {
    n: 1,
    date: "2026-08-03",       // ISO, usato per calcolare giorno della settimana
    tappa: "Aeroporto, partenza",
    logistica: [
      "Wizz Air 22:00 → 00:15 (Milano → Danzica)",
      "Alloggio: Luxury Aura, Danzica"
    ],
    planBlock: null,          // nessuna guida per questo giorno
    diario: null              // null finché non scritto
    // quando scritto:
    // diario: { titolo: "Si parte", paragrafi: ["...", "..."], foto: ["foto/giorno-01/1.jpg"] }
  },
  // ... fino a n: 21, date: "2026-08-23"
];

const planBlocks = {
  "bergen-5ago": [
    { nome: "Bryggen", dettaglio: "il vecchio molo anseatico, UNESCO",
      difficolta: "Facile", tempo: "30-45 min a piedi", prenotazione: "no", costo: "gratis" },
    // ...
  ],
  "eidfjord-opzioni": [ /* condiviso dai giorni 6, 7, 8 (8-10 agosto): Trolltunga,
    giorno tranquillo cascate/ghiacciai, giorno Kjeåsen — si sceglie sul posto */ ],
  // ...
};

const stops = [
  { place: "Danzica (Polonia)", dayRange: [1, 2], note: "Wizz Air 22:00→00:15 · Luxury Aura" },
  // ... le 8 tappe attuali, invariate nel contenuto, con dayRange aggiunto
];
```

`days[].planBlock` può essere l'id di un blocco condiviso (più giorni flessibili puntano allo
stesso blocco, come i giorni Eidfjord dove si sceglie l'attività sul posto) oppure un array di
attività proprio del giorno, con lo stesso shape di `planBlocks`.

## Mappatura contenuti per giorno (da Notion + itinerario attuale)

| Giorno | Data | Tappa | Piano da Notion |
|---|---|---|---|
| 1 | 3 ago | Partenza → Danzica | — (solo logistica) |
| 2 | 4 ago | Danzica | — |
| 3 | 5 ago | Danzica → Bergen | Bryggen, Fisketorget, Torgallmenningen |
| 4 | 6 ago | Bergen | Fløyen/Vidden/Ulriken/Stoltzekleiven, piano B pioggia, dove mangiare |
| 5 | 7 ago | Bergen → Eidfjord | Steindalsfossen, Hardangerbrua, Vøringsfossen |
| 6–8 | 8–10 ago | Eidfjord | blocco condiviso "opzioni": Trolltunga / giorno cascate-ghiacciai / Kjeåsen+Hardangerfjord |
| 9 | 11 ago | Eidfjord → Bergen → Oslo | giorno di partenza (nota su orari volo) |
| 10 | 12 ago | Oslo | — |
| 11 | 13 ago | Barcellona → Bilbao | — (scalo di poche ore) |
| 12 | 14 ago | Bilbao → San Sebastián | ritiro camper, San Sebastián/Parte Vieja |
| 13 | 15 ago | San Sebastián e costa basca | Monte Igueldo, La Concha, Zumaia, Getaria |
| 14 | 16 ago | Santander | Península de la Magdalena, El Sardinero, Racing-Villarreal |
| 15 | 17 ago | Santillana del Mar, Comillas | El Capricho di Gaudí, Torrelavega |
| 16 | 18 ago | Potes, Fuente Dé | drop-off amico, teleférico Fuente Dé |
| 17 | 19 ago | Garganta del Cares | trekking Poncebos-Caín |
| 18 | 20 ago | Covadonga, Ribadesella, Gijón | lagos/canoa, Cimavilla |
| 19 | 21 ago | Gijón, Cudillero | Elogio del Horizonte, rientro verso Santander |
| 20 | 22 ago | Riconsegna camper, Bilbao | rientro Zamudio, extra Bilbao (Gaztelugatxe, pinchos) |
| 21 | 23 ago | Rientro a Milano | — (solo logistica) |

Nota sui giorni di confine: la lista tappe attuale in Programma conta lo stesso giorno di
trasferimento in entrambe le tappe adiacenti (es. "11–12 ago Oslo" e "12–13 ago Barcellona"
condividono il 12). Nel modello a pagina-per-giorno ogni data compare in una sola pagina,
assegnata alla tappa dove si dorme/si passa la serata quella data (es. il 12 ago resta pagina
di Oslo perché il volo per Barcellona è in serata; il 13 ago è pagina Barcellona→Bilbao perché
lo scalo a Barcellona dura solo poche ore notturne prima del volo delle 9:10). La lista tappe in
Programma resta invariata nel testo, cambia solo il fatto che ogni riga collega al `dayRange`
corretto.

## Le tre viste

**Diario (`#/`, default)** — elenco compatto dei 21 giorni: badge giorno, data, tappa, e:
- se `diario` esiste: estratto (prime ~140 battute) + miniatura prima foto;
- se `diario` è `null`: etichetta discreta "non ancora scritto" (stile simile a
  `.itinerary-empty` esistente), riga comunque cliccabile per vedere il piano in anticipo.

Click su una riga → `#/giorno/N`.

**Programma (`#/programma`)** — invariato (mappa stilizzata + lista tappe), ogni riga tappa
diventa un link verso il primo giorno del suo `dayRange`.

**Pagina giorno (`#/giorno/N`)**:
1. Stemma: "Giorno N" · giorno settimana + data · tappa (stesso stile di `.stamp`)
2. Logistica: righe semplici (volo/trasferimento/alloggio), stile `.stop-note`
3. Piano (se `planBlock` non è null): lista attività, ciascuna con nome, dettaglio,
   difficoltà · tempo · prenotazione · costo — nuovo componente `.plan-item`, stessa palette
4. Diario della serata: se scritto, `.card` con `.photostrip` e testo come oggi; se non
   scritto, placeholder tratteggiato "il resoconto arriverà la sera del [data]"
5. Navigazione: giorno precedente / successivo + link "← Diario"

## Foto

Stesso pattern attuale (`.photo` con `<img>` o placeholder), niente cambia nel meccanismo:
quando il resoconto di un giorno viene scritto, si aggiungono i file immagine e i relativi
path in `diario.foto`. I placeholder SVG "di stile" attuali (usati solo per l'esempio) vengono
rimossi: i giorni non ancora scritti non mostrano photostrip, solo lo stato vuoto.

## Verifica

Manuale in browser (nessun test automatico, sito statico senza logica critica):
- aprire `index.html`, verificare tab Diario (21 righe, stato scritto/non scritto corretto)
- click su una riga → pagina giorno corretta, dati coerenti con la tabella sopra
- tab Programma → click su una tappa → porta al giorno giusto
- navigazione prec./succ. dentro una pagina giorno, inclusi i bordi (giorno 1 e giorno 21)
- deep link diretto (es. aprire `index.html#/giorno/14`) funziona senza passare dalla home
- layout mobile (larghezza stretta) su tab Diario, Programma e pagina giorno
