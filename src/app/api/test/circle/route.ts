import { NextRequest, NextResponse } from 'next/server'
import { testCircleConnection } from '@/lib/test-circle'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing Circle testnet connection...')
    
    const isConnected = await testCircleConnection()
    
    if (isConnected) {
      return NextResponse.json({
        success: true,
        message: 'Circle testnet API connection successful!',
        environment: 'testnet',
        timestamp: new Date().toISOString()
      })
    } else {
      return NextResponse.json({
        success: false,
        message: 'Circle API connection failed',
        recommendation: 'Check your API keys in Circle console'
      }, { status: 400 })
    }
  } catch (error: any) {
    console.error('❌ Circle test error:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      message: 'Failed to test Circle connection',
      recommendation: 'Verify your Circle testnet API keys'
    }, { status: 500 })
  }
}