const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

try {
    const abiPath = path.join(__dirname, 'frontend', 'src', 'contracts', 'deployedContracts.json');
    const data = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
    const abi = data.contracts.SupplyChainNFT.abi;
    
    const iface = new ethers.Interface(abi);
    console.log("Interface created successfully");
    
    try {
        const fragment = iface.getEvent("TransferredToDistributor");
        console.log("Found event fragment:", fragment.name);
    } catch (e) {
        console.log("Event fragment NOT found:", e.message);
    }
} catch (err) {
    console.error("Error:", err.message);
}
