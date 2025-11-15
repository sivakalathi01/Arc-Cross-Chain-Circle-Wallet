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

      console.log(`💧 Requesting testnet tokens for wallet ${walletId}`)
      
      await circleWalletService.requestTestnetTokens(walletId, native ? 1 : 0, usdc ? 1 : 0)
      
      const tokenTypes = []
      if (native) tokenTypes.push('ETH')
      if (usdc) tokenTypes.push('USDC')
      
      toast.success(`${tokenTypes.join(' & ')} requested from Circle testnet faucet!`)
      toast.success('Tokens should appear in your wallet within a few minutes')
      
      // Refresh wallet data after a short delay
      if (onTokensRequested) {
        setTimeout(onTokensRequested, 2000)
      }
    } catch (error) {
      const errorInfo = handleAPIError(error, 'Faucet request')
      if (errorInfo.shouldFallback) {
        showFallbackMessage('API Faucet')
      }
    } finally {
      setRequesting(false)
      setRequestingETH(false)
      setRequestingUSDC(false)
    }
  }

  const handleWebFaucet = (type: 'public' | 'developer') => {
    const url = type === 'public' 
      ? 'https://faucet.circle.com'
      : 'https://console.circle.com/faucet'
    
    window.open(url, '_blank')
    toast.success(`Opened ${type} faucet in new tab`)
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

        {/* API Faucet Requests */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => handleRequestTokens(true, false)}
            disabled={requesting}
            className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {requestingETH ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Requesting ETH...
              </>
            ) : (
              <>
                <span className="mr-2">⛽</span>
                Request Sepolia ETH
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
                Requesting USDC...
              </>
            ) : (
              <>
                <span className="mr-2">💵</span>
                Request Test USDC
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
              Requesting Both...
            </>
          ) : (
            <>
              <span className="mr-2">💎</span>
              Request Both ETH & USDC
            </>
          )}
        </button>

        {/* Web Faucets */}
        <div className="border-t pt-4">
          <div className="text-sm text-gray-600 mb-3">Or use web faucets:</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => handleWebFaucet('public')}
              className="flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="mr-2">🌐</span>
              Circle Public Faucet
            </button>

            <button
              onClick={() => handleWebFaucet('developer')}
              className="flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="mr-2">🔧</span>
              Circle Developer Faucet
            </button>
          </div>
        </div>

        {/* Architecture Explanation */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-sm text-yellow-800">
            <div className="font-medium mb-2">⚠️ Important: Circle W3S Architecture</div>
            <ul className="space-y-1 text-yellow-700">
              <li>• <strong>API faucets require server-side backend</strong> (CORS policy)</li>
              <li>• <strong>Web faucets work immediately</strong> - use these for testing</li>
              <li>• Circle API keys must never be exposed in browser</li>
              <li>• Real wallet operations need backend implementation</li>
            </ul>
            <div className="mt-3 text-xs text-yellow-600">
              💡 "Failed to fetch" errors are expected - use web faucets instead!
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}