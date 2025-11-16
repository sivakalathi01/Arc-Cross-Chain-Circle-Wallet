# Circle Integration Testing Guide

## Quick Start Testing

### 1. Start Development Server
```bash
npm run dev
```
Wait for the "Ready in X.Xs" message.

### 2. Run Automated Tests
```bash
node test-circle.js
```

### 3. Manual Browser Testing
Open these URLs in your browser:

#### API Endpoints:
- **Circle Direct API**: http://localhost:3000/api/test/circle-direct
- **Circle Raw API**: http://localhost:3000/api/test/circle-raw  
- **Circle SDK Test**: http://localhost:3000/api/test/circle

#### Frontend Testing:
- **Main App**: http://localhost:3000
- **Wallet Page**: http://localhost:3000/wallet

## Testing Steps

### Phase 1: API Testing
1. **Circle Direct API** - Tests our working implementation
   - Should create user → user token → wallet
   - Success indicates the integration works
   
2. **Circle Raw API** - Tests basic Circle API access
   - Validates your Circle credentials
   - Should return configuration info

3. **Circle SDK Test** - Tests the official Circle SDK
   - May show the workflow bug we fixed
   - Compare with Circle Direct results

### Phase 2: Frontend Testing
1. **Create Circle Wallet** - Test multi-blockchain wallet creation
2. **Check Balances** - View USDC balances from blockchain
3. **Send Transactions** - Test cross-chain USDC transfers
4. **View Explorer** - Check transactions on block explorers

## PowerShell Testing Commands

### Test Individual Endpoints:
```powershell
# Test Circle Direct API
Invoke-WebRequest -Uri "http://localhost:3000/api/test/circle-direct" -UseBasicParsing | Select-Object Content

# Test Circle Raw API  
Invoke-WebRequest -Uri "http://localhost:3000/api/test/circle-raw" -UseBasicParsing | Select-Object Content

# Test with detailed output
$response = Invoke-RestMethod -Uri "http://localhost:3000/api/test/circle-direct"
$response | ConvertTo-Json -Depth 10
```

### Check Server Status:
```powershell
# Check if port 3000 is in use
netstat -ano | findstr :3000

# Test server health
Test-NetConnection -ComputerName localhost -Port 3000
```

## Expected Results

### ✅ Success Indicators:
- Circle Direct API returns user and wallet data
- No API key errors in console
- Frontend shows "Connected" status
- Wallet creation succeeds

### ❌ Common Issues:
- "Service not initialized" → User creation failed
- "API key invalid" → Check .env credentials  
- "Target machine refused connection" → Server not started
- "CORS error" → Browser security, use API endpoints first

## Environment Validation

Your current Circle configuration:
```
CIRCLE_API_KEY=TEST_API_KEY:98c189a0fddd8ef...
CIRCLE_CLIENT_KEY=TEST_CLIENT_KEY:5cbcc136a24d9e5...
CIRCLE_ENTITY_SECRET=a87b31dc33a39d0506bc0f...
```

These are valid Circle testnet credentials.

## Troubleshooting

### Server Won't Start:
1. Check if port 3000 is already in use
2. Kill existing Node processes: `Get-Process node | Stop-Process`
3. Clear Next.js cache: `Remove-Item .next -Recurse -Force`
4. Reinstall dependencies: `npm install`

### API Errors:
1. Check server console logs for detailed errors
2. Verify .env file is in project root
3. Ensure no trailing spaces in environment variables
4. Restart server after .env changes

### Frontend Issues:
1. Open browser developer tools (F12)
2. Check Console tab for JavaScript errors
3. Check Network tab for failed API calls
4. Clear browser cache and cookies

## Production Testing

Once local testing passes:
1. Deploy to staging environment
2. Test with real testnet USDC
3. Validate all transaction flows
4. Monitor error rates and performance