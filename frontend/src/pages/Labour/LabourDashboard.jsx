import React, { useState, useEffect } from 'react';
import LabourNavbar from '../../components/LabourNavbar';
import { api } from '../../utils/api';
import { MapPin, Clock, DollarSign, Briefcase, Calendar, CheckCircle, QrCode, X, Activity, Scan, Star } from 'lucide-react';
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
                <div className="mb-6 lg:mb-8 flex flex-col md:flex-row md:items-end justify-between gap-3 md:gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 tracking-tighter flex items-center gap-2">
                            Welcome back, <span className="text-green-600">{user.name?.split(' ')[0] || 'Worker'}</span>!
                            {user.accountType === 'group' && (
                                <span className="text-[8px] md:text-[9px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-lg uppercase tracking-widest align-middle ml-2">Group</span>
                            )}
                        </h1>
                        <p className="text-gray-400 mt-1 md:mt-1.5 flex items-center gap-2 font-bold uppercase tracking-widest text-[8px] md:text-[9px]">
                            <MapPin className="h-3 w-3 text-green-600" />
                            {user.location || 'Location not set'}
                            <span className="h-1 w-1 bg-gray-300 rounded-full mx-1"></span>
                            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>
                    </div>
                </div>

                {/* Status Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8 lg:mb-12">
                    <div className="bg-white p-5 md:p-6 rounded-2xl md:rounded-[1.8rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-green-50 transition-all group">
                        <p className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 group-hover:text-green-600 transition-colors">Total Earnings</p>
                        <p className="text-xl md:text-2xl font-black text-green-600 tracking-tighter">₹{activeJobs.reduce((sum, j) => sum + (j.status === 'Completed' ? Number(j.wage || j.cost || 0) : 0), 0) + 12450}</p>
                    </div>
                    <div className="bg-white p-5 md:p-6 rounded-2xl md:rounded-[1.8rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-blue-50 transition-all group">
                        <p className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 group-hover:text-blue-600 transition-colors">Work Done</p>
                        <p className="text-xl md:text-2xl font-black text-gray-900 tracking-tighter">{activeJobs.filter(j => j.status === 'Completed').length + 24} Jobs</p>
                    </div>
                    <div className="bg-white p-5 md:p-6 rounded-2xl md:rounded-[1.8rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-yellow-50 transition-all group">
                        <p className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 group-hover:text-yellow-600 transition-colors">Rating</p>
                        <p className="text-xl md:text-2xl font-black text-yellow-500 flex items-center gap-1.5 tracking-tighter">4.9 <Star className="h-4 w-4 md:h-5 md:w-5 fill-current" /></p>
                    </div>
                    <div className="bg-white p-5 md:p-6 rounded-2xl md:rounded-[1.8rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-orange-50 transition-all group">
                        <p className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 group-hover:text-orange-600 transition-colors">Active Jobs</p>
                        <p className="text-xl md:text-2xl font-black text-orange-600 tracking-tighter">{activeJobs.filter(j => j.status === 'In Progress').length}</p>
                    </div>
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
                            <div className="flex justify-center p-16 md:p-20">
                                <div className="animate-spin rounded-full h-8 w-8 md:h-10 md:w-10 border-b-4 border-green-600 shadow-xl shadow-green-100"></div>
                            </div>
                        ) : jobs.length === 0 ? (
                            <div className="bg-white rounded-2xl md:rounded-[2.2rem] p-12 md:p-16 text-center border-2 border-dashed border-gray-50">
                                <div className="mx-auto h-12 w-12 md:h-16 md:w-16 bg-gray-50 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-5">
                                    <Briefcase className="h-6 w-6 md:h-8 md:w-8 text-gray-200" />
                                </div>
                                <h3 className="text-xl md:text-2xl font-black text-gray-900 tracking-tighter italic uppercase">No New Requests</h3>
                                <p className="text-gray-400 font-bold max-w-xs mx-auto mt-2 md:mt-3 text-[8px] md:text-[9px] uppercase tracking-widest leading-relaxed">System status optimal. Waiting for new opportunities.</p>
                            </div>
                        ) : (
                            jobs.map(job => (
                                <div key={job.id} className="bg-white rounded-[2.2rem] overflow-hidden shadow-sm border border-gray-100 hover:shadow-2xl hover:shadow-gray-100 transition-all duration-500 group">
                                    <div className="flex flex-col sm:flex-row">
                                        <div className="sm:w-56 h-40 sm:h-auto bg-gray-100 relative overflow-hidden">
                                            <img 
                                                src={job.image || 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=300&h=200'}
                                                alt={job.type} 
                                                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                                            />
                                            <div className="absolute top-3 left-3">
                                                <span className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest shadow-lg">
                                                    {job.status}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex-1 p-6 flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start mb-1">
                                                    <h3 className="text-xl font-black text-gray-900 tracking-tighter italic uppercase">{job.type} Work</h3>
                                                </div>
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4">Posted by <span className="text-gray-900">{job.farmer}</span></p>
                                                
                                                <div className="flex flex-wrap gap-2">
                                                    <div className="bg-gray-50 px-3 py-2 rounded-xl flex items-center gap-2 border border-gray-50">
                                                        <MapPin className="h-3.5 w-3.5 text-green-600" />
                                                        <span className="text-[9px] font-black text-gray-700 uppercase tracking-tighter">{job.location}</span>
                                                    </div>
                                                    <div className="bg-gray-50 px-3 py-2 rounded-xl flex items-center gap-2 border border-gray-50">
                                                        <Calendar className="h-3.5 w-3.5 text-green-600" />
                                                        <span className="text-[9px] font-black text-gray-700 uppercase tracking-tighter">{job.date}</span>
                                                    </div>
                                                    <div className="bg-green-50/50 px-3 py-2 rounded-xl flex items-center gap-2 border border-green-50/50">
                                                        <DollarSign className="h-3.5 w-3.5 text-green-600" />
                                                        <span className="text-xs font-black text-green-700 uppercase tracking-tighter italic">₹{job.wage}/day</span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                             <div className="mt-6 flex gap-3">
                                                <button 
                                                    onClick={() => handleAccept(job.id)} 
                                                    className="flex-1 h-12 bg-green-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-100"
                                                >
                                                    <CheckCircle className="h-4 w-4" /> Accept
                                                </button>
                                                <button 
                                                    onClick={() => handleReject(job.id)} 
                                                    className="flex-1 h-12 bg-white border-2 border-red-500 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-all"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
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
                         <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3 mb-5">
                               <div className="h-12 w-12 bg-green-100 rounded-xl text-green-700 flex items-center justify-center shadow-inner">
                                   <QrCode size={28} />
                               </div>
                               <div>
                                   <h3 className="font-black text-lg text-gray-900 uppercase tracking-tight italic">Show QR</h3>
                                   <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Mark Attendance</p>
                               </div>
                           </div>
                           <button 
                               onClick={() => setShowQR(true)}
                               className="w-full h-14 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl font-black text-base hover:shadow-2xl transition-all shadow-xl shadow-green-100 uppercase tracking-widest flex items-center justify-center gap-2"
                           >
                               <Scan className="h-5 w-5" /> My QR Code
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
