import React, { useState, useEffect } from 'react';
import LabourNavbar from '../../components/LabourNavbar';
import { api } from '../../utils/api';
import { MapPin, Clock, DollarSign, Briefcase, Calendar, CheckCircle, QrCode, X, Activity, Scan } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import JobDetailsModal from '../../components/JobDetailsModal';
import Messages from '../Messages';

const LabourDashboard = () => {
    const [jobs, setJobs] = useState([]);
    const [activeJobs, setActiveJobs] = useState([]); // Added activeJobs
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState(null);
    const [showQR, setShowQR] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [showMessages, setShowMessages] = useState(false);
    const [selectedChatGroup, setSelectedChatGroup] = useState(null);
    const [selectedJobId, setSelectedJobId] = useState(null);
    const [isPaying, setIsPaying] = useState(false);
    const navigate = useNavigate();

    // Mock User from local storage for display
    const user = JSON.parse(localStorage.getItem('user')) || { name: 'Worker', id: '123' };

    useEffect(() => {
        const fetchAvailableJobs = async () => {
            // ... (keep existing fetch logic)
            try {
                const data = await api.get('/jobs/available');
                if (!data) return;
                const formattedJobs = data.map(job => ({
                    id: job?.id,
                    farmer: job?.farmerName || 'Farmer', 
                    farmerId: job?.userId,
                    type: job?.title,
                    location: job?.location || 'Unknown Location',
                    date: job?.date ? new Date(job.date).toLocaleString() : 'N/A',
                    wage: job?.cost,
                    workers: job?.workers,
                    status: job?.status
                }));
                setJobs(formattedJobs);

                // Fetch Job History
                const activeData = await api.get('/jobs/labour/active');
                if (activeData) {
                    setActiveJobs(activeData.map(job => ({
                        ...job,
                        type: job?.title || job?.type,
                        farmer: job?.farmerName || 'Farmer',
                        wage: job?.cost
                    })));
                }
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch jobs", err);
                setLoading(false);
            }
        };

        fetchAvailableJobs();

        const newSocket = io('http://localhost:5000');
        newSocket.emit('join', user.id);
        
        newSocket.on('new-notification', (notif) => {
            console.log("New notification received:", notif);
            // Optionally update unread count in navbar if handled here
        });

        const fetchInitialData = async () => {
             // ... move fetch here? actually let's just make sure unread is handled
        };

        setSocket(newSocket);

        return () => {
            if (newSocket) newSocket.disconnect();
        };
    }, [user.id]);

    const handleAccept = async (id) => {
        try {
            await api.put(`/jobs/${id}/status`, { status: "In Progress" });
            alert(`Job Accepted! Check Job History.`);
            const acceptedJob = jobs.find(j => j.id === id);
            setJobs(jobs.filter(j => j.id !== id));
            if (acceptedJob) {
                setActiveJobs(prev => [{...acceptedJob, status: 'In Progress'}, ...prev]);
            }
        } catch (err) {
            console.error("Failed to accept job", err);
            alert("Failed to accept job");
        }
    };

    const handleReject = (id) => {
        if(window.confirm('Reject this job request?')) {
            setJobs(jobs.filter(j => j.id !== id));
        }
    };

    const handlePayment = async (job) => {
        try {
            setIsPaying(true);
            const order = await api.post('/payments/order', {
                jobId: job.id,
                amount: job.wage || job.cost
            });

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_mock_id",
                amount: order.amount,
                currency: "INR",
                name: "Farm Hand",
                description: `Payment for ${job.type || job.title}`,
                order_id: order.id,
                handler: async (response) => {
                    const result = await api.post('/payments/verify', {
                        ...response,
                        jobId: job.id,
                        payeeId: user.id,
                        amount: job.wage || job.cost
                    });
                    if (result.success) {
                        alert("Payment successful!");
                        // Refresh data
                        window.location.reload();
                    }
                },
                prefill: {
                    name: user.name,
                    contact: user.phone || ""
                },
                theme: {
                    color: "#16a34a"
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            console.error("Payment failed", err);
            alert("Payment initiation failed");
        } finally {
            setIsPaying(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <LabourNavbar />

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                        Welcome back, <span className="text-green-600">{user.name.split(' ')[0]}</span>!
                        {user.accountType === 'group' && (
                            <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full uppercase tracking-wider align-middle ml-2">Group</span>
                        )}
                    </h1>
                    <p className="text-gray-500 mt-2 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {user.location || 'Location not set'}
                        <span className="h-1 w-1 bg-gray-300 rounded-full mx-1"></span>
                        {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Job Requests */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex justify-between items-end">
                            <h2 className="text-xl font-bold text-gray-900">New Job Requests</h2>
                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">{jobs.length} New</span>
                        </div>

                        {loading ? (
                            <div className="flex justify-center p-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                            </div>
                        ) : jobs.length === 0 ? (
                            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 border-dashed">
                                <div className="mx-auto h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                    <Briefcase className="h-8 w-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">No New Requests</h3>
                                <p className="text-gray-500 max-w-sm mx-auto mt-2">You're all caught up! Enable notifications to get alerts for new jobs in your area.</p>
                            </div>
                        ) : (
                            jobs.map(job => (
                                <div key={job.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col md:flex-row gap-6 items-start">
                                    {/* Job Info */}
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-lg font-bold text-gray-900">{job.type} Work</h3>
                                            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                                {job.status}
                                            </span>
                                        </div>
                                        <p className="text-gray-500 text-sm mb-4">Posted by <span className="font-semibold text-gray-900">{job.farmer}</span></p>

                                        <div className="grid grid-cols-2 gap-y-2 gap-x-6 text-sm text-gray-600">
                                            <div className="flex items-center gap-2"><MapPin size={16} className="text-gray-400" /> {job.location}</div>
                                            <div className="flex items-center gap-2"><Calendar size={16} className="text-gray-400" /> {job.date}</div>
                                            <div className="flex items-center gap-2 font-semibold text-green-700"><DollarSign size={16} className="text-green-600" /> ₹{job.wage}/day</div>
                                            <div className="flex items-center gap-2"><Briefcase size={16} className="text-gray-400" /> {job.workers} Workers Needed</div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col gap-3 w-full md:w-56 pt-6 border-t md:border-t-0 border-gray-50">
                                        <button 
                                            onClick={() => handleAccept(job.id)} 
                                            className="w-full h-16 bg-green-600 text-white rounded-2xl text-lg font-black uppercase tracking-widest hover:bg-green-700 shadow-xl shadow-green-100 transition-all flex items-center justify-center gap-3"
                                        >
                                            <CheckCircle className="h-6 w-6" /> Accept
                                        </button>
                                        <button 
                                            onClick={() => handleReject(job.id)} 
                                            className="w-full h-12 bg-white border-2 border-red-500 text-red-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-50 transition-all"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Right Column: Quick Stats / Summary */}
                    <div className="space-y-6">
                          {/* Job History Card */}
                          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                             <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-gray-900">Job History</h3>
                                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{activeJobs.length} Active</span>
                             </div>
                             
                             <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                                {activeJobs.length === 0 ? (
                                    <p className="text-sm text-gray-400 text-center py-4 italic border border-dashed border-gray-100 rounded-lg">No accepted jobs yet.</p>
                                ) : (
                                    activeJobs.map(job => (
                                        <div key={job.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors group">
                                            <div className="flex justify-between items-start mb-1">
                                                <p className="text-sm font-bold text-gray-900 line-clamp-1">{job.type || job.title}</p>
                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                                                    job.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                    {job.status === 'In Progress' ? 'Active' : job.status}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between mt-2">
                                                <div className="flex items-center gap-1.5">
                                                    <div className="h-5 w-5 rounded-full bg-white flex items-center justify-center text-[10px] font-bold text-gray-400 border border-gray-100">
                                                        {job.farmer ? job.farmer.charAt(0) : 'F'}
                                                    </div>
                                                    <span className="text-xs text-gray-500 font-medium">{job.farmer}</span>
                                                </div>
                                                <p className="text-xs font-bold text-green-600">₹{job.wage || job.cost}</p>
                                            </div>
                                            <div className="flex gap-2 mt-3">
                                                <button 
                                                    onClick={() => setSelectedJob(job)}
                                                    className="flex-1 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-[10px] font-bold hover:bg-gray-50 transition-colors"
                                                >
                                                    Details
                                                </button>
                                                {job.status === 'In Progress' && (
                                                    <button 
                                                        onClick={() => handlePayment(job)}
                                                        disabled={isPaying}
                                                        className="flex-1 py-1.5 bg-green-600 text-white rounded-lg text-[10px] font-bold hover:bg-green-700 transition-colors disabled:opacity-50"
                                                    >
                                                        Collect Payment
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => {
                                                        setSelectedChatGroup(job.farmerName || job.farmer);
                                                        setSelectedJobId(job.id);
                                                        setShowMessages(true);
                                                    }}
                                                    className="flex-1 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-[10px] font-bold hover:bg-gray-200 transition-colors"
                                                >
                                                    Message
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                             </div>
                             
                             <button onClick={() => navigate('/labour/history')} className="w-full mt-4 py-2 border border-blue-200 rounded-lg text-sm font-bold text-blue-600 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
                                <Activity size={14} /> Full History
                             </button>
                         </div>
                        
                        {/* Attendance QR Card */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-4 mb-6">
                               <div className="h-14 w-14 bg-green-100 rounded-2xl text-green-700 flex items-center justify-center shadow-inner">
                                   <QrCode size={32} />
                               </div>
                               <div>
                                   <h3 className="font-black text-xl text-gray-900 uppercase tracking-tight">Scanner</h3>
                                   <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Mark Presence</p>
                               </div>
                           </div>
                           <button 
                               onClick={() => setShowQR(true)}
                               className="w-full h-16 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-[2rem] font-black text-lg hover:shadow-2xl transition-all shadow-xl shadow-green-100 uppercase tracking-widest flex items-center justify-center gap-3"
                           >
                               <Scan className="h-6 w-6" /> My QR Code
                           </button>
                       </div>

                         {/* Tip Card */}
                         <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white text-center relative overflow-hidden">
                            <div className="relative z-10">
                                <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-3" />
                                <h3 className="font-bold text-lg mb-2">Complete Profile</h3>
                                <p className="text-gray-400 text-sm mb-4">Verify your skills to get 2x more job requests.</p>
                                <button onClick={() => navigate('/labour/profile')} className="bg-white text-gray-900 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-100 transition-colors">Update Profile</button>
                            </div>
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

            {selectedJob && (
                <JobDetailsModal 
                    job={selectedJob} 
                    onClose={() => setSelectedJob(null)} 
                />
            )}

            {showMessages && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl w-full max-w-4xl h-[80vh] overflow-hidden shadow-2xl relative">
                        <Messages 
                            onClose={() => setShowMessages(false)} 
                            initialGroupName={selectedChatGroup}
                            initialOtherId={jobs.find(j => j.id === selectedJobId)?.farmerId || activeJobs.find(j => j.id === selectedJobId)?.userId}
                            jobId={selectedJobId}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

// QR Code Modal Component for clean code
const QRModal = ({ userId, onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 text-center">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-900 font-sans">Attendance QR</h3>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <X className="h-6 w-6 text-gray-500" />
                        </button>
                    </div>
                    
                    <div className="bg-white p-4 rounded-2xl border-2 border-green-100 mb-6 mx-auto w-fit shadow-inner">
                        <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${userId}`} 
                            alt="Attendance QR Code"
                            className="w-48 h-48"
                        />
                    </div>
                    
                    <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                        Show this QR code to the farmer to mark your attendance for the day.
                    </p>
                    
                    <div className="bg-green-50 rounded-xl p-4 mb-6 border border-green-100">
                        <p className="text-xs text-green-600 font-bold uppercase tracking-wider mb-1">My ID</p>
                        <p className="text-lg font-mono font-bold text-green-800">{userId}</p>
                    </div>

                    <button onClick={onClose} className="w-full bg-green-600 text-white font-bold py-4 rounded-2xl hover:bg-green-700 transition-all shadow-lg shadow-green-100 uppercase tracking-wide">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LabourDashboard;
