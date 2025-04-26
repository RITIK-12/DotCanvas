// Type definitions for DotCanvas application

/**
 * NFT Attribute (trait)
 */
export interface NFTAttribute {
  trait_type: string;
  value: string | number;
  display_type?: string;
}

/**
 * Complete NFT data including metadata
 */
export interface NFTData {
  tokenId: string;
  owner: string;
  name: string;
  description: string;
  imageUrl: string;
  attributes: NFTAttribute[];
  rawUri: string;
}

/**
 * Market listing for an NFT
 */
export interface NFTListing {
  listingId: string;
  seller: string;
  tokenId: string;
  price: string;
  formattedPrice: string;
  nft: NFTData;
}

/**
 * Filter options for NFT gallery
 */
export interface NFTFilterOptions {
  owner?: string;
  forSale?: boolean;
  sortBy?: 'price' | 'newest' | 'oldest';
  sortDirection?: 'asc' | 'desc';
}

/**
 * Form data for minting an NFT
 */
export interface MintFormData {
  prompt: string;
  name: string;
  description: string;
  royaltyPercentage?: number;
}

/**
 * Form data for listing an NFT
 */
export interface ListNFTFormData {
  tokenId: string;
  price: string;
}

/**
 * Result of an NFT transaction
 */
export interface TransactionResult {
  success: boolean;
  txHash?: string;
  tokenId?: string;
  listingId?: string;
  error?: string;
} 