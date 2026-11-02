// Home page: featured video, latest news, DK decisions, leaders.
const IMG = (slug, size = 'px205') => `${SITE}/uploads/news/${size}/${slug}-2.jpg`;

const HOME_NEWS = [
  { slug: 'olybet-ehl-sadolin-jekabs-livins-s2e04', id: 1926, date: '30.10.2026', title: 'OlyBet EHL – Sadolin – Jēkabs Līviņš | S2E04',
    text: 'Kad jaunizveidotās komandas “Sadolin” pārstāvis Jēkabs Līviņš mums debijas sezonā pateica, ka ceļš uz uzvarām balstās uz komandas saliedētību, mēs uzreiz sapratām, ka viņi ir ieradušies ar pareizajiem mērķiem.' },
  { slug: 'olybet-ehl-ozo-ogre-uldis-blumbergs-s2e03', id: 1922, date: '26.10.2026', title: 'OlyBet EHL – OZO Ogre – Uldis Blumbergs | S2E03',
    text: 'No dīķa līdz Andorai, no Andoras līdz Entuziastiem!' },
  { slug: 'top-momenti-ar-nauri-vizuli-olybet-ehl-16-sezona-septembris', id: 1920, date: '21.10.2026', title: 'TOP momenti ar Nauri Vizuli | 16. sezona | Septembris',
    text: 'Kā sezonas pirmo TOP’a komentētāju esam izvēlējušies EHL IT burvi, praktisko jokdari un vienkārši lielisku cilvēku – Nauri Vizuli!' },
  { slug: 'olybet-ehl-ll-lasma-smirnova-s2e02', id: 1912, date: '19.10.2026', title: 'OlyBet EHL – L&L – Lāsma Smirnova | S2E02',
    text: 'Otrā šīs sezonas sērija par E10 komandu L&L.' },
  { slug: 'olybet-ehl-advocate-athlete-kristaps-bazevics-s2e01', id: 1905, date: '12.10.2026', title: 'OlyBet EHL – Advocate Athlete – Kristaps Bazevičs | S2E01',
    text: 'Uzsākam otro sezonu ar stāstiem par Entuziastiem un Entuziastu komandām.' },
  { slug: 'off-ice-podcast-tiesraide-5-oktobri-plkst-2000', id: 1898, date: '5. oktobris', title: 'Off Ice podcast – tiešraidē 5. oktobrī plkst. 20:00',
    text: 'Live viss tomēr ir foršāk.' },
];
const newsUrl = (n) => link(`/jaunumi/${n.slug}/${n.id}`);

const [lead, ...rest] = HOME_NEWS;
const feature = $('#feature');
feature.href = newsUrl(lead);
feature.innerHTML = `
  <img src="${IMG(lead.slug, 'px830')}" alt="">
  <span class="play" aria-hidden="true"></span>
  <div class="feature-body">
    <span class="tag">Entuziasti · Video</span><span class="date">${lead.date}</span>
    <h1>${esc(lead.title)}</h1>
    <p>${esc(lead.text)}</p>
  </div>`;

$('#news').innerHTML = rest.map((n) => `
  <a class="news-card" href="${newsUrl(n)}">
    <div class="thumb"><img src="${IMG(n.slug, 'px830')}" alt="" loading="lazy"></div>
    <div class="body">
      <span class="date">${n.date}</span>
      <h3>${esc(n.title)}</h3>
      <p>${esc(n.text)}</p>
    </div>
  </a>`).join('');

$('#dk').innerHTML = DKLIST.slice(0, 3).map((d) => {
  const p = parseDK(d.title);
  return `
  <a class="dk-item" href="${link(d.url)}">
    <img src="${d.img}" alt="" loading="lazy">
    <div><h3>${esc(p.team)}</h3><p>${esc(d.text)}</p></div>
    <span class="badge">${p.date.slice(0, 5)}</span>
  </a>`;
}).join('');

$('#side').insertAdjacentHTML('afterbegin', leadersCard());
