'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { circleWalletService } from '@/lib/circle-working'
import { cctpService } from '@/lib/cctp'
import { useWalletStore } from '@/store/walletStore'
import { Wallet, User, WalletBalance, Transaction } from '@/types'
import toast from '@/lib/toast'

interface WalletContextType {
  user: User | null
  wallets: Wallet[]
  selectedWallet: Wallet | null
  balances: Record<string, WalletBalance[]>
  transactions: Transaction[]
  loading: boolean
  error: string | null
  
  // Actions
  initializeWallet: () => Promise<void>
  createWallet: (name?: string, blockchain?: string) => Promise<Wallet | null>
  selectWallet: (wallet: Wallet) => void
  refreshBalances: (walletId?: string) => Promise<void>
  refreshTransactions: (walletId?: string) => Promise<void>
  sendTransaction: (params: {
    destinationAddress: string
    destinationBlockchain?: string
    amount: string
    tokenAddress?: string
  }) => Promise<Transaction | null>
  initiateCrossChainTransfer: (params: {
    destinationChain: number
    destinationAddress: string
    amount: string
  }) => Promise<any>
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const {
    user,
    wallets,
    selectedWallet,
    balances,
    transactions,
    loading,
    error,
    setUser,
    setWallets,
    setSelectedWallet,
    setBalances,
    addTransaction,
    updateTransaction,
    setLoading,
    setError,
  } = useWalletStore()

  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (!initialized) {
      initializeWallet()
    }
  }, [initialized])

  const initializeWallet = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('🚀 Starting wallet initialization...')

      // Initialize Circle testnet services (no mock fallbacks)
      console.log('📡 Connecting to Circle testnet service...')
      await circleWalletService.initialize()
      
      console.log('🌐 Connecting to CCTP service...')
      await cctpService.initialize()

      // Load user wallets from Circle (if real API keys are configured)
      console.log('💼 Checking for Circle wallets...')
      const userWallets = await circleWalletService.getWallets()
      
      if (userWallets.length === 0) {
        console.log('🦊 No Circle wallets found - MetaMask integration ready')
        console.log('💡 Use MetaMask tab to connect your wallet with 10 USDC')
      } else {
        console.log(`✅ Found ${userWallets.length} Circle wallets`)
      }

      setWallets(userWallets)

      // Set first wallet as selected if none selected
      if (userWallets.length > 0 && !selectedWallet) {
        setSelectedWallet(userWallets[0])
        console.log(`🎯 Selected wallet: ${userWallets[0].name}`)
      }

      // Create user profile
      const mockUser: User = {
        id: 'user_1',
        email: 'demo@arcwallet.com',
        name: 'Arc Demo User',
        wallets: userWallets,
        settings: {
          defaultChain: 'ethereum',
          notifications: true,
          theme: 'light',
          currency: 'USD',
          language: 'en',
        },
        createDate: new Date().toISOString(),
        updateDate: new Date().toISOString(),
      }
      setUser(mockUser)

      setInitialized(true)
      console.log('🎉 Wallet initialization complete!')
      
      // Load balances and transactions for wallets after initialization
      setTimeout(async () => {
        if (userWallets.length > 0) {
          console.log('💰 Loading wallet balances and transactions...')
          try {
            await refreshBalances(userWallets[0].id)
            await refreshTransactions(userWallets[0].id)
            if (userWallets.length > 1) {
              await refreshBalances(userWallets[1].id)
              await refreshTransactions(userWallets[1].id)
            }
          } catch (loadingError) {
            console.warn('Data loading failed:', loadingError)
          }
        }
      }, 500)
      
      toast.success('Arc Cross Chain Wallet ready! Use MetaMask tab to connect your 10 USDC')
    } catch (error) {
      console.error('❌ Critical initialization error:', error)
      setError(error instanceof Error ? error.message : 'Failed to initialize wallet')
      toast.error('Wallet initialization failed')
    } finally {
      setLoading(false)
    }
  }

  const createWallet = async (name?: string, blockchain?: string): Promise<Wallet | null> => {
    try {
      setLoading(true)
      setError(null)

      console.log(`🔨 Creating new wallet with Circle testnet: ${name || 'Unnamed Wallet'} on ${blockchain || 'ARB-SEPOLIA'}`)

      // Create wallet with Circle testnet API
      const newWallet = await circleWalletService.createWallet(name, blockchain)
      console.log('✅ Wallet created via Circle testnet API:', newWallet)
      console.log('🔨 Returned wallet blockchain:', newWallet?.blockchain)
      
      // Refresh wallets list from API
      const updatedWallets = await circleWalletService.getWallets()
      console.log('📋 Updated wallets list:', updatedWallets)
      setWallets(updatedWallets)

      if (newWallet) {
        toast.success(`Wallet "${newWallet.name || name || 'New Wallet'}" created successfully!`)
        return newWallet
      } else {
        throw new Error('Failed to create wallet')
      }
    } catch (error) {
      console.error('❌ Circle testnet wallet creation error:', error)
      setError(error instanceof Error ? error.message : 'Failed to create wallet')
      toast.error('Failed to create wallet')
      return null
    } finally {
      setLoading(false)
    }
  }

  const selectWallet = (wallet: Wallet) => {
    setSelectedWallet(wallet)
    // Refresh data for the selected wallet
    refreshBalances(wallet.id)
    refreshTransactions(wallet.id)
  }

  const refreshBalances = async (walletId?: string) => {
    const targetWalletId = walletId || selectedWallet?.id
    if (!targetWalletId) return

    try {
      const balance = await circleWalletService.getWalletBalances(targetWalletId)
      setBalances(targetWalletId, balance || [])
      console.log(`💰 Loaded balances for wallet ${targetWalletId} from Circle testnet`)
    } catch (error) {
      console.error('❌ Failed to load balances from Circle testnet:', error)
      throw error
    }
  }

  const refreshTransactions = async (walletId?: string) => {
    const targetWalletId = walletId || selectedWallet?.id
    if (!targetWalletId) return

    try {
      const transactions = await circleWalletService.getTransactions(targetWalletId)
      // Update transactions in store
      transactions.forEach((tx: Transaction) => {
        addTransaction(tx)
      })
      console.log(`📄 Loaded ${transactions.length} transactions for wallet ${targetWalletId} from Circle testnet`)
    } catch (error) {
      console.error('❌ Failed to load transactions from Circle testnet:', error)
      throw error
    }
  }

  const sendTransaction = async (params: {
    destinationAddress: string
    destinationBlockchain?: string
    amount: string
    tokenAddress?: string
  }): Promise<Transaction | null> => {
    if (!selectedWallet) {
      toast.error('No wallet selected')
      return null
    }

    try {
      setLoading(true)
      setError(null)

      const transaction = await circleWalletService.sendTransaction({
        walletId: selectedWallet.id,
        destinationAddress: params.destinationAddress,
        destinationBlockchain: params.destinationBlockchain,
        amount: params.amount,
        tokenAddress: params.tokenAddress,
      })

      // Construct a complete transaction object from the response
      const completeTransaction: Transaction = {
        id: transaction.id,
        blockchain: params.destinationBlockchain || selectedWallet.blockchain,
        tokenId: params.tokenAddress || '',
        walletId: selectedWallet.id,
        sourceAddress: selectedWallet.address,
        destinationAddress: params.destinationAddress,
        transactionType: 'OUTBOUND',
        custodyType: 'DEVELOPER',
        state: transaction.state || 'INITIATED',
        amounts: [params.amount],
        txHash: transaction.txHash,
        operation: 'TRANSFER' as any,
        updateDate: new Date().toISOString(),
        createDate: new Date().toISOString(),
      }

      addTransaction(completeTransaction)
      
      // Refresh balances after transaction
      await refreshBalances()

      toast.success('Transaction sent successfully')
      return completeTransaction
    } catch (error) {
      console.error('Failed to send transaction:', error)
      setError('Failed to send transaction')
      toast.error('Failed to send transaction')
      return null
    } finally {
      setLoading(false)
    }
  }

  const initiateCrossChainTransfer = async (params: {
    destinationChain: number
    destinationAddress: string
    amount: string
  }) => {
    if (!selectedWallet) {
      toast.error('No wallet selected')
      return null
    }

    try {
      setLoading(true)
      setError(null)

      // This would require integration with a signer
      // For now, we'll return a mock response
      toast.success('Cross-chain transfer initiated (mock)')
      
      return {
        id: 'mock_transfer_id',
        status: 'pending',
      }
    } catch (error) {
      console.error('Failed to initiate cross-chain transfer:', error)
      setError('Failed to initiate cross-chain transfer')
      toast.error('Failed to initiate cross-chain transfer')
      return null
    } finally {
      setLoading(false)
    }
  }

  const value: WalletContextType = {
    user,
    wallets,
    selectedWallet,
    balances,
    transactions,
    loading,
    error,
    initializeWallet,
    createWallet,
    selectWallet,
    refreshBalances,
    refreshTransactions,
    sendTransaction,
    initiateCrossChainTransfer,
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}