const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env' });

async function triggerEvents() {
    console.log("🚀 Triggering Blockchain Events...");
    
    try {
        const deploymentsPath = path.join(__dirname, 'frontend', 'src', 'contracts', 'deployedContracts.json');
        const contracts = JSON.parse(fs.readFileSync(deploymentsPath, 'utf8'));
        const contractInfo = contracts.contracts.SupplyChainNFT;
        
        const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        console.log(`👤 Using Wallet: ${wallet.address}`);
        
        const contract = new ethers.Contract(contractInfo.address, contractInfo.abi, wallet);
        const tokenId = 1; // From our discovery

        // 1. Grant Roles (if needed, assuming wallet is ADMIN)
        const DISTRIBUTOR_ROLE = ethers.id("DISTRIBUTOR_ROLE");
        const RETAILER_ROLE = ethers.id("RETAILER_ROLE");
        const dummyDistributor = "0x2222222222222222222222222222222222222222";
        const dummyRetailer = "0x3333333333333333333333333333333333333333";

        console.log("🛠️ Granting roles...");
        try {
            const tx1 = await contract.grantRole(DISTRIBUTOR_ROLE, dummyDistributor);
            await tx1.wait();
            console.log("✅ DISTRIBUTOR_ROLE granted");
            
            const tx2 = await contract.grantRole(RETAILER_ROLE, dummyRetailer);
            await tx2.wait();
            console.log("✅ RETAILER_ROLE granted");
        } catch (e) {
            console.log("ℹ️ Roles might already be granted or permission denied:", e.message);
        }

        // 2. Trigger Transfer to Distributor
        console.log(`🚚 Transferring TokenID ${tokenId} to Distributor...`);
        try {
            const tx3 = await contract.transferToDistributor(tokenId, dummyDistributor);
            console.log(`⏳ Waiting for confirmation (Tx: ${tx3.hash})...`);
            await tx3.wait();
            console.log("✅ TransferredToDistributor Event Emitted!");
        } catch (e) {
            console.error("❌ Transfer to Distributor Failed:", e.message);
        }

    } catch (error) {
        console.error("❌ Script Failed:", error.message);
    }
}

triggerEvents();
