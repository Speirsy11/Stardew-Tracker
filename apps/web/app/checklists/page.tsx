import { getServerAuth } from '@stardew/auth'
import { prisma } from '@stardew/db'
import { ChecklistManager } from '@/components/checklists/checklist-manager'

export default async function ChecklistsPage() {
  const session = await getServerAuth()
  const userId = (session?.user as any)?.id as string | undefined

  const checklists = userId
    ? await prisma.customChecklist.findMany({
        where: { userId },
        include: { items: { orderBy: { sortOrder: 'asc' } } },
        orderBy: { createdAt: 'desc' },
      })
    : []

  return (
    <div className="max-w-3xl mx-auto animate-fade-up">
      <div className="mb-6">
        <h1 className="page-header">📋 Custom Checklists</h1>
        <p className="text-sm text-stardew-brown font-semibold">
          Upload any <code className="bg-stardew-brown/10 px-1 rounded">.md</code> Markdown file and it becomes an
          interactive checklist. Supports headings as sections, <code>- [ ]</code> task items,
          and nested indentation.
        </p>
      </div>

      {/* Markdown format reference */}
      <div className="card-stardew p-4 mb-6 border-l-4 border-stardew-blue">
        <p className="font-pixel text-xs text-stardew-brown-dark mb-3">Supported Markdown Format</p>
        <pre className="text-xs text-stardew-brown font-mono bg-white/50 rounded-lg p-3 overflow-x-auto leading-relaxed">{`# Main Section
## Sub Section
- [ ] Unchecked task
- [x] Already done
  - [ ] Nested task
  - [ ] Another nested task
- [ ] Back to top level`}</pre>
      </div>

      <ChecklistManager
        initialChecklists={checklists as any}
        isLoggedIn={!!session}
      />
    </div>
  )
}
