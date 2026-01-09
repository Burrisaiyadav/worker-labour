import React, { useState, useEffect } from 'react';
import { X, Users, UserPlus, Trash2, Shield, MapPin, DollarSign, Send, Check, Loader2 } from 'lucide-react';
import { api } from '../utils/api';

const GroupDetailsModal = ({ group, onClose, onSuccess }) => {
    const [inviteId, setInviteId] = useState('');
    const [loading, setLoading] = useState(false);
    const [members, setMembers] = useState([]);
    const user = JSON.parse(localStorage.getItem('user'));
    const isAdmin = group.adminId === user.id;

    const handleInvite = async (e) => {
        e.preventDefault();
        if (!inviteId) return;
        setLoading(true);
        try {
            await api.post(`/groups/${group.id}/invite`, { userId: inviteId });
            alert('Invitation sent successfully!');
            setInviteId('');
        } catch (err) {
            console.error('Failed to invite', err);
            alert('Failed to invite user. Make sure the ID is correct.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this group? This action cannot be undone.')) return;
        setLoading(true);
        try {
            await api.delete(`/groups/${group.id}`);
            alert('Group deleted successfully');
            onSuccess();
        } catch (err) {
            console.error('Failed to delete group', err);
            alert('Failed to delete group');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="relative h-48">
                    <img src={group.image} alt={group.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-8">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-3 py-1 bg-blue-600 text-white text-[8px] font-black uppercase tracking-widest rounded-lg shadow-lg">Group</span>
                                {isAdmin && <span className="px-3 py-1 bg-amber-500 text-white text-[8px] font-black uppercase tracking-widest rounded-lg shadow-lg flex items-center gap-1"><Shield size={8} /> Admin</span>}
                            </div>
                            <h2 className="text-3xl font-bold text-white uppercase">{group.name}</h2>
                            <p className="text-blue-200 text-xs font-bold flex items-center gap-1 mt-1"><MapPin size={12} /> {group.location}</p>
                            <div 
                                onClick={() => {
                                    navigator.clipboard.writeText(group.id);
                                    alert('Group ID copied to clipboard!');
                                }}
                                className="mt-2 text-[8px] font-mono text-white/60 bg-white/10 px-2 py-1 rounded-md border border-white/10 cursor-pointer hover:bg-white/20 transition-all w-fit"
                                title="Click to copy ID"
                            >
                                ID: {group.id}
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="absolute top-6 right-6 p-3 bg-white/20 backdrop-blur-md hover:bg-white/40 rounded-2xl transition-all border border-white/20">
                        <X size={20} className="text-white" />
                    </button>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Users size={16} className="text-blue-600" /> Members ({group.members?.length || 0})
                            </h3>
                            <div className="space-y-3 max-h-60 overflow-y-auto pr-2 scrollbar-hide">
                                {group.members?.map((memberId, index) => (
                                    <div key={memberId} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 bg-white rounded-xl flex items-center justify-center text-[10px] font-bold text-gray-500 border border-gray-100">
                                                ID
                                            </div>
                                            <span className="text-xs font-bold text-gray-700">{memberId === user.id ? 'You' : memberId.substring(0, 8)}</span>
                                        </div>
                                        {memberId === group.adminId && <Shield size={14} className="text-amber-500" />}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {isAdmin && group.joinRequests && group.joinRequests.length > 0 && (
                            <div>
                                <h3 className="text-sm font-black text-amber-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <UserPlus size={16} /> Join Requests ({group.joinRequests.length})
                                </h3>
                                <div className="space-y-3">
                                    {group.joinRequests.map(requesterId => (
                                        <div key={requesterId} className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                                            <p className="text-[10px] font-bold text-amber-800 uppercase mb-2">User ID: {requesterId}</p>
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={async () => {
                                                        try {
                                                            await api.post(`/groups/${group.id}/approve`, { userId: requesterId });
                                                            alert('User approved!');
                                                            onSuccess();
                                                        } catch (err) { alert('Failed to approve'); }
                                                    }}
                                                    className="flex-1 py-2 bg-green-600 text-white rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-green-700"
                                                >
                                                    Approve
                                                </button>
                                                <button 
                                                    onClick={async () => {
                                                        try {
                                                            await api.post(`/groups/${group.id}/reject`, { userId: requesterId });
                                                            alert('User rejected');
                                                            onSuccess();
                                                        } catch (err) { alert('Failed to reject'); }
                                                    }}
                                                    className="flex-1 py-2 bg-white border border-red-500 text-red-600 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-red-50"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {isAdmin && (
                            <button 
                                onClick={handleDelete}
                                disabled={loading}
                                className="w-full h-12 border-2 border-red-500 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                            >
                                <Trash2 size={16} /> Delete Group
                            </button>
                        )}
                    </div>

                    <div className="space-y-6">
                        {isAdmin ? (
                            <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100">
                                <h3 className="text-sm font-black text-blue-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <UserPlus size={16} /> Add Member
                                </h3>
                                <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mb-4 leading-relaxed">
                                    Invite other workers by entering their User ID. They must accept the invitation to join.
                                </p>
                                <form onSubmit={handleInvite} className="space-y-3">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={inviteId}
                                            onChange={(e) => setInviteId(e.target.value)}
                                            placeholder="Enter User ID"
                                            className="w-full h-12 bg-white border-none rounded-2xl px-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 shadow-sm"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading || !inviteId}
                                        className="w-full h-12 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100 disabled:opacity-50"
                                    >
                                        {loading ? <Loader2 className="animate-spin" size={16} /> : <><Send size={16} /> Send Invite</>}
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 text-center">
                                <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
                                    <Shield size={20} className="text-gray-400" />
                                </div>
                                <h4 className="text-sm font-black text-gray-900 uppercase mb-2">Member Access</h4>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">
                                    Only the group admin can manage members and invite new workers.
                                </p>
                            </div>
                        )}

                        <div className="bg-green-50/50 p-6 rounded-3xl border border-green-100">
                            <h3 className="text-sm font-black text-green-900 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <DollarSign size={16} /> Daily Wage
                            </h3>
                            <p className="text-2xl font-black text-green-600">₹{group.rate}<span className="text-[10px] text-green-400 uppercase tracking-widest ml-1">/ day</span></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GroupDetailsModal;
