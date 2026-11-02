// Calendar: day picker, filters and game list.
const WD = { 'Pirmdiena': 'P', 'Otrdiena': 'O', 'Trešdiena': 'T', 'Ceturtdiena': 'C', 'Piektdiena': 'Pk', 'Sestdiena': 'S', 'Svētdiena': 'Sv' };
const MON = ['jan', 'feb', 'mar', 'apr', 'mai', 'jūn', 'jūl', 'aug', 'sep', 'okt', 'nov', 'dec'];
const today = new Date().toISOString().slice(0, 10);

// Start on today if we have it, otherwise the first day with unplayed games.
let current = (CAL.find((d) => d.date === today) || CAL.find((d) => d.games.some((g) => !g.score)) || CAL[0]).date;
const f = { div: '', arena: '', team: '' };

const uniq = (a) => [...new Set(a)].sort((x, y) => x.localeCompare(y, 'lv', { numeric: true }));
const all = CAL.flatMap((d) => d.games);
$('#f-div').insertAdjacentHTML('beforeend', uniq(all.map((g) => g.div)).map((d) => `<option>${d}</option>`).join(''));
$('#f-arena').insertAdjacentHTML('beforeend', uniq(all.map((g) => g.arena)).map((a) => `<option>${esc(a)}</option>`).join(''));

function matches(g) {
  const q = f.team.toLowerCase();
  return (!f.div || g.div === f.div) && (!f.arena || g.arena === f.arena) &&
    (!q || [g.home.abbr, g.home.name, g.away.abbr, g.away.name].some((s) => s.toLowerCase().includes(q)));
}

function renderDays() {
  $('#days').innerHTML = CAL.map((d) => {
    const [, m, day] = d.date.split('-').map(Number);
    const n = d.games.filter(matches).length;
    return `<button class="day-pill${d.date === current ? ' on' : ''}${d.date === today ? ' today' : ''}" data-date="${d.date}">
      <small>${WD[d.weekday] || d.weekday.slice(0, 2)}</small><b>${day}</b><span>${MON[m - 1]} · ${n}</span>
    </button>`;
  }).join('');
  const on = $('#days .on'), row = $('#days');
  if (on) row.scrollLeft = on.offsetLeft - row.offsetLeft - (row.clientWidth - on.offsetWidth) / 2;
}

function team(t, side) {
  return `<a class="game-team ${side}" href="${link(t.url)}">
    <img src="${t.logo}" alt="" loading="lazy">
    <span><b>${esc(t.abbr)}</b><small>${esc(t.name)}</small></span>
  </a>`;
}

function renderGames() {
  const day = CAL.find((d) => d.date === current);
  const games = day.games.filter(matches);
  $('#day-title').innerHTML = `<h2>${esc(day.weekday)}, ${esc(day.label)}</h2><span>${games.length} spēles</span>`;
  $('#count').innerHTML = `Šajā dienā: <b>${games.length}</b> no ${day.games.length}`;
  $('#games').innerHTML = games.length ? games.map((g) => `
    <div class="game-row">
      <div class="time">${esc(g.time)}<small>${esc(g.div)} · ${esc(g.arena)}</small></div>
      ${team(g.home, 'home')}
      <div class="result ${g.score ? 'final' : 'vs'}">${g.score ? esc(g.score).replace(':', ' : ') : 'VS'}</div>
      ${team(g.away, 'away')}
      <span class="div-badge">${esc(g.div)}</span>
      <span class="arena">${esc(g.arena)}</span>
      <div class="actions">
        ${g.video ? `<a class="icon-btn" href="${g.video.replace('/embed/', '/watch?v=')}" target="_blank" rel="noopener" title="Video">${ICON.video}</a>` : ''}
        ${g.protocol ? `<a class="icon-btn" href="${link('/protokols/' + g.protocol)}" title="Protokols">${ICON.file}</a>` : ''}
      </div>
    </div>`).join('') : '<div class="empty">Šajā dienā nav spēļu ar šiem filtriem.</div>';
}

$('#days').addEventListener('click', (e) => {
  const b = e.target.closest('.day-pill');
  if (!b) return;
  current = b.dataset.date;
  $$('.day-pill').forEach((x) => x.classList.toggle('on', x === b));
  renderGames();
});
$('#f-div').addEventListener('change', (e) => { f.div = e.target.value; renderDays(); renderGames(); });
$('#f-arena').addEventListener('change', (e) => { f.arena = e.target.value; renderDays(); renderGames(); });
$('#f-team').addEventListener('input', (e) => { f.team = e.target.value.trim(); renderDays(); renderGames(); });

renderDays();
renderGames();
