// Disciplinary committee decisions.
function render() {
  const q = $('#q').value.trim().toLowerCase();
  const list = DKLIST.map((d) => ({ ...d, ...parseDK(d.title) }))
    .filter((d) => !q || (d.team + ' ' + d.text).toLowerCase().includes(q));
  $('#count').innerHTML = `Rāda <b>${list.length}</b> lēmumus`;
  $('#dk').innerHTML = list.length ? list.map((d) => `
    <a class="dk-item" href="${link(d.url)}">
      <img src="${d.img}" alt="" loading="lazy">
      <div><h3>${esc(d.team)}</h3><p>${esc(d.text)}</p></div>
      <span class="badge">${esc(d.date)}</span>
    </a>`).join('') : '<div class="empty">Nekas netika atrasts.</div>';
}
$('#q').addEventListener('input', render);
render();
