'use client'

import Link from 'next/link'

export default function Home() {
  const lineDivider = "border-b border-slate-200/60 dark:border-slate-800/60"
  const primaryButton = "bg-[#66023c] text-white dark:bg-[#e5cfac] dark:text-[#66023c] font-medium tracking-tight px-8 py-4 transition-colors rounded-none hover:bg-black dark:hover:bg-white inline-flex items-center justify-center min-w-[200px]"
  const secondaryAction = "border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium tracking-tight px-8 py-4 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors rounded-none inline-flex items-center justify-center min-w-[200px]"

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 sm:p-24 selection:bg-[#66023c] selection:text-white">
      
      {/* CSS animations mimicking dashboard */}
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
      `}</style>

      <main className="flex max-w-5xl w-full flex-col gap-12 anim-fade-up" style={{ animationDelay: '0ms' }}>
        <h1 className="text-7xl font-semibold tracking-tighter sm:text-[9rem] leading-[0.85] text-slate-900 dark:text-white">
          ContextLock<span className="text-[#66023c] dark:text-[#d69cae]">.</span>
        </h1>
        
        <div className={`w-full ${lineDivider} pb-12`}>
          <p className="text-2xl font-light tracking-tight text-[#66023c] dark:text-[#d69cae]">
            Version Control for Your Resume.
          </p>
          <p className="mt-8 max-w-2xl text-lg text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
            Stop losing track of which resume went to which company. ContextLock enforces strict asset locking, ensuring you never fall into the application black hole again.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-6 anim-fade-up" style={{ animationDelay: '200ms' }}>
          <Link href="/login" className={primaryButton}>
            Get Started
          </Link>
          <a 
            href="https://github.com/HoverfishOTS/contextlock" 
            target="_blank"
            rel="noopener noreferrer"
            className={secondaryAction}
          >
            Repository
          </a>
        </div>
      </main>

      <section className="mt-32 grid max-w-5xl w-full grid-cols-1 sm:grid-cols-2 gap-x-24 gap-y-16">
        <div className={`anim-fade-up pb-8 ${lineDivider} sm:border-none`} style={{ animationDelay: '400ms' }}>
          <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#66023c] dark:text-[#d69cae] mb-4">Feature 01</h2>
          <h3 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white mb-6">Asset Locking.</h3>
          <p className="text-sm font-medium leading-loose text-slate-600 dark:text-slate-400">
            It is impossible to log an application without explicitly linking the specific PDF resume you used, ensuring you always know exactly what they saw.
          </p>
        </div>
        <div className="anim-fade-up pb-8" style={{ animationDelay: '500ms' }}>
          <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#967232] dark:text-[#e5cfac] mb-4">Feature 02</h2>
          <h3 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white mb-6">Ghost Analytics.</h3>
          <p className="text-sm font-medium leading-loose text-slate-600 dark:text-slate-400">
            Visualize your response rates and track industry ghosting trends in real-time across all of your active job outreach.
          </p>
        </div>
      </section>
    </div>
  )
}