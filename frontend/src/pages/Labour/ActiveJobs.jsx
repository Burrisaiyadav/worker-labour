import React, { useState, useEffect } from 'react';
import LabourNavbar from '../../components/LabourNavbar';
import { api } from '../../utils/api';
import { Phone, Navigation, QrCode, CheckCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ActiveJobs = () => {
    const navigate = useNavigate();
    const [activeJobs, setActiveJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchActiveJobs = async () => {
            try {
                const data = await api.get('/jobs/labour/active');
                 const formattedJobs = data.map(job => ({
                    id: job.id,
                    farmer: 'Farmer', // Placeholder
                    phone: '9876543210', // Placeholder
                    type: job.title,
                    location: job.location || 'Unknown',
                    date: new Date(job.date).toLocaleString(),
                    status: job.status,
                    wage: job.cost
                }));
                setActiveJobs(formattedJobs);
                setLoading(false);
            } catch (err) {
                 console.error("Failed to fetch active jobs", err);
                 setLoading(false);
            }
        };
        fetchActiveJobs();
    }, []);

    const handleCall = (phone) => {
        window.location.href = `tel:${phone}`;
    };

    const handleNavigate = () => {
        alert('Opening Google Maps...');
    };

    const handleScan = () => {
        navigate('/labour/scan');
    };

    const handleComplete = async (id) => {
        if (window.confirm('Are you sure you want to mark this work as completed?')) {
            try {
                 await api.put(`/jobs/${id}/status`, { status: "Completed" });
                 alert('Job marked as completed! Payment pending.');
                 setActiveJobs(activeJobs.filter(j => j.id !== id));
            } catch (err) {
                console.error("Error completing job", err);
                alert("Failed to update status");
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <LabourNavbar />
            
            <main className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Active Jobs</h1>
                        <p className="text-gray-500 mt-1">Manage your current ongoing work.</p>
                    </div>
                    {activeJobs.length > 0 && (
                        <button onClick={handleScan} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-lg font-bold shadow-sm hover:bg-green-700 transition-colors">
                            <QrCode className="h-4 w-4" />
                            Scan Attendance
                        </button>
                    )}
                </div>

                <div className="max-w-4xl">
                     {activeJobs.length === 0 ? (
                        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 border-dashed">
                             <div className="mx-auto h-20 w-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
                                <CheckCircle className="h-10 w-10 text-green-500" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">No Active Jobs</h3>
                            <p className="text-gray-500 mt-2 mb-6">You don't have any ongoing jobs at the moment.</p>
                            <button onClick={() => navigate('/labour/dashboard')} className="text-green-600 font-bold hover:underline flex items-center justify-center gap-1">
                                Browse New Requests <ArrowRight size={16} />
                            </button>
                        </div>
                    ) : (
                        activeJobs.map(job => (
                            <div key={job.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 mb-6">
                                 {/* Header */}
                                 <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                                        <span className="text-green-700 font-bold text-sm uppercase tracking-wide">{job.status}</span>
                                    </div>
                                    <span className="text-sm font-semibold text-gray-500">{job.date}</span>
                                 </div>
                                 
                                 {/* Body */}
                                 <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8">
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{job.type}</h3>
                                        <p className="text-gray-600 mb-6 flex items-center gap-2">
                                            Managed by <span className="font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded text-sm">{job.farmer}</span>
                                        </p>

                                        <div className="flex flex-wrap gap-3">
                                            <button onClick={() => handleCall(job.phone)} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm">
                                                <Phone size={16} /> Call Farmer
                                            </button>
                                            <button onClick={handleNavigate} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm">
                                                <Navigation size={16} /> Get Directions
                                            </button>
                                        </div>
                                    </div>

                                    {/* Right Actions Panel */}
                                    <div className="w-full md:w-64 bg-gray-50 rounded-xl p-5 border border-gray-100 flex flex-col justify-between">
                                        <div className="space-y-3 mb-6">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Wage</span>
                                                <span className="font-bold text-gray-900">₹{job.wage}/day</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Location</span>
                                                <span className="font-bold text-gray-900">{job.location}</span>
                                            </div>
                                        </div>
                                        
                                        <button onClick={() => handleComplete(job.id)} className="w-full py-3 bg-white border-2 border-green-600 text-green-700 rounded-lg font-bold hover:bg-green-50 transition-colors">
                                            Mark as Complete
                                        </button>
                                    </div>
                                 </div>
                            </div>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
};
export default ActiveJobs;
