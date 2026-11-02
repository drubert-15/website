// Players: letter filter, search, position filter, paged table.
// PLAYERS rows: [name, pos, team, teamPath, dob, country, personPath]
const PAGE = 60;
let shown = PAGE, letter = '', pos = '';
const first = (n) => n.trim().split(/\s+/).pop()[0]?.toUpperCase() || '';   // surname initial
const fold = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

$('#hero-sub').textContent = `${PLAYERS.length.toLocaleString('lv')} reģistrēti spēlētāji`;
const letters = [...new Set(PLAYERS.map((p) => fold(first(p[0])).toUpperCase()))].filter((l) => /[A-Z]/.test(l)).sort();
$('#letters').innerHTML = `<button class="all on" data-l="">Visi</button>` + letters.map((l) => `<button data-l="${l}">${l}</button>`).join('');

function filtered() {
  const q = fold($('#q').value.trim());
  return PLAYERS.filter((p) => (!letter || fold(first(p[0])).toUpperCase() === letter) && (!pos || p[1] === pos) &&
    (!q || fold(p[0] + ' ' + p[2]).includes(q)));
}

function render() {
  const list = filtered();
  $('#count').innerHTML = `Atrasti <b>${list.length.toLocaleString('lv')}</b> spēlētāji`;
  $('#rows').innerHTML = list.slice(0, shown).map((p) => `
    <tr>
      <td><a href="${SITE + p[6]}"><b>${esc(p[0])}</b></a></td>
      <td class="num"><span class="pos pos-${p[1]}">${esc(p[1])}</span></td>
      <td><a href="${link(p[3])}">${esc(p[2])}</a></td>
      <td>${esc(p[4])}</td>
      <td>${esc(p[5])}</td>
    </tr>`).join('') || '<tr><td colspan="5"><div class="empty">Nav atrasts neviens spēlētājs.</div></td></tr>';
  $('#more').hidden = list.length <= shown;
  $('#more').textContent = `Rādīt vairāk (${(list.length - shown).toLocaleString('lv')})`;
}

$('#letters').addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b) return;
  letter = b.dataset.l; shown = PAGE;
  $$('#letters button').forEach((x) => x.classList.toggle('on', x === b));
  render();
});
$('#pos').addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b) return;
  pos = b.dataset.pos; shown = PAGE;
  $$('#pos button').forEach((x) => x.classList.toggle('on', x === b));
  render();
});
$('#q').addEventListener('input', () => { shown = PAGE; render(); });
$('#more').addEventListener('click', () => { shown += PAGE * 2; render(); });
render();
