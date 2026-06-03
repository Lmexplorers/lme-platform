#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Mia & Teo skoledagbok 4.-7. trinn - HELE boka, trykkeklar A5 staaende, skoleaaret 2026/2027."""
import os
import datetime
from weasyprint import HTML

_BASE = os.path.dirname(os.path.abspath(__file__))
A   = os.environ.get("DIARY_ASSETS", os.path.join(_BASE, "assets"))
OUT = os.environ.get("DIARY_OUT", os.path.join(_BASE, "Mia-og-Teo-skoledagbok-2026-2027-A5-4-7-trinn.pdf"))

START = datetime.date(2026, 8, 17)   # skolestart (mandag)
END   = datetime.date(2027, 6, 18)   # siste skoledag (fredag, Vestfold skolerute)

NO_DAYS=["Mandag","Tirsdag","Onsdag","Torsdag","Fredag","Lørdag","Søndag"]
NO_MONTHS=["","januar","februar","mars","april","mai","juni","juli","august","september","oktober","november","desember"]
def datestr(d): return f"{d.day}. {NO_MONTHS[d.month]} {d.year}"
def season(m):
    if m in (8,9,10): return "høst"
    if m in (11,12,1,2): return "vinter"
    if m in (3,4,5): return "vår"
    return "sommer"

def tre_season(m):
    # treet foelger faktisk norsk natur: hoest varer ut november, vinter fra desember
    if m in (8,9,10,11): return "høst"
    if m in (12,1,2,3): return "vinter"
    if m in (4,5): return "vår"
    return "sommer"

UNDRING=[
 "Hva jobbet du med i dag som du gjerne vil utforske mer?",
 "Var det noe i dag du var uenig i? Hva tenkte du selv?",
 "Hvis du kunne stilt læreren ett spørsmål til, hva ville det vært?",
 "Hva er du nysgjerrig på akkurat nå, helt utenom skolen?",
 "Hvordan tror du noe du brukte i dag ble laget?",
 "Hva ville du forsket på hvis du var forsker for en dag?",
 "Hva er forskjellen på å vite noe og å forstå det, tror du?",
 "Hvilken oppfinnelse skulle du ønske fantes?",
 "Hva gjør at noe er rettferdig eller urettferdig, tror du?",
 "Hvis du kunne reist hvor som helst for å lære noe, hvor?",
 "Hva tror du mennesker vil lure på om hundre år?",
 "Hvorfor tror du vi drømmer om natten?",
 "Hva er noe du har ombestemt deg om i det siste?",
 "Hvordan ville verden vært uten tall?",
 "Hva tror du skjer i hjernen når du lærer noe nytt?",
 "Hvilket dyr tror du er smartest, og hvorfor?",
 "Hva ville du gjort hvis en dag varte i 30 timer?",
 "Hva er det vanskeligste du har klart helt selv?",
 "Hvorfor tror du noen ting blir lettere når du øver?",
 "Hva er en god venn, egentlig?",
 "Hvis tankene dine hadde en farge i dag, hvilken?",
 "Hva tror du finnes lengst ute i verdensrommet?",
 "Hvilken bok eller film fikk deg til å tenke nytt?",
 "Hva ville du endret på skolen hvis du fikk bestemme?",
 "Hvordan vet vi at noe er sant?",
 "Hva er noe voksne ikke helt forstår, tror du?",
 "Hvis du kunne mestret én ting perfekt, hva ville det vært?",
 "Hva gjør deg rolig når mye skjer rundt deg?",
 "Hvorfor tror du noen tall, som null, er så spesielle?",
 "Hva tror du skjer med en idé etter at du har fått den?",
 "Hvilket spørsmål skulle du ønske du visste svaret på?",
 "Hva betyr det å være modig, tror du?",
 "Hvordan ville du forklart farger til noen som aldri har sett?",
 "Hva er det fineste noen har gjort for deg?",
 "Hvilken regel synes du er lurt, og hvilken er rar?",
 "Hva tror du gjør at noen blir gode venner?",
 "Hvis du skulle lært bort én ting til en yngre, hva?",
 "Hva er noe du trodde før, men ikke tror lenger?",
 "Hvorfor tror du tid føles raskere noen ganger?",
 "Hva ville du laget hvis du hadde alt du trengte?",
 "Hva er det viktigste et menneske kan kunne, tror du?",
 "Hvilken liten ting gjorde dagen din bedre i dag?",
 "Hva tror du planter ville sagt hvis de kunne snakke?",
 "Hva synes du er forskjellen på smart og klok?",
 "Hvis du fikk en time helt for deg selv, hva ville du gjort?",
 "Hva tror du du kommer til å huske fra i dag om ti år?",
]
WUNDRING=[
 "Gå en liten tur ute. Hva er det aller første du legger merke til?",
 "Finn noe i naturen som er mykt, og noe som er hardt.",
 "Hjelp til med noe hjemme i dag. Hva valgte du?",
 "Lag noe med hendene dine. Hva ble det?",
 "Sett deg ut et øyeblikk og bare lytt. Hva hører du?",
 "Finn fem ting ute som har samme farge.",
 "Plukk noe fint fra naturen og ta det med hjem.",
 "Hva er det beste med en dag uten skole?",
 "Se solnedgangen hvis du kan. Hvilke farger ser du?",
 "Hvem gjorde du noe hyggelig for i dag?",
]

def mood():
    F=[('#6FAE72',"M7 13 Q11 17 15 13"),('#E0A23A',"M7 14 L15 14"),('#D98C8C',"M7 15 Q11 11 15 15")]
    return "".join(f'<svg class="face" viewBox="0 0 22 22"><circle cx="11" cy="11" r="9.2" fill="none" stroke="{c}" stroke-width="1.6"/><circle cx="8" cy="9" r="1.1" fill="{c}"/><circle cx="14" cy="9" r="1.1" fill="{c}"/><path d="{m}" fill="none" stroke="{c}" stroke-width="1.6" stroke-linecap="round"/></svg>' for c,m in F)
def lines(n): return '<div class="lines">'+''.join('<span></span>' for _ in range(n))+'</div>'
def band(title,sub): return f'<div class="band"><div class="left"><div class="dn">{title}</div><div class="sub">{sub}</div></div><img class="logo" src="file://{A}/lme-logo.png"></div>'
def moodrow(): return f'<div class="moodrow"><span class="mlabel">Humør i dag</span><div class="faces">{mood()}</div></div>'

def moodrow_voksen():
    # gradering 1-5 som paa ungdomsskolen: barnet ringer rundt tallet
    dots="".join(f'<svg class="mdot" viewBox="0 0 18 18"><circle cx="9" cy="9" r="7.2" fill="none" stroke="#C2A86E" stroke-width="1.2"/><text x="9" y="12.3" text-anchor="middle" font-family="Sassoon" font-size="8" fill="#8C8275">{n}</text></svg>' for n in range(1,6))
    return f'<div class="moodrow voksen"><span class="mlabel">Dagsform</span><div class="mgroup"><span class="mhint">1 = tung dag</span><div class="mscale">{dots}</div><span class="mhint">5 = topp</span></div></div>'

def cover():
    return f'''<div class="page cover">
      <img class="clogo" src="file://{A}/lme-logo.png">
      <div class="ctitle"><span class="cm">Mia</span> <span class="camp">&amp;</span> <span class="ct">Teo</span></div>
      <div class="csub">Skoledagbok</div>
      <div class="cgrade">4.–7. trinn</div>
      <div class="cage">(9–13 år)</div>
      <div class="cyear">Skoleåret 2026 / 2027</div>
      <img class="chero" src="file://{A}/mia-og-teo-eldre.png">
      <div class="cowner"><span class="clab">Denne boka tilhører</span><span class="cline"></span></div>
    </div>'''

def om_meg():
    rows=[("Navnet mitt",),("Jeg er ___ år gammel",),("Klassen min",),("Det jeg liker aller best å gjøre",),
          ("Favorittplassen min ute",),("Noe jeg har lyst til å lære i år",),("Dyret jeg liker best",)]
    r="".join(f'<div class="rrow"><div class="flabel">{t[0]}</div><span class="rline"></span></div>' for t in rows)
    return f'''<div class="page">
      {band("Bli kjent med meg","Denne boka tilhører en liten oppdager")}
      <div class="card reflect tight">{r}</div>
      <div class="card draw"><div class="flabel">Tegn deg selv</div></div>
    </div>'''

def mini_month(aar, maaned):
    import calendar as _cal
    _cal.setfirstweekday(0)  # mandag
    weeks=_cal.monthcalendar(aar, maaned)
    head="".join(f'<th>{d}</th>' for d in ["M","T","O","T","F","L","S"])
    body=""
    for w in weeks:
        body+="<tr>"+"".join(f'<td>{d if d else ""}</td>' for d in w)+"</tr>"
    return f'''<div class="mmonth"><div class="mtitle">{NO_MONTH_NAME[maaned].capitalize()} {aar}</div>
      <table class="mcal"><thead><tr>{head}</tr></thead><tbody>{body}</tbody></table></div>'''

def kalender():
    # skoleaaret aug 2026 .. juni 2027
    months=[(2026,m) for m in range(8,13)]+[(2027,m) for m in range(1,7)]
    grid="".join(mini_month(a,m) for a,m in months)
    return f'''<div class="page">
      {band("Skoleåret mitt","En oversikt over hele året")}
      <div class="intro">Her ser du hele skoleåret. Du kan fargelegge bursdagen din, ferier og dager du gleder deg til.</div>
      <div class="calgrid">{grid}</div>
    </div>'''

def klassevenner():
    # aldersblandet gruppe: navneliste med liten portrettrute ved hvert navn
    rows="".join('<div class="navnrad"><span class="portrett"></span><div class="navnfelt"><span class="rline"></span></div></div>' for _ in range(8))
    return f'''<div class="page">
      {band("Vennene i gruppa mi","De jeg går i gruppe med")}
      <div class="intro">Vi er sammen på tvers av alder. Skriv navnene, og tegn eller lim inn et lite bilde av hver.</div>
      <div class="card klasseliste">{rows}</div>
    </div>'''

def gruppefoto():
    return f'''<div class="page">
      {band("Gruppa mi","Oss alle sammen")}
      <div class="intro">Lim inn et bilde av hele gruppa, eller tegn dere sammen.</div>
      <div class="card draw klassefoto"><div class="flabel">Gruppebilde</div></div>
    </div>'''
def notat(tittel="Notater", sub="Plass til alt du vil skrive eller tegne", tegn=False):
    if tegn:
        inner='<div class="card draw"><div class="flabel">Tegn det du vil</div></div>'
    else:
        inner='<div class="card notat">'+lines(13)+'</div>'
    return f'''<div class="page">
      {band(tittel, sub)}
      {inner}
    </div>'''

def school_day(d,uke,uidx):
    # mandager faar en tynn ukesmaal-stripe (ikke et helt kort), og faerre skolelinjer
    er_mandag = d.weekday()==0
    ukesmaal=""
    if er_mandag:
        ukesmaal='<div class="maalstripe"><span class="ml">Denne uka vil jeg</span><span class="rline"></span></div>'
    skolelinjer = 4 if er_mandag else 6
    return f'''<div class="page">
      {band(NO_DAYS[d.weekday()], f"UKE {uke} &nbsp;·&nbsp; {datestr(d)}")}
      {moodrow_voksen()}
      {ukesmaal}
      <div class="card school"><div class="flabel">På skolen i dag</div>{lines(skolelinjer)}</div>
      <div class="card reflect">
        <div class="rrow"><div class="flabel">Noe jeg jobbet med eller utforsket</div><span class="rline"></span></div>
        <div class="rrow"><div class="flabel">Noe jeg vil jobbe med hjemme</div><span class="rline"></span></div>
        <div class="rrow"><div class="flabel">Noe jeg er fornøyd med i dag</div><span class="rline"></span></div>
      </div>
      <div class="undring"><div class="txt"><div class="ut">Dagens undring</div><div class="q">{UNDRING[uidx%len(UNDRING)]}</div></div><img src="file://{A}/mia-og-teo-eldre.png"></div>
    </div>'''

def weekend_day(d,uke,widx):
    return f'''<div class="page">
      {band(NO_DAYS[d.weekday()], f"UKE {uke} &nbsp;·&nbsp; {datestr(d)}")}
      {moodrow()}
      <div class="card"><div class="flabel">Det jeg gjorde i dag</div>{lines(4)}</div>
      <div class="card draw"><div class="flabel">Tegn det beste fra dagen</div></div>
      <div class="undring"><div class="txt"><div class="ut">Dagens undring</div><div class="q">{WUNDRING[widx%len(WUNDRING)]}</div></div><img src="file://{A}/mia-og-teo-eldre.png"></div>
    </div>'''

FERIE_UNDRING=["Hva gleder du deg mest til i ferien?","Hva er det fineste med vinteren, synes du?",
 "Hvem vil du gjøre noe ekstra hyggelig for i ferien?","Hva er den beste feriedagen du har hatt?",
 "Hva er du mest takknemlig for akkurat nå?","Hvis du fikk bestemme en hel feriedag, hva ville dere gjort?",
 "Hva liker du å gjøre når det er kaldt og mørkt ute?","Hva tror du dyrene gjør om vinteren?"]
FERIE_AKTIVITET=[
 ("Noe fint jeg gjorde i dag","Tegn eller skriv om en god stund"),
 ("Noe jeg laget eller bakte","Kanskje noe godt på kjøkkenet?"),
 ("En jeg var sammen med","Hva fant dere på sammen?"),
 ("Noe jeg så ute i vinterkulda","Snø, frost, spor eller stjerner?"),
 ("Noe jeg koste meg med inne","En bok, en film eller et spill?"),
 ("En god gjerning jeg gjorde","Noe snilt for noen andre"),
]
def ferie_day(d,uke,navn,fidx):
    tittel,hint=FERIE_AKTIVITET[fidx%len(FERIE_AKTIVITET)]
    return f'''<div class="page">
      {band(navn, f"Ferie &nbsp;·&nbsp; {datestr(d)}")}
      {moodrow_voksen()}
      <div class="card"><div class="flabel">{tittel}</div><div class="hint">{hint}</div>{lines(4)}</div>
      <div class="card draw"><div class="flabel">Tegn noe fra dagen</div></div>
      <div class="undring"><div class="txt"><div class="ut">Ferieundring</div><div class="q">{FERIE_UNDRING[fidx%len(FERIE_UNDRING)]}</div></div><img src="file://{A}/mia-og-teo-eldre.png"></div>
    </div>'''

def fri_day(d,uke,navn):
    return f'''<div class="page">
      {band(navn, f"I dag er det fri &nbsp;·&nbsp; {datestr(d)}")}
      {moodrow()}
      <div class="card frikort"><div class="flabel">I dag er det fri, ingen skole i dag</div>{lines(3)}</div>
      <div class="card draw"><div class="flabel">Tegn noe fra dagen</div></div>
    </div>'''

# ---------- innimellom-sider ----------
BINGO={
 "høst":["En fjær","En glatt stein","Et blad som har skiftet farge","En kongle","Noe rødt eller oransje","En pinne formet som en bokstav","Et tre du kan klemme rundt","Noe som lukter av høst","En sopp (se, ikke ta)"],
 "vinter":["Et spor i snøen","En istapp","Noe helt hvitt","En bar grein","Pusten din som damp","Noe du hører i stillheten","Et vintergrønt tre","Noe glatt","En fugl som leter etter mat"],
 "vår":["En spire som titter opp","Den første blomsten","Noe nytt og grønt","En knopp på en grein","En meitemark","Noe som synger","En sølepytt","Noe som lukter av vår","Et lite insekt"],
 "sommer":["En blomst med insekt på","Noe varmt fra sola","Et bær","Gress høyere enn hånda di","En sommerfugl","Noe blått","En skygge å sitte i","Noe som svømmer","En sky som ligner på noe"],
}
def p_utebingo(s):
    cells="".join(f'<div class="bcell"><svg class="bring" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10.5" fill="none" stroke="#C2A86E" stroke-width="1.6"/></svg><span class="btxt">{t}</span></div>' for t in BINGO[s])
    return f'''<div class="page">
      {band("Utebingo","Ut på oppdagelse med Mia &amp; Teo")}
      <div class="intro">Gå ut og se hva du finner. Fargelegg sirkelen når du har oppdaget noe. Klarer du hele brettet?</div>
      <div class="bingo">{cells}</div>
      <div class="undring tip"><div class="txt"><div class="ut">Lite tips</div><div class="q">Du trenger ikke finne alt på en gang. Naturen er der hver dag og venter på deg.</div></div><img src="file://{A}/mia-og-teo-eldre.png"></div>
    </div>'''

def p_favoritter(s):
    rows=[("Favorittfargen min",),("Favorittmaten min",),("Det jeg liker best å gjøre ute",),("Favorittdyret mitt",),("En jeg er glad i",),("Noe jeg gleder meg til",)]
    r="".join(f'<div class="rrow"><div class="flabel">{t[0]}</div><span class="rline"></span></div>' for t in rows)
    return f'''<div class="page">
      {band("Mine favoritter","Litt om akkurat deg")}
      <div class="card reflect tight">{r}</div>
      <div class="card draw"><div class="flabel">Tegn favorittstedet ditt</div></div>
    </div>'''

def p_forsker(s):
    boxes="".join(f'<div class="obs"><div class="obl">{t}</div></div>' for t in ["Dag 1","Etter 1 uke","Etter 2 uker"])
    return f'''<div class="page">
      {band("Lille forsker","Så et frø og se hva som skjer")}
      <div class="intro">Legg et frø i litt jord i et glass. Sett det lyst, og vann litt. Tegn hva du ser.</div>
      <div class="obsrow">{boxes}</div>
      <div class="card reflect tight">
        <div class="rrow"><div class="flabel">Hva tror du skjer først?</div><span class="rline"></span></div>
        <div class="rrow"><div class="flabel">Hva overrasket deg?</div><span class="rline"></span></div>
      </div>
      <div class="undring tip"><div class="txt"><div class="ut">Visste du at</div><div class="q">Et lite frø har alt det trenger inni seg for å bli en plante. Det venter bare på jord, vann og lys.</div></div><img src="file://{A}/mia-og-teo-eldre.png"></div>
    </div>'''

def p_tre(sesong, forste=False):
    if forste:
        sub="Følg det samme treet gjennom hele året"
        intro=("Velg ett tre du går forbi ofte, for eksempel i hagen, ved skolen eller på turveien. "
               "Dette blir <b>ditt tre</b> gjennom hele skoleåret. Tegn det slik det ser ut nå. "
               "Hver årstid kommer du tilbake til denne typen side og tegner det samme treet igjen. "
               "Da får du se hvordan det skifter når det blir høst, vinter, vår og sommer.")
    else:
        sub="Tegn det samme treet igjen"
        intro=f"Nå er det {sesong}. Finn treet ditt igjen og tegn hvordan det ser ut akkurat nå. Har noe forandret seg siden sist?"
    return f'''<div class="page">
      {band("Mitt tre", sub)}
      <div class="intro">{intro}</div>
      <div class="card draw treebox"><div class="flabel">Treet mitt om {sesong}en</div></div>
    </div>'''

def p_takk(s):
    return f'''<div class="page">
      {band("Takknemlig for","Tre gode ting akkurat nå")}
      <div class="card reflect">
        <div class="rrow"><div class="flabel">1.</div><span class="rline"></span></div>
        <div class="rrow"><div class="flabel">2.</div><span class="rline"></span></div>
        <div class="rrow"><div class="flabel">3.</div><span class="rline"></span></div>
      </div>
      <div class="card draw"><div class="flabel">Tegn noe som gjør deg glad</div></div>
      <div class="undring"><div class="txt"><div class="ut">Mia &amp; Teo sier</div><div class="q">Små gode ting teller også. En god klem, sola i ansiktet, eller noe godt å spise.</div></div><img src="file://{A}/mia-og-teo-eldre.png"></div>
    </div>'''

FAKTA={
 "høst":["Ekorn gjemmer nøtter til vinteren, men glemmer noen av dem. Slik blir det nye trær.","Bladene blir gule og røde fordi det grønne forsvinner når dagene blir kortere.","Mange fugler flyr sørover om høsten for å finne varmere vær.","Pinnsvinet spiser seg tykt om høsten for å klare vinteren.","Sopp dukker opp om høsten når det er fuktig og kjølig.","Noen trær feller alle bladene sine, andre er grønne hele året."],
 "vinter":["Ingen snøkrystaller er helt like.","Noen dyr sover hele vinteren. Det kalles dvale.","Hvit snø er egentlig laget av iskrystaller som er gjennomsiktige.","Harens pels kan bli hvit om vinteren så den gjemmer seg i snøen.","Fugler buser opp fjærene for å holde på varmen.","Under snøen er det lunere, og små dyr lever der hele vinteren."],
 "vår":["Bier hjelper blomster med å lage frø når de samler nektar.","Mange blomster snur seg etter sola gjennom dagen.","Maur kan bære ting som er mye tyngre enn seg selv.","Frosk legger egg i vann, og av dem blir det rumpetroll.","Knoppene på trærne har ventet hele vinteren på å springe ut.","Fuglene synger mest om morgenen om våren."],
 "sommer":["Sommerfugler smaker med føttene.","En marihøne kan spise mange små skadedyr på en dag.","Trær gir skygge fordi bladene fanger sollyset.","Humla ser ut som den er for tung til å fly, men det går helt fint.","Blomster lukter godt for å lokke til seg insekter.","Om sommeren er dagene lange og nettene helt korte."],
}
GATER=[
 ("Hva faller om høsten, uten å få vondt?","bladene"),
 ("Hvit som mel, men ikke til å spise. Hva er det?","snø"),
 ("Først er jeg liten og gjemt i jorda, så blir jeg grønn. Hva er jeg?","et frø"),
 ("Jeg har vinger, men er ikke en fugl, og jeg elsker blomster. Hva er jeg?","en sommerfugl"),
 ("Jeg lyser om dagen og gjør deg varm. Hva er jeg?","sola"),
 ("Jeg samler nøtter og har busket hale. Hvem er jeg?","et ekorn"),
 ("Jeg faller fra himmelen, men er ikke regn, og jeg er hvit. Hva er jeg?","snø"),
 ("Jeg bor i et tre og kan fly. Om våren synger jeg. Hvem er jeg?","en fugl"),
 ("Jeg er liten og jobber hardt, og kan bære mye mer enn meg selv. Hvem er jeg?","en maur"),
 ("Jeg har mange prikker og spiser bladlus. Hvem er jeg?","en marihøne"),
 ("Jeg er grønn om sommeren og gul om høsten, og henger på et tre. Hva er jeg?","et blad"),
 ("Jeg kommer etter regn og har mange farger på himmelen. Hva er jeg?","en regnbue"),
 ("Jeg surrer rundt blomster og lager honning. Hvem er jeg?","en bie"),
 ("Jeg er kald og smelter i hånda di. Hva er jeg?","snø eller is"),
 ("Jeg har stamme, greiner og blader, og kan bli veldig gammel. Hva er jeg?","et tre"),
 ("Jeg kryper sakte og bærer huset mitt på ryggen. Hvem er jeg?","en snegle"),
 ("Jeg blåser i trærne, men du kan ikke se meg. Hva er jeg?","vinden"),
 ("Jeg faller som små dråper fra skyene. Hva er jeg?","regn"),
 ("Jeg hopper og har lange bakbein, og liker våte steder. Hvem er jeg?","en frosk"),
 ("Jeg kommer om våren, og da blir alt grønt igjen. Hvilken årstid er jeg?","våren"),
]
def p_fakta(s, gidx):
    pool=FAKTA[s]
    start=(gidx*3)%len(pool)
    pick=[pool[(start+i)%len(pool)] for i in range(3)]
    facts="".join(f'<div class="fact">{f}</div>' for f in pick)
    g,sv=GATER[gidx%len(GATER)]
    return f'''<div class="page">
      {band("Visste du at","Litt natur til å undre seg over")}
      <div class="facts">{facts}</div>
      <div class="card gate"><div class="flabel">Dagens gåte</div><div class="gq">{g}</div></div>
      <div class="gatesvar">★ Svar: {sv}</div>
    </div>'''

TASKS={
 "høst":["Samle fem ulike blader","Finn en kongle og tell skjellene","Gå en tur i regnet med støvler","Kjenn på barken på tre ulike trær","Hjelp noen hjemme uten å bli bedt om det"],
 "vinter":["Lag spor i snøen","Heng ut litt mat til fuglene","Finn noe ute som glitrer","Vær ute i ti minutter, godt kledd","Si noe hyggelig til noen i dag"],
 "vår":["Let etter den første blomsten","Legg et frø i jord","Stå stille og lytt etter fuglesang","Hopp i en sølepytt","Plukk opp litt søppel du finner ute"],
 "sommer":["Gå barbeint i gresset","Let etter en marihøne","Bygg noe av pinner","Drikk kaldt vann ute i sola","Del noe godt med en venn"],
}
def p_utfordring(s):
    items="".join(f'<div class="titem"><svg class="tring" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10.5" fill="none" stroke="#C2A86E" stroke-width="1.6"/></svg><span class="ttext">{t}</span></div>' for t in TASKS[s])
    return f'''<div class="page">
      {band("Ukens oppdrag","Velg ett eller flere denne uka")}
      <div class="intro">Fargelegg sirkelen når du har gjort oppdraget. Du bestemmer selv hvor mange.</div>
      <div class="tasklist">{items}</div>
      <div class="card reflect tight"><div class="rrow"><div class="flabel">Det jeg likte best</div><span class="rline"></span></div></div>
    </div>'''

def p_laerte(s):
    rows=["Det jeg jobbet mest med denne uka","Den beste stunden","Noe jeg vil prøve neste uke"]
    r="".join(f'<div class="rrow"><div class="flabel">{t}</div><span class="rline"></span></div>' for t in rows)
    return f'''<div class="page">
      {band("Min uke","Se litt tilbake på uka som var")}
      <div class="card reflect">{r}</div>
      <div class="card draw"><div class="flabel">Tegn et høydepunkt fra uka</div></div>
    </div>'''

TEGN={"høst":"Tegn et dyr du har sett ute denne uka.","vinter":"Tegn det morsomste du har gjort i snøen.","vår":"Tegn et lite kryp eller insekt du har funnet.","sommer":"Tegn favorittstedet ditt ute om sommeren."}
def p_tegn(s):
    return f'''<div class="page">
      {band("Tegneoppgave","Ta deg god tid")}
      <div class="intro">{TEGN[s]}</div>
      <div class="card draw"><div class="flabel">Her tegner du</div></div>
    </div>'''

def p_gjerninger(s):
    tasks=["Hjelp til med noe hjemme","Si noe snilt til noen","Del noe med en venn","Rydd opp etter deg selv","Trøst noen som er lei seg"]
    items="".join(f'<div class="titem"><svg class="tring" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10.5" fill="none" stroke="#C2A86E" stroke-width="1.6"/></svg><span class="ttext">{t}</span></div>' for t in tasks)
    return f'''<div class="page">
      {band("Ukas gode gjerninger","Små ting som gjør en forskjell")}
      <div class="intro">Fargelegg sirkelen når du har gjort en god gjerning. Hvor mange klarer du denne uka?</div>
      <div class="tasklist">{items}</div>
      <div class="card reflect tight"><div class="rrow"><div class="flabel">En jeg gjorde glad</div><span class="rline"></span></div></div>
    </div>'''

def p_ord(s):
    rows=["Ordet","Hva det betyr","Bruk ordet i en setning"]
    r="".join(f'<div class="rrow"><div class="flabel">{t}</div><span class="rline"></span></div>' for t in rows)
    return f'''<div class="page">
      {band("Ukas nye ord","Lær deg ett nytt ord")}
      <div class="card reflect">{r}</div>
      <div class="card draw"><div class="flabel">Tegn ordet</div></div>
    </div>'''

COUNT={
 "høst":["Hvor mange ulike blader fant du?","Hvor mange fugler så du?","Hvor mange kongler?","Hvor mange trær uten blader?"],
 "vinter":["Hvor mange fugler ved fôrbrettet?","Hvor mange istapper?","Hvor mange ulike spor i snøen?","Hvor mange vintergrønne trær?"],
 "vår":["Hvor mange blomster?","Hvor mange insekter?","Hvor mange fuglekvitter hørte du?","Hvor mange grønne spirer?"],
 "sommer":["Hvor mange sommerfugler?","Hvor mange bier?","Hvor mange bær?","Hvor mange skyer?"],
}
TELLE_TIPS=["Å telle ute er ekte matematikk. Hjernen din øver hver gang du teller noe på ordentlig.",
 "Når du teller i naturen, lærer du tall og blir kjent med dyr og planter samtidig.",
 "Prøv å gjette først, og tell etterpå. Var du nære?",
 "Det er lurt å telle i grupper, for eksempel to og to. Da går det fortere."]
def p_telle(s, tip=0):
    rows="".join(f'<div class="countrow"><span class="clab2">{t}</span><svg class="cbox" viewBox="0 0 40 26"><rect x="1.2" y="1.2" width="37.6" height="23.6" rx="5" fill="none" stroke="#C2A86E" stroke-width="1.4"/></svg></div>' for t in COUNT[s])
    return f'''<div class="page">
      {band("Tell i naturen","Lille matematiker ute")}
      <div class="intro">Gå ut og tell. Skriv tallet i ruta. Gjett gjerne først.</div>
      <div class="countlist">{rows}</div>
      <div class="undring tip"><div class="txt"><div class="ut">Visste du at</div><div class="q">{TELLE_TIPS[tip%len(TELLE_TIPS)]}</div></div><img src="file://{A}/mia-og-teo-eldre.png"></div>
    </div>'''

NO_MONTH_NAME=["","januar","februar","mars","april","mai","juni","juli","august","september","oktober","november","desember"]

# ---- flere oppgavetyper for variasjon ----
SANSER=[("Noe jeg så","øye"),("Noe jeg hørte","øre"),("Noe jeg kjente lukten av","nese"),("Noe jeg tok på","hånd"),("Noe jeg smakte","munn")]
def p_sanser(s):
    rows="".join(f'<div class="rrow"><div class="flabel">{t}</div><span class="rline"></span></div>' for t,_ in SANSER)
    return f'''<div class="page">
      {band("Mine fem sanser","Bruk hele deg når du er ute")}
      <div class="intro">Gå en tur og bruk sansene dine. Skriv eller tegn én ting for hver sans.</div>
      <div class="card reflect">{rows}</div>
    </div>'''

def p_rim(s):
    rows="".join(f'<div class="rrow"><div class="flabel">{t}</div><span class="rline"></span></div>' for t in ["Et ord som rimer på sol","Et ord som rimer på katt","Et ord som rimer på hus","Lag ditt eget lille rim"])
    return f'''<div class="page">
      {band("Lek med ord","Rim og tøys med språket")}
      <div class="intro">Ord som slutter likt, rimer. Sol og bol rimer. Klarer du å finne flere?</div>
      <div class="card reflect">{rows}</div>
      <div class="card draw"><div class="flabel">Tegn et av rimordene</div></div>
    </div>'''

def p_stille(s):
    return f'''<div class="page">
      {band("Stille stund","Bare vær, og legg merke til")}
      <div class="intro">Finn et godt sted å sitte, ute eller inne. Vær helt stille i ett minutt. Hva la du merke til?</div>
      <div class="card reflect">
        <div class="rrow"><div class="flabel">Lyder jeg hørte</div><span class="rline"></span></div>
        <div class="rrow"><div class="flabel">Hvordan kroppen min kjentes</div><span class="rline"></span></div>
        <div class="rrow"><div class="flabel">En tanke jeg fikk</div><span class="rline"></span></div>
      </div>
      <div class="undring tip"><div class="txt"><div class="ut">Lite tips</div><div class="q">Det er godt for hjernen å hvile litt. Du trenger ikke gjøre noe, bare være.</div></div><img src="file://{A}/mia-og-teo-eldre.png"></div>
    </div>'''

def p_bygg(s):
    return f'''<div class="page">
      {band("Bygg noe selv","Bruk det du finner")}
      <div class="intro">Bygg eller lag noe med hendene dine. Det kan være av pinner, klosser, stein, papir eller noe helt annet.</div>
      <div class="card reflect tight">
        <div class="rrow"><div class="flabel">Det jeg lagde</div><span class="rline"></span></div>
        <div class="rrow"><div class="flabel">Hva jeg brukte</div><span class="rline"></span></div>
      </div>
      <div class="card draw"><div class="flabel">Tegn det du lagde</div></div>
    </div>'''

def p_venn(s):
    rows="".join(f'<div class="rrow"><div class="flabel">{t}</div><span class="rline"></span></div>' for t in ["En venn jeg er glad i","Noe vi liker å gjøre sammen","Noe snilt jeg kan gjøre for en venn"])
    return f'''<div class="page">
      {band("Vennskap","De som gjør dagen god")}
      <div class="card reflect">{rows}</div>
      <div class="card draw"><div class="flabel">Tegn deg og en venn</div></div>
    </div>'''

FAMSP=["Hva likte du best å gjøre da du var liten?","Hva er ditt favorittsted ute i naturen?","Hvilket dyr liker du best, og hvorfor?","Hva gjorde deg glad i dag?","Hva er det fineste du vet om?"]
def p_familie(s, idx=0):
    q=FAMSP[idx%len(FAMSP)]
    return f'''<div class="page">
      {band("Ukas spørsmål","Spør noen hjemme")}
      <div class="intro">Still dette spørsmålet til noen i familien din, og skriv eller tegn det de svarer.</div>
      <div class="card qbox"><div class="flabel">Spørsmålet</div><div class="bigq">{q}</div></div>
      <div class="card reflect tight"><div class="rrow"><div class="flabel">Svaret jeg fikk</div><span class="rline"></span></div></div>
      <div class="card draw"><div class="flabel">Tegn det de fortalte</div></div>
    </div>'''

LESETIPS=[
 "Prøv en bok om noe du er nysgjerrig på. Faktabøker teller like mye som fortellinger.",
 "Tegneserier er ekte lesing. De er en fin måte å komme i gang på.",
 "Les noen sider høyt for noen hjemme, eller la dem lese for deg.",
 "Liker du ikke boka etter litt? Det er helt greit å bytte til en annen.",
 "Ta med en bok ut. Et tre eller en benk kan bli den fineste leseplassen.",
 "Spør en venn hva de leser. De beste tipsene kommer ofte fra hverandre.",
 "Les samme bok som en venn, så kan dere snakke om den etterpå.",
 "Bla i en bok uten ord også. Du kan finne på fortellingen selv.",
 "Lytt til en lydbok mens du tegner. Det er også å oppleve en historie.",
 "Sett deg et lite lesemål denne måneden, og se hvordan det går.",
]
def p_leselogg(s, idx=0):
    rows="".join(
        '<div class="lrow"><span class="lnum"></span><span class="rline lbok"></span></div>'
        for _ in range(5))
    tip=LESETIPS[idx%len(LESETIPS)]
    return f'''<div class="page">
      {band("Leseloggen min","Bøker jeg har lest denne måneden")}
      <div class="card"><div class="flabel">Bøker jeg har lest</div><div class="hint">Skriv tittelen på bøkene du har lest, eller blitt lest for.</div>{rows}</div>
      <div class="card reflect tight">
        <div class="rrow"><div class="flabel">En bok jeg likte godt, og hvorfor</div><span class="rline"></span></div>
        <div class="rrow"><div class="flabel">En bok jeg vil anbefale til en venn</div><span class="rline"></span></div>
      </div>
      <div class="undring tip"><div class="txt"><div class="ut">Bok-tips</div><div class="q">{tip}</div></div><img src="file://{A}/mia-og-teo-eldre.png"></div>
    </div>'''

# Ukesider uten p_fakta i fast rotasjon (fakta faar egen teller for aa unngaa gjentakelse)
WEEKLY=[p_utebingo,p_utfordring,p_sanser,p_laerte,p_tegn,p_rim,p_favoritter,p_gjerninger,p_stille,p_ord,p_telle,p_bygg,p_forsker,p_venn,p_takk,p_familie]

# ---------- skolerute Vestfold 2026/2027 ----------
def date_kind(d):
    # kun nasjonale ferier (jul + paaske). Host- og vinterferie varierer mellom fylker,
    # saa de holdes som vanlige skoleuker i en landsdekkende bok.
    if datetime.date(2026,12,19) <= d <= datetime.date(2027,1,4):   return ("ferie","Juleferie")
    if datetime.date(2027,3,22)  <= d <= datetime.date(2027,3,29):  return ("ferie","Påskeferie")
    # enkeltstaaende roede dager paa ukedager
    RED={datetime.date(2027,5,6):"Kristi himmelfartsdag",
         datetime.date(2027,5,7):"Fridag",
         datetime.date(2027,5,17):"17. mai"}
    if d in RED: return ("fri", RED[d])
    if d.weekday()<5: return ("skole", None)
    return ("helg", None)

# ---------- bygg sideliste ----------
pages=[cover(), om_meg(), kalender(), klassevenner(), gruppefoto()]
uidx=0; widx=0; feidx=0; wrot=0; gidx=0; fidx=0; lidx=0; lese_month=0; prev_season=None; tre_first=True; forsker_aar=None
d=START
while d<=END:
    uke=d.isocalendar()[1]
    kind,label=date_kind(d)
    if kind=="skole":
        pages.append(school_day(d,uke,uidx)); uidx+=1
    elif kind=="helg":
        pages.append(weekend_day(d,uke,widx)); widx+=1
    elif kind=="ferie":
        pages.append(ferie_day(d,uke,label,feidx)); feidx+=1
    else:  # fri
        pages.append(fri_day(d,uke,label))
    if d.weekday()==6:   # etter soendag: en aktivitetsside
        s=season(d.month)
        ts=tre_season(d.month)
        if ts!=prev_season:
            # nytt aarstidsskifte (norsk natur): treet (forste gang med full intro)
            pages.append(p_tre(ts, forste=tre_first)); prev_season=ts; tre_first=False
        elif d.month!=lese_month:
            # fast manedlig leselogg + bok-tips (som i en vanlig skoledagbok)
            pages.append(p_leselogg(s, lidx)); lidx+=1; lese_month=d.month
        elif wrot%3==2:
            # ca hver tredje uke: visste du at + gaate (alltid ny)
            pages.append(p_fakta(s,gidx)); gidx+=1; wrot+=1
        else:
            # saa-et-froe hoerer hjemme om vaaren (norsk: april/mai). Sikre at den
            # dukker opp da, og aldri utenom.
            forsker_vist_iaar = forsker_aar==d.year
            er_vaar = d.month in (4,5)
            if er_vaar and not forsker_vist_iaar:
                pages.append(p_forsker(s)); forsker_aar=d.year
            else:
                for _ in range(len(WEEKLY)):
                    fn=WEEKLY[wrot%len(WEEKLY)]
                    if fn is p_forsker:   # froe-oppgaven kun via vaar-grenen over
                        wrot+=1; continue
                    break
                if fn is p_telle:
                    pages.append(p_telle(s, wrot))
                elif fn is p_familie:
                    pages.append(p_familie(s, fidx)); fidx+=1
                else:
                    pages.append(fn(s))
                wrot+=1
    d+=datetime.timedelta(days=1)

# ---------- avsluttende sider ----------
pages.append(notat("Notater", "Plass til alt du vil skrive"))
pages.append(notat("Notater", "Plass til alt du vil skrive"))
pages.append(notat("Min egen side", "Tegn akkurat det du har lyst til", tegn=True))
pages.append(notat("Nå er det sommerferie!", "Skriv hva du har lyst til å gjøre i sommer", tegn=False))
pages.append(notat("Tegn et sommerønske", "Noe du gleder deg til i sommer", tegn=True))

# ---------- sidetall (ikke paa forsida) ----------
numbered=[pages[0]]
for i,html in enumerate(pages[1:], start=2):
    idx=html.rfind('</div>')
    html=html[:idx]+f'<div class="pagenum">{i}</div>'+html[idx:]
    numbered.append(html)
pages=numbered

CSS=f"""
@font-face {{ font-family:'Sassoon'; src:url('file://{A}/Sassoon.ttf'); }}
@font-face {{ font-family:'Playpen'; src:url('file://{A}/PlaypenSans-Bold.ttf'); }}
@font-face {{ font-family:'PlaypenX'; src:url('file://{A}/PlaypenSans-ExtraBold.ttf'); }}
@page {{ size:A5 portrait; margin:0; }}
* {{ box-sizing:border-box; margin:0; padding:0; }}
html,body {{ font-family:'Sassoon'; color:#3B332B; }}
.page {{ width:148mm; height:210mm; background:#FCF4DA; padding:10mm 11mm 11mm 13mm; display:flex; flex-direction:column; gap:4mm; break-before:page; position:relative; }}
.pagenum {{ position:absolute; bottom:4.5mm; left:0; right:0; text-align:center; font-family:'Sassoon'; font-size:8.5pt; color:#B7AE9E; }}
.page:first-of-type {{ break-before:auto; }}
.band {{ display:flex; align-items:flex-start; justify-content:space-between; }}
.band .dn {{ font-family:'PlaypenX'; font-size:25pt; color:#3B332B; line-height:0.95; }}
.band .sub {{ font-family:'Sassoon'; font-size:10.5pt; color:#8C8275; margin-top:2.5mm; }}
.band .logo {{ height:18mm; }}
.moodrow {{ display:flex; align-items:center; gap:3mm; background:#E8EDD9; border-radius:4mm; padding:2.6mm 6mm; }}
.moodrow .mlabel {{ font-family:'Playpen'; font-size:11pt; color:#3B332B; }}
.moodrow .faces {{ display:flex; gap:3mm; margin-left:auto; }}
.moodrow.voksen {{ background:#EFEAD8; }}
.moodrow.voksen .mgroup {{ display:flex; align-items:center; margin-left:auto; }}
.moodrow.voksen .mscale {{ display:flex; flex-shrink:0; }}
.moodrow.voksen .mhint {{ font-family:'Sassoon'; font-size:8.5pt; color:#8C8275; white-space:nowrap; flex-shrink:0; }}
.moodrow.voksen .mhint:first-child {{ margin-right:4mm; }}
.moodrow.voksen .mhint:last-child {{ margin-left:4mm; }}
.moodrow.voksen .mdot {{ width:5.5mm; height:5.5mm; margin-right:2.4mm; }}
.moodrow.voksen .mdot:last-child {{ margin-right:0; }}
.moodrow.voksen .mlabel {{ margin-right:1mm; }}
.maalstripe {{ display:flex; align-items:center; gap:3mm; padding:0 2mm; flex-shrink:0; }}
.maalstripe .ml {{ font-family:'Playpen'; font-size:10pt; color:#3B332B; white-space:nowrap; }}
.maalstripe .rline {{ flex:1; border-bottom:1.4px dotted #C2A86E; height:5mm; }}
.hint {{ font-family:'Sassoon'; font-size:9.5pt; color:#8C8275; margin:-1mm 0 2mm; }}
.face {{ width:7.4mm; height:7.4mm; }}
.card {{ background:#fff; border:1.4px solid #ECDBA6; border-radius:5mm; padding:3.4mm 4.5mm 4mm; }}
.flabel {{ font-family:'Playpen'; font-size:11pt; color:#3B332B; margin-bottom:2.6mm; }}
.lines {{ display:flex; flex-direction:column; gap:0; }}
.lines span {{ display:block; border-bottom:1.3px dotted #E2D2A0; height:0; margin-bottom:7mm; }}
.lines span:last-child {{ margin-bottom:0; }}
.school {{ flex:1; }}
.draw {{ flex:1; }}
.reflect {{ display:flex; flex-direction:column; gap:5mm; }}
.reflect.tight {{ gap:4mm; }}
.reflect .rrow .flabel {{ margin-bottom:1.5mm; }}
.reflect .rline {{ display:block; border-bottom:1.3px dotted #E2D2A0; height:7mm; }}
.undring {{ background:#DEE7CF; border:1.4px solid #BCCBA1; border-radius:5mm; padding:3.6mm 4.5mm; display:flex; gap:3mm; align-items:center; }}
.undring .txt {{ flex:1; }}
.undring .ut {{ font-family:'PlaypenX'; font-size:13pt; color:#3B332B; margin-bottom:1.8mm; }}
.undring .q {{ font-family:'Sassoon'; font-size:11pt; color:#3B332B; line-height:1.35; }}
.undring img {{ height:28mm; align-self:flex-end; }}
.undring.tip {{ background:#E8EDD9; border-color:#CCD8B2; flex-shrink:0; }}
.undring.tip .ut {{ color:#3B332B; }} .undring.tip .q {{ color:#3B332B; }}
.undring.tip img {{ height:24mm; }}
.intro {{ font-family:'Sassoon'; font-size:11pt; color:#3B332B; line-height:1.35; }}
.lrow {{ display:flex; align-items:flex-end; gap:3mm; margin-bottom:5mm; }}
.lrow .lnum {{ flex:0 0 6mm; height:6mm; border:1.4px solid #C2A86E; border-radius:3px; }}
.lrow .lbok {{ flex:1; border-bottom:1.3px dotted #E2D2A0; height:6mm; }}
.bingo {{ flex:1; min-height:0; display:grid; grid-template-columns:repeat(3,1fr); grid-template-rows:repeat(3,1fr); gap:3mm; }}
.bcell {{ background:#fff; border:1.4px solid #ECDBA6; border-radius:4mm; padding:2.8mm; display:flex; flex-direction:column; gap:2mm; }}
.bcell .bring {{ width:6mm; height:6mm; display:block; flex-shrink:0; }}
.bcell .btxt {{ font-family:'Sassoon'; font-size:9.5pt; color:#3B332B; line-height:1.22; }}
.obsrow {{ display:flex; gap:3mm; }}
.obs {{ flex:1; background:#fff; border:1.4px solid #ECDBA6; border-radius:4mm; height:42mm; padding:2.6mm; }}
.obs.big {{ height:auto; }}
.obs .obl {{ font-family:'Playpen'; font-size:9.5pt; color:#3B332B; }}
.treegrid {{ flex:1; min-height:0; display:grid; grid-template-columns:1fr 1fr; grid-template-rows:1fr 1fr; gap:3mm; }}
.treegrid .obs {{ height:auto; }}
.facts {{ display:flex; flex-direction:column; gap:3mm; }}
.fact {{ background:#fff; border:1.4px solid #ECDBA6; border-radius:4mm; padding:3mm 4mm; font-family:'Sassoon'; font-size:11pt; color:#3B332B; line-height:1.3; }}
.gate {{ flex-shrink:0; }}
.treebox {{ flex:1; }}
.qbox {{ flex-shrink:0; }}
.qbox .bigq {{ font-family:'Sassoon'; font-size:13pt; color:#3B332B; line-height:1.3; }}
.gate .gq {{ font-family:'Sassoon'; font-size:12pt; color:#3B332B; }}
.gatesvar {{ position:absolute; bottom:13mm; left:13mm; right:11mm; text-align:center; font-family:'Sassoon'; font-size:8.5pt; color:#B7AE9E; }}
.tasklist {{ display:flex; flex-direction:column; gap:3mm; }}
.titem {{ display:flex; align-items:center; gap:3mm; background:#fff; border:1.4px solid #ECDBA6; border-radius:4mm; padding:3mm 4mm; }}
.titem .tring {{ width:6mm; height:6mm; flex-shrink:0; }}
.titem .ttext {{ font-family:'Sassoon'; font-size:11pt; color:#3B332B; }}
.countlist {{ display:flex; flex-direction:column; gap:3mm; }}
.countrow {{ display:flex; align-items:center; gap:3mm; background:#fff; border:1.4px solid #ECDBA6; border-radius:4mm; padding:3mm 4mm; }}
.countrow .clab2 {{ font-family:'Sassoon'; font-size:11pt; color:#3B332B; flex:1; }}
.countrow .cbox {{ width:14mm; height:9mm; flex-shrink:0; }}
.notat {{ flex:1; }}
.klasse {{ flex-shrink:0; justify-content:space-around; gap:1mm; }}
.klassefoto {{ flex:1; }}
.klasseliste {{ flex:1; display:flex; flex-direction:column; justify-content:space-between; }}
.navnrad {{ display:flex; align-items:flex-end; gap:4mm; }}
.navnrad .portrett {{ flex:0 0 16mm; height:16mm; border:1.4px solid #C2A86E; border-radius:3mm; }}
.navnrad .navnfelt {{ flex:1; }}
.navnrad .navnfelt .rline {{ display:block; border-bottom:1.3px dotted #E2D2A0; height:9mm; }}
.calgrid {{ flex:1; display:grid; grid-template-columns:1fr 1fr 1fr; gap:4mm 4mm; align-content:start; }}
.mmonth {{ break-inside:avoid; }}
.mmonth .mtitle {{ font-family:'Playpen'; font-size:9.5pt; color:#3B332B; margin-bottom:1.5mm; }}
.mcal {{ width:100%; border-collapse:collapse; font-family:'Sassoon'; }}
.mcal th {{ font-size:6.5pt; color:#B7AE9E; font-weight:normal; padding:0.3mm 0; }}
.mcal td {{ font-size:7pt; color:#6b6450; text-align:center; padding:0.5mm 0; height:4mm; }}
/* forside */
.cover {{ align-items:center; justify-content:flex-start; text-align:center; padding:14mm 13mm 16mm; gap:0; }}
.cover .ctitle {{ font-family:'PlaypenX'; font-size:40pt; line-height:1; }}
.cover .ctitle .cm {{ color:#F12F7C; }}
.cover .ctitle .camp {{ color:#A1C606; }}
.cover .ctitle .ct {{ color:#0489E8; }}
.cover .csub {{ font-family:'PlaypenX'; font-size:20pt; color:#3B332B; margin-top:3mm; }}
.cover .cgrade {{ font-family:'PlaypenX'; font-size:24pt; color:#3B332B; margin-top:4mm; }}
.cover .cage {{ font-family:'Sassoon'; font-size:12pt; color:#8C8275; margin-top:1mm; }}
.cover .cyear {{ font-family:'Sassoon'; font-size:13pt; color:#8C8275; margin-top:4mm; }}
.cover .chero {{ height:70mm; margin:6mm 0; }}
.cover .cowner {{ font-family:'Playpen'; font-size:12pt; color:#3B332B; display:flex; align-items:flex-end; justify-content:center; gap:3mm; margin-top:auto; }}
.cover .cowner .clab {{ white-space:nowrap; }}
.cover .cowner .cline {{ display:inline-block; width:46mm; border-bottom:1.4px dotted #C2A86E; }}
.cover .clogo {{ height:24mm; margin-bottom:6mm; }}
"""
DOC=f"""<!doctype html><html lang="no"><head><meta charset="utf-8"><style>{CSS}</style></head><body>{''.join(pages)}</body></html>"""
open(os.path.join(_BASE, "book.html"),"w").write(DOC)
print("Sider totalt:", len(pages))
HTML(string=DOC).write_pdf(OUT)
print("PDF:", OUT)
