// Simple in-memory wallet storage
// In production, this should be replaced with a database

interface StoredWallet {
  id: string
  address: string
  blockchain: string
  walletSetId: string
  createDate: string
}

class WalletStorage {
  private wallets: StoredWallet[] = []

  addWallet(wallet: StoredWallet) {
    console.log(`💾 Storing wallet: ${wallet.id}`)
    this.wallets.push(wallet)
  }

  getWallets(): StoredWallet[] {
    console.log(`📂 Retrieving ${this.wallets.length} stored wallet(s)`)
    return this.wallets
  }

  getWalletById(id: string): StoredWallet | undefined {
    return this.wallets.find(w => w.id === id)
  }
}

// Singleton instance
export const walletStorage = new WalletStorage()
