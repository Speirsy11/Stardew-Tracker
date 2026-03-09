import { NextResponse } from 'next/server'
import { getServerAuth } from '@stardew/auth'
import { prisma } from '@stardew/db'

export async function POST(req: Request) {
  const session = await getServerAuth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).id as string
  const { itemSlug, listType, completed } = await req.json()

  const result = await prisma.userGameProgress.upsert({
    where: { userId_itemSlug_listType: { userId, itemSlug, listType } },
    create: { userId, itemSlug, listType, completed },
    update: { completed },
  })

  return NextResponse.json(result)
}
