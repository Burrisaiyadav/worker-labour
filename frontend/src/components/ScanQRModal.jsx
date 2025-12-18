import React, { useState, useEffect } from 'react';
import { X, QrCode, Camera, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { api } from '../utils/api';

const ScanQRModal = ({ onClose }) => {
    const [scanning, setScanning] = useState(true);
    const [result, setResult] = useState(null);

    const [paymentStatus, setPaymentStatus] = useState(null); // 'processing', 'success', 'error'
    const [scanner, setScanner] = useState(null);

    useEffect(() => {
        // Initialize Scanner
        let html5QrcodeScanner;
        
        if (scanning) {
            // Small delay to ensure DOM is ready
            setTimeout(() => {
                html5QrcodeScanner = new Html5QrcodeScanner(
                    "reader", 
                    { fps: 10, qrbox: { width: 250, height: 250 } },
                    /* verbose= */ false
                );
                
                html5QrcodeScanner.render(onScanSuccess, onScanFailure);
                setScanner(html5QrcodeScanner);
            }, 100);
        }

        return () => {
             if (html5QrcodeScanner) {
                html5QrcodeScanner.clear().catch(error => {
                    console.error("Failed to clear html5QrcodeScanner. ", error);
                });
            }
        };
    }, [scanning]);

    const onScanSuccess = async (decodedText, decodedResult) => {
        // Handle the result
        if (scanner) {
             scanner.clear();
        }
        setScanning(false);
        setPaymentStatus('processing');

        try {
            // Assuming scanned code is a Worker ID or similar, e.g., "WORKER-123"
            // Or a JSON string: { "id": "...", "name": "..." }
            
            // For Demo/Real Feel: Let's assume ANY QR code is valid for now, 
            // and we simulate paying them. In real life, we'd parse specific format.
            console.log(`Scan Code: ${decodedText}`);

            // Call Backend to Record Transaction
            // Mocking details based on scan
            const paymentData = {
                payeeId: decodedText, // Using the scanned text as ID for now
                amount: 500, // Default payment amount for demo
                details: 'Quick Payment via QR'
            };

            await api.post('/payments', paymentData);

            setResult({
                name: 'Identified User', // We could fetch user details by ID if we had endpoint
                id: decodedText,
                verified: true
            });
            setPaymentStatus('success');

        } catch (err) {
            console.error("Payment Error", err);
            setPaymentStatus('error');
        }
    };

    const onScanFailure = (error) => {
        // handle scan failure, usually better to ignore and keep scanning.
        // console.warn(`Code scan error = ${error}`);
    };

    // Cleanup on close
    const handleClose = () => {
        if (scanner) {
            scanner.clear().catch(console.error);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200 relative">
                <button onClick={handleClose} className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors">
                     <X className="h-5 w-5" />
                </button>

                {scanning ? (
                    <div className="bg-gray-900 h-96 flex flex-col items-center justify-center relative">
                        <div id="reader" className="w-full h-full"></div>
                        <p className="text-white/70 text-xs absolute bottom-4">Point at a QR Code</p>
                    </div>
                ) : (
                    <div className="p-8 text-center">
                        {paymentStatus === 'processing' && (
                             <div className="py-8">
                                <Loader className="h-12 w-12 text-green-600 animate-spin mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-gray-900">Processing Payment...</h3>
                             </div>
                        )}

                        {paymentStatus === 'success' && result && (
                            <>
                                <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                    <CheckCircle className="h-10 w-10 text-green-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-1">Payment Successful!</h3>
                                <p className="text-gray-500 mb-4">₹500.00 sent successfully</p>
                                
                                <div className="bg-gray-50 rounded-xl p-4 my-4 border border-gray-100">
                                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Paid To</p>
                                    <p className="text-lg font-bold text-gray-900">{result.name}</p>
                                    <p className="text-xs font-mono text-gray-400">{result.id}</p>
                                </div>
                            </>
                        )}

                        {paymentStatus === 'error' && (
                            <>
                                <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                    <AlertCircle className="h-10 w-10 text-red-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-1">Payment Failed</h3>
                                <p className="text-gray-500 mb-4">There was an issue processing the transaction.</p>
                            </>
                        )}

                        {!paymentStatus && !result && (
                            <div className="py-8 text-gray-500">
                                Scanner Stopped
                            </div>
                        )}
                        
                        {(paymentStatus === 'success' || paymentStatus === 'error') && (
                             <>
                                <button onClick={handleClose} className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition-colors">
                                    Done
                                </button>
                                <button onClick={() => { setScanning(true); setPaymentStatus(null); setResult(null); }} className="mt-3 w-full text-gray-500 font-medium text-sm hover:text-gray-900">
                                    Scan Again
                                </button>
                            </>
                        )}
                        
                    </div>
                )}
            </div>
        </div>
    );
};

export default ScanQRModal;
