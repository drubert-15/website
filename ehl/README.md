# EHL redesign concept

A redesigned copy of [ehl.entuziasti.com](https://ehl.entuziasti.com) (Entuziastu Hokeja Līga).
Open `index.html` in a browser, or serve this folder with any static host.

## Pages

| Page | File |
| --- | --- |
| Sākums | `index.html` |
| Kalendārs | `kalendars.html` |
| Komandas / one team (Tērvete Backshots) | `komandas.html`, `komanda.html` |
| Spēlētāji | `speletaji.html` |
| Brīvie aģenti | `brivie-agenti.html` |
| Jaunumi / one article | `jaunumi.html`, `jaunums.html` |
| Disciplinārā komiteja | `dk.html` |
| Par mums, Nolikumi, Tiesneši, Kontakti | `par-mums.html`, `nolikumi.html`, `tiesnesi.html`, `kontakti.html` |
| Spēles protokols (TRB 8:0 HKP) | `protokols.html` |

## How it's built

- `style.css` – all styles.
- `js/layout.js` – shared scores strip, header, sponsors and footer.
- `js/<page>.js` – renders each page from its data file.
- `data/*.js` – a snapshot of the live site's content (taken 2 Nov 2026). Images load from ehl.entuziasti.com.
- Links to pages that aren't part of this concept go to the live site.

## Refreshing the data

`tools/scrape.py` turns saved pages from the live site into `data/*.js`, and `tools/gen.py` rewrites the HTML skeletons.
