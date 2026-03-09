'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { Loader2, Github } from 'lucide-react'

export default function SignInPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'signin' | 'register'>('signin')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (tab === 'register') {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, password }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Registration failed')
        setLoading(false)
        return
      }
    }

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    setLoading(false)
    if (result?.error) {
      setError('Invalid email or password')
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card-stardew w-full max-w-sm p-8">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🌾</div>
          <h1 className="font-pixel text-sm text-stardew-brown-dark">Stardew Tracker</h1>
          <p className="text-xs text-stardew-brown font-semibold mt-1">
            Sign in to save your progress
          </p>
        </div>

        {/* GitHub OAuth */}
        <Button
          variant="secondary"
          className="w-full mb-4"
          onClick={() => signIn('github', { callbackUrl: '/' })}
        >
          <Github size={16} />
          Continue with GitHub
        </Button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-stardew-brown/20" />
          <span className="text-xs text-stardew-brown/50 font-semibold">or</span>
          <div className="flex-1 h-px bg-stardew-brown/20" />
        </div>

        {/* Tabs */}
        <div className="flex rounded-xl border-2 border-stardew-brown/20 overflow-hidden mb-5">
          {(['signin', 'register'] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setError('') }}
              className={`flex-1 py-2 text-xs font-semibold capitalize transition-all ${
                tab === t
                  ? 'bg-stardew-brown text-stardew-cream'
                  : 'text-stardew-brown hover:bg-stardew-brown/10'
              }`}
            >
              {t === 'signin' ? 'Sign In' : 'Register'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {tab === 'register' && (
            <Input
              type="text"
              placeholder="Name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-red-500 text-xs font-semibold">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 size={14} className="animate-spin" />}
            {tab === 'signin' ? 'Sign In' : 'Create Account'}
          </Button>
        </form>

        <p className="text-center text-xs text-stardew-brown/60 font-semibold mt-4">
          <Link href="/" className="hover:underline">← Back to tracker</Link>
        </p>
      </div>
    </div>
  )
}
