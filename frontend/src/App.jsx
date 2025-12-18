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

const Layout = () => {
  const location = useLocation();
  const hideNavbarRoutes = ['/login', '/register', '/dashboard', '/find-labour', '/messages', '/my-jobs'];
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
