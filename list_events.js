const fs = require('fs');
const path = require('path');

const abiPath = path.join(__dirname, 'frontend', 'src', 'contracts', 'deployedContracts.json');
const data = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
const abi = data.contracts.SupplyChainNFT.abi;

const events = abi.filter(f => f.type === 'event').map(e => e.name);
console.log(JSON.stringify(events, null, 2));
