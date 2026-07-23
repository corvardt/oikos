# Oikos

οἶκος — the household.

The index at [unmod.fun](https://unmod.fun), and the place the projects live.
A short body of work is not a grid of cards — it is a set of channels you tune
between, so the page is one tube and each project is a station on it. Only the
tuned record is allowed to reach white.

No build, no dependencies. Four static files and a font.

## Running

```sh
python3 -m http.server 4173
```

Then open `http://localhost:4173`. The modules are loaded as ES modules, so it
has to be served — opening `index.html` from disk will not work.

## Using it

| | |
| --- | --- |
| **Point** | Hovering a record tunes it; the row lights, its corner ticks appear, and the vertical hold slips as the set relocks |
| **Keys** | `↑` `↓` or `j` `k` tune · `1`–`9` jump to a channel · `↵` open · `t` switch medium |
| **Medium** | `tube` is phosphor on black, `paper` is ink on chart stock. The choice is a cookie on `.unmod.fun`, so it carries to every project subdomain |

## Adding a project

One entry in `records.js` and a DNS record. The page numbers the channels and
counts them itself.

```js
{
  name: 'NAME',
  etym: 'ἔτυμον — what it means',
  desc: 'Two lines at most. What it does, not why it matters.',
  host: 'name.unmod.fun',
  stack: 'react · d3 · websocket',
  status: 'live',          // or 'building'
}
```

An entry of `{ vacant: true }` holds a channel number without a station, if a
placeholder is ever wanted. The catalogue currently runs without one.

## Layout

| Path | Role |
| --- | --- |
| `crt.css` | The shared medium: both palettes, the glass, the decay rule, the corner ticks. Carried verbatim from Keraunos and meant to be copied into each project unchanged |
| `index.css` | This page only — the operator, the tuner, the records |
| `portrait.jpg` | The operator's plate, composited into whichever medium is on |
| `records.js` | The catalogue |
| `index.js` | Renders the records and runs the tuning |
| `theme.js` | Medium selection, stored domain-wide |

## Notes

The palette, the glass and the decay rule are lifted from Keraunos rather than
re-derived, so the index and the projects cannot drift apart. If a token
changes there, it changes here.

White is reserved. In `tube` it belongs to the record you are on, and nothing
else in the interface is allowed to reach it; in `paper` black takes over that
role. The whole page is otherwise built out of `dim`, `land` and `text`.

The medium is resolved by an inline script in the head, before first paint, so
the tube never flashes on paper. It reads a cookie scoped to `.unmod.fun`
rather than `localStorage`, which is per-origin and would not survive the jump
to a subdomain. Keraunos needs a matching fallback in its own head script for
the handoff to work in both directions — it currently reads
`keraunos-theme`/`lightning-theme` out of `localStorage`.

The portrait is composited rather than pasted on: screened on the tube, so the
black plate falls away and the figure reads as emitted light; inverted and
multiplied on paper, so it reads as ink in the stock. It is held just below the
interface white, which belongs to the tuned record.

Everything animated is switched off under `prefers-reduced-motion`.

## Deploying

Cloudflare Pages, one project per host: this repo on the apex, each project on
its own subdomain, with a wildcard `CNAME` so a new station is a record in
`records.js` and nothing else. There is no build step here — point Pages at the
repo root with an empty build command.
