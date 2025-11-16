// Direct Circle API Integration
// This bypasses the Circle SDK which has workflow issues

import { v4 as uuidv4 } from 'uuid'

// Dynamic import for Node.js crypto to avoid browser issues
let nodeCrypto: typeof import('crypto')
if (typeof window === 'undefined') {
  nodeCrypto = require('crypto')
}

interface CircleUser {
  id: string
  status: string
  createDate: string
  pinStatus: string
  authMode: string
}

interface CircleUserToken {
  userToken: string
  encryptionKey: string
}

interface CircleWallet {
  id: string
  address: string
  blockchain: string
  accountType: string
  updateDate: string
  createDate: string
}

class CircleDirectClient {
  private apiKey: string
  private baseUrl: string
  private entitySecret: string
  private publicKey: string | null = null

  constructor(apiKey: string, entitySecret: string, baseUrl: string = 'https://api.circle.com') {
    this.apiKey = apiKey
    this.entitySecret = entitySecret
    this.baseUrl = baseUrl
  }

  // Fetch Circle's public key for encryption
  private async getPublicKey(): Promise<string> {
    if (this.publicKey) {
      return this.publicKey
    }

    const response = await this.makeRequest('/v1/w3s/config/entity/publicKey', 'GET')
    this.publicKey = response.data.publicKey
    return response.data.publicKey
  }

  // Encrypt entity secret using Circle's public key
  private async encryptEntitySecret(): Promise<string> {
    try {
      console.log('🔐 Starting entity secret encryption...')
      console.log('Entity secret format:', this.entitySecret.substring(0, 20) + '...')
      
      if (!nodeCrypto) {
        throw new Error('Node.js crypto module not available. This operation must run server-side.')
      }
      
      const publicKeyPem = await this.getPublicKey()
      console.log('✅ Got public key, encrypting...')
      
      // Entity secret is hex string - convert to buffer
      const entitySecretBuffer = Buffer.from(this.entitySecret, 'hex')
      console.log(`Converting hex entity secret (${this.entitySecret.length} chars) to buffer (${entitySecretBuffer.length} bytes)`)
      
      // Encrypt using Node.js crypto module
      const encrypted = nodeCrypto.publicEncrypt(
        {
          key: publicKeyPem,
          padding: nodeCrypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: 'sha256',
        },
        entitySecretBuffer
      )
      
      // Return base64 encoded ciphertext
      const ciphertext = encrypted.toString('base64')
      console.log('✅ Entity secret encrypted successfully, length:', ciphertext.length)
      return ciphertext
    } catch (error) {
      console.error('❌ Encryption error:', error)
      throw new Error(`Failed to encrypt entity secret: ${error}`)
    }
  }

  // Set the entity secret in Circle's system (one-time setup)
  async setEntitySecret(): Promise<void> {
    try {
      console.log('🔧 Setting entity secret in Circle system...')
      
      const encryptedEntitySecret = await this.encryptEntitySecret()
      
      const response = await this.makeRequest('/v1/w3s/config/entity/entitySecret', 'POST', {
        entitySecretCiphertext: encryptedEntitySecret
      })
      
      console.log('✅ Entity secret set successfully!')
      return response
    } catch (error) {
      console.error('❌ Failed to set entity secret:', error)
      throw error
    }
  }

  private async makeRequest(endpoint: string, method: 'GET' | 'POST' = 'GET', body?: object) {
    const url = `${this.baseUrl}${endpoint}`
    
    const options: RequestInit = {
      method,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    }

    if (body && method === 'POST') {
      options.body = JSON.stringify(body)
    }

    const response = await fetch(url, options)
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Circle API Error (${response.status}): ${errorText}`)
    }

    return response.json()
  }

  // Step 1: Create a user
  async createUser(userId: string): Promise<{ data: CircleUser }> {
    console.log(`👤 Creating Circle user: ${userId}`)
    return this.makeRequest('/v1/w3s/users', 'POST', { userId })
  }

  // Step 2: Create user token for the user
  async createUserToken(userId: string): Promise<{ data: CircleUserToken }> {
    console.log(`🔐 Creating user token for: ${userId}`)
    return this.makeRequest('/v1/w3s/users/token', 'POST', { userId })
  }

  // Create wallet set first (required for developer wallets)
  async createWalletSet(name: string = 'Default Wallet Set'): Promise<{ data: { walletSet: { id: string; name: string } } }> {
    console.log(`📦 Creating wallet set: ${name}`)
    
    // Encrypt the entity secret
    const encryptedEntitySecret = await this.encryptEntitySecret()
    console.log(`🔑 Entity secret encrypted for wallet set, length: ${encryptedEntitySecret.length}`)
    
    const url = `${this.baseUrl}/v1/w3s/developer/walletSets`
    
    const options: RequestInit = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        idempotencyKey: uuidv4(),
        entitySecretCiphertext: encryptedEntitySecret,
        name: name
      })
    }

    const response = await fetch(url, options)
    
    if (!response.ok) {
      const errorText = await response.text()
      
      // If entity secret not set, try to set it automatically
      if (errorText.includes('entity secret has not been set')) {
        console.log('⚠️ Entity secret not configured, setting it now...')
        await this.setEntitySecret()
        
        // Retry wallet set creation
        console.log('🔄 Retrying wallet set creation...')
        const retryResponse = await fetch(url, options)
        
        if (!retryResponse.ok) {
          const retryErrorText = await retryResponse.text()
          throw new Error(`Circle Wallet Set API Error (${retryResponse.status}): ${retryErrorText}`)
        }
        
        return retryResponse.json()
      }
      
      throw new Error(`Circle Wallet Set API Error (${response.status}): ${errorText}`)
    }

    return response.json()
  }

  // Step 3: Create developer-controlled wallet (no PIN required)
  async createWallet(walletSetId: string, blockchain: string = 'ETH-SEPOLIA'): Promise<{ data: CircleWallet }> {
    console.log(`💼 Creating developer wallet on ${blockchain} in set ${walletSetId}`)
    
    // Encrypt the entity secret
    const encryptedEntitySecret = await this.encryptEntitySecret()
    console.log(`🔑 Entity secret encrypted for wallet, length: ${encryptedEntitySecret.length}`)
    
    // Use developer wallets endpoint (no PIN required)
    const url = `${this.baseUrl}/v1/w3s/developer/wallets`
    
    const requestBody = {
      idempotencyKey: uuidv4(),
      entitySecretCiphertext: encryptedEntitySecret,
      walletSetId: walletSetId,
      accountType: 'SCA',
      blockchains: [blockchain],
      count: 1
    }
    
    console.log('📤 Wallet creation request:', JSON.stringify({
      ...requestBody,
      idempotencyKey: `[UUID]`
    }))
    
    const options: RequestInit = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    }

    const response = await fetch(url, options)
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Circle Wallet API Error (${response.status}): ${errorText}`)
    }

    const result = await response.json()
    // Developer wallets endpoint returns array, get first wallet
    return { data: result.data.wallets[0] }
  }

  // Get user wallets
  async getUserWallets(userId: string): Promise<{ data: { wallets: CircleWallet[] } }> {
    console.log(`📋 Getting wallets for user: ${userId}`)
    return this.makeRequest(`/v1/w3s/user/wallets?userId=${userId}`)
  }

  // Get all developer wallets
  async getDeveloperWallets(): Promise<{ data: { wallets: CircleWallet[] } }> {
    console.log(`📋 Getting all developer wallets...`)
    return this.makeRequest('/v1/w3s/developer/wallets', 'GET')
  }

  // Complete user setup workflow
  async setupUser(userId?: string): Promise<{
    user: CircleUser
    userToken: CircleUserToken
    wallet?: CircleWallet
  }> {
    const finalUserId = userId || `user_${Date.now()}_${Math.random().toString(36).substring(7)}`
    
    try {
      // Step 1: Create user
      const userResponse = await this.createUser(finalUserId)
      console.log('✅ User created:', userResponse.data)

      // Step 2: Create user token
      const tokenResponse = await this.createUserToken(finalUserId)
      console.log('✅ User token created')

      // Step 3: Don't create wallet in setupUser - wallet creation requires wallet set
      // Wallet creation should be done separately after wallet set is created
      
      return {
        user: userResponse.data,
        userToken: tokenResponse.data,
        wallet: undefined
      }
    } catch (error) {
      console.error('❌ Circle user setup failed:', error)
      throw error
    }
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      console.log('🧪 Testing Circle API connection...')
      
      // Test with public key endpoint (we know this works)
      await this.makeRequest('/v1/w3s/config/entity/publicKey')
      console.log('✅ Circle API connection successful')
      
      return true
    } catch (error) {
      console.error('❌ Circle API connection failed:', error)
      return false
    }
  }

  // Get wallet balance
  async getWalletBalance(walletId: string): Promise<any> {
    try {
      console.log(`💰 Fetching balance for wallet ${walletId}...`)
      const response = await this.makeRequest(`/v1/w3s/wallets/${walletId}/balances`, 'GET')
      console.log(`📊 Balance API Response:`, JSON.stringify(response, null, 2))
      console.log(`✅ Found ${response.data?.tokenBalances?.length || 0} token balances`)
      return response.data
    } catch (error) {
      console.error('❌ Failed to fetch wallet balance:', error)
      throw error
    }
  }

  // Get wallet details
  async getWallet(walletId: string): Promise<any> {
    try {
      console.log(`🔍 Fetching wallet details for ${walletId}...`)
      const response = await this.makeRequest(`/v1/w3s/wallets/${walletId}`, 'GET')
      return response.data
    } catch (error) {
      console.error('❌ Failed to fetch wallet details:', error)
      throw error
    }
  }

  // Send transaction
  async sendTransaction(params: {
    walletId: string
    destinationAddress: string
    destinationBlockchain?: string
    amount: string
    tokenAddress?: string
  }): Promise<any> {
    try {
      console.log(`💸 Initiating transaction from wallet ${params.walletId}...`)
      
      // Encrypt entity secret for transaction
      const entitySecretCiphertext = await this.encryptEntitySecret()
      console.log('🔑 Entity secret encrypted for transaction, length:', entitySecretCiphertext.length)
      
      // Get wallet details to determine source blockchain
      const wallet = await this.getWallet(params.walletId)
      const sourceBlockchain = wallet.blockchain
      const destinationBlockchain = params.destinationBlockchain || sourceBlockchain
      
      console.log(`🌐 Source blockchain: ${sourceBlockchain}`)
      console.log(`🌐 Destination blockchain: ${destinationBlockchain}`)
      
      const isCrossChain = sourceBlockchain !== destinationBlockchain
      
      if (isCrossChain) {
        console.log('🌉 Cross-chain CCTP transfer detected')
        console.log('📋 CCTP Protocol: Circle will handle burn on source chain and mint on destination chain')
      }
      
      // Get wallet balance to find the token ID
      const balances = await this.getWalletBalance(params.walletId)
      const usdcToken = balances.tokenBalances?.find((b: any) => 
        b.token.symbol.includes('USDC')
      )
      
      if (!usdcToken) {
        throw new Error('No USDC token found in wallet')
      }
      
      console.log(`💰 Using token: ${usdcToken.token.symbol} (${usdcToken.token.id})`)
      
      // Build CCTP-enabled transaction request
      const transactionRequest = {
        idempotencyKey: uuidv4(),
        entitySecretCiphertext,
        walletId: params.walletId,
        destinationAddress: params.destinationAddress,
        amounts: [params.amount],
        feeLevel: 'MEDIUM',
        tokenId: usdcToken.token.id,
        ...(isCrossChain && { 
          destinationChain: destinationBlockchain,
          // Circle's API uses CCTP protocol for cross-chain transfers
          // The API automatically handles:
          // 1. Burning tokens on source chain via TokenMessenger contract
          // 2. Generating attestation via Circle's attestation service
          // 3. Minting tokens on destination chain via MessageTransmitter contract
        })
      }
      
      console.log('📤 Sending CCTP transaction request:', {
        ...transactionRequest,
        entitySecretCiphertext: `[${transactionRequest.entitySecretCiphertext.length} chars]`,
        protocol: isCrossChain ? 'CCTP' : 'Standard Transfer'
      })
      
      const response = await this.makeRequest('/v1/w3s/developer/transactions/transfer', 'POST', transactionRequest)
      
      console.log('✅ CCTP transaction initiated:', response)
      if (isCrossChain) {
        console.log('⏳ CCTP Process: Awaiting burn confirmation, attestation, and mint on destination chain')
      }
      return response.data
    } catch (error) {
      console.error('❌ Failed to send CCTP transaction:', error)
      throw error
    }
  }

  // Get CCTP transaction status with attestation info
  async getCCTPTransactionStatus(transactionId: string): Promise<any> {
    try {
      console.log(`🔍 Checking CCTP transaction status: ${transactionId}`)
      const response = await this.makeRequest(`/v1/w3s/transactions/${transactionId}`, 'GET')
      
      const transaction = response.data?.transaction
      if (transaction) {
        console.log(`📊 CCTP Status: ${transaction.state}`)
        if (transaction.txHash) {
          console.log(`🔗 Source TX Hash: ${transaction.txHash}`)
        }
        // For cross-chain transactions, Circle's API may include CCTP-specific fields
        if (transaction.destinationTxHash) {
          console.log(`🔗 Destination TX Hash: ${transaction.destinationTxHash}`)
        }
        if (transaction.attestationHash) {
          console.log(`✅ CCTP Attestation: ${transaction.attestationHash}`)
        }
      }
      
      return response.data
    } catch (error) {
      console.error('❌ Failed to get CCTP transaction status:', error)
      throw error
    }
  }
}

export { CircleDirectClient }
export type { CircleUser, CircleUserToken, CircleWallet }