import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { join } from 'path'

const prisma = new PrismaClient()

function loadJson<T>(filename: string): T {
  const filePath = join(__dirname, '..', 'seed-data', filename)
  return JSON.parse(readFileSync(filePath, 'utf-8')) as T
}

type CropData = {
  name: string
  seasons: string[]
  category: string
  buyPrice: number
  sellPrice: number
  growDays: number
  regrowDays?: number | null
  artisanProduct?: string | null
  artisanPrice?: number | null
  isForage?: boolean
  imageSlug?: string
}

type NpcData = {
  name: string
  birthdaySeason: string
  birthdayDay: number
  isRomanceable: boolean
  description?: string
  imageSlug?: string
  lovedGifts: string[]
  likedGifts: string[]
  neutralGifts: string[]
  dislikedGifts: string[]
  hatedGifts: string[]
  friendshipRewards: { hearts: number; reward: string }[]
}

type BundleData = {
  room: string
  name: string
  reward: string
  color?: string
  items: { itemName: string; quantity: number; quality: string }[]
}

type EventData = {
  name: string
  type: string
  season: string
  day: number
  description?: string
  npcName?: string
}

type ShippingData = {
  name: string
  category: string
  basePrice: number
  silverPrice?: number | null
  goldPrice?: number | null
  iridiumPrice?: number | null
  season?: string | null
  imageSlug?: string
}

async function main() {
  console.log('🌱 Starting seed...')

  // Clear existing data
  await prisma.userShipping.deleteMany()
  await prisma.userBundle.deleteMany()
  await prisma.userFriendship.deleteMany()
  await prisma.checklistItem.deleteMany()
  await prisma.customChecklist.deleteMany()
  await prisma.bundleItem.deleteMany()
  await prisma.bundle.deleteMany()
  await prisma.friendshipReward.deleteMany()
  await prisma.npc.deleteMany()
  await prisma.crop.deleteMany()
  await prisma.calendarEvent.deleteMany()
  await prisma.shippingItem.deleteMany()

  // Seed crops
  const crops = loadJson<CropData[]>('crops.json')
  for (const crop of crops) {
    await prisma.crop.create({
      data: {
        name: crop.name,
        seasons: crop.seasons as any,
        category: crop.category,
        buyPrice: crop.buyPrice,
        sellPrice: crop.sellPrice,
        growDays: crop.growDays,
        regrowDays: crop.regrowDays ?? null,
        artisanProduct: crop.artisanProduct ?? null,
        artisanPrice: crop.artisanPrice ?? null,
        isForage: crop.isForage ?? false,
        imageSlug: crop.imageSlug ?? null,
      },
    })
  }
  console.log(`  ✅ Seeded ${crops.length} crops`)

  // Seed NPCs
  const npcs = loadJson<NpcData[]>('npcs.json')
  for (const npc of npcs) {
    await prisma.npc.create({
      data: {
        name: npc.name,
        birthdaySeason: npc.birthdaySeason as any,
        birthdayDay: npc.birthdayDay,
        isRomanceable: npc.isRomanceable,
        description: npc.description ?? null,
        imageSlug: npc.imageSlug ?? null,
        lovedGifts: npc.lovedGifts,
        likedGifts: npc.likedGifts,
        neutralGifts: npc.neutralGifts,
        dislikedGifts: npc.dislikedGifts,
        hatedGifts: npc.hatedGifts,
        friendshipRewards: {
          create: npc.friendshipRewards.map((r) => ({
            hearts: r.hearts,
            reward: r.reward,
          })),
        },
      },
    })
  }
  console.log(`  ✅ Seeded ${npcs.length} NPCs`)

  // Seed bundles
  const bundles = loadJson<BundleData[]>('bundles.json')
  for (const bundle of bundles) {
    await prisma.bundle.create({
      data: {
        room: bundle.room,
        name: bundle.name,
        reward: bundle.reward,
        color: bundle.color ?? null,
        items: {
          create: bundle.items.map((item) => ({
            itemName: item.itemName,
            quantity: item.quantity,
            quality: item.quality,
          })),
        },
      },
    })
  }
  console.log(`  ✅ Seeded ${bundles.length} bundles`)

  // Seed calendar events
  const events = loadJson<EventData[]>('events.json')
  for (const event of events) {
    await prisma.calendarEvent.create({
      data: {
        name: event.name,
        type: event.type,
        season: event.season as any,
        day: event.day,
        description: event.description ?? null,
        npcName: event.npcName ?? null,
      },
    })
  }
  console.log(`  ✅ Seeded ${events.length} calendar events`)

  // Seed shipping items
  const shipping = loadJson<ShippingData[]>('shipping.json')
  for (const item of shipping) {
    await prisma.shippingItem.create({
      data: {
        name: item.name,
        category: item.category,
        basePrice: item.basePrice,
        silverPrice: item.silverPrice ?? null,
        goldPrice: item.goldPrice ?? null,
        iridiumPrice: item.iridiumPrice ?? null,
        season: item.season ?? null,
        imageSlug: item.imageSlug ?? null,
      },
    })
  }
  console.log(`  ✅ Seeded ${shipping.length} shipping items`)

  console.log('🌾 Seed complete!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
