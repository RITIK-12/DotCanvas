import { ethers } from "hardhat";
import { expect } from "chai";
import { DotCanvasNFT } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("DotCanvasNFT", function () {
  let dotCanvasNFT: DotCanvasNFT;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;
  
  const testTokenURI = "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi";
  
  beforeEach(async function () {
    // Get signers
    [owner, addr1, addr2] = await ethers.getSigners();
    
    // Deploy the NFT contract
    const DotCanvasNFTFactory = await ethers.getContractFactory("DotCanvasNFT");
    dotCanvasNFT = await DotCanvasNFTFactory.deploy();
    await dotCanvasNFT.waitForDeployment();
  });
  
  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await dotCanvasNFT.owner()).to.equal(owner.address);
    });
    
    it("Should have the correct name and symbol", async function () {
      expect(await dotCanvasNFT.name()).to.equal("DotCanvas");
      expect(await dotCanvasNFT.symbol()).to.equal("DOTC");
    });
  });
  
  describe("Minting", function () {
    it("Should allow users to mint NFTs", async function () {
      // Mint an NFT as addr1
      await dotCanvasNFT.connect(addr1).mint(testTokenURI);
      
      // Token ID should be 1
      const tokenId = 1;
      
      // Check owner of the NFT
      expect(await dotCanvasNFT.ownerOf(tokenId)).to.equal(addr1.address);
      
      // Check token URI
      expect(await dotCanvasNFT.tokenURI(tokenId)).to.equal(testTokenURI);
    });
    
    it("Should emit NFTMinted event", async function () {
      // Test event emission
      await expect(dotCanvasNFT.connect(addr1).mint(testTokenURI))
        .to.emit(dotCanvasNFT, "NFTMinted")
        .withArgs(1, addr1.address, testTokenURI);
    });
  });
  
  describe("Royalties", function () {
    it("Should support ERC2981 interface", async function () {
      // ERC2981 interface ID
      const ERC2981InterfaceId = "0x2a55205a";
      expect(await dotCanvasNFT.supportsInterface(ERC2981InterfaceId)).to.be.true;
    });
    
    it("Should set default royalties", async function () {
      // Mint a token
      await dotCanvasNFT.connect(addr1).mint(testTokenURI);
      const tokenId = 1;
      
      // Check royalty info
      const price = ethers.parseEther("1.0");
      const [receiver, royaltyAmount] = await dotCanvasNFT.royaltyInfo(tokenId, price);
      
      // Default royalty is 2.5%
      expect(receiver).to.equal(owner.address);
      expect(royaltyAmount).to.equal(price * 250n / 10000n);
    });
    
    it("Should allow token owner to set custom royalty", async function () {
      // Mint a token
      await dotCanvasNFT.connect(addr1).mint(testTokenURI);
      const tokenId = 1;
      
      // Set custom royalty (5%)
      const customRoyaltyBps = 500; // 5%
      await dotCanvasNFT.connect(addr1).setTokenRoyalty(tokenId, addr1.address, customRoyaltyBps);
      
      // Check updated royalty info
      const price = ethers.parseEther("1.0");
      const [receiver, royaltyAmount] = await dotCanvasNFT.royaltyInfo(tokenId, price);
      
      expect(receiver).to.equal(addr1.address);
      expect(royaltyAmount).to.equal(price * 500n / 10000n);
    });
    
    it("Should prevent non-owners from setting token royalty", async function () {
      // Mint a token as addr1
      await dotCanvasNFT.connect(addr1).mint(testTokenURI);
      const tokenId = 1;
      
      // Try to set royalty as addr2 (not the token owner)
      await expect(
        dotCanvasNFT.connect(addr2).setTokenRoyalty(tokenId, addr2.address, 500)
      ).to.be.revertedWith("Only token owner can set royalty");
    });
  });
});
