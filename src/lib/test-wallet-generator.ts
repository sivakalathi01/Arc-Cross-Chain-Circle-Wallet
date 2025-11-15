// Real Ethereum address generator for faucet testing
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'

export function generateRealTestWallet() {
  // Generate a real Ethereum private key and address
  const privateKey = generatePrivateKey()
  const account = privateKeyToAccount(privateKey)
  
  return {
    address: account.address,
    privateKey: privateKey,
    // WARNING: This is for TESTNET ONLY - never use for real funds
    warning: 'TESTNET ONLY - Do not send real ETH or tokens to this address'
  }
}

// Pre-generated test addresses for immediate use
export const TEST_ADDRESSES = [
  '0x742d35Cc9Df7e8C5E4b4b7A4c7e8dF6C4A2F8E9B', // Example testnet address
  '0x8B4d3C2A1F5E6789ABCDEF0123456789ABCDEF01', // Example testnet address  
  '0x123456789ABCDEF0123456789ABCDEF0123456789'  // Example testnet address
]

export function getRandomTestAddress(): string {
  return TEST_ADDRESSES[Math.floor(Math.random() * TEST_ADDRESSES.length)]
}