// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title DotCanvasMarket
 * @dev Simplified marketplace for DotCanvas NFTs on Polkadot Asset Hub
 */
contract DotCanvasMarket is ERC721Holder, ReentrancyGuard, Ownable {
    // Market listing struct
    struct Listing {
        address seller;
        address nftContract;
        uint256 tokenId;
        uint256 price;
        bool active;
    }
    
    // Storage
    mapping(uint256 => Listing) private _listings;
    uint256 private _listingIdCounter;
    
    // Events
    event NFTListed(uint256 listingId, address seller, address nftContract, uint256 tokenId, uint256 price);
    event NFTSold(uint256 listingId, address seller, address buyer, address nftContract, uint256 tokenId, uint256 price);
    event NFTListingCancelled(uint256 listingId);
    
    /**
     * @dev List an NFT for sale
     * @param nftContract The NFT contract address
     * @param tokenId The token ID
     * @param price The listing price in DOT
     * @return listingId The ID of the created listing
     */
    function listNFT(address nftContract, uint256 tokenId, uint256 price) external returns (uint256) {
        require(price > 0, "Price must be greater than zero");
        
        // Transfer NFT to market contract for escrow
        IERC721(nftContract).safeTransferFrom(_msgSender(), address(this), tokenId);
        
        // Create listing
        _listingIdCounter++;
        uint256 listingId = _listingIdCounter;
        
        _listings[listingId] = Listing({
            seller: _msgSender(),
            nftContract: nftContract,
            tokenId: tokenId,
            price: price,
            active: true
        });
        
        emit NFTListed(listingId, _msgSender(), nftContract, tokenId, price);
        return listingId;
    }
    
    /**
     * @dev Buy an NFT from the marketplace
     * @param listingId The listing ID
     */
    function buyNFT(uint256 listingId) external payable nonReentrant {
        Listing memory listing = _listings[listingId];
        require(listing.active, "Listing is not active");
        require(msg.value >= listing.price, "Insufficient payment");
        
        // Mark listing as inactive first (prevent reentrancy)
        _listings[listingId].active = false;
        
        // Send payment to seller
        (bool success, ) = listing.seller.call{value: listing.price}("");
        require(success, "Payment to seller failed");
        
        // Transfer NFT to buyer
        IERC721(listing.nftContract).safeTransferFrom(address(this), _msgSender(), listing.tokenId);
        
        // Refund excess payment if any
        if (msg.value > listing.price) {
            (bool refundSuccess, ) = _msgSender().call{value: msg.value - listing.price}("");
            require(refundSuccess, "Refund failed");
        }
        
        emit NFTSold(listingId, listing.seller, _msgSender(), listing.nftContract, listing.tokenId, listing.price);
    }
    
    /**
     * @dev Cancel an NFT listing
     * @param listingId The listing ID
     */
    function cancelListing(uint256 listingId) external {
        Listing memory listing = _listings[listingId];
        require(listing.active, "Listing is not active");
        require(listing.seller == _msgSender() || owner() == _msgSender(), "Not authorized");
        
        // Mark listing as inactive
        _listings[listingId].active = false;
        
        // Return NFT to seller
        IERC721(listing.nftContract).safeTransferFrom(address(this), listing.seller, listing.tokenId);
        
        emit NFTListingCancelled(listingId);
    }
    
    /**
     * @dev Get listing details
     * @param listingId The listing ID
     * @return Returns the listing struct
     */
    function getListing(uint256 listingId) external view returns (Listing memory) {
        return _listings[listingId];
    }
}
