import React, { useState, useEffect } from 'react';
import FarmerNavbar from '../components/FarmerNavbar';
import { api } from '../utils/api';
import { User, Phone, MapPin, Briefcase, Award, Power, LogOut, DollarSign, Camera, Edit2, Save, X, Plus, Check, Tractor, Sprout } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FarmerProfile = () => {
    const navigate = useNavigate();
    const [isOnline, setIsOnline] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    
    // Initialize from LocalStorage or Default
    const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const [user, setUser] = useState({
        name: savedUser.name || '',
        role: savedUser.role || 'farmer',
        mobile: savedUser.mobile || '',
        location: savedUser.location || '',
        gender: savedUser.gender || '',
        crops: savedUser.crops || [],
        farmSize: savedUser.farmSize || '',
        experience: savedUser.experience || '',
        radius: '', // Not really used for farmer but kept structure
        completedJobs: 0, // Could be 'Jobs Posted'
        rating: 4.8
    });
    const [newCrop, setNewCrop] = useState('');
    
    const suggestedCrops = [
        'Wheat', 'Rice', 'Cotton', 'Maize', 
        'Sugarcane', 'Soybean', 'Groundnut', 
        'Vegetables', 'Fruits', 'Mustard'
    ];

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const data = await api.get('/auth/user');
                setUser(prev => ({
                    ...prev,
                    ...data,
                    crops: data.crops || prev.crops || [],
                    farmSize: data.farmSize || prev.farmSize || ''
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
                farmSize: user.farmSize,
                crops: user.crops,
                experience: user.experience,
                gender: user.gender
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

    const handleAddCrop = (cropToAdd) => {
        const crop = cropToAdd || newCrop;
        if (crop && crop.trim() && !user.crops.includes(crop.trim())) {
             setUser({ ...user, crops: [...user.crops, crop.trim()] });
             setNewCrop('');
        }
    };

    const handleDeleteCrop = (cropToDelete) => {
        setUser({ ...user, crops: user.crops.filter(c => c !== cropToDelete) });
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <FarmerNavbar 
                user={user} 
                onLogout={handleLogout} 
                onPostJob={() => navigate('/dashboard')} // Redirect to dashboard to post
            />

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
                                        <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Jobs Posted</p>
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
                    </div>

                    {/* Right Column: Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Core Details */}
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-gray-900">Farm Details</h3>
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
                                     <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Farm Location</label>
                                     {isEditing ? (
                                        <input 
                                            type="text" 
                                            value={user.location || ''} 
                                            onChange={e => setUser({...user, location: e.target.value})}
                                            placeholder="Village, District"
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
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Farm Size (Acres)</label>
                                     {isEditing ? (
                                        <input 
                                            type="text" 
                                            value={user.farmSize || ''} 
                                            onChange={e => setUser({...user, farmSize: e.target.value})}
                                            placeholder="e.g. 5 Acres"
                                            className="w-full border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:border-green-500 font-medium"
                                        />
                                    ) : (
                                        <p className="text-gray-900 font-medium flex items-center gap-2"><Tractor size={16} className="text-green-600"/> {user.farmSize || 'Not Set'}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Crops */}
                         <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                             <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-gray-900">Crops Grown</h3>
                            </div>
                            <div className="flex flex-wrap gap-3 mb-4">
                                {user.crops?.map((crop, index) => (
                                    <div key={index} className="bg-green-50 border border-green-100 px-4 py-2 rounded-lg text-green-800 font-medium text-sm flex items-center gap-2">
                                        <Sprout size={14} className="text-green-600"/> {crop}
                                        {isEditing && (
                                            <button onClick={() => handleDeleteCrop(crop)} className="text-red-400 hover:text-red-600 ml-1">
                                                <X size={14} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            
                            {isEditing && (
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase mb-2">Suggested Crops</p>
                                        <div className="flex flex-wrap gap-2">
                                            {suggestedCrops.map(crop => (
                                                <button
                                                    key={crop}
                                                    onClick={() => handleAddCrop(crop)}
                                                    className={`px-3 py-1.5 rounded-lg text-sm border ${
                                                        user.crops?.includes(crop)
                                                        ? 'bg-green-100 text-green-700 border-green-200 cursor-default'
                                                        : 'bg-white text-gray-600 border-gray-200 hover:border-green-500 hover:text-green-600'
                                                    } transition-colors`}
                                                    disabled={user.crops?.includes(crop)}
                                                >
                                                    {user.crops?.includes(crop) ? <Check size={12} className="inline mr-1"/> : '+'} {crop}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            value={newCrop}
                                            onChange={(e) => setNewCrop(e.target.value)}
                                            placeholder="Type custom crop..."
                                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
                                        />
                                        <button onClick={() => handleAddCrop()} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-green-700 transition-colors flex items-center gap-1">
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

export default FarmerProfile;
