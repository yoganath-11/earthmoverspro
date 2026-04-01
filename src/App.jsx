import { HashRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { initStore } from './data/store';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Browse from './pages/Browse';
import EquipmentDetail from './pages/EquipmentDetail';
import Booking from './pages/Booking';
import Confirmation from './pages/Confirmation';
import OwnerDashboard from './pages/OwnerDashboard';

export default function App() {
  useEffect(() => {
    initStore();
  }, []);

  return (
    <HashRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/equipment/:id" element={<EquipmentDetail />} />
        <Route path="/book/:id" element={<Booking />} />
        <Route path="/confirmation/:bookingId" element={<Confirmation />} />
        <Route path="/owner" element={<OwnerDashboard />} />
        <Route path="*" element={
          <div className="page-content" style={{display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:'1rem'}}>
            <div style={{fontSize:'4rem'}}>🏗️</div>
            <h1 className="heading-xl" style={{textAlign:'center'}}>404 — Page Not Found</h1>
            <p style={{color:'var(--text-secondary)'}}>This page doesn't exist.</p>
            <a href="/" className="btn btn-primary">Go Home</a>
          </div>
        } />
      </Routes>
    </HashRouter>
  );
}
