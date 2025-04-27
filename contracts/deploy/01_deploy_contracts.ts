import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const deployContracts: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, network } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log(`Deploying contracts with account: ${deployer}`);
  console.log(`Network: ${network.name} (${network.config.chainId})`);
  
  try {
    // Deploy NFT contract first and wait for it to complete
    console.log('Deploying DotCanvasNFT contract...');
    const nftContract = await deploy('DotCanvasNFT', {
      from: deployer,
      args: [],
      log: true,
      waitConfirmations: 1,
      gasLimit: 2000000,
      gasPrice: "1000000000", // 1 gwei as string
    });
    
    console.log(`DotCanvasNFT deployed at: ${nftContract.address}`);
    console.log('Waiting 15 seconds before deploying marketplace...');
    
    // Wait between deployments to ensure first contract is fully confirmed
    await new Promise(resolve => setTimeout(resolve, 15000));
    
    // Deploy marketplace contract
    console.log('Deploying DotCanvasMarket contract...');
    const marketContract = await deploy('DotCanvasMarket', {
      from: deployer,
      args: [],
      log: true,
      waitConfirmations: 1,
      gasLimit: 2000000,
      gasPrice: "1000000000", // 1 gwei as string
    });
    
    console.log(`DotCanvasMarket deployed at: ${marketContract.address}`);
    
    // Print summary of deployed contracts
    console.log('\n=======================================================');
    console.log(' DEPLOYMENT SUMMARY ');
    console.log('=======================================================');
    console.log(`Network: ${network.name} (${network.config.chainId})`);
    console.log(`DotCanvasNFT: ${nftContract.address}`);
    console.log(`DotCanvasMarket: ${marketContract.address}`);
    console.log('=======================================================\n');
    
    console.log('Update these addresses in your UI config.ts file');
    
  } catch (error) {
    console.error('Error during deployment:', error);
    throw error;
  }
};

deployContracts.tags = ['DotCanvas'];
export default deployContracts; 