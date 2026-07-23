/* ── records.js ─────────────────────────────────────────────────────────────
   The catalogue. Adding a project is one entry here plus a CNAME; the page
   numbers the channels and counts them itself.

   status — 'live' | 'building'. An entry of `{ vacant: true }` holds a channel
   number without a station, if the catalogue ever wants to show one. */

export const RECORDS = [
  {
    name: 'KERAUNOS',
    etym: 'κεραυνός — the thunderbolt',
    desc: 'Live global lightning strikes, streamed from the Blitzortung network and plotted on a world map as a phosphor instrument.',
    host: 'keraunos.unmod.fun',
    stack: 'react · d3 · websocket',
    status: 'live',
  },
  {
    name: 'NOSTOS',
    etym: 'νόστος — the homecoming',
    desc: 'A media downloader that runs on your own machine. Paste a link, see what it is, queue it — nothing is sent anywhere but the site you are pulling from.',
    // No hosted instance to point at yet: the address is wherever the thing
    // actually is, and today that is the repository.
    host: 'github.com/corvardt/nostos',
    stack: 'python · fastapi · react · yt-dlp',
    status: 'building',
  },
];
