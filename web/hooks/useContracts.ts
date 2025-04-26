import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useAccount, useNetwork } from 'wagmi';
import { 
  CONTRACT_ADDRESSES, 
  DOTCANVAS_NFT_ABI, 
  DOTCANVAS_MARKET_ABI,
  NETWORK_CONFIG
} from '../lib/config';
import { NFTData, NFTListing, TransactionResult } from '../types';
import { fetchNFTData, formatNFTListing } from '../lib/nft';

// Add ethereum to window object type
declare global {
  interface Window {
    ethereum?: any;
  }
}

/**
 * Custom hook for interacting with DotCanvas smart contracts
 */
export default function useContracts() {
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  
  const [nftContract, setNftContract] = useState<ethers.Contract | null>(null);
  const [marketContract, setMarketContract] = useState<ethers.Contract | null>(null);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize contracts when connected
  useEffect(() => {
    if (!isConnected || !window.ethereum) {
      setNftContract(null);
      setMarketContract(null);
      setIsCorrectNetwork(false);
      return;
    }
    
    // Reset error state
    setError(null);

    try {
      // Create provider from window.ethereum
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // Get signer for transactions
      provider.getSigner().then(signer => {
        // Check if we're on the correct network
        const correctNetwork = chain?.id === NETWORK_CONFIG.chainId;
        setIsCorrectNetwork(correctNetwork);
        
        if (!correctNetwork) {
          setNftContract(null);
          setMarketContract(null);
          return;
        }
        
        // Initialize NFT contract
        const nft = new ethers.Contract(
          CONTRACT_ADDRESSES.DotCanvasNFT,
          DOTCANVAS_NFT_ABI,
          signer
        );
        
        // Initialize Market contract
        const market = new ethers.Contract(
          CONTRACT_ADDRESSES.DotCanvasMarket,
          DOTCANVAS_MARKET_ABI,
          signer
        );
        
        setNftContract(nft);
        setMarketContract(market);
      }).catch(error => {
        console.error("Failed to get signer:", error);
        setNftContract(null);
        setMarketContract(null);
        setError("Failed to connect to wallet");
      });
    } catch (error) {
      console.error("Error initializing contracts:", error);
      setError("Error initializing contracts");
      setNftContract(null);
      setMarketContract(null);
    }
  }, [isConnected, chain?.id]);
  
  /**
   * Utility function to handle contract transactions with standardized error handling
   */
  const executeTransaction = async <T,>(
    txFunction: () => Promise<T>,
    loadingMessage = 'Processing transaction'
  ): Promise<TransactionResult> => {
    if (!isConnected || !isCorrectNetwork) {
      return {
        success: false,
        error: 'Please connect to Polkadot Asset Hub Westend network'
      };
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await txFunction();
      return { success: true, ...result as any };
    } catch (error: any) {
      console.error('Transaction error:', error);
      
      // Extract error message
      let errorMessage = 'Transaction failed';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.reason) {
        errorMessage = error.reason;
      }
      
      // Clean up common error messages
      if (errorMessage.includes('user rejected transaction')) {
        errorMessage = 'Transaction was rejected';
      } else if (errorMessage.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for transaction';
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Mint a new NFT with the given tokenURI
   */
  const mintNFT = useCallback(async (tokenURI: string): Promise<TransactionResult> => {
    return executeTransaction(async () => {
      if (!nftContract) {
        throw new Error('Contract not initialized');
      }
      
      const tx = await nftContract.mint(tokenURI);
      const receipt = await tx.wait();
      
      // Find the NFTMinted event to get the tokenId
      const event = receipt.logs
        .map((log: any) => {
          try {
            return nftContract.interface.parseLog(log);
          } catch (e) {
            return null;
          }
        })
        .find((event: any) => event && event.name === 'NFTMinted');
      
      const tokenId = event?.args?.tokenId?.toString() || null;
      
      return {
        txHash: receipt.hash,
        tokenId
      };
    }, 'Minting NFT');
  }, [nftContract, isCorrectNetwork]);
  
  /**
   * Set royalty for an NFT
   */
  const setTokenRoyalty = useCallback(async (
    tokenId: string,
    percentage: number
  ): Promise<TransactionResult> => {
    return executeTransaction(async () => {
      if (!nftContract) {
        throw new Error('Contract not initialized');
      }
      
      // Check token ownership
      const owner = await nftContract.ownerOf(tokenId);
      if (owner.toLowerCase() !== address?.toLowerCase()) {
        throw new Error('You do not own this NFT');
      }
      
      // Convert percentage to basis points (e.g., 5% = 500 basis points)
      const feeNumerator = Math.floor(percentage * 100);
      
      const tx = await nftContract.setTokenRoyalty(tokenId, address, feeNumerator);
      const receipt = await tx.wait();
      
      return {
        txHash: receipt.hash,
        tokenId
      };
    }, 'Setting royalty');
  }, [nftContract, address, isCorrectNetwork]);
  
  /**
   * Approve the marketplace to transfer an NFT
   */
  const approveMarket = useCallback(async (tokenId: string): Promise<TransactionResult> => {
    return executeTransaction(async () => {
      if (!nftContract) {
        throw new Error('Contract not initialized');
      }
      
      const tx = await nftContract.approve(CONTRACT_ADDRESSES.DotCanvasMarket, tokenId);
      const receipt = await tx.wait();
      
      return {
        txHash: receipt.hash,
        tokenId
      };
    }, 'Approving marketplace');
  }, [nftContract, isCorrectNetwork]);
  
  /**
   * List an NFT for sale
   */
  const listNFT = useCallback(async (tokenId: string, price: string): Promise<TransactionResult> => {
    return executeTransaction(async () => {
      if (!marketContract || !nftContract) {
        throw new Error('Contracts not initialized');
      }
      
      // Check token ownership
      const owner = await nftContract.ownerOf(tokenId);
      if (owner.toLowerCase() !== address?.toLowerCase()) {
        throw new Error('You do not own this NFT');
      }
      
      // Check if marketplace is approved
      const approved = await nftContract.getApproved(tokenId);
      if (approved !== CONTRACT_ADDRESSES.DotCanvasMarket) {
        throw new Error('Marketplace not approved to transfer this NFT');
      }
      
      // Convert price to wei
      const priceInWei = ethers.parseEther(price);
      
      const tx = await marketContract.listNFT(
        CONTRACT_ADDRESSES.DotCanvasNFT,
        tokenId,
        priceInWei
      );
      
      const receipt = await tx.wait();
      
      // Find the NFTListed event to get the listingId
      const event = receipt.logs
        .map((log: any) => {
          try {
            return marketContract.interface.parseLog(log);
          } catch (e) {
            return null;
          }
        })
        .find((event: any) => event && event.name === 'NFTListed');
      
      const listingId = event?.args?.listingId?.toString() || null;
      
      return {
        txHash: receipt.hash,
        tokenId,
        listingId
      };
    }, 'Listing NFT for sale');
  }, [marketContract, nftContract, address, isCorrectNetwork]);
  
  /**
   * Buy an NFT from the marketplace
   */
  const buyNFT = useCallback(async (listingId: string, price: string): Promise<TransactionResult> => {
    return executeTransaction(async () => {
      if (!marketContract) {
        throw new Error('Contract not initialized');
      }
      
      // Convert price to wei
      const priceInWei = ethers.parseEther(price);
      
      const tx = await marketContract.buyNFT(listingId, {
        value: priceInWei
      });
      
      const receipt = await tx.wait();
      
      // Find the NFTSold event
      const event = receipt.logs
        .map((log: any) => {
          try {
            return marketContract.interface.parseLog(log);
          } catch (e) {
            return null;
          }
        })
        .find((event: any) => event && event.name === 'NFTSold');
      
      const tokenId = event?.args?.tokenId?.toString() || null;
      
      return {
        txHash: receipt.hash,
        listingId,
        tokenId
      };
    }, 'Buying NFT');
  }, [marketContract, isCorrectNetwork]);
  
  /**
   * Cancel an NFT listing
   */
  const cancelListing = useCallback(async (listingId: string): Promise<TransactionResult> => {
    return executeTransaction(async () => {
      if (!marketContract) {
        throw new Error('Contract not initialized');
      }
      
      // Verify listing ownership
      const listing = await marketContract.getListing(listingId);
      if (listing.seller.toLowerCase() !== address?.toLowerCase()) {
        throw new Error('You are not the seller of this listing');
      }
      
      const tx = await marketContract.cancelListing(listingId);
      const receipt = await tx.wait();
      
      return {
        txHash: receipt.hash,
        listingId
      };
    }, 'Cancelling listing');
  }, [marketContract, address, isCorrectNetwork]);
  
  /**
   * Get details of an NFT listing
   */
  const getListing = useCallback(async (listingId: string): Promise<NFTListing | null> => {
    try {
      if (!marketContract || !nftContract) {
        throw new Error('Contracts not initialized');
      }
      
      const listing = await marketContract.getListing(listingId);
      
      if (!listing.active) {
        return null;
      }
      
      // Get token URI and owner
      const tokenId = listing.tokenId.toString();
      const tokenURI = await nftContract.tokenURI(tokenId);
      const owner = listing.seller;
      
      // Fetch NFT data
      const nftData = await fetchNFTData(tokenId, tokenURI, owner);
      
      // Format the listing
      return formatNFTListing(
        listingId,
        listing.seller,
        tokenId,
        listing.price,
        nftData
      );
    } catch (error) {
      console.error('Error getting listing:', error);
      setError('Failed to fetch listing details');
      return null;
    }
  }, [marketContract, nftContract]);
  
  /**
   * Get NFT data for a token ID
   */
  const getNFTData = useCallback(async (tokenId: string): Promise<NFTData | null> => {
    try {
      if (!nftContract) {
        throw new Error('Contract not initialized');
      }
      
      const tokenURI = await nftContract.tokenURI(tokenId);
      const owner = await nftContract.ownerOf(tokenId);
      
      return await fetchNFTData(tokenId, tokenURI, owner);
    } catch (error) {
      console.error('Error getting NFT data:', error);
      setError('Failed to fetch NFT details');
      return null;
    }
  }, [nftContract]);
  
  /**
   * Get all active listings
   */
  const getActiveListings = useCallback(async (): Promise<NFTListing[]> => {
    try {
      if (!marketContract || !nftContract) {
        throw new Error('Contracts not initialized');
      }
      
      const listingCount = await marketContract.getListingCount();
      const listings: NFTListing[] = [];
      
      for (let i = 0; i < listingCount; i++) {
        try {
          const listingId = await marketContract.getListingByIndex(i);
          const listing = await marketContract.getListing(listingId);
          
          if (listing.active) {
            const tokenId = listing.tokenId.toString();
            const tokenURI = await nftContract.tokenURI(tokenId);
            const nftData = await fetchNFTData(tokenId, tokenURI, listing.seller);
            
            listings.push(
              formatNFTListing(
                listingId.toString(),
                listing.seller,
                tokenId,
                listing.price,
                nftData
              )
            );
          }
        } catch (error) {
          console.error(`Error with listing ${i}:`, error);
          // Continue with other listings
        }
      }
      
      return listings;
    } catch (error) {
      console.error('Error getting active listings:', error);
      setError('Failed to fetch active listings');
      return [];
    }
  }, [marketContract, nftContract]);
  
  /**
   * Get all NFTs owned by the current user
   */
  const getOwnedNFTs = useCallback(async (): Promise<NFTData[]> => {
    try {
      if (!nftContract || !address) {
        return [];
      }
      
      const balance = await nftContract.balanceOf(address);
      const ownedNFTs: NFTData[] = [];
      
      for (let i = 0; i < balance; i++) {
        try {
          const tokenId = await nftContract.tokenOfOwnerByIndex(address, i);
          const tokenURI = await nftContract.tokenURI(tokenId);
          const nftData = await fetchNFTData(tokenId.toString(), tokenURI, address);
          
          ownedNFTs.push(nftData);
        } catch (error) {
          console.error(`Error with NFT ${i}:`, error);
          // Continue with other NFTs
        }
      }
      
      return ownedNFTs;
    } catch (error) {
      console.error('Error getting owned NFTs:', error);
      setError('Failed to fetch owned NFTs');
      return [];
    }
  }, [nftContract, address]);
  
  /**
   * Check if the current network is the correct one and prompt to switch if not
   */
  const switchToCorrectNetwork = useCallback(async (): Promise<boolean> => {
    if (isCorrectNetwork) return true;
    
    if (!window.ethereum) {
      setError('Ethereum provider not found');
      return false;
    }
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${NETWORK_CONFIG.chainId.toString(16)}` }],
      });
      
      return true;
    } catch (error: any) {
      console.error('Error switching network:', error);
      
      // If the chain hasn't been added to the user's wallet
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${NETWORK_CONFIG.chainId.toString(16)}`,
                chainName: NETWORK_CONFIG.name,
                nativeCurrency: {
                  name: NETWORK_CONFIG.currency.name,
                  symbol: NETWORK_CONFIG.currency.symbol,
                  decimals: NETWORK_CONFIG.currency.decimals,
                },
                rpcUrls: [NETWORK_CONFIG.rpcUrl],
                blockExplorerUrls: [NETWORK_CONFIG.blockExplorer],
              },
            ],
          });
          
          return true;
        } catch (addError) {
          console.error('Error adding chain:', addError);
          setError('Failed to add network to wallet');
          return false;
        }
      }
      
      setError('Failed to switch network');
      return false;
    }
  }, [isCorrectNetwork]);
  
  return {
    nftContract,
    marketContract,
    isCorrectNetwork,
    isLoading,
    error,
    address,
    mintNFT,
    setTokenRoyalty,
    approveMarket,
    listNFT,
    buyNFT,
    cancelListing,
    getListing,
    getNFTData,
    getActiveListings,
    getOwnedNFTs,
    switchToCorrectNetwork
  };
}
