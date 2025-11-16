// Database initialization script
const { Client } = require('pg');

// Parse DATABASE_URL from .env
require('dotenv').config();

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error('❌ DATABASE_URL not found in .env file');
  process.exit(1);
}

// Parse the connection string
const match = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
if (!match) {
  console.error('❌ Invalid DATABASE_URL format');
  process.exit(1);
}

const [, user, password, host, port, database] = match;

async function initDatabase() {
  console.log('🔧 Initializing Arc Wallet Database...\n');

  // First, connect to postgres database to create our database
  const adminClient = new Client({
    user,
    password,
    host,
    port,
    database: 'postgres'
  });

  try {
    await adminClient.connect();
    console.log('✅ Connected to PostgreSQL server');

    // Create database if it doesn't exist
    const checkDbQuery = `SELECT 1 FROM pg_database WHERE datname = '${database}'`;
    const dbExists = await adminClient.query(checkDbQuery);

    if (dbExists.rows.length === 0) {
      console.log(`📦 Creating database: ${database}...`);
      await adminClient.query(`CREATE DATABASE ${database}`);
      console.log(`✅ Database '${database}' created`);
    } else {
      console.log(`ℹ️  Database '${database}' already exists`);
    }

    await adminClient.end();

    // Now connect to the actual database and create tables
    const client = new Client({
      user,
      password,
      host,
      port,
      database
    });

    await client.connect();
    console.log(`✅ Connected to database: ${database}\n`);

    // Create wallets table
    console.log('📋 Creating wallets table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS wallets (
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
        create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        update_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        metadata JSONB
      )
    `);
    console.log('✅ Wallets table created');

    // Create index on address for faster lookups
    console.log('📋 Creating indexes...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_wallets_address ON wallets(address);
      CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
      CREATE INDEX IF NOT EXISTS idx_wallets_create_date ON wallets(create_date DESC);
    `);
    console.log('✅ Indexes created');

    // Create wallet_balances table (for future use)
    console.log('📋 Creating wallet_balances table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS wallet_balances (
        id SERIAL PRIMARY KEY,
        wallet_id VARCHAR(255) REFERENCES wallets(id) ON DELETE CASCADE,
        token_symbol VARCHAR(50) NOT NULL,
        token_address VARCHAR(255),
        amount VARCHAR(255) NOT NULL,
        blockchain VARCHAR(50) NOT NULL,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(wallet_id, token_symbol, blockchain)
      )
    `);
    console.log('✅ Wallet balances table created');

    // Create transactions table (for future use)
    console.log('📋 Creating transactions table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id VARCHAR(255) PRIMARY KEY,
        wallet_id VARCHAR(255) REFERENCES wallets(id) ON DELETE CASCADE,
        tx_hash VARCHAR(255),
        transaction_type VARCHAR(50),
        state VARCHAR(50),
        blockchain VARCHAR(50),
        source_address VARCHAR(255),
        destination_address VARCHAR(255),
        amount VARCHAR(255),
        token_symbol VARCHAR(50),
        fee VARCHAR(255),
        create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        update_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        metadata JSONB
      )
    `);
    console.log('✅ Transactions table created');

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_transactions_wallet_id ON transactions(wallet_id);
      CREATE INDEX IF NOT EXISTS idx_transactions_tx_hash ON transactions(tx_hash);
      CREATE INDEX IF NOT EXISTS idx_transactions_create_date ON transactions(create_date DESC);
    `);
    console.log('✅ Transaction indexes created');

    await client.end();

    console.log('\n✨ Database initialization complete!');
    console.log('\n📊 Database Summary:');
    console.log(`   Host: ${host}:${port}`);
    console.log(`   Database: ${database}`);
    console.log(`   Tables: wallets, wallet_balances, transactions`);
    console.log('\n🚀 Your app is now ready to use PostgreSQL!\n');

  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
}

initDatabase();
