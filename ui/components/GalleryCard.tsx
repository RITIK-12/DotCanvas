import React, { useState } from 'react';
import Image from 'next/image';

interface GalleryCardProps {
  image: string;
  name: string;
  description: string;
  price?: string;
  tokenId?: number;
  owner?: string;
  isOwned?: boolean;
  onBuyClick?: () => void;
  onListClick?: (price: string) => void;
}

const GalleryCard: React.FC<GalleryCardProps> = ({
  image,
  name,
  description,
  price,
  tokenId,
  owner,
  isOwned = false,
  onBuyClick,
  onListClick,
}) => {
  const [listingPrice, setListingPrice] = useState('');
  const [showListingInput, setShowListingInput] = useState(false);

  // Format address for display
  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Handle list NFT click
  const handleListClick = () => {
    if (onListClick && listingPrice) {
      onListClick(listingPrice);
      setShowListingInput(false);
      setListingPrice('');
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow nft-card">
      {/* Image */}
      <div className="relative h-48 md:h-64 image-container">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-700">
            <span className="text-gray-500">No Image</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-white truncate">{name}</h3>
        <p className="text-gray-400 text-sm h-10 overflow-hidden">{description}</p>

        {/* Token ID and Owner */}
        {tokenId && (
          <div className="mt-2 text-xs text-gray-500">
            Token ID: {tokenId}
          </div>
        )}
        
        {owner && (
          <div className="mt-1 text-xs text-gray-500">
            Owner: {formatAddress(owner)}
          </div>
        )}

        {/* Price or Listing Controls */}
        <div className="mt-3">
          {isOwned ? (
            <>
              {!showListingInput ? (
                <button
                  onClick={() => setShowListingInput(true)}
                  className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md transition-colors"
                >
                  List for Sale
                </button>
              ) : (
                <div className="mt-2 space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={listingPrice}
                      onChange={(e) => setListingPrice(e.target.value)}
                      placeholder="Price in DOT"
                      className="form-input flex-1"
                    />
                    <span className="text-sm text-gray-400">DOT</span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleListClick}
                      disabled={!listingPrice}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:opacity-50 text-white py-1 px-2 rounded-md transition-colors text-sm"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => {
                        setShowListingInput(false);
                        setListingPrice('');
                      }}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-1 px-2 rounded-md transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {price && (
                <div className="flex justify-between items-center mt-3">
                  <div className="flex items-baseline">
                    <span className="text-lg font-bold text-white">{price}</span>
                    <span className="ml-1 text-sm text-gray-400">DOT</span>
                  </div>
                  
                  <button
                    onClick={onBuyClick}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white py-1 px-3 rounded-md transition-colors text-sm"
                  >
                    Buy
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GalleryCard; 