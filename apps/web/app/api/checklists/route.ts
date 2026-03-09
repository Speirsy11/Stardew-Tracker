import { NextResponse } from 'next/server'
import { getServerAuth } from '@stardew/auth'
import { prisma } from '@stardew/db'
import { parseMarkdownChecklist } from '@/lib/markdown-parser'

export async function GET() {
  const session = await getServerAuth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).id as string
  const checklists = await prisma.customChecklist.findMany({
    where: { userId },
    include: { items: { orderBy: { sortOrder: 'asc' } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(checklists)
}

export async function POST(req: Request) {
  const session = await getServerAuth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).id as string
  const { title, rawMarkdown } = await req.json()

  const parsedItems = parseMarkdownChecklist(rawMarkdown)

  const checklist = await prisma.customChecklist.create({
    data: {
      userId,
      title,
      rawMarkdown,
      items: {
        create: parsedItems.map((item, index) => ({
          text: item.text,
          depth: item.depth,
          checked: item.checked,
          sortOrder: index,
        })),
      },
    },
    include: { items: { orderBy: { sortOrder: 'asc' } } },
  })

  return NextResponse.json(checklist)
}

export async function DELETE(req: Request) {
  const session = await getServerAuth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).id as string
  const { id } = await req.json()

  await prisma.customChecklist.deleteMany({ where: { id, userId } })
  return NextResponse.json({ ok: true })
}
