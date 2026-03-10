import { PixelArtGenerator } from '@/components/pixel-art/pixel-art-generator'

export default function PixelArtPage() {
  return (
    <div className="max-w-5xl mx-auto animate-fade-up">
      <div className="mb-6">
        <h1 className="page-header">🎨 Farm Pixel Art Generator</h1>
        <p className="text-sm text-stardew-brown font-semibold">
          Convert any image into a Stardew Valley farm layout using placeable items.
          Upload a photo, adjust settings, and get a blueprint with a shopping list of items to place on your farm.
        </p>
      </div>
      <PixelArtGenerator />
    </div>
  )
}
