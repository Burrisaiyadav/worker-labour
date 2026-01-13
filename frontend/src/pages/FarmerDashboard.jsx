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
  Phone,
  Check
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
            // Create a real job for this direct hire
            const jobData = {
                title: worker.accountType === 'group' ? `Group Hire: ${worker.name}` : `Hired ${worker.name}`,
                description: `Direct hire from Marketplace for ${worker.name}`,
                cost: worker.rate || 500,
                workers: worker.membersCount || (worker.members ? worker.members.length : 1),
                date: new Date().toISOString(),
                location: worker.location || user.location,
                assignedTo: worker.id,
                status: 'In Progress'
            };

            const newJob = await api.post('/jobs', jobData);
            
            // Also send notification
            await api.post('/notifications', {
                userId: worker.id,
                title: 'New Direct Hire',
                message: `${user.name} has hired you directly for a job! Check your active jobs.`,
                type: 'job',
                metadata: { jobId: newJob.id }
            });

            alert(`Hired ${worker.name} successfully! The job is now active.`);
            
            // Refresh dashboard
            const data = await api.get('/dashboard/farmer');
            setDashboardData(data);
            setStats({
                activeJobsCount: data.activeJobs.length,
                pendingAction: data.stats.pendingAction
            });

            handleMessages({ ...worker, id: worker.id, name: worker.name, jobId: newJob.id });
        } catch (err) {
            console.error(err);
            alert('Failed to complete hire: ' + (err.response?.data?.msg || err.message));
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

    const handleUpdateStatus = async (jobId, newStatus) => {
        try {
            await api.put(`/jobs/${jobId}/status`, { status: newStatus });
            alert(`Job marked as ${newStatus}!`);
            // Refresh
            const data = await api.get('/dashboard/farmer');
            setDashboardData(data);
        } catch (err) {
            console.error(err);
            alert('Failed to update job status');
        }
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
                        fetchDashboardData();
                    });

                    newSocket.on('payment-verified', (data) => {
                        console.log('Payment Verified in real-time:', data);
                        fetchDashboardData();
                    });

                    newSocket.on('new-notification', (notif) => {
                        console.log("New notification received:", notif);
                        alert(`Message: ${notif.title}\n${notif.message}`);
                        fetchDashboardData();
                    });

                    newSocket.on('group-updated', (group) => {
                        console.log('Group Updated:', group);
                        fetchDashboardData();
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

    const { user: currentUserData, activeJobs, nearbyGroups, bigGroups, stats: dashboardStats } = dashboardData;

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
                <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 flex items-center gap-2">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8">
                    <button 
                        onClick={handleFindLabour}
                        className="h-20 md:h-24 lg:h-28 bg-green-600 text-white rounded-2xl md:rounded-[1.8rem] lg:rounded-[2.2rem] shadow-xl shadow-green-100 flex items-center justify-center gap-4 md:gap-5 lg:gap-6 px-6 md:px-7 lg:px-8 hover:bg-green-700 transition-all hover:scale-[1.02] active:scale-95 group overflow-hidden relative"
                    >
                        <div className="h-10 w-10 md:h-12 md:w-12 lg:h-14 lg:w-14 bg-white/20 rounded-xl md:rounded-[1.2rem] lg:rounded-[1.5rem] flex items-center justify-center backdrop-blur-sm group-hover:rotate-12 transition-transform">
                            <Search className="h-5 w-5 md:h-6 md:w-6 lg:h-8 lg:w-8 text-white" />
                        </div>
                        <div className="text-left">
                            <p className="text-lg md:text-xl lg:text-2xl font-bold uppercase tracking-tight leading-none">Find<br/>Workers</p>
                            <p className="text-[8px] md:text-[9px] lg:text-[10px] text-green-100 font-bold uppercase tracking-widest mt-1 lg:mt-1.5 opacity-70">Nearby You</p>
                        </div>
                        <div className="absolute -right-6 -bottom-6 md:-right-8 md:-bottom-8 h-20 w-20 md:h-32 md:w-32 bg-white/10 rounded-full"></div>
                    </button>

                    <button 
                        onClick={() => setShowPostJob(true)}
                        className="h-20 md:h-24 lg:h-28 bg-blue-600 text-white rounded-2xl md:rounded-[1.8rem] lg:rounded-[2.2rem] shadow-xl shadow-blue-100 flex items-center justify-center gap-4 md:gap-5 lg:gap-6 px-6 md:px-7 lg:px-8 hover:bg-blue-700 transition-all hover:scale-[1.02] active:scale-95 group overflow-hidden relative"
                    >
                        <div className="h-10 w-10 md:h-12 md:w-12 lg:h-14 lg:w-14 bg-white/20 rounded-xl md:rounded-[1.2rem] lg:rounded-[1.5rem] flex items-center justify-center backdrop-blur-sm group-hover:-rotate-12 transition-transform">
                            <PlusCircle className="h-5 w-5 md:h-6 md:w-6 lg:h-8 lg:w-8 text-white" />
                        </div>
                        <div className="text-left">
                            <p className="text-lg md:text-xl lg:text-2xl font-bold uppercase tracking-tight leading-none">Post New<br/>Job</p>
                            <p className="text-[8px] md:text-[9px] lg:text-[10px] text-blue-100 font-bold uppercase tracking-widest mt-1 lg:mt-1.5 opacity-70">Get Work Done</p>
                        </div>
                        <div className="absolute -right-6 -bottom-6 md:-right-8 md:-bottom-8 h-20 w-20 md:h-32 md:w-32 bg-white/10 rounded-full"></div>
                    </button>
                </div>

                {/* Secondary Fast Actions */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4 mb-6 lg:mb-8">
                    <button onClick={() => setShowScanQR(true)} className="p-3 md:p-4 bg-white border border-gray-100 rounded-2xl md:rounded-[1.5rem] lg:rounded-[1.8rem] flex flex-col items-center gap-2 md:gap-3 hover:border-purple-200 transition-all shadow-sm group">
                        <div className="h-8 w-8 md:h-9 md:w-9 lg:h-10 lg:w-10 bg-purple-50 rounded-xl md:rounded-[1.2rem] flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                            <QrCode className="h-4 w-4 md:h-4 md:w-4 lg:h-5 lg:w-5 text-purple-600" />
                        </div>
                        <span className="text-[8px] md:text-[9px] lg:text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-gray-900 transition-colors">Attendance</span>
                    </button>
                    <button onClick={handleMyJobs} className="p-3 md:p-4 bg-white border border-gray-100 rounded-2xl md:rounded-[1.5rem] lg:rounded-[1.8rem] flex flex-col items-center gap-2 md:gap-3 hover:border-orange-200 transition-all shadow-sm group">
                        <div className="h-8 w-8 md:h-9 md:w-9 lg:h-10 lg:w-10 bg-orange-50 rounded-xl md:rounded-[1.2rem] flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                            <Activity className="h-4 w-4 md:h-4 md:w-4 lg:h-5 lg:w-5 text-orange-600" />
                        </div>
                        <span className="text-[8px] md:text-[9px] lg:text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-gray-900 transition-colors">My Jobs ({stats.activeJobsCount})</span>
                    </button>
                    <button onClick={() => setShowMessages(true)} className="p-3 md:p-4 bg-white border border-gray-100 rounded-2xl md:rounded-[1.5rem] lg:rounded-[1.8rem] flex flex-col items-center gap-2 md:gap-3 hover:border-green-200 transition-all shadow-sm group">
                        <div className="h-8 w-8 md:h-9 md:w-9 lg:h-10 lg:w-10 bg-green-50 rounded-xl md:rounded-[1.2rem] flex items-center justify-center group-hover:bg-green-100 transition-colors">
                            <MessageCircle className="h-4 w-4 md:h-4 md:w-4 lg:h-5 lg:w-5 text-green-600" />
                        </div>
                        <span className="text-[8px] md:text-[9px] lg:text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-gray-900 transition-colors">Chats</span>
                    </button>
                    <button onClick={handleViewMap} className="p-3 md:p-4 bg-white border border-gray-100 rounded-2xl md:rounded-[1.5rem] lg:rounded-[1.8rem] flex flex-col items-center gap-2 md:gap-3 hover:border-indigo-200 transition-all shadow-sm group">
                        <div className="h-8 w-8 md:h-9 md:w-9 lg:h-10 lg:w-10 bg-indigo-50 rounded-xl md:rounded-[1.2rem] flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                            <MapPin className="h-4 w-4 md:h-4 md:w-4 lg:h-5 lg:w-5 text-indigo-600" />
                        </div>
                        <span className="text-[8px] md:text-[9px] lg:text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-gray-900 transition-colors">Live Map</span>
                    </button>
                </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Left Column: Active Jobs */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex justify-between items-end">
                            <h2 className="text-2xl font-bold text-gray-900">Active Jobs</h2>
                            <button onClick={handleMyJobs} className="text-green-600 text-xs font-black uppercase tracking-widest hover:underline">View All</button>
                        </div>
                        
                        {activeJobs.length === 0 ? (
                            <div className="bg-white rounded-[2.5rem] p-12 text-center border border-gray-100 border-dashed">
                                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No active jobs found.</p>
                                <button onClick={() => setShowPostJob(true)} className="mt-4 text-green-600 font-black uppercase tracking-widest text-xs">Post a new job</button>
                            </div>
                        ) : (
                            activeJobs.map(job => (
                                <div key={job.id} className="bg-white rounded-[2.2rem] overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-gray-100 transition-all duration-500 overflow-hidden group">
                                    <div className="flex flex-col sm:flex-row">
                                        <div className="sm:w-56 h-48 sm:h-auto bg-gray-100 relative overflow-hidden">
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
                                        <div className="flex-1 p-6 flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="text-xl font-black text-gray-900 tracking-tighter">{job.title}</h3>
                                                </div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Team: <span className="text-gray-900">{job.group || job.assignedToName || 'Wait...'}</span></p>
                                                
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
                                            
                                             {/* Rapido-style Status Stepper */}
                                             <div className="mt-4 px-2">
                                                 <div className="flex items-center justify-between mb-2">
                                                     {['Accepted', 'Arrived', 'Working', 'Completed'].map((step, idx) => (
                                                         <div key={step} className="flex flex-col items-center flex-1 relative">
                                                             <div className={`h-2 w-2 rounded-full z-10 ${
                                                                 (job.status === step || (idx === 0 && job.status === 'In Progress') || (step === 'Completed' && job.status === 'Completed')) ? 'bg-green-600 scale-125' : 
                                                                 (['Accepted', 'Arrived', 'Working', 'Completed'].indexOf(job.status) > idx ? 'bg-green-600' : 'bg-gray-200')
                                                             }`} />
                                                             {idx < 3 && (
                                                                 <div className={`absolute top-1 left-1/2 w-full h-[2px] -z-0 ${
                                                                     ['Accepted', 'Arrived', 'Working', 'Completed'].indexOf(job.status) > idx ? 'bg-green-600' : 'bg-gray-100'
                                                                 }`} />
                                                             )}
                                                             <span className="text-[7px] font-black uppercase tracking-tighter mt-1 text-gray-400">{step}</span>
                                                         </div>
                                                     ))}
                                                 </div>
                                             </div>
                                             
                                              <div className="mt-6 flex gap-3">
                                                 <button onClick={() => handleMessages(job)} className="flex-1 h-12 bg-white border-2 border-green-600 text-green-700 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-green-50 transition-all flex items-center justify-center gap-2">
                                                     <MessageCircle className="h-5 w-5" /> Chat
                                                 </button>
                                                 
                                                 {job.status === 'In Progress' && (
                                                     <button 
                                                         onClick={() => setShowScanQR(true)}
                                                         className="flex-1 h-12 bg-orange-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-orange-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-100"
                                                     >
                                                         <Scan className="h-4 w-4" /> Scan Attendance
                                                     </button>
                                                 )}
                                                 {job.status === 'Arrived' && (
                                                     <button 
                                                         onClick={() => handleUpdateStatus(job.id, 'Working')}
                                                         className="flex-1 h-12 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100"
                                                     >
                                                         Start Work
                                                     </button>
                                                 )}
                                                 {job.status === 'Working' && (
                                                     <button 
                                                         onClick={() => handleUpdateStatus(job.id, 'Completed')}
                                                         className="flex-1 h-12 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100"
                                                     >
                                                         Finish
                                                     </button>
                                                 )}
                                                 
                                                 {/* Allow Payment in Arrived, Working, or Completed status */}
                                                 {['Arrived', 'Working', 'Completed'].includes(job.status) && job.paymentStatus !== 'Paid' && (
                                                     <button 
                                                         onClick={() => navigate(`/payment/${job.id}`)}
                                                         className="flex-1 h-12 bg-green-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-green-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-100 animate-pulse"
                                                     >
                                                         <DollarSign className="h-4 w-4" /> Pay Now
                                                     </button>
                                                 )}
                                                 {job.paymentStatus === 'Paid' && (
                                                     <div className="flex-1 h-12 bg-gray-100 text-gray-500 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                                                         <Check className="h-4 w-4" /> Paid
                                                     </div>
                                                 )}
                                             </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Right Column: Suggested Groups */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-end">
                            <h2 className="text-xl font-bold text-gray-900">Nearby Groups</h2>
                            <button onClick={handleViewMap} className="text-green-600 text-sm font-semibold hover:underline">View Map</button>
                        </div>
                        
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            {!nearbyGroups || nearbyGroups.length === 0 ? (
                                <p className="p-8 text-center text-gray-400 italic text-sm">No groups found nearby.</p>
                            ) : (
                                nearbyGroups.map((group, index) => (
                                    <div key={group.id} className={`p-4 flex items-center justify-between hover:bg-gray-50 transition-colors ${index !== nearbyGroups.length - 1 ? 'border-b border-gray-100' : ''}`}>
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-xl overflow-hidden bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm shadow-sm">
                                                {group.image ? <img src={group.image} alt={group.name} className="h-full w-full object-cover" /> : (group.name ? group.name.charAt(0) : 'G')}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-semibold text-gray-900 text-sm uppercase">{group.name || 'Group'}</h4>
                                                    <span className="bg-blue-50 text-blue-600 text-[8px] font-black px-1.5 py-0.5 rounded uppercase font-bold">Group</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                                    <MapPin className="h-3 w-3 text-gray-400" />
                                                    <span>{group.location || 'Local'}</span>
                                                    <span className="text-gray-300">•</span>
                                                    <Users className="h-3 w-3 text-gray-400" />
                                                    <span>{group.membersCount || group.members?.length || 0} Members</span>
                                                </div>
                                            </div>
                                        </div>
                                          <div className="flex flex-col items-end gap-1.5 min-w-[100px]">
                                            <span className="text-xs font-black text-green-600 tracking-tighter">₹{group.rate || '0'}<span className="text-[8px] text-gray-400 font-bold uppercase ml-0.5">/day</span></span>
                                            <div className="flex gap-1.5 w-full">
                                                <button 
                                                    onClick={() => handleHire(group)} 
                                                    className="flex-1 bg-green-600 text-white py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-700 transition-all shadow-md shadow-green-50 active:scale-95"
                                                >
                                                    Book
                                                </button>
                                                <button 
                                                    onClick={() => handleMessages(group)}
                                                    className="px-2.5 bg-white border border-gray-100 text-gray-400 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                                                >
                                                    <MessageCircle size={14} />
                                                </button>
                                            </div>
                                        </div>
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
