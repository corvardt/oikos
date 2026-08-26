/* ── index.js ───────────────────────────────────────────────────────────────
   The tuner. One record is tuned at a time; pointer and keyboard both move it,
   because on this page they mean the same thing. Tuning itself is silent — the
   only motion on the glass is ambient, so a pointer crossing the list cannot
   set anything off. */

import { RECORDS } from './records.js';
import { applyGlass, apply, current, followSystem, glass } from './theme.js';

const list = document.querySelector('.records');
const medium = document.querySelector('[data-medium]');
const cfg = document.getElementById('cfg');
const count = document.querySelector('[data-count]');

// Vacant slots hold a channel number but can never be tuned.
const stations = RECORDS.map((record, i) => ({ ...record, channel: i + 1 }));
const tunable = stations.filter((s) => !s.vacant);

let tuned = 0;

function markup(station) {
  const tag = String(station.channel).padStart(2, '0');
  const ticks = ['tl', 'tr', 'bl', 'br'].map((c) => `<span class="tick ${c}"></span>`).join('');

  if (station.vacant) {
    return `<li><div class="record vacant" data-channel="${station.channel}">
      <span class="channel">${tag}</span>
      <div>
        <span class="name">unassigned</span>
        <p class="desc">The next one goes here.</p>
      </div>
      <span class="state"></span>
    </div></li>`;
  }

  // The index is a place you tune from, not a place you leave: a record opens
  // alongside it rather than replacing it.
  return `<li><a class="record" href="https://${station.host}" data-channel="${station.channel}" target="_blank" rel="noreferrer">
    <span class="channel">${tag}</span>
    <div>
      <span class="name">${station.name}</span><span class="etym">${station.etym}</span>
      <p class="desc">${station.desc}</p>
      <div class="foot">
        <span class="addr">${station.host}</span>
        <span class="label">${station.stack}</span>
      </div>
    </div>
    <span class="state">
      <span class="dot"></span>
      <span class="label">${station.status}</span>
    </span>
    ${ticks}
  </a></li>`;
}

list.innerHTML = stations.map(markup).join('');
const rows = [...list.querySelectorAll('.record:not(.vacant)')];

// `data-status` drives the indicator, so it is set once from the data rather
// than baked into the markup string in two places.
//
// The names also arrive under the decay rule, one channel behind the last, so
// the set reads as locking on rather than as having always been there. The
// class is dropped when the animation ends: the tuned record is on its way to
// white, and letting it get there through its own transition keeps it from
// snapping the moment the decay lets go.
rows.forEach((row, i) => {
  row.dataset.status = tunable[i].status;

  const name = row.querySelector('.name');
  name.style.animationDelay = `${i * 60}ms`;
  name.classList.add('settle');
  name.addEventListener('animationend', () => name.classList.remove('settle'), { once: true });
});

const live = tunable.filter((s) => s.status === 'live').length;
count.textContent = `${stations.length} ${stations.length === 1 ? 'channel' : 'channels'} · ${live} live`;

function tune(next, { focus = false } = {}) {
  const index = (next + rows.length) % rows.length;
  // Tuning by key moves focus with it, so `Enter` always opens what is lit.
  if (focus) rows[index].focus();
  if (index === tuned && rows[tuned].classList.contains('tuned')) return;

  rows.forEach((row) => {
    row.classList.remove('tuned');
    row.removeAttribute('aria-current');
  });
  rows[index].classList.add('tuned');
  rows[index].setAttribute('aria-current', 'true');
  tuned = index;
}

tune(0);

rows.forEach((row, i) => {
  row.addEventListener('pointerenter', () => tune(i));
  row.addEventListener('focus', () => tune(i));
});

// ── Keys ───────────────────────────────────────────────────────────────────
document.addEventListener('keydown', (event) => {
  if (event.metaKey || event.ctrlKey || event.altKey) return;
  // The panel is modal, and Escape is the browser's. Nothing here tunes while
  // it is open, or a reader arrowing between two choices would be moving the
  // list behind them at the same time.
  if (cfg.open) return;
  const key = event.key;

  if (key === 'ArrowDown' || key === 'j') {
    event.preventDefault();
    tune(tuned + 1, { focus: true });
  } else if (key === 'ArrowUp' || key === 'k') {
    event.preventDefault();
    tune(tuned - 1, { focus: true });
  } else if (key === 'Enter') {
    // A focused record opens itself; only act when the tuning is ahead of the
    // focus, which is the case before anything has been tabbed to.
    if (!rows.includes(document.activeElement)) rows[tuned].click();
  } else if (key === 't') {
    setMedium(current() === 'dark' ? 'light' : 'dark');
  } else if (key === 'c') {
    openCfg();
  } else if (/^[1-9]$/.test(key)) {
    // Channel numbers address every slot, so a vacant one is simply ignored.
    const index = rows.findIndex((row) => row.dataset.channel === key);
    if (index !== -1) tune(index, { focus: true });
  }
});

// ── Medium ─────────────────────────────────────────────────────────────────
// The control is named for what it switches to.
function setMedium(theme) {
  apply(theme);
  label(theme);
  markSettings();
}

// A button is named for what it does, not for where it already is, so the
// control carries the medium it would hand you. The visible word has to sit
// inside the accessible name for voice control to reach it, so both are drawn
// from the same one.
function label(theme) {
  const other = theme === 'dark' ? 'light' : 'dark';
  medium.textContent = other;
  medium.setAttribute('aria-label', `switch to ${other}`);
}

label(current());
medium.addEventListener('click', () => setMedium(current() === 'dark' ? 'light' : 'dark'));
followSystem((theme) => {
  label(theme);
  markSettings();
});

// ── Configuration ──────────────────────────────────────────────────────────
//
// The bezel keeps the medium, because it is the one setting a reader comes back
// to; everything else that is set rather than reported is in here. A real
// <dialog>, so the backdrop, Escape and the focus trap are the browser's.

/** Every row says which of its choices is on. */
function markSettings() {
  const mark = (button, on) => {
    button.setAttribute('aria-pressed', String(on));
    button.classList.toggle('glow', on);
  };
  for (const b of cfg.querySelectorAll('[data-medium-choice]')) {
    mark(b, b.dataset.mediumChoice === current());
  }
  for (const b of cfg.querySelectorAll('[data-glass-choice]')) {
    mark(b, b.dataset.glassChoice === (glass(b.dataset.glass) ? 'on' : 'off'));
  }
}

cfg.addEventListener('click', (event) => {
  const pressed = event.target.closest('button');
  if (!pressed) return;
  if (pressed.dataset.mediumChoice) setMedium(pressed.dataset.mediumChoice);
  else if (pressed.dataset.glassChoice) {
    applyGlass(pressed.dataset.glass, pressed.dataset.glassChoice === 'on');
    markSettings();
  } else cfg.close();
});

// Clicking the ground outside the panel dismisses it. The dialog's own box is
// the only thing inside it, so a click that lands on the dialog element itself
// landed on the backdrop.
cfg.addEventListener('mousedown', (event) => {
  if (event.target === cfg) cfg.close();
});

/* The sheet's glass is display:none until the dialog opens, so its sweep and
   its drift start from zero every time. Wound forward to where the page's own
   glass has got to, the pane the reader was already looking at simply carries
   on: the markup is identical, so the animations come back in the same order. */
const pageGlass = document.querySelector('body > .crt');
const sheetGlass = document.getElementById('cfg-glass');

function openCfg() {
  markSettings();
  cfg.showModal();
  const page = pageGlass.getAnimations({ subtree: true });
  sheetGlass.getAnimations({ subtree: true }).forEach((animation, i) => {
    if (page[i]) animation.currentTime = page[i].currentTime;
  });
}

document.getElementById('cfg-open').addEventListener('click', openCfg);
