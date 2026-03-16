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
    return <div className="p-8">Loading dashboard...</div>
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
    { label: 'Ghosted', count: statusCounts.Ghosted, color: '#9ca3af' },
  ]

  const renderRingChart = () => {
    if (totalApplications === 0) {
      return <div className="text-gray-400 flex items-center justify-center h-32 w-32 border-4 border-gray-100 rounded-full">No Data</div>
    }

    let cumulativePercent = 0
    return (
      <svg viewBox="0 0 36 36" className="w-32 h-32">
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
    <div className="max-w-7xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">ContextLock Dashboard</h1>
        <button onClick={handleSignOut} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
          Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="border p-6 rounded shadow-sm flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-4">Ghost Analytics</h2>
            <div className="flex flex-col gap-2">
              <p>Total Applications: <span className="font-bold">{totalApplications}</span></p>
              <p>Response Rate: <span className="font-bold">{responseRate}%</span></p>
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              {chartData.map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span>{item.label}: {item.count}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mr-4">
            {renderRingChart()}
          </div>
        </div>
        
        <div className="border p-6 rounded shadow-sm flex flex-col items-start gap-4">
          <h2 className="text-xl font-semibold">Quick Actions</h2>
          <button onClick={() => router.push('/resumes')} className="text-blue-600 hover:underline">
            Manage Resumes
          </button>
          <button onClick={() => router.push('/applications/new')} className="text-blue-600 hover:underline">
            Log New Application
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Recent Applications</h2>
        {applications.length === 0 ? (
          <div className="border rounded p-8 text-center text-gray-500">
            No applications tracked yet.
          </div>
        ) : (
          <div className="border rounded overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-max">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="p-4 border-b">Company</th>
                  <th className="p-4 border-b">Role</th>
                  <th className="p-4 border-b">Status</th>
                  <th className="p-4 border-b">Description</th>
                  <th className="p-4 border-b">Resume Used</th>
                  <th className="p-4 border-b">Date</th>
                  <th className="p-4 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id} className="border-b last:border-0 hover:bg-gray-50 dark:hover:bg-gray-900">
                    <td className="p-4 font-medium">{app.company_name}</td>
                    <td className="p-4">{app.job_title}</td>
                    <td className="p-4">
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusUpdate(app.id, e.target.value)}
                        className="bg-white border border-gray-300 text-gray-900 text-sm rounded focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        <option value="Applied">Applied</option>
                        <option value="Interview">Interview</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Ghosted">Ghosted</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <div className="max-w-[200px] truncate text-sm text-gray-600 dark:text-gray-400" title={app.job_description}>
                        {app.job_description || 'None'}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <span>{app.resumes?.file_name}</span>
                        <button 
                          onClick={() => handleViewResume(app.resumes?.storage_path)}
                          className="text-blue-600 hover:underline font-semibold"
                        >
                          View
                        </button>
                      </div>
                    </td>
                    <td className="p-4 text-sm">{new Date(app.created_at).toLocaleDateString()}</td>
                    <td className="p-4">
                      <button 
                        onClick={() => handleDeleteApplication(app.id)}
                        className="text-red-500 hover:underline text-sm font-semibold"
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