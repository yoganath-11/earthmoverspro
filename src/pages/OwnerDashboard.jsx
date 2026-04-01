import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAllOwners, addOwner, getEquipmentForOwner, addEquipment,
  deleteEquipment, getBookingsForOwner, getAllBookings, getEquipmentById
} from '../data/store';
import { EQUIPMENT_TYPES } from '../data/mockData';
import './OwnerDashboard.css';

const TAB_ICONS = { list: '➕', listings: '📋', bookings: '📦', profile: '👤' };
const TABS = [
  { id: 'list', label: 'Add Equipment' },
  { id: 'listings', label: 'My Listings' },
  { id: 'bookings', label: 'Bookings' },
  { id: 'profile', label: 'My Profile' },
];

const EMPTY_FORM = {
  name: '', type: 'Excavator', brand: '', year: new Date().getFullYear(),
  location: '', pricePerDay: '', operatorIncluded: true,
  capacity: '', weight: '', bucketSize: '', enginePower: '',
  description: '', photos: '',
};

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('list');
  const [owners, setOwners] = useState([]);
  const [currentOwner, setCurrentOwner] = useState(null);
  const [ownerForm, setOwnerForm] = useState({ name: '', phone: '', whatsapp: '', location: '' });
  const [listings, setListings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const allOwners = getAllOwners();
    setOwners(allOwners);
    // Simulate "current owner" = first owner in the list, or ask user to set up
    const saved = localStorage.getItem('em_current_owner');
    if (saved) {
      const ow = allOwners.find(o => o.id === saved);
      if (ow) { setCurrentOwner(ow); loadOwnerData(ow.id); }
    }
  }, []);

  function loadOwnerData(ownerId) {
    setListings(getEquipmentForOwner(ownerId));
    const bks = getAllBookings();
    const eqs = getEquipmentForOwner(ownerId);
    const eqIds = new Set(eqs.map(e => e.id));
    setBookings(bks.filter(b => eqIds.has(b.equipmentId)));
  }

  function handleOwnerSetup(e) {
    e.preventDefault();
    if (!ownerForm.name.trim() || !ownerForm.phone.trim()) { setError('Name and phone are required.'); return; }
    const newOwner = addOwner({
      ...ownerForm,
      avatar: ownerForm.name.charAt(0).toUpperCase(),
      whatsapp: ownerForm.whatsapp || ownerForm.phone.replace(/\D/g,''),
    });
    localStorage.setItem('em_current_owner', newOwner.id);
    setCurrentOwner(newOwner);
    setOwners(prev => [...prev, newOwner]);
    setSuccess('Profile created! You can now list your equipment.');
    setTimeout(() => setSuccess(''), 3000);
    loadOwnerData(newOwner.id);
    setTab('list');
  }

  function handleFormChange(e) {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  }

  function handleAddListing(e) {
    e.preventDefault();
    if (!currentOwner) { setError('Please set up your owner profile first.'); setTab('profile'); return; }
    if (!form.name.trim() || !form.pricePerDay || !form.location.trim()) {
      setError('Equipment name, location, and price are required.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const newEq = addEquipment({
        ownerId: currentOwner.id,
        name: form.name,
        type: form.type,
        brand: form.brand,
        year: Number(form.year),
        location: form.location,
        pricePerDay: Number(form.pricePerDay),
        operatorIncluded: form.operatorIncluded,
        capacity: form.capacity || '—',
        weight: form.weight || '—',
        bucketSize: form.bucketSize || 'N/A',
        enginePower: form.enginePower || '—',
        description: form.description,
        photos: form.photos ? form.photos.split('\n').map(s => s.trim()).filter(Boolean)
          : ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80'],
      });
      setForm(EMPTY_FORM);
      loadOwnerData(currentOwner.id);
      setSuccess(`✅ "${newEq.name}" listed successfully! It's now visible on the Browse page.`);
      setTab('listings');
      setLoading(false);
      setTimeout(() => setSuccess(''), 5000);
    }, 800);
  }

  function handleDelete(id, name) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    deleteEquipment(id);
    loadOwnerData(currentOwner.id);
  }

  function fmt(d) {
    return d ? new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : '—';
  }

  const tabContent = {
    // ADD EQUIPMENT
    list: (
      <div>
        <h2 className="heading-md" style={{marginBottom:'0.5rem'}}>List Your Equipment</h2>
        <p style={{color:'var(--text-secondary)', marginBottom:'2rem', fontSize:'0.875rem'}}>
          Fill in the details below to publish your machine on the platform.
        </p>
        {!currentOwner && (
          <div style={{background:'rgba(245,158,11,0.1)',border:'1px solid var(--border-amber)',borderRadius:'var(--radius-md)',padding:'1rem',marginBottom:'1.5rem',fontSize:'0.875rem',color:'var(--amber)'}}>
            ⚠️ You need to <button style={{color:'var(--amber)',fontWeight:'700',background:'none',border:'none',cursor:'pointer',textDecoration:'underline'}} onClick={() => setTab('profile')}>set up your owner profile</button> before listing equipment.
          </div>
        )}
        <form className="listing-form" onSubmit={handleAddListing}>
          <div className="listing-form-card">
            <h3>Basic Information</h3>
            <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Equipment Name *</label>
                  <input className="form-input" name="name" value={form.name} onChange={handleFormChange} placeholder="e.g. CAT 320 Excavator" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Equipment Type *</label>
                  <select className="form-select" name="type" value={form.type} onChange={handleFormChange}>
                    {EQUIPMENT_TYPES.filter(t => t !== 'All').map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Brand / Make</label>
                  <input className="form-input" name="brand" value={form.brand} onChange={handleFormChange} placeholder="Caterpillar, JCB, Komatsu..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Year of Manufacture</label>
                  <input className="form-input" name="year" type="number" value={form.year} onChange={handleFormChange} min="1990" max="2026" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Location / City *</label>
                  <input className="form-input" name="location" value={form.location} onChange={handleFormChange} placeholder="Mumbai, Maharashtra" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Price per Day (₹) *</label>
                  <input className="form-input" name="pricePerDay" type="number" value={form.pricePerDay} onChange={handleFormChange} placeholder="10000" required />
                </div>
              </div>
              <div className="form-group">
                <label style={{display:'flex',alignItems:'center',gap:'0.75rem',cursor:'pointer'}}>
                  <input
                    type="checkbox"
                    name="operatorIncluded"
                    checked={form.operatorIncluded}
                    onChange={handleFormChange}
                    style={{accentColor:'var(--amber)', width:'18px', height:'18px'}}
                  />
                  <span style={{fontWeight:'600',color:'var(--text-secondary)'}}>Operator / Driver included in price</span>
                </label>
              </div>
            </div>
          </div>

          <div className="listing-form-card">
            <h3>Specifications</h3>
            <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Capacity (e.g. 20 Ton)</label>
                  <input className="form-input" name="capacity" value={form.capacity} onChange={handleFormChange} placeholder="20 Ton" />
                </div>
                <div className="form-group">
                  <label className="form-label">Machine Weight</label>
                  <input className="form-input" name="weight" value={form.weight} onChange={handleFormChange} placeholder="20,000 kg" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Bucket Size (if applicable)</label>
                  <input className="form-input" name="bucketSize" value={form.bucketSize} onChange={handleFormChange} placeholder="0.91 m³" />
                </div>
                <div className="form-group">
                  <label className="form-label">Engine Power</label>
                  <input className="form-input" name="enginePower" value={form.enginePower} onChange={handleFormChange} placeholder="104 kW" />
                </div>
              </div>
            </div>
          </div>

          <div className="listing-form-card">
            <h3>Description & Photos</h3>
            <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  name="description"
                  value={form.description}
                  onChange={handleFormChange}
                  placeholder="Describe your equipment — condition, features, suitable projects..."
                  rows={4}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Photo URLs (one per line)</label>
                <textarea
                  className="form-textarea"
                  name="photos"
                  value={form.photos}
                  onChange={handleFormChange}
                  placeholder="https://yourimage.com/photo1.jpg&#10;https://yourimage.com/photo2.jpg"
                  rows={3}
                />
                <span style={{fontSize:'0.75rem', color:'var(--text-muted)'}}>Paste direct image URLs. Leave blank to use a default image.</span>
              </div>
            </div>
          </div>

          {error && <div style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:'var(--radius-md)',padding:'0.75rem 1rem',color:'#ef4444',fontSize:'0.875rem'}}>⚠️ {error}</div>}
          {success && <div style={{background:'rgba(34,197,94,0.1)',border:'1px solid rgba(34,197,94,0.3)',borderRadius:'var(--radius-md)',padding:'0.75rem 1rem',color:'var(--success)',fontSize:'0.875rem'}}>{success}</div>}

          <button type="submit" className="btn btn-primary btn-lg" disabled={loading} id="submit-listing-btn">
            {loading ? '⏳ Publishing...' : '🚀 Publish Listing'}
          </button>
        </form>
      </div>
    ),

    // MY LISTINGS
    listings: (
      <div>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1.5rem',flexWrap:'wrap',gap:'1rem'}}>
          <div>
            <h2 className="heading-md">My Listings</h2>
            <p style={{color:'var(--text-secondary)', fontSize:'0.875rem', marginTop:'0.25rem'}}>{listings.length} active listing{listings.length !== 1 ? 's' : ''}</p>
          </div>
          <button className="btn btn-primary" onClick={() => setTab('list')}>➕ Add New</button>
        </div>
        {listings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🏗️</div>
            <h3>No Listings Yet</h3>
            <p>Add your first equipment to start receiving booking requests.</p>
            <button className="btn btn-primary" style={{marginTop:'1rem'}} onClick={() => setTab('list')}>Add Equipment</button>
          </div>
        ) : (
          <div className="my-listings-grid">
            {listings.map(eq => (
              <div key={eq.id} className="listing-item">
                <div className="listing-item-img">
                  <img src={eq.photos?.[0]} alt={eq.name} onError={e => { e.target.src='https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=60'; }} />
                </div>
                <div className="listing-item-body">
                  <div className="listing-item-title">{eq.name}</div>
                  <div className="listing-item-meta">
                    <span className="badge badge-amber">{eq.type}</span>
                    <span className="badge badge-gray">📍 {eq.location}</span>
                    {eq.operatorIncluded && <span className="badge badge-green">👷 Operator</span>}
                  </div>
                  <div className="listing-item-footer">
                    <div className="listing-item-price">₹{eq.pricePerDay.toLocaleString('en-IN')}<span style={{fontSize:'0.75rem',color:'var(--text-muted)',fontWeight:'400'}}>/day</span></div>
                    <div className="listing-item-actions">
                      <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/equipment/${eq.id}`)}>View</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(eq.id, eq.name)}>Delete</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    ),

    // BOOKINGS
    bookings: (
      <div>
        <h2 className="heading-md" style={{marginBottom:'0.5rem'}}>Incoming Bookings</h2>
        <p style={{color:'var(--text-secondary)', marginBottom:'1.5rem', fontSize:'0.875rem'}}>{bookings.length} booking{bookings.length !== 1 ? 's' : ''} received</p>
        {bookings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <h3>No Bookings Yet</h3>
            <p>Once customers book your equipment, requests will appear here.</p>
          </div>
        ) : (
          <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'var(--radius-lg)',overflow:'hidden'}}>
            <table className="bookings-table">
              <thead>
                <tr>
                  <th>Equipment</th>
                  <th>Customer</th>
                  <th>Dates</th>
                  <th>Days</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => {
                  const eq = getEquipmentById(b.equipmentId);
                  return (
                    <tr key={b.id}>
                      <td>
                        <div style={{fontWeight:'600'}}>{eq?.name || 'Unknown'}</div>
                        <div style={{fontSize:'0.75rem',color:'var(--text-muted)'}}>{b.id.toUpperCase()}</div>
                      </td>
                      <td>
                        <div style={{fontWeight:'600'}}>{b.customerName}</div>
                        <div style={{fontSize:'0.75rem',color:'var(--text-muted)'}}>{b.customerPhone}</div>
                      </td>
                      <td style={{fontSize:'0.8rem'}}>
                        <div>{fmt(b.startDate)}</div>
                        <div style={{color:'var(--text-muted)'}}>→ {fmt(b.endDate)}</div>
                      </td>
                      <td style={{fontWeight:'600'}}>{b.totalDays}d</td>
                      <td style={{fontWeight:'700',color:'var(--amber)'}}>₹{b.totalPrice?.toLocaleString('en-IN')}</td>
                      <td><span className="badge badge-green">✅ Confirmed</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    ),

    // PROFILE
    profile: (
      <div>
        <h2 className="heading-md" style={{marginBottom:'0.5rem'}}>Owner Profile</h2>
        <p style={{color:'var(--text-secondary)', marginBottom:'2rem', fontSize:'0.875rem'}}>
          {currentOwner ? 'Your owner profile is set up. You can update your details below.' : 'Set up your owner profile to start listing equipment.'}
        </p>

        {currentOwner ? (
          <div>
            <div className="owner-profile-header">
              <div className="owner-avatar-lg">{currentOwner.avatar}</div>
              <div>
                <h3 style={{fontSize:'1.2rem', fontWeight:'700'}}>{currentOwner.name}</h3>
                <p style={{color:'var(--text-muted)', fontSize:'0.875rem', marginTop:'0.25rem'}}>📍 {currentOwner.location}</p>
                <p style={{color:'var(--text-muted)', fontSize:'0.875rem'}}>📞 {currentOwner.phone}</p>
              </div>
              <div style={{marginLeft:'auto'}}>
                <span className="badge badge-green">✅ Verified Owner</span>
              </div>
            </div>
            <div style={{display:'flex',gap:'1.5rem',flexWrap:'wrap'}}>
              <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'var(--radius-lg)',padding:'1.5rem',flex:1,minWidth:'140px',textAlign:'center'}}>
                <div style={{fontSize:'2rem',fontWeight:'800',color:'var(--amber)'}}>{listings.length}</div>
                <div style={{color:'var(--text-muted)',fontSize:'0.875rem',marginTop:'0.25rem'}}>Active Listings</div>
              </div>
              <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'var(--radius-lg)',padding:'1.5rem',flex:1,minWidth:'140px',textAlign:'center'}}>
                <div style={{fontSize:'2rem',fontWeight:'800',color:'var(--amber)'}}>{bookings.length}</div>
                <div style={{color:'var(--text-muted)',fontSize:'0.875rem',marginTop:'0.25rem'}}>Total Bookings</div>
              </div>
              <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'var(--radius-lg)',padding:'1.5rem',flex:1,minWidth:'140px',textAlign:'center'}}>
                <div style={{fontSize:'2rem',fontWeight:'800',color:'var(--amber)'}}>₹{bookings.reduce((s,b) => s+(b.totalPrice||0),0).toLocaleString('en-IN')}</div>
                <div style={{color:'var(--text-muted)',fontSize:'0.875rem',marginTop:'0.25rem'}}>Total Earned</div>
              </div>
            </div>
            <div style={{marginTop:'1.5rem'}}>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => {
                  localStorage.removeItem('em_current_owner');
                  setCurrentOwner(null);
                }}
              >
                Switch / Sign Out
              </button>
            </div>
          </div>
        ) : (
          <form style={{maxWidth:'500px',display:'flex',flexDirection:'column',gap:'1.25rem'}} onSubmit={handleOwnerSetup}>
            <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'var(--radius-lg)',padding:'1.75rem',display:'flex',flexDirection:'column',gap:'1rem'}}>
              <h3 style={{fontSize:'1rem',fontWeight:'700'}}>Create Owner Profile</h3>
              <div className="form-group">
                <label className="form-label">Business / Owner Name *</label>
                <input className="form-input" value={ownerForm.name} onChange={e => setOwnerForm(f => ({...f, name: e.target.value}))} placeholder="Rajan Heavy Equipment" id="owner-name-input" required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input className="form-input" value={ownerForm.phone} onChange={e => setOwnerForm(f => ({...f, phone: e.target.value}))} placeholder="+91 98765 43210" id="owner-phone-input" required />
              </div>
              <div className="form-group">
                <label className="form-label">WhatsApp Number (optional)</label>
                <input className="form-input" value={ownerForm.whatsapp} onChange={e => setOwnerForm(f => ({...f, whatsapp: e.target.value}))} placeholder="919876543210 (country code + number)" />
              </div>
              <div className="form-group">
                <label className="form-label">City / Location</label>
                <input className="form-input" value={ownerForm.location} onChange={e => setOwnerForm(f => ({...f, location: e.target.value}))} placeholder="Mumbai, Maharashtra" />
              </div>
            </div>
            {error && <div style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:'var(--radius-md)',padding:'0.75rem 1rem',color:'#ef4444',fontSize:'0.875rem'}}>⚠️ {error}</div>}
            {success && <div style={{background:'rgba(34,197,94,0.1)',border:'1px solid rgba(34,197,94,0.3)',borderRadius:'var(--radius-md)',padding:'0.75rem 1rem',color:'var(--success)',fontSize:'0.875rem'}}>{success}</div>}
            <button type="submit" className="btn btn-primary btn-lg" id="create-owner-btn">Create Profile</button>

            <div style={{borderTop:'1px solid var(--border)',paddingTop:'1.25rem'}}>
              <p style={{fontSize:'0.875rem',color:'var(--text-muted)',marginBottom:'0.75rem'}}>Or use an existing owner profile:</p>
              <div style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
                {owners.slice(0,5).map(ow => (
                  <button key={ow.id} type="button" className="btn btn-ghost btn-sm" style={{justifyContent:'flex-start'}} onClick={() => {
                    localStorage.setItem('em_current_owner', ow.id);
                    setCurrentOwner(ow);
                    loadOwnerData(ow.id);
                  }}>
                    <div style={{width:'28px',height:'28px',borderRadius:'50%',background:'linear-gradient(135deg,var(--amber),var(--orange))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.8rem',fontWeight:'800',color:'white'}}>{ow.avatar}</div>
                    {ow.name} — {ow.location}
                  </button>
                ))}
              </div>
            </div>
          </form>
        )}
      </div>
    ),
  };

  return (
    <div className="page-content" style={{background:'var(--bg-primary)'}}>
      <div className="container" style={{paddingTop:'2rem',paddingBottom:'4rem'}}>
        <div style={{marginBottom:'2rem'}}>
          <h1 className="heading-xl">Owner Dashboard</h1>
          <p style={{color:'var(--text-secondary)', marginTop:'0.5rem'}}>
            {currentOwner ? `Welcome, ${currentOwner.name.split(' ')[0]}! Manage your listings and bookings.` : 'List your earthmoving equipment and start earning.'}
          </p>
        </div>

        <div className="owner-layout">
          {/* Sidebar Nav */}
          <aside className="owner-nav">
            {TABS.map(t => (
              <button
                key={t.id}
                className={`owner-nav-btn ${tab === t.id ? 'active' : ''}`}
                onClick={() => { setTab(t.id); setError(''); setSuccess(''); }}
                id={`owner-tab-${t.id}`}
              >
                <span style={{fontSize:'1.1rem'}}>{TAB_ICONS[t.id]}</span>
                {t.label}
                {t.id === 'bookings' && bookings.length > 0 && (
                  <span style={{marginLeft:'auto',background:'var(--amber)',color:'#000',borderRadius:'999px',padding:'0.1rem 0.45rem',fontSize:'0.7rem',fontWeight:'800'}}>{bookings.length}</span>
                )}
              </button>
            ))}
          </aside>

          {/* Main Content */}
          <div>{tabContent[tab]}</div>
        </div>
      </div>
    </div>
  );
}
