const Transfer = require('../models/Transfer');
const Product = require('../models/Product');

/**
 * TransferWorker handles background tasks for the custody transfer workflow:
 * - Expiring stale pending transfers
 * - Expiring stale confirmed transfers that weren't finalized
 * - (Future) Retrying failed on-chain transactions
 */
class TransferWorker {
    constructor(io, intervalMs = 60000) { // Default 1 minute
        this.io = io;
        this.intervalMs = intervalMs;
        this.timer = null;
    }

    start() {
        console.log('🚀 TransferWorker started (Interval:', this.intervalMs, 'ms)');
        this.timer = setInterval(() => this.run(), this.intervalMs);
        // Run immediately on start
        this.run();
    }

    stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    async run() {
        try {
            await this.processExpirations();
        } catch (error) {
            console.error('❌ TransferWorker run error:', error);
        }
    }

    async processExpirations() {
        const now = new Date();

        // Find all transfers that have expired and are still in pending/confirmed state
        const expiredTransfers = await Transfer.find({
            status: { $in: ['pending', 'confirmed'] },
            expiresAt: { $lt: now }
        });

        if (expiredTransfers.length === 0) return;

        console.log(`🧹 TransferWorker: Expiring ${expiredTransfers.length} stale transfers...`);

        for (const transfer of expiredTransfers) {
            try {
                // 1. Update transfer status
                transfer.status = 'expired';
                await transfer.save();

                // 2. Restore product status
                await Product.findOneAndUpdate(
                    { tokenId: transfer.tokenId },
                    { transferStatus: 'none', pendingTransferId: null }
                );

                // 3. Notify parties via WebSockets
                if (this.io) {
                    this.io.to(`user:${transfer.fromWallet.toLowerCase()}`).emit('transferExpired', transfer);
                    this.io.to(`user:${transfer.toWallet.toLowerCase()}`).emit('transferExpired', transfer);
                }

                console.log(`✅ Expired transfer ${transfer._id} for product ${transfer.productId}`);
            } catch (err) {
                console.error(`❌ Failed to expire transfer ${transfer._id}:`, err);
            }
        }
    }
}

module.exports = TransferWorker;
