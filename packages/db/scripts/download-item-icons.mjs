/**
 * Downloads item icons from the Stardew Valley wiki and saves them locally.
 * Output: apps/web/public/icons/items/[Item_Name].png
 *
 * Phase 1: Resolve direct image URLs via MediaWiki API (50 titles per request)
 * Phase 2: Download resolved images in parallel batches
 *
 * Usage:
 *   node scripts/download-item-icons.mjs           # skip already-downloaded
 *   node scripts/download-item-icons.mjs --force   # re-download everything
 */

import { existsSync, mkdirSync, writeFileSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const seedItemsDir = join(__dirname, '..', 'seed-data', 'items')
const outputDir = join(__dirname, '..', '..', '..', 'apps', 'web', 'public', 'icons', 'items')
const WIKI_API = 'https://stardewvalleywiki.com/mediawiki/api.php'
const FORCE = process.argv.includes('--force')

// Titles per MediaWiki API batch (max 50)
const API_BATCH_SIZE = 50
// Concurrent image downloads per batch
const DOWNLOAD_BATCH_SIZE = 5
// Delay between batches (ms) — be gentle on the wiki
const BATCH_DELAY_MS = 500

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// ---------------------------------------------------------------------------
// 1. Collect all unique item names from seed data
// ---------------------------------------------------------------------------
const names = new Set()
for (const file of readdirSync(seedItemsDir)) {
  if (!file.endsWith('.json')) continue
  const data = JSON.parse(readFileSync(join(seedItemsDir, file), 'utf8'))
  const items = Array.isArray(data) ? data : [data]
  for (const item of items) {
    if (item?.name) names.add(item.name)
  }
}

const nameList = [...names].sort()
console.log(`Found ${nameList.length} unique item names across seed data files`)
console.log(`Output directory: ${outputDir}\n`)

mkdirSync(outputDir, { recursive: true })

// ---------------------------------------------------------------------------
// 2. Phase 1 — resolve direct image URLs via MediaWiki API
// ---------------------------------------------------------------------------
console.log('Phase 1: Resolving image URLs via MediaWiki API...')

/** Convert an item name to its wiki File: title (spaces → underscores). */
function toWikiTitle(name) {
  return `File:${name.replace(/\s+/g, '_')}.png`
}

/**
 * Fetch imageinfo for a batch of titles.
 * Returns a map of { wikiTitle → directUrl | null }
 */
async function resolveImageUrls(titleBatch) {
  const titlesParam = titleBatch.join('|')
  const url =
    `${WIKI_API}?action=query` +
    `&titles=${encodeURIComponent(titlesParam)}` +
    `&prop=imageinfo&iiprop=url&format=json`

  const resp = await fetch(url, {
    headers: { 'User-Agent': 'StardewTracker/1.0 (fan project icon cache)' },
  })
  if (!resp.ok) throw new Error(`API request failed: HTTP ${resp.status}`)

  const json = await resp.json()
  const result = {}

  for (const page of Object.values(json.query?.pages ?? {})) {
    // Normalise the title back to underscore form for easy lookup
    const title = page.title?.replace(/\s+/g, '_') ?? ''
    if (page.missing !== undefined || !page.imageinfo?.length) {
      result[title] = null
    } else {
      result[title] = page.imageinfo[0].url
    }
  }
  return result
}

// Batch all names through the API
const resolvedUrls = {} // wikiTitle → direct url
let apiProcessed = 0

for (let i = 0; i < nameList.length; i += API_BATCH_SIZE) {
  const batch = nameList.slice(i, i + API_BATCH_SIZE).map(toWikiTitle)
  try {
    const urls = await resolveImageUrls(batch)
    Object.assign(resolvedUrls, urls)
  } catch (err) {
    console.warn(`\n  API batch failed (items ${i}–${i + batch.length}): ${err.message}`)
  }

  apiProcessed = Math.min(i + API_BATCH_SIZE, nameList.length)
  process.stdout.write(`\r  ${apiProcessed}/${nameList.length} titles resolved...`)

  if (i + API_BATCH_SIZE < nameList.length) {
    await sleep(BATCH_DELAY_MS)
  }
}

const withUrl = nameList.filter((n) => resolvedUrls[toWikiTitle(n)])
const noUrl = nameList.filter((n) => !resolvedUrls[toWikiTitle(n)])
console.log(`\n  Resolved: ${withUrl.length}  |  No wiki image: ${noUrl.length}\n`)

// ---------------------------------------------------------------------------
// 3. Phase 2 — download images
// ---------------------------------------------------------------------------
console.log('Phase 2: Downloading images...')

async function downloadImage(name) {
  const wikiTitle = toWikiTitle(name)
  const directUrl = resolvedUrls[wikiTitle]
  if (!directUrl) return { name, status: 'no_url' }

  // Save using wiki filename convention (spaces → underscores)
  const filename = name.replace(/\s+/g, '_')
  const outPath = join(outputDir, `${filename}.png`)

  if (!FORCE && existsSync(outPath)) {
    return { name, status: 'skipped' }
  }

  try {
    const resp = await fetch(directUrl, {
      headers: { 'User-Agent': 'StardewTracker/1.0 (fan project icon cache)' },
    })
    if (!resp.ok) return { name, status: 'failed', reason: `HTTP ${resp.status}` }

    const contentType = resp.headers.get('content-type') ?? ''
    if (!contentType.startsWith('image/')) {
      return { name, status: 'failed', reason: `unexpected content-type: ${contentType}` }
    }

    writeFileSync(outPath, Buffer.from(await resp.arrayBuffer()))
    return { name, status: 'ok' }
  } catch (err) {
    return { name, status: 'failed', reason: err.message }
  }
}

const results = { ok: 0, skipped: 0, failed: [] }
let dlProcessed = 0

for (let i = 0; i < withUrl.length; i += DOWNLOAD_BATCH_SIZE) {
  const batch = withUrl.slice(i, i + DOWNLOAD_BATCH_SIZE)
  const batchResults = await Promise.all(batch.map(downloadImage))

  for (const r of batchResults) {
    if (r.status === 'ok') results.ok++
    else if (r.status === 'skipped') results.skipped++
    else if (r.status === 'failed') results.failed.push(r)
  }

  dlProcessed = Math.min(i + DOWNLOAD_BATCH_SIZE, withUrl.length)
  process.stdout.write(`\r  ${dlProcessed}/${withUrl.length} downloaded...`)

  if (i + DOWNLOAD_BATCH_SIZE < withUrl.length) {
    await sleep(BATCH_DELAY_MS)
  }
}

// ---------------------------------------------------------------------------
// 4. Summary
// ---------------------------------------------------------------------------
console.log('\n')
console.log('Done!')
console.log(`  Downloaded:              ${results.ok}`)
console.log(`  Skipped (already exist): ${results.skipped}`)
console.log(`  No wiki image found:     ${noUrl.length}`)
console.log(`  Download failures:       ${results.failed.length}`)

if (results.failed.length > 0) {
  console.log('\nDownload failures:')
  for (const f of results.failed.slice(0, 20)) {
    console.log(`  - "${f.name}": ${f.reason}`)
  }
  if (results.failed.length > 20) console.log(`  ... and ${results.failed.length - 20} more`)
}

if (noUrl.length > 0 && noUrl.length <= 30) {
  console.log('\nItems with no wiki image:')
  for (const n of noUrl) console.log(`  - "${n}"`)
}
