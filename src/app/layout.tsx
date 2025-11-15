import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Arc Cross Chain Wallet',
  description: 'DeFi Cross Chain application with embedded wallet using Circle Wallets, CCTP, Gateway, and Arc',
  keywords: ['DeFi', 'Cross Chain', 'Wallet', 'Circle', 'CCTP', 'Gateway', 'Arc', 'USDC'],
  authors: [{ name: 'Arc Team' }],
  creator: 'Arc Team',
  publisher: 'Arc Team',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}