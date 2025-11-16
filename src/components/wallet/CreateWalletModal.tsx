'use client'

import { useState } from 'react'

interface CreateWalletModalProps {
  onClose: () => void
  onSubmit: (name?: string, blockchain?: string) => Promise<void>
  loading: boolean
}

export function CreateWalletModal({ onClose, onSubmit, loading }: CreateWalletModalProps) {
  const [walletName, setWalletName] = useState('')
  const [blockchain, setBlockchain] = useState('ARC-TESTNET')

  const handleBlockchainChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newBlockchain = e.target.value
    console.log('🔵 Modal: Blockchain changed to:', newBlockchain)
    setBlockchain(newBlockchain)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🔵 Modal: Current blockchain state:', blockchain)
    console.log('🔵 Modal: Submitting wallet creation with blockchain:', blockchain)
    await onSubmit(walletName.trim() || undefined, blockchain)
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Create New Wallet</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4">
          <div className="mb-4">
            <label htmlFor="walletName" className="block text-sm font-medium text-gray-700 mb-2">
              Wallet Name (Optional)
            </label>
            <input
              type="text"
              id="walletName"
              value={walletName}
              onChange={(e) => setWalletName(e.target.value)}
              placeholder="Enter wallet name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              If not provided, a default name will be assigned.
            </p>
          </div>

          <div className="mb-4">
            <label htmlFor="blockchain" className="block text-sm font-medium text-gray-700 mb-2">
              Blockchain Network
            </label>
            <select
              id="blockchain"
              value={blockchain}
              onChange={handleBlockchainChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ARC-TESTNET">🔷 Arc Testnet</option>
              <option value="ETH-SEPOLIA">⬠ Ethereum Sepolia Testnet</option>
              <option value="MATIC-AMOY">💜 Polygon Amoy Testnet</option>
              <option value="AVAX-FUJI">🔺 Avalanche Fuji Testnet</option>
            </select>
            <p className="mt-1 text-sm text-gray-500">
              {blockchain === 'ARC-TESTNET' && '⚡ Arc L3 testnet - Built on Arbitrum Orbit'}
              {blockchain === 'ETH-SEPOLIA' && '🔧 Ethereum mainnet testnet environment'}
              {blockchain === 'MATIC-AMOY' && '💰 Polygon testnet with minimal gas fees'}
              {blockchain === 'AVAX-FUJI' && '❄️ Avalanche testnet for DeFi applications'}
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex">
              <svg className="w-5 h-5 text-blue-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="text-sm font-medium text-blue-800">Circle Wallet Creation</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Creates a secure smart contract wallet using Circle's infrastructure.
                </p>
                <p className="text-sm text-blue-600 mt-1 font-medium">
                  ⚠️ Requires real Circle API keys in .env.local
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
            <div className="flex">
              <svg className="w-5 h-5 text-orange-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="text-sm font-medium text-orange-800">No API Keys? Use MetaMask!</h4>
                <p className="text-sm text-orange-700 mt-1">
                  🦊 Connect MetaMask to test with your existing 10 USDC on Sepolia/Arc
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </span>
              ) : (
                'Create Wallet'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}