// News: featured story plus a searchable grid.
const big = (u) => u.replace('/px205/', '/px830/');
const [top1, ...others] = NEWS;
const feat = $('#feature');
feat.href = link(top1.url);
feat.innerHTML = `
  <img src="${big(top1.img)}" alt="">
  <span class="play" aria-hidden="true"></span>
  <div class="feature-body">
    <span class="tag">Jaunākais</span>
    <h2>${esc(top1.title)}</h2>
    <p>${esc(top1.text)}</p>
  </div>`;

function render() {
  const q = $('#q').value.trim().toLowerCase();
  const list = others.filter((n) => !q || (n.title + ' ' + n.text).toLowerCase().includes(q));
  $('#count').innerHTML = `Rāda <b>${list.length}</b> jaunumus`;
  $('#news').innerHTML = list.length ? list.map((n) => `
    <a class="news-card" href="${link(n.url)}">
      <div class="thumb"><img src="${big(n.img)}" alt="" loading="lazy"></div>
      <div class="body"><h3>${esc(n.title)}</h3><p>${esc(n.text)}</p></div>
    </a>`).join('') : '<div class="empty">Nekas netika atrasts.</div>';
}
$('#q').addEventListener('input', render);
render();
