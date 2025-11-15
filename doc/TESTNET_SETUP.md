# 🚀 Circle Testnet Integration - Quick Start Guide

## 🔑 Step 1: Get Real Circle API Keys

**IMPORTANT**: Your current keys are placeholders and won't work with the testnet faucet.

### Get Circle Developer Account:
1. **Visit**: https://developers.circle.com/
2. **Sign up** for a free developer account
3. **Create a new project** (choose Web3 Services)
4. **Generate API keys** for testnet environment

### What You'll Receive:
- **API Key**: `TEST_API_KEY:your_real_key_id:your_real_secret`
- **Client Key**: `TEST_CLIENT_KEY:your_client_id:your_client_secret`  
- **Entity Secret**: `TEST_ENTITY_SECRET:your_entity_id:your_entity_secret`

---

## 📝 Step 2: Update Your .env File

Replace the placeholder keys in your `.env` file:

```bash
# Replace these lines:
CIRCLE_API_KEY=TEST_API_KEY:98c189a0fddd8ef9e01a04beee337556:17beaa8147c0b752314f29e9a80b6e82
CIRCLE_CLIENT_KEY=TEST_CLIENT_KEY:5cbcc136a24d9e57af5bed97e1c9d167:ff7d51f8f2eefcf71f9ae221bdca5bd2
CIRCLE_ENTITY_SECRET=TEST_ENTITY_SECRET:5cbcc136a24d9e57af5bed97e1c9d167:ff7d51f8f2eefcf71f9ae221bdca5bd2

# With your real keys:
CIRCLE_API_KEY=TEST_API_KEY:your_real_key_id:your_real_secret
CIRCLE_CLIENT_KEY=TEST_CLIENT_KEY:your_client_id:your_client_secret
CIRCLE_ENTITY_SECRET=TEST_ENTITY_SECRET:your_entity_id:your_entity_secret

# Also update the NEXT_PUBLIC versions:
NEXT_PUBLIC_CIRCLE_API_KEY=TEST_API_KEY:your_real_key_id:your_real_secret
NEXT_PUBLIC_CIRCLE_CLIENT_KEY=TEST_CLIENT_KEY:your_client_id:your_client_secret
NEXT_PUBLIC_CIRCLE_ENTITY_SECRET=TEST_ENTITY_SECRET:your_entity_id:your_entity_secret
```

---

## 🧪 Step 3: Test Your Integration

1. **Restart your dev server** after updating keys:
   ```bash
   npm run dev
   ```

2. **Open the app**: http://localhost:3002

3. **Create a wallet**:
   - Click "Create Wallet" 
   - Give it a test name

4. **Test the API**:
   - Go to "Testnet Faucet" tab
   - Click **"Test Circle API Connection"** button
   - Check browser console for detailed results

5. **Request testnet tokens**:
   - If API test passes, click "Request ETH" or "Request USDC"
   - Tokens should appear within 1-5 minutes

---

## 🔍 Troubleshooting

### If API Test Fails:
- **401 Error**: Check your API key format
- **403 Error**: Verify testnet permissions in Circle console
- **404 Error**: API endpoints may need adjustment

### If Faucet Fails:
- Use the web faucets as backup:
  - **Public**: https://faucet.circle.com
  - **Developer**: https://console.circle.com/faucet

### Debug Info:
- Check browser console (F12) for detailed logs
- All API calls are logged with emojis for easy tracking
- Error messages include specific troubleshooting steps

---

## ✅ What Works After Setup:

✅ **Real Circle API Integration**  
✅ **Testnet wallet creation**  
✅ **Testnet token faucets (ETH & USDC)**  
✅ **Balance checking**  
✅ **Cross-chain USDC transfers via CCTP**  
✅ **Transaction history**  
✅ **Multi-wallet management**  

---

## 🎯 Next Steps After Getting Tokens:

1. **Test sending USDC** between wallets
2. **Try cross-chain transfers** (Ethereum ↔ Polygon)
3. **Explore transaction history**
4. **Test multiple wallets**

Your app is fully ready for real Circle testnet integration! 🚀