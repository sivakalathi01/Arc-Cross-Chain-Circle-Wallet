import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const walletId = params.id

    console.log(`🔍 Fetching wallet address for ${walletId}...`)

    // Get wallet from database
    const wallet = await db.getWallet(walletId)
    
    if (!wallet || !wallet.address) {
      return NextResponse.json({
        success: false,
        error: 'Wallet not found'
      }, { status: 404 })
    }

    console.log(`📍 Wallet address: ${wallet.address}`)
    console.log(`⛓️  Blockchain: ${wallet.blockchain}`)

    // For now, return wallet info and let frontend check block explorer
    // In the future, we could integrate with Alchemy or other RPC providers
    return NextResponse.json({
      success: true,
      data: {
        address: wallet.address,
        blockchain: wallet.blockchain,
        explorerUrl: `https://testnet.arcscan.app/address/${wallet.address}`,
        message: 'Check balance on block explorer - Circle API may have delays for external transfers'
      }
    })
  } catch (error: any) {
    console.error('❌ API: Failed to fetch wallet info:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch wallet info'
    }, { status: 500 })
  }
}
