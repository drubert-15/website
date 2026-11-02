// Game report: scoreboard, MVPs and period-by-period events.
const G = PROT;
const [aName, bName] = G.place[0].split(/\s+vs\s+/i);
const [sa, sb] = G.score.map(Number);
$('#board').innerHTML = `
  <div class="wrap">
    <div class="sb-top"><span><a href="kalendars.html">← Kalendārs</a> · ${esc(G.date)}</span><span>${esc(G.place[1] || '')}</span></div>
    <div class="sb-main">
      <a class="sb-team" href="${link(G.a.url)}"><img src="${G.a.logo}" alt=""><div><h2>${esc(G.a.abbr)}</h2><small>${esc(aName)}</small></div></a>
      <div class="sb-score">
        <div class="digits"><span class="${sa > sb ? 'w' : ''}">${sa}</span><i>:</i><span class="${sb > sa ? 'w' : ''}">${sb}</span></div>
        <small>Gala rezultāts · Divīzija ${esc(G.division)}</small>
      </div>
      <a class="sb-team b" href="${link(G.b.url)}"><img src="${G.b.logo}" alt=""><div><h2>${esc(G.b.abbr)}</h2><small>${esc(bName)}</small></div></a>
    </div>
    <div class="sb-actions">
      <a class="btn btn-dark btn-lg" href="${G.video.replace('/embed/', '/watch?v=')}" target="_blank" rel="noopener">▶ Spēles video</a>
      ${G.posters.map((p, i) => `<a class="btn btn-ghost btn-lg" href="${p}" target="_blank" rel="noopener">Plakāts ${i ? 'pēc' : 'pirms'}</a>`).join('')}
    </div>
  </div>`;

const ICONS = { goal: '🥅', penalty: '⛔', gk_in: '🧤', gk_out: '🧤', tout: '⏱' };
$('#report').innerHTML = `
  <div class="mvps">
    ${[G.a, G.b].map((t) => `
      <div class="mvp-card"><span class="star">★</span><div><small>MVP · ${esc(t.abbr)}</small><b>${esc(t.mvp)}</b></div>
        <div class="sog"><b>${esc(t.sog)}</b><span>METIENI</span></div></div>`).join('')}
  </div>
  <p class="muted" style="margin:-8px 0 22px;color:var(--muted)">🎙 ${esc(G.commentators)}</p>
  <div class="section-head"><h2>Spēles notikumi</h2></div>
  ${G.periods.map((p) => `
    <section class="period">
      <h3>${esc(p.title)}</h3>
      <div class="events">
        ${p.events.map((e) => `
          <div class="event ${e.kind}">
            <span class="t">${esc(e.time)}</span>
            <span class="ic">${ICONS[e.kind] || '•'}</span>
            <span class="tm">${esc(e.team)}</span>
            <div class="what"><small>${esc(e.team)} · ${esc(e.type)}</small>${esc(e.text)}</div>
            ${e.score ? `<span class="sc">${esc(e.score.replace(/\s+/g, ' '))}</span>` : '<span></span>'}
          </div>`).join('')}
      </div>
    </section>`).join('')}`;
