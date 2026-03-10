import type { RGB, LAB, PaletteItem, GridCell, GridResult, ProcessingOptions, DitherMode } from './types'
import { rgbToLab, labToRgb, findClosestPaletteIndex, clampLab } from './color'
import { getFullPalette, filterPalette } from './palette'
import { DEFAULT_OPTIONS } from './types'

/**
 * Read pixel data from a canvas-resized image.
 * Returns a flat array of RGB values in row-major order.
 */
function getPixelData(
  imageData: ImageData,
  width: number,
  height: number,
  brightness: number,
  contrast: number,
): RGB[][] {
  const pixels: RGB[][] = []
  const data = imageData.data

  // Contrast/brightness adjustments
  const contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast))

  for (let y = 0; y < height; y++) {
    const row: RGB[] = []
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4
      let r = data[idx]
      let g = data[idx + 1]
      let b = data[idx + 2]

      // Apply brightness
      r = Math.max(0, Math.min(255, r + brightness))
      g = Math.max(0, Math.min(255, g + brightness))
      b = Math.max(0, Math.min(255, b + brightness))

      // Apply contrast
      r = Math.max(0, Math.min(255, Math.round(contrastFactor * (r - 128) + 128)))
      g = Math.max(0, Math.min(255, Math.round(contrastFactor * (g - 128) + 128)))
      b = Math.max(0, Math.min(255, Math.round(contrastFactor * (b - 128) + 128)))

      row.push({ r, g, b })
    }
    pixels.push(row)
  }
  return pixels
}

/**
 * 4x4 Bayer threshold matrix for ordered dithering.
 */
const BAYER_4X4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
]

/**
 * Convert an image to a grid of palette items.
 * This is the core processing pipeline.
 */
export function processImage(
  imageData: ImageData,
  width: number,
  height: number,
  options: Partial<ProcessingOptions> = {},
): GridResult {
  const opts = { ...DEFAULT_OPTIONS, ...options, width, height }

  // Get filtered palette
  const fullPalette = getFullPalette()
  const palette = filterPalette(fullPalette, opts.categories, opts.maxDifficulty)

  if (palette.length === 0) {
    throw new Error('No items match the selected filters. Try expanding your category or difficulty selection.')
  }

  // Pre-compute palette LAB values
  const paletteLabs: LAB[] = palette.map((item) => item.lab)

  // Get pixel data with adjustments
  const pixels = getPixelData(imageData, width, height, opts.brightness, opts.contrast)

  // Convert to LAB for processing
  const labPixels: LAB[][] = pixels.map((row) =>
    row.map((px) => rgbToLab(px)),
  )

  // Apply dithering and color matching
  const grid: GridCell[][] = applyDithering(
    labPixels,
    width,
    height,
    palette,
    paletteLabs,
    opts.dither,
  )

  // Compute item counts
  const itemCounts: Record<string, number> = {}
  let uniqueSet = new Set<string>()

  for (const row of grid) {
    for (const cell of row) {
      const name = cell.item.name
      itemCounts[name] = (itemCounts[name] || 0) + 1
      uniqueSet.add(name)
    }
  }

  return {
    width,
    height,
    grid,
    itemCounts,
    totalTiles: width * height,
    uniqueItems: uniqueSet.size,
  }
}

function applyDithering(
  labPixels: LAB[][],
  width: number,
  height: number,
  palette: PaletteItem[],
  paletteLabs: LAB[],
  mode: DitherMode,
): GridCell[][] {
  switch (mode) {
    case 'floyd-steinberg':
      return floydSteinbergDither(labPixels, width, height, palette, paletteLabs)
    case 'ordered':
      return orderedDither(labPixels, width, height, palette, paletteLabs)
    case 'none':
    default:
      return noDither(labPixels, width, height, palette, paletteLabs)
  }
}

function noDither(
  labPixels: LAB[][],
  width: number,
  height: number,
  palette: PaletteItem[],
  paletteLabs: LAB[],
): GridCell[][] {
  const grid: GridCell[][] = []
  for (let y = 0; y < height; y++) {
    const row: GridCell[] = []
    for (let x = 0; x < width; x++) {
      const idx = findClosestPaletteIndex(labPixels[y][x], paletteLabs)
      row.push({ item: palette[idx], paletteIndex: idx })
    }
    grid.push(row)
  }
  return grid
}

function floydSteinbergDither(
  labPixels: LAB[][],
  width: number,
  height: number,
  palette: PaletteItem[],
  paletteLabs: LAB[],
): GridCell[][] {
  // Work on a mutable copy of LAB values
  const working: LAB[][] = labPixels.map((row) =>
    row.map((px) => ({ ...px })),
  )

  const grid: GridCell[][] = []

  for (let y = 0; y < height; y++) {
    const row: GridCell[] = []
    for (let x = 0; x < width; x++) {
      const current = working[y][x]
      const idx = findClosestPaletteIndex(current, paletteLabs)
      const matched = paletteLabs[idx]

      row.push({ item: palette[idx], paletteIndex: idx })

      // Compute error
      const errL = current.l - matched.l
      const errA = current.a - matched.a
      const errB = current.b - matched.b

      // Distribute error to neighbors
      const distribute = (dy: number, dx: number, factor: number) => {
        const ny = y + dy
        const nx = x + dx
        if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
          working[ny][nx] = clampLab({
            l: working[ny][nx].l + errL * factor,
            a: working[ny][nx].a + errA * factor,
            b: working[ny][nx].b + errB * factor,
          })
        }
      }

      distribute(0, 1, 7 / 16)  // right
      distribute(1, -1, 3 / 16) // bottom-left
      distribute(1, 0, 5 / 16)  // bottom
      distribute(1, 1, 1 / 16)  // bottom-right
    }
    grid.push(row)
  }

  return grid
}

function orderedDither(
  labPixels: LAB[][],
  width: number,
  height: number,
  palette: PaletteItem[],
  paletteLabs: LAB[],
): GridCell[][] {
  const grid: GridCell[][] = []
  const matrixSize = 4
  const spread = 20 // How much the threshold shifts colors in LAB space

  for (let y = 0; y < height; y++) {
    const row: GridCell[] = []
    for (let x = 0; x < width; x++) {
      const threshold = (BAYER_4X4[y % matrixSize][x % matrixSize] / 16 - 0.5) * spread
      const adjusted = clampLab({
        l: labPixels[y][x].l + threshold,
        a: labPixels[y][x].a + threshold * 0.3,
        b: labPixels[y][x].b + threshold * 0.3,
      })
      const idx = findClosestPaletteIndex(adjusted, paletteLabs)
      row.push({ item: palette[idx], paletteIndex: idx })
    }
    grid.push(row)
  }

  return grid
}

/**
 * Resize an image using a canvas element and return the pixel data.
 * Must be called from a browser environment.
 */
export function resizeImage(
  source: HTMLImageElement | HTMLCanvasElement,
  targetWidth: number,
  targetHeight: number,
): ImageData {
  const canvas = document.createElement('canvas')
  canvas.width = targetWidth
  canvas.height = targetHeight
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(source, 0, 0, targetWidth, targetHeight)
  return ctx.getImageData(0, 0, targetWidth, targetHeight)
}

/**
 * Render a grid result onto a canvas as colored blocks.
 */
export function renderGridToCanvas(
  grid: GridResult,
  canvas: HTMLCanvasElement,
  tileSize: number = 8,
  showGridLines: boolean = false,
): void {
  const w = grid.width * tileSize
  const h = grid.height * tileSize
  canvas.width = w
  canvas.height = h

  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, w, h)

  for (let y = 0; y < grid.height; y++) {
    for (let x = 0; x < grid.width; x++) {
      const cell = grid.grid[y][x]
      ctx.fillStyle = cell.item.hex
      ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize)
    }
  }

  if (showGridLines && tileSize >= 4) {
    ctx.strokeStyle = 'rgba(0,0,0,0.15)'
    ctx.lineWidth = 0.5
    for (let x = 0; x <= grid.width; x++) {
      ctx.beginPath()
      ctx.moveTo(x * tileSize, 0)
      ctx.lineTo(x * tileSize, h)
      ctx.stroke()
    }
    for (let y = 0; y <= grid.height; y++) {
      ctx.beginPath()
      ctx.moveTo(0, y * tileSize)
      ctx.lineTo(w, y * tileSize)
      ctx.stroke()
    }
  }
}

/**
 * Export the grid canvas as a downloadable PNG blob.
 */
export function exportGridAsPng(
  grid: GridResult,
  tileSize: number = 16,
  showGridLines: boolean = true,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    renderGridToCanvas(grid, canvas, tileSize, showGridLines)
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('Failed to generate PNG'))
    }, 'image/png')
  })
}

/**
 * Generate a shopping list as CSV string.
 */
export function exportShoppingListCsv(grid: GridResult): string {
  const palette = getFullPalette()
  const lines: string[] = ['Item,Quantity,Category,Difficulty,Source']

  const sorted = Object.entries(grid.itemCounts).sort((a, b) => b[1] - a[1])

  for (const [name, count] of sorted) {
    const item = palette.find((p) => p.name === name)
    if (item) {
      const escapedSource = item.source.includes(',') ? `"${item.source}"` : item.source
      lines.push(`${name},${count},${item.category},${item.difficulty},${escapedSource}`)
    }
  }

  return lines.join('\n')
}

/**
 * Generate a shopping list as formatted plain text.
 */
export function exportShoppingListText(grid: GridResult): string {
  const palette = getFullPalette()
  const lines: string[] = [
    `Stardew Valley Pixel Art - Shopping List`,
    `Grid: ${grid.width}x${grid.height} (${grid.totalTiles} tiles, ${grid.uniqueItems} unique items)`,
    `${'─'.repeat(60)}`,
    '',
  ]

  const sorted = Object.entries(grid.itemCounts).sort((a, b) => b[1] - a[1])

  for (const [name, count] of sorted) {
    const item = palette.find((p) => p.name === name)
    const source = item ? ` — ${item.source}` : ''
    lines.push(`  ${count.toString().padStart(5)}x  ${name}${source}`)
  }

  lines.push('')
  lines.push(`Total: ${grid.totalTiles} items`)

  return lines.join('\n')
}
