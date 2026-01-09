import React, { useState } from 'react';
import { X, Users, MapPin, DollarSign, Phone, Image as ImageIcon, Loader2 } from 'lucide-react';
import { api } from '../utils/api';

const CreateGroupModal = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        rate: '',
        contact: '',
        location: '',
        image: 'https://images.unsplash.com/photo-1595959154942-8874f6762391?auto=format&fit=crop&q=80&w=400'
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const newGroup = await api.post('/groups', formData);
            if (newGroup) {
                alert('Group created successfully!');
                onSuccess();
            }
        } catch (err) {
            console.error('Failed to create group', err);
            alert('Failed to create group');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-blue-50/50">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                            <Users size={20} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">Create Group</h3>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Formation Phase</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors shadow-sm">
                        <X size={20} className="text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Group Name</label>
                        <div className="relative">
                            <input
                                required
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                placeholder="e.g. Green Valley Workers"
                                className="w-full h-12 bg-gray-50 border-none rounded-2xl px-4 pl-11 text-gray-900 font-bold focus:ring-2 focus:ring-blue-500 transition-all"
                            />
                            <Users size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Daily Rate (₹)</label>
                            <div className="relative">
                                <input
                                    required
                                    type="number"
                                    value={formData.rate}
                                    onChange={(e) => setFormData({...formData, rate: e.target.value})}
                                    placeholder="500"
                                    className="w-full h-12 bg-gray-50 border-none rounded-2xl px-4 pl-11 text-gray-900 font-bold focus:ring-2 focus:ring-blue-500 transition-all"
                                />
                                <DollarSign size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Contact</label>
                            <div className="relative">
                                <input
                                    required
                                    type="tel"
                                    value={formData.contact}
                                    onChange={(e) => setFormData({...formData, contact: e.target.value})}
                                    placeholder="9876543210"
                                    className="w-full h-12 bg-gray-50 border-none rounded-2xl px-4 pl-11 text-gray-900 font-bold focus:ring-2 focus:ring-blue-500 transition-all"
                                />
                                <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Location</label>
                        <div className="relative">
                            <input
                                required
                                type="text"
                                value={formData.location}
                                onChange={(e) => setFormData({...formData, location: e.target.value})}
                                placeholder="e.g. Pune, Maharashtra"
                                className="w-full h-12 bg-gray-50 border-none rounded-2xl px-4 pl-11 text-gray-900 font-bold focus:ring-2 focus:ring-blue-500 transition-all"
                            />
                            <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                    </div>

                    <button
                        disabled={loading}
                        type="submit"
                        className="w-full h-14 bg-blue-600 text-white rounded-2xl font-black text-base uppercase tracking-widest shadow-xl shadow-blue-100 hover:shadow-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <><Users size={20} /> Create Group</>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateGroupModal;
