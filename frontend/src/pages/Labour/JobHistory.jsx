import React from 'react';
import LabourNavbar from '../../components/LabourNavbar';
import { Calendar, Clock, ChevronLeft, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const JobHistory = () => {
    const navigate = useNavigate();
    const history = [
        { id: 1, type: 'Plowing', farmer: 'Rajavardhan', date: '18 Dec 2025', hours: 8, wage: 600 },
        { id: 2, type: 'Seeding', farmer: 'Kishan', date: '15 Dec 2025', hours: 6, wage: 400 },
        { id: 3, type: 'Harvesting', farmer: 'Ramesh', date: '10 Dec 2025', hours: 9, wage: 750 },
    ];

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
                                    <select className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500">
                                        <option>This Month</option>
                                        <option>Last Month</option>
                                        <option>Last 3 Months</option>
                                        <option>This Year</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wide block mb-2">Job Type</label>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm text-gray-600">
                                            <input type="checkbox" className="rounded text-green-600 focus:ring-green-500" defaultChecked /> All
                                        </label>
                                        <label className="flex items-center gap-2 text-sm text-gray-600">
                                            <input type="checkbox" className="rounded text-green-600 focus:ring-green-500" /> Harvesting
                                        </label>
                                        <label className="flex items-center gap-2 text-sm text-gray-600">
                                            <input type="checkbox" className="rounded text-green-600 focus:ring-green-500" /> Sowing
                                        </label>
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
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Today</p>
                                <p className="font-bold text-gray-900 text-2xl">₹0</p>
                            </div>
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">This Week</p>
                                <p className="font-bold text-gray-900 text-2xl text-green-600">₹1,000</p>
                            </div>
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">This Month</p>
                                <p className="font-bold text-gray-900 text-2xl">₹4,500</p>
                            </div>
                        </div>

                        {/* List */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
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
                                    {history.map(job => (
                                        <tr key={job.id} className="hover:bg-gray-50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-900">{job.type}</div>
                                                <div className="text-xs text-green-600 bg-green-50 inline-block px-2 py-0.5 rounded mt-1 font-semibold">Completed</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{job.farmer}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col text-sm text-gray-500">
                                                    <span className="flex items-center gap-1"><Calendar size={12}/> {job.date}</span>
                                                    <span className="flex items-center gap-1 mt-0.5"><Clock size={12}/> {job.hours} hrs</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="font-bold text-gray-900">+ ₹{job.wage}</div>
                                                <button className="text-xs text-blue-600 hover:underline opacity-0 group-hover:opacity-100 transition-opacity">Invoice</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                             </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
export default JobHistory;
