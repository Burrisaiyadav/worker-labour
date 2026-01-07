import React from 'react';
import { X, MapPin, Calendar, Clock, Users, DollarSign, Info } from 'lucide-react';

const JobDetailsModal = ({ job, onClose }) => {
    if (!job) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 shadow-2xl">
                <div className="relative h-48 bg-gray-200">
                    <img 
                        src={job.image || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=600'} 
                        alt={job.title} 
                        className="w-full h-full object-cover"
                    />
                    <button 
                        onClick={onClose} 
                        className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-white rounded-full text-gray-900 transition-colors shadow-lg"
                    >
                        <X className="h-5 w-5" />
                    </button>
                    <div className="absolute bottom-4 left-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                            job.status === 'In Progress' ? 'bg-green-500 text-white' : 
                            job.status === 'Scheduled' ? 'bg-blue-500 text-white' : 'bg-gray-500 text-white'
                        }`}>
                            {job.status}
                        </span>
                    </div>
                </div>

                <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{job.title || job.type + ' Work'}</h2>
                    <p className="text-gray-500 text-sm mb-6 flex items-center gap-1">
                        Managed by <span className="font-semibold text-gray-900">{job.contractor || job.farmer || 'Self-Managed'}</span>
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                            <Calendar className="h-5 w-5 text-green-600" />
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Date</p>
                                <p className="text-sm font-bold text-gray-900">{new Date(job.date).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                            <Users className="h-5 w-5 text-blue-600" />
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Workers</p>
                                <p className="text-sm font-bold text-gray-900">{job.workers} People</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                            <DollarSign className="h-5 w-5 text-amber-600" />
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Daily Wage</p>
                                <p className="text-sm font-bold text-gray-900">₹{job.cost || job.wage}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                            <MapPin className="h-5 w-5 text-red-600" />
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Location</p>
                                <p className="text-sm font-bold text-gray-1000 truncate">{job.location || 'Site Location'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                            <Info size={14} /> Description
                        </h4>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            {job.description || "No additional description provided for this job. Basic agricultural task involving harvesting or field preparation as specified by the farmer."}
                        </p>
                    </div>

                    <button 
                        onClick={onClose}
                        className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-xl active:scale-[0.98]"
                    >
                        Close Details
                    </button>
                </div>
            </div>
        </div>
    );
};

export default JobDetailsModal;
