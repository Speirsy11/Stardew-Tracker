import { NextResponse } from 'next/server'
import { getServerAuth } from '@stardew/auth'
import { prisma } from '@stardew/db'

export async function GET() {
  const session = await getServerAuth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).id as string
  const progress = await prisma.userShipping.findMany({ where: { userId } })
  return NextResponse.json(progress)
}

export async function POST(req: Request) {
  const session = await getServerAuth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).id as string
  const { itemId, shipped } = await req.json()

  const result = await prisma.userShipping.upsert({
    where: { userId_itemId: { userId, itemId } },
    create: { userId, itemId, shipped },
    update: { shipped },
  })

  return NextResponse.json(result)
}
