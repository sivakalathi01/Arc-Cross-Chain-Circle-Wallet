/**
 * Circle W3S (Web3 Services) SDK Integration
 * 
 * This service provides a client-side interface to Circle's Web3 Services SDK.
 * 
 * SECURITY NOTES:
 * - Only uses client-safe configuration (clientKey, not apiKey)
 * - API key and entity secret should only be used server-side
 * - All sensitive operations go through backend API endpoints
 * 
 * USAGE:
 * 1. Initialize the service: await circleW3SService.initialize()
 * 2. Authenticate user: await circleW3SService.authenticateUser(token, key)
 * 3. Execute challenges: await circleW3SService.executeChallenge(challengeId)
 */

import { W3SSdk } from '@circle-fin/w3s-pw-web-sdk'
import { CircleConfig } from '@/types'

export class CircleW3SService {
  private sdk: W3SSdk
  private config: CircleConfig
  private userToken: string | null = null
  private encryptionKey: string | null = null
  private initialized: boolean = false

  constructor(config: CircleConfig) {
    this.config = config
    this.sdk = new W3SSdk()
  }

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error('Circle W3S service not initialized. Call initialize() first.')
    }
  }

  isConfigured(): boolean {
    return !!(this.config.clientKey?.trim())
  }

  isAuthenticated(): boolean {
    return !!(this.userToken && this.encryptionKey)
  }

  getStatus(): { initialized: boolean; configured: boolean; authenticated: boolean } {
    return {
      initialized: this.initialized,
      configured: this.isConfigured(),
      authenticated: this.isAuthenticated()
    }
  }

  async initialize(): Promise<void> {
    console.log('🔄 Initializing Circle W3S SDK...')
    
    if (!this.config.clientKey) {
      throw new Error('Circle client key is required for W3S SDK initialization')
    }
    
    // Set app settings with client key (not API key)
    await this.sdk.setAppSettings({
      appId: this.config.clientKey, // Use client key as app ID
    })
    
    this.initialized = true
    console.log('✅ Circle W3S SDK initialized!')
  }

  async authenticateUser(userToken: string, encryptionKey: string): Promise<void> {
    this.ensureInitialized()
    
    if (!userToken?.trim() || !encryptionKey?.trim()) {
      throw new Error('Both userToken and encryptionKey are required for authentication')
    }
    
    this.userToken = userToken.trim()
    this.encryptionKey = encryptionKey.trim()
    
    // Set authentication for the SDK
    this.sdk.setAuthentication({
      userToken: this.userToken,
      encryptionKey: this.encryptionKey,
    })
    
    console.log('🔐 User authenticated with Circle W3S SDK')
  }

  async executeChallenge(challengeId: string): Promise<any> {
    this.ensureInitialized()
    
    if (!challengeId?.trim()) {
      throw new Error('Challenge ID is required and cannot be empty')
    }

    if (!this.userToken || !this.encryptionKey) {
      throw new Error('User must be authenticated before executing challenges')
    }

    return new Promise((resolve, reject) => {
      this.sdk.execute(challengeId, (error, result) => {
        if (error) {
          console.error('❌ Challenge execution failed:', error)
          const errorMessage = error?.message || 'Challenge execution failed'
          const errorCode = error?.code?.toString() || 'UNKNOWN_ERROR'
          reject(new Error(`Circle W3S Error ${errorCode}: ${errorMessage}`))
          return
        }

        if (result) {
          console.log(`✅ Challenge completed: ${result.type}`)
          console.log(`Status: ${result.status}`)
          
          if ('data' in result && result.data) {
            console.log('📄 Challenge data:', result.data)
          }
        }
        
        resolve(result)
      })
    })
  }

  // Backend API calls to create challenges (these need to be implemented server-side)
  async createUserToken(userId: string): Promise<{ userToken: string; encryptionKey: string }> {
    if (!userId?.trim()) {
      throw new Error('User ID is required and cannot be empty')
    }

    try {
      const response = await fetch('/api/circle/user-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: userId.trim() }),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Failed to create user token (${response.status}): ${errorData.message || response.statusText}`)
      }
      
      const data = await response.json()
      
      if (!data.userToken || !data.encryptionKey) {
        throw new Error('Invalid response: missing userToken or encryptionKey')
      }
      
      return data
    } catch (error) {
      console.error('❌ Create user token error:', error)
      throw error
    }
  }

  async createWalletChallenge(name?: string): Promise<string> {
    try {
      const response = await fetch('/api/circle/create-wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: name?.trim() || undefined }),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Failed to create wallet challenge (${response.status}): ${errorData.message || response.statusText}`)
      }
      
      const data = await response.json()
      
      if (!data.challengeId) {
        throw new Error('Invalid response: missing challengeId')
      }
      
      return data.challengeId
    } catch (error) {
      console.error('❌ Create wallet challenge error:', error)
      throw error
    }
  }

  async getWallets(): Promise<any[]> {
    try {
      const response = await fetch('/api/circle/wallets')
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Failed to get wallets (${response.status}): ${errorData.message || response.statusText}`)
      }
      
      const data = await response.json()
      return Array.isArray(data.wallets) ? data.wallets : []
    } catch (error) {
      console.error('❌ Get wallets error:', error)
      throw error
    }
  }
}

// Export configured service - Note: Only use client-safe configuration
export const circleW3SService = new CircleW3SService({
  apiKey: '', // API key should only be used server-side
  clientKey: process.env.NEXT_PUBLIC_CIRCLE_CLIENT_KEY || '', // Client key is safe for browser
  baseUrl: process.env.NEXT_PUBLIC_CIRCLE_BASE_URL || 'https://api.circle.com/v1/w3s',
  entitySecret: '', // Entity secret should only be used server-side
})