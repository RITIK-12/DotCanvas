import { ethers } from 'ethers';
import { NFT, NFTListing } from './nft';

// Sample NFT metadata
export const sampleNFTs = [
  {
    id: 1,
    name: "Nebula Genesis",
    description: "A swirling cosmic birthplace where stars form amid colorful gas clouds and dark matter.",
    image: "/assets/nft/Nebula Genesis.png",
    price: "0.75",
    attributes: [
      {
        trait_type: "Style",
        value: "Cosmic"
      },
      {
        trait_type: "Colors",
        value: "Purple, Teal, Gold"
      }
    ]
  },
  {
    id: 2,
    name: "Digital Dreamscape",
    description: "Surreal landscape where code becomes nature, featuring binary waterfalls and circuit tree formations.",
    image: "/assets/nft/Digital Dreamscape.png",
    price: "0.85",
    attributes: [
      {
        trait_type: "Style",
        value: "Surreal Digital"
      },
      {
        trait_type: "Theme",
        value: "Code and Nature"
      }
    ]
  },
  {
    id: 3,
    name: "Techno-Organic Fusion",
    description: "The perfect blend of natural forms and technological elements creating a harmonious symbiotic entity.",
    image: "/assets/nft/Techno-Organic Fusion.png",
    price: "0.7",
    attributes: [
      {
        trait_type: "Style",
        value: "Hyper-Detailed"
      },
      {
        trait_type: "Theme",
        value: "Technology-Nature Fusion"
      }
    ]
  },
  {
    id: 4,
    name: "Crystalline Consciousness",
    description: "A sentient crystalline structure emanating waves of digital thought patterns and quantum information.",
    image: "/assets/nft/Crystalline Consciousness.png",
    price: "0.95",
    attributes: [
      {
        trait_type: "Style",
        value: "Geometric"
      },
      {
        trait_type: "Theme",
        value: "Artificial Intelligence"
      }
    ]
  },
  {
    id: 5,
    name: "Liquid Algorithm",
    description: "Mathematical principles visualized as flowing liquid metal with embedded patterns that shift and transform.",
    image: "/assets/nft/Liquid Algorithm.png",
    price: "0.65",
    attributes: [
      {
        trait_type: "Style",
        value: "Liquid Metal"
      },
      {
        trait_type: "Theme",
        value: "Mathematics"
      }
    ]
  },
  {
    id: 6,
    name: "Temporal Echoes",
    description: "Multiple timeline fragments overlapping in a single moment, showing past, present and future simultaneously.",
    image: "/assets/nft/Temporal Echoes.png",
    price: "0.8",
    attributes: [
      {
        trait_type: "Style",
        value: "Layered Time"
      },
      {
        trait_type: "Theme",
        value: "Temporal"
      }
    ]
  },
  {
    id: 7,
    name: "Bionic Flora",
    description: "Botanical specimens evolved with technological adaptations, creating a new ecosystem of digital plant life.",
    image: "/assets/nft/Bionic Flora.png",
    price: "0.6",
    attributes: [
      {
        trait_type: "Style",
        value: "Botanical Tech"
      },
      {
        trait_type: "Theme",
        value: "Future Nature"
      }
    ]
  },
  {
    id: 8,
    name: "Quantum Resonance",
    description: "Visualization of quantum entanglement patterns as they ripple through the fabric of spacetime.",
    image: "/assets/nft/Quantum Resonance.png",
    price: "1.0",
    attributes: [
      {
        trait_type: "Style",
        value: "Abstract Physics"
      },
      {
        trait_type: "Theme",
        value: "Quantum Mechanics"
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