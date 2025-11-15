// Circle Wallet Integration Hook - Using Direct API (Working Implementation)
'use client'

import { useState, useCallback } from 'react'
import { CircleDirectClient, CircleUser, CircleUserToken, CircleWallet } from '@/lib/circle-direct'

interface CircleWalletState {
  user: CircleUser | null
  userToken: CircleUserToken | null
  wallet: CircleWallet | null
  isLoading: boolean
  error: string | null
}

interface UseCircleWalletReturn {
  state: CircleWalletState
  createWallet: () => Promise<void>
  reset: () => void
}

export function useCircleWallet(): UseCircleWalletReturn {
  const [state, setState] = useState<CircleWalletState>({
    user: null,
    userToken: null,
    wallet: null,
    isLoading: false,
    error: null
  })

  const createWallet = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      console.log('🔄 Starting Circle wallet creation with working direct API...')
      
      // Create Circle client
      const response = await fetch('/api/circle/setup-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create Circle wallet')
      }

      const data = await response.json()
      
      setState({
        user: data.user,
        userToken: data.userToken,
        wallet: data.wallet,
        isLoading: false,
        error: null
      })

      console.log('✅ Circle wallet created successfully!')
      console.log('Wallet Address:', data.wallet?.address)
      
    } catch (error: any) {
      console.error('❌ Circle wallet creation failed:', error)
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to create Circle wallet'
      }))
    }
  }, [])

  const reset = useCallback(() => {
    setState({
      user: null,
      userToken: null,
      wallet: null,
      isLoading: false,
      error: null
    })
  }, [])

  return {
    state,
    createWallet,
    reset
  }
}