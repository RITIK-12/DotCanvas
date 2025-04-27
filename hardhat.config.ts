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
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1,
      },
      evmVersion: "berlin",
      viaIR: false,
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
      chainId: 420420421,
      gasPrice: 1000000000,
      gas: 2000000,
      timeout: 300000,
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
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
      westend: "not-applicable",
    },
  },
};

export default config;
