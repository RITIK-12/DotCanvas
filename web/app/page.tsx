'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import MintForm from '../components/MintForm';
import GalleryCard from '../components/GalleryCard';
import BuyModal from '../components/BuyModal';
import { CONTRACT_ADDRESSES } from '../lib/config';
import useContracts from '../hooks/useContracts';

export default function Home() {
  const { address, isConnected } = useAccount();
  const { nftContract, marketContract, isCorrectNetwork } = useContracts();
  const [activeListings, setActiveListings] = useState<any[]>([]);
  const [ownedNFTs, setOwnedNFTs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNFT, setSelectedNFT] = useState<any>(null);
  
  // Load NFTs and listings when connected
  useEffect(() => {
    const loadData = async () => {
      if (!isConnected || !isCorrectNetwork || !nftContract || !marketContract) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        // This is a placeholder for demonstration - in a real app, 
        // you would query events from the blockchain or use a subgraph
        // to get listings and NFTs
        
        // Placeholder listings data
        setActiveListings([
          // This would normally be populated from contract events
        ]);
        
        // Placeholder owned NFTs
        setOwnedNFTs([
          // This would normally be populated from contract events
        ]);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [isConnected, isCorrectNetwork, nftContract, marketContract, address]);
  
  // Open the buy modal for a specific NFT
  const handleOpenBuyModal = (nft: any) => {
    setSelectedNFT(nft);
  };
  
  // Close the buy modal
  const handleCloseBuyModal = () => {
    setSelectedNFT(null);
  };
  
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-500 to-purple-600 py-20 text-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-4">DotCanvas</h1>
            <p className="text-xl mb-8">
              Create, mint, and trade AI-generated artwork on Polkadot Asset Hub
            </p>
            {!isConnected && (
              <div className="mt-8">
                <p className="text-white/80 text-lg">
                  Connect your wallet to get started
                </p>
              </div>
            )}
            {isConnected && !isCorrectNetwork && (
              <div className="p-4 bg-yellow-500/20 rounded-lg">
                <p className="text-white font-medium">
                  Please switch to the Polkadot Asset Hub Westend network
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* Create NFT Section */}
      {isConnected && isCorrectNetwork && (
        <section className="py-16">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold mb-10 text-center">Create Your AI Artwork</h2>
            <MintForm />
          </div>
        </section>
      )}
      
      {/* Gallery Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold mb-10 text-center">NFT Gallery</h2>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : activeListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {activeListings.map((listing) => (
                <GalleryCard 
                  key={listing.id}
                  listing={listing}
                  onBuy={() => handleOpenBuyModal(listing)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center p-10 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-medium text-gray-700">No NFTs listed yet</h3>
              <p className="text-gray-500 mt-2">Be the first to create and list an NFT!</p>
            </div>
          )}
        </div>
      </section>
      
      {/* Your NFTs Section (when connected) */}
      {isConnected && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold mb-10 text-center">Your NFTs</h2>
            
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : ownedNFTs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {ownedNFTs.map((nft) => (
                  <GalleryCard 
                    key={nft.id}
                    listing={nft}
                    isOwned={true}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center p-10 bg-white rounded-lg">
                <h3 className="text-xl font-medium text-gray-700">You don't own any NFTs yet</h3>
                <p className="text-gray-500 mt-2">Create your first NFT or buy one from the gallery!</p>
              </div>
            )}
          </div>
        </section>
      )}
      
      {/* About Section */}
      <section className="py-16 bg-blue-50">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">About DotCanvas</h2>
            <div className="prose prose-lg mx-auto">
              <p>
                DotCanvas is a decentralized marketplace for AI-generated artwork, built on Polkadot Asset Hub's Westend testnet.
                Artists can generate unique images using Stable Diffusion XL Lightning, store them on IPFS, mint them as NFTs, 
                and sell them for DOT tokens.
              </p>
              <p>
                The platform uses two smart contracts: DotCanvasNFT for minting and managing NFTs (with ERC-2981 royalty support),
                and DotCanvasMarket for listing, buying, and selling NFTs.
              </p>
              <p>
                Built for the Polkadot Hackathon, this project demonstrates the power of combining AI-generated art with 
                blockchain technology on the Polkadot ecosystem.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Buy Modal */}
      {selectedNFT && (
        <BuyModal 
          listing={selectedNFT}
          onClose={handleCloseBuyModal}
        />
      )}
    </main>
  );
}
