'use client'

import { useCallback, useRef, useState } from 'react'

interface ImageUploadProps {
  onImageLoad: (img: HTMLImageElement) => void
}

export function ImageUpload({ onImageLoad }: ImageUploadProps) {
  const [dragOver, setDragOver] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const loadFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) return

      const reader = new FileReader()
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string
        setPreview(dataUrl)

        const img = new Image()
        img.onload = () => onImageLoad(img)
        img.src = dataUrl
      }
      reader.readAsDataURL(file)
    },
    [onImageLoad],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file) loadFile(file)
    },
    [loadFile],
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) loadFile(file)
    },
    [loadFile],
  )

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          dragOver
            ? 'border-stardew-green bg-stardew-green/5'
            : 'border-stardew-brown/30 hover:border-stardew-brown/50 bg-stardew-cream/30'
        }`}
      >
        {preview ? (
          <div className="flex flex-col items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Upload preview"
              className="max-h-48 max-w-full rounded-lg shadow-md"
              style={{ imageRendering: 'auto' }}
            />
            <span className="text-xs text-stardew-brown font-semibold">
              Click or drag to replace
            </span>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-4xl">🖼️</div>
            <p className="text-sm font-semibold text-stardew-brown">
              Drop an image here or click to browse
            </p>
            <p className="text-xs text-stardew-brown/60 font-semibold">
              JPG, PNG, WebP supported
            </p>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  )
}
