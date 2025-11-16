# CCTP (Cross-Chain Transfer Protocol) Integration

## Overview

This application integrates **Circle's Cross-Chain Transfer Protocol (CCTP)** for secure, native USDC transfers across different blockchains. CCTP is a permissionless on-chain utility that enables 1:1 USDC transfers between supported blockchains.

## What is CCTP?

CCTP is Circle's official protocol for cross-chain USDC transfers that:

- **Burns** USDC on the source blockchain
- **Generates attestation** via Circle's attestation service
- **Mints** native USDC on the destination blockchain

This ensures USDC transferred cross-chain is always backed 1:1 and maintains fungibility across all supported chains.

## How CCTP Works

### The Three-Step Process

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   BURN      │  →   │ ATTESTATION │  →   │    MINT     │
│ Source Chain│      │   Service   │      │  Dest Chain │
└─────────────┘      └─────────────┘      └─────────────┘
```

1. **Burn Phase**: USDC is burned on the source blockchain via TokenMessenger contract
2. **Attestation Phase**: Circle's attestation service validates the burn and signs a message
3. **Mint Phase**: Native USDC is minted on destination blockchain via MessageTransmitter contract

### Transaction States

Our implementation tracks CCTP transactions through these states:

| State | Description |
|-------|-------------|
| `PENDING_BURN` | Transaction initiated, awaiting burn confirmation |
| `BURN_COMPLETE` | USDC successfully burned on source chain |
| `ATTESTATION_PENDING` | Waiting for Circle's attestation service |
| `ATTESTATION_READY` | Attestation received, ready for mint |
| `MINT_PENDING` | Mint transaction submitted to destination chain |
| `MINT_COMPLETE` | USDC successfully minted on destination chain |
| `FAILED` | Transaction failed at any stage |

## Implementation Details

### Circle Developer-Controlled Wallets + CCTP

Our application uses **Circle's Developer-Controlled Wallets API**, which automatically handles CCTP protocol when cross-chain transfers are detected:

```typescript
// In circle-direct.ts
const transactionRequest = {
  walletId: params.walletId,
  destinationAddress: params.destinationAddress,
  amounts: [params.amount],
  tokenId: usdcToken.token.id,
  destinationChain: destinationBlockchain, // Triggers CCTP
}

// Circle's API handles:
// 1. Burning tokens on source chain
// 2. Generating attestation
// 3. Minting tokens on destination chain
```

When `destinationChain` differs from the wallet's blockchain, Circle's API automatically:
- Uses CCTP protocol
- Manages burn/attestation/mint flow
- Returns transaction status with CCTP-specific fields

### CCTP Service Integration

Our `CCTPService` (`src/lib/cctp.ts`) provides:

```typescript
// Initialize with Circle API client
await cctpService.initialize(circleClient)

// Track CCTP transaction state
const cctpState = await cctpService.trackCCTPTransaction(transactionId)
// Returns: {
//   transactionId, sourceTxHash, destinationTxHash,
//   attestationHash, status, sourceChain, destinationChain
// }

// Get attestation for manual verification
const attestation = await cctpService.getAttestation(sourceTxHash, sourceChain)
```

### Supported Blockchains

CCTP is enabled for transfers between:

| Blockchain | Network | USDC Contract |
|------------|---------|---------------|
| Arc Testnet | Testnet | `0x5425790f193Ff03b6C778C406b816c9CD5cE5FdD` |
| Ethereum Sepolia | Testnet | `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238` |
| Polygon Amoy | Testnet | `0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582` |
| Avalanche Fuji | Testnet | `0x5425790f193Ff03b6C778C406b816c9CD5cE5FdD` |

## User Experience

### Cross-Chain Transfer Flow

1. **User selects source wallet** (e.g., Arc Testnet wallet)
2. **User selects destination blockchain** (e.g., Ethereum Sepolia)
3. **User enters recipient address and amount**
4. **Application automatically detects cross-chain transfer**
5. **CCTP protocol is triggered transparently**
6. **User sees transaction status updates**:
   - ⏳ "Burning USDC on Arc Testnet..."
   - ✅ "Burn confirmed, awaiting attestation..."
   - ⏳ "Minting USDC on Ethereum Sepolia..."
   - ✅ "Transfer complete!"

### Transaction Monitoring

Users can track their cross-chain transfers in real-time:

```typescript
// Transaction list shows CCTP status
{
  id: "cctp_tx_123",
  status: "ATTESTATION_READY",
  sourceTxHash: "0xabc...",
  destinationTxHash: "0xdef...",
  attestationHash: "0x123...",
}
```

## Technical Benefits

### Why CCTP vs Traditional Bridges?

| Feature | CCTP | Traditional Bridge |
|---------|------|-------------------|
| **Security** | Native burn/mint | Locked collateral |
| **Liquidity** | Always available | Can be depleted |
| **USDC Type** | Native USDC | Often wrapped USDC |
| **Trust** | Circle-backed | Third-party |
| **Speed** | ~15 minutes | Varies |

### Circle's Attestation Service

Circle operates a permissionless attestation service that:
- Observes burn events on source chains
- Validates the burn transaction
- Signs an attestation message
- Makes attestation publicly available

Our application can query attestations via:
```typescript
const attestation = await cctpService.getAttestation(txHash, chainId)
```

## Code References

### Key Files

- **`src/lib/circle-direct.ts`**: Circle API integration with CCTP support
  - `sendTransaction()`: Initiates CCTP transfers
  - `getCCTPTransactionStatus()`: Tracks CCTP state

- **`src/lib/cctp.ts`**: CCTP service with state tracking
  - `trackCCTPTransaction()`: Monitor burn/attestation/mint progress
  - `mapCircleStateToCCTP()`: Convert Circle states to CCTP states

- **`src/types/index.ts`**: CCTP type definitions
  - `CCTPTransactionState`: Transaction state tracking
  - `CCTPConfig`: Protocol configuration

### Transaction Flow

```typescript
// 1. User initiates cross-chain transfer
const transaction = await circleClient.sendTransaction({
  walletId: sourceWallet.id,
  destinationAddress: recipientAddress,
  destinationBlockchain: 'ETH-SEPOLIA', // Different from source
  amount: '10.00',
})

// 2. Circle API uses CCTP protocol automatically
// Logs: "🌉 Cross-chain CCTP transfer detected"
// Logs: "📋 CCTP Protocol: Circle will handle burn on source chain and mint on destination chain"

// 3. Track CCTP progress
const cctpState = await cctpService.trackCCTPTransaction(transaction.id)
console.log(cctpState.status) // "BURN_COMPLETE" → "ATTESTATION_READY" → "MINT_COMPLETE"
```

## Circle API Fields

Circle's Developer-Controlled Wallets API returns CCTP-specific fields for cross-chain transactions:

```json
{
  "transaction": {
    "id": "abc-123",
    "state": "COMPLETE",
    "blockchain": "ARG-TESTNET",
    "destinationChain": "ETH-SEPOLIA",
    "txHash": "0xabc...", // Burn transaction on source
    "destinationTxHash": "0xdef...", // Mint transaction on destination
    "attestationHash": "0x123...", // CCTP attestation signature
    "messageHash": "0x456..." // CCTP message hash
  }
}
```

## Monitoring & Debugging

### Console Logs

Our implementation logs CCTP progress:

```
💸 Initiating transaction from wallet...
🌐 Source blockchain: ARG-TESTNET
🌐 Destination blockchain: ETH-SEPOLIA
🌉 Cross-chain CCTP transfer detected
📋 CCTP Protocol: Circle will handle burn on source chain and mint on destination chain
📤 Sending CCTP transaction request: { protocol: 'CCTP' }
✅ CCTP transaction initiated
⏳ CCTP Process: Awaiting burn confirmation, attestation, and mint on destination chain
```

### Status Checking

```typescript
// Check detailed CCTP status
const status = await circleClient.getCCTPTransactionStatus(transactionId)

// Logs:
// 🔍 Checking CCTP transaction status: abc-123
// 📊 CCTP Status: COMPLETE
// 🔗 Source TX Hash: 0xabc...
// 🔗 Destination TX Hash: 0xdef...
// ✅ CCTP Attestation: 0x123...
```

## Best Practices

### 1. Always Check Transaction Status
Cross-chain transfers take time (~15 minutes). Always poll for status updates:

```typescript
const pollInterval = setInterval(async () => {
  const state = await cctpService.trackCCTPTransaction(txId)
  if (state.status === 'MINT_COMPLETE' || state.status === 'FAILED') {
    clearInterval(pollInterval)
    // Update UI
  }
}, 10000) // Check every 10 seconds
```

### 2. Handle Attestation Delays
Circle's attestation service typically takes 10-20 minutes. Show users:
- Current status
- Estimated completion time
- Links to block explorers for both chains

### 3. Verify Destination Address
Cross-chain transfers are irreversible. Always:
- Validate destination address format
- Confirm blockchain selection
- Show confirmation dialog

## Resources

- **Circle CCTP Documentation**: https://developers.circle.com/stablecoins/docs/cctp-getting-started
- **CCTP Protocol**: https://www.circle.com/en/cross-chain-transfer-protocol
- **Supported Chains**: https://developers.circle.com/stablecoins/docs/supported-domains
- **Circle Developer Portal**: https://console.circle.com/

## Summary

This application fully integrates CCTP through Circle's Developer-Controlled Wallets API:

✅ **Automatic CCTP detection** for cross-chain transfers  
✅ **Native burn/mint flow** via Circle's infrastructure  
✅ **Real-time status tracking** with CCTP state mapping  
✅ **Attestation monitoring** for transaction verification  
✅ **Multi-blockchain support** across 4 testnets  
✅ **Transparent UX** - users don't see blockchain complexity  

CCTP ensures all cross-chain USDC transfers are secure, native, and fully backed 1:1.
