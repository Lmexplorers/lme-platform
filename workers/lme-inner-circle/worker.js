// LME Inner Circle + Auth + Media + Betaling + Affiliate — Worker API v2.0
// ========================================================================
// EKTE innlogging: e-post + passord (PBKDF2-hashing), sesjoner.
// NYTT i v2.0: medlemskapssalg med Stripe (7 dagers prøveperiode),
// affiliate-program med provisjon, velkomst-epost via MailerLite og
// admin-dashbord for VIP.
//
// BINDINGS:
//   D1: "DB"    -> lme-inner-circle (users, sessions, hubs, posts, comments,
//                  likes, payments, email_queue, affiliates, affiliate_sales)
//   R2: "FILES" -> lme-platform-html (brukernes mediefiler)
//
// SECRETS (wrangler secret put ...):
//   STRIPE_SECRET_KEY      sk_live_...
//   STRIPE_WEBHOOK_SECRET  whsec_...
//   MAILERLITE_API_KEY     API-nokkel fra MailerLite
// VARS (wrangler.toml):
//   AFFILIATE_COMMISSION_PERCENT = "30"
//   AFFILIATE_COOKIE_DAYS        = "30"

const cors = {
  'Access-Control-Allow-Origin':'*',
  'Access-Control-Allow-Methods':'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':'Content-Type, Authorization',
};
const json = (d,s=200)=>new Response(JSON.stringify(d),{status:s,headers:{...cors,'Content-Type':'application/json'}});
const html = (h,ekstra={})=>new Response(h,{status:200,headers:{...cors,'Content-Type':'text/html; charset=utf-8',...ekstra}});

// ---- Prisplaner (beløp i øre; endre prisene her) ----
const PLANS = {
  regular: { tier:'regular', navn:'Basis', belop:14900 },
  pro:     { tier:'pro',     navn:'Pro',   belop:29900 },
  vip:     { tier:'vip',     navn:'VIP',   belop:59900 },
};
const PROVETID_DAGER = 7;

const MEDIESIDE = `<!DOCTYPE html>
<html lang="no">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<meta name="theme-color" content="#F8D7DA">
<title>Mine medier — LME Plattform</title>
<style>
  @font-face{font-family:'Sassoon';src:url('/fonts/SassoonMontessori.woff2') format('woff2'),url('/fonts/SassoonMontessori.ttf') format('truetype');font-display:swap;}
  :root{
    --rosa:#E0608A; --rosa-lys:#F8D7DA; --rosa-bg:#FFF7F3;
    --teal:#6FB5B8; --teal-dyp:#5FB3B3; --gul:#F7E08A;
    --blekk:#3A3A3A; --grå:#8A8A8A; --kant:#F0DCDE;
  }
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'Sassoon',system-ui,sans-serif;color:var(--blekk);
    background:linear-gradient(165deg,#FDF5F1 0%,#F8D7DA 100%);min-height:100vh;}
  h1,h2,h3{font-family:'Sassoon',system-ui,sans-serif;}

  .topp{padding:28px 24px 20px;max-width:1100px;margin:0 auto;}
  .topp h1{font-size:30px;color:var(--rosa);display:flex;align-items:center;gap:10px;}
  .topp p{color:var(--teal-dyp);font-size:15px;margin-top:4px;}

  .innlogg{max-width:420px;margin:40px auto;background:#fff;border-radius:24px;
    padding:32px;box-shadow:0 10px 40px rgba(228,160,168,.22);}
  .innlogg h2{color:var(--rosa);font-size:22px;margin-bottom:6px;}
  .innlogg p{color:var(--grå);font-size:14px;margin-bottom:20px;}
  .innlogg input{width:100%;padding:13px 15px;border:2px solid var(--rosa-lys);
    border-radius:13px;font-size:15px;font-family:inherit;margin-bottom:12px;}
  .innlogg input:focus{outline:none;border-color:var(--rosa);}

  .wrap{max-width:1100px;margin:0 auto;padding:0 24px 60px;}
  .verktoylinje{display:flex;flex-wrap:wrap;gap:12px;align-items:center;
    margin-bottom:18px;}
  .kvote{flex:1;min-width:200px;}
  .kvote .bar{height:8px;background:var(--rosa-lys);border-radius:99px;overflow:hidden;margin-top:5px;}
  .kvote .fyll{height:100%;background:linear-gradient(90deg,var(--teal),var(--rosa));border-radius:99px;transition:width .4s;}
  .kvote small{color:var(--grå);font-size:12px;}

  .knapp{border:none;border-radius:99px;padding:11px 22px;font-family:inherit;
    font-size:14px;font-weight:700;cursor:pointer;transition:.15s;}
  .knapp-gul{background:var(--gul);color:var(--blekk);}
  .knapp-gul:hover{background:#F2D66A;}
  .knapp-hvit{background:#fff;color:var(--rosa);border:2px solid var(--rosa-lys);}
  .knapp-hvit:hover{border-color:var(--rosa);}

  .mapper{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px;}
  .mappe-pille{padding:7px 16px;border-radius:99px;background:#fff;border:2px solid var(--kant);
    cursor:pointer;font-size:13px;font-weight:600;color:var(--grå);transition:.15s;}
  .mappe-pille.aktiv{background:var(--rosa);color:#fff;border-color:var(--rosa);}
  .mappe-pille:hover{border-color:var(--rosa);}

  .dropp{border:3px dashed var(--rosa);border-radius:22px;padding:44px 20px;
    text-align:center;cursor:pointer;transition:.2s;background:var(--rosa-bg);margin-bottom:24px;}
  .dropp.over{background:#FDEEF0;transform:scale(1.01);}
  .dropp .ikon{font-size:34px;margin-bottom:8px;}
  .dropp strong{color:var(--rosa);font-size:17px;display:block;}
  .dropp span{color:var(--grå);font-size:13px;}

  .rutenett{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:16px;}
  .fil{background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 18px rgba(228,160,168,.15);
    transition:.18s;position:relative;}
  .fil:hover{transform:translateY(-3px);box-shadow:0 8px 26px rgba(228,160,168,.28);}
  .fil .bilde{height:120px;background:var(--rosa-bg);display:flex;align-items:center;justify-content:center;overflow:hidden;}
  .fil .bilde img{width:100%;height:100%;object-fit:cover;}
  .fil .bilde .emoji{font-size:40px;}
  .fil .info{padding:10px 12px;}
  .fil .navn{font-size:13px;font-weight:600;word-break:break-word;line-height:1.3;max-height:34px;overflow:hidden;}
  .fil .meta{font-size:11px;color:var(--grå);margin-top:3px;}
  .fil .slett{position:absolute;top:8px;right:8px;background:rgba(255,255,255,.9);
    border:none;border-radius:50%;width:28px;height:28px;cursor:pointer;font-size:14px;
    opacity:0;transition:.15s;}
  .fil:hover .slett{opacity:1;}
  .fil .kopier{position:absolute;top:8px;left:8px;background:rgba(255,255,255,.9);
    border:none;border-radius:99px;padding:4px 9px;cursor:pointer;font-size:11px;font-weight:600;
    color:var(--teal-dyp);opacity:0;transition:.15s;}
  .fil:hover .kopier{opacity:1;}

  .tom{text-align:center;padding:50px 20px;color:var(--grå);}
  .tom .ikon{font-size:44px;margin-bottom:10px;opacity:.6;}
  .spinner{width:18px;height:18px;border:2px solid var(--rosa-lys);border-top-color:var(--rosa);
    border-radius:50%;animation:snurr .7s linear infinite;display:inline-block;vertical-align:middle;}
  @keyframes snurr{to{transform:rotate(360deg);}}
  .skjult{display:none!important;}
  .toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:var(--blekk);
    color:#fff;padding:12px 22px;border-radius:99px;font-size:14px;opacity:0;transition:.3s;pointer-events:none;z-index:99;}
  .toast.vis{opacity:1;}
</style>
</head>
<body>

<!-- INNLOGGING -->
<div id="innloggSkjerm" class="innlogg">
  <h2 id="authTittel">Logg inn 🌸</h2>
  <p id="authUnder">Velkommen tilbake! Logg inn for å se mediebiblioteket ditt.</p>
  <input type="text" id="navnInput" placeholder="Navnet ditt" class="skjult">
  <input type="email" id="epostInput" placeholder="E-post" autocomplete="email">
  <input type="password" id="passordInput" placeholder="Passord" autocomplete="current-password">
  <button class="knapp knapp-gul" style="width:100%" id="authKnapp" onclick="sendAuth()">Logg inn</button>
  <p style="text-align:center;margin-top:14px;font-size:13px;color:#8A8A8A;">
    <span id="byttTekst">Ny her?</span>
    <a href="#" onclick="byttModus();return false;" id="byttLenke" style="color:#E0608A;font-weight:600;text-decoration:none;">Registrer deg</a>
  </p>
  <p id="authFeil" style="color:#D8556E;font-size:13px;text-align:center;margin-top:10px;"></p>
</div>

<!-- BIBLIOTEK -->
<div id="bibliotek" class="skjult">
  <div class="topp">
    <h1>📁 Mine medier</h1>
    <p id="hilsen">Bildene, PDF-ene og filene dine – lagret trygt i plattformen.</p>
  </div>
  <div class="wrap">
    <div class="verktoylinje">
      <div class="kvote">
        <small id="kvoteTekst">Laster …</small>
        <div class="bar"><div class="fyll" id="kvoteFyll" style="width:0%"></div></div>
      </div>
      <button class="knapp knapp-hvit" onclick="nyMappe()">+ Ny mappe</button>
    </div>

    <div class="mapper" id="mapper"></div>

    <div class="dropp" id="dropp">
      <div class="ikon">🌷</div>
      <strong>Klikk eller dra filer hit</strong>
      <span>Bilder, PDF, lyd, video – opptil 50 MB per fil</span>
    </div>
    <input type="file" id="filinput" multiple class="skjult">

    <div id="rutenett" class="rutenett"></div>
  </div>
</div>

<div class="toast" id="toast"></div>

<script>
  const API = "/api/media";
  let token = localStorage.getItem("lme-token") || "";
  let aktivMappe = "";
  let modus = "login"; // login | register

  function toast(t){const e=document.getElementById("toast");e.textContent=t;e.classList.add("vis");setTimeout(()=>e.classList.remove("vis"),2200);}
  function fmt(b){if(b<1024)return b+" B";if(b<1048576)return (b/1024).toFixed(0)+" KB";return (b/1048576).toFixed(1)+" MB";}
  function hodere(){return {"Authorization":"Bearer "+token};}

  function byttModus(){
    modus = modus === "login" ? "register" : "login";
    const erReg = modus === "register";
    document.getElementById("authTittel").textContent = erReg ? "Registrer deg 🌸" : "Logg inn 🌸";
    document.getElementById("authUnder").textContent = erReg ? "Opprett en konto for å lagre filene dine." : "Velkommen tilbake! Logg inn for å se mediebiblioteket ditt.";
    document.getElementById("authKnapp").textContent = erReg ? "Opprett konto" : "Logg inn";
    document.getElementById("navnInput").classList.toggle("skjult", !erReg);
    document.getElementById("byttTekst").textContent = erReg ? "Har du allerede konto?" : "Ny her?";
    document.getElementById("byttLenke").textContent = erReg ? "Logg inn" : "Registrer deg";
    document.getElementById("authFeil").textContent = "";
  }

  async function sendAuth(){
    const epost = document.getElementById("epostInput").value.trim();
    const passord = document.getElementById("passordInput").value;
    const navn = document.getElementById("navnInput").value.trim();
    const feil = document.getElementById("authFeil");
    feil.textContent = "";
    if(!epost || !passord){ feil.textContent = "Fyll inn e-post og passord"; return; }
    const url = modus === "register" ? "/auth/register" : "/auth/login";
    const body = modus === "register" ? {email:epost, password:passord, display_name:navn||epost.split("@")[0]} : {email:epost, password:passord};
    const res = await fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
    const d = await res.json();
    if(d.success && d.token){
      token = d.token;
      localStorage.setItem("lme-token", token);
      start(d.user);
    } else {
      feil.textContent = d.error || "Noe gikk galt";
    }
  }

  function start(user){
    document.getElementById("innloggSkjerm").classList.add("skjult");
    document.getElementById("bibliotek").classList.remove("skjult");
    if(user?.display_name) document.getElementById("hilsen").textContent =
      "Hei " + user.display_name + "! Her er filene dine.";
    lastMapper();
    lastFiler();
  }

  async function lastMapper(){
    const res = await fetch(API+"/folders",{headers:hodere()});
    const d = await res.json();
    const wrap = document.getElementById("mapper");
    let html = \`<div class="mappe-pille \${aktivMappe===''?'aktiv':''}" onclick="velgMappe('')">Alle</div>\`;
    (d.mapper||[]).forEach(m=>{
      html += \`<div class="mappe-pille \${aktivMappe===m?'aktiv':''}" onclick="velgMappe('\${m}')">\${m}</div>\`;
    });
    wrap.innerHTML = html;
  }

  function velgMappe(m){aktivMappe=m;lastMapper();lastFiler();}

  async function lastFiler(){
    const rute = document.getElementById("rutenett");
    rute.innerHTML = '<div class="tom"><span class="spinner"></span></div>';
    const q = aktivMappe ? "?mappe="+encodeURIComponent(aktivMappe) : "";
    const res = await fetch(API+"/list"+q,{headers:hodere()});
    const d = await res.json();
    // kvote
    const prosent = d.kvote ? Math.min(100,(d.brukt/d.kvote*100)) : 0;
    document.getElementById("kvoteFyll").style.width = prosent+"%";
    document.getElementById("kvoteTekst").textContent = fmt(d.brukt||0)+" av "+fmt(d.kvote||0)+" brukt";
    // filer
    if(!d.files || !d.files.length){
      rute.innerHTML = '<div class="tom"><div class="ikon">🪹</div>Ingen filer her ennå. Dra inn noen!</div>';
      return;
    }
    rute.innerHTML = "";
    d.files.forEach(f=>{
      const erBilde = f.type && f.type.startsWith("image/");
      const url = API+"/file?path="+encodeURIComponent(f.path)+"&t="+encodeURIComponent(token);
      const visning = erBilde
        ? \`<img src="\${url}" loading="lazy" alt="\${f.navn}">\`
        : \`<span class="emoji">\${f.type&&f.type.includes("pdf")?"📄":f.type&&f.type.startsWith("audio")?"🎵":f.type&&f.type.startsWith("video")?"🎬":"📎"}</span>\`;
      const kort = document.createElement("div");
      kort.className = "fil";
      kort.innerHTML = \`
        <div class="bilde">\${visning}</div>
        <div class="info"><div class="navn">\${f.navn}</div><div class="meta">\${fmt(f.storrelse)}</div></div>
        <button class="kopier" title="Kopier lenke">Kopier</button>
        <button class="slett" title="Slett">🗑</button>\`;
      kort.querySelector(".slett").onclick = ()=>slett(f.path);
      kort.querySelector(".kopier").onclick = ()=>{navigator.clipboard.writeText(location.origin+url);toast("Lenke kopiert");};
      rute.appendChild(kort);
    });
  }

  async function slett(path){
    if(!confirm("Slette denne filen?")) return;
    await fetch(API+"/delete?path="+encodeURIComponent(path),{method:"DELETE",headers:hodere()});
    toast("Slettet");
    lastFiler();
  }

  async function nyMappe(){
    const navn = prompt("Navn på ny mappe:");
    if(!navn) return;
    await fetch(API+"/folder",{method:"POST",headers:{...hodere(),"Content-Type":"application/json"},body:JSON.stringify({navn})});
    toast("Mappe laget");
    lastMapper();
  }

  // Opplasting
  const dropp = document.getElementById("dropp");
  const filinput = document.getElementById("filinput");
  if(dropp){
    dropp.onclick = ()=>filinput.click();
    dropp.ondragover = e=>{e.preventDefault();dropp.classList.add("over");};
    dropp.ondragleave = ()=>dropp.classList.remove("over");
    dropp.ondrop = e=>{e.preventDefault();dropp.classList.remove("over");[...e.dataTransfer.files].forEach(lastOpp);};
    filinput.onchange = ()=>[...filinput.files].forEach(lastOpp);
  }

  async function lastOpp(file){
    toast("Laster opp "+file.name+" …");
    const fd = new FormData();
    fd.append("file", file);
    fd.append("mappe", aktivMappe);
    const res = await fetch(API+"/upload",{method:"POST",headers:hodere(),body:fd});
    const d = await res.json();
    if(d.ok){toast("✓ "+d.navn+" lagret");lastFiler();}
    else{toast("✗ "+(d.error||"Feil"));}
  }

  // Auto-innlogg hvis token finnes
  if(token){
    fetch("/auth/me",{headers:hodere()}).then(r=>r.ok?r.json():null).then(d=>{
      if(d&&d.user) start(d.user);
    });
  }
</script>
</body>
</html>
`;

// ---- Delt sidetopp (stil) for salgs-, takk-, affiliate- og adminsiden ----
const SIDE_STIL = `
  @font-face{font-family:'Sassoon';src:url('https://lmexplorers.com/fonts/SassoonMontessori.woff2') format('woff2'),url('https://lmexplorers.com/fonts/SassoonMontessori.ttf') format('truetype');font-display:swap;}
  :root{
    --rosa:#E0608A; --rosa-lys:#F8D7DA; --rosa-bg:#FFF7F3;
    --teal:#6FB5B8; --teal-dyp:#5FB3B3; --gul:#F7E08A;
    --blekk:#3A3A3A; --graa:#8A8A8A; --kant:#F0DCDE;
  }
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'Sassoon',system-ui,sans-serif;color:var(--blekk);
    background:linear-gradient(165deg,#FDF5F1 0%,#F8D7DA 100%);min-height:100vh;}
  h1,h2,h3{font-family:'Sassoon',system-ui,sans-serif;}
  .wrap{max-width:1050px;margin:0 auto;padding:0 22px 70px;}
  .topp{padding:30px 22px 8px;max-width:1050px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;}
  .topp .merke{color:var(--rosa);font-weight:700;font-size:16px;text-decoration:none;display:flex;align-items:center;gap:8px;}
  .knapp{border:none;border-radius:99px;padding:12px 26px;font-family:inherit;font-size:15px;font-weight:700;cursor:pointer;transition:.15s;text-decoration:none;display:inline-block;}
  .knapp-rosa{background:var(--rosa);color:#fff;box-shadow:0 6px 18px rgba(224,96,138,.35);}
  .knapp-rosa:hover{background:#D14E7A;}
  .knapp-gul{background:var(--gul);color:var(--blekk);}
  .knapp-gul:hover{background:#F2D66A;}
  .knapp-hvit{background:#fff;color:var(--rosa);border:2px solid var(--rosa-lys);}
  .knapp-hvit:hover{border-color:var(--rosa);}
  .kort{background:#fff;border-radius:22px;padding:26px;box-shadow:0 8px 30px rgba(228,160,168,.18);}
  .spinner{width:18px;height:18px;border:2px solid var(--rosa-lys);border-top-color:var(--rosa);border-radius:50%;animation:snurr .7s linear infinite;display:inline-block;vertical-align:middle;}
  @keyframes snurr{to{transform:rotate(360deg);}}
  .skjult{display:none!important;}
`;

const SPRAK_SKRIPT = `
<script>
(function(){
  function apply(lang){
    window.__lmeLang=lang;
    document.querySelectorAll('[data-no][data-en]').forEach(function(el){
      el.textContent = (lang==='en') ? el.getAttribute('data-en') : el.getAttribute('data-no');
    });
    document.documentElement.lang=lang;
    var b=document.getElementById('lang-knapp');
    if(b) b.textContent = (lang==='en') ? '🇳🇴 Norsk' : '🇬🇧 English';
    try{localStorage.setItem('lme_lang',lang);}catch(e){}
  }
  var saved='no';try{saved=localStorage.getItem('lme_lang')||'no';}catch(e){}
  var btn=document.getElementById('lang-knapp');
  if(btn) btn.addEventListener('click',function(){apply(window.__lmeLang==='en'?'no':'en');});
  apply(saved);
})();
</script>
`;

// ===== SALGSSIDE =====
const SALGSSIDE = `<!DOCTYPE html>
<html lang="no">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<meta name="theme-color" content="#F8D7DA">
<title>Bli medlem — LME Inner Circle</title>
<style>
${SIDE_STIL}
  .hero{text-align:center;padding:34px 0 10px;}
  .hero .kick{display:inline-block;background:#fff;border:2px solid var(--rosa-lys);border-radius:99px;padding:7px 18px;font-size:13px;font-weight:700;color:var(--rosa);letter-spacing:.06em;text-transform:uppercase;}
  .hero h1{font-size:36px;color:var(--rosa);margin:16px 0 10px;}
  .hero p{color:var(--teal-dyp);font-size:17px;max-width:620px;margin:0 auto;line-height:1.55;}
  .prove{margin:22px auto 0;max-width:560px;background:#fff;border:2px dashed var(--teal);border-radius:18px;padding:13px 20px;font-size:14.5px;color:var(--teal-dyp);font-weight:600;}
  .planer{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:20px;margin:36px 0 8px;align-items:stretch;}
  .plan{background:#fff;border-radius:24px;padding:28px 24px;box-shadow:0 8px 30px rgba(228,160,168,.18);display:flex;flex-direction:column;position:relative;border:3px solid transparent;}
  .plan.populaer{border-color:var(--rosa);transform:scale(1.02);}
  .plan .stjerne{position:absolute;top:-14px;left:50%;transform:translateX(-50%);background:var(--rosa);color:#fff;border-radius:99px;padding:5px 16px;font-size:12px;font-weight:700;white-space:nowrap;}
  .plan h2{font-size:21px;color:var(--rosa);margin-bottom:4px;}
  .plan .pris{font-size:34px;font-weight:700;color:var(--blekk);margin:10px 0 2px;}
  .plan .pris small{font-size:14px;color:var(--graa);font-weight:400;}
  .plan ul{list-style:none;margin:16px 0 22px;flex:1;}
  .plan li{padding:7px 0;font-size:14.5px;border-bottom:1px solid var(--rosa-bg);display:flex;gap:8px;align-items:flex-start;}
  .plan li:last-child{border-bottom:none;}
  .plan li::before{content:'🌸';font-size:13px;}
  .aff-banner{margin:34px 0;background:linear-gradient(120deg,#6FB5B8 0%,#5FB3B3 100%);border-radius:24px;padding:28px;color:#fff;display:flex;justify-content:space-between;align-items:center;gap:18px;flex-wrap:wrap;box-shadow:0 8px 30px rgba(111,181,184,.35);}
  .aff-banner h3{font-size:20px;margin-bottom:5px;}
  .aff-banner p{font-size:14.5px;opacity:.95;max-width:520px;line-height:1.5;}
  .faq{margin-top:40px;}
  .faq h2{font-size:24px;color:var(--rosa);text-align:center;margin-bottom:18px;}
  .faq details{background:#fff;border-radius:16px;margin-bottom:10px;box-shadow:0 4px 16px rgba(228,160,168,.14);overflow:hidden;}
  .faq summary{padding:16px 20px;font-weight:700;font-size:15px;cursor:pointer;list-style:none;display:flex;justify-content:space-between;align-items:center;}
  .faq summary::after{content:'+';color:var(--rosa);font-size:20px;}
  .faq details[open] summary::after{content:'–';}
  .faq .svar{padding:0 20px 16px;font-size:14.5px;color:var(--graa);line-height:1.6;}
  /* Checkout-modal */
  .modal-bak{position:fixed;inset:0;background:rgba(58,58,58,.45);display:flex;align-items:center;justify-content:center;z-index:50;padding:18px;}
  .modal{background:#fff;border-radius:24px;padding:30px;max-width:430px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,.25);}
  .modal h3{color:var(--rosa);font-size:20px;margin-bottom:6px;}
  .modal p{color:var(--graa);font-size:14px;margin-bottom:16px;line-height:1.5;}
  .modal input{width:100%;padding:13px 15px;border:2px solid var(--rosa-lys);border-radius:13px;font-size:15px;font-family:inherit;margin-bottom:14px;}
  .modal input:focus{outline:none;border-color:var(--rosa);}
  .modal .feil{color:#D8556E;font-size:13px;min-height:18px;margin-top:8px;}
  @media(max-width:640px){.hero h1{font-size:28px;}.plan.populaer{transform:none;}}
</style>
</head>
<body>
<div class="topp">
  <a class="merke" href="https://lmexplorers.com">🌸 Little Montessori Explorers</a>
  <div style="display:flex;gap:10px;align-items:center;">
    <button class="knapp knapp-hvit" id="lang-knapp" type="button">🇬🇧 English</button>
    <a class="knapp knapp-hvit" href="/affiliate" data-no="Bli partner" data-en="Become a partner">Bli partner</a>
  </div>
</div>
<div class="wrap">
  <div class="hero">
    <span class="kick" data-no="LME Inner Circle" data-en="LME Inner Circle">LME Inner Circle</span>
    <h1 data-no="Bli med i Inner Circle 💛" data-en="Join the Inner Circle 💛">Bli med i Inner Circle 💛</h1>
    <p data-no="Fellesskapet for deg som vil lære, skape og vokse med Montessori og LME. Grupper, live-samlinger, maler og støtte, alt på ett sted." data-en="The community for you who want to learn, create and grow with Montessori and LME. Groups, live sessions, templates and support, all in one place.">Fellesskapet for deg som vil lære, skape og vokse med Montessori og LME. Grupper, live-samlinger, maler og støtte, alt på ett sted.</p>
    <div class="prove" data-no="🎁 Prøv gratis i 7 dager. Du kan avslutte når som helst i prøveperioden, helt uten kostnad." data-en="🎁 Try free for 7 days. Cancel anytime during the trial, completely free.">🎁 Prøv gratis i 7 dager. Du kan avslutte når som helst i prøveperioden, helt uten kostnad.</div>
  </div>

  <div class="planer">
    <div class="plan">
      <h2>Basis</h2>
      <div class="pris">149 kr<small data-no="/mnd" data-en="/mo">/mnd</small></div>
      <ul>
        <li data-no="Tilgang til fellesskapet og gruppene" data-en="Access to the community and groups">Tilgang til fellesskapet og gruppene</li>
        <li data-no="Mediebibliotek med 1 GB lagring" data-en="Media library with 1 GB storage">Mediebibliotek med 1 GB lagring</li>
        <li data-no="Nyheter og arrangementer" data-en="News and events">Nyheter og arrangementer</li>
        <li data-no="7 dager gratis prøvetid" data-en="7 day free trial">7 dager gratis prøvetid</li>
      </ul>
      <button class="knapp knapp-hvit" onclick="velgPlan('regular')" data-no="Velg Basis" data-en="Choose Basis">Velg Basis</button>
    </div>
    <div class="plan populaer">
      <span class="stjerne" data-no="Mest populær" data-en="Most popular">Mest populær</span>
      <h2>Pro</h2>
      <div class="pris">299 kr<small data-no="/mnd" data-en="/mo">/mnd</small></div>
      <ul>
        <li data-no="Alt i Basis" data-en="Everything in Basis">Alt i Basis</li>
        <li data-no="Pro-grupper med kurs og maler" data-en="Pro groups with courses and templates">Pro-grupper med kurs og maler</li>
        <li data-no="Mediebibliotek med 5 GB lagring" data-en="Media library with 5 GB storage">Mediebibliotek med 5 GB lagring</li>
        <li data-no="Live-samlinger og opptak" data-en="Live sessions and replays">Live-samlinger og opptak</li>
        <li data-no="7 dager gratis prøvetid" data-en="7 day free trial">7 dager gratis prøvetid</li>
      </ul>
      <button class="knapp knapp-rosa" onclick="velgPlan('pro')" data-no="Velg Pro" data-en="Choose Pro">Velg Pro</button>
    </div>
    <div class="plan">
      <h2>VIP</h2>
      <div class="pris">599 kr<small data-no="/mnd" data-en="/mo">/mnd</small></div>
      <ul>
        <li data-no="Alt i Pro" data-en="Everything in Pro">Alt i Pro</li>
        <li data-no="VIP-gruppe med tett oppfølging" data-en="VIP group with close follow-up">VIP-gruppe med tett oppfølging</li>
        <li data-no="Mediebibliotek med 20 GB lagring" data-en="Media library with 20 GB storage">Mediebibliotek med 20 GB lagring</li>
        <li data-no="Prioritert hjelp fra Renate" data-en="Priority help from Renate">Prioritert hjelp fra Renate</li>
        <li data-no="7 dager gratis prøvetid" data-en="7 day free trial">7 dager gratis prøvetid</li>
      </ul>
      <button class="knapp knapp-gul" onclick="velgPlan('vip')" data-no="Velg VIP" data-en="Choose VIP">Velg VIP</button>
    </div>
  </div>

  <div class="aff-banner">
    <div>
      <h3 data-no="💸 Tips andre og tjen 30 %" data-en="💸 Refer others and earn 30%">💸 Tips andre og tjen 30 %</h3>
      <p data-no="Som partner får du din egen lenke og 30 % provisjon på hvert medlemskap du henviser. Gratis å bli med." data-en="As a partner you get your own link and 30% commission on every membership you refer. Free to join.">Som partner får du din egen lenke og 30 % provisjon på hvert medlemskap du henviser. Gratis å bli med.</p>
    </div>
    <a class="knapp knapp-gul" href="/affiliate" data-no="Bli partner" data-en="Become a partner">Bli partner</a>
  </div>

  <div class="faq">
    <h2 data-no="Ofte stilte spørsmål" data-en="Frequently asked questions">Ofte stilte spørsmål</h2>
    <details>
      <summary data-no="Hva er LME Inner Circle?" data-en="What is LME Inner Circle?">Hva er LME Inner Circle?</summary>
      <div class="svar" data-no="Inner Circle er medlemsfellesskapet i LME. Her får du grupper for hver aldersgruppe, live-samlinger, maler, ressurser og støtte fra Renate og andre medlemmer." data-en="Inner Circle is the membership community in LME. You get groups for each age range, live sessions, templates, resources and support from Renate and other members.">Inner Circle er medlemsfellesskapet i LME. Her får du grupper for hver aldersgruppe, live-samlinger, maler, ressurser og støtte fra Renate og andre medlemmer.</div>
    </details>
    <details>
      <summary data-no="Hvordan fungerer prøveperioden?" data-en="How does the trial work?">Hvordan fungerer prøveperioden?</summary>
      <div class="svar" data-no="Du får full tilgang i 7 dager uten å betale noe. Avslutter du før prøvetiden er over, blir du ikke belastet. Ellers starter medlemskapet automatisk." data-en="You get full access for 7 days without paying anything. If you cancel before the trial ends, you will not be charged. Otherwise the membership starts automatically.">Du får full tilgang i 7 dager uten å betale noe. Avslutter du før prøvetiden er over, blir du ikke belastet. Ellers starter medlemskapet automatisk.</div>
    </details>
    <details>
      <summary data-no="Kan jeg si opp når som helst?" data-en="Can I cancel anytime?">Kan jeg si opp når som helst?</summary>
      <div class="svar" data-no="Ja. Medlemskapet fornyes måned for måned, og du kan avslutte når du vil. Da beholder du tilgangen ut perioden du har betalt for." data-en="Yes. The membership renews month by month and you can cancel whenever you want. You keep access for the period you have paid for.">Ja. Medlemskapet fornyes måned for måned, og du kan avslutte når du vil. Da beholder du tilgangen ut perioden du har betalt for.</div>
    </details>
    <details>
      <summary data-no="Kan jeg bytte plan senere?" data-en="Can I change plan later?">Kan jeg bytte plan senere?</summary>
      <div class="svar" data-no="Ja, du kan oppgradere eller nedgradere når som helst. Send oss en melding, så hjelper vi deg med byttet." data-en="Yes, you can upgrade or downgrade at any time. Send us a message and we will help you switch.">Ja, du kan oppgradere eller nedgradere når som helst. Send oss en melding, så hjelper vi deg med byttet.</div>
    </details>
    <details>
      <summary data-no="Hvordan fungerer partnerprogrammet?" data-en="How does the partner program work?">Hvordan fungerer partnerprogrammet?</summary>
      <div class="svar" data-no="Du registrerer deg gratis på partnersiden og får en personlig lenke. Når noen melder seg inn via lenken din, får du 30 % provisjon på salget." data-en="You sign up for free on the partner page and get a personal link. When someone joins through your link, you earn 30% commission on the sale.">Du registrerer deg gratis på partnersiden og får en personlig lenke. Når noen melder seg inn via lenken din, får du 30 % provisjon på salget.</div>
    </details>
  </div>
</div>

<!-- CHECKOUT-MODAL -->
<div class="modal-bak skjult" id="modalBak" onclick="if(event.target===this)lukkModal()">
  <div class="modal">
    <h3 id="modalTittel">Start prøveperioden 🌸</h3>
    <p data-no="Skriv inn e-posten din, så sender vi deg videre til trygg betaling hos Stripe. Du betaler ingenting de første 7 dagene." data-en="Enter your email and we will send you to secure checkout with Stripe. You pay nothing for the first 7 days.">Skriv inn e-posten din, så sender vi deg videre til trygg betaling hos Stripe. Du betaler ingenting de første 7 dagene.</p>
    <input type="email" id="ckEpost" placeholder="E-post" autocomplete="email">
    <button class="knapp knapp-rosa" style="width:100%" id="ckKnapp" onclick="startCheckout()" data-no="Fortsett til betaling" data-en="Continue to checkout">Fortsett til betaling</button>
    <div class="feil" id="ckFeil"></div>
    <p style="text-align:center;margin-top:8px;"><a href="#" onclick="lukkModal();return false;" style="color:#8A8A8A;font-size:13px;" data-no="Avbryt" data-en="Cancel">Avbryt</a></p>
  </div>
</div>

<script>
  var valgtPlan = null;
  var PLAN_NAVN = {regular:'Basis', pro:'Pro', vip:'VIP'};
  function velgPlan(p){
    valgtPlan = p;
    var en = (window.__lmeLang==='en');
    document.getElementById('modalTittel').textContent = (en?'Start your trial of ':'Start prøveperioden på ')+PLAN_NAVN[p]+' 🌸';
    document.getElementById('ckFeil').textContent='';
    document.getElementById('modalBak').classList.remove('skjult');
  }
  function lukkModal(){document.getElementById('modalBak').classList.add('skjult');}
  async function startCheckout(){
    var en = (window.__lmeLang==='en');
    var epost = document.getElementById('ckEpost').value.trim();
    var feil = document.getElementById('ckFeil');
    var knapp = document.getElementById('ckKnapp');
    feil.textContent='';
    if(!epost || epost.indexOf('@')<1){ feil.textContent = en?'Enter a valid email':'Skriv inn en gyldig e-post'; return; }
    knapp.disabled = true;
    knapp.innerHTML = '<span class="spinner"></span>';
    try{
      var res = await fetch('/checkout/create',{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({plan:valgtPlan, email:epost, ref:sessionStorage.getItem('lme_ref')||''})});
      var d = await res.json();
      if(d.url){ location.href = d.url; return; }
      feil.textContent = d.error || (en?'Something went wrong':'Noe gikk galt');
    }catch(e){ feil.textContent = en?'Something went wrong':'Noe gikk galt'; }
    knapp.disabled = false;
    knapp.textContent = en?'Continue to checkout':'Fortsett til betaling';
  }
  // Ta vare på affiliate-koden fra lenken (?ref=...)
  (function(){
    var ref = new URLSearchParams(location.search).get('ref');
    if(ref) try{sessionStorage.setItem('lme_ref', ref);}catch(e){}
  })();
</script>
${SPRAK_SKRIPT}
</body>
</html>
`;

// ===== TAKKSIDE =====
const TAKKSIDE = `<!DOCTYPE html>
<html lang="no">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<meta name="theme-color" content="#F8D7DA">
<title>Velkommen — LME Inner Circle</title>
<style>
${SIDE_STIL}
  .takk{max-width:560px;margin:60px auto;text-align:center;}
  .takk .ikon{font-size:56px;margin-bottom:14px;}
  .takk h1{font-size:30px;color:var(--rosa);margin-bottom:12px;}
  .takk p{color:var(--graa);font-size:15.5px;line-height:1.6;margin-bottom:12px;}
  .takk .steg{text-align:left;margin:22px 0;padding:0;list-style:none;}
  .takk .steg li{padding:10px 0;border-bottom:1px solid var(--rosa-bg);font-size:14.5px;display:flex;gap:10px;align-items:flex-start;}
  .takk .steg li:last-child{border-bottom:none;}
</style>
</head>
<body>
<div class="topp">
  <a class="merke" href="https://lmexplorers.com">🌸 Little Montessori Explorers</a>
  <button class="knapp knapp-hvit" id="lang-knapp" type="button">🇬🇧 English</button>
</div>
<div class="wrap">
  <div class="takk kort">
    <div class="ikon">🎉</div>
    <h1 data-no="Velkommen til Inner Circle!" data-en="Welcome to the Inner Circle!">Velkommen til Inner Circle!</h1>
    <p data-no="Betalingen er registrert, og prøveperioden din er i gang. Vi har sendt deg en velkomst-epost med alt du trenger." data-en="Your payment is registered and your trial has started. We have sent you a welcome email with everything you need.">Betalingen er registrert, og prøveperioden din er i gang. Vi har sendt deg en velkomst-epost med alt du trenger.</p>
    <ul class="steg">
      <li>1️⃣ <span data-no="Opprett kontoen din med samme e-post som du betalte med" data-en="Create your account with the same email you paid with">Opprett kontoen din med samme e-post som du betalte med</span></li>
      <li>2️⃣ <span data-no="Logg inn og utforsk gruppene og mediebiblioteket" data-en="Log in and explore the groups and the media library">Logg inn og utforsk gruppene og mediebiblioteket</span></li>
      <li>3️⃣ <span data-no="Si hei i fellesrommet, vi gleder oss til å møte deg 💛" data-en="Say hi in the shared room, we look forward to meeting you 💛">Si hei i fellesrommet, vi gleder oss til å møte deg 💛</span></li>
    </ul>
    <a class="knapp knapp-rosa" href="https://lmexplorers.com/grupper/inner-circle" data-no="Gå til Inner Circle" data-en="Go to Inner Circle">Gå til Inner Circle</a>
  </div>
</div>
${SPRAK_SKRIPT}
</body>
</html>
`;

// ===== AFFILIATE-SIDE =====
const AFFILIATE_SIDE = `<!DOCTYPE html>
<html lang="no">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<meta name="theme-color" content="#F8D7DA">
<title>Partnerprogram — LME Inner Circle</title>
<style>
${SIDE_STIL}
  .hero{text-align:center;padding:36px 0 22px;}
  .hero h1{font-size:32px;color:var(--rosa);margin-bottom:10px;}
  .hero p{color:var(--teal-dyp);font-size:16px;max-width:600px;margin:0 auto;line-height:1.55;}
  .fordeler{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;margin:26px 0;}
  .fordel{background:#fff;border-radius:20px;padding:22px;box-shadow:0 6px 22px rgba(228,160,168,.16);text-align:center;}
  .fordel .ikon{font-size:32px;margin-bottom:8px;}
  .fordel h3{font-size:16px;color:var(--rosa);margin-bottom:6px;}
  .fordel p{font-size:13.5px;color:var(--graa);line-height:1.5;}
  .dash{margin-top:26px;}
  .dash h2{color:var(--rosa);font-size:21px;margin-bottom:12px;}
  .lenkeboks{display:flex;gap:10px;flex-wrap:wrap;align-items:center;background:var(--rosa-bg);border:2px solid var(--rosa-lys);border-radius:16px;padding:14px;margin:12px 0 18px;}
  .lenkeboks code{flex:1;min-width:220px;font-size:13.5px;word-break:break-all;font-family:inherit;color:var(--blekk);}
  .tall{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:14px;margin-bottom:18px;}
  .tallkort{background:#fff;border-radius:18px;padding:18px;text-align:center;box-shadow:0 4px 16px rgba(228,160,168,.14);}
  .tallkort .v{font-size:26px;font-weight:700;color:var(--rosa);}
  .tallkort .l{font-size:12.5px;color:var(--graa);margin-top:4px;}
  table{width:100%;border-collapse:collapse;font-size:13.5px;}
  th{text-align:left;color:var(--graa);font-weight:600;padding:8px 10px;border-bottom:2px solid var(--rosa-lys);}
  td{padding:9px 10px;border-bottom:1px solid var(--rosa-bg);}
  .tab-wrap{overflow-x:auto;}
  .feil{color:#D8556E;font-size:13.5px;min-height:18px;margin-top:8px;}
</style>
</head>
<body>
<div class="topp">
  <a class="merke" href="https://lmexplorers.com">🌸 Little Montessori Explorers</a>
  <div style="display:flex;gap:10px;align-items:center;">
    <button class="knapp knapp-hvit" id="lang-knapp" type="button">🇬🇧 English</button>
    <a class="knapp knapp-hvit" href="/medlemskap" data-no="Se medlemskap" data-en="See memberships">Se medlemskap</a>
  </div>
</div>
<div class="wrap">
  <div class="hero">
    <h1 data-no="Bli LME-partner 💸" data-en="Become an LME partner 💸">Bli LME-partner 💸</h1>
    <p data-no="Anbefal Inner Circle til andre og tjen 30 % provisjon på hvert medlemskap som kommer via lenken din. Gratis å bli med, og du får full oversikt her." data-en="Recommend Inner Circle to others and earn 30% commission on every membership that comes through your link. Free to join, and you get a full overview here.">Anbefal Inner Circle til andre og tjen 30 % provisjon på hvert medlemskap som kommer via lenken din. Gratis å bli med, og du får full oversikt her.</p>
  </div>

  <div class="fordeler">
    <div class="fordel"><div class="ikon">🔗</div><h3 data-no="Din egen lenke" data-en="Your own link">Din egen lenke</h3><p data-no="Du får en personlig lenke du kan dele hvor du vil." data-en="You get a personal link you can share anywhere.">Du får en personlig lenke du kan dele hvor du vil.</p></div>
    <div class="fordel"><div class="ikon">💰</div><h3 data-no="30 % provisjon" data-en="30% commission">30 % provisjon</h3><p data-no="Du tjener 30 % av salget på hvert medlemskap du henviser." data-en="You earn 30% of the sale on every membership you refer.">Du tjener 30 % av salget på hvert medlemskap du henviser.</p></div>
    <div class="fordel"><div class="ikon">📊</div><h3 data-no="Full oversikt" data-en="Full overview">Full oversikt</h3><p data-no="Se klikk, salg og opptjent provisjon på din egen side." data-en="See clicks, sales and earned commission on your own page.">Se klikk, salg og opptjent provisjon på din egen side.</p></div>
  </div>

  <!-- IKKE INNLOGGET -->
  <div class="kort" id="affLogginn">
    <h2 style="color:var(--rosa);font-size:20px;margin-bottom:8px;" data-no="Logg inn for å bli partner" data-en="Log in to become a partner">Logg inn for å bli partner</h2>
    <p style="color:var(--graa);font-size:14.5px;margin-bottom:14px;" data-no="Du trenger en gratis LME-konto. Logg inn eller registrer deg, og kom tilbake hit." data-en="You need a free LME account. Log in or sign up, then come back here.">Du trenger en gratis LME-konto. Logg inn eller registrer deg, og kom tilbake hit.</p>
    <a class="knapp knapp-rosa" href="/" data-no="Logg inn / registrer deg" data-en="Log in / sign up">Logg inn / registrer deg</a>
  </div>

  <!-- INNLOGGET, IKKE PARTNER -->
  <div class="kort skjult" id="affStart">
    <h2 style="color:var(--rosa);font-size:20px;margin-bottom:8px;" data-no="Klar til å starte?" data-en="Ready to start?">Klar til å starte?</h2>
    <p style="color:var(--graa);font-size:14.5px;margin-bottom:14px;" data-no="Ett klikk, så er du i gang. Du får koden og lenken din med en gang." data-en="One click and you are up and running. You get your code and link right away.">Ett klikk, så er du i gang. Du får koden og lenken din med en gang.</p>
    <button class="knapp knapp-rosa" id="affRegKnapp" onclick="bliPartner()" data-no="Bli partner nå" data-en="Become a partner now">Bli partner nå</button>
    <div class="feil" id="affFeil"></div>
  </div>

  <!-- PARTNER-DASHBORD -->
  <div class="dash skjult" id="affDash">
    <h2 data-no="Partnersiden din 🌟" data-en="Your partner page 🌟">Partnersiden din 🌟</h2>
    <div class="lenkeboks">
      <code id="affLenke"></code>
      <button class="knapp knapp-gul" onclick="kopierLenke()" data-no="Kopier lenke" data-en="Copy link">Kopier lenke</button>
    </div>
    <div class="tall">
      <div class="tallkort"><div class="v" id="tallHenvist">0</div><div class="l" data-no="Henviste medlemmer" data-en="Referred members">Henviste medlemmer</div></div>
      <div class="tallkort"><div class="v" id="tallSalg">0 kr</div><div class="l" data-no="Salg via deg" data-en="Sales through you">Salg via deg</div></div>
      <div class="tallkort"><div class="v" id="tallProvisjon">0 kr</div><div class="l" data-no="Opptjent provisjon" data-en="Earned commission">Opptjent provisjon</div></div>
    </div>
    <div class="kort tab-wrap">
      <h3 style="color:var(--rosa);font-size:16px;margin-bottom:10px;" data-no="Siste salg" data-en="Latest sales">Siste salg</h3>
      <table>
        <thead><tr>
          <th data-no="Dato" data-en="Date">Dato</th>
          <th data-no="Plan" data-en="Plan">Plan</th>
          <th data-no="Salg" data-en="Sale">Salg</th>
          <th data-no="Provisjon" data-en="Commission">Provisjon</th>
          <th data-no="Status" data-en="Status">Status</th>
        </tr></thead>
        <tbody id="affSalgListe"><tr><td colspan="5" style="color:#8A8A8A;" data-no="Ingen salg ennå. Del lenken din!" data-en="No sales yet. Share your link!">Ingen salg ennå. Del lenken din!</td></tr></tbody>
      </table>
    </div>
  </div>
</div>

<script>
  var token = localStorage.getItem('lme-token') || '';
  function kr(n){ return (Math.round(n)/100).toLocaleString('nb-NO') + ' kr'; }
  function visDash(d){
    document.getElementById('affLogginn').classList.add('skjult');
    document.getElementById('affStart').classList.add('skjult');
    document.getElementById('affDash').classList.remove('skjult');
    document.getElementById('affLenke').textContent = d.link;
    document.getElementById('tallHenvist').textContent = d.affiliate.total_referrals;
    document.getElementById('tallSalg').textContent = kr(d.affiliate.total_sales);
    document.getElementById('tallProvisjon').textContent = kr(d.affiliate.total_commission);
    if(d.sales && d.sales.length){
      var en = (window.__lmeLang==='en');
      document.getElementById('affSalgListe').innerHTML = d.sales.map(function(s){
        var dato = (s.created_at||'').slice(0,10);
        var status = s.status==='pending' ? (en?'awaiting payout':'venter på utbetaling') : (en?'paid out':'utbetalt');
        return '<tr><td>'+dato+'</td><td>'+(s.tier||'')+'</td><td>'+kr(s.sale_amount)+'</td><td>'+kr(s.commission_amount)+'</td><td>'+status+'</td></tr>';
      }).join('');
    }
  }
  function kopierLenke(){
    navigator.clipboard.writeText(document.getElementById('affLenke').textContent);
    var en = (window.__lmeLang==='en');
    alert(en?'Link copied!':'Lenken er kopiert!');
  }
  async function bliPartner(){
    var feil = document.getElementById('affFeil');
    feil.textContent = '';
    try{
      var res = await fetch('/affiliate/register',{method:'POST',headers:{'Authorization':'Bearer '+token}});
      var d = await res.json();
      if(d.affiliate){ visDash(d); return; }
      feil.textContent = d.error || 'Noe gikk galt';
    }catch(e){ feil.textContent = 'Noe gikk galt'; }
  }
  // Er brukeren innlogget? Er hun allerede partner?
  if(token){
    fetch('/auth/me',{headers:{'Authorization':'Bearer '+token}}).then(function(r){return r.ok?r.json():null;}).then(function(d){
      if(d && d.user){
        document.getElementById('affLogginn').classList.add('skjult');
        document.getElementById('affStart').classList.remove('skjult');
        // Har hun partnerkonto fra før, hopper vi rett til dashbordet
        fetch('/affiliate/register',{method:'POST',headers:{'Authorization':'Bearer '+token,'X-Only-Existing':'1'}})
          .then(function(r){return r.json();}).then(function(d2){ if(d2 && d2.affiliate) visDash(d2); }).catch(function(){});
      }
    }).catch(function(){});
  }
</script>
${SPRAK_SKRIPT}
</body>
</html>
`;

// ===== ADMIN-DASHBORD (kun VIP) =====
const ADMIN_SIDE = `<!DOCTYPE html>
<html lang="no">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<meta name="theme-color" content="#F8D7DA">
<title>Admin — LME Inner Circle</title>
<style>
${SIDE_STIL}
  .tall{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:14px;margin:20px 0;}
  .tallkort{background:#fff;border-radius:18px;padding:18px;text-align:center;box-shadow:0 4px 16px rgba(228,160,168,.14);}
  .tallkort .v{font-size:24px;font-weight:700;color:var(--rosa);}
  .tallkort .l{font-size:12.5px;color:var(--graa);margin-top:4px;}
  h2{color:var(--rosa);font-size:19px;margin:26px 0 10px;}
  table{width:100%;border-collapse:collapse;font-size:13px;}
  th{text-align:left;color:var(--graa);font-weight:600;padding:8px 10px;border-bottom:2px solid var(--rosa-lys);white-space:nowrap;}
  td{padding:8px 10px;border-bottom:1px solid var(--rosa-bg);}
  .tab-wrap{overflow-x:auto;}
  .melding{max-width:520px;margin:60px auto;text-align:center;}
</style>
</head>
<body>
<div class="topp">
  <a class="merke" href="https://lmexplorers.com">🌸 LME Inner Circle · Admin</a>
</div>
<div class="wrap">
  <div class="kort melding" id="adminMelding">
    <p style="color:#8A8A8A;">Laster … Du må være innlogget som VIP for å se denne siden.</p>
  </div>
  <div class="skjult" id="adminInnhold">
    <div class="tall">
      <div class="tallkort"><div class="v" id="aInntekt">–</div><div class="l">Total inntekt</div></div>
      <div class="tallkort"><div class="v" id="aMedlemmer">–</div><div class="l">Betalende medlemmer</div></div>
      <div class="tallkort"><div class="v" id="aPartnere">–</div><div class="l">Partnere</div></div>
      <div class="tallkort"><div class="v" id="aProvisjon">–</div><div class="l">Provisjon å utbetale</div></div>
      <div class="tallkort"><div class="v" id="aEpost">–</div><div class="l">E-poster i kø</div></div>
    </div>
    <h2>Siste betalinger</h2>
    <div class="kort tab-wrap"><table>
      <thead><tr><th>Dato</th><th>E-post</th><th>Plan</th><th>Beløp</th><th>Status</th><th>Partnerkode</th></tr></thead>
      <tbody id="aBetalinger"></tbody>
    </table></div>
    <h2>Partnere</h2>
    <div class="kort tab-wrap"><table>
      <thead><tr><th>Navn</th><th>Kode</th><th>Henviste</th><th>Salg</th><th>Provisjon</th></tr></thead>
      <tbody id="aPartnerListe"></tbody>
    </table></div>
    <h2>Medlemmer per plan</h2>
    <div class="kort tab-wrap"><table>
      <thead><tr><th>Plan</th><th>Antall</th></tr></thead>
      <tbody id="aTierListe"></tbody>
    </table></div>
  </div>
</div>
<script>
  var token = localStorage.getItem('lme-token') || '';
  function kr(n){ return (Math.round(n)/100).toLocaleString('nb-NO') + ' kr'; }
  function esc(s){ var d=document.createElement('div'); d.textContent=s==null?'':String(s); return d.innerHTML; }
  fetch('/admin/data',{headers:{'Authorization':'Bearer '+token}})
    .then(function(r){ if(!r.ok) throw r.status; return r.json(); })
    .then(function(d){
      document.getElementById('adminMelding').classList.add('skjult');
      document.getElementById('adminInnhold').classList.remove('skjult');
      document.getElementById('aInntekt').textContent = kr(d.inntekt);
      document.getElementById('aMedlemmer').textContent = d.betalende;
      document.getElementById('aPartnere').textContent = d.affiliates.length;
      document.getElementById('aProvisjon').textContent = kr(d.provisjon_pending);
      document.getElementById('aEpost').textContent = d.epost_ko;
      document.getElementById('aBetalinger').innerHTML = d.betalinger.map(function(p){
        return '<tr><td>'+esc((p.created_at||'').slice(0,16).replace('T',' '))+'</td><td>'+esc(p.user_email)+'</td><td>'+esc(p.tier)+'</td><td>'+kr(p.amount)+'</td><td>'+esc(p.status)+'</td><td>'+esc(p.affiliate_code||'')+'</td></tr>';
      }).join('') || '<tr><td colspan="6" style="color:#8A8A8A;">Ingen betalinger ennå.</td></tr>';
      document.getElementById('aPartnerListe').innerHTML = d.affiliates.map(function(a){
        return '<tr><td>'+esc(a.display_name)+'</td><td>'+esc(a.code)+'</td><td>'+a.total_referrals+'</td><td>'+kr(a.total_sales)+'</td><td>'+kr(a.total_commission)+'</td></tr>';
      }).join('') || '<tr><td colspan="5" style="color:#8A8A8A;">Ingen partnere ennå.</td></tr>';
      document.getElementById('aTierListe').innerHTML = d.medlemmer.map(function(m){
        return '<tr><td>'+esc(m.tier)+'</td><td>'+m.c+'</td></tr>';
      }).join('');
    })
    .catch(function(status){
      document.getElementById('adminMelding').innerHTML =
        status===403 ? '<p style="color:#D8556E;">Kun VIP har tilgang til admin-dashbordet.</p>'
                     : '<p style="color:#8A8A8A;">Logg inn som VIP på <a href="/">forsiden</a> først, og åpne denne siden igjen.</p>';
    });
</script>
</body>
</html>
`;

const TIER_LEVELS = { free:0, regular:1, pro:2, vip:3 };
const canAccessTier = (u,r)=> TIER_LEVELS[u] >= TIER_LEVELS[r];
const MEDIA_PREFIX = 'media/';
const MAX_BYTES = 50*1024*1024;
const TIER_QUOTA = { free:100*1024*1024, regular:1024*1024*1024, pro:5*1024*1024*1024, vip:20*1024*1024*1024 };
const CT = {svg:'image/svg+xml',png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',gif:'image/gif',webp:'image/webp',pdf:'application/pdf',mp4:'video/mp4',webm:'video/webm',mp3:'audio/mpeg',wav:'audio/wav'};
const ct = fn => CT[fn.split('.').pop().toLowerCase()] || 'application/octet-stream';
const saniter = s => (s||'').replace(/[^a-zA-Z0-9._ -]/g,'_').trim().slice(0,120);

// ---- Passord-hashing (PBKDF2, innebygd i Workers Web Crypto) ----
function tilHex(buf){return [...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,'0')).join('');}
function fraHex(hex){const a=new Uint8Array(hex.length/2);for(let i=0;i<a.length;i++)a[i]=parseInt(hex.substr(i*2,2),16);return a;}
async function hashPassord(passord, saltHex){
  const salt = saltHex ? fraHex(saltHex) : crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(passord), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({name:'PBKDF2',salt,iterations:100000,hash:'SHA-256'}, key, 256);
  return { hash: tilHex(bits), salt: saltHex || tilHex(salt) };
}
function nyToken(){return crypto.randomUUID()+crypto.randomUUID().replace(/-/g,'');}

async function brukerFraToken(request, env){
  const token = request.headers.get('Authorization')?.replace('Bearer ','');
  if(!token) return null;
  const s = await env.DB.prepare(`SELECT user_id FROM sessions WHERE token=? AND expires > datetime('now')`).bind(token).first();
  if(!s) return null;
  return await env.DB.prepare(`SELECT id, email, display_name, tier FROM users WHERE id=?`).bind(s.user_id).first();
}
async function bruktLagring(uid, env){
  const list = await env.FILES.list({prefix:`${MEDIA_PREFIX}${uid}/`});
  return list.objects.reduce((s,o)=>s+o.size,0);
}

// ---- Stripe ----
// Kall Stripe sitt API med skjemakodede parametre.
// Nøstede felter skrives som 'line_items[0][price_data][unit_amount]' osv.
async function stripeFetch(env, sti, params, metode='POST'){
  if(!env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY mangler');
  const res = await fetch('https://api.stripe.com/v1/'+sti, {
    method: metode,
    headers: {
      'Authorization': 'Bearer '+env.STRIPE_SECRET_KEY,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params ? new URLSearchParams(params).toString() : undefined,
  });
  const d = await res.json();
  if(!res.ok) throw new Error(d.error?.message || 'Stripe-feil ('+res.status+')');
  return d;
}

// Bekreft Stripe-signaturen på webhook-kall ("t=...,v1=...")
async function verifyStripeSignatur(secret, payload, sigHeader){
  if(!sigHeader) return false;
  const parts = Object.fromEntries(sigHeader.split(',').map(p=>p.split('=')));
  if(!parts.t || !parts.v1) return false;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), {name:'HMAC',hash:'SHA-256'}, false, ['sign']);
  const forventet = tilHex(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(parts.t+'.'+payload)));
  if(forventet.length !== parts.v1.length) return false;
  let ulik = 0;
  for(let i=0;i<forventet.length;i++) ulik |= forventet.charCodeAt(i) ^ parts.v1.charCodeAt(i);
  return ulik === 0;
}

// ---- Affiliate ----
const saniterKode = k => (k||'').toUpperCase().replace(/[^A-Z0-9-]/g,'').slice(0,40);

// Hent affiliate-kode fra ?ref=... i URL-en eller fra cookien
function getAffiliateCode(request, url){
  const ref = saniterKode(url.searchParams.get('ref'));
  if(ref) return ref;
  const cookie = request.headers.get('Cookie') || '';
  const m = cookie.match(/(?:^|;\s*)lme_aff=([^;]+)/);
  return m ? saniterKode(decodeURIComponent(m[1])) : '';
}

// Sett affiliate-cookien (30 dager som standard)
function setAffiliateCookie(kode, env){
  const dager = parseInt(env.AFFILIATE_COOKIE_DAYS || '30', 10) || 30;
  return 'lme_aff='+encodeURIComponent(kode)+'; Max-Age='+(dager*86400)+'; Path=/; SameSite=Lax; Secure';
}

// Logg et affiliate-salg og oppdater partnerens totaler
async function trackAffiliateSale(env, kode, kundeEpost, tier, belop){
  kode = saniterKode(kode);
  if(!kode || !belop) return null;
  const aff = await env.DB.prepare(`SELECT a.*, u.email as partner_epost FROM affiliates a JOIN users u ON a.user_id=u.id WHERE a.code=? AND a.active=1`).bind(kode).first();
  if(!aff) return null;
  // Ingen provisjon for å verve seg selv
  if((aff.partner_epost||'').toLowerCase() === (kundeEpost||'').toLowerCase()) return null;
  const prosent = parseInt(env.AFFILIATE_COMMISSION_PERCENT || '30', 10) || 30;
  const provisjon = Math.round(belop * prosent / 100);
  const naa = new Date().toISOString();
  await env.DB.prepare(`INSERT INTO affiliate_sales (affiliate_id, affiliate_code, customer_email, tier, sale_amount, commission_amount, status, created_at) VALUES (?,?,?,?,?,?,'pending',?)`)
    .bind(aff.id, kode, kundeEpost, tier, belop, provisjon, naa).run();
  await env.DB.prepare(`UPDATE affiliates SET total_sales=total_sales+?, total_commission=total_commission+?, total_referrals=total_referrals+1 WHERE id=?`)
    .bind(belop, provisjon, aff.id).run();
  return provisjon;
}

// ---- Velkomst-epost ----
// Legger e-posten i email_queue og melder personen inn i MailerLite.
// Selve utsendingen gjøres av en MailerLite-automasjon (trigger: ny abonnent).
async function sendVelkomstEpost(env, epost, navn, tier){
  const planNavn = ({regular:'Basis', pro:'Pro', vip:'VIP'})[tier] || tier;
  const emne = 'Velkommen til LME Inner Circle 💛';
  const kropp = `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#3A3A3A;">
    <h1 style="color:#E0608A;">Velkommen, ${navn || 'utforsker'}! 🌸</h1>
    <p>Så glade vi er for å ha deg med i LME Inner Circle på planen <strong>${planNavn}</strong>.</p>
    <p>Slik kommer du i gang:</p>
    <ol>
      <li>Opprett kontoen din (eller logg inn) med denne e-postadressen.</li>
      <li>Utforsk gruppene og si hei i fellesrommet.</li>
      <li>Last opp filene dine i mediebiblioteket.</li>
    </ol>
    <p><a href="https://lmexplorers.com/grupper/inner-circle" style="background:#E0608A;color:#fff;padding:12px 24px;border-radius:99px;text-decoration:none;font-weight:bold;">Gå til Inner Circle</a></p>
    <p style="color:#8A8A8A;font-size:13px;">Klem fra Renate og LME 💛</p>
  </div>`;
  const naa = new Date().toISOString();
  const r = await env.DB.prepare(`INSERT INTO email_queue (email, subject, html_body, status, created_at) VALUES (?,?,?,'pending',?)`)
    .bind(epost, emne, kropp, naa).run();
  if(env.MAILERLITE_API_KEY){
    try {
      const res = await fetch('https://connect.mailerlite.com/api/subscribers', {
        method:'POST',
        headers:{'Authorization':'Bearer '+env.MAILERLITE_API_KEY,'Content-Type':'application/json','Accept':'application/json'},
        body: JSON.stringify({ email: epost, fields: { name: navn || '', lme_plan: planNavn }, status: 'active', groups: [env.MAILERLITE_GROUP_ID || '192875174270338867'] }),
      });
      if(res.ok) await env.DB.prepare(`UPDATE email_queue SET status='sent', sent_at=? WHERE id=?`).bind(new Date().toISOString(), r.meta.last_row_id).run();
    } catch(e) { /* køen beholder status 'pending', så ingenting går tapt */ }
  }
}

export default {
  async fetch(request, env){
    const url = new URL(request.url);
    const path = url.pathname;
    if(request.method === 'OPTIONS') return new Response(null,{headers:cors});

      // ===== SERVER MEDIEBIBLIOTEK-SIDEN =====
      if((path === '/' || path === '/mine-medier' || path === '/medier') && request.method === 'GET'){
        return html(MEDIESIDE);
      }

      // ===== SALGSSIDE =====
      if(path === '/medlemskap' && request.method === 'GET'){
        const ref = saniterKode(url.searchParams.get('ref'));
        const ekstra = ref ? {'Set-Cookie': setAffiliateCookie(ref, env)} : {};
        return html(SALGSSIDE, ekstra);
      }

      // ===== TAKKSIDE =====
      if(path === '/takk' && request.method === 'GET'){
        return html(TAKKSIDE);
      }

      // ===== AFFILIATE LANDINGSSIDE =====
      if(path === '/affiliate' && request.method === 'GET'){
        return html(AFFILIATE_SIDE);
      }

      // ===== ADMIN-DASHBORD (data-endepunktet sjekker VIP) =====
      if(path === '/admin' && request.method === 'GET'){
        return html(ADMIN_SIDE);
      }

    try {
      // ===== REGISTRERING =====
      if(path === '/auth/register' && request.method === 'POST'){
        const { email, display_name, password } = await request.json();
        if(!email || !display_name || !password) return json({error:'Fyll inn e-post, navn og passord'},400);
        if(password.length < 6) return json({error:'Passordet må ha minst 6 tegn'},400);
        const epost = email.toLowerCase();
        const finnes = await env.DB.prepare(`SELECT id, password_hash FROM users WHERE email=?`).bind(epost).first();
        // Hvis konto finnes UTEN passord (gammel konto): sett passord nå. Ellers: avvis.
        if(finnes && finnes.password_hash) return json({error:'E-posten er allerede registrert'},409);
        const { hash, salt } = await hashPassord(password);
        let userId;
        if(finnes){
          await env.DB.prepare(`UPDATE users SET password_hash=?, password_salt=?, display_name=? WHERE id=?`).bind(hash, salt, display_name, finnes.id).run();
          userId = finnes.id;
        } else {
          const res = await env.DB.prepare(`INSERT INTO users (email, display_name, tier, password_hash, password_salt) VALUES (?, ?, 'free', ?, ?)`).bind(epost, display_name, hash, salt).run();
          userId = res.meta.last_row_id;
        }
        const token = nyToken();
        const expires = new Date(Date.now()+30*24*60*60*1000).toISOString();
        await env.DB.prepare(`INSERT INTO sessions (token, user_id, expires) VALUES (?, ?, ?)`).bind(token, userId, expires).run();
        const u = await env.DB.prepare(`SELECT id, email, display_name, tier FROM users WHERE id=?`).bind(userId).first();
        return json({ success:true, token, user:u });
      }

      // ===== INNLOGGING =====
      if(path === '/auth/login' && request.method === 'POST'){
        const { email, password } = await request.json();
        if(!email || !password) return json({error:'Fyll inn e-post og passord'},400);
        const user = await env.DB.prepare(`SELECT * FROM users WHERE email=?`).bind(email.toLowerCase()).first();
        if(!user || !user.password_hash) return json({error:'Feil e-post eller passord'},401);
        const { hash } = await hashPassord(password, user.password_salt);
        if(hash !== user.password_hash) return json({error:'Feil e-post eller passord'},401);
        const token = nyToken();
        const expires = new Date(Date.now()+30*24*60*60*1000).toISOString();
        await env.DB.prepare(`INSERT INTO sessions (token, user_id, expires) VALUES (?, ?, ?)`).bind(token, user.id, expires).run();
        await env.DB.prepare(`UPDATE users SET last_login=datetime('now') WHERE id=?`).bind(user.id).run();
        return json({ success:true, token, user:{id:user.id, email:user.email, display_name:user.display_name, tier:user.tier} });
      }

      // ===== HVEM ER JEG =====
      if(path === '/auth/me' && request.method === 'GET'){
        const user = await brukerFraToken(request, env);
        if(!user) return json({error:'Ikke innlogget'},401);
        return json({ user });
      }

      // ===== LOGG UT =====
      if(path === '/auth/logout' && request.method === 'POST'){
        const token = request.headers.get('Authorization')?.replace('Bearer ','');
        if(token) await env.DB.prepare(`DELETE FROM sessions WHERE token=?`).bind(token).run();
        return json({ success:true });
      }

      // ===== CHECKOUT: START STRIPE-BETALING =====
      if(path === '/checkout/create' && request.method === 'POST'){
        if(!env.STRIPE_SECRET_KEY) return json({error:'Betaling er ikke satt opp ennå (STRIPE_SECRET_KEY mangler)'},503);
        const body = await request.json().catch(()=>({}));
        const plan = PLANS[body.plan];
        if(!plan) return json({error:'Ukjent plan'},400);
        const epost = (body.email||'').trim().toLowerCase();
        const affKode = saniterKode(body.ref) || getAffiliateCode(request, url);
        const params = {
          'mode': 'subscription',
          'line_items[0][quantity]': '1',
          'line_items[0][price_data][currency]': 'nok',
          'line_items[0][price_data][unit_amount]': String(plan.belop),
          'line_items[0][price_data][recurring][interval]': 'month',
          'line_items[0][price_data][product_data][name]': 'LME Inner Circle – '+plan.navn,
          'subscription_data[trial_period_days]': String(PROVETID_DAGER),
          'subscription_data[metadata][tier]': plan.tier,
          'allow_promotion_codes': 'true',
          'success_url': url.origin+'/takk?session_id={CHECKOUT_SESSION_ID}',
          'cancel_url': url.origin+'/medlemskap',
          'metadata[tier]': plan.tier,
        };
        if(epost && epost.includes('@')) params['customer_email'] = epost;
        if(affKode){
          params['metadata[affiliate_code]'] = affKode;
          params['subscription_data[metadata][affiliate_code]'] = affKode;
        }
        const session = await stripeFetch(env, 'checkout/sessions', params);
        return json({ url: session.url });
      }

      // ===== STRIPE WEBHOOK: BETALINGER GIR TILGANG =====
      if(path === '/webhook/stripe' && request.method === 'POST'){
        if(!env.STRIPE_WEBHOOK_SECRET) return json({error:'STRIPE_WEBHOOK_SECRET mangler'},503);
        const payload = await request.text();
        const sig = request.headers.get('stripe-signature');
        if(!(await verifyStripeSignatur(env.STRIPE_WEBHOOK_SECRET, payload, sig))){
          return json({error:'Ugyldig signatur'},400);
        }
        let event;
        try { event = JSON.parse(payload); } catch(e){ return json({error:'Ugyldig JSON'},400); }
        const obj = event.data?.object || {};
        const naa = new Date().toISOString();

        if(event.type === 'checkout.session.completed'){
          const epost = (obj.customer_details?.email || obj.customer_email || '').toLowerCase();
          const tier = obj.metadata?.tier;
          const plan = Object.values(PLANS).find(p=>p.tier===tier);
          if(!epost || !plan) return json({ok:true, ignorert:'mangler e-post eller plan'});
          const belop = obj.amount_total || 0;
          const affKode = saniterKode(obj.metadata?.affiliate_code);
          // Opprett eller oppdater brukeren og gi riktig tilgang
          const finnes = await env.DB.prepare(`SELECT id, referred_by FROM users WHERE email=?`).bind(epost).first();
          if(finnes){
            await env.DB.prepare(`UPDATE users SET tier=?, stripe_customer_id=?, stripe_subscription_id=?, referred_by=COALESCE(referred_by,?) WHERE id=?`)
              .bind(tier, obj.customer||null, obj.subscription||null, affKode||null, finnes.id).run();
          } else {
            await env.DB.prepare(`INSERT INTO users (email, display_name, tier, stripe_customer_id, stripe_subscription_id, referred_by) VALUES (?,?,?,?,?,?)`)
              .bind(epost, epost.split('@')[0], tier, obj.customer||null, obj.subscription||null, affKode||null).run();
          }
          // Loggfør betalingen (0 kr betyr at prøveperioden er i gang)
          await env.DB.prepare(`INSERT INTO payments (user_email, stripe_customer_id, stripe_subscription_id, tier, amount, status, billing_period, affiliate_code, created_at, paid_at) VALUES (?,?,?,?,?,?,?,?,?,?)`)
            .bind(epost, obj.customer||null, obj.subscription||null, tier, belop, belop>0?'paid':'trial', 'month', affKode||null, naa, belop>0?naa:null).run();
          // Provisjon med en gang hvis det ble betalt penger nå (uten prøvetid)
          if(belop > 0 && affKode) await trackAffiliateSale(env, affKode, epost, tier, belop);
          await sendVelkomstEpost(env, epost, epost.split('@')[0], tier);
          return json({ok:true});
        }

        if(event.type === 'invoice.paid' || event.type === 'invoice.payment_succeeded'){
          const epost = (obj.customer_email || obj.customer_details?.email || '').toLowerCase();
          const belop = obj.amount_paid != null ? obj.amount_paid : (obj.amount_due||0);
          if(!epost || !belop) return json({ok:true, ignorert:'mangler e-post eller beløp'});
          const user = await env.DB.prepare(`SELECT * FROM users WHERE email=?`).bind(epost).first();
          const tier = user?.tier && user.tier !== 'free' ? user.tier : 'regular';
          await env.DB.prepare(`INSERT INTO payments (user_email, stripe_customer_id, stripe_subscription_id, tier, amount, status, billing_period, affiliate_code, created_at, paid_at) VALUES (?,?,?,?,?,'paid','month',?,?,?)`)
            .bind(epost, obj.customer||null, obj.subscription||null, tier, belop, user?.referred_by||null, naa, naa).run();
          // Første ekte betaling etter prøvetiden utløser provisjonen
          if(user?.referred_by){
            const alt = await env.DB.prepare(`SELECT id FROM affiliate_sales WHERE customer_email=? LIMIT 1`).bind(epost).first();
            if(!alt) await trackAffiliateSale(env, user.referred_by, epost, tier, belop);
          }
          return json({ok:true});
        }

        if(event.type === 'customer.subscription.deleted'){
          const abon = obj.id;
          if(abon){
            await env.DB.prepare(`UPDATE users SET tier='free', stripe_subscription_id=NULL WHERE stripe_subscription_id=?`).bind(abon).run();
          }
          return json({ok:true});
        }

        if(event.type === 'customer.subscription.updated'){
          // Holder tilgangen i synk hvis abonnementet reaktiveres
          const abon = obj.id;
          const tier = obj.metadata?.tier;
          if(abon && tier && (obj.status === 'active' || obj.status === 'trialing')){
            await env.DB.prepare(`UPDATE users SET tier=? WHERE stripe_subscription_id=?`).bind(tier, abon).run();
          }
          return json({ok:true});
        }

        return json({ok:true, ignorert:event.type});
      }

      // ===== AFFILIATE: REGISTRER DEG SOM PARTNER =====
      if(path === '/affiliate/register' && request.method === 'POST'){
        const user = await brukerFraToken(request, env);
        if(!user) return json({error:'Du må logge inn'},401);
        let aff = await env.DB.prepare(`SELECT * FROM affiliates WHERE user_id=?`).bind(user.id).first();
        // Siden kaller med X-Only-Existing for bare å sjekke, uten å opprette
        if(!aff && request.headers.get('X-Only-Existing')) return json({affiliate:null});
        if(!aff){
          const base = (user.display_name||'LME').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,10) || 'LME';
          let kode = '';
          for(let i=0;i<8;i++){
            kode = base+'-'+tilHex(crypto.getRandomValues(new Uint8Array(2))).toUpperCase();
            const opptatt = await env.DB.prepare(`SELECT id FROM affiliates WHERE code=?`).bind(kode).first();
            if(!opptatt) break;
            kode = '';
          }
          if(!kode) return json({error:'Klarte ikke å lage en unik kode, prøv igjen'},500);
          await env.DB.prepare(`INSERT INTO affiliates (user_id, code, active, created_at) VALUES (?,?,1,?)`)
            .bind(user.id, kode, new Date().toISOString()).run();
          aff = await env.DB.prepare(`SELECT * FROM affiliates WHERE user_id=?`).bind(user.id).first();
        }
        const { results: sales } = await env.DB.prepare(`SELECT tier, sale_amount, commission_amount, status, created_at FROM affiliate_sales WHERE affiliate_id=? ORDER BY id DESC LIMIT 25`).bind(aff.id).all();
        return json({ affiliate: aff, sales, link: url.origin+'/medlemskap?ref='+aff.code });
      }

      // ===== ADMIN-DATA (kun VIP) =====
      if(path === '/admin/data' && request.method === 'GET'){
        const user = await brukerFraToken(request, env);
        if(!user) return json({error:'Du må logge inn'},401);
        if(user.tier !== 'vip') return json({error:'Kun VIP har tilgang'},403);
        const inntekt = await env.DB.prepare(`SELECT COALESCE(SUM(amount),0) s FROM payments WHERE status='paid'`).first();
        const betalende = await env.DB.prepare(`SELECT COUNT(*) c FROM users WHERE tier!='free'`).first();
        const provisjon = await env.DB.prepare(`SELECT COALESCE(SUM(commission_amount),0) s FROM affiliate_sales WHERE status='pending'`).first();
        const epostKo = await env.DB.prepare(`SELECT COUNT(*) c FROM email_queue WHERE status='pending'`).first();
        const { results: medlemmer } = await env.DB.prepare(`SELECT tier, COUNT(*) c FROM users GROUP BY tier ORDER BY c DESC`).all();
        const { results: betalinger } = await env.DB.prepare(`SELECT user_email, tier, amount, status, affiliate_code, created_at FROM payments ORDER BY id DESC LIMIT 20`).all();
        const { results: affiliates } = await env.DB.prepare(`SELECT a.code, a.total_sales, a.total_commission, a.total_referrals, u.display_name FROM affiliates a JOIN users u ON a.user_id=u.id ORDER BY a.total_commission DESC LIMIT 50`).all();
        return json({
          inntekt: inntekt?.s||0,
          betalende: betalende?.c||0,
          provisjon_pending: provisjon?.s||0,
          epost_ko: epostKo?.c||0,
          medlemmer, betalinger, affiliates,
        });
      }

      // ===== MEDIA LIBRARY =====
      if(path.startsWith('/api/media/')){
        // For /file tillates token via query (så <img src> virker uten header)
        let user;
        if(path === '/api/media/file'){
          const qToken = url.searchParams.get('t');
          if(qToken){
            const s = await env.DB.prepare(`SELECT user_id FROM sessions WHERE token=? AND expires > datetime('now')`).bind(qToken).first();
            if(s) user = await env.DB.prepare(`SELECT id, email, display_name, tier FROM users WHERE id=?`).bind(s.user_id).first();
          }
          if(!user) user = await brukerFraToken(request, env);
        } else {
          user = await brukerFraToken(request, env);
        }
        if(!user) return json({error:'Du må logge inn'},401);
        const uid = user.id;

        if(path === '/api/media/upload' && request.method === 'POST'){
          const form = await request.formData();
          const file = form.get('file');
          const mappe = saniter(form.get('mappe')||'');
          if(!file || typeof file === 'string') return json({error:'Mangler fil'},400);
          const buf = await file.arrayBuffer();
          if(buf.byteLength > MAX_BYTES) return json({error:'Filen er for stor (maks 50 MB)'},413);
          const brukt = await bruktLagring(uid, env);
          const kvote = TIER_QUOTA[user.tier]||TIER_QUOTA.free;
          if(brukt+buf.byteLength > kvote) return json({error:'Lagringskvoten er full',brukt,kvote},413);
          const navn = saniter(file.name||'fil').replace(/ /g,'_');
          const mappeDel = mappe ? `${mappe}/` : '';
          const key = `${MEDIA_PREFIX}${uid}/${mappeDel}${Date.now()}_${navn}`;
          await env.FILES.put(key, buf, {httpMetadata:{contentType:file.type||ct(navn)},customMetadata:{owner:String(uid),navn,mappe,uploadedAt:new Date().toISOString()}});
          return json({ok:true,path:key,navn,mappe,storrelse:buf.byteLength});
        }
        if(path === '/api/media/list' && request.method === 'GET'){
          const mappe = saniter(url.searchParams.get('mappe')||'');
          const prefix = mappe ? `${MEDIA_PREFIX}${uid}/${mappe}/` : `${MEDIA_PREFIX}${uid}/`;
          const list = await env.FILES.list({prefix});
          const files = list.objects.filter(o=>!o.key.endsWith('/.mappe')).map(o=>({
            path:o.key, navn:o.customMetadata?.navn||o.key.split('/').pop().replace(/^\d+_/,''),
            mappe:o.customMetadata?.mappe||'', type:o.httpMetadata?.contentType||ct(o.key),
            storrelse:o.size, opplastet:o.uploaded }));
          const brukt = await bruktLagring(uid, env);
          return json({files,brukt,kvote:TIER_QUOTA[user.tier]||TIER_QUOTA.free});
        }
        if(path === '/api/media/folders' && request.method === 'GET'){
          const list = await env.FILES.list({prefix:`${MEDIA_PREFIX}${uid}/`});
          const mapper = new Set();
          for(const o of list.objects){const rest=o.key.slice(`${MEDIA_PREFIX}${uid}/`.length);const d=rest.split('/');if(d.length>1)mapper.add(d[0]);}
          return json({mapper:[...mapper].sort()});
        }
        if(path === '/api/media/folder' && request.method === 'POST'){
          const {navn} = await request.json();
          const m = saniter(navn);
          if(!m) return json({error:'Mappenavn mangler'},400);
          await env.FILES.put(`${MEDIA_PREFIX}${uid}/${m}/.mappe`,'',{customMetadata:{created:new Date().toISOString()}});
          return json({ok:true,mappe:m});
        }
        if(path === '/api/media/file' && request.method === 'GET'){
          const wanted = url.searchParams.get('path')||'';
          if(!wanted.startsWith(`${MEDIA_PREFIX}${uid}/`)) return json({error:'Ingen tilgang'},403);
          const obj = await env.FILES.get(wanted);
          if(obj===null) return json({error:'Ikke funnet'},404);
          const h = new Headers(cors); h.set('Content-Type', obj.httpMetadata?.contentType||ct(wanted));
          return new Response(obj.body,{status:200,headers:h});
        }
        if(path === '/api/media/delete' && request.method === 'DELETE'){
          const wanted = url.searchParams.get('path')||'';
          if(!wanted.startsWith(`${MEDIA_PREFIX}${uid}/`)) return json({error:'Ingen tilgang'},403);
          await env.FILES.delete(wanted);
          return json({ok:true,slettet:wanted});
        }
        return json({error:'Ukjent media-endepunkt'},404);
      }

      // ===== COMMUNITY (hubs/posts/comments/likes) =====
      if(path === '/hubs' && request.method === 'GET'){
        const user = await brukerFraToken(request, env);
        const tier = user?.tier||'free';
        const { results } = await env.DB.prepare(`SELECT id,slug,name,description,required_tier,display_order FROM hubs ORDER BY display_order`).all();
        return json({ hubs: results.map(h=>({...h,accessible:canAccessTier(tier,h.required_tier)})), user_tier:tier });
      }
      const hubMatch = path.match(/^\/hubs\/([^\/]+)\/posts$/);
      if(hubMatch && request.method === 'GET'){
        const user = await brukerFraToken(request, env); const tier=user?.tier||'free';
        const hub = await env.DB.prepare(`SELECT * FROM hubs WHERE slug=?`).bind(hubMatch[1]).first();
        if(!hub) return json({error:'Hub ikke funnet'},404);
        if(!canAccessTier(tier,hub.required_tier)) return json({error:'Ingen tilgang',required_tier:hub.required_tier},403);
        const { results } = await env.DB.prepare(`SELECT posts.id,posts.title,posts.content,posts.created_at,users.display_name as author,(SELECT COUNT(*) FROM comments WHERE post_id=posts.id) as comment_count,(SELECT COUNT(*) FROM likes WHERE post_id=posts.id) as like_count FROM posts JOIN users ON posts.user_id=users.id WHERE posts.hub_id=? ORDER BY posts.created_at DESC`).bind(hub.id).all();
        return json({hub,posts:results});
      }
      if(hubMatch && request.method === 'POST'){
        const user = await brukerFraToken(request, env);
        if(!user) return json({error:'Du må logge inn'},401);
        const hub = await env.DB.prepare(`SELECT * FROM hubs WHERE slug=?`).bind(hubMatch[1]).first();
        if(!hub) return json({error:'Hub ikke funnet'},404);
        if(!canAccessTier(user.tier,hub.required_tier)) return json({error:'Ingen tilgang'},403);
        const {title,content} = await request.json();
        if(!title||!content) return json({error:'Tittel og innhold må fylles inn'},400);
        const r = await env.DB.prepare(`INSERT INTO posts (hub_id,user_id,title,content) VALUES (?,?,?,?)`).bind(hub.id,user.id,title,content).run();
        return json({success:true,post_id:r.meta.last_row_id});
      }
      const postMatch = path.match(/^\/posts\/(\d+)$/);
      if(postMatch && request.method === 'GET'){
        const user = await brukerFraToken(request, env); const tier=user?.tier||'free';
        const post = await env.DB.prepare(`SELECT posts.*,users.display_name as author,hubs.required_tier,hubs.slug as hub_slug,hubs.name as hub_name FROM posts JOIN users ON posts.user_id=users.id JOIN hubs ON posts.hub_id=hubs.id WHERE posts.id=?`).bind(postMatch[1]).first();
        if(!post) return json({error:'Innlegg ikke funnet'},404);
        if(!canAccessTier(tier,post.required_tier)) return json({error:'Ingen tilgang'},403);
        const { results:comments } = await env.DB.prepare(`SELECT comments.id,comments.content,comments.created_at,users.display_name as author FROM comments JOIN users ON comments.user_id=users.id WHERE comments.post_id=? ORDER BY comments.created_at ASC`).bind(postMatch[1]).all();
        const { results:likes } = await env.DB.prepare(`SELECT COUNT(*) as count FROM likes WHERE post_id=?`).bind(postMatch[1]).all();
        return json({post,comments,like_count:likes[0].count});
      }
      const commentMatch = path.match(/^\/posts\/(\d+)\/comments$/);
      if(commentMatch && request.method === 'POST'){
        const user = await brukerFraToken(request, env);
        if(!user) return json({error:'Du må logge inn'},401);
        const {content} = await request.json();
        if(!content) return json({error:'Kommentar kan ikke være tom'},400);
        await env.DB.prepare(`INSERT INTO comments (post_id,user_id,content) VALUES (?,?,?)`).bind(commentMatch[1],user.id,content).run();
        return json({success:true});
      }
      const likeMatch = path.match(/^\/posts\/(\d+)\/like$/);
      if(likeMatch && request.method === 'POST'){
        const user = await brukerFraToken(request, env);
        if(!user) return json({error:'Du må logge inn'},401);
        const ex = await env.DB.prepare(`SELECT id FROM likes WHERE post_id=? AND user_id=?`).bind(likeMatch[1],user.id).first();
        if(ex){await env.DB.prepare(`DELETE FROM likes WHERE id=?`).bind(ex.id).run();return json({liked:false});}
        await env.DB.prepare(`INSERT INTO likes (post_id,user_id) VALUES (?,?)`).bind(likeMatch[1],user.id).run();
        return json({liked:true});
      }

      return json({error:'Endepunkt ikke funnet'},404);
    } catch(err){
      return json({error:err.message},500);
    }
  }
};
