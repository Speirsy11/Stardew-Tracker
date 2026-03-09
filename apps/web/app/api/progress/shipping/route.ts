import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@stardew/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).id as string
  const progress = await prisma.userShipping.findMany({ where: { userId } })
  return NextResponse.json(progress)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
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
