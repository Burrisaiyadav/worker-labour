import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import FarmerDashboard from './pages/FarmerDashboard';
import FindLabour from './pages/FindLabour';
import Messages from './pages/Messages';
import MyJobs from './pages/MyJobs';
import FarmerProfile from './pages/FarmerProfile';
import PaymentPage from './pages/PaymentPage';
import LabourDashboard from './pages/Labour/LabourDashboard';
import ActiveJobs from './pages/Labour/ActiveJobs';
import LabourWallet from './pages/Labour/LabourWallet';
import LabourProfile from './pages/Labour/LabourProfile';
import AttendanceScanner from './pages/Labour/AttendanceScanner';
import JobHistory from './pages/Labour/JobHistory';
import Notifications from './pages/Labour/Notifications';

import BottomNav from './components/BottomNav';

const Layout = () => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = user.role || (location.pathname.startsWith('/labour') ? 'labour' : 'farmer');

  const hideNavbarRoutes = [
    '/login', 
    '/register'
  ];
  
  const dashboardRoutes = [
    '/dashboard', 
    '/find-labour', 
    '/messages', 
    '/my-jobs',
    '/farmer/profile',
    '/labour/dashboard',
    '/labour/active-jobs',
    '/labour/wallet',
    '/labour/profile',
    '/labour/scan',
    '/labour/history',
    '/labour/notifications',
    '/payment'
  ];

  const shouldShowNavbar = !hideNavbarRoutes.some(route => location.pathname.startsWith(route)) && 
                           !dashboardRoutes.some(route => location.pathname.startsWith(route));
                           
  const shouldShowBottomNav = dashboardRoutes.some(route => location.pathname.startsWith(route));

  return (
    <div className="min-h-screen bg-white">
      {shouldShowNavbar && <Navbar />}
      <main className={shouldShowBottomNav ? 'pb-20 md:pb-0' : ''}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<FarmerDashboard />} />
          <Route path="/find-labour" element={<FindLabour />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/my-jobs" element={<MyJobs />} />
          <Route path="/farmer/profile" element={<FarmerProfile />} />
          <Route path="/payment/:jobId" element={<PaymentPage />} />
          
          {/* Labour Routes */}
          <Route path="/labour/dashboard" element={<LabourDashboard />} />
          <Route path="/labour/active-jobs" element={<ActiveJobs />} />
          <Route path="/labour/wallet" element={<LabourWallet />} />
          <Route path="/labour/profile" element={<LabourProfile />} />
          <Route path="/labour/scan" element={<AttendanceScanner />} />
          <Route path="/labour/history" element={<JobHistory />} />
          <Route path="/labour/notifications" element={<Notifications />} />
        </Routes>
      </main>
      {shouldShowNavbar && <Footer />}
      {shouldShowBottomNav && <BottomNav role={role} />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;
