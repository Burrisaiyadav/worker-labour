import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Search, Briefcase, User, MessageCircle, Heart } from 'lucide-react';

const BottomNav = ({ role }) => {
    const location = useLocation();
    
    const farmerLinks = [
        { path: '/dashboard', label: 'Home', icon: Home },
        { path: '/find-labour', label: 'Find', icon: Search },
        { path: '/messages', label: 'Chat', icon: MessageCircle },
        { path: '/my-jobs', label: 'Jobs', icon: Briefcase },
        { path: '/farmer/profile', label: 'Profile', icon: User },
    ];

    const labourLinks = [
        { path: '/labour/dashboard', label: 'Home', icon: Home },
        { path: '/labour/active-jobs', label: 'Jobs', icon: Briefcase },
        { path: '/messages', label: 'Chat', icon: MessageCircle },
        { path: '/labour/history', label: 'History', icon: Heart },
        { path: '/labour/profile', label: 'Profile', icon: User },
    ];

    const links = role === 'farmer' ? farmerLinks : labourLinks;

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-2 py-2 flex justify-around items-center z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
            {links.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                    <NavLink 
                        key={link.path} 
                        to={link.path}
                        className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                            isActive 
                            ? 'text-green-600 scale-110' 
                            : 'text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        <Icon size={24} strokeWidth={isActive ? 3 : 2} />
                        <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                            {link.label}
                        </span>
                    </NavLink>
                );
            })}
        </div>
    );
};

export default BottomNav;
