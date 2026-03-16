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
      setError('Failed to load resumes.')
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
      setError('You must select a resume to lock to this application.')
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
    return <div className="p-8 text-slate-500">Loading...</div>
  }

  const inputClasses = "rounded-lg border border-slate-300 bg-white p-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-blue-500"

  return (
    <div className="mx-auto max-w-2xl p-8 animate-fade-in">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Log New Application</h1>
        <button onClick={() => router.push('/dashboard')} className="text-sm font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
          Cancel
        </button>
      </div>

      {resumes.length === 0 ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
          <h2 className="mb-2 font-bold">Asset Lock Enforced</h2>
          <p className="mb-4 text-sm">You cannot log an application without a resume in the system.</p>
          <button 
            onClick={() => router.push('/resumes')}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700"
          >
            Upload a Resume
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {error && <div className="text-sm font-medium text-red-500">{error}</div>}
          
          <div className="flex flex-col gap-2">
            <label htmlFor="companyName" className="text-sm font-semibold text-slate-900 dark:text-slate-200">Company Name</label>
            <input
              id="companyName"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className={inputClasses}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="jobTitle" className="text-sm font-semibold text-slate-900 dark:text-slate-200">Job Title</label>
            <input
              id="jobTitle"
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className={inputClasses}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="jobDescription" className="text-sm font-semibold text-slate-900 dark:text-slate-200">Job Description</label>
            <textarea
              id="jobDescription"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className={`${inputClasses} h-32 resize-y`}
              placeholder="Paste the job description here..."
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="resumeSelect" className="text-sm font-semibold text-slate-900 dark:text-slate-200">Lock Resume to Application</label>
            <select
              id="resumeSelect"
              value={selectedResumeId}
              onChange={(e) => setSelectedResumeId(e.target.value)}
              className={inputClasses}
              required
            >
              <option value="" disabled>Select a resume...</option>
              {resumes.map((resume) => (
                <option key={resume.id} value={resume.id}>
                  {resume.file_name}
                </option>
              ))}
            </select>
          </div>

          <button 
            type="submit" 
            disabled={submitting}
            className="mt-4 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-500 disabled:bg-slate-400 disabled:opacity-50 dark:disabled:bg-slate-700"
          >
            {submitting ? 'Logging...' : 'Log Application'}
          </button>
        </form>
      )}
    </div>
  )
}