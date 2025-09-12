# Pashto Bible MVP

Minimal Next.js app with two swappable data backends:
- Firebase Firestore (default for this repo now)
- Supabase (kept as optional path)

The UI provides a basic search over `verses`.

## Firebase (current)

### Setup
1) Create a Firebase project, enable Firestore (Native mode).
2) Create a web app to get client config values (API key, projectId, etc.).
3) Copy `.env.local.example` to `.env.local` and fill the `NEXT_PUBLIC_FIREBASE_*` values.
4) Install deps and start dev:

```
npm install
npm run dev
```

### Firestore structure

Collection: `verses`
Fields: `book` (string), `chapter` (number), `verse` (number), `text` (string), `testament` (string), `tokens` (array<string>)

Search uses an `array-contains` query on `tokens` (a precomputed list of normalized words) and then filters the remaining words in-memory. This is a simple MVP pattern; for real full‑text search consider Algolia, Meilisearch, or a dedicated index.

### Security rules

The file `firebase/firestore.rules` grants read-only public access to `/verses/*`. Tighten before production.

### Seeding data

Use the Node script with a service account (do not commit credentials):

```
# Option A: path to JSON
export GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json
# Option B: inline JSON
export FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'

node scripts/seed_firestore.js
```

## Supabase (optional)

- If you prefer Supabase, the previous `utils/supabase.ts` remains. Swap the hook implementation back or create a second page.
- The SQL for a `verses` table with RLS is available in `supabase/sql/init.sql`.

## Deploying

- Vercel: add `NEXT_PUBLIC_FIREBASE_*` environment variables in the project settings.

## Pushing to GitHub

```
git init
git add -A
git commit -m "feat: initial mvp (firebase)"
git branch -M main
git remote add origin git@github.com:<you>/pashto-bible-mvp.git
git push -u origin main
```

## Notes

- For richer features (lexicon, grammar, audio), copy the relevant components/hooks from your other repos and adapt them to Firestore (or keep Supabase for those features).
