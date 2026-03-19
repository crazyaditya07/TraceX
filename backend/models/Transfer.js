const mongoose = require('mongoose');

const transferSchema = new mongoose.Schema({
    productId: {
        type: String,
        required: true
    },
    tokenId: {
        type: Number,
        required: true,
        index: true
    },
    fromWallet: {
        type: String,
        required: true,
        lowercase: true,
        index: true
    },
    toWallet: {
        type: String,
        required: true,
        lowercase: true,
        index: true
    },
    fromRole: {
        type: String,
        required: true
    },
    toRole: {
        type: String,
        required: true
    },
    currentStage: {
        type: String,
        required: true
    },
    nextStage: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: [
            'pending',           // Sender initiated
            'confirmed',         // Receiver confirmed receipt
            'rejected',          // Receiver rejected
            'expired',           // TTL exceeded
            'onchain_processing', // Backend/Sender submitting tx
            'onchain_failed',     // Tx failed
            'retrying',          // Auto-retry in progress
            'failed_permanent',  // Max retries exceeded
            'finalized'          // Event listener confirmed on-chain
        ],
        default: 'pending',
        index: true
    },
    senderSignature: {
        type: String, // EIP-712 signature for audit
        required: false
    },
    txHash: {
        type: String,
        unique: true,
        sparse: true
    },
    txAttempts: [{
        txHash: String,
        timestamp: Date,
        error: String,
        status: String
    }],
    retryCount: {
        type: Number,
        default: 0
    },
    initiatedAt: {
        type: Date,
        default: Date.now
    },
    confirmedAt: Date,
    finalizedAt: Date,
    expiresAt: {
        type: Date,
        required: true,
        index: true
    },
    metadata: {
        type: Map,
        of: mongoose.Schema.Types.Mixed
    }
}, {
    timestamps: true
});

// Unique partial index: Only one active transfer per product
// status IN [pending, confirmed, onchain_processing, retrying, onchain_failed]
transferSchema.index(
    { productId: 1 },
    { 
        unique: true, 
        partialFilterExpression: { 
            status: { $in: ['pending', 'confirmed', 'onchain_processing', 'retrying', 'onchain_failed'] } 
        } 
    }
);

const Transfer = mongoose.model('Transfer', transferSchema);

module.exports = Transfer;
