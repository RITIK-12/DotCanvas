import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";
import * as dotenv from "dotenv";

dotenv.config();

// Load environment variables or use default values
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000000";
const WESTEND_ASSET_HUB_RPC_URL = process.env.WESTEND_ASSET_HUB_RPC_URL || "https://westend-asset-hub-eth-rpc.polkadot.io";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    // Local development network
    hardhat: {
      chainId: 31337,
    },
    // Polkadot Asset Hub Westend testnet
    westend: {
      url: WESTEND_ASSET_HUB_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 420420421, // Westend Asset Hub chain ID
      gasPrice: "auto",
    },
  },
  namedAccounts: {
    deployer: {
      default: 0, // use the first account as the deployer
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./tests",
    cache: "./cache",
    artifacts: "./artifacts",
    deploy: "./contracts/deploy",
  },
  // Verify contracts on Etherscan (placeholder, may not be applicable for Polkadot)
  etherscan: {
    apiKey: {
      westend: "not-applicable", // No etherscan verification for Polkadot Asset Hub
    },
  },
};

export default config;
