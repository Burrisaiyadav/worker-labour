import React, { useState, useEffect } from 'react';
import LabourNavbar from '../../components/LabourNavbar';
import { Calendar, Clock, ChevronLeft, Download, Briefcase, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';

const JobHistory = () => {
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [filteredHistory, setFilteredHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        timeRange: 'All Time',
        jobType: 'All'
    });

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const data = await api.get('/jobs/labour/history');
                if (data) {
                    setHistory(data);
                    setFilteredHistory(data);
                }
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch history", err);
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    useEffect(() => {
        let result = [...history];
        
        if (filters.jobType !== 'All') {
            result = result.filter(job => (job.type || job.title) === filters.jobType);
        }

        const now = new Date();
        if (filters.timeRange === 'This Month') {
            result = result.filter(job => new Date(job.createdAt).getMonth() === now.getMonth());
        } else if (filters.timeRange === 'Last Month') {
            result = result.filter(job => new Date(job.createdAt).getMonth() === now.getMonth() - 1);
        }

        setFilteredHistory(result);
    }, [filters, history]);

    const stats = {
        total: filteredHistory.reduce((sum, job) => sum + (Number(job.cost) || 0), 0),
        completed: filteredHistory.filter(j => j.status === 'Completed').length,
        inProgress: filteredHistory.filter(j => j.status === 'In Progress').length
    };

    const jobTypes = ['All', ...new Set(history.map(job => job.type || job.title))];

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <LabourNavbar />

            <main className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex items-center gap-4 mb-8">
                     <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-200 rounded-full transition-colors md:hidden">
                        <ChevronLeft />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Job History</h1>
                        <p className="text-gray-500 mt-1">Review your past work and earnings.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                     {/* Filter Sidebar (Desktop) */}
                     <div className="hidden lg:block lg:col-span-1">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
                            <h3 className="font-bold text-gray-900 mb-4">Filters</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wide block mb-2">Time Range</label>
                                    <select 
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
                                        value={filters.timeRange}
                                        onChange={(e) => setFilters({...filters, timeRange: e.target.value})}
                                    >
                                        <option>All Time</option>
                                        <option>This Month</option>
                                        <option>Last Month</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wide block mb-2">Job Type</label>
                                    <div className="space-y-2">
                                        {jobTypes.map(type => (
                                            <label key={type} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                                                <input 
                                                    type="radio" 
                                                    name="jobType"
                                                    checked={filters.jobType === type}
                                                    onChange={() => setFilters({...filters, jobType: type})}
                                                    className="rounded-full text-green-600 focus:ring-green-500" 
                                                /> {type}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                     </div>
                    
                    {/* Main Content */}
                    <div className="lg:col-span-3 space-y-6">
                         {/* Stats Row */}
                        <div className="grid grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Total Earnings</p>
                                <p className="font-bold text-gray-900 text-2xl text-green-600">₹{stats.total}</p>
                            </div>
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Completed</p>
                                <p className="font-bold text-gray-900 text-2xl">{stats.completed}</p>
                            </div>
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Active</p>
                                <p className="font-bold text-gray-900 text-2xl text-blue-600">{stats.inProgress}</p>
                            </div>
                        </div>

                        {/* List */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                             {loading ? (
                                 <div className="p-12 text-center text-gray-500">Loading your history...</div>
                             ) : filteredHistory.length === 0 ? (
                                 <div className="p-12 text-center text-gray-500 italic">No jobs match your filters.</div>
                             ) : (
                                 <div className="overflow-x-auto">
                                     <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wide">
                                                <th className="px-6 py-4">Job Details</th>
                                                <th className="px-6 py-4">Farmer</th>
                                                <th className="px-6 py-4">Date & Time</th>
                                                <th className="px-6 py-4 text-right">Earnings</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {filteredHistory.map(job => (
                                                <tr key={job.id} className="hover:bg-gray-50 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-gray-900">{job.type || job.title}</div>
                                                        <div className={`text-[10px] inline-block px-2 py-0.5 rounded mt-1 font-bold uppercase tracking-wider ${
                                                            job.status === 'Completed' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'
                                                        }`}>
                                                            {job.status}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">{job.farmerName || 'Farmer'}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col text-sm text-gray-500">
                                                            <span className="flex items-center gap-1.5 font-medium"><Calendar size={14} className="text-gray-400"/> {new Date(job.date || job.createdAt).toLocaleDateString()}</span>
                                                            <span className="flex items-center gap-1.5 mt-1 font-medium"><Clock size={14} className="text-gray-400"/> {job.workers || 1} Workers</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="font-bold text-gray-900">₹{job.cost}</div>
                                                        {job.status === 'Completed' && (
                                                            <button className="text-[10px] font-bold text-blue-600 hover:text-blue-800 uppercase tracking-tight mt-1">View Details</button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                     </table>
                                 </div>
                             )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default JobHistory;
