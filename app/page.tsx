import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 text-center sm:p-20">
      <main className="flex max-w-3xl flex-col items-center gap-8">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl">
          ContextLock
        </h1>
        <p className="text-xl font-medium sm:text-2xl">
          Version Control for Your Resume
        </p>
        <p className="max-w-2xl text-base text-gray-500 sm:text-lg">
          Stop losing track of which resume went to which company. ContextLock enforces asset locking, 
          ensuring you never fall into the application black hole again.
        </p>
        
        <div className="mt-4 flex flex-col gap-4 sm:flex-row">
          <Link 
            href="/login" 
            className="rounded-md bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Get Started
          </Link>
          <a 
            href="#features" 
            className="rounded-md bg-transparent px-6 py-3 text-sm font-semibold text-gray-900 border border-gray-300 shadow-sm hover:bg-gray-50 dark:text-white dark:border-gray-700 dark:hover:bg-gray-800"
          >
            Learn More
          </a>
        </div>
      </main>

      <section id="features" className="mt-32 grid max-w-5xl grid-cols-1 gap-8 text-left sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-xl font-bold">Asset Locking</h2>
          <p className="mt-2 text-gray-500">
            Impossible to log an application without committing the specific PDF file used.
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-xl font-bold">Ghost Analytics</h2>
          <p className="mt-2 text-gray-500">
            Visualize your response rates and track industry ghosting trends in real-time.
          </p>
        </div>
      </section>
    </div>
  )
}