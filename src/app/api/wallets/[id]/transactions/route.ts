import { NextRequest, NextResponse } from 'next/server'
import { CircleDirectClient } from '@/lib/circle-direct'
import { getCircleConfig } from '@/lib/circle-config'
import { db } from '@/lib/database'

// GET endpoint to fetch transactions for a wallet
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const walletId = params.id
    console.log(`📋 API: Fetching transactions for wallet ${walletId}...`)

    // For now, return empty array since Circle doesn't provide transaction history
    // In production, you'd query blockchain explorers or maintain your own transaction DB
    const transactions: any[] = []
    
    console.log(`✅ Found ${transactions.length} transaction(s)`)

    return NextResponse.json({
      success: true,
      data: transactions
    })
  } catch (error: any) {
    console.error('❌ API: Transaction fetch failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch transactions'
    }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const walletId = params.id
    const body = await request.json()

    console.log('💸 API: Sending transaction from wallet:', walletId)
    console.log('📤 Transaction params:', body)

    // Initialize Circle client
    const config = getCircleConfig()
    const circleClient = new CircleDirectClient(
      config.apiKey,
      config.entitySecret,
      config.baseUrl
    )

    // Verify wallet exists in database
    const wallet = await db.getWallet(walletId)

    if (!wallet) {
      return NextResponse.json(
        { success: false, error: 'Wallet not found' },
        { status: 404 }
      )
    }

    // Send transaction via Circle API
    const transaction = await circleClient.sendTransaction({
      walletId,
      destinationAddress: body.destinationAddress,
      destinationBlockchain: body.destinationBlockchain,
      amount: body.amount,
      tokenAddress: body.tokenAddress,
    })

    console.log('✅ Transaction sent successfully:', transaction.id)

    return NextResponse.json({
      success: true,
      data: transaction
    })
  } catch (error: any) {
    console.error('❌ API: Transaction failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to send transaction'
    }, { status: 500 })
  }
}