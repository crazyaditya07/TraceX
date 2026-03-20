const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env' });

async function checkRoles() {
    try {
        const deploymentsPath = path.join(__dirname, 'frontend', 'src', 'contracts', 'deployedContracts.json');
        const contracts = JSON.parse(fs.readFileSync(deploymentsPath, 'utf8'));
        const contractInfo = contracts.contracts.SupplyChainNFT;
        
        const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
        const contract = new ethers.Contract(contractInfo.address, contractInfo.abi, provider);

        const contractDistributorRole = await contract.DISTRIBUTOR_ROLE();
        console.log(`Contract DISTRIBUTOR_ROLE: ${contractDistributorRole}`);
        
        const DISTRIBUTOR_ROLE = ethers.id("DISTRIBUTOR_ROLE");
        const MANUFACTURER_ROLE = ethers.id("MANUFACTURER_ROLE");
        const dummyDistributor = "0x2222222222222222222222222222222222222222";
        
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        const senderAddress = wallet.address;

        let out = "";
        out += `\n==================================================\n`;
        out += `STEP 3 — VERIFY ROLE LOGIC ON-CHAIN\n`;
        out += `==================================================\n`;
        
        const hasDistRole = await contract.hasRole(DISTRIBUTOR_ROLE, dummyDistributor);
        out += `hasRole(DISTRIBUTOR_ROLE, ${dummyDistributor}): ${hasDistRole}\n`;
        
        const hasManRole = await contract.hasRole(MANUFACTURER_ROLE, senderAddress);
        out += `hasRole(MANUFACTURER_ROLE, ${senderAddress}): ${hasManRole}\n`;

        const owner = await contract.ownerOf(1);
        out += `ownerOf(1): ${owner}\n`;
        out += `Is msg.sender the current owner? ${owner === senderAddress}\n`;
        
        out += `==================================================\n`;

        fs.writeFileSync('roles_output.txt', out);
        console.log("Saved to roles_output.txt");
    } catch (e) {
        console.error("Error:", e.message);
    }
}

checkRoles();
