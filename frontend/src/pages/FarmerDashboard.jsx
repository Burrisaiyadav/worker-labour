import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Briefcase, 
  Users, 
  MapPin, 
  Activity, 
  Search, 
  LogOut,
  Calendar,
  DollarSign,
  Star,
  MessageCircle,
  PlusCircle,
  QrCode,
  Scan,
  Phone
} from 'lucide-react';
import Messages from './Messages';
import PostJobModal from '../components/PostJobModal';
import ScanQRModal from '../components/ScanQRModal';
import FarmerNavbar from '../components/FarmerNavbar';
import JobDetailsModal from '../components/JobDetailsModal';
import { api } from '../utils/api';
import { io } from 'socket.io-client';

const FarmerDashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [stats, setStats] = useState({ activeJobsCount: 0, pendingAction: 0 }); // Use this for UI
    const [socket, setSocket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showMessages, setShowMessages] = useState(false);
    const [showPostJob, setShowPostJob] = useState(false);

    const [showScanQR, setShowScanQR] = useState(false);
    const [selectedChatGroup, setSelectedChatGroup] = useState(null);
    const [selectedOtherId, setSelectedOtherId] = useState(null);
    const [selectedJobId, setSelectedJobId] = useState(null);
    const [selectedJob, setSelectedJob] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    const user = JSON.parse(localStorage.getItem('user')) || { id: 'temp' };

    useEffect(() => {
        if (location.state?.openMessages) {
            setShowMessages(true);
            if (location.state.groupName) {
                setSelectedChatGroup(location.state.groupName);
            }
            if (location.state.jobId) {
                setSelectedJobId(location.state.jobId);
            }
        }
    }, [location]);

    // Handlers
    const handleFindLabour = () => navigate('/find-labour');
    const handleMessages = (jobOrWorker = null) => {
        if (jobOrWorker) {
            // It's a job object
            if (jobOrWorker.title || jobOrWorker.status) {
                setSelectedChatGroup(jobOrWorker.group || jobOrWorker.assignedToName || 'Worker');
                setSelectedOtherId(jobOrWorker.assignedTo);
                setSelectedJobId(jobOrWorker.id);
            } 
            // It's a worker/labourer object
            else if (jobOrWorker.name) {
                setSelectedChatGroup(jobOrWorker.name);
                setSelectedOtherId(jobOrWorker.id);
                setSelectedJobId(null);
            }
        }
        setShowMessages(true);
    };
    const handleMyJobs = () => navigate('/my-jobs');
    const handlePostJob = async (jobData) => {
        try {
            await api.post('/jobs', jobData);
            alert('Job Posted Successfully!');
            setShowPostJob(false);
            // Re-fetch dashboard data to update stats
            const data = await api.get('/dashboard/farmer');
            setDashboardData(data);
        } catch (err) {
            console.error(err);
            alert('Failed to post job');
        }
    };
    
    // Mock Interactions
    // Hire Interaction
    const handleHire = async (worker) => {
        try {
            await api.post('/notifications', {
                userId: worker.id,
                title: 'New Hire Request',
                message: `${user.name} wants to hire you for a job in ${user.location}. Click to chat!`,
                type: 'job'
            });
            alert(`Hire request sent to ${worker.name}! Starting chat...`);
            handleMessages(worker);
        } catch (err) {
            console.error(err);
            alert('Failed to send hire request');
        }
    };

    const handleViewDetails = (job) => {
        setSelectedJob(job);
    };

    const handleViewMap = () => {
        alert('Opening Map View for nearby groups... (Mock Map)');
    };

    const handleLearnMore = () => {
        alert('Redirecting to Verified Workers information page...');
    };
    
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const data = await api.get('/dashboard/farmer');
                setDashboardData(data);
                setStats({
                    activeJobsCount: data.activeJobs.length,
                    pendingAction: data.stats.pendingAction
                });
                setLoading(false);
                
                // Initialize Socket if not already initialized
                if (!socket) {
                    const newSocket = io('http://localhost:5000');
                    newSocket.emit('join', user.id);
                    
                    newSocket.on('job-status-updated', (updatedJob) => {
                        console.log('Job Status Updated:', updatedJob);
                        api.get('/dashboard/farmer').then(res => {
                            setDashboardData(res);
                            setStats({
                                activeJobsCount: res.activeJobs.length,
                                pendingAction: res.stats.pendingAction
                            });
                        });
                    });

                    newSocket.on('new-notification', (notif) => {
                        console.log("New notification received:", notif);
                        alert(`Notification: ${notif.title}\n${notif.message}`);
                    });

                    setSocket(newSocket);
                }
            } catch (err) {
                console.error("Dashboard Fetch Error:", err);
                if (err.message === 'Unauthorized') {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    navigate('/login');
                } else {
                     setError('Failed to load dashboard data.');
                }
                setLoading(false);
            }
        };

        fetchDashboardData();

        return () => {
            if (socket) socket.disconnect();
        };
    }, [navigate, user.id]); // Removed socket dependency to avoid infinite loop

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 text-red-600">
                Error: {error}
            </div>
        );
    }

    if (!dashboardData) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
    );

    const { user: currentUserData, activeJobs, nearbyGroups, stats: dashboardStats } = dashboardData;

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Top Navigation Bar */}
            <FarmerNavbar 
                user={currentUserData} 
                onLogout={handleLogout} 
                onPostJob={() => setShowPostJob(true)} 
            />

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Welcome Section */}
                <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 tracking-tighter flex items-center gap-2">
                            Welcome back, <span className="text-green-600">{user?.name?.split(' ')[0] || 'Farmer'}</span>!
                        </h1>
                        <p className="text-gray-500 mt-2 flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {user?.location || 'Location not set'}
                            <span className="h-1 w-1 bg-gray-300 rounded-full mx-1"></span>
                            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>
                    </div>

                {/* Massive Primary Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 mb-8 lg:mb-12">
                    <button 
                        onClick={handleFindLabour}
                        className="h-28 md:h-32 lg:h-40 bg-green-600 text-white rounded-2xl md:rounded-[2.2rem] lg:rounded-[3rem] shadow-xl shadow-green-100 flex items-center justify-center gap-4 md:gap-6 lg:gap-8 px-6 md:px-8 lg:px-10 hover:bg-green-700 transition-all hover:scale-[1.02] active:scale-95 group overflow-hidden relative"
                    >
                        <div className="h-14 w-14 md:h-16 md:w-16 lg:h-20 lg:w-20 bg-white/20 rounded-xl md:rounded-[1.5rem] lg:rounded-[2rem] flex items-center justify-center backdrop-blur-sm group-hover:rotate-12 transition-transform">
                            <Search className="h-6 w-6 md:h-8 md:w-8 lg:h-10 lg:w-10 text-white" />
                        </div>
                        <div className="text-left">
                            <p className="text-xl md:text-2xl lg:text-3xl font-black uppercase tracking-tighter leading-none">Find<br/>Workers</p>
                            <p className="text-[8px] md:text-[9px] lg:text-[10px] text-green-100 font-bold uppercase tracking-widest mt-1 lg:mt-2 opacity-70">Nearby You</p>
                        </div>
                        <div className="absolute -right-6 -bottom-6 md:-right-8 md:-bottom-8 h-20 w-20 md:h-32 md:w-32 bg-white/10 rounded-full"></div>
                    </button>

                    <button 
                        onClick={() => setShowPostJob(true)}
                        className="h-28 md:h-32 lg:h-40 bg-blue-600 text-white rounded-2xl md:rounded-[2.2rem] lg:rounded-[3rem] shadow-xl shadow-blue-100 flex items-center justify-center gap-4 md:gap-6 lg:gap-8 px-6 md:px-8 lg:px-10 hover:bg-blue-700 transition-all hover:scale-[1.02] active:scale-95 group overflow-hidden relative"
                    >
                        <div className="h-14 w-14 md:h-16 md:w-16 lg:h-20 lg:w-20 bg-white/20 rounded-xl md:rounded-[1.5rem] lg:rounded-[2rem] flex items-center justify-center backdrop-blur-sm group-hover:-rotate-12 transition-transform">
                            <PlusCircle className="h-6 w-6 md:h-8 md:w-8 lg:h-10 lg:w-10 text-white" />
                        </div>
                        <div className="text-left">
                            <p className="text-xl md:text-2xl lg:text-3xl font-black uppercase tracking-tighter leading-none">Post New<br/>Job</p>
                            <p className="text-[8px] md:text-[9px] lg:text-[10px] text-blue-100 font-bold uppercase tracking-widest mt-1 lg:mt-2 opacity-70">Get Work Done</p>
                        </div>
                        <div className="absolute -right-6 -bottom-6 md:-right-8 md:-bottom-8 h-20 w-20 md:h-32 md:w-32 bg-white/10 rounded-full"></div>
                    </button>
                </div>

                {/* Secondary Fast Actions */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4 mb-8 lg:mb-12">
                    <button onClick={() => setShowScanQR(true)} className="p-4 md:p-5 lg:p-6 bg-white border border-gray-100 rounded-2xl md:rounded-[1.8rem] lg:rounded-[2.5rem] flex flex-col items-center gap-2 md:gap-3 hover:border-purple-200 transition-all shadow-sm group">
                        <div className="h-9 w-9 md:h-10 md:w-10 lg:h-12 lg:w-12 bg-purple-50 rounded-xl md:rounded-2xl flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                            <QrCode className="h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6 text-purple-600" />
                        </div>
                        <span className="text-[8px] md:text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-gray-900 transition-colors">Attendance</span>
                    </button>
                    <button onClick={handleMyJobs} className="p-4 md:p-5 lg:p-6 bg-white border border-gray-100 rounded-2xl md:rounded-[1.8rem] lg:rounded-[2.5rem] flex flex-col items-center gap-2 md:gap-3 hover:border-orange-200 transition-all shadow-sm group">
                        <div className="h-9 w-9 md:h-10 md:w-10 lg:h-12 lg:w-12 bg-orange-50 rounded-xl md:rounded-2xl flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                            <Activity className="h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6 text-orange-600" />
                        </div>
                        <span className="text-[8px] md:text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-gray-900 transition-colors">My Jobs ({stats.activeJobsCount})</span>
                    </button>
                    <button onClick={() => setShowMessages(true)} className="p-4 md:p-5 lg:p-6 bg-white border border-gray-100 rounded-2xl md:rounded-[1.8rem] lg:rounded-[2.5rem] flex flex-col items-center gap-2 md:gap-3 hover:border-green-200 transition-all shadow-sm group">
                        <div className="h-9 w-9 md:h-10 md:w-10 lg:h-12 lg:w-12 bg-green-50 rounded-xl md:rounded-2xl flex items-center justify-center group-hover:bg-green-100 transition-colors">
                            <MessageCircle className="h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6 text-green-600" />
                        </div>
                        <span className="text-[8px] md:text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-gray-900 transition-colors">Chats</span>
                    </button>
                    <button onClick={handleViewMap} className="p-4 md:p-5 lg:p-6 bg-white border border-gray-100 rounded-2xl md:rounded-[1.8rem] lg:rounded-[2.5rem] flex flex-col items-center gap-2 md:gap-3 hover:border-indigo-200 transition-all shadow-sm group">
                        <div className="h-9 w-9 md:h-10 md:w-10 lg:h-12 lg:w-12 bg-indigo-50 rounded-xl md:rounded-2xl flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                            <MapPin className="h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6 text-indigo-600" />
                        </div>
                        <span className="text-[8px] md:text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-gray-900 transition-colors">Live Map</span>
                    </button>
                </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Left Column: Active Jobs */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex justify-between items-end">
                            <h2 className="text-2xl font-black text-gray-900 tracking-tighter">Active Jobs</h2>
                            <button onClick={handleMyJobs} className="text-green-600 text-xs font-black uppercase tracking-widest hover:underline">View All</button>
                        </div>
                        
                        {activeJobs.length === 0 ? (
                            <div className="bg-white rounded-[2.5rem] p-12 text-center border border-gray-100 border-dashed">
                                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No active jobs found.</p>
                                <button onClick={() => setShowPostJob(true)} className="mt-4 text-green-600 font-black uppercase tracking-widest text-xs">Post a new job</button>
                            </div>
                        ) : (
                            activeJobs.map(job => (
                                <div key={job.id} className="bg-white rounded-[3rem] overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-gray-100 transition-all duration-500 overflow-hidden group">
                                    <div className="flex flex-col sm:flex-row">
                                        <div className="sm:w-64 h-48 sm:h-auto bg-gray-100 relative overflow-hidden">
                                            <img 
                                                src={job.image} 
                                                alt={job.title} 
                                                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                                            />
                                            <div className="absolute top-4 left-4">
                                                <span className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg ${
                                                    job.status === 'In Progress' ? 'bg-green-600 text-white' : 
                                                    job.status === 'Scheduled' ? 'bg-blue-600 text-white' : 'bg-gray-400 text-white'
                                                }`}>
                                                    {job.status}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex-1 p-8 flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="text-2xl font-black text-gray-900 tracking-tighter">{job.title}</h3>
                                                </div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Team: <span className="text-gray-900">{job.group || job.assignedToName || 'Wait...'}</span></p>
                                                
                                                <div className="flex flex-wrap gap-3">
                                                    <div className="bg-gray-50 px-4 py-3 rounded-2xl flex items-center gap-2 border border-gray-50">
                                                        <Calendar className="h-4 w-4 text-green-600" />
                                                        <span className="text-[10px] font-black text-gray-700 uppercase tracking-tighter">{new Date(job.date).toLocaleDateString()}</span>
                                                    </div>
                                                    <div className="bg-gray-50 px-4 py-3 rounded-2xl flex items-center gap-2 border border-gray-50">
                                                        <Users className="h-4 w-4 text-green-600" />
                                                        <span className="text-[10px] font-black text-gray-700 uppercase tracking-tighter">{job.workers} People</span>
                                                    </div>
                                                    <div className="bg-green-50/50 px-4 py-3 rounded-2xl flex items-center gap-2 border border-green-50/50">
                                                        <DollarSign className="h-4 w-4 text-green-600" />
                                                        <span className="text-sm font-black text-green-700 uppercase tracking-tighter">₹{job.cost.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                             <div className="mt-8 flex gap-4">
                                                <button onClick={() => handleMessages(job)} className="flex-1 h-14 bg-white border-2 border-green-600 text-green-700 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-green-50 transition-all flex items-center justify-center gap-2">
                                                    <MessageCircle className="h-5 w-5" /> Chat
                                                </button>
                                                {job.assignedToPhone && (
                                                    <a 
                                                        href={`tel:${job.assignedToPhone}`}
                                                        className="flex-1 h-14 bg-green-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-green-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-100"
                                                    >
                                                        <Phone className="h-5 w-5" /> Call
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Right Column: Suggested Workers */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-end">
                            <h2 className="text-xl font-bold text-gray-900">Nearby Workers</h2>
                            <button onClick={handleViewMap} className="text-green-600 text-sm font-semibold hover:underline">View Map</button>
                        </div>
                        
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            {nearbyGroups.length === 0 ? (
                                <p className="p-8 text-center text-gray-400 italic text-sm">No workers found nearby.</p>
                            ) : (
                                nearbyGroups.map((worker, index) => (
                                    <div key={worker.id} className={`p-4 flex items-center justify-between hover:bg-gray-50 transition-colors ${index !== nearbyGroups.length - 1 ? 'border-b border-gray-100' : ''}`}>
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm">
                                                {worker.name ? worker.name.charAt(0) : 'W'}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900 text-sm">{worker.name || 'Anonymous'}</h4>
                                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                                    <MapPin className="h-3 w-3 text-gray-400" />
                                                    <span>{worker.location || 'Local'}</span>
                                                    {worker.rate && (
                                                        <>
                                                            <span className="text-gray-300">•</span>
                                                            <span className="font-medium text-green-600">₹{worker.rate}/day</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                         <button onClick={() => handleHire(worker)} className="text-green-600 border border-green-200 hover:bg-green-50 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors">
                                            Hire Now
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Promo / Tip Card */}
                        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-6 text-white text-center relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="font-bold text-lg mb-2">Verified Workers</h3>
                                <p className="text-indigo-200 text-sm mb-4">Ensure safety and reliability by hiring from our verified badge groups.</p>
                                <button onClick={handleLearnMore} className="bg-white text-indigo-900 px-4 py-2 rounded-lg text-sm font-bold shadow-lg hover:bg-indigo-50 transition-colors">Learn More</button>
                            </div>
                            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/30 rounded-full blur-2xl -mr-10 -mt-10"></div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Messages Popup */}
            {showMessages && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="relative bg-transparent w-full max-w-sm h-full max-h-[600px] shadow-2xl rounded-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <Messages 
                            onClose={() => { setShowMessages(false); setSelectedJobId(null); setSelectedChatGroup(null); setSelectedOtherId(null); }} 
                            initialGroupName={selectedChatGroup}
                            initialOtherId={selectedOtherId}
                            jobId={selectedJobId}
                        />
                    </div>
                </div>
            )}
            {/* Other Modals */}
            {showPostJob && <PostJobModal onClose={() => setShowPostJob(false)} onSubmit={handlePostJob} />}
            {showScanQR && <ScanQRModal onClose={() => setShowScanQR(false)} />}
            {selectedJob && <JobDetailsModal job={selectedJob} onClose={() => setSelectedJob(null)} />}
        </div>
    );
};

export default FarmerDashboard;
