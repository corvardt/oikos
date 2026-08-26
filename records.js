/* ── records.js ─────────────────────────────────────────────────────────────
   The catalogue. Adding a project is one entry here plus a CNAME; the page
   numbers the channels and counts them itself.

   status — 'live' is on air at its own host, 'building' is on the way, 'local'
   runs on your own machine and is not hosted anywhere. An entry of
   `{ vacant: true }` holds a channel number without a station. */

export const RECORDS = [
  {
    name: 'KERAUNOS',
    etym: 'κεραυνός · the thunderbolt',
    desc: 'Live global lightning strikes, streamed from the Blitzortung network and plotted on a world map as a phosphor instrument.',
    host: 'keraunos.corvardt.com',
    stack: 'react · d3 · websocket',
    status: 'live',
  },
  {
    name: 'NOSTOS',
    etym: 'νόστος · the homecoming',
    desc: 'A media downloader that runs on your own machine. Paste a link, see what it is, queue it. Nothing is sent anywhere but the site you are pulling from.',
    // It is not meant to be hosted, so the address is where the thing actually
    // is: the repository you clone it from.
    host: 'github.com/corvardt/nostos',
    stack: 'python · fastapi · react · yt-dlp',
    status: 'local',
  },
  {
    name: 'TYCHE',
    etym: 'τύχη · fortune, the lot that falls',
    desc: 'Forty random Ethereum keypairs a roll, read against the chain. A free lottery at one in 2^160, played on a contact sheet. Nothing has ever been found and that is most of the point.',
    host: 'tyche.corvardt.com',
    stack: 'react · ethers · etherscan',
    status: 'live',
  },
  {
    name: 'KLEPSYDRA',
    etym: 'κλεψύδρα · the water clock, the allotted time draining',
    desc: 'An always-on desktop card that reads your Claude usage off your own machine: the rolling window, the burn rate, where the block lands. Six hundred lines of plain Python, auditable in one sitting.',
    host: 'github.com/corvardt/klepsydra',
    stack: 'python · gtk4',
    status: 'local',
  },
  {
    name: 'STEROPES',
    etym: 'Στερόπης · the lightning-maker, who forged the bolt',
    desc: 'Random numbers drawn from lightning. The low digits of where a strike landed are solver noise nobody can predict; the page collects them, grades them against four statistical tests in front of you, and deals coins, dice, decks and plates from strikes that have not happened yet.',
    host: 'steropes.corvardt.com',
    stack: 'javascript · websocket · canvas',
    status: 'live',
  },
];
