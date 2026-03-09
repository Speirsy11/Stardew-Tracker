# 🌾 Stardew Tracker

A full-featured Stardew Valley companion app built with Next.js 15, Turborepo, TypeScript, and PostgreSQL.

## Features

| Page | Description |
|---|---|
| **Shipping** | Checklist of all shippable items with quality prices and category filters |
| **Community Centre** | Bundle tracker for all 6 rooms with per-item checkboxes |
| **Checklists** | Upload any `.md` file and it becomes an interactive GUI checklist |
| **Calendar** | All festivals & birthdays by season; enter current date to see next 3 events |
| **Friendship** | Every villager's loved gifts, liked gifts, and heart milestone rewards |
| **Best Crops** | Crop profitability by season with artisan product prices and sort/filter |

## Stack

- **Framework**: Next.js 15 (App Router)
- **Monorepo**: Turborepo + pnpm workspaces
- **Database**: PostgreSQL via Docker Compose
- **ORM**: Prisma
- **Auth**: NextAuth.js (credentials + GitHub OAuth)
- **Styling**: Tailwind CSS with a Stardew-inspired palette

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm 9+
- Docker (for local PostgreSQL)

### Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Copy env vars
cp .env.example apps/web/.env.local
cp .env.example packages/db/.env
# Edit .env files with your values

# 3. Start local PostgreSQL
pnpm db:up

# 4. Run migrations
cd packages/db && pnpm db:migrate

# 5. Seed game data
pnpm db:seed

# 6. Start the dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Database Commands

```bash
pnpm db:up       # Start Docker PostgreSQL
pnpm db:down     # Stop Docker PostgreSQL
pnpm db:migrate  # Run Prisma migrations
pnpm db:seed     # Seed all game data from JSON files
pnpm db:reset    # Drop DB, re-migrate, re-seed
pnpm db:studio   # Open Prisma Studio (DB GUI)
```

## Environment Variables

Copy `.env.example` to `apps/web/.env.local` and `packages/db/.env`:

```env
DATABASE_URL="postgresql://stardew:stardew@localhost:5432/stardew_tracker"
NEXTAUTH_SECRET="generate-a-random-secret"
NEXTAUTH_URL="http://localhost:3000"
GITHUB_CLIENT_ID=""        # optional: for GitHub OAuth
GITHUB_CLIENT_SECRET=""    # optional: for GitHub OAuth
```

Generate a secret: `openssl rand -base64 32`

## Data Source

All game data is hand-curated from the [Stardew Valley Wiki](https://stardewvalleywiki.com) (v1.6) and stored as JSON seed files in `packages/db/seed-data/`. No external API calls are made at runtime.

## Monorepo Structure

```
stardew-tracker/
├── apps/
│   └── web/          # Next.js app
├── packages/
│   └── db/           # Prisma schema + seed data
├── docker-compose.yml
└── turbo.json
```
