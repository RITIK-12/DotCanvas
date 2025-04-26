# DotCanvas

## AI-Generated Art Marketplace on Polkadot Asset Hub

DotCanvas is a decentralized marketplace for AI-generated artwork, built on Polkadot Asset Hub's Westend testnet. Artists can generate unique images using Stable Diffusion XL Lightning, store them on IPFS, mint them as NFTs, and sell them for WND tokens.

### 🎯 Key Features

- **AI Art Generation**: Create unique artwork using Stable Diffusion XL Lightning
- **Decentralized Storage**: Store images and metadata on IPFS via NFT.Storage
- **NFT Minting**: Mint your art as ERC-721 tokens with optional royalties
- **Marketplace**: List, buy, and sell NFTs with WND tokens
- **Web3 Integration**: Seamless connection with MetaMask and other wallets

### 🚀 Quick Start

1. Clone this repository
2. Install dependencies: `pnpm install`
3. Add Asset Hub Westend to MetaMask
   - Network Name: Westend Asset Hub
   - RPC URL: https://westend-asset-hub-eth-rpc.polkadot.io
   - Chain ID: 420420421
   - Currency Symbol: WND
4. Get test WND tokens from the faucet
5. Copy `env.template` to `.env` and fill in your details
6. Compile contracts: `pnpm compile`
7. Deploy contracts: `pnpm deploy:westend`
8. Copy contract addresses to `web/lib/config.ts`
9. Start the frontend: `pnpm web:dev`
10. (Optional) Start the local AI service: `pnpm server:start`

### 🧱 Architecture

DotCanvas consists of two smart contracts:

1. **DotCanvasNFT**: An ERC-721 contract for minting and managing NFTs, with ERC-2981 royalty support
2. **DotCanvasMarket**: A marketplace contract for listing, buying, and selling NFTs

The frontend is built with Next.js, and interacts with the blockchain using wagmi, viem, and ethers.js.

### 👨‍💻 Development Workflow

1. Generate an image using SDXL (locally or via API)
2. Upload to IPFS and get the CID
3. Mint an NFT with the IPFS CID as the tokenURI
4. Approve the marketplace contract to transfer your NFT
5. List the NFT for sale
6. Other users can browse and purchase your NFT

### 📄 License

This project is licensed under the MIT License.

---

*Built for the Polkadot Hackathon*
