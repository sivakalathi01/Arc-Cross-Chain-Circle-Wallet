import { NextRequest, NextResponse } from 'next/server'
import { circleServerService } from '@/lib/circle-server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const walletId = params.id

    console.log(`💰 API: Fetching balance for wallet ${walletId} via Circle server...`)

    const balances = await circleServerService.getWalletBalance(walletId)

    return NextResponse.json({
      success: true,
      data: balances
    })
  } catch (error: any) {
    console.error('❌ API: Balance fetch failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch wallet balance'
    }, { status: 500 })
  }
}