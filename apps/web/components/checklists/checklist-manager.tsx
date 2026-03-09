'use client'

import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
  Upload,
  Trash2,
  ChevronDown,
  ChevronUp,
  Check,
  FileText,
  Plus,
  Loader2,
} from 'lucide-react'

type ChecklistItemData = {
  id: string
  text: string
  depth: number
  checked: boolean
  sortOrder: number
}

type ChecklistData = {
  id: string
  title: string
  rawMarkdown: string
  items: ChecklistItemData[]
  createdAt: string
}

interface ChecklistManagerProps {
  initialChecklists: ChecklistData[]
  isLoggedIn: boolean
}

export function ChecklistManager({ initialChecklists, isLoggedIn }: ChecklistManagerProps) {
  const [checklists, setChecklists] = useState<ChecklistData[]>(initialChecklists)
  const [expandedId, setExpandedId] = useState<string | null>(
    initialChecklists[0]?.id ?? null
  )
  const [uploading, setUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState('')

  async function handleFile(file: File, title?: string) {
    if (!file.name.endsWith('.md')) {
      setError('Please upload a .md (Markdown) file.')
      return
    }
    setError('')
    setUploading(true)

    const rawMarkdown = await file.text()
    const checklistTitle = title || file.name.replace('.md', '')

    if (!isLoggedIn) {
      // Local-only mode: parse client-side
      const { parseMarkdownChecklist } = await import('@/lib/markdown-parser')
      const parsed = parseMarkdownChecklist(rawMarkdown)
      const local: ChecklistData = {
        id: `local-${Date.now()}`,
        title: checklistTitle,
        rawMarkdown,
        items: parsed.map((item, i) => ({
          id: `local-item-${Date.now()}-${i}`,
          text: item.text,
          depth: item.depth,
          checked: item.checked,
          sortOrder: i,
        })),
        createdAt: new Date().toISOString(),
      }
      setChecklists((prev) => [local, ...prev])
      setExpandedId(local.id)
      setUploading(false)
      return
    }

    try {
      const res = await fetch('/api/checklists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: checklistTitle, rawMarkdown }),
      })
      if (!res.ok) throw new Error(await res.text())
      const checklist = await res.json()
      setChecklists((prev) => [checklist, ...prev])
      setExpandedId(checklist.id)
    } catch (e) {
      setError('Failed to save checklist. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  async function toggleItem(checklistId: string, itemId: string, current: boolean) {
    const newVal = !current

    // Optimistic update
    setChecklists((prev) =>
      prev.map((cl) =>
        cl.id !== checklistId
          ? cl
          : {
              ...cl,
              items: cl.items.map((item) =>
                item.id === itemId ? { ...item, checked: newVal } : item
              ),
            }
      )
    )

    if (!isLoggedIn || itemId.startsWith('local-')) return

    try {
      await fetch('/api/checklists/items', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, checked: newVal }),
      })
    } catch { /* silent fail */ }
  }

  async function deleteChecklist(id: string) {
    setChecklists((prev) => prev.filter((cl) => cl.id !== id))
    if (isLoggedIn && !id.startsWith('local-')) {
      await fetch('/api/checklists', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
    }
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [])

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true) }
  const onDragLeave = () => setIsDragging(false)

  return (
    <div className="space-y-6">
      {/* Upload zone */}
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={cn(
          'border-3 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer',
          isDragging
            ? 'border-stardew-brown bg-stardew-brown/10'
            : 'border-stardew-brown/30 hover:border-stardew-brown/50 hover:bg-stardew-brown/5'
        )}
        onClick={() => document.getElementById('md-file-input')?.click()}
      >
        <input
          id="md-file-input"
          type="file"
          accept=".md"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
            e.target.value = ''
          }}
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 size={32} className="text-stardew-brown animate-spin" />
            <p className="font-semibold text-stardew-brown">Parsing checklist...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload size={32} className="text-stardew-brown/50" />
            <p className="font-pixel text-xs text-stardew-brown-dark">Upload Markdown Checklist</p>
            <p className="text-sm text-stardew-brown font-semibold">
              Drag & drop or click to select a <code className="bg-stardew-brown/10 px-1 rounded">.md</code> file
            </p>
            <p className="text-xs text-stardew-brown/60 font-semibold">
              Use <code>- [ ] item</code> for tasks, <code># heading</code> for sections
            </p>
          </div>
        )}
      </div>

      {!isLoggedIn && (
        <div className="card-stardew p-3 flex gap-2 items-center border-l-4 border-stardew-gold text-xs font-semibold text-stardew-brown">
          <span>💡</span>
          <span>Sign in to save checklists to your account. Without an account, checklists are stored in-memory only.</span>
        </div>
      )}

      {error && (
        <p className="text-red-600 text-sm font-semibold">{error}</p>
      )}

      {/* Checklist list */}
      {checklists.length === 0 && (
        <div className="text-center py-16">
          <FileText size={48} className="text-stardew-brown/20 mx-auto mb-3" />
          <p className="font-pixel text-xs text-stardew-brown/60">No checklists yet</p>
          <p className="text-sm text-stardew-brown/50 font-semibold mt-1">
            Upload a .md file to get started
          </p>
        </div>
      )}

      <div className="space-y-4">
        {checklists.map((checklist) => {
          const checkableItems = checklist.items.filter((i) => i.depth >= 0)
          const checkedCount = checkableItems.filter((i) => i.checked).length
          const isExpanded = expandedId === checklist.id

          return (
            <div
              key={checklist.id}
              className="card-stardew overflow-hidden border-2 border-stardew-brown/15"
            >
              {/* Header */}
              <div className="px-4 py-3 flex items-center gap-3">
                <FileText size={16} className="text-stardew-brown flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-stardew-brown-dark truncate">{checklist.title}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex-1 max-w-32">
                      <Progress
                        value={checkedCount}
                        max={checkableItems.length || 1}
                        color="bg-stardew-green"
                      />
                    </div>
                    <span className="text-xs text-stardew-brown font-semibold flex-shrink-0">
                      {checkedCount}/{checkableItems.length}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                    onClick={() => deleteChecklist(checklist.id)}
                    title="Delete checklist"
                  >
                    <Trash2 size={14} />
                  </button>
                  <button
                    className="p-1.5 text-stardew-brown hover:bg-stardew-brown/10 rounded-lg transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : checklist.id)}
                  >
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>

              {/* Items */}
              {isExpanded && (
                <div className="border-t border-stardew-brown/10 divide-y divide-stardew-brown/5">
                  {checklist.items.map((item) => {
                    // Heading item (depth < 0)
                    if (item.depth < 0) {
                      const level = Math.abs(item.depth)
                      return (
                        <div
                          key={item.id}
                          className={cn(
                            'px-4 py-2 bg-stardew-brown/5',
                            level === 1 ? 'border-t-2 border-stardew-brown/10' : ''
                          )}
                        >
                          <p className={cn(
                            'font-pixel text-stardew-brown-dark',
                            level === 1 ? 'text-xs' : level === 2 ? 'text-xs opacity-80' : 'text-xs opacity-60'
                          )}>
                            {item.text}
                          </p>
                        </div>
                      )
                    }

                    // Checkable item
                    return (
                      <button
                        key={item.id}
                        onClick={() => toggleItem(checklist.id, item.id, item.checked)}
                        className={cn(
                          'w-full px-4 py-2.5 flex items-start gap-3 text-left hover:bg-stardew-brown/5 transition-colors',
                          item.checked && 'bg-stardew-green/5'
                        )}
                        style={{ paddingLeft: `${16 + item.depth * 20}px` }}
                      >
                        <div className={cn('stardew-checkbox mt-0.5 flex-shrink-0', item.checked && 'checked')}>
                          {item.checked && <Check size={10} className="text-white" strokeWidth={3} />}
                        </div>
                        <span className={cn(
                          'text-sm font-semibold',
                          item.checked ? 'line-through text-stardew-brown/40' : 'text-stardew-brown-dark'
                        )}>
                          {item.text}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
