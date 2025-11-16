'use client'

import React, { useState } from 'react'
import { Wallet, Send, ArrowUpDown, Plus, RefreshCw, Droplets, Plug } from 'lucide-react'
import { WalletCard } from './WalletCard'
import { TransactionList } from './TransactionList'
import { SendForm } from './SendForm'
import { CrossChainForm } from './CrossChainForm'
import { CreateWalletModal } from './CreateWalletModal'
import FaucetPanel from './FaucetPanel'
import { MetaMaskConnect } from './MetaMaskConnect'
import { useWallet } from '@/context/WalletContext'
import { getCircleConfigStatus } from '@/lib/circle-config'

export function WalletDashboard() {
  const {
    wallets,
    selectedWallet,
    balances,
    transactions,
    loading,
    error,
    createWallet,
    selectWallet,
    refreshBalances,
    refreshTransactions,
  } = useWallet()

  const [activeTab, setActiveTab] = useState<'overview' | 'send' | 'faucet' | 'metamask'>('overview')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const circleConfig = getCircleConfigStatus()
  const [metaMaskConnected, setMetaMaskConnected] = useState(false)
  const [metaMaskAddress, setMetaMaskAddress] = useState<string>()

  const handleMetaMaskConnectionChange = (connected: boolean, address?: string) => {
    setMetaMaskConnected(connected)
    setMetaMaskAddress(address)
  }

  const selectedWalletBalances = selectedWallet ? balances[selectedWallet.id] || [] : []

  const handleRefresh = async () => {
    if (selectedWallet) {
      try {
        console.log('🔄 Refreshing wallet data for:', selectedWallet.id)
        await Promise.all([
          refreshBalances(selectedWallet.id),
          refreshTransactions(selectedWallet.id),
        ])
        console.log('✅ Refresh completed')
      } catch (error) {
        console.error('❌ Refresh failed:', error)
      }
    } else {
      console.log('⚠️ No wallet selected for refresh')
    }
  }

  if (loading && wallets.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Initializing wallet...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Wallet Selection */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Wallet className="h-5 w-5 mr-2" />
            My Wallets
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                circleConfig.hasApiKeys 
                  ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500' 
                  : 'bg-orange-500 hover:bg-orange-600 focus:ring-orange-500'
              }`}
              title={circleConfig.hasApiKeys ? 'Create Circle Wallet' : 'Requires Circle API keys - Use MetaMask instead'}
            >
              <Plus className="h-4 w-4 mr-1" />
              {circleConfig.hasApiKeys ? 'Create Wallet' : 'Create Wallet (API Keys Required)'}
            </button>
          </div>
        </div>

        {wallets.length === 0 ? (
          <div className="text-center py-8">
            <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-2">Ready to Test Cross-Chain</p>
            <p className="text-gray-500 text-sm mb-4">
              {circleConfig.hasApiKeys 
                ? 'Connect your MetaMask with 10 USDC or create a Circle wallet'
                : '🦊 Connect MetaMask (Recommended) - You have 10 USDC ready to test!'
              }
            </p>
            {!circleConfig.hasApiKeys && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 max-w-md mx-auto">
                <p className="text-blue-700 text-xs">
                  💡 Circle wallet creation requires API keys. Use MetaMask for immediate testing!
                </p>
              </div>
            )}
            <div className="flex justify-center space-x-3">
              <button
                onClick={() => setActiveTab('metamask')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                <Plug className="h-4 w-4 mr-2" />
                Connect MetaMask
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  circleConfig.hasApiKeys 
                    ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500' 
                    : 'bg-orange-500 hover:bg-orange-600 focus:ring-orange-500'
                }`}
                title={circleConfig.hasApiKeys ? 'Create Circle Wallet' : 'Requires Circle API keys - Use MetaMask instead'}
              >
                <Plus className="h-4 w-4 mr-2" />
                {circleConfig.hasApiKeys ? 'Create Circle Wallet' : 'Circle Wallet (Needs API Keys)'}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {wallets.map((wallet) => (
              <WalletCard
                key={wallet.id}
                wallet={wallet}
                balance={balances[wallet.id] || []}
                isSelected={selectedWallet?.id === wallet.id}
                onSelect={selectWallet}
              />
            ))}
          </div>
        )}
      </div>

      {/* Wallet Actions */}
      {selectedWallet && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('send')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'send'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Send className="h-4 w-4 mr-2 inline" />
                Send / Cross-Chain
              </button>
              <button
                onClick={() => setActiveTab('faucet')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'faucet'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Droplets className="h-4 w-4 mr-2 inline" />
                Testnet Faucet
              </button>
              <button
                onClick={() => setActiveTab('metamask')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'metamask'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Plug className="h-4 w-4 mr-2 inline" />
                MetaMask {metaMaskConnected && <span className="text-green-500">●</span>}
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Balance Overview */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Token Balances</h3>
                  {selectedWalletBalances.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <Droplets className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 mb-2">No tokens found</p>
                      <p className="text-sm text-gray-400 mb-4">
                        Need testnet tokens? Use the faucet to get started.
                      </p>
                      <button
                        onClick={() => setActiveTab('faucet')}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Droplets className="h-4 w-4 mr-2" />
                        Get Testnet Tokens
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedWalletBalances.map((balance) => (
                        <div
                          key={balance.tokenId}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                              <span className="text-blue-600 font-medium text-sm">
                                {balance.token.symbol.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{balance.token.name}</p>
                              <p className="text-sm text-gray-500">{balance.token.symbol}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">
                              {parseFloat(balance.amount).toLocaleString()} {balance.token.symbol}
                            </p>
                            <p className="text-sm text-gray-500">{balance.token.blockchain}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Transactions */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Transactions</h3>
                  <TransactionList
                    transactions={transactions.filter(tx => tx.walletId === selectedWallet.id)}
                    loading={loading}
                    onLoadMore={() => {}}
                    hasMore={false}
                  />
                </div>
              </div>
            )}

            {activeTab === 'send' && (
              <SendForm />
            )}

            {activeTab === 'faucet' && selectedWallet && (
              <FaucetPanel 
                walletId={selectedWallet.id}
                walletAddress={selectedWallet.address}
              />
            )}

            {activeTab === 'metamask' && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Connect Your MetaMask</h3>
                  <p className="text-gray-600">
                    Connect your MetaMask wallet with 10 USDC to test cross-chain transfers
                  </p>
                </div>
                
                <MetaMaskConnect onConnectionChange={handleMetaMaskConnectionChange} />
                
                {metaMaskConnected && metaMaskAddress && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Ready for Cross-Chain Testing!</h4>
                    <p className="text-sm text-blue-800 mb-3">
                      Your MetaMask is connected. You can now test cross-chain USDC transfers using the Send tab.
                    </p>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setActiveTab('send')}
                        className="text-sm bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                      >
                        Start Cross-Chain Transfer
                      </button>
                      <button
                        onClick={() => setActiveTab('send')}
                        className="text-sm bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                      >
                        Send USDC
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Wallet Modal */}
      {showCreateModal && (
        <CreateWalletModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={async (name, blockchain) => {
            console.log('🟢 Dashboard: Received blockchain:', blockchain)
            try {
              const wallet = await createWallet(name, blockchain)
              if (wallet) {
                setShowCreateModal(false)
              }
            } catch (error: any) {
              if (error.message.includes('Circle API key is required') || 
                  error.message.includes('MetaMask tab') ||
                  error.message.includes('Server API not available')) {
                // Close modal and show helpful guidance
                setShowCreateModal(false)
                
                // Show toast notification with guidance
                const toast = (await import('react-hot-toast')).default
                toast.error('Circle API keys required for wallet creation', {
                  duration: 4000,
                  icon: '🔑'
                })
                
                // Show follow-up guidance
                setTimeout(() => {
                  toast.success('Use MetaMask tab to test with your 10 USDC!', {
                    duration: 6000,
                    icon: '🦊'
                  })
                }, 1000)
                
                setActiveTab('metamask') // Switch to MetaMask tab
              } else {
                // Show the actual error for other issues
                const toast = (await import('react-hot-toast')).default
                toast.error(`Wallet creation failed: ${error.message}`, {
                  duration: 5000
                })
              }
            }
          }}
          loading={loading}
        />
      )}
    </div>
  )
}