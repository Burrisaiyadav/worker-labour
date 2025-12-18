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
  Scan
} from 'lucide-react';
import Messages from './Messages';
import PostJobModal from '../components/PostJobModal';
import ScanQRModal from '../components/ScanQRModal';
import { api } from '../utils/api';

const FarmerDashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showMessages, setShowMessages] = useState(false);
    const [showPostJob, setShowPostJob] = useState(false);

    const [showScanQR, setShowScanQR] = useState(false);
    const [selectedChatGroup, setSelectedChatGroup] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (location.state?.openMessages) {
            setShowMessages(true);
            if (location.state.groupName) {
                setSelectedChatGroup(location.state.groupName);
            }
            // Optional: Clear state to prevent reopening on simple refresh? 
            // navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location]);

    // Handlers
    const handleFindLabour = () => navigate('/find-labour');
    const handleMessages = () => setShowMessages(true);
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
    const handleHire = (name) => {
        alert(`Request sent to hire ${name}! They will contact you shortly.`);
    };

    const handleViewDetails = (jobId) => {
        alert(`Viewing details for Job ID: ${jobId}`);
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
                // api utility handles headers and token
                const data = await api.get('/dashboard/farmer');
                setDashboardData(data);
                setLoading(false);
            } catch (err) {
                console.error("Dashboard Fetch Error:", err);
                if (err.message === 'Unauthorized') {
                    // api utility might throw this, or we handle it here
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
    }, [navigate]);

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

    const { user, activeJobs, nearbyGroups, stats } = dashboardData;

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Top Navigation Bar */}
            <nav className="bg-white shadow-sm border-b border-gray-100 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-gray-900 tracking-tight">Labour</span>
                </div>
                
                <div className="flex items-center gap-6">
                    <div className="hidden md:flex items-center gap-4 text-sm font-medium text-gray-500">
                        <button onClick={handleFindLabour} className="hover:text-green-600 transition-colors">Find Labour</button>
                        <button onClick={handleMyJobs} className="hover:text-green-600 transition-colors">My Jobs</button>
                    </div>
                    <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                            <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                             {/* Mobile My Jobs */}
                             <button onClick={handleMyJobs} className="md:hidden p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-green-600 transition-colors" title="My Jobs">
                                <Briefcase className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold border-2 border-green-50 shadow-sm">
                            {user.name.charAt(0)}
                        </div>
                        <button 
                            onClick={handleLogout}
                            className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-red-500 transition-colors"
                            title="Logout"
                        >
                            <LogOut className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Welcome Section */}
                <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                            Welcome back, <span className="text-green-600">{user.name.split(' ')[0]}</span>!
                            <button onClick={handleMessages} className="p-2 bg-green-50 text-green-600 rounded-full hover:bg-green-100 transition-colors relative" title="Messages">
                                <MessageCircle className="h-6 w-6" />
                                <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                            </button>
                        </h1>
                        <p className="text-gray-500 mt-2 flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {user.location || 'Location not set'}
                            <span className="h-1 w-1 bg-gray-300 rounded-full mx-1"></span>
                            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>
                    </div>

                    {/* Quick Action Cards */}
                    <div className="flex items-center gap-3">
                        <button onClick={() => setShowPostJob(true)} className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-green-200 transition-all group">
                            <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors">
                                <PlusCircle className="h-5 w-5" />
                            </div>
                            <div className="text-left">
                                <p className="text-xs text-gray-400 font-medium">Create New</p>
                                <p className="text-sm font-bold text-gray-900">Post Job</p>
                            </div>
                        </button>
                        
                        <button onClick={() => setShowScanQR(true)} className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-green-200 transition-all group">
                            <div className="h-8 w-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 group-hover:bg-purple-100 transition-colors">
                                <QrCode className="h-5 w-5" />
                            </div>
                            <div className="text-left">
                                <p className="text-xs text-gray-400 font-medium">Worker ID</p>
                                <p className="text-sm font-bold text-gray-900">Scan QR</p>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-3 gap-3 md:gap-6 mb-8">
                    {/* Active Jobs Card */}
                    <div onClick={handleMyJobs} className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer flex flex-col items-center md:items-start justify-center md:justify-start">
                        <div className="flex justify-between items-start w-full mb-0 md:mb-4">
                            <div className="p-3 bg-blue-50 rounded-xl mx-auto md:mx-0">
                                <Activity className="h-6 w-6 text-blue-600" />
                            </div>
                            <span className="hidden md:block bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">{stats.activeJobsCount} Active</span>
                        </div>
                        <h3 className="hidden md:block text-gray-500 text-sm font-medium">Active Jobs</h3>
                        <p className="text-lg md:text-2xl font-bold text-gray-900 mt-2 md:mt-1">{stats.activeJobsCount}</p>
                    </div>

                    {/* Total Spent Card - Static */}
                    <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center md:items-start justify-center md:justify-start">
                         <div className="flex justify-between items-start w-full mb-0 md:mb-4">
                            <div className="p-3 bg-orange-50 rounded-xl mx-auto md:mx-0">
                                <DollarSign className="h-6 w-6 text-orange-600" />
                            </div>
                        </div>
                        <h3 className="hidden md:block text-gray-500 text-sm font-medium">Total Spent</h3>
                        <p className="hidden md:block text-2xl font-bold text-gray-900 mt-1">₹{stats.totalSpent.toLocaleString('en-IN')}</p>
						<p className="md:hidden text-sm font-bold text-gray-900 mt-2">₹{stats.totalSpent > 1000 ? (stats.totalSpent/1000).toFixed(1) + 'k' : stats.totalSpent}</p>
                    </div>

                    {/* Find Labour Card */}
                    <div onClick={handleFindLabour} className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer bg-gradient-to-br from-green-500 to-green-600 text-white group relative overflow-hidden flex flex-col items-center md:items-start justify-center md:justify-start">
                        <div className="relative z-10 w-full flex flex-col items-center md:items-start">
                            <div className="flex justify-between items-start w-full mb-0 md:mb-4">
                                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm mx-auto md:mx-0">
                                    <Search className="h-6 w-6 text-white" />
                                </div>
                            </div>
                            <h3 className="hidden md:block text-green-50 text-sm font-medium">Need workers?</h3>
                            <p className="hidden md:block text-2xl font-bold text-white mt-1 text-left w-full">Find Labour</p>
                            <p className="md:hidden text-sm font-bold text-white mt-2">Find</p>
                        </div>
                        {/* Decorative Circle */}
                        <div className="absolute -right-6 -bottom-6 h-32 w-32 bg-white/10 rounded-full group-hover:scale-110 transition-transform duration-300"></div>
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
                                                <h3 className="text-lg font-bold text-gray-900">{job.title}</h3>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                    job.status === 'In Progress' ? 'bg-green-100 text-green-700' : 
                                                    job.status === 'Scheduled' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                    {job.status}
                                                </span>
                                            </div>
                                            <p className="text-gray-500 text-sm mt-1 mb-3">Managed by: <span className="text-gray-900 font-medium">{job.group}</span></p>
                                            
                                            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-4 w-4 text-gray-400" />
                                                    {new Date(job.date).toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Users className="h-4 w-4 text-gray-400" />
                                                    {job.workers} Workers
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <DollarSign className="h-4 w-4 text-gray-400" />
                                                    ₹{job.cost.toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="mt-4 pt-4 border-t border-gray-100 flex gap-3">

                                            <button onClick={handleMessages} className="flex-1 py-2 px-4 bg-green-50 text-green-700 rounded-lg text-sm font-semibold hover:bg-green-100 transition-colors">
                                                Message Group
                                            </button>
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
                            {nearbyGroups.map((group, index) => (
                                <div key={group.id} className={`p-4 flex items-center justify-between hover:bg-gray-50 transition-colors ${index !== nearbyGroups.length - 1 ? 'border-b border-gray-100' : ''}`}>
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm">
                                            {group.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900 text-sm">{group.name}</h4>
                                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                                <Star className="h-3 w-3 text-yellow-400 fill-current" />
                                                <span>{group.rating}</span>
                                                <span className="text-gray-300">•</span>
                                                <span>{group.members} Members</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={() => handleHire(group.name)} className="text-green-600 border border-green-200 hover:bg-green-50 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors">
                                        Hire
                                    </button>
                                </div>
                            ))}
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
                        <Messages onClose={() => setShowMessages(false)} />
                    </div>
                </div>
            )}
            {/* Other Modals */}
            {showPostJob && <PostJobModal onClose={() => setShowPostJob(false)} onSubmit={handlePostJob} />}
            {showScanQR && <ScanQRModal onClose={() => setShowScanQR(false)} />}
        </div>
    );
};

export default FarmerDashboard;
