'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [applications, setApplications] = useState<any[]>([])
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkUserAndFetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
      setUser(session.user)

      const { data, error } = await supabase
        .from('applications')
        .select('*, resumes(file_name, storage_path)')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })

      if (data) {
        setApplications(data)
      }
      setLoading(false)
    }
    
    checkUserAndFetchData()
  }, [router, supabase.auth])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    setApplications((prev) => 
      prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
    )

    const { error } = await supabase
      .from('applications')
      .update({ status: newStatus })
      .eq('id', id)

    if (error) {
      console.error('Failed to update status:', error)
    }
  }

  const handleDeleteApplication = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this application?')) return

    setApplications((prev) => prev.filter((app) => app.id !== id))

    const { error } = await supabase
      .from('applications')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Failed to delete application:', error)
    }
  }

  const handleViewResume = async (storagePath: string) => {
    if (!storagePath) return
    
    const { data, error } = await supabase.storage
      .from('resumes')
      .createSignedUrl(storagePath, 60)

    if (error) {
      console.error('Failed to generate URL:', error.message)
      return
    }

    if (data?.signedUrl) {
      window.open(data.signedUrl, '_blank')
    }
  }

  if (loading) {
    return <div className="p-8 text-slate-500">Loading dashboard...</div>
  }

  const totalApplications = applications.length
  const responses = applications.filter(app => app.status === 'Interview' || app.status === 'Rejected').length
  const responseRate = totalApplications > 0 ? Math.round((responses / totalApplications) * 100) : 0

  const statusCounts = {
    Applied: applications.filter(a => a.status === 'Applied').length,
    Interview: applications.filter(a => a.status === 'Interview').length,
    Rejected: applications.filter(a => a.status === 'Rejected').length,
    Ghosted: applications.filter(a => a.status === 'Ghosted').length,
  }

  const chartData = [
    { label: 'Applied', count: statusCounts.Applied, color: '#3b82f6' },
    { label: 'Interview', count: statusCounts.Interview, color: '#22c55e' },
    { label: 'Rejected', count: statusCounts.Rejected, color: '#ef4444' },
    { label: 'Ghosted', count: statusCounts.Ghosted, color: '#64748b' },
  ]

  const renderRingChart = () => {
    if (totalApplications === 0) {
      return <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-slate-100 text-sm text-slate-400 dark:border-slate-800 dark:text-slate-600">No Data</div>
    }

    let cumulativePercent = 0
    return (
      <svg viewBox="0 0 36 36" className="h-32 w-32 drop-shadow-sm">
        {chartData.map((slice, i) => {
          if (slice.count === 0) return null
          const percent = (slice.count / totalApplications) * 100
          const strokeDasharray = `${percent} ${100 - percent}`
          const strokeDashoffset = 100 - cumulativePercent + 25
          cumulativePercent += percent

          return (
            <circle
              key={i}
              cx="18"
              cy="18"
              r="15.915494309189533"
              fill="transparent"
              stroke={slice.color}
              strokeWidth="4"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-500 ease-in-out"
            />
          )
        })}
      </svg>
    )
  }

  return (
    <div className="mx-auto max-w-7xl p-8 animate-fade-in">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">ContextLock Dashboard</h1>
        <button onClick={handleSignOut} className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-600">
          Sign Out
        </button>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div>
            <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Ghost Analytics</h2>
            <div className="flex flex-col gap-2 text-sm text-slate-600 dark:text-slate-400">
              <p>Total Applications: <span className="font-bold text-slate-900 dark:text-slate-200">{totalApplications}</span></p>
              <p>Response Rate: <span className="font-bold text-slate-900 dark:text-slate-200">{responseRate}%</span></p>
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-slate-600 dark:text-slate-400">
              {chartData.map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span>{item.label}: {item.count}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mr-4">
            {renderRingChart()}
          </div>
        </div>
        
        <div className="flex flex-col items-start gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Quick Actions</h2>
          <button onClick={() => router.push('/resumes')} className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
            Manage Resumes &rarr;
          </button>
          <button onClick={() => router.push('/applications/new')} className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
            Log New Application &rarr;
          </button>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">Recent Applications</h2>
        {applications.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            No applications tracked yet.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <table className="w-full min-w-max border-collapse text-left">
              <thead className="bg-slate-50 text-sm font-semibold text-slate-900 dark:bg-slate-800/50 dark:text-slate-200">
                <tr>
                  <th className="border-b border-slate-200 p-4 dark:border-slate-800">Company</th>
                  <th className="border-b border-slate-200 p-4 dark:border-slate-800">Role</th>
                  <th className="border-b border-slate-200 p-4 dark:border-slate-800">Status</th>
                  <th className="border-b border-slate-200 p-4 dark:border-slate-800">Description</th>
                  <th className="border-b border-slate-200 p-4 dark:border-slate-800">Resume Used</th>
                  <th className="border-b border-slate-200 p-4 dark:border-slate-800">Date</th>
                  <th className="border-b border-slate-200 p-4 dark:border-slate-800">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm text-slate-600 dark:text-slate-400">
                {applications.map((app) => (
                  <tr key={app.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 dark:border-slate-800/50 dark:hover:bg-slate-800/20">
                    <td className="p-4 font-medium text-slate-900 dark:text-slate-200">{app.company_name}</td>
                    <td className="p-4">{app.job_title}</td>
                    <td className="p-4">
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusUpdate(app.id, e.target.value)}
                        className="block w-full rounded-md border border-slate-300 bg-white p-1.5 text-sm text-slate-900 focus:border-blue-500 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      >
                        <option value="Applied">Applied</option>
                        <option value="Interview">Interview</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Ghosted">Ghosted</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <div className="max-w-[200px] truncate" title={app.job_description}>
                        {app.job_description || 'None'}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span>{app.resumes?.file_name}</span>
                        <button 
                          onClick={() => handleViewResume(app.resumes?.storage_path)}
                          className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
                        >
                          View
                        </button>
                      </div>
                    </td>
                    <td className="p-4">{new Date(app.created_at).toLocaleDateString()}</td>
                    <td className="p-4">
                      <button 
                        onClick={() => handleDeleteApplication(app.id)}
                        className="font-medium text-red-500 hover:text-red-400"
                      >
                        Delete
                      </button>
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