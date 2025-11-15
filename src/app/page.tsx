import { WalletDashboard } from '@/components/wallet/WalletDashboard'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/FooterComponent'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Arc Cross Chain Wallet
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Seamlessly manage your USDC across multiple blockchains with our embedded wallet solution. 
              Built with Circle Wallets, CCTP, Gateway, and Arc for the ultimate DeFi experience.
            </p>
          </div>
          
          <WalletDashboard />
        </div>
      </div>
      <Footer />
    </main>
  )
}
