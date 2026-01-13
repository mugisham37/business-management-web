#!/usr/bin/env node

/**
 * Script to fix remaining TypeScript errors in mobile services
 * This script handles:
 * 1. Error type assertions in catch blocks
 * 2. Cache API calls (convert number to CacheOptions)
 * 3. Index signatures for dynamic object access
 * 4. Null safety checks
 */

const fs = require('fs');
const path = require('path');

// Files and their error locations
const filesToFix = {
  'intelligent-sync-scheduler.service.ts': {
    errorLines: [199, 287, 293, 330, 786],
    cacheLines: [741],
    indexLines: [590],
    types: 'catch'
  },
  'location-based.service.ts': {
    errorLines: [118, 265],
    cacheLines: [509],
    nullCheckLines: [417, 419, 420, 430, 432, 433, 545],
    types: 'catch'
  },
  'mobile-optimization.service.ts': {
    errorLines: [104],
    indexLines: [137, 163, 191],
    types: 'catch'
  },
  'offline-data-sync.service.ts': {
    errorLines: [221, 228, 294, 295],
    cacheLines: [376],
    indexLines: [395, 396],
    nullCheckLines: [170, 171, 174, 175, 177, 180, 183, 184, 185, 186, 191],
    types: 'catch'
  },
  'payload-compression.service.ts': {
    errorLines: [89, 121],
    types: 'catch'
  },
  'progressive-loading.service.ts': {
    errorLines: [122, 187, 254, 274],
    cacheLines: [99],
    indexLines: [290, 298],
    types: 'catch'
  },
  'push-notification.service.ts': {
    errorLines: [113, 116, 151, 154, 207, 225, 349, 352, 484],
    cacheLines: [294, 299, 307],
    nullCheckLines: [318],
    types: 'catch'
  }
};

function fixErrorHandling(content, filename) {
  // Pattern to match: this.logger.error(`...${error.message}...`, error.stack);
  const errorPattern = /this\.logger\.error\(`([^`]*)\$\{error\.message\}([^`]*)`\s*,\s*error\.stack\)/g;
  
  let fixed = content;
  let matches = [...content.matchAll(errorPattern)];
  
  for (const match of matches) {
    const before = match[1];
    const after = match[2];
    const original = match[0];
    const replacement = `const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(\`${before}\${errorMessage}${after}\`, errorStack)`;
    
    fixed = fixed.replace(original, replacement);
  }
  
  return fixed;
}

function fixCacheAPICalls(content) {
  // Pattern: this.cacheService.set(key, value, number);
  // Replace with: this.cacheService.set(key, value, { ttl: number });
  const cachePattern = /\.set\(([^,]+),\s*([^,]+),\s*(\d+)\s*\)/g;
  
  let fixed = content;
  fixed = fixed.replace(cachePattern, '.set($1, $2, { ttl: $3 })');
  
  return fixed;
}

function addIndexSignatures(content, filename) {
  // This requires more context-aware fixes
  // For now, we'll handle the common patterns
  
  let fixed = content;
  
  if (filename.includes('mobile-optimization')) {
    // Fix the settings object access patterns
    fixed = fixed.replace(
      /const settings = \{\};/g,
      'const settings: Record<string, any> = {};'
    );
  }
  
  if (filename.includes('offline-data-sync')) {
    // Fix the dataSize object access
    fixed = fixed.replace(
      /const dataSize = \{([^}]*)\};/,
      'const dataSize: Record<string, number> = {$1};'
    );
  }
  
  return fixed;
}

function fixNullChecks(content, filename) {
  let fixed = content;
  
  if (filename.includes('location-based')) {
    // Fix geofence array access
    fixed = fixed.replace(
      /await\s+this\.cacheService\.get<GeofenceArea\[\]>\(/g,
      'const geofences = await this.cacheService.get<GeofenceArea[]>('
    );
  }
  
  return fixed;
}

// Main execution
const serviceDir = path.join(__dirname, 'src/modules/mobile/services');

console.log('Fixing remaining TypeScript errors in mobile services...\n');

// Note: This script provides a foundation for automated fixes
// Some fixes require more context-aware processing than regex can provide
// Those will need manual verification

console.log('✓ Script created as template for remaining fixes');
console.log('✓ Manual fixes required for complex type safety issues');
console.log('\nNext steps:');
console.log('1. Review each file for remaining errors');
console.log('2. Apply context-aware fixes based on error messages');
console.log('3. Test compilation with: npm run build');
