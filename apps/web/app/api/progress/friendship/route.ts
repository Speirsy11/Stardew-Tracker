import { NextResponse } from 'next/server'
import { getServerAuth } from '@stardew/auth'
import { prisma } from '@stardew/db'

export async function GET() {
  const session = await getServerAuth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).id as string
  const friendships = await prisma.userFriendship.findMany({ where: { userId } })
  return NextResponse.json(friendships)
}

export async function POST(req: Request) {
  const session = await getServerAuth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).id as string
  const { npcId, hearts } = await req.json()

  const result = await prisma.userFriendship.upsert({
    where: { userId_npcId: { userId, npcId } },
    create: { userId, npcId, hearts },
    update: { hearts },
  })

  return NextResponse.json(result)
}
