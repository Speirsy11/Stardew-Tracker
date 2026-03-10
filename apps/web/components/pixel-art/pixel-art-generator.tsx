'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import type {
  GridResult,
  ProcessingOptions,
  DitherMode,
  Difficulty,
  ItemCategory,
} from '@stardew/pixel-art'
import {
  DEFAULT_OPTIONS,
  getFullPalette,
  filterPalette,
  processImage,
  resizeImage,
  renderGridToCanvas,
  exportGridAsPng,
  exportShoppingListCsv,
  exportShoppingListText,
} from '@stardew/pixel-art'
import { ImageUpload } from './image-upload'
import { GridPreview } from './grid-preview'
import { ShoppingList } from './shopping-list'
import { PalettePreview } from './palette-preview'

type Tab = 'preview' | 'shopping' | 'palette'

const GRID_PRESETS = [
  { label: 'Small (32x32)', w: 32, h: 32 },
  { label: 'Medium (48x48)', w: 48, h: 48 },
  { label: 'Large (64x64)', w: 64, h: 64 },
  { label: 'Huge (96x96)', w: 96, h: 96 },
  { label: 'Max (128x128)', w: 128, h: 128 },
]

const ALL_CATEGORIES: { value: ItemCategory; label: string }[] = [
  { value: 'flooring', label: 'Flooring' },
  { value: 'crop', label: 'Crops' },
  { value: 'mineral', label: 'Minerals' },
  { value: 'crafting', label: 'Craftables' },
  { value: 'artisan', label: 'Artisan' },
  { value: 'furniture', label: 'Furniture' },
  { value: 'misc', label: 'Misc' },
]

const DITHER_OPTIONS: { value: DitherMode; label: string }[] = [
  { value: 'floyd-steinberg', label: 'Floyd-Steinberg' },
  { value: 'ordered', label: 'Ordered (Bayer)' },
  { value: 'none', label: 'None' },
]

const DIFFICULTY_OPTIONS: { value: Difficulty; label: string }[] = [
  { value: 'easy', label: 'Easy only' },
  { value: 'medium', label: 'Easy + Medium' },
  { value: 'hard', label: 'All items' },
]

export function PixelArtGenerator() {
  const [sourceImage, setSourceImage] = useState<HTMLImageElement | null>(null)
  const [result, setResult] = useState<GridResult | null>(null)
  const [processing, setProcessing] = useState(false)
  const [tab, setTab] = useState<Tab>('preview')
  const [error, setError] = useState<string | null>(null)

  const [gridPreset, setGridPreset] = useState(1) // Medium
  const [dither, setDither] = useState<DitherMode>('floyd-steinberg')
  const [brightness, setBrightness] = useState(0)
  const [contrast, setContrast] = useState(0)
  const [maxDifficulty, setMaxDifficulty] = useState<Difficulty>('hard')
  const [categories, setCategories] = useState<ItemCategory[]>(
    DEFAULT_OPTIONS.categories,
  )
  const [showGridLines, setShowGridLines] = useState(false)

  const previewCanvasRef = useRef<HTMLCanvasElement>(null)

  const activePalette = filterPalette(getFullPalette(), categories, maxDifficulty)

  const handleImageLoad = useCallback((img: HTMLImageElement) => {
    setSourceImage(img)
    setResult(null)
    setError(null)
  }, [])

  const handleGenerate = useCallback(() => {
    if (!sourceImage) return

    setProcessing(true)
    setError(null)

    // Use requestAnimationFrame to let the UI update before processing
    requestAnimationFrame(() => {
      try {
        const preset = GRID_PRESETS[gridPreset]

        // Calculate aspect-ratio-preserving dimensions
        const aspectRatio = sourceImage.naturalWidth / sourceImage.naturalHeight
        let targetW: number
        let targetH: number

        if (aspectRatio >= 1) {
          targetW = preset.w
          targetH = Math.max(1, Math.round(preset.w / aspectRatio))
        } else {
          targetH = preset.h
          targetW = Math.max(1, Math.round(preset.h * aspectRatio))
        }

        const imageData = resizeImage(sourceImage, targetW, targetH)

        const gridResult = processImage(imageData, targetW, targetH, {
          dither,
          brightness,
          contrast,
          categories,
          maxDifficulty,
        })

        setResult(gridResult)
        setTab('preview')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Processing failed')
      } finally {
        setProcessing(false)
      }
    })
  }, [sourceImage, gridPreset, dither, brightness, contrast, categories, maxDifficulty])

  // Re-render preview canvas when result or settings change
  useEffect(() => {
    if (result && previewCanvasRef.current) {
      const tileSize = Math.max(2, Math.min(16, Math.floor(800 / Math.max(result.width, result.height))))
      renderGridToCanvas(result, previewCanvasRef.current, tileSize, showGridLines)
    }
  }, [result, showGridLines])

  const handleExportPng = useCallback(async () => {
    if (!result) return
    try {
      const blob = await exportGridAsPng(result, 16, true)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `stardew-pixel-art-${result.width}x${result.height}.png`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      setError('Failed to export PNG')
    }
  }, [result])

  const handleExportCsv = useCallback(() => {
    if (!result) return
    const csv = exportShoppingListCsv(result)
    downloadText(csv, `stardew-shopping-list-${result.width}x${result.height}.csv`, 'text/csv')
  }, [result])

  const handleExportText = useCallback(() => {
    if (!result) return
    const text = exportShoppingListText(result)
    downloadText(text, `stardew-shopping-list-${result.width}x${result.height}.txt`, 'text/plain')
  }, [result])

  const toggleCategory = (cat: ItemCategory) => {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    )
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="card-stardew p-4">
        <h2 className="font-pixel text-xs text-stardew-brown-dark mb-3">Upload Image</h2>
        <ImageUpload onImageLoad={handleImageLoad} />
        {sourceImage && (
          <div className="mt-3 text-xs text-stardew-brown font-semibold">
            Loaded: {sourceImage.naturalWidth}x{sourceImage.naturalHeight}px
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="card-stardew p-4">
        <h2 className="font-pixel text-xs text-stardew-brown-dark mb-3">Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Grid Size */}
          <div>
            <label className="block text-xs font-semibold text-stardew-brown mb-1">
              Grid Size
            </label>
            <select
              value={gridPreset}
              onChange={(e) => setGridPreset(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border-2 border-stardew-brown/20 bg-white text-sm text-stardew-brown-dark font-semibold focus:outline-none focus:border-stardew-green"
            >
              {GRID_PRESETS.map((p, i) => (
                <option key={i} value={i}>
                  {p.label} ({p.w * p.h} tiles)
                </option>
              ))}
            </select>
          </div>

          {/* Dithering */}
          <div>
            <label className="block text-xs font-semibold text-stardew-brown mb-1">
              Dithering
            </label>
            <select
              value={dither}
              onChange={(e) => setDither(e.target.value as DitherMode)}
              className="w-full px-3 py-2 rounded-lg border-2 border-stardew-brown/20 bg-white text-sm text-stardew-brown-dark font-semibold focus:outline-none focus:border-stardew-green"
            >
              {DITHER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-xs font-semibold text-stardew-brown mb-1">
              Item Difficulty
            </label>
            <select
              value={maxDifficulty}
              onChange={(e) => setMaxDifficulty(e.target.value as Difficulty)}
              className="w-full px-3 py-2 rounded-lg border-2 border-stardew-brown/20 bg-white text-sm text-stardew-brown-dark font-semibold focus:outline-none focus:border-stardew-green"
            >
              {DIFFICULTY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* Brightness */}
          <div>
            <label className="block text-xs font-semibold text-stardew-brown mb-1">
              Brightness: {brightness}
            </label>
            <input
              type="range"
              min={-80}
              max={80}
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
              className="w-full accent-stardew-green"
            />
          </div>

          {/* Contrast */}
          <div>
            <label className="block text-xs font-semibold text-stardew-brown mb-1">
              Contrast: {contrast}
            </label>
            <input
              type="range"
              min={-80}
              max={80}
              value={contrast}
              onChange={(e) => setContrast(Number(e.target.value))}
              className="w-full accent-stardew-green"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="mt-4">
          <label className="block text-xs font-semibold text-stardew-brown mb-2">
            Item Categories ({activePalette.length} items available)
          </label>
          <div className="flex flex-wrap gap-2">
            {ALL_CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => toggleCategory(cat.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-colors ${
                  categories.includes(cat.value)
                    ? 'bg-stardew-green text-white border-stardew-green-dark'
                    : 'bg-white text-stardew-brown border-stardew-brown/20 hover:border-stardew-brown/40'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={handleGenerate}
            disabled={!sourceImage || processing || activePalette.length === 0}
            className="px-6 py-2.5 bg-stardew-green hover:bg-stardew-green-dark disabled:bg-stardew-brown/30 text-white font-pixel text-xs rounded-lg transition-colors shadow-md disabled:shadow-none"
          >
            {processing ? 'Processing...' : 'Generate'}
          </button>
          {error && (
            <span className="text-xs text-red-600 font-semibold">{error}</span>
          )}
          {activePalette.length === 0 && (
            <span className="text-xs text-red-600 font-semibold">
              No items match filters. Enable more categories or raise difficulty.
            </span>
          )}
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="card-stardew p-4">
          {/* Tab Bar */}
          <div className="flex gap-2 mb-4 border-b-2 border-stardew-brown/10 pb-2">
            {(['preview', 'shopping', 'palette'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-t-lg text-xs font-pixel transition-colors ${
                  tab === t
                    ? 'bg-stardew-cream-dark text-stardew-brown-dark'
                    : 'text-stardew-brown hover:bg-stardew-cream/50'
                }`}
              >
                {t === 'preview' ? 'Preview' : t === 'shopping' ? 'Shopping List' : 'Palette'}
              </button>
            ))}
          </div>

          {/* Summary Stats */}
          <div className="flex flex-wrap gap-4 mb-4 text-xs font-semibold text-stardew-brown">
            <span>Grid: {result.width}x{result.height}</span>
            <span>Total tiles: {result.totalTiles.toLocaleString()}</span>
            <span>Unique items: {result.uniqueItems}</span>
          </div>

          {/* Tab Content */}
          {tab === 'preview' && (
            <div>
              <div className="flex gap-2 mb-3">
                <label className="flex items-center gap-2 text-xs font-semibold text-stardew-brown cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showGridLines}
                    onChange={(e) => setShowGridLines(e.target.checked)}
                    className="accent-stardew-green"
                  />
                  Grid lines
                </label>
              </div>
              <GridPreview result={result} showGridLines={showGridLines} />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleExportPng}
                  className="px-4 py-2 bg-stardew-blue hover:bg-stardew-blue-light text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  Download PNG
                </button>
              </div>
            </div>
          )}

          {tab === 'shopping' && (
            <div>
              <ShoppingList result={result} />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleExportCsv}
                  className="px-4 py-2 bg-stardew-blue hover:bg-stardew-blue-light text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  Download CSV
                </button>
                <button
                  onClick={handleExportText}
                  className="px-4 py-2 bg-stardew-blue hover:bg-stardew-blue-light text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  Download Text
                </button>
              </div>
            </div>
          )}

          {tab === 'palette' && (
            <PalettePreview palette={activePalette} />
          )}
        </div>
      )}
    </div>
  )
}

function downloadText(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
