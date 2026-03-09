# Stardew Valley Tracker — Implementation Plan

## Data Strategy

**Approach: Curated Static JSON Seed Files**

Rather than calling the Stardew Valley Wiki's MediaWiki API at runtime (rate-limited, slow, fragile), or depending on unmaintained third-party APIs/repos, we will:

1. Author hand-curated JSON seed files based on wiki data (public, community-maintained)
2. Store them under `packages/db/seed-data/`
3. Run a one-time seed script to load them into PostgreSQL
4. All runtime queries hit our own database — no external dependencies

This gives us offline capability, full data control, and consistent performance.
The wiki (stardewvalleywiki.com) is the canonical source; data is authored for v1.6.

**Seed Data Files:**
- `crops.json` — All crops: season, buy price, sell price, growth/regrow days, artisan variants, category
- `npcs.json` — All 12+ giftable NPCs: birthday, loved/liked/neutral/disliked/hated gifts, friendship milestone rewards
- `bundles.json` — All 6 Community Center rooms with every bundle and required items
- `events.json` — All festivals + all NPC birthdays as calendar events (season + day)
- `shipping.json` — All 145 items in the shipping collection with base/silver/gold/iridium prices

---

## Monorepo Structure (Turborepo + pnpm)

```
stardew-tracker/
├── apps/
│   └── web/                          # Next.js 14 App Router (TypeScript)
│       ├── app/
│       │   ├── layout.tsx
│       │   ├── page.tsx              # Dashboard
│       │   ├── shipping/page.tsx
│       │   ├── community-centre/page.tsx
│       │   ├── checklists/page.tsx
│       │   ├── calendar/page.tsx
│       │   ├── friendship/page.tsx
│       │   ├── crops/page.tsx
│       │   └── api/                  # Route handlers
│       │       ├── auth/[...nextauth]/route.ts
│       │       ├── checklists/route.ts
│       │       ├── progress/route.ts
│       │       └── upload/route.ts
│       ├── components/
│       │   ├── ui/                   # shadcn/ui primitives
│       │   ├── layout/               # Sidebar, Header, SeasonBadge
│       │   ├── shipping/             # ShippingGrid, ShippingItem
│       │   ├── bundles/              # RoomCard, BundleCard, BundleItem
│       │   ├── calendar/             # CalendarView, EventCard, NextEvents
│       │   ├── friendship/           # NpcCard, GiftList, HeartMilestones
│       │   ├── crops/                # CropTable, CropCard, SeasonTabs
│       │   └── checklists/           # MarkdownUploader, ChecklistView
│       ├── lib/
│       │   ├── auth.ts               # NextAuth config
│       │   ├── db.ts                 # Prisma client singleton
│       │   └── utils.ts
│       └── public/
│           └── images/               # Crop/NPC pixel art icons
│
├── packages/
│   └── db/
│       ├── prisma/
│       │   ├── schema.prisma
│       │   ├── migrations/
│       │   └── seed.ts               # Reads JSON → inserts rows
│       └── seed-data/
│           ├── crops.json
│           ├── npcs.json
│           ├── bundles.json
│           ├── events.json
│           └── shipping.json
│
├── docker-compose.yml                # Local PostgreSQL
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

---

## Database Schema (Prisma)

### Static Game Data

```prisma
model Crop {
  id              Int      @id @default(autoincrement())
  name            String   @unique
  season          Season[]
  category        String   // vegetable, fruit, flower, etc.
  buyPrice        Int
  sellPrice       Int      // base quality
  growDays        Int
  regrowDays      Int?     // null if no regrowth
  artisanProduct  String?  // e.g. "Wine", "Juice", "Pickles"
  artisanPrice    Int?
}

model Npc {
  id              Int              @id @default(autoincrement())
  name            String           @unique
  birthdaySeason  Season
  birthdayDay     Int
  lovedGifts      String[]
  likedGifts      String[]
  neutralGifts    String[]
  dislikedGifts   String[]
  hatedGifts      String[]
  friendshipRewards FriendshipReward[]
}

model FriendshipReward {
  id      Int    @id @default(autoincrement())
  npcId   Int
  npc     Npc    @relation(fields: [npcId], references: [id])
  hearts  Int    // 2, 4, 6, 8, 10, 14 (for spouse)
  reward  String // description of the reward
}

model Bundle {
  id          Int          @id @default(autoincrement())
  room        String       // Pantry, Crafts Room, Fish Tank, etc.
  name        String
  reward      String
  goldReward  Int?
  items       BundleItem[]
}

model BundleItem {
  id        Int     @id @default(autoincrement())
  bundleId  Int
  bundle    Bundle  @relation(fields: [bundleId], references: [id])
  itemName  String
  quantity  Int
  quality   String  // Normal, Silver, Gold
}

model CalendarEvent {
  id          Int    @id @default(autoincrement())
  name        String
  type        String // festival, birthday
  season      Season
  day         Int
  description String?
}

model ShippingItem {
  id            Int    @id @default(autoincrement())
  name          String @unique
  category      String
  basePrice     Int
  silverPrice   Int?
  goldPrice     Int?
  iridiumPrice  Int?
}

enum Season {
  Spring
  Summer
  Fall
  Winter
}
```

### User / Progress Data

```prisma
model User {
  id               String            @id @default(cuid())
  email            String            @unique
  name             String?
  password         String?           // hashed, for credentials auth
  shippingProgress UserShipping[]
  bundleProgress   UserBundle[]
  friendships      UserFriendship[]
  checklists       CustomChecklist[]
  accounts         Account[]
  sessions         Session[]
}

model UserShipping {
  id        Int          @id @default(autoincrement())
  userId    String
  user      User         @relation(fields: [userId], references: [id])
  itemId    Int
  item      ShippingItem @relation(fields: [itemId], references: [id])
  shipped   Boolean      @default(false)
  @@unique([userId, itemId])
}

model UserBundle {
  id           Int        @id @default(autoincrement())
  userId       String
  user         User       @relation(fields: [userId], references: [id])
  bundleItemId Int
  bundleItem   BundleItem @relation(fields: [bundleItemId], references: [id])
  completed    Boolean    @default(false)
  @@unique([userId, bundleItemId])
}

model UserFriendship {
  id      Int    @id @default(autoincrement())
  userId  String
  user    User   @relation(fields: [userId], references: [id])
  npcId   Int
  npc     Npc    @relation(fields: [npcId], references: [id])
  hearts  Int    @default(0)
  @@unique([userId, npcId])
}

model CustomChecklist {
  id          String            @id @default(cuid())
  userId      String
  user        User              @relation(fields: [userId], references: [id])
  title       String
  rawMarkdown String
  items       ChecklistItem[]
  createdAt   DateTime          @default(now())
}

model ChecklistItem {
  id          String          @id @default(cuid())
  checklistId String
  checklist   CustomChecklist @relation(fields: [checklistId], references: [id])
  text        String
  depth       Int             @default(0)
  checked     Boolean         @default(false)
  sortOrder   Int
}

// NextAuth required tables
model Account { ... }
model Session { ... }
model VerificationToken { ... }
```

---

## Pages & Features

### 1. `/` — Dashboard
- Overview cards: shipping % complete, bundles %, active season
- Quick-jump links to each feature
- Current in-game season selector (persisted to user prefs)

### 2. `/shipping` — Shipping Collection Checklist
- Grid of all shippable items, grouped by category (Crops, Artisan, Fish, Forage, etc.)
- Each item shows base/silver/gold/iridium sell price
- Checkbox per item, saved to `UserShipping` table (or localStorage if not logged in)
- Filter bar: by category, by season, hide completed
- Progress bar per category + overall

### 3. `/community-centre` — Bundle Tracker
- 6 room cards (Pantry, Crafts Room, Fish Tank, Boiler Room, Bulletin Board, Vault)
- Each room expands to show its bundles
- Each bundle shows required items with quantity + quality
- Check off individual items, saved to `UserBundle`
- Visual "completed" state per bundle and per room
- Reward displayed on completion

### 4. `/checklists` — Custom Checklists
- Upload a `.md` file → parsed into a structured checklist UI
- Parser extracts: headings (become sections), `- [ ]` / `- [x]` items (become checkboxes), nested items (indented)
- Saved to `CustomChecklist` + `ChecklistItem` tables (requires login)
- Can manage multiple saved checklists
- Toggle items checked/unchecked; state persisted

### 5. `/calendar` — Events Calendar
- Visual calendar grid showing all 4 seasons (28 days each)
- Events shown as coloured chips on day cells: festivals (yellow), birthdays (pink)
- **Date Picker**: Input current in-game date (season + day) → highlights it on calendar + shows **"Next 3 Events"** panel
- Event detail sidebar on click: description, gift ideas (for birthdays), activities (for festivals)
- Toggle: show only birthdays / only festivals / all

### 6. `/friendship` — NPC Friendship Tracker
- Card grid of all 30 giftable NPCs with portrait placeholder
- Each card shows: name, birthday, current heart level (slider input, saved to `UserFriendship`)
- Expandable section: **Best gifts** (loved gifts with sell/buy price context)
- Expandable section: **Heart milestones** — what you unlock at 2♥, 4♥, 6♥, 8♥, 10♥ (14♥ for spouse)
- Filter: show only romanceable / show only friendable / search by name

### 7. `/crops` — Best Crops by Season
- Season tabs: Spring / Summer / Fall / (Winter — limited)
- Table/card view of all crops that season, sortable by:
  - Base sell price
  - Total profit (accounting for seed cost over season)
  - Artisan product price
  - Gold/day profitability (sell price / grow days)
- Each crop card: name, seed buy price, sell price (base/silver/gold/iridium), regrow info, artisan product if applicable
- Toggle: show artisan product prices overlay

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 14 (App Router) | SSR + API routes in one |
| Language | TypeScript | Type safety |
| Monorepo | Turborepo + pnpm | Fast, well-supported |
| Database | PostgreSQL | Relational, Prisma support |
| ORM | Prisma | Type-safe queries, migrations |
| Auth | NextAuth.js v4 | Credentials + GitHub OAuth |
| Styling | Tailwind CSS | Utility-first, fast |
| Components | shadcn/ui | Accessible, unstyled base |
| Markdown | `remark` + `unified` | Parse uploaded MD checklists |
| Local DB | Docker Compose | One-command local postgres |

---

## Local Development Setup

```bash
# 1. Start local postgres
pnpm db:up          # docker compose up -d

# 2. Run migrations
pnpm db:migrate

# 3. Seed game data from JSON files
pnpm db:seed

# 4. Start dev server
pnpm dev
```

Scripts provided:
- `pnpm db:up` — `docker compose up -d`
- `pnpm db:down` — `docker compose down`
- `pnpm db:migrate` — `prisma migrate dev`
- `pnpm db:seed` — `ts-node packages/db/prisma/seed.ts`
- `pnpm db:reset` — drop + migrate + seed
- `pnpm db:studio` — `prisma studio`

---

## UI Design Direction

- **Theme**: Warm Stardew palette — earthy browns, soft greens, golden yellows, sky blues
- **Font**: Pixel-style heading font (e.g. `Press Start 2P` from Google Fonts) for headers; clean sans-serif for body
- **Sidebar nav**: Season-coloured icons for each page
- **Cards**: Rounded, slightly parchment-textured background
- **Checkboxes**: Custom animated checkboxes with a ✓ pop animation
- **Season badges**: Colour-coded chips (Spring=green, Summer=yellow, Fall=orange, Winter=blue)
- **Responsive**: Mobile-first grid layouts, collapsible sidebar on mobile

---

## Auth Flow

- **No account required**: Shipping, bundle, and friendship progress saved to `localStorage`
- **With account**: Progress synced to database; custom checklists require account
- **Sign up / Sign in**: Credentials (email + password) or GitHub OAuth
- **Session**: JWT stored in cookie via NextAuth

---

## Sequence of Implementation

1. Monorepo scaffold (Turborepo + pnpm workspaces)
2. Docker Compose + Prisma schema + migrations
3. Seed data JSON files (all game data)
4. Seed script
5. Next.js app setup (Tailwind, shadcn/ui, layout, nav)
6. Auth (NextAuth)
7. Page: Shipping checklist
8. Page: Community Centre
9. Page: Calendar
10. Page: Friendship
11. Page: Crops
12. Page: Custom Checklists (MD upload + parser)
13. Dashboard overview page
14. Polish: animations, responsive, theming
