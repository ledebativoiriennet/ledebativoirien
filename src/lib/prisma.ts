import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import Database from 'better-sqlite3';

// Use better-sqlite3 directly with WAL mode + busy_timeout to handle
// concurrent access between deployment versions on Hostinger.
// SQLITE_READONLY_CANTINIT (1032) is caused by two Node.js processes
// opening the same database simultaneously during a rolling deployment.
function createPrismaClient(): PrismaClient {
  const dbUrl = process.env.DATABASE_URL || 'file:./dev.db';
  // Strip "file:" prefix and query parameters to get the raw file path
  const dbPath = dbUrl.replace(/^file:/, '').split('?')[0];

  try {
    const sqlite = new Database(dbPath, { timeout: 15000 });
    // WAL mode: allows concurrent reads while serializing writes
    sqlite.pragma('journal_mode = WAL');
    // Wait up to 15s if DB is locked by another writer (e.g. old deployment)
    sqlite.pragma('busy_timeout = 15000');
    sqlite.close();
  } catch {
    // If we can't open it (e.g. file doesn't exist yet), let Prisma handle it
  }

  return new PrismaClient();
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
