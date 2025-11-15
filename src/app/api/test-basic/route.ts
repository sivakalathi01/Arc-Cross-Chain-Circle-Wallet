import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ 
    status: 'server-working',
    message: 'Basic server test successful',
    timestamp: new Date().toISOString()
  })
}