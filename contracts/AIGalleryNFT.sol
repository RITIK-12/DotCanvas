// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title DotCanvasNFT
 * @dev ERC721 contract for AI-generated artwork NFTs on Polkadot Asset Hub
 */
contract DotCanvasNFT is ERC721URIStorage, ERC721Enumerable, ERC2981, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    
    // Events
    event NFTMinted(uint256 tokenId, address creator, string tokenURI);
    
    // Optional: set a default royalty percentage (e.g., 2.5%)
    uint96 private constant DEFAULT_ROYALTY_FEE = 250; // 2.5% (basis points)
    
    constructor() ERC721("DotCanvas", "DOTC") Ownable() {
        // Set default royalty receiver to contract creator
        _setDefaultRoyalty(_msgSender(), DEFAULT_ROYALTY_FEE);
    }
    
    /**
     * @dev Mint a new NFT with the given tokenURI (IPFS CID)
     * @param tokenURI_ The IPFS URI pointing to the NFT metadata
     * @return tokenId The ID of the newly minted NFT
     */
    function mint(string memory tokenURI_) external returns (uint256) {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        _safeMint(_msgSender(), newTokenId);
        _setTokenURI(newTokenId, tokenURI_);
        
        emit NFTMinted(newTokenId, _msgSender(), tokenURI_);
        return newTokenId;
    }
    
    /**
     * @dev Set custom royalty info for a specific token
     * @param tokenId The NFT to set royalty info for
     * @param receiver Address to receive royalties
     * @param feeNumerator Fee percentage (in basis points, 100 = 1%)
     */
    function setTokenRoyalty(
        uint256 tokenId,
        address receiver,
        uint96 feeNumerator
    ) external {
        require(ownerOf(tokenId) == _msgSender(), "Only token owner can set royalty");
        _setTokenRoyalty(tokenId, receiver, feeNumerator);
    }
    
    /**
     * @dev Set the default royalty info for all tokens
     * @param receiver Address to receive royalties
     * @param feeNumerator Fee percentage (in basis points, 100 = 1%)
     */
    function setDefaultRoyalty(address receiver, uint96 feeNumerator) external onlyOwner {
        _setDefaultRoyalty(receiver, feeNumerator);
    }
    
    // Override required functions due to multiple inheritance
    
    function supportsInterface(bytes4 interfaceId) 
        public 
        view 
        override(ERC721URIStorage, ERC721Enumerable, ERC2981) 
        returns (bool) 
    {
        return super.supportsInterface(interfaceId);
    }
    
    function _beforeTokenTransfer(
        address from, 
        address to, 
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
    
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
        // Clear royalty info when token is burned
        _resetTokenRoyalty(tokenId);
    }
    
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
}
