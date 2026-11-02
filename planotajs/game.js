// Spēles daļa: XP, līmeņi, dienas/nedēļas questi, prasmju koks.
(function () {
  const STORE = 'planotajs.game.v1';
  const TASKS_STORE = 'planotajs.tasks.v1';
  const KEY_STORE = 'planotajs.apikey';

  const SKILLS = [
    { id: 'veseliba', name: 'Veselība', icon: 'heart', color: '#34d399' },
    { id: 'prats', name: 'Prāts', icon: 'book', color: '#60a5fa' },
    { id: 'karjera', name: 'Karjera', icon: 'briefcase', color: '#fbbf24' },
    { id: 'majas', name: 'Mājas', icon: 'home', color: '#fb923c' },
    { id: 'prieks', name: 'Draugi & prieks', icon: 'palette', color: '#f472b6' },
    { id: 'miers', name: 'Miers & disciplīna', icon: 'moon', color: '#a78bfa' },
  ];
  const SKILL = Object.fromEntries(SKILLS.map(s => [s.id, s]));
  const CAT_SKILL = { 'Darbs': 'karjera', 'Mājas & ģimene': 'majas', 'Veselība': 'veseliba', 'Mācības': 'prats', 'Brīvais laiks': 'prieks', 'Cits': 'miers' };

  // Questu krātuve. k = atslēgvārdi, pēc kuriem saprot, vai tev tas patiktu.
  const POOL = {
    daily: [
      ['veseliba', 'Izej 20 min pastaigā svaigā gaisā', 25, ['pastaig', 'daba', 'ārā', 'svaig']],
      ['veseliba', 'Izdzer 8 glāzes ūdens', 20, ['veselīg', 'ūden']],
      ['veseliba', '10 min izstaipīšanās vai joga', 25, ['joga', 'stiep', 'vingr']],
      ['veseliba', '30 min sporta — jebkāda veida', 35, ['sport', 'skrie', 'trenin', 'treniņ', 'zāl', 'futbol', 'basketbol', 'riten', 'peld']],
      ['veseliba', 'Aizej gulēt līdz 23:00', 30, ['miegs', 'gulēt', 'izgulē']],
      ['veseliba', 'Apēd vismaz 3 porcijas dārzeņu vai augļu', 20, ['ēst', 'ēdien', 'gatavo', 'veselīg']],
      ['prats', 'Izlasi 20 lappuses grāmatas', 30, ['grāmat', 'lasī', 'lasu']],
      ['prats', 'Iemācies 10 jaunus vārdus svešvalodā', 25, ['valod', 'angļu', 'vācu', 'spāņ', 'franč']],
      ['prats', 'Noskaties 1 izglītojošu video un pieraksti 3 atziņas', 25, ['video', 'youtube', 'podkāst', 'zinātn']],
      ['prats', '30 min mācību bez telefona', 35, ['mācī', 'eksām', 'skol', 'universit', 'studij']],
      ['prats', 'Atrisini kādu loģikas uzdevumu vai šahu', 20, ['šah', 'mīkl', 'loģik', 'programm', 'matemāt']],
      ['karjera', 'Uzraksti rītdienas 3 svarīgākos darbus', 20, ['darb', 'plāno', 'produktīv']],
      ['karjera', '1 h dziļā darba bez traucēkļiem', 40, ['darb', 'projekt', 'fokus', 'produktīv']],
      ['karjera', 'Izdari vienu atlikto darbu (5 min likums)', 25, ['atlik', 'darb']],
      ['karjera', 'Sakārto e-pastus vai ziņas līdz tukšam', 25, ['e-pas', 'epast', 'darb']],
      ['karjera', 'Iemācies vienu jaunu triku savā darba rīkā', 25, ['programm', 'excel', 'dizain', 'kod', 'tehnoloģ'], [18, 120]],
      ['karjera', 'Izpildi mājasdarbus vēl pirms vakara', 30, ['skol', 'mācī', 'mājasdarb'], [0, 19]],
      ['karjera', 'Izpēti vienu profesiju, kas tevi interesē', 25, ['nākotn', 'profesij', 'darb'], [0, 22]],
      ['veseliba', '15 min viegla vingrošana vai pastaiga pēc ēšanas', 25, ['pastaig', 'vingr', 'veselīg'], [50, 120]],
      ['majas', '15 min sakārto vienu stūri', 20, ['kārtīb', 'tīr', 'māj']],
      ['majas', 'Pagatavo ēdienu pats no nulles', 30, ['gatavo', 'ēdien', 'virtuv', 'cep']],
      ['majas', 'Piezvani kādam no ģimenes', 25, ['ģimen', 'mamm', 'tēt', 'vecmām', 'brāl', 'māsa']],
      ['majas', 'Iznes atkritumus un sašķiro tos', 15, ['māj', 'tīr']],
      ['majas', 'Aplaisti augus / parūpējies par mājdzīvnieku', 15, ['aug', 'puķ', 'suns', 'suni', 'kaķ', 'dārz']],
      ['prieks', 'Uzraksti draugam, ar kuru sen neesi runājis', 25, ['draug', 'cilvēk', 'sociāl']],
      ['prieks', 'Nofotografē vai uzzīmē kaut ko skaistu', 25, ['foto', 'zīmē', 'māksl', 'radoš', 'glezn']],
      ['prieks', 'Paklausies pilnu albumu, ko vēl nezini', 20, ['mūzik', 'dziesm', 'koncert', 'ģitār', 'klavier']],
      ['prieks', '30 min nodarbojies ar savu hobiju', 30, ['hobij', 'spēl', 'game', 'radoš', 'zīmē', 'mūzik', 'ģitār']],
      ['prieks', 'Izdari kādam mazu labu darbu', 25, ['palīdz', 'draug', 'labs']],
      ['miers', '5 min meditācija vai elpošana', 25, ['meditē', 'elpo', 'miers', 'stres']],
      ['miers', 'Uzraksti 3 lietas, par ko esi pateicīgs', 20, ['dienasgrāmat', 'rakst', 'pateic']],
      ['miers', '1 h bez telefona pirms gulētiešanas', 30, ['telefon', 'ekrān', 'miegs']],
      ['miers', 'Ieraksts dienasgrāmatā: kā tu šodien jūties?', 20, ['dienasgrāmat', 'rakst', 'sajūt']],
      ['miers', 'Izpildi visus šodienas plānotos uzdevumus', 35, ['disciplīn', 'produktīv', 'plāno']],
    ],
    weekly: [
      ['veseliba', 'Šonedēļ 3 treniņi', 120, ['sport', 'skrie', 'trenin', 'treniņ', 'zāl']],
      ['veseliba', '5 vakari pēc kārtas gulēt līdz 23:00', 110, ['miegs', 'gulēt']],
      ['veseliba', 'Garš pārgājiens vai velo izbrauciens dabā', 120, ['daba', 'pārgāj', 'riten', 'velo', 'ārā']],
      ['prats', 'Izlasi 100 lappuses', 130, ['grāmat', 'lasī']],
      ['prats', 'Pabeidz vienu online kursa moduli', 120, ['kurs', 'mācī', 'programm']],
      ['prats', 'Iemācies kaut ko pilnīgi jaunu un izstāsti kādam', 100, ['mācī', 'zinātn', 'jaun']],
      ['karjera', 'Pabeidz vienu lielu darba posmu', 140, ['darb', 'projekt']],
      ['karjera', 'Atjauno CV vai portfolio', 100, ['darb', 'karjer', 'cv', 'portfolio'], [18, 120]],
      ['karjera', 'Sagatavojies nākamajam kontroldarbam vai testam laikus', 120, ['skol', 'eksām', 'kontroldarb'], [0, 22]],
      ['karjera', 'Uzraksti 3 lietas, ko gribētu darīt nākotnē, un pirmo soli katrai', 90, ['nākotn', 'sapņ', 'mērķ'], [0, 22]],
      ['karjera', 'Uzzini kaut ko jaunu no pieredzējuša cilvēka', 100, ['karjer', 'mentor', 'darb']],
      ['majas', 'Lielā tīrīšana vienā istabā', 110, ['tīr', 'kārtīb', 'māj']],
      ['majas', 'Sastādi ēdienkarti nedēļai un iepērcies pēc tās', 100, ['gatavo', 'ēdien']],
      ['majas', 'Atdod vai izmet 10 nevajadzīgas lietas', 90, ['kārtīb', 'minimāl', 'māj']],
      ['prieks', 'Satiec draugus klātienē', 120, ['draug', 'ballīt', 'sociāl']],
      ['prieks', 'Izmēģini kaut ko, ko nekad neesi darījis', 130, ['jaun', 'piedzīvojum', 'ceļo']],
      ['prieks', 'Aizej uz koncertu, izstādi, teātri vai kino', 110, ['koncert', 'kino', 'teātr', 'māksl', 'izstād']],
      ['miers', '5 dienas pēc kārtas meditē', 120, ['meditē', 'miers', 'stres']],
      ['miers', 'Nedēļas pārskats: kas izdevās, ko mainīt', 90, ['plāno', 'dienasgrāmat', 'rakst']],
      ['miers', 'Pusdiena pilnīgi bez sociālajiem tīkliem', 110, ['telefon', 'sociāl', 'detoks', 'ekrān']],
    ],
  };
  const ageOk = r => !r || !user.age || (user.age >= r[0] && user.age <= r[1]);
  const pool = kind => POOL[kind].map(([s, t, xp, k, r], i) => ({ id: `${kind[0]}${i}`, s, t, xp, k, r })).filter(q => ageOk(q.r));

  // ---------- Konts (glabājas šajā ierīcē) ----------
  const USER_STORE = 'planotajs.user.v1';
  const INTERESTS = ['Sports', 'Mūzika', 'Lasīšana', 'Spēles', 'Māksla', 'Daba', 'Ēst gatavošana', 'Programmēšana', 'Ceļošana', 'Filmas', 'Draugi', 'Valodas', 'Foto', 'Dzīvnieki', 'Mode', 'Tehnoloģijas'];
  const INTEREST_KW = { 'Sports': 'sport treniņ skrie futbol', 'Mūzika': 'mūzik dziesm koncert ģitār', 'Lasīšana': 'grāmat lasī', 'Spēles': 'spēl game šah', 'Māksla': 'māksl zīmē glezn radoš izstād', 'Daba': 'daba pastaig pārgāj ārā', 'Ēst gatavošana': 'gatavo ēdien cep virtuv', 'Programmēšana': 'programm kod tehnoloģ', 'Ceļošana': 'ceļo piedzīvojum jaun', 'Filmas': 'kino filmas teātr', 'Draugi': 'draug sociāl ballīt', 'Valodas': 'valod angļu', 'Foto': 'foto', 'Dzīvnieki': 'suns suni kaķ', 'Mode': 'mode', 'Tehnoloģijas': 'tehnoloģ programm' };
  let user = {};
  try { user = JSON.parse(localStorage.getItem(USER_STORE)) || {}; } catch {}
  const saveUser = () => { try { localStorage.setItem(USER_STORE, JSON.stringify(user)); } catch {} applyUser(); };
  function profileText() {
    return [(user.interests || []).map(i => i + ' ' + (INTEREST_KW[i] || '')).join(' '), user.about || ''].join(' ').toLowerCase();
  }
  function applyUser() {
    if (typeof SKILL === 'undefined') return;
    SKILL.karjera.name = user.age && user.age < 19 ? 'Skola & nākotne' : 'Karjera';
    const h = new Date().getHours();
    const greet = h < 5 ? 'Labu nakti' : h < 11 ? 'Labrīt' : h < 18 ? 'Labdien' : 'Labvakar';
    const head = document.querySelector('.top h1');
    if (head) {
      const d = new Date();
      const date = d.toLocaleDateString('lv-LV', { weekday: 'long', day: 'numeric', month: 'long' });
      head.innerHTML = user.name ? `${greet}, ${esc(user.name)}<em>${esc(date)}</em>` : `Plānotājs<em>tava dienasgrāmata</em>`;
    }
  }

  // Prasmju koks: katrai prasmei 5 mezgli. Katrs atslēgts mezgls dod +10% XP šai prasmei.
  const TREE = {
    veseliba: [['Pirmie soļi', 'Sāc kustēties', 2, []], ['Izturība', 'Garāki treniņi', 3, [0]], ['Miega meistars', 'Atpūta ir spēks', 3, [0]], ['Dzelzs ķermenis', 'Ieradums, ne piespiešanās', 5, [1, 2]], ['Atlēts', 'Tituls + zelta rāmis', 7, [3]]],
    prats: [['Zinātkāre', 'Jautā „kāpēc?”', 2, []], ['Grāmatu tārps', 'Lasi katru dienu', 3, [0]], ['Poliglots', 'Valodas un vārdi', 3, [0]], ['Fokuss', 'Dziļā domāšana', 5, [1, 2]], ['Gudrais', 'Tituls + zelta rāmis', 7, [3]]],
    karjera: [['Kārtība galvā', 'Top-3 saraksts', 2, []], ['Dziļais darbs', 'Bez traucēkļiem', 3, [0]], ['Kontakti', 'Pazīšanās tīkls', 3, [0]], ['Līderis', 'Ved citus', 5, [1, 2]], ['Meistars', 'Tituls + zelta rāmis', 7, [3]]],
    majas: [['Tīrs stūrītis', 'Maza kārtība', 2, []], ['Šefpavārs', 'Ēdiens pašu rokām', 3, [0]], ['Ģimenes sirds', 'Rūpes par tuvajiem', 3, [0]], ['Mājas gars', 'Viss savās vietās', 5, [1, 2]], ['Saimnieks', 'Tituls + zelta rāmis', 7, [3]]],
    prieks: [['Smaids', 'Mazi prieki', 2, []], ['Dvēseles biedri', 'Draugi tuvumā', 3, [0]], ['Radītājs', 'Hobiji un māksla', 3, [0]], ['Piedzīvojumi', 'Jaunas pieredzes', 5, [1, 2]], ['Dzīves mākslinieks', 'Tituls + zelta rāmis', 7, [3]]],
    miers: [['Elpa', 'Apstājies uz brīdi', 2, []], ['Pateicība', 'Redzi labo', 3, [0]], ['Digitālais detokss', 'Telefons malā', 3, [0]], ['Nelokāms', 'Disciplīna katru dienu', 5, [1, 2]], ['Zen meistars', 'Tituls + zelta rāmis', 7, [3]]],
  };
  const nodeId = (s, i) => `${s}:${i}`;

  // ---------- Stāvoklis ----------
  const fresh = () => ({ xp: {}, bonusXp: 0, unlocked: [], streak: { count: 0, last: '' }, quests: {}, profile: '', log: [], rerolls: {} });
  let st;
  if (!user.about) try { const old = JSON.parse(localStorage.getItem(STORE) || '{}').profile; if (old) user.about = old; } catch {}
  try { st = { ...fresh(), ...(JSON.parse(localStorage.getItem(STORE)) || {}) }; } catch { st = fresh(); }
  const save = () => { try { localStorage.setItem(STORE, JSON.stringify(st)); } catch {} };

  const pad = n => String(n).padStart(2, '0');
  const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const todayKey = () => ymd(new Date());
  const weekKey = () => { const d = new Date(); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return ymd(d); };

  // Līmeņi: līmenim n vajag 50·n·(n+1) XP (100, 300, 600, 1000 …)
  const levelFrom = (xp, f = 50) => { let l = 0; while (xp >= f * (l + 1) * (l + 2)) l++; return l; };
  const needFor = (l, f = 50) => f * l * (l + 1);
  const skillXp = id => st.xp[id] || 0;
  const skillLevel = id => levelFrom(skillXp(id)) + 1;
  const totalXp = () => SKILLS.reduce((a, s) => a + skillXp(s.id), 0) + (st.bonusXp || 0);
  const playerLevel = () => levelFrom(totalXp(), 75) + 1;
  const spent = id => st.unlocked.filter(u => u.startsWith(id + ':')).length;
  const points = id => skillLevel(id) - 1 - spent(id);
  const mult = id => 1 + 0.1 * spent(id);
  const TITLES = ['Iesācējs', 'Ceļinieks', 'Piedzīvojumu meklētājs', 'Varonis', 'Čempions', 'Leģenda', 'Mīts'];
  const title = () => {
    const caps = st.unlocked.filter(u => u.endsWith(':4')).map(u => TREE[u.split(':')[0]][4][0]);
    return caps.length ? caps[caps.length - 1] : TITLES[Math.min(TITLES.length - 1, Math.floor((playerLevel() - 1) / 3))];
  };

  // ---------- XP piešķiršana ----------
  function award(skill, xp, reason) {
    if (!SKILL[skill]) skill = 'miers';
    const gain = Math.round(xp * mult(skill));
    const beforeS = skillLevel(skill), beforeP = playerLevel();
    st.xp[skill] = skillXp(skill) + gain;
    st.log.push({ d: todayKey(), s: skill, xp: gain, r: reason || '' });
    if (st.log.length > 400) st.log = st.log.slice(-400);
    save();
    const lvlS = skillLevel(skill), lvlP = playerLevel();
    if (lvlP > beforeP) celebrate(`Līmenis ${lvlP}!`, `${user.name ? user.name + ', tu' : 'Tu'} tagad esi „${title()}”`, 'star');
    else if (lvlS > beforeS) celebrate(`${SKILL[skill].name}: līmenis ${lvlS}`, '+1 prasmes punkts — atver Koku', SKILL[skill].icon, SKILL[skill].color);
    renderAll();
    return gain;
  }
  const awardForTask = (category, priority) => award(CAT_SKILL[category] || 'miers', 10 + 10 * (Number(priority) || 2), 'uzdevums');

  function bumpStreak() {
    const t = todayKey();
    if (st.streak.last === t) return;
    const y = new Date(); y.setDate(y.getDate() - 1);
    st.streak.count = st.streak.last === ymd(y) ? st.streak.count + 1 : 1;
    st.streak.last = t;
  }

  // ---------- Questu ģenerēšana ----------
  function rng(seedStr) {
    let h = 1779033703 ^ seedStr.length;
    for (let i = 0; i < seedStr.length; i++) { h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
    return () => { h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return ((h ^= h >>> 16) >>> 0) / 4294967296; };
  }
  const pick = (arr, r) => arr[Math.floor(r() * arr.length)];

  function recentBySkill(days = 14) {
    const since = new Date(); since.setDate(since.getDate() - days);
    const s = ymd(since), out = Object.fromEntries(SKILLS.map(x => [x.id, 0]));
    st.log.forEach(l => { if (l.d >= s) out[l.s] = (out[l.s] || 0) + l.xp; });
    return out;
  }
  function recentTasks() {
    try { return (JSON.parse(localStorage.getItem(TASKS_STORE)) || []).slice(-40); } catch { return []; }
  }
  // Kam ir maz uzmanības → tev to „vajadzētu”.
  function weakestSkill() {
    const r = recentBySkill();
    return SKILLS.map(s => s.id).sort((a, b) => r[a] - r[b] || skillXp(a) - skillXp(b))[0];
  }
  // Kas atbilst tavām interesēm vai ko tu bieži dari → tev „patiks”.
  function likeScore(q) {
    const prof = profileText();
    let sc = q.k.filter(k => prof.includes(k)).length * 3;
    const tasksText = recentTasks().map(t => `${t.title} ${t.note || ''}`).join(' ').toLowerCase();
    sc += q.k.filter(k => tasksText.includes(k)).length;
    return sc;
  }

  function generate(kind, seed) {
    const r = rng(seed);
    const all = pool(kind);
    const weak = weakestSkill();
    const used = new Set();
    const take = (cands, k, why) => {
      const c = cands.filter(q => !used.has(q.id));
      if (!c.length) return null;
      const q = pick(c, r); used.add(q.id); used.add('s:' + q.s);
      return { ...q, kind: k, why, done: false };
    };
    const out = [];
    out.push(take(all.filter(q => q.s === weak), 'should', `${SKILL[weak].name} pēdējā laikā palikusi novārtā — laiks to izlīdzināt.`));
    const scored = all.filter(q => !used.has('s:' + q.s)).map(q => [q, likeScore(q)]).sort((a, b) => b[1] - a[1]);
    const top = scored.filter(([, s]) => s > 0 && s >= scored[0][1] - 1).map(([q]) => q);
    out.push(take(top.length ? top : all.filter(q => !used.has('s:' + q.s)), 'like', top.length ? 'Izskatās pēc kaut kā, kas tev patīk.' : 'Papildini savu kontu ar interesēm, lai ieteikumi būtu precīzāki.'));
    const focus = (user.focus || []).filter(f => !used.has('s:' + f));
    const fq = all.filter(q => focus.includes(q.s) && !used.has('s:' + q.s));
    out.push(fq.length
      ? take(fq, 'bonus', `Tu gribēji uzlabot: ${(user.focus || []).map(f => SKILL[f].name).join(', ')}.`)
      : take(all.filter(q => !used.has('s:' + q.s)), 'bonus', 'Neliels izaicinājums kaut kam jaunam.'));
    return out.filter(Boolean);
  }

  function ensureQuests() {
    const t = todayKey(), w = weekKey();
    let changed = false;
    if (st.quests.day !== t) {
      st.quests.day = t; st.quests.daily = generate('daily', t + (st.rerolls[t] || 0)); st.quests.chest = false; st.quests.aiDaily = false; changed = true;
    }
    if (st.quests.week !== w) {
      st.quests.week = w; st.quests.weekly = generate('weekly', 'w' + w + (st.rerolls['w' + w] || 0)); st.quests.aiWeekly = false; changed = true;
    }
    if (changed) save();
  }

  function completeQuest(kind, i) {
    const q = st.quests[kind][i];
    if (!q || q.done) return;
    q.done = true;
    bumpStreak();
    const gain = award(q.s, q.xp, 'quests');
    toast(`+${gain} XP · ${SKILL[q.s].name}`);
    if (kind === 'daily' && !st.quests.chest && st.quests.daily.every(x => x.done)) {
      st.quests.chest = true;
      const bonus = 50 + 5 * Math.min(st.streak.count, 10);
      st.bonusXp = (st.bonusXp || 0) + bonus;
      save();
      celebrate('Dienas lāde atvērta!', `Visi dienas questi izpildīti: +${bonus} XP · sērija ${st.streak.count} d.`, 'gift');
    }
    save(); renderAll();
  }

  function reroll(kind) {
    const k = kind === 'daily' ? todayKey() : 'w' + weekKey();
    if ((st.rerolls[k] || 0) >= 1) return toast('Šim periodam jau samainīji');
    st.rerolls[k] = (st.rerolls[k] || 0) + 1;
    const done = st.quests[kind].filter(q => q.done);
    const fresh = generate(kind, k + st.rerolls[k]).filter(q => !done.some(d => d.id === q.id));
    st.quests[kind] = [...done, ...fresh].slice(0, 3);
    save(); renderAll();
  }

  function unlock(skill, i) {
    const id = nodeId(skill, i), n = TREE[skill][i];
    if (st.unlocked.includes(id)) return;
    if (skillLevel(skill) < n[2]) return toast(`Vajag ${SKILL[skill].name} līmeni ${n[2]}`);
    if (n[3].length && !n[3].some(r => st.unlocked.includes(nodeId(skill, r)))) return toast('Vispirms atslēdz iepriekšējo mezglu');
    if (points(skill) < 1) return toast('Nav brīvu prasmes punktu');
    st.unlocked.push(id); save();
    celebrate(n[0], `${SKILL[skill].name}: +10% XP` + (i === 4 ? ' un jauns tituls!' : ''), i === 4 ? 'trophy' : SKILL[skill].icon, SKILL[skill].color);
    renderAll();
  }

  // ---------- AI personalizēti questi ----------
  async function personalize() {
    let key = '';
    try { key = window.App ? window.App.cleanKey(localStorage.getItem(KEY_STORE)) : localStorage.getItem(KEY_STORE) || ''; } catch {}
    const problem = window.App ? window.App.keyProblem(key) : (key ? '' : 'x');
    if (problem) return toast(key ? problem : 'Ievadi API atslēgu sadaļā „Iemest” → AI iestatījumi');
    const btn = document.querySelector('#aiQuests');
    btn.disabled = true; btn.textContent = 'Domāju, kas tev der…';
    try {
      const { default: Anthropic } = await import('https://esm.sh/@anthropic-ai/sdk');
      const client = new Anthropic({ apiKey: key, dangerouslyAllowBrowser: true });
      const questSchema = {
        type: 'array',
        items: {
          type: 'object', additionalProperties: false,
          required: ['title', 'skill', 'xp', 'kind', 'why'],
          properties: {
            title: { type: 'string' },
            skill: { type: 'string', enum: SKILLS.map(s => s.id) },
            xp: { type: 'integer' },
            kind: { type: 'string', enum: ['should', 'like', 'bonus'] },
            why: { type: 'string' },
          },
        },
      };
      const recent = recentBySkill();
      const response = await client.beta.messages.create({
        model: 'claude-opus-5-5',
        max_tokens: 16000,
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
        output_config: {
          effort: 'low',
          format: { type: 'json_schema', schema: { type: 'object', additionalProperties: false, required: ['daily', 'weekly'], properties: { daily: questSchema, weekly: questSchema } } },
        },
        system:
          'Tu esi draudzīgs dzīves treneris spēles stilā. Izveido personalizētus questus latviski: 3 dienas questus (xp 15–40, izdarāmi vienā dienā, konkrēti un izmērāmi) ' +
          'un 3 nedēļas questus (xp 80–150). Katrā grupā: 1 "should" — ko lietotājam VAJADZĒTU darīt (novārtā atstāta prasme vai veselīgs ieradums), ' +
          '1 "like" — kas viņam PATIKTU pēc interesēm, 1 "bonus" — kaut kas jauns un jautrs. "why" — viens īss teikums, kāpēc tieši šis (vari uzrunāt vārdā). ' +
          'Pielāgo questus vecumam (skolēnam — skola un hobiji, pieaugušajam — darbs un ikdiena, vecākam cilvēkam — saudzīgākas aktivitātes). Prasmes: ' +
          SKILLS.map(s => `${s.id} (${s.name})`).join(', ') + '. Esi iedrošinošs, ne moralizējošs.',
        messages: [{
          role: 'user',
          content:
            `Vārds: ${user.name || '(nav)'}, vecums: ${user.age || '(nav)'}\n` +
            `Intereses: ${(user.interests || []).join(', ') || '(nav)'}\n` +
            `Gribu uzlabot: ${(user.focus || []).map(f => SKILL[f].name).join(', ') || '(nav)'}\n` +
            `Par mani: ${user.about || '(nav norādīts)'}\n` +
            `Prasmju līmeņi: ${SKILLS.map(s => `${s.name} ${skillLevel(s.id)}`).join(', ')}\n` +
            `XP pēdējās 2 nedēļās: ${SKILLS.map(s => `${s.name} ${recent[s.id]}`).join(', ')}\n` +
            `Mani nesenie uzdevumi: ${recentTasks().map(t => t.title).slice(-20).join('; ') || '(nav)'}\n` +
            `Šodien: ${todayKey()}`,
        }],
      });
      if (response.stop_reason === 'refusal') throw new Error('atteikums');
      const block = response.content.find(b => b.type === 'text');
      const data = JSON.parse(block.text);
      const norm = (arr, kind, lo, hi) => arr.slice(0, 3).map((q, i) => ({
        id: `ai${kind[0]}${i}${Date.now() % 1000}`, s: SKILL[q.skill] ? q.skill : 'miers', t: q.title,
        xp: Math.max(lo, Math.min(hi, q.xp | 0)), k: [], kind: q.kind, why: q.why, done: false,
      }));
      const keepDone = kind => st.quests[kind].filter(q => q.done);
      st.quests.daily = [...keepDone('daily'), ...norm(data.daily, 'daily', 15, 40)].slice(0, Math.max(3, keepDone('daily').length));
      st.quests.weekly = [...keepDone('weekly'), ...norm(data.weekly, 'weekly', 80, 150)].slice(0, Math.max(3, keepDone('weekly').length));
      st.quests.aiDaily = st.quests.aiWeekly = true;
      save(); renderAll();
      toast(`Questi pielāgoti${user.name ? ' tev, ' + user.name : ''}`);
    } catch (e) {
      toast('AI neizdevās: ' + (window.App ? window.App.aiErrorText(e) : e.message || e));
    } finally {
      btn.disabled = false; btn.innerHTML = icon('sparkle') + ' Personalizēt ar AI';
    }
  }

  // ---------- UI ----------
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function toast(msg) {
    const el = document.querySelector('#toast');
    el.textContent = msg; el.hidden = false;
    clearTimeout(toast.t); toast.t = setTimeout(() => (el.hidden = true), 2600);
  }
  function celebrate(head, sub, ic = 'sparkle', color) {
    const el = document.createElement('div');
    el.className = 'celebrate';
    if (color) el.style.setProperty('--c', color);
    el.innerHTML = `<div class="burst">${'✦✧★✶✷✸'.split('').map((c, i) => `<i style="--i:${i}">${c}</i>`).join('')}</div><span class="c-ic">${icon(ic)}</span><strong>${esc(head)}</strong><span>${esc(sub)}</span>`;
    document.body.appendChild(el);
    el.addEventListener('click', () => el.remove());
    setTimeout(() => el.remove(), 3200);
  }

  function renderPlayer() {
    const el = document.querySelector('#player'); if (!el) return;
    const xp = totalXp(), l = playerLevel() - 1;
    const from = needFor(l, 75), to = needFor(l + 1, 75);
    const pct = Math.round(((xp - from) / (to - from)) * 100);
    const free = SKILLS.reduce((a, s) => a + points(s.id), 0);
    el.innerHTML = `
      <button class="lvl-ring" style="--p:${pct}" id="avatarBtn" aria-label="Konts"><span>${l + 1}</span></button>
      <div class="p-info">
        <div class="p-title">${esc(title())}${free ? ` <button class="pts" data-goto="tree">+${free} punkti</button>` : ''}</div>
        <div class="xpbar"><div style="width:${pct}%"></div></div>
        <div class="p-sub">${xp - from} / ${to - from} XP līdz ${l + 2}. līmenim</div>
      </div>
      <div class="streak" title="Dienu sērija">${icon('flame')}<b>${st.streak.count}</b></div>`;
    el.querySelector('#avatarBtn').addEventListener('click', () => openAccount(false));
    el.querySelector('[data-goto]')?.addEventListener('click', () => document.querySelector('[data-view=tree]').click());
  }

  const KIND = { should: ['Vajadzētu', 'k-should'], like: ['Tev patiks', 'k-like'], bonus: ['Bonuss', 'k-bonus'] };
  function questCard(q, kind, i) {
    const s = SKILL[q.s];
    return `
      <div class="quest${q.done ? ' done' : ''}" style="--c:${s.color}">
        <div class="q-icon">${icon(s.icon)}</div>
        <div class="q-body">
          <div class="q-top"><span class="kind ${KIND[q.kind]?.[1] || ''}">${KIND[q.kind]?.[0] || ''}</span><span class="q-skill">${esc(s.name)}</span></div>
          <div class="q-title">${esc(q.t)}</div>
          ${q.why ? `<div class="q-why">${esc(q.why)}</div>` : ''}
        </div>
        <button class="q-btn" data-q="${kind}:${i}" ${q.done ? 'disabled' : ''}>${q.done ? icon('check') : `+${Math.round(q.xp * mult(q.s))}<small>XP</small>`}</button>
      </div>`;
  }
  function untilReset(kind) {
    const now = new Date(), end = new Date(now);
    if (kind === 'daily') end.setHours(24, 0, 0, 0);
    else { end.setDate(end.getDate() + (7 - ((end.getDay() + 6) % 7))); end.setHours(0, 0, 0, 0); }
    const h = Math.round((end - now) / 3600000);
    return h >= 48 ? `${Math.round(h / 24)} d` : `${h} h`;
  }

  function renderQuests() {
    const el = document.querySelector('#view-quests'); if (!el) return;
    ensureQuests();
    const dailyDone = st.quests.daily.filter(q => q.done).length;
    const weak = (st.quests.daily.find(q => q.kind === 'should') || {}).s || weakestSkill();
    el.innerHTML = `
      <div class="advice" style="--c:${SKILL[weak].color}">
        <span class="a-icon">${icon(SKILL[weak].icon)}</span>
        <div><strong>Šodienas ieteikums</strong><br>Pēdējā laikā maz laika veltīts prasmei „${esc(SKILL[weak].name)}”. Viens šodienas quests palīdzēs to izlīdzināt.</div>
      </div>
      <div class="q-head"><h2>Dienas questi</h2><span>${dailyDone}/${st.quests.daily.length} · atjaunosies pēc ${untilReset('daily')}</span></div>
      <div class="chest${st.quests.chest ? ' open' : ''}">${st.quests.chest ? icon('gift') + ' Lāde atvērta!' : `${icon('gift')} Izpildi visus 3, lai atvērtu lādi (+${50 + 5 * Math.min(st.streak.count + 1, 10)} XP)`}</div>
      ${st.quests.daily.map((q, i) => questCard(q, 'daily', i)).join('')}
      <div class="actions"><button class="secondary" data-reroll="daily">${icon('dice')} Citi dienas questi</button></div>

      <div class="q-head"><h2>Nedēļas questi</h2><span>atjaunosies pēc ${untilReset('weekly')}</span></div>
      ${st.quests.weekly.map((q, i) => questCard(q, 'weekly', i)).join('')}
      <div class="actions"><button class="secondary" data-reroll="weekly">${icon('dice')} Citi nedēļas questi</button></div>

      <div class="card about">
        <h2>Pielāgots tev</h2>
        <p class="hint">${user.name ? `${esc(user.name)}${user.age ? ', ' + user.age + ' g.' : ''}` : 'Konts nav izveidots'}${(user.interests || []).length ? ' · ' + esc(user.interests.join(', ')) : ''}</p>
        <div class="actions">
          <button class="secondary" id="editAccount">${icon('user')} Mainīt kontu</button>
          <button class="primary" id="aiQuests">${icon('sparkle')} Personalizēt ar AI</button>
        </div>
      </div>`;
    el.querySelectorAll('[data-q]').forEach(b => b.addEventListener('click', () => { const [k, i] = b.dataset.q.split(':'); completeQuest(k, Number(i)); }));
    el.querySelectorAll('[data-reroll]').forEach(b => b.addEventListener('click', () => reroll(b.dataset.reroll)));
    el.querySelector('#editAccount').addEventListener('click', () => openAccount(false));
    el.querySelector('#aiQuests').addEventListener('click', personalize);
  }

  function renderTree() {
    const el = document.querySelector('#view-tree'); if (!el) return;
    el.innerHTML = `<p class="hint">Izpildi uzdevumus un questus, lai krātu XP. Katrs prasmes līmenis dod 1 punktu, ar ko atslēgt mezglus. Katrs mezgls: <b>+10% XP</b> šai prasmei.</p>` +
      SKILLS.map(s => {
        const xp = skillXp(s.id), l = levelFrom(xp);
        const from = needFor(l), to = needFor(l + 1), pct = Math.round(((xp - from) / (to - from)) * 100);
        const nodes = TREE[s.id].map((n, i) => {
          const id = nodeId(s.id, i), on = st.unlocked.includes(id);
          const reqOk = !n[3].length || n[3].some(r => st.unlocked.includes(nodeId(s.id, r)));
          const can = !on && reqOk && skillLevel(s.id) >= n[2] && points(s.id) > 0;
          const state = on ? 'on' : can ? 'can' : 'off';
          return `<button class="node n${i} ${state}" data-node="${s.id}:${i}" title="${esc(n[1])}">
              <b>${i === 4 ? icon('trophy') : ''}${esc(n[0])}</b><small>${on ? 'atslēgts' : `Lv ${n[2]}`}</small></button>`;
        });
        return `
          <div class="skill" style="--c:${s.color}">
            <div class="s-head">
              <span class="s-icon">${icon(s.icon)}</span>
              <div class="s-info"><strong>${esc(s.name)}</strong><div class="xpbar"><div style="width:${pct}%"></div></div>
              <small>Lv ${l + 1} · ${xp - from}/${to - from} XP · ×${mult(s.id).toFixed(1)} XP</small></div>
              ${points(s.id) > 0 ? `<span class="pts">+${points(s.id)}</span>` : ''}
            </div>
            <div class="tree">
              <div class="t-row">${nodes[0]}</div>
              <div class="t-row two">${nodes[1]}${nodes[2]}</div>
              <div class="t-row">${nodes[3]}</div>
              <div class="t-row">${nodes[4]}</div>
            </div>
          </div>`;
      }).join('');
    el.querySelectorAll('[data-node]').forEach(b => b.addEventListener('click', () => { const [s, i] = b.dataset.node.split(':'); unlock(s, Number(i)); }));
  }

  // Pārģenerē neizpildītos questus pēc konta izmaiņām (ja tie nav AI veidoti)
  function refreshQuests() {
    ['daily', 'weekly'].forEach(kind => {
      if (!st.quests[kind] || st.quests[kind === 'daily' ? 'aiDaily' : 'aiWeekly']) return;
      const done = st.quests[kind].filter(q => q.done);
      const seed = (kind === 'daily' ? todayKey() : 'w' + weekKey()) + 'u' + profileText().length + (user.age || 0);
      st.quests[kind] = [...done, ...generate(kind, seed).filter(q => !done.some(d => d.id === q.id))].slice(0, Math.max(3, done.length));
    });
    save();
  }

  function openAccount(first) {
    document.querySelector('.account')?.remove();
    const el = document.createElement('div');
    el.className = 'account';
    const chosen = new Set(user.interests || []), focus = new Set(user.focus || []);
    el.innerHTML = `
      <div class="acc-card">
        <div class="acc-head">
          <div class="acc-avatar">${user.name ? esc(user.name[0].toUpperCase()) : icon('user')}</div>
          <div><h2>${first ? 'Izveido savu kontu' : 'Tavs konts'}</h2>
          <p class="hint">Aplikācija pielāgos questus, ieteikumus un uzrunu tieši tev.</p></div>
        </div>
        <div class="row">
          <label>Vārds <input id="accName" value="${esc(user.name || '')}" placeholder="Kā tevi sauc?" autocomplete="given-name"></label>
          <label style="flex:.55">Vecums <input id="accAge" type="number" inputmode="numeric" min="5" max="110" value="${esc(user.age || '')}" placeholder="—"></label>
        </div>
        <div class="acc-label">Kas tev patīk?</div>
        <div class="pick" id="accInterests">${INTERESTS.map(i => `<button type="button" class="chip${chosen.has(i) ? ' active' : ''}" data-v="${esc(i)}">${esc(i)}</button>`).join('')}</div>
        <div class="acc-label">Ko gribi uzlabot?</div>
        <div class="pick" id="accFocus">${SKILLS.map(s => `<button type="button" class="chip skill-chip${focus.has(s.id) ? ' active' : ''}" style="--c:${s.color}" data-v="${s.id}">${icon(s.icon)}${esc(s.name)}</button>`).join('')}</div>
        <label>Pastāsti vēl (mērķi, ikdiena…)
          <textarea id="accAbout" rows="3" placeholder="Piem.: mācos 11. klasē, gribu labāk gulēt un vairāk lasīt.">${esc(user.about || '')}</textarea>
        </label>
        <div class="actions">
          <button type="button" class="primary" id="accSave">${first ? 'Sākt' : 'Saglabāt'}</button>
          <button type="button" class="secondary" id="accClose">${first ? 'Vēlāk' : 'Aizvērt'}</button>
        </div>
        <p class="hint small">Konts glabājas tikai šajā ierīcē — nekas netiek sūtīts uz serveri.</p>
        ${first ? '' : `<button type="button" class="link danger" id="accWipe">${icon('trash')} Dzēst visus datus</button>`}
      </div>`;
    document.body.appendChild(el);
    el.querySelectorAll('.pick .chip').forEach(b => b.addEventListener('click', () => b.classList.toggle('active')));
    const close = () => { el.classList.add('out'); setTimeout(() => el.remove(), 250); };
    el.querySelector('#accClose').addEventListener('click', () => { if (first) { user.skipped = true; saveUser(); } close(); });
    el.querySelector('#accSave').addEventListener('click', () => {
      const name = el.querySelector('#accName').value.trim();
      if (!name) return toast('Ieraksti savu vārdu');
      const age = parseInt(el.querySelector('#accAge').value, 10);
      user = {
        ...user, name, age: age >= 5 && age <= 110 ? age : null,
        interests: [...el.querySelectorAll('#accInterests .active')].map(b => b.dataset.v),
        focus: [...el.querySelectorAll('#accFocus .active')].map(b => b.dataset.v),
        about: el.querySelector('#accAbout').value.trim(),
        created: user.created || new Date().toISOString(),
      };
      saveUser(); refreshQuests(); renderAll(); close();
      toast(first ? `Prieks iepazīties, ${name}!` : 'Konts saglabāts');
    });
    el.querySelector('#accWipe')?.addEventListener('click', () => {
      if (!confirm('Dzēst kontu, visus uzdevumus un progresu? To nevarēs atsaukt.')) return;
      try { Object.keys(localStorage).filter(k => k.startsWith('planotajs.')).forEach(k => localStorage.removeItem(k)); } catch {}
      location.reload();
    });
  }

  function renderAll() { applyUser(); renderPlayer(); renderQuests(); renderTree(); }

  window.Game = { openAccount, user: () => user, award, awardForTask, renderAll, SKILLS, CAT_SKILL, colorFor: cat => SKILL[CAT_SKILL[cat] || 'miers'].color, bumpStreak: () => { bumpStreak(); save(); renderPlayer(); } };
  document.addEventListener('DOMContentLoaded', () => {
    ensureQuests(); renderAll();
    if (!user.name && !user.skipped) openAccount(true);
  });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) renderAll(); });
})();
