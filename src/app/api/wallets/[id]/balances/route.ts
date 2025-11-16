import { NextRequest, NextResponse } from 'next/server'
import { CircleDirectClient } from '@/lib/circle-direct'
import { getBlockchainBalance } from '@/lib/blockchain-balance'
import { db } from '@/lib/database'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const walletId = params.id

    console.log(`💰 API: Fetching balance for wallet ${walletId}...`)

    // Get wallet from database to get address and blockchain
    const wallet = await db.getWallet(walletId)
    
    if (!wallet) {
      return NextResponse.json({
        success: false,
        error: 'Wallet not found'
      }, { status: 404 })
    }

    // Initialize Circle Direct client
    const circleClient = new CircleDirectClient(
      process.env.CIRCLE_API_KEY || '',
      process.env.CIRCLE_ENTITY_SECRET || '',
      process.env.CIRCLE_BASE_URL || 'https://api.circle.com'
    )

    // Try to get balance from Circle API first
    const circleBalances = await circleClient.getWalletBalance(walletId)

    if (circleBalances?.tokenBalances && circleBalances.tokenBalances.length > 0) {
      console.log(`✅ Using Circle API balances`)
      return NextResponse.json({
        success: true,
        data: circleBalances
      })
    }

    // If Circle API returns empty, fetch from blockchain directly
    console.log(`⛓️  Circle API returned no balances, fetching from blockchain...`)
    const blockchainBalances = await getBlockchainBalance(wallet.address, wallet.blockchain)

    return NextResponse.json({
      success: true,
      data: {
        tokenBalances: blockchainBalances
      }
    })
  } catch (error: any) {
    console.error('❌ API: Balance fetch failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch wallet balance'
    }, { status: 500 })
  }
}