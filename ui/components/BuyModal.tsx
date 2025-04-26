import React from 'react';
import Image from 'next/image';
import { Dialog } from '@headlessui/react';

interface BuyModalProps {
  isOpen: boolean;
  onClose: () => void;
  listingId: number;
  tokenId: number;
  price: string;
  image: string;
  name: string;
  onBuyConfirm: (listingId: number, price: string) => Promise<void>;
}

const BuyModal: React.FC<BuyModalProps> = ({
  isOpen,
  onClose,
  listingId,
  tokenId,
  price,
  image,
  name,
  onBuyConfirm,
}) => {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="relative z-50"
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70" aria-hidden="true" />

      {/* Full-screen container to center the panel */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-lg rounded-xl bg-gray-800 p-6 shadow-xl">
          <Dialog.Title className="text-xl font-semibold text-white mb-4">
            Confirm Purchase
          </Dialog.Title>

          <div className="flex flex-col md:flex-row gap-6">
            {/* NFT Image */}
            <div className="relative h-40 w-40 mx-auto md:mx-0 rounded-lg overflow-hidden">
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

            {/* NFT Details */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white">{name}</h3>
              <p className="text-gray-400 text-sm mt-1">Token ID: {tokenId}</p>
              
              <div className="mt-3 flex items-baseline">
                <span className="text-xl font-bold text-white">{price}</span>
                <span className="ml-1 text-sm text-gray-400">DOT</span>
              </div>

              <p className="mt-4 text-sm text-gray-400">
                Are you sure you want to purchase this NFT? This action cannot be undone.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onBuyConfirm(listingId, price)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
            >
              Confirm Purchase
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default BuyModal; 