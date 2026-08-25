# -*- coding: utf-8 -*-
"""Genererer LME-strikkeoppskrift, NORGE/NORWAY-runehatt (voksen), norsk + engelsk.
Ny oppskrift: samme runeskrift-design som den heklede runehatten
(norge-rune-bottehatt/build_rune.py), men strikket i stedet for heklet.
Hatten strikkes rundt og rundt nedenfra og opp (bølget brem med striper,
rett hoveddel, felt topp), og bokstavene stikkes på til slutt med kjedesting
(broderi), etter samme "Norse"-skrift-mal som den heklede versjonen."""
import base64, html, pathlib

BASE = pathlib.Path(__file__).parent
PHOTO = BASE / 'rune_strikk_ref.jpg'
LOGO = BASE / 'lme-logo.png'

RED, NAVY, WHITE, CREAM, INK, PINK, TEAL, CERISE = (
    '#C8102E', '#00205B', '#FFFFFF', '#F8F4EA', '#3f3f3f', '#df5f93', '#4aa7a4', '#E91E89')


def runeword(word, box=48, panel=True, stroke=CREAM):
    fs = box * 1.30
    padx = box * 0.55; pady = box * 0.34
    lsp = box * 0.05
    txt = ("display:inline-block;font-family:'Norse';font-weight:700;color:" + stroke + ";"
           "font-size:" + f"{fs:.0f}" + "px;line-height:1.02;letter-spacing:" + f"{lsp:.0f}" + "px;white-space:nowrap;")
    if panel:
        wrap = ("display:inline-block;background:" + RED + ";border-radius:" + f"{box*0.30:.0f}" + "px;"
                "padding:" + f"{pady:.0f}" + "px " + f"{padx:.0f}" + "px;max-width:100%;")
        return '<div style="' + wrap + '"><span style="' + txt + '">' + word + '</span></div>'
    return '<span style="' + txt + '">' + word + '</span>'


def mini_flag(w=34):
    h = round(w * 10 / 13)
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 20" '
            f'style="width:{w}px;height:{h}px;border-radius:3px">'
            f'<rect width="26" height="20" fill="{RED}"/>'
            f'<rect x="6" width="6" height="20" fill="#fff"/><rect y="7" width="26" height="6" fill="#fff"/>'
            f'<rect x="7.5" width="3" height="20" fill="{NAVY}"/><rect y="8.5" width="26" height="3" fill="{NAVY}"/>'
            f'</svg>')


def vgrid(cols, rows, sw=34, sh=26, ox=10, oy=14, hi=None, done=None):
    out = []
    for r in range(rows):
        for c in range(cols):
            x = ox + c * sw; y = oy + r * sh
            wpath = (f'M{x+3},{y+sh-2} Q{x+sw*0.30},{y+sh*0.35} {x+sw/2},{y+2} '
                     f'Q{x+sw*0.70},{y+sh*0.35} {x+sw-3},{y+sh-2}')
            out.append(f'<path d="{wpath}" fill="none" stroke="#a30d24" stroke-width="7" stroke-linecap="round"/>')
            out.append(f'<path d="{wpath}" fill="none" stroke="{RED}" stroke-width="5" stroke-linecap="round"/>')
    if hi:
        c, r = hi
        x = ox + c * sw; y = oy + r * sh
        out.append(f'<rect x="{x-2}" y="{y-4}" width="{sw+4}" height="{sh+8}" rx="6" fill="none" stroke="{TEAL}" stroke-width="2.5" stroke-dasharray="5 4"/>')
    return ''.join(out)


def chainstitch_panels(L):
    """Tre paneler som viser kjedesting: broderiteknikken for å legge bokstavene på."""
    def tag(cx, text, w=None):
        w = w or (len(text) * 6.3 + 14)
        x = cx - w / 2
        return (f'<rect x="{x}" y="6" width="{w}" height="17" rx="8.5" fill="#e9f6f5" '
                f'stroke="{TEAL}" stroke-width="1.5"/>'
                f'<text x="{cx}" y="18.4" text-anchor="middle" font-size="11" '
                f'font-family="sans-serif" font-weight="bold" fill="#2e8e8a">{html.escape(text)}</text>')
    panels = []

    g1 = vgrid(4, 3, hi=(1, 1))
    g1 += f'<circle cx="62" cy="60" r="6" fill="{TEAL}"/>'
    g1 += f'<path d="M62,86 L62,66" stroke="{TEAL}" stroke-width="3" marker-end="url(#at)"/>'
    g1 += tag(78, L('nål opp her', 'needle up here'))
    panels.append((1, L('Stikk nålen opp gjennom strikketøyet, der bokstaven skal begynne, langs streken på malen.',
                        'Bring the needle up through the knitting, where the letter is to begin, along the line on the template.'), g1))

    g2 = vgrid(4, 3, hi=(1, 1))
    g2 += f'<circle cx="62" cy="60" r="6" fill="none" stroke="{TEAL}" stroke-width="2.5"/>'
    g2 += (f'<path d="M62,60 Q80,42 96,60" fill="none" stroke="{CREAM}" stroke-width="5" stroke-linecap="round"/>')
    g2 += f'<circle cx="96" cy="60" r="4" fill="{TEAL}"/>'
    g2 += tag(78, L('løkke og hold', 'loop and hold'))
    panels.append((2, L('Legg en løkke av garnet foran nålen, hold den løst med tommelen, og stikk nålen ned igjen '
                        'et lite hakk lenger fram langs streken.',
                        'Lay a loop of yarn in front of the needle, hold it loosely with your thumb, and take the needle back down a small step further along the line.'), g2))

    g3 = vgrid(4, 3, hi=(1, 1))
    g3 += (f'<path d="M40,60 Q62,50 84,60 Q100,66 112,58" fill="none" stroke="{CREAM}" stroke-width="5" stroke-linecap="round"/>')
    g3 += f'<path d="M112,58 L120,50" stroke="{TEAL}" stroke-width="3" marker-end="url(#at)"/>'
    g3 += tag(78, L('gjenta langs streken', 'repeat along the line'))
    panels.append((3, L('Kom opp igjen inni løkka og dra til, akkurat stramt nok. Gjenta lenke for lenke langs hele '
                        'bokstaven, det kalles kjedesting.',
                        'Come back up inside the loop and pull snug, just tight enough. Repeat link after link along the whole letter, this is called chain stitch.'), g3))

    out = ['<div class="dsteps">']
    for n, txt, g in panels:
        out.append(f'''<div class="dstep">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 156 124" style="width:100%">
    <defs><marker id="at" markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto">
      <path d="M0,0 L7,3.5 L0,7 z" fill="{TEAL}"/></marker></defs>
    <rect x="1" y="1" width="154" height="122" rx="10" fill="#fff" stroke="#f2bfd4" stroke-width="2"/>
    {g}
  </svg>
  <div class="dnum">{n}</div>
  <p>{txt}</p>
</div>''')
    out.append('</div>')
    return ''.join(out)


photo_src = f'data:image/jpeg;base64,{base64.b64encode(PHOTO.read_bytes()).decode()}'
logo_src = f'data:image/png;base64,{base64.b64encode(LOGO.read_bytes()).decode()}' if LOGO.exists() else ''


def make_page(ph2, right_label):
    def _page(body, num):
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
    return _page


def banner(t): return f'<div class="banner"><h1>{t}</h1></div>'
def pink(t): return f'<div class="pillwrap"><div class="pill pinkpill">{t}</div></div>'
def tealp(t): return f'<div class="pillwrap"><div class="pill tealpill">{t}</div></div>'
def card(inner): return f'<div class="card">{inner}</div>'
def cream(inner): return f'<div class="cream">{inner}</div>'
def ul(items): return '<ul class="dots">' + ''.join(f'<li>{i}</li>' for i in items) + '</ul>'
def steps(items, start=1):
    return '<ol class="steps">' + ''.join(
        f'<li><span class="snum">{start+i}</span><div>{t}</div></li>' for i, t in enumerate(items)) + '</ol>'
def tip(text):
    return f'<div class="notecard"><span class="noteemo">&#129525;</span><p><i>TIPS: {text}</i></p></div>'
def byline(name_line, company='Little Montessori Explorers', site='lmexplorers.com'):
    logo_html = f'<img class="logo" src="{logo_src}" alt="Little Montessori Explorers">' if logo_src else ''
    return f'''<div class="byline">
  {logo_html}
  <div class="by1">{name_line}</div>
  <div class="by2">{company}</div>
  <div class="by3">{site}</div>
</div>'''
def pc(no, en, L):
    """<p class="center">...</p>, tekst via L(), trygt uten multi-linje f-string."""
    return '<p class="center">' + L(no, en) + '</p>'
def p(no, en, L):
    return '<p>' + L(no, en) + '</p>'
def ctitle(no, en, L):
    return cream('<p class="creamtitle">' + L(no, en) + '</p>')

css = f'''
@font-face {{ font-family:'Norse'; src:url('fonts/Norse-Bold.otf'); font-weight:700; }}
@font-face {{ font-family:'Sasson Montessori'; src:url('fonts/SassoonMontessori.ttf'); font-weight:normal; }}
@font-face {{ font-family:'Playpen Sans'; src:url('fonts/PlaypenSans-400.ttf'); font-weight:400; }}
@font-face {{ font-family:'Playpen Sans'; src:url('fonts/PlaypenSans-600.ttf'); font-weight:600; }}
@font-face {{ font-family:'Playpen Sans'; src:url('fonts/PlaypenSans-700.ttf'); font-weight:700; }}
@font-face {{ font-family:'Playpen Sans'; src:url('fonts/PlaypenSans-800.ttf'); font-weight:800; }}
* {{ margin:0; padding:0; box-sizing:border-box; }}
:root {{ --font-head:'Playpen Sans',system-ui,sans-serif; --font-body:'Sasson Montessori','Playpen Sans',system-ui,sans-serif; }}
@page {{ size:A4; margin:0; }}
body {{ font-family:var(--font-body); color:#4a4a4a; }}
.page {{ position:relative; width:210mm; height:296.5mm; overflow:hidden; page-break-after:always;
  background: repeating-linear-gradient(0deg, rgba(255,255,255,.45) 0, rgba(255,255,255,.45) .4mm, transparent .4mm, transparent 8mm),
    repeating-linear-gradient(90deg, rgba(255,255,255,.45) 0, rgba(255,255,255,.45) .4mm, transparent .4mm, transparent 8mm),
    linear-gradient(165deg,#cde8ef 0%,#e3ddea 45%,#f5d2de 100%); }}
.band {{ position:absolute; left:0; top:0; bottom:0; width:11mm; background:linear-gradient(180deg,#9fd4dd,#f0b9ca); }}
.band span {{ position:absolute; left:50%; top:75%; transform:translate(-50%,-50%); writing-mode:vertical-rl; text-orientation:mixed; rotate:180deg;
  font-family:var(--font-head); font-size:6.5pt; letter-spacing:3.5px; color:#fff; white-space:nowrap; }}
.rside {{ position:absolute; right:2.5mm; top:40%; }}
.rside span {{ writing-mode:vertical-rl; font-family:var(--font-head); font-size:6pt; letter-spacing:2.5px; color:#9a9a9a; white-space:nowrap; }}
.phead {{ text-align:center; padding-top:7mm; }}
.ph1 {{ font-family:var(--font-head); font-weight:600; font-size:9pt; letter-spacing:3.5px; color:#7f96a8; }}
.ph2 {{ font-family:var(--font-head); font-weight:600; font-size:8.5pt; letter-spacing:2.2px; color:{PINK}; margin-top:1.4mm; }}
.content {{ padding:2mm 12mm 0 15mm; }}
.pfoot {{ position:absolute; bottom:3mm; left:0; right:0; text-align:center; font-family:var(--font-head); font-weight:700; font-size:13pt; color:#8a8a8a; }}
.banner {{ background:#f5efb2; border-radius:14px; padding:2.2mm 6mm; margin:.6mm 0 2.4mm; text-align:center; }}
.banner h1 {{ font-family:var(--font-head); font-weight:800; font-size:19pt; color:{INK}; letter-spacing:.4px; text-transform:uppercase; }}
.pillwrap {{ text-align:center; margin:2.4mm 0 1.6mm; }}
.pill {{ display:inline-block; border-radius:999px; padding:1.5mm 7mm; font-family:var(--font-head); font-weight:700; font-size:13pt; color:#fff; letter-spacing:.4px; text-transform:uppercase; }}
.pinkpill {{ background:{PINK}; }}
.tealpill {{ background:{TEAL}; }}
.card {{ background:rgba(255,255,255,.93); border:2px solid #f2bfd4; border-radius:16px; padding:2.2mm 5mm; margin:0 0 2mm; }}
.cream {{ background:{CREAM}; border:2px solid #f2bfd4; border-radius:16px; padding:2.2mm 5mm; margin:2mm 0; text-align:center; }}
.creamtitle {{ font-family:var(--font-head); font-weight:700; font-size:14pt; color:{TEAL}; }}
p {{ font-size:14.5pt; line-height:1.26; margin-bottom:1.1mm; }}
p.small, .small {{ font-size:12pt; color:#777; }}
p.center {{ text-align:center; }}
.bignum {{ font-family:var(--font-head); font-weight:700; color:{PINK}; font-size:16pt; }}
ul.dots {{ list-style:none; }}
ul.dots li {{ font-size:14.5pt; line-height:1.22; padding-left:5.5mm; position:relative; margin:.6mm 0; }}
ul.dots li::before {{ content:'•'; position:absolute; left:1mm; color:{PINK}; font-weight:bold; }}
ol.steps {{ list-style:none; }}
ol.steps li {{ display:flex; gap:2.6mm; align-items:flex-start; background:rgba(255,255,255,.93); border:2px solid #f2bfd4; border-radius:14px; padding:1.6mm 4mm; margin-bottom:1.1mm; }}
ol.steps li div {{ font-size:13pt; line-height:1.2; }}
.snum {{ flex:0 0 auto; width:7.5mm; height:7.5mm; border-radius:50%; background:{PINK}; color:#fff; font-family:var(--font-head); font-weight:700; font-size:13pt; display:flex; align-items:center; justify-content:center; margin-top:.5mm; }}
table.t {{ width:100%; border-collapse:collapse; margin:1mm 0; }}
table.t th {{ font-family:var(--font-head); font-weight:700; font-size:11.5pt; color:{PINK}; text-align:left; padding:.8mm 2mm; border-bottom:2px solid #f2bfd4; }}
table.t td {{ font-size:12pt; padding:.7mm 2mm; border-bottom:1px solid #f6dbe7; line-height:1.16; }}
table.tl td:first-child {{ white-space:nowrap; }}
.dot {{ display:inline-block; width:3.5mm; height:3.5mm; border-radius:50%; vertical-align:-0.5mm; margin-right:1.5mm; border:1px solid rgba(0,0,0,.15); }}
.coverimg {{ text-align:center; margin:2.4mm 0 2.4mm; }}
.coverimg img {{ width:82mm; border-radius:14px; border:3mm solid #fff; }}
.coverrune {{ text-align:center; margin:3mm 0; }}
.covertag {{ text-align:center; font-family:var(--font-head); font-size:10.5pt; letter-spacing:2.3px; color:#8a8a8a; margin:1mm 0 2mm; }}
.coverbanner {{ display:flex; align-items:center; justify-content:center; gap:5mm; background:#f5efb2; border-radius:16px; padding:2.6mm 6mm; }}
.covertitle {{ font-family:var(--font-head); font-weight:800; font-size:23pt; color:{INK}; letter-spacing:.5px; text-align:center; line-height:1.18; }}
.subpill {{ margin:2.6mm auto; width:fit-content; background:#fdf9e3; border:2.5px solid {INK}; border-radius:999px; padding:1.4mm 7mm; font-family:var(--font-head); font-weight:700; font-size:12pt; color:{INK}; letter-spacing:.4px; text-align:center; }}
.byline {{ text-align:center; margin-top:1.2mm; }}
.byline .logo {{ width:26mm; height:26mm; object-fit:contain; margin-bottom:1mm; }}
.by1 {{ font-family:var(--font-head); font-weight:700; font-size:19pt; color:{CERISE}; }}
.by2 {{ font-size:14pt; color:#8a8a8a; margin-top:1mm; }}
.by3 {{ font-family:var(--font-head); font-weight:600; font-size:13pt; color:{CERISE}; margin-top:.7mm; }}
.notecard {{ display:flex; gap:3mm; align-items:center; background:rgba(255,255,255,.8); border-radius:12px; padding:2.2mm 5mm; margin-top:2.4mm; }}
.notecard p {{ font-size:12pt; color:#777; margin:0; }}
.noteemo {{ font-size:15pt; }}
.congrats {{ font-family:var(--font-head); font-weight:800; font-size:17pt; color:{INK}; text-align:center; margin:1.5mm 0 1mm; }}
.copyright {{ font-size:9.5pt; color:#9a9a9a; text-align:center; margin-top:1.5mm; line-height:1.25; }}
.cflag {{ line-height:0; }}
.dsteps {{ display:flex; gap:4mm; }}
.dstep {{ flex:1; text-align:center; position:relative; }}
.dstep p {{ font-size:11pt; line-height:1.3; margin-top:1.5mm; text-align:left; }}
.dnum {{ position:absolute; top:-2.5mm; left:-1.5mm; width:7mm; height:7mm; border-radius:50%; background:{PINK}; color:#fff; font-family:var(--font-head); font-weight:700; font-size:10.5pt; display:flex; align-items:center; justify-content:center; }}
.endflag {{ text-align:center; margin:4mm 0 2mm; }}
'''


def build_doc(LANG):
    def L(no, en): return en if LANG == 'en' else no
    right = L('LME STRIKK', 'LME KNIT')
    ph2 = L('LME STRIKKEOPPSKRIFT&nbsp;&nbsp;|&nbsp;&nbsp;NORGE-RUNEHATT',
            'LME KNITTING PATTERN&nbsp;&nbsp;|&nbsp;&nbsp;NORGE RUNE HAT')
    ph = make_page(ph2, right)
    pages = []

    cover_alt = L('Rød runehatt strikket, med NORGE i runeskrift foran og stripet brem',
                  'Red rune hat, knitted, with NORGE in runes at the front and a striped brim')
    cover_body = (
        f'<div class="coverimg"><img src="{photo_src}" alt="{cover_alt}"></div>'
        + f'<div class="covertag">{L("LME STRIKKEOPPSKRIFT", "LME KNITTING PATTERN")}</div>'
        + '<div class="coverbanner">'
        + f'<div class="cflag">{mini_flag(34)}</div>'
        + f'<h1 class="covertitle">{L("NORGE-RUNEHATT", "NORGE RUNE HAT")}</h1>'
        + f'<div class="cflag">{mini_flag(34)}</div>'
        + '</div>'
        + f'<div class="subpill">{L("RUNESTIL-BOKSTAVER BRODERT PÅ &middot; STRIPET BREM", "RUNE-STYLE LETTERS EMBROIDERED ON &middot; STRIPED BRIM")}</div>'
        + card(pc(
            'En rød bøttehatt strikket i bomull. Du strikker hele hatten i rødt, med en stripet brem i '
            'rødt, hvitt og blått nederst, akkurat som den heklede runehatten. Så broderer du "NORGE" '
            'på med kjedesting, i lesbare runestil-bokstaver, én sammenhengende linje rundt forsiden, og et '
            'lite norsk flagg på toppen. Vil du heller ha "NORWAY", finner du malen i samme oppskrift. '
            'Voksenstørrelser XS til XXL.',
            'A red bucket hat knitted in cotton. You knit the whole hat in red, with a striped brim in red, '
            'white and blue at the bottom, just like the crocheted rune hat. Then you embroider "NORGE" '
            'on with chain stitch, in readable rune-style letters, one continuous line around the front, and a '
            'little Norwegian flag on the top. If you would rather have "NORWAY", the template is in the '
            'same pattern. Adult sizes XS to XXL.', L))
        + byline(L('Av Renate Dahl', 'By Renate Dahl'))
        + tip(L('Les hele oppskriften én gang før du legger opp. Strikk alltid en prøvelapp først, se side 3.',
                 'Read the whole pattern once before you cast on. Always knit a gauge swatch first, see page 3.'))
    )
    pages.append(ph(cover_body, 1))

    pages.append(ph(
        banner(L('FØR DU BEGYNNER', 'BEFORE YOU START'))
        + p('Bøttehatten strikkes rundt på rundpinne eller strømpepinner, nedenfra og opp, i rødt. Du '
            'legger opp dobbelt så mange masker som du trenger, strikker en stripet brem, og strikker '
            'sammen 2 og 2 masker på siste bremomgang, det er dette som lager bølgekanten. Deretter '
            'strikker du hoveddelen rett opp, feller toppen, og broderer helt til slutt "NORGE" eller '
            '"NORWAY" på med kjedesting, pluss et lite flagg på toppen.',
            'The bucket hat is knitted in the round on a circular needle or double-pointed needles, from '
            'the bottom up, in red. You cast on twice as many stitches as you need, knit a striped brim, '
            'and knit 2 stitches together all the way round on the last brim round, this is what creates '
            'the flared edge. Then you knit the main body straight up, decrease the crown, and right at '
            'the end embroider "NORGE" or "NORWAY" on with chain stitch, plus a little flag on the top.', L)
        + tealp(L('DETTE LÆRER DU', 'WHAT YOU LEARN'))
        + card(ul([
            L('Å strikke en lue/hatt rundt på rundpinne eller strømpepinner', 'To knit a hat in the round on a circular needle or double-pointed needles'),
            L('Å strikke en stripet, bølget brem med en sammenstrikkingsomgang', 'To knit a striped, flared brim with a decrease round'),
            L('Å brodere runestil-bokstaver med kjedesting, etter en skriftmal', 'To embroider rune-style letters with chain stitch, following a font template'),
            L('Å felle en rundet topp jevnt ned til få masker', 'To decrease a rounded crown evenly down to a few stitches'),
        ]))
        + pink(L('HVOR VANSKELIG ER DET?', 'HOW HARD IS IT?'))
        + card(p('Nybegynner pluss. Du bør kunne legge opp, strikke glattstrikk rundt, strikke to masker '
                 'sammen og bytte farge. Selve hatten strikkes i kun rødt (pluss stripene i bremmen), '
                 'bokstavene kommer på etterpå med nål og tråd, og alt er forklart trinn for trinn.',
                 'Beginner plus. You should be able to cast on, knit stockinette in the round, knit two '
                 'stitches together and change colour. The hat itself is knitted in just red (plus the brim '
                 'stripes), the letters come on afterwards with a needle and thread, and every step is '
                 'spelled out in this pattern.', L))
        + ctitle('Usikker på størrelsen? En bøttehatt kler å sitte litt løst, velg gjerne den største.',
                 'Unsure about the size? A bucket hat looks good sitting a little loose, feel free to choose the largest.', L)
    , 2))

    size_table = (
        '<table class="t"><tr><th></th><th>XS</th><th>S</th><th>M</th><th>L</th><th>XL</th><th>XXL</th></tr>'
        '<tr><td>' + L('Passer hodemål', 'Fits head size') + '</td><td>52&ndash;54 cm</td><td>54&ndash;56 cm</td><td>56&ndash;58 cm</td><td>58&ndash;61 cm</td><td>61&ndash;63 cm</td><td>63&ndash;66 cm</td></tr>'
        '<tr><td>' + L('Legg opp', 'Cast on') + '</td><td>170 m</td><td>176 m</td><td>184 m</td><td>190 m</td><td>198 m</td><td>208 m</td></tr>'
        '<tr><td>' + L('Etter bølgeomgang', 'After the wave round') + '</td><td>85 m</td><td>88 m</td><td>92 m</td><td>95 m</td><td>99 m</td><td>104 m</td></tr></table>')
    yarn_table = (
        '<table class="t"><tr><th>' + L('Farge', 'Colour') + '</th><th>' + L('Bruk', 'Use') + '</th></tr>'
        + f'<tr><td><span class="dot" style="background:{RED}"></span> ' + L('Rød', 'Red') + '</td><td>' + L('hovedfarge, hele hatten', 'main colour, whole hat') + '</td></tr>'
        + f'<tr><td><span class="dot" style="background:{WHITE};border-color:#ccc;"></span> ' + L('Hvit', 'White') + '</td><td>' + L('striper i bremmen', 'stripes in the brim') + '</td></tr>'
        + f'<tr><td><span class="dot" style="background:{NAVY}"></span> ' + L('Marineblå', 'Navy') + '</td><td>' + L('striper i bremmen, flagget', 'stripes in the brim, the flag') + '</td></tr></table>')
    pages.append(ph(
        banner(L('STØRRELSER OG DETTE TRENGER DU', 'SIZES AND WHAT YOU NEED'))
        + tealp(L('HVILKEN STØRRELSE?', 'WHICH SIZE?'))
        + card(p('Mål rundt hodet med et målebånd, rett over ørene og øyenbrynene. Velg størrelsen som '
                 'passer hodemålet. Hatten skal være 3 til 4 cm mindre enn hodet, for strikk strekker seg.',
                 'Measure around the head with a tape measure, right above the ears and eyebrows. Choose the '
                 'size that fits the head measurement. The hat should be 3 to 4 cm smaller than the head, '
                 'since knitting stretches.', L) + size_table)
        + tealp(L('GARN OG FARGER', 'YARN AND COLOURS'))
        + card(p('Et glatt bomullsgarn (aran/tykkelse 4) som gir 17 masker x 22 omganger glattstrikk = 10 x '
                 '10 cm på pinne 5 mm.',
                 'A smooth cotton yarn (aran weight) that gives 17 stitches x 22 rounds in stockinette = 10 x '
                 '10 cm on 5 mm needles.', L) + yarn_table)
        + pink(L('PINNER OG UTSTYR', 'NEEDLES AND KIT'))
        + card(ul([
            L('Rundpinne 5 mm, 40 cm, eller strømpepinner/magic loop-sett 5 mm', '5 mm circular needle, 40 cm, or 5 mm double-pointed needles/magic loop set'),
            L('<b>Stoppenål med butt spiss</b> til broderiet', '<b>Tapestry needle with a blunt tip</b> for the embroidery'),
            L('Maskemarkør, saks og målebånd', 'Stitch marker, scissors and tape measure'),
        ]))
    , 3))

    pages.append(ph(
        banner(L('STRIKKEFASTHET OG ORDLISTE', 'GAUGE AND GLOSSARY'))
        + tealp(L('STRIKK EN PRØVELAPP FØRST', 'KNIT A SWATCH FIRST'))
        + card(p('Legg opp 30 masker med rød. Strikk glattstrikk rundt (eller frem og tilbake med en kant) '
                 'til lappen er minst 12 x 12 cm. Mål deretter midt på lappen.',
                 'Cast on 30 stitches in red. Knit stockinette in the round (or back and forth with an edge) '
                 'until the swatch is at least 12 x 12 cm. Then measure across the middle.', L)
              + ul([
                  L('Flere enn 17 masker på 10 cm: prøv en tykkere pinne.', 'More than 17 stitches over 10 cm: try a thicker needle.'),
                  L('Færre enn 17 masker på 10 cm: prøv en tynnere pinne.', 'Fewer than 17 stitches over 10 cm: try a thinner needle.'),
                  L('Nøyaktig 17 masker: bruk pinne 5 mm og sett i gang.', 'Exactly 17 stitches: use 5 mm needles and get going.'),
              ]))
        + pink(L('ORDLISTE', 'GLOSSARY'))
        + card('<table class="t tl"><tr><th>' + L('Ord', 'Term') + '</th><th>' + L('Betyr', 'Means') + '</th></tr>'
               + '<tr><td><b>' + L('m', 'st') + '</b></td><td>' + L('maske', 'stitch') + '</td></tr>'
               + '<tr><td><b>' + L('omg', 'round') + '</b></td><td>' + L('omgang, én hel runde rundt', 'one whole lap around') + '</td></tr>'
               + '<tr><td><b>' + L('r', 'k') + '</b></td><td>' + L('rett', 'knit') + '</td></tr>'
               + '<tr><td><b>' + L('2 r sammen', 'k2tog') + '</b></td><td>' + L('strikk 2 masker som én, minker én maske', 'knit 2 stitches together, decreases one stitch') + '</td></tr>'
               + '<tr><td><b>HF</b></td><td>' + L('hovedfarge (rød)', 'main colour (red)') + '</td></tr>'
               + '<tr><td><b>' + L('kjedesting', 'chain stitch') + '</b></td><td>' + L('broderiteknikk som lager en kjede av løkker langs en linje', 'embroidery technique that makes a chain of loops along a line') + '</td></tr></table>')
    , 4))

    pages.append(ph(
        banner(L('DEL 1: LEGG OPP OG STRIKK BREMMEN', 'PART 1: CAST ON AND KNIT THE BRIM'))
        + steps([
            L('Legg opp tallet for din størrelse fra tabellen på side 3, med rød, på rundpinne 5 mm.',
              'Cast on the number for your size from the table on page 3, in red, on a 5 mm circular needle.'),
            L('Kontroller at oppleggskanten ikke er vridd. Sett sammen til en ring og plasser en maskemarkør ved omgangens begynnelse (midt bak).',
              'Check that the cast-on edge is not twisted. Join in the round and place a stitch marker at the start of the round (centre back).'),
            L('Strikk rett rundt i striper: 4 omg rød, 3 omg hvit, 3 omg marineblå, 3 omg hvit. La den gamle fargen hvile løst på baksiden når du bytter, ikke klipp den.',
              'Knit plain in the round in stripes: 4 rounds red, 3 rounds white, 3 rounds navy, 3 rounds white. Let the old colour rest loosely on the wrong side when you change, do not cut it.'),
            L('På aller siste bremomgang (rød): strikk 2 rette masker sammen, hele veien rundt. Det halverer maskeantallet nøyaktig, fra oppleggstallet til tallet i "Etter bølgeomgang" på side 3, og lager den bølgete kanten.',
              'On the very last brim round (red): knit 2 stitches together all the way round. This halves the stitch count exactly, from your cast-on number to the "After the wave round" number on page 3, and creates the flared edge.'),
        ])
        + pink(L('DEN BØLGETE KANTEN', 'THE FLARED EDGE'))
        + card(p('Sammenstrikkingsomgangen er det som gir bremmen den karakteristiske bølgekanten når hatten '
                 'ikke er strukket ut, det er riktig at kanten krøller seg litt inntil hatten er tatt i bruk.',
                 'The decrease round is what gives the brim its characteristic flared, wavy edge, it is normal '
                 'for the edge to curl in a little until the hat has been worn a few times.', L))
    , 5))

    height_table = (
        '<table class="t"><tr><th></th><th>XS</th><th>S</th><th>M</th><th>L</th><th>XL</th><th>XXL</th></tr>'
        '<tr><td>' + L('Hoveddel, fra bølgeomgang', 'Main body, from wave round') + '</td><td>9 cm</td><td>9.5 cm</td><td>10 cm</td><td>10.5 cm</td><td>11 cm</td><td>11.5 cm</td></tr></table>')
    pages.append(ph(
        banner(L('DEL 2: HOVEDDELEN OG TOPPEN', 'PART 2: THE MAIN BODY AND CROWN'))
        + card(height_table)
        + steps([
            L('Etter sammenstrikkingsomgangen strikker du glattstrikk rundt i rødt, uten mønster, til hoveddelen måler målet for din størrelse i tabellen over, fra bølgeomgangen. Ikke tenk på bokstavene ennå, de kommer på til slutt.',
              'After the decrease round, knit stockinette in the round in red, with no pattern, until the main body measures the value for your size in the table above, from the wave round. Do not worry about the letters yet, they come on at the end.'),
            L('Strikk én oppsettomgang: fell 7 masker jevnt fordelt rundt hele omgangen.',
              'Knit one setup round: decrease 7 stitches evenly spaced around the whole round.'),
            L('Del de gjenværende maskene i 7 like store felt med maskemarkører. Strikk til 2 masker gjenstår før hver markør, strikk disse 2 sammen. Gjenta ved alle 7 markørene.',
              'Divide the remaining stitches into 7 equal sections with stitch markers. Knit to 2 stitches before each marker, knit these 2 together. Repeat at all 7 markers.'),
            L('Strikk 1 vanlig omgang uten minking mellom hver av de 3 til 4 første minkeomgangene, fortsett deretter å minke på hver omgang til 7 masker gjenstår.',
              'Knit 1 plain round with no decreases between each of the first 3 to 4 decrease rounds, then continue decreasing every round until 7 stitches remain.'),
            L('Klipp av tråden med god margin, tre den gjennom de gjenværende maskene med en stoppenål, dra sammen og fest godt på innsiden.',
              'Cut the yarn leaving a generous tail, thread it through the remaining stitches with a tapestry needle, pull tight and fasten off securely on the inside.'),
        ])
        + ctitle('Bruk strømpepinner eller magic loop når det blir for trangt på rundpinnen, både i bremmen og mot toppen.',
                 'Switch to double-pointed needles or magic loop when it gets too tight for the circular needle, both in the brim and towards the crown.', L)
    , 6))

    pages.append(ph(
        banner(L('DEL 3: SLIK BRODERER DU BOKSTAVENE', 'PART 3: HOW TO EMBROIDER THE LETTERS'))
        + p('Hatten er nå ferdig strikket, helt rød med stripet brem. Bokstavene stikker du på med '
            'kjedesting: en lenke av løkker som følger streken på skriftmalen på neste side, og legger '
            'seg oppå strikken som en tydelig, opphøyd linje.',
            'The hat is now fully knitted, all red with a striped brim. You add the letters with chain '
            'stitch: a chain of loops that follows the line on the font template on the next page, and '
            'sits on top of the knitting as a clear, raised line.', L)
        + tealp(L('SLIK GJØR DU KJEDESTING', 'HOW TO WORK CHAIN STITCH'))
        + card(chainstitch_panels(L))
        + pink(L('GODE RÅD', 'GOOD TIPS'))
        + card(ul([
            L('Ikke stram garnet. Løkkene skal ligge løst og lat oppå strikken, ikke stramt.', 'Do not pull the yarn tight. The loops should sit loose and relaxed on top of the knitting, not tight.'),
            L('Tegn bokstavene lett med et vannløselig tusjmerke etter malen først, så treffer du formen.', 'Trace the letters lightly with a water-soluble marker following the template first, so you hit the shape.'),
            L('Start og slutt med å la 5 cm garn henge på innsiden, fest endene når du er ferdig.', 'Leave a 5 cm tail hanging on the inside at the start and end, weave in the ends when you are done.'),
        ]))
        + ctitle('Blir en lenke feil? Bare dra den forsiktig ut igjen og prøv en gang til.',
                 'A link come out wrong? Just pull it gently back out and try again.', L)
    , 7))

    pages.append(ph(
        banner(L('BOKSTAVENE: NORGE OG NORWAY', 'THE LETTERS: NORGE AND NORWAY'))
        + p('Her er bokstavene i runestil, både NORGE og NORWAY. Brodér dem på i én sammenhengende '
            'linje, sentrert midt foran, rett overfor maskemarkøren (som er midt bak). Hver bokstav er '
            'ca. 5 til 6 cm høy. Bunnen av bokstavene ligger ca. 3 til 4 cm over den stripete bremmen.',
            'Here are the letters in rune style, both NORGE and NORWAY. Embroider them on in one '
            'continuous line, centred at the front, directly opposite the stitch marker (which sits at '
            'centre back). Each letter is about 5 to 6 cm tall. The bottom of the letters sits about 3 '
            'to 4 cm above the striped brim.', L)
        + pink('NORGE')
        + card('<div class="coverrune">' + runeword('NORGE', box=54) + '</div>')
        + pink('NORWAY')
        + card('<div class="coverrune">' + runeword('NORWAY', box=48) + '</div>')
        + card(ul([
            L('<b>Midt foran:</b> Ordet sentreres midt foran. Alle bokstavene står på <b>samme linje</b>, aldri delt i to rader.',
              '<b>Centre front:</b> The word is centred at the front. All the letters are on the <b>same line</b>, never split into two rows.'),
            L('<b>Mellomrom:</b> hold likt mellomrom mellom bokstavene, ca. én bokstavbredde. Ordet går litt rundt mot sidene, det skal det.',
              '<b>Spacing:</b> keep an even gap between the letters, about one letter width. The word wraps a little towards the sides, and it is meant to.'),
        ]))
    , 8))

    pages.append(ph(
        banner(L('FLAGGET PÅ TOPPEN', 'THE FLAG ON THE TOP'))
        + p('På toppen av hatten broderer du et lite norsk flagg: et hvitt kors med et blått kors oppi, '
            'på den røde bunnen. Korset ligger midt på toppen og deler den i fire.',
            'On the top of the hat you embroider a small Norwegian flag: a white cross with a blue cross '
            'inside, on the red background. The cross sits in the middle of the top and divides it into four.', L)
        + '<div class="flagbig" style="text-align:center;margin:3mm 0;">' + mini_flag(150) + '</div>'
        + pink(L('SLIK GJØR DU', 'HOW TO DO IT'))
        + card(ul([
            L('Finn midten av toppen der maskene ble dratt sammen. Tenk deg et kors som deler toppen i fire.',
              'Find the middle of the top where the stitches were pulled together. Imagine a cross dividing the top into four.'),
            L('Brodér først det <b>hvite korset</b> med kjedesting: en arm framover, en bakover og en til hver side. Gjør de hvite linjene litt brede.',
              'Embroider the <b>white cross</b> first with chain stitch: one arm forward, one back and one to each side. Make the white lines a little wide.'),
            L('Brodér så det <b>blå korset</b> oppå midten av det hvite, litt smalere, så det hvite lyser rundt det blå.',
              'Then embroider the <b>blue cross</b> on top of the middle of the white, a little narrower, so the white shows around the blue.'),
            L('Fest alle tråder godt på innsiden.', 'Fasten all ends well on the inside.'),
        ]))
    , 9))

    congrats = L('Gratulerer! Du har strikket en NORGE-runehatt, klar for 17. mai og alt vi feirer for Norge.',
                 'Congratulations! You have knitted a NORGE rune hat, ready for the 17th of May and everything we celebrate for Norway.')
    copyright_txt = L(
        '&copy; 2026 Little Montessori Explorers. Oppskriften er kun til personlig bruk. Oppskriften '
        'og malene kan ikke kopieres, deles, videreselges eller publiseres. Ferdige produkter kan '
        'selges i liten skala med kreditering til Little Montessori Explorers.',
        '&copy; 2026 Little Montessori Explorers. This pattern is for personal use only. The pattern '
        'and templates may not be copied, shared, resold or published. Finished items may be sold on '
        'a small scale with credit to Little Montessori Explorers.')
    pages.append(ph(
        banner(L('FERDIG OG STELL', 'FINISHED AND CARE'))
        + pink(L('SJEKKLISTE', 'CHECKLIST'))
        + card(ul([
            L('Hatten er helt rød, med stripet brem i rødt, hvitt og blått', 'The hat is all red, with a striped brim in red, white and blue'),
            L('NORGE (eller NORWAY) står i runestil på én linje midt foran', 'NORGE (or NORWAY) is in rune style on one line at the centre front'),
            L('Et lite norsk flagg er brodert på toppen', 'A little Norwegian flag is embroidered on the top'),
            L('Alle tråder er festet på innsiden', 'All ends are woven in on the inside'),
        ]))
        + tealp(L('STELL', 'CARE'))
        + card(p('Vask etter garnets anbefaling, ofte 30&deg;C på skånsomt program i vaskepose, eller for '
                 'hånd. Ikke bruk tørketrommel. Form hatten over en bolle eller et glass i riktig størrelse '
                 'og la den tørke flatt eller på formen.',
                 'Wash following the yarn&rsquo;s recommendation, often 30&deg;C on a gentle cycle in a wash '
                 'bag, or by hand. Do not tumble dry. Shape the hat over a bowl or glass of the right size '
                 'and let it dry flat or on the form.', L))
        + '<div class="congrats">' + congrats + '</div>'
        + '<div class="endflag">' + mini_flag(64) + '</div>'
        + byline('Renate Dahl')
        + '<p class="copyright">' + copyright_txt + '</p>'
    , 10))

    title = L('NORGE-runehatt, LME strikkeoppskrift', 'NORGE rune hat, LME knitting pattern')
    lang_attr = 'en' if LANG == 'en' else 'no'
    return ('<!DOCTYPE html>\n<html lang="' + lang_attr + '"><head><meta charset="utf-8">\n'
            '<title>' + title + '</title>\n<style>' + css + '</style></head>\n'
            '<body>' + ''.join(pages) + '</body></html>')


doc_no = build_doc('no')
doc_en = build_doc('en')
(BASE / 'rune_strikk_no.html').write_text(doc_no, encoding='utf-8')
(BASE / 'rune_strikk_en.html').write_text(doc_en, encoding='utf-8')
print('OK', len(doc_no), 'tegn (no),', len(doc_en), 'tegn (en)')
