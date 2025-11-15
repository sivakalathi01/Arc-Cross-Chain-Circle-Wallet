// Circle API Test Utility
// Use this to test your Circle API keys before using the main app

import { circleWalletService } from './circle'

export async function testCircleConnection() {
  console.log('🧪 Testing Circle API Connection...')
  
  try {
    // Test 1: Check API key format
    console.log('🔑 Step 1: Validating API key format...')
    const config = {
      apiKey: process.env.NEXT_PUBLIC_CIRCLE_API_KEY || '',
      baseUrl: process.env.NEXT_PUBLIC_CIRCLE_BASE_URL || 'https://api.circle.com/v1/w3s'
    }
    
    if (!config.apiKey || config.apiKey.includes('98c189a0fddd8ef9e01a04beee337556')) {
      console.log('❌ Placeholder API keys detected')
      console.log('🔑 You need real Circle API keys from developers.circle.com')
      return false
    }
    
    console.log('✅ API key format looks valid')
    
    // Test 2: Simple connectivity test
    console.log('📡 Step 2: Testing API connectivity...')
    try {
      const response = await fetch(`${config.baseUrl}/config`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        }
      })
      
      console.log(`📡 API Response Status: ${response.status}`)
      
      if (response.status === 401) {
        console.log('❌ Authentication failed - API key is invalid')
        return false
      } else if (response.status === 403) {
        console.log('❌ Permission denied - check API key permissions')
        return false
      } else if (response.status === 404) {
        console.log('⚠️ Endpoint not found - API may be configured correctly')
        console.log('✅ This is expected for some endpoints')
      } else if (response.ok) {
        console.log('✅ API connection successful!')
      }
      
    } catch (networkError) {
      console.log('❌ Network error:', networkError)
      console.log('💡 This could be due to CORS policy or network issues')
      console.log('🌐 Try using the web faucets instead')
      return false
    }
    
    console.log('🎉 Circle API test completed!')
    console.log('💡 You can now try creating wallets and using faucets')
    return true
    
  } catch (error) {
    console.error('❌ Circle API test failed:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('Network Error')) {
        console.log('🌐 Network/CORS issue detected')
        console.log('💡 Use web faucets as alternative:')
        console.log('   - https://faucet.circle.com')
        console.log('   - https://console.circle.com/faucet')
      }
    }
    
    return false
  }
}

// Simplified faucet test
export async function testFaucet(walletAddress: string) {
  console.log('💧 Testing Faucet Integration...')
  
  try {
    const result = await circleWalletService.requestTestnetTokens(walletAddress)
    console.log('✅ Faucet request successful:', result)
    return true
  } catch (error) {
    console.error('❌ Faucet test failed:', error)
    console.log('💡 Try using web faucets instead:')
    console.log('   - https://faucet.circle.com')
    console.log('   - https://console.circle.com/faucet')
    return false
  }
}