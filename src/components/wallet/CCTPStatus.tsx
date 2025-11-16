'use client'

interface CCTPStatusProps {
  status: string
  isCrossChain: boolean
  blockchain?: string
  destinationChain?: string
}

export function CCTPStatusIndicator({ status, isCrossChain, blockchain, destinationChain }: CCTPStatusProps) {
  if (!isCrossChain) {
    return null
  }

  const getCCTPStatusInfo = () => {
    const normalizedStatus = status.toLowerCase()
    
    if (normalizedStatus === 'complete' || normalizedStatus === 'confirmed') {
      return {
        icon: '✅',
        text: 'CCTP Transfer Complete',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        description: `Minted on ${destinationChain || 'destination chain'}`
      }
    }
    
    if (normalizedStatus === 'sent' || normalizedStatus === 'pending') {
      return {
        icon: '⏳',
        text: 'CCTP Processing',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        description: 'Awaiting burn & attestation'
      }
    }
    
    if (normalizedStatus === 'queued') {
      return {
        icon: '🔄',
        text: 'CCTP Initiated',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        description: 'Preparing burn transaction'
      }
    }
    
    if (normalizedStatus === 'failed') {
      return {
        icon: '❌',
        text: 'CCTP Failed',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        description: 'Transfer failed'
      }
    }
    
    return {
      icon: '🌉',
      text: 'CCTP Transfer',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      description: `${blockchain || 'Source'} → ${destinationChain || 'Destination'}`
    }
  }

  const statusInfo = getCCTPStatusInfo()

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${statusInfo.bgColor} border border-opacity-20`}>
      <span className="text-base">{statusInfo.icon}</span>
      <div className="flex flex-col">
        <span className={`text-xs font-semibold ${statusInfo.color}`}>
          {statusInfo.text}
        </span>
        <span className="text-xs text-gray-500">
          {statusInfo.description}
        </span>
      </div>
    </div>
  )
}

// CCTP Badge for transaction list
export function CCTPBadge({ isCrossChain }: { isCrossChain: boolean }) {
  if (!isCrossChain) {
    return null
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-medium">
      <span>🌉</span>
      <span>CCTP</span>
    </span>
  )
}
