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
        <div className="min-h-screen bg-gray-50 font-sans pb-20">
            <LabourNavbar />

            <main className="max-w-7xl mx-auto px-6 py-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase mb-2">Job History</h1>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Review your past work and earnings.</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="h-12 px-6 bg-white border border-gray-100 rounded-2xl flex items-center gap-2 font-black text-[10px] uppercase tracking-widest text-gray-600 hover:bg-gray-50 transition-all shadow-sm">
                            <Download size={16} /> Export CSV
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                     {/* Filter Sidebar (Desktop) */}
                     <div className="lg:col-span-1">
                        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-gray-200/50 border border-white sticky top-28">
                            <h3 className="font-black text-gray-900 uppercase tracking-tighter text-xl mb-6">Filters</h3>
                            <div className="space-y-8">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">Time Range</label>
                                    <div className="space-y-2">
                                        {['All Time', 'This Month', 'Last Month'].map(range => (
                                            <button 
                                                key={range}
                                                onClick={() => setFilters({...filters, timeRange: range})}
                                                className={`w-full text-left px-4 py-3 rounded-xl font-bold text-xs transition-all ${
                                                    filters.timeRange === range 
                                                    ? 'bg-green-600 text-white shadow-lg shadow-green-100' 
                                                    : 'text-gray-500 hover:bg-gray-50'
                                                }`}
                                            >
                                                {range}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">Job Type</label>
                                    <div className="grid grid-cols-1 gap-2">
                                        {jobTypes.map(type => (
                                            <button 
                                                key={type}
                                                onClick={() => setFilters({...filters, jobType: type})}
                                                className={`w-full text-left px-4 py-3 rounded-xl font-bold text-xs transition-all ${
                                                    filters.jobType === type 
                                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                                                    : 'text-gray-500 hover:bg-gray-50'
                                                }`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                     </div>
                    
                    {/* Main Content */}
                    <div className="lg:col-span-3 space-y-10">
                         {/* Stats Row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-green-50 transition-all group">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 group-hover:text-green-600 transition-colors">Total Earnings</p>
                                <p className="text-3xl font-black text-green-600 tracking-tighter">₹{stats.total}</p>
                            </div>
                            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-50 transition-all group">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 group-hover:text-gray-900 transition-colors">Completed</p>
                                <p className="text-3xl font-black text-gray-900 tracking-tighter">{stats.completed}</p>
                            </div>
                            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-blue-50 transition-all group">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 group-hover:text-blue-600 transition-colors">Active Jobs</p>
                                <p className="text-3xl font-black text-blue-600 tracking-tighter">{stats.inProgress}</p>
                            </div>
                        </div>

                        {/* List */}
                        <div className="bg-white rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
                             {loading ? (
                                 <div className="p-20 text-center">
                                     <div className="h-12 w-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Loading History...</p>
                                 </div>
                             ) : filteredHistory.length === 0 ? (
                                 <div className="p-20 text-center">
                                     <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                         <Briefcase className="h-10 w-10 text-gray-200" />
                                     </div>
                                     <h3 className="text-xl font-black text-gray-900 tracking-tighter uppercase mb-2">No Records Found</h3>
                                     <p className="text-gray-400 text-sm font-bold">Try adjusting your filters to see more results.</p>
                                 </div>
                             ) : (
                                 <div className="overflow-x-auto">
                                     <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Job Details</th>
                                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Farmer</th>
                                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date & Duration</th>
                                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Earnings</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {filteredHistory.map(job => (
                                                <tr key={job.id} className="hover:bg-gray-50/50 transition-all group cursor-default">
                                                    <td className="px-8 py-8">
                                                        <div className="font-black text-gray-900 text-lg tracking-tighter uppercase group-hover:text-green-600 transition-colors">{job.type || job.title}</div>
                                                        <div className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                                                            job.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                                        }`}>
                                                            <Activity size={10} />
                                                            {job.status}
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-8">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 font-black text-lg">
                                                                {job.farmerName?.charAt(0) || 'F'}
                                                            </div>
                                                            <div className="font-black text-gray-900 tracking-tight uppercase text-sm">{job.farmerName || 'Farmer'}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-8">
                                                        <div className="space-y-1.5">
                                                            <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
                                                                <Calendar size={14} className="text-gray-300" /> 
                                                                {new Date(job.date || job.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                                            </div>
                                                            <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                                <Clock size={12} className="text-gray-300" /> 
                                                                {job.workers || 1} Workers
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-8 text-right">
                                                        <div className="text-xl font-black text-gray-900 tracking-tighter">₹{job.cost}</div>
                                                        {job.status === 'Completed' && (
                                                            <button className="mt-2 text-[9px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest flex items-center gap-1 ml-auto transition-colors">
                                                                Receipt <Download size={10} />
                                                            </button>
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
