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
    if (process.env.NEXT_PUBLIC_NFT_STORAGE_KEY) {
      const originalKey = process.env.NEXT_PUBLIC_NFT_STORAGE_KEY;
      process.env.NEXT_PUBLIC_NFT_STORAGE_KEY = originalKey.trim();
      
      if (originalKey !== process.env.NEXT_PUBLIC_NFT_STORAGE_KEY) {
        console.log('⚠️ NEXT_PUBLIC_NFT_STORAGE_KEY had whitespace that was trimmed');
      }
      
      console.log(`NEXT_PUBLIC_NFT_STORAGE_KEY found (${process.env.NEXT_PUBLIC_NFT_STORAGE_KEY.length} characters)`);
      
      // Log the first few characters to help with debugging
      if (process.env.NEXT_PUBLIC_NFT_STORAGE_KEY.length > 0) {
        console.log(`NEXT_PUBLIC_NFT_STORAGE_KEY format check: starts with "${process.env.NEXT_PUBLIC_NFT_STORAGE_KEY.substring(0, 5)}..."`);
      }
    } else {
      console.log('❌ NEXT_PUBLIC_NFT_STORAGE_KEY is missing');
      
      // Check for incorrect variable name
      if (process.env.NEXT_NFT_STORAGE_KEY) {
        console.log('⚠️ Found NEXT_NFT_STORAGE_KEY instead of NEXT_PUBLIC_NFT_STORAGE_KEY - using the wrong name!');
      } else if (process.env.NFT_STORAGE_KEY) {
        console.log('⚠️ Found NFT_STORAGE_KEY instead of NEXT_PUBLIC_NFT_STORAGE_KEY - using the wrong name!');
      }
    }
    
    if (process.env.NEXT_PUBLIC_DREAMSTUDIO_API_KEY) {
      const originalKey = process.env.NEXT_PUBLIC_DREAMSTUDIO_API_KEY;
      process.env.NEXT_PUBLIC_DREAMSTUDIO_API_KEY = originalKey.trim();
      
      if (originalKey !== process.env.NEXT_PUBLIC_DREAMSTUDIO_API_KEY) {
        console.log('⚠️ NEXT_PUBLIC_DREAMSTUDIO_API_KEY had whitespace that was trimmed');
      }
      
      console.log(`NEXT_PUBLIC_DREAMSTUDIO_API_KEY found (${process.env.NEXT_PUBLIC_DREAMSTUDIO_API_KEY.length} characters)`);
    } else {
      console.log('❌ NEXT_PUBLIC_DREAMSTUDIO_API_KEY is missing');
      
      // Check for incorrect variable name
      if (process.env.DREAMSTUDIO_API_KEY) {
        console.log('⚠️ Found DREAMSTUDIO_API_KEY instead of NEXT_PUBLIC_DREAMSTUDIO_API_KEY - using the wrong name!');
      }
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
      'dweb.link',
      'images.unsplash.com'
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
  // Make environment variables accessible in browser code
  env: {
    NEXT_PUBLIC_NFT_STORAGE_KEY: process.env.NEXT_PUBLIC_NFT_STORAGE_KEY || '',
    NEXT_PUBLIC_DREAMSTUDIO_API_KEY: process.env.NEXT_PUBLIC_DREAMSTUDIO_API_KEY || '',
    NEXT_PUBLIC_PINATA_API_KEY: process.env.NEXT_PUBLIC_PINATA_API_KEY || '',
    NEXT_PUBLIC_PINATA_API_SECRET: process.env.NEXT_PUBLIC_PINATA_API_SECRET || '',
    NEXT_PUBLIC_PINATA_JWT: process.env.NEXT_PUBLIC_PINATA_JWT || '',
  },
};

module.exports = nextConfig; 