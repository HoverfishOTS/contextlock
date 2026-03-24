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

    const { data, error: fetchError } = await supabase
      .from('resumes')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (fetchError) {
      console.error('Error fetching resumes:', fetchError)
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
    const { data, error: createError } = await supabase.storage
      .from('resumes')
      .createSignedUrl(storagePath, 60)

    if (createError) {
      setError(`Failed to generate URL: ${createError.message}`)
      return
    }

    if (data?.signedUrl) {
      window.open(data.signedUrl, '_blank')
    }
  }

  const handleDeleteResume = async (id: string, storagePath: string) => {
    if (!window.confirm('Irreversibly delete resume? Previous applications linked to this file will lose their record.')) return;

    // Remove from DB first
    const { error: dbError } = await supabase.from('resumes').delete().eq('id', id);
    if (dbError) {
       console.error("DB delete failed", dbError);
       return;
    }

    // Remove from storage
    const { error: storageError } = await supabase.storage.from('resumes').remove([storagePath]);
    if (storageError) {
       console.error("Storage delete failed", storageError);
    }
    
    fetchResumes();
  }

  const lineDivider = "border-b border-slate-200/60 dark:border-slate-800/60"
  const primaryButton = "bg-[#66023c] text-white dark:bg-[#e5cfac] dark:text-[#66023c] font-medium tracking-tight px-6 py-2.5 transition-colors rounded-none hover:bg-black dark:hover:bg-white disabled:opacity-30"
  const secondaryAction = "text-[#66023c] hover:text-[#400529] font-medium tracking-tight dark:text-[#d69cae] dark:hover:text-white transition-colors uppercase text-xs tracking-widest"
  const smallLabel = "text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-500"

  return (
    <div className="mx-auto max-w-5xl p-8 lg:p-16 xl:p-24 selection:bg-[#66023c] selection:text-white">
      <style jsx global>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .anim-fade-up { opacity: 0; animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>

      {/* Header */}
      <div className={`mb-24 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between ${lineDivider} pb-8 anim-fade-up`} style={{ animationDelay: '0ms' }}>
        <div>
          <h1 className="text-6xl md:text-8xl font-semibold tracking-tighter text-slate-900 dark:text-white leading-[0.9]">
            Resumes<span className="text-[#66023c] dark:text-[#d69cae]">.</span>
          </h1>
          <p className="mt-4 text-sm font-medium tracking-wide text-slate-500 dark:text-slate-400">
            Reference Document Manager
          </p>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={() => router.push('/dashboard')} className={secondaryAction}>
            Dashboard / Return
          </button>
        </div>
      </div>

      {/* Upload Block */}
      <div className={`mb-24 pb-24 flex flex-col lg:flex-row gap-16 lg:items-end ${lineDivider} anim-fade-up`} style={{ animationDelay: '100ms' }}>
        <div className="flex-1">
          <h2 className={smallLabel}>Upload Document</h2>
          <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white leading-snug">
            Commit a new PDF resume into ContextLock.
          </p>
          {error && <div className="mt-4 text-xs font-semibold text-[#66023c] dark:text-[#d69cae]">{error}</div>}
        </div>

        <div className="flex-1 flex flex-col sm:flex-row sm:items-end gap-6">
          <label className="flex-1 border-b-[2px] border-slate-900 dark:border-white py-2 group cursor-pointer">
             <span className="text-xs font-semibold tracking-widest uppercase text-slate-400 group-hover:text-[#66023c] transition-colors">{file ? file.name : 'Select PDF File...'}</span>
             <input type="file" accept="application/pdf" onChange={handleFileChange} className="hidden" />
          </label>
          <button 
            onClick={handleUpload} 
            disabled={uploading || !file}
            className={primaryButton}
          >
            {uploading ? 'UPLOADING' : 'COMMIT'}
          </button>
        </div>
      </div>

      {/* Repository */}
      <div className="anim-fade-up" style={{ animationDelay: '200ms' }}>
        <h2 className={smallLabel}>Your Resumes</h2>
        
        {resumes.length === 0 ? (
          <div className="py-24 animate-fade-in">
             <p className="text-xl font-medium tracking-tight text-slate-400 dark:text-slate-500">Repository empty.</p>
          </div>
        ) : (
          <div className="mt-12 overflow-x-auto w-full">
            <table className="w-full min-w-[700px] border-collapse text-left">
              <thead>
                <tr>
                  <th className={`p-4 pl-0 ${smallLabel} ${lineDivider}`}>File Name</th>
                  <th className={`p-4 ${smallLabel} ${lineDivider}`}>Storage Path</th>
                  <th className={`p-4 ${smallLabel} ${lineDivider}`}>Date Uploaded</th>
                  <th className={`p-4 pr-6 text-right ${smallLabel} ${lineDivider}`}>Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm font-normal">
                {resumes.map((resume, i) => (
                  <tr key={resume.id} className="group hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors duration-200">
                    <td className={`p-6 pl-0 ${lineDivider}`}>
                      <p className="font-semibold text-lg tracking-tight text-slate-900 dark:text-white">{resume.file_name}</p>
                    </td>
                    <td className={`p-6 ${lineDivider}`}>
                       <p className="text-xs text-slate-500 font-mono tracking-tighter truncate max-w-[200px]">{resume.storage_path}</p>
                    </td>
                    <td className={`p-6 ${lineDivider} whitespace-nowrap text-xs font-medium text-slate-500`}>
                      {new Date(resume.created_at).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })}
                    </td>
                    <td className={`p-6 pr-6 ${lineDivider} text-right`}>
                      <div className="flex justify-end gap-6 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleViewResume(resume.storage_path)}
                          className={secondaryAction}
                        >
                          View
                        </button>
                         <button 
                          onClick={() => handleDeleteResume(resume.id, resume.storage_path)}
                          className="text-red-500 hover:text-red-700 font-medium tracking-widest transition-colors uppercase text-xs"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}