/**
 * Låsen foran nedlastingene.
 *
 * Alt under /butikk/nedlasting/ går gjennom denne før filen sendes ut.
 * Har forespørselen et kjøpsbevis, slippes den rett videre til filen, og
 * kunden merker ingenting. Har den ikke det, får hun en side som forklarer
 * hva som skjedde og lar henne be om en ny lenke på e-post.
 *
 * Filer som ikke hører til noe produkt slippes gjennom som før. Låsen kan
 * bare stenge det den vet at noen har betalt for.
 */
import { harNedlastingstilgang } from "../../_lib/nedlasting-tilgang.js";

function side(status, tittel, tekst, visSkjema, sti) {
  const html =
    '<!doctype html><html lang="no"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    "<title>" + tittel.no + " | LME</title>" +
    "<style>" +
    "@font-face{font-family:'Sasson Montessori';" +
      "src:url('/fonts/SassoonMontessori.woff2') format('woff2')," +
      "url('/fonts/SassoonMontessori.ttf') format('truetype');font-display:swap}" +
    "body{margin:0;background:#FBF6F0;color:#1A1A1A;" +
      "font-family:'Sasson Montessori','Playpen Sans',system-ui,sans-serif;" +
      "display:grid;place-items:center;min-height:100vh;padding:24px}" +
    ".kort{background:#fff;border-radius:24px;box-shadow:0 12px 40px rgba(26,26,26,.08);" +
      "padding:32px 28px;max-width:520px;width:100%;text-align:center}" +
    "h1{font-family:'Playpen Sans',system-ui,sans-serif;font-size:26px;margin:0 0 12px}" +
    "p{font-size:15.5px;line-height:1.55;color:#4A4A4A;margin:0 0 14px}" +
    "input{width:100%;border:1px solid rgba(26,26,26,.18);border-radius:12px;" +
      "padding:13px 14px;font-size:15px;font-family:inherit;margin-bottom:10px}" +
    "button{width:100%;border:none;cursor:pointer;border-radius:999px;padding:14px 20px;" +
      "font-size:15.5px;font-weight:700;background:#F7E76B;color:#1A1A1A;font-family:inherit}" +
    "button:disabled{opacity:.6;cursor:default}" +
    ".svar{margin-top:12px;font-size:14px}" +
    "a{color:#E91E89}" +
    "</style></head><body><div class=\"kort\">" +
    "<h1 data-no></h1><p data-no></p>" +
    (visSkjema
      ? '<form id="f"><input type="email" required placeholder="E-post" id="e" autocomplete="email">' +
        '<button type="submit" id="b">Send meg lenken på nytt</button>' +
        '<p class="svar" id="s"></p></form>'
      : "") +
    '<p><a href="/butikk">Til butikken</a></p>' +
    "</div><script>" +
    "var T=" + JSON.stringify({ tittel: tittel, tekst: tekst, sti: sti }) + ";" +
    "var en=(navigator.language||'').slice(0,2)!=='no';" +
    "try{en=localStorage.getItem('lme_lang')==='en'}catch(e){}" +
    "document.documentElement.lang=en?'en':'no';" +
    "document.querySelector('h1').textContent=en?T.tittel.en:T.tittel.no;" +
    "document.querySelector('p[data-no]').textContent=en?T.tekst.en:T.tekst.no;" +
    "var f=document.getElementById('f');" +
    "if(f){var b=document.getElementById('b'),s=document.getElementById('s');" +
    "b.textContent=en?'Send me the link again':'Send meg lenken på nytt';" +
    "document.getElementById('e').placeholder=en?'Email':'E-post';" +
    "f.addEventListener('submit',function(ev){ev.preventDefault();b.disabled=true;" +
    "b.textContent=en?'One moment …':'Ett øyeblikk …';" +
    "fetch('/api/nedlasting-ny-lenke',{method:'POST',headers:{'Content-Type':'application/json'}," +
    "body:JSON.stringify({email:document.getElementById('e').value,sti:T.sti,lang:en?'en':'no'})})" +
    ".then(function(r){return r.json()}).then(function(){" +
    "s.textContent=en?'If that email has bought this, the link is on its way. Do check your spam folder.'" +
    ":'Har den e-posten kjøpt dette, er lenken på vei. Sjekk gjerne søppelpost.';" +
    "b.style.display='none'}).catch(function(){" +
    "s.textContent=en?'Something went wrong. Please write to post@lmexplorers.com.'" +
    ":'Noe gikk galt. Skriv gjerne til post@lmexplorers.com.';b.disabled=false})});}" +
    "<\/script></body></html>";
  return new Response(html, {
    status: status,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
}

export async function onRequest(context) {
  const sti = new URL(context.request.url).pathname;

  let svar;
  try {
    svar = await harNedlastingstilgang(context, sti);
  } catch (e) {
    /* Klarer vi ikke å avgjøre det, skal ikke en betalende kunde stå igjen
       uten filen sin. Da slipper vi gjennom, og heller det enn å stenge
       ute noen som har betalt. */
    return context.next();
  }

  if (svar.ok) {
    const res = await context.next();
    /* Nedlastinger skal ikke mellomlagres av noen på veien, ellers kunne
       en fil blitt liggende igjen et sted uten låsen foran. */
    const ny = new Response(res.body, res);
    ny.headers.set("Cache-Control", "private, no-store");
    return ny;
  }

  return side(
    403,
    {
      no: "Denne lenken mangler kjøpsbeviset",
      en: "This link is missing its proof of purchase",
    },
    {
      no: "Nedlastingene er nå låst, så ingen kan hente det du har betalt for uten å ha kjøpt det. Er du en av dem som kjøpte tidligere, har du en lenke i innboksen fra før låsen kom. Skriv e-posten du kjøpte med, så sender jeg deg en ny lenke med en gang.",
      en: "The downloads are now locked, so nobody can take what you paid for without buying it. If you bought earlier, your inbox has a link from before the lock. Enter the email you bought with, and I will send you a new link right away.",
    },
    true,
    sti
  );
}
