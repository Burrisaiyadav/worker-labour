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
import FarmerProfile from './pages/FarmerProfile';

// ... inside Routes
          <Route path="/labour/notifications" element={<Notifications />} />
          
          {/* Farmer Routes */}
          <Route path="/farmer/profile" element={<FarmerProfile />} />
import MyJobs from './pages/MyJobs';

// ... (imports)
import LabourDashboard from './pages/Labour/LabourDashboard';
import ActiveJobs from './pages/Labour/ActiveJobs';
import LabourWallet from './pages/Labour/LabourWallet';
import LabourProfile from './pages/Labour/LabourProfile';
import ScanQRModal from './components/ScanQRModal'; // We can reuse or wrap this later
import JobHistory from './pages/Labour/JobHistory';
import Notifications from './pages/Labour/Notifications';
import AttendanceScanner from './pages/Labour/AttendanceScanner';

const Layout = () => {
  const location = useLocation();
  const hideNavbarRoutes = [
    '/login', 
    '/register', 
    '/dashboard', 
    '/find-labour', 
    '/messages', 
    '/my-jobs',
    '/labour/dashboard',
    '/labour/active-jobs',
    '/labour/wallet',
    '/labour/profile',
    '/labour/scan',
    '/labour/history',
    '/labour/notifications'
  ];
  const shouldShowNavbar = !hideNavbarRoutes.some(route => location.pathname.startsWith(route));

  return (
    <div className="min-h-screen bg-white">
      {shouldShowNavbar && <Navbar />}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<FarmerDashboard />} />
          <Route path="/find-labour" element={<FindLabour />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/my-jobs" element={<MyJobs />} />
          
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
