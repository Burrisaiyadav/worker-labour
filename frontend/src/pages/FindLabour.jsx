import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Star, User, Users, ChevronLeft, MessageCircle, DollarSign, Clock, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import Messages from './Messages';

const FindLabour = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('individual'); // 'individual' or 'group'
    const [searchTerm, setSearchTerm] = useState('');
    const [labourers, setLabourers] = useState([]);
    const [myGroups, setMyGroups] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [filterCriteria, setFilterCriteria] = useState({
        maxRate: 2000,
        location: ''
    });
    const [showMessages, setShowMessages] = useState(false);
    const [selectedWorker, setSelectedWorker] = useState(null);
    const user = JSON.parse(localStorage.getItem('user')) || {};

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [labourersData, groupsData, pendingData] = await Promise.all([
                    api.get('/auth/labourers'),
                    api.get('/groups/my-groups'),
                    api.get('/groups/pending-requests')
                ]);
                
                setLabourers(labourersData);
                setMyGroups(groupsData);
                setPendingRequests(pendingData);
                setLoading(false);
            } catch (err) {
                console.error("Fetch Data Error:", err);
                setError("Failed to load data");
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleHire = async (worker) => {
        try {
            // Create a real job for this direct hire
            const jobData = {
                title: worker.accountType === 'group' ? `Group Hire: ${worker.name}` : `Hired ${worker.name}`,
                description: `Direct hire from Marketplace for ${worker.name}`,
                cost: worker.rate || 500,
                workers: worker.membersCount || (worker.members ? worker.members.length : 1),
                date: new Date().toISOString(),
                location: worker.location || user.location,
                assignedTo: worker.id,
                status: 'In Progress'
            };

            const newJob = await api.post('/jobs', jobData);

            await api.post('/notifications', {
                userId: worker.id,
                title: 'New Direct Hire',
                message: `${user.name} has hired you directly for a job! Click to chat!`,
                type: 'job',
                metadata: { jobId: newJob.id }
            });
            alert(`Hired ${worker.name} successfully! The job is now in your active list.`);
            setSelectedWorker(worker);
            setShowMessages(true);
        } catch (err) {
            console.error(err);
            alert('Failed to complete hire: ' + (err.response?.data?.msg || err.message));
        }
    };

    const handleJoinGroup = async (group) => {
        try {
            await api.post(`/groups/${group.id}/join`);
            alert(`Join request sent to ${group.name}! The admin will review it.`);
            setPendingRequests(prev => [...prev, group]);
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.msg || 'Failed to send join request');
        }
    };

    const filteredLabourers = labourers.filter(l => {
        const search = searchTerm.toLowerCase();
        const nameMatch = l.name && l.name.toLowerCase().includes(search);
        const locSearchMatch = l.location && l.location.toLowerCase().includes(search);
        
        // Match active tab
        const tabMatch = l.accountType === activeTab;
        
        const rateMatch = (Number(l.rate) || 450) <= filterCriteria.maxRate;
        const locFilterMatch = !filterCriteria.location || (l.location && l.location.toLowerCase().includes(filterCriteria.location.toLowerCase()));

        let skillsMatch = false;
        if (Array.isArray(l.skills)) {
            skillsMatch = l.skills.some(skill => skill.toLowerCase().includes(search));
        } else if (typeof l.skills === 'string') {
            skillsMatch = l.skills.toLowerCase().includes(search);
        }

        return (nameMatch || locSearchMatch || skillsMatch) && tabMatch && rateMatch && locFilterMatch;
    });

    if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    if (error) return <div className="flex items-center justify-center min-h-screen text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      {/* Header */}
      <div className="bg-white shadow-xl shadow-gray-100/50 sticky top-0 z-20 px-6 py-6 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="h-12 w-12 bg-gray-50 flex items-center justify-center rounded-2xl hover:bg-gray-100 transition-all">
                <ChevronLeft className="h-6 w-6 text-gray-900" />
            </button>
            <div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">Find Worker</h1>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Best workers for you</p>
            </div>
        </div>
        <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`h-12 px-6 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-2 ${showFilters ? 'bg-green-600 text-white shadow-lg shadow-green-100' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
        >
            <Filter className="h-4 w-4" />
            Filters
        </button>
      </div>

      <div className="max-w-3xl mx-auto p-4 space-y-6">
        {/* Tab Selection */}
        <div className="flex bg-white p-2 rounded-[2rem] shadow-sm border border-gray-100">
            <button 
                onClick={() => setActiveTab('individual')}
                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl transition-all font-black uppercase tracking-widest text-[11px] ${activeTab === 'individual' ? 'bg-green-600 text-white shadow-lg shadow-green-100' : 'text-gray-400 hover:bg-gray-50'}`}
            >
                <User size={20} /> 1 Person
            </button>
            <button 
                onClick={() => setActiveTab('group')}
                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl transition-all font-black uppercase tracking-widest text-[11px] ${activeTab === 'group' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-gray-400 hover:bg-gray-50'}`}
            >
                <Users size={20} /> Big Group
            </button>
        </div>

        {/* Filter Section */}
        {showFilters && (
            <div className="bg-white p-6 rounded-2xl shadow-md border border-green-100 animate-in slide-in-from-top-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 block">Daily Rate (Max: ₹{filterCriteria.maxRate})</label>
                        <input 
                            type="range" 
                            min="300" 
                            max="2000" 
                            step="50"
                            value={filterCriteria.maxRate}
                            onChange={(e) => setFilterCriteria({...filterCriteria, maxRate: e.target.value})}
                            className="w-full accent-green-600"
                        />
                        <div className="flex justify-between text-[10px] font-bold text-gray-400 mt-1">
                            <span>₹300</span>
                            <span>₹2000+</span>
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 block">Filter by State</label>
                        <select 
                            value={filterCriteria.location}
                            onChange={(e) => setFilterCriteria({...filterCriteria, location: e.target.value})}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="">All Regions</option>
                            <option value="Punjab">Punjab</option>
                            <option value="Haryana">Haryana</option>
                            <option value="Uttar Pradesh">Uttar Pradesh</option>
                            <option value="Maharashtra">Maharashtra</option>
                        </select>
                    </div>
                </div>
            </div>
        )}

        {/* Search Bar */}
        <div className="relative group">
            <input 
                type="text" 
                placeholder={`Search ${activeTab === 'individual' ? 'workers' : 'groups'} by name...`} 
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-gray-100 focus:border-green-500 focus:outline-none shadow-lg shadow-gray-100 transition-all font-bold text-sm text-gray-900 group-hover:border-gray-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 group-focus-within:text-green-500 transition-colors" />
        </div>

        {/* Results */}
        <div className="space-y-3">
            {filteredLabourers.map(item => (
                <div key={item.id} className="bg-white p-3 md:p-4 rounded-2xl md:rounded-[1.5rem] shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-green-50 transition-all duration-500 group relative overflow-hidden">
                    <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-5 mb-3 md:mb-4 relative z-10">
                        <div className="relative">
                            <div className="h-20 w-20 md:h-24 md:w-24 bg-gray-50 rounded-2xl flex items-center justify-center text-green-700 font-black text-2xl md:text-3xl border-[3px] border-white shadow-lg overflow-hidden group-hover:scale-105 transition-transform duration-500">
                                {item.profileImage ? <img src={item.profileImage} alt={item.name} className="w-full h-full object-cover" /> : (item.name ? item.name.charAt(0) : 'L')}
                            </div>
                            {item.accountType === 'group' && (
                                <div className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white h-7 w-7 md:h-8 md:w-8 rounded-lg shadow-lg border border-white flex items-center justify-center">
                                    <Users className="h-4 w-4 md:h-5 md:w-5" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                            <h3 className="font-black text-lg md:text-xl text-gray-900 tracking-tight mb-2 uppercase">{item.name}</h3>
                            <div className="flex flex-wrap justify-center sm:justify-start gap-4">
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-6 w-6 text-green-600" />
                                    <span className="text-[12px] font-black text-gray-900 uppercase">{item.location || 'Local'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <DollarSign className="h-6 w-6 text-green-600" />
                                    <span className="text-sm font-black text-green-700 tracking-tighter">₹{item.rate || '450'}/day</span>
                                </div>
                                {item.accountType === 'group' && item.membersCount > 0 && (
                                    <div className="flex items-center gap-2">
                                        <Users className="h-6 w-6 text-blue-600" />
                                        <span className="text-[12px] font-black text-blue-700 uppercase">{item.membersCount} People</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="hidden sm:flex flex-col items-center">
                             <div className="flex items-center gap-1 bg-yellow-400 px-3 py-1.5 rounded-xl">
                                <Star className="h-4 w-4 text-white fill-current" /> 
                                <span className="font-black text-lg text-white">{item.rating || '4.8'}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex gap-3 relative z-10">
                        {user.role === 'farmer' ? (
                             <button 
                                onClick={() => handleHire(item)}
                                className="flex-1 h-14 bg-green-600 text-white rounded-[1.2rem] font-black text-sm md:text-base hover:bg-green-700 shadow-xl shadow-green-100 uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 py-4"
                            >
                                <Check size={24} /> BOOK WORKER
                            </button>
                        ) : (
                            <>
                                {item.accountType === 'group' ? (
                                    <>
                                        {myGroups.some(g => g.id === item.id) ? (
                                            <button 
                                                disabled
                                                className="flex-1 h-12 bg-gray-100 text-gray-400 rounded-xl font-black text-xs md:text-sm uppercase tracking-widest flex items-center justify-center gap-2 py-3 cursor-not-allowed"
                                            >
                                                YOU ARE MEMBER <Check className="h-5 w-5" />
                                            </button>
                                        ) : pendingRequests.some(g => g.id === item.id) ? (
                                            <button 
                                                disabled
                                                className="flex-1 h-12 bg-amber-50 text-amber-600 border border-amber-200 rounded-xl font-black text-xs md:text-sm uppercase tracking-widest flex items-center justify-center gap-2 py-3 cursor-not-allowed"
                                            >
                                                SENT <Clock className="h-5 w-5" />
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => handleJoinGroup(item)}
                                                className="flex-1 h-14 bg-blue-600 text-white rounded-[1.2rem] font-black text-sm md:text-base hover:bg-blue-700 shadow-xl shadow-blue-100 uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 py-4"
                                            >
                                                JOIN GROUP <Users className="h-6 w-6" />
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    <button 
                                        onClick={() => handleHire(item)}
                                        className="flex-1 h-14 bg-green-600 text-white rounded-[1.2rem] font-black text-sm md:text-base hover:bg-green-700 shadow-xl shadow-green-100 uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 py-4"
                                    >
                                        TALK <MessageCircle className="h-6 w-6" />
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                    
                    {/* Decorative Blob */}
                    <div className={`absolute -left-12 -bottom-12 h-40 w-40 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700 -z-0 ${activeTab === 'individual' ? 'bg-green-50' : 'bg-blue-50'}`}></div>
                </div>
            ))}
            {filteredLabourers.length === 0 && (
                <div className="text-center py-24 bg-white rounded-[40px] border-4 border-dashed border-gray-50">
                    <div className="bg-gray-50 h-24 w-24 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Search className="h-12 w-12 text-gray-200" />
                    </div>
                    <p className="text-gray-900 font-black text-2xl tracking-tight">No {activeTab === 'individual' ? 'workers' : 'groups'} found</p>
                    <p className="text-gray-400 text-sm font-bold mt-2">Try adjusting your filters or search keywords</p>
                    <button 
                        onClick={() => { setFilterCriteria({maxRate: 2000, location: ''}); setSearchTerm(''); }}
                        className="mt-8 text-green-600 font-black text-sm uppercase tracking-widest hover:text-green-700"
                    >
                        Clear all filters
                    </button>
                </div>
            )}
        </div>
      </div>

      {/* Messages Popup */}
      {showMessages && selectedWorker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="relative bg-transparent w-full max-w-sm h-full max-h-[600px] shadow-2xl rounded-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                  <Messages 
                      onClose={() => { setShowMessages(false); setSelectedWorker(null); }} 
                      initialGroupName={selectedWorker.name}
                      initialOtherId={selectedWorker.id}
                  />
              </div>
          </div>
      )}
    </div>
  );
};

export default FindLabour;
