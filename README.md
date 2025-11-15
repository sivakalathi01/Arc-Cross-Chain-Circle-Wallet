# Arc Cross Chain Wallet

A comprehensive DeFi Cross Chain application with embedded wallet experience using Circle Wallets, CCTP, Gateway, and Arc protocols.

## 🌟 Features

### Core Functionality
- **Embedded Wallet**: Native wallet experience built into your application using Circle's Programmable Wallets
- **Cross-Chain USDC Transfers**: Seamless transfers across multiple blockchains using Circle's CCTP (Cross-Chain Transfer Protocol)
- **In-App Payments**: Integrated payment flows for merchant transactions
- **DeFi Integration**: Access to yield farming, staking, and liquidity provision through Arc protocol
- **Multi-Chain Support**: Ethereum, Polygon, Arbitrum, Optimism, and Avalanche

### Technical Features
- **Smart Contract Accounts (SCA)**: Enhanced security and functionality
- **Transaction Management**: Real-time transaction tracking and status updates
- **Balance Monitoring**: Live balance updates across all supported chains
- **Fee Estimation**: Accurate gas fee calculations for all operations
- **Mock API Implementation**: Complete development environment with mock services

## 🏗️ Architecture

### Frontend Stack
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Zustand**: State management
- **React Query**: Server state management
- **Framer Motion**: Animations and transitions

### Integration Partners
- **Circle Wallets**: Programmable wallet infrastructure
- **Circle CCTP**: Cross-chain USDC transfer protocol
- **Gateway**: Cross-chain transaction optimization
- **Arc Protocol**: DeFi yield and liquidity management
- **Wagmi**: Ethereum React hooks

## 🚀 Getting Started

### Prerequisites
- Node.js 18.0 or later
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Arc_Cross_Chain
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Update the environment variables:
   ```env
   # Circle Configuration
   CIRCLE_API_KEY=your_circle_api_key_here
   CIRCLE_ENTITY_SECRET=your_circle_entity_secret_here
   
   # Gateway Configuration
   GATEWAY_API_KEY=your_gateway_api_key_here
   
   # Arc Configuration
   ARC_API_KEY=your_arc_api_key_here
   
   # WalletConnect Configuration
   NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_walletconnect_project_id_here
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📱 Usage

### Wallet Management
1. **Create Wallet**: Click "Create Wallet" to generate a new smart contract account
2. **Select Wallet**: Choose from multiple wallets in your account
3. **View Balances**: Monitor USDC and native token balances across chains

### Transactions
1. **Send USDC**: Transfer USDC to any Ethereum address
2. **Cross-Chain Transfer**: Move USDC between different blockchains
3. **Transaction History**: View all past transactions with status tracking

### DeFi Features
1. **Yield Farming**: Access high-yield opportunities through Arc protocol
2. **Staking**: Stake tokens for rewards
3. **Liquidity Provision**: Provide liquidity to earn fees

## 🛠️ Development

### Project Structure
```
Arc_Cross_Chain/
├── src/
│   ├── app/                 # Next.js App Router pages
│   ├── components/          # React components
│   │   ├── wallet/         # Wallet-specific components
│   │   └── layout/         # Layout components
│   ├── context/            # React context providers
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility libraries and services
│   │   ├── mocks/          # Mock implementations for development
│   │   ├── circle.ts       # Circle Wallet service
│   │   ├── cctp.ts         # CCTP service
│   │   ├── gateway.ts      # Gateway service
│   │   └── arc.ts          # Arc protocol service
│   ├── store/              # Zustand state management
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Utility functions
├── public/                 # Static assets
└── docs/                   # Documentation
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checks

### Mock Services
The application includes comprehensive mock implementations for all external services:
- **Circle Wallet SDK**: Mock wallet creation, balance checking, and transactions
- **CCTP SDK**: Mock cross-chain transfer functionality
- **Gateway SDK**: Mock route optimization and execution
- **Arc SDK**: Mock DeFi yield and staking operations

## 🔒 Security Features

### Current Implementation
- **Transaction Validation**: Input validation for addresses and amounts
- **Error Handling**: Comprehensive error handling and user feedback
- **Type Safety**: Full TypeScript implementation

### Production Considerations
- **Rate Limiting**: Implement request rate limiting
- **User Authentication**: Add proper user authentication flows
- **Transaction Signing**: Implement secure transaction signing
- **Audit Trails**: Add comprehensive logging and monitoring

## 🌐 Supported Networks

| Network | Chain ID | Native Currency | USDC Contract |
|---------|----------|-----------------|---------------|
| Ethereum | 1 | ETH | 0xA0b86a33E6417c4c8e9C2a2a9e1b17a7C01536E7 |
| Polygon | 137 | MATIC | 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174 |
| Arbitrum | 42161 | ETH | 0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8 |
| Optimism | 10 | ETH | 0x7F5c764cBc14f9669B88837ca1490cCa17c31607 |
| Avalanche | 43114 | AVAX | 0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E |

## 🔗 API Integration

### Circle Wallets API
- Wallet creation and management
- Balance queries
- Transaction execution
- Message signing

### CCTP API
- Cross-chain burn transactions
- Attestation retrieval
- Cross-chain mint transactions
- Transfer status tracking

### Gateway API
- Route optimization
- Multi-protocol support
- Gas fee estimation
- Transaction execution

### Arc Protocol API
- Yield opportunity discovery
- Staking operations
- Reward claiming
- Portfolio management

## 📊 State Management

### Zustand Store
The application uses Zustand for state management with the following stores:
- **Wallet Store**: User wallets, balances, and transactions
- **UI Store**: Loading states, errors, and notifications

### Data Flow
1. User interactions trigger actions
2. Actions call service methods
3. Services update the store
4. Components react to store changes
5. UI updates reflect new state

## 🧪 Testing

### Test Structure
```bash
npm run test        # Run all tests
npm run test:watch  # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

### Testing Strategy
- **Unit Tests**: Individual component and function testing
- **Integration Tests**: Service integration testing
- **E2E Tests**: Full user flow testing

## 🚢 Deployment

### Production Build
```bash
npm run build
```

### Environment Variables
Ensure all production environment variables are configured:
- API keys for all services
- Network configurations
- Security settings

### Docker Support
```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Production stage
FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

- **Documentation**: [docs/](docs/)
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions

## 🙏 Acknowledgments

- **Circle**: For providing the wallet infrastructure and CCTP protocol
- **Gateway**: For cross-chain optimization services
- **Arc Protocol**: For DeFi integration capabilities
- **Community**: For feedback and contributions

---

Built with ❤️ for the DeFi community