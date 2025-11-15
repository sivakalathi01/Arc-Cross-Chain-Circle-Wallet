'use client'

import { QueryClient, QueryClientProvider } from 'react-query'
import { WagmiConfig } from 'wagmi'
import { config } from '@/lib/wagmi'
import { WalletProvider } from '@/context/WalletContext'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  }))

  return (
    <WagmiConfig config={config}>
      <QueryClientProvider client={queryClient}>
        <WalletProvider>
          {children}
        </WalletProvider>
      </QueryClientProvider>
    </WagmiConfig>
  )
}