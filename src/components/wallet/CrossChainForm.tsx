'use client'

import { useState } from 'react'
import { useWallet } from '@/context/WalletContext'
import { cctpService } from '@/lib/cctp'

const SUPPORTED_CHAINS = [
  { id: 1, name: 'Ethereum', symbol: 'ETH' },
  { id: 137, name: 'Polygon', symbol: 'MATIC' },
  { id: 42161, name: 'Arbitrum', symbol: 'ETH' },
  { id: 10, name: 'Optimism', symbol: 'ETH' },
  { id: 43114, name: 'Avalanche', symbol: 'AVAX' },
]

export function CrossChainForm() {
  const { selectedWallet, initiateCrossChainTransfer, loading } = useWallet()
  const [formData, setFormData] = useState({
    destinationChain: '',
    destinationAddress: '',
    amount: '',
    memo: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null)
  const [estimatedFees, setEstimatedFees] = useState<any>(null)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.destinationChain) {
      newErrors.destinationChain = 'Destination chain is required'
    }

    if (!formData.destinationAddress) {
      newErrors.destinationAddress = 'Destination address is required'
    } else if (!/^0x[a-fA-F0-9]{40}$/.test(formData.destinationAddress)) {
      newErrors.destinationAddress = 'Invalid address format'
    }

    if (!formData.amount) {
      newErrors.amount = 'Amount is required'
    } else if (parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0'
    } else if (parseFloat(formData.amount) < 1) {
      newErrors.amount = 'Minimum cross-chain transfer is $1 USDC'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      await initiateCrossChainTransfer({
        destinationChain: parseInt(formData.destinationChain),
        destinationAddress: formData.destinationAddress,
        amount: formData.amount,
      })

      // Reset form on success
      setFormData({
        destinationChain: '',
        destinationAddress: '',
        amount: '',
        memo: '',
      })
      setErrors({})
      setEstimatedTime(null)
      setEstimatedFees(null)
    } catch (error) {
      console.error('Cross-chain transfer error:', error)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }

    // Estimate fees and time when amount and destination chain are set
    if (field === 'destinationChain' || field === 'amount') {
      const updatedData = { ...formData, [field]: value }
      if (updatedData.destinationChain && updatedData.amount && parseFloat(updatedData.amount) > 0) {
        estimateTransfer(1, parseInt(updatedData.destinationChain), updatedData.amount)
      }
    }
  }

  const estimateTransfer = async (sourceChain: number, destinationChain: number, amount: string) => {
    try {
      const fees = await cctpService.estimateFees(sourceChain, destinationChain, amount)
      const time = getEstimatedTime(sourceChain, destinationChain)
      
      setEstimatedFees(fees)
      setEstimatedTime(time)
    } catch (error) {
      console.error('Error estimating transfer:', error)
    }
  }

  const getEstimatedTime = (sourceChain: number, destinationChain: number): number => {
    // Return estimated time in minutes
    const timeMap: Record<string, number> = {
      '1_137': 15, // Ethereum to Polygon
      '1_42161': 12, // Ethereum to Arbitrum
      '1_10': 10, // Ethereum to Optimism
      '1_43114': 18, // Ethereum to Avalanche
    }
    
    const key = `${sourceChain}_${destinationChain}`
    return timeMap[key] || 20
  }

  if (!selectedWallet) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Please select a wallet to initiate cross-chain transfers</p>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Cross-Chain Transfer</h3>
        <p className="text-sm text-gray-600">
          Transfer USDC across different blockchain networks using Circle's CCTP
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="destinationChain" className="block text-sm font-medium text-gray-700 mb-1">
            Destination Chain
          </label>
          <select
            id="destinationChain"
            value={formData.destinationChain}
            onChange={(e) => handleInputChange('destinationChain', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.destinationChain ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="">Select destination chain</option>
            {SUPPORTED_CHAINS.filter(chain => chain.id !== 1).map((chain) => (
              <option key={chain.id} value={chain.id}>
                {chain.name} ({chain.symbol})
              </option>
            ))}
          </select>
          {errors.destinationChain && (
            <p className="mt-1 text-sm text-red-600">{errors.destinationChain}</p>
          )}
        </div>

        <div>
          <label htmlFor="destinationAddress" className="block text-sm font-medium text-gray-700 mb-1">
            Destination Address
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
            min="1"
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

        {estimatedFees && estimatedTime && (
          <div className="bg-blue-50 rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-blue-900">Transfer Details</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700">Source Chain Fee</span>
                <span className="text-blue-900">~${(parseFloat(estimatedFees.sourceFee || '0') * 2000).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Destination Chain Fee</span>
                <span className="text-blue-900">~${(parseFloat(estimatedFees.destinationFee || '0') * 2000).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Bridge Fee</span>
                <span className="text-blue-900">${estimatedFees.bridgeFee || '0.00'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Estimated Time</span>
                <span className="text-blue-900">{estimatedTime} minutes</span>
              </div>
              <div className="border-t border-blue-200 pt-2 flex justify-between font-medium">
                <span className="text-blue-700">Total Amount</span>
                <span className="text-blue-900">
                  {formData.amount ? `$${parseFloat(formData.amount).toFixed(2)} + fees` : '$0.00'}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <svg className="w-5 h-5 text-yellow-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-yellow-800">Cross-Chain Transfer Notice</h4>
              <p className="text-sm text-yellow-700 mt-1">
                Cross-chain transfers are irreversible. Please double-check the destination address and chain.
              </p>
            </div>
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
              Processing...
            </span>
          ) : (
            'Initiate Cross-Chain Transfer'
          )}
        </button>
      </form>
    </div>
  )
}