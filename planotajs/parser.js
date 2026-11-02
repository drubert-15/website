// Lokālais (bez AI) parsētājs: atrod latviešu tekstā uzdevumus, datumus un laikus.
(function () {
  const SHELVES = ['Darbs', 'Mājas & ģimene', 'Veselība', 'Mācības', 'Brīvais laiks', 'Cits'];

  const KEYWORDS = {
    'Darbs': ['sapulc', 'darb', 'klient', 'projekt', 'prezentāc', 'atskait', 'e-pas', 'epast', 'kolēģ', 'termiņ', 'līgum', 'intervij', 'priekšniek', 'birojs', 'birojā', 'zoom', 'teams', 'meeting'],
    'Veselība': ['ārst', 'zobārst', 'slimnīc', 'aptiek', 'zāles', 'treniņ', 'sport', 'poliklīn', 'analīz', 'vingr', 'skrie', 'baseins', 'joga', 'masāž', 'vizīt'],
    'Mācības': ['lekcij', 'eksām', 'mājasdarb', 'skol', 'kurs', 'kontroldarb', 'ieskait', 'mācī', 'seminār', 'referāt', 'kursa darb'],
    'Mājas & ģimene': ['nopirk', 'veikal', 'iepirk', 'tīrīt', 'mazgāt', 'māj', 'bērn', 'dzimšanas', 'ģimen', 'mamm', 'tēt', 'vecmām', 'vectēv', 'aizvest', 'pakaļ', 'rēķin', 'samaksā', 'maksāt', 'piens', 'pienu', 'maize', 'suns', 'suni', 'kaķ', 'remont', 'dārz'],
    'Brīvais laiks': ['kino', 'koncert', 'ballīt', 'draug', 'tikšan', 'vakariņ', 'kafij', 'teātr', 'izrād', 'spēle', 'spēli', 'ceļojum', 'brauciens', 'pikniks', 'restorān'],
  };

  const MONTHS = ['janv', 'febr', 'mart', 'apr', 'maij', 'jūn', 'jūl', 'aug', 'sept', 'okt', 'nov', 'dec'];
  const WEEKDAYS = ['svētdien', 'pirmdien', 'otrdien', 'trešdien', 'ceturtdien', 'piektdien', 'sestdien'];
  const L = '\\p{L}';
  const W = `(?<![${L}])`; // vārda sākums (unicode)

  function guessCategory(text) {
    const t = text.toLowerCase();
    for (const [cat, words] of Object.entries(KEYWORDS)) {
      if (words.some(w => t.includes(w))) return cat;
    }
    return 'Cits';
  }

  // Svarīgums: 3 = svarīgs, 2 = vidējs, 1 = var pagaidīt
  const HIGH = ['steidz', 'svarīg', 'obligāt', 'noteikti', 'termiņ', 'deadline', 'asap', 'eksām', 'ārst', 'zobārst', 'slimnīc', 'intervij', 'rēķin', 'samaksā', 'īr', 'līgum', 'iesniegt', 'nodot', 'lidmašīn', 'reiss', 'kontroldarb', '!!'];
  const LOW = ['varbūt', 'ja sanāk', 'ja būs laiks', 'kādreiz', 'pēc iespējas', 'nav steidz', 'nav svarīg', 'ja gribas', 'izdomāt'];
  function guessPriority(text, category) {
    const t = text.toLowerCase();
    if (LOW.some(w => t.includes(w))) return 1;
    if (HIGH.some(w => t.includes(w)) || /!\s*$/.test(t)) return 3;
    if (category === 'Brīvais laiks') return 1;
    return 2;
  }

  const pad = n => String(n).padStart(2, '0');
  const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

  // Atrod datumu segmentā. Atgriež { date: Date, match: string } vai null.
  function findDate(s, now) {
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let m;
    if ((m = s.match(new RegExp(`${W}(aizparīt)`, 'iu')))) return { date: addDays(today, 3), match: m[0] };
    if ((m = s.match(new RegExp(`${W}(parīt)`, 'iu')))) return { date: addDays(today, 2), match: m[0] };
    if ((m = s.match(new RegExp(`${W}(rīt|rītdien)(?![${L}])`, 'iu')))) return { date: addDays(today, 1), match: m[0] };
    if ((m = s.match(new RegExp(`${W}(šodien|šovakar|šorīt)`, 'iu')))) return { date: today, match: m[0] };

    // 2026-11-15
    if ((m = s.match(/(\d{4})-(\d{1,2})-(\d{1,2})/))) return { date: new Date(+m[1], +m[2] - 1, +m[3]), match: m[0] };
    // 15.11.2026 / 15.11. / 15.11 / 15/11
    if ((m = s.match(/(?<![\d:])(\d{1,2})[./](\d{1,2})(?:[./](\d{2,4}))?\.?(?![\d:])/))) {
      const d = +m[1], mo = +m[2];
      if (d >= 1 && d <= 31 && mo >= 1 && mo <= 12) {
        let y = m[3] ? +m[3] : today.getFullYear();
        if (y < 100) y += 2000;
        let date = new Date(y, mo - 1, d);
        if (!m[3] && date < today) date = new Date(y + 1, mo - 1, d);
        return { date, match: m[0] };
      }
    }
    // 15. novembrī / 15 nov
    if ((m = s.match(new RegExp(`(\\d{1,2})\\.?\\s*(${MONTHS.join('|')})[${L}]*\\.?`, 'iu')))) {
      const mo = MONTHS.findIndex(x => m[2].toLowerCase().startsWith(x));
      let date = new Date(today.getFullYear(), mo, +m[1]);
      if (date < today) date = new Date(today.getFullYear() + 1, mo, +m[1]);
      return { date, match: m[0] };
    }
    // nākamnedēļ
    if ((m = s.match(new RegExp(`${W}nākam(?:o|ajā|ā)?\\s*nedēļ[${L}]*`, 'iu')))) {
      const dow = today.getDay() || 7;
      return { date: addDays(today, 8 - dow), match: m[0] };
    }
    // pirmdien, otrdienā, nākamajā piektdienā ...
    const wd = new RegExp(`${W}(?:(nākam[${L}]*|šo|šajā)\\s+)?(${WEEKDAYS.join('|')})[${L}]*`, 'iu');
    if ((m = s.match(wd))) {
      const target = WEEKDAYS.indexOf(m[2].toLowerCase());
      let diff = (target - today.getDay() + 7) % 7;
      if (diff === 0) diff = 7;
      return { date: addDays(today, diff), match: m[0], weekday: true };
    }
    return null;
  }

  // Atrod laiku. Atgriež { h, min, match } vai null.
  function findTime(s) {
    let m;
    // pēc 2 stundām / pēc 30 min
    if ((m = s.match(new RegExp(`${W}pēc\\s+(\\d+)\\s*(stund[${L}]*|h|min[${L}]*)`, 'iu')))) {
      return { relativeMin: /^(stund|h)/i.test(m[2]) ? +m[1] * 60 : +m[1], match: m[0] };
    }
    // plkst. 18 / plkst 9.30 / pl. 18:00
    if ((m = s.match(/(?:plkst|pulksten[\p{L}]*|pl)\.?\s*(\d{1,2})(?:[:.](\d{2}))?/iu))) {
      const h = +m[1], min = m[2] ? +m[2] : 0;
      if (h < 24 && min < 60) return { h, min, match: m[0] };
    }
    // 18:30 / 9:00
    if ((m = s.match(/(?<!\d)(\d{1,2}):(\d{2})(?!\d)/))) {
      const h = +m[1], min = +m[2];
      if (h < 24 && min < 60) return { h, min, match: m[0] };
    }
    // 9os / 18os
    if ((m = s.match(/(?<!\d)(\d{1,2})\s*(?:os|ōs)(?![\p{L}])/iu))) {
      const h = +m[1];
      if (h < 24) return { h, min: 0, match: m[0] };
    }
    // diennakts daļas
    const parts = [
      [/no rīta|šorīt|rīta pusē/iu, 9],
      [/pusdienlaikā|pusdienās/iu, 12],
      [/pēcpusdienā/iu, 15],
      [/vakarā|šovakar/iu, 19],
    ];
    for (const [re, h] of parts) {
      if ((m = s.match(re))) return { h, min: 0, match: m[0], vague: true };
    }
    return null;
  }

  function cleanTitle(s, matches) {
    let t = s;
    for (const m of matches) if (m) t = t.replace(m, ' ');
    t = t
      .replace(/(?<![\p{L}])(plkst|pl|no rīta|vakarā|pēcpusdienā|datumā)\.?(?=\s|$)/giu, ' ')
      .replace(/(?<![\p{L}])(neaizmirst(i)?|atgādini|atgādināt|vajag|man|jā|katru|ik)(?![\p{L}])/giu, ' ')
      .replace(/(?<![\p{L}])(steidzami|ļoti svarīgi|svarīgi|obligāti|ja sanāk|ja būs laiks|varbūt)(?![\p{L}])!*/giu, ' ')
      .replace(/\s+/g, ' ')
      .replace(/^[\s,.;:!–\-]+|[\s,.;:!–\-]+$/g, '')
      .trim();
    if (!t) t = s.trim();
    return t.charAt(0).toUpperCase() + t.slice(1);
  }

  // Sadala tekstu teikumos/rindās, tad pēc komatiem, ja katrā daļā ir savs datums/laiks.
  function segments(text) {
    const sentences = text
      .split(/\n+|;|(?<=[!?])\s+|(?<=[^\d\s.]\.)\s+(?=\p{Lu})/u)
      .map(s => s.trim())
      .filter(Boolean);
    const out = [];
    for (const sent of sentences) {
      const pieces = sent.split(/,\s+|\s+un\s+(?=(?:rīt|parīt|šodien|\d|plkst|pirmdien|otrdien|trešdien|ceturtdien|piektdien|sestdien|svētdien))/iu);
      let current = null;
      for (const p of pieces) {
        const has = findDate(p, new Date()) || findTime(p);
        if (current && !has) current += ', ' + p;
        else { if (current) out.push(current); current = p; }
      }
      if (current) out.push(current);
    }
    return out
      .map(s => ({ bullet: /^(?:[-•*]+|\d+\))\s*/u.test(s), text: s.replace(/^(?:[-•*]+|\d+\))\s*/u, '').trim() }))
      .filter(s => s.text.length > 1);
  }

  // Atkārtošanās: katru dienu / katru pirmdienu / katru mēnesi ...
  function findRepeat(s) {
    let m;
    if ((m = s.match(/(?<![\p{L}])(katru|ik)\s*(dienu|dienas|rītu|vakaru|darba\s*dienu)|(?<![\p{L}])ikdienā|(?<![\p{L}])daily/iu))) return { repeat: 'daily', match: m[0] };
    if ((m = s.match(/(?<![\p{L}])(katru|ik)\s*(mēnesi|mēnesī|mēneša)|(?<![\p{L}])monthly/iu))) return { repeat: 'monthly', match: m[0] };
    if ((m = s.match(/(?<![\p{L}])(katru|ik)\s*(nedēļu|nedēļas|pirmdien\p{L}*|otrdien\p{L}*|trešdien\p{L}*|ceturtdien\p{L}*|piektdien\p{L}*|sestdien\p{L}*|svētdien\p{L}*)|(?<![\p{L}])weekly/iu))) {
      return { repeat: 'weekly', match: /nedēļ|weekly/i.test(m[0]) ? m[0] : m[0].replace(/^(katru|ik)\s*/i, ''), keepWeekday: !/nedēļ|weekly/i.test(m[0]) };
    }
    return null;
  }

  function parse(text, now = new Date()) {
    const tasks = [];
    for (const { text: seg, bullet } of segments(text)) {
      const rep = findRepeat(seg);
      let d0 = seg;
      if (rep && !rep.keepWeekday) d0 = seg.replace(rep.match, ' ');
      const d = findDate(d0, now) || (rep && rep.repeat === 'monthly' ? monthDay(seg, now) : null);
      const tt = findTime(seg);
      // Punkts bez laika zem iepriekšējā uzdevuma = plāna solis
      if (bullet && !d && !tt && !rep && tasks.length) { tasks[tasks.length - 1].steps.push(cleanTitle(seg, [])); continue; }
      const t = tt;
      let date = d ? d.date : null;
      let time = null;
      let guessed = false;

      if (t && t.relativeMin != null) {
        const at = new Date(now.getTime() + t.relativeMin * 60000);
        date = new Date(at.getFullYear(), at.getMonth(), at.getDate());
        time = `${pad(at.getHours())}:${pad(at.getMinutes())}`;
      } else if (t) {
        time = `${pad(t.h)}:${pad(t.min)}`;
        guessed = !!t.vague;
        if (!date) {
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const at = new Date(today); at.setHours(t.h, t.min);
          date = at > now ? today : addDays(today, 1);
        }
      } else if (date) {
        time = '09:00';
        guessed = true;
      }

      if (rep && !date && !t) { date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1); time = '09:00'; guessed = true; }
      if (rep && date && !time) time = '09:00';
      tasks.push({
        title: cleanTitle(seg, [rep && rep.match, d && d.match, t && t.match]),
        repeat: rep ? rep.repeat : 'none',
        steps: [],
        date: date ? ymd(date) : '',
        time: time || '',
        category: guessCategory(seg),
        priority: guessPriority(seg, guessCategory(seg)),
        note: '',
        uncertain: !date || guessed,
      });
    }
    return { summary: buildSummary(tasks), tasks };
  }

  // "katru mēnesi 5. datumā"
  function monthDay(s, now) {
    const m = s.match(/(\d{1,2})\.?\s*(datum\p{L}*|dien\p{L}*)/iu);
    if (!m) return null;
    let date = new Date(now.getFullYear(), now.getMonth(), +m[1]);
    if (date < new Date(now.getFullYear(), now.getMonth(), now.getDate())) date = new Date(now.getFullYear(), now.getMonth() + 1, +m[1]);
    return { date, match: m[0] };
  }

  // Vienkāršs plāna sadalītājs bez AI: teksts -> soļi
  function splitSteps(text) {
    return String(text || '')
      .split(/\n+|;|:\s+|,\s+|(?<=\p{L})\.\s+|\s+(?:un tad|tad|pēc tam)\s+/iu)
      .map(x => x.replace(/^(?:[-•*]+|\d+[.)])\s*/u, '').replace(/[.\s]+$/, '').trim())
      .filter(x => x.length > 2)
      .map(x => x.charAt(0).toUpperCase() + x.slice(1));
  }

  function buildSummary(tasks) {
    if (!tasks.length) return 'Neatradu nevienu uzdevumu.';
    const counts = {};
    tasks.forEach(t => { counts[t.category] = (counts[t.category] || 0) + 1; });
    const parts = Object.entries(counts).map(([c, n]) => `${c}: ${n}`).join(', ');
    const missing = tasks.filter(t => t.uncertain).length;
    let s = `Atradu ${tasks.length} uzdevumu(s) — ${parts}.`;
    const rep = tasks.filter(t => t.repeat !== 'none').length;
    if (rep) s += ` ${rep} atkārtojas regulāri.`;
    if (missing) s += ` ${missing} vajag pārbaudīt laiku.`;
    return s;
  }

  window.LocalParser = { parse, SHELVES, guessCategory, guessPriority, splitSteps };
})();
