"""Pull content from saved ehl.entuziasti.com pages into JS data files for the redesign."""
import glob, html, json, os, re, sys

P = sys.argv[1]           # folder with saved pages
OUT = sys.argv[2]         # ehl/data folder
B = 'https://ehl.entuziasti.com'
os.makedirs(OUT, exist_ok=True)


def read(f):
    return open(os.path.join(P, f), encoding='utf8').read()


def main(h):
    m = h[h.find('<main'):h.find('</main>')]
    if 'divisions-list' in m:
        m = m[m.find('</ul></div></div>') + 17:]
    return m


def text(s):
    s = re.sub(r'<br\s*/?>', '\n', s)
    s = re.sub(r'<[^>]+>', '', s)
    s = html.unescape(s).replace('\xa0', ' ')
    return re.sub(r'[ \t]+', ' ', s).strip()


def absu(u):
    u = re.sub(r'\?cs=\w+', '', html.unescape(u))
    if u.startswith('http'):
        return u
    return B + '/' + u.lstrip('/')


def rows(table):
    return [re.findall(r'<t[dh][^>]*>([\s\S]*?)</t[dh]>', r) for r in re.findall(r'<tr[^>]*>([\s\S]*?)</tr>', table)]


def save(name, var, data):
    with open(os.path.join(OUT, name), 'w', encoding='utf8') as f:
        f.write(f'window.{var} = {json.dumps(data, ensure_ascii=False, separators=(",", ":"))};\n')
    print(name, os.path.getsize(os.path.join(OUT, name)))


# ---------- calendar ----------
def team_cell(td):
    a = re.search(r'href="([^"]+)"[^>]*title="([^"]*)"', td)
    img = re.search(r'<img src="([^"]+)"', td)
    ab = re.search(r'class="team_name">([^<]+)', td)
    return {'abbr': ab[1] if ab else '', 'name': html.unescape(a[2]) if a else '',
            'url': absu(a[1]) if a else '', 'logo': absu(img[1]) if img else ''}


days = []
for f in sorted(glob.glob(os.path.join(P, 'cal', '*.html')), key=lambda x: [int(n) for n in re.findall(r'\d+', os.path.basename(x))]):
    m = main(open(f, encoding='utf8').read())
    y, mo, d = re.findall(r'\d+', os.path.basename(f))
    wd = re.search(r'<div class="day"><span>([^<]+)</span><h2>([^<]+)</h2>', m)
    games = []
    for tr in re.findall(r'<tr class="div_(\w+)">([\s\S]*?)</tr>', m):
        div, body = tr
        tds = re.findall(r'<td[^>]*>([\s\S]*?)</td>(?=<td|$)', body)
        cells = re.findall(r'<td([^>]*)>([\s\S]*?)</td>', body)
        home, mid, away, time, arena = [c[1] for c in cells[:5]]
        score = re.search(r'class="score">([^<]+)', mid)
        video = re.search(r'href="(https://www\.youtube[^"]+)"', body)
        prot = re.search(r'href="/protokols/(\d+)"', body)
        games.append({'div': div.upper(), 'home': team_cell(home), 'away': team_cell(away),
                      'score': score[1] if score else None, 'time': text(time), 'arena': text(arena),
                      'video': video[1] if video else None, 'protocol': prot[1] if prot else None})
    days.append({'date': f'{y}-{int(mo):02d}-{int(d):02d}', 'weekday': text(wd[1]) if wd else '',
                 'label': text(wd[2]) if wd else '', 'games': games})
save('calendar.js', 'CAL', days)

# ---------- teams ----------
m = main(read('komandas.html'))
teams = []
for li in re.findall(r'<table class="team-table">([\s\S]*?)</table>', m):
    a = re.search(r'<a href="([^"]+)"><span class="title-span[^"]*">([^<]+)</span>', li)
    logo = re.search(r'src="(/uploads/team/px100/[^"]+)"', li)
    photo = re.search(r'src="(/uploads/team/players/[^"]+)"', li)
    info = {text(k): text(v) for k, v in re.findall(r'<span class="left">([\s\S]*?)</span><span class="right">([\s\S]*?)</span>', li)}
    teams.append({'name': html.unescape(a[2]).strip(), 'url': absu(a[1]), 'logo': absu(logo[1]) if logo else '',
                  'photo': absu(photo[1]) if photo else '', 'founded': info.get('Dibināšanas gads', ''),
                  'seasons': info.get('EHL sezona', ''), 'coach': info.get('Treneris', ''),
                  'rink': info.get('Mājas ledus', ''), 'players': info.get('Spēlētāju skaits', '')})
save('teams.js', 'TEAMS', teams)

# ---------- one team page ----------
m = main(read('komandas_tervete-backshots_460.html'))
info = [(text(k), text(v)) for k, v in re.findall(r'<tr>\s*<td>([\s\S]*?)</td>\s*<td[^>]*>([\s\S]*?)</td>\s*</tr>', m.split('team-profile-stats')[0])]
stat_t = re.search(r'id="team-profile-stats"[\s\S]*?</table>', m)[0]
seasons_t = re.search(r'id="team-stats-seasons"[\s\S]*?</table>', m)[0]
leaders = re.findall(r'<li><a href="([^"]+)"><img src="([^"]+)" alt="([^"]+)"></a></li>', m)
lead_t = re.search(r'class="team-players-stats">([\s\S]*?)</table>', m)[1]
lr = rows(lead_t)
lead_vals = [text(x) for x in lr[2]]
lead_heads = [text(x) for x in lr[1]]
roster_t = re.search(r'id="team-players-list">([\s\S]*?)</table>', m)[1]
roster = []
for r in rows(roster_t)[1:]:
    if len(r) >= 8:
        url = re.search(r'href="([^"]+)"', r[1])
        roster.append({'nr': text(r[0]), 'name': text(r[1]), 'url': absu(url[1]) if url else '', 'pos': text(r[2]),
                       'gp': text(r[3]), 'g': text(r[4]), 'a': text(r[5]), 'p': text(r[6]), 'pim': text(r[7])})
team = {
    'title': text(re.search(r'class="team-title">([^<]+)', m)[1]),
    'anno': text(re.search(r'class="team-anno">([^<]+)', m)[1]),
    'division': text(re.search(r'team_division_title">([^<]+)', m)[1]),
    'logo': absu(re.search(r'src="([^"]+)"[^>]*class="team-image main-logo"', m)[1]),
    'home': absu(re.search(r'src="([^"]+home_[^"]+)"', m)[1]),
    'away': absu(re.search(r'src="([^"]+away_[^"]+)"', m)[1]),
    'photo': absu(re.search(r'src="(/uploads/team/players/px830/[^"]+)"', m)[1]),
    'info': info,
    'stats': dict(zip([text(x) for x in rows(stat_t)[0]], [text(x) for x in rows(stat_t)[1]])),
    'seasons': [[text(x) for x in r] for r in rows(seasons_t)[1:]],
    'leaders': [], 'roster': roster,
}
# Leader stat columns: 3 per skater (G A P), last goalie has 2 (W SV%).
i = 0
for url, img, name in leaders:
    n = 2 if lead_heads[i:i + 2] == ['W', 'SV%'] else 3
    team['leaders'].append({'name': html.unescape(name), 'url': absu(url), 'img': absu(img),
                            'stats': list(zip(lead_heads[i:i + n], lead_vals[i:i + n]))})
    i += n
save('team.js', 'TEAM', team)

# ---------- players ----------
m = main(read('speletaji.html'))
players = []
for r in re.findall(r'<tr><td><a href="(/personas/[^"]+)">([^<]+)</td><td>([^<]*)</td><td><a href="([^"]+)">([^<]+)</td><td>([^<]*)</td><td>([^<]*)</td></tr>', m):
    pu, name, pos, tu, tname, dob, country = r
    players.append([html.unescape(name), pos, html.unescape(tname), tu, dob, country, pu])
save('players.js', 'PLAYERS', players)

# ---------- free agents ----------
m = main(read('brivie-agenti.html'))
agents = []
for li in re.findall(r'<li><div class="agent-name">([\s\S]*?)</table></li>', m):
    name = re.search(r'class="gray">([^<]*)', li)
    role = re.search(r'class="white">([^<]*)', li)
    img = re.search(r'<img src="([^"]+)"', li)
    body = re.search(r'<td class="top">([\s\S]*?)</td>', li)
    fields = []
    if body:
        for part in re.split(r'<span class="bold-span">', body[1])[1:]:
            k, _, v = part.partition('</span>')
            fields.append([text(k).rstrip(':'), text(v)])
    agents.append({'name': text(name[1]), 'role': text(role[1]), 'img': absu(img[1]) if img else '', 'fields': fields})
save('agents.js', 'AGENTS', agents)

# ---------- news + DK lists ----------
def news_list(f, prefix):
    m = main(read(f))
    out = []
    for li in re.findall(r'<li class="news-type-\d">([\s\S]*?)</li>', m):
        img = re.search(r'<img src="([^"]+)"', li)
        a = re.search(r'<a href="([^"]+)"><h3[^>]*>([\s\S]*?)</h3>', li)
        d = re.search(r'class="description">([\s\S]*?)</p>', li)
        if a:
            out.append({'title': text(a[2]), 'url': absu(a[1]), 'img': absu(img[1]) if img else '',
                        'text': text(d[1]) if d else ''})
    return out


save('news.js', 'NEWS', news_list('jaunumi.html', 'jaunumi')[:48])
save('dk.js', 'DKLIST', news_list('dk.html', 'dk')[:48])

# ---------- article ----------
m = main(read('jaunumi_olybet-ehl-sadolin-jekabs-livins-s2e04_1926.html'))
save('article.js', 'ARTICLE', {
    'title': text(re.search(r'<h1[^>]*>([\s\S]*?)</h1>', m)[1]),
    'author': text(re.search(r'class="author">([\s\S]*?)</span>', m)[1]),
    'date': text(re.search(r'class="published">([\s\S]*?)</span>', m)[1]),
    'video': re.search(r'<iframe[^>]*src="([^"]+)"', m)[1],
    'paras': [text(p) for p in re.findall(r'<p>([\s\S]*?)</p>', re.search(r'class="text-content news-open">([\s\S]*?)</div>', m)[1]) if text(p)],
})

# ---------- referees ----------
m = main(read('tiesnesi.html'))
refs = []
for li in re.findall(r'<div class="player-profile referee-profile">([\s\S]*?)</div>\s*</div>', m):
    img = re.search(r'<img src="([^"]+)"', li)
    name = re.search(r'class="player-name">([^<]+)', li)
    info = re.search(r'<div class="player-info">[\s\S]*?</h3>\s*<div>([\s\S]*)', li)
    lines = [l.strip() for l in text(info[1]).split('\n') if l.strip()] if info else []
    refs.append({'name': text(name[1]), 'img': absu(img[1]) if img else '', 'info': lines})
save('referees.js', 'REFS', refs)

# ---------- about / rules / contacts ----------
def clean_html(s):
    s = re.sub(r'<(script|style)[\s\S]*?</\1>', '', s)
    s = re.sub(r'\s(style|class|align|width|height|border|cellpadding|cellspacing)="[^"]*"', '', s)
    s = re.sub(r'<p>(\s|&nbsp;|<br\s*/?>|<strong>&nbsp;</strong>)*</p>', '', s)
    s = re.sub(r'<(/?)(span|font|div)[^>]*>', '', s)
    s = re.sub(r'href="/', f'href="{B}/', s)
    return re.sub(r'\s+', ' ', html.unescape(s).replace('\xa0', ' ')).strip()


m = main(read('par-mums.html'))
about = {'img': absu(re.search(r'<img src="([^"]+)" alt="Par mums"', m)[1]),
         'html': clean_html(re.search(r'class="text-content section-open">([\s\S]*?)</div>', m)[1])}
m = main(read('nolikumi.html'))
links = [(u, t) for u, t in re.findall(r'<a href="(/(?:disciplinarais-nolikums|60-plus-nolikums|65-plus-nolikums))"[^>]*>([^<]+)</a>', m)]
body = m[m.find('class="text-content'):]
body = body[body.find('>') + 1:]
body = body[:body.find('<div class="col col-right')]
rh = clean_html(body)
rh = re.sub(r'<h[1-6]>(\s|<br\s*/?>)*</h[1-6]>', '', rh)
rh = re.sub(r'<h1>\s*<strong>([\s\S]*?)</strong>\s*</h1>', r'<h2>\1</h2>', rh)
rh = re.sub(r'<(/?)h1>', r'<\1h2>', rh)
rules = {'docs': [[absu(u), text(t)] for u, t in links], 'html': rh}
m = main(read('kontakti.html'))
contacts = clean_html(re.search(r'class="text-content section-open">([\s\S]*?)</div>', m)[1])
save('about.js', 'ABOUT', {'about': about, 'rules': rules, 'contacts': contacts})

# ---------- game report ----------
m = main(read('protokols_19473.html'))
def team_block(s):
    return {'logo': absu(re.search(r'<img src="([^"]+)"', s)[1]), 'url': absu(re.search(r'<a href="([^"]+)"', s)[1]),
            'abbr': text(re.search(r'class="name">([^<]+)', s)[1]), 'sog': text(re.search(r'SOG: <span>(\d+)', s)[1]),
            'mvp': text(re.search(r'class="mvp">[\s\S]*?<a[^>]*>([^<]+)', s)[1])}
blocks = re.findall(r'<div class="team_data( team_b)?">([\s\S]*?)</div>\s*</div>\s*(?=<div class="score_block"|</div>)', m)
ta = m[m.find('<div class="team_data">'):m.find('<div class="score_block">')]
tb = m[m.find('<div class="team_data team_b">'):m.find('<span class="break-line">')]
periods = []
for t in re.findall(r'<table class="protocol-stats">([\s\S]*?)</table>', m):
    title = re.search(r'class="title">([^<]+)', t)
    evs = []
    for cls, body in re.findall(r'<tr class="([^"]*)">([\s\S]*?)</tr>', t):
        c = re.findall(r'<td[^>]*>([\s\S]*?)</td>', body)
        if len(c) < 4:
            continue
        typ = re.sub(r'<div class="goalScores">[\s\S]*', '', c[2])
        gs = re.search(r'class="goalScores">([^<]+)', c[2])
        evs.append({'kind': cls.split()[0], 'time': text(c[0]), 'team': text(c[1]), 'type': text(typ),
                    'score': text(gs[1]) if gs else '', 'text': text(c[3])})
    if evs: periods.append({'title': text(title[1]) if title else '', 'events': evs})
save('protocol.js', 'PROT', {
    'date': text(re.search(r'<div class="date">([\s\S]*?)</div>', m)[1]),
    'place': text(re.search(r'<div class="place">([\s\S]*?)</div>', m)[1]).split('\n'),
    'division': text(re.search(r'DIVĪZIJA: ([^<]+)', m)[1]),
    'score': [text(re.search(r'id="score_a">([^<]+)', m)[1]), text(re.search(r'id="score_b">([^<]+)', m)[1])],
    'a': team_block(ta), 'b': team_block(tb),
    'video': re.search(r'href="(https://www\.youtube[^"]+)" class="video"', m)[1],
    'posters': [absu(u) for u in re.findall(r'href="([^"]+poster[^"]+)"', m)],
    'commentators': text(re.search(r'class="tooltip">([^<]+)', m)[1]),
    'periods': periods,
})
