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
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <button 
                        onClick={handleFindLabour}
                        className="h-32 bg-green-600 text-white rounded-[2rem] shadow-xl shadow-green-100 flex items-center justify-center gap-6 px-8 hover:bg-green-700 transition-all hover:scale-[1.02] active:scale-95 group overflow-hidden relative"
                    >
                        <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm group-hover:rotate-12 transition-transform">
                            <Search className="h-8 w-8 text-white" />
                        </div>
                        <div className="text-left">
                            <p className="text-xl font-black uppercase tracking-tighter leading-tight">Find<br/>Workers</p>
                            <p className="text-xs text-green-100 font-bold uppercase tracking-widest mt-1 opacity-70">Nearby You</p>
                        </div>
                        <div className="absolute -right-4 -bottom-4 h-24 w-24 bg-white/10 rounded-full"></div>
                    </button>

                    <button 
                        onClick={() => setShowPostJob(true)}
                        className="h-32 bg-blue-600 text-white rounded-[2rem] shadow-xl shadow-blue-100 flex items-center justify-center gap-6 px-8 hover:bg-blue-700 transition-all hover:scale-[1.02] active:scale-95 group overflow-hidden relative"
                    >
                        <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm group-hover:-rotate-12 transition-transform">
                            <PlusCircle className="h-8 w-8 text-white" />
                        </div>
                        <div className="text-left">
                            <p className="text-xl font-black uppercase tracking-tighter leading-tight">Post New<br/>Job</p>
                            <p className="text-xs text-blue-100 font-bold uppercase tracking-widest mt-1 opacity-70">Get Work Done</p>
                        </div>
                        <div className="absolute -right-4 -bottom-4 h-24 w-24 bg-white/10 rounded-full"></div>
                    </button>
                </div>

                {/* Secondary Fast Actions */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                    <button onClick={() => setShowScanQR(true)} className="p-4 bg-white border-2 border-purple-50 rounded-2xl flex flex-col items-center gap-2 hover:border-purple-200 transition-all shadow-sm">
                        <QrCode className="h-6 w-6 text-purple-600" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Attendance</span>
                    </button>
                    <button onClick={handleMyJobs} className="p-4 bg-white border-2 border-orange-50 rounded-2xl flex flex-col items-center gap-2 hover:border-orange-200 transition-all shadow-sm">
                        <Activity className="h-6 w-6 text-orange-600" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">My Jobs ({stats.activeJobsCount})</span>
                    </button>
                    <button onClick={() => setShowMessages(true)} className="p-4 bg-white border-2 border-green-50 rounded-2xl flex flex-col items-center gap-2 hover:border-green-200 transition-all shadow-sm">
                        <MessageCircle className="h-6 w-6 text-green-600" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Chats</span>
                    </button>
                    <button onClick={handleViewMap} className="p-4 bg-white border-2 border-indigo-50 rounded-2xl flex flex-col items-center gap-2 hover:border-indigo-200 transition-all shadow-sm">
                        <MapPin className="h-6 w-6 text-indigo-600" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Live Map</span>
                    </button>
                </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Active Jobs */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex justify-between items-end">
                            <h2 className="text-xl font-bold text-gray-900">Active Jobs</h2>
                            <button onClick={handleMyJobs} className="text-green-600 text-sm font-semibold hover:underline">View All</button>
                        </div>
                        
                        {activeJobs.length === 0 ? (
                            <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 border-dashed">
                                <p className="text-gray-500">No active jobs found.</p>
                                <button className="mt-4 text-green-600 font-medium">Post a new job</button>
                            </div>
                        ) : (
                            activeJobs.map(job => (
                                <div key={job.id} className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col sm:flex-row gap-6">
                                    <div className="h-32 w-full sm:w-48 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                                        <img 
                                            src={job.image} 
                                            alt={job.title} 
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start">
                                                <h3 className="text-xl font-black text-gray-900 tracking-tight">{job.title}</h3>
                                                <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                                                    job.status === 'In Progress' ? 'bg-green-600 text-white' : 
                                                    job.status === 'Scheduled' ? 'bg-blue-600 text-white' : 'bg-gray-400 text-white'
                                                }`}>
                                                    {job.status}
                                                </span>
                                            </div>
                                            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-2">Team: <span className="text-gray-900">{job.group || job.assignedToName || 'Wait...'}</span></p>
                                            
                                            <div className="flex flex-wrap gap-4 mt-4">
                                                <div className="bg-gray-50 px-3 py-2 rounded-xl flex items-center gap-2 border border-gray-100">
                                                    <Calendar className="h-4 w-4 text-green-600" />
                                                    <span className="text-xs font-black text-gray-700 uppercase tracking-tighter">{new Date(job.date).toLocaleDateString()}</span>
                                                </div>
                                                <div className="bg-gray-50 px-3 py-2 rounded-xl flex items-center gap-2 border border-gray-100">
                                                    <Users className="h-4 w-4 text-green-600" />
                                                    <span className="text-xs font-black text-gray-700 uppercase tracking-tighter">{job.workers} People</span>
                                                </div>
                                                <div className="bg-gray-50 px-3 py-2 rounded-xl flex items-center gap-2 border border-gray-100">
                                                    <DollarSign className="h-4 w-4 text-green-600" />
                                                    <span className="text-sm font-black text-green-700 uppercase tracking-tighter">₹{job.cost.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                         <div className="mt-6 flex gap-3">
                                            <button onClick={() => handleMessages(job)} className="flex-1 h-12 bg-white border-2 border-green-600 text-green-700 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-green-50 transition-all flex items-center justify-center gap-2">
                                                <MessageCircle className="h-5 w-5" /> Chat
                                            </button>
                                            {job.assignedToPhone && (
                                                <a 
                                                    href={`tel:${job.assignedToPhone}`}
                                                    className="flex-1 h-12 bg-green-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-green-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-100"
                                                >
                                                    <Phone className="h-5 w-5" /> Call
                                                </a>
                                            )}
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
