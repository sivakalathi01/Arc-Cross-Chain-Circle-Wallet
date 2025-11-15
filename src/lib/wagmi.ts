import { createConfig } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'
import { configureChains } from 'wagmi'

// Use jsonRpcProvider instead of publicProvider for better control
const { chains: configuredChains, publicClient, webSocketPublicClient } = configureChains(
  [mainnet, sepolia],
  [
    jsonRpcProvider({
      rpc: (chain) => ({
        http: chain.rpcUrls.default.http[0],
      }),
    }),
  ]
)

export const config = createConfig({
  autoConnect: true,
  connectors: [
    new InjectedConnector({
      chains: configuredChains,
      options: {
        name: 'MetaMask',
        shimDisconnect: true,
      },
    }),
  ],
  publicClient,
  webSocketPublicClient,
})

export const chains = [mainnet, sepolia]

// USDC token addresses for each network
export const USDC_ADDRESSES = {
  [sepolia.id]: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // USDC on Sepolia
  [mainnet.id]: '0xA0b86a33E6441C8C3612877911D3982B61e3f5C1', // USDC on Mainnet
} as const