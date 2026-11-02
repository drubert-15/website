// Rules: document tabs, generated table of contents, scroll-spy.
$('#docs').innerHTML = `<a class="btn btn-primary" href="nolikumi.html">Nolikums</a>` +
  ABOUT.rules.docs.map(([u, t]) => `<a class="btn btn-ghost" href="${u}">${esc(t)}</a>`).join('');

const box = $('#rules');
box.innerHTML = ABOUT.rules.html;
const heads = $$('h2', box);
heads.forEach((h, i) => { h.id = `n${i + 1}`; });
$('#toc').innerHTML = heads.map((h) => `<a href="#${h.id}">${esc(h.textContent.replace(/^\d+\.\s*NODAĻA:\s*/i, (m) => m.replace(/NODAĻA:\s*/i, '')).trim())}</a>`).join('');

const links = $$('#toc a');
const spy = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (en.isIntersecting) links.forEach((a) => a.classList.toggle('on', a.getAttribute('href') === '#' + en.target.id));
  });
}, { rootMargin: '-160px 0px -70% 0px' });
heads.forEach((h) => spy.observe(h));
