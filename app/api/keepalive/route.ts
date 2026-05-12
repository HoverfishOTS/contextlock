import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic'; // Prevent Next.js from caching this route

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Supabase credentials are not configured' },
        { status: 500 }
      );
    }

    // Initialize the Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Make a lightweight query to the database to ensure it's awake.
    // Querying a non-existent table is a safe, read-only way to hit the database 
    // without needing to know your actual schema.
    const { error } = await supabase.from('_keepalive_dummy_table_').select('*').limit(1);

    // We don't care if the table doesn't exist (PGRST116 or 42P01 error),
    // because hitting the database at all is what resets the pause timer!
    if (error && error.code !== 'PGRST116' && error.code !== '42P01') {
      // If there's an unexpected error (like network failure or invalid credentials)
      console.warn("Keep-alive ping got an unexpected error:", error);
      // We'll still return 200 because we reached the API, but we'll include the warning
      return NextResponse.json({
        status: 'success',
        message: 'Ping reached Supabase, but returned an unexpected error code.',
        details: error.message
      });
    }

    return NextResponse.json({
      status: 'success',
      message: 'Supabase pinged successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: `An unexpected error occurred: ${err.message}` },
      { status: 500 }
    );
  }
}
