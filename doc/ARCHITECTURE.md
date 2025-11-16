# Arc Cross-Chain Wallet Architecture

## System Overview

```mermaid
graph TB
    subgraph "Frontend Layer"
        UI[Next.js UI Components]
        WC[WalletContext]
        SF[SendForm]
        TL[TransactionList]
        WD[WalletDashboard]
    end

    subgraph "Service Layer"
        CWS[Circle Wallet Service]
        CCTP[CCTP Service]
        GW[Gateway Service]
        DB[Database Service]
    end

    subgraph "External APIs"
        CIRCLE[Circle API]
        GATEWAY[Gateway.fm API]
        ARC[Arc Testnet RPC]
        ETH[Ethereum Sepolia RPC]
    end

    subgraph "Data Storage"
        PG[(PostgreSQL)]
        MEM[In-Memory Cache]
    end

    UI --> WC
    WC --> CWS
    WC --> CCTP
    WC --> GW
    WC --> DB
    
    SF --> WC
    TL --> WC
    WD --> WC
    
    CWS --> CIRCLE
    CCTP --> CIRCLE
    GW --> GATEWAY
    DB --> PG
    DB --> MEM
    
    CWS --> ARC
    CWS --> ETH
```

## Cross-Chain Transaction Flow

```mermaid
sequenceDiagram
    participant User
    participant SendForm
    participant WalletContext
    participant Gateway
    participant CCTP
    participant Circle
    participant Blockchain

    User->>SendForm: Enter transaction details
    SendForm->>WalletContext: sendTransaction()
    
    alt Cross-Chain Transfer
        WalletContext->>Gateway: findOptimalRoute()
        Gateway-->>WalletContext: Route with protocol info
        WalletContext->>WalletContext: Log Gateway route
    end
    
    WalletContext->>Circle: POST /wallets/transfer
    Circle-->>WalletContext: Transaction initiated
    
    alt Cross-Chain (CCTP)
        WalletContext->>CCTP: trackCCTPTransaction()
        CCTP->>Circle: getCCTPTransactionStatus()
        Circle-->>CCTP: Status (PENDING_BURN)
        CCTP->>Circle: Poll for attestation
        Circle-->>CCTP: Status (COMPLETE)
        CCTP-->>WalletContext: CCTP tracking complete
    end
    
    WalletContext->>Blockchain: Monitor transaction
    Blockchain-->>WalletContext: Confirmation
    WalletContext-->>User: Transaction complete
```

## Component Architecture

```mermaid
graph LR
    subgraph "React Components"
        A[App Layout]
        A --> B[WalletDashboard]
        B --> C[WalletCard]
        B --> D[SendForm]
        B --> E[TransactionList]
        D --> F[CCTPStatus]
        E --> F
    end
    
    subgraph "Context Providers"
        WC[WalletContext]
    end
    
    subgraph "Services"
        S1[CircleWalletService]
        S2[CCTPService]
        S3[GatewayService]
        S4[DatabaseService]
    end
    
    B --> WC
    C --> WC
    D --> WC
    E --> WC
    
    WC --> S1
    WC --> S2
    WC --> S3
    WC --> S4
```

## Data Flow Architecture

```mermaid
graph TD
    subgraph "User Actions"
        CREATE[Create Wallet]
        SEND[Send Transaction]
        VIEW[View Balance]
    end
    
    subgraph "Business Logic"
        VALIDATE[Validation Layer]
        ROUTE[Route Optimization]
        ENCRYPT[Encryption Layer]
    end
    
    subgraph "Integration Layer"
        CIRCLE_API[Circle Direct API]
        CCTP_API[CCTP Protocol]
        GATEWAY_API[Gateway Router]
        BLOCKCHAIN[Blockchain RPC]
    end
    
    subgraph "Persistence"
        DB_WALLET[Wallet Storage]
        DB_TX[Transaction Storage]
        DB_BALANCE[Balance Cache]
    end
    
    CREATE --> VALIDATE
    SEND --> VALIDATE
    VIEW --> VALIDATE
    
    VALIDATE --> ROUTE
    ROUTE --> ENCRYPT
    
    ENCRYPT --> CIRCLE_API
    ENCRYPT --> GATEWAY_API
    
    CIRCLE_API --> CCTP_API
    GATEWAY_API --> CCTP_API
    
    CCTP_API --> BLOCKCHAIN
    CIRCLE_API --> BLOCKCHAIN
    
    BLOCKCHAIN --> DB_TX
    CIRCLE_API --> DB_WALLET
    BLOCKCHAIN --> DB_BALANCE
```

## Technology Stack

### Frontend
- **Framework**: Next.js 14.2.33 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API

### Backend Services
- **Circle Developer Wallets**: Custodial wallet management
- **CCTP**: Cross-Chain Transfer Protocol for USDC
- **Gateway.fm**: Route optimization for cross-chain transfers
- **PostgreSQL**: Primary data storage

### Blockchain Integration
- **Arc Testnet**: Arbitrum-based testnet
- **Ethereum Sepolia**: Ethereum testnet
- **Polygon Amoy**: Polygon testnet
- **Avalanche Fuji**: Avalanche testnet

### Security
- **Encryption**: RSA-OAEP for sensitive data
- **Authentication**: Circle API keys with entity secrets
- **Environment**: .env.local for configuration

## Key Features

### 1. Circle Developer-Controlled Wallets
- Automated wallet creation via Circle API
- Secure key management with RSA encryption
- Multi-chain support (ETH, ARC, MATIC, AVAX)

### 2. CCTP Integration
- Automatic detection of cross-chain transfers
- Real-time status tracking (burn → attestation → mint)
- Visual indicators for CCTP transactions
- Attestation hash tracking

### 3. Gateway Route Optimization
- Finds optimal routes for cross-chain transfers
- Displays estimated time and fees
- Non-breaking fallback to direct CCTP
- Protocol-agnostic design

### 4. Arc Testnet Support
- Native Arc Testnet wallet creation
- USDC transfers on Arc network
- Cross-chain bridging from Arc to other networks

### 5. Transaction Management
- Database persistence for all transactions
- Real-time balance fetching from blockchain
- Transaction history with CCTP status
- Graceful fallback to in-memory storage

## Database Schema

```mermaid
erDiagram
    WALLETS ||--o{ WALLET_BALANCES : has
    WALLETS ||--o{ TRANSACTIONS : initiates
    
    WALLETS {
        uuid id PK
        string circle_wallet_id
        string address
        string blockchain
        string state
        timestamp create_date
        timestamp update_date
    }
    
    WALLET_BALANCES {
        uuid id PK
        uuid wallet_id FK
        string token_address
        decimal amount
        timestamp update_date
    }
    
    TRANSACTIONS {
        uuid id PK
        uuid wallet_id FK
        string source_address
        string destination_address
        string blockchain
        string destination_chain
        string tx_hash
        string destination_tx_hash
        string attestation_hash
        string message_hash
        string state
        decimal amount
        timestamp create_date
    }
```

## API Routes

### Wallet Management
- `POST /api/wallets` - Create new wallet
- `GET /api/wallets` - List all wallets
- `GET /api/wallets/[id]` - Get wallet details
- `GET /api/wallets/[id]/balances` - Get wallet balance
- `POST /api/wallets/[id]/transactions` - Send transaction

### Testing & Health
- `GET /api/health` - Health check
- `GET /api/test/circle` - Test Circle API connection
- `GET /api/test/circle-direct` - Test Circle Direct client

## Environment Configuration

### Required Variables
```
CIRCLE_API_KEY=TEST_API_KEY:...
CIRCLE_CLIENT_KEY=TEST_CLIENT_KEY:...
CIRCLE_ENTITY_SECRET=...
CIRCLE_BASE_URL=https://api.circle.com
DATABASE_URL=postgresql://...
```

### Optional Variables
```
GATEWAY_API_KEY=...
ARC_API_KEY=...
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=...
```

## Deployment Architecture

```mermaid
graph TB
    subgraph "Client Browser"
        BROWSER[Next.js Client]
    end
    
    subgraph "Vercel/Node Server"
        APP[Next.js App]
        API[API Routes]
        SSR[Server-Side Rendering]
    end
    
    subgraph "External Services"
        CIRCLE_SVC[Circle API]
        GATEWAY_SVC[Gateway.fm]
        RPC[Blockchain RPCs]
    end
    
    subgraph "Database"
        POSTGRES[(PostgreSQL)]
    end
    
    BROWSER <--> APP
    APP <--> API
    APP <--> SSR
    
    API <--> CIRCLE_SVC
    API <--> GATEWAY_SVC
    API <--> RPC
    API <--> POSTGRES
```

## Error Handling & Resilience

### Database Fallback
- Primary: PostgreSQL connection
- Fallback: In-memory storage
- Automatic retry logic

### API Resilience
- Circle API errors → User-friendly messages
- Gateway unavailable → Direct CCTP routing
- Blockchain RPC failures → Alternative endpoints

### Transaction Safety
- Pre-validation of all inputs
- Idempotency for transaction creation
- Status polling with exponential backoff

## Future Enhancements

1. **Transaction Indexing**: Alchemy/Etherscan API integration
2. **Real Gateway Integration**: Replace mock with live Gateway.fm
3. **Multi-sig Support**: Enhanced security for high-value transfers
4. **Gas Optimization**: Dynamic fee estimation
5. **Mobile App**: React Native version
6. **Advanced Analytics**: Transaction history charts
7. **Wallet Recovery**: Backup and recovery mechanisms
8. **DeFi Integration**: Swap, stake, and yield features
