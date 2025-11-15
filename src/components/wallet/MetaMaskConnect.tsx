'use client'

import { useState, useEffect } from 'react'
import { useAccount, useConnect, useDisconnect, useBalance, useNetwork } from 'wagmi'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { Wallet, ExternalLink, Copy, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { USDC_ADDRESSES } from '@/lib/wagmi'

interface MetaMaskConnectProps {
  onConnectionChange?: (connected: boolean, address?: string) => void
}

export function MetaMaskConnect({ onConnectionChange }: MetaMaskConnectProps) {
  const { address, isConnected } = useAccount()
  const { connect, connectors, error, isLoading, pendingConnector } = useConnect()
  const { disconnect } = useDisconnect()
  const { chain } = useNetwork()
  const [showDetails, setShowDetails] = useState(false)
  
  // Get USDC balance on current network
  const usdcAddress = chain?.id ? USDC_ADDRESSES[chain.id as keyof typeof USDC_ADDRESSES] : undefined
  const { data: balance } = useBalance({
    address: address,
    token: usdcAddress,
    enabled: !!address && !!usdcAddress,
  })

  const metaMaskConnector = connectors.find(
    (connector) => connector instanceof MetaMaskConnector
  )

  useEffect(() => {
    if (onConnectionChange) {
      onConnectionChange(isConnected, address)
    }
  }, [isConnected, address, onConnectionChange])

  const handleConnect = async () => {
    if (metaMaskConnector) {
      try {
        await connect({ connector: metaMaskConnector })
        toast.success('MetaMask connected successfully!')
      } catch (error) {
        toast.error('Failed to connect MetaMask')
        console.error('Connection error:', error)
      }
    } else {
      toast.error('MetaMask not found. Please install MetaMask extension.')
    }
  }

  const handleDisconnect = () => {
    disconnect()
    toast.success('MetaMask disconnected')
  }

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      toast.success('Address copied to clipboard!')
    }
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  if (isConnected && address) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            MetaMask Connected
          </h3>
          <button
            onClick={handleDisconnect}
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Disconnect
          </button>
        </div>

        <div className="space-y-4">
          {/* Address Display */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <Wallet className="h-4 w-4 text-gray-500 mr-2" />
              <span className="text-sm font-mono text-gray-700">
                {formatAddress(address)}
              </span>
            </div>
            <button
              onClick={copyAddress}
              className="flex items-center text-sm text-blue-600 hover:text-blue-700"
            >
              <Copy className="h-3 w-3 mr-1" />
              Copy
            </button>
          </div>

          {/* Balance Display */}
          {balance && (
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                  <span className="text-blue-600 font-medium text-xs">U</span>
                </div>
                <span className="text-sm font-medium text-gray-700">USDC Balance</span>
              </div>
              <span className="text-sm font-semibold text-green-600">
                {parseFloat(balance.formatted).toFixed(2)} USDC
              </span>
            </div>
          )}

          {/* Network Info */}
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center">
              <span className="text-sm text-blue-700">Network: </span>
              <span className="text-sm font-medium text-blue-800 ml-1">
                {chain?.name || 'Unknown'}
              </span>
            </div>
            <div className="flex items-center text-sm text-blue-600">
              <ExternalLink className="h-3 w-3 mr-1" />
              <span>Ready</span>
            </div>
          </div>

          {/* Toggle Details */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full text-sm text-gray-600 hover:text-gray-700 underline"
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>

          {showDetails && (
            <div className="p-3 bg-gray-50 rounded-lg text-xs text-gray-600 space-y-2">
              <div><strong>Full Address:</strong> {address}</div>
              <div><strong>Network:</strong> Connected via MetaMask</div>
              <div><strong>Status:</strong> Ready for CCTP transfers</div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
            <Wallet className="h-8 w-8 text-orange-600" />
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Connect MetaMask
        </h3>
        
        <p className="text-gray-600 text-sm mb-6">
          Connect your MetaMask wallet to test cross-chain USDC transfers between Sepolia and Arc testnets.
        </p>

        {error && (
          <div className="flex items-center justify-center p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
            <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
            <span className="text-sm text-red-700">
              {error.message || 'Failed to connect wallet'}
            </span>
          </div>
        )}

        <button
          onClick={handleConnect}
          disabled={isLoading}
          className={`w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white transition-colors ${
            isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500'
          }`}
        >
          ) : (
          {isLoading && pendingConnector instanceof MetaMaskConnector ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Connecting...
            </>
          ) : (
            <>
              <Wallet className="h-4 w-4 mr-2" />
              Connect MetaMask
            </>
          )}
        </button>

        <div className="mt-4 text-xs text-gray-500">
          <p>Make sure you have:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>MetaMask extension installed</li>
            <li>Sepolia testnet configured</li>
            <li>Arc testnet configured</li>
            <li>USDC tokens for testing</li>
          </ul>
        </div>
      </div>
    </div>
  )
}