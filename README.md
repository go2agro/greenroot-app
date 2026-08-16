# GreenRoot

Internship management platform for GreenRoot. Students discover and apply to international internships; admins review applications, manage listings, and handle offers; partners work assigned applications.

## Stack

- Next.js 16 (App Router) + TypeScript
- Supabase (auth, database, storage)
- Tailwind CSS v4 + ShadCN
- PostHog (analytics)

## Roles

| Role | Portal |
|---|---|
| Student | `/student/*` — profile, internships, applications |
| Admin | `/admin/*` — listings, reviews, dashboard, billing |
| Partner | `/partner/*` — assigned applications |

Public pages: internships, about, contact, login, signup.

## Setup

```bash
npm install
```

Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
ADMIN_SETUP_SECRET=
NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN=
NEXT_PUBLIC_POSTHOG_HOST=
```

```bash
npm run dev
```

App runs at [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server on port 3000 |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |

Data access lives in `lib/`. Pages in `app/` stay UI-only — no direct Supabase calls in page components.
