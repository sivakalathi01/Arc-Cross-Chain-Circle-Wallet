'use client'

import { Wallet, WalletBalance } from '@/types'
import { useState } from 'react'
import { getExplorerUrl } from '@/lib/block-explorer'

interface WalletCardProps {
  wallet: Wallet
  balance: WalletBalance[]
  isSelected: boolean
  onSelect: (wallet: Wallet) => void
}

export function WalletCard({ wallet, balance, isSelected, onSelect }: WalletCardProps) {
  const [copied, setCopied] = useState(false)
  const [showFullAddress, setShowFullAddress] = useState(false)
  
  const totalUSDC = balance
    .filter(b => b.token.symbol.includes('USDC'))
    .reduce((total, b) => total + parseFloat(b.amount), 0)

  const copyAddress = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (wallet.address) {
      navigator.clipboard.writeText(wallet.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

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
          <div className="flex items-center gap-2">
            <button
              onClick={copyAddress}
              onMouseEnter={() => setShowFullAddress(true)}
              onMouseLeave={() => setShowFullAddress(false)}
              className="relative text-sm font-mono text-gray-900 hover:text-blue-600 transition-colors"
              title="Click to copy full address"
            >
              {showFullAddress && wallet.address ? (
                <span className="text-xs">{wallet.address}</span>
              ) : (
                <span>{wallet.address ? `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}` : 'N/A'}</span>
              )}
              {copied && (
                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  Copied!
                </span>
              )}
            </button>
            {wallet.address && (
              <>
                <svg 
                  onClick={copyAddress}
                  className="w-4 h-4 text-gray-400 hover:text-blue-600 cursor-pointer" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  aria-label="Copy address"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <a
                  href={getExplorerUrl(wallet.blockchain, 'address', wallet.address)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-4 h-4 text-gray-400 hover:text-blue-600 cursor-pointer"
                  title="View on block explorer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </>
            )}
          </div>
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