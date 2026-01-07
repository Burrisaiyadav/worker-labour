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
        <div className="min-h-screen bg-gray-50 font-sans pb-20">
            <LabourNavbar />

            <main className="max-w-7xl mx-auto px-6 py-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 md:gap-4 mb-6 md:mb-8 lg:mb-12">
                    <div>
                        <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 tracking-tighter uppercase mb-1 md:mb-2 italic">My Profile</h1>
                        <p className="text-[8px] md:text-[9px] lg:text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Manage your worker identity and professional profile.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Left Column: Profile Card */}
                    <div className="lg:col-span-1 space-y-4 md:space-y-6">
                        <div className="bg-white rounded-2xl md:rounded-[2.2rem] p-6 md:p-8 text-center shadow-xl shadow-gray-200/50 border border-white relative overflow-hidden group">
                             <div className="absolute top-0 left-0 right-0 h-20 md:h-28 bg-green-50/50 group-hover:bg-green-50 transition-colors duration-500"></div>
                             
                             <div className="relative z-10">
                                <div className="h-20 w-20 md:h-24 md:w-24 bg-white rounded-2xl md:rounded-[1.8rem] mx-auto p-1 shadow-xl shadow-green-100 mb-4 md:mb-5 group-hover:scale-105 transition-transform duration-500">
                                     <div className="h-full w-full bg-green-600 rounded-2xl md:rounded-[1.8rem] flex items-center justify-center text-2xl md:text-3xl font-black text-white relative overflow-hidden italic">
                                        {user.name?.charAt(0)}
                                        <div className={`absolute bottom-2 right-2 h-3.5 w-3.5 border-[3px] border-green-600 rounded-full ${isOnline ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                                     </div>
                                </div>
                                <h2 className="text-lg md:text-xl font-black text-gray-900 tracking-tighter uppercase italic">{user.name}</h2>
                                <p className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1 md:mt-1.5">Labourer • Top Rated Helper</p>

                                <div className="flex justify-center mt-3 md:mt-4">
                                    <span className="bg-gray-50 border border-gray-100 text-gray-600 px-3 md:px-4 py-1 md:py-1.5 rounded-xl text-[8px] md:text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm">
                                        <MapPin size={10} md:size={12} className="text-green-600" /> {user.location || 'Location Not Set'}
                                    </span>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3 md:gap-4 mt-6 md:mt-8 pt-6 md:pt-8 border-t border-gray-50">
                                    <div className="text-center group-hover:scale-110 transition-transform">
                                        <p className="text-xl md:text-2xl font-black text-gray-900 tracking-tighter italic">{user.completedJobs}</p>
                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Jobs Done</p>
                                    </div>
                                    <div className="text-center group-hover:scale-110 transition-transform">
                                        <div className="flex items-center justify-center gap-1">
                                            <p className="text-xl md:text-2xl font-black text-gray-900 tracking-tighter italic">{user.rating}</p>
                                            <Award className="h-3.5 w-3.5 md:h-4 md:w-4 text-yellow-500" />
                                        </div>
                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Trust Score</p>
                                    </div>
                                </div>
                             </div>
                        </div>

                         <div className="bg-white rounded-2xl md:rounded-[1.8rem] p-5 md:p-6 shadow-xl shadow-gray-200/50 border border-white">
                             <div className="flex items-center justify-between mb-3 md:mb-4">
                                <h3 className="font-black text-gray-900 uppercase tracking-tighter italic text-xs md:text-sm">Live Status</h3>
                                <div className={`h-2 w-2 md:h-2.5 md:w-2.5 rounded-full ${isOnline ? 'bg-green-500 shadow-lg shadow-green-200 animate-pulse' : 'bg-gray-300'}`}></div>
                             </div>
                             <p className="text-[8px] md:text-[10px] font-bold text-gray-500 mb-5 md:mb-6 leading-relaxed italic">
                                {isOnline 
                                    ? "Visible to farmers! Appearing in nearby searches." 
                                    : "Hidden from farmers. No new notifications while offline."}
                             </p>
                            <button 
                                onClick={() => setIsOnline(!isOnline)}
                                className={`w-full h-12 md:h-14 rounded-xl font-black text-[8px] md:text-[9px] uppercase tracking-widest transition-all active:scale-95 shadow-lg ${
                                    isOnline 
                                    ? 'bg-red-50 text-red-600 hover:bg-red-100 shadow-red-50 border border-red-100' 
                                    : 'bg-green-600 text-white hover:bg-green-700 shadow-green-100'
                                }`}
                            >
                                {isOnline ? 'Go Offline' : 'Go Online Now'}
                            </button>
                         </div>
                    </div>

                    <div className="lg:col-span-2 space-y-10">
                        {/* Core Details */}
                         <div className="bg-white rounded-[2.2rem] p-8 shadow-xl shadow-gray-200/50 border border-white">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter italic">Professional Identity</h3>
                                {isEditing ? (
                                    <div className="flex gap-2">
                                        <button onClick={() => setIsEditing(false)} className="h-10 w-10 flex items-center justify-center bg-gray-50 text-gray-500 rounded-xl hover:bg-gray-100 transition-all">
                                            <X size={18} />
                                        </button>
                                        <button onClick={handleSave} className="h-10 px-5 bg-green-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg shadow-green-100 flex items-center gap-2 hover:bg-green-700 transition-all">
                                            <Save size={14} /> Save
                                        </button>
                                    </div>
                                ) : (
                                    <button onClick={() => setIsEditing(true)} className="h-10 px-5 bg-white border border-gray-100 text-green-600 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center gap-2 hover:bg-green-50 transition-all shadow-sm">
                                        <Edit2 size={14} /> Edit
                                    </button>
                                )}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="md:col-span-2">
                                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">Identity & Gender</label>
                                     <div className="flex flex-col md:flex-row gap-4">
                                         {isEditing ? (
                                            <>
                                                <input 
                                                    type="text" 
                                                    value={user.name || ''} 
                                                    onChange={e => setUser({...user, name: e.target.value})}
                                                    className="flex-1 bg-gray-50 border-2 border-transparent focus:border-green-500 rounded-2xl px-6 py-4 font-black uppercase tracking-tight text-gray-900 transition-all outline-none"
                                                    placeholder="Full Name"
                                                />
                                                <select
                                                    value={user.gender || ''}
                                                    onChange={e => setUser({...user, gender: e.target.value})}
                                                    className="w-full md:w-48 bg-gray-50 border-2 border-transparent focus:border-green-500 rounded-2xl px-6 py-4 font-black uppercase tracking-tight text-gray-900 transition-all outline-none"
                                                >
                                                    <option value="">Gender</option>
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </>
                                        ) : (
                                            <div className="flex flex-wrap items-center gap-4">
                                                <div className="bg-gray-50 px-6 py-4 rounded-2xl flex items-center gap-3">
                                                    <User size={18} className="text-green-600" />
                                                    <span className="font-black text-gray-900 uppercase tracking-tight">{user.name}</span>
                                                </div>
                                                {user.gender && (
                                                    <div className="bg-blue-50 px-6 py-4 rounded-2xl flex items-center gap-3">
                                                        <span className="font-black text-blue-600 uppercase tracking-widest text-[10px]">{user.gender}</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                     </div>
                                </div>

                                <div className="md:col-span-2">
                                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">Base Location</label>
                                     {isEditing ? (
                                        <input 
                                            type="text" 
                                            value={user.location || ''} 
                                            onChange={e => setUser({...user, location: e.target.value})}
                                            placeholder="Village, District"
                                            className="w-full bg-gray-50 border-2 border-transparent focus:border-green-500 rounded-2xl px-6 py-4 font-black uppercase tracking-tight text-gray-900 transition-all outline-none"
                                        />
                                    ) : (
                                        <div className="bg-gray-50 px-6 py-4 rounded-2xl flex items-center gap-3">
                                            <MapPin size={18} className="text-green-600" />
                                            <span className="font-black text-gray-900 uppercase tracking-tight">{user.location || 'Not Specified'}</span>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">Phone Contact</label>
                                    {isEditing ? (
                                        <input 
                                            type="text" 
                                            value={user.mobile || ''} 
                                            onChange={e => setUser({...user, mobile: e.target.value})}
                                            className="w-full bg-gray-50 border-2 border-transparent focus:border-green-500 rounded-2xl px-6 py-4 font-black uppercase tracking-tight text-gray-900 transition-all outline-none"
                                        />
                                    ) : (
                                        <div className="bg-gray-50 px-6 py-4 rounded-2xl flex items-center gap-3">
                                            <Phone size={18} className="text-green-600" />
                                            <span className="font-black text-gray-900 uppercase tracking-tight">{user.mobile}</span>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">Pricing Model</label>
                                     {isEditing ? (
                                        <input 
                                            type="text" 
                                            value={user.rate || ''} 
                                            onChange={e => setUser({...user, rate: e.target.value})}
                                            placeholder="e.g. ₹500/day"
                                            className="w-full bg-gray-50 border-2 border-transparent focus:border-green-500 rounded-2xl px-6 py-4 font-black uppercase tracking-tight text-gray-900 transition-all outline-none"
                                        />
                                    ) : (
                                        <div className="bg-green-50 border border-green-100 px-6 py-4 rounded-2xl flex items-center gap-3">
                                            <DollarSign size={18} className="text-green-600" />
                                            <span className="font-black text-green-900 uppercase tracking-tight italic">{user.rate || 'Rate Pending'}</span>
                                        </div>
                                    )}
                                </div>

                                 <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">Experience Level</label>
                                     {isEditing ? (
                                        <input 
                                            type="text" 
                                            value={user.experience || ''} 
                                            onChange={e => setUser({...user, experience: e.target.value})}
                                            placeholder="e.g. 5 Years"
                                            className="w-full bg-gray-50 border-2 border-transparent focus:border-green-500 rounded-2xl px-6 py-4 font-black uppercase tracking-tight text-gray-900 transition-all outline-none"
                                        />
                                    ) : (
                                        <div className="bg-orange-50 border border-orange-100 px-6 py-4 rounded-2xl flex items-center gap-3">
                                            <Award size={18} className="text-orange-500" />
                                            <span className="font-black text-orange-900 uppercase tracking-tight">{user.experience || 'Not Mentioned'}</span>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">Work Sensitivity</label>
                                     {isEditing ? (
                                        <input 
                                            type="text" 
                                            value={user.radius || ''} 
                                            onChange={e => setUser({...user, radius: e.target.value})}
                                            placeholder="e.g. 15 km"
                                            className="w-full bg-gray-50 border-2 border-transparent focus:border-green-500 rounded-2xl px-6 py-4 font-black uppercase tracking-tight text-gray-900 transition-all outline-none"
                                        />
                                    ) : (
                                        <div className="bg-blue-50 border border-blue-100 px-6 py-4 rounded-2xl flex items-center gap-3">
                                            <MapPin size={18} className="text-blue-500" />
                                            <span className="font-black text-blue-900 uppercase tracking-tight">{user.radius || 'Anywhere'}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Skills */}
                         <div className="bg-white rounded-[2.2rem] p-8 shadow-xl shadow-gray-200/50 border border-white">
                             <div className="flex justify-between items-center mb-8">
                                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter italic">Expertise & Skills</h3>
                            </div>
                            <div className="flex flex-wrap gap-4 mb-10">
                                {user.skills.length === 0 ? (
                                    <div className="p-8 bg-gray-50 border border-gray-100 rounded-2xl w-full text-center text-gray-400 font-black uppercase text-[10px] tracking-widest">
                                        No skills added yet
                                    </div>
                                ) : (
                                    user.skills.map((skill, index) => (
                                        <div key={index} className="bg-green-50 border-2 border-green-100 pl-4 pr-3 py-3 rounded-2xl text-green-900 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 group transition-all hover:bg-green-100 italic">
                                            <Briefcase size={16} className="text-green-600"/> {skill}
                                            {isEditing && (
                                                <button onClick={() => handleDeleteSkill(skill)} className="h-6 w-6 bg-green-200 text-green-700 rounded-lg flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
                                                    <X size={12} />
                                                </button>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                            
                            {isEditing && (
                                <div className="space-y-8 bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100">
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Core Competencies</p>
                                        <div className="flex flex-wrap gap-2">
                                            {suggestedSkills.map(skill => (
                                                <button
                                                    key={skill}
                                                    onClick={() => handleAddSkill(skill)}
                                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                                        user.skills.includes(skill)
                                                        ? 'bg-green-600 text-white border-green-600 shadow-lg shadow-green-100 scale-95'
                                                        : 'bg-white text-gray-600 border-gray-100 hover:border-green-200 hover:bg-green-50 shadow-sm'
                                                    }`}
                                                    disabled={user.skills.includes(skill)}
                                                >
                                                    {skill}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            value={newSkill}
                                            onChange={(e) => setNewSkill(e.target.value)}
                                            placeholder="Type other skill..."
                                            className="flex-1 bg-white border-2 border-transparent focus:border-green-500 rounded-2xl px-6 py-4 font-black uppercase tracking-tight text-gray-900 transition-all outline-none"
                                        />
                                        <button onClick={() => handleAddSkill()} className="h-14 px-8 bg-green-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-green-100 flex items-center gap-2 hover:bg-green-700 transition-all">
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
