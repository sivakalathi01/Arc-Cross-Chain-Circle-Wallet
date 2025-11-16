'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@/context/WalletContext'
import { gatewayService } from '@/lib/gateway'

export function SendForm() {
  const { selectedWallet, sendTransaction, loading } = useWallet()
  const [formData, setFormData] = useState({
    destinationAddress: '',
    destinationBlockchain: selectedWallet?.blockchain || 'ETH-SEPOLIA',
    amount: '',
    memo: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [gatewayRoute, setGatewayRoute] = useState<any>(null)
  const [loadingRoute, setLoadingRoute] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.destinationAddress) {
      newErrors.destinationAddress = 'Destination address is required'
    } else if (!/^0x[a-fA-F0-9]{40}$/.test(formData.destinationAddress)) {
      newErrors.destinationAddress = 'Invalid Ethereum address'
    }

    if (!formData.amount) {
      newErrors.amount = 'Amount is required'
    } else if (parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      await sendTransaction({
        destinationAddress: formData.destinationAddress,
        destinationBlockchain: formData.destinationBlockchain,
        amount: formData.amount,
      })

      // Reset form on success
      setFormData({
        destinationAddress: '',
        destinationBlockchain: selectedWallet?.blockchain || 'ETH-SEPOLIA',
        amount: '',
        memo: '',
      })
      setErrors({})
    } catch (error) {
      console.error('Send transaction error:', error)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // Fetch Gateway route when cross-chain transfer is selected
  useEffect(() => {
    const fetchGatewayRoute = async () => {
      if (!selectedWallet || !formData.destinationBlockchain || !formData.amount) {
        setGatewayRoute(null)
        return
      }

      const isCrossChain = formData.destinationBlockchain !== selectedWallet.blockchain
      if (!isCrossChain) {
        setGatewayRoute(null)
        return
      }

      setLoadingRoute(true)
      try {
        const blockchainToChainId: Record<string, number> = {
          'ARC-TESTNET': 421614,
          'ETH-SEPOLIA': 11155111,
          'MATIC-AMOY': 80002,
          'AVAX-FUJI': 43113,
        }

        const sourceChainId = blockchainToChainId[selectedWallet.blockchain]
        const destChainId = blockchainToChainId[formData.destinationBlockchain]

        if (sourceChainId && destChainId) {
          const route = await gatewayService.findOptimalRoute({
            sourceChain: sourceChainId,
            destinationChain: destChainId,
            amount: formData.amount,
            token: 'USDC',
          })
          setGatewayRoute(route)
        }
      } catch (error) {
        console.warn('Gateway route fetch failed:', error)
        setGatewayRoute(null)
      } finally {
        setLoadingRoute(false)
      }
    }

    const debounceTimer = setTimeout(fetchGatewayRoute, 500)
    return () => clearTimeout(debounceTimer)
  }, [selectedWallet, formData.destinationBlockchain, formData.amount])

  if (!selectedWallet) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Please select a wallet to send transactions</p>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Send USDC</h3>
        <p className="text-sm text-gray-600">
          Send USDC tokens across blockchains
        </p>
        {selectedWallet && (
          <p className="text-xs text-gray-500 mt-1">
            From: {selectedWallet.blockchain}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="destinationBlockchain" className="block text-sm font-medium text-gray-700 mb-1">
            Destination Blockchain
          </label>
          <select
            id="destinationBlockchain"
            value={formData.destinationBlockchain}
            onChange={(e) => handleInputChange('destinationBlockchain', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="ARC-TESTNET">🔷 Arc Testnet</option>
            <option value="ETH-SEPOLIA">⬠ Ethereum Sepolia</option>
            <option value="MATIC-AMOY">💜 Polygon Amoy</option>
            <option value="AVAX-FUJI">🔺 Avalanche Fuji</option>
          </select>
          {formData.destinationBlockchain !== selectedWallet?.blockchain && (
            <div className="mt-2 space-y-2">
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-md">
                <div className="flex items-start gap-2">
                  <span className="text-base">🌉</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-purple-900">CCTP Cross-Chain Transfer</p>
                    <p className="text-xs text-purple-700 mt-1">
                      {selectedWallet?.blockchain} → {formData.destinationBlockchain}
                    </p>
                    <p className="text-xs text-purple-600 mt-1">
                      Circle's protocol will burn USDC on source chain and mint native USDC on destination chain
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Gateway Route Optimization */}
              {loadingRoute && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-xs text-blue-700">Gateway optimizing route...</span>
                  </div>
                </div>
              )}
              
              {gatewayRoute && !loadingRoute && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-start gap-2">
                    <span className="text-base">✅</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-green-900">Gateway Route Optimized</p>
                      <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                        <div>
                          <span className="text-green-700">Protocol:</span>
                          <span className="ml-1 font-medium text-green-900">{gatewayRoute.steps?.[0]?.protocol || 'CCTP'}</span>
                        </div>
                        <div>
                          <span className="text-green-700">Est. Time:</span>
                          <span className="ml-1 font-medium text-green-900">~{Math.round((gatewayRoute.totalTime || 900) / 60)}m</span>
                        </div>
                        <div>
                          <span className="text-green-700">Est. Fee:</span>
                          <span className="ml-1 font-medium text-green-900">{gatewayRoute.totalFee || '0.001'} ETH</span>
                        </div>
                        <div>
                          <span className="text-green-700">Confidence:</span>
                          <span className="ml-1 font-medium text-green-900">{Math.round((gatewayRoute.confidence || 0.95) * 100)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="destinationAddress" className="block text-sm font-medium text-gray-700 mb-1">
            Recipient Address
          </label>
          <input
            type="text"
            id="destinationAddress"
            value={formData.destinationAddress}
            onChange={(e) => handleInputChange('destinationAddress', e.target.value)}
            placeholder="0x..."
            className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.destinationAddress ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.destinationAddress && (
            <p className="mt-1 text-sm text-red-600">{errors.destinationAddress}</p>
          )}
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Amount (USDC)
          </label>
          <input
            type="number"
            id="amount"
            value={formData.amount}
            onChange={(e) => handleInputChange('amount', e.target.value)}
            placeholder="0.00"
            step="0.01"
            min="0"
            className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.amount ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.amount && (
            <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
          )}
        </div>

        <div>
          <label htmlFor="memo" className="block text-sm font-medium text-gray-700 mb-1">
            Memo (Optional)
          </label>
          <textarea
            id="memo"
            value={formData.memo}
            onChange={(e) => handleInputChange('memo', e.target.value)}
            placeholder="Add a note..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Network Fee</span>
            <span className="text-gray-900">~$0.50</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total Amount</span>
            <span className="font-semibold text-gray-900">
              {formData.amount ? `$${parseFloat(formData.amount).toFixed(2)} + fees` : '$0.00'}
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Sending...
            </span>
          ) : (
            'Send Transaction'
          )}
        </button>
      </form>
    </div>
  )
}