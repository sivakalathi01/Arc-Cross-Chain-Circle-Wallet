import { useState, useEffect } from 'react'
import { useWallet } from '@/context/WalletContext'
import { arcService } from '@/lib/arc'

export function useArcProtocol() {
  const { selectedWallet } = useWallet()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initializeArc = async () => {
      try {
        await arcService.initialize()
      } catch (err) {
        console.error('Failed to initialize Arc:', err)
        setError('Failed to initialize Arc protocol')
      }
    }

    initializeArc()
  }, [])

  const getLiquidityPools = async () => {
    try {
      setLoading(true)
      setError(null)
      const pools = await arcService.getLiquidityPools()
      return pools
    } catch (err) {
      setError('Failed to fetch liquidity pools')
      console.error(err)
      return []
    } finally {
      setLoading(false)
    }
  }

  const getYieldOpportunities = async (token: string, amount: string) => {
    try {
      setLoading(true)
      setError(null)
      const opportunities = await arcService.getYieldOpportunities({
        token,
        amount,
      })
      return opportunities
    } catch (err) {
      setError('Failed to fetch yield opportunities')
      console.error(err)
      return []
    } finally {
      setLoading(false)
    }
  }

  const stake = async (poolId: string, amount: string, duration?: number) => {
    if (!selectedWallet) {
      setError('No wallet selected')
      return null
    }

    try {
      setLoading(true)
      setError(null)
      const result = await arcService.stake({
        poolId,
        amount,
        duration,
      })
      return result
    } catch (err) {
      setError('Failed to stake tokens')
      console.error(err)
      return null
    } finally {
      setLoading(false)
    }
  }

  const unstake = async (stakingId: string) => {
    if (!selectedWallet) {
      setError('No wallet selected')
      return null
    }

    try {
      setLoading(true)
      setError(null)
      const result = await arcService.unstake(stakingId)
      return result
    } catch (err) {
      setError('Failed to unstake tokens')
      console.error(err)
      return null
    } finally {
      setLoading(false)
    }
  }

  const getStakingPositions = async () => {
    if (!selectedWallet) {
      setError('No wallet selected')
      return []
    }

    try {
      setLoading(true)
      setError(null)
      const positions = await arcService.getStakingPositions(selectedWallet.address)
      return positions
    } catch (err) {
      setError('Failed to fetch staking positions')
      console.error(err)
      return []
    } finally {
      setLoading(false)
    }
  }

  const getRewards = async () => {
    if (!selectedWallet) {
      setError('No wallet selected')
      return null
    }

    try {
      setLoading(true)
      setError(null)
      const rewards = await arcService.getRewards(selectedWallet.address)
      return rewards
    } catch (err) {
      setError('Failed to fetch rewards')
      console.error(err)
      return null
    } finally {
      setLoading(false)
    }
  }

  const claimRewards = async (tokens?: string[]) => {
    if (!selectedWallet) {
      setError('No wallet selected')
      return null
    }

    try {
      setLoading(true)
      setError(null)
      const result = await arcService.claimRewards(selectedWallet.address, tokens)
      return result
    } catch (err) {
      setError('Failed to claim rewards')
      console.error(err)
      return null
    } finally {
      setLoading(false)
    }
  }

  const getPortfolioSummary = async () => {
    if (!selectedWallet) {
      setError('No wallet selected')
      return null
    }

    try {
      setLoading(true)
      setError(null)
      const summary = await arcService.getPortfolioSummary(selectedWallet.address)
      return summary
    } catch (err) {
      setError('Failed to fetch portfolio summary')
      console.error(err)
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    getLiquidityPools,
    getYieldOpportunities,
    stake,
    unstake,
    getStakingPositions,
    getRewards,
    claimRewards,
    getPortfolioSummary,
  }
}