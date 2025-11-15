import { NextRequest, NextResponse } from 'next/server'
import { CircleDirectClient } from '@/lib/circle-direct'

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Setting up Circle user with working direct API...')
    
    const apiKey = process.env.CIRCLE_API_KEY
    const entitySecret = process.env.CIRCLE_ENTITY_SECRET
    
    if (!apiKey) {
      throw new Error('CIRCLE_API_KEY environment variable is required')
    }
    
    if (!entitySecret) {
      throw new Error('CIRCLE_ENTITY_SECRET environment variable is required')
    }

    const client = new CircleDirectClient(apiKey, entitySecret)
    
    // Run the complete user setup workflow (this works!)
    const result = await client.setupUser()
    
    console.log('✅ Circle user setup completed successfully!')
    
    return NextResponse.json({
      success: true,
      message: 'Circle wallet created successfully',
      user: result.user,
      userToken: result.userToken,
      wallet: result.wallet,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('❌ Circle user setup failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      message: 'Failed to create Circle wallet',
      recommendation: 'Check your Circle testnet API keys and ensure entity secret is configured'
    }, { status: 500 })
  }
}