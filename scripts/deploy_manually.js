// Manual deployment script for Polkadot Asset Hub
// This script avoids using hardhat-deploy to provide more control
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config();

// Load contract artifacts
const NFTArtifact = require("../artifacts/contracts/AIGalleryNFT.sol/DotCanvasNFT.json");
const MarketArtifact = require("../artifacts/contracts/GalleryMarket.sol/DotCanvasMarket.json");

async function main() {
  console.log("Starting manual deployment to Polkadot Asset Hub...");

  // Set up provider and signer (wallet)
  const PRIVATE_KEY = process.env.PRIVATE_KEY;
  const RPC_URL = process.env.WESTEND_ASSET_HUB_RPC_URL || "https://westend-asset-hub-eth-rpc.polkadot.io";
  
  if (!PRIVATE_KEY) {
    console.error("PRIVATE_KEY environment variable is required");
    process.exit(1);
  }

  // Log that we found the private key (without showing it)
  console.log("Found PRIVATE_KEY in environment variables");

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  const address = wallet.address;

  console.log(`Deployer address: ${address}`);
  
  try {
    const balance = await provider.getBalance(address);
    console.log(`Account balance: ${ethers.formatEther(balance)} DOT`);
    
    if (balance < ethers.parseEther("0.1")) {
      console.warn("Warning: Low balance, you might not have enough DOT for deployment");
    }
  } catch (error) {
    console.error("Error checking balance:", error);
    console.log("Continuing with deployment anyway...");
  }

  // Deploy NFT contract
  console.log("Deploying DotCanvasNFT contract...");
  const nftFactory = new ethers.ContractFactory(
    NFTArtifact.abi,
    NFTArtifact.bytecode,
    wallet
  );

  try {
    const gasEstimate = await provider.estimateGas({
      data: NFTArtifact.bytecode
    });
    console.log(`Estimated gas for NFT deployment: ${gasEstimate.toString()}`);
    
    const nftContract = await nftFactory.deploy({
      gasLimit: gasEstimate.toString()
    });
    
    console.log(`NFT contract deployed at: ${nftContract.target}`);
    
    // Deploy Market contract
    console.log("Deploying DotCanvasMarket contract...");
    const marketFactory = new ethers.ContractFactory(
      MarketArtifact.abi,
      MarketArtifact.bytecode,
      wallet
    );
    
    const marketGasEstimate = await provider.estimateGas({
      data: MarketArtifact.bytecode
    });
    console.log(`Estimated gas for Market deployment: ${marketGasEstimate.toString()}`);
    
    const marketContract = await marketFactory.deploy({
      gasLimit: marketGasEstimate.toString()
    });
    
    console.log(`Market contract deployed at: ${marketContract.target}`);
    
    // Save deployed addresses to a file
    const deployInfo = {
      network: "westend",
      nftContract: nftContract.target,
      marketContract: marketContract.target,
      timestamp: new Date().toISOString()
    };
    
    fs.writeFileSync(
      path.join(__dirname, "../deployment-info.json"),
      JSON.stringify(deployInfo, null, 2)
    );
    
    console.log("Deployment complete and info saved to deployment-info.json");
    console.log("Use these addresses in your frontend configuration");
    
  } catch (error) {
    console.error("Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 