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
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Manage Resumes</h1>
        <button onClick={() => router.push('/dashboard')} className="text-blue-500 hover:underline">
          Back to Dashboard
        </button>
      </div>

      <div className="mb-8 p-6 border rounded">
        <h2 className="text-xl font-semibold mb-4">Upload New Resume</h2>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <div className="flex gap-4 items-center">
          <input 
            type="file" 
            accept="application/pdf"
            onChange={handleFileChange}
            className="border p-2 rounded w-full text-black bg-white"
          />
          <button 
            onClick={handleUpload} 
            disabled={uploading || !file}
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Your Resumes</h2>
        {resumes.length === 0 ? (
          <p className="text-gray-500">No resumes uploaded yet.</p>
        ) : (
          <ul className="space-y-2">
            {resumes.map((resume) => (
              <li key={resume.id} className="border p-4 rounded flex justify-between items-center">
                <span>{resume.file_name}</span>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">
                    {new Date(resume.created_at).toLocaleDateString()}
                  </span>
                  <button 
                    onClick={() => handleViewResume(resume.storage_path)}
                    className="text-blue-600 hover:underline text-sm font-semibold"
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