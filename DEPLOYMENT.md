# Vercel Deployment Guide for Arc Cross-Chain Wallet

## Prerequisites
- Vercel account (sign up at https://vercel.com)
- Circle Developer account with API keys
- PostgreSQL database (recommended: Vercel Postgres or Supabase)

## Step 1: Install Vercel CLI (Optional)
```bash
npm install -g vercel
```

## Step 2: Prepare Environment Variables

You'll need to set these environment variables in Vercel:

### Required Variables:
- `CIRCLE_API_KEY` - Your Circle API key (from Circle Console)
- `CIRCLE_CLIENT_KEY` - Your Circle client key
- `CIRCLE_ENTITY_SECRET` - Your Circle entity secret (64-char hex)
- `CIRCLE_BASE_URL` - https://api.circle.com
- `DATABASE_URL` - PostgreSQL connection string

### Optional Variables:
- `GATEWAY_API_KEY` - Gateway.fm API key (if using Gateway)
- `ARC_API_KEY` - Arc Protocol API key (if needed)
- `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` - WalletConnect project ID

## Step 3: Deploy via Vercel Dashboard

### Method 1: Connect GitHub Repository (Recommended)

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your GitHub repository: `sivakalathi01/Arc-Cross-Chain-Circle-Wallet`
4. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

5. Add Environment Variables:
   - Click "Environment Variables"
   - Add all required variables from `.env.example`
   - Select which environments (Production, Preview, Development)

6. Click "Deploy"

### Method 2: Deploy via Vercel CLI

```bash
# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Follow prompts to configure environment variables
```

## Step 4: Configure Database

### Option 1: Vercel Postgres (Recommended)
1. Go to your project in Vercel Dashboard
2. Click "Storage" tab
3. Click "Create Database" → Select "Postgres"
4. Vercel will automatically add `DATABASE_URL` to your environment variables

### Option 2: External PostgreSQL (Supabase, Railway, etc.)
1. Create a PostgreSQL database on your preferred platform
2. Get the connection string
3. Add it to Vercel environment variables as `DATABASE_URL`

## Step 5: Run Database Migrations

After deployment, you may need to initialize your database schema. The app will gracefully fallback to in-memory storage if the database is not available.

To set up the database schema:
```sql
CREATE TABLE wallets (
    id VARCHAR(255) PRIMARY KEY,
    address VARCHAR(255) NOT NULL,
    blockchain VARCHAR(50) NOT NULL,
    account_type VARCHAR(50) NOT NULL,
    wallet_set_id VARCHAR(255),
    name VARCHAR(255),
    state VARCHAR(50),
    custodian_type VARCHAR(50),
    ref_id VARCHAR(255),
    user_id VARCHAR(255),
    metadata JSONB,
    create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_wallets_address ON wallets(address);
CREATE INDEX idx_wallets_user_id ON wallets(user_id);
```

## Step 6: Verify Deployment

1. Visit your deployment URL (e.g., `https://your-project.vercel.app`)
2. Check that the wallet creation works
3. Test cross-chain transfers
4. Verify database connectivity

## Environment Variable Setup in Vercel

Go to: Project Settings → Environment Variables

Add these variables:

```
CIRCLE_API_KEY = TEST_API_KEY:xxxxx...
CIRCLE_CLIENT_KEY = TEST_CLIENT_KEY:xxxxx...
CIRCLE_ENTITY_SECRET = your_64_character_hex_string
CIRCLE_BASE_URL = https://api.circle.com
DATABASE_URL = postgresql://user:pass@host:5432/dbname
```

## Automatic Deployments

Once connected to GitHub:
- Push to `main` branch → Deploys to Production
- Push to other branches → Creates Preview deployments
- Pull requests → Automatic preview deployments

## Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

## Monitoring

- View logs: Project Dashboard → Deployments → Click deployment → Logs
- Analytics: Project Dashboard → Analytics
- Edge Functions: Automatic with Next.js API routes

## Troubleshooting

### Build Fails
- Check build logs in Vercel Dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

### Environment Variables Not Working
- Redeploy after adding environment variables
- Check variable names match exactly
- Environment variables are only available server-side unless prefixed with `NEXT_PUBLIC_`

### Database Connection Issues
- Verify `DATABASE_URL` format
- Check database allows connections from Vercel IPs
- App will fallback to in-memory storage if database fails

### Circle API Errors
- Verify API keys are correct
- Check Circle API status
- Review Circle API rate limits

## Production Checklist

- [ ] Environment variables configured
- [ ] Database connected and schema created
- [ ] Circle API keys verified (use production keys for prod)
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active (automatic with Vercel)
- [ ] Analytics enabled
- [ ] Error monitoring set up

## Support

- Vercel Docs: https://vercel.com/docs
- Circle Docs: https://developers.circle.com/
- Project Issues: https://github.com/sivakalathi01/Arc-Cross-Chain-Circle-Wallet/issues
