/** @type {import('next').NextConfig} */
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

// Load environment variables from the root directory's .env file
const envPath = path.resolve(__dirname, '../.env');
console.log(`Looking for .env file at: ${envPath}`);

if (fs.existsSync(envPath)) {
  console.log('.env file found in root directory');
  const envConfig = dotenv.config({ path: envPath });
  
  if (envConfig.error) {
    console.error('Error loading .env file:', envConfig.error);
  } else {
    console.log('Environment variables loaded from root .env file');
    
    // Ensure API keys are properly formatted (trim whitespace)
    if (process.env.NFT_STORAGE_KEY) {
      const originalKey = process.env.NFT_STORAGE_KEY;
      process.env.NFT_STORAGE_KEY = originalKey.trim();
      
      if (originalKey !== process.env.NFT_STORAGE_KEY) {
        console.log('⚠️ NFT_STORAGE_KEY had whitespace that was trimmed');
      }
      
      console.log(`NFT_STORAGE_KEY found (${process.env.NFT_STORAGE_KEY.length} characters)`);
      
      // Log the first few characters to help with debugging
      if (process.env.NFT_STORAGE_KEY.length > 0) {
        console.log(`NFT_STORAGE_KEY format check: starts with "${process.env.NFT_STORAGE_KEY.substring(0, 5)}..."`);
      }
    } else {
      console.log('❌ NFT_STORAGE_KEY is missing');
    }
    
    if (process.env.DREAMSTUDIO_API_KEY) {
      const originalKey = process.env.DREAMSTUDIO_API_KEY;
      process.env.DREAMSTUDIO_API_KEY = originalKey.trim();
      
      if (originalKey !== process.env.DREAMSTUDIO_API_KEY) {
        console.log('⚠️ DREAMSTUDIO_API_KEY had whitespace that was trimmed');
      }
      
      console.log(`DREAMSTUDIO_API_KEY found (${process.env.DREAMSTUDIO_API_KEY.length} characters)`);
    } else {
      console.log('❌ DREAMSTUDIO_API_KEY is missing');
    }
  }
} else {
  console.error('.env file not found in root directory');
}

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'ipfs.io',
      'nftstorage.link',
      'dweb.link'
    ],
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
  // Add environment variables to be accessible in the browser
  env: {
    NFT_STORAGE_KEY: process.env.NFT_STORAGE_KEY || '',
    DREAMSTUDIO_API_KEY: process.env.DREAMSTUDIO_API_KEY || '',
  },
};

module.exports = nextConfig; 