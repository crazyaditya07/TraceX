const { ethers } = require("hardhat");

async function main() {
    const [signer] = await ethers.getSigners();
    console.log("Wallet Address:", signer.address);

    const balance = await ethers.provider.getBalance(signer.address);
    console.log("Balance:", ethers.formatEther(balance), "ETH");

    if (balance === 0n) {
        console.log("\n⚠️  No Sepolia ETH! Get some from:");
        console.log("   https://sepoliafaucet.com/");
        console.log("   https://www.alchemy.com/faucets/ethereum-sepolia");
    } else {
        console.log("\n✅ Ready to deploy!");
    }
}

main().catch(console.error);
