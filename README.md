# Arc Cross Chain Wallet

A comprehensive DeFi Cross Chain application with embedded wallet experience using Circle Wallets, CCTP, Gateway, and Arc protocols.

## 🌟 Features

### Core Functionality
- **Developer-Controlled Wallets**: Fully functional wallet creation using Circle's Developer-Controlled Wallets API
- **RSA-OAEP Encryption**: Secure entity secret encryption for wallet operations
- **Smart Contract Accounts (SCA)**: Enhanced security and programmable wallet functionality
- **Multi-Chain Support**: Ethereum Sepolia testnet (extensible to mainnet and other chains)
- **Real-time Wallet Management**: Create, store, and manage wallets with persistent storage

### Technical Features
- **Direct Circle API Integration**: Bypassed SDK for full control and flexibility
- **Server-Side Encryption**: Node.js crypto module for RSA-OAEP encryption with SHA-256
- **In-Memory Wallet Storage**: Fast wallet retrieval (ready for database integration)
- **Next.js 14 API Routes**: Server-side wallet operations with runtime: 'nodejs'
- **Cross-Platform UUID**: Compatible UUID generation for browser and server
- **Automatic Entity Secret Setup**: Self-configuring encryption workflow

## 🏗️ Architecture

### Frontend Stack
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Zustand**: State management
- **React Query**: Server state management
- **Framer Motion**: Animations and transitions

### Integration Partners
- **Circle Developer-Controlled Wallets**: Programmable wallet infrastructure
- **Circle W3S API**: Direct API integration for wallet management
- **Wagmi v1**: Ethereum React hooks for web3 connectivity

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
   
   Create a `.env` file in the root directory:
   ```env
   # Circle Developer-Controlled Wallets Configuration
   CIRCLE_API_KEY=your_circle_api_key_here
   CIRCLE_ENTITY_SECRET=your_64_char_hex_entity_secret_here
   ```
   
   **To get your Circle API credentials:**
   - Sign up at [Circle Developer Console](https://console.circle.com/)
   - Navigate to Developer-Controlled Wallets
   - Copy your API Key
   - Generate an Entity Secret (64-character hex string)
   
   **To generate an Entity Secret:**
   ```bash
   node scripts/generate-circle-entity-secret.js
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📱 Usage

### Wallet Management
1. **Create Wallet**: Click "Create Wallet" button and provide a wallet name
2. **View Wallets**: See all created wallets with their blockchain addresses
3. **Wallet Details**: Each wallet displays its ID, blockchain, and creation date

### Current Features
- ✅ Wallet creation with Circle Developer API
- ✅ Automatic wallet set management
- ✅ RSA-OAEP entity secret encryption
- ✅ In-memory wallet storage and retrieval
- 🔄 Transaction functionality (coming soon)
- 🔄 Balance checking (coming soon)
- 🔄 Cross-chain transfers (coming soon)

## 🛠️ Development

### Project Structure
```
Arc_Cross_Chain/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── wallets/        # Wallet API routes (POST/GET)
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Main dashboard
│   │   └── providers.tsx       # Wagmi provider
│   ├── components/
│   │   ├── wallet/
│   │   │   ├── CreateWalletModal.tsx
│   │   │   ├── WalletCard.tsx
│   │   │   └── WalletDashboard.tsx
│   │   └── layout/             # Header, Footer components
│   ├── lib/
│   │   ├── circle-direct.ts    # Direct Circle API client
│   │   ├── circle-working.ts   # Frontend Circle service
│   │   ├── wallet-storage.ts   # In-memory wallet storage
│   │   └── wagmi.ts            # Wagmi configuration
│   ├── types/                  # TypeScript definitions
│   └── context/                # React context
├── scripts/
│   └── generate-circle-entity-secret.js
├── doc/                        # Documentation files
└── .env                        # Environment variables
```

### Available Scripts
- `npm run dev` - Start development server (port 3000)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `node scripts/generate-circle-entity-secret.js` - Generate entity secret

## 🔒 Security Implementation

### Encryption & Security
- **RSA-OAEP Encryption**: Entity secrets encrypted with RSA_PKCS1_OAEP_PADDING and SHA-256
- **Server-Side Operations**: All sensitive operations run in Node.js runtime
- **Environment Variables**: Secrets stored in `.env` (excluded from git)
- **Public Key Fetching**: Dynamic retrieval of Circle's RSA public key
- **Base64 Encoding**: Encrypted ciphertext transmitted as base64

### Production Considerations
- [ ] Replace in-memory storage with database (PostgreSQL/MongoDB)
- [ ] Add user authentication and authorization
- [ ] Implement rate limiting on API routes
- [ ] Add comprehensive error logging and monitoring
- [ ] Set up wallet access controls
- [ ] Implement transaction signing flows

## 🌐 Supported Networks

Currently configured for:
- **Ethereum Sepolia** (Testnet)

Easily extensible to:
- Ethereum Mainnet
- Polygon (PoS & zkEVM)
- Arbitrum One & Nova
- Optimism
- Avalanche C-Chain
- Base

## 🔗 Circle API Integration

### Wallet Operations
- **POST /v1/w3s/developer/walletSets** - Create wallet set with encrypted entity secret
- **POST /v1/w3s/developer/wallets** - Create developer-controlled wallet
- **GET /v1/w3s/config/entity/publicKey** - Fetch RSA public key for encryption

### Key Features
- Direct API calls (no SDK dependency)
- Automatic entity secret configuration
- Retry logic for entity secret setup
- Wallet set management
- Cross-platform compatible

### Documentation
See `/doc` folder for detailed implementation guides:
- `CIRCLE_ARCHITECTURE.md` - System architecture
- `CIRCLE_SETUP_GUIDE.md` - Setup instructions
- `TESTING.md` - Testing guide
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