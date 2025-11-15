import { NextRequest, NextResponse } from 'next/server'
import { CircleDirectClient } from '@/lib/circle-direct'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing Direct Circle API Integration...')
    
    const apiKey = process.env.CIRCLE_API_KEY
    const entitySecret = process.env.CIRCLE_ENTITY_SECRET
    
    if (!apiKey) {
      throw new Error('CIRCLE_API_KEY environment variable is required')
    }
    
    if (!entitySecret) {
      throw new Error('CIRCLE_ENTITY_SECRET environment variable is required')
    }

    const client = new CircleDirectClient(apiKey, entitySecret)
    
    // Test connection first
    const isConnected = await client.testConnection()
    if (!isConnected) {
      throw new Error('Circle API connection test failed')
    }

    // Run the complete user setup workflow
    console.log('🔄 Running complete Circle user setup workflow...')
    const result = await client.setupUser()
    
    return NextResponse.json({
      success: true,
      message: 'Direct Circle API integration successful!',
      data: {
        userId: result.user.id,
        userStatus: result.user.status,
        userToken: result.userToken.userToken.substring(0, 20) + '...',
        encryptionKey: result.userToken.encryptionKey.substring(0, 20) + '...',
        wallet: result.wallet ? {
          id: result.wallet.id,
          address: result.wallet.address,
          blockchain: result.wallet.blockchain
        } : null
      },
      environment: 'testnet',
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('❌ Direct Circle test error:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      message: 'Failed to test direct Circle integration',
      recommendation: 'Check your Circle testnet API keys and ensure entity secret is configured'
    }, { status: 500 })
  }
}