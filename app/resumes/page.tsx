'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function Resumes() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [resumes, setResumes] = useState<any[]>([])
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
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching resumes:', error)
    } else {
      setResumes(data || [])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first.')
      return
    }

    setUploading(true)
    setError(null)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login')
      return
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `${session.user.id}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(filePath, file)

    if (uploadError) {
      setError(`Storage Error: ${uploadError.message}`)
      setUploading(false)
      return
    }

    const { error: dbError } = await supabase
      .from('resumes')
      .insert([
        {
          user_id: session.user.id,
          file_name: file.name,
          storage_path: filePath
        }
      ])

    if (dbError) {
      setError(`Database Error: ${dbError.message}`)
    } else {
      setFile(null)
      fetchResumes()
    }

    setUploading(false)
  }

  const handleViewResume = async (storagePath: string) => {
    const { data, error } = await supabase.storage
      .from('resumes')
      .createSignedUrl(storagePath, 60)

    if (error) {
      setError(`Failed to generate URL: ${error.message}`)
      return
    }

    if (data?.signedUrl) {
      window.open(data.signedUrl, '_blank')
    }
  }

  return (
    <div className="mx-auto max-w-4xl p-8 animate-fade-in">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Manage Resumes</h1>
        <button onClick={() => router.push('/dashboard')} className="text-sm font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
          Back to Dashboard
        </button>
      </div>

      <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Upload New Resume</h2>
        {error && <div className="mb-4 text-sm font-medium text-red-500">{error}</div>}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <input 
            type="file" 
            accept="application/pdf"
            onChange={handleFileChange}
            className="w-full rounded-lg border border-slate-300 bg-slate-50 p-2 text-sm text-slate-700 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:file:bg-slate-800 dark:file:text-blue-400"
          />
          <button 
            onClick={handleUpload} 
            disabled={uploading || !file}
            className="whitespace-nowrap rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-400 disabled:opacity-50 dark:disabled:bg-slate-700"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Your Resumes</h2>
        {resumes.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">No resumes uploaded yet.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {resumes.map((resume) => (
              <li key={resume.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-blue-200 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-900">
                <span className="font-medium text-slate-900 dark:text-slate-200">{resume.file_name}</span>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {new Date(resume.created_at).toLocaleDateString()}
                  </span>
                  <button 
                    onClick={() => handleViewResume(resume.storage_path)}
                    className="text-sm font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    View
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}