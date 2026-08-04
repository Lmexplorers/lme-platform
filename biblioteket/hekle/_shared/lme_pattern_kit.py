# -*- coding: utf-8 -*-
"""
Delt byggesett for LME Baby Collection-oppskrifter ("Woodland Dreams").

Brukes av build_*.py i søskenmapper (ellies-smokkelenke, ellies-rangle,
ellies-vognlenke, ellies-ballerinasko, ellies-aktivitetsleke, osv.) for å
holde samme LME-stil (Playpen Sans/Sasson Montessori, samme sideoppsett,
samme fargepalett) uten å gjenta CSS-en i hvert skript.

Importeres slik fra en søskenmappe:

    import pathlib, sys
    sys.path.insert(0, str(pathlib.Path(__file__).parent.parent / '_shared'))
    import lme_pattern_kit as kit
"""
import html

# ---------- farger (LME Baby Collection, Woodland Dreams) ----------
BROWN      = '#A8734A'
BROWN_MID  = '#C79A6C'
BROWN_DARK = '#5C3A24'
CREAM      = '#F8F1E4'
CREAM_DEEP = '#F0E4D0'
ROSE       = '#E48FA6'   # pudderrosa
SAGE       = '#8FA681'   # salviegrønn
INK        = '#4a4a4a'


def page(body, num, right_label, ph2, title_line):
    """Én A4-side med LME-toppbanner, sidebånd og bunntekst."""
    return f'''<div class="page">
  <div class="band"><span>LITTLE MONTESSORI EXPLORERS</span></div>
  <div class="rside"><span>{right_label}</span></div>
  <div class="phead">
    <div class="ph1">LITTLE MONTESSORI EXPLORERS</div>
    <div class="ph2">{ph2}</div>
  </div>
  <div class="content">{body}</div>
  <div class="pfoot">&mdash;&nbsp;{num}&nbsp;&mdash;</div>
</div>'''


def banner(t):    return f'<div class="banner"><h1>{t}</h1></div>'
def rosep(t):      return f'<div class="pillwrap"><div class="pill rosepill">{t}</div></div>'
def sagep(t):     return f'<div class="pillwrap"><div class="pill sagepill">{t}</div></div>'
def card(inner):  return f'<div class="card">{inner}</div>'
def cream(inner): return f'<div class="cream">{inner}</div>'
def cme(t):       return cream('<p class="creamtitle">' + t + '</p>')


def ul(items):
    return '<ul class="dots">' + ''.join(f'<li>{i}</li>' for i in items) + '</ul>'


def steps(items, start=1):
    return '<ol class="steps">' + ''.join(
        f'<li><span class="snum">{start+i}</span><div>{t}</div></li>'
        for i, t in enumerate(items)) + '</ol>'


def otab(rows, head):
    """Omgangstabell: rows = [(omg, beskrivelse, masker), ...]."""
    h = '<tr><th>' + '</th><th>'.join(head) + '</th></tr>'
    body = ''.join(
        '<tr><td><b>' + str(a) + '</b></td><td>' + b + '</td><td>' + str(c) + '</td></tr>'
        for a, b, c in rows)
    return '<table class="t">' + h + body + '</table>'


def abbrtab(rows, head):
    """Forkortelsestabell med US-hekletermer: rows = [(norsk, us, betyr), ...]."""
    h = '<tr><th>' + '</th><th>'.join(head) + '</th></tr>'
    body = ''.join(
        '<tr><td><b>' + a + '</b></td><td>' + b + '</td><td>' + c + '</td></tr>'
        for a, b, c in rows)
    return '<table class="t tl">' + h + body + '</table>'


def photo_placeholder(caption, w='47%'):
    return (f'<div class="photoph" style="width:{w}">'
            f'<div class="phicon">&#128247;</div>'
            f'<div class="phcap">{html.escape(caption)}</div></div>')


def photo_row(captions):
    return '<div class="photorow">' + ''.join(photo_placeholder(c) for c in captions) + '</div>'


def qr_placeholder(caption):
    return (f'<div class="qrbox"><div class="qrsquare">'
            f'<div class="qricon">&#9635;</div></div>'
            f'<p class="qrcap">{html.escape(caption)}</p></div>')


def doc(lang, title, css_extra, pages):
    css = BASE_CSS + (css_extra or '')
    return f'''<!DOCTYPE html>
<html lang="{lang}"><head><meta charset="utf-8">
<title>{title}</title>
<style>{css}</style></head>
<body>{''.join(pages)}</body></html>'''


BASE_CSS = f'''
@font-face {{ font-family:'Sasson Montessori'; src:url('fonts/SassoonMontessori.ttf'); font-weight:normal; }}
@font-face {{ font-family:'Playpen Sans'; src:url('fonts/PlaypenSans-400.ttf'); font-weight:400; }}
@font-face {{ font-family:'Playpen Sans'; src:url('fonts/PlaypenSans-600.ttf'); font-weight:600; }}
@font-face {{ font-family:'Playpen Sans'; src:url('fonts/PlaypenSans-700.ttf'); font-weight:700; }}
@font-face {{ font-family:'Playpen Sans'; src:url('fonts/PlaypenSans-800.ttf'); font-weight:800; }}
* {{ margin:0; padding:0; box-sizing:border-box; }}
:root {{
  --font-head:'Playpen Sans',system-ui,sans-serif;
  --font-body:'Sasson Montessori','Playpen Sans',system-ui,sans-serif;
}}
@page {{ size:A4; margin:0; }}
body {{ font-family:var(--font-body); color:#4a4a4a; }}
.page {{
  position:relative; width:210mm; height:296.5mm; overflow:hidden;
  page-break-after:always;
  background:
    url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAArUlEQVR42u3VUQkAIAxFUSfWt4wNTDYD6LcgnhvhHcYiM0fZm0VXqiYAAEAAvq2dHm5EdNO4AAACAEAAAAgAAAEAIAAABACAAAAQAAACAEAAAAgAAAEAIAAABACAAAAQAAACAEAAAAgAAAEAIAAABACAAAAQAAACAACAAAAQAAACAEAAAAgAAAEAIAAABACAAAAQAAACAEAAAAgAAAEAIAAABACAAAAQAAAC8GILoF0Gg4kZ4kUAAAAASUVORK5CYII=) 0 0/8mm 8mm repeat,
    linear-gradient(165deg,#f3e8d8 0%,#f6ecec 45%,#f3dde6 100%);
}}
.band {{ position:absolute; left:0; top:0; bottom:0; width:11mm;
  background:linear-gradient(180deg,{BROWN_MID},{ROSE}); }}
.band span {{ position:absolute; left:50%; top:75%; transform:translate(-50%,-50%);
  writing-mode:vertical-rl; text-orientation:mixed; rotate:180deg;
  font-family:var(--font-head); font-size:6.5pt; letter-spacing:3.5px; color:#fff; white-space:nowrap; }}
.rside {{ position:absolute; right:2.5mm; top:40%; }}
.rside span {{ writing-mode:vertical-rl; font-family:var(--font-head); font-size:6pt;
  letter-spacing:2.5px; color:#9a9a9a; white-space:nowrap; }}
.phead {{ text-align:center; padding-top:9mm; }}
.ph1 {{ font-family:var(--font-head); font-weight:600; font-size:7pt; letter-spacing:4px; color:#8a7460; }}
.ph2 {{ font-family:var(--font-head); font-weight:600; font-size:6.3pt; letter-spacing:2.4px; color:{ROSE}; margin-top:1.6mm; }}
.content {{ padding:5mm 16mm 0 20mm; }}
.pfoot {{ position:absolute; bottom:6.5mm; left:0; right:0; text-align:center;
  font-family:var(--font-head); font-weight:700; font-size:10pt; color:#8a8a8a; }}

.banner {{ background:#f5e5b2; border-radius:14px; padding:3.6mm 6mm; margin:2mm 0 4.5mm;
  box-shadow:0 1px 4px rgba(0,0,0,.08); text-align:center; }}
.banner h1 {{ font-family:var(--font-head); font-weight:800; font-size:16.5pt; color:{INK};
  letter-spacing:.4px; text-transform:uppercase; }}
.pillwrap {{ text-align:center; margin:4.5mm 0 3mm; }}
.pill {{ display:inline-block; border-radius:999px; padding:2.4mm 9mm;
  font-family:var(--font-head); font-weight:700; font-size:10.5pt; color:#fff;
  letter-spacing:.4px; text-transform:uppercase; box-shadow:0 1px 4px rgba(0,0,0,.12); }}
.rosepill {{ background:{ROSE}; }}
.sagepill {{ background:{SAGE}; }}
.card {{ background:rgba(255,255,255,.93); border:2px solid #ecd2c0; border-radius:16px;
  padding:4mm 6mm; margin:0 0 4mm; box-shadow:0 1px 5px rgba(0,0,0,.06); }}
.cream {{ background:#fbf3e8; border:2px solid #ecd2c0; border-radius:16px;
  padding:4mm 6mm; margin:4mm 0; text-align:center; }}
.creamtitle {{ font-family:var(--font-head); font-weight:700; font-size:11pt; color:{SAGE}; }}
p {{ font-size:10.6pt; line-height:1.52; margin-bottom:2.2mm; }}
p.small, .small {{ font-size:9.5pt; color:#777; }}
p.center {{ text-align:center; }}
ul.dots {{ list-style:none; }}
ul.dots li {{ font-size:10.6pt; line-height:1.48; padding-left:5.5mm; position:relative; margin:1.6mm 0; }}
ul.dots li::before {{ content:'•'; position:absolute; left:1mm; color:{ROSE}; font-weight:bold; }}
ol.steps {{ list-style:none; }}
ol.steps li {{ display:flex; gap:3.5mm; align-items:flex-start; background:rgba(255,255,255,.93);
  border:2px solid #ecd2c0; border-radius:14px; padding:3mm 5mm; margin-bottom:2.4mm; }}
ol.steps li div {{ font-size:10.4pt; line-height:1.46; }}
.snum {{ flex:0 0 auto; width:7.5mm; height:7.5mm; border-radius:50%; background:{ROSE}; color:#fff;
  font-family:var(--font-head); font-weight:700; font-size:11pt; display:flex;
  align-items:center; justify-content:center; margin-top:.5mm; }}
table.t {{ width:100%; border-collapse:collapse; margin:2.5mm 0; }}
table.t th {{ font-family:var(--font-head); font-weight:700; font-size:9.3pt; color:{ROSE};
  text-align:left; padding:1.5mm 2.5mm; border-bottom:2px solid #ecd2c0; }}
table.t td {{ font-size:9.7pt; padding:1.4mm 2.5mm; border-bottom:1px solid #f2e3d8; line-height:1.38; }}
table.tl td:first-child {{ white-space:nowrap; }}
.dot {{ display:inline-block; width:3.5mm; height:3.5mm; border-radius:50%; vertical-align:-0.5mm; margin-right:1.5mm; }}

.coverimg {{ text-align:center; margin:3mm 0 3mm; }}
.coverimg img {{ width:98mm; border-radius:14px; box-shadow:0 3px 10px rgba(0,0,0,.18);
  border:3mm solid #fff; }}
.covertag {{ text-align:center; font-family:var(--font-head); font-size:8pt; letter-spacing:2.6px;
  color:#8a8a8a; margin:1mm 0 2.5mm; }}
.coverbanner {{ display:flex; align-items:center; justify-content:center; gap:5mm;
  background:#f5e5b2; border-radius:16px; padding:3.4mm 6mm; box-shadow:0 1px 5px rgba(0,0,0,.1); }}
.covertitle {{ font-family:var(--font-head); font-weight:800; font-size:27pt; color:{INK}; letter-spacing:1px; }}
.subpill {{ margin:3.6mm auto; width:fit-content; background:#fdf9e3; border:2.5px solid {INK};
  border-radius:999px; padding:1.8mm 8mm; font-family:var(--font-head); font-weight:700;
  font-size:10pt; color:{INK}; letter-spacing:.4px; }}
.byline {{ text-align:center; margin-top:3.5mm; }}
.by1 {{ font-family:var(--font-head); font-weight:700; font-size:12.5pt; color:{SAGE}; }}
.by2 {{ font-size:10.2pt; color:#8a8a8a; margin-top:.8mm; }}
.by3 {{ font-family:var(--font-head); font-weight:600; font-size:9.6pt; color:{ROSE}; margin-top:.5mm; }}
.notecard {{ display:flex; gap:4mm; align-items:center; background:rgba(255,255,255,.8);
  border-radius:12px; padding:3.2mm 6mm; margin-top:4mm; }}
.notecard p {{ font-size:9.3pt; color:#777; margin:0; }}
.noteemo {{ font-size:16pt; }}

.twocol {{ display:flex; gap:6mm; align-items:flex-start; }}
.twocol > div {{ flex:1; }}
.figwrap {{ text-align:center; }}
.figwrap img {{ width:44mm; border-radius:12px; box-shadow:0 2px 6px rgba(0,0,0,.14); border:2mm solid #fff; }}
.figcap {{ font-size:9pt; color:#888; text-align:center; margin-top:1.5mm; }}
.schematic {{ margin:2mm 0 1mm; }}
.deler-grid {{ display:grid; grid-template-columns:1fr 1fr; gap:2.4mm 6mm; margin:1mm 0 2mm; }}
.deler-grid .di {{ font-size:10pt; line-height:1.4; padding:1.6mm 0; border-bottom:1px dashed #e6d3c4; }}
.deler-grid .di b {{ color:{SAGE}; font-family:var(--font-head); }}

.photorow {{ display:flex; gap:3mm; flex-wrap:wrap; justify-content:center; margin:2mm 0 3mm; }}
.photoph {{ aspect-ratio:1/1; max-width:44mm; background:rgba(255,255,255,.7);
  border:2px dashed #d9bfa8; border-radius:12px; display:flex; flex-direction:column;
  align-items:center; justify-content:center; gap:1.5mm; padding:2mm; }}
.phicon {{ font-size:17pt; opacity:.45; }}
.phcap {{ font-size:8.3pt; color:#9a8a7a; text-align:center; line-height:1.3; }}
.qrbox {{ text-align:center; margin:3mm 0; }}
.qrsquare {{ width:26mm; height:26mm; margin:0 auto; background:#fff; border:2px dashed #d9bfa8;
  border-radius:10px; display:flex; align-items:center; justify-content:center; }}
.qricon {{ font-size:20pt; color:#d9bfa8; }}
.qrcap {{ font-size:9pt; color:#888; margin-top:1.6mm; }}
'''
