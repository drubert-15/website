// Team profile (Tērvete Backshots).
const T = TEAM;
const [tname, tabbr] = splitTag(T.title);
$('#team-hero').innerHTML = `
  <div class="wrap">
    <img class="crest" src="${T.logo}" alt="">
    <div>
      <p class="crumb"><a href="index.html">Sākums</a> / <a href="komandas.html">Komandas</a> / ${esc(tabbr)}</p>
      <h1>${esc(tname)}</h1>
      <p class="sub">${esc(T.anno)}</p>
      <span class="div-tag">${esc(T.division)} divīzija · ${esc(tabbr)}</span>
    </div>
  </div>`;

const STAT_NAMES = { GP: 'Spēles', W: 'Uzvaras', OTW: 'Uzv. PL', T: 'Neizšķ.', OTL: 'Zaud. PL', L: 'Zaudējumi', P: 'Punkti', '#ST': 'Vieta' };
const roster = [...T.roster];
let sortKey = 'p', sortDir = -1;
const num = (v) => (v === '-' || v === '' ? -1 : Number(v));

function rosterRows() {
  roster.sort((a, b) => {
    const x = a[sortKey], y = b[sortKey];
    return (['name', 'pos'].includes(sortKey) ? x.localeCompare(y, 'lv') : num(x) - num(y)) * sortDir;
  });
  return roster.map((r) => `
    <tr>
      <td class="num nr">${esc(r.nr)}</td>
      <td><a href="${link(r.url)}"><b>${esc(r.name)}</b></a></td>
      <td class="num"><span class="pos pos-${r.pos}">${esc(r.pos)}</span></td>
      <td class="num">${r.gp}</td><td class="num">${r.g}</td><td class="num">${r.a}</td>
      <td class="pts">${r.p}</td><td class="num">${r.pim}</td>
    </tr>`).join('');
}

$('#team').innerHTML = `
  <div class="statline">
    ${Object.entries(T.stats).map(([k, v]) => `<div class="stat${k === 'P' ? ' hl' : ''}"><b>${esc(v)}</b><span title="${STAT_NAMES[k] || ''}">${esc(k)}</span></div>`).join('')}
  </div>

  <div class="team-layout">
    <div>
      <div class="team-photo"><img src="${T.photo}" alt="${esc(tname)} komanda"></div>

      <div class="section-head"><h2>Statistikas līderi</h2><span class="muted">2026–2027</span></div>
      <div class="leader-cards">
        ${T.leaders.map((l) => `
          <a class="leader-card" href="${link(l.url)}">
            <img src="${l.img}" alt="" loading="lazy">
            <h4>${esc(l.name)}</h4>
            <div class="mini">${l.stats.map(([k, v]) => `<span>${k} <b>${v}</b></span>`).join('')}</div>
          </a>`).join('')}
      </div>

      <div class="section-head"><h2>Komandas sastāvs</h2><span class="muted">${roster.length} spēlētāji</span></div>
      <div class="table-wrap">
        <table class="data" id="roster">
          <thead><tr>
            <th class="num" data-sort="nr">#</th><th data-sort="name">Vārds, uzvārds</th><th class="num" data-sort="pos">Poz.</th>
            <th class="num" data-sort="gp">GP</th><th class="num" data-sort="g">G</th><th class="num" data-sort="a">A</th>
            <th class="num desc" data-sort="p">P</th><th class="num" data-sort="pim">PIM</th>
          </tr></thead>
          <tbody>${rosterRows()}</tbody>
        </table>
      </div>

      <div class="section-head"><h2>Sezonu vēsture</h2></div>
      <div class="table-wrap">
        <table class="data">
          <thead><tr><th>Sezona</th><th class="num">Div.</th>${['GP', 'W', 'OTW', 'T', 'OTL', 'L', 'P'].map((h) => `<th class="num">${h}</th>`).join('')}</tr></thead>
          <tbody>${T.seasons.slice().reverse().map((s) => `<tr><td><b>${s[0]}</b></td><td class="num">${s[1]}</td>${s.slice(2, 8).map((v) => `<td class="num">${v}</td>`).join('')}<td class="pts">${s[8]}</td></tr>`).join('')}</tbody>
        </table>
      </div>
    </div>

    <aside class="col-side">
      <div class="card">
        <div class="card-head"><h3>Par komandu</h3></div>
        <ul class="facts">${T.info.map(([k, v]) => `<li><span>${esc(k)}</span><b>${esc(v)}</b></li>`).join('')}</ul>
      </div>
      <div class="card">
        <div class="card-head"><h3>Formas</h3></div>
        <div class="jerseys">
          <figure><img src="${T.home}" alt="Mājas forma"><figcaption>Mājās</figcaption></figure>
          <figure><img src="${T.away}" alt="Izbraukuma forma"><figcaption>Izbraukumā</figcaption></figure>
        </div>
      </div>
      <a class="btn btn-primary btn-lg" href="kalendars.html">Skatīt kalendāru →</a>
    </aside>
  </div>`;

$('#roster thead').addEventListener('click', (e) => {
  const th = e.target.closest('th[data-sort]'); if (!th) return;
  const k = th.dataset.sort;
  sortDir = k === sortKey ? -sortDir : (['name', 'pos', 'nr'].includes(k) ? 1 : -1);
  sortKey = k;
  $$('#roster th').forEach((x) => x.classList.remove('asc', 'desc'));
  th.classList.add(sortDir > 0 ? 'asc' : 'desc');
  $('#roster tbody').innerHTML = rosterRows();
});
