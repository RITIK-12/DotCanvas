import React from 'react';

interface WalletButtonProps {
  isConnected: boolean;
  userAddress?: string;
  onConnect: () => Promise<void>;
  onDisconnect: () => void;
}

const WalletButton: React.FC<WalletButtonProps> = ({
  isConnected,
  userAddress,
  onConnect,
  onDisconnect,
}) => {
  // Format address for display
  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="relative">
      {isConnected ? (
        <div className="flex items-center">
          <button
            onClick={onDisconnect}
            className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <span className="hidden sm:inline">{formatAddress(userAddress || '')}</span>
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
          </button>
        </div>
      ) : (
        <button
          onClick={onConnect}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
};

export default WalletButton; 