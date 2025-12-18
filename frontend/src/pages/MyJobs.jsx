import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Calendar, Users, DollarSign, Plus } from 'lucide-react';
import PostJobModal from '../components/PostJobModal';
import { api } from '../utils/api';

const MyJobs = () => {
    const navigate = useNavigate();
    const [showPostJob, setShowPostJob] = useState(false);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    React.useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const data = await api.get('/jobs');
            setJobs(data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch jobs:", err);
            setError('Failed to load jobs'); // Keep simple for now
            setLoading(false);
        }
    };

    const handlePostJob = async (jobData) => {
        try {
            await api.post('/jobs', jobData);
            alert('Job Posted Successfully!');
            setShowPostJob(false);
            fetchJobs(); // Refresh list
        } catch (err) {
            console.error(err);
            alert('Failed to post job');
        }
    };

    const handleMessageGroup = (groupName) => {
        navigate('/dashboard', { state: { openMessages: true, groupName } });
    };

    if (loading) return <div className="p-8 text-center">Loading jobs...</div>;

    // Use jobs state instead of mock const


    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-10 p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-gray-100 rounded-full">
                        <ChevronLeft className="h-6 w-6 text-gray-600" />
                    </button>
                    <h1 className="text-xl font-bold text-gray-900">My Jobs</h1>
                </div>
                <button onClick={() => setShowPostJob(true)} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-md hover:bg-green-700 transition-colors">
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">New Job</span>
                </button>
            </div>

            <div className="max-w-3xl mx-auto p-4 space-y-6">
                {jobs.map(job => (
                    <div key={job.id} className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col sm:flex-row gap-6">
                        <div className="h-32 w-full sm:w-48 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                            <img 
                                src={job.image || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=300&h=200'} 
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
                                <p className="text-gray-500 text-sm mt-1 mb-3">Managed by: <span className="text-gray-900 font-medium">{job.contractor || 'Self-Managed'}</span></p>
                                
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
                                <button className="flex-1 py-2 px-4 bg-gray-50 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors">
                                    Details
                                </button>
                                <button onClick={() => handleMessageGroup(job.group)} className="flex-1 py-2 px-4 bg-green-50 text-green-700 rounded-lg text-sm font-semibold hover:bg-green-100 transition-colors">
                                    Message Group
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {showPostJob && <PostJobModal onClose={() => setShowPostJob(false)} onSubmit={handlePostJob} />}
        </div>
    );
};

export default MyJobs;
