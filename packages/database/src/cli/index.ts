#!/usr/bin/env node

import { Command } from 'commander';
import { logger } from '../logging/winston-logger';

const program = new Command();

program
  .name('db-cli')
  .description('Database CLI for managing migrations, seeds, and more')
  .version('1.0.0');

// Import and register commands
import './db-cli';

// Parse command line arguments
program.parse();

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', error => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

export { program };
