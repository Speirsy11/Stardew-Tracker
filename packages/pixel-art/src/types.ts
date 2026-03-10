export interface RGB {
  r: number
  g: number
  b: number
}

export interface LAB {
  l: number
  a: number
  b: number
}

export type Season = 'spring' | 'summer' | 'fall' | 'winter'
export type Difficulty = 'easy' | 'medium' | 'hard'
export type ItemCategory = 'flooring' | 'crafting' | 'artisan' | 'furniture' | 'crop' | 'mineral' | 'misc'
export type DitherMode = 'none' | 'floyd-steinberg' | 'ordered'

export interface PaletteItem {
  name: string
  id: string
  color: RGB
  lab: LAB
  hex: string
  category: ItemCategory
  difficulty: Difficulty
  source: string
  seasonal: boolean
  iconFile: string
}

export interface GridCell {
  item: PaletteItem
  paletteIndex: number
}

export interface GridResult {
  width: number
  height: number
  grid: GridCell[][]
  itemCounts: Record<string, number>
  totalTiles: number
  uniqueItems: number
}

export interface ProcessingOptions {
  width: number
  height: number
  dither: DitherMode
  brightness: number
  contrast: number
  categories: ItemCategory[]
  maxDifficulty: Difficulty
}

export const DEFAULT_OPTIONS: ProcessingOptions = {
  width: 48,
  height: 48,
  dither: 'floyd-steinberg',
  brightness: 0,
  contrast: 0,
  categories: ['flooring', 'crafting', 'artisan', 'furniture', 'crop', 'mineral', 'misc'],
  maxDifficulty: 'hard',
}
