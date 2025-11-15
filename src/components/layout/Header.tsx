'use client'

export function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Arc Wallet</h1>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
              Wallet
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
              Transactions
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
              Cross Chain
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
              Settings
            </a>
          </nav>
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <span className="text-sm text-gray-600">Connected</span>
          </div>
        </div>
      </div>
    </header>
  )
}