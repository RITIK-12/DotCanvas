// Configuration for DotCanvas web app

// Smart contract addresses (replace with your deployed contract addresses)
export const CONTRACT_ADDRESSES = {
  // Locally deployed contract addresses
  DotCanvasNFT: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  DotCanvasMarket: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
};

// Network configuration for Polkadot Asset Hub Westend
export const NETWORK_CONFIG = {
  chainId: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "420420421"),
  name: "Polkadot Asset Hub Westend",
  currency: {
    name: "Westend",
    symbol: "WND",
    decimals: 18
  },
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || "https://westend-asset-hub-eth-rpc.polkadot.io",
  blockExplorer: "https://westend.subscan.io" // You might want to update this if there's a better block explorer
};

// NFT.Storage configuration
export const STORAGE_CONFIG = {
  apiKey: process.env.NFT_STORAGE_KEY || "",
  gatewayUrl: "https://ipfs.io/ipfs/"
};

// AI service configuration
export const AI_CONFIG = {
  localService: process.env.LOCAL_GPU === "true",
  apiEndpoint: process.env.LOCAL_GPU === "true" 
    ? "http://localhost:8000/generate" 
    : "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image",
  apiKey: process.env.DREAMSTUDIO_API_KEY || ""
};

// Default image generation params
export const DEFAULT_IMAGE_PARAMS = {
  width: 512,
  height: 512,
  steps: 30,
  cfgScale: 7,
  sampler: "K_EULER_ANCESTRAL",
  samples: 1
};

// DotCanvas NFT ABI
export const DOTCANVAS_NFT_ABI = [
  // ERC-721 standard functions
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function balanceOf(address owner) view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function approve(address to, uint256 tokenId)",
  "function getApproved(uint256 tokenId) view returns (address)",
  "function setApprovalForAll(address operator, bool approved)",
  "function isApprovedForAll(address owner, address operator) view returns (bool)",
  "function transferFrom(address from, address to, uint256 tokenId)",
  "function safeTransferFrom(address from, address to, uint256 tokenId)",
  
  // Custom DotCanvas NFT functions
  "function mint(string memory tokenURI) returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
  "function tokenByIndex(uint256 index) view returns (uint256)",
  "function royaltyInfo(uint256 tokenId, uint256 salePrice) view returns (address receiver, uint256 royaltyAmount)",
  "function setTokenRoyalty(uint256 tokenId, address receiver, uint96 feeNumerator)",
  
  // Events
  "event NFTMinted(address indexed creator, uint256 indexed tokenId, string tokenURI)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
];

// DotCanvas Market ABI
export const DOTCANVAS_MARKET_ABI = [
  // Market functions
  "function listNFT(address nftContract, uint256 tokenId, uint256 price) returns (uint256)",
  "function cancelListing(uint256 listingId)",
  "function buyNFT(uint256 listingId) payable",
  "function getListing(uint256 listingId) view returns (address seller, address nftContract, uint256 tokenId, uint256 price, bool active)",
  "function getListingCount() view returns (uint256)",
  "function getListingByIndex(uint256 index) view returns (uint256)",
  "function updatePlatformFee(uint256 newFeePercent)",
  "function updateFeeReceiver(address newFeeReceiver)",
  
  // Events
  "event NFTListed(uint256 indexed listingId, address indexed seller, address indexed nftContract, uint256 tokenId, uint256 price)",
  "event NFTSold(uint256 indexed listingId, address indexed seller, address indexed buyer, address nftContract, uint256 tokenId, uint256 price)",
  "event NFTListingCancelled(uint256 indexed listingId)",
  "event PlatformFeeUpdated(uint256 feePercent)",
  "event FeeReceiverUpdated(address feeReceiver)"
];
