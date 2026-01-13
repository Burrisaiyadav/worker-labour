import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';
import LabourNavbar from '../../components/LabourNavbar';
import { Users, UserPlus, Settings, Save, X, Phone, MapPin, DollarSign, Shield, ArrowLeft, Loader2, Check, UserMinus } from 'lucide-react';

const GroupManagement = () => {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedGroup, setEditedGroup] = useState({});
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));

    useEffect(() => {
        fetchGroupDetails();
    }, [groupId]);

    const fetchGroupDetails = async () => {
        try {
            setLoading(true);
            const data = await api.get(`/groups/${groupId}`);
            setGroup(data);
            setEditedGroup(data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch group details", err);
            setError(`Failed to load group details: ${err.message}`);
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            // Reusing POST /api/groups if implementation supports update or creating a PUT route
            // For now, let's assume we can update via a new route or existing logic
            // I will add a PUT /api/groups/:id route to the backend as well
            await api.put(`/groups/${groupId}`, editedGroup);
            setGroup(editedGroup);
            setIsEditing(false);
            alert("Group details updated!");
        } catch (err) {
            console.error("Update failed", err);
            alert("Failed to update group.");
        }
    };

    const handleApprove = async (userId) => {
        try {
            await api.post(`/groups/${groupId}/approve`, { userId });
            fetchGroupDetails();
        } catch (err) {
            console.error("Approve failed", err);
        }
    };

    const handleReject = async (userId) => {
        try {
            await api.post(`/groups/${groupId}/reject`, { userId });
            fetchGroupDetails();
        } catch (err) {
            console.error("Reject failed", err);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        </div>
    );

    if (error || !group) return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <p className="text-red-600 mb-4">{error || "Group not found"}</p>
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-green-600 font-medium">
                <ArrowLeft size={20} /> Go Back
            </button>
        </div>
    );

    const isAdmin = String(group.adminId) === String(user.id);

    return (
        <div className="min-h-screen bg-gray-50">
            <LabourNavbar user={user} />
            
            <main className="max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft size={24} className="text-gray-600" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">Manage Group</h1>
                    {isAdmin && (
                        <button 
                            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                                isEditing ? 'bg-green-600 text-white shadow-lg shadow-green-200' : 'bg-white border text-gray-600 hover:border-green-300'
                            }`}
                        >
                            {isEditing ? <Save size={18} /> : <Settings size={18} />}
                            {isEditing ? 'Save' : 'Edit'}
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Panel: Basic Info */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                            <div className="h-48 w-full rounded-2xl overflow-hidden mb-4 bg-gray-100">
                                <img src={group.image} alt={group.name} className="h-full w-full object-cover" />
                            </div>
                            
                            {isEditing ? (
                                <input 
                                    className="w-full text-xl font-bold mb-2 p-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                    value={editedGroup.name}
                                    onChange={e => setEditedGroup({...editedGroup, name: e.target.value})}
                                />
                            ) : (
                                <h2 className="text-xl font-bold text-gray-900 mb-1">{group.name}</h2>
                            )}
                            
                            <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                                <MapPin size={16} />
                                {isEditing ? (
                                    <input 
                                        className="border rounded px-2 py-1 w-full"
                                        value={editedGroup.location}
                                        onChange={e => setEditedGroup({...editedGroup, location: e.target.value})}
                                    />
                                ) : (
                                    <span>{group.location}</span>
                                )}
                            </div>

                            <div className="space-y-3 pt-4 border-t">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500">Daily Rate</span>
                                    {isEditing ? (
                                        <div className="flex items-center border rounded px-1">
                                            <DollarSign size={14} />
                                            <input 
                                                className="w-16 py-1 outline-none"
                                                type="number"
                                                value={editedGroup.rate}
                                                onChange={e => setEditedGroup({...editedGroup, rate: e.target.value})}
                                            />
                                        </div>
                                    ) : (
                                        <span className="font-bold text-green-600 flex items-center gap-1">
                                            <DollarSign size={16} /> {group.rate}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500">Contact</span>
                                    {isEditing ? (
                                        <input 
                                            className="border rounded px-2 py-1 w-32"
                                            value={editedGroup.contact}
                                            onChange={e => setEditedGroup({...editedGroup, contact: e.target.value})}
                                        />
                                    ) : (
                                        <span className="font-medium text-gray-700">{group.contact}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Members & Requests */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Members List */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Users size={20} className="text-blue-500" />
                                Group Members ({group.members?.length || 0})
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {group.members?.map(member => (
                                    <div key={member.id} className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100">
                                        <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200">
                                            {member.profileImage ? (
                                                <img src={member.profileImage} alt={member.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center font-bold text-gray-400">
                                                    {member.name?.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-900 truncate">{member.name}</p>
                                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                                {String(member.id) === String(group.adminId) ? (
                                                    <span className="flex items-center gap-1 text-amber-600">
                                                        <Shield size={10} /> Admin
                                                    </span>
                                                ) : (
                                                    'Member'
                                                )}
                                            </p>
                                        </div>
                                        {isAdmin && String(member.id) !== String(user.id) && (
                                            <button className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                                                <UserMinus size={18} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Join Requests - Only for Admin */}
                        {isAdmin && (
                            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <UserPlus size={20} className="text-green-500" />
                                    Join Requests ({group.joinRequests?.length || 0})
                                </h3>
                                {group.joinRequests?.length > 0 ? (
                                    <div className="space-y-4">
                                        {group.joinRequests.map(req => (
                                            <div key={req.id} className="flex items-center justify-between p-4 rounded-2xl bg-green-50/50 border border-green-100">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-full overflow-hidden bg-white shadow-sm">
                                                        <img 
                                                            src={req.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(req.name)}`} 
                                                            alt={req.name} 
                                                            className="h-full w-full object-cover" 
                                                        />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900">{req.name}</p>
                                                        <p className="text-sm text-gray-500">{req.mobile}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button 
                                                        onClick={() => handleApprove(req.id)}
                                                        className="h-10 w-10 bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all"
                                                    >
                                                        <Check size={20} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleReject(req.id)}
                                                        className="h-10 w-10 bg-white text-red-500 border border-red-100 rounded-full flex items-center justify-center shadow-sm active:scale-95 transition-all"
                                                    >
                                                        <X size={20} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <UserPlus size={24} className="text-gray-300" />
                                        </div>
                                        <p className="text-gray-500">No pending join requests</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default GroupManagement;
