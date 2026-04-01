import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllEquipment } from '../data/store';
import EquipmentCard from '../components/EquipmentCard';
import './Landing.css';

const CATEGORIES = [
  { icon: '⛏️', name: 'Excavators', desc: '20+ available', query: 'Excavator' },
  { icon: '🚜', name: 'Bulldozers', desc: '10+ available', query: 'Bulldozer' },
  { icon: '🏗️', name: 'Backhoe Loaders', desc: '15+ available', query: 'Backhoe Loader' },
  { icon: '🛣️', name: 'Graders', desc: '8+ available', query: 'Grader' },
  { icon: '🏋️', name: 'Cranes', desc: '6+ available', query: 'Crane' },
  { icon: '🔄', name: 'Compactors', desc: '12+ available', query: 'Compactor' },
  { icon: '🚛', name: 'Wheel Loaders', desc: '9+ available', query: 'Wheel Loader' },
  { icon: '🔩', name: 'All Types', desc: 'Browse all', query: '' },
];

const STEPS_RENTER = [
  { icon: '🔍', num: 1, title: 'Search & Filter', desc: 'Browse by equipment type, location, price, and operator availability across India.' },
  { icon: '📅', num: 2, title: 'Pick Dates', desc: 'View live calendar availability. Blocked dates are shown clearly — pick your range instantly.' },
  { icon: '✅', num: 3, title: 'Confirm & Go', desc: 'Submit your booking, get the owner's contact, and finalize details directly with them.' },
];

const STEPS_OWNER = [
  { icon: '📋', num: 1, title: 'Create Your Profile', desc: 'Set up your owner account in under 2 minutes with name, phone, and location.' },
  { icon: '🏗️', num: 2, title: 'List Your Machine', desc: 'Add photos, specs, pricing, and mark available dates — your listing goes live instantly.' },
  { icon: '💰', num: 3, title: 'Earn Daily', desc: 'Receive booking requests and earn ₹5,000–₹20,000 per day from idle equipment.' },
];

const STATS = [
  { value: '500+', label: 'Active Listings' },
  { value: '50+', label: 'Cities Covered' },
  { value: '₹5K', label: 'Starting / Day' },
  { value: '1,200+', label: 'Bookings Done' },
];

export default function Landing() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [featured, setFeatured] = useState([]);
  const [ownerView, setOwnerView] = useState(false);

  useEffect(() => {
    const all = getAllEquipment();
    setFeatured(all.filter(e => e.available).slice(0, 3));
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    navigate(`/browse?q=${encodeURIComponent(searchQuery)}`);
  }

  const steps = ownerView ? STEPS_OWNER : STEPS_RENTER;

  return (
    <div>
      {/* ─── HERO ─── */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-grid" />
        <div className="container hero-content">
          <span className="hero-eyebrow">🏗️ India's Premier Earthmovers Marketplace</span>

          <h1 className="display">
            Rent <span className="gradient-text">Heavy Equipment</span><br /> for Any Project
          </h1>

          <p className="hero-subtitle">
            Connect with verified equipment owners across India. Book excavators, bulldozers, graders, and more — with live calendar availability and transparent pricing.
          </p>

          <form className="hero-search" onSubmit={handleSearch}>
            <span className="hero-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by machine type, brand, or city..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              id="hero-search-input"
            />
            <button type="submit" className="btn btn-primary" style={{borderRadius:'var(--radius-md)', padding:'0.65rem 1.4rem'}}>
              Search
            </button>
          </form>

          <div className="hero-actions">
            <button className="btn btn-secondary btn-lg" onClick={() => navigate('/browse')}>
              Browse Equipment
            </button>
            <button className="btn btn-ghost btn-lg" onClick={() => navigate('/owner')}>
              List Your Machine →
            </button>
          </div>

          <div className="hero-stats">
            {STATS.map(s => (
              <div key={s.label} className="hero-stat">
                <div className="hero-stat-value">{s.value}</div>
                <div className="hero-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CATEGORIES ─── */}
      <section className="categories-strip">
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">Equipment Types</span>
            <h2 className="heading-lg">Browse by Category</h2>
          </div>
          <div className="grid-4">
            {CATEGORIES.map(cat => (
              <div key={cat.name} className="category-card" onClick={() => navigate(`/browse?type=${encodeURIComponent(cat.query)}`)}>
                <span className="category-icon">{cat.icon}</span>
                <h4>{cat.name}</h4>
                <p>{cat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURED ─── */}
      <section className="featured-section">
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">Top Picks</span>
            <h2 className="heading-lg">Featured Equipment</h2>
            <p>Handpicked high-rated machines available for immediate booking</p>
          </div>
          <div className="grid-3">
            {featured.map((eq, i) => (
              <div key={eq.id} style={{animationDelay:`${i * 0.08}s`}}>
                <EquipmentCard equipment={eq} />
              </div>
            ))}
          </div>
          <div style={{textAlign:'center', marginTop:'2.5rem'}}>
            <button className="btn btn-secondary btn-lg" onClick={() => navigate('/browse')}>
              View All Equipment →
            </button>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="how-section">
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">Simple Process</span>
            <h2 className="heading-lg">How It Works</h2>
            <p>Getting started takes less than 5 minutes — whether you're renting or listing.</p>
          </div>
          <div className="tabs" style={{justifyContent:'center', marginBottom:'2.5rem'}}>
            <button className={`tab-btn ${!ownerView ? 'active' : ''}`} onClick={() => setOwnerView(false)}>For Renters</button>
            <button className={`tab-btn ${ownerView ? 'active' : ''}`} onClick={() => setOwnerView(true)}>For Owners</button>
          </div>
          <div className="grid-3">
            {steps.map(step => (
              <div key={step.title} className="how-step" data-num={step.num}>
                <div className="how-step-num">{step.num}</div>
                <span className="how-icon">{step.icon}</span>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
          <div style={{textAlign:'center', marginTop:'2.5rem'}}>
            <button className="btn btn-primary btn-lg" onClick={() => navigate(ownerView ? '/owner' : '/browse')}>
              {ownerView ? 'List Your Equipment →' : 'Start Browsing →'}
            </button>
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ─── */}
      <section className="section-sm">
        <div className="container">
          <div className="cta-banner">
            <div>
              <h2>Own heavy equipment?</h2>
              <p>List your machines and start earning ₹5,000–₹20,000 per day from idle equipment.</p>
            </div>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/owner')}>
              🚀 List My Equipment
            </button>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="nav-logo" style={{fontSize:'1.05rem'}}>
                <div className="nav-logo-icon">🏗️</div>
                <span>EarthMove<span style={{color:'var(--amber)'}}>Pro</span></span>
              </div>
              <p>India's trusted marketplace for earthmoving equipment rentals. Connecting project managers with verified equipment owners nationwide.</p>
            </div>
            <div className="footer-col">
              <h5>Platform</h5>
              <a onClick={() => navigate('/browse')}>Browse Equipment</a>
              <a onClick={() => navigate('/owner')}>List Equipment</a>
              <a onClick={() => navigate('/owner')}>Owner Dashboard</a>
            </div>
            <div className="footer-col">
              <h5>Equipment</h5>
              <a onClick={() => navigate('/browse?type=Excavator')}>Excavators</a>
              <a onClick={() => navigate('/browse?type=Bulldozer')}>Bulldozers</a>
              <a onClick={() => navigate('/browse?type=Grader')}>Graders</a>
              <a onClick={() => navigate('/browse?type=Backhoe+Loader')}>Backhoe Loaders</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2026 EarthMovePro. Built for India's construction industry.</p>
            <p>Booking coordination platform only · No payment processing</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
