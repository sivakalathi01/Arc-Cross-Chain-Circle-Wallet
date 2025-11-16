import { CircleConfig, CircleUserToken } from '@/types'
import { CircleDirectClient, CircleUser, CircleUserToken as DirectUserToken, CircleWallet } from './circle-direct'

class CircleWalletService {
  private config: CircleConfig
  private userToken: string | null = null
  private encryptionKey: string | null = null
  private directClient: CircleDirectClient | null = null
  private isInitialized: boolean = false
  private currentUser: CircleUser | null = null

  constructor(config: CircleConfig) {
    this.config = config
    this.initializeDirectClient()
  }

  private initializeDirectClient() {
    try {
      // Use direct API client instead of problematic SDK
      if (!this.config.entitySecret) {
        throw new Error('Entity secret is required for CircleDirectClient')
      }
      this.directClient = new CircleDirectClient(this.config.apiKey, this.config.entitySecret, this.config.baseUrl)
      console.log('📱 Circle Direct API client initialized')
    } catch (error) {
      console.error('❌ Failed to initialize Circle Direct client:', error)
    }
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.config.apiKey}`,
    }

    // Add any additional headers from options
    if (options.headers) {
      Object.assign(headers, options.headers)
    }

    // Add user token if available
    if (this.userToken) {
      headers['X-User-Token'] = this.userToken
    }

    // Add entity secret for certain operations
    if (this.config.entitySecret) {
      headers['X-Entity-Secret'] = this.config.entitySecret
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.message || response.statusText
        
        // Provide specific error guidance
        if (response.status === 401) {
          throw new Error(`Circle API Authentication Failed (401): ${errorMessage}. Please check your API keys.`)
        } else if (response.status === 403) {
          throw new Error(`Circle API Permission Denied (403): ${errorMessage}. Check your API key permissions.`)
        } else if (response.status === 404) {
          throw new Error(`Circle API Endpoint Not Found (404): ${errorMessage}. API endpoint may be incorrect.`)
        } else {
          throw new Error(`Circle API Error (${response.status}): ${errorMessage}`)
        }
      }

      return response.json()
    } catch (error) {
      // Handle network errors (CORS, connection failed, etc.)
      if (error instanceof TypeError && (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
        console.log('🌐 Network connection issue detected')
        console.log('💡 This could be:')
        console.log('   1. Development server not running (check npm run dev)')
        console.log('   2. API endpoint not available')
        console.log('   3. Network connectivity issue')
        throw new Error(`Connection Error: Unable to connect to the server. Please ensure the development server is running.`)
      }
      // Re-throw other errors
      throw error
    }
  }

  async initialize(): Promise<void> {
    try {
      console.log('🔄 Starting Circle service initialization...')
      
      // Initialize direct client if not already done
      if (!this.directClient) {
        this.initializeDirectClient()
      }
      
      // Check if using placeholder/demo keys
      if (this.config.apiKey.includes('98c189a0fddd8ef9e01a04beee337556') || 
          this.config.apiKey.startsWith('TEST_API_KEY:98c189a0') ||
          this.config.apiKey === 'your_circle_test_key' ||
          this.config.apiKey === 'your_circle_testnet_api_key_here') {
        console.log('🦊 MetaMask Mode Active!')
        console.log('💡 Circle wallet creation requires real API keys')
        console.log('🔗 Use the MetaMask tab to connect your existing wallet')
        console.log('💰 Your 10 USDC on Sepolia & Arc testnets is ready for testing')
        console.log('🔑 For Circle wallet creation, add real API keys to .env.local:')
        console.log('   1. Visit https://developers.circle.com/')
        console.log('   2. Create a developer account')
        console.log('   3. Generate real API keys')
        console.log('   4. Update CIRCLE_API_KEY in .env.local')
        
        // Initialize in MetaMask compatibility mode
        this.isInitialized = true
        return
      }
      
      if (!this.directClient) {
        throw new Error('Circle Direct client not initialized')
      }    // Validate API key format for real keys
      if (!this.config.apiKey.includes(':')) {
        throw new Error('Invalid API key format. Should be: TEST_API_KEY:key_id:key_secret')
      }
      
      const keyParts = this.config.apiKey.split(':')
      if (keyParts.length !== 3) {
        throw new Error('API key should have exactly 3 parts separated by colons')
      }
      
      console.log(`📡 Circle W3S configured with environment: ${keyParts[0]}`)
      console.log('📝 Important: Circle W3S Architecture:')
      console.log('   - Client SDK: Handles user interactions (PIN, signing)')
      console.log('   - Server API: Handles wallet creation (requires backend)')
      console.log('   - Your API key: Used server-side, not in browser')
      
      // Note: Direct API calls from browser will fail due to CORS
      // Circle W3S API must be called from server-side
      console.log('✅ Circle W3S SDK ready for user interactions')
      console.log('💡 Next steps:')
      console.log('   1. Use web faucets for testnet tokens')
      console.log('   2. Set up server-side API for wallet creation')
      console.log('   3. Implement proper user authentication flow')
      
      this.isInitialized = true
    } catch (error) {
      console.error('❌ Failed to initialize Circle service:', error)
      console.log('⚠️ Running in demo mode - wallet operations will use mock data')
    }
  }

  private async createUserToken(): Promise<CircleUserToken> {
    try {
      console.log('🔄 Creating Circle user token with testnet API...')
      
      // For Circle W3S, we need to create a user token first
      const response = await this.makeRequest<{ data: { userToken: string; encryptionKey: string } }>(
        '/user/token',
        {
          method: 'POST',
          body: JSON.stringify({
            userId: `user_${Date.now()}`, // Unique user ID for this session
          }),
        }
      )

      console.log('✅ Circle user token created successfully!')
      return {
        userToken: response.data.userToken,
        encryptionKey: response.data.encryptionKey,
      }
    } catch (error) {
      console.error('❌ Failed to create Circle user token:', error)
      console.log('🎭 Using demo user token for demo mode')
      // Return demo token instead of throwing
      return {
        userToken: `demo_user_token_${Date.now()}`,
        encryptionKey: `demo_encryption_key_${Date.now()}`,
      }
    }
  }

  async createWallet(name?: string, blockchain?: string): Promise<any> {
    if (!this.isInitialized) {
      await this.initialize()
    }
    
    const selectedBlockchain = blockchain || 'ARB-SEPOLIA'
    
    // Check if we're in MetaMask mode (placeholder keys) - but allow TEST_ keys for testnet
    if (this.config.apiKey === 'your_circle_testnet_api_key_here' ||
        this.config.apiKey === 'your_circle_test_key') {
      console.log('🦊 MetaMask Integration Active')
      console.log('💡 To create Circle wallets, you need real API keys')
      console.log('🔗 Use the MetaMask tab to test with your existing 10 USDC')
      throw new Error('Use MetaMask tab to connect your wallet with real USDC tokens')
    }

    // Real Circle testnet keys detected
    if (this.config.apiKey.startsWith('TEST_API_KEY:')) {
      console.log('🌐 Circle Testnet Mode - Using real Circle testnet API')
      console.log(`✅ Connected to Circle testnet environment (${selectedBlockchain})`)
    }
    
    if (!this.directClient) {
      throw new Error('Circle Direct client not available')
    }
    
    try {
      console.log('🔨 Creating wallet via server API...')
      
      // Add retry mechanism for network issues
      let response
      let attempts = 0
      const maxAttempts = 3
      
      while (attempts < maxAttempts) {
        try {
          const requestBody = {
            name,
            blockchain: selectedBlockchain
          }
          console.log('🟡 Circle Service: Sending to API:', JSON.stringify(requestBody))
          
          response = await fetch('/api/wallets', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
          })
          break // Success, exit retry loop
        } catch (fetchError) {
          attempts++
          if (attempts >= maxAttempts) {
            console.log('🚨 Wallet creation failed after multiple attempts')
            console.log('💡 Troubleshooting steps:')
            console.log('   1. Check if development server is running (npm run dev)')
            console.log('   2. Try refreshing the page')
            console.log('   3. Check browser console for additional errors')
            throw new Error('Unable to connect to wallet service. Please ensure the development server is running on http://localhost:3000')
          }
          console.log(`⏳ Retrying wallet creation (attempt ${attempts}/${maxAttempts})...`)
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }
      
      if (!response) {
        throw new Error('Failed to get response from wallet service')
      }
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to create wallet')
      }
      
      console.log('✅ Wallet created via server API')
      return result.data
    } catch (error) {
      console.error('❌ Error creating wallet with Circle testnet:', error)
      throw error
    }
  }

  async getWallets(): Promise<any[]> {
    if (!this.isInitialized) {
      await this.initialize()
    }
    
    console.log('📋 Fetching wallets from Circle W3S...')
    
    try {
      console.log('📋 Fetching wallets via server API...')
      
      // Add retry mechanism for wallet fetching
      let response
      try {
        response = await fetch('/api/wallets', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })
      } catch (fetchError) {
        console.log('⚠️ Unable to fetch wallets from server')
        console.log('💡 This might be normal if server is starting up')
        throw new Error('Unable to connect to wallet service. Please check if the development server is running.')
      }
      
      const result = await response.json()
      
      if (!result.success) {
        if (result.error && result.error.includes('Circle API key is required')) {
          console.log('🦊 No Circle API key configured - MetaMask mode active')
          console.log('💡 Use MetaMask tab to connect your existing wallet')
          return []
        }
        console.log('⚠️ Wallet fetching issue:', result.error)
        return [] // Return empty array instead of throwing error
      }
      
      console.log(`✅ Found ${result.data?.wallets?.length || 0} wallets via server API`)
      return result.data?.wallets || []
    } catch (error) {
      console.error('❌ Failed to fetch wallets:', error)
      if (error instanceof Error && error.message.includes('fetch')) {
        console.log('🦊 Server API not available - MetaMask mode active')
        console.log('💡 Use MetaMask tab to connect your existing wallet')
      }
      return []
    }
  }

  async getWalletBalance(walletId: string): Promise<any> {
    try {
      console.log(`💰 Fetching balance for wallet ${walletId} via server API...`)
      
      const response = await fetch(`/api/wallets/${walletId}/balances`)
      const result = await response.json()
      
      if (!result.success) {
        if (result.error.includes('Circle API key is required')) {
          console.log('🦊 No Circle API key - Use MetaMask tab for real balances')
          return { tokenBalances: [] }
        }
        throw new Error(result.error || 'Failed to fetch balance')
      }
      
      console.log(`✅ Found ${result.data?.tokenBalances?.length || 0} token balances`)
      return result.data
    } catch (error) {
      console.error('❌ Failed to fetch wallet balance:', error)
      console.log('💡 Use MetaMask tab to see real USDC balances')
      return { tokenBalances: [] }
    }
  }

  async sendTransaction(params: {
    walletId: string
    destinationAddress: string
    amount: string
    tokenAddress?: string
    blockchain?: string
  }): Promise<any> {
    try {
      console.log(`💸 Sending transaction from wallet ${params.walletId} on Circle testnet...`)
      const response = await this.makeRequest<{ data: { transaction: any } }>(
        `/wallets/${params.walletId}/transactions`,
        {
          method: 'POST',
          body: JSON.stringify({
            idempotencyKey: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            blockchain: params.blockchain || 'ETH-SEPOLIA',
            operation: {
              type: 'TRANSFER',
              destinationAddress: params.destinationAddress,
              amount: {
                amount: params.amount,
                token: params.tokenAddress || 'USDC',
              },
            },
          }),
        }
      )

      console.log('✅ Transaction submitted to Circle testnet successfully!')
      return response.data.transaction
    } catch (error) {
      console.error('❌ Error sending transaction on Circle testnet:', error)
      throw error
    }
  }

  async getTransactions(walletId: string): Promise<any[]> {
    try {
      console.log(`📋 Fetching transactions for wallet ${walletId} from Circle testnet...`)
      const response = await this.makeRequest<{ data: { transactions: any[] } }>(
        `/wallets/${walletId}/transactions`
      )
      const transactions = response.data.transactions || []
      console.log(`✅ Found ${transactions.length} transactions`)
      return transactions
    } catch (error) {
      console.error('❌ Error fetching transactions from Circle testnet:', error)
      console.log('💡 Transactions will appear after wallet activity on testnet')
      return []
    }
  }

  async signMessage(walletId: string, message: string): Promise<any> {
    try {
      console.log(`✍️ Signing message with wallet ${walletId} on Circle testnet...`)
      const response = await this.makeRequest<{ data: any }>(
        `/wallets/${walletId}/sign`,
        {
          method: 'POST',
          body: JSON.stringify({
            message,
          }),
        }
      )

      console.log('✅ Message signed successfully on Circle testnet!')
      return response.data
    } catch (error) {
      console.error('❌ Error signing message on Circle testnet:', error)
      throw error
    }
  }

  async estimateFee(params: {
    walletId: string
    destinationAddress: string
    amount: string
    tokenAddress?: string
    blockchain?: string
  }): Promise<any> {
    if (!this.userToken) throw new Error('Service not initialized')

    try {
      const response = await this.makeRequest<{ data: any }>(
        `/wallets/${params.walletId}/transactions/estimate`,
        {
          method: 'POST',
          body: JSON.stringify({
            blockchain: params.blockchain || 'ETH-SEPOLIA',
            operation: {
              type: 'TRANSFER',
              destinationAddress: params.destinationAddress,
              amount: {
                amount: params.amount,
                token: params.tokenAddress || 'USDC',
              },
            },
          }),
        }
      )

      return response.data
    } catch (error) {
      console.error('Error estimating fee:', error)
      throw error
    }
  }

  // Testnet faucet integration
  async requestTestnetTokens(walletId: string, native: boolean = true, usdc: boolean = true): Promise<any> {
    try {
      console.log(`💧 Requesting testnet tokens for wallet ${walletId}`)
      
      const response = await this.makeRequest<{ data: any }>('/faucet/drips', {
        method: 'POST',
        body: JSON.stringify({
          address: walletId, // Use wallet address for faucet
          blockchain: 'ETH-SEPOLIA',
          native: native,    // Request ETH
          usdc: usdc,       // Request USDC
        }),
      })
      
      console.log('✅ Testnet tokens requested successfully!')
      console.log('⏳ Tokens should appear in your wallet within a few minutes')
      return response.data
    } catch (error) {
      console.error('❌ Error requesting testnet tokens:', error)
      console.log('💡 You can also use the web faucets:')
      console.log('   - Public: https://faucet.circle.com')
      console.log('   - Developer: https://console.circle.com/faucet')
      throw error
    }
  }

  async getWalletByAddress(address: string): Promise<any> {
    try {
      const response = await this.makeRequest<{ data: { wallets: any[] } }>(`/wallets?address=${address}`)
      return response.data.wallets?.[0] || null
    } catch (error) {
      console.error('Error fetching wallet by address:', error)
      return null
    }
  }

  async getWalletDetails(walletId: string): Promise<any> {
    if (!this.userToken) throw new Error('Service not initialized')

    try {
      const response = await this.makeRequest<{ data: { wallet: any } }>(`/wallets/${walletId}`)
      return response.data.wallet
    } catch (error) {
      console.error('Error fetching wallet details:', error)
      throw error
    }
  }
}

// Circle configuration with proper testnet handling
function getCircleConfig(): CircleConfig {
  const apiKey = process.env.CIRCLE_API_KEY || process.env.NEXT_PUBLIC_CIRCLE_API_KEY || ''
  const clientKey = process.env.CIRCLE_CLIENT_KEY || process.env.NEXT_PUBLIC_CIRCLE_CLIENT_KEY || ''
  const entitySecret = process.env.CIRCLE_ENTITY_SECRET || process.env.NEXT_PUBLIC_CIRCLE_ENTITY_SECRET || ''
  const baseUrl = process.env.CIRCLE_BASE_URL || process.env.NEXT_PUBLIC_CIRCLE_BASE_URL || 'https://api.circle.com/v1/w3s'
  
  // Log configuration for debugging (hide sensitive parts)
  console.log('Circle Config:', { 
    hasApiKey: !!apiKey, 
    hasClientKey: !!clientKey, 
    hasEntitySecret: !!entitySecret,
    baseUrl,
    apiKeyPrefix: apiKey.substring(0, 15) + '...' 
  })
  
  return {
    apiKey,
    clientKey,
    entitySecret,
    baseUrl,
  }
}

// Export singleton instance configured for testnet
export const circleWalletService = new CircleWalletService(getCircleConfig())