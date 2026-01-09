import React, { useState } from 'react';
import { X, Search, Users, Loader2, Send } from 'lucide-react';
import { api } from '../utils/api';

const JoinGroupModal = ({ onClose, onSuccess }) => {
    const [groupId, setGroupId] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!groupId) return;
        setLoading(true);
        try {
            await api.post(`/groups/${groupId}/join`);
            alert('Join request sent successfully! The group admin will review your request.');
            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            console.error('Failed to join group', err);
            alert(err.response?.data?.msg || 'Failed to send join request. Make sure the ID is correct.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-green-50/50">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                            <Users size={20} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">Join Group</h3>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Connect with others</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors shadow-sm">
                        <X size={20} className="text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 mb-2">
                        <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest leading-relaxed">
                            To join a group, you need the unique Group ID from the group admin.
                        </p>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Group ID</label>
                        <div className="relative">
                            <input
                                required
                                type="text"
                                value={groupId}
                                onChange={(e) => setGroupId(e.target.value)}
                                placeholder="Paste Group ID here"
                                className="w-full h-12 bg-gray-50 border-none rounded-2xl px-4 pl-11 text-gray-900 font-bold focus:ring-2 focus:ring-green-500 transition-all font-mono text-sm"
                            />
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                    </div>

                    <button
                        disabled={loading || !groupId}
                        type="submit"
                        className="w-full h-14 bg-green-600 text-white rounded-2xl font-black text-base uppercase tracking-widest shadow-xl shadow-green-100 hover:shadow-2xl hover:bg-green-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <><Send size={18} /> Request to Join</>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default JoinGroupModal;
