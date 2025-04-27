'use client';

import { useState, useEffect } from 'react';
import { useNFTContract, useMarketContract } from '../useContracts';
import { NFT, NFTListing } from '../nft';
import { fetchMetadata, ipfsToHttp } from '../ipfs';
import Image from 'next/image';
import WalletButton from '../components/WalletButton';
import MintForm from '../components/MintForm';
import GalleryCard from '../components/GalleryCard';
import BuyModal from '../components/BuyModal';
import { ethers } from 'ethers';

export default function Home() {
  // State management
  const [activeTab, setActiveTab] = useState<'browse' | 'mint' | 'my-nfts'>('browse');
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [listings, setListings] = useState<NFTListing[]>([]);
  const [selectedNft, setSelectedNft] = useState<NFT | null>(null);
  const [selectedListing, setSelectedListing] = useState<NFTListing | null>(null);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Contract hooks
  const nftContract = useNFTContract();
  const marketContract = useMarketContract();

  // Check if connected
  const isConnected = nftContract.connected || marketContract.connected;

  // Fetch NFTs and listings when component mounts
  useEffect(() => {
    if (isConnected) {
      fetchUserNFTs();
      fetchActiveListings();
    }
  }, [isConnected]);

  // Fetch user's NFTs
  const fetchUserNFTs = async () => {
    if (!nftContract.connected) return;

    setIsLoading(true);
    try {
      const userNfts = await nftContract.getUserNFTs();
      setNfts(userNfts);
    } catch (error) {
      console.error('Error fetching user NFTs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch active listings
  const fetchActiveListings = async () => {
    if (!marketContract.connected) return;

    setIsLoading(true);
    try {
      const activeListings = await marketContract.getActiveListings();
      
      // Get token URIs and metadata for each listing
      const listingsWithMetadata = await Promise.all(
        activeListings.map(async (listing) => {
          try {
            const nftContractInstance = new (window as any).ethers.Contract(
              listing.nftContract,
              [
                'function tokenURI(uint256 tokenId) view returns (string)',
                'function ownerOf(uint256 tokenId) view returns (address)'
              ],
              marketContract.provider
            );
            
            const uri = await nftContractInstance.tokenURI(listing.tokenId);
            const metadata = await fetchMetadata(uri);
            
            return {
              ...listing,
              metadata,
              uri
            };
          } catch (error) {
            console.error(`Error fetching metadata for token ${listing.tokenId}:`, error);
            return listing;
          }
        })
      );
      
      setListings(listingsWithMetadata as any);
    } catch (error) {
      console.error('Error fetching active listings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle buy click
  const handleBuyClick = (listing: NFTListing) => {
    setSelectedListing(listing);
    setIsBuyModalOpen(true);
  };

  // Handle buy confirmation
  const handleBuyConfirm = async (listingId: number, price: string) => {
    setIsLoading(true);
    try {
      const success = await marketContract.buyNFT(listingId, price);
      if (success) {
        // Refresh listings and user NFTs
        await fetchActiveListings();
        await fetchUserNFTs();
        setIsBuyModalOpen(false);
      }
    } catch (error) {
      console.error('Error buying NFT:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle list NFT
  const handleListNFT = async (nft: NFT, price: string) => {
    setIsLoading(true);
    try {
      const listingId = await marketContract.listNFT(nft.tokenId, price);
      if (listingId !== null) {
        // Refresh listings and user NFTs
        await fetchActiveListings();
        await fetchUserNFTs();
      }
    } catch (error) {
      console.error('Error listing NFT:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-indigo-900 text-white">
      {/* Header */}
      <header className="p-4 border-b border-gray-800">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            DotCanvas
          </h1>
          <div className="flex space-x-4 items-center">
            <nav className="hidden md:block">
              <ul className="flex space-x-6">
                <li>
                  <button
                    onClick={() => setActiveTab('browse')}
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      activeTab === 'browse'
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    Browse Gallery
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('mint')}
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      activeTab === 'mint'
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    Create Art
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('my-nfts')}
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      activeTab === 'my-nfts'
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    My Collection
                  </button>
                </li>
              </ul>
            </nav>
            <WalletButton 
              isConnected={isConnected}
              userAddress={nftContract.userAddress || marketContract.userAddress}
              onConnect={async () => {
                await Promise.all([
                  nftContract.connect(),
                  marketContract.connect()
                ]);
              }}
              onDisconnect={() => {
                nftContract.disconnect();
                marketContract.disconnect();
              }}
            />
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div className="md:hidden p-2 bg-gray-800">
        <div className="flex justify-center space-x-2">
          <button
            onClick={() => setActiveTab('browse')}
            className={`px-3 py-2 rounded-lg text-sm ${
              activeTab === 'browse'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Browse
          </button>
          <button
            onClick={() => setActiveTab('mint')}
            className={`px-3 py-2 rounded-lg text-sm ${
              activeTab === 'mint'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Create
          </button>
          <button
            onClick={() => setActiveTab('my-nfts')}
            className={`px-3 py-2 rounded-lg text-sm ${
              activeTab === 'my-nfts'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Collection
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-4">
        {/* Wallet not connected message */}
        {!isConnected && (
          <div className="text-center my-20">
            <h2 className="text-2xl font-bold mb-4">Connect your wallet to start exploring</h2>
            <p className="text-gray-400 mb-6">
              You need to connect your wallet to browse, create, and collect AI-generated artwork.
            </p>
            <button
              onClick={async () => {
                await Promise.all([
                  nftContract.connect(),
                  marketContract.connect()
                ]);
              }}
              className="px-6 py-3 bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Connect Wallet
            </button>
          </div>
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-center my-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          </div>
        )}

        {/* Browse Gallery */}
        {isConnected && activeTab === 'browse' && !isLoading && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Browse Gallery</h2>
            {listings.length === 0 ? (
              <p className="text-center text-gray-400 my-10">No NFTs are currently listed for sale.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {listings.map((listing: any) => (
                  <GalleryCard
                    key={listing.id}
                    image={listing.metadata?.image || ''}
                    name={listing.metadata?.name || `NFT #${listing.tokenId}`}
                    description={listing.metadata?.description || ''}
                    price={Number(ethers.formatEther(listing.price)).toString()}
                    onBuyClick={() => handleBuyClick(listing)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Create Art */}
        {isConnected && activeTab === 'mint' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Create New Artwork</h2>
            <MintForm
              onMintSuccess={fetchUserNFTs}
              nftContract={nftContract}
            />
          </div>
        )}

        {/* My Collection */}
        {isConnected && activeTab === 'my-nfts' && !isLoading && (
          <div>
            <h2 className="text-2xl font-bold mb-6">My Collection</h2>
            {nfts.length === 0 ? (
              <p className="text-center text-gray-400 my-10">
                You don't have any NFTs yet. Create one or buy from the gallery.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {nfts.map((nft) => (
                  <GalleryCard
                    key={nft.id}
                    image={nft.metadata?.image || ''}
                    name={nft.metadata?.name || `NFT #${nft.tokenId}`}
                    description={nft.metadata?.description || ''}
                    tokenId={nft.tokenId}
                    owner={nft.owner}
                    isOwned={true}
                    onListClick={(price) => handleListNFT(nft, price)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Buy Modal */}
      {selectedListing && (
        <BuyModal
          isOpen={isBuyModalOpen}
          onClose={() => setIsBuyModalOpen(false)}
          listingId={selectedListing.id}
          tokenId={selectedListing.tokenId}
          price={Number(ethers.formatEther(selectedListing.price)).toString()}
          onBuyConfirm={handleBuyConfirm}
          image={(selectedListing as any).metadata?.image || ''}
          name={(selectedListing as any).metadata?.name || `NFT #${selectedListing.tokenId}`}
        />
      )}
    </main>
  );
} 