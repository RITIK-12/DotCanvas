import { useState, useEffect } from 'react';
import { getIpfsGatewayUrl } from '../lib/ipfs';
import useContracts from '../hooks/useContracts';
import { toast } from 'react-hot-toast';

interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: {
    trait_type: string;
    value: string | number;
  }[];
}

interface GalleryCardProps {
  listing: {
    id: string;
    tokenId: string;
    price: string;
    seller: string;
    tokenURI: string;
    metadata?: NFTMetadata;
  };
  isOwned?: boolean;
  onBuy?: () => void;
}

export default function GalleryCard({ listing, isOwned = false, onBuy }: GalleryCardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [metadata, setMetadata] = useState<NFTMetadata | null>(null);
  const [isListing, setIsListing] = useState(false);
  const { approveMarket, listNFT } = useContracts();
  
  // Load metadata if not already provided
  useEffect(() => {
    const loadMetadata = async () => {
      if (listing.metadata) {
        setMetadata(listing.metadata);
        setIsLoading(false);
        return;
      }
      
      try {
        // This is a simplified example - in a real app you would:
        // 1. Convert ipfs:// URI to HTTP gateway URL
        // 2. Fetch the metadata
        // 3. Parse the response
        
        // For demo purposes, just set placeholder metadata
        setMetadata({
          name: "DotCanvas Artwork",
          description: "A beautiful AI-generated image",
          image: "ipfs://placeholder",
          attributes: [
            { trait_type: "Artist", value: "AI" },
            { trait_type: "Generator", value: "Stable Diffusion XL" }
          ]
        });
      } catch (error) {
        console.error('Error loading metadata:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadMetadata();
  }, [listing]);
  
  // Convert IPFS URI to HTTP URL
  const getImageUrl = (ipfsUri: string) => {
    if (!ipfsUri) return '/placeholder.png';
    
    if (ipfsUri.startsWith('ipfs://')) {
      const cid = ipfsUri.replace('ipfs://', '');
      return getIpfsGatewayUrl(cid);
    }
    
    return ipfsUri;
  };
  
  // Handle listing NFT for sale
  const handleListForSale = async () => {
    try {
      setIsListing(true);
      
      // 1. Show price input modal (simplified here)
      const price = prompt('Enter price in WND:');
      if (!price) {
        setIsListing(false);
        return;
      }
      
      // 2. Approve marketplace to transfer NFT
      const approvalTx = await approveMarket(listing.tokenId);
      toast.success('Marketplace approved to transfer NFT');
      
      // 3. List NFT on marketplace
      const listingResult = await listNFT(listing.tokenId, price);
      toast.success('NFT listed for sale!');
      
      // In a real app, you would update the UI to show the NFT is now listed
      
    } catch (error) {
      console.error('Error listing NFT:', error);
      toast.error('Failed to list NFT');
    } finally {
      setIsListing(false);
    }
  };
  
  return (
    <div className="rounded-xl overflow-hidden bg-white shadow-md transition-all hover:shadow-lg">
      {/* Image */}
      <div className="relative aspect-square bg-gray-100">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <img 
            src={metadata ? getImageUrl(metadata.image) : '/placeholder.png'} 
            alt={metadata?.name || 'NFT'} 
            className="w-full h-full object-cover"
          />
        )}
      </div>
      
      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-lg truncate">
          {isLoading ? 'Loading...' : metadata?.name || 'Untitled NFT'}
        </h3>
        <p className="text-gray-500 text-sm truncate">
          Token ID: {listing.tokenId}
        </p>
        
        {!isOwned && (
          <div className="mt-3 flex items-center justify-between">
            <div className="font-medium text-gray-800">
              {listing.price} WND
            </div>
            <button 
              onClick={onBuy}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              Buy Now
            </button>
          </div>
        )}
        
        {isOwned && (
          <div className="mt-3">
            <button 
              onClick={handleListForSale}
              disabled={isListing}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm disabled:bg-gray-400"
            >
              {isListing ? 'Listing...' : 'List for Sale'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
