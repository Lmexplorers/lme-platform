# GDPR: databehandleravtaler (DPA)

En databehandleravtale (Data Processing Agreement, DPA) er en avtale mellom deg
(behandlingsansvarlig) og hver leverandør som behandler personopplysninger på dine
vegne. GDPR krever at du har en slik avtale med hver av dem. Dette er papirarbeid
du gjør selv, ikke kode, men her er nøyaktig hvor du huker dem av.

De fleste tilbyr en ferdig DPA du godtar med ett klikk inne på kontoen din, eller
som er en del av vilkårene du allerede har akseptert.

| Leverandør | Hva de behandler | Hvor du ordner DPA |
|---|---|---|
| **Cloudflare** | Drift, lagring (KV), sikkerhet | Dashboard, Manage Account, Configurations, Data Protection / DPA. Innebygd i vilkårene, kan lastes ned signert. |
| **Stripe** | Betaling, kunde- og kjøpsdata | DPA er del av Stripe Services Agreement (automatisk). Signert kopi: Dashboard, Settings, Legal / Compliance. |
| **MailerLite** | E-post, navn, nyhetsbrev | Konto, Integrations / Legal. DPA ligger under vilkår, godtas ved bruk. Egen signering: kontakt support ved behov. |
| **Anthropic** | AI-tekst (Renate AI, oversettelse) | Del av Commercial Terms. DPA: trust.anthropic.com eller be om via support. Bruk kommersielle vilkår, ikke forbruker. |
| **OpenAI** | AI-bilder (valgt motor) | platform.openai.com, Settings, Organization. DPA ligger tilgjengelig for signering der. Slå av bruk til trening. |
| **Google (Gemini)** | AI-bilder (valgt motor) | Google Cloud / AI Studio-vilkår inneholder DPA (Cloud Data Processing Addendum). |
| **Blotato** | Publisering til dine sosiale kontoer | Sjekk Blotato sine vilkår / privacy. Be om DPA via support hvis den ikke ligger i kontoen. |

## Sjekkliste

- [ ] Cloudflare DPA bekreftet
- [ ] Stripe DPA bekreftet
- [ ] MailerLite DPA bekreftet
- [ ] Anthropic kommersielle vilkår / DPA bekreftet
- [ ] OpenAI DPA bekreftet, trening avslått
- [ ] Google Cloud DPA bekreftet
- [ ] Blotato DPA bekreftet

## Godt å vite

- Flere av disse ligger i USA. Overføring utenfor EØS skal skje med gyldig
  grunnlag, som EUs standardavtaler (SCC). Leverandørene over bruker dette, og det
  er nevnt i personvernerklæringen på `/personvern`.
- Fører du en enkel liste (et behandlingsprotokoll) over hvilke opplysninger du
  behandler og hvorfor, er du godt dekket for et lite foretak. Denne tabellen kan
  være starten på den.
- Legger du til en ny leverandør senere, oppdater både `/personvern` og denne lista.
