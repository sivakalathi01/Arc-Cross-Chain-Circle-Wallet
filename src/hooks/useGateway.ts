import { useState, useEffect } from 'react'
import { gatewayService } from '@/lib/gateway'

export function useGateway() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [supportedChains, setSupportedChains] = useState<any[]>([])

  useEffect(() => {
    const initializeGateway = async () => {
      try {
        await gatewayService.initialize()
        const chains = await gatewayService.getSupportedChains()
        setSupportedChains(chains)
      } catch (err) {
        console.error('Failed to initialize Gateway:', err)
        setError('Failed to initialize Gateway service')
      }
    }

    initializeGateway()
  }, [])

  const findOptimalRoute = async (params: {
    sourceChain: number
    destinationChain: number
    amount: string
    token: string
  }) => {
    try {
      setLoading(true)
      setError(null)
      const route = await gatewayService.findOptimalRoute(params)
      return route
    } catch (err) {
      setError('Failed to find optimal route')
      console.error(err)
      return null
    } finally {
      setLoading(false)
    }
  }

  const executeRoute = async (params: {
    routeId: string
    userAddress: string
    amount: string
  }) => {
    try {
      setLoading(true)
      setError(null)
      const result = await gatewayService.executeRoute(params)
      return result
    } catch (err) {
      setError('Failed to execute route')
      console.error(err)
      return null
    } finally {
      setLoading(false)
    }
  }

  const getTransactionStatus = async (transactionId: string) => {
    try {
      setLoading(true)
      setError(null)
      const status = await gatewayService.getTransactionStatus(transactionId)
      return status
    } catch (err) {
      setError('Failed to get transaction status')
      console.error(err)
      return null
    } finally {
      setLoading(false)
    }
  }

  const estimateGasFees = async (params: {
    sourceChain: number
    destinationChain: number
    amount: string
  }) => {
    try {
      setLoading(true)
      setError(null)
      const fees = await gatewayService.estimateGasFees(params)
      return fees
    } catch (err) {
      setError('Failed to estimate gas fees')
      console.error(err)
      return null
    } finally {
      setLoading(false)
    }
  }

  const getSupportedTokens = async (chainId: number) => {
    try {
      setLoading(true)
      setError(null)
      const tokens = await gatewayService.getSupportedTokens(chainId)
      return tokens
    } catch (err) {
      setError('Failed to get supported tokens')
      console.error(err)
      return []
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    supportedChains,
    findOptimalRoute,
    executeRoute,
    getTransactionStatus,
    estimateGasFees,
    getSupportedTokens,
  }
}