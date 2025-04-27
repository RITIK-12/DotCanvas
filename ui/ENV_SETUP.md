# DotCanvas Environment Setup

## API Keys Configuration

DotCanvas requires two API keys to function properly:

1. **Stability AI API Key** - For generating images based on text prompts
2. **NFT.Storage API Key** - For storing NFT images and metadata on IPFS

## Setting Up Environment Variables

1. Create a file named `.env.local` in the `ui` directory
2. Add the following environment variables to the file:

```
# Stability AI/DreamStudio API key for image generation
NEXT_PUBLIC_DREAMSTUDIO_API_KEY=your_stability_ai_key_here

# NFT Storage API key for storing NFT metadata and images
NEXT_PUBLIC_NFT_STORAGE_KEY=your_nft_storage_key_here

# Pinata API Authentication for uploads
NEXT_PUBLIC_PINATA_API_KEY=your_pinata_api_key_here
NEXT_PUBLIC_PINATA_API_SECRET=your_pinata_api_secret_here
```

## Getting API Keys

### Stability AI (DreamStudio)

1. Create an account at [https://platform.stability.ai/](https://platform.stability.ai/)
2. Log in to your account
3. Navigate to the API Keys section
4. Generate a new API key
5. Copy the key into your `.env.local` file

### NFT.Storage

1. Create an account at [https://nft.storage/](https://nft.storage/)
2. Log in to your account
3. Navigate to API Keys in your account settings
4. Create a new API key
5. Copy the key into your `.env.local` file

## Important Notes

- **Never commit your `.env.local` file to version control**
- After changing environment variables, you need to restart your development server
- The API keys are accessible client-side, so they will be visible in the browser
- For production deployment, set these environment variables in your hosting platform 