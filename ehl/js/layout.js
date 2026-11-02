// Shared header, scores strip, sponsors and footer for every EHL page.
// Each page sets <body data-page="..."> and has #site-header / #site-footer placeholders.

const SITE = 'https://ehl.entuziasti.com';
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// Pages that exist in this redesign. Everything else links to the live site.
const LOCAL = [
  ['/jaunumi/olybet-ehl-sadolin-jekabs-livins-s2e04/1926', 'jaunums.html'],
  ['/komandas/tervete-backshots/460', 'komanda.html'],
  ['/protokols/19473', 'protokols.html'],
];
function link(url) {
  const path = String(url || '').replace(SITE, '').split('?')[0];
  const hit = LOCAL.find(([p]) => path === p || path.startsWith(p + '/'));
  return hit ? hit[1] : (path.startsWith('/') ? SITE + path : url);
}

const NAV = [
  ['kalendars', 'Kalendārs'], ['komandas', 'Komandas'], ['speletaji', 'Spēlētāji'],
  ['brivie-agenti', 'Brīvie aģenti'], ['jaunumi', 'Jaunumi'], ['dk', 'DK'], ['par-mums', 'Par mums'],
];
// Sub-pages that light up a main nav item.
const NAV_PARENT = { komanda: 'komandas', jaunums: 'jaunumi', protokols: 'kalendars', nolikumi: 'par-mums', tiesnesi: 'par-mums', kontakti: 'par-mums' };

const DIVISIONS = [['EE', 396], ['E2', 397], ['E3', 398], ['E4', 399], ['E5', 400], ['E6', 401], ['E7', 402], ['E8', 403], ['E9', 404], ['E10', 405]];

const CONTACTS = [
  { title: 'Organizatoriskie jautājumi', people: [
    ['Jānis Puriņš', 'Finanses un organizācija', '27033996', 'janis@entuziasti.lv'],
    ['Roberts Pļāvējs', 'Reklāma, mārketings un organizācija', '28881115', 'roberts@entuziasti.lv'],
    ['Haralds Apinis', 'Dizains un organizācija', '29359757', 'haralds@entuziasti.lv'],
  ] },
  { title: 'Galvenais tiesnesis', people: [
    ['Ainārs Bitens', 'Turnīra tehniskā organizācija un kalendārs', '29285886', 'ainars@entuziasti.lv'],
  ] },
  { title: 'Foto un video', people: [
    ['Kristaps Mozgirs', 'Mājaslapa, foto/video, organizācija', '26399495', 'kristaps@entuziasti.lv'],
    ['Kristers Sakne', 'Statistika, mājaslapa, organizācija', '29636899', 'kristers@entuziasti.lv'],
  ] },
  { title: 'Disciplinārā komiteja', people: [
    ['Artūrs Folkmanis', 'DK vadītājs, komentētāju organizācija', '28357768', 'dk@entuziasti.lv'],
    ['Kristians Markevics', 'Sastāvu un spēlētāju atbilstība divīzijām', '26397117', 'km@entuziasti.lv'],
  ] },
];

const SPONSORS = [
  [1, 'https://olybetsportsbar.lv/', 'OlyBet Sports Bar'], [28, 'https://erstfinance.com/lv', 'ERST Finance'],
  [2, 'https://www.redbull.com/lv-lv/', 'Red Bull'], [3, 'https://isostar.lv/', 'Isostar'],
  [4, 'https://www.hokejam.lv/', 'Hokejam.lv'], [7, 'https://www.facebook.com/SliduDarbnica/', 'Slidu darbnīca'],
  [9, 'http://www.knockout.lv/', 'Knockout'], [10, 'http://www.kalejudarbnica.lv/', 'Kalēju darbnīca'],
  [11, 'https://lhf.lv/lv', 'LHF'], [12, 'http://www.kvikworks.lv/', 'Kvikworks'],
  [13, null, 'XPRO'], [15, 'https://rocketgrip.eu/', 'Rocket Grip'],
  [16, 'http://iceonfire.eu/', 'Ice on Fire'], [26, 'https://www.ihskola.lv/lv/', 'IHS'],
  [34, 'https://www.cansportswear.com', 'CAN'], [41, 'http://www.volvoledus.lv/lv', 'Volvo Sporta centrs'],
  [36, 'https://trofeja.lv/', 'Trofeja'], [40, 'https://www.3s.lv', '3S'],
  [35, 'https://www.esmilukafiju.lv/', 'Es mīlu kafiju'], [39, 'https://woodmill.lv/en/home/', 'Woodmill'],
];

const ICON = {
  video: '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>',
  file: '<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zm-1 7V3.5L18.5 9zM8 13h8v2H8zm0 4h8v2H8z"/></svg>',
  fb: '<svg viewBox="0 0 24 24"><path d="M14 8h3V4h-3c-2.8 0-4 1.8-4 4v2H7v4h3v8h4v-8h3l1-4h-4V8.5c0-.3.2-.5.5-.5Z"/></svg>',
  ig: '<svg viewBox="0 0 24 24"><path d="M12 7.5A4.5 4.5 0 1 0 12 16.5 4.5 4.5 0 0 0 12 7.5Zm0 7.4a2.9 2.9 0 1 1 0-5.8 2.9 2.9 0 0 1 0 5.8ZM17 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2ZM16.5 2h-9A5.5 5.5 0 0 0 2 7.5v9A5.5 5.5 0 0 0 7.5 22h9a5.5 5.5 0 0 0 5.5-5.5v-9A5.5 5.5 0 0 0 16.5 2Zm3.6 14.5a3.6 3.6 0 0 1-3.6 3.6h-9a3.6 3.6 0 0 1-3.6-3.6v-9a3.6 3.6 0 0 1 3.6-3.6h9a3.6 3.6 0 0 1 3.6 3.6Z"/></svg>',
  x: '<svg viewBox="0 0 24 24"><path d="M17.8 3h3.1l-6.8 7.7L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.3-8.3L2 3h6.4l4.4 5.8Zm-1.1 16.2h1.7L7.4 4.7H5.6Z"/></svg>',
  yt: '<svg viewBox="0 0 24 24"><path d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12a31 31 0 0 0 .5 4.8 3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.8 31 31 0 0 0-.5-4.8ZM9.8 15V9l5.8 3Z"/></svg>',
};

const page = document.body.dataset.page || 'home';
const activeNav = NAV_PARENT[page] || page;

// ---------- header ----------
$('#site-header').outerHTML = `
  <section class="scores" aria-label="Spēles">
    <button class="scores-btn prev" aria-label="Iepriekšējās">‹</button>
    <div class="scores-track" id="scores"></div>
    <button class="scores-btn next" aria-label="Nākamās">›</button>
  </section>
  <header class="header">
    <div class="wrap header-inner">
      <a class="brand" href="index.html">
        <img src="${SITE}/media/site/img/logo.png" alt="" width="22" height="48">
        <span><b>EHL</b><small>Entuziastu Hokeja Līga</small></span>
      </a>
      <nav class="nav" id="nav">
        ${NAV.map(([p, label]) => `<a href="${p}.html"${p === activeNav ? ' class="on" aria-current="page"' : ''}>${label}</a>`).join('')}
      </nav>
      <div class="header-actions">
        <div class="lang"><a class="on" href="#">LV</a><a href="#">EN</a><a href="#">RU</a></div>
        <a class="btn btn-ghost" href="${SITE}/ielogoties">Ieiet</a>
        <a class="btn btn-primary" href="${SITE}/registracija">Reģistrēties</a>
        <button class="menu-btn" id="menuBtn" aria-label="Izvēlne" aria-expanded="false"><span></span></button>
      </div>
    </div>
  </header>
  <div class="divisions-bar">
    <div class="wrap divisions" aria-label="Divīzijas">
      <span class="div-label">Divīzijas</span>
      <div class="chips">
        ${DIVISIONS.map(([n, id]) => `<a class="chip" href="${SITE}/switch/division/${id}">${n}</a>`).join('')}
        <a class="chip vet" href="https://vet.entuziasti.com/">VET</a>
      </div>
      <label class="season"><span>Sezona</span>
        <select><option>2026–2027</option><option>2025–2026</option><option>2024–2025</option><option>2023–2024</option></select>
      </label>
    </div>
  </div>`;

// ---------- scores strip ----------
const track = $('#scores');
track.innerHTML = EHL.days.map((d) => `
  <div class="day"><small>${d.month}</small><b>${d.day}</b></div>
  ${d.games.map((g) => {
    const done = g.teams.every((t) => t.score !== null);
    return `<a class="game" href="kalendars.html"${done ? ' data-done="1"' : ''}>
      <div class="game-meta"><span class="${done ? 'final' : 'live'}">${done ? 'Gala' : esc(g.time)}</span><span class="loc">${esc(g.loc)}</span></div>
      ${g.teams.map((t) => `
        <div class="team-row${t.win ? ' win' : ''}">
          <img src="${t.logo}" alt="" loading="lazy">${esc(t.abbr)}
          <span class="score">${t.score ?? ''}</span>
        </div>`).join('')}
    </a>`;
  }).join('')}`).join('');

// Open the strip on the first day that still has games to play.
function jumpToUpcoming() {
  const game = $$('.game', track).find((g) => !g.dataset.done);
  if (!game) return;
  let day = game.previousElementSibling;
  while (day && !day.classList.contains('day')) day = day.previousElementSibling;
  const target = day || game;
  track.scrollLeft = target.offsetLeft - track.firstElementChild.offsetLeft;
}
jumpToUpcoming();
addEventListener('load', jumpToUpcoming);
$$('.scores-btn').forEach((b) => b.addEventListener('click', () =>
  track.scrollBy({ left: (b.classList.contains('next') ? 1 : -1) * track.clientWidth * 0.8, behavior: 'smooth' })));

// ---------- mobile menu ----------
$('#menuBtn').addEventListener('click', (e) => {
  const open = $('#nav').classList.toggle('open');
  e.currentTarget.setAttribute('aria-expanded', open);
});

// ---------- footer ----------
$('#site-footer').outerHTML = `
  <section class="sponsors">
    <div class="wrap">
      <h2>Entuziastus atbalsta</h2>
      <div class="sponsor-grid">
        ${SPONSORS.map(([id, url, name]) => {
          const img = `<img src="${SITE}/uploads/supporters/large/supporters_${id}.png" alt="${esc(name)}">`;
          return url ? `<a href="${url}" target="_blank" rel="noopener" title="${esc(name)}">${img}</a>` : `<a title="${esc(name)}">${img}</a>`;
        }).join('')}
      </div>
    </div>
  </section>
  <section class="footer-band">
    <div class="wrap">
      <img src="${SITE}/media/site/img/footer-logo.png" alt="Entuziasti" width="283" height="66">
      <div class="follow">Seko Entuziastiem!
        <div class="social">
          <a href="https://www.facebook.com/entuziasti" aria-label="Facebook">${ICON.fb}</a>
          <a href="https://instagram.com/entuziasti" aria-label="Instagram">${ICON.ig}</a>
          <a href="https://twitter.com/entuziasti" aria-label="X">${ICON.x}</a>
          <a href="https://www.youtube.com/channel/UCvcs2uW9u0t9vL-H_GuDFUQ" aria-label="YouTube">${ICON.yt}</a>
        </div>
      </div>
    </div>
  </section>
  <footer class="footer">
    <div class="wrap">
      <div class="contacts">
        ${CONTACTS.map((g) => `
          <div><h4>${g.title}</h4>
            ${g.people.map(([name, role, tel, mail]) => `
              <div class="person"><b>${name}</b><span class="role">${role}</span>
                <div class="links"><a href="tel:+371${tel}">${tel}</a><a href="mailto:${mail}">${mail}</a></div>
              </div>`).join('')}
          </div>`).join('')}
      </div>
      <div class="footer-bottom">
        <span>© ${new Date().getFullYear()} Entuziasti · Entuziastu Hokeja Līga</span>
        <nav><a href="par-mums.html">Par mums</a><a href="nolikumi.html">Nolikumi</a><a href="kontakti.html">Kontakti</a><a href="${SITE}/datu-apstrade">Datu apstrāde</a></nav>
      </div>
    </div>
  </footer>`;

// ---------- shared helpers for pages ----------

// Sub-navigation for the "Par mums" group, rendered into any .subnav[data-group="about"].
$$('.subnav[data-group="about"]').forEach((el) => {
  el.innerHTML = [['par-mums', 'Par mums'], ['nolikumi', 'Nolikumi'], ['tiesnesi', 'Tiesneši'], ['kontakti', 'Kontakti']]
    .map(([p, l]) => `<a href="${p}.html"${p === page ? ' class="on"' : ''}>${l}</a>`).join('');
});

// Leaders card used on several pages (data from live.js).
function leadersCard() {
  return `
    <div class="card leaders">
      <div class="card-head"><h3>Rezultativitātes līderi</h3></div>
      <div class="tabs-wrap"><div class="tabs" role="tablist">
        <button role="tab" class="on" data-tab="teams">Komandas</button>
        <button role="tab" data-tab="players">Spēlētāji</button>
      </div></div>
      <ol class="rank" data-list="teams">
        <li class="rank-head"><span></span><span>Komanda</span><span class="gp">GP</span><span>P</span></li>
        ${EHL.teams.map((t) => `<li><img src="${t.logo}" alt="" loading="lazy"><span>${esc(t.abbr)}</span><span class="gp">${t.gp}</span><span class="pts">${t.p}</span></li>`).join('')}
      </ol>
      <ol class="rank" data-list="players" hidden>
        <li class="rank-head"><span></span><span>Spēlētājs</span><span></span><span>P</span></li>
        ${EHL.players.map((p) => `<li><img class="${p.img.includes('/player/') ? 'avatar' : ''}" src="${p.img}" alt="" loading="lazy"><span>${esc(p.name)}</span><span></span><span class="pts">${p.p}</span></li>`).join('')}
      </ol>
    </div>`;
}
document.addEventListener('click', (e) => {
  const b = e.target.closest('.leaders .tabs button');
  if (!b) return;
  const card = b.closest('.leaders');
  $$('.tabs button', card).forEach((x) => x.classList.toggle('on', x === b));
  $$('.rank', card).forEach((l) => { l.hidden = l.dataset.list !== b.dataset.tab; });
});

// Turn "Name (TAG)" into [name, tag].
const splitTag = (s) => { const m = String(s).match(/^(.*?)\s*\(([^)]+)\)\s*$/); return m ? [m[1], m[2]] : [s, '']; };

// "DISCIPLINĀRĀ KOMITEJA (S16) - HULIGAN (29.10.2026)" -> { team: 'HULIGAN', date: '29.10.2026', season: 'S16' }
function parseDK(title) {
  const m = String(title).match(/\((S\d+)\)\s*[-–]\s*(.*?)\s*\((\d{1,2}\.\d{1,2}\.\d{4})\)/);
  return m ? { season: m[1], team: m[2], date: m[3] } : { season: '', team: title, date: '' };
}

// Shared <head> bits are in each HTML file; this sets the footer year etc. Nothing else to do.
