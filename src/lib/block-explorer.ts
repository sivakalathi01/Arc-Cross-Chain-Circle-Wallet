// Block explorer URLs for different networks

export const BLOCK_EXPLORERS: Record<string, { name: string; url: string }> = {
  'ARC-TESTNET': {
    name: 'Arc Testnet Explorer',
    url: 'https://testnet.arcscan.app',
  },
  'ETH-SEPOLIA': {
    name: 'Sepolia Etherscan',
    url: 'https://sepolia.etherscan.io',
  },
  'MATIC-AMOY': {
    name: 'Polygon Amoy Explorer',
    url: 'https://amoy.polygonscan.com',
  },
  'AVAX-FUJI': {
    name: 'Avalanche Fuji Explorer',
    url: 'https://testnet.snowtrace.io',
  },
}

export function getExplorerUrl(blockchain: string, type: 'tx' | 'address', value: string): string {
  const explorer = BLOCK_EXPLORERS[blockchain]
  if (!explorer) {
    return '#'
  }
  
  return `${explorer.url}/${type}/${value}`
}

export function getExplorerName(blockchain: string): string {
  return BLOCK_EXPLORERS[blockchain]?.name || 'Block Explorer'
}
