// Circle API Test Utility
// Run this to test your Circle testnet API keys

import { CircleDirectClient } from './circle-direct'

async function testCircleConnection() {
  const apiKey = process.env.CIRCLE_API_KEY
  const baseUrl = process.env.CIRCLE_BASE_URL || 'https://api.circle.com'
  
  console.log('🧪 Testing Circle API Connection...')
  console.log('API Key:', apiKey?.substring(0, 20) + '...')
  console.log('Base URL:', baseUrl)
  
  try {
    if (!apiKey) {
      throw new Error('CIRCLE_API_KEY environment variable is required')
    }
    
    const entitySecret = process.env.CIRCLE_ENTITY_SECRET
  if (!entitySecret) {
    throw new Error('CIRCLE_ENTITY_SECRET is required')
  }
  
  const client = new CircleDirectClient(apiKey, entitySecret, baseUrl)
    
    console.log('✅ Circle direct client initialized successfully')
    
    // Test connection first
    const isConnected = await client.testConnection()
    if (!isConnected) {
      throw new Error('Circle API connection test failed')
    }
    
    // Run the complete user setup workflow with proper order
    console.log('🔄 Running complete Circle user setup workflow...')
    const result = await client.setupUser()
    
    console.log('✅ Circle integration test successful!')
    console.log('User ID:', result.user.id)
    console.log('User Status:', result.user.status)
    console.log('User Token:', result.userToken.userToken.substring(0, 20) + '...')
    
    if (result.wallet) {
      console.log('Wallet Created:', {
        id: result.wallet.id,
        address: result.wallet.address,
        blockchain: result.wallet.blockchain
      })
    }
    
    return true
  } catch (error: any) {
    console.error('❌ Circle API test failed:', error)
    console.error('Error details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    })
    return false
  }
}

// Export for use in API routes
export { testCircleConnection }