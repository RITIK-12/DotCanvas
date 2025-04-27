// React hooks for contract interactions
import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, DOTCANVAS_NFT_ABI, DOTCANVAS_MARKET_ABI } from './config';
import { NFT, NFTListing } from './nft';
import { ipfsToHttps } from './ipfs';

// Simple fetchMetadata function to replace the missing export
async function fetchMetadata(uri: string): Promise<any> {
  try {
    const url = ipfsToHttps(uri);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch metadata: ${response.statusText}`);
    }
    
    const metadata = await response.json();
    
    // Convert the image URI to HTTP if needed
    if (metadata.image) {
      metadata.image = ipfsToHttps(metadata.image);
    }
    
    return metadata;
  } catch (error) {
    console.error('Error fetching metadata from IPFS:', error);
    throw error;
  }
}

// Hook for accessing NFT contract functions
export function useNFTContract() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [nftContract, setNFTContract] = useState<ethers.Contract | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [userAddress, setUserAddress] = useState<string>('');
  const [connected, setConnected] = useState(false);

  // Connect to the wallet and set up the contract
  const connect = useCallback(async () => {
    if (window.ethereum) {
      try {
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // Create provider and signer
        const ethersProvider = new ethers.BrowserProvider(window.ethereum);
        const ethersSigner = await ethersProvider.getSigner();
        const address = await ethersSigner.getAddress();
        
        // Create contract instance
        const contract = new ethers.Contract(
          CONTRACT_ADDRESSES.DotCanvasNFT,
          DOTCANVAS_NFT_ABI,
          ethersSigner
        );
        
        // Check if contract is deployed by calling a view function
        try {
          await contract.name();
          console.log("NFT contract connected successfully");
        } catch (contractError) {
          console.warn("NFT contract might not be deployed at the specified address:", contractError);
          // We'll still set the contract, but UI should handle failures gracefully
        }
        
        setProvider(ethersProvider);
        setSigner(ethersSigner);
        setNFTContract(contract);
        setUserAddress(address);
        setConnected(true);
        
        return true;
      } catch (error) {
        console.error('Error connecting to wallet:', error);
        return false;
      }
    } else {
      console.error('Ethereum provider not found. Install MetaMask or another provider.');
      return false;
    }
  }, []);

  // Disconnect from the wallet
  const disconnect = useCallback(() => {
    setProvider(null);
    setSigner(null);
    setNFTContract(null);
    setUserAddress('');
    setConnected(false);
  }, []);

  // Get NFTs owned by the connected user
  const getUserNFTs = useCallback(async (): Promise<NFT[]> => {
    if (!nftContract || !userAddress) return [];
    
    try {
      // First, check if the contract supports the required interfaces
      try {
        const balance = await nftContract.balanceOf(userAddress);
        const balanceNumber = Number(balance);
        
        const nfts: NFT[] = [];
        
        for (let i = 0; i < balanceNumber; i++) {
          try {
            const tokenId = await nftContract.tokenOfOwnerByIndex(userAddress, i);
            const uri = await nftContract.tokenURI(tokenId);
            const metadata = await fetchMetadata(uri);
            
            nfts.push({
              id: i,
              tokenId: Number(tokenId),
              owner: userAddress,
              creator: userAddress, // This is a simplification; in reality, we might want to track the original creator
              metadata,
              uri
            });
          } catch (indexError) {
            console.error(`Error fetching token at index ${i}:`, indexError);
            // Continue to the next token even if one fails
          }
        }
        
        return nfts;
      } catch (balanceError) {
        console.error('Error checking balance:', balanceError);
        
        // Fallback approach: If the contract doesn't properly implement balanceOf
        // or if there's another issue, return an empty array
        console.log('NFT Contract may not be deployed or does not implement ERC721 correctly.');
        return [];
      }
    } catch (error) {
      console.error('Error fetching user NFTs:', error);
      return [];
    }
  }, [nftContract, userAddress]);

  // Mint a new NFT
  const mintNFT = useCallback(async (metadataURI: string): Promise<number | null> => {
    if (!nftContract || !signer) return null;
    
    try {
      const tx = await nftContract.mint(metadataURI);
      const receipt = await tx.wait();
      
      // Get the token ID from the event
      const event = receipt.logs
        .filter((log: any) => log.topics[0] === ethers.id("NFTMinted(address,uint256,string)"))
        .map((log: any) => {
          const parsed = nftContract.interface.parseLog({
            topics: log.topics,
            data: log.data
          });
          return parsed;
        })[0];
      
      if (event && event.args) {
        return Number(event.args.tokenId);
      }
      
      return null;
    } catch (error) {
      console.error('Error minting NFT:', error);
      return null;
    }
  }, [nftContract, signer]);

  return {
    provider,
    nftContract,
    signer,
    userAddress,
    connected,
    connect,
    disconnect,
    getUserNFTs,
    mintNFT
  };
}

// Hook for accessing marketplace contract functions
export function useMarketContract() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [marketContract, setMarketContract] = useState<ethers.Contract | null>(null);
  const [nftContract, setNFTContract] = useState<ethers.Contract | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [userAddress, setUserAddress] = useState<string>('');
  const [connected, setConnected] = useState(false);

  // Connect to the wallet and set up the contract
  const connect = useCallback(async () => {
    if (window.ethereum) {
      try {
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // Create provider and signer
        const ethersProvider = new ethers.BrowserProvider(window.ethereum);
        const ethersSigner = await ethersProvider.getSigner();
        const address = await ethersSigner.getAddress();
        
        // Create contract instances
        const marketContractInstance = new ethers.Contract(
          CONTRACT_ADDRESSES.DotCanvasMarket,
          DOTCANVAS_MARKET_ABI,
          ethersSigner
        );
        
        const nftContractInstance = new ethers.Contract(
          CONTRACT_ADDRESSES.DotCanvasNFT,
          DOTCANVAS_NFT_ABI,
          ethersSigner
        );
        
        // Check if contracts are deployed by calling view functions
        try {
          await marketContractInstance.getListingCount();
          console.log("Market contract connected successfully");
        } catch (contractError) {
          console.warn("Market contract might not be deployed at the specified address:", contractError);
          // We'll still set the contract, but UI should handle failures gracefully
        }
        
        try {
          await nftContractInstance.name();
          console.log("NFT contract connected successfully from market hook");
        } catch (contractError) {
          console.warn("NFT contract might not be deployed at the specified address (from market hook):", contractError);
        }
        
        setProvider(ethersProvider);
        setSigner(ethersSigner);
        setMarketContract(marketContractInstance);
        setNFTContract(nftContractInstance);
        setUserAddress(address);
        setConnected(true);
        
        return true;
      } catch (error) {
        console.error('Error connecting to wallet:', error);
        return false;
      }
    } else {
      console.error('Ethereum provider not found. Install MetaMask or another provider.');
      return false;
    }
  }, []);

  // Disconnect from the wallet
  const disconnect = useCallback(() => {
    setProvider(null);
    setSigner(null);
    setMarketContract(null);
    setNFTContract(null);
    setUserAddress('');
    setConnected(false);
  }, []);

  // Get all active listings
  const getActiveListings = useCallback(async (): Promise<NFTListing[]> => {
    if (!marketContract) return [];
    
    try {
      const listingCount = await marketContract.getListingCount();
      const listings: NFTListing[] = [];
      
      for (let i = 0; i < listingCount; i++) {
        const listingId = await marketContract.getListingByIndex(i);
        const listing = await marketContract.getListing(listingId);
        
        if (listing.active) {
          listings.push({
            id: Number(listingId),
            seller: listing.seller,
            nftContract: listing.nftContract,
            tokenId: Number(listing.tokenId),
            price: listing.price,
            active: listing.active
          });
        }
      }
      
      return listings;
    } catch (error) {
      console.error('Error fetching active listings:', error);
      return [];
    }
  }, [marketContract]);

  // List an NFT for sale
  const listNFT = useCallback(async (tokenId: number, price: string): Promise<number | null> => {
    if (!marketContract || !nftContract || !signer) return null;
    
    try {
      // First approve the marketplace to transfer the NFT
      const approvalTx = await nftContract.approve(CONTRACT_ADDRESSES.DotCanvasMarket, tokenId);
      await approvalTx.wait();
      
      // Then list the NFT
      const priceWei = ethers.parseUnits(price, 18); // 18 decimals for DOT
      const listingTx = await marketContract.listNFT(
        CONTRACT_ADDRESSES.DotCanvasNFT,
        tokenId,
        priceWei
      );
      const receipt = await listingTx.wait();
      
      // Get the listing ID from the event
      const event = receipt.logs
        .filter((log: any) => log.topics[0] === ethers.id("NFTListed(uint256,address,address,uint256,uint256)"))
        .map((log: any) => {
          const parsed = marketContract.interface.parseLog({
            topics: log.topics,
            data: log.data
          });
          return parsed;
        })[0];
      
      if (event && event.args) {
        return Number(event.args.listingId);
      }
      
      return null;
    } catch (error) {
      console.error('Error listing NFT:', error);
      return null;
    }
  }, [marketContract, nftContract, signer]);

  // Buy an NFT
  const buyNFT = useCallback(async (listingId: number, price: string): Promise<boolean> => {
    if (!marketContract || !signer) return false;
    
    try {
      const priceWei = ethers.parseUnits(price, 18); // 18 decimals for DOT
      const tx = await marketContract.buyNFT(listingId, { value: priceWei });
      await tx.wait();
      return true;
    } catch (error) {
      console.error('Error buying NFT:', error);
      return false;
    }
  }, [marketContract, signer]);

  // Cancel a listing
  const cancelListing = useCallback(async (listingId: number): Promise<boolean> => {
    if (!marketContract || !signer) return false;
    
    try {
      const tx = await marketContract.cancelListing(listingId);
      await tx.wait();
      return true;
    } catch (error) {
      console.error('Error canceling listing:', error);
      return false;
    }
  }, [marketContract, signer]);

  return {
    provider,
    marketContract,
    nftContract,
    signer,
    userAddress,
    connected,
    connect,
    disconnect,
    getActiveListings,
    listNFT,
    buyNFT,
    cancelListing
  };
} 