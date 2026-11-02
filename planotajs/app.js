const { SHELVES } = window.LocalParser;
const STORE = 'planotajs.tasks.v1';
const KEY_STORE = 'planotajs.apikey';
const $ = s => document.querySelector(s);
const pad = n => String(n).padStart(2, '0');

// ---------- Glabāšana ----------
function load() {
  try { return JSON.parse(localStorage.getItem(STORE)) || []; } catch { return []; }
}
function save() {
  try { localStorage.setItem(STORE, JSON.stringify(tasks)); } catch { toast('Neizdevās saglabāt'); }
}
let tasks = load();
let activeShelf = 'Visi';

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const startOf = t => new Date(`${t.date}T${t.time || '09:00'}`);
const remindAt = t => new Date(startOf(t).getTime() - (Number(t.remind) || 0) * 60000);

function addTask(t) {
  tasks.push({ id: uid(), done: false, notified: {}, remind: 15, note: '', category: 'Cits', repeat: 'none', steps: [], ...t });
}
const PRIO = { 3: { label: '🔥 Svarīgi', short: 'svarīgi', cls: 'p3' }, 2: { label: '● Vidēji', short: 'vidēji', cls: 'p2' }, 1: { label: '○ Var pagaidīt', short: 'var pagaidīt', cls: 'p1' } };
// Efektīvais svarīgums: tuvojošies (< 24 h) vai nokavēti uzdevumi paceļas par līmeni.
function importance(t) {
  const base = Number(t.priority) || 2;
  const left = startOf(t) - Date.now();
  return Math.min(3, base + (left < 86400000 ? 1 : 0));
}
const REPEAT_LABEL = { daily: 'katru dienu', weekly: 'katru nedēļu', monthly: 'katru mēnesi' };
const toSteps = arr => (arr || []).map(x => (typeof x === 'string' ? { text: x, done: false } : x)).filter(x => x.text && x.text.trim());

// Pārceļ atkārtotu uzdevumu uz nākamo reizi.
function advance(t) {
  const d = new Date(t.date + 'T00:00');
  if (t.repeat === 'daily') d.setDate(d.getDate() + 1);
  else if (t.repeat === 'weekly') d.setDate(d.getDate() + 7);
  else if (t.repeat === 'monthly') {
    const day = t.day || d.getDate();
    t.day = day;
    d.setDate(1); d.setMonth(d.getMonth() + 1);
    d.setDate(Math.min(day, new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()));
  } else return;
  t.date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  t.notified = {};
  t.done = false;
  (t.steps || []).forEach(x => { x.done = false; x.xp = false; });
}
// Ja atkārtota uzdevuma laiks pagājis (pirms > 1 h), pāriet uz nākamo reizi.
function rollRecurring() {
  let changed = false;
  const limit = Date.now() - 3600000;
  for (const t of tasks) {
    if (!t.repeat || t.repeat === 'none') continue;
    let guard = 0;
    while (startOf(t).getTime() < limit && guard++ < 400) { advance(t); changed = true; }
  }
  if (changed) save();
}

// ---------- UI pamati ----------
function toast(msg) {
  const el = $('#toast');
  el.textContent = msg; el.hidden = false;
  clearTimeout(toast.t); toast.t = setTimeout(() => (el.hidden = true), 2600);
}
function showView(name) {
  document.querySelectorAll('.tab').forEach(b => b.classList.toggle('active', b.dataset.view === name));
  document.querySelectorAll('.view').forEach(v => v.classList.toggle('active', v.id === 'view-' + name));
  if (name === 'list') render();
  if (name === 'quests' || name === 'tree') window.Game.renderAll();
  window.scrollTo(0, 0);
}
document.querySelectorAll('.tab').forEach(b => b.addEventListener('click', () => showView(b.dataset.view)));

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const catOptions = sel => SHELVES.map(c => `<option${c === sel ? ' selected' : ''}>${esc(c)}</option>`).join('');
$('#taskForm [name=category]').innerHTML = catOptions('Cits');

const DAYS = ['svētdiena', 'pirmdiena', 'otrdiena', 'trešdiena', 'ceturtdiena', 'piektdiena', 'sestdiena'];
const MONTHS = ['janvāris', 'februāris', 'marts', 'aprīlis', 'maijs', 'jūnijs', 'jūlijs', 'augusts', 'septembris', 'oktobris', 'novembris', 'decembris'];
function dayLabel(dateStr) {
  const d = new Date(dateStr + 'T00:00');
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const diff = Math.round((d - today) / 86400000);
  const name = diff === 0 ? 'Šodien' : diff === 1 ? 'Rīt' : diff === -1 ? 'Vakar' : DAYS[d.getDay()][0].toUpperCase() + DAYS[d.getDay()].slice(1);
  return `${name} <small>${d.getDate()}. ${MONTHS[d.getMonth()]}</small>`;
}
const remindLabel = m => ({ 0: 'laikā', 5: '5 min', 15: '15 min', 30: '30 min', 60: '1 h', 180: '3 h', 1440: '1 d' }[m] ?? m + ' min');

// ---------- Dienasgrāmatas saraksts ----------
function render() {
  const showDone = $('#showDone').checked;
  const counts = { Visi: tasks.filter(t => !t.done).length };
  SHELVES.forEach(c => (counts[c] = tasks.filter(t => !t.done && t.category === c).length));
  counts['🔁 Regulārie'] = tasks.filter(t => t.repeat && t.repeat !== 'none').length;
  $('#shelves').innerHTML = ['Visi', '🔁 Regulārie', ...SHELVES]
    .filter(c => c === 'Visi' || counts[c])
    .map(c => `<button class="chip${c === activeShelf ? ' active' : ''}" data-shelf="${esc(c)}">${esc(c)} · ${counts[c]}</button>`)
    .join('');
  $('#shelves').querySelectorAll('[data-shelf]').forEach(b => b.addEventListener('click', () => { activeShelf = b.dataset.shelf; render(); }));

  const list = tasks
    .filter(t => (showDone || !t.done) && (activeShelf === 'Visi' || t.category === activeShelf || (activeShelf === '🔁 Regulārie' && t.repeat && t.repeat !== 'none')))
    .sort((a, b) => startOf(a) - startOf(b));

  if (!list.length) {
    $('#list').innerHTML = `<div class="empty">Te vēl nekā nav.<br>Pievieno uzdevumu vai iemet tekstu 📥</div>`;
    return;
  }
  const now = new Date();
  const byImportance = activeShelf !== 'Visi';
  if (byImportance) list.sort((a, b) => (a.done - b.done) || (importance(b) - importance(a)) || (startOf(a) - startOf(b)));
  let html = '', lastDay = '';
  for (const t of list) {
    const group = byImportance ? (t.done ? 'Izpildīti' : PRIO[importance(t)].label) : t.date;
    if (group !== lastDay) { html += `<div class="day">${byImportance ? esc(group) : dayLabel(t.date)}</div>`; lastDay = group; }
    const overdue = !t.done && startOf(t) < now;
    html += `
      <div class="task${t.done ? ' done' : ''}${overdue ? ' overdue' : ''}" data-id="${t.id}" style="--c:${window.Game.colorFor(t.category)}">
        <input type="checkbox" ${t.done ? 'checked' : ''} aria-label="Izpildīts">
        <div class="t-body">
          <div class="t-title">${esc(t.title)}</div>
          <div class="t-meta"><span class="prio ${PRIO[importance(t)].cls}" title="${PRIO[importance(t)].short}"></span><span class="t-time">${byImportance ? esc(shortDate(t.date)) + ' · ' : ''}${esc(t.time)}</span><span class="tag" style="--c:${window.Game.colorFor(t.category)}">${esc(t.category)}</span><span>🔔 ${remindLabel(Number(t.remind))}</span>${t.repeat && t.repeat !== 'none' ? `<span class="rep">🔁 ${REPEAT_LABEL[t.repeat]}</span>` : ''}</div>
          ${t.note ? `<div class="t-note">${esc(t.note)}</div>` : ''}
          ${stepsHtml(t)}
        </div>
        <div class="t-actions">
          <button data-act="edit" aria-label="Labot">✏️</button>
          <button data-act="ics" aria-label="Uz kalendāru">📆</button>
          <button data-act="del" class="danger" aria-label="Dzēst">🗑</button>
        </div>
      </div>`;
  }
  $('#list').innerHTML = html;
}
function shortDate(d) {
  const x = new Date(d + 'T00:00');
  return `${x.getDate()}. ${MONTHS[x.getMonth()].slice(0, 3)}.`;
}
function stepsHtml(t) {
  const st = t.steps || [];
  if (!st.length) return '';
  const done = st.filter(x => x.done).length;
  return `<ul class="steps">${st.map((x, i) => `<li class="${x.done ? 'ok' : ''}"><input type="checkbox" data-step="${i}" ${x.done ? 'checked' : ''}><span>${esc(x.text)}</span></li>`).join('')}</ul>
    <div class="progress" title="${done}/${st.length}"><div style="width:${Math.round((done / st.length) * 100)}%"></div></div>`;
}
$('#showDone').addEventListener('change', render);
$('#list').addEventListener('click', e => {
  const row = e.target.closest('.task'); if (!row) return;
  const t = tasks.find(x => x.id === row.dataset.id); if (!t) return;
  if (e.target.dataset.step != null) {
    const step = t.steps[Number(e.target.dataset.step)];
    step.done = e.target.checked;
    if (step.done && !step.xp) { step.xp = true; window.Game.award(window.Game.CAT_SKILL[t.category] || 'miers', 5, 'solis'); }
    save(); render(); return;
  }
  if (e.target.type === 'checkbox') {
    if (e.target.checked && t.repeat && t.repeat !== 'none') {
      const gain = window.Game.awardForTask(t.category, t.priority);
      window.Game.bumpStreak();
      advance(t); toast(`+${gain} XP ✓ Nākamā reize: ${t.date.split('-').reverse().join('.')} ${t.time}`);
    } else {
      t.done = e.target.checked;
      if (t.done && !t.xpGiven) {
        t.xpGiven = true;
        const gain = window.Game.awardForTask(t.category, t.priority);
        window.Game.bumpStreak();
        toast(`+${gain} XP ✓`);
      }
    }
    save(); render(); return;
  }
  const act = e.target.closest('button')?.dataset.act;
  if (act === 'del' && confirm(`Dzēst „${t.title}”?`)) { tasks = tasks.filter(x => x !== t); save(); render(); }
  if (act === 'edit') editTask(t);
  if (act === 'ics') shareIcs([t], t.title);
});

// ---------- Forma ----------
const form = $('#taskForm');
function resetForm() {
  form.reset();
  form.id.value = '';
  const d = new Date(Date.now() + 3600000);
  form.date.value = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  form.time.value = `${pad(d.getHours())}:00`;
  $('#cancelEdit').hidden = true;
}
function editTask(t) {
  form.id.value = t.id; form.title.value = t.title; form.date.value = t.date; form.time.value = t.time;
  form.category.value = t.category; form.remind.value = String(t.remind); form.note.value = t.note || '';
  form.priority.value = t.priorityAuto ? 'auto' : String(t.priority || 2);
  form.repeat.value = t.repeat || 'none'; form.steps.value = (t.steps || []).map(x => x.text).join('\n');
  $('#cancelEdit').hidden = false;
  showView('add');
}
$('#cancelEdit').addEventListener('click', () => { resetForm(); showView('list'); });
form.addEventListener('submit', e => {
  e.preventDefault();
  const data = {
    title: form.title.value.trim(), date: form.date.value, time: form.time.value,
    category: form.category.value, remind: Number(form.remind.value), note: form.note.value.trim(),
    repeat: form.repeat.value,
  };
  data.priorityAuto = form.priority.value === 'auto';
  data.priority = data.priorityAuto
    ? window.LocalParser.guessPriority(`${data.title} ${data.note}`, data.category)
    : Number(form.priority.value);
  const existing = tasks.find(t => t.id === form.id.value);
  const lines = form.steps.value.split('\n').map(x => x.trim()).filter(Boolean);
  const old = existing ? existing.steps || [] : [];
  data.steps = lines.map(text => ({ text, done: !!old.find(o => o.text === text && o.done) }));
  if (data.repeat === 'monthly') data.day = Number(data.date.slice(8));
  if (existing) Object.assign(existing, data, { notified: {} });
  else addTask(data);
  save(); scheduleTriggers(); resetForm();
  toast(existing ? 'Izmaiņas saglabātas' : 'Pievienots ✓');
  showView('list');
});
resetForm();

$('#planBtn').addEventListener('click', async () => {
  const title = form.title.value.trim(), note = form.note.value.trim();
  if (!title && !note) return toast('Vispirms uzraksti, kas jāizdara');
  const key = (() => { try { return localStorage.getItem(KEY_STORE) || ''; } catch { return ''; } })();
  const btn = $('#planBtn');
  let steps = [];
  if (key) {
    btn.disabled = true; btn.textContent = '✨ Sastādu plānu…';
    try { steps = await planWithClaude(title, note, form.repeat.value, key); }
    catch (err) { toast('AI neizdevās, sadalu vienkārši'); }
    finally { btn.disabled = false; btn.textContent = '✨ Sastādīt plānu no apraksta'; }
  }
  if (!steps.length) steps = window.LocalParser.splitSteps(note || title);
  if (!steps.length) return toast('Uzraksti aprakstu ar vairāk detaļām');
  form.steps.value = steps.join('\n');
  if (!key) toast('Sadalīju pa punktiem. Gudrākam plānam pievieno AI atslēgu „Iemest tekstu” sadaļā.');
});

// ---------- Iemest tekstu ----------
const keyInput = $('#apiKey');
try { keyInput.value = localStorage.getItem(KEY_STORE) || ''; } catch {}
$('#saveKey').addEventListener('click', () => {
  try { localStorage.setItem(KEY_STORE, keyInput.value.trim()); toast('Atslēga saglabāta'); } catch { toast('Neizdevās saglabāt'); }
});

let preview = [];
$('#parseBtn').addEventListener('click', async () => {
  const text = $('#dumpText').value.trim();
  if (!text) return toast('Vispirms ielīmē tekstu');
  const mode = $('#dumpMode').value;
  const status = $('#dumpStatus');
  const btn = $('#parseBtn');
  let result;
  if (mode === 'ai') {
    const key = keyInput.value.trim();
    if (!key) { $('#keyBox').open = true; return toast('Ievadi API atslēgu vai izvēlies „Bez AI”'); }
    btn.disabled = true; status.textContent = '✨ AI lasa tekstu…';
    try { result = await parseWithClaude(text, key); }
    catch (err) {
      status.textContent = `AI neizdevās (${err.message || err}). Izmantoju ātro režīmu.`;
      result = window.LocalParser.parse(text);
    } finally { btn.disabled = false; }
    if (result && !status.textContent.startsWith('AI neizdevās')) status.textContent = '';
  } else {
    result = window.LocalParser.parse(text);
    status.textContent = '';
  }
  preview = result.tasks.map(t => ({ ...t, priority: Number(t.priority) || window.LocalParser.guessPriority(t.title + ' ' + (t.note || ''), t.category), repeat: t.repeat || 'none', steps: t.steps || [], include: true, remind: 15 }));
  renderPreview(result.summary);
});

function renderPreview(summary) {
  const byShelf = {};
  preview.forEach((t, i) => (byShelf[t.category] ||= []).push(i));
  Object.values(byShelf).forEach(ix => ix.sort((a, b) => (preview[b].priority - preview[a].priority) || `${preview[a].date}${preview[a].time}`.localeCompare(`${preview[b].date}${preview[b].time}`)));
  let html = `<div class="summary"><strong>Kopsavilkums:</strong> ${esc(summary)}</div><div class="preview">`;
  for (const cat of SHELVES) {
    if (!byShelf[cat]) continue;
    html += `<div class="day">📁 ${esc(cat)}</div>`;
    for (const i of byShelf[cat]) {
      const t = preview[i];
      html += `
        <div class="task" data-i="${i}">
          <input type="checkbox" data-f="include" ${t.include ? 'checked' : ''} aria-label="Iekļaut">
          <div class="t-body">
            <input data-f="title" value="${esc(t.title)}">
            <div class="row" style="margin-top:6px">
              <input type="date" data-f="date" value="${esc(t.date)}">
              <input type="time" data-f="time" value="${esc(t.time)}">
            </div>
            <div class="row" style="margin-top:6px">
              <select data-f="category">${catOptions(t.category)}</select>
              <select data-f="priority">${[3, 2, 1].map(p => `<option value="${p}"${p === Number(t.priority) ? ' selected' : ''}>${PRIO[p].label}</option>`).join('')}</select>
            </div>
            <div class="row" style="margin-top:6px">
              <select data-f="repeat">${['none', 'daily', 'weekly', 'monthly'].map(r => `<option value="${r}"${r === t.repeat ? ' selected' : ''}>${r === 'none' ? 'Vienreiz' : '🔁 ' + REPEAT_LABEL[r]}</option>`).join('')}</select>
            </div>
            ${t.steps.length ? `<ul class="steps">${t.steps.map(x => `<li><span>• ${esc(x)}</span></li>`).join('')}</ul>` : ''}
            ${t.uncertain ? '<div class="t-meta" style="color:var(--warn)">⚠ Pārbaudi datumu/laiku</div>' : ''}
          </div>
        </div>`;
    }
  }
  html += `</div>`;
  if (preview.length) html += `<div class="actions"><button class="primary" id="savePreview" type="button">Saglabāt atzīmētos (${preview.filter(t => t.include).length})</button></div>`;
  $('#dumpResult').innerHTML = html;
  $('#savePreview')?.addEventListener('click', savePreview);
}
$('#dumpResult').addEventListener('change', e => {
  const row = e.target.closest('[data-i]'); const f = e.target.dataset.f;
  if (!row || !f) return;
  const t = preview[Number(row.dataset.i)];
  t[f] = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
  if (f === 'priority') t.priority = Number(t.priority);
  if (f === 'category' || f === 'include' || f === 'priority') renderPreview($('.summary')?.textContent.replace(/^Kopsavilkums:\s*/, '') || '');
});
function savePreview() {
  const chosen = preview.filter(t => t.include);
  const bad = chosen.filter(t => !t.date || !t.time || !t.title.trim());
  if (bad.length) return toast(`${bad.length} uzdevumiem trūkst nosaukuma, datuma vai laika`);
  chosen.forEach(t => addTask({
    title: t.title.trim(), date: t.date, time: t.time, category: t.category, note: t.note || '', remind: t.remind,
    repeat: t.repeat, steps: toSteps(t.steps), priority: Number(t.priority) || 2, ...(t.repeat === 'monthly' ? { day: Number(t.date.slice(8)) } : {}),
  }));
  save(); scheduleTriggers();
  preview = []; $('#dumpResult').innerHTML = ''; $('#dumpText').value = '';
  toast(`Pievienoti ${chosen.length} uzdevumi ✓`);
  showView('list');
}

// AI režīms: Claude izvelk uzdevumus kā strukturētu JSON.
const TASK_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['summary', 'tasks'],
  properties: {
    summary: { type: 'string', description: 'Īss kopsavilkums latviski (1–3 teikumi).' },
    tasks: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['title', 'date', 'time', 'category', 'priority', 'repeat', 'steps', 'note', 'uncertain'],
        properties: {
          title: { type: 'string', description: 'Īss uzdevuma nosaukums latviski.' },
          date: { type: 'string', description: 'YYYY-MM-DD vai tukšs, ja nav zināms.' },
          time: { type: 'string', description: 'HH:MM (24h) vai tukšs, ja nav zināms.' },
          category: { type: 'string', enum: SHELVES },
          priority: { type: 'integer', enum: [1, 2, 3], description: '3 = svarīgs (termiņi, veselība, nauda, citi cilvēki atkarīgi), 2 = vidējs, 1 = var pagaidīt.' },
          repeat: { type: 'string', enum: ['none', 'daily', 'weekly', 'monthly'], description: 'Vai uzdevums atkārtojas.' },
          steps: { type: 'array', items: { type: 'string' }, description: 'Konkrēti plāna punkti (2–6), ja uzdevums ir lielāks vai ir mērķis; citādi tukšs.' },
          note: { type: 'string', description: 'Svarīgas detaļas (vieta, cilvēki, ko paņemt), vai tukšs.' },
          uncertain: { type: 'boolean', description: 'true, ja datums vai laiks bija jāmin.' },
        },
      },
    },
  },
};

async function claudeClient(apiKey) {
  const { default: Anthropic } = await import('https://esm.sh/@anthropic-ai/sdk');
  return new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
}
function readJson(response) {
  if (response.stop_reason === 'refusal') throw new Error('AI atteicās apstrādāt šo tekstu');
  if (response.stop_reason === 'max_tokens') throw new Error('teksts par garu');
  const block = response.content.find(b => b.type === 'text');
  if (!block) throw new Error('tukša atbilde');
  return JSON.parse(block.text);
}
async function planWithClaude(title, note, repeat, apiKey) {
  const client = await claudeClient(apiKey);
  const response = await client.beta.messages.create({
    model: 'claude-opus-5-5',
    max_tokens: 16000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: {
      effort: 'low',
      format: {
        type: 'json_schema',
        schema: { type: 'object', additionalProperties: false, required: ['steps'], properties: { steps: { type: 'array', items: { type: 'string' } } } },
      },
    },
    system: 'Tu palīdzi sastādīt plānu. No lietotāja uzdevuma un apraksta izveido 3–7 īsus, konkrētus, secīgus plāna punktus latviski (katrs līdz ~8 vārdiem, sākas ar darbības vārdu). Ja uzdevums atkārtojas, punktiem jāder katrai reizei.',
    messages: [{ role: 'user', content: `Uzdevums: ${title}\nAtkārtojas: ${REPEAT_LABEL[repeat] || 'nē'}\nApraksts: ${note || '(nav)'}` }],
  });
  return readJson(response).steps.filter(Boolean);
}

async function parseWithClaude(text, apiKey) {
  const client = await claudeClient(apiKey);
  const now = new Date();
  const nowStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}, ${DAYS[now.getDay()]}`;
  const response = await client.beta.messages.create({
    model: 'claude-opus-5-5',
    max_tokens: 16000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: { effort: 'low', format: { type: 'json_schema', schema: TASK_SCHEMA } },
    system:
      'Tu esi plānotāja palīgs. No lietotāja ielīmētā teksta izvelc visus uzdevumus un pasākumus, kuriem ir (vai vajadzētu būt) konkrēts laiks. ' +
      'Relatīvos datumus ("rīt", "piektdien", "nākamnedēļ") pārvērt konkrētos datumos pēc dotā pašreizējā laika. ' +
      'Ja laiks nav minēts, izvēlies saprātīgu laiku un atzīmē uncertain=true. Neizdomā uzdevumus, kuru tekstā nav. ' +
      'Ja kaut kas notiek regulāri ("katru dienu", "katru pirmdienu", "reizi mēnesī"), iestati repeat un date = nākamā reize. ' +
      'Ja uzdevums ir lielāks vai apraksta mērķi, sastādi 2–6 īsus, konkrētus plāna punktus laukā steps. ' +
      'Novērtē svarīgumu (priority): 3 — termiņi, veselība, nauda, saistības pret citiem; 2 — parasti darbi; 1 — var pagaidīt vai brīvais laiks. ' +
      'Punkti ar "-" zem uzdevuma ir tā soļi, nevis atsevišķi uzdevumi. ' +
      'Saliec katru uzdevumu vienā no plauktiņiem: ' + SHELVES.join(', ') + '. Raksti latviski.',
    messages: [{ role: 'user', content: `Pašreizējais laiks: ${nowStr}\n\nTeksts:\n${text}` }],
  });
  const data = readJson(response);
  data.tasks.forEach(t => { if (!SHELVES.includes(t.category)) t.category = 'Cits'; });
  return data;
}

// ---------- Kalendāra (.ics) eksports — uzticamākie atgādinājumi telefonā ----------
function icsFor(list) {
  const stamp = d => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
  const escIcs = s => String(s || '').replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/([,;])/g, '\\$1');
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Planotajs//LV', 'CALSCALE:GREGORIAN'];
  for (const t of list) {
    const s = startOf(t), e = new Date(s.getTime() + 3600000);
    lines.push('BEGIN:VEVENT', `UID:${t.id}@planotajs`, `DTSTAMP:${stamp(new Date())}`,
      `DTSTART:${stamp(s)}`, `DTEND:${stamp(e)}`, `SUMMARY:${escIcs(t.title)}`,
      `DESCRIPTION:${escIcs([t.note, ...(t.steps || []).map(x => '• ' + x.text)].filter(Boolean).join('\n'))}`, `CATEGORIES:${escIcs(t.category)}`,
      ...(t.repeat && t.repeat !== 'none' ? [`RRULE:FREQ=${t.repeat.toUpperCase()}`] : []),
      'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${escIcs(t.title)}`, `TRIGGER:-PT${Number(t.remind) || 0}M`, 'END:VALARM',
      'END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}
async function shareIcs(list, name) {
  if (!list.length) return toast('Nav ko eksportēt');
  const file = new File([icsFor(list)], (name || 'planotajs').replace(/[^\p{L}\d]+/gu, '-') + '.ics', { type: 'text/calendar' });
  if (navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file], title: name }); return; } catch (e) { if (e.name === 'AbortError') return; }
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(file); a.download = file.name; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}
$('#exportAll').addEventListener('click', () => shareIcs(tasks.filter(t => !t.done && (startOf(t) > new Date() || (t.repeat && t.repeat !== 'none'))), 'Visi uzdevumi'));

// ---------- Paziņojumi ----------
let swReg = null;
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').then(r => { swReg = r; scheduleTriggers(); }).catch(() => {});
}
function updateNotifyBtn() {
  const btn = $('#notifyBtn');
  if (!('Notification' in window)) { btn.textContent = '🔕 Nav atbalstīts'; btn.disabled = true; return; }
  const p = Notification.permission;
  btn.textContent = p === 'granted' ? '🔔 Paziņojumi ieslēgti' : p === 'denied' ? '🔕 Bloķēti' : '🔔 Ieslēgt paziņojumus';
  btn.classList.toggle('active', p === 'granted');
}
$('#notifyBtn').addEventListener('click', async () => {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'denied') return toast('Atļauj paziņojumus pārlūka iestatījumos');
  const p = await Notification.requestPermission();
  updateNotifyBtn();
  if (p === 'granted') { notify('Paziņojumi ieslēgti ✓', 'Šādi izskatīsies atgādinājumi.', 'test'); scheduleTriggers(); }
});
updateNotifyBtn();

async function notify(title, body, tag) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const opts = { body, tag, icon: 'icon.svg', badge: 'icon.svg', vibrate: [200, 100, 200] };
  try {
    const reg = swReg || (await navigator.serviceWorker?.ready);
    if (reg) return reg.showNotification(title, opts);
  } catch {}
  new Notification(title, opts);
}

// Pārbauda atgādinājumus, kamēr aplikācija ir atvērta (arī fonā).
function checkReminders() {
  rollRecurring();
  const now = Date.now();
  let changed = false;
  for (const t of tasks) {
    if (t.done) continue;
    t.notified ||= {};
    const start = startOf(t).getTime();
    const rem = remindAt(t).getTime();
    if (!t.notified.remind && rem <= now && now - rem < 6 * 3600000) {
      const when = Number(t.remind) ? `pēc ${remindLabel(Number(t.remind))} · ${t.time}` : `tagad · ${t.time}`;
      notify(`⏰ ${t.title}`, `${when}${t.note ? '\n' + t.note : ''}`, t.id + '-r');
      t.notified.remind = true; changed = true;
      if (!Number(t.remind)) t.notified.start = true;
    }
    if (!t.notified.start && start <= now && now - start < 6 * 3600000) {
      notify(`📌 Tagad: ${t.title}`, t.note || t.category, t.id + '-s');
      t.notified.start = true; changed = true;
    }
  }
  if (changed) { save(); if ($('#view-list').classList.contains('active')) render(); }
}
setInterval(checkReminders, 20000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) { checkReminders(); render(); } });

// Ja pārlūks atbalsta ieplānotus paziņojumus (Notification Triggers), tie pienāk arī ar aizvērtu aplikāciju.
async function scheduleTriggers() {
  if (!swReg || !('showTrigger' in Notification.prototype) || typeof TimestampTrigger === 'undefined') return;
  if (Notification.permission !== 'granted') return;
  for (const t of tasks) {
    const at = remindAt(t).getTime();
    if (t.done || at <= Date.now()) continue;
    try {
      await swReg.showNotification(`⏰ ${t.title}`, {
        tag: t.id + '-r', body: `${t.time} · ${t.category}`, icon: 'icon.svg', showTrigger: new TimestampTrigger(at),
      });
    } catch {}
  }
}

// iPhone: ieteikums pievienot sākuma ekrānam
try {
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const standalone = window.navigator.standalone || matchMedia('(display-mode: standalone)').matches;
  if (ios && !standalone && !localStorage.getItem('planotajs.hideInstall')) $('#installHint').hidden = false;
} catch {}
$('#hideInstall').addEventListener('click', () => { $('#installHint').hidden = true; try { localStorage.setItem('planotajs.hideInstall', '1'); } catch {} });

checkReminders();
render();
