'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import type { GridResult } from '@stardew/pixel-art'
import { renderGridToCanvas } from '@stardew/pixel-art'

interface GridPreviewProps {
  result: GridResult
  showGridLines: boolean
}

export function GridPreview({ result, showGridLines }: GridPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [tooltip, setTooltip] = useState<{
    x: number
    y: number
    text: string
    color: string
  } | null>(null)

  const tileSize = Math.max(4, Math.min(16, Math.floor(800 / Math.max(result.width, result.height))))

  useEffect(() => {
    if (canvasRef.current) {
      renderGridToCanvas(result, canvasRef.current, tileSize, showGridLines)
    }
  }, [result, tileSize, showGridLines])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const scaleX = canvas.width / rect.width
      const scaleY = canvas.height / rect.height
      const cx = Math.floor((e.clientX - rect.left) * scaleX / tileSize)
      const cy = Math.floor((e.clientY - rect.top) * scaleY / tileSize)

      if (cx >= 0 && cx < result.width && cy >= 0 && cy < result.height) {
        const cell = result.grid[cy][cx]
        setTooltip({
          x: e.clientX,
          y: e.clientY,
          text: `${cell.item.name} (${cx}, ${cy})`,
          color: cell.item.hex,
        })
      } else {
        setTooltip(null)
      }
    },
    [result, tileSize],
  )

  return (
    <div ref={containerRef} className="relative overflow-auto">
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTooltip(null)}
        className="border-2 border-stardew-brown/20 rounded-lg max-w-full"
        style={{ imageRendering: 'pixelated' }}
      />
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none px-2 py-1 rounded-md shadow-lg text-xs font-semibold bg-white border-2 border-stardew-brown/20"
          style={{
            left: tooltip.x + 12,
            top: tooltip.y - 30,
          }}
        >
          <span
            className="inline-block w-3 h-3 rounded-sm mr-1.5 align-middle border border-black/10"
            style={{ backgroundColor: tooltip.color }}
          />
          <span className="text-stardew-brown-dark">{tooltip.text}</span>
        </div>
      )}
    </div>
  )
}
