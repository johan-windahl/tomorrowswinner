# Product Requirements Document (PRD) – tomorrowswinner.com

## 1. Vision & Mål

**Vision:**  
Bygga en global, modulär och användarvänlig tävlingsplattform där användare gratis kan gissa morgondagens vinnare inom olika kategorier (finans, krypto, reality-TV, sport, med mera).

**Mål:**

- Engagera användare genom dagliga tävlingar.
- Erbjuda ett enkelt och roligt sätt att testa sin kunskap eller förmåga att förutsäga olika utfall.
- Skapa en bas för framtida intäktsströmmar genom annonser och samarbeten.
- Leverera en attraktiv design och utmärkt användarupplevelse som uppmuntrar återkommande användning.

---

## 2. Målgrupp

- **Primär:** Alla som tycker om att gissa och tävla – oavsett intresseområde.
- **Sekundär:** Specifika segment såsom investeringsintresserade, kryptoföljare, sport- och reality-TV-fans.
- **Global räckvidd:** Webbplatsen är på engelska från start.

---

## 3. MVP-Omfång

MVP-versionen ska omfatta:

- **Kategorier:**

  - _Finance_: Daglig tävling om vilken aktie på **S&P 500** som har högst procentuell uppgång nästa handelsdag.
  - _Crypto_: Daglig tävling om vilken kryptovaluta (topp 100 efter market cap) som har bäst utveckling nästa dag.

- **Dagliga tävlingar & tidsregler:**

  - Deadline för gissningar: **22:00 Eastern Time (ET)** för alla kategorier.
  - “Nästa dag” definieras i **ET**.
  - Obegränsat antal ändringar fram till deadline.
  - Andras gissningar **döljs före deadline**.

- **Mätperioder & vinnare:**

  - **Aktier:** Vinnare = högst procentuell förändring **close-to-close** nästa handelsdag.
  - **Marknadsstängda dagar:** Ingen tävling om marknaden är stängd (helgdagar m.m.).
  - **Avnoteringar:** Exkluderas från tävling.
  - **Splits:** Använd splitjusterade priser om tillgängligt; om inte, beräkna mot pre-split referens.
  - **Krypto:** Fönster **00:00–23:59 ET**, pris i **USD** (CoinGecko).
  - **Krypto-universum:** Topp **100** kryptovalutor efter market cap (CoinGecko), dagligen uppdaterad lista.

- **Ranking:**

  - Dagens vinnare (plats 1–50).
  - Veckans bästa spelare.
  - Månadens bästa spelare.
  - All-time leaderboard.
  - **Vecka/månad definieras som kalendervecka/-månad i ET**.

- **Poängsystem:**

  - Samma poängmodell för alla kategorier.
  - Exempel: Rätt gissning = **100 poäng**, fel gissning = **0 poäng**.
  - **Ties:** Vid lika procent utses samtliga relevanta alternativ till vinnare; alla korrekta gissningar får 100 poäng.

- **Datakällor:** Realtids-/nära realtids-API-integrationer

  - Aktier: Stooq (EOD close-priser via gratis CSV); S&P 500-lista från Nasdaq/Stooq, dagligen uppdaterad.
  - Krypto: CoinGecko.

- **Användarkonton:**

  - Registrering via e-post & lösenord.
  - Grundläggande profil (visningsnamn, land, avatar).
  - Möjlighet att lägga till sociala profiler (X/Twitter, Instagram, LinkedIn m.fl.) som klickbara länkar.
  - **Användarnamn/handle:** Publikt, unikt, alfanumeriskt, kan ändras upp till **3 gånger**.

- **Social delning:**

  - Delning till X, Facebook, LinkedIn, Instagram, TikTok.
  - Dynamiskt genererade delningskort (OG-bilder) med användarens gissning.
  - “Invite friends” för att skicka inbjudningslänk via sociala medier/e-post.
  - **Referrals:** Spårning via referral-kod i URL, attribuering **7 dagar**.

- **Åtkomst för ej inloggade:**

  - Ej inloggade kan se alla tävlingar, kategorier och topplistor.
  - För att delta/gissa krävs konto.

- **Responsiv design:** Mobilanpassad webbapp med fokus på modern och engagerande UI/UX.

---

## 4. Funktionella krav

### 4.1 Tävlingshantering

- Skapa/modifiera tävlingar via kod.
- Koppla tävlingar till specifika API-datakällor.
- Automatisk poängberäkning vid marknadsstängning/ny data.
- Schemalagda jobb för poäng & resultat (cron).

### 4.2 Användarflöden

- Registrering & inloggning.
- Delta i tävling genom att välja ett alternativ.
- Ändra gissning fram till deadline.
- Se leaderboard för aktuell dag, vecka, månad och all-time.
- Dolda gissningar före deadline; synliggörs efter.

### 4.3 Leaderboards

- Uppdateras automatiskt när resultat är tillgängligt.
- Filtrering per kategori & tidsperiod.
- Kalendervecka/-månad i ET.

### 4.4 Annonsering

- Inga annonser vid lansering av MVP.
- Arkitektur för enkel aktivering senare (ej spammigt; placeringar definieras vid aktivering).

### 4.5 Social funktionalitet

- Delningsknappar på tävlingssidor och resultatsidor.
- Generera unika länkar till tävlingar som kan delas i sociala medier.
- Inbjudningssystem med 7-dagars attribuering.

### 4.6 Moderation

- Enkel blocklist för profillänkar/usernames (alfanumeriska handles).

---

## 5. Icke-funktionella krav

- **Skalbarhet:** Plattformen ska kunna hantera många kategorier och tävlingar parallellt.
- **Modularitet:** Lätt att lägga till nya kategorier (ex. Reality-TV).
- **Prestanda (mål):** LCP ≤ **200 ms**, TTFB ≤ **200 ms**.
- **Säkerhet:** Kryptering av lösenord (bcrypt), säkra API-anrop.
- **Juridik:**
  - Tydliga _Terms of Service_ och _Privacy Policy_ (utkast tas fram).
  - Disklaimer: “No monetary wagering – for entertainment purposes only.”
  - **Ålder/region:** Inga särskilda begränsningar planerade.
- **Integritet (GDPR/Cookies):**
  - Samtyckesbanner.
  - DPA med leverantörer (GA4, AdSense vid aktivering, Supabase).

---

## 6. Teknisk lösning

- **Frontend:** Next.js (React) + TailwindCSS.
- **Backend:** Supabase (auth, databashantering).
- **API-integrationer:**
  - Stooq (aktier, EOD CSV, gratis).
  - CoinGecko (krypto).
- **Datainhämtning:**
  - Uppdateringsintervall: **varje timme**.
  - S&P 500-lista: Hämtas från betrodd källa (t.ex. Stooq/Nasdaq) och uppdateras dagligen.
- **Hosting:** Vercel (frontend) + Supabase (backend).
- **Cron/Schemaläggning:** Vercel Cron och/eller Supabase Edge Functions tillåtet för scoring och uppdateringar.
- **Lagring:** Avataruppladdning via Supabase Storage, max **500 KB**.
- **Analytics:** Google Analytics 4 (centrala händelser: `signup`, `guess_submitted`, `share_clicked`, `invite_sent`).
- **Branding/Design:** Baseras på inspirationskällor `stripe.com` och `framer.com` (Google Fonts OK). UI-copy tas fram som defaultutkast.

---

## 7. Roadmap

| FAS             | Funktioner                                                                                                                                       | Tid         |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------- |
| **Fas 1 (MVP)** | Aktier + krypto, dagliga tävlingar, poängsystem, leaderboard, social delning, profilens sociala medier, ej inloggade kan se tävlingar/topplistor | 6–8 veckor  |
| **Fas 2**       | Fler kategorier (Reality-TV, sport), modulär adminpanel                                                                                          | +4 veckor   |
| **Fas 3**       | Sponsrade tävlingar, vinster & giveaways                                                                                                         | +4–6 veckor |
| **Fas 4**       | Mobilapp (iOS/Android)                                                                                                                           | +6 veckor   |

---

## 8. Monetisering

- **Kort sikt:** Inga annonser vid MVP-lansering; förberedda ytor/komponenter för snabb aktivering.
- **Medellång sikt:** Samarbetskampanjer med finanstjänster eller streamingplattformar.
- **Lång sikt:** Sponsrade kategorier, vinster & giveaways med varumärken.

---

## 9. Åtkomst & konton (separat tråd)

Följande hanteras i separat diskussion: Vercel-projekt/inbjudan, domän (`tomorrowswinner.com`), Supabase-projekt (URL/keys), e-postleverantör (SMTP/SendGrid/Resend), GA4 Measurement ID, AdSense vid aktivering.

---

## 10. Öppna punkter / TBD

- Referral: **8 tecken**, visas i **share-dialogen**, enkel antispam med **rate-limit per IP**.
