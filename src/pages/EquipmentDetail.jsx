import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEquipmentById, getOwnerById, countDays } from '../data/store';
import Calendar from '../components/Calendar';
import './EquipmentDetail.css';

export default function EquipmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState(null);
  const [owner, setOwner] = useState(null);
  const [activePhoto, setActivePhoto] = useState(0);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    const eq = getEquipmentById(id);
    if (!eq) { navigate('/browse'); return; }
    setEquipment(eq);
    setOwner(getOwnerById(eq.ownerId));
  }, [id]);

  if (!equipment) return <div className="page-content" style={{display:'flex',alignItems:'center',justifyContent:'center'}}><div className="spinner" /></div>;

  const { name, type, description, location, pricePerDay, operatorIncluded, brand, year, capacity, weight, bucketSize, enginePower, photos, blockedDates, rating, reviewCount } = equipment;

  const days = startDate && endDate ? countDays(startDate, endDate) : 0;
  const totalPrice = days * pricePerDay;

  function handleRangeChange(start, end) {
    setStartDate(start);
    setEndDate(end);
  }

  function handleBook() {
    if (!startDate || !endDate) {
      alert('Please select your booking dates first.');
      return;
    }
    navigate(`/book/${id}`, { state: { startDate, endDate, days, totalPrice } });
  }

  function formatDate(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
  }

  return (
    <div className="page-content" style={{background:'var(--bg-primary)'}}>
      {/* Hero Image */}
      <div style={{paddingTop:'var(--nav-height)'}}>
        <div className="detail-hero">
          <img
            src={photos?.[activePhoto] || photos?.[0]}
            alt={name}
            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80'; }}
          />
          <div className="detail-hero-overlay" />
          {photos?.length > 1 && (
            <div className="detail-hero-thumbnails">
              {photos.map((p, i) => (
                <div key={i} className={`detail-thumb ${i === activePhoto ? 'active' : ''}`} onClick={() => setActivePhoto(i)}>
                  <img src={p} alt={`view ${i+1}`} onError={e => { e.target.src = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&q=60'; }} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="container">
        {/* Breadcrumb */}
        <div style={{padding:'1.25rem 0', display:'flex', alignItems:'center', gap:'0.5rem', fontSize:'0.85rem', color:'var(--text-muted)'}}>
          <span style={{cursor:'pointer', color:'var(--amber)'}} onClick={() => navigate('/')}>Home</span>
          <span>›</span>
          <span style={{cursor:'pointer', color:'var(--amber)'}} onClick={() => navigate('/browse')}>Browse</span>
          <span>›</span>
          <span>{name}</span>
        </div>

        <div className="detail-layout">
          {/* Left: Details */}
          <div className="detail-main">
            <div className="detail-header">
              <div>
                <h1 className="detail-title">{name}</h1>
                <div className="detail-badges">
                  <span className="badge badge-amber">{type}</span>
                  {operatorIncluded && <span className="badge badge-green">👷 Operator Included</span>}
                  <span className="badge badge-gray">📍 {location}</span>
                  {rating > 0 && (
                    <span className="badge badge-orange">★ {rating} ({reviewCount} reviews)</span>
                  )}
                </div>
              </div>
              <div style={{textAlign:'right'}}>
                <div className="detail-price-tag">
                  ₹{pricePerDay.toLocaleString('en-IN')}
                  <span> / day</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div style={{marginBottom:'2rem'}}>
              <h2 className="heading-md" style={{marginBottom:'0.75rem'}}>About this Equipment</h2>
              <p style={{color:'var(--text-secondary)', lineHeight:'1.7'}}>{description}</p>
            </div>

            {/* Specs */}
            <div style={{marginBottom:'2rem'}}>
              <h2 className="heading-md" style={{marginBottom:'1rem'}}>Specifications</h2>
              <div className="specs-grid">
                <div className="spec-item"><div className="spec-label">Brand</div><div className="spec-value">{brand}</div></div>
                <div className="spec-item"><div className="spec-label">Year</div><div className="spec-value">{year}</div></div>
                <div className="spec-item"><div className="spec-label">Capacity</div><div className="spec-value">{capacity}</div></div>
                <div className="spec-item"><div className="spec-label">Weight</div><div className="spec-value">{weight}</div></div>
                {bucketSize !== 'N/A' && <div className="spec-item"><div className="spec-label">Bucket Size</div><div className="spec-value">{bucketSize}</div></div>}
                <div className="spec-item"><div className="spec-label">Engine Power</div><div className="spec-value">{enginePower}</div></div>
                <div className="spec-item"><div className="spec-label">Operator</div><div className="spec-value">{operatorIncluded ? '✅ Included' : '❌ Self-Operated'}</div></div>
                <div className="spec-item"><div className="spec-label">Location</div><div className="spec-value">{location}</div></div>
              </div>
            </div>

            {/* Calendar */}
            <div style={{marginBottom:'2rem'}}>
              <h2 className="heading-md" style={{marginBottom:'1rem'}}>📅 Check Availability</h2>
              <p style={{color:'var(--text-muted)', fontSize:'0.875rem', marginBottom:'1rem'}}>
                Click a start date, then an end date to select your booking range. Red dates are already booked.
              </p>
              <Calendar
                blockedDates={blockedDates}
                selectedStart={startDate}
                selectedEnd={endDate}
                onRangeChange={handleRangeChange}
              />
            </div>
          </div>

          {/* Right: Sidebar */}
          <div className="detail-sidebar">
            {/* Booking Box */}
            <div className="booking-box" style={{marginBottom:'1.5rem'}}>
              <h3>📋 Book This Equipment</h3>

              <div style={{display:'flex', flexDirection:'column', gap:'0.75rem', marginBottom:'1rem'}}>
                <div>
                  <div className="spec-label" style={{marginBottom:'0.35rem'}}>Start Date</div>
                  <div className={`date-display ${startDate ? 'selected' : ''}`}>
                    <span>📅</span>
                    <span>{formatDate(startDate)}</span>
                  </div>
                </div>
                <div>
                  <div className="spec-label" style={{marginBottom:'0.35rem'}}>End Date</div>
                  <div className={`date-display ${endDate ? 'selected' : ''}`}>
                    <span>📅</span>
                    <span>{formatDate(endDate)}</span>
                  </div>
                </div>
              </div>

              {startDate && endDate && (
                <div className="booking-summary">
                  <div className="booking-summary-row">
                    <span className="label">Duration</span>
                    <span>{days} day{days > 1 ? 's' : ''}</span>
                  </div>
                  <div className="booking-summary-row">
                    <span className="label">Rate</span>
                    <span>₹{pricePerDay.toLocaleString('en-IN')}/day</span>
                  </div>
                  <div className="booking-summary-row total">
                    <span>Total</span>
                    <span>₹{totalPrice.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              )}

              <button
                className="btn btn-primary btn-full"
                onClick={handleBook}
                style={{marginTop:'0.5rem'}}
                id="book-now-btn"
              >
                {startDate && endDate ? `Book Now — ₹${totalPrice.toLocaleString('en-IN')}` : 'Select Dates to Book'}
              </button>
              <p style={{fontSize:'0.75rem', color:'var(--text-muted)', textAlign:'center', marginTop:'0.5rem'}}>
                No payment now — confirm directly with owner
              </p>
            </div>

            {/* Owner Card */}
            {owner && (
              <div className="owner-card">
                <div className="owner-header">
                  <div className="owner-avatar">{owner.avatar}</div>
                  <div>
                    <div className="owner-name">{owner.name}</div>
                    <div className="owner-loc">📍 {owner.location}</div>
                  </div>
                </div>
                <div className="contact-btns">
                  <a
                    href={`https://wa.me/${owner.whatsapp}?text=Hi! I'm interested in booking your ${name}. Is it available?`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="whatsapp-btn"
                    id="whatsapp-contact-btn"
                  >
                    <span>📱</span> Chat on WhatsApp
                  </a>
                  <a href={`tel:${owner.phone}`} className="btn btn-ghost btn-full" id="call-owner-btn">
                    📞 {owner.phone}
                  </a>
                </div>
              </div>
            )}

            {/* Price breakdown */}
            <div style={{background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-md)', padding:'1.25rem'}}>
              <h4 style={{fontSize:'0.875rem', fontWeight:'700', marginBottom:'1rem', color:'var(--text-secondary)'}}>PRICING DETAILS</h4>
              <div style={{display:'flex', flexDirection:'column', gap:'0.6rem'}}>
                <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.875rem'}}>
                  <span style={{color:'var(--text-muted)'}}>Per Day Rate</span>
                  <span style={{fontWeight:'600'}}>₹{pricePerDay.toLocaleString('en-IN')}</span>
                </div>
                <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.875rem'}}>
                  <span style={{color:'var(--text-muted)'}}>Operator</span>
                  <span style={{fontWeight:'600'}}>{operatorIncluded ? 'Included' : 'Not included'}</span>
                </div>
                <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.875rem'}}>
                  <span style={{color:'var(--text-muted)'}}>Fuel</span>
                  <span style={{fontWeight:'600'}}>Buyer's responsibility</span>
                </div>
                <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.875rem'}}>
                  <span style={{color:'var(--text-muted)'}}>Transport</span>
                  <span style={{fontWeight:'600'}}>Negotiable with owner</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
