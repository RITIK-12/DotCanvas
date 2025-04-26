import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const deployContracts: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, network } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log(`Deploying contracts with account: ${deployer}`);

  // Deploy DotCanvasNFT contract
  const dotCanvasNFT = await deploy('DotCanvasNFT', {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: network.name === 'hardhat' ? 1 : 5,
  });

  console.log(`DotCanvasNFT deployed at: ${dotCanvasNFT.address}`);

  // Deploy DotCanvasMarket contract
  const dotCanvasMarket = await deploy('DotCanvasMarket', {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: network.name === 'hardhat' ? 1 : 5,
  });

  console.log(`DotCanvasMarket deployed at: ${dotCanvasMarket.address}`);

  // Store the contract addresses for easy access
  console.log('\nDeployed contract addresses:');
  console.log(`DotCanvasNFT: ${dotCanvasNFT.address}`);
  console.log(`DotCanvasMarket: ${dotCanvasMarket.address}`);
  console.log(`\nNetwork: ${network.name} (${network.config.chainId})`);
  console.log('\n-------------------------------------------------------\n');

  // Verify contracts on Etherscan if we're on a testnet/mainnet and not local
  if (network.name !== 'hardhat' && network.name !== 'localhost') {
    console.log('Verification may not be supported on Polkadot Asset Hub.');
    // If verification is supported in the future, uncomment this:
    /*
    try {
      await hre.run('verify:verify', {
        address: dotCanvasNFT.address,
        constructorArguments: [],
      });
      await hre.run('verify:verify', {
        address: dotCanvasMarket.address,
        constructorArguments: [],
      });
    } catch (error) {
      console.log('Verification error:', error);
    }
    */
  }
};

deployContracts.tags = ['DotCanvas', 'DotCanvasNFT', 'DotCanvasMarket'];

export default deployContracts; 