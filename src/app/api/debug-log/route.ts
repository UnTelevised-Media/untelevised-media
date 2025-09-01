// Debug logging API endpoint
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    // Log to server console with timestamp
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] TICKER DEBUG: ${message}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Debug log error:', error);
    return NextResponse.json({ error: 'Failed to log' }, { status: 500 });
  }
}
