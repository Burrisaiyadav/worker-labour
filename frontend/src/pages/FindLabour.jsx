import React, { useState } from 'react';
import { Search, Filter, MapPin, Star, User, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FindLabour = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock Data
  const labourers = [
    { id: 101, name: 'Sharma Labour Group', type: 'Group', members: 25, rating: 4.8, location: 'Punjab', rate: '₹450/day' },
    { id: 102, name: 'Verma Brothers', type: 'Group', members: 15, rating: 4.5, location: 'Punjab', rate: '₹400/day' },
    { id: 103, name: 'Ramesh Kumar', type: 'Individual', members: 1, rating: 4.2, location: 'Haryana', rate: '₹500/day' },
    { id: 104, name: 'Jai Kisan Union', type: 'Group', members: 40, rating: 4.9, location: 'Punjab', rate: '₹420/day' },
    { id: 105, name: 'Singh Workers', type: 'Group', members: 10, rating: 4.0, location: 'Himachal', rate: '₹480/day' },
  ];

  const filteredLabourers = labourers.filter(l => 
    l.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10 p-4 flex items-center gap-4">
        <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-gray-100 rounded-full">
            <ChevronLeft className="h-6 w-6 text-gray-600" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Find Labour</h1>
      </div>

      <div className="max-w-3xl mx-auto p-4 space-y-6">
        {/* Search Bar */}
        <div className="relative">
            <input 
                type="text" 
                placeholder="Search by name or location..." 
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            <div className="absolute right-3 top-2.5 p-1 bg-gray-100 rounded-lg">
                <Filter className="h-5 w-5 text-gray-500" />
            </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
            {filteredLabourers.map(item => (
                <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-lg">
                            {item.name.charAt(0)}
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">{item.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {item.location}</span>
                                <span className="flex items-center gap-1"><User className="h-3 w-3" /> {item.members} {item.members > 1 ? 'Members' : 'Worker'}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-yellow-500 mt-1">
                                <Star className="h-3 w-3 fill-current" /> {item.rating} Rating
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-gray-900">{item.rate}</p>
                        <button className="mt-2 text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-green-700">
                            Hire Now
                        </button>
                    </div>
                </div>
            ))}
            {filteredLabourers.length === 0 && (
                <div className="text-center py-10 text-gray-500">
                    No results found for "{searchTerm}"
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default FindLabour;
