# Oikos

οἶκος — the household.

The index at [corvardt.com](https://corvardt.com), and the place the projects live.
A short body of work is not a grid of cards — it is a set of channels you tune
between, so the page is one tube and each project is a station on it. Only the
tuned record is allowed to reach white.

No build, no dependencies, nothing fetched from anyone else. Static files and a
typeface served from the same origin as the page.

## Running

```sh
python3 -m http.server 4173
```

Then open `http://localhost:4173`. The modules are loaded as ES modules, so it
has to be served — opening `index.html` from disk will not work.

## Using it

| | |
| --- | --- |
| **Point** | Hovering a record tunes it: the row lights and its corner ticks appear. Tuning is silent — the only motion on the glass is ambient, so running the pointer down the list sets nothing off |
| **Keys** | `↑` `↓` or `j` `k` tune · `1`–`9` jump to a channel · `↵` open · `t` switch medium |
| **Medium** | `dark` is phosphor on black, `light` is ink on chart stock. The choice is a cookie on `.corvardt.com`, so it carries to every project subdomain |

## Adding a project

One entry in `records.js`, a DNS record, and `python3 og.py`. The page numbers
the channels and counts them itself.

```js
{
  name: 'NAME',
  etym: 'ἔτυμον — what it means',
  desc: 'Two lines at most. What it does, not why it matters.',
  host: 'name.corvardt.com',
  stack: 'react · d3 · websocket',
  status: 'live',
}
```

| status | | indicator |
| --- | --- | --- |
| `live` | on air at its own host | filled dot, white when tuned |
| `building` | on the way | hollow ring |
| `local` | runs on your own machine, not hosted | square, since the round indicator belongs to what is being received |

A `local` record points at wherever it actually is — usually its repository —
rather than at a subdomain that would never answer.

An entry of `{ vacant: true }` holds a channel number without a station, if a
placeholder is ever wanted. The catalogue currently runs without one.

## Layout

| Path | Role |
| --- | --- |
| `crt.css` | The shared medium: the typeface, both palettes, the glass, the decay rule, the corner ticks. Carried verbatim from Keraunos and meant to be copied into each project unchanged, with `fonts/` alongside it |
| `fonts/` | IBM Plex Mono, three weights, latin and latin-ext |
| `index.css` | This page only — the operator, the tuner, the records |
| `portrait.jpg` | The operator's plate, composited into whichever medium is on |
| `records.js` | The catalogue |
| `og.py` | Draws `og.png`, the card the index unfurls as. Run by hand, not a build step |
| `og.png` | 1200×630, committed. Regenerate it whenever the catalogue changes |
| `index.js` | Renders the records and runs the tuning |
| `theme.js` | Medium selection, stored domain-wide |

## Notes

The palette, the glass and the decay rule are lifted from Keraunos rather than
re-derived, so the index and the projects cannot drift apart. If a token
changes there, it changes here.

White is reserved. In `dark` it belongs to the record you are on, and nothing
else in the interface is allowed to reach it; in `light` black takes over that
role. The whole page is otherwise built out of `dim`, `land` and `text`.

The medium is resolved by an inline script in the head, before first paint, so
the tube never flashes on paper. It reads a cookie scoped to `.corvardt.com`
rather than `localStorage`, which is per-origin and would not survive the jump
to a subdomain. The cookie is named `corvardt-theme`; each project needs a
matching read in its own head script for the handoff to work in both
directions — Keraunos currently reads `keraunos-theme`/`lightning-theme` out of
`localStorage`.

The portrait is composited rather than pasted on: screened on the tube, so the
black plate falls away and the figure reads as emitted light; inverted and
multiplied on paper, so it reads as ink in the stock. It is held just below the
interface white, which belongs to the tuned record.

The typeface is served from this origin. A page whose creed line is about
keeping control of your own data should not hand every visitor's IP to Google
for a font, and the self-hosted files also drop two preconnects and a
render-blocking third-party stylesheet from the head. Plex Mono ships no Greek
subset, so the etymologies render in the system mono — as they always did, via
Google or not.

The unfurl card is drawn from `records.js` rather than maintained beside it, so
it cannot advertise a station the page does not have. It is the only thing here
that needs a dependency (Pillow), which is why it runs on your machine and
commits its output instead of running at deploy: visitors get a PNG, and the
repo keeps its promise of no build. The card lists at most four stations and
tightens its rows as they are added, dropping the stack lines rather than
letting them print through each other; past four, the tally carries the rest.

Everything animated is switched off under `prefers-reduced-motion`. Nothing is
animated in response to tuning: a pointer crossing the list would fire that on
every row it passed, which read as a stutter rather than as an instrument.

## Deploying

Cloudflare Pages, one project per host: this repo on the apex, each project on
its own subdomain, with a wildcard `CNAME` so a new station is a record in
`records.js` and nothing else. There is no build step here — point Pages at the
repo root with an empty build command.
