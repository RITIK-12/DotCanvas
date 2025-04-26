/** @type {import('next').NextConfig} */
const path = require('path');
const fs = require('fs');

// Try to load environment variables from root .env file
let rootEnv = {};
try {
  const rootEnvPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(rootEnvPath)) {
    const content = fs.readFileSync(rootEnvPath, 'utf8');
    const lines = content.split('\n');
    
    lines.forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        rootEnv[key] = value;
      }
    });
    
    console.log('Loaded environment variables from root .env file');
  }
} catch (error) {
  console.error('Error loading root .env:', error.message);
}

const nextConfig = {
  reactStrictMode: true,
  env: {
    // Make API keys available to the client
    DREAMSTUDIO_API_KEY: process.env.DREAMSTUDIO_API_KEY || rootEnv.DREAMSTUDIO_API_KEY,
    NFT_STORAGE_KEY: process.env.NFT_STORAGE_KEY || rootEnv.NFT_STORAGE_KEY,
  },
};

module.exports = nextConfig; 