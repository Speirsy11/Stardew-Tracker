'use client'

import { useMemo } from 'react'
import type { GridResult } from '@stardew/pixel-art'
import { getFullPalette } from '@stardew/pixel-art'

interface ShoppingListProps {
  result: GridResult
}

export function ShoppingList({ result }: ShoppingListProps) {
  const palette = getFullPalette()

  const sortedItems = useMemo(() => {
    return Object.entries(result.itemCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => {
        const item = palette.find((p) => p.name === name)
        return { name, count, item }
      })
  }, [result.itemCounts, palette])

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-stardew-brown/10">
            <th className="text-left py-2 px-2 text-xs font-pixel text-stardew-brown">Color</th>
            <th className="text-left py-2 px-2 text-xs font-pixel text-stardew-brown">Item</th>
            <th className="text-right py-2 px-2 text-xs font-pixel text-stardew-brown">Qty</th>
            <th className="text-left py-2 px-2 text-xs font-pixel text-stardew-brown hidden md:table-cell">Category</th>
            <th className="text-left py-2 px-2 text-xs font-pixel text-stardew-brown hidden lg:table-cell">How to Get</th>
          </tr>
        </thead>
        <tbody>
          {sortedItems.map(({ name, count, item }) => (
            <tr key={name} className="border-b border-stardew-brown/5 hover:bg-stardew-cream/30">
              <td className="py-1.5 px-2">
                <span
                  className="inline-block w-5 h-5 rounded-sm border border-black/10"
                  style={{ backgroundColor: item?.hex ?? '#888' }}
                />
              </td>
              <td className="py-1.5 px-2 font-semibold text-stardew-brown-dark">
                {item?.iconFile && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`/icons/items/${item.iconFile}`}
                    alt=""
                    className="inline-block w-5 h-5 mr-1.5 align-middle"
                    style={{ imageRendering: 'pixelated' }}
                  />
                )}
                {name}
              </td>
              <td className="py-1.5 px-2 text-right font-semibold text-stardew-brown tabular-nums">
                {count.toLocaleString()}
              </td>
              <td className="py-1.5 px-2 text-stardew-brown/70 capitalize hidden md:table-cell">
                {item?.category ?? '—'}
              </td>
              <td className="py-1.5 px-2 text-stardew-brown/60 text-xs hidden lg:table-cell">
                {item?.source ?? '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {result.totalTiles >= 2000 && (
        <div className="mt-3 p-3 bg-stardew-gold/10 rounded-lg text-xs font-semibold text-stardew-brown">
          This design requires {result.totalTiles.toLocaleString()} total items. Consider using a smaller grid size for a more manageable build.
        </div>
      )}
    </div>
  )
}
