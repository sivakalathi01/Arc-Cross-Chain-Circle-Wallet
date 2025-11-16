import { NextRequest, NextResponse } from 'next/server'
import { CircleDirectClient } from '@/lib/circle-direct'
import { walletStorage } from '@/lib/wallet-storage'
import { db } from '@/lib/database'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, blockchain } = body

    const selectedBlockchain = blockchain || 'ARB-SEPOLIA'
    console.log('🔨 API: Creating wallet via Circle Direct client...', { name, blockchain: selectedBlockchain })

    // Initialize client inside function to avoid module-level errors
    const circleClient = new CircleDirectClient(
      process.env.CIRCLE_API_KEY || '',
      process.env.CIRCLE_ENTITY_SECRET || '',
      process.env.CIRCLE_BASE_URL || 'https://api.circle.com'
    )

    // Step 1: Create wallet set
    const walletSetName = name || 'My Wallet Set'
    const walletSetResponse = await circleClient.createWalletSet(walletSetName)
    const walletSetId = walletSetResponse.data.walletSet.id
    
    console.log('✅ Wallet set created:', walletSetId)

    // Step 2: Create wallet in the wallet set
    const wallet = await circleClient.createWallet(walletSetId, selectedBlockchain)

    console.log('✅ Wallet created successfully:', wallet.data.id, 'on', selectedBlockchain)

    // Store the wallet (database first, fallback to memory)
    const walletData = {
      id: wallet.data.id,
      address: wallet.data.address,
      blockchain: wallet.data.blockchain,
      walletSetId: walletSetId,
      createDate: wallet.data.createDate
    }

    if (db.isAvailable()) {
      try {
        await db.createWallet({
          id: wallet.data.id,
          address: wallet.data.address,
          blockchain: wallet.data.blockchain,
          accountType: wallet.data.accountType || 'SCA',
          walletSetId: walletSetId,
          name: name
        })
        console.log('💾 Wallet saved to database')
      } catch (dbError) {
        console.error('⚠️  Database save failed, using in-memory storage:', dbError)
        walletStorage.addWallet(walletData)
      }
    } else {
      console.log('💾 Using in-memory storage (database not configured)')
      walletStorage.addWallet(walletData)
    }

    return NextResponse.json({
      success: true,
      data: {
        wallet: wallet.data,
        walletSetId: walletSetId
      }
    })
  } catch (error: any) {
    console.error('❌ API: Wallet creation failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to create wallet'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('📋 API: Fetching wallets...')

    let wallets

    // Try database first, fallback to in-memory storage
    if (db.isAvailable()) {
      try {
        wallets = await db.getAllWallets()
        console.log(`✅ Found ${wallets.length} wallet(s) in database`)
      } catch (dbError) {
        console.error('⚠️  Database fetch failed, using in-memory storage:', dbError)
        wallets = walletStorage.getWallets()
      }
    } else {
      console.log('📂 Using in-memory storage (database not configured)')
      wallets = walletStorage.getWallets()
    }
    
    console.log(`✅ Returning ${wallets.length} wallet(s)`)

    return NextResponse.json({
      success: true,
      data: {
        wallets: wallets
      }
    })
  } catch (error: any) {
    console.error('❌ API: Wallet fetching failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch wallets'
    }, { status: 500 })
  }
}