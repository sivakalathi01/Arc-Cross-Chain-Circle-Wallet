import { NextRequest, NextResponse } from 'next/server'
import { circleServerService } from '@/lib/circle-server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const walletId = params.id
    const body = await request.json()
    const { 
      destinationAddress, 
      amount, 
      tokenId, 
      blockchain, 
      userToken,
      fee 
    } = body

    console.log(`💸 API: Creating transaction for wallet ${walletId}...`)

    if (!userToken) {
      return NextResponse.json({
        success: false,
        error: 'User token is required for transaction creation'
      }, { status: 400 })
    }

    const transaction = await circleServerService.createTransaction({
      walletId,
      destinationAddress,
      amount,
      tokenId,
      blockchain,
      userToken,
      fee
    })

    return NextResponse.json({
      success: true,
      data: transaction
    })
  } catch (error: any) {
    console.error('❌ API: Transaction creation failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to create transaction'
    }, { status: 500 })
  }
}