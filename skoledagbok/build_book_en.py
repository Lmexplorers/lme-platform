#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Mia & Teo School Diary Grades 1-3 - FULL book, print-ready A5 portrait, school year 2026/2027."""
import os
import datetime
from weasyprint import HTML

_BASE = os.path.dirname(os.path.abspath(__file__))
A   = os.environ.get("DIARY_ASSETS", os.path.join(_BASE, "assets"))
OUT = os.environ.get("DIARY_OUT", os.path.join(_BASE, "Mia-and-Teo-school-diary-2026-2027-A5.pdf"))

START = datetime.date(2026, 8, 17)   # school start (Monday)
END   = datetime.date(2027, 6, 18)   # last school day (Friday, Vestfold school calendar)

EN_DAYS=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]
EN_MONTHS=["","January","February","March","April","May","June","July","August","September","October","November","December"]
def datestr(d): return f"{d.day} {EN_MONTHS[d.month]} {d.year}"
def season(m):
    if m in (8,9,10): return "autumn"
    if m in (11,12,1,2): return "winter"
    if m in (3,4,5): return "spring"
    return "summer"

def tre_season(m):
    # the tree follows real Norwegian nature: autumn lasts through November, winter from December
    if m in (8,9,10,11): return "autumn"
    if m in (12,1,2,3): return "winter"
    if m in (4,5): return "spring"
    return "summer"

UNDRING=[
 "How many different leaves can you find on your way home from school?",
 "What sounds do you hear when you stand completely still outside? Count them.",
 "What is the first thing you notice when you go outside today?",
 "Find something that is round, and something that is pointy.",
 "Which colour do you see most of outside today?",
 "How many legs did the last animal you saw have? Draw it.",
 "Feel three different surfaces. Which one did you like best?",
 "What do you think the birds are talking about?",
 "Find a stone you think is nice. Why did you choose that one?",
 "Where does the rain come from, do you think?",
 "Which tree is the biggest where you live?",
 "Smell something outside. What does the smell remind you of?",
 "How many steps is it from your door to the nearest tree?",
 "Look up. What do you see in the sky right now?",
 "What happens to a puddle when the sun comes out?",
 "Find something soft and something hard in nature.",
 "Which little animal would you like to know more about?",
 "Where do birds sleep at night, do you think?",
 "Find something that is smooth, and something that is bumpy.",
 "Count how many trees you pass on your way home.",
 "Which way is the wind blowing today?",
 "Find two leaves that are not exactly alike.",
 "What do you think happens to the leaves in autumn?",
 "How many colours can you find on a single leaf?",
 "What was the nicest thing you saw today?",
 "If you were an ant, where would you go?",
 "Learn the name of a flower you did not know before.",
 "Find a shadow. What is making it?",
 "How warm or cold is it outside today? Guess first, then check.",
 "Which animal do you wish lived in your garden?",
 "What do you think is under a big stone? Take a careful look.",
 "Find something outside that is older than you.",
 "How many birds do you see on your way home?",
 "What makes tracks in the snow or the mud?",
 "Which season do you like best, and why?",
 "What would you ask a tree if it could answer?",
 "How many different shades of green do you see outside?",
 "Listen for water. Do you hear any?",
 "What do you think insects do when it rains?",
 "Find the smallest thing you can see without a magnifying glass.",
 "What is the strangest thing you have seen in nature?",
 "Draw the cloud that looks most like something.",
 "Which berries or fruit grow where you live?",
 "What happens to a seed that lands in the soil?",
 "Find something nature has made, and something people have made.",
 "What makes you most curious right now?",
 "How many different bird sounds can you tell apart?",
 "If you could be outside all day, what would you explore?",
]
WUNDRING=[
 "Go for a little walk outside. What is the very first thing you notice?",
 "Find something in nature that is soft, and something that is hard.",
 "Help with something at home today. What did you choose?",
 "Make something with your hands. What did it become?",
 "Sit outside for a moment and just listen. What do you hear?",
 "Find five things outside that are the same colour.",
 "Pick something nice from nature and bring it home.",
 "What is the best thing about a day without school?",
 "Watch the sunset if you can. What colours do you see?",
 "Who did you do something kind for today?",
]

def mood():
    F=[('#6FAE72',"M7 13 Q11 17 15 13"),('#E0A23A',"M7 14 L15 14"),('#D98C8C',"M7 15 Q11 11 15 15")]
    return "".join(f'<svg class="face" viewBox="0 0 22 22"><circle cx="11" cy="11" r="9.2" fill="none" stroke="{c}" stroke-width="1.6"/><circle cx="8" cy="9" r="1.1" fill="{c}"/><circle cx="14" cy="9" r="1.1" fill="{c}"/><path d="{m}" fill="none" stroke="{c}" stroke-width="1.6" stroke-linecap="round"/></svg>' for c,m in F)
def lines(n): return '<div class="lines">'+''.join('<span></span>' for _ in range(n))+'</div>'
def band(title,sub): return f'<div class="band"><div class="left"><div class="dn">{title}</div><div class="sub">{sub}</div></div><img class="logo" src="file://{A}/lme-logo.png"></div>'
def moodrow(): return f'<div class="moodrow"><span class="mlabel">Mood today</span><div class="faces">{mood()}</div></div>'

def cover():
    return f'''<div class="page cover">
      <img class="clogo" src="file://{A}/lme-logo.png">
      <div class="ctitle"><span class="cm">Mia</span> <span class="camp">&amp;</span> <span class="ct">Teo</span></div>
      <div class="csub">School Diary</div>
      <div class="cgrade">Grades 1-3</div>
      <div class="cage">(ages 5-9)</div>
      <div class="cyear">School year 2026 / 2027</div>
      <img class="chero" src="file://{A}/mia-og-teo.png">
      <div class="cowner"><span class="clab">This diary belongs to</span><span class="cline"></span></div>
    </div>'''

def kolofon():
    return f'''<div class="page kolofon">
      <img class="klogo" src="file://{A}/lme-logo.png">
      <div class="ktext">
        <p>Automated analysis of this work to extract information, in particular about patterns, trends and correlations ("text and data mining"), is prohibited.</p>
        <p class="kgap">© 2026 Renate Dahl</p>
        <p>Editing: Renate Dahl</p>
        <p>Proofreading: Renate Dahl</p>
        <p>Other contributors: Renate Dahl</p>
        <p class="kgap">Publisher: BoD · Books on Demand GmbH, Postboks 354 Sentrum, 0101 Oslo, Norway, bod@bod.no</p>
        <p>Printed by: Libri Plureos GmbH, Friedensallee 273, 22763 Hamburg, Germany</p>
      </div>
    </div>'''

def om_meg():
    rows=[("My name",),("I am ___ years old",),("My class",),("What I like doing best of all",),
          ("My favourite place outside",),("Something I want to learn this year",),("My favourite animal",)]
    r="".join(f'<div class="rrow"><div class="flabel">{t[0]}</div><span class="rline"></span></div>' for t in rows)
    return f'''<div class="page">
      {band("Getting to know me","This diary belongs to a little explorer")}
      <div class="card reflect tight">{r}</div>
      <div class="card draw"><div class="flabel">Draw yourself</div></div>
    </div>'''

def mini_month(aar, maaned):
    import calendar as _cal
    _cal.setfirstweekday(0)  # Monday
    weeks=_cal.monthcalendar(aar, maaned)
    head="".join(f'<th>{d}</th>' for d in ["M","T","W","T","F","S","S"])
    body=""
    for w in weeks:
        body+="<tr>"+"".join(f'<td>{d if d else ""}</td>' for d in w)+"</tr>"
    return f'''<div class="mmonth"><div class="mtitle">{EN_MONTHS[maaned]} {aar}</div>
      <table class="mcal"><thead><tr>{head}</tr></thead><tbody>{body}</tbody></table></div>'''

def kalender():
    # school year aug 2026 .. jun 2027
    months=[(2026,m) for m in range(8,13)]+[(2027,m) for m in range(1,7)]
    grid="".join(mini_month(a,m) for a,m in months)
    return f'''<div class="page">
      {band("My school year","An overview of the whole year")}
      <div class="intro">Here you can see the whole school year. You can colour in your birthday, holidays and days you are looking forward to.</div>
      <div class="calgrid">{grid}</div>
    </div>'''

def klassevenner():
    # mixed-age group: name list with a small portrait box next to each name
    rows="".join('<div class="navnrad"><span class="portrett"></span><div class="navnfelt"><span class="rline"></span></div></div>' for _ in range(8))
    return f'''<div class="page">
      {band("My group friends","The children I am in a group with")}
      <div class="intro">We are together across ages. Write the names, and draw or stick in a small picture of each one.</div>
      <div class="card klasseliste">{rows}</div>
    </div>'''

def gruppefoto():
    return f'''<div class="page">
      {band("My group","All of us together")}
      <div class="intro">Stick in a picture of the whole group, or draw yourselves together.</div>
      <div class="card draw klassefoto"><div class="flabel">Group photo</div></div>
    </div>'''
def notat(tittel="Notes", sub="Room for everything you want to write or draw", tegn=False):
    if tegn:
        inner='<div class="card draw"><div class="flabel">Draw whatever you like</div></div>'
    else:
        inner='<div class="card notat">'+lines(13)+'</div>'
    return f'''<div class="page">
      {band(tittel, sub)}
      {inner}
    </div>'''

def school_day(d,uke,uidx):
    return f'''<div class="page">
      {band(EN_DAYS[d.weekday()], f"WEEK {uke} &nbsp;·&nbsp; {datestr(d)}")}
      {moodrow()}
      <div class="card school"><div class="flabel">At school today</div>{lines(5)}</div>
      <div class="card reflect">
        <div class="rrow"><div class="flabel">Today's discovery</div><span class="rline"></span></div>
        <div class="rrow"><div class="flabel">Today's good deed</div><span class="rline"></span></div>
        <div class="rrow"><div class="flabel">Something I am proud of today</div><span class="rline"></span></div>
      </div>
      <div class="undring"><div class="txt"><div class="ut">Today's wondering</div><div class="q">{UNDRING[uidx%len(UNDRING)]}</div></div><img src="file://{A}/mia-og-teo.png"></div>
    </div>'''

def weekend_day(d,uke,widx):
    return f'''<div class="page">
      {band(EN_DAYS[d.weekday()], f"WEEK {uke} &nbsp;·&nbsp; {datestr(d)}")}
      {moodrow()}
      <div class="card"><div class="flabel">What I did today</div>{lines(4)}</div>
      <div class="card draw"><div class="flabel">Draw the best part of the day</div></div>
      <div class="undring"><div class="txt"><div class="ut">Today's wondering</div><div class="q">{WUNDRING[widx%len(WUNDRING)]}</div></div><img src="file://{A}/mia-og-teo.png"></div>
    </div>'''

FERIE_UNDRING=["What is the best thing about having time off school?","Did you do anything fun outside today?",
 "Who were you with today?","What do you want to do tomorrow?","What did you get up to today, completely away from school?",
 "What are you most grateful for in the holiday?"]
def ferie_day(d,uke,navn,fidx):
    return f'''<div class="page">
      {band(navn, f"Holiday &nbsp;·&nbsp; {datestr(d)}")}
      {moodrow()}
      <div class="card"><div class="flabel">What I got up to today</div>{lines(4)}</div>
      <div class="card draw"><div class="flabel">Draw something from the day</div></div>
      <div class="undring"><div class="txt"><div class="ut">Holiday wondering</div><div class="q">{FERIE_UNDRING[fidx%len(FERIE_UNDRING)]}</div></div><img src="file://{A}/mia-og-teo.png"></div>
    </div>'''

def fri_day(d,uke,navn):
    return f'''<div class="page">
      {band(navn, f"Day off &nbsp;·&nbsp; {datestr(d)}")}
      {moodrow()}
      <div class="card frikort"><div class="flabel">Today is a day off, no school today</div>{lines(3)}</div>
      <div class="card draw"><div class="flabel">Draw something from the day</div></div>
    </div>'''

# ---------- in-between pages ----------
BINGO={
 "autumn":["A feather","A smooth stone","A leaf that has changed colour","A pine cone","Something red or orange","A stick shaped like a letter","A tree you can hug","Something that smells like autumn","A mushroom (look, do not pick)"],
 "winter":["A track in the snow","An icicle","Something completely white","A bare branch","Your breath like steam","Something you hear in the silence","An evergreen tree","Something slippery","A bird looking for food"],
 "spring":["A sprout peeking up","The first flower","Something new and green","A bud on a branch","An earthworm","Something that sings","A puddle","Something that smells like spring","A tiny insect"],
 "summer":["A flower with an insect on it","Something warm from the sun","A berry","Grass taller than your hand","A butterfly","Something blue","A shady spot to sit in","Something that swims","A cloud that looks like something"],
}
def p_utebingo(s):
    cells="".join(f'<div class="bcell"><svg class="bring" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10.5" fill="none" stroke="#C2A86E" stroke-width="1.6"/></svg><span class="btxt">{t}</span></div>' for t in BINGO[s])
    return f'''<div class="page">
      {band("Outdoor bingo","Out exploring with Mia &amp; Teo")}
      <div class="intro">Go outside and see what you can find. Colour in the circle when you have spotted something. Can you complete the whole board?</div>
      <div class="bingo">{cells}</div>
      <div class="undring tip"><div class="txt"><div class="ut">A little tip</div><div class="q">You do not need to find everything at once. Nature is there every day, waiting for you.</div></div><img src="file://{A}/mia-og-teo.png"></div>
    </div>'''

def p_favoritter(s):
    rows=[("My favourite colour",),("My favourite food",),("What I like doing best outside",),("My favourite animal",),("Someone I love",),("Something I am looking forward to",)]
    r="".join(f'<div class="rrow"><div class="flabel">{t[0]}</div><span class="rline"></span></div>' for t in rows)
    return f'''<div class="page">
      {band("My favourites","A little about you")}
      <div class="card reflect tight">{r}</div>
      <div class="card draw"><div class="flabel">Draw your favourite place</div></div>
    </div>'''

def p_forsker(s):
    boxes="".join(f'<div class="obs"><div class="obl">{t}</div></div>' for t in ["Day 1","After 1 week","After 2 weeks"])
    return f'''<div class="page">
      {band("Little scientist","Plant a seed and see what happens")}
      <div class="intro">Put a seed in some soil in a jar. Place it somewhere light, and water it a little. Draw what you see.</div>
      <div class="obsrow">{boxes}</div>
      <div class="card reflect tight">
        <div class="rrow"><div class="flabel">What do you think will happen first?</div><span class="rline"></span></div>
        <div class="rrow"><div class="flabel">What surprised you?</div><span class="rline"></span></div>
      </div>
      <div class="undring tip"><div class="txt"><div class="ut">Did you know</div><div class="q">A tiny seed has everything it needs inside it to become a plant. It is just waiting for soil, water and light.</div></div><img src="file://{A}/mia-og-teo.png"></div>
    </div>'''

def p_tre(sesong, forste=False):
    if forste:
        sub="Follow the same tree through the whole year"
        intro=("Choose one tree you pass often, for example in the garden, by school or on the way there. "
               "This becomes <b>your tree</b> for the whole school year. Draw it as it looks now. "
               "Each season you will come back to a page like this and draw the same tree again. "
               "Then you get to see how it changes through autumn, winter, spring and summer.")
    else:
        sub="Draw the same tree again"
        intro=f"Now it is {sesong}. Find your tree again and draw how it looks right now. Has anything changed since last time?"
    return f'''<div class="page">
      {band("My tree", sub)}
      <div class="intro">{intro}</div>
      <div class="card draw treebox"><div class="flabel">My tree in {sesong}</div></div>
    </div>'''

def p_takk(s):
    return f'''<div class="page">
      {band("Grateful for","Three good things right now")}
      <div class="card reflect">
        <div class="rrow"><div class="flabel">1.</div><span class="rline"></span></div>
        <div class="rrow"><div class="flabel">2.</div><span class="rline"></span></div>
        <div class="rrow"><div class="flabel">3.</div><span class="rline"></span></div>
      </div>
      <div class="card draw"><div class="flabel">Draw something that makes you happy</div></div>
      <div class="undring"><div class="txt"><div class="ut">Mia &amp; Teo say</div><div class="q">Small good things count too. A good hug, sun on your face, or something tasty to eat.</div></div><img src="file://{A}/mia-og-teo.png"></div>
    </div>'''

FAKTA={
 "autumn":["Squirrels hide nuts for winter, but forget some of them. That is how new trees grow.","Leaves turn yellow and red because the green disappears as the days get shorter.","Many birds fly south in autumn to find warmer weather.","Hedgehogs eat a lot in autumn to get ready for winter.","Mushrooms appear in autumn when it is damp and cool.","Some trees drop all their leaves, others stay green all year."],
 "winter":["No two snowflakes are exactly alike.","Some animals sleep through the whole winter. That is called hibernation.","White snow is actually made of ice crystals that are see-through.","A hare's fur can turn white in winter so it can hide in the snow.","Birds fluff up their feathers to stay warm.","Under the snow it is cosier, and small animals live there all winter."],
 "spring":["Bees help flowers make seeds when they collect nectar.","Many flowers turn to follow the sun through the day.","Ants can carry things much heavier than themselves.","Frogs lay eggs in water, and they become tadpoles.","The buds on the trees have waited all winter to open.","Birds sing the most in the mornings in spring."],
 "summer":["Butterflies taste with their feet.","A ladybird can eat many small pests in a day.","Trees give shade because their leaves catch the sunlight.","A bumblebee looks too heavy to fly, but it manages just fine.","Flowers smell nice to attract insects.","In summer the days are long and the nights are very short."],
}
GATER=[
 ("What falls in autumn without getting hurt?","the leaves"),
 ("White as flour, but not for eating. What is it?","snow"),
 ("First I am small and hidden in the soil, then I turn green. What am I?","a seed"),
 ("I have wings but I am not a bird, and I love flowers. What am I?","a butterfly"),
 ("I shine in the daytime and make you warm. What am I?","the sun"),
 ("I collect nuts and have a bushy tail. Who am I?","a squirrel"),
 ("I fall from the sky, but I am not rain, and I am white. What am I?","snow"),
 ("I live in a tree and I can fly. In spring I sing. Who am I?","a bird"),
 ("I am small and work hard, and can carry much more than myself. Who am I?","an ant"),
 ("I have many spots and I eat aphids. Who am I?","a ladybird"),
 ("I am green in summer and yellow in autumn, and I hang on a tree. What am I?","a leaf"),
 ("I come after rain and have many colours in the sky. What am I?","a rainbow"),
 ("I buzz around flowers and make honey. Who am I?","a bee"),
 ("I am cold and I melt in your hand. What am I?","snow or ice"),
 ("I have a trunk, branches and leaves, and I can grow very old. What am I?","a tree"),
 ("I crawl slowly and carry my house on my back. Who am I?","a snail"),
 ("I blow through the trees, but you cannot see me. What am I?","the wind"),
 ("I fall as little drops from the clouds. What am I?","rain"),
 ("I hop and have long back legs, and I like wet places. Who am I?","a frog"),
 ("I come in spring, and then everything turns green again. Which season am I?","spring"),
]
def p_fakta(s, gidx):
    pool=FAKTA[s]
    start=(gidx*3)%len(pool)
    pick=[pool[(start+i)%len(pool)] for i in range(3)]
    facts="".join(f'<div class="fact">{f}</div>' for f in pick)
    g,sv=GATER[gidx%len(GATER)]
    return f'''<div class="page">
      {band("Did you know","A little nature to wonder about")}
      <div class="facts">{facts}</div>
      <div class="card gate"><div class="flabel">Today's riddle</div><div class="gq">{g}</div></div>
      <div class="gatesvar">★ Answer: {sv}</div>
    </div>'''

TASKS={
 "autumn":["Collect five different leaves","Find a pine cone and count the scales","Go for a walk in the rain in your boots","Feel the bark on three different trees","Help someone at home without being asked"],
 "winter":["Make tracks in the snow","Hang out some food for the birds","Find something outside that sparkles","Be outside for ten minutes, well wrapped up","Say something kind to someone today"],
 "spring":["Look for the first flower","Put a seed in some soil","Stand still and listen for birdsong","Jump in a puddle","Pick up a bit of litter you find outside"],
 "summer":["Walk barefoot in the grass","Look for a ladybird","Build something out of sticks","Drink cold water outside in the sun","Share something nice with a friend"],
}
def p_utfordring(s):
    items="".join(f'<div class="titem"><svg class="tring" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10.5" fill="none" stroke="#C2A86E" stroke-width="1.6"/></svg><span class="ttext">{t}</span></div>' for t in TASKS[s])
    return f'''<div class="page">
      {band("This week's mission","Choose one or more this week")}
      <div class="intro">Colour in the circle when you have done the task. You decide how many.</div>
      <div class="tasklist">{items}</div>
      <div class="card reflect tight"><div class="rrow"><div class="flabel">What I liked best</div><span class="rline"></span></div></div>
    </div>'''

def p_laerte(s):
    rows=["What I worked on most this week","The best moment","Something I want to try next week"]
    r="".join(f'<div class="rrow"><div class="flabel">{t}</div><span class="rline"></span></div>' for t in rows)
    return f'''<div class="page">
      {band("My week","Look back a little on the week that was")}
      <div class="card reflect">{r}</div>
      <div class="card draw"><div class="flabel">Draw a highlight from the week</div></div>
    </div>'''

TEGN={"autumn":"Draw an animal you have seen outside this week.","winter":"Draw the most fun thing you have done in the snow.","spring":"Draw a little bug or insect you have found.","summer":"Draw your favourite outdoor spot in summer."}
def p_tegn(s):
    return f'''<div class="page">
      {band("Drawing task","Take your time")}
      <div class="intro">{TEGN[s]}</div>
      <div class="card draw"><div class="flabel">Draw here</div></div>
    </div>'''

def p_gjerninger(s):
    tasks=["Help with something at home","Say something kind to someone","Share something with a friend","Tidy up after yourself","Comfort someone who is sad"]
    items="".join(f'<div class="titem"><svg class="tring" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10.5" fill="none" stroke="#C2A86E" stroke-width="1.6"/></svg><span class="ttext">{t}</span></div>' for t in tasks)
    return f'''<div class="page">
      {band("This week's good deeds","Small things that make a difference")}
      <div class="intro">Colour in the circle when you have done a good deed. How many can you manage this week?</div>
      <div class="tasklist">{items}</div>
      <div class="card reflect tight"><div class="rrow"><div class="flabel">Someone I made happy</div><span class="rline"></span></div></div>
    </div>'''

def p_ord(s):
    rows=["The word","What it means","Use the word in a sentence"]
    r="".join(f'<div class="rrow"><div class="flabel">{t}</div><span class="rline"></span></div>' for t in rows)
    return f'''<div class="page">
      {band("This week's new word","Learn one new word")}
      <div class="card reflect">{r}</div>
      <div class="card draw"><div class="flabel">Draw the word</div></div>
    </div>'''

COUNT={
 "autumn":["How many different leaves did you find?","How many birds did you see?","How many pine cones?","How many trees without leaves?"],
 "winter":["How many birds at the feeder?","How many icicles?","How many different tracks in the snow?","How many evergreen trees?"],
 "spring":["How many flowers?","How many insects?","How many bird chirps did you hear?","How many green sprouts?"],
 "summer":["How many butterflies?","How many bees?","How many berries?","How many clouds?"],
}
TELLE_TIPS=["Counting outside is real maths. Your brain practises every time you count something for real.",
 "When you count in nature, you learn numbers and get to know animals and plants at the same time.",
 "Try guessing first, and count afterwards. Were you close?",
 "It helps to count in groups, for example two by two. Then it goes faster."]
def p_telle(s, tip=0):
    rows="".join(f'<div class="countrow"><span class="clab2">{t}</span><svg class="cbox" viewBox="0 0 40 26"><rect x="1.2" y="1.2" width="37.6" height="23.6" rx="5" fill="none" stroke="#C2A86E" stroke-width="1.4"/></svg></div>' for t in COUNT[s])
    return f'''<div class="page">
      {band("Count in nature","Little mathematician outside")}
      <div class="intro">Go outside and count. Write the number in the box. Feel free to guess first.</div>
      <div class="countlist">{rows}</div>
      <div class="undring tip"><div class="txt"><div class="ut">Did you know</div><div class="q">{TELLE_TIPS[tip%len(TELLE_TIPS)]}</div></div><img src="file://{A}/mia-og-teo.png"></div>
    </div>'''

# ---- more task types for variety ----
SANSER=[("Something I saw","eye"),("Something I heard","ear"),("Something I smelled","nose"),("Something I touched","hand"),("Something I tasted","mouth")]
def p_sanser(s):
    rows="".join(f'<div class="rrow"><div class="flabel">{t}</div><span class="rline"></span></div>' for t,_ in SANSER)
    return f'''<div class="page">
      {band("My five senses","Use all of you when you are outside")}
      <div class="intro">Go for a walk and use your senses. Write or draw one thing for each sense.</div>
      <div class="card reflect">{rows}</div>
    </div>'''

def p_rim(s):
    rows="".join(f'<div class="rrow"><div class="flabel">{t}</div><span class="rline"></span></div>' for t in ["A word that rhymes with sun","A word that rhymes with cat","A word that rhymes with house","Make your own little rhyme"])
    return f'''<div class="page">
      {band("Play with words","Rhyme and have fun with language")}
      <div class="intro">Words that end the same way rhyme. Sun and fun rhyme. Can you find more?</div>
      <div class="card reflect">{rows}</div>
      <div class="card draw"><div class="flabel">Draw one of the rhyming words</div></div>
    </div>'''

def p_stille(s):
    return f'''<div class="page">
      {band("Quiet moment","Just be, and notice")}
      <div class="intro">Find a good place to sit, outside or inside. Be completely quiet for one minute. What did you notice?</div>
      <div class="card reflect">
        <div class="rrow"><div class="flabel">Sounds I heard</div><span class="rline"></span></div>
        <div class="rrow"><div class="flabel">How my body felt</div><span class="rline"></span></div>
        <div class="rrow"><div class="flabel">A thought I had</div><span class="rline"></span></div>
      </div>
      <div class="undring tip"><div class="txt"><div class="ut">A little tip</div><div class="q">It is good for the brain to rest a little. You do not need to do anything, just be.</div></div><img src="file://{A}/mia-og-teo.png"></div>
    </div>'''

def p_bygg(s):
    return f'''<div class="page">
      {band("Build something yourself","Use what you find")}
      <div class="intro">Build or make something with your hands. It can be from sticks, blocks, stones, paper, or something else entirely.</div>
      <div class="card reflect tight">
        <div class="rrow"><div class="flabel">What I made</div><span class="rline"></span></div>
        <div class="rrow"><div class="flabel">What I used</div><span class="rline"></span></div>
      </div>
      <div class="card draw"><div class="flabel">Draw what you made</div></div>
    </div>'''

def p_venn(s):
    rows="".join(f'<div class="rrow"><div class="flabel">{t}</div><span class="rline"></span></div>' for t in ["A friend I love","Something we like doing together","Something kind I can do for a friend"])
    return f'''<div class="page">
      {band("Friendship","The ones who make the day good")}
      <div class="card reflect">{rows}</div>
      <div class="card draw"><div class="flabel">Draw you and a friend</div></div>
    </div>'''

FAMSP=["What did you like doing best when you were little?","What is your favourite place outdoors?","Which animal do you like best, and why?","What made you happy today?","What is the nicest thing you know?"]
def p_familie(s, idx=0):
    q=FAMSP[idx%len(FAMSP)]
    return f'''<div class="page">
      {band("This week's question","Ask someone at home")}
      <div class="intro">Ask this question to someone in your family, and write or draw what they answer.</div>
      <div class="card qbox"><div class="flabel">The question</div><div class="bigq">{q}</div></div>
      <div class="card reflect tight"><div class="rrow"><div class="flabel">The answer I got</div><span class="rline"></span></div></div>
      <div class="card draw"><div class="flabel">Draw what they told you</div></div>
    </div>'''

# Weekly activity pages excluding p_fakta from the fixed rotation (fakta gets its own counter to avoid repeats)
WEEKLY=[p_utebingo,p_utfordring,p_sanser,p_laerte,p_tegn,p_rim,p_favoritter,p_gjerninger,p_stille,p_ord,p_telle,p_bygg,p_forsker,p_venn,p_takk,p_familie]

# ---------- Vestfold 2026/2027 school calendar ----------
def date_kind(d):
    # national holidays only (Christmas + Easter). Autumn and winter half-term breaks vary
    # between counties, so they stay as ordinary school weeks in a nationwide book.
    if datetime.date(2026,12,19) <= d <= datetime.date(2027,1,4):   return ("ferie","Christmas holiday")
    if datetime.date(2027,3,22)  <= d <= datetime.date(2027,3,29):  return ("ferie","Easter holiday")
    # single red weekdays
    RED={datetime.date(2027,5,6):"Ascension Day",
         datetime.date(2027,5,7):"Day off",
         datetime.date(2027,5,17):"17 May (Constitution Day)"}
    if d in RED: return ("fri", RED[d])
    if d.weekday()<5: return ("skole", None)
    return ("helg", None)

# ---------- build the page list ----------
pages=[cover(), kolofon(), om_meg(), kalender(), klassevenner(), gruppefoto()]
uidx=0; widx=0; feidx=0; wrot=0; gidx=0; fidx=0; prev_season=None; tre_first=True; forsker_aar=None
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
    if d.weekday()==6:   # after Sunday: one activity page
        s=season(d.month)
        ts=tre_season(d.month)
        if ts!=prev_season:
            # new season change (Norwegian nature): the tree (first time with full intro)
            pages.append(p_tre(ts, forste=tre_first)); prev_season=ts; tre_first=False
        elif wrot%3==2:
            # roughly every third week: did-you-know + riddle (always new)
            pages.append(p_fakta(s,gidx)); gidx+=1; wrot+=1
        else:
            # the plant-a-seed page belongs in spring (April/May). Make sure it only
            # appears then, and never outside that window.
            forsker_vist_iaar = forsker_aar==d.year
            er_vaar = d.month in (4,5)
            if er_vaar and not forsker_vist_iaar:
                pages.append(p_forsker(s)); forsker_aar=d.year
            else:
                for _ in range(len(WEEKLY)):
                    fn=WEEKLY[wrot%len(WEEKLY)]
                    if fn is p_forsker:   # seed task only via the spring branch above
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

# ---------- closing pages ----------
pages.append(notat("My own page", "Draw exactly what you feel like", tegn=True))
pages.append(notat("Now it's summer holiday!", "Write what you would like to do this summer", tegn=False))
pages.append(notat("Draw a summer wish", "Something you are looking forward to this summer", tegn=True))

# ---------- page numbers (not on the cover) ----------
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
.navnrad .portrett {{ flex:0 0 16mm; width:16mm; height:16mm; border:1.4px solid #C2A86E; border-radius:3mm; overflow:hidden; }}
.navnrad .navnfelt {{ flex:1; }}
.navnrad .navnfelt .rline {{ display:block; border-bottom:1.3px dotted #E2D2A0; height:9mm; }}
.calgrid {{ flex:1; display:grid; grid-template-columns:1fr 1fr 1fr; gap:4mm 4mm; align-content:start; }}
.mmonth {{ break-inside:avoid; }}
.mmonth .mtitle {{ font-family:'Playpen'; font-size:9.5pt; color:#3B332B; margin-bottom:1.5mm; }}
.mcal {{ width:100%; border-collapse:collapse; font-family:'Sassoon'; }}
.mcal th {{ font-size:6.5pt; color:#B7AE9E; font-weight:normal; padding:0.3mm 0; }}
.mcal td {{ font-size:7pt; color:#6b6450; text-align:center; padding:0.5mm 0; height:4mm; }}
.kolofon {{ align-items:center; }}
.kolofon .klogo {{ height:22mm; margin-top:10mm; }}
.kolofon .ktext {{ margin-top:auto; align-self:stretch; }}
.kolofon .ktext p {{ font-family:'Sassoon'; font-size:8.5pt; color:#6b6450; line-height:1.5; margin-bottom:2mm; }}
.kolofon .ktext p.kgap {{ margin-top:3mm; }}
/* cover */
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
DOC=f"""<!doctype html><html lang="en"><head><meta charset="utf-8"><style>{CSS}</style></head><body>{''.join(pages)}</body></html>"""
open(os.path.join(_BASE, "book_en.html"),"w").write(DOC)
print("Total pages:", len(pages))
HTML(string=DOC).write_pdf(OUT)
print("PDF:", OUT)
