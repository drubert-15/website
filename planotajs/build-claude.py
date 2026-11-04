#!/usr/bin/env python3
"""Saliek plānotāju vienā HTML lapā Claude aplikācijai (Artifact).
Lietošana: python3 build-claude.py <izvades-fails.html>"""
import re, sys, pathlib
root = pathlib.Path(__file__).parent
html = (root / 'index.html').read_text()
body = re.search(r'<body>(.*)</body>', html, re.S).group(1)
body = re.sub(r'\s*<script[^>]*></script>', '', body)  # skripti tiek ielikti zemāk
fonts = re.search(r'<link href="https://fonts.googleapis.com[^>]+>', html).group(0)
def js(name):
    src = (root / name).read_text()
    assert '</script' not in src.lower(), name
    return src
out = f"""<title>Plānotājs</title>
<meta name="description" content="Dienasgrāmata ar AI, questiem un prasmju koku.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
{fonts}
<style>
{(root / 'style.css').read_text()}
</style>
{body.strip()}
<script>
{js('store.js')}
</script>
<script>
{js('icons.js')}
</script>
<script>
{js('parser.js')}
</script>
<script>
{js('game.js')}
</script>
<script type="module">
{js('app.js')}
</script>
"""
pathlib.Path(sys.argv[1]).write_text(out)
print('ok', len(out), 'bytes')
