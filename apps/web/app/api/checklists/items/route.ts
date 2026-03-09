import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@stardew/db'

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).id as string
  const { itemId, checked } = await req.json()

  // Verify ownership
  const item = await prisma.checklistItem.findUnique({
    where: { id: itemId },
    include: { checklist: true },
  })
  if (!item || item.checklist.userId !== userId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const updated = await prisma.checklistItem.update({
    where: { id: itemId },
    data: { checked },
  })

  return NextResponse.json(updated)
}
