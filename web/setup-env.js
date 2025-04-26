const fs = require('fs');
const path = require('path');

// Template for .env.local file
const envContent = `# Network configuration
NEXT_PUBLIC_CHAIN_ID=420420421
NEXT_PUBLIC_RPC_URL=https://westend-asset-hub-eth-rpc.polkadot.io

# Storage
NFT_STORAGE_KEY=your_nft_storage_api_key_here

# AI image generation
LOCAL_GPU=false
DREAMSTUDIO_API_KEY=your_dreamstudio_api_key_here
`;

// Write the .env.local file
const envPath = path.join(__dirname, '.env.local');
fs.writeFileSync(envPath, envContent);

console.log(`.env.local file created at ${envPath}`);
console.log('Please edit this file to add your actual DreamStudio API key in the DREAMSTUDIO_API_KEY variable.');
console.log('After updating the file, restart your development server with "npm run dev"'); 