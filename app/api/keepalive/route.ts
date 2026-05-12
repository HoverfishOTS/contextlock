import { NextResponse } from 'next/server';

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

    // Ping the Supabase REST API root
    // This returns the OpenAPI spec and counts as API activity
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      // Avoid caching the fetch request
      cache: 'no-store',
    });

    if (response.ok) {
      return NextResponse.json({
        status: 'success',
        message: 'Supabase pinged successfully',
        timestamp: new Date().toISOString(),
      });
    } else {
      return NextResponse.json(
        { error: `Supabase ping failed with status ${response.status}` },
        { status: response.status }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'An unexpected error occurred while pinging Supabase' },
      { status: 500 }
    );
  }
}
