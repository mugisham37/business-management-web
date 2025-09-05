import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { getDatabaseConfig } from '../config';
import { DatabaseError } from '../errors/error-utils';
import { PrismaClient } from '../generated/prisma';
import { logger } from '../logging/winston-logger';

export interface MigrationData {
  id: string;
  name: string;
  version: string;
  up: (prisma: PrismaClient, drizzle: any) => Promise<void>;
  down: (prisma: PrismaClient, drizzle: any) => Promise<void>;
}

export interface MigrationStatus {
  appliedMigrations: number;
  pendingMigrations: number;
  schemaValid: boolean;
  lastMigration?: {
    name: string;
    version: string;
    appliedAt: Date;
  };
}

export class MigrationManager {
  private prisma: PrismaClient;
  private drizzleDb: any;
  private migrations: Map<string, MigrationData> = new Map();

  constructor() {
    this.prisma = new PrismaClient();

    const config = getDatabaseConfig();
    const pool = new Pool({
      host: config.drizzle.host,
      port: config.drizzle.port,
      database: config.drizzle.database,
      user: config.drizzle.username,
      password: config.drizzle.password,
      ssl: config.drizzle.ssl,
    });

    this.drizzleDb = drizzle(pool);
  }

  async initialize(): Promise<void> {
    await this.prisma.$connect();
    await this.ensureMigrationTable();
    logger.info('MigrationManager initialized');
  }

  async close(): Promise<void> {
    await this.prisma.$disconnect();
    logger.info('MigrationManager closed');
  }

  registerMigration(migration: MigrationData): void {
    this.migrations.set(migration.id, migration);
    logger.info(`Registered migration: ${migration.name} (${migration.version})`);
  }

  async migrate(): Promise<void> {
    const pending = await this.getPendingMigrations();

    for (const migration of pending) {
      await this.runMigration(migration);
    }

    logger.info('All migrations completed');
  }

  async rollback(migrationId?: string): Promise<void> {
    if (migrationId) {
      const migration = this.migrations.get(migrationId);
      if (!migration) {
        throw new DatabaseError(`Migration not found: ${migrationId}`, 'MIGRATION_NOT_FOUND');
      }
      await this.rollbackMigration(migration);
    } else {
      // Rollback last migration
      const lastMigration = await this.getLastAppliedMigration();
      if (lastMigration) {
        await this.rollbackMigration(lastMigration);
      }
    }
  }

  async getStatus(): Promise<MigrationStatus> {
    const appliedMigrations = await this.getAppliedMigrations();
    const pendingMigrations = await this.getPendingMigrations();

    return {
      appliedMigrations: appliedMigrations.length,
      pendingMigrations: pendingMigrations.length,
      schemaValid: true, // This would be implemented based on your validation logic
      lastMigration:
        appliedMigrations.length > 0
          ? {
              name: appliedMigrations[appliedMigrations.length - 1].name,
              version: appliedMigrations[appliedMigrations.length - 1].version,
              appliedAt: new Date(), // This would come from the migration table
            }
          : undefined,
    };
  }

  async getPendingMigrations(): Promise<MigrationData[]> {
    const appliedIds = await this.getAppliedMigrationIds();
    const pending: MigrationData[] = [];

    for (const [id, migration] of this.migrations.entries()) {
      if (!appliedIds.includes(id)) {
        pending.push(migration);
      }
    }

    return pending.sort((a, b) => a.version.localeCompare(b.version));
  }

  private async runMigration(migration: MigrationData): Promise<void> {
    logger.info(`Running migration: ${migration.name}`);

    try {
      await migration.up(this.prisma, this.drizzleDb);
      await this.recordMigration(migration);
      logger.info(`Migration completed: ${migration.name}`);
    } catch (error: any) {
      logger.error(`Migration failed: ${migration.name} - ${error.message}`);
      throw new DatabaseError(`Migration failed: ${migration.name}`, 'MIGRATION_FAILED', error);
    }
  }

  private async rollbackMigration(migration: MigrationData): Promise<void> {
    logger.info(`Rolling back migration: ${migration.name}`);

    try {
      await migration.down(this.prisma, this.drizzleDb);
      await this.removeMigrationRecord(migration);
      logger.info(`Migration rolled back: ${migration.name}`);
    } catch (error: any) {
      logger.error(`Migration rollback failed: ${migration.name} - ${error.message}`);
      throw new DatabaseError(
        `Migration rollback failed: ${migration.name}`,
        'MIGRATION_ROLLBACK_FAILED',
        error
      );
    }
  }

  private async ensureMigrationTable(): Promise<void> {
    // This would create the migration tracking table if it doesn't exist
    logger.debug('Ensuring migration table exists');
  }

  private async getAppliedMigrations(): Promise<MigrationData[]> {
    // This would query the migration table to get applied migrations
    return [];
  }

  private async getAppliedMigrationIds(): Promise<string[]> {
    // This would query the migration table to get applied migration IDs
    return [];
  }

  private async getLastAppliedMigration(): Promise<MigrationData | null> {
    const applied = await this.getAppliedMigrations();
    return applied.length > 0 ? applied[applied.length - 1] : null;
  }

  private async recordMigration(migration: MigrationData): Promise<void> {
    // This would insert a record into the migration table
    logger.debug(`Recording migration: ${migration.id}`);
  }

  private async removeMigrationRecord(migration: MigrationData): Promise<void> {
    // This would remove a record from the migration table
    logger.debug(`Removing migration record: ${migration.id}`);
  }
}
