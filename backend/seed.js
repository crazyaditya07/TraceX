const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const os = require('os');
const Product = require('./models/Product'); // Ensure this points to the right path
require('dotenv').config({ path: '../.env' });// Try to auto-detect local IP for scanning across network (Phone <-> Laptop)
function getLocalIpAddress() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            // Skip internal and non-IPv4 addresses
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return '127.0.0.1'; // Fallback
}

const LOCAL_IP = getLocalIpAddress();
const FRONTEND_PORT = 5173; // Frontend runs on Vite default usually

// Generate base URL for QR codes. Customize this if you are using ngrok or hosting.
const SCAN_URL_BASE = `http://${LOCAL_IP}:${FRONTEND_PORT}/product/`;

console.log(`\n======================================================`);
console.log(`🌐 Base URL for scanning: ${SCAN_URL_BASE}`);
console.log(`📱 Ensure your phone and laptop are on the same WiFi!`);
console.log(`======================================================\n`);

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tracex_db';

const categoryTypes = [
    'Organic Produce',
    'Specialty Coffee',
    'Luxury Goods',
    'Pharmaceuticals',
    'Electronics',
    'Cold Chain Logistics'
];

async function seedProducts(count = 50) {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Optional: clear existing products? We can just insert. Let's delete existing for a clean demo
        console.log('🗑️ Clearing existing products...');
        await Product.deleteMany({});

        // Create directory for QR Code Images
        const qrDir = path.join(__dirname, 'demo-qrs');
        if (!fs.existsSync(qrDir)) {
            fs.mkdirSync(qrDir);
        } else {
            // Clean up old QRs
            fs.readdirSync(qrDir).forEach(file => fs.unlinkSync(path.join(qrDir, file)));
        }

        console.log(`🌱 Generating ${count} synthetic products...`);
        const productsList = [];

        for (let i = 0; i < count; i++) {
            const productId = `TRX-${faker.string.alphanumeric(8).toUpperCase()}`;
            const category = faker.helpers.arrayElement(categoryTypes);
            const name = category === 'Specialty Coffee' ? faker.commerce.productName() + ' Beans'
                : category === 'Organic Produce' ? 'Organic ' + faker.commerce.productName()
                    : faker.commerce.productName();

            // Time logic
            const createdDate = faker.date.recent({ days: 14 }); // 14 days ago max
            const inDistDate = new Date(createdDate.getTime() + (2 * 24 * 60 * 60 * 1000)); // 2 days later
            const inRetailDate = new Date(inDistDate.getTime() + (3 * 24 * 60 * 60 * 1000)); // 3 days later

            // Construct payload URL for the product
            const qrPayload = `${SCAN_URL_BASE}${productId}`;
            const qrCodeDataUrl = await QRCode.toDataURL(qrPayload);

            // Save local PNG image
            await QRCode.toFile(path.join(qrDir, `${productId}.png`), qrPayload);

            const checkpoints = [
                {
                    timestamp: createdDate,
                    location: {
                        address: faker.location.streetAddress(),
                        city: faker.location.city(),
                        country: faker.location.country(),
                        coordinates: {
                            lat: faker.location.latitude(),
                            lng: faker.location.longitude()
                        }
                    },
                    stage: 'Manufactured',
                    handlerName: faker.company.name(),
                    handlerEmail: faker.internet.email(),
                    notes: 'Initial production and packaging completed.',
                    transactionHash: '0x' + faker.string.hexadecimal({ length: 64, prefix: '' })
                },
                {
                    timestamp: inDistDate,
                    location: {
                        address: faker.location.streetAddress(),
                        city: faker.location.city(),
                        country: faker.location.country(),
                        coordinates: {
                            lat: faker.location.latitude(),
                            lng: faker.location.longitude()
                        }
                    },
                    stage: 'InDistribution',
                    handlerName: faker.company.name() + ' Logistics',
                    handlerEmail: faker.internet.email(),
                    notes: 'Loaded onto transit vehicle.',
                    transactionHash: '0x' + faker.string.hexadecimal({ length: 64, prefix: '' })
                },
                {
                    timestamp: inRetailDate,
                    location: {
                        address: faker.location.streetAddress(),
                        city: faker.location.city(),
                        country: faker.location.country(),
                        coordinates: {
                            lat: faker.location.latitude(),
                            lng: faker.location.longitude()
                        }
                    },
                    stage: 'InRetail',
                    handlerName: faker.company.name() + ' Store',
                    handlerEmail: faker.internet.email(),
                    notes: 'Received at retail outlet. Ready for sale.',
                    transactionHash: '0x' + faker.string.hexadecimal({ length: 64, prefix: '' })
                }
            ];

            const newProduct = new Product({
                productId: productId,
                tokenId: i + 1000,
                name: name,
                description: faker.commerce.productDescription(),
                category: category,
                imageUrl: faker.image.urlLoremFlickr({ category: 'product' }),
                batchNumber: faker.string.alphanumeric(6).toUpperCase(),
                currentStage: 'InRetail',
                manufacturer: {
                    name: checkpoints[0].handlerName,
                    email: checkpoints[0].handlerEmail,
                    location: `${checkpoints[0].location.city}, ${checkpoints[0].location.country}`
                },
                manufacturingDate: createdDate,
                manufacturingLocation: checkpoints[0].location,
                checkpoints: checkpoints,
                qrCode: qrCodeDataUrl,
                metadata: {
                    weight: faker.number.int({ min: 1, max: 100 }) + ' ' + faker.helpers.arrayElement(['kg', 'lbs', 'g']),
                    certifications: [faker.helpers.arrayElement(['ISO 9001', 'Fair Trade', 'USDA Organic'])],
                },
                isActive: true
            });

            productsList.push(newProduct);
        }

        await Product.insertMany(productsList);

        console.log(`✅ Successfully seeded 50 products!`);
        console.log(`📁 QR Codes have been generated in: ${qrDir}`);
        console.log(`To test, open a .png file and scan with your phone.`);
        process.exit(0);

    } catch (error) {
        console.error('❌ Error seeding products:', error);
        process.exit(1);
    }
}

seedProducts(50);
