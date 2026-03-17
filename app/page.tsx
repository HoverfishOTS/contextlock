import Link from 'next/link'
import NetworkMesh from './components/NetworkMesh'

export default function Home() {
  return (
    <>
      <NetworkMesh />
      <div className="flex min-h-screen flex-col items-center justify-center p-8 text-center sm:p-20 relative z-10">
      <main className="flex max-w-3xl flex-col items-center gap-8 animate-fade-in">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl text-slate-900 dark:text-white">
          ContextLock
        </h1>
        <p className="text-xl font-medium sm:text-2xl text-blue-600 dark:text-blue-400">
          Version Control for Your Resume
        </p>
        <p className="max-w-2xl text-base text-slate-600 dark:text-slate-400 sm:text-lg">
          Stop losing track of which resume went to which company. ContextLock enforces asset locking, 
          ensuring you never fall into the application black hole again.
        </p>
        
        <div className="mt-4 flex flex-col gap-4 sm:flex-row w-full sm:w-auto">
          <Link 
            href="/login" 
            className="w-full sm:w-auto rounded-lg bg-blue-600 px-8 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-blue-500 hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
          >
            Get Started
          </Link>
          <a 
            href="https://github.com/HoverfishOTS/contextlock" 
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto rounded-lg bg-white dark:bg-slate-900 px-8 py-3 text-sm font-semibold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:-translate-y-0.5 hover:shadow-md"
          >
            Learn More
          </a>
        </div>
      </main>

      <section id="features" className="mt-32 grid max-w-5xl grid-cols-1 gap-8 text-left sm:grid-cols-2 opacity-0 animate-[fadeIn_0.5s_ease-out_0.2s_forwards]">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/50 hover:border-blue-200 dark:hover:border-blue-900">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Asset Locking</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Impossible to log an application without committing the specific PDF file used.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/50 hover:border-blue-200 dark:hover:border-blue-900">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Ghost Analytics</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Visualize your response rates and track industry ghosting trends in real-time.
          </p>
        </div>
      </section>
    </div>
    </>
  )
}