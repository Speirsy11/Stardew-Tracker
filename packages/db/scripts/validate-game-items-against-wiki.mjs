import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const seedDataDir = join(__dirname, '..', 'seed-data')
const splitItemsDir = join(seedDataDir, 'items')
const wikiApiBase = 'https://stardewvalleywiki.com/mediawiki/api.php'
const rootCategory = 'Category:Items'

const ignoredWikiPages = new Set([
  'Animal Products Profitability',
  'Artifact Spot',
  'Artifacts',
  'Axes',
  'Boulder',
  'Clothing',
  'Cooking',
  'Dyeing',
  'Equipment',
  'Error Item',
  'Hoes',
  'Joja Community Development Form',
  'Lost Books',
  'Monster Loot',
  'Pans',
  'Pickaxes',
  'Seed Spot',
  'Tailoring',
  'Tools',
  'Trash Cans',
  'Watering Cans',
])

const ignoredTitlePatterns = [/ Profitability$/]

function normalizeTitle(value) {
  return value
    .normalize('NFKC')
    .replace(/[’]/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

function loadLocalItems() {
  return readdirSync(splitItemsDir)
    .filter((filename) => filename.endsWith('.json'))
    .sort((a, b) => a.localeCompare(b))
    .flatMap((filename) => JSON.parse(readFileSync(join(splitItemsDir, filename), 'utf8')))
}

async function fetchJson(url, attempt = 1) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(15000),
    headers: {
      'User-Agent': 'Stardew-Tracker validation script',
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    if (attempt < 3) {
      return fetchJson(url, attempt + 1)
    }

    throw new Error(`Wiki request failed: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

async function fetchCategoryMembers(categoryTitle) {
  const members = []
  let continuation = null

  do {
    const params = new URLSearchParams({
      action: 'query',
      list: 'categorymembers',
      cmtitle: categoryTitle,
      cmlimit: '500',
      format: 'json',
    })

    if (continuation) {
      params.set('cmcontinue', continuation)
    }

    const data = await fetchJson(`${wikiApiBase}?${params.toString()}`)
    members.push(...(data.query?.categorymembers ?? []))
    continuation = data.continue?.cmcontinue ?? null
  } while (continuation)

  return members
}

function shouldIgnoreWikiPage(title) {
  return ignoredWikiPages.has(title) || ignoredTitlePatterns.some((pattern) => pattern.test(title))
}

async function collectWikiPages(categoryTitle, visitedCategories, pageMap, ancestry = []) {
  if (visitedCategories.has(categoryTitle)) {
    return
  }

  visitedCategories.add(categoryTitle)
  const members = await fetchCategoryMembers(categoryTitle)

  for (const member of members) {
    if (member.ns === 14) {
      await collectWikiPages(member.title, visitedCategories, pageMap, [...ancestry, categoryTitle])
      continue
    }

    if (member.ns !== 0) {
      continue
    }

    const existing = pageMap.get(member.title) ?? {
      title: member.title,
      categories: new Set(),
    }

    existing.categories.add(categoryTitle)
    pageMap.set(member.title, existing)
  }
}

async function main() {
  const localItems = loadLocalItems()
  const localByName = new Map(localItems.map((item) => [normalizeTitle(item.name), item]))

  const visitedCategories = new Set()
  const wikiPages = new Map()
  await collectWikiPages(rootCategory, visitedCategories, wikiPages)

  const ignored = []
  const matched = []
  const missing = []

  for (const page of [...wikiPages.values()].sort((a, b) => a.title.localeCompare(b.title))) {
    if (shouldIgnoreWikiPage(page.title)) {
      ignored.push(page.title)
      continue
    }

    const localItem = localByName.get(normalizeTitle(page.title))
    if (localItem) {
      matched.push(page.title)
      continue
    }

    missing.push({
      title: page.title,
      categories: [...page.categories].sort(),
    })
  }

  const wikiNameSet = new Set(matched.map(normalizeTitle))
  const extraLocalItems = localItems
    .filter((item) => !wikiNameSet.has(normalizeTitle(item.name)))
    .map((item) => item.name)
    .sort((a, b) => a.localeCompare(b))

  console.log(`Wiki categories visited: ${visitedCategories.size}`)
  console.log(`Local dataset items: ${localItems.length}`)
  console.log(`Wiki item pages considered: ${matched.length + missing.length}`)
  console.log(`Ignored wiki pages: ${ignored.length}`)
  console.log(`Matched items: ${matched.length}`)
  console.log(`Missing wiki items: ${missing.length}`)
  console.log(`Local-only items: ${extraLocalItems.length}`)

  if (missing.length > 0) {
    console.log('\nMissing wiki items:')
    for (const entry of missing.slice(0, 100)) {
      console.log(`- ${entry.title} [${entry.categories.join(', ')}]`)
    }

    if (missing.length > 100) {
      console.log(`...and ${missing.length - 100} more`)
    }
  }

  if (extraLocalItems.length > 0) {
    console.log('\nLocal-only items (usually generic or list-derived entries):')
    for (const title of extraLocalItems.slice(0, 50)) {
      console.log(`- ${title}`)
    }

    if (extraLocalItems.length > 50) {
      console.log(`...and ${extraLocalItems.length - 50} more`)
    }
  }

  if (missing.length > 0) {
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error('Failed to validate against the Stardew Valley wiki:', error)
  process.exit(1)
})