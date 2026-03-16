# ContextLock

Version Control for Your Resume. 

ContextLock is a web application designed to solve the "Application Black Hole" for high-volume job seekers. It forces users to link a specific version of their resume (PDF) to every job application they log, ensuring exact historical context for interviews. 

Developed as an MVP for CS4800: Software Engineering.

## Features

* **Asset Locking:** Users cannot log a job application without committing the specific PDF resume used for that role.
* **Resume Storage:** Secure cloud storage and retrieval of all uploaded resumes.
* **Application Tracker:** A centralized dashboard to manage application statuses (Applied, Interview, Rejected, Ghosted) and job descriptions.
* **Ghost Analytics:** Real-time data visualization of application volume and response rates.

## Tech Stack

* **Frontend:** Next.js (App Router), React, Tailwind CSS
* **Backend:** Next.js API Routes, Supabase
* **Database & Auth:** Supabase (PostgreSQL, Supabase Auth)
* **Storage:** Supabase Storage (Object storage for PDFs)
* **Deployment:** Vercel

## Local Development Setup

1. **Clone the repository:**
    ```bash
    git clone [https://github.com/HoverfishOTS/contextlock.git](https://github.com/HoverfishOTS/contextlock.git)
    cd contextlock
    ```

2. **Install dependencies:**
    ```bash
    npm install
    ```

3. **Set up Supabase:**
   * Create a new project on Supabase.
   * Navigate to the SQL Editor and run the schema setup script (refer to project documentation for the exact SQL script to provision tables, triggers, and Row Level Security policies).

4. **Configure Environment Variables:**
   * Create a `.env.local` file in the root directory.
   * Add your Supabase project credentials (NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY).

5. **Run the development server:**
    ```bash
    npm run dev
    ```
    Open http://localhost:3000 with your browser to see the result.

## Architecture

ContextLock utilizes a client-side architecture where the Next.js frontend communicates directly with Supabase via a singleton client. Security is enforced at the database level using PostgreSQL Row Level Security (RLS) policies, ensuring users can only access their own uploaded assets and application records.

## License

Distributed under the MIT License. See LICENSE for more information.