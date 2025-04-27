// Simple script to check wallet balance on Westend
const { ethers } = require('ethers');

async function checkBalance() {
  const provider = new ethers.JsonRpcProvider('https://westend-asset-hub-eth-rpc.polkadot.io');
  try {
    const balance = await provider.getBalance('0x6E571cB8DbA906D2eF6c6A0c8783955409faFDEb');
    console.log(`Balance: ${ethers.formatEther(balance)} ETH`);
  } catch(e) {
    console.error("Error fetching balance:", e);
  }
}

checkBalance(); 