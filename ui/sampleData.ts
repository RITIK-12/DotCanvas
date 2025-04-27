import { ethers } from 'ethers';
import { NFT, NFTListing } from './nft';

// Sample NFT metadata
export const sampleNFTs = [
  {
    id: 1,
    name: "Cosmic Dreamscape",
    description: "A vibrant celestial landscape with colorful nebulae and distant galaxies swirling in the void of space.",
    image: "https://images.unsplash.com/photo-1534841090574-cba2d662b62e?q=80&w=1287&auto=format&fit=crop",
    price: "0.5",
    attributes: [
      {
        trait_type: "Style",
        value: "Cosmic"
      },
      {
        trait_type: "Colors",
        value: "Purple, Blue, Pink"
      }
    ]
  },
  {
    id: 2,
    name: "Neon City Nights",
    description: "A cyberpunk cityscape at night, bathed in the glow of neon lights reflecting off rain-slicked streets.",
    image: "https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=1470&auto=format&fit=crop",
    price: "0.75",
    attributes: [
      {
        trait_type: "Style",
        value: "Cyberpunk"
      },
      {
        trait_type: "Setting",
        value: "Night City"
      }
    ]
  },
  {
    id: 3,
    name: "Digital Wilderness",
    description: "Abstract digital landscape where nature meets technology, featuring glowing flora and crystalline structures.",
    image: "https://images.unsplash.com/photo-1604871000636-074fa5117945?q=80&w=1287&auto=format&fit=crop",
    price: "0.65",
    attributes: [
      {
        trait_type: "Style",
        value: "Abstract Digital"
      },
      {
        trait_type: "Theme",
        value: "Nature-Tech Fusion"
      }
    ]
  },
  {
    id: 4,
    name: "Quantum Patterns",
    description: "Fractal patterns resembling the quantum fabric of reality, intricate and ever-changing.",
    image: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?q=80&w=1470&auto=format&fit=crop",
    price: "0.8",
    attributes: [
      {
        trait_type: "Style",
        value: "Fractal"
      },
      {
        trait_type: "Complexity",
        value: "High"
      }
    ]
  },
  {
    id: 5,
    name: "Sunset Serenity",
    description: "A tranquil beach scene at sunset with gentle waves and golden light reflecting off the water.",
    image: "https://images.unsplash.com/photo-1566369484714-2b9a8bec530a?q=80&w=1288&auto=format&fit=crop",
    price: "0.55",
    attributes: [
      {
        trait_type: "Style",
        value: "Realistic"
      },
      {
        trait_type: "Theme",
        value: "Nature"
      }
    ]
  },
  {
    id: 6,
    name: "Ethereal Portrait",
    description: "A dreamlike portrait with flowing textures and otherworldly elements framing the subject.",
    image: "https://images.unsplash.com/photo-1528825871115-3581a5387919?q=80&w=1470&auto=format&fit=crop",
    price: "0.9",
    attributes: [
      {
        trait_type: "Style",
        value: "Ethereal"
      },
      {
        trait_type: "Subject",
        value: "Portrait"
      }
    ]
  }
];

// Function to convert sample data to NFT Listings format
export function getSampleListings(): NFTListing[] {
  // Create a mock seller address
  const sellerAddress = "0x6e571cb8dba906d2ef6c6a0c8783955409fafdeb";
  const nftContractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  
  return sampleNFTs.map((nft, index) => {
    // Create a listing with metadata attached
    return {
      id: nft.id,
      seller: sellerAddress,
      nftContract: nftContractAddress,
      tokenId: nft.id,
      price: ethers.parseUnits(nft.price, 18), // Convert price to wei
      active: true,
      metadata: {
        name: nft.name,
        description: nft.description,
        image: nft.image,
        attributes: nft.attributes
      },
      uri: `ipfs://sample${nft.id}`
    };
  });
} 