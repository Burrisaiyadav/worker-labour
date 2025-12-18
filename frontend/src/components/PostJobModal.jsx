import React, { useState } from 'react';
import { X, Calendar, Users, DollarSign } from 'lucide-react';

const PostJobModal = ({ onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        title: '',
        date: '',
        workers: '',
        cost: '',
        description: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-b border-gray-100">
                    <h3 className="font-bold text-gray-900">Post a New Job</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                        <input 
                            type="text" name="title" required 
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="e.g. Wheat Harvesting"
                            value={formData.title} onChange={handleChange}
                        />
                    </div>
                    
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <input 
                                    type="date" name="date" required 
                                    className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    value={formData.date} onChange={handleChange}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Workers Needed</label>
                            <div className="relative">
                                <Users className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <input 
                                    type="number" name="workers" required min="1"
                                    className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="0"
                                    value={formData.workers} onChange={handleChange}
                                />
                            </div>
                        </div>
                     </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Cost (₹)</label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <input 
                                type="number" name="cost" required 
                                className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="0.00"
                                value={formData.cost} onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                         <textarea 
                            name="description" rows="3"
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                            placeholder="Any specific requirements..."
                            value={formData.description} onChange={handleChange}
                         ></textarea>
                    </div>

                    <button type="submit" className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition-colors shadow-lg shadow-green-200">
                        Post Job
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PostJobModal;
