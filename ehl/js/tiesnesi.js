// Referees grid.
$('#hero-sub').textContent = `${REFS.length} tiesneši`;
function render() {
  const q = $('#q').value.trim().toLowerCase();
  const list = REFS.filter((r) => !q || r.name.toLowerCase().includes(q));
  $('#count').innerHTML = `Rāda <b>${list.length}</b> tiesnešus`;
  $('#refs').innerHTML = list.length ? list.map((r) => {
    const [name, tag] = splitTag(r.name);
    const born = r.info.find((l) => l.startsWith('Dzimšanas'))?.split(':')[1]?.trim();
    const exp = r.info.find((l) => l.startsWith('Pieredze'))?.split(':')[1]?.trim();
    return `
      <div class="ref">
        ${tag ? `<span class="no">${esc(tag)}</span>` : ''}
        <img src="${r.img}" alt="" loading="lazy">
        <h3>${esc(name)}</h3>
        ${born ? `<p>Dzimis ${esc(born)}</p>` : ''}
        ${exp ? `<span class="exp">${esc(exp)}</span>` : ''}
      </div>`;
  }).join('') : '<div class="empty">Nekas netika atrasts.</div>';
}
$('#q').addEventListener('input', render);
render();
