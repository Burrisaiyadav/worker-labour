import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Home, Briefcase, Wallet, User, LogOut, Bell, Menu, X } from 'lucide-react';

const LabourNavbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    // Retrieve user from local storage safely
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : { name: 'Worker', role: 'labour' };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const navLinks = [
        { path: '/labour/dashboard', label: 'Home', icon: Home },
        { path: '/labour/active-jobs', label: 'Active Jobs', icon: Briefcase },
        { path: '/labour/wallet', label: 'Wallet', icon: Wallet },
        { path: '/labour/profile', label: 'Profile', icon: User },
    ];

    return (
        <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
            <div className="px-6 py-4 flex justify-between items-center">
                {/* Logo / Brand */}
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/labour/dashboard')}>
                    <span className="text-xl font-bold text-gray-900 tracking-tight">Labour<span className="text-green-600">Connect</span></span>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8">
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
                </div>

                {/* Right Side Actions */}
                <div className="hidden md:flex items-center gap-6">
                    <button 
                        onClick={() => location.pathname === '/labour/notifications' ? navigate('/labour/dashboard') : navigate('/labour/notifications')}
                        className={`relative p-2 rounded-full transition-colors ${
                            location.pathname === '/labour/notifications' 
                            ? 'text-green-600 bg-green-50' 
                            : 'text-gray-400 hover:text-green-600 hover:bg-gray-50'
                        }`}
                    >
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full border border-white"></span>
                    </button>

                    <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                            <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                        </div>

                        <div 
                            onClick={() => navigate('/labour/profile')}
                            className="h-9 w-9 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold border-2 border-green-50 shadow-sm cursor-pointer transition-transform hover:scale-105"
                        >
                            {user.name ? user.name.charAt(0) : 'L'}
                        </div>

                        <button 
                            onClick={handleLogout}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors ml-2"
                            title="Logout"
                        >
                            <LogOut className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden flex items-center gap-4">
                     <button 
                        onClick={() => location.pathname === '/labour/notifications' ? navigate('/labour/dashboard') : navigate('/labour/notifications')}
                        className={`relative p-2 rounded-full transition-colors ${
                            location.pathname === '/labour/notifications' 
                            ? 'text-green-600 bg-green-50' 
                            : 'text-gray-400 hover:text-green-600 hover:bg-gray-50'
                        }`}
                    >
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full border border-white"></span>
                    </button>
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
                     <div className="border-t border-gray-100 pt-4 mt-2">
                        <div className="flex items-center gap-3 mb-4 px-3" onClick={() => { navigate('/labour/profile'); setIsMenuOpen(false); }}>
                             <div className="h-9 w-9 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold border-2 border-green-50 shadow-sm">
                                {user.name ? user.name.charAt(0) : 'L'}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => { handleLogout(); setIsMenuOpen(false); }}
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

export default LabourNavbar;
