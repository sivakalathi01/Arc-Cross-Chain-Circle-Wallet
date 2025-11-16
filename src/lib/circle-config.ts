/**
 * Circle Configuration Utilities
 * Helper functions to check Circle API key configuration status
 */

export function checkCircleApiKeysConfigured(): boolean {
  if (typeof window !== 'undefined') {
    // Client-side check is limited, but we can check for obvious placeholders
    return true // Assume configured on client-side
  }
  
  // Server-side check
  const apiKey = process.env.CIRCLE_API_KEY
  const clientKey = process.env.CIRCLE_CLIENT_KEY
  
  const placeholderKeys = [
    'your_circle_testnet_api_key_here',
    'your_circle_testnet_client_key_here',
    'your_circle_test_key',
    undefined,
    null,
    ''
  ]
  
  // Accept your real Circle testnet keys (they start with TEST_ prefix from Circle)
  const hasValidTestKeys = apiKey?.startsWith('TEST_API_KEY:') && clientKey?.startsWith('TEST_CLIENT_KEY:')
  const hasRealKeys = !placeholderKeys.includes(apiKey) && !placeholderKeys.includes(clientKey)
  
  return hasValidTestKeys || hasRealKeys
}

export function getCircleConfigStatus(): {
  hasApiKeys: boolean
  message: string
  recommendation: string
} {
  const hasApiKeys = checkCircleApiKeysConfigured()
  
  if (hasApiKeys) {
    return {
      hasApiKeys: true,
      message: 'Circle API keys configured',
      recommendation: 'Circle wallet creation available'
    }
  }
  
  return {
    hasApiKeys: false,
    message: 'Circle API keys not configured',
    recommendation: 'Add Circle API keys to create wallets'
  }
}

export function getCircleConfig() {
  return {
    apiKey: process.env.CIRCLE_API_KEY || '',
    clientKey: process.env.CIRCLE_CLIENT_KEY || '',
    entitySecret: process.env.CIRCLE_ENTITY_SECRET || '',
    baseUrl: process.env.CIRCLE_BASE_URL || 'https://api.circle.com'
  }
}