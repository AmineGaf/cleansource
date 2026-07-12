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

```bash
pnpm install

# backend (needs Postgres — see apps/api/docker-compose.yml)
docker compose -f apps/api/docker-compose.yml up -d
pnpm db:migrate
pnpm dev:api

# mobile (Expo)
pnpm dev:mobile          # then press i / a, or scan the QR with a dev build
```

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
