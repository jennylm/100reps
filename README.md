# 100 Reps

Track **100 reps** of the practices that matter to you — writing, piano, pottery, training, or anything else. Each activity has a clear definition of what counts as one rep; you log sessions with optional notes and photo evidence, and watch progress toward 100.

## Philosophy

Consistency over intensity. A rep is whatever *you* define — 45 minutes of practice, one finished sketch, a morning page. The goal is a finished journey of 100, not a streak counter.

## Current status (MVP)

- Email / password auth (Supabase)
- Create, edit, and delete activities
- Log / edit / delete reps with notes and SafeSearch-screened photo evidence
- Private cloud sync (Postgres + Storage + RLS)
- Add-activity wizard (area → subcategory → name → rep definition → visibility)

**Not yet:** social feed, public profiles, OAuth (Apple / Google), Expo Router navigation.

## Stack

- Expo SDK 57 / React Native
- TypeScript
- Supabase (Auth, Postgres, Storage)

## Local setup

```bash
npm install
cp .env.example .env   # fill in keys (see below)
npx expo start
```

Then press `i` / `a` for simulator, or scan the QR with Expo Go.

### Environment variables

| Variable | Purpose |
|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL (`https://….supabase.co`) |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon / publishable key (not the secret) |
| `EXPO_PUBLIC_UNSPLASH_ACCESS_KEY` | Activity cover photo search |
| `EXPO_PUBLIC_GOOGLE_VISION_API_KEY` | SafeSearch for evidence photos |

### Database migrations

In the [Supabase SQL Editor](https://supabase.com/dashboard), run in order:

1. [`supabase/migrations/001_init.sql`](supabase/migrations/001_init.sql) — tables, RLS, storage bucket
2. [`supabase/migrations/002_reps_activity_ownership.sql`](supabase/migrations/002_reps_activity_ownership.sql) — tighten rep insert/update to require an owned activity

For Auth: enable Email provider. For local testing, you can disable “Confirm email”.

### Scripts

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # eslint .
npm start           # expo start
```

## Roadmap (near-term)

1. Stabilize and personally test the personal tracker loop
2. Navigation refactor (Expo Router)
3. Signed-URL / list-query performance when photo history grows
4. Community / visibility semantics (activity vs rep vs share-to-feed)

## License

MIT — see [LICENSE](LICENSE).
