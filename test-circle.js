#!/usr/bin/env node

/**
 * Circle Integration Test Script
 * Tests all Circle services and workflows
 */

const axios = require('axios')

const BASE_URL = 'http://localhost:3000'
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

async function testEndpoint(name, endpoint, method = 'GET', data = null) {
  console.log(`\n🧪 Testing ${name}...`)
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' }
    }
    
    if (data) config.data = data
    
    const response = await axios(config)
    console.log(`✅ ${name}: SUCCESS`)
    console.log(`Status: ${response.status}`)
    console.log(`Response:`, JSON.stringify(response.data, null, 2))
    return response.data
  } catch (error) {
    console.log(`❌ ${name}: FAILED`)
    if (error.response) {
      console.log(`Status: ${error.response.status}`)
      console.log(`Error:`, error.response.data)
    } else {
      console.log(`Error: ${error.message}`)
    }
    return null
  }
}

async function runTests() {
  console.log('🚀 Starting Circle Integration Tests...\n')
  
  // Wait for server to be ready
  console.log('⏳ Waiting for server to start...')
  await delay(5000)
  
  // Test 1: Circle Direct API (Working implementation)
  await testEndpoint(
    'Circle Direct API', 
    '/api/test/circle-direct'
  )
  
  // Test 2: Circle Raw API (Basic Circle API test)
  await testEndpoint(
    'Circle Raw API', 
    '/api/test/circle-raw'
  )
  
  // Test 3: Circle SDK Test
  await testEndpoint(
    'Circle SDK Test', 
    '/api/test/circle'
  )
  
  // Test 4: Health check
  await testEndpoint(
    'Health Check', 
    '/api/health'
  )
  
  console.log('\n🏁 Testing Complete!')
  console.log('\n📋 Test Summary:')
  console.log('- If Circle Direct API works → Your integration is working')
  console.log('- If Circle Raw API works → Your credentials are valid')
  console.log('- If Circle SDK Test works → The SDK is properly configured')
  console.log('- Check the logs above for detailed results')
}

// Handle server not ready
process.on('unhandledRejection', (reason, promise) => {
  console.log('⚠️  Server might not be ready. Please ensure:')
  console.log('1. Run "npm run dev" in another terminal')
  console.log('2. Wait for "Ready in X.Xs" message')
  console.log('3. Then run this test script again')
})

runTests()