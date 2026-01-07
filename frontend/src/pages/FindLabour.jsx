import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Star, User, Users, ChevronLeft, MessageCircle, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import Messages from './Messages';

const FindLabour = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [labourers, setLabourers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [filterCriteria, setFilterCriteria] = useState({
        accountType: 'all', // all, individual, group
        maxRate: 2000,
        location: ''
    });
    const [showMessages, setShowMessages] = useState(false);
    const [selectedWorker, setSelectedWorker] = useState(null);
    const user = JSON.parse(localStorage.getItem('user')) || {};

    useEffect(() => {
        const fetchLabourers = async () => {
            try {
                const data = await api.get('/auth/labourers');
                setLabourers(data);
                setLoading(false);
            } catch (err) {
                console.error("Fetch Labourers Error:", err);
                setError("Failed to load labourer data");
                setLoading(false);
            }
        };

        fetchLabourers();
    }, []);

    const handleHire = async (worker) => {
        try {
            await api.post('/notifications', {
                userId: worker.id,
                title: 'New Hire Request',
                message: `${user.name} wants to hire you for a job in ${user.location}. Click to chat!`,
                type: 'job'
            });
            alert(`Hire request sent to ${worker.name}! Starting chat...`);
            setSelectedWorker(worker);
            setShowMessages(true);
        } catch (err) {
            console.error(err);
            alert('Failed to send hire request');
        }
    };

    const filteredLabourers = labourers.filter(l => {
        const search = searchTerm.toLowerCase();
        const nameMatch = l.name && l.name.toLowerCase().includes(search);
        const locSearchMatch = l.location && l.location.toLowerCase().includes(search);
        
        const accountTypeMatch = filterCriteria.accountType === 'all' || l.accountType === filterCriteria.accountType;
        const rateMatch = (Number(l.rate) || 450) <= filterCriteria.maxRate;
        const locFilterMatch = !filterCriteria.location || (l.location && l.location.toLowerCase().includes(filterCriteria.location.toLowerCase()));

        let skillsMatch = false;
        if (Array.isArray(l.skills)) {
            skillsMatch = l.skills.some(skill => skill.toLowerCase().includes(search));
        } else if (typeof l.skills === 'string') {
            skillsMatch = l.skills.toLowerCase().includes(search);
        }

        return (nameMatch || locSearchMatch || skillsMatch) && accountTypeMatch && rateMatch && locFilterMatch;
    });

    if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    if (error) return <div className="flex items-center justify-center min-h-screen text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-20 p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <ChevronLeft className="h-6 w-6 text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Find Labour</h1>
        </div>
        <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-xl border transition-all flex items-center gap-2 ${showFilters ? 'bg-green-600 border-green-600 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-green-500'}`}
        >
            <Filter className="h-5 w-5" />
            <span className="text-sm font-bold">Filters</span>
        </button>
      </div>

      <div className="max-w-3xl mx-auto p-4 space-y-6">
        {/* Filter Section */}
        {showFilters && (
            <div className="bg-white p-6 rounded-2xl shadow-md border border-green-100 animate-in slide-in-from-top-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 block">Worker Type</label>
                        <div className="flex bg-gray-100 p-2 rounded-2xl">
                            {['all', 'individual', 'group'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setFilterCriteria({...filterCriteria, accountType: type})}
                                    className={`flex-1 py-4 text-sm font-black rounded-xl capitalize transition-all ${filterCriteria.accountType === type ? 'bg-white text-green-600 shadow-md' : 'text-gray-500'}`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>
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
                placeholder="Search by name, skill or location..." 
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-100 focus:border-green-500 focus:outline-none shadow-sm transition-all group-hover:border-gray-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-4 top-4.5 h-6 w-6 text-gray-300 group-focus-within:text-green-500 transition-colors" />
        </div>

        {/* Results */}
        <div className="space-y-4">
            {filteredLabourers.map(item => (
                <div key={item.id} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center gap-6 mb-6">
                        <div className="relative">
                            <div className="h-24 w-24 bg-gradient-to-br from-green-50 to-green-100 rounded-3xl flex items-center justify-center text-green-700 font-black text-4xl border-2 border-white shadow-md overflow-hidden">
                                {item.profileImage ? <img src={item.profileImage} alt={item.name} className="w-full h-full object-cover" /> : (item.name ? item.name.charAt(0) : 'L')}
                            </div>
                            {item.accountType === 'group' && (
                                <div className="absolute -top-2 -right-2 bg-blue-600 text-white p-2 rounded-xl shadow-lg border-2 border-white">
                                    <Users className="h-5 w-5" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <h3 className="font-black text-3xl text-gray-900 tracking-tighter">{item.name}</h3>
                                {item.accountType === 'group' && (
                                    <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest">Group</span>
                                )}
                            </div>
                            <div className="flex flex-col gap-1 mt-1">
                                <span className="flex items-center gap-1.5 text-sm font-bold text-gray-500">
                                    <MapPin className="h-4 w-4 text-green-600" /> {item.location || 'Punjab'}
                                </span>
                                <div className="flex items-center gap-1.5 text-lg font-black text-green-700 mt-1">
                                    <DollarSign className="h-5 w-5" /> ₹{item.rate || '450'}<span className="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-1">Daily</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                             <div className="flex items-center gap-1 text-yellow-500 font-black text-xl mb-1">
                                <Star className="h-5 w-5 fill-current" /> {item.rating || '4.8'}
                            </div>
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => handleHire(item)}
                        className="w-full h-16 bg-green-600 text-white rounded-3xl font-black text-xl hover:bg-green-700 shadow-xl shadow-green-100 uppercase tracking-tighter transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
                    >
                        Hire Now
                    </button>
                </div>
            ))}
            {filteredLabourers.length === 0 && (
                <div className="text-center py-24 bg-white rounded-[40px] border-4 border-dashed border-gray-50">
                    <div className="bg-gray-50 h-24 w-24 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Search className="h-12 w-12 text-gray-200" />
                    </div>
                    <p className="text-gray-900 font-black text-2xl tracking-tight">No workers match your filters</p>
                    <p className="text-gray-400 text-sm font-bold mt-2">Try adjusting your filters or search keywords</p>
                    <button 
                        onClick={() => { setFilterCriteria({accountType: 'all', maxRate: 2000, location: ''}); setSearchTerm(''); }}
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
