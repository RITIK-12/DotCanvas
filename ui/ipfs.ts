// IPFS utilities for DotCanvas
import { NFTStorage, File } from 'nft.storage';
import { STORAGE_CONFIG } from './config';

// Interface for NFT metadata
export interface NFTMetadata {
  name: string;
  description: string;
  image: File | string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

/**
 * Uploads an image to IPFS via NFT.Storage
 * @param imageFile - The image file to upload
 * @returns The IPFS CID (Content Identifier)
 */
export async function uploadImage(imageFile: File): Promise<string> {
  try {
    const client = new NFTStorage({ token: STORAGE_CONFIG.apiKey });
    const cid = await client.storeBlob(imageFile);
    return cid;
  } catch (error) {
    console.error('Error uploading image to IPFS:', error);
    throw error;
  }
}

/**
 * Creates and uploads NFT metadata to IPFS
 * @param metadata - The NFT metadata object
 * @returns The IPFS URI for the metadata
 */
export async function uploadMetadata(metadata: NFTMetadata): Promise<string> {
  try {
    const client = new NFTStorage({ token: STORAGE_CONFIG.apiKey });
    
    // If the image is already a CID string, convert it to a proper IPFS URL
    if (typeof metadata.image === 'string') {
      metadata.image = `ipfs://${metadata.image}`;
    }
    
    // Upload the metadata
    const nft = {
      name: metadata.name,
      description: metadata.description,
      image: metadata.image,
      attributes: metadata.attributes || []
    };
    
    const metadataCid = await client.store(nft);
    return metadataCid.url;
  } catch (error) {
    console.error('Error uploading metadata to IPFS:', error);
    throw error;
  }
}

/**
 * Converts an IPFS URI to an HTTP gateway URL
 * @param ipfsUri - The IPFS URI (ipfs://...)
 * @returns The HTTP gateway URL
 */
export function ipfsToHttp(ipfsUri: string): string {
  if (!ipfsUri) return '';
  
  // Handle ipfs:// prefix
  if (ipfsUri.startsWith('ipfs://')) {
    const cid = ipfsUri.split('ipfs://')[1];
    return `${STORAGE_CONFIG.gatewayUrl}${cid}`;
  }
  
  // Handle bare CID
  if (ipfsUri.match(/^[a-zA-Z0-9]{46}$/)) {
    return `${STORAGE_CONFIG.gatewayUrl}${ipfsUri}`;
  }
  
  return ipfsUri;
}

/**
 * Fetches metadata from an IPFS URI
 * @param uri - The IPFS URI
 * @returns The metadata object
 */
export async function fetchMetadata(uri: string): Promise<any> {
  try {
    const url = ipfsToHttp(uri);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch metadata: ${response.statusText}`);
    }
    
    const metadata = await response.json();
    
    // Convert the image URI to HTTP if needed
    if (metadata.image) {
      metadata.image = ipfsToHttp(metadata.image);
    }
    
    return metadata;
  } catch (error) {
    console.error('Error fetching metadata from IPFS:', error);
    throw error;
  }
} 