import React, { useState, useEffect } from 'react';
import { X, QrCode, Camera } from 'lucide-react';

const ScanQRModal = ({ onClose }) => {
    const [scanning, setScanning] = useState(true);
    const [result, setResult] = useState(null);

    // Mock Scanning Effect
    useEffect(() => {
        if (scanning) {
            const timer = setTimeout(() => {
                setScanning(false);
                setResult({
                    name: 'Ramesh Kumar',
                    id: 'WORKER-892',
                    verified: true
                });
            }, 3000); // 3 seconds scan simulation
            return () => clearTimeout(timer);
        }
    }, [scanning]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200 relative">
                <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors">
                     <X className="h-5 w-5" />
                </button>

                {scanning ? (
                    <div className="bg-gray-900 h-96 flex flex-col items-center justify-center relative">
                        {/* Scanner Overlay UI */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-64 h-64 border-2 border-green-500 rounded-lg relative animate-pulse">
                                <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-green-500 -mt-1 -ml-1"></div>
                                <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-green-500 -mt-1 -mr-1"></div>
                                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-green-500 -mb-1 -ml-1"></div>
                                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-green-500 -mb-1 -mr-1"></div>
                            </div>
                        </div>
                        <Camera className="h-12 w-12 text-gray-600 mb-4 opacity-50" />
                        <p className="text-white text-sm font-medium relative z-10">Align code within frame to scan</p>
                    </div>
                ) : (
                    <div className="p-8 text-center">
                        <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <QrCode className="h-10 w-10 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">Scanned Successfully!</h3>
                        <div className="bg-gray-50 rounded-xl p-4 my-4 border border-gray-100">
                             <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Worker Identified</p>
                             <p className="text-lg font-bold text-gray-900">{result.name}</p>
                             <p className="text-xs font-mono text-gray-400">{result.id}</p>
                             {result.verified && (
                                 <span className="inline-block mt-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                                     Verified Worker
                                 </span>
                             )}
                        </div>
                         <button onClick={onClose} className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition-colors">
                            Done
                        </button>
                         <button onClick={() => { setScanning(true); setResult(null); }} className="mt-3 w-full text-gray-500 font-medium text-sm hover:text-gray-900">
                            Scan Again
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ScanQRModal;
