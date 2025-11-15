// Mock implementation of Circle's W3S SDK for development
export class W3SSdk {
  private config: any
  private authentication: any

  constructor(config: any) {
    this.config = config
  }

  async setAuthentication(auth: any) {
    this.authentication = auth
  }

  async createWallet(params: any) {
    // Mock wallet creation
    const mockWallet = {
      id: `wallet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      address: `0x${Math.random().toString(16).substr(2, 40)}`,
      blockchain: params.blockchain || 'ETH',
      custodyType: 'DEVELOPER',
      accountType: params.accountType || 'SCA',
      name: params.metadata?.name,
      createDate: new Date().toISOString(),
      updateDate: new Date().toISOString(),
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return {
      data: { wallet: mockWallet }
    }
  }

  async getWallets() {
    // Mock wallets data
    const mockWallets = [
      {
        id: 'wallet_1',
        address: '0x1234567890123456789012345678901234567890',
        blockchain: 'ETH',
        custodyType: 'DEVELOPER',
        accountType: 'SCA',
        name: 'Main Wallet',
        createDate: new Date().toISOString(),
        updateDate: new Date().toISOString(),
      },
      {
        id: 'wallet_2',
        address: '0x0987654321098765432109876543210987654321',
        blockchain: 'MATIC-MUMBAI',
        custodyType: 'DEVELOPER',
        accountType: 'SCA',
        name: 'Polygon Wallet',
        createDate: new Date().toISOString(),
        updateDate: new Date().toISOString(),
      }
    ]

    await new Promise(resolve => setTimeout(resolve, 500))
    
    return {
      data: { wallets: mockWallets }
    }
  }

  async getWalletTokenBalance(params: any) {
    // Mock balance data
    const mockBalances = [
      {
        tokenId: 'usdc_eth',
        amount: '1000.50',
        updateDate: new Date().toISOString(),
        token: {
          id: 'usdc_eth',
          blockchain: 'ETH',
          tokenAddress: '0xA0b86a33E6417c4c8e9C2a2a9e1b17a7C01536E7',
          standard: 'ERC20',
          name: 'USD Coin',
          symbol: 'USDC',
          decimals: 6,
          isNative: false,
          updateDate: new Date().toISOString(),
          createDate: new Date().toISOString(),
        }
      },
      {
        tokenId: 'eth_native',
        amount: '0.25',
        updateDate: new Date().toISOString(),
        token: {
          id: 'eth_native',
          blockchain: 'ETH',
          standard: 'NATIVE',
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18,
          isNative: true,
          updateDate: new Date().toISOString(),
          createDate: new Date().toISOString(),
        }
      }
    ]

    await new Promise(resolve => setTimeout(resolve, 500))
    
    return {
      data: { tokenBalances: mockBalances }
    }
  }

  async createTransaction(params: any) {
    // Mock transaction creation
    const mockTransaction: any = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      blockchain: params.blockchain || 'ETH',
      tokenId: 'usdc_eth',
      walletId: params.walletId,
      sourceAddress: '0x1234567890123456789012345678901234567890',
      destinationAddress: params.operation.destinationAddress,
      transactionType: 'OUTBOUND',
      custodyType: 'DEVELOPER',
      state: 'QUEUED',
      amounts: [params.operation.amount?.amount || '0'],
      operation: params.operation,
      estimatedFee: {
        gasLimit: '21000',
        baseFee: '20000000000',
        priorityFee: '2000000000',
        maxFee: '24000000000'
      },
      createDate: new Date().toISOString(),
      updateDate: new Date().toISOString(),
    }

    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Simulate state updates
    setTimeout(() => {
      mockTransaction.state = 'SENT'
      mockTransaction.txHash = `0x${Math.random().toString(16).substr(2, 64)}`
    }, 2000)

    setTimeout(() => {
      mockTransaction.state = 'CONFIRMED'
    }, 5000)

    setTimeout(() => {
      mockTransaction.state = 'COMPLETE'
    }, 8000)

    return {
      data: { transaction: mockTransaction }
    }
  }

  async getTransactions(params: any) {
    // Mock transactions data
    const mockTransactions = [
      {
        id: 'tx_1',
        blockchain: 'ETH',
        tokenId: 'usdc_eth',
        walletId: params.walletIds[0],
        sourceAddress: '0x0987654321098765432109876543210987654321',
        destinationAddress: '0x1234567890123456789012345678901234567890',
        transactionType: 'INBOUND',
        custodyType: 'DEVELOPER',
        state: 'COMPLETE',
        amounts: ['500.00'],
        txHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        operation: {
          type: 'TRANSFER',
          transferOperation: {
            blockchain: 'ETH',
            destinationAddress: '0x1234567890123456789012345678901234567890',
            amount: {
              amount: '500.00',
              token: 'USDC'
            }
          }
        },
        createDate: new Date(Date.now() - 86400000).toISOString(),
        updateDate: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'tx_2',
        blockchain: 'ETH',
        tokenId: 'usdc_eth',
        walletId: params.walletIds[0],
        sourceAddress: '0x1234567890123456789012345678901234567890',
        destinationAddress: '0x5555666677778888999900001111222233334444',
        transactionType: 'OUTBOUND',
        custodyType: 'DEVELOPER',
        state: 'COMPLETE',
        amounts: ['250.75'],
        txHash: '0x1111222233334444555566667777888899990000aaaabbbbccccddddeeeeffff',
        operation: {
          type: 'TRANSFER',
          transferOperation: {
            blockchain: 'ETH',
            destinationAddress: '0x5555666677778888999900001111222233334444',
            amount: {
              amount: '250.75',
              token: 'USDC'
            }
          }
        },
        createDate: new Date(Date.now() - 172800000).toISOString(),
        updateDate: new Date(Date.now() - 172800000).toISOString(),
      }
    ]

    await new Promise(resolve => setTimeout(resolve, 500))
    
    return {
      data: { transactions: mockTransactions }
    }
  }

  async signMessage(params: any) {
    // Mock message signing
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return {
      data: {
        signature: `0x${Math.random().toString(16).substr(2, 130)}`,
        messageHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      }
    }
  }

  async estimateFee(params: any) {
    // Mock fee estimation
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return {
      data: {
        gasLimit: '21000',
        baseFee: '20000000000',
        priorityFee: '2000000000',
        maxFee: '24000000000',
        networkFee: '0.0005',
      }
    }
  }
}