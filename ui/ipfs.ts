// ipfs.ts – Preserve-only helpers for DotCanvas
// Updated 27-Apr-2025 to match https://app.nft.storage/v1/docs/client/http-api
// – NO MORE Classic uploads (storeBlob, storeJSON, etc.)
// – All endpoints point at https://preserve.nft.storage/api/v1
// – Extra helpers: listTokens, dealStatus, retryToken, deleteFailedToken,
//   listApiKeys, removeApiKey, getUserBalance
// – CSV is passed as Buffer → FormData (filename=tokens.csv, type=text/csv)

import FormData from 'form-data';
import { STORAGE_CONFIG, CONTRACT_ADDRESSES } from './config';

/* -------------------------------------------------------------------------- */
/*  Auth helper                                                                */
/* -------------------------------------------------------------------------- */

type HeadersInit = Record<string, string>;
const authHeaders = (): HeadersInit => ({
  Authorization: `Bearer ${STORAGE_CONFIG.apiKey}`,
});

const pinataHeaders = (): HeadersInit => {
  // Use API key and secret if available, otherwise fall back to JWT
  if (STORAGE_CONFIG.pinataApiKey && STORAGE_CONFIG.pinataApiSecret) {
    return {
      'pinata_api_key': STORAGE_CONFIG.pinataApiKey,
      'pinata_secret_api_key': STORAGE_CONFIG.pinataApiSecret
    };
  }
  return {
    Authorization: `Bearer ${STORAGE_CONFIG.pinataJWT}`,
  };
};

/* -------------------------------------------------------------------------- */
/*  Base URL                                                                   */
/* -------------------------------------------------------------------------- */

const PRESERVE_BASE = 'https://preserve.nft.storage/api/v1';
const PINATA_API_BASE = 'https://api.pinata.cloud';

/* -------------------------------------------------------------------------- */
/*  NFT Metadata Types                                                         */
/* -------------------------------------------------------------------------- */

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

/* -------------------------------------------------------------------------- */
/*  File Upload and Metadata Storage (Pinata)                                  */
/* -------------------------------------------------------------------------- */

export async function uploadFile(file: File): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  
  // Ensure API credentials are strings
  const apiKey = String(STORAGE_CONFIG.pinataApiKey || '');
  const apiSecret = String(STORAGE_CONFIG.pinataApiSecret || '');
  
  if (!apiKey || !apiSecret) {
    throw new Error('Pinata API credentials not found. Please ensure NEXT_PUBLIC_PINATA_API_KEY and NEXT_PUBLIC_PINATA_API_SECRET are set in your .env.local file.');
  }
  
  console.log('Using Pinata credentials:', { 
    keyLength: apiKey.length,
    secretLength: apiSecret.length,
    keyPrefix: apiKey.substring(0, 3) + '...',
  });
  
  const res = await fetch(`${PINATA_API_BASE}/pinning/pinFileToIPFS`, {
    method: 'POST',
    headers: {
      'pinata_api_key': apiKey,
      'pinata_secret_api_key': apiSecret
    },
    body: form as any,
  });
  
  if (!res.ok) {
    throw new Error(`uploadFile → ${res.status} ${res.statusText} : ${await res.text()}`);
  }
  
  const { IpfsHash } = await res.json();
  return `ipfs://${IpfsHash}`;
}

export async function uploadMetadata(metadata: NFTMetadata): Promise<string> {
  // Ensure API credentials are strings
  const apiKey = String(STORAGE_CONFIG.pinataApiKey || '');
  const apiSecret = String(STORAGE_CONFIG.pinataApiSecret || '');
  
  if (!apiKey || !apiSecret) {
    throw new Error('Pinata API credentials not found. Please ensure NEXT_PUBLIC_PINATA_API_KEY and NEXT_PUBLIC_PINATA_API_SECRET are set in your .env.local file.');
  }
  
  const res = await fetch(`${PINATA_API_BASE}/pinning/pinJSONToIPFS`, {
    method: 'POST',
    headers: {
      'pinata_api_key': apiKey,
      'pinata_secret_api_key': apiSecret,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(metadata),
  });
  
  if (!res.ok) {
    throw new Error(`uploadMetadata → ${res.status} ${res.statusText} : ${await res.text()}`);
  }
  
  const { IpfsHash } = await res.json();
  return `ipfs://${IpfsHash}`;
}

/* -------------------------------------------------------------------------- */
/*  Collections                                                                */
/* -------------------------------------------------------------------------- */

export async function createCollection(
  collectionName = 'DotCanvas'
): Promise<string> {
  const res = await fetch(`${PRESERVE_BASE}/collection/create_collection`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({
      collectionName,
      contractAddress: CONTRACT_ADDRESSES.DotCanvasNFT,
      chainID: '420420421', // Westend Asset Hub chain ID
      network: 'Polkadot',
    }),
  });

  if (!res.ok) {
    throw new Error(
      `createCollection → ${res.status} ${res.statusText} : ${await res.text()}`
    );
  }
  const json = await res.json();
  return json.value?.collectionId ?? json.collectionId ?? json.id;
}

export async function listCollections() {
  const res = await fetch(`${PRESERVE_BASE}/collection/list_collections`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`listCollections → ${res.status}`);
  return res.json();
}

/* -------------------------------------------------------------------------- */
/*  Add tokens (CSV upload)                                                    */
/* -------------------------------------------------------------------------- */

export async function addTokensToCollection(
  collectionID: string,
  rows: { tokenID: string; cid: string }[]
) {
  // Build CSV: header then each row
  const csv = [
    'tokenID,cid',
    ...rows.map(({ tokenID, cid }) => `${tokenID},${cid}`),
  ].join('\n');

  const form = new FormData();
  form.append('collectionID', collectionID);
  form.append('file', Buffer.from(csv), {
    filename: 'tokens.csv',
    contentType: 'text/csv',
  });

  const res = await fetch(`${PRESERVE_BASE}/collection/add_tokens`, {
    method: 'POST',
    headers: { ...authHeaders(), ...form.getHeaders() },
    body: form as any,
  });

  if (!res.ok) {
    throw new Error(
      `addTokens → ${res.status} ${res.statusText} : ${await res.text()}`
    );
  }
  return res.json();
}

/* -------------------------------------------------------------------------- */
/*  Pagination helper                                                          */
/* -------------------------------------------------------------------------- */

export async function listTokens(
  collectionID: string,
  lastKey?: string
): Promise<any> {
  const url = new URL(`${PRESERVE_BASE}/collection/list_tokens`);
  url.searchParams.set('collectionID', collectionID);
  if (lastKey) url.searchParams.set('lastKey', lastKey);

  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) throw new Error(`listTokens → ${res.status}`);
  return res.json(); // { tokens: [...], lastKey?: string }
}

/* -------------------------------------------------------------------------- */
/*  Deal status & recovery utilities                                           */
/* -------------------------------------------------------------------------- */

export const dealStatus = async (cid: string) => {
  const url = `${PRESERVE_BASE}/collection/deal_status?cid=${cid}`;
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) throw new Error(`dealStatus → ${res.status}`);
  return res.json();
};

export const retryToken = async (tokenID: string) => {
  const url = `${PRESERVE_BASE}/collection/retry_tokens?tokenID=${tokenID}`;
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) throw new Error(`retryToken → ${res.status}`);
  return res.json();
};

export const deleteFailedToken = async (tokenID: string) => {
  const url = `${PRESERVE_BASE}/collection/delete_tokens?tokenID=${tokenID}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`deleteFailedToken → ${res.status}`);
  return res.json();
};

/* -------------------------------------------------------------------------- */
/*  Account utilities                                                          */
/* -------------------------------------------------------------------------- */

export const listApiKeys = async () => {
  const res = await fetch(`${PRESERVE_BASE}/auth/list_api_keys`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`listApiKeys → ${res.status}`);
  return res.json();
};

export const removeApiKey = async (keyID: string) => {
  const url = `${PRESERVE_BASE}/auth/remove_api_key?keyID=${keyID}`;
  const res = await fetch(url, { method: 'DELETE', headers: authHeaders() });
  if (!res.ok) throw new Error(`removeApiKey → ${res.status}`);
  return res.json();
};

export const getUserBalance = async () => {
  const res = await fetch(`${PRESERVE_BASE}/user/get_balance`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`getUserBalance → ${res.status}`);
  return res.json(); // { availableStorage: "...", usedStorage: "..." }
};

/* -------------------------------------------------------------------------- */
/*  Utility: ipfs:// → https:// gateway                                        */
/* -------------------------------------------------------------------------- */

export const ipfsToHttps = (uri: string): string =>
  uri.startsWith('ipfs://')
    ? `${STORAGE_CONFIG.gatewayUrl}${uri.replace('ipfs://', '')}`
    : uri;
