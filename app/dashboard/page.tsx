'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [applications, setApplications] = useState<any[]>([])
  const [isMounted, setIsMounted] = useState(false)
  
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list')
  const [selectedApp, setSelectedApp] = useState<any | null>(null)
  const [hoveredChartSlice, setHoveredChartSlice] = useState<string | null>(null)
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [editedDescriptionText, setEditedDescriptionText] = useState('')

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    setIsMounted(true)
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
      // Add slight delay to allow animations to feel deliberate
      setTimeout(() => setLoading(false), 300)
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
    if (!window.confirm('Delete application record?')) return

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

  const handleEditDescription = () => {
    setIsEditingDescription(true)
    setEditedDescriptionText(selectedApp?.job_description || '')
  }

  const handleSaveDescription = async () => {
    if (!selectedApp) return

    const { error } = await supabase
      .from('applications')
      .update({ job_description: editedDescriptionText })
      .eq('id', selectedApp.id)

    if (error) {
      console.error('Failed to update description:', error)
      return
    }

    const updatedApp = { ...selectedApp, job_description: editedDescriptionText }
    setApplications((prev) =>
      prev.map((app) => (app.id === selectedApp.id ? updatedApp : app))
    )
    setSelectedApp(updatedApp)
    setIsEditingDescription(false)
  }

  // --- Analytics Calculations ---
  const totalApplications = applications.length
  const statusCounts = useMemo(() => ({
    Applied: applications.filter(a => a.status === 'Applied').length,
    Interview: applications.filter(a => a.status === 'Interview').length,
    Rejected: applications.filter(a => a.status === 'Rejected').length,
    Ghosted: applications.filter(a => a.status === 'Ghosted').length,
  }), [applications])

  const responses = statusCounts.Interview + statusCounts.Rejected
  const responseRate = totalApplications > 0 ? Math.round((responses / totalApplications) * 100) : 0
  const interviewRate = totalApplications > 0 ? Math.round((statusCounts.Interview / totalApplications) * 100) : 0

  const chartData = [
    { label: 'Applied', count: statusCounts.Applied, color: '#66023c' }, // Tyrian Purple
    { label: 'Interview', count: statusCounts.Interview, color: '#967232' }, // Warm Gold
    { label: 'Rejected', count: statusCounts.Rejected, color: '#d69cae' }, // Soft Rose
    { label: 'Ghosted', count: statusCounts.Ghosted, color: '#94a3b8' }, // Cool Slate
  ]

  // Timeline Data (Last 14 Days)
  const timelineData = useMemo(() => {
    const days = 14
    const data = []
    const today = new Date()
    today.setHours(23, 59, 59, 999)

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const dateString = d.toISOString().split('T')[0]
      const count = applications.filter(app => {
        const appDate = new Date(app.created_at).toISOString().split('T')[0]
        return appDate === dateString
      }).length
      
      data.push({
        date: dateString,
        displayDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count
      })
    }
    return data
  }, [applications])
  
  const maxTimelineCount = Math.max(...timelineData.map(d => d.count), 1)

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-transparent">
        <div className="h-[1px] w-64 bg-slate-200/50 dark:bg-slate-800/50 overflow-hidden relative">
          <div className="absolute top-0 left-0 h-full w-1/3 bg-[#66023c] animate-[slide_1.5s_infinite_ease-in-out]"></div>
        </div>
        <style jsx>{`@keyframes slide { 0% { left: -33%; } 100% { left: 100%; } }`}</style>
      </div>
    )
  }

  // --- Pure Swiss Minimalist Constants (but with Tyrian Colors) ---
  const lineDivider = "border-b border-slate-200/60 dark:border-slate-800/60"
  const primaryButton = "bg-[#66023c] text-white dark:bg-[#e5cfac] dark:text-[#66023c] font-medium tracking-tight px-6 py-2.5 transition-colors rounded-none hover:bg-black dark:hover:bg-white"
  const secondaryAction = "text-[#66023c] hover:text-[#400529] font-medium tracking-tight dark:text-[#d69cae] dark:hover:text-white transition-colors"
  const smallLabel = "text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-500"

  const getStatusBadge = (status: string) => {
    const base = "inline-flex px-2 py-0.5 text-xs font-semibold tracking-wide rounded-none"
    switch (status) {
      case 'Applied': return `${base} bg-[#66023c]/10 text-[#66023c] dark:bg-[#66023c]/20 dark:text-[#d69cae]`
      case 'Interview': return `${base} bg-black text-white dark:bg-[#e5cfac] dark:text-black`
      case 'Rejected': return `${base} bg-[#d69cae]/20 text-[#a34a67] dark:bg-[#d69cae]/10 dark:text-[#d69cae]`
      case 'Ghosted': return `${base} bg-slate-200/50 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400`
      default: return `${base} bg-slate-200/50 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400`
    }
  }

  // Ring chart adapted for pure Swiss empty space
  const renderRingChart = () => {
    if (totalApplications === 0) {
      return <div className="flex h-32 w-32 items-center justify-center rounded-full border border-slate-200/50 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:border-slate-800/50">Empty</div>
    }

    let cumulativePercent = 0
    return (
      <div className="relative h-48 w-48 group">
        <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90 overflow-hidden rounded-full">
          {chartData.map((slice, i) => {
            if (slice.count === 0) return null
            const percent = (slice.count / totalApplications) * 100
            const strokeDasharray = `${percent} ${100 - percent}`
            const strokeDashoffset = -cumulativePercent
            cumulativePercent += percent

            const isHovered = hoveredChartSlice === slice.label

            return (
              <g key={i}>
                {/* Visual Ring */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.91549430"
                  fill="transparent"
                  stroke={slice.color}
                  strokeWidth={isHovered ? "3" : "1.5"}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className={`transition-all duration-300 ease-out origin-center ${isHovered ? 'opacity-100' : 'opacity-80'}`}
                  style={{ strokeDasharray: isMounted ? strokeDasharray : '0 100', transitionDelay: `${i * 100}ms` }}
                />
                {/* Interaction Hitbox (Giant invisible pie wrapper) */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.91549430"
                  fill="transparent"
                  stroke="transparent"
                  strokeWidth="15"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredChartSlice(slice.label)}
                  onMouseLeave={() => setHoveredChartSlice(null)}
                />
              </g>
            )
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-all duration-300">
          {hoveredChartSlice ? (
            <>
              <span className="text-5xl font-light text-slate-900 dark:text-white tracking-tighter tabular-nums leading-none">
                {chartData.find(d => d.label === hoveredChartSlice)?.count}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-2">{hoveredChartSlice}</span>
            </>
          ) : (
             <>
               <span className="text-5xl font-light text-slate-900 dark:text-white tracking-tighter tabular-nums leading-none">{totalApplications}</span>
               <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-2">Total</span>
             </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl p-8 lg:p-16 xl:p-24 selection:bg-[#66023c] selection:text-white">
      
      {/* Add cohesive CSS entrance animations */}
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .anim-fade-up {
          opacity: 0;
          animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        @media (prefers-color-scheme: dark) {
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #334155;
          }
        }
      `}</style>

      {/* Header */}
      <div className={`mb-24 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between ${lineDivider} pb-8 anim-fade-up`} style={{ animationDelay: '0ms' }}>
        <div>
          <h1 className="text-6xl md:text-8xl font-semibold tracking-tighter text-slate-900 dark:text-white leading-[0.9]">
            ContextLock<span className="text-[#66023c] dark:text-[#d69cae]">.</span>
          </h1>
          <p className="mt-4 text-sm font-medium tracking-wide text-slate-500 dark:text-slate-400">
            Pipeline Dashboard
          </p>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={() => router.push('/applications/new')} className={primaryButton}>
            New Application
          </button>
          <button onClick={handleSignOut} className="text-sm font-medium text-slate-400 hover:text-slate-900 dark:text-slate-600 dark:hover:text-white transition-colors">
            Sign out
          </button>
        </div>
      </div>

      {/* Hero Analytics Section (Pure Swiss Grid) */}
      <div className={`mb-32 grid grid-cols-1 gap-16 md:grid-cols-2 lg:grid-cols-4 ${lineDivider} pb-24 items-end`}>
        
        {/* Metric 1 */}
        <div className="flex flex-col justify-end h-48 anim-fade-up" style={{ animationDelay: '100ms' }}>
          <h2 className={smallLabel}>Total Volume</h2>
          <span className="mt-4 text-6xl font-light tracking-tighter leading-none text-slate-900 dark:text-white tabular-nums">{statusCounts.Applied}</span>
          <span className="mt-4 text-xs font-semibold uppercase tracking-widest text-[#66023c] dark:text-[#d69cae]">Applied</span>
        </div>

        {/* Metric 2 */}
        <div className="flex flex-col justify-end h-48 anim-fade-up" style={{ animationDelay: '200ms' }}>
          <h2 className={smallLabel}>Conversion</h2>
          <span className="mt-4 text-6xl font-light tracking-tighter leading-none text-slate-900 dark:text-white tabular-nums">{interviewRate}<span className="text-4xl text-slate-300 dark:text-slate-700">%</span></span>
          <span className="mt-4 text-xs font-semibold uppercase tracking-widest text-[#967232] dark:text-[#e5cfac]">Interview Rate</span>
        </div>

        {/* Breakdown Ring Chart */}
        <div className="flex flex-col justify-between h-48 items-start anim-fade-up" style={{ animationDelay: '300ms' }}>
          <div className="w-full flex justify-between items-baseline mb-6">
             <h2 className={smallLabel}>Distribution</h2>
          </div>
          <div className="flex items-center gap-8 -translate-x-4">
             {renderRingChart()}
          </div>
        </div>

        {/* Application Timeline (Ultra Clean Bar Chart) */}
        <div className="flex flex-col justify-between h-48 w-full anim-fade-up" style={{ animationDelay: '400ms' }}>
          <div className="flex justify-between items-baseline mb-6">
             <h2 className={smallLabel}>Velocity (14d)</h2>
          </div>
          <div className="mt-auto flex h-32 pl-8 items-end justify-between gap-0.5 border-b border-slate-200 dark:border-slate-800 pb-1 relative w-full">
            
            {/* Horizontal Grid Lines */}
            <div className="absolute inset-0 left-8 flex flex-col justify-between pointer-events-none z-0 border-t border-slate-100 dark:border-slate-800/30">
               <div className="w-full h-[1px] bg-slate-100 dark:bg-slate-800/30"></div>
               <div className="w-full h-[1px] bg-slate-100 dark:bg-slate-800/30"></div>
            </div>
            
            {/* Y-Axis Labels */}
            <div className="absolute left-0 top-0 bottom-1 flex flex-col justify-between items-start text-[9px] text-slate-400 font-bold uppercase tracking-widest py-0">
                <span>{maxTimelineCount}</span>
                <span>{Math.round(maxTimelineCount/2)}</span>
                <span>0</span>
            </div>

            {timelineData.map((day, i) => {
              const heightPercent = day.count > 0 ? (day.count / maxTimelineCount) * 100 : 0
              return (
                <div key={day.date} className="group relative flex flex-1 flex-col items-center justify-end h-full z-10">
                  <div 
                    className={`w-full max-w-[4px] transition-all duration-700 hover:bg-[#66023c] dark:hover:bg-[#d69cae] ${day.count > 0 ? 'bg-slate-300 dark:bg-slate-700' : 'bg-transparent'}`}
                    style={{ 
                        height: isMounted ? `${Math.max(heightPercent, day.count === 0 ? 0 : 5)}%` : '0%',
                        transitionDelay: `${i * 30}ms`
                    }}
                  ></div>
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black px-3 py-1 text-xs font-semibold text-white dark:bg-white dark:text-black opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10 hidden sm:block">
                    {day.count} on {day.displayDate}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main List Section */}
      <div className="mb-12 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between anim-fade-up" style={{ animationDelay: '500ms' }}>
        <h2 className="text-4xl font-medium tracking-tight text-slate-900 dark:text-white">Active Applications.</h2>
        <div className="flex items-center gap-8">
          <button onClick={() => router.push('/resumes')} className={secondaryAction}>
             Manage Resumes
          </button>
          <div className="flex items-center gap-4 text-[11px] font-semibold uppercase tracking-widest">
            <button
              onClick={() => setViewMode('list')}
              className={`pb-1 border-b-[2px] transition-colors ${
                viewMode === 'list'
                  ? 'border-slate-900 text-slate-900 dark:border-white dark:text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-600 dark:text-slate-600 dark:hover:text-slate-400'
              }`}
            >
              Table
            </button>
            <button
              onClick={() => setViewMode('card')}
              className={`pb-1 border-b-[2px] transition-colors ${
                viewMode === 'card'
                  ? 'border-slate-900 text-slate-900 dark:border-white dark:text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-600 dark:text-slate-600 dark:hover:text-slate-400'
              }`}
            >
              Cards
            </button>
          </div>
        </div>
      </div>

      <div className="anim-fade-up" style={{ animationDelay: '600ms' }}>
        {applications.length === 0 ? (
          <div className="w-full border-t border-b border-slate-200/60 dark:border-slate-800/60 py-32 text-center flex flex-col items-center">
            <p className="text-xl font-medium tracking-tight text-slate-400 dark:text-slate-500 mb-6">Pipeline empty.</p>
            <button onClick={() => router.push('/applications/new')} className={primaryButton}>Begin Logging</button>
          </div>
        ) : viewMode === 'list' ? (
          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[900px] border-collapse text-left">
              <thead>
                <tr>
                  <th className={`p-4 pl-0 ${smallLabel} ${lineDivider}`}>Company</th>
                  <th className={`p-4 ${smallLabel} ${lineDivider}`}>Status</th>
                  <th className={`p-4 ${smallLabel} ${lineDivider}`}>Job Description</th>
                  <th className={`p-4 ${smallLabel} ${lineDivider}`}>Resume</th>
                  <th className={`p-4 ${smallLabel} ${lineDivider}`}>Date Applied</th>
                  <th className={`p-4 pr-6 text-right ${smallLabel} ${lineDivider}`}>Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm font-normal">
                {applications.map((app, i) => (
                  <tr key={app.id} className="group hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors duration-200">
                    <td className={`p-5 pl-0 ${lineDivider}`}>
                      <p className="font-semibold text-lg tracking-tight text-slate-900 dark:text-white leading-tight">{app.company_name}</p>
                      <p className="mt-1 text-xs text-slate-500">{app.job_title}</p>
                    </td>
                    <td className={`p-5 ${lineDivider}`}>
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusUpdate(app.id, e.target.value)}
                        className="block w-28 border-none bg-transparent py-1.5 pl-0 pr-8 text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white focus:outline-none focus:ring-0 appearance-none cursor-pointer"
                      >
                        <option value="Applied" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">APPLIED</option>
                        <option value="Interview" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">INTERVIEW</option>
                        <option value="Rejected" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">REJECTED</option>
                        <option value="Ghosted" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">GHOSTED</option>
                      </select>
                    </td>
                    <td className={`p-5 ${lineDivider}`}>
                      <div className="max-w-[240px] truncate text-slate-500 dark:text-slate-500" title={app.job_description}>
                        {app.job_description ? app.job_description : <span className="opacity-30">No payload</span>}
                      </div>
                    </td>
                    <td className={`p-5 ${lineDivider}`}>
                      {app.resumes?.file_name ? (
                        <button 
                          onClick={() => handleViewResume(app.resumes?.storage_path)}
                          className="text-xs font-medium text-slate-500 hover:text-[#66023c] dark:hover:text-[#d69cae] transition-colors flex items-center gap-2"
                        >
                           <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                          <span className="max-w-[120px] truncate">{app.resumes.file_name}</span>
                        </button>
                      ) : <span className="text-[10px] text-slate-300 uppercase tracking-widest w-full text-center block">None</span>}
                    </td>
                    <td className={`p-5 ${lineDivider} whitespace-nowrap text-xs font-medium text-slate-500`}>
                      {new Date(app.created_at).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })}
                    </td>
                    <td className={`p-5 pr-6 ${lineDivider} text-right`}>
                      <div className="flex justify-end gap-6 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => setSelectedApp(app)}
                          className={secondaryAction}
                        >
                          View
                        </button>
                        <button 
                          onClick={() => handleDeleteApplication(app.id)}
                          className="text-red-500 hover:text-red-700 font-medium tracking-tight transition-colors text-xs"
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
        ) : (
          <div className="grid grid-cols-1 gap-16 sm:grid-cols-2 lg:grid-cols-3">
            {applications.map((app, i) => (
              <div key={app.id} className="flex flex-col border-t border-slate-200/60 dark:border-slate-800/60 pt-6 transition-transform">
                <div className="mb-6 flex items-start justify-between">
                  <div>
                    <h3 className="text-3xl font-semibold tracking-tight leading-none text-slate-900 dark:text-white">{app.company_name}</h3>
                    <p className="mt-2 text-sm text-slate-500">{app.job_title}</p>
                  </div>
                  <span className={getStatusBadge(app.status)}>
                    {app.status}
                  </span>
                </div>
                
                <div className="flex-1 mb-8">
                  <p className="line-clamp-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400" title={app.job_description}>
                    {app.job_description || <span className="opacity-30 italic">No description provided.</span>}
                  </p>
                </div>

                {app.resumes?.file_name && (
                  <div className="mb-6">
                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">Attached Resume</p>
                     <button 
                       onClick={() => handleViewResume(app.resumes?.storage_path)}
                       className="text-sm font-medium text-slate-800 dark:text-slate-200 hover:text-[#66023c] transition-colors truncate block"
                     >
                       {app.resumes.file_name}
                     </button>
                  </div>
                )}
                
                <div className="flex items-center justify-between border-t border-slate-200/40 dark:border-slate-800/40 pt-4 mt-auto">
                   <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                    {new Date(app.created_at).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })}
                  </span>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setSelectedApp(app)}
                      className={secondaryAction}
                    >
                      View Record
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Swiss Minimalist Full-Screen Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white/95 dark:bg-[#0a0508]/98 backdrop-blur-md overflow-hidden animate-fade-in">
          <div className="mx-auto max-w-5xl w-full h-full flex flex-col px-8 py-16 xl:px-0">
            <div className={`flex shrink-0 items-center justify-between ${lineDivider} pb-8 mb-16 anim-fade-up`} style={{ animationDelay: '0ms' }}>
              <h2 className={smallLabel}>Application Record</h2>
              <button
                onClick={() => {
                  setSelectedApp(null)
                  setIsEditingDescription(false)
                }}
                className="text-xs uppercase tracking-widest font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Close / Esc
              </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-24 flex-1 min-h-0 overflow-hidden">
              {/* Left Column: Core Meta */}
              <div className="flex-1 lg:max-w-sm shrink-0 overflow-y-auto pr-4 pb-16 custom-scrollbar anim-fade-up" style={{ animationDelay: '100ms' }}>
                <span className={`mb-8 ${getStatusBadge(selectedApp.status)}`}>{selectedApp.status}</span>
                <h1 className="text-6xl md:text-7xl font-semibold tracking-tighter text-slate-900 dark:text-white leading-[0.9] mb-6">{selectedApp.company_name}</h1>
                <h2 className="text-xl font-normal text-slate-500 mb-16">{selectedApp.job_title}</h2>

                <div className="flex flex-col gap-12">
                  <div>
                    <p className={smallLabel}>Date Logged</p>
                    <p className="mt-3 text-sm font-medium">{new Date(selectedApp.created_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                  <div>
                    <p className={smallLabel}>Resume Used</p>
                    {selectedApp.resumes?.file_name ? (
                       <button 
                         onClick={() => handleViewResume(selectedApp.resumes?.storage_path)}
                         className="mt-3 text-sm font-medium text-[#66023c] dark:text-[#d69cae] hover:text-slate-900 dark:hover:text-white transition-colors"
                       >
                         {selectedApp.resumes.file_name}
                       </button>
                    ) : <span className="mt-3 text-sm text-slate-400 block">None.</span>}
                  </div>
                </div>
              </div>

              {/* Right Column: Description Focus */}
              <div className="flex-1 lg:flex-[2] overflow-y-auto pr-8 pb-16 custom-scrollbar anim-fade-up" style={{ animationDelay: '200ms' }}>
                <div className="mb-8 flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/50 pb-4">
                  <h3 className={smallLabel}>Job Description</h3>
                  {!isEditingDescription && (
                    <button
                      onClick={handleEditDescription}
                      className={secondaryAction}
                    >
                      Edit 
                    </button>
                  )}
                </div>
                
                {isEditingDescription ? (
                  <div className="flex flex-col gap-6 animate-fade-in">
                    <textarea
                      value={editedDescriptionText}
                      onChange={(e) => setEditedDescriptionText(e.target.value)}
                      className="min-h-[400px] w-full bg-slate-50 dark:bg-slate-900 p-8 text-sm leading-loose text-slate-900 dark:text-slate-100 focus:outline-none border-l-2 border-[#66023c] resize-y"
                      placeholder="Paste unstructured description..."
                    />
                    <div className="flex gap-4">
                      <button
                        onClick={handleSaveDescription}
                        className={primaryButton}
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setIsEditingDescription(false)}
                        className="px-6 py-2.5 text-xs uppercase tracking-widest font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="min-h-[300px] whitespace-pre-wrap text-sm leading-loose text-slate-700 dark:text-slate-300">
                    {selectedApp.job_description || <span className="opacity-30 italic">No payload content.</span>}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}