"""Write the EHL redesign HTML pages from one shared skeleton."""
import os, sys

OUT = sys.argv[1]

HEAD = """<!doctype html>
<html lang="lv">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{title}</title>
  <meta name="description" content="{desc}">
  <meta name="theme-color" content="#ff7a1a">
  <link rel="icon" href="https://ehl.entuziasti.com/favicon.ico">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="style.css">
</head>
<body data-page="{page}">
  <div id="site-header"></div>
"""

FOOT = """
  <div id="site-footer"></div>

  <script src="data/live.js"></script>
{data}  <script src="js/layout.js"></script>
  <script src="js/{script}.js"></script>
</body>
</html>
"""


def hero(title, sub='', crumb=None, extra=''):
    c = f'<p class="crumb"><a href="index.html">Sākums</a>{"".join(f" / {x}" for x in (crumb or []))} / {title}</p>'
    s = f'<p class="sub" id="hero-sub">{sub}</p>' if sub is not None else ''
    return f"""
  <section class="page-hero">
    <div class="wrap">
      {c}
      <h1>{title}</h1>
      {s}{extra}
    </div>
  </section>
"""


ABOUT_NAV = '\n      <nav class="subnav" data-group="about"></nav>'

PAGES = {
    'index': dict(title='EHL — Entuziastu Hokeja Līga', page='home', script='home', data=['dk'], body="""
  <main class="wrap main">
    <div class="grid">
      <div class="col-main">
        <a class="feature" id="feature" href="#"></a>

        <div class="section-head">
          <h2>Jaunumi</h2>
          <a href="jaunumi.html">Visi jaunumi →</a>
        </div>
        <div class="news wide-last" id="news"></div>

        <div class="section-head">
          <h2>Disciplinārā komiteja</h2>
          <a href="dk.html">Visi lēmumi →</a>
        </div>
        <div class="dk" id="dk"></div>
      </div>

      <aside class="col-side" id="side">
        <a class="banner" href="https://olybetsportsbar.lv/">
          <img src="https://ehl.entuziasti.com/uploads/banners/px414/OlyBet-2025-2026.png" alt="OlyBet" loading="lazy">
        </a>
        <a class="banner" href="http://www.kvikworks.lv/">
          <img src="https://ehl.entuziasti.com/uploads/banners/px414/Kvikworks-1.gif" alt="Kvikworks" loading="lazy">
        </a>
      </aside>
    </div>
  </main>
"""),
    'kalendars': dict(title='Kalendārs — EHL', page='kalendars', script='kalendars', data=['calendar'],
        body=hero('Kalendārs', 'Spēļu grafiks un rezultāti · 2026–2027') + """
  <main class="wrap page">
    <div class="days" id="days"></div>
    <div class="toolbar">
      <select class="select" id="f-div" aria-label="Divīzija"><option value="">Visas divīzijas</option></select>
      <select class="select" id="f-arena" aria-label="Halle"><option value="">Visas halles</option></select>
      <input class="input" id="f-team" type="search" placeholder="Meklēt komandu…" aria-label="Komanda">
      <span class="count" id="count"></span>
    </div>
    <div class="day-title" id="day-title"></div>
    <div class="games" id="games"></div>
  </main>
"""),
    'komandas': dict(title='Komandas — EHL', page='komandas', script='komandas', data=['teams'],
        body=hero('Komandas', '') + """
  <main class="wrap page">
    <div class="toolbar">
      <input class="input" id="q" type="search" placeholder="Meklēt komandu vai treneri…" aria-label="Meklēt">
      <select class="select" id="rink" aria-label="Mājas ledus"><option value="">Visi mājas ledi</option></select>
      <select class="select" id="sort" aria-label="Kārtot">
        <option value="name">Kārtot: A–Z</option>
        <option value="seasons">Kārtot: EHL sezonas</option>
        <option value="players">Kārtot: spēlētāju skaits</option>
        <option value="founded">Kārtot: jaunākās</option>
      </select>
      <span class="count" id="count"></span>
    </div>
    <div class="team-grid" id="teams"></div>
  </main>
"""),
    'komanda': dict(title='Tērvete Backshots — EHL', page='komanda', script='komanda', data=['team'],
        body="""
  <section class="page-hero team-hero" id="team-hero"></section>
  <main class="wrap page" id="team"></main>
"""),
    'speletaji': dict(title='Spēlētāji — EHL', page='speletaji', script='speletaji', data=['players'],
        body=hero('Spēlētāji', '') + """
  <main class="wrap page">
    <div class="letters" id="letters"></div>
    <div class="toolbar">
      <input class="input" id="q" type="search" placeholder="Meklēt spēlētāju vai komandu…" aria-label="Meklēt">
      <div class="seg" id="pos">
        <button class="on" data-pos="">Visi</button><button data-pos="U">Uzbrucēji</button><button data-pos="A">Aizsargi</button><button data-pos="V">Vārtsargi</button>
      </div>
      <span class="count" id="count"></span>
    </div>
    <div class="table-wrap">
      <table class="data players">
        <thead><tr><th>Vārds, uzvārds</th><th class="num">Poz.</th><th>Komanda</th><th>Dzimis</th><th>Valsts</th></tr></thead>
        <tbody id="rows"></tbody>
      </table>
    </div>
    <div class="more"><button class="btn btn-primary btn-lg" id="more">Rādīt vairāk</button></div>
  </main>
"""),
    'brivie-agenti': dict(title='Brīvie aģenti — EHL', page='brivie-agenti', script='agenti', data=['agents'],
        body=hero('Brīvie aģenti', 'Spēlētāji, vārtsargi un treneri, kas meklē komandu') + """
  <main class="wrap page">
    <div class="cta">
      <div><h3>Meklē komandu?</h3><p>Piesakies kā brīvais aģents un komandas tevi atradīs.</p></div>
      <a class="btn btn-dark btn-lg" href="mailto:entuziasti@entuziasti.lv">Pieteikties: entuziasti@entuziasti.lv</a>
    </div>
    <div class="toolbar">
      <div class="seg" id="role"></div>
      <span class="count" id="count"></span>
    </div>
    <div class="agent-grid" id="agents"></div>
  </main>
"""),
    'jaunumi': dict(title='Jaunumi — EHL', page='jaunumi', script='jaunumi', data=['news'],
        body=hero('Jaunumi', 'Video, intervijas un līgas ziņas') + """
  <main class="wrap page">
    <a class="feature" id="feature" href="#"></a>
    <div class="section-head"><h2>Visi jaunumi</h2><a href="https://ehl.entuziasti.com/jaunumi">Arhīvs →</a></div>
    <div class="toolbar">
      <input class="input" id="q" type="search" placeholder="Meklēt jaunumos…" aria-label="Meklēt">
      <span class="count" id="count"></span>
    </div>
    <div class="news" id="news"></div>
  </main>
"""),
    'jaunums': dict(title='OlyBet EHL – Sadolin – Jēkabs Līviņš | S2E04 — EHL', page='jaunums', script='jaunums', data=['article', 'news'],
        body="""
  <section class="page-hero">
    <div class="wrap">
      <p class="crumb"><a href="index.html">Sākums</a> / <a href="jaunumi.html">Jaunumi</a></p>
      <h1 id="a-title"></h1>
      <div class="article-meta" id="a-meta"></div>
    </div>
  </section>
  <main class="wrap page">
    <div class="article-layout">
      <article>
        <div class="video-frame" id="a-video"></div>
        <div class="prose" id="a-body"></div>
        <div class="share">Dalīties
          <a class="icon-btn" id="share-fb" aria-label="Dalīties Facebook" target="_blank" rel="noopener"></a>
          <a class="icon-btn" id="share-x" aria-label="Dalīties X" target="_blank" rel="noopener"></a>
          <a class="btn btn-ghost" href="jaunumi.html">← Atpakaļ uz jaunumiem</a>
        </div>
      </article>
      <aside class="col-side" id="side">
        <div class="card"><div class="card-head"><h3>Citi jaunumi</h3></div><div class="side-news" id="more-news"></div></div>
      </aside>
    </div>
  </main>
"""),
    'dk': dict(title='Disciplinārā komiteja — EHL', page='dk', script='dk', data=['dk'],
        body=hero('Disciplinārā komiteja', 'Lēmumi par spēļu incidentiem · 16. sezona') + """
  <main class="wrap page">
    <div class="toolbar">
      <input class="input" id="q" type="search" placeholder="Meklēt komandu…" aria-label="Meklēt">
      <span class="count" id="count"></span>
    </div>
    <div class="dk" id="dk"></div>
  </main>
"""),
    'par-mums': dict(title='Par mums — EHL', page='par-mums', script='parmums', data=['about', 'teams'],
        body=hero('Par mums', None, extra=ABOUT_NAV) + """
  <main class="wrap page" id="about"></main>
"""),
    'nolikumi': dict(title='Nolikumi — EHL', page='nolikumi', script='nolikumi', data=['about'],
        body=hero('Nolikumi', 'Atjaunots 18.08.2026 · Sezona 2026/2027', crumb=['<a href="par-mums.html">Par mums</a>'], extra=ABOUT_NAV) + """
  <main class="wrap page">
    <div class="docs" id="docs"></div>
    <div class="rules-layout">
      <nav class="toc" id="toc" aria-label="Saturs"></nav>
      <div class="rules" id="rules"></div>
    </div>
  </main>
"""),
    'tiesnesi': dict(title='Tiesneši — EHL', page='tiesnesi', script='tiesnesi', data=['referees'],
        body=hero('Tiesneši', '', crumb=['<a href="par-mums.html">Par mums</a>'], extra=ABOUT_NAV) + """
  <main class="wrap page">
    <div class="toolbar">
      <input class="input" id="q" type="search" placeholder="Meklēt tiesnesi…" aria-label="Meklēt">
      <span class="count" id="count"></span>
    </div>
    <div class="ref-grid" id="refs"></div>
  </main>
"""),
    'kontakti': dict(title='Kontakti — EHL', page='kontakti', script='kontakti', data=[],
        body=hero('Kontakti', 'Sazinies ar līgas organizatoriem', crumb=['<a href="par-mums.html">Par mums</a>'], extra=ABOUT_NAV) + """
  <main class="wrap page">
    <div class="contact-grid" id="contacts"></div>
  </main>
"""),
    'protokols': dict(title='TRB 8:0 HKP · Spēles protokols — EHL', page='protokols', script='protokols', data=['protocol'],
        body="""
  <section class="scoreboard" id="board"></section>
  <main class="wrap page" id="report"></main>
"""),
}

for name, p in PAGES.items():
    data = ''.join(f'  <script src="data/{d}.js"></script>\n' for d in p['data'])
    html = HEAD.format(title=p['title'], desc='Entuziastu Hokeja Līga', page=p['page']) + p['body'] + FOOT.format(data=data, script=p['script'])
    with open(os.path.join(OUT, f'{name}.html'), 'w', encoding='utf8') as f:
        f.write(html)
    print(name)
