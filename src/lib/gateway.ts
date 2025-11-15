import { GatewayService } from './mocks/gateway-sdk'
import { GatewayConfig } from '@/types'

class GatewayWrapperService {
  private gateway: GatewayService | null = null
  private config: GatewayConfig

  constructor(config: GatewayConfig) {
    this.config = config
  }

  async initialize(): Promise<void> {
    if (this.gateway) return

    this.gateway = new GatewayService(this.config)
    await this.gateway.initialize()
  }

  async findOptimalRoute(params: {
    sourceChain: number
    destinationChain: number
    amount: string
    token: string
  }) {
    if (!this.gateway) throw new Error('Gateway not initialized')
    
    try {
      const result = await this.gateway.getOptimalRoute(params)
      return result.route
    } catch (error) {
      console.error('Error finding optimal route:', error)
      throw error
    }
  }

  async executeRoute(params: {
    routeId: string
    userAddress: string
    amount: string
  }) {
    if (!this.gateway) throw new Error('Gateway not initialized')
    
    try {
      return await this.gateway.executeRoute(params)
    } catch (error) {
      console.error('Error executing route:', error)
      throw error
    }
  }

  async getTransactionStatus(transactionId: string) {
    if (!this.gateway) throw new Error('Gateway not initialized')
    
    try {
      return await this.gateway.getTransactionStatus(transactionId)
    } catch (error) {
      console.error('Error getting transaction status:', error)
      throw error
    }
  }

  async getSupportedChains() {
    if (!this.gateway) throw new Error('Gateway not initialized')
    
    try {
      return await this.gateway.getSupportedChains()
    } catch (error) {
      console.error('Error getting supported chains:', error)
      throw error
    }
  }

  async getSupportedTokens(chainId: number) {
    if (!this.gateway) throw new Error('Gateway not initialized')
    
    try {
      return await this.gateway.getSupportedTokens(chainId)
    } catch (error) {
      console.error('Error getting supported tokens:', error)
      throw error
    }
  }

  async estimateGasFees(params: {
    sourceChain: number
    destinationChain: number
    amount: string
  }) {
    // Enhanced fee estimation using Gateway's optimization
    try {
      const route = await this.findOptimalRoute({
        sourceChain: params.sourceChain,
        destinationChain: params.destinationChain,
        amount: params.amount,
        token: 'USDC',
      })

      return {
        sourceChainFee: route.steps[0]?.estimatedFee || '0.001',
        destinationChainFee: '0.0005',
        protocolFee: '0',
        totalFee: route.totalFee,
        estimatedTime: route.totalTime,
      }
    } catch (error) {
      console.error('Error estimating gas fees:', error)
      // Fallback to basic estimation
      return {
        sourceChainFee: '0.001',
        destinationChainFee: '0.0005',
        protocolFee: '0',
        totalFee: '0.0015',
        estimatedTime: 900,
      }
    }
  }
}

// Default Gateway configuration
const defaultGatewayConfig: GatewayConfig = {
  apiKey: 'mock_gateway_api_key',
  baseUrl: 'https://api.gateway.fm',
  supportedChains: [1, 137, 42161, 10, 43114],
}

// Export singleton instance
export const gatewayService = new GatewayWrapperService(defaultGatewayConfig)