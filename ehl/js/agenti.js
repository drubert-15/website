// Free agents: role tabs and cards with expandable details.
const ROLES = [['', 'Visi'], ['Laukuma spēlētājs', 'Laukuma spēlētāji'], ['Vārtsargs', 'Vārtsargi'], ['Treneris', 'Treneri']];
let role = '';
const roleClass = (r) => (r === 'Vārtsargs' ? 'goalie' : r === 'Treneris' ? 'coach' : '');
const linkify = (s) => esc(s).replace(/([\w.+-]+@[\w-]+\.[\w.]+)/g, '<a href="mailto:$1">$1</a>');

function render() {
  $('#role').innerHTML = ROLES.map(([r, l]) => {
    const n = r ? AGENTS.filter((a) => a.role === r).length : AGENTS.length;
    return `<button data-r="${r}"${r === role ? ' class="on"' : ''}>${l} · ${n}</button>`;
  }).join('');
  const list = AGENTS.filter((a) => !role || a.role === role);
  $('#count').innerHTML = `Rāda <b>${list.length}</b> aģentus`;
  $('#agents').innerHTML = list.map((a) => `
    <article class="agent">
      <img src="${a.img}" alt="" loading="lazy">
      <div>
        <h3>${esc(a.name)}</h3>
        <span class="role-badge ${roleClass(a.role)}">${esc(a.role)}</span>
        <dl>${a.fields.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd class="${v.length > 140 ? 'clamp' : ''}">${linkify(v)}</dd></div>`).join('')}</dl>
        ${a.fields.some(([, v]) => v.length > 140) ? '<button class="toggle">Rādīt vairāk</button>' : ''}
      </div>
    </article>`).join('');
}
$('#role').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { role = b.dataset.r; render(); } });
$('#agents').addEventListener('click', (e) => {
  const b = e.target.closest('.toggle'); if (!b) return;
  const open = b.textContent === 'Rādīt vairāk';
  $$('dd', b.parentElement).forEach((d) => d.classList.toggle('clamp', !open && d.textContent.length > 140));
  b.textContent = open ? 'Rādīt mazāk' : 'Rādīt vairāk';
});
render();
