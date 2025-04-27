// IPFS utilities for DotCanvas
import { NFTStorage, File } from 'nft.storage';
import { STORAGE_CONFIG } from './config';
import { CONTRACT_ADDRESSES } from './config';

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

// Store collection ID for reuse
let currentCollectionId: string | null = null;

// Helper function to get authorization headers for NFT.Storage API
function getNFTStorageHeaders(apiKey: string) {
  // The API key could contain special characters that need escaping in some cases
  // If standard header isn't working, the app can try to use encodeURIComponent
  // We'll detect if the key should be encoded at runtime
  
  // Period characters in API keys sometimes cause issues
  const containsSpecialChars = apiKey.includes('.') || 
                              apiKey.includes('+') || 
                              apiKey.includes('/') || 
                              apiKey.includes('=');
  
  console.log('API key contains special chars:', containsSpecialChars);
  
  // For debugging - log API key details
  console.log('NFT.Storage API key length:', apiKey.length);
  
  // Standard header format
  return {
    'Authorization': `Bearer ${apiKey}`
  };
}

/**
 * Creates a collection on NFT.Storage Preserve API
 * @returns The collection ID
 */
async function createCollection(): Promise<string> {
  const apiKey = STORAGE_CONFIG.apiKey;
  
  if (!apiKey) {
    throw new Error('NFT.Storage API key is missing. Please check your .env file in the root directory.');
  }
  
  try {
    // Use the Preserve API to create a collection
    const response = await fetch('https://preserve.nft.storage/api/v1/collection/create_collection', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getNFTStorageHeaders(apiKey)
      },
      body: JSON.stringify({
        collectionName: 'DotCanvas Collection',
        contractAddress: CONTRACT_ADDRESSES.DotCanvasNFT,
        chainID: '420420421', // Westend Asset Hub chain ID
        network: 'Polkadot'
      })
    });
    
    if (!response.ok) {
      // Try to parse error response
      let errorMessage = '';
      try {
        const errorData = await response.json();
        console.error('Collection creation error:', errorData);
        errorMessage = errorData.error?.message || errorData.message || '';
      } catch (parseError) {
        errorMessage = response.statusText;
      }
      
      if (response.status === 401) {
        throw new Error(`NFT.Storage API authentication failed. Please check your API key.`);
      }
      
      throw new Error(`Failed to create collection: ${errorMessage || response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Collection created:', data);
    
    // Extract collection ID from response according to the API format
    const collectionId = data.value?.collectionId || data.collectionId || data.id;
    
    if (!collectionId) {
      throw new Error('Failed to extract collection ID from response');
    }
    
    return collectionId;
  } catch (error) {
    console.error('Error creating collection:', error);
    throw error;
  }
}

/**
 * Get or create a collection ID
 * @returns The collection ID
 */
async function getOrCreateCollection(): Promise<string> {
  if (currentCollectionId) {
    return currentCollectionId;
  }
  
  try {
    // Try to list collections first
    const collections = await listCollections();
    
    if (collections.length > 0) {
      // Use the first collection if available
      const collectionId = collections[0].id;
      if (!collectionId) {
        throw new Error('Collection ID is missing in the collection object');
      }
      currentCollectionId = collectionId;
      return collectionId;
    }
    
    // Create a new collection if none exists
    const newCollectionId = await createCollection();
    currentCollectionId = newCollectionId;
    return newCollectionId;
  } catch (error) {
    console.error('Error getting/creating collection:', error);
    throw error;
  }
}

/**
 * List available collections
 * @returns Array of collections
 */
async function listCollections(): Promise<any[]> {
  const apiKey = STORAGE_CONFIG.apiKey;
  
  if (!apiKey) {
    throw new Error('NFT.Storage API key is missing. Please check your .env file in the root directory.');
  }
  
  try {
    const response = await fetch('https://preserve.nft.storage/api/v1/collection/list_collections', {
      method: 'GET',
      headers: getNFTStorageHeaders(apiKey)
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error('List collections error:', error);
      throw new Error(`Failed to list collections: ${error.error?.message || response.statusText}`);
    }
    
    const data = await response.json();
    return data.value || data.collections || [];
  } catch (error) {
    console.error('Error listing collections:', error);
    throw error;
  }
}

/**
 * Uploads a file to IPFS using the standard NFT.Storage API
 * This is used for compatibility and initial CID generation
 * @param file - The file to upload
 * @returns The IPFS CID
 */
async function uploadFileStandard(file: File): Promise<string> {
  const apiKey = STORAGE_CONFIG.apiKey;
  
  if (!apiKey) {
    throw new Error('NFT.Storage API key is missing. Please check your .env file in the root directory.');
  }
  
  try {
    // Log exact header format for debugging
    console.log('Using exact Authorization header: Bearer ' + apiKey);
    
    // Direct upload to NFT.Storage standard API
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('https://api.nft.storage/upload', {
      method: 'POST',
      headers: getNFTStorageHeaders(apiKey),
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('NFT.Storage upload error:', errorData);
      console.error('Response status:', response.status);
      console.error('Response headers:', Object.fromEntries([...response.headers.entries()]));
      
      // More specific error messages based on API responses
      if (response.status === 401) {
        throw new Error(`NFT.Storage API key is invalid. Please check your NFT_STORAGE_KEY in the .env file.`);
      } else if (response.status === 429) {
        throw new Error(`NFT.Storage rate limit exceeded. Please try again later.`);
      }
      
      throw new Error(`NFT.Storage upload failed: ${errorData.error?.message || response.statusText}`);
    }
    
    const data = await response.json();
    return data.value.cid;
  } catch (error) {
    console.error('Error in standard upload:', error);
    throw error;
  }
}

/**
 * Add a token to the collection
 * @param tokenId - The token ID
 * @param cid - The IPFS CID
 * @returns Success status
 */
async function addTokenToCollection(tokenId: string, cid: string): Promise<boolean> {
  const apiKey = STORAGE_CONFIG.apiKey;
  
  if (!apiKey) {
    throw new Error('NFT.Storage API key is missing. Please check your .env file in the root directory.');
  }
  
  try {
    // Get or create collection ID
    const collectionId = await getOrCreateCollection();
    
    // Create a CSV file with the token mapping
    // Format: tokenID,cid (per API documentation)
    const csvContent = 'tokenID,cid\n' + `${tokenId},${cid}`;
    const csvFile = new File([csvContent], 'tokens.csv', { type: 'text/csv' });
    
    // Create form data exactly as specified in the API documentation
    const formData = new FormData();
    formData.append('collectionID', collectionId);
    formData.append('file', csvFile);
    
    // Upload to Preserve API
    const response = await fetch('https://preserve.nft.storage/api/v1/collection/add_tokens', {
      method: 'POST',
      headers: getNFTStorageHeaders(apiKey),
      body: formData
    });
    
    if (!response.ok) {
      let errorMessage = '';
      try {
        const errorData = await response.json();
        console.error('Add tokens error:', errorData);
        errorMessage = errorData.error?.message || errorData.message || '';
      } catch (parseError) {
        errorMessage = response.statusText;
      }
      
      if (response.status === 401) {
        throw new Error(`NFT.Storage API authentication failed. Please check your API key.`);
      }
      
      throw new Error(`Failed to add token: ${errorMessage || response.statusText}`);
    }
    
    console.log('Token added to collection successfully');
    return true;
  } catch (error) {
    console.error('Error adding token to collection:', error);
    throw error;
  }
}

/**
 * Uploads an image to IPFS via NFT.Storage
 * @param imageFile - The image file to upload
 * @param tokenId - Optional token ID to associate with the upload
 * @returns The IPFS CID (Content Identifier)
 */
export async function uploadImage(imageFile: File, tokenId?: string): Promise<string> {
  try {
    const apiKey = STORAGE_CONFIG.apiKey;
    
    // Validate API key format before attempting upload
    if (!apiKey || apiKey.length < 10) {
      throw new Error('Invalid NFT.Storage API key. Please check your NFT_STORAGE_KEY in the .env file.');
    }
    
    console.log(`Attempting to upload with API key: ${apiKey.substring(0, 5)}...`);
    
    // First upload the file to get a CID - focus only on this basic functionality
    const cid = await uploadFileStandard(imageFile);
    console.log('Standard upload successful, CID:', cid);
    
    // Skip collection functionality for now
    // if (tokenId) {
    //   try {
    //     await addTokenToCollection(tokenId, cid);
    //   } catch (collectionError) {
    //     console.error('Error adding to collection, but file was uploaded:', collectionError);
    //   }
    // }
    
    return cid;
  } catch (error) {
    console.error('Error uploading image to IPFS:', error);
    
    // Provide more context for API key errors
    if (error instanceof Error && 
        (error.message.includes('API key') || 
         error.message.includes('token') ||
         error.message.includes('Unauthorized') || 
         error.message.includes('authenticate'))) {
      throw new Error(`NFT.Storage API authentication failed. Please check that your NFT_STORAGE_KEY in the .env file is correct. NFT.Storage API keys are typically 40+ characters long and should be entered exactly as provided from nft.storage dashboard.`);
    }
    
    throw error;
  }
}

/**
 * Creates and uploads NFT metadata to IPFS
 * @param metadata - The NFT metadata object
 * @param tokenId - Optional token ID to associate with the metadata
 * @returns The IPFS URI for the metadata
 */
export async function uploadMetadata(metadata: NFTMetadata, tokenId?: string): Promise<string> {
  try {
    // If the image is already a CID string, create a proper IPFS URL
    let imageUrl: string;
    if (typeof metadata.image === 'string') {
      imageUrl = `ipfs://${metadata.image}`;
    } else {
      // First upload the image and get its CID - skip collection functionality
      const imageCid = await uploadImage(metadata.image);
      imageUrl = `ipfs://${imageCid}`;
    }
    
    // Create the metadata JSON
    const metadataJson = {
      name: metadata.name,
      description: metadata.description,
      image: imageUrl,
      attributes: metadata.attributes || []
    };
    
    // Convert metadata to a File object
    const metadataFile = new File(
      [JSON.stringify(metadataJson, null, 2)],
      'metadata.json', 
      { type: 'application/json' }
    );
    
    // Upload the metadata file - skip collection functionality
    const metadataCid = await uploadImage(metadataFile);
    
    // Return the full IPFS URI
    return `ipfs://${metadataCid}`;
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