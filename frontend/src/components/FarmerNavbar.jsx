import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Briefcase, Search, PlusCircle, LogOut, Menu, X, User } from 'lucide-react';

const FarmerNavbar = ({ user, onLogout, onPostJob }) => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Fallback user if not provided (though dashboard should provide it)
    const currentUser = user || { name: 'Farmer', role: 'farmer', location: '' };

    const navLinks = [
        { path: '/dashboard', label: 'Home', icon: Home },
        { path: '/find-labour', label: 'Find Labour', icon: Search },
        { path: '/my-jobs', label: 'My Jobs', icon: Briefcase },
    ];

    return (
        <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
            <div className="px-6 py-4 flex justify-between items-center">
                {/* Logo / Brand */}
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
                    <span className="text-xl font-bold text-gray-900 tracking-tight">Labour<span className="text-green-600">Connect</span></span>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-6">
                    {navLinks.map((link) => {
                        const Icon = link.icon;
                        return (
                            <NavLink 
                                key={link.path} 
                                to={link.path}
                                className={({ isActive }) => 
                                    `flex items-center gap-2 text-sm font-medium transition-colors ${
                                        isActive 
                                        ? 'text-green-600' 
                                        : 'text-gray-500 hover:text-green-600'
                                    }`
                                }
                            >
                                <Icon className="h-4 w-4" />
                                {link.label}
                            </NavLink>
                        );
                    })}
                    <button 
                        onClick={onPostJob}
                        className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-green-600 transition-colors"
                    >
                        <PlusCircle className="h-4 w-4" />
                        New Job
                    </button>
                </div>

                {/* Right Side Actions (Desktop) */}
                <div className="hidden md:flex items-center gap-6 pl-6 border-l border-gray-200">
                    <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">{currentUser.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{currentUser.role}</p>
                    </div>

                    <div 
                        onClick={() => navigate('/farmer/profile')}
                        className="h-9 w-9 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold border-2 border-green-50 shadow-sm cursor-pointer transition-transform hover:scale-105"
                    >
                        {currentUser.name ? currentUser.name.charAt(0) : 'F'}
                    </div>

                    <button 
                        onClick={onLogout}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors ml-2"
                        title="Logout"
                    >
                        <LogOut className="h-5 w-5" />
                    </button>
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden flex items-center gap-4">
                    <button 
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMenuOpen && (
                <div className="md:hidden border-t border-gray-100 bg-white absolute w-full left-0 shadow-lg py-4 px-6 flex flex-col gap-4">
                     {navLinks.map((link) => {
                        const Icon = link.icon;
                        return (
                            <NavLink 
                                key={link.path} 
                                to={link.path}
                                onClick={() => setIsMenuOpen(false)}
                                className={({ isActive }) => 
                                    `flex items-center gap-3 text-sm font-medium py-2 px-3 rounded-lg transition-colors ${
                                        isActive 
                                        ? 'bg-green-50 text-green-700' 
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-green-600'
                                    }`
                                }
                            >
                                <Icon className="h-5 w-5" />
                                {link.label}
                            </NavLink>
                        );
                    })}
                    
                    <button 
                        onClick={() => { onPostJob(); setIsMenuOpen(false); }}
                        className="flex items-center gap-3 text-sm font-medium py-2 px-3 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-green-600 transition-colors"
                    >
                        <PlusCircle className="h-5 w-5" />
                        New Job
                    </button>

                     <div className="border-t border-gray-100 pt-4 mt-2">
                        <div className="flex items-center gap-3 mb-4 px-3">
                             <div 
                                onClick={() => { navigate('/farmer/profile'); setIsMenuOpen(false); }}
                                className="h-9 w-9 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold border-2 border-green-50 shadow-sm cursor-pointer"
                             >
                                {currentUser.name ? currentUser.name.charAt(0) : 'F'}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-900">{currentUser.name}</p>
                                <p className="text-xs text-gray-500 capitalize">{currentUser.role}</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => { onLogout(); setIsMenuOpen(false); }}
                            className="w-full flex items-center gap-3 text-red-500 font-medium py-2 px-3 rounded-lg hover:bg-red-50"
                        >
                            <LogOut className="h-5 w-5" />
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default FarmerNavbar;
