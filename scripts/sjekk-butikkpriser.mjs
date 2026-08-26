/**
 * Sier fra hvis prisen i functions/_lib/butikk-priser.js ikke er den samme
 * som prisen kunden ser i kjøpsboksen på produktsiden.
 *
 *   node scripts/sjekk-butikkpriser.mjs
 *
 * Kjør den når du har endret en pris. Uten den kan Vipps-kunden bli
 * belastet et annet beløp enn det som står på siden, og ingen ville
 * oppdaget det før noen klaget.
 *
 * Merk at skriptet ikke kan sjekke Stripe (det trenger en API-nøkkel).
 * Stripe må derfor rettes for hånd i samme slengen.
 */
import { readFileSync, existsSync } from "node:fs";
import { OPPSKRIFT_NOK_ORE } from "../functions/_lib/butikk-priser.js";

let avvik = 0, utenSide = 0, sjekket = 0;

for (const pid of Object.keys(OPPSKRIFT_NOK_ORE).sort()) {
  const fil = "butikk/" + pid + ".html";
  if (!existsSync(fil)) { utenSide++; continue; }
  const html = readFileSync(fil, "utf8");
  const m = html.match(/class="price" data-no="([^"]*)"/);
  if (!m) { console.log("INGEN PRIS I HTML  " + pid); avvik++; continue; }
  const kroner = parseInt(m[1].replace(/[^\d]/g, ""), 10);
  sjekket++;
  if (kroner * 100 !== OPPSKRIFT_NOK_ORE[pid]) {
    console.log(
      "AVVIK  " + pid + ": siden sier " + m[1] +
      ", butikk-priser.js sier " + OPPSKRIFT_NOK_ORE[pid] / 100 + " kr"
    );
    avvik++;
  }
}

console.log(
  sjekket + " produktsider sjekket, " + utenSide +
  " produkter uten egen side, " + avvik + " avvik"
);
process.exit(avvik ? 1 : 0);
