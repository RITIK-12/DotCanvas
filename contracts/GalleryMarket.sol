// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";

/**
 * @title DotCanvasMarket
 * @dev Fixed price marketplace for DotCanvas NFTs on Polkadot Asset Hub
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
    
    // Platform fee configuration (optional, 2% default)
    uint256 private _platformFeePercent = 200; // 2% (basis points)
    address private _feeReceiver;
    
    // Events
    event NFTListed(uint256 listingId, address seller, address nftContract, uint256 tokenId, uint256 price);
    event NFTSold(uint256 listingId, address seller, address buyer, address nftContract, uint256 tokenId, uint256 price);
    event NFTListingCancelled(uint256 listingId);
    event PlatformFeeUpdated(uint256 feePercent);
    event FeeReceiverUpdated(address feeReceiver);
    
    constructor() Ownable() {
        _feeReceiver = _msgSender();
    }
    
    /**
     * @dev List an NFT for sale
     * @param nftContract The NFT contract address
     * @param tokenId The token ID
     * @param price The listing price in WND
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
        
        // Calculate fees and royalties
        uint256 platformFee = (listing.price * _platformFeePercent) / 10000;
        uint256 remainingAmount = listing.price - platformFee;
        
        // Check for ERC2981 royalty support
        uint256 royaltyAmount = 0;
        address royaltyReceiver;
        
        try ERC2981(listing.nftContract).royaltyInfo(listing.tokenId, listing.price) returns (address receiver, uint256 royalty) {
            royaltyReceiver = receiver;
            royaltyAmount = royalty;
        } catch {
            // No royalty support, continue
        }
        
        // Adjust remaining amount after royalties
        if (royaltyAmount > 0 && royaltyReceiver != address(0)) {
            remainingAmount -= royaltyAmount;
            (bool royaltySuccess, ) = royaltyReceiver.call{value: royaltyAmount}("");
            require(royaltySuccess, "Royalty payment failed");
        }
        
        // Send platform fee
        if (platformFee > 0) {
            (bool feeSuccess, ) = _feeReceiver.call{value: platformFee}("");
            require(feeSuccess, "Fee payment failed");
        }
        
        // Send payment to seller
        (bool success, ) = listing.seller.call{value: remainingAmount}("");
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
     * @dev Update platform fee percentage
     * @param feePercent New fee percentage (in basis points, 100 = 1%)
     */
    function setPlatformFee(uint256 feePercent) external onlyOwner {
        require(feePercent <= 1000, "Fee cannot exceed 10%");
        _platformFeePercent = feePercent;
        emit PlatformFeeUpdated(feePercent);
    }
    
    /**
     * @dev Update fee receiver address
     * @param feeReceiver New fee receiver address
     */
    function setFeeReceiver(address feeReceiver) external onlyOwner {
        require(feeReceiver != address(0), "Invalid address");
        _feeReceiver = feeReceiver;
        emit FeeReceiverUpdated(feeReceiver);
    }
    
    /**
     * @dev Get listing details
     * @param listingId The listing ID
     * @return Returns the listing struct
     */
    function getListing(uint256 listingId) external view returns (Listing memory) {
        return _listings[listingId];
    }
    
    /**
     * @dev Get current platform fee percentage
     * @return Fee percentage in basis points
     */
    function getPlatformFee() external view returns (uint256) {
        return _platformFeePercent;
    }
}
