import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

function QRScanner({ onScan, onError }) {
    const [isScanning, setIsScanning] = useState(false);
    const [hasPermission, setHasPermission] = useState(null);
    const [error, setError] = useState(null);
    const scannerRef = useRef(null);
    const html5QrCodeRef = useRef(null);
    const isMountedRef = useRef(true);
    const elementIdRef = useRef(null);

    useEffect(() => {
        return () => {
            isMountedRef.current = false;
            stopScanner();
        };
    }, []);

    const startScanner = async () => {
        if (html5QrCodeRef.current) {
            await stopScanner();
        }

        try {
            setError(null);
            
            // Use a unique element ID to avoid conflicts
            const elementId = 'qr-reader-' + Date.now();
            const element = document.getElementById('qr-reader');
            if (element) {
                element.id = elementId;
                elementIdRef.current = elementId;
            }
            
            const html5QrCode = new Html5Qrcode(elementId);
            html5QrCodeRef.current = html5QrCode;

            await html5QrCode.start(
                { facingMode: 'environment' },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0,
                    videoConstraints: {
                        width: { min: 480, ideal: 720, max: 1280 },
                        height: { min: 480, ideal: 720, max: 1280 },
                        facingMode: 'environment'
                    }
                },
                (decodedText) => {
                    console.log('QR Code scanned:', decodedText);
                    onScan?.(decodedText);
                    stopScanner();
                },
                (errorMessage) => {
                    // Scan failed, ignore continuous failures
                }
            );

            if (isMountedRef.current) {
                setIsScanning(true);
                setHasPermission(true);
            }
        } catch (err) {
            console.error('Failed to start scanner:', err);
            setError(err.message || 'Failed to access camera');
            setHasPermission(false);
            onError?.(err);
        }
    };

    const stopScanner = async () => {
        const html5QrCode = html5QrCodeRef.current;
        const elementId = elementIdRef.current;
        
        if (html5QrCode) {
            html5QrCodeRef.current = null;
            try {
                if (elementId) {
                    const element = document.getElementById(elementId);
                    if (element && html5QrCode.isScanning) {
                        await html5QrCode.stop();
                    }
                    if (element && element.parentNode) {
                        try {
                            html5QrCode.clear();
                        } catch (clearErr) {
                            console.log('Scanner clear skipped:', clearErr.message);
                        }
                    }
                    // Restore original ID
                    element.id = 'qr-reader';
                    elementIdRef.current = null;
                }
            } catch (err) {
                console.log('Scanner stop error (ignored):', err.message);
            }
        }
        if (isMountedRef.current) {
            setIsScanning(false);
        }
    };

    const toggleScanner = () => {
        if (isScanning) {
            stopScanner();
        } else {
            startScanner();
        }
    };

    return (
        <div className="qr-scanner-container">
            <div className="qr-scanner-frame">
                <div
                    id="qr-reader"
                    ref={scannerRef}
                    style={{
                        width: '100%',
                        minHeight: '300px',
                        background: 'var(--bg-tertiary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    {!isScanning && (
                        <div style={{ textAlign: 'center', padding: '32px' }}>
                            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>📷</div>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
                                Click the button below to start scanning
                            </p>
                        </div>
                    )}
                </div>

                {isScanning && (
                    <>
                        <div className="qr-scanner-corners"></div>
                        <div className="qr-scan-line"></div>
                    </>
                )}
            </div>

            {error && (
                <div style={{
                    marginTop: '16px',
                    padding: '12px 16px',
                    background: 'var(--error-light)',
                    color: 'var(--error)',
                    borderRadius: '8px',
                    fontSize: 'var(--font-size-sm)'
                }}>
                    <strong>Error:</strong> {error}
                </div>
            )}

            {hasPermission === false && (
                <div style={{
                    marginTop: '16px',
                    padding: '16px',
                    background: 'var(--glass-bg)',
                    borderRadius: '8px',
                    textAlign: 'center'
                }}>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>
                        Camera permission is required to scan QR codes.
                    </p>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)' }}>
                        Please allow camera access in your browser settings.
                    </p>
                </div>
            )}

            <div style={{ marginTop: '24px', textAlign: 'center' }}>
                <button
                    className={`btn ${isScanning ? 'btn-danger' : 'btn-primary'} btn-lg`}
                    onClick={toggleScanner}
                >
                    {isScanning ? '⏹ Stop Scanning' : '📷 Start Scanner'}
                </button>
            </div>

            <div style={{
                marginTop: '24px',
                textAlign: 'center',
                color: 'var(--text-tertiary)',
                fontSize: 'var(--font-size-sm)'
            }}>
                <p>Position the QR code within the frame to scan</p>
            </div>
        </div>
    );
}

export default QRScanner;
