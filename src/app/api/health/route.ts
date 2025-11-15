import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    env: {
      hasCircleApiKey: !!process.env.CIRCLE_API_KEY,
      hasCircleClientKey: !!process.env.CIRCLE_CLIENT_KEY,
      hasEntitySecret: !!process.env.CIRCLE_ENTITY_SECRET
    }
  })
}