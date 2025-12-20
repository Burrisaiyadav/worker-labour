import React, { useState, useEffect } from 'react';
import LabourNavbar from '../../components/LabourNavbar';
import { api } from '../../utils/api';
import { MapPin, Clock, DollarSign, Briefcase, Calendar, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LabourDashboard = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Mock User from local storage for display
    const user = JSON.parse(localStorage.getItem('user')) || { name: 'Worker' };

    useEffect(() => {
        const fetchAvailableJobs = async () => {
            try {
                const data = await api.get('/jobs/available');
                // Transform data for UI if needed
                const formattedJobs = data.map(job => ({
                    id: job.id,
                    farmer: 'Farmer', // We might need to fetch farmer name, but for now use generic or if API returns it later.
                    // Wait, API endpoint Job.find does not populate User.
                    // We might need to update backend to return farmer name.
                    // But for quick "Real Data" demo, we can just say "Verified Farmer" or put userId.
                    // Or update backend to include user name.
                    // Let's stick to what we have.
                    farmerId: job.userId,
                    type: job.title,
                    location: job.location || 'Unknown Location',
                    date: new Date(job.date).toLocaleString(),
                    wage: job.cost,
                    workers: job.workers,
                    status: job.status
                }));
                setJobs(formattedJobs);
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch jobs", err);
                setLoading(false);
            }
        };

        fetchAvailableJobs();
    }, []);

    const handleAccept = async (id) => {
        try {
            await api.put(`/jobs/${id}/status`, { status: "In Progress" });
            alert(`Job Accepted!`);
            setJobs(jobs.filter(j => j.id !== id));
            // Navigate or update state
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

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <LabourNavbar />

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                        Welcome back, <span className="text-green-600">{user.name.split(' ')[0]}</span>!
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
                                    <div className="flex flex-row md:flex-col gap-3 w-full md:w-40 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
                                        <button onClick={() => handleAccept(job.id)} className="w-full py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 shadow-sm transition-colors">
                                            Accept
                                        </button>
                                        <button onClick={() => handleReject(job.id)} className="w-full py-2 border border-gray-200 text-gray-500 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors">
                                            Decline
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Right Column: Quick Stats / Summary */}
                    <div className="space-y-6">
                         {/* Stats Card */}
                         <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-4">Today's Overview</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-green-50 rounded-xl">
                                    <p className="text-green-600 text-xs font-bold uppercase">Earnings</p>
                                    <p className="text-2xl font-bold text-green-700 mt-1">₹0</p>
                                </div>
                                <div className="p-4 bg-blue-50 rounded-xl">
                                    <p className="text-blue-600 text-xs font-bold uppercase">Jobs Done</p>
                                    <p className="text-2xl font-bold text-blue-700 mt-1">0</p>
                                </div>
                            </div>
                            <button onClick={() => navigate('/labour/wallet')} className="w-full mt-4 py-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                                View Wallet
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
        </div>
    );
};

export default LabourDashboard;
