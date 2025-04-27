// Manual deployment script for DotCanvas contracts
import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  try {
    // Get the network and signer
    const [deployer] = await ethers.getSigners();
    const network = await ethers.provider.getNetwork();
    
    console.log(`Deploying contracts with account: ${deployer.address}`);
    console.log(`Network: ${network.name} (${network.chainId})`);
    console.log(`Account balance: ${ethers.formatEther(await deployer.provider.getBalance(deployer.address))} ETH\n`);
    
    const gasPrice = ethers.parseUnits("1", "gwei");
    const gasLimit = 2000000;
    
    // Deploy NFT contract first
    console.log('Deploying DotCanvasNFT contract...');
    const NFTFactory = await ethers.getContractFactory("DotCanvasNFT");
    const nftContract = await NFTFactory.connect(deployer).deploy({
      gasPrice,
      gasLimit
    });
    
    // Wait for the contract to be deployed
    const nftDeployTx = await nftContract.waitForDeployment();
    const nftAddress = await nftContract.getAddress();
    console.log(`DotCanvasNFT deployed at: ${nftAddress}`);
    console.log(`Transaction hash: ${nftDeployTx.deploymentTransaction()?.hash}`);
    
    // Add delay between deployments
    console.log('Waiting 15 seconds before deploying marketplace...');
    await new Promise(resolve => setTimeout(resolve, 15000));
    
    // Deploy marketplace contract
    console.log('Deploying DotCanvasMarket contract...');
    const MarketFactory = await ethers.getContractFactory("DotCanvasMarket");
    const marketContract = await MarketFactory.connect(deployer).deploy({
      gasPrice,
      gasLimit
    });
    
    // Wait for the contract to be deployed
    const marketDeployTx = await marketContract.waitForDeployment();
    const marketAddress = await marketContract.getAddress();
    console.log(`DotCanvasMarket deployed at: ${marketAddress}`);
    console.log(`Transaction hash: ${marketDeployTx.deploymentTransaction()?.hash}`);
    
    // Print summary
    console.log('\n=======================================================');
    console.log(' DEPLOYMENT SUMMARY ');
    console.log('=======================================================');
    console.log(`Network: ${network.name} (${network.chainId})`);
    console.log(`DotCanvasNFT: ${nftAddress}`);
    console.log(`DotCanvasMarket: ${marketAddress}`);
    console.log('=======================================================\n');
    
    console.log('Update these addresses in your UI config.ts file');
    
    // Save deployment info to a file
    const deploymentInfo = {
      network: {
        name: network.name,
        chainId: network.chainId
      },
      contracts: {
        DotCanvasNFT: nftAddress,
        DotCanvasMarket: marketAddress
      },
      deployer: deployer.address,
      timestamp: new Date().toISOString()
    };
    
    const deploymentsDir = path.join(__dirname, "../deployments");
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(deploymentsDir, `${network.name}_${new Date().toISOString().replace(/[:.]/g, "-")}.json`),
      JSON.stringify(deploymentInfo, null, 2)
    );
    
  } catch (error) {
    console.error("Error during manual deployment:", error);
    process.exit(1);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 