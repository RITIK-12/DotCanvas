import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { getIpfsGatewayUrl } from '../lib/ipfs';
import useContracts from '../hooks/useContracts';

interface BuyModalProps {
  listing: {
    id: string;
    tokenId: string;
    price: string;
    seller: string;
    metadata?: {
      name: string;
      image: string;
    };
  };
  onClose: () => void;
}

export default function BuyModal({ listing, onClose }: BuyModalProps) {
  const [isPurchasing, setIsPurchasing] = useState(false);
  const { buyNFT } = useContracts();
  
  // Handle purchase
  const handlePurchase = async () => {
    try {
      setIsPurchasing(true);
      
      // Call the buyNFT function from our custom hook
      const txHash = await buyNFT(listing.id, listing.price);
      
      toast.success('NFT purchased successfully!');
      
      // Close modal after a short delay
      setTimeout(() => {
        onClose();
      }, 2000);
      
    } catch (error) {
      console.error('Error purchasing NFT:', error);
      toast.error('Failed to purchase NFT');
      setIsPurchasing(false);
    }
  };
  
  // Get image URL from IPFS URI
  const getImageUrl = (ipfsUri?: string) => {
    if (!ipfsUri) return '/placeholder.png';
    
    if (ipfsUri.startsWith('ipfs://')) {
      const cid = ipfsUri.replace('ipfs://', '');
      return getIpfsGatewayUrl(cid);
    }
    
    return ipfsUri;
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-xl font-semibold">Buy NFT</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            &times;
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <div className="flex space-x-4">
            {/* NFT Image */}
            <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden">
              <img 
                src={listing.metadata ? getImageUrl(listing.metadata.image) : '/placeholder.png'} 
                alt={listing.metadata?.name || 'NFT'} 
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* NFT details */}
            <div className="flex-1">
              <h4 className="font-semibold text-lg">
                {listing.metadata?.name || `NFT #${listing.tokenId}`}
              </h4>
              <p className="text-sm text-gray-500 mb-2">
                Token ID: {listing.tokenId}
              </p>
              <div className="text-xl font-bold text-blue-600">
                {listing.price} WND
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Seller: {listing.seller.slice(0, 6)}...{listing.seller.slice(-4)}
              </p>
            </div>
          </div>
          
          {/* Confirm purchase */}
          <div className="mt-6 bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700 mb-4">
              You are about to purchase this NFT for <span className="font-semibold">{listing.price} WND</span>. 
              This action cannot be undone.
            </p>
            
            <button
              onClick={handlePurchase}
              disabled={isPurchasing}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isPurchasing ? 'Processing...' : 'Confirm Purchase'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
