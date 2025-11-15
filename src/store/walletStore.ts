import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { WalletStore, User, Wallet, WalletBalance, Transaction, CrossChainTransfer } from '@/types'

const initialState = {
  user: null,
  selectedWallet: null,
  wallets: [],
  balances: {},
  transactions: [],
  crossChainTransfers: [],
  loading: false,
  error: null,
}

export const useWalletStore = create<WalletStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        setUser: (user: User | null) => {
          set(
            { user },
            false,
            'setUser'
          )
        },

        setSelectedWallet: (wallet: Wallet | null) => {
          set(
            { selectedWallet: wallet },
            false,
            'setSelectedWallet'
          )
        },

        setWallets: (wallets: Wallet[]) => {
          set(
            { wallets },
            false,
            'setWallets'
          )
        },

        setBalances: (walletId: string, balances: WalletBalance[]) => {
          set(
            (state) => ({
              balances: {
                ...state.balances,
                [walletId]: balances,
              },
            }),
            false,
            'setBalances'
          )
        },

        addTransaction: (transaction: Transaction) => {
          set(
            (state) => ({
              transactions: [transaction, ...state.transactions],
            }),
            false,
            'addTransaction'
          )
        },

        updateTransaction: (id: string, updates: Partial<Transaction>) => {
          set(
            (state) => ({
              transactions: state.transactions.map((tx) =>
                tx.id === id ? { ...tx, ...updates } : tx
              ),
            }),
            false,
            'updateTransaction'
          )
        },

        addCrossChainTransfer: (transfer: CrossChainTransfer) => {
          set(
            (state) => ({
              crossChainTransfers: [transfer, ...state.crossChainTransfers],
            }),
            false,
            'addCrossChainTransfer'
          )
        },

        updateCrossChainTransfer: (id: string, updates: Partial<CrossChainTransfer>) => {
          set(
            (state) => ({
              crossChainTransfers: state.crossChainTransfers.map((transfer) =>
                transfer.id === id ? { ...transfer, ...updates } : transfer
              ),
            }),
            false,
            'updateCrossChainTransfer'
          )
        },

        setLoading: (loading: boolean) => {
          set(
            { loading },
            false,
            'setLoading'
          )
        },

        setError: (error: string | null) => {
          set(
            { error },
            false,
            'setError'
          )
        },

        reset: () => {
          set(
            initialState,
            false,
            'reset'
          )
        },
      }),
      {
        name: 'arc-wallet-store',
        partialize: (state) => ({
          user: state.user,
          selectedWallet: state.selectedWallet,
          wallets: state.wallets,
          balances: state.balances,
        }),
      }
    ),
    {
      name: 'arc-wallet-store',
    }
  )
)

// Selector hooks for better performance
export const useSelectedWallet = () => useWalletStore((state) => state.selectedWallet)
export const useWallets = () => useWalletStore((state) => state.wallets)
export const useUser = () => useWalletStore((state) => state.user)
export const useBalances = (walletId?: string) => 
  useWalletStore((state) => walletId ? state.balances[walletId] || [] : {})
export const useTransactions = () => useWalletStore((state) => state.transactions)
export const useCrossChainTransfers = () => useWalletStore((state) => state.crossChainTransfers)
export const useWalletLoading = () => useWalletStore((state) => state.loading)
export const useWalletError = () => useWalletStore((state) => state.error)