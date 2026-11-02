// About page.
const tmp = document.createElement('div');
tmp.innerHTML = ABOUT.about.html;
const statement = tmp.textContent.trim();
const players = TEAMS.reduce((s, t) => s + (Number(t.players) || 0), 0);

$('#about').innerHTML = `
  <div class="about-hero">
    <img src="${ABOUT.about.img}" alt="EHL spēle">
    <blockquote>${esc(statement).replace('lielākā, modernākā un visplašāk pazīstamā', '<em>lielākā, modernākā un visplašāk pazīstamā</em>')}</blockquote>
  </div>
  <div class="numbers">
    <div class="number"><b>16</b><span>sezona</span></div>
    <div class="number"><b>${TEAMS.length}</b><span>komandas</span></div>
    <div class="number"><b>${players.toLocaleString('lv')}</b><span>spēlētāji komandās</span></div>
    <div class="number"><b>11</b><span>divīzijas (EE–E10 + VET)</span></div>
  </div>
  <div class="quick">
    <a href="nolikumi.html">Nolikumi</a>
    <a href="tiesnesi.html">Tiesneši</a>
    <a href="kontakti.html">Kontakti</a>
  </div>`;
