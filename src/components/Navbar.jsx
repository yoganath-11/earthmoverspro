import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/') ? 'nav-link active' : 'nav-link';

  return (
    <>
      <nav className="navbar">
        <div className="container">
          <Link to="/" className="nav-logo">
            <div className="nav-logo-icon">🏗️</div>
            <span>EarthMove<span style={{color:'var(--amber)'}}>Pro</span></span>
          </Link>

          <div className="nav-links">
            <Link to="/browse" className={isActive('/browse')}>Browse Equipment</Link>
            <Link to="/owner" className={isActive('/owner')}>Owner Dashboard</Link>
          </div>

          <div className="nav-actions">
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/owner')}>
              📋 List Equipment
            </button>
            <button
              className="hamburger"
              onClick={() => setMenuOpen(o => !o)}
              aria-label="Toggle menu"
            >
              <span style={menuOpen ? {transform:'rotate(45deg) translate(4px,4px)'} : {}} />
              <span style={menuOpen ? {opacity:0} : {}} />
              <span style={menuOpen ? {transform:'rotate(-45deg) translate(4px,-4px)'} : {}} />
            </button>
          </div>
        </div>
      </nav>

      {menuOpen && (
        <div className="mobile-menu">
          <Link to="/browse" className="nav-link" onClick={() => setMenuOpen(false)}>Browse Equipment</Link>
          <Link to="/owner" className="nav-link" onClick={() => setMenuOpen(false)}>Owner Dashboard</Link>
          <Link to="/owner" className="btn btn-primary btn-sm" onClick={() => setMenuOpen(false)}>List Equipment</Link>
        </div>
      )}
    </>
  );
}
