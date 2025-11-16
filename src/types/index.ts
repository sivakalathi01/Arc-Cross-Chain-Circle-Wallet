// Core wallet types
export interface Wallet {
  id: string
  address: string
  blockchain: string
  custodyType: 'DEVELOPER' | 'END_USER'
  accountType: 'SCA' | 'EOA'
  updateDate: string
  createDate: string
  name?: string
}

export interface WalletBalance {
  tokenId: string
  amount: string
  updateDate: string
  token: {
    id: string
    blockchain: string
    tokenAddress?: string
    standard: string
    name: string
    symbol: string
    decimals: number
    isNative: boolean
    updateDate: string
    createDate: string
  }
}

// Transaction types
export interface Transaction {
  id: string
  blockchain: string
  tokenId: string
  walletId: string
  sourceAddress: string
  destinationAddress: string
  transactionType: 'INBOUND' | 'OUTBOUND'
  custodyType: 'DEVELOPER' | 'END_USER'
  state: 'QUEUED' | 'SENT' | 'CONFIRMED' | 'COMPLETE' | 'FAILED' | 'CANCELLED'
  amounts: string[]
  txHash?: string
  destinationChain?: string // For CCTP cross-chain transfers
  destinationTxHash?: string // CCTP mint transaction hash on destination chain
  attestationHash?: string // CCTP attestation signature
  messageHash?: string // CCTP message hash
  blockHeight?: number
  blockHash?: string
  abiParameters?: any
  estimatedFee?: EstimatedFee
  networkFee?: string
  firstConfirmDate?: string
  operation: TransactionOperation
  updateDate: string
  createDate: string
}

export interface EstimatedFee {
  gasLimit: string
  baseFee: string
  priorityFee: string
  maxFee: string
}

export interface TransactionOperation {
  type: 'TRANSFER' | 'CONTRACT_EXECUTION'
  transferOperation?: TransferOperation
  contractExecutionOperation?: ContractExecutionOperation
}

export interface TransferOperation {
  blockchain: string
  destinationAddress: string
  amount: {
    amount: string
    token: string
  }
}

export interface ContractExecutionOperation {
  contractAddress: string
  abiFunctionSignature: string
  abiParameters: any[]
  amount?: {
    amount: string
  }
}

// Cross-chain transfer types
export interface CrossChainTransfer {
  id: string
  sourceChain: string
  destinationChain: string
  sourceAddress: string
  destinationAddress: string
  amount: string
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'FAILED'
  txHash?: string
  attestation?: string
  estimatedTime: number
  fees: {
    sourceFee: string
    destinationFee: string
    bridgeFee: string
  }
  createDate: string
  updateDate: string
}

// Payment types
export interface Payment {
  id: string
  merchantId: string
  amount: string
  currency: string
  description: string
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  paymentMethod: PaymentMethod
  metadata?: Record<string, any>
  createDate: string
  updateDate: string
}

export interface PaymentMethod {
  type: 'WALLET'
  walletId: string
  blockchain: string
}

// Network and chain types
export interface SupportedChain {
  id: number
  name: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
  rpcUrls: {
    default: {
      http: string[]
    }
  }
  blockExplorers: {
    default: {
      name: string
      url: string
    }
  }
  testnet?: boolean
  iconUrl?: string
}

// User and authentication types
export interface User {
  id: string
  email?: string
  name?: string
  wallets: Wallet[]
  settings: UserSettings
  createDate: string
  updateDate: string
}

export interface UserSettings {
  defaultChain: string
  notifications: boolean
  theme: 'light' | 'dark'
  currency: string
  language: string
}

// API response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  code?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

// Circle SDK types
export interface CircleConfig {
  apiKey: string
  clientKey: string
  entitySecret: string
  baseUrl: string
}

export interface CircleUserToken {
  userToken: string
  encryptionKey: string
}

// CCTP types
export interface CCTPConfig {
  chains: CCTPChain[]
  tokens: CCTPToken[]
}

export interface CCTPChain {
  chainId: number
  name: string
  domainId: number
  tokenMessengerAddress: string
  messageTransmitterAddress: string
  usdcAddress: string
}

export interface CCTPToken {
  address: string
  chainId: number
  symbol: string
  decimals: number
}

// CCTP Transaction State for tracking burn/attestation/mint flow
export interface CCTPTransactionState {
  transactionId: string
  sourceTxHash?: string
  destinationTxHash?: string
  attestationHash?: string
  messageHash?: string
  status: 'PENDING_BURN' | 'BURN_COMPLETE' | 'ATTESTATION_PENDING' | 'ATTESTATION_READY' | 'MINT_PENDING' | 'MINT_COMPLETE' | 'FAILED'
  sourceChain: string
  destinationChain: string
  amount: string
  createdAt: string
  updatedAt: string
}

// Gateway types
export interface GatewayConfig {
  apiKey: string
  baseUrl: string
  supportedChains: number[]
}

// Arc types
export interface ArcConfig {
  apiKey: string
  baseUrl: string
  networkId: string
}

// UI Component types
export interface WalletCardProps {
  wallet: Wallet
  balance: WalletBalance[]
  onSelect: (wallet: Wallet) => void
  isSelected: boolean
}

export interface TransactionListProps {
  transactions: Transaction[]
  loading: boolean
  onLoadMore: () => void
  hasMore: boolean
}

export interface CrossChainTransferFormProps {
  onSubmit: (transfer: Partial<CrossChainTransfer>) => void
  loading: boolean
  supportedChains: SupportedChain[]
}

// Store types
export interface WalletState {
  user: User | null
  selectedWallet: Wallet | null
  wallets: Wallet[]
  balances: Record<string, WalletBalance[]>
  transactions: Transaction[]
  crossChainTransfers: CrossChainTransfer[]
  loading: boolean
  error: string | null
}

export interface WalletActions {
  setUser: (user: User | null) => void
  setSelectedWallet: (wallet: Wallet | null) => void
  setWallets: (wallets: Wallet[]) => void
  setBalances: (walletId: string, balances: WalletBalance[]) => void
  addTransaction: (transaction: Transaction) => void
  updateTransaction: (id: string, updates: Partial<Transaction>) => void
  addCrossChainTransfer: (transfer: CrossChainTransfer) => void
  updateCrossChainTransfer: (id: string, updates: Partial<CrossChainTransfer>) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

export type WalletStore = WalletState & WalletActions