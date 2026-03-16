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
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Log New Application</h1>
        <button onClick={() => router.push('/dashboard')} className="text-blue-500 hover:underline">
          Cancel
        </button>
      </div>

      {resumes.length === 0 ? (
        <div className="border border-red-300 bg-red-50 p-6 rounded text-red-800">
          <h2 className="font-bold mb-2">Asset Lock Enforced</h2>
          <p className="mb-4">You cannot log an application without a resume in the system.</p>
          <button 
            onClick={() => router.push('/resumes')}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Upload a Resume
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 border p-6 rounded shadow-sm">
          {error && <div className="text-red-500">{error}</div>}
          
          <div className="flex flex-col gap-2">
            <label htmlFor="companyName" className="font-semibold">Company Name</label>
            <input
              id="companyName"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="border p-2 rounded text-black bg-white focus:border-blue-500 focus:outline-none"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="jobTitle" className="font-semibold">Job Title</label>
            <input
              id="jobTitle"
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="border p-2 rounded text-black bg-white focus:border-blue-500 focus:outline-none"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="jobDescription" className="font-semibold">Job Description</label>
            <textarea
              id="jobDescription"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="border p-2 rounded text-black bg-white focus:border-blue-500 focus:outline-none h-32 resize-y"
              placeholder="Paste the job description here..."
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="resumeSelect" className="font-semibold">Lock Resume to Application</label>
            <select
              id="resumeSelect"
              value={selectedResumeId}
              onChange={(e) => setSelectedResumeId(e.target.value)}
              className="border p-2 rounded text-black bg-white focus:border-blue-500 focus:outline-none"
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
            className="bg-blue-600 text-white py-2 rounded mt-4 disabled:bg-gray-400 hover:bg-blue-700"
          >
            {submitting ? 'Logging...' : 'Log Application'}
          </button>
        </form>
      )}
    </div>
  )
}