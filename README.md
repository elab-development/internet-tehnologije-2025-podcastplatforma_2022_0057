# Podcast Platforma
Seminarski rad iz predmeta Internet tehnologije 

Fullstack web aplikacija za upravljanje audio sadržajem.

## O aplikaciji

Aplikacija omogućava korisnicima pregled i slušanje podcast epizoda, dok administratorima pruža mogućnost otpremanja sadržaja i upravljanja korisnicima.

### Uloge korisnika

- **Admin** — Upravljanje korisnicima, dodavanje i brisanje serijala, dodavanje i brisanje episoda.
- **Korisnik ** — Pregled javne početne strane, registracija i prijava na sistem, pregled, pretraga i filtriranje serijala, pretplata na platformu

### Tehnologije

- **Frontend & Backend:** Next.js 14+ (App Router, TypeScript)
- **Baza podataka:** PostgreSQL
- **ORM:** Drizzle ORM
- **Autentifikacija:** JWT (JSON Web Tokens)
- **Testiranje:** Vitest (Automatizovani Unit i Integration testovi)
- **Kontejnerizacija:** Docker, Docker Compose
- **CI/CD:** GitHub Actions


## Pokretanje aplikacije

### Preduslovi

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Node.js 20+](https://nodejs.org/)

### 1. Kloniranje repozitorijuma

```bash
git clone [https://github.com/tvoj-username/internet-tehnologije-2025-podcastplatforma_2022_0057.git](https://github.com/tvoj-username/internet-tehnologije-2025-podcastplatforma_2022_0057.git)
cd internet-tehnologije-2025-podcastplatforma_2022_0057

### 2. Podešavanje environment varijabli

Kreiraj `.env` fajl u root folderu:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/podcast_db
JWT_SECRET=tvoj_tajni_kljuc
ASSEMBLYAI_API_KEY=tvoj_api_kljuc
```
### 3. Lokalni build

```bash
npm install
```
### 4. Pokretanje sa Docker Compose

```bash
docker compose up --build
```
Aplikacija je dostupna na: **http://localhost:3000**

### 5. Punjenje baze test podacima (opciono)

Sve može da se popuni preko korisničkog interfejsa, neophodno je samo u bazi promeniti ulogu USER->ADMIN i dodati Query za tip serijala i izvršiti ga.
Primer Query-ja:
```
INSERT INTO series_types (id, name) VALUES
  ('sport', 'Sport'),
  ('psihologija', 'Psihologija'),
  ('estrada', 'Estrada'),
  ('umetnost', 'Umetnost'),
  ('kultura', 'Kultura'),
  ('tehnologija', 'Tehnologija'),
  ('biznis', 'Biznis i preduzetništvo'),
  ('edukacija', 'Edukacija'),
  ('zdravlje', 'Zdravlje'),
  ('motivacija', 'Motivacija i lični razvoj');
```

## Struktura projekta

```
internet-tehnologije-2025-podcastplatforma_2022_0057/
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions konfiguracija
├── src/
│   ├── __tests__/              # Unit i integracioni testovi (api, users, register...)
│   ├── app/                    # Next.js App Router (stranice i API rute)
│   ├── db/                     # Drizzle ORM konfiguracija i sheme
│   └── lib/                    # Pomoćne funkcije (assembly.ts za AI, auth...)
├── public/                     # Statički fajlovi (slike, audio)
├── .env                        # Environment varijable (lokalno)
├── .dockerignore               # Fajlovi koje Docker ignoriše
├── docker-compose.yml          # Konfiguracija za više kontejnera (app + db)
├── Dockerfile                  # Instrukcije za kreiranje Docker slike
├── drizzle.config.ts           # Konfiguracija za Drizzle ORM
├── package.json                # Zavisnosti i skripte (npm run test:run)
├── README.md                   # Dokumentacija projekta
└── vitest.config.ts            # Konfiguracija za testiranje (Vitest)
```
## Git grane

- `main` — stabilna produkciona verzija
- `develop` — integraciona grana
- `feature/stats` — vizualizacija i eksterni API
- `feature/ci-cd` — implementacija testova i pipeline-a
- ...

## API Endpointi

| Metoda | Endpoint                    | Opis                                    |
|--------|-----------------------------|-----------------------------------------|
| POST   | /api/auth/register          | Registracija novog korisnika            |
| POST   | /api/episodes               | Upload nove epizode (Admin)             |
| PUT    | /api/users/:id              | Izmena uloge ili podataka korisnika     |
| DELETE | /api/users/:id              | Brisanje korisničkog naloga (Admin)     |
| GET    | /api/episodes               | Lista svih podcast epizoda              |
...







