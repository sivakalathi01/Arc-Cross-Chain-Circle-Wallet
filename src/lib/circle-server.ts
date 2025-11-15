// Circle User-Controlled Wallets Server Service
import { initiateUserControlledWalletsClient } from '@circle-fin/user-controlled-wallets'

interface CircleServerConfig {
  apiKey: string
  baseUrl?: string
}

class CircleServerService {
  private client: any
  private config: CircleServerConfig
  private isInitialized = false

  constructor() {
    this.config = {
      apiKey: process.env.CIRCLE_API_KEY || '',
      baseUrl: process.env.CIRCLE_BASE_URL
    }
  }

  private initialize() {
    if (this.isInitialized) return

    if (!this.config.apiKey || this.config.apiKey === 'your_circle_testnet_api_key_here') {
      throw new Error('Circle API key is required for server-side operations')
    }

    // Circle testnet environment detected
    if (this.config.apiKey.startsWith('TEST_API_KEY:')) {
      console.log('🌐 Circle Testnet Environment - Using real Circle testnet API')
      console.log('✅ Connected to Circle testnet for wallet operations')
    }

    try {
      this.client = initiateUserControlledWalletsClient({
        apiKey: this.config.apiKey,
        baseUrl: this.config.baseUrl
      })
      
      this.isInitialized = true
      console.log('✅ Circle server client initialized')
    } catch (error) {
      console.error('❌ Failed to initialize Circle server client:', error)
      throw error
    }
  }

  async createWallet(params: {
    name?: string
    blockchain?: string
  }) {
    this.initialize()
    
    try {
      console.log('🔨 Creating wallet via Circle server API...')
      
      // Using real Circle testnet API
      
      // Circle User-Controlled Wallets API call
      const response = await this.client.createWallet({
        blockchains: [params.blockchain || 'ETH-SEPOLIA'],
        count: 1,
        walletSetId: `set_${Date.now()}`, // Generate unique wallet set ID
        accountType: 'SCA', // Smart Contract Account
        ...(params.name && { name: params.name })
      })

      console.log('✅ Wallet created successfully')
      return response.data
    } catch (error) {
      console.error('❌ Failed to create wallet:', error)
      throw error
    }
  }

  async getWallets(params?: {
    userId?: string
    pageSize?: number
    pageBefore?: string
    pageAfter?: string
  }) {
    this.initialize()

    try {
      console.log('📋 Fetching wallets via Circle server API...')
      
      // Using real Circle testnet API
      
      const response = await this.client.listWallets({
        pageSize: params?.pageSize || 50,
        ...(params?.pageBefore && { pageBefore: params.pageBefore }),
        ...(params?.pageAfter && { pageAfter: params.pageAfter })
      })

      console.log(`✅ Found ${response.data?.wallets?.length || 0} wallets`)
      return response.data
    } catch (error) {
      console.error('❌ Failed to fetch wallets:', error)
      throw error
    }
  }

  async getWalletById(walletId: string) {
    this.initialize()

    try {
      console.log(`🔍 Fetching wallet ${walletId} via Circle server API...`)
      
      const response = await this.client.getWallet({
        id: walletId
      })

      console.log('✅ Wallet retrieved successfully')
      return response.data
    } catch (error) {
      console.error('❌ Failed to fetch wallet:', error)
      throw error
    }
  }

  async getWalletBalance(walletId: string) {
    this.initialize()

    try {
      console.log(`💰 Fetching balance for wallet ${walletId} via Circle server API...`)
      
      const response = await this.client.listWalletTokenBalances({
        id: walletId
      })

      console.log(`✅ Found ${response.data?.tokenBalances?.length || 0} token balances`)
      return response.data
    } catch (error) {
      console.error('❌ Failed to fetch wallet balance:', error)
      throw error
    }
  }

  async createTransaction(params: {
    walletId: string
    destinationAddress: string
    amount: string
    tokenId?: string
    blockchain?: string
    userToken: string
    fee?: {
      type: 'level'
      config: {
        feeLevel: 'LOW' | 'MEDIUM' | 'HIGH'
      }
    }
  }) {
    this.initialize()

    try {
      console.log(`💸 Creating transaction for wallet ${params.walletId}...`)
      
      const response = await this.client.createTransaction({
        userToken: params.userToken,
        walletId: params.walletId,
        tokenId: params.tokenId,
        destinationAddress: params.destinationAddress,
        amount: [params.amount],
        fee: params.fee || {
          type: 'level',
          config: { feeLevel: 'MEDIUM' }
        }
      })

      console.log('✅ Transaction created successfully')
      return response.data
    } catch (error) {
      console.error('❌ Failed to create transaction:', error)
      throw error
    }
  }

  async getTransactionStatus(transactionId: string) {
    this.initialize()

    try {
      const response = await this.client.getTransaction({
        id: transactionId
      })

      return response.data
    } catch (error) {
      console.error('❌ Failed to get transaction status:', error)
      throw error
    }
  }
}

// Export singleton instance
export const circleServerService = new CircleServerService()