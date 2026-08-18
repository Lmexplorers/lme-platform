/**
 * PENSJONERT. Ikke bruk denne filen.
 *
 * Dette var den gamle Nathalie AI, en frittstående Cloudflare Worker som måtte
 * limes inn manuelt i Cloudflare-panelet for å oppdateres. Den er erstattet av
 *
 *     functions/nathalie-ai.js
 *
 * som er en Pages Function og deployer automatisk fra GitHub sammen med resten
 * av siden. Ingenting på plattformen kaller lenger workers.dev-adressen:
 * widgeten (js/renate-widget.js), /spor-nathalie-ai og /ask-nathalie-ai går
 * alle mot /nathalie-ai.
 *
 * HVORFOR INNHOLDET ER FJERNET HERFRA
 * Filen inneholdt en egen kopi av systemprompten, med prisene skrevet rett inn
 * i teksten: Start 299, Proff 499, Proff + Fellesskap 699. De planene finnes
 * ikke lenger. Den samme feilen ble rettet i den levende Nathalie 16. august
 * 2026, der prisene nå kommer fra functions/_lib/plans.js, som er den ene
 * kilden til hva ting koster. Å la en pensjonert kopi ligge igjen med gamle
 * priser er en felle: neste gang noen leter etter "Nathalies systemprompt",
 * kan de treffe feil fil og rette feil sted.
 *
 * Skal du endre hva Nathalie kan, sier eller koster: gjør det i
 * functions/nathalie-ai.js og functions/_lib/plans.js. Se docs/ai-core.md.
 *
 * Den gamle koden ligger i git-historikken om den noen gang trengs igjen.
 */

export default {
  async fetch() {
    return new Response(
      JSON.stringify({
        error: "Denne workeren er pensjonert. Nathalie AI ligger på /nathalie-ai.",
      }),
      { status: 410, headers: { "Content-Type": "application/json" } }
    );
  },
};
