# DotCanvas Template

This is a modern and beautiful UI template for the DotCanvas NFT marketplace built on Polkadot Asset Hub. It provides all the utilities and components needed to create a fully functional NFT marketplace with AI art generation.

## Features

- 🎨 Modern UI with Tailwind CSS
- 🔒 Web3 wallet integration with ethers.js
- 🖼️ AI image generation with Stable Diffusion XL
- 📦 IPFS storage for NFT images and metadata
- 🪙 NFT minting and marketplace functionality
- 📱 Responsive design for all devices

## Getting Started

1. Install dependencies:
```bash
pnpm install
```

2. Configure your environment variables:
```
# Create a .env file with:
NFT_STORAGE_KEY=your_nft_storage_key
DREAMSTUDIO_API_KEY=your_stability_ai_key
NEXT_PUBLIC_RPC_URL=https://westend-asset-hub-eth-rpc.polkadot.io
NEXT_PUBLIC_CHAIN_ID=420420421
```

3. Update contract addresses in `config.ts` with your deployed contract addresses.

4. Start the development server:
```bash
pnpm dev
```

## Directory Structure

- `/app` - Next.js application pages
- `/components` - Reusable UI components
- `/styles` - CSS styles and Tailwind configuration
- `/assets` - Static assets like images and icons
- `*.ts` - Utility files for blockchain, IPFS, and AI interactions

## Customization

You can customize the UI by modifying the Tailwind configuration in `tailwind.config.js` and the global styles in `styles/globals.css`. Component styles can be modified directly within the component files.

## Contract Integration

This template is designed to work with the DotCanvasNFT and DotCanvasMarket contracts. Make sure to deploy these contracts and update the addresses in `config.ts` before using the application.

---

*Built for the Polkadot Hackathon*

## Getting Start

Here are some instruction for use That

1. You can just got the zip file our code for Template in one click.

2. You can use the code from template.jsx file.

3. You need to add folowing libraries to your project

   - react-fast-marquee
   - classnames
   - @fontsource/montserrat
   - @fontsource/cormorant

4. You nedd to add css to your global.css file.

5. You need to extend font-family in your tailwind config file.
## Creator

[Tailwind Tap](https://www.tailwindtap.com/) was created by Infynno solutions [https://infynno.com/] and maintained by Team.

## Copyright and License

Copyright 2022-2023 Infynno solutions. Code released under the MIT license.
