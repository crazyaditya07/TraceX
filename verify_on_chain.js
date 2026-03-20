const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env' });

async function verifyOnChain() {
    try {
        const deploymentsPath = path.join(__dirname, 'frontend', 'src', 'contracts', 'deployedContracts.json');
        const contracts = JSON.parse(fs.readFileSync(deploymentsPath, 'utf8'));
        const contractInfo = contracts.contracts.SupplyChainNFT;
        
        let out = "";
        out += `\n==================================================\n`;
        out += `STEP 2 — VERIFY ON-CHAIN CONTRACT CODE\n`;
        out += `==================================================\n`;
        out += `Contract Address used: ${contractInfo.address}\n`;

        const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
        const contract = new ethers.Contract(contractInfo.address, contractInfo.abi, provider);

        const fragments = contract.interface.fragments;
        
        out += `\nFunctions & Events in ABI:\n`;
        // Filter by the functions and events we care about
        fragments.forEach(f => {
            if (f.name === 'transferToDistributor' || 
                f.name === 'transferToRetailer' || 
                f.name === 'markAsSold' || 
                f.name === 'TransferredToDistributor' || 
                f.name === 'TransferredToRetailer' || 
                f.name === 'ProductSold') {
                out += `- ${f.type.toUpperCase()}: ${f.format()}\n`;
            }
        });

        out += `\nChecking Contract Code on-chain...\n`;
        const code = await provider.getCode(contractInfo.address);
        out += `Code size: ${code.length} bytes\n`;

        out += `\nCustom Errors in ABI:\n`;
        const errors = fragments.filter(f => f.type === 'error');
        errors.forEach(f => {
            out += `- ERROR: ${f.format()}\n`;
        });

        out += `==================================================\n`;
        
        fs.writeFileSync('on_chain_results.txt', out);
        console.log("Saved to on_chain_results.txt");

    } catch (e) {
        console.error("Error:", e.message);
    }
}

verifyOnChain();
