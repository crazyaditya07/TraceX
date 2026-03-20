const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

async function findProduct() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const Product = require('./models/Product');
        const p = await Product.findOne({ tokenId: { $exists: true, $ne: null } });
        if (p) {
            console.log('TOKEN_ID_FOUND:', p.tokenId);
            console.log('PRODUCT_NAME:', p.name);
        } else {
            console.log('TOKEN_ID_PRODUCT: NONE');
        }
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        process.exit(0);
    }
}

findProduct();
