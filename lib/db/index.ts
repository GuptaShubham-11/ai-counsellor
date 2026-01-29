import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

const globalForPg = global as unknown as { pool?: Pool };

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined!');
}

export const pool =
  globalForPg.pool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
  });

if (process.env.NODE_ENV !== 'production') globalForPg.pool = pool;

export const db = drizzle(pool);
