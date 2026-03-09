import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@stardew/db'

export async function POST(req: Request) {
  const { email, name, password } = await req.json()

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
  }

  const hashed = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({
    data: { email, name: name || null, password: hashed },
  })

  return NextResponse.json({ id: user.id, email: user.email })
}
