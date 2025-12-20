import React, { useState, useEffect } from 'react';
import LabourNavbar from '../../components/LabourNavbar';
import { api } from '../../utils/api';
import { User, Phone, MapPin, Briefcase, Award, Power, LogOut, DollarSign, Camera, Edit2, Save, X, Plus, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LabourProfile = () => {
    const navigate = useNavigate();
    const [isOnline, setIsOnline] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    
    // Initialize from LocalStorage
    const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const [user, setUser] = useState({
        name: savedUser.name || '',
        role: savedUser.role || '',
        mobile: savedUser.mobile || '',
        location: savedUser.location || '',
        gender: savedUser.gender || '', // Added gender
        skills: savedUser.skills || [],
        experience: savedUser.experience || '',
        radius: savedUser.radius || '',
        rate: savedUser.rate || '',
        completedJobs: 0,
        rating: 4.8
    });
    const [newSkill, setNewSkill] = useState('');
    
    const suggestedSkills = [
        'Harvesting', 'Ploughing', 'Sowing', 'Fertilizing', 
        'Pesticide Spraying', 'Irrigation', 'Weeding', 
        'Tractor Driving', 'Packing', 'Cattle Care'
    ];

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const data = await api.get('/auth/user');
                setUser(prev => ({
                    ...prev,
                    ...data,
                    startRate: data.rate || prev.rate, // Merge gracefully
                    skills: data.skills || prev.skills || [],
                }));
            } catch (err) {
                console.error("Failed to fetch user", err);
            }
        };
        fetchUser();
    }, []);

    const handleSave = async () => {
        try {
            const updatedUser = await api.put('/auth/profile', {
                name: user.name,
                location: user.location,
                phone: user.mobile, 
                rate: user.rate,
                experience: user.experience,
                radius: user.radius,
                skills: user.skills,
                gender: user.gender // Added gender
            });
            
            const newUserState = { ...user, ...updatedUser };
            setUser(newUserState);
            localStorage.setItem('user', JSON.stringify({ 
                ...JSON.parse(localStorage.getItem('user') || '{}'), 
                ...updatedUser 
            }));
            
            setIsEditing(false);
            alert("Profile Updated Successfully!");
        } catch (err) {
            console.error(err);
            alert("Failed to update profile. Please try again.");
        }
    };

    const handleAddSkill = (skillToAdd) => {
        const skill = skillToAdd || newSkill;
        if (skill && skill.trim() && !user.skills.includes(skill.trim())) {
             setUser({ ...user, skills: [...user.skills, skill.trim()] });
             setNewSkill('');
        }
    };

    const handleDeleteSkill = (skillToDelete) => {
        setUser({ ...user, skills: user.skills.filter(s => s !== skillToDelete) });
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <LabourNavbar />

            <main className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Profile Card */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100 relative overflow-hidden">
                             <div className="absolute top-0 left-0 right-0 h-24 bg-green-50"></div>
                             
                             <div className="relative z-10">
                                <div className="h-24 w-24 bg-white rounded-full mx-auto p-1 shadow-sm mb-4">
                                     <div className="h-full w-full bg-green-100 rounded-full flex items-center justify-center text-2xl font-bold text-green-700 border-2 border-white relative overflow-hidden">
                                        {user.name?.charAt(0)}
                                        <div className={`absolute bottom-2 right-2 h-4 w-4 border-2 border-white rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                     </div>
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                                <p className="text-gray-500 text-sm mb-4 uppercase tracking-wide">{user.role}</p>

                                <div className="flex justify-center gap-2 mb-6">
                                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                                        <MapPin size={12} /> {user.location || 'No Location'}
                                    </span>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 border-t border-gray-50 pt-6">
                                    <div>
                                        <p className="font-bold text-xl text-gray-900">{user.completedJobs}</p>
                                        <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Jobs Done</p>
                                    </div>
                                    <div>
                                        <p className="font-bold text-xl text-gray-900 flex items-center justify-center gap-1">
                                            {user.rating} <span className="text-yellow-400">★</span>
                                        </p>
                                        <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Rating</p>
                                    </div>
                                </div>
                             </div>
                        </div>

                         <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                             <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-gray-900">Availability Status</h3>
                                <div className={`h-2 w-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                             </div>
                             <p className="text-sm text-gray-500 mb-6">
                                {isOnline 
                                    ? "You are currently ONLINE. Farmers can see you and send new job requests." 
                                    : "You are currently OFFLINE. go online to start receiving job requests."}
                             </p>
                            <button 
                                onClick={() => setIsOnline(!isOnline)}
                                className={`w-full py-2.5 rounded-lg font-bold text-sm transition-all ${
                                    isOnline 
                                    ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                                    : 'bg-green-600 text-white hover:bg-green-700 shadow-md'
                                }`}
                            >
                                {isOnline ? 'Go Offline' : 'Go Online Now'}
                            </button>
                         </div>
                    </div>

                    {/* Right Column: Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Core Details */}
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-gray-900">Professional Details</h3>
                                {isEditing ? (
                                    <div className="flex gap-2">
                                        <button onClick={() => setIsEditing(false)} className="text-gray-500 hover:bg-gray-100 p-2 rounded-lg transition-colors">
                                            <X size={18} />
                                        </button>
                                        <button onClick={handleSave} className="text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-lg transition-colors text-sm font-bold flex items-center gap-1">
                                            <Save size={16} /> Save
                                        </button>
                                    </div>
                                ) : (
                                    <button onClick={() => setIsEditing(true)} className="text-green-600 hover:bg-green-50 p-2 rounded-lg transition-colors flex items-center gap-1 text-sm font-bold">
                                        <Edit2 size={16} /> Edit
                                    </button>
                                )}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="md:col-span-2">
                                     <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Full Name & Gender</label>
                                     <div className="flex gap-4">
                                         {isEditing ? (
                                            <>
                                                <input 
                                                    type="text" 
                                                    value={user.name || ''} 
                                                    onChange={e => setUser({...user, name: e.target.value})}
                                                    className="flex-1 border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:border-green-500 font-medium"
                                                    placeholder="Full Name"
                                                />
                                                <select
                                                    value={user.gender || ''}
                                                    onChange={e => setUser({...user, gender: e.target.value})}
                                                    className="w-32 border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:border-green-500 font-medium bg-white"
                                                >
                                                    <option value="">Gender</option>
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <p className="text-gray-900 font-medium flex items-center gap-2"><User size={16} className="text-gray-400"/> {user.name}</p>
                                                {user.gender && <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-full">{user.gender}</span>}
                                            </div>
                                        )}
                                     </div>
                                </div>
                                <div className="md:col-span-2">
                                     <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Location</label>
                                     {isEditing ? (
                                        <input 
                                            type="text" 
                                            value={user.location || ''} 
                                            onChange={e => setUser({...user, location: e.target.value})}
                                            placeholder="City, State"
                                            className="w-full border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:border-green-500 font-medium"
                                        />
                                    ) : (
                                        <p className="text-gray-900 font-medium flex items-center gap-2"><MapPin size={16} className="text-gray-400"/> {user.location}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Phone Number</label>
                                    {isEditing ? (
                                        <input 
                                            type="text" 
                                            value={user.mobile || ''} 
                                            onChange={e => setUser({...user, mobile: e.target.value})}
                                            className="w-full border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:border-green-500 font-medium"
                                        />
                                    ) : (
                                        <p className="text-gray-900 font-medium flex items-center gap-2"><Phone size={16} className="text-gray-400"/> {user.mobile}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Daily Rate</label>
                                     {isEditing ? (
                                        <input 
                                            type="text" 
                                            value={user.rate || ''} 
                                            onChange={e => setUser({...user, rate: e.target.value})}
                                            placeholder="e.g. ₹500/day"
                                            className="w-full border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:border-green-500 font-medium"
                                        />
                                    ) : (
                                        <p className="text-gray-900 font-medium flex items-center gap-2"><DollarSign size={16} className="text-green-600"/> {user.rate || 'Not Set'}</p>
                                    )}
                                </div>
                                 <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Experience</label>
                                     {isEditing ? (
                                        <input 
                                            type="text" 
                                            value={user.experience || ''} 
                                            onChange={e => setUser({...user, experience: e.target.value})}
                                            placeholder="e.g. 5 Years"
                                            className="w-full border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:border-green-500 font-medium"
                                        />
                                    ) : (
                                        <p className="text-gray-900 font-medium flex items-center gap-2"><Award size={16} className="text-orange-500"/> {user.experience || 'Not Set'}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Work Radius</label>
                                     {isEditing ? (
                                        <input 
                                            type="text" 
                                            value={user.radius || ''} 
                                            onChange={e => setUser({...user, radius: e.target.value})}
                                            placeholder="e.g. 15 km"
                                            className="w-full border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:border-green-500 font-medium"
                                        />
                                    ) : (
                                        <p className="text-gray-900 font-medium flex items-center gap-2"><MapPin size={16} className="text-blue-500"/> {user.radius || 'Not Set'}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Skills */}
                         <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                             <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-gray-900">Skills & Expertise</h3>
                            </div>
                            <div className="flex flex-wrap gap-3 mb-4">
                                {user.skills.map((skill, index) => (
                                    <div key={index} className="bg-gray-50 border border-gray-200 px-4 py-2 rounded-lg text-gray-700 font-medium text-sm flex items-center gap-2">
                                        <Briefcase size={14} className="text-gray-400"/> {skill}
                                        {isEditing && (
                                            <button onClick={() => handleDeleteSkill(skill)} className="text-red-400 hover:text-red-600 ml-1">
                                                <X size={14} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            
                            {isEditing && (
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase mb-2">Suggested Skills</p>
                                        <div className="flex flex-wrap gap-2">
                                            {suggestedSkills.map(skill => (
                                                <button
                                                    key={skill}
                                                    onClick={() => handleAddSkill(skill)}
                                                    className={`px-3 py-1.5 rounded-lg text-sm border ${
                                                        user.skills.includes(skill)
                                                        ? 'bg-green-100 text-green-700 border-green-200 cursor-default'
                                                        : 'bg-white text-gray-600 border-gray-200 hover:border-green-500 hover:text-green-600'
                                                    } transition-colors`}
                                                    disabled={user.skills.includes(skill)}
                                                >
                                                    {user.skills.includes(skill) ? <Check size={12} className="inline mr-1"/> : '+'} {skill}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            value={newSkill}
                                            onChange={(e) => setNewSkill(e.target.value)}
                                            placeholder="Type custom skill..."
                                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
                                        />
                                        <button onClick={() => handleAddSkill()} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-green-700 transition-colors flex items-center gap-1">
                                            <Plus size={16} /> Add
                                        </button>
                                    </div>
                                </div>
                            )}
                         </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default LabourProfile;
