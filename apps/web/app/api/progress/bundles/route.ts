import { NextResponse } from 'next/server'
import { getServerAuth } from '@stardew/auth'
import { prisma } from '@stardew/db'

export async function GET() {
  const session = await getServerAuth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).id as string
  const progress = await prisma.userBundle.findMany({ where: { userId } })
  return NextResponse.json(progress)
}

export async function POST(req: Request) {
  const session = await getServerAuth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as any).id as string
  const { bundleItemId, bundleId, completed } = await req.json()

  const result = await prisma.userBundle.upsert({
    where: { userId_bundleItemId: { userId, bundleItemId } },
    create: { userId, bundleItemId, bundleId, completed },
    update: { completed },
  })

  return NextResponse.json(result)
}
