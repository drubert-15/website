// Teams: searchable, sortable card grid.
$('#hero-sub').textContent = `${TEAMS.length} komandas · sezona 2026–2027`;
const rinks = [...new Set(TEAMS.map((t) => t.rink).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'lv'));
$('#rink').insertAdjacentHTML('beforeend', rinks.map((r) => `<option>${esc(r)}</option>`).join(''));

const SORTS = {
  name: (a, b) => a.name.localeCompare(b.name, 'lv', { numeric: true }),
  seasons: (a, b) => b.seasons - a.seasons,
  players: (a, b) => b.players - a.players,
  founded: (a, b) => b.founded - a.founded,
};

function render() {
  const q = $('#q').value.trim().toLowerCase();
  const rink = $('#rink').value;
  const list = TEAMS.filter((t) => (!rink || t.rink === rink) && (!q || (t.name + ' ' + t.coach).toLowerCase().includes(q)))
    .sort(SORTS[$('#sort').value]);
  $('#count').innerHTML = `Atrastas <b>${list.length}</b> komandas`;
  $('#teams').innerHTML = list.length ? list.map((t) => `
    <a class="team-card" href="${link(t.url)}">
      <div class="photo"><img src="${t.photo}" alt="" loading="lazy"></div>
      <img class="logo" src="${t.logo}" alt="" loading="lazy">
      <div class="info">
        <h3>${esc(t.name)}</h3>
        <div class="team-facts">
          <div><b>${esc(t.founded)}</b><span>Dibināta</span></div>
          <div><b>${esc(t.seasons)}</b><span>Sezonas</span></div>
          <div><b>${esc(t.players)}</b><span>Spēlētāji</span></div>
        </div>
        <div class="team-meta">
          <span>Treneris: <b>${esc(t.coach || '—')}</b></span>
          <span>Mājas ledus: <b>${esc(t.rink || '—')}</b></span>
        </div>
      </div>
    </a>`).join('') : '<div class="empty">Nav atrasta neviena komanda.</div>';
}
['#q', '#rink', '#sort'].forEach((s) => $(s).addEventListener('input', render));
render();
