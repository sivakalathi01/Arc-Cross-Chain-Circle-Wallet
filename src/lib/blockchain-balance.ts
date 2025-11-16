import { ethers } from 'ethers'

// USDC contract addresses on different networks
const USDC_ADDRESSES: Record<string, string> = {
  'ARC-TESTNET': '0x2B51Ae4412F79c3c1cB12AA40Ea4ECEb4e80511a', // Arc Testnet USDC
  'ETH-SEPOLIA': '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // Ethereum Sepolia USDC
  'MATIC-AMOY': '0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582', // Polygon Amoy USDC
  'AVAX-FUJI': '0x5425890298aed601595a70AB815c96711a31Bc65', // Avalanche Fuji USDC
}

// Alternative USDC addresses to try
const ALTERNATIVE_USDC_ADDRESSES: Record<string, string[]> = {
  'ARC-TESTNET': [
    '0x2B51Ae4412F79c3c1cB12AA40Ea4ECEb4e80511a', // Actual USDC token from faucet
    '0x3910B7cbb3341f1F4bF4cEB66e4A2C8f204FE2b8', // Implementation contract
    '0xD4c0B787aA2ff9Eb751Bb515c877EbBF2Daddaae', // Proxy contract
  ],
}

// RPC URLs for different networks
const RPC_URLS: Record<string, string> = {
  'ARC-TESTNET': 'https://rpc-testnet.arcscan.app', // Arc Testnet RPC
  'ETH-SEPOLIA': 'https://rpc.sepolia.org',
  'MATIC-AMOY': 'https://rpc-amoy.polygon.technology',
  'AVAX-FUJI': 'https://api.avax-test.network/ext/bc/C/rpc',
}

// ERC20 ABI (only the functions we need)
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
]

export interface TokenBalance {
  token: {
    id: string
    name: string
    symbol: string
    decimals: number
    blockchain: string
  }
  amount: string
  updateDate: string
}

export async function getBlockchainBalance(
  address: string,
  blockchain: string
): Promise<TokenBalance[]> {
  try {
    console.log(`🔗 Fetching balance from blockchain for ${address} on ${blockchain}`)

    const rpcUrl = RPC_URLS[blockchain]
    if (!rpcUrl) {
      console.log(`⚠️ No RPC URL configured for ${blockchain}`)
      return []
    }

    console.log(`🌐 Using RPC: ${rpcUrl}`)

    // Create provider
    const provider = new ethers.JsonRpcProvider(rpcUrl)
    
    // Test provider connection
    try {
      const network = await provider.getNetwork()
      console.log(`✅ Connected to network: ${network.name} (chainId: ${network.chainId})`)
    } catch (err: any) {
      console.error(`❌ Failed to connect to RPC:`, err.message)
      return []
    }

    // Try multiple USDC contract addresses
    const addressesToTry = ALTERNATIVE_USDC_ADDRESSES[blockchain] || [USDC_ADDRESSES[blockchain]]
    
    for (const usdcAddress of addressesToTry) {
      if (!usdcAddress) continue
      
      try {
        console.log(`🔍 Checking USDC contract: ${usdcAddress}`)
        
        // Try raw eth_call for balanceOf to work with proxy contracts
        const balanceOfSelector = '0x70a08231' // keccak256("balanceOf(address)")
        const paddedAddress = address.toLowerCase().replace('0x', '').padStart(64, '0')
        const callData = balanceOfSelector + paddedAddress
        
        console.log(`📞 Calling balanceOf with raw eth_call...`)
        console.log(`   To: ${usdcAddress}`)
        console.log(`   Data: ${callData}`)
        console.log(`   Wallet: ${address}`)
        
        const result = await provider.call({
          to: usdcAddress,
          data: callData
        })
        
        console.log(`📦 Raw result: ${result}`)
        
        if (!result || result === '0x') {
          console.log(`⚠️ Empty result, trying next address...`)
          continue
        }
        
        // Decode the balance
        const balance = BigInt(result)
        console.log(`💰 Raw balance: ${balance.toString()}`)
        
        if (balance === BigInt(0)) {
          console.log(`📊 Balance is 0, trying next address...`)
          continue
        }

        // Balance > 0, fetch token details
        console.log(`✅ Found non-zero balance, fetching token details...`)
        
        const usdcContract = new ethers.Contract(usdcAddress, ERC20_ABI, provider)
        const [decimals, symbol, name] = await Promise.all([
          usdcContract.decimals(),
          usdcContract.symbol(),
          usdcContract.name(),
        ])

        // Convert balance to human-readable format
        const formattedBalance = ethers.formatUnits(balance, decimals)

        console.log(`✅ Found balance: ${formattedBalance} ${symbol}`)
        
        return [
          {
            token: {
              id: usdcAddress.toLowerCase(),
              name: name,
              symbol: symbol,
              decimals: Number(decimals),
              blockchain: blockchain,
            },
            amount: formattedBalance,
            updateDate: new Date().toISOString(),
          },
        ]
      } catch (error: any) {
        console.log(`⚠️ Failed to check ${usdcAddress}:`, error.message)
        console.log(`Error details:`, error)
        continue
      }
    }

    console.log(`ℹ️ No USDC balance found`)
    return []
  } catch (error) {
    console.error('❌ Failed to fetch blockchain balance:', error)
    return []
  }
}

// Get native token balance (ETH, MATIC, AVAX, etc.)
export async function getNativeBalance(
  address: string,
  blockchain: string
): Promise<string> {
  try {
    const rpcUrl = RPC_URLS[blockchain]
    if (!rpcUrl) return '0'

    const provider = new ethers.JsonRpcProvider(rpcUrl)
    const balance = await provider.getBalance(address)
    
    return ethers.formatEther(balance)
  } catch (error) {
    console.error('❌ Failed to fetch native balance:', error)
    return '0'
  }
}
