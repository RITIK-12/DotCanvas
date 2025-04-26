// NFT utilities for DotCanvas
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, DOTCANVAS_NFT_ABI, DOTCANVAS_MARKET_ABI } from './config';
import { uploadMetadata, NFTMetadata } from './ipfs';

// Interface for NFT data
export interface NFT {
  id: number;
  tokenId: number;
  owner: string;
  creator: string;
  metadata: {
    name: string;
    description: string;
    image: string;
    attributes?: Array<{
      trait_type: string;
      value: string | number;
    }>;
  };
  uri: string;
}

// Interface for NFT listing data
export interface NFTListing {
  id: number;
  seller: string;
  nftContract: string;
  tokenId: number;
  price: ethers.BigNumber;
  active: boolean;
}

/**
 * Mints a new NFT
 * @param provider - The ethers provider
 * @param metadata - The NFT metadata
 * @returns The token ID of the minted NFT
 */
export async function mintNFT(
  provider: ethers.providers.Web3Provider,
  metadata: NFTMetadata
): Promise<number> {
  try {
    const signer = provider.getSigner();
    const nftContract = new ethers.Contract(
      CONTRACT_ADDRESSES.DotCanvasNFT,
      DOTCANVAS_NFT_ABI,
      signer
    );

    // Upload metadata to IPFS
    const metadataURI = await uploadMetadata(metadata);
    
    // Mint the NFT
    const tx = await nftContract.mint(metadataURI);
    const receipt = await tx.wait();
    
    // Get the token ID from the minted event
    const event = receipt.events?.find(e => e.event === 'NFTMinted');
    const tokenId = event?.args?.tokenId.toNumber();
    
    return tokenId;
  } catch (error) {
    console.error('Error minting NFT:', error);
    throw error;
  }
}

/**
 * Lists an NFT for sale on the marketplace
 * @param provider - The ethers provider
 * @param tokenId - The NFT token ID
 * @param price - The price in DOT (wei)
 * @returns The listing ID
 */
export async function listNFT(
  provider: ethers.providers.Web3Provider,
  tokenId: number,
  price: string
): Promise<number> {
  try {
    const signer = provider.getSigner();
    
    // First, approve the marketplace contract to transfer the NFT
    const nftContract = new ethers.Contract(
      CONTRACT_ADDRESSES.DotCanvasNFT,
      DOTCANVAS_NFT_ABI,
      signer
    );
    
    const approvalTx = await nftContract.approve(
      CONTRACT_ADDRESSES.DotCanvasMarket,
      tokenId
    );
    await approvalTx.wait();
    
    // Then, list the NFT on the marketplace
    const marketContract = new ethers.Contract(
      CONTRACT_ADDRESSES.DotCanvasMarket,
      DOTCANVAS_MARKET_ABI,
      signer
    );
    
    const priceWei = ethers.utils.parseEther(price);
    const listingTx = await marketContract.listNFT(
      CONTRACT_ADDRESSES.DotCanvasNFT,
      tokenId,
      priceWei
    );
    const receipt = await listingTx.wait();
    
    // Get the listing ID from the event
    const event = receipt.events?.find(e => e.event === 'NFTListed');
    const listingId = event?.args?.listingId.toNumber();
    
    return listingId;
  } catch (error) {
    console.error('Error listing NFT:', error);
    throw error;
  }
}

/**
 * Buys an NFT from the marketplace
 * @param provider - The ethers provider
 * @param listingId - The listing ID
 * @param price - The price to pay (must match or exceed the listing price)
 */
export async function buyNFT(
  provider: ethers.providers.Web3Provider,
  listingId: number,
  price: string
): Promise<void> {
  try {
    const signer = provider.getSigner();
    const marketContract = new ethers.Contract(
      CONTRACT_ADDRESSES.DotCanvasMarket,
      DOTCANVAS_MARKET_ABI,
      signer
    );
    
    const priceWei = ethers.utils.parseEther(price);
    const tx = await marketContract.buyNFT(listingId, { value: priceWei });
    await tx.wait();
  } catch (error) {
    console.error('Error buying NFT:', error);
    throw error;
  }
}

/**
 * Cancels an NFT listing
 * @param provider - The ethers provider
 * @param listingId - The listing ID
 */
export async function cancelListing(
  provider: ethers.providers.Web3Provider,
  listingId: number
): Promise<void> {
  try {
    const signer = provider.getSigner();
    const marketContract = new ethers.Contract(
      CONTRACT_ADDRESSES.DotCanvasMarket,
      DOTCANVAS_MARKET_ABI,
      signer
    );
    
    const tx = await marketContract.cancelListing(listingId);
    await tx.wait();
  } catch (error) {
    console.error('Error canceling NFT listing:', error);
    throw error;
  }
} 