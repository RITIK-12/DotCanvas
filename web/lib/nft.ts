import { fetchMetadata, getIpfsGatewayUrl } from './ipfs';
import { NFTData, NFTListing } from '../types';

/**
 * Extract IPFS CID from an IPFS URI
 * @param uri IPFS URI (e.g., ipfs://QmXxxx...)
 * @returns IPFS CID
 */
export function extractIpfsCid(uri: string): string {
  if (uri.startsWith('ipfs://')) {
    return uri.replace('ipfs://', '');
  }
  return uri;
}

/**
 * Format a price value in DOT with appropriate precision
 * @param price Raw price value in Wei
 * @returns Formatted price string with symbol
 */
export function formatPrice(price: bigint): string {
  // Convert Wei to DOT (18 decimals)
  const ethValue = Number(price) / 10**18;
  
  // Format with appropriate precision
  if (ethValue < 0.001) {
    return `< 0.001 DOT`;
  } else if (ethValue < 1) {
    return `${ethValue.toFixed(3)} DOT`;
  } else {
    return `${ethValue.toFixed(2)} DOT`;
  }
}

/**
 * Parse IPFS URI to a viewable URL
 * @param uri IPFS URI
 * @returns HTTP URL to view the content
 */
export function parseIpfsUrl(uri: string): string {
  if (!uri) return '';
  
  if (uri.startsWith('ipfs://')) {
    const cid = uri.replace('ipfs://', '');
    return getIpfsGatewayUrl(cid);
  }
  
  return uri;
}

/**
 * Fetch full NFT data including metadata
 * @param tokenId Token ID
 * @param tokenUri IPFS URI of the metadata
 * @param owner Owner address
 * @returns Complete NFT data with metadata
 */
export async function fetchNFTData(
  tokenId: string,
  tokenUri: string,
  owner: string
): Promise<NFTData> {
  try {
    // Extract CID from tokenURI
    const cid = extractIpfsCid(tokenUri);
    
    // Fetch metadata from IPFS
    const metadata = await fetchMetadata(cid);
    
    // Extract image URL
    const rawImageUrl = metadata.image;
    const imageUrl = parseIpfsUrl(rawImageUrl);
    
    // Create NFT data object
    return {
      tokenId,
      owner,
      name: metadata.name,
      description: metadata.description,
      imageUrl,
      attributes: metadata.attributes || [],
      rawUri: tokenUri
    };
  } catch (error) {
    console.error('Error fetching NFT data:', error);
    
    // Return a placeholder if metadata can't be fetched
    return {
      tokenId,
      owner,
      name: `NFT #${tokenId}`,
      description: 'Metadata unavailable',
      imageUrl: '',
      attributes: [],
      rawUri: tokenUri
    };
  }
}

/**
 * Format NFT listing data with readable information
 * @param listingId Listing ID
 * @param seller Seller address
 * @param tokenId Token ID
 * @param price Price in Wei
 * @param nftData NFT metadata
 * @returns Formatted NFT listing
 */
export function formatNFTListing(
  listingId: string,
  seller: string,
  tokenId: string,
  price: bigint,
  nftData: NFTData
): NFTListing {
  return {
    listingId,
    seller,
    tokenId,
    price: price.toString(),
    formattedPrice: formatPrice(price),
    nft: nftData
  };
}

/**
 * Shorten an Ethereum address for display
 * @param address Ethereum address
 * @param chars Number of characters to show at start/end
 * @returns Shortened address
 */
export function shortenAddress(address: string, chars = 4): string {
  if (!address) return '';
  
  const start = address.substring(0, chars + 2); // +2 for '0x'
  const end = address.substring(address.length - chars);
  
  return `${start}...${end}`;
} 