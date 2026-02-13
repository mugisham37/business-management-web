import 'reflect-metadata';
import { fc } from '@fast-check/jest';

// Configure fast-check globally for all property-based tests
fc.configureGlobal({
  numRuns: 100, // Run each property test 100 times
  verbose: true,
  seed: Date.now(), // Use current timestamp as seed for reproducibility
});
