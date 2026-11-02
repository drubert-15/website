// Contacts page (content from ehl.entuziasti.com/kontakti).
const GROUPS = [
  ['Organizatoriskie jautājumi', [
    ['Jānis Puriņš', 'Finanses un organizācija', '27033996', 'janis@entuziasti.lv'],
    ['Haralds Apinis', 'Dizains un organizācija', '29359757', 'haralds@entuziasti.lv'],
    ['Roberts Pļāvējs', 'Reklāma, mārketings un organizācija', '28881115', 'roberts@entuziasti.lv'],
  ]],
  ['Grafiskais departaments', [
    ['Haralds Apinis', 'EHL grafiskie darbi, komandu logo un formu dizains', '29359757', 'haralds@entuziasti.lv'],
  ]],
  ['Video un foto · Entuziasti Digital', [
    ['Kristaps Mozgirs', 'Foto un video', '26399495', 'kristaps@entuziasti.lv'],
    ['Kristers Sakne', 'EHL spēļu video momenti, EHL TOP 10, statistika', '29636899', 'kristers@entuziasti.lv'],
  ]],
  ['Galvenais tiesnesis', [['Ainārs Bitens', 'Turnīra tehniskā organizācija un kalendārs', '29285886', 'ainars@entuziasti.lv']]],
  ['Disciplinārā komiteja', [['Artūrs Folkmanis', 'DK vadītājs', '28357768', 'dk@entuziasti.lv']]],
  ['Komandu sastāvi un spēlētāju atbilstība', [['Kristians Markevics', 'Sastāvu un spēlētāju atbilstība divīzijām', '26397117', 'km@entuziasti.lv']]],
];

$('#contacts').innerHTML = GROUPS.map(([title, people]) => `
  <section class="contact-card">
    <h3>${title}</h3>
    <div class="people">${people.map(([n, r, tel, mail]) => `
      <div class="p"><b>${n}</b><small>${r}</small><a href="tel:+371${tel}">${tel}</a><a href="mailto:${mail}">${mail}</a></div>`).join('')}
    </div>
  </section>`).join('') + `
  <section class="contact-card">
    <h3>Rekvizīti ziedojumiem</h3>
    <div class="bank">
      <div><span>Nosaukums</span><b>“Entuziastu Fonds”</b></div>
      <div><span>Reģ. Nr.</span><b>40008178284</b></div>
      <div><span>Adrese</span><b>Rīga, Aleksandra Čaka iela 109-5, LV-1011</b></div>
      <div><span>Banka</span><b>AS “Swedbank”</b></div>
      <div><span>Konts</span><code>LV09HABA0551030774172</code></div>
    </div>
  </section>`;
