'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function NewApplication() {
  const [companyName, setCompanyName] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [selectedResumeId, setSelectedResumeId] = useState('')
  const [resumes, setResumes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchResumes()
  }, [])

  const fetchResumes = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      router.push('/login')
      return
    }

    const { data, error } = await supabase
      .from('resumes')
      .select('id, file_name')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (error) {
      setError('Failed to load context documents.')
    } else {
      setResumes(data || [])
      if (data && data.length > 0) {
        setSelectedResumeId(data[0].id)
      }
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      router.push('/login')
      return
    }

    if (!selectedResumeId) {
      setError('Architecture requires an active Context Document to proceed.')
      setSubmitting(false)
      return
    }

    const { error: insertError } = await supabase
      .from('applications')
      .insert([
        {
          user_id: session.user.id,
          resume_id: selectedResumeId,
          company_name: companyName,
          job_title: jobTitle,
          job_description: jobDescription,
          status: 'Applied'
        }
      ])

    if (insertError) {
      setError(insertError.message)
      setSubmitting(false)
    } else {
      router.push('/dashboard')
    }
  }

  if (loading) {
    return <div className="p-8 text-slate-500 min-h-screen bg-transparent"></div>
  }

  const inputClass = "w-full border-b border-slate-300 dark:border-slate-700 bg-transparent py-4 text-slate-900 dark:text-white placeholder-slate-400 focus:border-[#66023c] dark:focus:border-[#d69cae] focus:outline-none transition-colors rounded-none text-xl font-light"
  const labelClass = "text-[11px] font-bold uppercase tracking-[0.2em] text-[#66023c] dark:text-[#d69cae]"
  const primaryButton = "bg-[#66023c] text-white dark:bg-[#e5cfac] dark:text-[#66023c] font-medium tracking-tight px-8 py-4 transition-colors rounded-none hover:bg-black dark:hover:bg-white inline-flex items-center justify-center min-w-[200px] disabled:opacity-30"

  return (
    <div className="mx-auto max-w-4xl p-8 lg:p-16 xl:p-24 selection:bg-[#66023c] selection:text-white min-h-screen flex flex-col justify-center">
      <style jsx global>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .anim-fade-up { opacity: 0; animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>

      <div className="mb-24 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-8 anim-fade-up" style={{ animationDelay: '0ms' }}>
        <div>
          <h1 className="text-6xl md:text-8xl font-semibold tracking-tighter text-slate-900 dark:text-white leading-[0.9]">
            Apply<span className="text-[#66023c] dark:text-[#d69cae]">.</span>
          </h1>
          <p className="mt-4 text-sm font-medium tracking-wide text-slate-500 dark:text-slate-400">
            Log New Application Record
          </p>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={() => router.push('/dashboard')} className="text-[#66023c] hover:text-[#400529] font-medium tracking-tight dark:text-[#d69cae] dark:hover:text-white transition-colors uppercase text-xs tracking-widest">
            CANCEL / RETURN
          </button>
        </div>
      </div>

      {resumes.length === 0 ? (
        <div className="anim-fade-up" style={{ animationDelay: '100ms' }}>
          <h2 className="text-2xl font-bold tracking-tight text-[#66023c] dark:text-[#d69cae] mb-4">Asset Lock Enforced.</h2>
          <p className="mb-8 text-lg font-medium text-slate-600 dark:text-slate-400">ContextLock requires a resume uploaded to the system to log an application.</p>
          <button 
            onClick={() => router.push('/resumes')}
            className={primaryButton}
          >
            Upload Resume
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-16 pb-24 anim-fade-up" style={{ animationDelay: '100ms' }}>
          {error && <div className="text-xs font-semibold uppercase tracking-widest text-[#66023c] dark:text-[#d69cae]">{error}</div>}
          
          <div className="flex flex-col gap-4">
            <label htmlFor="companyName" className={labelClass}>Company Name</label>
            <input
              id="companyName"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className={inputClass}
              placeholder="E.g., Acme Corp..."
              required
            />
          </div>

          <div className="flex flex-col gap-4">
            <label htmlFor="jobTitle" className={labelClass}>Job Title</label>
            <input
              id="jobTitle"
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className={inputClass}
              placeholder="E.g., Senior Engineer..."
              required
            />
          </div>

          <div className="flex flex-col gap-4">
            <label htmlFor="resumeSelect" className={labelClass}>Select Resume</label>
            <select
              id="resumeSelect"
              value={selectedResumeId}
              onChange={(e) => setSelectedResumeId(e.target.value)}
              className={inputClass}
              required
            >
              <option value="" disabled>Select a valid resume...</option>
              {resumes.map((resume) => (
                <option key={resume.id} value={resume.id} className="bg-white dark:bg-black">
                  {resume.file_name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-4">
            <label htmlFor="jobDescription" className={labelClass}>Job Description (Optional)</label>
            <textarea
              id="jobDescription"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className={`${inputClass} h-40 resize-y`}
              placeholder="Paste job description here..."
            />
          </div>

          <div className="flex justify-start">
            <button 
              type="submit" 
              disabled={submitting}
              className={primaryButton}
            >
              {submitting ? 'LOGGING...' : 'LOG APPLICATION'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}