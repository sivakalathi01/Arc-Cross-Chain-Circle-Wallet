'use client'

import React, { useState } from 'react'
import { Droplets, ExternalLink, Copy, Loader2, TestTube } from 'lucide-react'
import { circleWalletService } from '@/lib/circle-working'
import { testCircleConnection } from '@/lib/circle-test'
import { handleAPIError, showFallbackMessage } from '@/lib/dev-helpers'
import toast from '@/lib/toast'

interface FaucetPanelProps {
  walletId: string
  walletAddress: string
  onTokensRequested?: () => void
}

export default function FaucetPanel({ walletId, walletAddress, onTokensRequested }: FaucetPanelProps) {
  const [requesting, setRequesting] = useState(false)
  const [requestingETH, setRequestingETH] = useState(false)
  const [requestingUSDC, setRequestingUSDC] = useState(false)
  const [testing, setTesting] = useState(false)

  const handleRequestTokens = async (native: boolean, usdc: boolean) => {
    try {
      setRequesting(true)
      if (native) setRequestingETH(true)
      if (usdc) setRequestingUSDC(true)

      console.log(`💧 Opening external faucets for wallet ${walletAddress}`)
      
      // Open external faucets in new tabs with the wallet address
      if (native) {
        // Sepolia ETH faucet - opens with address pre-filled
        window.open(`https://sepoliafaucet.com/`, '_blank')
        toast.success('Opened Sepolia ETH Faucet - paste your address there')
      }
      
      if (usdc) {
        // Circle USDC faucet
        window.open(`https://faucet.circle.com/`, '_blank')
        toast.success('Opened Circle USDC Faucet - paste your address there')
      }
      
      // Copy address to clipboard for convenience
      await navigator.clipboard.writeText(walletAddress)
      toast.success('Wallet address copied to clipboard!')
      
      // Inform user
      const tokenTypes = []
      if (native) tokenTypes.push('ETH')
      if (usdc) tokenTypes.push('USDC')
      toast.success(`${tokenTypes.join(' & ')} faucets opened. Paste your address to get tokens.`)
      
    } catch (error) {
      const errorInfo = handleAPIError(error, 'Faucet request')
      toast.error('Failed to open faucets')
    } finally {
      setRequesting(false)
      setRequestingETH(false)
      setRequestingUSDC(false)
    }
  }

  const handleWebFaucet = (faucetType: 'sepolia' | 'usdc' | 'alchemy' | 'infura') => {
    const faucets = {
      sepolia: 'https://sepoliafaucet.com/',
      usdc: 'https://faucet.circle.com/',
      alchemy: 'https://sepoliafaucet.com/',
      infura: 'https://www.infura.io/faucet/sepolia'
    }
    
    // Copy address to clipboard
    navigator.clipboard.writeText(walletAddress)
    
    const url = faucets[faucetType]
    window.open(url, '_blank')
    toast.success(`Opened ${faucetType} faucet. Address copied to clipboard!`)
  }

  const handleTestAPI = async () => {
    try {
      setTesting(true)
      console.log('🧪 Starting Circle API test...')
      const success = await testCircleConnection()
      
      if (success) {
        toast.success('✅ Circle API connection successful!')
      } else {
        toast.error('❌ Circle API test failed - check console for details')
      }
    } catch (error) {
      console.error('API test error:', error)
      toast.error('API test failed - check your Circle API keys')
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Circle Testnet Faucets</h3>
        <div className="text-sm text-gray-500">
          Get free testnet tokens
        </div>
      </div>

      <div className="space-y-4">
        {/* Wallet Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Wallet Address for Faucets:</div>
          <div className="font-mono text-sm text-gray-900 break-all mb-2">
            {walletAddress}
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="text-xs">
              {walletAddress.startsWith('0x') && walletAddress.length === 42 ? (
                <span className="text-green-600">✅ Valid address for faucets</span>
              ) : (
                <span className="text-orange-600">⚠️ Mock address - won't work with faucets</span>
              )}
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(walletAddress)
                toast.success('Address copied to clipboard!')
              }}
              className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
            >
              <Copy className="h-3 w-3 inline mr-1" />
              Copy
            </button>
          </div>
        </div>

        {/* Test API Connection */}
        <div className="mb-4">
          <button
            onClick={handleTestAPI}
            disabled={testing}
            className="w-full flex items-center justify-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {testing ? (
              <>
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                Testing Circle API...
              </>
            ) : (
              <>
                <TestTube className="h-4 w-4 mr-2" />
                Test Circle API Connection
              </>
            )}
          </button>
        </div>

        {/* Quick Access Faucet Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => handleRequestTokens(true, false)}
            disabled={requesting}
            className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {requestingETH ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Opening...
              </>
            ) : (
              <>
                <span className="mr-2">⛽</span>
                Get Sepolia ETH
              </>
            )}
          </button>

          <button
            onClick={() => handleRequestTokens(false, true)}
            disabled={requesting}
            className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {requestingUSDC ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Opening...
              </>
            ) : (
              <>
                <span className="mr-2">💵</span>
                Get Test USDC
              </>
            )}
          </button>
        </div>

        <button
          onClick={() => handleRequestTokens(true, true)}
          disabled={requesting}
          className="w-full flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {requesting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
              Opening Faucets...
            </>
          ) : (
            <>
              <Droplets className="h-4 w-4 mr-2" />
              Open Both Faucets
            </>
          )}
        </button>

        {/* Web Faucets */}
        <div className="border-t pt-4">
          <div className="text-sm text-gray-600 mb-3">External Faucets (Click to open & auto-copy address):</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              onClick={() => handleWebFaucet('sepolia')}
              className="flex items-center justify-center px-4 py-2 border border-blue-300 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <span className="mr-2">⛽</span>
              Sepolia ETH Faucet
              <ExternalLink className="h-3 w-3 ml-2" />
            </button>

            <button
              onClick={() => handleWebFaucet('usdc')}
              className="flex items-center justify-center px-4 py-2 border border-green-300 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
            >
              <span className="mr-2">💵</span>
              Circle USDC Faucet
              <ExternalLink className="h-3 w-3 ml-2" />
            </button>

            <button
              onClick={() => handleWebFaucet('alchemy')}
              className="flex items-center justify-center px-4 py-2 border border-purple-300 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <span className="mr-2">🔮</span>
              Alchemy Faucet
              <ExternalLink className="h-3 w-3 ml-2" />
            </button>

            <button
              onClick={() => handleWebFaucet('infura')}
              className="flex items-center justify-center px-4 py-2 border border-orange-300 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <span className="mr-2">🌐</span>
              Infura Faucet
              <ExternalLink className="h-3 w-3 ml-2" />
            </button>
          </div>
        </div>

        {/* Quick Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-blue-800">
            <div className="font-medium mb-2">💡 How to get testnet tokens:</div>
            <ol className="space-y-1 text-blue-700 list-decimal list-inside">
              <li>Click any faucet button above (your address auto-copies)</li>
              <li>Paste your wallet address in the faucet website</li>
              <li>Complete any verification (if required)</li>
              <li>Wait 1-2 minutes for tokens to arrive</li>
            </ol>
            <div className="mt-3 text-xs text-blue-600">
              ✅ All faucets are free and work with your Circle wallet address
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}