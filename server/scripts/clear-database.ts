import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL is not defined in environment variables');
  process.exit(1);
}

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: databaseUrl,
});

// Create Prisma adapter
const adapter = new PrismaPg(pool);

// Initialize Prisma Client with adapter
const prisma = new PrismaClient({
  adapter,
});

async function clearDatabase() {
  console.log('Starting database cleanup...');

  try {
    await prisma.$connect();
    console.log('✓ Connected to database');

    // Get all table names
    const tablenames = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename FROM pg_tables WHERE schemaname='public'
    `;

    console.log(`\nFound ${tablenames.length} tables to clear...\n`);

    // Truncate all tables except migrations
    for (const { tablename } of tablenames) {
      if (tablename !== '_prisma_migrations') {
        try {
          await prisma.$executeRawUnsafe(
            `TRUNCATE TABLE "public"."${tablename}" CASCADE;`,
          );
          console.log(`✓ Cleared table: ${tablename}`);
        } catch (error) {
          console.warn(`⚠ Failed to truncate ${tablename}:`, (error as Error).message);
        }
      }
    }

    console.log('\n✅ Database cleared successfully!');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    await pool.end();
    console.log('✓ Disconnected from database');
  }
}

clearDatabase();
