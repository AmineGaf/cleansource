# CleanSource Laundry

On-demand laundry pickup & delivery for Saudi Arabia — Arabic-first (RTL), mirrored to English.

## Workspace

Monorepo managed with **pnpm workspaces + Turborepo**.

```
cleansource/
├── apps/
│   ├── mobile/          # Expo React Native app (iOS + Android)
│   └── api/             # NestJS backend (PostgreSQL + Prisma)
├── packages/
│   ├── tokens/          # Design tokens (colors, radii, spacing, type) + Tailwind preset
│   ├── contracts/       # Shared zod schemas, enums & DTOs (end-to-end types)
│   └── typescript-config/  # Shared tsconfig bases
```

## Getting started

Prerequisites: **Node 20+**, **pnpm 10** (`corepack enable`), **Docker Desktop**.

```bash
pnpm install             # also builds the shared packages (postinstall)

# 1. Database (Postgres in Docker — host port 5433 to avoid clashing with local installs)
docker compose -f apps/api/docker-compose.yml up -d

# 2. API environment + schema + seed data
cp apps/api/.env.example apps/api/.env
pnpm db:migrate          # name the first migration "init" if prompted
pnpm --filter @cleansource/api db:seed

# 3. Run
pnpm dev:api             # → http://localhost:3000/api/v1/health
pnpm dev:mobile          # (second terminal) press i / a, or scan the QR with Expo Go
```

Notes
- **Expo Go version**: the project runs on the latest Expo SDK — keep Expo Go up to date
  (or press `i` to use the iOS simulator, which always installs the matching runtime).
- **Physical device**: set `EXPO_PUBLIC_API_URL` in `apps/mobile/.env` to your machine's LAN IP
  (see `apps/mobile/.env.example`) so the app can reach the API.
- In development the **OTP code is printed in the API logs** instead of being sent by SMS.

## Team workflow

- `main` is protected by CI (typecheck + lint + build on every push/PR).
- Work on feature branches (`feat/…`, `fix/…`) and open PRs into `main`.
- Shared code lives in `packages/` — change contracts/tokens there, never duplicate them in apps.

## Common commands

| Command | What it does |
| --- | --- |
| `pnpm dev:mobile` | Start the Expo dev server |
| `pnpm dev:api` | Start NestJS in watch mode |
| `pnpm typecheck` | Typecheck every workspace |
| `pnpm lint` | Lint every workspace |
| `pnpm db:migrate` | Run Prisma migrations |
| `pnpm db:studio` | Open Prisma Studio |

## Design

The full product design (Arabic iOS + English Android + admin panel) lives in the
Claude Design handoff bundle; the design system is codified in `packages/tokens`.
