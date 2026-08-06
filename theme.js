/* ── theme.js ───────────────────────────────────────────────────────────────
   Two media, not one palette inverted. The choice is written to a cookie on
   `.corvardt.com` rather than localStorage, so it carries from the index to every
   project subdomain: the whole domain behaves as one set, not as several.

   Loaded with `defer`; the medium itself is resolved by the inline script in
   the document head, before first paint, so the tube never flashes on paper. */

const KEY = 'corvardt-theme';

export function store(theme) {
  const domain = location.hostname.endsWith('corvardt.com') ? '; domain=.corvardt.com' : '';
  // One year, root path, so every subdomain reads the same value.
  document.cookie = `${KEY}=${theme}; path=/; max-age=31536000; samesite=lax${domain}`;
}

export function current() {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

/* Every path that changes the medium goes through here, so none of them can
   drift from another. Applied synchronously: anything reading computed style
   must see the new palette on the same frame the label changes.

   A flip used to leave a band of the old medium behind — that was the glass
   splitting the page into layers as its sweep animated, and it is fixed in
   crt.css where the layers are declared, not worked around from here. */
function set(theme) {
  document.documentElement.dataset.theme = theme;
  return theme;
}

/** A medium the reader chose, which is the only kind that is written down. */
export function apply(theme) {
  store(theme);
  return set(theme);
}

/** Follow the system for as long as the reader hasn't expressed a preference. */
export function followSystem(onChange) {
  if (document.cookie.includes(`${KEY}=`)) return;
  const query = matchMedia('(prefers-color-scheme: light)');
  query.addEventListener('change', (event) => {
    onChange?.(set(event.matches ? 'light' : 'dark'));
  });
}
