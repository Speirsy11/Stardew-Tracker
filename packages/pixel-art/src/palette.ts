import type { PaletteItem, ItemCategory, Difficulty } from './types'
import paletteData from './palette-data.json'

interface PaletteJsonEntry {
  name: string
  id: string
  color: { r: number; g: number; b: number }
  lab: { l: number; a: number; b: number }
  hex: string
  category: string
  difficulty: string
  source: string
  seasonal: boolean
  iconFile: string
}

interface PaletteDataFile {
  version: number
  itemCount: number
  palette: PaletteJsonEntry[]
}

const data = paletteData as PaletteDataFile

let cachedPalette: PaletteItem[] | null = null

export function getFullPalette(): PaletteItem[] {
  if (!cachedPalette) {
    cachedPalette = data.palette.map((entry) => ({
      name: entry.name,
      id: entry.id,
      color: entry.color,
      lab: entry.lab,
      hex: entry.hex,
      category: entry.category as ItemCategory,
      difficulty: entry.difficulty as Difficulty,
      source: entry.source,
      seasonal: entry.seasonal,
      iconFile: entry.iconFile,
    }))
  }
  return cachedPalette
}

const DIFFICULTY_ORDER: Record<Difficulty, number> = {
  easy: 0,
  medium: 1,
  hard: 2,
}

export function filterPalette(
  palette: PaletteItem[],
  categories: ItemCategory[],
  maxDifficulty: Difficulty,
): PaletteItem[] {
  const maxLevel = DIFFICULTY_ORDER[maxDifficulty]
  return palette.filter(
    (item) =>
      categories.includes(item.category) &&
      DIFFICULTY_ORDER[item.difficulty] <= maxLevel,
  )
}
