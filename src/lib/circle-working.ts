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
      this.directClient = new CircleDirectClient(
        this.config.apiKey,
        this.config.entitySecret,
        this.config.baseUrl
      )
      console.log('📱 Circle Direct API client initialized')
    } catch (error) {
      console.error('❌ Failed to initialize Circle Direct client:', error)
    }
  }

  async initialize(): Promise<void> {
    try {
      console.log('🔄 Starting Circle service initialization...')
      
      // Initialize direct client if not already done
      if (!this.directClient) {
        this.initializeDirectClient()
      }
      
      // Test connection using direct API
      if (this.directClient) {
        const isConnected = await this.directClient.testConnection()
        if (!isConnected) {
          console.log('⚠️ Circle API connection test failed - using fallback mode')
          return
        }
        console.log('✅ Circle API connection verified')
      }
      
      this.isInitialized = true
      console.log('✅ Circle service initialized successfully')
    } catch (error) {
      console.error('❌ Circle service initialization failed:', error)
      // Don't throw error - fallback to mock mode
    }
  }
  
  // Create user using working direct API workflow
  private async ensureUserExists(): Promise<void> {
    if (this.currentUser || !this.directClient) {
      return
    }
    
    try {
      console.log('👤 Creating Circle user with working workflow...')
      const result = await this.directClient.setupUser()
      
      this.currentUser = result.user
      this.userToken = result.userToken.userToken
      this.encryptionKey = result.userToken.encryptionKey
      
      console.log('✅ Circle user created successfully:', this.currentUser.id)
    } catch (error) {
      console.error('❌ Failed to create Circle user:', error)
      throw error
    }
  }
  
  // Create wallet using working direct API approach
  async createWallet(name?: string): Promise<any> {
    try {
      console.log('💼 Creating Circle wallet via API...')
      
      // Call the server-side API route which handles encryption properly
      const response = await fetch('/api/wallets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: name || 'My Wallet' }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create wallet')
      }

      const result = await response.json()
      console.log('✅ Circle wallet created successfully via API!')
      
      return {
        id: result.data.wallet.id,
        name: name || `Circle Wallet`,
        address: result.data.wallet.address,
        blockchain: result.data.wallet.blockchain,
        type: 'circle' as const,
        balances: [],
        createDate: result.data.wallet.createDate
      }
    } catch (error) {
      console.error('❌ Circle wallet creation failed:', error)
      throw error
    }
  }
  
  // Get existing wallets (returns empty array until user creates one)
  async getWallets(): Promise<any[]> {
    try {
      if (!this.isInitialized || !this.directClient) {
        console.log('📭 Circle service not initialized - returning empty wallet list')
        return []
      }
      
      console.log('📋 Getting Circle wallets from API...')
      
      // Fetch wallets from Circle API
      const response = await fetch('/api/wallets', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        console.error('Failed to fetch wallets:', response.statusText)
        return []
      }

      const result = await response.json()
      
      if (result.success && result.data?.wallets) {
        console.log(`✅ Found ${result.data.wallets.length} Circle wallet(s)`)
        return result.data.wallets.map((w: any) => ({
          id: w.id,
          name: `Circle Wallet`,
          address: w.address,
          blockchain: w.blockchain,
          type: 'circle' as const,
          balances: [],
          createDate: w.createDate
        }))
      }
      
      console.log('📭 No Circle wallets found')
      return []
    } catch (error) {
      console.error('❌ Failed to get Circle wallets:', error)
      return []
    }
  }
  
  // Get user token (now using working direct API approach)
  async getUserToken(): Promise<CircleUserToken | null> {
    try {
      // Ensure user exists with proper workflow
      await this.ensureUserExists()
      
      if (!this.userToken || !this.encryptionKey) {
        return null
      }
      
      return {
        userToken: this.userToken,
        encryptionKey: this.encryptionKey
      }
    } catch (error) {
      console.error('❌ Failed to get user token:', error)
      return null
    }
  }
  
  // Placeholder methods for compatibility (implement as needed)
  async getWalletBalances(walletId: string): Promise<any[]> {
    console.log('💰 Getting wallet balances for:', walletId)
    return []
  }
  
  async getTransactions(walletId: string): Promise<any[]> {
    console.log('📋 Getting transactions for:', walletId)
    return []
  }
  
  async sendTransaction(params: any): Promise<any> {
    console.log('💸 Sending transaction:', params)
    throw new Error('Transaction sending not implemented yet')
  }
  
  async requestTestnetTokens(walletId: string, nativeAmount: number, usdcAmount: number): Promise<void> {
    console.log(`🪙 Requesting testnet tokens for wallet ${walletId}: ${nativeAmount} ETH, ${usdcAmount} USDC`)
    // This is a mock implementation - real faucet would need separate API calls
    throw new Error('Testnet token requests not implemented yet - use external faucets')
  }
  
  // Check if service is properly initialized
  isReady(): boolean {
    return this.isInitialized && !!this.directClient
  }
  
  // Get current user info
  getCurrentUser(): CircleUser | null {
    return this.currentUser
  }
}

// Export service instances with proper configuration
import { getCircleConfig } from './circle-config'

const circleConfig = getCircleConfig()
export const circleWalletService = new CircleWalletService(circleConfig)

export { CircleWalletService }