import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GithubProvider from 'next-auth/providers/github'
import bcrypt from 'bcryptjs'
import { prisma } from '@stardew/db'

export const authOptions: NextAuthOptions = {
  // NOTE: PrismaAdapter is intentionally NOT used here.
  // It conflicts with CredentialsProvider in NextAuth v4 — even with JWT strategy,
  // the adapter tries to create a DB session after authorize(), which fails.
  // OAuth user creation is handled manually in the signIn callback instead.
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/auth/signin',
  },
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID ?? '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? '',
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log('[auth] Missing credentials')
            return null
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          })

          if (!user) {
            console.log('[auth] User not found:', credentials.email)
            return null
          }
          if (!user.password) {
            console.log('[auth] User has no password (OAuth-only):', credentials.email)
            return null
          }

          const isValid = await bcrypt.compare(credentials.password, user.password)
          if (!isValid) {
            console.log('[auth] Invalid password for:', credentials.email)
            return null
          }

          console.log('[auth] Authorized user:', user.email)
          return { id: user.id, email: user.email, name: user.name }
        } catch (err) {
          console.error('[auth] authorize error:', err)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Handle OAuth (GitHub) user creation/linking manually
      if (account?.provider === 'github' && user.email) {
        let dbUser = await prisma.user.findUnique({ where: { email: user.email } })
        if (!dbUser) {
          dbUser = await prisma.user.create({
            data: {
              email: user.email,
              name: user.name,
              image: (user as any).image ?? null,
            },
          })
        }
        // Attach the DB id so it flows into the JWT
        user.id = dbUser.id
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        (session.user as any).id = token.id as string
      }
      return session
    },
  },
}

/**
 * Convenience wrapper — import { getServerAuth } from '@stardew/auth'
 * Returns the session or null.
 */
export async function getServerAuth() {
  // Dynamic import to avoid pulling in next/headers at module scope
  const { getServerSession } = await import('next-auth')
  return getServerSession(authOptions)
}

/**
 * Get the current user's ID from the session, or null if not signed in.
 */
export async function getAuthUserId(): Promise<string | null> {
  const session = await getServerAuth()
  return (session?.user as any)?.id ?? null
}
