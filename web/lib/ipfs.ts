import { NFTStorage, File } from 'nft.storage';
import { STORAGE_CONFIG } from './config';

// Create NFT.Storage client
const client = new NFTStorage({ token: STORAGE_CONFIG.apiKey });

/**
 * Upload an image file to IPFS
 * @param file Image file to upload
 * @returns IPFS CID of the uploaded image
 */
export async function uploadImage(file: File): Promise<string> {
  try {
    const cid = await client.storeBlob(file);
    return cid;
  } catch (error) {
    console.error('Error uploading image to IPFS:', error);
    throw new Error('Failed to upload image to IPFS');
  }
}

/**
 * Upload NFT metadata to IPFS
 * @param name NFT name
 * @param description NFT description
 * @param imageCid IPFS CID of the NFT image
 * @param prompt The prompt used to generate the image (optional)
 * @returns IPFS CID of the uploaded metadata
 */
export async function uploadMetadata(
  name: string,
  description: string,
  imageCid: string,
  prompt?: string
): Promise<string> {
  try {
    // Prepare metadata in ERC-721 metadata standard format
    const metadata = {
      name,
      description,
      image: `ipfs://${imageCid}`,
      attributes: [
        {
          trait_type: 'Generator',
          value: 'Stable Diffusion XL'
        }
      ]
    };

    // Add prompt as an attribute if provided
    if (prompt) {
      metadata.attributes.push({
        trait_type: 'Prompt',
        value: prompt
      });
    }

    // Convert metadata to JSON
    const metadataJson = JSON.stringify(metadata, null, 2);
    
    // Create a file from the JSON
    const metadataFile = new File([metadataJson], 'metadata.json', { type: 'application/json' });
    
    // Store the file
    const cid = await client.storeBlob(metadataFile);
    return cid;
  } catch (error) {
    console.error('Error uploading metadata to IPFS:', error);
    throw new Error('Failed to upload metadata to IPFS');
  }
}

/**
 * Convert a data URL to a File object
 * @param dataUrl The data URL (e.g., from canvas.toDataURL())
 * @param filename The desired filename
 * @returns A File object
 */
export function dataURLtoFile(dataUrl: string, filename: string): File {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new File([u8arr], filename, { type: mime });
}

/**
 * Get an IPFS gateway URL for a CID
 * @param cid IPFS CID
 * @returns URL to access the content via a gateway
 */
export function getIpfsGatewayUrl(cid: string): string {
  return `${STORAGE_CONFIG.gatewayUrl}${cid}`;
}

/**
 * Fetch metadata from IPFS
 * @param cid IPFS CID of the metadata
 * @returns The metadata object
 */
export async function fetchMetadata(cid: string): Promise<any> {
  try {
    const url = getIpfsGatewayUrl(cid);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch metadata: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching metadata from IPFS:', error);
    throw new Error('Failed to fetch metadata from IPFS');
  }
}
