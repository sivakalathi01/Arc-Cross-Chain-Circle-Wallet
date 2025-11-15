import { CircleConfig, CircleUserToken } from '@/types'
import { v4 as uuidv4 } from 'uuid'

class CircleWalletService {
  private config: CircleConfig
  private userToken: string | null = null
  private encryptionKey: string | null = null

  constructor(config: CircleConfig) {
    this.config = config
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

    if (this.userToken) {
      headers['X-User-Token'] = this.userToken
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`Circle API Error: ${response.status} - ${errorData.message || response.statusText}`)
    }

    return response.json()
  }

  async initialize(): Promise<void> {
    try {
      // Step 1: Create user first (required by Circle SDK workflow)
      const userId = await this.createUser()
      
      // Step 2: Create user token for the created user
      const userTokenData = await this.createUserToken(userId)
      this.userToken = userTokenData.userToken
      this.encryptionKey = userTokenData.encryptionKey
    } catch (error) {
      console.error('Failed to initialize Circle service:', error)
      throw error
    }
  }

  private async createUser(): Promise<string> {
    try {
      const userId = uuidv4()
      const response = await this.makeRequest<{ data: { user: { userId: string } } }>(
        '/users',
        {
          method: 'POST',
          body: JSON.stringify({
            userId,
          }),
        }
      )
      return response.data.user.userId
    } catch (error) {
      console.error('Error creating user:', error)
      throw new Error('Failed to create Circle user')
    }
  }

  private async createUserToken(userId: string): Promise<CircleUserToken> {
    try {
      const response = await this.makeRequest<{ data: { userToken: string; encryptionKey: string } }>(
        '/users/token',
        {
          method: 'POST',
          body: JSON.stringify({
            userId,
          }),
        }
      )

      return {
        userToken: response.data.userToken,
        encryptionKey: response.data.encryptionKey,
      }
    } catch (error) {
      console.error('Error creating user token:', error)
      throw new Error('Failed to create Circle user token')
    }
  }

  async createWallet(name?: string): Promise<any> {
    if (!this.userToken) throw new Error('Service not initialized')

    try {
      const response = await this.makeRequest<{ data: { wallet: any } }>('/wallets', {
        method: 'POST',
        body: JSON.stringify({
          idempotencyKey: uuidv4(),
          blockchains: ['ETH-SEPOLIA'], // Using Sepolia testnet
          accountType: 'SCA',
          metadata: name ? [{ name, value: name }] : undefined,
        }),
      })

      return response.data.wallet
    } catch (error) {
      console.error('Error creating wallet:', error)
      throw error
    }
  }

  async getWallets(): Promise<any[]> {
    if (!this.userToken) throw new Error('Service not initialized')

    try {
      const response = await this.makeRequest<{ data: { wallets: any[] } }>('/wallets')
      return response.data.wallets || []
    } catch (error) {
      console.error('Error fetching wallets:', error)
      throw error
    }
  }

  async getWalletBalance(walletId: string): Promise<any> {
    if (!this.userToken) throw new Error('Service not initialized')

    try {
      const response = await this.makeRequest<{ data: { tokenBalances: any[] } }>(
        `/wallets/${walletId}/balances`
      )
      return { tokenBalances: response.data.tokenBalances || [] }
    } catch (error) {
      console.error('Error fetching wallet balance:', error)
      throw error
    }
  }

  async sendTransaction(params: {
    walletId: string
    destinationAddress: string
    amount: string
    tokenAddress?: string
    blockchain?: string
  }): Promise<any> {
    if (!this.userToken) throw new Error('Service not initialized')

    try {
      const response = await this.makeRequest<{ data: { transaction: any } }>(
        `/wallets/${params.walletId}/transactions`,
        {
          method: 'POST',
          body: JSON.stringify({
            idempotencyKey: uuidv4(),
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

      return response.data.transaction
    } catch (error) {
      console.error('Error sending transaction:', error)
      throw error
    }
  }

  async getTransactions(walletId: string): Promise<any[]> {
    if (!this.userToken) throw new Error('Service not initialized')

    try {
      const response = await this.makeRequest<{ data: { transactions: any[] } }>(
        `/wallets/${walletId}/transactions`
      )
      return response.data.transactions || []
    } catch (error) {
      console.error('Error fetching transactions:', error)
      throw error
    }
  }

  async signMessage(walletId: string, message: string): Promise<any> {
    if (!this.userToken) throw new Error('Service not initialized')

    try {
      const response = await this.makeRequest<{ data: any }>(
        `/wallets/${walletId}/sign`,
        {
          method: 'POST',
          body: JSON.stringify({
            message,
          }),
        }
      )

      return response.data
    } catch (error) {
      console.error('Error signing message:', error)
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

  // Utility methods for testnet
  async getTestnetFaucet(walletAddress: string): Promise<void> {
    try {
      // This would call a testnet faucet to get test USDC
      console.log(`Requesting testnet USDC for ${walletAddress}`)
      // Implementation depends on Circle's testnet faucet API
    } catch (error) {
      console.error('Error requesting testnet funds:', error)
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

// Export singleton instance configured for testnet
export const circleWalletService = new CircleWalletService({
  apiKey: process.env.CIRCLE_API_KEY || '',
  clientKey: process.env.CIRCLE_CLIENT_KEY || '',
  entitySecret: process.env.CIRCLE_ENTITY_SECRET || '',
  baseUrl: process.env.CIRCLE_BASE_URL || 'https://api.circle.com/v1/w3s',
})