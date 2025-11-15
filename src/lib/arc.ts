import { ArcService } from './mocks/arc-sdk'
import { ArcConfig } from '@/types'

class ArcWrapperService {
  private arc: ArcService | null = null
  private config: ArcConfig

  constructor(config: ArcConfig) {
    this.config = config
  }

  async initialize(): Promise<void> {
    if (this.arc) return

    this.arc = new ArcService(this.config)
    await this.arc.initialize()
  }

  async getLiquidityPools() {
    if (!this.arc) throw new Error('Arc not initialized')
    
    try {
      return await this.arc.getLiquidityPools()
    } catch (error) {
      console.error('Error getting liquidity pools:', error)
      throw error
    }
  }

  async getYieldOpportunities(params: {
    token: string
    amount: string
    chains?: number[]
  }) {
    if (!this.arc) throw new Error('Arc not initialized')
    
    try {
      return await this.arc.getYieldOpportunities(params)
    } catch (error) {
      console.error('Error getting yield opportunities:', error)
      throw error
    }
  }

  async stake(params: {
    poolId: string
    amount: string
    duration?: number
  }) {
    if (!this.arc) throw new Error('Arc not initialized')
    
    try {
      return await this.arc.stake(params)
    } catch (error) {
      console.error('Error staking:', error)
      throw error
    }
  }

  async unstake(stakingId: string) {
    if (!this.arc) throw new Error('Arc not initialized')
    
    try {
      return await this.arc.unstake(stakingId)
    } catch (error) {
      console.error('Error unstaking:', error)
      throw error
    }
  }

  async getStakingPositions(userAddress: string) {
    if (!this.arc) throw new Error('Arc not initialized')
    
    try {
      return await this.arc.getStakingPositions(userAddress)
    } catch (error) {
      console.error('Error getting staking positions:', error)
      throw error
    }
  }

  async getProtocolStats() {
    if (!this.arc) throw new Error('Arc not initialized')
    
    try {
      return await this.arc.getProtocolStats()
    } catch (error) {
      console.error('Error getting protocol stats:', error)
      throw error
    }
  }

  async getRewards(userAddress: string) {
    if (!this.arc) throw new Error('Arc not initialized')
    
    try {
      return await this.arc.getRewards(userAddress)
    } catch (error) {
      console.error('Error getting rewards:', error)
      throw error
    }
  }

  async claimRewards(userAddress: string, tokens?: string[]) {
    if (!this.arc) throw new Error('Arc not initialized')
    
    try {
      return await this.arc.claimRewards(userAddress, tokens)
    } catch (error) {
      console.error('Error claiming rewards:', error)
      throw error
    }
  }

  async getOptimalYield(params: {
    token: string
    amount: string
    riskTolerance: 'low' | 'medium' | 'high'
    duration?: number
  }) {
    // Enhanced yield optimization
    try {
      const opportunities = await this.getYieldOpportunities({
        token: params.token,
        amount: params.amount,
      })

      // Filter by risk tolerance
      const riskMap = {
        low: ['Low'],
        medium: ['Low', 'Medium'],
        high: ['Low', 'Medium', 'High'],
      }

      const filtered = opportunities.filter(opp => 
        riskMap[params.riskTolerance].includes(opp.riskLevel)
      )

      // Sort by APY descending
      const sorted = filtered.sort((a, b) => 
        parseFloat(b.apy) - parseFloat(a.apy)
      )

      return sorted[0] || null
    } catch (error) {
      console.error('Error getting optimal yield:', error)
      throw error
    }
  }

  async getPortfolioSummary(userAddress: string) {
    try {
      const [positions, rewards, stats] = await Promise.all([
        this.getStakingPositions(userAddress),
        this.getRewards(userAddress),
        this.getProtocolStats(),
      ])

      const totalStaked = positions.reduce((sum, pos) => 
        sum + parseFloat(pos.amount), 0
      )

      const totalRewards = positions.reduce((sum, pos) => 
        sum + parseFloat(pos.rewards), 0
      )

      const averageApy = positions.length > 0 
        ? positions.reduce((sum, pos) => sum + parseFloat(pos.apy), 0) / positions.length
        : 0

      return {
        totalStaked: totalStaked.toString(),
        totalRewards: totalRewards.toString(),
        averageApy: averageApy.toFixed(2) + '%',
        activePositions: positions.length,
        claimableRewards: rewards.claimableRewards,
        positions,
        rewards,
        protocolStats: stats,
      }
    } catch (error) {
      console.error('Error getting portfolio summary:', error)
      throw error
    }
  }
}

// Default Arc configuration
const defaultArcConfig: ArcConfig = {
  apiKey: 'mock_arc_api_key',
  baseUrl: 'https://api.arc.xyz',
  networkId: 'mainnet',
}

// Export singleton instance
export const arcService = new ArcWrapperService(defaultArcConfig)