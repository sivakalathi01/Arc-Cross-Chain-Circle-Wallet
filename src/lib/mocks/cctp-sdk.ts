// Mock implementation of CCTP SDK for development
export class CCTPSDKService {
  private config: any

  constructor(config: any) {
    this.config = config
  }

  async createBurnTransaction(params: any) {
    // Mock burn transaction
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return {
      to: '0xBd3fa81B58Ba92a82136038B25aDec7066af3155', // Mock token messenger
      data: '0x' + 'a'.repeat(138), // Mock transaction data
      value: '0',
      gasLimit: '100000',
    }
  }

  async getAttestation(params: any) {
    // Mock attestation retrieval with delay
    await new Promise(resolve => setTimeout(resolve, 30000)) // 30 second delay to simulate attestation time
    
    return '0x' + 'b'.repeat(1000) // Mock attestation
  }

  async createMintTransaction(params: any) {
    // Mock mint transaction
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return {
      to: '0x0a992d191DEeC32aFe36203Ad87D7d289a738F81', // Mock message transmitter
      data: '0x' + 'c'.repeat(200), // Mock transaction data
      value: '0',
      gasLimit: '200000',
    }
  }

  async getTransferStatus(params: any) {
    // Mock transfer status
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Simulate different statuses based on time
    const now = Date.now()
    const txTime = parseInt(params.transactionHash.slice(-8), 16) // Use hash as pseudo-timestamp
    const elapsed = now - txTime
    
    if (elapsed < 60000) { // Less than 1 minute
      return { status: 'PENDING' }
    } else if (elapsed < 300000) { // Less than 5 minutes
      return { status: 'CONFIRMED', attestation: '0x' + 'attestation'.repeat(20) }
    } else {
      return { status: 'COMPLETED', attestation: '0x' + 'attestation'.repeat(20) }
    }
  }
}

// Mock ethers utilities for development
export const mockEthers = {
  utils: {
    parseUnits: (value: string, decimals: number) => {
      const factor = Math.pow(10, decimals)
      return (parseFloat(value) * factor).toString()
    },
    isAddress: (address: string) => {
      return /^0x[a-fA-F0-9]{40}$/.test(address)
    }
  }
}