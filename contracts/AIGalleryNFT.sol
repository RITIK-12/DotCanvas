// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title DotCanvasNFT
 * @dev Simplified ERC721 contract for AI-generated artwork NFTs on Polkadot Asset Hub
 */
contract DotCanvasNFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    
    // Events
    event NFTMinted(uint256 tokenId, address creator, string tokenURI);
    
    constructor() ERC721("DotCanvas", "DOTC") Ownable() {}
    
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
}
