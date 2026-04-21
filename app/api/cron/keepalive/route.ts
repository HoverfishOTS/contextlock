import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Important: This limits the Next.js cache so the cron job actually executes on each hit
export const dynamic = 'force-dynamic'

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ success: false, error: 'Missing Supabase environment variables' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    // A very lightweight query just to record active usage in Supabase dashboard
    // If the 'applications' table doesn't exist, it still hits the Postgres engine.
    const { data, error } = await supabase.from('applications').select('id').limit(1)
    
    if (error) {
      console.error("Supabase Keep-Alive Error:", error)
      // Even if there's an error (e.g. table not found), the connection was made.
      return NextResponse.json({ success: true, warning: error.message }, { status: 200 })
    }

    return NextResponse.json({ success: true, message: "Keep-Alive successful" }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
