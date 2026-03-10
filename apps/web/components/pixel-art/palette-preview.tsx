'use client'

import type { PaletteItem } from '@stardew/pixel-art'

interface PalettePreviewProps {
  palette: PaletteItem[]
}

export function PalettePreview({ palette }: PalettePreviewProps) {
  return (
    <div>
      <p className="text-xs font-semibold text-stardew-brown mb-3">
        {palette.length} items in active palette
      </p>
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
        {palette.map((item) => (
          <div
            key={item.id}
            className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-stardew-cream/50 transition-colors group"
            title={`${item.name}\n${item.hex}\n${item.source}`}
          >
            <span
              className="w-8 h-8 rounded-md border-2 border-black/10 group-hover:border-stardew-brown/30 transition-colors"
              style={{ backgroundColor: item.hex }}
            />
            {item.iconFile && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`/icons/items/${item.iconFile}`}
                alt={item.name}
                className="w-6 h-6"
                style={{ imageRendering: 'pixelated' }}
              />
            )}
            <span className="text-center text-[9px] font-semibold text-stardew-brown leading-tight line-clamp-2">
              {item.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
