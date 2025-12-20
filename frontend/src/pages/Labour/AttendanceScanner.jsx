/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, QrCode, CheckCircle, AlertCircle, Loader, ChevronLeft } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
// import { api } from '../../utils/api'; // Mocking for now

const AttendanceScanner = () => {
    const navigate = useNavigate();
    const [scanning, setScanning] = useState(true);
    const [result, setResult] = useState(null);
    const [status, setStatus] = useState(null); // 'processing', 'success', 'error'

    useEffect(() => {
        let scanner;
        if (scanning) {
            setTimeout(() => {
                scanner = new Html5QrcodeScanner(
                    "attendance-reader",
                    { fps: 10, qrbox: { width: 250, height: 250 } },
                    false
                );
                scanner.render(onScanSuccess, onScanFailure);
            }, 100);
        }
        
        // Store scanner instance to clear later if needed (hard to access inside effect closure without ref, 
        // but Html5QrcodeScanner usually handles cleanup if we call clear on the instance)
        // Simplified cleanup for this mock implementation
        return () => {
             const element = document.getElementById("attendance-reader");
             if (element) element.innerHTML = "";
        };
    }, [scanning]);

    const onScanSuccess = (decodedText) => {
        setScanning(false);
        setStatus('processing');
        
        // Mock processing
        setTimeout(() => {
            // Assume we scanned a valid Farmer QR or Job QR
            console.log("Scanned:", decodedText);
            setResult({
                manager: "Ramesh Farmer",
                jobId: "JOB-101",
                time: new Date().toLocaleTimeString()
            });
            setStatus('success');
        }, 1500);
    };

    const onScanFailure = (err) => {
        // console.warn(err);
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col font-sans">
            <div className="p-4 flex items-center justify-between z-10">
                <button onClick={() => navigate(-1)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"><ChevronLeft /></button>
                <h1 className="font-bold text-lg">Scan for Attendance</h1>
                <div className="w-10"></div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-4">
                {scanning ? (
                    <div className="w-full max-w-sm aspect-square bg-gray-900 rounded-3xl overflow-hidden relative border-2 border-green-500/50 shadow-[0_0_40px_rgba(34,197,94,0.3)]">
                        <div id="attendance-reader" className="w-full h-full [&>div]:!shadow-none [&>div]:!border-none"></div>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-64 h-64 border-2 border-green-500 rounded-xl opacity-50 relative">
                                <div className="absolute top-0 left-0 w-6 h-6 border-l-4 border-t-4 border-green-500 -ml-1 -mt-1 rounded-tl-lg"></div>
                                <div className="absolute top-0 right-0 w-6 h-6 border-r-4 border-t-4 border-green-500 -mr-1 -mt-1 rounded-tr-lg"></div>
                                <div className="absolute bottom-0 left-0 w-6 h-6 border-l-4 border-b-4 border-green-500 -ml-1 -mb-1 rounded-bl-lg"></div>
                                <div className="absolute bottom-0 right-0 w-6 h-6 border-r-4 border-b-4 border-green-500 -mr-1 -mb-1 rounded-br-lg"></div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white text-gray-900 rounded-3xl w-full max-w-sm p-8 text-center animate-in zoom-in duration-300">
                        {status === 'processing' && (
                            <div className="py-8">
                                <Loader className="mx-auto h-12 w-12 text-green-600 animate-spin mb-4" />
                                <h3 className="font-bold text-lg">Verifying Code...</h3>
                                <p className="text-gray-500 text-sm mt-2">Please wait a moment</p>
                            </div>
                        )}
                        {status === 'success' && result && (
                            <div>
                                <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle className="h-10 w-10 text-green-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Attendance Marked!</h2>
                                <p className="text-gray-500 mb-6">You have successfully clocked in.</p>
                                
                                <div className="bg-gray-50 p-5 rounded-2xl text-left space-y-3 mb-8 border border-gray-100">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 text-sm font-medium">Manager</span>
                                        <span className="font-bold text-gray-900">{result.manager}</span>
                                    </div>
                                    <div className="h-px bg-gray-200"></div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 text-sm font-medium">Time</span>
                                        <span className="font-bold text-gray-900 font-mono">{result.time}</span>
                                    </div>
                                </div>
                                
                                <button onClick={() => navigate('/labour/active-jobs')} className="w-full py-4 bg-green-600 text-white rounded-xl font-bold shadow-xl shadow-green-200 hover:bg-green-700 transition-transform active:scale-95">
                                    Go to Active Jobs
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
             <p className="text-center text-white/50 text-xs pb-8">Point camera at the Farmer's QR Code</p>
        </div>
    );
};

export default AttendanceScanner;
