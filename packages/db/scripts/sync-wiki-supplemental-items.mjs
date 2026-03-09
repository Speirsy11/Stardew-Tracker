import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const seedDataDir = join(__dirname, '..', 'seed-data')
const splitItemsDir = join(seedDataDir, 'items')
const supplementalItemsPath = join(seedDataDir, 'wiki-supplemental-items.json')
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

const furnitureCategories = new Set([
  'Armchairs',
  'Beds',
  'Benches',
  'Bookcases',
  'Chairs',
  'Couches',
  'Decor',
  'Decorative Plants',
  'Dressers',
  'Fireplaces',
  'Fish Tanks',
  'Furniture',
  'Lamps',
  'Movie Posters',
  'Paintings',
  'Portraits',
  'Rugs',
  'Tables',
  'Televisions',
  'Wall hangings',
  'Windows',
])

const craftableCategories = new Set(['Craftable lighting', 'Fences', 'Warp Totems'])
const cropCategories = new Set([
  'Crops',
  'Fall crops',
  'Fruit',
  'Giant Crops',
  'Multi-Seasonal crops',
  'Multiple harvest crops',
  'Spring crops',
  'Summer crops',
  'Vegetables',
  'Winter fruit',
])
const seedCategories = new Set(['Seeds', 'Spring seeds', 'Summer seeds', 'Fall seeds', 'Winter seeds'])
const treeCategories = new Set(['Trees', 'Fruit trees', 'Spring trees', 'Summer trees', 'Fall trees'])

const seasonByCategory = {
  'Spring crops': 'Spring',
  'Spring seeds': 'Spring',
  'Spring trees': 'Spring',
  'Summer crops': 'Summer',
  'Summer seeds': 'Summer',
  'Summer trees': 'Summer',
  'Fall crops': 'Fall',
  'Fall seeds': 'Fall',
  'Fall trees': 'Fall',
  'Winter seeds': 'Winter',
  'Winter fruit': 'Winter',
}

const subcategoryNameMap = {
  'Armchairs': 'Armchair',
  'Beds': 'Bed',
  'Benches': 'Bench',
  'Bookcases': 'Bookcase',
  'Chairs': 'Chair',
  'Couches': 'Couch',
  'Craftable lighting': 'Lighting',
  'Decorative Plants': 'Decorative Plant',
  'Dressers': 'Dresser',
  'Fall seeds': 'Fall Seed',
  'Fall trees': 'Fall Tree',
  'Fish Tanks': 'Fish Tank',
  'Movie Posters': 'Movie Poster',
  'Paintings': 'Painting',
  'Portraits': 'Portrait',
  'Rugs': 'Rug',
  'Saplings': 'Sapling',
  'Spring seeds': 'Spring Seed',
  'Spring trees': 'Spring Tree',
  'Summer seeds': 'Summer Seed',
  'Summer trees': 'Summer Tree',
  'Tables': 'Table',
  'Televisions': 'Television',
  'Trees': 'Tree',
  'Wall hangings': 'Wall Hanging',
  'Warp Totems': 'Warp Totem',
  'Windows': 'Window',
  'Winter seeds': 'Winter Seed',
}

function normalizeTitle(value) {
  return value
    .normalize('NFKC')
    .replace(/[’]/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function item(data) {
  const { slug, ...rest } = data
  return {
    slug: slug ?? slugify(rest.name),
    ...rest,
  }
}

function createUniqueSlug(name, mapping, usedSlugs) {
  const suffixParts = [mapping.subcategory, mapping.category].filter(Boolean).map((value) => slugify(value))
  const candidates = [slugify(name), ...suffixParts.map((suffix) => `${slugify(name)}-${suffix}`)]

  for (const candidate of candidates) {
    if (candidate && !usedSlugs.has(candidate)) {
      usedSlugs.add(candidate)
      return candidate
    }
  }

  let counter = 2
  const base = candidates[candidates.length - 1] || slugify(name)

  while (usedSlugs.has(`${base}-${counter}`)) {
    counter += 1
  }

  const uniqueSlug = `${base}-${counter}`
  usedSlugs.add(uniqueSlug)
  return uniqueSlug
}

function prettifyCategory(category) {
  const clean = category.replace(/^Category:/, '')
  return subcategoryNameMap[clean] ?? clean
}

function shouldIgnoreWikiPage(title) {
  return ignoredWikiPages.has(title) || ignoredTitlePatterns.some((pattern) => pattern.test(title))
}

function loadCurrentSupplementalNames() {
  if (!existsSync(supplementalItemsPath)) {
    return new Set()
  }

  const supplementalItems = JSON.parse(readFileSync(supplementalItemsPath, 'utf8'))
  return new Set(supplementalItems.map((entry) => normalizeTitle(entry.name)))
}

function loadCuratedLocalItems() {
  const supplementalNames = loadCurrentSupplementalNames()

  return readdirSync(splitItemsDir)
    .filter((filename) => filename.endsWith('.json'))
    .sort((a, b) => a.localeCompare(b))
    .flatMap((filename) => JSON.parse(readFileSync(join(splitItemsDir, filename), 'utf8')))
    .filter((entry) => !supplementalNames.has(normalizeTitle(entry.name)))
}

async function fetchJson(url, attempt = 1) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(15000),
    headers: {
      'User-Agent': 'Stardew-Tracker supplemental item sync',
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

async function collectWikiPages(categoryTitle, visitedCategories, pageMap) {
  if (visitedCategories.has(categoryTitle)) {
    return
  }

  visitedCategories.add(categoryTitle)
  const members = await fetchCategoryMembers(categoryTitle)

  for (const member of members) {
    if (member.ns === 14) {
      await collectWikiPages(member.title, visitedCategories, pageMap)
      continue
    }

    if (member.ns !== 0) {
      continue
    }

    const existing = pageMap.get(member.title) ?? {
      title: member.title,
      categories: new Set(),
    }

    existing.categories.add(member.title === 'Bait' ? 'Category:Bait' : categoryTitle)
    pageMap.set(member.title, existing)
  }
}

function firstCategory(categoryNames, allowed) {
  return categoryNames.find((category) => allowed.has(category))
}

function firstSeason(categoryNames) {
  return categoryNames.map((category) => seasonByCategory[category]).find(Boolean) ?? null
}

function chooseMapping(title, categories) {
  const categoryNames = categories.map((category) => category.replace(/^Category:/, ''))
  const season = firstSeason(categoryNames)
  const furnitureCategory = firstCategory(categoryNames, furnitureCategories)
  const craftableCategory = firstCategory(categoryNames, craftableCategories)
  const seedCategory = firstCategory(categoryNames, seedCategories)
  const treeCategory = firstCategory(categoryNames, treeCategories)
  const cropCategory = firstCategory(categoryNames, cropCategories)

  if (furnitureCategory) {
    return {
      category: 'Furniture',
      subcategory: prettifyCategory(`Category:${furnitureCategory}`),
      season,
      obtainMethod: 'Furniture item listed on the Stardew Valley Wiki; obtain through shops, catalogs, festivals, rewards, or special events.',
      location: 'Varies',
    }
  }

  if (craftableCategory) {
    return {
      category: 'Craftable Item',
      subcategory: prettifyCategory(`Category:${craftableCategory}`),
      season,
      obtainMethod: 'Craftable wiki item; acquire the recipe, then craft it or obtain it from related rewards.',
      location: 'Varies',
    }
  }

  if (seedCategory) {
    return {
      category: 'Seed',
      subcategory: prettifyCategory(`Category:${seedCategory}`),
      season,
      obtainMethod: 'Seed item listed on the Stardew Valley Wiki; commonly purchased in-season or obtained from special sources.',
      location: 'Shops and special sources',
    }
  }

  if (categoryNames.includes('Saplings')) {
    return {
      category: 'Sapling',
      subcategory: 'Sapling',
      season,
      obtainMethod: 'Sapling item listed on the Stardew Valley Wiki; usually purchased and planted to grow a fruit tree.',
      location: 'Pierre\'s General Store or other special sources',
    }
  }

  if (treeCategory) {
    return {
      category: 'Tree',
      subcategory: prettifyCategory(`Category:${treeCategory}`),
      season,
      obtainMethod: 'Tree entry listed on the Stardew Valley Wiki.',
      location: 'Farm or planted locations',
      season,
    }
  }

  if (categoryNames.includes('Artisan Goods')) {
    return {
      category: 'Artisan Good',
      subcategory: 'Wiki Supplemental',
      season,
      obtainMethod: 'Artisan good listed on the Stardew Valley Wiki.',
      location: 'Varies',
    }
  }

  if (categoryNames.includes('Artifacts') || categoryNames.includes('Field Office donations')) {
    return {
      category: 'Artifact',
      subcategory: categoryNames.includes('Field Office donations') ? 'Field Office Donation' : 'Artifact',
      season,
      obtainMethod: 'Artifact listed on the Stardew Valley Wiki.',
      location: 'Varies',
    }
  }

  if (categoryNames.includes('Resources') || categoryNames.includes('Monster Loot')) {
    return {
      category: 'Resource',
      subcategory: categoryNames.includes('Monster Loot') ? 'Monster Loot' : 'Resource',
      season,
      obtainMethod: 'Resource item listed on the Stardew Valley Wiki.',
      location: 'Varies',
    }
  }

  if (categoryNames.includes('Cooking')) {
    return {
      category: 'Cooked Food',
      subcategory: 'Wiki Supplemental',
      season,
      obtainMethod: 'Food item listed on the Stardew Valley Wiki.',
      location: 'Kitchen, shops, or special sources',
    }
  }

  if (categoryNames.includes('Fish')) {
    return {
      category: 'Fish',
      subcategory: 'Wiki Supplemental',
      season,
      obtainMethod: 'Fish entry listed on the Stardew Valley Wiki.',
      location: 'Varies',
    }
  }

  if (categoryNames.includes('Bait')) {
    return {
      category: 'Bait',
      subcategory: 'Bait',
      season,
      obtainMethod: 'Bait item listed on the Stardew Valley Wiki.',
      location: 'Fishing-related sources',
    }
  }

  if (categoryNames.includes('Fishing Tackle')) {
    return {
      category: 'Fishing Tackle',
      subcategory: 'Fishing Tackle',
      season,
      obtainMethod: 'Fishing tackle listed on the Stardew Valley Wiki.',
      location: 'Fishing-related sources',
    }
  }

  if (categoryNames.includes('Fertilizer')) {
    return {
      category: 'Fertilizer',
      subcategory: 'Fertilizer',
      season,
      obtainMethod: 'Fertilizer item listed on the Stardew Valley Wiki.',
      location: 'Crafting or shops',
    }
  }

  if (categoryNames.includes('Tools')) {
    return {
      category: 'Tool',
      subcategory: 'Wiki Supplemental',
      season,
      obtainMethod: 'Tool entry listed on the Stardew Valley Wiki.',
      location: 'Varies',
    }
  }

  if (categoryNames.includes('Footwear')) {
    return {
      category: 'Footwear',
      subcategory: 'Wiki Supplemental',
      season,
      obtainMethod: 'Footwear listed on the Stardew Valley Wiki.',
      location: 'Varies',
    }
  }

  if (categoryNames.includes('Hats')) {
    return {
      category: 'Hat',
      subcategory: 'Wiki Supplemental',
      season,
      obtainMethod: 'Hat listed on the Stardew Valley Wiki.',
      location: 'Varies',
    }
  }

  if (categoryNames.includes('Rings')) {
    return {
      category: 'Ring',
      subcategory: 'Wiki Supplemental',
      season,
      obtainMethod: 'Ring listed on the Stardew Valley Wiki.',
      location: 'Varies',
    }
  }

  if (cropCategory || title.endsWith(' Seeds') || title.endsWith(' Starter')) {
    return {
      category: cropCategory ? 'Crop' : 'Seed',
      subcategory: cropCategory ? prettifyCategory(`Category:${cropCategory}`) : 'Seed',
      season,
      obtainMethod: 'Crop-related wiki item.',
      location: 'Farm and shops',
      cropName: cropCategory ? title : null,
    }
  }

  return {
    category: 'Special Item',
    subcategory: 'Wiki Supplemental',
    season,
    obtainMethod: 'Item listed on the Stardew Valley Wiki.',
    location: 'Varies',
  }
}

async function main() {
  const localItems = loadCuratedLocalItems()
  const localByName = new Map(localItems.map((entry) => [normalizeTitle(entry.name), entry]))
  const usedSlugs = new Set(localItems.map((entry) => entry.slug))
  const visitedCategories = new Set()
  const wikiPages = new Map()

  await collectWikiPages(rootCategory, visitedCategories, wikiPages)

  const supplementalItems = []

  for (const page of [...wikiPages.values()].sort((a, b) => a.title.localeCompare(b.title))) {
    if (shouldIgnoreWikiPage(page.title)) {
      continue
    }

    if (localByName.has(normalizeTitle(page.title))) {
      continue
    }

    const mapping = chooseMapping(page.title, [...page.categories].sort())
    supplementalItems.push(
      item({
        name: page.title,
        slug: createUniqueSlug(page.title, mapping, usedSlugs),
        category: mapping.category,
        subcategory: mapping.subcategory ?? null,
        description: `Wiki-derived supplemental item entry for ${page.title}.`,
        obtainMethod: mapping.obtainMethod,
        season: mapping.season ?? null,
        location: mapping.location ?? null,
        cropName: mapping.cropName ?? null,
      }),
    )
  }

  const uniqueNames = new Set()
  const uniqueSlugs = new Set()

  for (const entry of supplementalItems) {
    if (uniqueNames.has(entry.name)) {
      throw new Error(`Duplicate supplemental item name: ${entry.name}`)
    }
    if (uniqueSlugs.has(entry.slug)) {
      throw new Error(`Duplicate supplemental item slug: ${entry.slug}`)
    }
    uniqueNames.add(entry.name)
    uniqueSlugs.add(entry.slug)
  }

  writeFileSync(supplementalItemsPath, `${JSON.stringify(supplementalItems, null, 2)}\n`)

  const countsByCategory = Object.fromEntries(
    [...supplementalItems.reduce((map, entry) => {
      map.set(entry.category, (map.get(entry.category) ?? 0) + 1)
      return map
    }, new Map()).entries()].sort((a, b) => a[0].localeCompare(b[0]))
  )

  console.log(`Wiki categories visited: ${visitedCategories.size}`)
  console.log(`Generated ${supplementalItems.length} supplemental wiki items.`)
  console.log(JSON.stringify(countsByCategory, null, 2))
}

main().catch((error) => {
  console.error('Failed to sync wiki supplemental items:', error)
  process.exit(1)
})
