// Development helpers for handling API failures
import toast from './toast'

export function handleAPIError(error: any, context: string) {
  console.error(`❌ ${context} failed:`, error)
  
  if (error.message?.includes('Failed to fetch') || error.message?.includes('Network Error')) {
    console.log('🌐 Network/CORS Error Detected')
    console.log('💡 Common causes:')
    console.log('   - Using placeholder API keys')
    console.log('   - CORS policy blocking browser requests')
    console.log('   - Circle API service unavailable')
    console.log('   - Network connectivity issues')
    
    toast.error(`${context} failed due to network/API issues`)
    toast.success('💡 Try using the web faucets instead!')
    
    return {
      isNetworkError: true,
      shouldFallback: true,
      userMessage: `${context} unavailable - use web faucets instead`
    }
  }
  
  if (error.message?.includes('401')) {
    toast.error('Authentication failed - check your Circle API keys')
    return {
      isAuthError: true,
      shouldFallback: true,
      userMessage: 'Invalid API keys - get real keys from developers.circle.com'
    }
  }
  
  if (error.message?.includes('403')) {
    toast.error('Permission denied - check API key permissions')
    return {
      isPermissionError: true,
      shouldFallback: true,
      userMessage: 'API key lacks permissions - check Circle console'
    }
  }
  
  // Generic error
  toast.error(`${context} failed - see console for details`)
  return {
    isGenericError: true,
    shouldFallback: true,
    userMessage: `${context} temporarily unavailable`
  }
}

export function showFallbackMessage(operation: string) {
  console.log(`ℹ️ ${operation} is not available with current API configuration`)
  console.log('🔄 Alternative options:')
  console.log('   1. Get real Circle API keys from developers.circle.com')
  console.log('   2. Use web faucets: https://faucet.circle.com')
  console.log('   3. Use testnet explorers to verify transactions')
  
  toast.success(`💡 Use web faucets while API is unavailable`)
}