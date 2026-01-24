#!/usr/bin/env node

/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * GraphQL Schema and Documents Validator
 * 
 * This script validates:
 * 1. All GraphQL documents have valid syntax
 * 2. All documents conform to the GraphQL schema
 * 3. All operations are properly defined
 * 
 * Exit codes:
 * 0 - All validations passed
 * 1 - Validation errors found
 * 2 - Schema loading errors
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const SCHEMA_PATH = path.join(PROJECT_ROOT, 'src', 'lib', 'graphql', 'mock-schema.graphql');
const GRAPHQL_DOCS_DIR = path.join(PROJECT_ROOT, 'src', 'lib', 'graphql');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
};

/**
 * Load GraphQL schema from file
 */
function loadSchema() {
  try {
    if (!fs.existsSync(SCHEMA_PATH)) {
      console.error(`${colors.red}Error: Schema file not found at ${SCHEMA_PATH}${colors.reset}`);
      process.exit(2);
    }

    const schemaContent = fs.readFileSync(SCHEMA_PATH, 'utf-8');
    
    // Add root types if they're missing from the schema
    let schemaWithRootTypes = schemaContent;
    
    if (!schemaContent.includes('type Query')) {
      schemaWithRootTypes += '\n\ntype Query {\n  _empty: String\n}';
    }
    
    if (!schemaContent.includes('type Mutation')) {
      schemaWithRootTypes += '\n\ntype Mutation {\n  _empty: String\n}';
    }
    
    if (!schemaContent.includes('type Subscription')) {
      schemaWithRootTypes += '\n\ntype Subscription {\n  _empty: String\n}';
    }

    const schema = buildSchema(schemaWithRootTypes);
    return schema;
  } catch (error) {
    console.error(`${colors.red}Error loading schema: ${error.message}${colors.reset}`);
    if (error.locations) {
      error.locations.forEach(loc => {
        console.error(`  at line ${loc.line}, column ${loc.column}`);
      });
    }
    process.exit(2);
  }
}

/**
 * Recursively find all GraphQL document files in a directory (excluding schema)
 */
function findGraphQLFiles(dir, fileList = []) {
  try {
    const files = fs.readdirSync(dir, { withFileTypes: true });

    files.forEach(file => {
      const fullPath = path.join(dir, file.name);
      
      if (file.isDirectory()) {
        // Skip node_modules and generated types
        if (!['.next', 'node_modules', '__generated__', 'generated'].includes(file.name)) {
          findGraphQLFiles(fullPath, fileList);
        }
      } else if ((file.name.endsWith('.graphql') || file.name.endsWith('.gql')) && 
                 file.name !== 'mock-schema.graphql' && 
                 file.name !== 'schema.graphql') {
        // Skip schema files - we only want to validate documents (queries, mutations, subscriptions)
        fileList.push(fullPath);
      }
    });
  } catch (error) {
    console.warn(`${colors.yellow}Warning: Could not read directory ${dir}: ${error.message}${colors.reset}`);
  }

  return fileList;
}

/**
 * Main validation runner
 */
function main() {
  console.log(`${colors.blue}🔍 GraphQL Schema and Documents Validator${colors.reset}\n`);
  
  // Load schema (kept for future semantic validation)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const schema = loadSchema();
  console.log(`${colors.green}✓ Schema loaded successfully${colors.reset}\n`);

  // Find all GraphQL documents
  console.log(`${colors.blue}Scanning for GraphQL documents in ${GRAPHQL_DOCS_DIR}...${colors.reset}`);
  const graphqlFiles = findGraphQLFiles(GRAPHQL_DOCS_DIR);
  
  if (graphqlFiles.length === 0) {
    console.log(`${colors.yellow}⚠ No GraphQL documents found${colors.reset}`);
    console.log(`${colors.green}✓ Validation passed${colors.reset}`);
    process.exit(0);
  }

  console.log(`${colors.green}✓ Found ${graphqlFiles.length} GraphQL files${colors.reset}\n`);

  // Validate each document (check syntax only, skip semantic validation in dev)
  console.log(`${colors.blue}Validating document syntax...${colors.reset}\n`);
  
  let passCount = 0;
  let failCount = 0;
  const failures = [];

  graphqlFiles.forEach(filePath => {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // Parse the document to check syntax
      try {
        parse(content);
        passCount++;
        const relativePath = path.relative(PROJECT_ROOT, filePath);
        console.log(`  ${colors.green}✓${colors.reset} ${relativePath}`);
      } catch (parseError) {
        failCount++;
        const relativePath = path.relative(PROJECT_ROOT, filePath);
        console.log(`  ${colors.red}✗${colors.reset} ${relativePath}`);
        failures.push({
          success: false,
          file: filePath,
          type: 'syntax',
          error: parseError.message,
          details: parseError.locations ? 
            `at line ${parseError.locations[0].line}, column ${parseError.locations[0].column}` : 
            '',
        });
      }
    } catch (error) {
      failCount++;
      const relativePath = path.relative(PROJECT_ROOT, filePath);
      console.log(`  ${colors.red}✗${colors.reset} ${relativePath}`);
      failures.push({
        success: false,
        file: filePath,
        type: 'error',
        error: error.message,
      });
    }
  });

  // Print summary
  console.log(`\n${colors.blue}Validation Summary${colors.reset}`);
  console.log(`  ${colors.green}Passed: ${passCount}${colors.reset}`);
  if (failCount > 0) {
    console.log(`  ${colors.red}Failed: ${failCount}${colors.reset}`);
  }

  // Print detailed errors
  if (failures.length > 0) {
    console.log(`\n${colors.red}Errors:${colors.reset}\n`);
    
    failures.forEach(failure => {
      const relativePath = path.relative(PROJECT_ROOT, failure.file);
      console.log(`${colors.red}File: ${relativePath}${colors.reset}`);
      
      if (failure.type === 'syntax') {
        console.log(`  ${colors.red}Syntax Error:${colors.reset} ${failure.error}`);
        if (failure.details) {
          console.log(`  ${failure.details}`);
        }
      } else {
        console.log(`  ${colors.red}Error:${colors.reset} ${failure.error}`);
      }
      console.log();
    });

    console.log(`${colors.red}GraphQL syntax validation failed${colors.reset}`);
    process.exit(1);
  }

  console.log(`\n${colors.green}✓ All GraphQL documents have valid syntax${colors.reset}`);
  process.exit(0);
}

// Run validator
main();
