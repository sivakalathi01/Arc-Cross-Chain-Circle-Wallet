// Database service for wallet persistence
import { Pool, QueryResult } from 'pg';

interface Wallet {
  id: string;
  address: string;
  blockchain: string;
  accountType: string;
  walletSetId?: string;
  name?: string;
  state?: string;
  custodianType?: string;
  refId?: string;
  userId?: string;
  createDate: Date;
  updateDate: Date;
  metadata?: any;
}

class DatabaseService {
  private pool: Pool | null = null;

  constructor() {
    this.initPool();
  }

  private initPool() {
    if (!process.env.DATABASE_URL) {
      console.warn('⚠️  DATABASE_URL not configured - database features disabled');
      return;
    }

    try {
      this.pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000, // Increased to 10 seconds
        keepAlive: true,
        keepAliveInitialDelayMillis: 10000,
      });

      this.pool.on('error', (err) => {
        console.error('💥 Unexpected database error:', err);
      });

      console.log('🗄️  Database connection pool initialized');
    } catch (error) {
      console.error('❌ Failed to initialize database pool:', error);
      this.pool = null;
    }
  }

  isAvailable(): boolean {
    return this.pool !== null;
  }

  async testConnection(): Promise<boolean> {
    if (!this.pool) return false;

    try {
      const result = await this.pool.query('SELECT NOW()');
      console.log('✅ Database connection test successful');
      return true;
    } catch (error) {
      console.error('❌ Database connection test failed:', error);
      return false;
    }
  }

  // Wallet operations
  async createWallet(wallet: Omit<Wallet, 'createDate' | 'updateDate'>): Promise<Wallet> {
    if (!this.pool) {
      throw new Error('Database not available');
    }

    const query = `
      INSERT INTO wallets (
        id, address, blockchain, account_type, wallet_set_id, 
        name, state, custodian_type, ref_id, user_id, metadata
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const values = [
      wallet.id,
      wallet.address,
      wallet.blockchain,
      wallet.accountType,
      wallet.walletSetId || null,
      wallet.name || null,
      wallet.state || 'LIVE',
      wallet.custodianType || 'DEVELOPER',
      wallet.refId || null,
      wallet.userId || null,
      wallet.metadata ? JSON.stringify(wallet.metadata) : null,
    ];

    try {
      const result = await this.pool.query(query, values);
      console.log(`💾 Wallet saved to database: ${wallet.id}`);
      return this.mapDbRowToWallet(result.rows[0]);
    } catch (error) {
      console.error('❌ Failed to save wallet to database:', error);
      throw error;
    }
  }

  async getWallet(id: string): Promise<Wallet | null> {
    if (!this.pool) {
      throw new Error('Database not available');
    }

    const query = 'SELECT * FROM wallets WHERE id = $1';
    
    try {
      const result = await this.pool.query(query, [id]);
      if (result.rows.length === 0) return null;
      return this.mapDbRowToWallet(result.rows[0]);
    } catch (error) {
      console.error('❌ Failed to get wallet from database:', error);
      throw error;
    }
  }

  async getAllWallets(userId?: string): Promise<Wallet[]> {
    if (!this.pool) {
      throw new Error('Database not available');
    }

    let query = 'SELECT * FROM wallets';
    const values: any[] = [];

    if (userId) {
      query += ' WHERE user_id = $1';
      values.push(userId);
    }

    query += ' ORDER BY create_date DESC';

    try {
      const result = await this.pool.query(query, values);
      console.log(`📂 Retrieved ${result.rows.length} wallet(s) from database`);
      return result.rows.map(row => this.mapDbRowToWallet(row));
    } catch (error) {
      console.error('❌ Failed to get wallets from database:', error);
      throw error;
    }
  }

  async updateWallet(id: string, updates: Partial<Wallet>): Promise<Wallet> {
    if (!this.pool) {
      throw new Error('Database not available');
    }

    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.address) {
      fields.push(`address = $${paramCount++}`);
      values.push(updates.address);
    }
    if (updates.name) {
      fields.push(`name = $${paramCount++}`);
      values.push(updates.name);
    }
    if (updates.state) {
      fields.push(`state = $${paramCount++}`);
      values.push(updates.state);
    }
    if (updates.metadata) {
      fields.push(`metadata = $${paramCount++}`);
      values.push(JSON.stringify(updates.metadata));
    }

    fields.push(`update_date = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE wallets 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    try {
      const result = await this.pool.query(query, values);
      if (result.rows.length === 0) {
        throw new Error(`Wallet not found: ${id}`);
      }
      console.log(`✏️  Wallet updated in database: ${id}`);
      return this.mapDbRowToWallet(result.rows[0]);
    } catch (error) {
      console.error('❌ Failed to update wallet in database:', error);
      throw error;
    }
  }

  async deleteWallet(id: string): Promise<boolean> {
    if (!this.pool) {
      throw new Error('Database not available');
    }

    const query = 'DELETE FROM wallets WHERE id = $1';

    try {
      const result = await this.pool.query(query, [id]);
      const deleted = Boolean(result.rowCount && result.rowCount > 0);
      if (deleted) {
        console.log(`🗑️  Wallet deleted from database: ${id}`);
      }
      return deleted;
    } catch (error) {
      console.error('❌ Failed to delete wallet from database:', error);
      throw error;
    }
  }

  private mapDbRowToWallet(row: any): Wallet {
    return {
      id: row.id,
      address: row.address,
      blockchain: row.blockchain,
      accountType: row.account_type,
      walletSetId: row.wallet_set_id,
      name: row.name,
      state: row.state,
      custodianType: row.custodian_type,
      refId: row.ref_id,
      userId: row.user_id,
      createDate: row.create_date,
      updateDate: row.update_date,
      metadata: row.metadata,
    };
  }

  async close() {
    if (this.pool) {
      await this.pool.end();
      console.log('🔌 Database connection pool closed');
    }
  }
}

// Singleton instance
export const db = new DatabaseService();
