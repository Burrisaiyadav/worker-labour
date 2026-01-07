import React, { useState, useEffect } from 'react';
import LabourNavbar from '../../components/LabourNavbar';
import { api } from '../../utils/api';
import { Phone, Navigation, QrCode, CheckCircle, ArrowRight, X, Map as MapIcon, ShieldCheck, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

const ActiveJobs = () => {
    const navigate = useNavigate();
    const [activeJobs, setActiveJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showQR, setShowQR] = useState(false);
    const [socket, setSocket] = useState(null);

    const user = JSON.parse(localStorage.getItem('user')) || { id: 'temp' };

    useEffect(() => {
        const fetchActiveJobs = async () => {
            try {
                const data = await api.get('/jobs/labour/active');
                 const formattedJobs = data.map(job => ({
                    id: job.id,
                    farmer: job.farmerName || 'Farmer', 
                    farmerId: job.userId,
                    phone: job.assignedToPhone || '9876543210',
                    type: job.title,
                    location: job.location || 'Unknown',
                    date: new Date(job.date).toLocaleString(),
                    status: job.status,
                    wage: job.cost,
                    verified: job.verified || false
                }));
                setActiveJobs(formattedJobs);
                setLoading(false);
            } catch (err) {
                 console.error("Failed to fetch active jobs", err);
                 setLoading(false);
            }
        };
        fetchActiveJobs();

        // Socket for real-time verification
        const newSocket = io('http://localhost:5000');
        newSocket.emit('join', user.id);
        newSocket.on('job-verified', (updatedJob) => {
            setActiveJobs(prev => prev.map(j => j.id === updatedJob.id ? { ...j, verified: true } : j));
            alert('Your presence has been verified by the farmer!');
        });
        setSocket(newSocket);

        return () => newSocket.disconnect();
    }, [user.id]);

    const handleCall = (phone) => {
        window.location.href = `tel:${phone}`;
    };

    const handleComplete = async (id, isVerified) => {
        if (!isVerified) {
            alert('Please show your QR code to the farmer first to verify your arrival.');
            return;
        }
        if (window.confirm('Are you sure you want to mark this work as completed?')) {
            try {
                 await api.put(`/jobs/${id}/status`, { status: "Completed" });
                 alert('Job marked as completed! Payment pending.');
                 setActiveJobs(activeJobs.filter(j => j.id !== id));
            } catch (err) {
                console.error("Error completing job", err);
                alert("Failed to update status");
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <LabourNavbar />
            
            <main className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Active Jobs</h1>
                        <p className="text-gray-500 mt-1">Manage your current ongoing work.</p>
                    </div>
                    {activeJobs.length > 0 && (
                        <button onClick={() => setShowQR(true)} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-lg font-bold shadow-sm hover:bg-green-700 transition-colors">
                            <QrCode className="h-4 w-4" />
                            Show QR Code
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                     <div className="lg:col-span-2 space-y-6">
                        {activeJobs.length === 0 ? (
                            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 border-dashed">
                                <div className="mx-auto h-20 w-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
                                    <CheckCircle className="h-10 w-10 text-green-500" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">No Active Jobs</h3>
                                <p className="text-gray-500 mt-2 mb-6">You don't have any ongoing jobs at the moment.</p>
                                <button onClick={() => navigate('/labour/dashboard')} className="text-green-600 font-bold hover:underline flex items-center justify-center gap-1">
                                    Browse New Requests <ArrowRight size={16} />
                                </button>
                            </div>
                        ) : (
                            activeJobs.map(job => (
                                <div key={job.id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-gray-100 mb-6">
                                    {/* Header */}
                                    <div className="bg-gray-50 px-8 py-6 border-b border-gray-100 flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
                                            <span className="text-green-700 font-black text-xs uppercase tracking-widest">{job.status}</span>
                                            {job.verified && (
                                                <span className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter">
                                                    <ShieldCheck size={12} /> Verified
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{job.date}</span>
                                    </div>
                                    
                                    {/* Body */}
                                    <div className="p-8">
                                        <div className="flex flex-col md:flex-row gap-8">
                                            <div className="flex-1">
                                                <h3 className="text-3xl font-black text-gray-900 tracking-tighter mb-2">{job.type}</h3>
                                                <p className="text-gray-500 font-bold mb-6">
                                                    Managed by <span className="text-gray-900">{job.farmer}</span>
                                                </p>

                                                <div className="flex gap-3">
                                                    <button onClick={() => handleCall(job.phone)} className="flex-1 h-14 bg-gray-100 rounded-2xl flex items-center justify-center gap-3 font-black text-gray-700 hover:bg-gray-200 transition-all uppercase tracking-widest text-xs">
                                                        <Phone size={18} /> Call {job.farmer.split(' ')[0]}
                                                    </button>
                                                    {!job.verified && (
                                                        <button onClick={() => setShowQR(true)} className="flex-1 h-14 bg-green-600 text-white rounded-2xl flex items-center justify-center gap-3 font-black hover:bg-green-700 transition-all uppercase tracking-widest text-xs shadow-lg shadow-green-100">
                                                            <QrCode size={18} /> Show QR
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="w-full md:w-64 bg-gray-50 rounded-3xl p-6 border border-gray-100">
                                                <div className="space-y-4 mb-8">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Wage</span>
                                                        <span className="font-black text-green-700">₹{job.wage}/day</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Location</span>
                                                        <span className="font-bold text-gray-900 text-xs">{job.location}</span>
                                                    </div>
                                                </div>
                                                
                                                <button 
                                                    onClick={() => handleComplete(job.id, job.verified)} 
                                                    className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${
                                                        job.verified 
                                                        ? 'bg-white border-2 border-green-600 text-green-700 hover:bg-green-50' 
                                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                    }`}
                                                >
                                                    {job.verified ? 'Mark as Complete' : 'Verification Pending'}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Mock Map Section (Rapido Flow) */}
                                        <div className="mt-8 pt-8 border-t border-gray-100">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="font-black text-gray-900 uppercase tracking-tighter flex items-center gap-2">
                                                    <MapIcon className="text-blue-600" size={20} /> Field Location
                                                </h4>
                                                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded">Live Tracking</span>
                                            </div>
                                            <div className="h-64 bg-gray-100 rounded-[2rem] overflow-hidden relative group">
                                                <img 
                                                    src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1000" 
                                                    alt="Map Mock" 
                                                    className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 transition-all duration-700"
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="relative">
                                                        <div className="h-12 w-12 bg-blue-600 rounded-full animate-ping absolute inset-0 opacity-20"></div>
                                                        <div className="h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center border-4 border-white shadow-xl relative z-10">
                                                            <MapIcon className="text-white" size={20} />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-white shadow-lg">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                                                            <Navigation size={14} className="text-green-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Destination</p>
                                                            <p className="text-xs font-bold text-gray-900">{job.location} Agricultural Zone</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                     </div>

                     {/* Sidebar Info */}
                     <div className="space-y-6">
                        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                            <h3 className="font-black text-gray-900 uppercase tracking-tighter mb-4">Verification Steps</h3>
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="h-8 w-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-black flex-shrink-0">1</div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">Reach the Farm</p>
                                        <p className="text-xs text-gray-500 mt-1">Use the map to navigate to the field location.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="h-8 w-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-black flex-shrink-0">2</div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">Show your QR</p>
                                        <p className="text-xs text-gray-500 mt-1">Ask the farmer to scan your QR code to verify arrival.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="h-8 w-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-black flex-shrink-0">3</div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">Complete Work</p>
                                        <p className="text-xs text-gray-500 mt-1">Features like "Mark as Complete" will unlock after verification.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-orange-50 p-6 rounded-[2rem] border border-orange-100">
                             <div className="flex items-center gap-3 mb-3">
                                <AlertCircle className="text-orange-600" />
                                <h4 className="font-black text-orange-900 uppercase tracking-widest text-xs">Important</h4>
                             </div>
                             <p className="text-xs text-orange-800 leading-relaxed font-medium">
                                 Verification is mandatory for insurance and payment security. Do not start work before verification.
                             </p>
                        </div>
                     </div>
                </div>
            </main>

            {/* Attendance QR Modal */}
            {showQR && (
                <QRModal 
                    userId={user.id} 
                    onClose={() => setShowQR(false)} 
                />
            )}
        </div>
    );
};

// QR Code Modal Component
const QRModal = ({ userId, onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-white rounded-[3rem] w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200 shadow-2xl">
                <div className="p-8 text-center">
                    <div className="flex justify-between items-center mb-8">
                        <div className="text-left">
                            <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">My QR Code</h3>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Identity Verification</p>
                        </div>
                        <button onClick={onClose} className="p-3 hover:bg-gray-100 rounded-2xl transition-colors">
                            <X className="h-6 w-6 text-gray-400" />
                        </button>
                    </div>
                    
                    <div className="bg-white p-6 rounded-[3rem] border-4 border-green-50 mb-8 mx-auto w-fit shadow-xl shadow-green-100/50">
                        <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${userId}`} 
                            alt="Attendance QR Code"
                            className="w-48 h-48"
                        />
                    </div>
                    
                    <p className="text-gray-500 text-sm mb-8 leading-relaxed font-bold">
                        Ask the farmer to scan this code using their "Attendance" scanner.
                    </p>
                    
                    <div className="bg-green-50 rounded-2xl p-4 mb-8 border border-green-100">
                        <p className="text-[10px] text-green-600 font-black uppercase tracking-widest mb-1">Worker ID</p>
                        <p className="text-xl font-mono font-black text-green-800">{userId}</p>
                    </div>

                    <button onClick={onClose} className="w-full bg-green-600 h-16 text-white rounded-3xl font-black hover:bg-green-700 transition-all shadow-xl shadow-green-100 uppercase tracking-widest">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ActiveJobs;
