import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QRScanner from '../components/QRScanner/Scanner';

function ScanProduct() {
    const navigate = useNavigate();
    const [manualInput, setManualInput] = useState('');
    const [scanMode, setScanMode] = useState('camera'); // 'camera' or 'manual'

    const handleScan = (result) => {
        // Extract product ID from QR code
        // QR codes may contain full URLs like http://localhost:5173/product/PROD001
        let productId = result;

        try {
            const url = new URL(result);
            const pathParts = url.pathname.split('/');
            const productIndex = pathParts.findIndex(p => p === 'product');
            if (productIndex !== -1 && pathParts[productIndex + 1]) {
                productId = pathParts[productIndex + 1];
            }
        } catch {
            // Result is not a URL, use as-is
        }

        navigate(`/product/${productId}`);
    };

    const handleManualSubmit = (e) => {
        e.preventDefault();
        if (manualInput.trim()) {
            navigate(`/product/${manualInput.trim()}`);
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className="page-header" style={{ textAlign: 'center' }}>
                <h1 className="page-title">Verify Product</h1>
                <p className="page-subtitle">
                    Scan a product QR code or enter the product ID to verify its authenticity
                </p>
            </div>

            {/* Mode Toggle */}
            <div style={{
                display: 'flex',
                gap: '8px',
                justifyContent: 'center',
                marginBottom: 'var(--spacing-8)'
            }}>
                <button
                    className={`btn ${scanMode === 'camera' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setScanMode('camera')}
                >
                    📷 Camera Scan
                </button>
                <button
                    className={`btn ${scanMode === 'manual' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setScanMode('manual')}
                >
                    ⌨️ Manual Entry
                </button>
            </div>

            <div className="card">
                {scanMode === 'camera' ? (
                    <div>
                        <QRScanner
                            onScan={handleScan}
                            onError={(err) => console.error('Scanner error:', err)}
                        />
                    </div>
                ) : (
                    <div>
                        <form onSubmit={handleManualSubmit}>
                            <div className="form-group">
                                <label className="form-label">Product ID</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Enter product ID (e.g., PROD001)"
                                    value={manualInput}
                                    onChange={(e) => setManualInput(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <button
                                type="submit"
                                className="btn btn-primary btn-lg w-full"
                                disabled={!manualInput.trim()}
                            >
                                🔍 Verify Product
                            </button>
                        </form>
                    </div>
                )}
            </div>

            {/* Instructions */}
            <div className="card" style={{ marginTop: 'var(--spacing-6)' }}>
                <h3 style={{ marginBottom: 'var(--spacing-4)' }}>ℹ️ How to Verify</h3>
                <ol style={{
                    color: 'var(--text-secondary)',
                    paddingLeft: '20px',
                    margin: 0
                }}>
                    <li style={{ marginBottom: '8px' }}>
                        <strong>QR Code:</strong> Scan the QR code on the product packaging
                    </li>
                    <li style={{ marginBottom: '8px' }}>
                        <strong>Manual:</strong> Enter the product ID printed on the label
                    </li>
                    <li style={{ marginBottom: '8px' }}>
                        <strong>Verify:</strong> View the complete supply chain history
                    </li>
                    <li>
                        <strong>Check:</strong> Ensure all checkpoints are verified on blockchain
                    </li>
                </ol>
            </div>

            {/* What to Look For */}
            <div className="card" style={{ marginTop: 'var(--spacing-6)' }}>
                <h3 style={{ marginBottom: 'var(--spacing-4)' }}>✅ Signs of Authentic Product</h3>
                <ul style={{
                    color: 'var(--text-secondary)',
                    paddingLeft: '20px',
                    margin: 0,
                    listStyle: 'none'
                }}>
                    <li style={{ marginBottom: '8px' }}>
                        ✓ Green verification badge
                    </li>
                    <li style={{ marginBottom: '8px' }}>
                        ✓ Complete checkpoint history (Manufacturing → Distribution → Retail)
                    </li>
                    <li style={{ marginBottom: '8px' }}>
                        ✓ Verified transaction hashes on Etherscan
                    </li>
                    <li>
                        ✓ Consistent dates and locations in timeline
                    </li>
                </ul>
            </div>
        </div>
    );
}

export default ScanProduct;
