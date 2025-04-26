'use client';

import { useState } from 'react';
import { useAccount, useConnect, useDisconnect, useNetwork } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { NETWORK_CONFIG } from '../lib/config';
import { shortenAddress } from '../lib/nft';

// Add ethereum to window object type
declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function WalletButton() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect({ connector: new InjectedConnector() });
  const { disconnect } = useDisconnect();
  const { chain } = useNetwork();
  const [isOpen, setIsOpen] = useState(false);

  const isCorrectNetwork = chain?.id === NETWORK_CONFIG.chainId;

  // Switch network (only for MetaMask or compatible wallets)
  const switchNetwork = async () => {
    if (!window.ethereum) return;
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${NETWORK_CONFIG.chainId.toString(16)}` }],
      });
    } catch (error: any) {
      // If the chain is not added to the user's wallet
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
        } catch (addError) {
          console.error('Failed to add network', addError);
        }
      }
    }
  };

  // Determine button status and appearance
  const getButtonProps = () => {
    if (!isConnected) {
      return {
        onClick: () => connect(),
        className: "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700",
        text: "Connect Wallet"
      };
    }
    
    if (!isCorrectNetwork) {
      return {
        onClick: switchNetwork,
        className: "px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700",
        text: "Switch Network"
      };
    }
    
    return {
      onClick: () => setIsOpen(!isOpen),
      className: "px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700",
      text: shortenAddress(address || '')
    };
  };

  const buttonProps = getButtonProps();

  return (
    <div className="relative">
      <button
        className={buttonProps.className}
        onClick={buttonProps.onClick}
      >
        {buttonProps.text}
      </button>
      
      {/* Dropdown menu when connected */}
      {isConnected && isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
          <button
            onClick={() => {
              disconnect();
              setIsOpen(false);
            }}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
} 