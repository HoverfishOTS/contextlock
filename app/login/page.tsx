'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      return
    }

    router.push('/dashboard')
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      return
    }

    if (data?.session) {
      router.push('/dashboard')
    } else {
      setError('Account created. Please Sign In.')
    }
  }

  const primaryButton = "w-full bg-[#66023c] text-white dark:bg-[#e5cfac] dark:text-[#66023c] font-medium tracking-tight px-8 py-4 transition-colors rounded-none hover:bg-black dark:hover:bg-white inline-flex items-center justify-center mt-4"
  const secondaryAction = "w-full border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium tracking-tight px-8 py-4 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors rounded-none inline-flex items-center justify-center"
  const inputClass = "w-full border-b border-slate-300 dark:border-slate-700 bg-transparent py-4 text-slate-900 dark:text-white placeholder-slate-400 focus:border-[#66023c] dark:focus:border-[#d69cae] focus:outline-none transition-colors rounded-none text-xl font-light"

  return (
    <div className="flex min-h-screen items-center justify-center p-8 lg:p-16 selection:bg-[#66023c] selection:text-white">
      <style jsx global>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { opacity: 0; animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
      
      <div className="w-full max-w-sm animate-fade-in">
        <form className="flex flex-col gap-8">
          <div className="mb-8">
            <h1 className="text-5xl font-semibold tracking-tighter text-slate-900 dark:text-white leading-[0.9]">
              Authentication<span className="text-[#66023c] dark:text-[#d69cae]">.</span>
            </h1>
            <p className="mt-4 text-sm font-medium tracking-widest uppercase text-slate-500">
              Identity Protocol
            </p>
          </div>
          
          {error && <div className="text-xs font-semibold uppercase tracking-widest text-[#66023c] dark:text-[#d69cae]">{error}</div>}
          
          <div className="flex flex-col gap-6">
            <input
              type="email"
              placeholder="Email Interface"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              required
            />
            <input
              type="password"
              placeholder="Security Key"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              required
            />
          </div>
          
          <div className="flex flex-col gap-4 mt-8">
            <button onClick={handleLogin} className={primaryButton}>
              AUTHORIZE
            </button>
            <button onClick={handleSignUp} className={secondaryAction}>
              REGISTER
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}