/* ── index.js ───────────────────────────────────────────────────────────────
   The tuner. One record is tuned at a time; pointer and keyboard both move it,
   because on this page they mean the same thing. Tuning itself is silent — the
   only motion on the glass is ambient, so a pointer crossing the list cannot
   set anything off. */

import { RECORDS } from './records.js';
import { apply, current, followSystem } from './theme.js';

const list = document.querySelector('.records');
const medium = document.querySelector('[data-medium]');
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
rows.forEach((row, i) => {
  row.dataset.status = tunable[i].status;
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
  } else if (/^[1-9]$/.test(key)) {
    // Channel numbers address every slot, so a vacant one is simply ignored.
    const index = rows.findIndex((row) => row.dataset.channel === key);
    if (index !== -1) tune(index, { focus: true });
  }
});

// ── Medium ─────────────────────────────────────────────────────────────────
// The control is named for what it switches to, not for "light" and "dark".
function setMedium(theme) {
  apply(theme);
  label(theme);
}

function label(theme) {
  medium.textContent = theme === 'dark' ? 'tube' : 'paper';
  medium.setAttribute('aria-label', `switch to ${theme === 'dark' ? 'paper' : 'tube'}`);
}

label(current());
medium.addEventListener('click', () => setMedium(current() === 'dark' ? 'light' : 'dark'));
followSystem(label);
