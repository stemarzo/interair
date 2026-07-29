# Diario strutturato con popup per giorno — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Trasformare `index.html` (unico file, timeline diario + programma statico) in un sito
statico a 4 file dove ogni giorno del viaggio (3–23 agosto, 21 giorni) apre un popup elegante
con logistica, piano previsto (dalle guide Notion) e il resoconto della serata, mantenendo lo
stile "parchment/brass" retro esistente ma rifinito.

**Architecture:** `index.html` (scheletro + markup del dialog) + `style.css` (stile attuale
esteso) + `trip-data.js` (dati puri: 21 giorni, blocchi piano, tappe) + `app.js` (helper puri +
rendering DOM + `<dialog>` nativo per il popup giorno). Nessun build step, nessuna dipendenza
esterna, nessun framework — resta deployabile così com'è su GitHub Pages.

**Tech Stack:** HTML/CSS/JS vanilla, `<dialog>` nativo del browser per il popup.

## Global Constraints

- Nessun build step, nessuna dipendenza esterna, nessun font/script da CDN (coerenza con il
  sito attuale, che non carica nulla da rete).
- Stile invariato nei toni (parchment `#ece3cf`, brass `#c99a44`, teal `#5c9a95`, sky `#12141c`,
  font serif/mono esistenti) — solo componenti nuovi nello stesso linguaggio visivo.
- Contenuto del piano SOLO dove esiste una guida Notion reale (Bergen, Eidfjord, camper Spagna
  del Nord). Danzica/Oslo/Barcellona/Bilbao/giorni di trasferimento: solo logistica, piano assente.
- Il popup, non una pagina separata, è l'interfaccia per il dettaglio giorno (richiesta esplicita
  dell'utente, sostituisce la route `#/giorno/N` del design doc iniziale). Deep-link via
  `#giorno-N` nell'URL resta supportato (aprire `index.html#giorno-14` apre il popup del giorno
  14 al caricamento) perché è gratis con `<dialog>` + `location.hash`.
- Ambiente di sviluppo: niente Node.js installato in questa macchina → niente test runner JS.
  La verifica dei dati usa uno script Python (`python3` disponibile) che analizza il testo del
  file; la verifica del rendering/DOM è manuale in browser (nessun test automatico per il DOM,
  coerente con la sezione "Verifica" dello spec).

---

## Struttura dei file

- **Modifica**: `index.html` — rimuove `<style>` e `<script>` inline, aggiunge `<link
  rel="stylesheet" href="style.css">`, il markup del `<dialog id="day-modal">`, il contenitore
  `#diario-list` al posto della vecchia timeline, `data-start-day` sulle righe `.stop` esistenti,
  e i `<script src="trip-data.js">` / `<script src="app.js">` in fondo al `<body>`.
- **Crea**: `style.css` — tutto il CSS attuale spostato qui + nuovi componenti (`.day-row`,
  `dialog.day-modal`, `.modal-*`, `.plan-item`, `.logistica-list`, `.diary-pending`,
  `.stop.clickable`).
- **Crea**: `trip-data.js` — `const days = [...]` (21 oggetti), `const planBlocks = {...}`,
  `const stops = [...]` (le 8 tappe attuali, invariate nel testo, con `dayRange` aggiunto).
- **Crea**: `app.js` — helper puri in testa (esportati anche per Node via
  `module.exports`, usati dallo script di verifica) + funzioni di rendering DOM + wiring del
  `<dialog>` e dei tab.

---

### Task 1: `trip-data.js` — dati del viaggio

**Files:**
- Create: `trip-data.js`

**Interfaces:**
- Produce: `days` (array di 21 oggetti `{n, date, tappa, logistica[], planBlock, diario}`),
  `planBlocks` (oggetto `{id: [{nome, dettaglio, difficolta?, tempo?, prenotazione?, costo?}]}`),
  `stops` (array di 8 oggetti `{place, dayRange:[start,end], note}`). Consumati da `app.js`
  (Task 3).

- [ ] **Step 1: Scrivere `trip-data.js`**

```js
// trip-data.js — dati del viaggio InterAir, 3-23 agosto 2026.
// Il piano di ogni giorno viene dalle guide Notion "Viaggi" (Norvegia, camper Spagna del Nord)
// dove esistono; altrimenti resta solo la logistica finché non si scrive il diario.

const planBlocks = {
  "bergen-5ago": [
    { nome: "Bryggen", dettaglio: "il vecchio molo anseatico, patrimonio UNESCO.",
      difficolta: "Facile", tempo: "30-45 min a piedi", prenotazione: "no", costo: "gratis" },
    { nome: "Fisketorget", dettaglio: "il mercato del pesce — bello da vedere, carissimo da mangiare.",
      difficolta: "Facile", prenotazione: "no", costo: "gratis da visitare (cibo caro)" },
    { nome: "Torgallmenningen", dettaglio: "passeggiata serale nel viale principale.",
      difficolta: "Facile", prenotazione: "no", costo: "gratis" }
  ],
  "bergen-6ago": [
    { nome: "Fløyen a piedi", dettaglio: "la montagna simbolo di Bergen, sentiero ben segnato dal centro.",
      difficolta: "Facile/medio", tempo: "45-60 min salita", prenotazione: "no",
      costo: "gratis (funicolare Fløibanen ~17€ a/r se si preferisce)" },
    { nome: "Sentiero Vidden (Fløyen → Ulriken)", dettaglio: "trekking vero anche in città, panoramico, non tecnico.",
      difficolta: "Medio-alto per la durata", tempo: "5-6 ore", prenotazione: "no",
      costo: "gratis (cabinovia Ulriksbanen in discesa opzionale, ~17-23€)" },
    { nome: "Ulriken solo cabinovia", dettaglio: "salita in 10 minuti, sentieri facili in cima, panorama senza il trekking lungo.",
      difficolta: "Facile", tempo: "mezza giornata", prenotazione: "no", costo: "~32-37€ a/r" },
    { nome: "Chicca — Stoltzekleiven", dettaglio: "scalinata di pietra ripidissima (~900 gradini) a Sandviken, l'allenamento preferito dai bergensi.",
      difficolta: "Difficile per la pendenza", tempo: "15-30 min salita", prenotazione: "no", costo: "gratis" },
    { nome: "Piano B pioggia", dettaglio: "KODE (musei d'arte, a pagamento) o Bergenhus Fortress (fortezza storica, gratis).",
      prenotazione: "no" }
  ],
  "eidfjord-transfer-7ago": [
    { nome: "Steindalsfossen", dettaglio: "cascata che si attraversa a piedi da dietro, vicino Norheimsund.",
      difficolta: "Facile", tempo: "pochi minuti a piedi", prenotazione: "no", costo: "gratis, imperdibile" },
    { nome: "Chicca — Hardangerbrua", dettaglio: "il ponte sospeso più lungo di Norvegia, sosta fotografica vicino Eidfjord.",
      difficolta: "Facile", tempo: "10-15 min", prenotazione: "no", costo: "gratis" },
    { nome: "Vøringsfossen", dettaglio: "una delle cascate più famose di Norvegia (182 m), piattaforma raggiungibile con breve camminata.",
      difficolta: "Facile", tempo: "15-30 min", prenotazione: "no", costo: "gratis (parcheggio a pagamento, pochi NOK)" }
  ],
  "eidfjord-opzioni": [
    { nome: "Trolltunga", dettaglio: "il trekking più iconico della zona, da P2 Skjeggedal (27 km a/r) o con navetta P2→P3 (20 km). Se il meteo è brutto: Ringedalsvatnet, lago turchese vicino P1 Tyssedal (facile/medio, 1-2 ore, gratis).",
      difficolta: "Difficile (lunghezza + dislivello)", tempo: "7-12 ore",
      prenotazione: "consigliata per la navetta (trolltunga.com)",
      costo: "parcheggio P2 ~50€/auto/giorno, navetta ~23€ a testa a/r" },
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
    { nome: "Lagos de Covadonga", dettaglio: "accesso in navetta obbligatorio dai parcheggi P1-P4 (auto/camper privato vietato).",
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
    logistica: ["Volo Wizz Air 22:00 → 00:15 (Milano → Danzica)", "Alloggio: Luxury Aura, Danzica"],
    planBlock: null, diario: null },
  { n: 2, date: "2026-08-04", tappa: "Danzica",
    logistica: ["Alloggio: Luxury Aura, Danzica"], planBlock: null, diario: null },
  { n: 3, date: "2026-08-05", tappa: "Danzica → Bergen",
    logistica: ["Volo Wizz Air 12:20 → 14:15 (Danzica → Bergen)", "Ritiro auto a noleggio nel pomeriggio", "Alloggio: Årstad, Bergen"],
    planBlock: "bergen-5ago", diario: null },
  { n: 4, date: "2026-08-06", tappa: "Bergen",
    logistica: ["Alloggio: Årstad, Bergen"], planBlock: "bergen-6ago", diario: null },
  { n: 5, date: "2026-08-07", tappa: "Bergen → Eidfjord",
    logistica: ["Trasferimento in auto verso l'Hardangerfjord (~3h)", "Arrivo a Eidfjord nel pomeriggio"],
    planBlock: "eidfjord-transfer-7ago", diario: null },
  { n: 6, date: "2026-08-08", tappa: "Eidfjord", logistica: [], planBlock: "eidfjord-opzioni", diario: null },
  { n: 7, date: "2026-08-09", tappa: "Eidfjord", logistica: [], planBlock: "eidfjord-opzioni", diario: null },
  { n: 8, date: "2026-08-10", tappa: "Eidfjord", logistica: [], planBlock: "eidfjord-opzioni", diario: null },
  { n: 9, date: "2026-08-11", tappa: "Eidfjord → Bergen → Oslo",
    logistica: ["Trasferimento Eidfjord → Bergen (2,5-3h di guida)", "Volo Norwegian 16:20 → 17:15 (Bergen → Oslo)"],
    planBlock: "eidfjord-partenza-11ago", diario: null },
  { n: 10, date: "2026-08-12", tappa: "Oslo",
    logistica: ["Volo Vueling 21:25 → 00:55 (Oslo → Barcellona, atterraggio dopo mezzanotte)"],
    planBlock: null, diario: null },
  { n: 11, date: "2026-08-13", tappa: "Barcellona → Bilbao",
    logistica: ["Atterraggio a Barcellona 00:55, notte breve", "Volo Vueling 09:10 → 10:25 (Barcellona → Bilbao)"],
    planBlock: null, diario: null },
  { n: 12, date: "2026-08-14", tappa: "Bilbao → San Sebastián",
    logistica: ["Ritiro camper a Zamudio (Bilbao), ore 15:00 — Roadsurfer, prenotazione 3283930513", "Pernottamento: area camper San Sebastián (Camperstop Donosti)"],
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
    logistica: ["Riconsegna camper a Zamudio, ore 12:00 — Roadsurfer, prenotazione 3283930513"], planBlock: "bilbao-extra", diario: null },
  { n: 21, date: "2026-08-23", tappa: "Rientro a Milano",
    logistica: ["Volo Vueling 17:35 → 19:30 (Bilbao → Milano)"], planBlock: "bilbao-extra", diario: null }
];

const stops = [
  { place: "Danzica (Polonia)", dayRange: [1, 2], note: "Wizz Air 22:00→00:15 · Luxury Aura" },
  { place: "Bergen (Norvegia)", dayRange: [3, 4], note: "Wizz Air 12:20→14:15, poi auto · Årstad" },
  { place: "Eidfjord (Norvegia)", dayRange: [5, 9], note: "Auto · tra i fiordi" },
  { place: "Oslo (Norvegia)", dayRange: [9, 10], note: "Norwegian 16:20→17:15" },
  { place: "Barcellona", dayRange: [10, 11], note: "Vueling 21:25→00:55, senza dormire" },
  { place: "Bilbao (Spagna)", dayRange: [11, 12], note: "Vueling 09:10→10:25" },
  { place: "In camper, Spagna del nord", dayRange: [12, 20], note: "Camper" },
  { place: "Rientro a Milano", dayRange: [21, 21], note: "Vueling 17:35→19:30" }
];

if (typeof module !== "undefined" && module.exports) {
  module.exports = { days, planBlocks, stops };
}
```

- [ ] **Step 2: Verificare l'integrità dei dati con uno script Python**

Non c'è Node.js installato in questa macchina, quindi la verifica strutturale usa `python3`
(già presente) per analizzare il testo del file — non esegue il JS, controlla solo forma e
coerenza dei dati.

Salvare come `/tmp/verify_trip_data.py` (file temporaneo, non va nel repo):

```python
import re, sys

text = open("trip-data.js", encoding="utf-8").read()

day_entries = re.findall(r'\{\s*n:\s*(\d+),\s*date:\s*"([\d-]+)"', text)
assert len(day_entries) == 21, f"attesi 21 giorni, trovati {len(day_entries)}"

numbers = [int(n) for n, _ in day_entries]
assert numbers == list(range(1, 22)), f"numerazione giorni non sequenziale: {numbers}"

dates = [d for _, d in day_entries]
assert dates[0] == "2026-08-03", f"primo giorno errato: {dates[0]}"
assert dates[-1] == "2026-08-23", f"ultimo giorno errato: {dates[-1]}"
assert dates == sorted(dates), "le date non sono in ordine crescente"
assert len(set(dates)) == 21, "ci sono date duplicate"

plan_block_ids = set(re.findall(r'^\s*"([a-z0-9-]+)":\s*\[', text, re.MULTILINE))
referenced_ids = set(re.findall(r'planBlock:\s*"([a-z0-9-]+)"', text))
missing = referenced_ids - plan_block_ids
assert not missing, f"planBlock referenziati ma non definiti: {missing}"

stop_ranges = re.findall(r'dayRange:\s*\[(\d+),\s*(\d+)\]', text)
assert len(stop_ranges) == 8, f"attese 8 tappe, trovate {len(stop_ranges)}"

print("OK:", len(day_entries), "giorni,", len(plan_block_ids), "planBlocks,", len(stop_ranges), "tappe")
```

Run: `python3 /tmp/verify_trip_data.py`
Expected: `OK: 21 giorni, 14 planBlocks, 8 tappe` (nessun `AssertionError`)

- [ ] **Step 3: Commit**

```bash
git add trip-data.js
git commit -m "Aggiunge trip-data.js: 21 giorni con logistica e piano dalle guide Notion"
```

---

### Task 2: `style.css` — stile attuale + nuovi componenti

**Files:**
- Create: `style.css`
- Modify: `index.html:9-173` (rimuove il blocco `<style>`, verrà fatto nel Task 4 insieme al resto
  dello scheletro — qui si crea solo `style.css`)

**Interfaces:**
- Produce: tutte le classi CSS esistenti (`.page`, `.tabs`, `.card`, `.photostrip`, `.stop`,
  `.route-map`, ecc.) più le nuove: `.day-row` (riga cliccabile nel tab Diario), `dialog.day-modal`
  + `.modal-inner`/`.modal-head`/`.modal-close`/`.modal-body`/`.modal-section-title`/`.modal-nav`
  (il popup giorno), `.logistica-list`, `.plan-item`/`.plan-name`/`.plan-detail`/`.plan-meta`,
  `.diary-pending`, `.stop.clickable`. Consumate da `index.html` (Task 4) e stilizzano l'HTML
  generato da `app.js` (Task 3).

- [ ] **Step 1: Creare `style.css` con tutto il CSS esistente**

Copiare l'intero contenuto attuale di `index.html:10-173` (dentro `<style>...</style>`) in un
nuovo file `style.css`, senza i tag `<style>`. È il CSS già in produzione, invariato.

- [ ] **Step 2: Aggiungere i componenti nuovi in coda a `style.css`**

```css

/* ---- diario: elenco giorni cliccabile ---- */
.diario-list{ display:flex; flex-direction:column; }
.day-row{
  display:flex; flex-wrap:wrap; align-items:baseline; gap:4px 16px;
  width:100%; text-align:left; appearance:none; border:none; border-left:2px solid transparent;
  background:none; font:inherit; color:inherit; cursor:pointer;
  padding:13px 10px 13px 12px; border-bottom:1px solid var(--sky-line);
  transition:background .15s, border-color .15s;
}
.day-row:first-child{ border-top:1px solid var(--sky-line); }
.day-row:hover, .day-row:focus-visible{
  background: rgba(201,154,68,0.07); border-left-color: var(--brass); outline:none;
}
.day-row .day-n{
  font-family:var(--mono); font-size:0.68rem; letter-spacing:0.1em; text-transform:uppercase;
  color:var(--brass); width:68px; flex:none;
}
.day-row .day-date{ font-family:var(--mono); font-size:0.7rem; color:var(--ink-soft); width:82px; flex:none; }
.day-row .day-place{ font-size:0.98rem; flex:1 1 170px; }
.day-row .day-excerpt{
  font-family:var(--serif); font-style:italic; font-size:0.86rem; color:var(--ink-soft);
  flex:2 1 220px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
}
.day-row .day-pending{
  font-family:var(--mono); font-size:0.64rem; letter-spacing:0.05em; color:var(--ink-faint);
  flex:2 1 220px;
}
@media (max-width: 620px){
  .day-row .day-excerpt, .day-row .day-pending{ flex-basis:100%; margin-top:2px; }
}

/* ---- tappe cliccabili in programma ---- */
.stop.clickable{ cursor:pointer; border-radius:4px; }
.stop.clickable:hover{ background: rgba(201,154,68,0.07); }
.stop.clickable:focus-visible{ outline:2px solid var(--brass); outline-offset:2px; }

/* ---- popup giorno ---- */
dialog.day-modal{
  border:none; padding:0; background:transparent; color:inherit;
  width:min(92vw, 640px); max-width:92vw; max-height:86vh;
  border-radius:9px;
}
dialog.day-modal::backdrop{ background: rgba(6,7,11,0.72); backdrop-filter: blur(2px); }
.modal-inner{
  background: var(--parchment); color: var(--ink-on-paper); border-radius:9px;
  max-height:86vh; overflow-y:auto;
  box-shadow: 0 30px 70px -20px rgba(0,0,0,0.6);
}
.modal-head{ display:flex; align-items:flex-start; justify-content:space-between; gap:12px; padding:22px 22px 0; }
.modal-close{
  appearance:none; border:1px solid var(--brass-soft); background:var(--parchment);
  color:var(--ink-on-paper-soft); width:30px; height:30px; border-radius:50%;
  font-size:1rem; line-height:1; cursor:pointer; flex:none;
}
.modal-close:hover{ background: var(--brass); color: var(--parchment); border-color:var(--brass); }
.modal-body{ padding: 4px 22px 22px; }
.modal-section-title{
  font-family:var(--mono); font-size:0.66rem; letter-spacing:0.12em; text-transform:uppercase;
  color:var(--ink-on-paper-soft); margin:22px 0 10px;
}
.modal-body .stamp + .modal-section-title{ margin-top:18px; }
.logistica-list{ list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:6px; }
.logistica-list li{ font-family:var(--mono); font-size:0.78rem; color:var(--ink-on-paper-soft); padding-left:14px; position:relative; }
.logistica-list li::before{ content:"·"; position:absolute; left:0; color:var(--brass); }
.plan-list{ display:flex; flex-direction:column; gap:14px; }
.plan-item{ border-left:2px solid var(--brass-soft); padding:1px 0 1px 12px; }
.plan-item .plan-name{ font-weight:600; font-size:1rem; }
.plan-item .plan-detail{ font-size:0.92rem; line-height:1.55; margin:3px 0 6px; max-width:60ch; }
.plan-item .plan-meta{ font-family:var(--mono); font-size:0.68rem; letter-spacing:0.02em; color:var(--ink-on-paper-soft); }
.plan-item .plan-meta span + span::before{ content:" · "; }
.diary-pending{
  font-family:var(--mono); font-size:0.76rem; color:var(--ink-faint); text-align:center;
  padding:22px 12px; border:1px dashed var(--parchment-edge); border-radius:6px;
}
.modal-nav{
  display:flex; justify-content:space-between; align-items:center; gap:10px;
  padding:16px 22px 22px; border-top:1px solid var(--parchment-edge); margin-top:8px;
}
.modal-nav button{
  appearance:none; border:1px solid var(--parchment-edge); background:transparent;
  color:var(--ink-on-paper-soft); font-family:var(--mono); font-size:0.68rem;
  letter-spacing:0.06em; text-transform:uppercase; padding:8px 12px; border-radius:6px; cursor:pointer;
}
.modal-nav button:hover:not(:disabled){ border-color:var(--brass); color:var(--ink-on-paper); }
.modal-nav button:disabled{ opacity:0.35; cursor:default; }
```

- [ ] **Step 2: Verificare che il file sia sintatticamente coerente**

Non c'è un linter CSS installato: verifica manuale che le parentesi graffe siano bilanciate.

Run: `python3 -c "t=open('style.css').read(); assert t.count('{')==t.count('}'), 'graffe non bilanciate'; print('OK:', t.count('{'), 'blocchi')"`
Expected: `OK: <numero>` senza errori

- [ ] **Step 3: Commit**

```bash
git add style.css
git commit -m "Estrae il CSS in style.css e aggiunge i componenti per elenco giorni e popup"
```

---

### Task 3: `app.js` — helper puri, rendering e popup

**Files:**
- Create: `app.js`

**Interfaces:**
- Consuma: `days`, `planBlocks`, `stops` da `trip-data.js` (Task 1, variabili globali caricate
  prima di `app.js` via `<script>`); markup con id `diario-list`, `day-modal`,
  `day-modal-body`, `modal-close`, `modal-prev`, `modal-next`, classi `.tab-btn`/`.tab-panel`,
  `.stop` con `data-start-day` (prodotti da `index.html`, Task 4).
- Produce (helper puri, testabili senza DOM): `parseISODate(iso)`, `formatDayHeader(iso) ->
  {dow, label}`, `excerpt(text, maxLen) -> string`, `getPlanForDay(day, planBlocks) -> array|null`,
  `getStopForDay(n, stops) -> object|null`, `clampDayNumber(n, totalDays) -> number`.

- [ ] **Step 1: Scrivere gli helper puri con i test**

Creare `app.js` con gli helper in testa, esportati per Node quando `module` esiste (per la
verifica), altrimenti globali per il browser:

```js
'use strict';

const DOW_IT = ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab'];
const MESI_IT = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'];

function parseISODate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d); // orario locale: evita lo shift di un giorno che new Date(iso) darebbe (parse UTC)
}

function formatDayHeader(iso) {
  const date = parseISODate(iso);
  const dow = DOW_IT[date.getDay()];
  const label = `${dow} ${date.getDate()} ${MESI_IT[date.getMonth()]} ${date.getFullYear()}`;
  return { dow, label };
}

function excerpt(text, maxLen) {
  if (text.length <= maxLen) return text;
  const cut = text.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(' ');
  return cut.slice(0, lastSpace > 0 ? lastSpace : maxLen).trim() + '…';
}

function getPlanForDay(day, planBlocksMap) {
  if (!day.planBlock) return null;
  return planBlocksMap[day.planBlock] || null;
}

function getStopForDay(n, stopsList) {
  return stopsList.find(s => n >= s.dayRange[0] && n <= s.dayRange[1]) || null;
}

function clampDayNumber(n, totalDays) {
  return Math.min(Math.max(n, 1), totalDays);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { parseISODate, formatDayHeader, excerpt, getPlanForDay, getStopForDay, clampDayNumber };
}
```

- [ ] **Step 2: Verificare gli helper (niente Node → verifica manuale mirata)**

Non essendoci un runtime JS da riga di comando in questa macchina, gli helper puri si verificano
aprendo il sito nel Task 4 e controllando nel popup che: la data mostrata per il giorno 1 sia
"lun 3 ago 2026" (non "dom 2 ago" — confermerebbe un bug di timezone), l'estratto del diario nel
tab Diario sia troncato con "…" e non tagli una parola a metà, e i pulsanti prec./succ. siano
disabilitati rispettivamente sul giorno 1 e sul giorno 21. Questi controlli sono nella checklist
del Task 4.

- [ ] **Step 3: Aggiungere il rendering DOM e il wiring del popup/tab in coda allo stesso file**

```js

(function () {
  const totalDays = days.length;

  function renderDiarioList() {
    const list = document.getElementById('diario-list');
    list.innerHTML = '';
    days.forEach(day => {
      const { label } = formatDayHeader(day.date);
      const written = !!day.diario;
      const row = document.createElement('button');
      row.type = 'button';
      row.className = 'day-row';
      row.innerHTML = `
        <span class="day-n">Giorno ${day.n}</span>
        <span class="day-date">${label}</span>
        <span class="day-place">${day.tappa}</span>
        ${written
          ? `<span class="day-excerpt">${excerpt(day.diario.paragrafi[0], 110)}</span>`
          : `<span class="day-pending">non ancora scritto</span>`}
      `;
      row.addEventListener('click', () => openDayModal(day.n));
      list.appendChild(row);
    });
  }

  function wireUpProgrammaStops() {
    document.querySelectorAll('#tab-programma .stop').forEach(el => {
      const startDay = Number(el.dataset.startDay);
      if (!startDay) return;
      el.classList.add('clickable');
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');
      el.addEventListener('click', () => openDayModal(startDay));
      el.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDayModal(startDay); }
      });
    });
  }

  function planMetaRow(item) {
    const parts = [item.difficolta, item.tempo,
      item.prenotazione ? `prenotazione: ${item.prenotazione}` : null,
      item.costo].filter(Boolean);
    return parts.map(p => `<span>${p}</span>`).join('');
  }

  function renderDayModal(n) {
    const day = days.find(d => d.n === n);
    const { label } = formatDayHeader(day.date);
    const plan = getPlanForDay(day, planBlocks);
    const body = document.getElementById('day-modal-body');

    let html = `
      <div class="stamp">
        <span class="day">Giorno ${day.n}</span>
        <span class="date">${label}</span>
        <span class="place">${day.tappa}</span>
      </div>
    `;

    if (day.logistica.length) {
      html += `<p class="modal-section-title">Logistica</p><ul class="logistica-list">`
        + day.logistica.map(l => `<li>${l}</li>`).join('') + `</ul>`;
    }

    if (plan) {
      html += `<p class="modal-section-title">Piano</p><div class="plan-list">`
        + plan.map(item => `
          <div class="plan-item">
            <div class="plan-name">${item.nome}</div>
            <p class="plan-detail">${item.dettaglio}</p>
            <div class="plan-meta">${planMetaRow(item)}</div>
          </div>
        `).join('') + `</div>`;
    }

    html += `<p class="modal-section-title">Diario della serata</p>`;
    if (day.diario) {
      html += `<div class="card">`;
      if (day.diario.foto && day.diario.foto.length) {
        html += `<div class="photostrip">` + day.diario.foto.map((src, i) =>
          `<div class="photo"><img src="${src}" alt="Foto ${i + 1} — ${day.tappa}" loading="lazy"></div>`
        ).join('') + `</div>`;
      }
      html += day.diario.paragrafi.map((p, i) => `<p class="${i === 0 ? 'lede' : ''}">${p}</p>`).join('');
      html += `</div>`;
    } else {
      html += `<p class="diary-pending">il resoconto arriverà la sera del ${label}</p>`;
    }

    body.innerHTML = html;

    const modal = document.getElementById('day-modal');
    document.getElementById('modal-prev').disabled = n <= 1;
    document.getElementById('modal-next').disabled = n >= totalDays;
    modal.dataset.currentDay = String(n);
  }

  function openDayModal(n) {
    n = clampDayNumber(n, totalDays);
    renderDayModal(n);
    const modal = document.getElementById('day-modal');
    if (!modal.open) modal.showModal();
    location.hash = `giorno-${n}`;
  }

  function closeDayModal() {
    document.getElementById('day-modal').close();
  }

  function clearHashIfDayLink() {
    if (location.hash.startsWith('#giorno-')) {
      history.replaceState(null, '', location.pathname + location.search);
    }
  }

  function wireUpModal() {
    const modal = document.getElementById('day-modal');
    document.getElementById('modal-close').addEventListener('click', closeDayModal);
    document.getElementById('modal-prev').addEventListener('click', () => {
      openDayModal(Number(modal.dataset.currentDay) - 1);
    });
    document.getElementById('modal-next').addEventListener('click', () => {
      openDayModal(Number(modal.dataset.currentDay) + 1);
    });
    modal.addEventListener('click', e => { if (e.target === modal) closeDayModal(); });
    modal.addEventListener('close', clearHashIfDayLink);
  }

  function wireUpTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b === btn));
        const target = btn.dataset.tab;
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.id === 'tab-' + target));
      });
    });
  }

  function openFromHash() {
    const match = location.hash.match(/^#giorno-(\d+)$/);
    if (match) openDayModal(Number(match[1]));
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderDiarioList();
    wireUpProgrammaStops();
    wireUpModal();
    wireUpTabs();
    openFromHash();
  });
})();
```

- [ ] **Step 4: Commit**

```bash
git add app.js
git commit -m "Aggiunge app.js: rendering elenco giorni, popup del giorno, routing via hash"
```

---

### Task 4: `index.html` — nuovo scheletro, verifica in browser, push

**Files:**
- Modify: `index.html` (intero file)

**Interfaces:**
- Consuma: `style.css` (Task 2), `trip-data.js` + `app.js` (Task 1, 3).

- [ ] **Step 1: Riscrivere `index.html`**

```html
<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="color-scheme" content="dark">
<meta name="theme-color" content="#12141c">
<title>InterAir — Diario di viaggio</title>
<link rel="stylesheet" href="style.css">
</head>
<body>
<div class="page">

  <header class="masthead">
    <p class="eyebrow">Diario di viaggio</p>
    <h1 class="title">InterAir</h1>
    <p class="subtitle">— 3 – 23 agosto 2026 —</p>
    <hr class="masthead-rule">
  </header>

  <nav class="tabs">
    <button class="tab-btn active" data-tab="diario">Diario</button>
    <button class="tab-btn" data-tab="programma">Programma</button>
  </nav>

  <!-- ===================== DIARIO ===================== -->
  <section class="tab-panel active" id="tab-diario">
    <div class="block-head">
      <h2>Diario</h2>
      <span class="block-note">21 giorni · clicca per aprire</span>
    </div>
    <div class="diario-list" id="diario-list"></div>
  </section>

  <!-- ===================== PROGRAMMA ===================== -->
  <section class="tab-panel" id="tab-programma">
    <div class="block-head">
      <h2>Programma</h2>
      <span class="block-note">3 – 23 agosto 2026</span>
    </div>

    <div class="route-wrap">
      <svg class="route-map" viewBox="0 0 460 380" role="img" aria-label="Mappa d'Europa con la rotta del viaggio: Milano, Danzica, Norvegia, Barcellona, Spagna del nord">
        <path class="europe-outline" d="M434.9,28.8 L417.8,32.9 L409.6,33.8 L413.9,26.7 L401.0,22.7 L385.3,26.1 L380.4,33.5 L370.8,38.0 L359.9,35.6 L346.8,36.1 L335.6,30.7 L329.5,33.4 L323.3,33.8 L321.8,40.4 L302.8,38.8 L300.1,44.4 L290.5,44.4 L283.8,51.6 L273.7,62.7 L258.1,76.9 L261.8,80.4 L258.2,84.4 L248.2,84.2 L241.7,93.6 L242.3,107.0 L248.8,112.1 L245.4,124.0 L237.0,130.9 L232.6,136.7 L225.8,130.5 L205.9,142.2 L192.5,144.5 L178.6,139.4 L175.0,128.6 L171.8,105.3 L181.1,98.8 L207.7,90.4 L227.6,79.9 L246.0,65.9 L270.2,46.4 L287.1,38.9 L314.8,26.2 L336.9,21.8 L353.5,22.3 L368.8,14.0 L387.2,14.4 L405.3,12.4 L436.8,19.8 L423.9,22.5 L434.9,28.8 Z M183.8,231.3 L188.6,234.0 L203.1,235.8 L198.0,242.7 L196.7,249.9 L193.9,251.6 L189.4,250.7 L189.7,253.3 L182.3,258.9 L182.2,263.5 L187.0,261.9 L190.4,266.3 L190.0,269.2 L193.0,273.0 L189.5,276.0 L192.1,283.8 L197.5,285.1 L196.4,289.5 L187.3,295.2 L167.4,292.5 L152.7,295.7 L151.6,301.8 L139.9,303.1 L128.5,298.6 L124.9,300.7 L106.3,296.1 L102.3,292.2 L107.5,286.2 L109.4,266.1 L99.0,255.5 L91.6,250.4 L76.2,246.6 L75.2,239.2 L88.2,237.0 L105.2,239.6 L102.0,228.2 L111.5,232.5 L135.0,224.7 L138.0,216.4 L146.8,214.4 L148.3,217.9 L152.9,218.1 L157.6,222.1 L164.7,226.9 L169.8,226.1 L178.6,230.7 L180.9,231.6 L183.8,231.3 Z M209.6,300.2 L216.1,296.4 L217.8,305.0 L214.5,312.8 L209.9,310.8 L207.6,304.0 L209.6,300.2 Z M232.6,136.7 L237.0,130.9 L245.4,124.0 L248.8,112.1 L242.3,107.0 L241.7,93.6 L248.2,84.2 L258.2,84.4 L261.8,80.4 L258.1,76.9 L273.7,62.7 L283.8,51.6 L290.5,44.4 L300.1,44.4 L302.8,38.8 L321.8,40.4 L323.3,33.8 L329.5,33.4 L343.0,38.3 L358.7,45.2 L359.0,60.7 L362.4,64.6 L345.0,67.5 L335.3,74.5 L336.8,80.7 L320.8,88.8 L301.3,97.5 L294.0,111.6 L301.2,118.7 L310.8,124.3 L301.6,135.7 L291.1,138.1 L287.2,155.0 L281.5,164.4 L269.3,163.4 L263.6,171.4 L251.9,171.9 L248.7,162.4 L240.3,150.9 L232.6,136.7 Z M358.1,186.5 L358.6,191.0 L361.4,194.8 L361.3,198.8 L355.3,200.9 L358.4,205.5 L358.6,210.0 L363.6,218.8 L362.6,221.7 L357.6,222.8 L348.4,231.2 L351.0,235.7 L348.8,235.2 L339.2,231.3 L332.0,232.7 L327.2,231.7 L321.3,233.8 L316.2,230.3 L312.0,231.6 L311.5,231.0 L306.8,226.1 L299.3,225.5 L298.4,222.3 L291.5,221.2 L290.0,223.8 L284.5,221.7 L285.1,218.9 L277.6,218.0 L272.8,214.8 L268.7,208.4 L269.5,204.9 L267.0,199.5 L263.3,195.9 L266.1,193.2 L263.8,188.1 L270.6,185.1 L286.4,180.5 L299.1,177.0 L309.1,178.8 L309.9,181.2 L319.6,181.3 L332.0,182.5 L350.6,182.3 L355.7,183.4 L358.1,186.5 Z M292.6,244.9 L291.8,249.0 L286.1,249.0 L288.1,251.2 L284.8,257.7 L282.8,259.4 L274.0,259.6 L268.9,261.9 L260.6,261.1 L246.2,258.5 L243.9,255.0 L234.0,256.8 L232.8,258.7 L226.7,257.3 L221.6,257.0 L217.0,255.1 L218.5,252.7 L218.2,250.9 L221.2,250.3 L226.3,253.1 L227.7,250.5 L236.6,250.9 L243.8,249.1 L248.7,249.4 L251.8,251.5 L252.7,249.8 L251.3,243.2 L254.9,241.9 L258.5,237.3 L266.0,240.5 L271.6,236.4 L275.2,235.6 L283.0,238.7 L287.7,238.2 L292.4,240.1 L291.6,241.4 L292.6,244.9 Z M263.8,188.1 L266.1,193.2 L263.3,195.9 L267.0,199.5 L269.5,204.9 L268.7,208.4 L272.8,214.8 L268.3,215.8 L265.7,214.7 L263.1,216.6 L255.9,218.6 L252.1,221.1 L244.8,223.3 L246.6,226.3 L247.7,230.5 L252.8,232.9 L258.5,237.3 L254.9,241.9 L251.3,243.2 L252.7,249.8 L251.8,251.5 L248.7,249.4 L243.8,249.1 L236.6,250.9 L227.7,250.5 L226.3,253.1 L221.2,250.3 L218.2,250.9 L207.4,247.8 L205.3,250.0 L196.7,249.9 L198.0,242.7 L203.1,235.8 L188.6,234.0 L183.8,231.3 L184.4,226.9 L182.4,224.7 L183.5,217.8 L181.8,207.3 L187.9,207.3 L190.4,203.5 L192.9,194.3 L191.1,190.8 L193.0,188.7 L201.4,188.2 L203.3,190.4 L210.2,185.4 L207.9,181.6 L207.4,175.9 L215.0,177.3 L221.5,175.7 L221.6,179.6 L231.8,182.0 L231.7,185.5 L242.0,183.7 L247.6,180.9 L259.0,184.9 L263.8,188.1 Z M218.2,250.9 L218.5,252.7 L217.0,255.1 L221.6,257.0 L226.7,257.3 L225.9,261.4 L221.5,263.1 L214.0,261.8 L211.8,265.9 L207.0,266.2 L205.3,264.6 L199.6,268.0 L194.8,268.5 L190.4,266.3 L187.0,261.9 L182.2,263.5 L182.3,258.9 L189.7,253.3 L189.4,250.7 L193.9,251.6 L196.7,249.9 L205.3,250.0 L207.4,247.8 L218.2,250.9 Z M182.4,224.7 L184.4,226.9 L183.8,231.3 L180.9,231.6 L178.6,230.7 L179.7,225.0 L182.4,224.7 Z M183.5,217.8 L182.4,224.7 L179.7,225.0 L178.6,230.7 L169.8,226.1 L164.7,226.9 L157.6,222.1 L152.9,218.1 L148.3,217.9 L146.8,214.4 L154.9,212.4 L154.9,212.4 L154.9,212.4 L162.2,213.2 L171.6,211.1 L178.0,215.5 L183.5,217.8 Z M191.1,190.8 L192.9,194.3 L190.4,203.5 L187.9,207.3 L181.8,207.3 L183.5,217.8 L178.0,215.5 L171.6,211.1 L162.2,213.2 L154.9,212.4 L154.9,212.4 L160.1,209.6 L168.9,194.8 L182.7,190.6 L191.1,190.8 Z M30.4,307.8 L34.1,305.2 L38.2,303.7 L40.7,308.7 L46.7,308.7 L48.4,307.4 L54.3,307.7 L57.1,312.8 L52.4,315.5 L52.3,323.4 L50.6,324.9 L50.2,329.6 L45.9,330.5 L49.9,336.5 L47.1,343.1 L50.6,346.1 L49.2,348.9 L45.5,352.6 L46.3,356.0 L42.3,358.6 L37.0,357.2 L31.8,358.3 L33.3,350.4 L32.4,344.2 L27.9,343.3 L25.4,339.5 L26.3,332.9 L30.3,329.2 L31.0,325.1 L33.1,319.1 L32.9,314.8 L30.8,311.2 L30.4,307.8 Z M46.3,356.0 L45.5,352.6 L49.2,348.9 L50.6,346.1 L47.1,343.1 L49.9,336.5 L45.9,330.5 L50.2,329.6 L50.6,324.9 L52.3,323.4 L52.4,315.5 L57.1,312.8 L54.3,307.7 L48.4,307.4 L46.7,308.7 L40.7,308.7 L38.2,303.7 L34.1,305.2 L30.4,307.8 L30.9,300.6 L26.8,296.2 L41.1,289.0 L53.4,290.8 L66.9,290.7 L77.6,292.4 L86.0,291.9 L102.3,292.2 L106.3,296.1 L124.9,300.7 L128.5,298.6 L139.9,303.1 L151.6,301.8 L152.1,307.7 L142.5,314.4 L129.6,316.5 L128.7,319.9 L122.5,325.5 L118.7,333.7 L122.6,339.4 L116.8,343.9 L114.6,350.5 L107.0,352.5 L99.8,360.2 L87.0,360.4 L77.4,360.2 L71.1,363.8 L67.3,367.6 L62.3,366.7 L58.6,363.3 L55.7,357.5 L46.3,356.0 Z M59.0,187.0 L60.7,194.2 L53.0,203.2 L35.2,209.1 L20.9,207.6 L29.1,197.1 L23.8,186.8 L37.5,178.9 L45.1,174.2 L47.2,179.6 L45.1,185.0 L51.4,184.9 L59.0,187.0 Z M226.7,257.3 L232.8,258.7 L234.0,256.8 L243.9,255.0 L246.2,258.5 L260.6,261.1 L259.5,266.1 L261.9,270.4 L253.9,268.9 L245.7,272.5 L246.3,277.5 L245.0,280.4 L248.3,285.5 L257.8,290.6 L262.9,298.9 L274.1,307.0 L282.0,307.0 L284.4,309.2 L281.6,311.2 L290.6,314.8 L298.0,317.9 L306.7,323.1 L307.7,325.0 L305.8,328.6 L300.2,323.9 L291.5,322.3 L287.2,328.8 L294.5,332.5 L293.3,337.8 L289.1,338.4 L283.7,347.0 L279.5,347.8 L279.6,344.7 L281.6,339.3 L283.8,337.2 L279.9,331.3 L276.8,326.2 L272.6,325.0 L269.6,320.6 L263.2,318.8 L258.8,314.8 L251.4,314.1 L243.5,309.5 L234.3,303.0 L227.4,297.2 L224.3,287.2 L219.2,286.0 L211.0,282.7 L206.4,284.1 L200.6,288.8 L196.4,289.5 L197.5,285.1 L192.1,283.8 L189.5,276.0 L193.0,273.0 L190.0,269.2 L190.4,266.3 L194.8,268.5 L199.6,268.0 L205.3,264.6 L207.0,266.2 L211.8,265.9 L214.0,261.8 L221.5,263.1 L225.9,261.4 L226.7,257.3 Z M270.2,345.4 L277.9,344.6 L274.3,352.5 L275.8,355.6 L273.6,360.8 L265.9,357.0 L260.8,355.9 L246.7,350.8 L248.2,345.6 L259.9,346.5 L270.2,345.4 Z M209.2,317.7 L214.3,314.5 L220.3,321.7 L218.9,335.0 L214.3,334.4 L210.2,337.7 L206.4,335.1 L206.0,322.9 L203.7,317.2 L209.2,317.7 Z M221.5,175.7 L215.0,177.3 L207.4,175.9 L203.3,170.3 L203.0,160.0 L204.7,157.3 L207.6,154.3 L216.4,153.7 L220.0,150.9 L228.1,148.0 L227.7,153.2 L224.8,156.5 L226.0,159.3 L231.4,160.9 L229.0,164.7 L226.0,163.6 L218.7,170.8 L221.5,175.7 Z M246.1,164.4 L249.4,169.4 L243.3,177.6 L232.8,171.9 L231.4,167.7 L246.1,164.4 Z M59.0,187.0 L51.4,184.9 L45.1,185.0 L47.2,179.6 L45.1,174.2 L53.6,173.8 L64.4,180.0 L59.0,187.0 Z M90.3,191.6 L90.3,191.6 L91.8,185.8 L85.0,179.6 L84.9,179.4 L72.6,177.7 L70.2,174.9 L73.9,170.4 L70.6,167.7 L65.2,172.4 L64.6,162.7 L59.5,157.6 L63.1,147.1 L71.0,139.0 L79.0,139.8 L91.2,138.9 L80.4,149.8 L90.7,148.4 L101.7,148.5 L99.1,156.7 L90.0,165.7 L100.4,166.4 L101.2,167.4 L110.2,179.3 L117.1,181.0 L123.3,192.4 L126.2,196.4 L138.4,198.3 L137.2,204.8 L132.0,207.7 L136.1,212.9 L127.0,218.2 L113.5,218.1 L96.4,220.9 L91.7,218.9 L85.0,223.6 L75.7,222.5 L68.6,226.3 L63.2,224.3 L78.0,213.7 L87.0,211.6 L87.0,211.6 L71.2,209.9 L68.4,205.9 L78.9,202.8 L73.4,197.3 L75.3,190.7 L90.3,191.6 Z M409.6,33.8 L408.1,40.9 L423.6,47.6 L414.3,55.2 L426.0,66.6 L419.2,75.3 L428.3,82.8 L424.2,89.4 L439.1,96.3 L435.3,101.4 L425.9,107.2 L404.4,120.1 L404.4,120.1 L404.4,120.1 L386.1,120.9 L368.3,124.6 L351.9,126.7 L346.1,121.2 L336.4,117.9 L338.6,108.0 L333.7,98.9 L338.5,93.0 L347.6,86.7 L370.7,75.8 L377.4,73.6 L376.4,69.4 L362.4,64.6 L359.0,60.7 L358.7,45.2 L343.0,38.3 L329.5,33.4 L335.6,30.7 L346.8,36.1 L359.9,35.6 L370.8,38.0 L380.4,33.5 L385.3,26.1 L401.0,22.7 L413.9,26.7 L409.6,33.8 Z M348.8,235.2 L346.0,237.8 L344.0,241.8 L341.9,242.9 L331.1,239.8 L327.8,240.4 L325.4,242.8 L320.7,244.1 L319.6,243.4 L314.7,245.0 L310.7,245.3 L309.9,247.3 L301.4,248.5 L297.7,247.4 L292.6,244.9 L291.6,241.4 L292.4,240.1 L293.8,237.9 L298.3,238.0 L301.7,237.0 L302.0,236.1 L303.9,235.6 L304.6,233.3 L306.9,232.8 L308.5,231.0 L311.5,231.0 L312.0,231.6 L316.2,230.3 L321.3,233.8 L327.2,231.7 L332.0,232.7 L339.2,231.3 L348.8,235.2 Z M272.8,214.8 L277.6,218.0 L285.1,218.9 L284.5,221.7 L290.0,223.8 L291.5,221.2 L298.4,222.3 L299.3,225.5 L306.8,226.1 L311.5,231.0 L308.5,231.0 L306.9,232.8 L304.6,233.3 L303.9,235.6 L302.0,236.1 L301.7,237.0 L298.3,238.0 L293.8,237.9 L292.4,240.1 L287.7,238.2 L283.0,238.7 L275.2,235.6 L271.6,236.4 L266.0,240.5 L258.5,237.3 L252.8,232.9 L247.7,230.5 L246.6,226.3 L244.8,223.3 L252.1,221.1 L255.9,218.6 L263.1,216.6 L265.7,214.7 L268.3,215.8 L272.8,214.8 Z"/>

        <path class="leg-return" d="M 92,294 Q 150,330 214,272"/>
        <path class="leg" d="M 214,272 Q 300,220 309,182"/>
        <path class="leg" d="M 309,182 Q 260,130 184,120"/>
        <path class="leg" d="M 184,120 Q 172,220 145,303"/>
        <path class="leg" d="M 145,303 Q 118,300 92,294"/>

        <circle class="home-mark" cx="214" cy="272" r="4.5" transform="rotate(45 214 272)" />
        <text x="214" y="290" text-anchor="middle">Milano</text>

        <circle class="stop-dot" cx="309" cy="182" r="6"/>
        <text class="stop-label" x="309" y="166" text-anchor="middle">Danzica</text>

        <circle class="stop-dot" cx="184" cy="120" r="6"/>
        <text class="stop-label" x="184" y="104" text-anchor="middle">Norvegia</text>

        <circle class="stop-dot" cx="145" cy="303" r="6"/>
        <text class="stop-label" x="145" y="290" text-anchor="middle">Barcellona</text>

        <circle class="stop-dot" cx="92" cy="294" r="6"/>
        <text class="stop-label" x="92" y="277" text-anchor="middle">Spagna del nord</text>
      </svg>
    </div>
    <p class="route-caption">rotta indicativa, non in scala — tratteggio = rientro</p>

    <div class="itinerary">
      <div class="stop" data-start-day="1">
        <span class="stop-day">3–4 ago</span>
        <span class="stop-place">Danzica (Polonia)</span>
        <span class="stop-note">Wizz Air 22:00→00:15 · Luxury Aura</span>
      </div>
      <div class="stop" data-start-day="3">
        <span class="stop-day">5–6 ago</span>
        <span class="stop-place">Bergen (Norvegia)</span>
        <span class="stop-note">Wizz Air 12:20→14:15, poi auto · Årstad</span>
      </div>
      <div class="stop" data-start-day="5">
        <span class="stop-day">7–11 ago</span>
        <span class="stop-place">Eidfjord (Norvegia)</span>
        <span class="stop-note">Auto · tra i fiordi</span>
      </div>
      <div class="stop" data-start-day="9">
        <span class="stop-day">11–12 ago</span>
        <span class="stop-place">Oslo (Norvegia)</span>
        <span class="stop-note">Norwegian 16:20→17:15</span>
      </div>
      <div class="stop" data-start-day="10">
        <span class="stop-day">12–13 ago</span>
        <span class="stop-place">Barcellona</span>
        <span class="stop-note">Vueling 21:25→00:55, senza dormire</span>
      </div>
      <div class="stop" data-start-day="11">
        <span class="stop-day">13–14 ago</span>
        <span class="stop-place">Bilbao (Spagna)</span>
        <span class="stop-note">Vueling 09:10→10:25</span>
      </div>
      <div class="stop" data-start-day="12">
        <span class="stop-day">14–22 ago</span>
        <span class="stop-place">In camper, Spagna del nord</span>
        <span class="stop-note">Camper</span>
      </div>
      <div class="stop" data-start-day="21">
        <span class="stop-day">23 ago</span>
        <span class="stop-place">Rientro a Milano</span>
        <span class="stop-note">Vueling 17:35→19:30</span>
      </div>
    </div>
  </section>

  <footer class="endmark">
    <span class="mark">✳</span> aggiornato ogni sera, finché dura il viaggio
  </footer>

</div>

<dialog id="day-modal" class="day-modal">
  <div class="modal-inner">
    <div class="modal-head">
      <div></div>
      <button type="button" id="modal-close" class="modal-close" aria-label="Chiudi">✕</button>
    </div>
    <div class="modal-body" id="day-modal-body"></div>
    <div class="modal-nav">
      <button type="button" id="modal-prev">← giorno prec.</button>
      <button type="button" id="modal-next">giorno succ. →</button>
    </div>
  </div>
</dialog>

<script src="trip-data.js"></script>
<script src="app.js"></script>
</body>
</html>
```

- [ ] **Step 2: Verifica manuale completa in browser**

Aprire il file direttamente nel browser di default:

Run: `open index.html`

Checklist da confermare a occhio (nessun test automatico per il DOM, coerente con la sezione
"Verifica" dello spec — se è disponibile lo strumento di automazione browser, usarlo per
navigare ed eseguire questi controlli invece di farlo a mano):

- Tab **Diario** attivo di default, mostra 21 righe, "Giorno 1" ... "Giorno 21", tutte con
  etichetta "non ancora scritto" (nessun `diario` è ancora popolato)
- Click su una riga (es. "Giorno 4") apre il popup: stemma con "Giorno 4 · gio 6 ago 2026 ·
  Bergen", sezione Logistica con l'alloggio, sezione Piano con le 5 attività di
  `bergen-6ago` (Fløyen, Vidden, Ulriken, Stoltzekleiven, piano B), sezione "Diario della
  serata" con il placeholder tratteggiato
- Sul giorno 1 il pulsante "← giorno prec." è disabilitato; sul giorno 21 "giorno succ. →" è
  disabilitato
- Click su "giorno succ. →" ripetutamente attraversa correttamente tutti i 21 giorni senza
  errori in console
- Chiusura del popup: pulsante ✕, click fuori dal riquadro (sul backdrop), e tasto Esc
  funzionano tutti e tre
- Tab **Programma**: la mappa e la lista tappe sono invariate nell'aspetto; click su
  "Eidfjord (Norvegia)" apre il popup del Giorno 5 ("Bergen → Eidfjord", piano
  `eidfjord-transfer-7ago`); click su "In camper, Spagna del nord" apre il Giorno 12
  ("Bilbao → San Sebastián")
- Aprire l'URL con `index.html#giorno-16` direttamente (o incollare `#giorno-16` nella barra
  indirizzi e ricaricare): il popup del Giorno 16 (Potes, Fuente Dé) si apre da solo al
  caricamento
- Restringere la finestra a ~375px di larghezza: tab nav, elenco Diario e popup restano
  leggibili, nessun overflow orizzontale della pagina
- Aprire la console del browser durante tutti i passaggi sopra: nessun errore JS

Se un controllo fallisce, correggere il file coinvolto (`trip-data.js`, `style.css` o
`app.js`) e ripetere l'intera checklist da capo prima di procedere.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "Riscrive index.html: elenco giorni cliccabile, tappe cliccabili, popup del giorno"
```

---

### Task 5: Push su `origin main`

**Files:** nessuno (operazione git)

- [ ] **Step 1: Verificare lo stato del branch**

Run: `git status && git log --oneline -6`
Expected: working tree pulito, i 4 commit dei Task 1-4 in testa a `main`, nessun conflitto con
`origin/main`

- [ ] **Step 2: Push**

Run: `git push`
Expected: `main -> main` aggiornato senza errori

---

## Amendment (post-Task 4, dopo verifica utente)

Dopo aver visto il Task 4 funzionante nel browser, l'utente ha chiesto una correzione: il tab
**Diario** non deve più essere un elenco compatto cliccabile che apre il popup piano/logistica —
deve tornare a essere una timeline di note/card in stile diario originale (una card per giorno,
con foto e testo quando scritti), e il contenuto piano/logistica deve restare **solo** nel popup
agganciato al tab **Programma**, senza comparire nel Diario. Corollario: il popup non mostra più
una sezione "Diario della serata" — è solo stemma + logistica + piano, uso esclusivo di Programma.

Cambiamenti concreti (Task 4b):
- `app.js`: `renderDiarioList()` → rinominata `renderDiarioTimeline()`, produce markup
  `<article class="entry">`/`<article class="entry entry-pending">` (stamp + card con
  photostrip/paragrafi per i giorni scritti, oppure stamp + nota "non ancora scritto" per i
  giorni non scritti), niente più click/bottoni. `renderDayModal()` perde la sezione "Diario
  della serata" (stamp + logistica + piano soltanto). L'helper `excerpt()` non serve più
  (nessun estratto troncato da mostrare) e va rimosso insieme al suo export.
- `style.css`: rimuove `.diario-list`/`.day-row` e la loro media query (non più usati),
  rimuove `.diary-pending` (non più referenziata dal modal), aggiunge una sola regola nuova
  `.entry-pending-note` per la nota dei giorni non scritti (l'`.entry`/`.card`/`.photostrip`
  esistenti bastano per i giorni scritti, nessuna modifica lì).
- `index.html`: il contenitore del tab Diario torna `<div class="timeline"
  id="diario-timeline"></div>` (era `.diario-list`/`#diario-list`); la nota sotto il titolo
  "Diario" torna simile all'originale ("una voce a sera" invece di "21 giorni · clicca per
  aprire").

Il resto del Task 4 (tab Programma cliccabile, popup, deep-link via hash, mappa SVG) resta
invariato e già approvato.

## Amendment 2 (Task 4c): ordine cronologico inverso nel Diario

Dopo aver visto la timeline in stile diario, l'utente ha chiesto che i giorni più recenti
compaiano in alto (come un blog/log, non in ordine di partenza) — così quando le voci verranno
aggiunte sera dopo sera, l'ultima scritta resta sempre in cima senza dover scorrere.

Cambiamento: in `app.js`, `renderDiarioTimeline()` deve iterare `days` in ordine decrescente di
`n` invece che crescente (es. `days.slice().reverse().forEach(day => { ... })` invece di
`days.forEach(day => { ... })`), lasciando invariato tutto il resto della funzione. Nessun altro
file cambia.

Nota: i contenuti reali del diario (titolo/paragrafi/foto per ogni giorno) NON vanno scritti in
anticipo in `trip-data.js` — l'utente li aggiungerà lui stesso, un giorno alla volta, quando
glielo chiederà esplicitamente man mano che il viaggio procede. Eventuali dati di prova per
vedere l'aspetto grafico (foto/testo placeholder) sono solo un test visivo temporaneo e non
devono restare nei commit finali.

## Amendment 3 (Task 4d): stamp dentro la card, un unico blocco "a rilievo" per giorno

Dopo un test visivo con foto/testo di prova, l'utente ha chiesto che ogni giorno del Diario sia
un unico blocco rialzato (stesso sfondo parchment, un solo bordo/ombra), non più il timbro
Giorno/Data/Luogo separato sopra una card indipendente. Questo vale sia per i giorni scritti sia
per quelli "non ancora scritto" — ogni giorno ha sempre una card, piena o quasi vuota.

**`app.js`, `renderDiarioTimeline()`:** in entrambi i rami (scritto/non scritto), lo `.stamp`
diventa il primo figlio dentro `.card` invece di un fratello prima di essa:

```js
if (day.diario) {
  // ...costruzione di photostrip e paragraphs invariata...
  article.innerHTML = `
    <div class="card">
      <div class="stamp">
        <span class="day">Giorno ${day.n}</span>
        <span class="date">${label}</span>
        <span class="place">${day.tappa}</span>
      </div>
      ${photostrip}
      <h2>${day.diario.titolo}</h2>
      ${paragraphs}
    </div>
  `;
} else {
  article.innerHTML = `
    <div class="card">
      <div class="stamp">
        <span class="day">Giorno ${day.n}</span>
        <span class="date">${label}</span>
        <span class="place">${day.tappa}</span>
      </div>
      <p class="entry-pending-note">non ancora scritto</p>
    </div>
  `;
}
```

**`style.css`:** lo `.stamp` ora compare SEMPRE su sfondo parchment (sia nel Diario dentro
`.card`, sia nel popup Programma dentro `.modal-body`/`.modal-inner`, che è già parchment —
quest'ultimo era già un difetto di contrasto latente nel Task 4, mai notato perché non
verificato visivamente prima d'ora). Aggiornare le regole esistenti (non aggiungerne di
scoped), sostituendo i colori pensati per lo sfondo scuro con toni "on paper" già definiti:

```css
.stamp .day{
  font-family: var(--mono); font-size: 0.7rem; letter-spacing: 0.1em; text-transform: uppercase;
  color: var(--ink-on-paper-soft); border: 1px solid var(--brass); border-radius: 3px; padding: 3px 8px;
  background: rgba(201,154,68,0.18);
}
.stamp .date{ font-family: var(--mono); font-size: 0.7rem; letter-spacing: 0.05em; color: var(--ink-on-paper-soft); }
.stamp .place{ font-family: var(--mono); font-size: 0.7rem; letter-spacing: 0.05em; color: var(--ink-on-paper-soft); }
.stamp .place::before{ content: "· "; color: var(--ink-on-paper-soft); }
```

(Sostituiscono i valori attuali che usano `var(--brass)` puro per `.day`, `var(--ink-soft)` per
`.date`, `var(--teal)` per `.place` e `var(--ink-faint)` per `.place::before` — quei quattro
erano calibrati per il vecchio sfondo scuro fuori dalla card.)

Anche `.entry-pending-note` va corretta allo stesso modo (era calibrata per sfondo scuro, ora è
sempre dentro `.card` su parchment): cambiare `color: var(--ink-faint)` in
`color: var(--ink-on-paper-soft)`, lasciando invariato il resto della regola.

Nessun altro file cambia. Il markup dell'`.entry` esterno (`<article class="entry">`,
`::before` per il rombo del timeline) resta invariato — solo il contenuto dentro cambia.

## Amendment 4 (Task 4e): sblocco progressivo dei giorni + foto stile polaroid

Due richieste dopo il test visivo con la card unica a rilievo:

**A. Sblocco progressivo.** Il Diario non deve più mostrare tutti i 21 giorni fin da subito
(nemmeno come "non ancora scritto") — deve mostrare solo i giorni fino a un numero che l'utente
comunicherà via chat quando vorrà "sbloccare" il giorno successivo. Per ora si imposta come se
fossimo al giorno 3.

`trip-data.js`: aggiungere una costante in cima al file, prima di `const planBlocks`:
```js
const giornoCorrente = 3; // ultimo giorno "sbloccato" nel Diario — aggiornare su richiesta esplicita dell'utente, un giorno alla volta
```
e aggiungerla al `module.exports` in fondo al file: `module.exports = { days, planBlocks, stops, giornoCorrente };`.

`app.js`, `renderDiarioTimeline()`: filtrare `days` prima di invertire l'ordine, così i giorni
oltre `giornoCorrente` non vengono renderizzati affatto (non esistono nel DOM, non solo nascosti
via CSS):
```js
days.filter(day => day.n <= giornoCorrente).reverse().forEach(day => {
```
(`filter` produce già un array nuovo, quindi `.reverse()` diretto non muta `days`.)

Il tab **Programma** non è toccato da questo filtro: le tappe cliccabili continuano ad aprire il
popup piano/logistica per qualunque giorno, passato o futuro — l'itinerario è noto in anticipo,
solo il diario si sblocca gradualmente.

**B. Foto in stile polaroid.** Le foto nella photostrip diventano più "classiche": cornice
bianca/parchment spessa attorno alla foto (più spessa in basso, come una polaroid vera), foto
quadrata, senza rotazione casuale (dritte in fila). Nessuna didascalia per singola foto (il testo
del diario sotto resta la "descrizione" della giornata) — va quindi rimossa la regola `.photo
.cap` (non più usata) insieme a `.photo svg` (già morta: la renderizzazione dinamica genera solo
`<img>`, mai `<svg>` inline — erano rimaste dalla primissima versione statica del sito).

`app.js`, dentro la costruzione di `photostrip` in `renderDiarioTimeline()`, avvolgere l'`<img>`
in un div `.frame`:
```js
photostrip = `<div class="photostrip">` + day.diario.foto.map((src, i) =>
  `<div class="photo"><div class="frame"><img src="${src}" alt="Foto ${i + 1} — ${day.tappa}" loading="lazy"></div></div>`
).join('') + `</div>`;
```

`style.css`, sostituire il blocco `.photostrip`/`.photo`/`.photo svg`/`.photo img`/`.photo .cap`
esistente con:
```css
.photostrip{
  display:flex; gap: 14px; overflow-x: auto; margin: 2px -4px 18px; padding: 8px 4px;
  scroll-snap-type: x proximity; -webkit-overflow-scrolling: touch;
}
.photostrip::-webkit-scrollbar{ height: 5px; }
.photostrip::-webkit-scrollbar-thumb{ background: var(--parchment-edge); border-radius: 3px; }
.photo{
  flex: 0 0 auto; width: min(62vw, 190px); scroll-snap-align: start;
  background: var(--parchment); padding: 10px 10px 22px; border-radius: 2px;
  box-shadow: 0 2px 0 var(--parchment-edge), 0 10px 20px -12px rgba(0,0,0,0.45);
}
.photo .frame{ width:100%; aspect-ratio: 1 / 1; overflow:hidden; background: var(--parchment-dim); }
.photo .frame img{ width:100%; height:100%; display:block; object-fit: cover; }
```

Nessun altro file cambia.

## Amendment 5 (Task 4f): bordo polaroid bianco puro

Dopo aver visto lo stile polaroid, l'utente ha chiesto più contrasto: il bordo della polaroid
deve essere bianco puro, non il parchment caldo (`#ece3cf`) usato finora.

`style.css`: nella regola `.photo` (introdotta nel Task 4e), cambiare `background:
var(--parchment);` in `background: #fff;`. Nessun'altra proprietà della regola cambia. Nessun
altro file cambia.

## Auto-verifica del piano

- **Copertura spec**: architettura (Task 1-4 coprono i 4 file), modello dati (Task 1), le tre
  viste Diario/Programma/popup (Task 3-4), mappatura contenuti per giorno (Task 1, tabella dello
  spec riprodotta 1:1 nei dati), foto (gestite da `day.diario.foto`, Task 3), verifica (Task 4
  Step 2) sono tutti coperti. La sola deviazione dallo spec originale è popup invece di pagina
  route-based, richiesta esplicitamente dall'utente e annotata nei Global Constraints.
- **Placeholder**: nessuno — ogni step ha codice completo e reale, nessun "TBD" o "simile al
  Task N" lasciato all'implementatore.
- **Coerenza tipi/nomi**: `days`/`planBlocks`/`stops` (Task 1) → stessi nomi e shape usati in
  `app.js` (Task 3) → stessi id DOM (`diario-list`, `day-modal`, `day-modal-body`,
  `modal-close`, `modal-prev`, `modal-next`) usati in `index.html` (Task 4). `data-start-day`
  sulle `.stop` (Task 4) corrisponde a `dayRange[0]` di ogni tappa in `stops` (Task 1):
  1, 3, 5, 9, 10, 11, 12, 21 — verificato a mano contro l'array.
