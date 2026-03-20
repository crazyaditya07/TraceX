const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env' });

async function dryRun() {
    try {
        const deploymentsPath = path.join(__dirname, 'frontend', 'src', 'contracts', 'deployedContracts.json');
        const contracts = JSON.parse(fs.readFileSync(deploymentsPath, 'utf8'));
        const contractInfo = contracts.contracts.SupplyChainNFT;
        
        const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        const contract = new ethers.Contract(contractInfo.address, contractInfo.abi, wallet);

        const dummyDistributor = "0x2222222222222222222222222222222222222222";
        const tokenId = 1;

        let out = "";
        out += `\n==================================================\n`;
        out += `STEP 4 — DRY RUN TRANSACTION (STATIC CALL)\n`;
        out += `==================================================\n`;
        out += `Calling contract.transferToDistributor.staticCall(${tokenId}, ${dummyDistributor})\n`;

        try {
            await contract.transferToDistributor.staticCall(tokenId, dummyDistributor);
            out += `✅ Static call succeeded! (This is unexpected based on previous errors)\n`;
        } catch (error) {
            out += `❌ Static call failed (Expected)\n`;
            out += `Revert Reason: ${error.reason || error.message}\n`;
            out += `Error Code: ${error.code}\n`;
            if (error.data) {
                out += `Error Data: ${error.data}\n`;
            }
        }
        
        out += `==================================================\n`;

        fs.writeFileSync('dry_run_output.txt', out);
        console.log("Saved to dry_run_output.txt");

    } catch (e) {
        console.error("Critical Error:", e.message);
    }
}

dryRun();
