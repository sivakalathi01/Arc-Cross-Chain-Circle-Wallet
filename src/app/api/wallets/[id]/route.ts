import { NextRequest, NextResponse } from 'next/server'
import { circleServerService } from '@/lib/circle-server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const walletId = params.id

    console.log(`🔍 API: Fetching wallet ${walletId} via Circle server...`)

    const wallet = await circleServerService.getWalletById(walletId)

    return NextResponse.json({
      success: true,
      data: wallet
    })
  } catch (error: any) {
    console.error('❌ API: Wallet fetch failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch wallet'
    }, { status: 500 })
  }
}