import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getEquipmentById, getOwnerById, createBooking } from '../data/store';

export default function Booking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};

  const [equipment, setEquipment] = useState(null);
  const [owner, setOwner] = useState(null);
  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    projectDescription: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { startDate, endDate, days, totalPrice } = state;

  useEffect(() => {
    const eq = getEquipmentById(id);
    if (!eq || !startDate || !endDate) { navigate(`/equipment/${id}`); return; }
    setEquipment(eq);
    setOwner(getOwnerById(eq.ownerId));
  }, [id]);

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.customerName.trim()) { setError('Please enter your name.'); return; }
    if (!form.customerPhone.trim() || form.customerPhone.length < 10) { setError('Please enter a valid phone number.'); return; }
    if (!form.customerAddress.trim()) { setError('Please enter your address.'); return; }

    setSubmitting(true);
    setTimeout(() => {
      const booking = createBooking({
        equipmentId: id,
        ownerId: equipment.ownerId,
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        customerAddress: form.customerAddress,
        projectDescription: form.projectDescription,
        startDate,
        endDate,
        totalDays: days,
        totalPrice,
      });
      setSubmitting(false);
      navigate(`/confirmation/${booking.id}`);
    }, 1000);
  }

  if (!equipment) return <div className="page-content" style={{display:'flex',alignItems:'center',justifyContent:'center'}}><div className="spinner" /></div>;

  function fmt(d) {
    return d ? new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : '—';
  }

  return (
    <div className="page-content" style={{background:'var(--bg-primary)', paddingTop:'calc(var(--nav-height) + 2rem)', paddingBottom:'4rem'}}>
      <div className="container" style={{maxWidth:'900px'}}>
        {/* Breadcrumb */}
        <div style={{display:'flex',alignItems:'center',gap:'0.5rem',fontSize:'0.85rem',color:'var(--text-muted)',marginBottom:'2rem'}}>
          <span style={{cursor:'pointer',color:'var(--amber)'}} onClick={() => navigate('/')}>Home</span>
          <span>›</span>
          <span style={{cursor:'pointer',color:'var(--amber)'}} onClick={() => navigate('/browse')}>Browse</span>
          <span>›</span>
          <span style={{cursor:'pointer',color:'var(--amber)'}} onClick={() => navigate(`/equipment/${id}`)}>{equipment.name}</span>
          <span>›</span>
          <span>Book</span>
        </div>

        <h1 className="heading-xl" style={{marginBottom:'0.5rem'}}>Confirm Your Booking</h1>
        <p style={{color:'var(--text-secondary)', marginBottom:'2rem'}}>Fill in your details to send a booking request to the owner.</p>

        <div style={{display:'grid', gridTemplateColumns:'1fr 380px', gap:'2rem', alignItems:'start'}} className="booking-layout">
          {/* Form */}
          <form onSubmit={handleSubmit} style={{display:'flex', flexDirection:'column', gap:'1.5rem'}}>
            <div style={{background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'1.5rem'}}>
              <h3 style={{marginBottom:'1.25rem', fontSize:'1rem', fontWeight:'700'}}>Your Details</h3>
              <div style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
                <div className="form-group">
                  <label className="form-label" htmlFor="customerName">Full Name *</label>
                  <input className="form-input" id="customerName" name="customerName" value={form.customerName} onChange={handleChange} placeholder="Enter your full name" required />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="customerPhone">Phone Number *</label>
                  <input className="form-input" id="customerPhone" name="customerPhone" value={form.customerPhone} onChange={handleChange} placeholder="+91 98765 43210" type="tel" required />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="customerAddress">Site / Delivery Address *</label>
                  <input className="form-input" id="customerAddress" name="customerAddress" value={form.customerAddress} onChange={handleChange} placeholder="Where will the equipment be deployed?" required />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="projectDescription">Project Description</label>
                  <textarea className="form-textarea" id="projectDescription" name="projectDescription" value={form.projectDescription} onChange={handleChange} placeholder="Describe your project (type of work, terrain, etc.)" rows={4} />
                </div>
              </div>
            </div>

            {error && (
              <div style={{background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'var(--radius-md)', padding:'0.75rem 1rem', color:'#ef4444', fontSize:'0.875rem'}}>
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={submitting}
              id="confirm-booking-btn"
            >
              {submitting ? '⏳ Confirming...' : '✅ Confirm Booking'}
            </button>
            <p style={{textAlign:'center', fontSize:'0.8rem', color:'var(--text-muted)'}}>
              No payment required now. You'll coordinate directly with the equipment owner.
            </p>
          </form>

          {/* Summary Sidebar */}
          <div style={{display:'flex', flexDirection:'column', gap:'1.25rem'}}>
            <div style={{background:'var(--bg-card)', border:'1.5px solid var(--border-amber)', borderRadius:'var(--radius-lg)', overflow:'hidden'}}>
              <div style={{height:'160px', overflow:'hidden'}}>
                <img
                  src={equipment.photos?.[0]}
                  alt={equipment.name}
                  style={{width:'100%', height:'100%', objectFit:'cover'}}
                  onError={e => { e.target.src='https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80'; }}
                />
              </div>
              <div style={{padding:'1.25rem'}}>
                <div className="badge badge-amber" style={{marginBottom:'0.5rem'}}>{equipment.type}</div>
                <h3 style={{fontSize:'1rem', fontWeight:'700', marginBottom:'0.25rem'}}>{equipment.name}</h3>
                <p style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>📍 {equipment.location}</p>

                {owner && (
                  <div style={{display:'flex', alignItems:'center', gap:'0.6rem', marginTop:'1rem', paddingTop:'1rem', borderTop:'1px solid var(--border)'}}>
                    <div style={{width:'30px',height:'30px',borderRadius:'50%',background:'linear-gradient(135deg,var(--amber),var(--orange))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.85rem',fontWeight:'800',color:'white',flexShrink:0}}>{owner.avatar}</div>
                    <div>
                      <div style={{fontSize:'0.8rem', fontWeight:'600'}}>{owner.name}</div>
                      <div style={{fontSize:'0.75rem', color:'var(--text-muted)'}}>{owner.phone}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div style={{background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'1.25rem'}}>
              <h4 style={{fontSize:'0.875rem', fontWeight:'700', color:'var(--text-secondary)', marginBottom:'1rem', textTransform:'uppercase', letterSpacing:'0.05em'}}>Booking Summary</h4>
              <div style={{display:'flex', flexDirection:'column', gap:'0.75rem'}}>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.875rem'}}>
                  <span style={{color:'var(--text-muted)'}}>Check-in</span>
                  <span style={{fontWeight:'600'}}>{fmt(startDate)}</span>
                </div>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.875rem'}}>
                  <span style={{color:'var(--text-muted)'}}>Check-out</span>
                  <span style={{fontWeight:'600'}}>{fmt(endDate)}</span>
                </div>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.875rem'}}>
                  <span style={{color:'var(--text-muted)'}}>Duration</span>
                  <span style={{fontWeight:'600'}}>{days} day{days>1?'s':''}</span>
                </div>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.875rem'}}>
                  <span style={{color:'var(--text-muted)'}}>Rate</span>
                  <span style={{fontWeight:'600'}}>₹{equipment.pricePerDay.toLocaleString('en-IN')}/day</span>
                </div>
                <div style={{height:'1px',background:'var(--border)'}} />
                <div style={{display:'flex',justifyContent:'space-between',fontSize:'1.05rem',fontWeight:'800',color:'var(--amber)'}}>
                  <span>Total</span>
                  <span>₹{totalPrice?.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media(max-width:768px){
          .booking-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
