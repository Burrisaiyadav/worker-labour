import React, { useState } from 'react';
import { Menu, X, LogOut, User } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const scrollToSection = (sectionId) => {
    setIsOpen(false); // Close mobile menu if open
    
    if (location.pathname !== '/') {
        navigate('/');
        // Wait for navigation to complete then scroll
        setTimeout(() => {
            const element = document.getElementById(sectionId);
            if (element) element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    } else {
        const element = document.getElementById(sectionId);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const NavLink = ({ to, children }) => (
    <button 
        onClick={() => scrollToSection(to)} 
        className="text-gray-600 hover:text-green-600 transition-colors cursor-pointer"
    >
        {children}
    </button>
  );

  const MobileNavLink = ({ to, children }) => (
    <button 
        onClick={() => scrollToSection(to)} 
        className="block w-full text-left px-3 py-2 text-gray-600 hover:text-green-600 transition-colors"
    >
        {children}
    </button>
  );

  return (
    <nav className="bg-white shadow-sm fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center flex-shrink-0">
            <Link to="/" className="text-2xl font-bold text-green-700">Labour</Link>
          </div>
          
          <div className="hidden md:flex items-center justify-center flex-1 space-x-8">
            {location.pathname === '/' ? (
                <>
                    <NavLink to="hero">Home</NavLink>
                    <NavLink to="features">Features</NavLink>
                    <NavLink to="how-it-works">How it Works</NavLink>
                    <NavLink to="testimonials">Testimonials</NavLink>
                </>
            ) : (
                 <>
                    <Link to="/dashboard" className="text-gray-600 hover:text-green-600 font-medium whitespace-nowrap">Home</Link>
                    <Link to="/find-labour" className="text-gray-600 hover:text-green-600 font-medium whitespace-nowrap">Find Labour</Link>
                    <Link to="/my-jobs" className="text-gray-600 hover:text-green-600 font-medium whitespace-nowrap">My Jobs</Link>
                 </>
            )}
          </div>

          <div className="hidden md:flex items-center ml-4">
            {token ? (
              <div className="flex items-center space-x-4">
                <Link 
                    to={(user.role?.toLowerCase() === 'labour' || user.role?.toLowerCase() === 'worker') ? '/labour/dashboard' : '/dashboard'} 
                    className="text-gray-700 font-medium flex items-center gap-2 hover:text-green-600 transition-colors"
                >
                  <User size={18} /> {user.name?.split(' ')[0]}
                </Link>
                <button 
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-red-600 flex items-center gap-1"
                >
                  <LogOut size={18} /> Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-green-600 font-medium hover:text-green-700">Login</Link>
                <Link to="/register" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition">
                  Get Started
                </Link>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <MobileNavLink to="features">Features</MobileNavLink>
            <MobileNavLink to="how-it-works">How it Works</MobileNavLink>
            <MobileNavLink to="testimonials">Testimonials</MobileNavLink>
            
            {token ? (
              <>
                 <Link to="/dashboard" className="block w-full text-left px-3 py-2 text-gray-600 hover:text-green-600 font-medium">Dashboard</Link>
                 <div className="px-3 py-2 text-gray-700 font-medium flex items-center gap-2">
                    <User size={18} /> {user.name}
                 </div>
                 <button 
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 text-red-600 font-medium flex items-center gap-2"
                >
                  <LogOut size={18} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block w-full text-left px-3 py-2 text-green-600 font-medium">Login</Link>
                <Link to="/register" className="block w-full text-left px-3 py-2 bg-green-50 text-green-700 font-medium">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
