# server

Fastify API server with [Better Auth](https://better-auth.com) via `@repo/auth`, backed by Drizzle + Postgres (`@repo/db`).

Environment variables live in a single `.env` at the repo root (see `.env.example`). Each package validates the variables it needs in its `src/env.mjs` via [t3-env](https://env.t3.gg).

## Setup

```sh
cp ../../.env.example ../../.env   # set BETTER_AUTH_SECRET and DATABASE_URL
pnpm db:generate                   # from repo root: generate SQL migrations
pnpm db:migrate                    # from repo root: apply migrations to Postgres
pnpm dev                           # starts on http://localhost:4000
```

## Endpoints

- `ALL /api/auth/*` — Better Auth (sign-up, sign-in, sign-out, session, ...)
- `GET /api/me` — example protected route, returns the current session
- `GET /health` — liveness check
