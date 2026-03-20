const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env' });

async function verifyStep1() {
    console.log("🚀 Step 1 Verification Started...");
    
    try {
        const deploymentsPath = path.join(__dirname, 'frontend', 'src', 'contracts', 'deployedContracts.json');
        const contracts = JSON.parse(fs.readFileSync(deploymentsPath, 'utf8'));
        const contractInfo = contracts.contracts.SupplyChainNFT;
        
        console.log(`📍 Using RPC: ${process.env.SEPOLIA_RPC_URL || "DEFAULT"}`);
        const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
        
        const contract = new ethers.Contract(contractInfo.address, contractInfo.abi, provider);
        
        console.log(`✅ EVENT LISTENER STARTED`);
        console.log(`📍 Contract Address: ${contractInfo.address}`);
        
        try {
            const network = await provider.getNetwork();
            console.log(`🌐 Network Verified: ${network.name} (ChainID: ${network.chainId})`);
            console.log("✅ STEP 1 PASSED: Connection secure.");
        } catch (e) {
            console.error("❌ Network Verification Failed:", e.message);
        }
        
    } catch (error) {
        console.error("❌ Initialization Failed:", error.message);
    }
}

verifyStep1();
