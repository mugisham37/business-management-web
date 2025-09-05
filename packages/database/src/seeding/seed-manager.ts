import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { getDatabaseConfig } from '../config';
import { DatabaseError } from '../errors/error-utils';
import { PrismaClient } from '../generated/prisma';
import { logger } from '../logging/winston-logger';

export interface SeedData {
  name: string;
  version: string;
  data: any;
  dependencies?: string[];
}

export interface SeedResult {
  name: string;
  success: boolean;
  error?: string;
  duration: number;
}

export class SeedManager {
  private prisma: PrismaClient;
  private drizzleDb: any;
  private seeds: Map<string, SeedData> = new Map();
  private executed: Set<string> = new Set();

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

  registerSeed(seed: SeedData): void {
    this.seeds.set(seed.name, seed);
    logger.info(`Registered seed: ${seed.name} (v${seed.version})`);
  }

  async runSeed(name: string): Promise<SeedResult> {
    const startTime = Date.now();

    try {
      const seed = this.seeds.get(name);
      if (!seed) {
        throw new DatabaseError(`Seed not found: ${name}`, 'SEED_NOT_FOUND');
      }

      // Check dependencies
      if (seed.dependencies) {
        for (const dep of seed.dependencies) {
          if (!this.executed.has(dep)) {
            await this.runSeed(dep);
          }
        }
      }

      logger.info(`Running seed: ${name}`);

      // Execute seed data
      await this.executeSeedData(seed);

      this.executed.add(name);
      const duration = Date.now() - startTime;

      logger.info(`Seed completed: ${name} (${duration}ms)`);

      return {
        name,
        success: true,
        duration,
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      const errorMessage = error.message || 'Unknown error';

      logger.error(`Seed failed: ${name} - ${errorMessage}`);

      return {
        name,
        success: false,
        error: errorMessage,
        duration,
      };
    }
  }

  async runAllSeeds(): Promise<SeedResult[]> {
    const results: SeedResult[] = [];

    // Sort seeds by dependencies
    const sortedSeeds = this.topologicalSort();

    for (const seedName of sortedSeeds) {
      const result = await this.runSeed(seedName);
      results.push(result);

      if (!result.success) {
        logger.error(`Stopping seed execution due to failure in: ${seedName}`);
        break;
      }
    }

    return results;
  }

  private async executeSeedData(seed: SeedData): Promise<void> {
    // This is a simplified implementation
    // In a real scenario, you would have specific seed executors

    if (typeof seed.data === 'function') {
      await seed.data(this.prisma, this.drizzleDb);
    } else if (Array.isArray(seed.data)) {
      // Handle array of data
      for (const item of seed.data) {
        await this.processSeedItem(item);
      }
    } else {
      await this.processSeedItem(seed.data);
    }
  }

  private async processSeedItem(item: any): Promise<void> {
    // Process individual seed items
    // This would be implemented based on your specific needs
    logger.debug('Processing seed item:', item);
  }

  private topologicalSort(): string[] {
    const visited = new Set<string>();
    const visiting = new Set<string>();
    const result: string[] = [];

    const visit = (name: string) => {
      if (visiting.has(name)) {
        throw new DatabaseError(`Circular dependency detected: ${name}`, 'CIRCULAR_DEPENDENCY');
      }

      if (visited.has(name)) {
        return;
      }

      visiting.add(name);

      const seed = this.seeds.get(name);
      if (seed?.dependencies) {
        for (const dep of seed.dependencies) {
          visit(dep);
        }
      }

      visiting.delete(name);
      visited.add(name);
      result.push(name);
    };

    for (const seedName of this.seeds.keys()) {
      visit(seedName);
    }

    return result;
  }

  async cleanup(): Promise<void> {
    await this.prisma.$disconnect();
    logger.info('Seed manager cleanup completed');
  }
}
