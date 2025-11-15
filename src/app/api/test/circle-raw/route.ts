import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing raw Circle API calls...')
    
    const apiKey = process.env.CIRCLE_API_KEY
    const baseUrl = process.env.CIRCLE_BASE_URL || 'https://api.circle.com'
    
    console.log('API Key:', apiKey?.substring(0, 20) + '...')
    console.log('Base URL:', baseUrl)
    
    // Test 1: Get Entity Public Key (we know this works)
    console.log('🔑 Testing entity public key endpoint...')
    const publicKeyResponse = await fetch(`${baseUrl}/v1/w3s/config/entity/publicKey`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!publicKeyResponse.ok) {
      throw new Error(`Public key failed: ${publicKeyResponse.status} ${publicKeyResponse.statusText}`)
    }
    
    console.log('✅ Public key endpoint works!')
    
    // Test 2: Create a Circle user first (required for User-Controlled Wallets)
    console.log('👤 Testing user creation...')
    const userId = `user_${Date.now()}_${Math.random().toString(36).substring(7)}`
    
    const createUserResponse = await fetch(`${baseUrl}/v1/w3s/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: userId
      })
    })

    let userResult = null
    let userCreated = false
    if (createUserResponse.ok) {
      userResult = await createUserResponse.json()
      userCreated = true
      console.log('✅ User created successfully!', userResult)
    } else {
      console.log('❌ User creation failed:', createUserResponse.status, createUserResponse.statusText)
      const errorText = await createUserResponse.text()
      console.log('Error details:', errorText)
      userResult = errorText
    }

    // Test 3: Create user token (now with proper userId)
    let tokenResult = null
    let tokenCreated = false
    if (userCreated && userResult?.data?.id) {
      console.log('🎫 Testing user token creation...')
      console.log('Using userId:', userResult.data.id)
      
      const createTokenResponse = await fetch(`${baseUrl}/v1/w3s/users/token`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: userResult.data.id
        })
      })

      if (createTokenResponse.ok) {
        tokenResult = await createTokenResponse.json()
        tokenCreated = true
        console.log('✅ User token created successfully!')
      } else {
        console.log('❌ User token creation failed:', createTokenResponse.status, createTokenResponse.statusText)
        const errorText = await createTokenResponse.text()
        console.log('Token error details:', errorText)
        tokenResult = errorText
      }
    }

    // Test 4: Try Developer Wallets endpoint as fallback
    console.log('💼 Testing developer wallets endpoint...')
    const walletsResponse = await fetch(`${baseUrl}/v1/w3s/developer/wallets`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    })

    let walletsResult = null
    if (walletsResponse.ok) {
      walletsResult = await walletsResponse.json()
      console.log('✅ Developer wallets endpoint works!')
    } else {
      console.log('❌ Developer wallets failed:', walletsResponse.status, walletsResponse.statusText)
      walletsResult = await walletsResponse.text()
    }

    return NextResponse.json({
      success: true,
      message: 'Raw Circle API tests completed',
      results: {
        publicKeyEndpoint: 'Working ✅',
        userCreation: userCreated ? 'Working ✅' : `Failed ❌ (${createUserResponse.status})`,
        userTokenCreation: tokenCreated ? 'Working ✅' : 'Failed ❌ (no user or token error)',
        developerWalletsEndpoint: walletsResponse.ok ? 'Working ✅' : `Failed ❌ (${walletsResponse.status})`,
        userData: userResult,
        tokenData: tokenResult,
        walletsData: walletsResult
      }
    })
  } catch (error: any) {
    console.error('❌ Raw API test error:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      message: 'Raw Circle API test failed'
    }, { status: 500 })
  }
}