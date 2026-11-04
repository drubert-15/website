// Krātuve: Claude aplikācijā dati glabājas tavā Claude kontā (sinhronizējas starp ierīcēm),
// parastajā pārlūkā — telefona atmiņā (localStorage). Pārējais kods vienmēr lieto localStorage.
(function () {
  const IN_CLAUDE = !!(window.claude && typeof window.claude.use === 'function');
  window.IN_CLAUDE = IN_CLAUDE;
  if (IN_CLAUDE) document.documentElement.classList.add('in-claude');

  // Ja localStorage nav pieejams, lieto atmiņas aizvietotāju, lai aplikācija tik un tā strādātu.
  let ls;
  try { ls = window.localStorage; ls.setItem('planotajs.__t', '1'); ls.removeItem('planotajs.__t'); } catch { ls = null; }
  const mem = {};
  const shim = {
    getItem: k => (k in mem ? mem[k] : null),
    setItem: (k, v) => { mem[k] = String(v); queue(k); },
    removeItem: k => { delete mem[k]; queue(k); },
    key: i => Object.keys(mem)[i] ?? null,
    get length() { return Object.keys(mem).length; },
  };
  if (!ls) { try { Object.defineProperty(window, 'localStorage', { value: shim, configurable: true }); } catch {} }
  const raw = {
    get: k => (ls ? ls.getItem(k) : shim.getItem(k)),
    set: (k, v) => (ls ? origSet.call(ls, k, v) : (mem[k] = v)),
  };

  // Kas sinhronizējas ar Claude kontu (pārējais ir tikai šīs ierīces ērtības).
  const SYNC = { 'planotajs.tasks.v1': 'tasks', 'planotajs.game.v1': 'game', 'planotajs.user.v1': 'user', 'planotajs.ios.v1': 'ios' };
  let ref = null;
  const dirty = new Set();
  let timer = null, chain = Promise.resolve();

  function queue(k) {
    if (!ref || !(k in SYNC)) return;
    dirty.add(k);
    clearTimeout(timer);
    timer = setTimeout(flush, 350);
  }
  function flush() {
    clearTimeout(timer);
    const keys = [...dirty]; dirty.clear();
    if (!keys.length || !ref) return;
    chain = chain.then(async () => {
      for (const k of keys) {
        const doc = ref.db.doc(`data/users/${ref.uid}/${SYNC[k]}`);
        const v = raw.get(k);
        try {
          if (v == null) await doc.delete();
          else await doc.set({ json: v, at: Date.now() });
        } catch (e) {
          if (e && e.code === 'unavailable') { dirty.add(k); setTimeout(flush, 1500 + Math.random() * 1500); }
          else console.warn('Plānotājs: neizdevās saglabāt Claude kontā', e && e.code);
        }
      }
    });
  }

  const origSet = Storage.prototype.setItem, origRemove = Storage.prototype.removeItem;
  if (ls) {
    Storage.prototype.setItem = function (k, v) { origSet.call(this, k, v); if (this === ls) queue(k); };
    Storage.prototype.removeItem = function (k) { origRemove.call(this, k); if (this === ls) queue(k); };
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden) flush(); });
  window.addEventListener('pagehide', flush);

  // Claude AI (bez atslēgas) — pieejams tikai Claude aplikācijā.
  window.claudeSample = IN_CLAUDE ? window.claude.use('sample').catch(() => null) : Promise.resolve(null);

  function splash(on) {
    let el = document.getElementById('bootSplash');
    if (on && !el) {
      el = document.createElement('div');
      el.id = 'bootSplash';
      el.className = 'boot-splash';
      el.innerHTML = '<div class="boot-dot"></div><p>Ielādē tavus uzdevumus…</p>';
      document.body ? document.body.appendChild(el) : document.addEventListener('DOMContentLoaded', () => document.body.appendChild(el));
    } else if (!on && el) el.remove();
  }

  window.storeReady = (async () => {
    if (!IN_CLAUDE) return { cloud: false };
    const slow = setTimeout(() => splash(true), 350);
    try {
      const [db, user] = await Promise.all([window.claude.use('db'), window.claude.use('user')]);
      if (!db || !user) return { cloud: false };
      const uid = await user.id();
      if (!uid) return { cloud: false };
      const keys = Object.keys(SYNC);
      const timeout = new Promise(r => setTimeout(() => r(null), 10000));
      const snaps = await Promise.race([Promise.all(keys.map(k => db.doc(`data/users/${uid}/${SYNC[k]}`).get())), timeout]);
      ref = { db, uid };
      if (!snaps) return { cloud: true, partial: true };
      snaps.forEach((s, i) => {
        const k = keys[i], d = s && s.exists ? s.data() : null;
        if (d && typeof d.json === 'string') raw.set(k, d.json); // konta dati uzvar
        else if (raw.get(k) != null) queue(k); // pirmo reizi: augšupielādē šīs ierīces datus
      });
      return { cloud: true };
    } catch (e) {
      console.warn('Plānotājs: Claude krātuve nav pieejama', e && e.code);
      return { cloud: false };
    } finally {
      clearTimeout(slow);
      splash(false);
    }
  })();
})();

// Apstiprinājuma logs lapā (Claude aplikācijā parastais confirm() nestrādā).
window.askConfirm = function (text, okLabel = 'Jā', danger = true) {
  return new Promise(resolve => {
    const el = document.createElement('div');
    el.className = 'account confirm-wrap';
    el.innerHTML = `<div class="acc-card confirm-card"><p class="confirm-text"></p><div class="actions">
      <button type="button" class="${danger ? 'danger-btn' : 'primary'}" data-ok>${okLabel}</button>
      <button type="button" class="secondary" data-no>Atcelt</button></div></div>`;
    el.querySelector('.confirm-text').textContent = text;
    const done = v => { el.remove(); resolve(v); };
    el.querySelector('[data-ok]').addEventListener('click', () => done(true));
    el.querySelector('[data-no]').addEventListener('click', () => done(false));
    el.addEventListener('click', e => { if (e.target === el) done(false); });
    document.body.appendChild(el);
    el.querySelector('[data-no]').focus();
  });
};
