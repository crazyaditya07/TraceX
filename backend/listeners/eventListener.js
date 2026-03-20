const { ethers } = require('ethers');
const Product = require('../models/Product');
const fs = require('fs');
const path = require('path');

async function startEventListener(io) {
    console.log("🚀 Initializing Event Listener...");
    
    try {
        // Load contract info
        const deploymentsPath = path.join(__dirname, '..', '..', 'frontend', 'src', 'contracts', 'deployedContracts.json');
        console.log(`📂 Loading deployments from: ${deploymentsPath}`);
        const contracts = JSON.parse(fs.readFileSync(deploymentsPath, 'utf8'));
        
        const contractInfo = contracts.contracts.SupplyChainNFT;
        console.log(`📝 Contract info loaded for: ${contractInfo.address}`);

        const rpcUrl = process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.org";
        console.log(`🌐 Using RPC URL: ${rpcUrl}`);
        const provider = new ethers.JsonRpcProvider(rpcUrl, undefined, { staticNetwork: true });
        
        console.log(`🔨 Creating contract instance...`);
        const contract = new ethers.Contract(contractInfo.address, contractInfo.abi, provider);

        console.log(`✅ EVENT LISTENER STARTED`);
        console.log(`📍 Contract Address: ${contractInfo.address}`);

        // Async network info (don't block start)
        provider.getNetwork().then(network => {
            console.log(`🌐 Network Verified: ${network.name} (ChainID: ${network.chainId})`);
        }).catch(err => {
            console.warn(`⚠️ Could not fetch network info immediately, but continuing...`);
        });
        
        if (contract.target === contractInfo.address) {
            console.log("🔗 Contract instance created successfully");
        }

        // Handler for TransferredToDistributor
        contract.on("TransferredToDistributor", async (tokenId, distributor, event) => {
            const txHash = event.log.transactionHash;
            console.log(`🔔 EVENT CAUGHT: TransferredToDistributor | TokenID: ${tokenId} | Distributor: ${distributor} | TxHash: ${txHash}`);
            
            try {
                const product = await Product.findOne({ tokenId: Number(tokenId) });
                if (!product) return console.log(`❌ Product not found for TokenID: ${tokenId}`);

                // Duplicate Protection: Check transaction index/hash in checkpoints
                const isDuplicate = product.checkpoints.some(cp => cp.transactionHash === txHash);
                if (isDuplicate) {
                    return console.log(`⏭️ Duplicate event skipped: ${txHash}`);
                }

                product.currentOwner = distributor.toLowerCase();
                product.status = "IN_TRANSIT";
                product.currentStage = "InDistribution";
                
                // Add checkpoint
                product.checkpoints.push({
                    timestamp: new Date(),
                    location: { address: "In Transit" },
                    stage: "InDistribution",
                    handler: distributor.toLowerCase(),
                    transactionHash: txHash,
                    notes: "Transferred to Distributor"
                });

                await product.save();
                console.log(`✅ MongoDB Updated: TokenID ${tokenId} -> IN_TRANSIT`);
                
                if (io) io.emit("productUpdate", { tokenId: Number(tokenId), status: "IN_TRANSIT" });
            } catch (err) {
                console.error(`❌ Error in TransferredToDistributor handler:`, err);
            }
        });

        // Handler for TransferredToRetailer
        contract.on("TransferredToRetailer", async (tokenId, retailer, event) => {
            const txHash = event.log.transactionHash;
            console.log(`🔔 EVENT CAUGHT: TransferredToRetailer | TokenID: ${tokenId} | Retailer: ${retailer} | TxHash: ${txHash}`);
            
            try {
                const product = await Product.findOne({ tokenId: Number(tokenId) });
                if (!product) return console.log(`❌ Product not found for TokenID: ${tokenId}`);

                const isDuplicate = product.checkpoints.some(cp => cp.transactionHash === txHash);
                if (isDuplicate) {
                    return console.log(`⏭️ Duplicate event skipped: ${txHash}`);
                }

                product.currentOwner = retailer.toLowerCase();
                product.status = "DELIVERED";
                product.currentStage = "InRetail";

                product.checkpoints.push({
                    timestamp: new Date(),
                    location: { address: "Retail Store" },
                    stage: "InRetail",
                    handler: retailer.toLowerCase(),
                    transactionHash: txHash,
                    notes: "Transferred to Retailer"
                });

                await product.save();
                console.log(`✅ MongoDB Updated: TokenID ${tokenId} -> DELIVERED`);
                
                if (io) io.emit("productUpdate", { tokenId: Number(tokenId), status: "DELIVERED" });
            } catch (err) {
                console.error(`❌ Error in TransferredToRetailer handler:`, err);
            }
        });

        // Handler for ProductSold
        contract.on("ProductSold", async (tokenId, event) => {
            const txHash = event.log.transactionHash;
            console.log(`🔔 EVENT CAUGHT: ProductSold | TokenID: ${tokenId} | TxHash: ${txHash}`);
            
            try {
                const product = await Product.findOne({ tokenId: Number(tokenId) });
                if (!product) return console.log(`❌ Product not found for TokenID: ${tokenId}`);

                const isDuplicate = product.checkpoints.some(cp => cp.transactionHash === txHash);
                if (isDuplicate) {
                    return console.log(`⏭️ Duplicate event skipped: ${txHash}`);
                }

                product.status = "SOLD";
                product.currentStage = "Sold";

                product.checkpoints.push({
                    timestamp: new Date(),
                    location: { address: "Customer" },
                    stage: "Sold",
                    transactionHash: txHash,
                    notes: "Product Sold"
                });

                await product.save();
                console.log(`✅ MongoDB Updated: TokenID ${tokenId} -> SOLD`);
                
                if (io) io.emit("productUpdate", { tokenId: Number(tokenId), status: "SOLD" });
            } catch (err) {
                console.error(`❌ Error in ProductSold handler:`, err);
            }
        });

    } catch (error) {
        console.error("❌ Failed to start listener:", error);
    }
}

module.exports = { startEventListener };
