#!/usr/bin/env node

/**
 * OAuth Configuration Validator
 * Checks if social authentication is properly configured
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating OAuth Configuration...\n');

// Check environment variables
const envPath = path.join(__dirname, '../.env');
let envVars = {};

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      envVars[key.trim()] = value.trim();
    }
  });
} else {
  console.log('❌ .env file not found in web directory');
  process.exit(1);
}

// Required OAuth environment variables
const requiredVars = [
  'NEXT_PUBLIC_GOOGLE_CLIENT_ID',
  'NEXT_PUBLIC_FACEBOOK_APP_ID', 
  'NEXT_PUBLIC_GITHUB_CLIENT_ID'
];

let allConfigured = true;
let configuredProviders = [];

console.log('📋 Checking OAuth Provider Configuration:\n');

requiredVars.forEach(varName => {
  const value = envVars[varName];
  const provider = varName.split('_')[2].toLowerCase();
  
  if (value && value !== 'your_' + provider + '_client_id_here' && value !== 'your_' + provider + '_app_id_here') {
    console.log(`✅ ${provider.toUpperCase()}: Configured`);
    configuredProviders.push(provider);
  } else {
    console.log(`❌ ${provider.toUpperCase()}: Not configured (${varName})`);
    allConfigured = false;
  }
});

console.log('\n📊 Configuration Summary:');
console.log(`   Configured Providers: ${configuredProviders.length}/3`);
console.log(`   Available Providers: ${configuredProviders.join(', ') || 'None'}`);

if (configuredProviders.length > 0) {
  console.log('\n🎉 Social authentication is partially configured!');
  console.log('   Users can sign in with: ' + configuredProviders.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', '));
} else {
  console.log('\n⚠️  No OAuth providers are configured yet.');
}

console.log('\n📖 Next Steps:');
if (!allConfigured) {
  console.log('   1. Follow the setup guide in SOCIAL_AUTH_SETUP.md');
  console.log('   2. Configure OAuth apps with providers');
  console.log('   3. Update environment variables in web/.env');
  console.log('   4. Update server environment variables in server/.env');
  console.log('   5. Restart both applications');
}

console.log('   6. Test social login at http://localhost:3000/auth');

// Check if server env exists
const serverEnvPath = path.join(__dirname, '../../server/.env');
if (!fs.existsSync(serverEnvPath)) {
  console.log('\n⚠️  Server .env file not found. Copy server/.env.example to server/.env');
}

console.log('\n🔗 Useful Links:');
console.log('   • Google Cloud Console: https://console.cloud.google.com/');
console.log('   • Facebook Developers: https://developers.facebook.com/');
console.log('   • GitHub OAuth Apps: https://github.com/settings/developers');
console.log('   • Setup Guide: ./SOCIAL_AUTH_SETUP.md');

process.exit(allConfigured ? 0 : 1);