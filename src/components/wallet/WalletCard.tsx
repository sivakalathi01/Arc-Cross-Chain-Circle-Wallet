'use client'

import { Wallet, WalletBalance } from '@/types'

interface WalletCardProps {
  wallet: Wallet
  balance: WalletBalance[]
  isSelected: boolean
  onSelect: (wallet: Wallet) => void
}

export function WalletCard({ wallet, balance, isSelected, onSelect }: WalletCardProps) {
  const totalUSDC = balance
    .filter(b => b.token.symbol === 'USDC')
    .reduce((total, b) => total + parseFloat(b.amount), 0)

  return (
    <div
      onClick={() => onSelect(wallet)}
      className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'border-blue-500 bg-blue-50 shadow-md'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-3">
            <span className="text-white font-semibold text-sm">
              {wallet.name?.charAt(0) || 'W'}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900">
              {wallet.name || `Wallet ${wallet.id.slice(-6)}`}
            </p>
            <p className="text-sm text-gray-500">{wallet.blockchain}</p>
          </div>
        </div>
        {isSelected && (
          <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Address</span>
          <span className="text-sm font-mono text-gray-900">
            {wallet.address ? `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}` : 'N/A'}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">USDC Balance</span>
          <span className="text-sm font-semibold text-gray-900">
            ${totalUSDC.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Type</span>
          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
            {wallet.accountType}
          </span>
        </div>
      </div>
    </div>
  )
}