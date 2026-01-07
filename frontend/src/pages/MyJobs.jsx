import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Calendar, Users, DollarSign, Plus } from 'lucide-react';
import PostJobModal from '../components/PostJobModal';
import JobDetailsModal from '../components/JobDetailsModal';
import { api } from '../utils/api';

const MyJobs = () => {
    const navigate = useNavigate();
    const [showPostJob, setShowPostJob] = useState(false);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedJob, setSelectedJob] = useState(null);

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

    const handleMessageGroup = (job) => {
        navigate('/dashboard', { state: { openMessages: true, groupName: job.group || job.farmerName, jobId: job.id } });
    };

    if (loading) return <div className="p-8 text-center">Loading jobs...</div>;

    // Use jobs state instead of mock const


    return (
        <div className="min-h-screen bg-gray-50 pb-20 font-sans">
            {/* Header */}
            <div className="bg-white shadow-xl shadow-gray-100/50 sticky top-0 z-20 px-6 py-6 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/dashboard')} className="h-12 w-12 bg-gray-50 flex items-center justify-center rounded-2xl hover:bg-gray-100 transition-all">
                        <ChevronLeft className="h-6 w-6 text-gray-900" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">My Jobs</h1>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">History & Active</p>
                    </div>
                </div>
                <button 
                    onClick={() => setShowPostJob(true)} 
                    className="h-12 px-6 bg-green-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-green-100 hover:bg-green-700 transition-all flex items-center gap-2 group"
                >
                    <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform" />
                    New Job
                </button>
            </div>

            <div className="max-w-3xl mx-auto p-6 space-y-8">
                {jobs.length === 0 ? (
                    <div className="bg-white rounded-[3rem] p-16 text-center border-4 border-dashed border-gray-50">
                        <div className="bg-gray-50 h-24 w-24 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Plus className="h-12 w-12 text-gray-200" />
                        </div>
                        <p className="text-gray-900 font-black text-2xl tracking-tight">No jobs found</p>
                        <p className="text-gray-400 text-sm font-bold mt-2">Start by posting your first job requirement</p>
                        <button 
                            onClick={() => setShowPostJob(true)}
                            className="mt-8 text-green-600 font-black text-sm uppercase tracking-widest hover:text-green-700"
                        >
                            Post a new job
                        </button>
                    </div>
                ) : (
                    jobs.map(job => (
                        <div key={job.id} className="bg-white rounded-[3rem] overflow-hidden shadow-sm border border-gray-100 hover:shadow-2xl hover:shadow-gray-100 transition-all duration-500 group">
                            <div className="flex flex-col sm:flex-row">
                                <div className="sm:w-64 h-48 sm:h-auto bg-gray-100 relative overflow-hidden">
                                    <img 
                                        src={job.image || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=300&h=200'} 
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
                                        <h3 className="text-2xl font-black text-gray-900 tracking-tighter mb-2">{job.title}</h3>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                            <span className="h-1 w-1 bg-gray-300 rounded-full"></span>
                                            Managed by: <span className="text-gray-900">{job.contractor || 'Self-Managed'}</span>
                                        </p>
                                        
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
                                        <button 
                                            onClick={() => setSelectedJob(job)}
                                            className="flex-1 h-14 bg-gray-50 text-gray-700 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-100 transition-all"
                                        >
                                            Details
                                        </button>
                                        <button 
                                            onClick={() => handleMessageGroup(job)} 
                                            className="flex-1 h-14 bg-green-50 text-green-700 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-green-100 transition-all border border-green-100"
                                        >
                                            Chat Group
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
            {showPostJob && <PostJobModal onClose={() => setShowPostJob(false)} onSubmit={handlePostJob} />}
            {selectedJob && <JobDetailsModal job={selectedJob} onClose={() => setSelectedJob(null)} />}
        </div>
    );
};

export default MyJobs;
