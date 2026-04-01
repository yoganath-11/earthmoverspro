import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBookingById, getEquipmentById, getOwnerById } from '../data/store';

export default function Confirmation() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [equipment, setEquipment] = useState(null);
  const [owner, setOwner] = useState(null);

  useEffect(() => {
    const b = getBookingById(bookingId);
    if (!b) { navigate('/'); return; }
    setBooking(b);
    const eq = getEquipmentById(b.equipmentId);
    setEquipment(eq);
    if (eq) setOwner(getOwnerById(eq.ownerId));
  }, [bookingId]);

  if (!booking || !equipment) return <div className="page-content" style={{display:'flex',alignItems:'center',justifyContent:'center'}}><div className="spinner" /></div>;

  function fmt(d) {
    return d ? new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' }) : '—';
  }

  return (
    <div className="page-content" style={{background:'var(--bg-primary)', paddingTop:'calc(var(--nav-height) + 3rem)', paddingBottom:'4rem'}}>
      <div className="container" style={{maxWidth:'680px'}}>
        {/* Success Header */}
        <div style={{textAlign:'center', marginBottom:'2.5rem', animation:'fadeInUp 0.5s ease'}}>
          <div style={{
            width:'80px', height:'80px',
            background:'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(34,197,94,0.05))',
            border:'2px solid rgba(34,197,94,0.4)',
            borderRadius:'50%',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:'2rem', margin:'0 auto 1.5rem',
            animation:'pulse-amber 2s infinite'
          }}>✅</div>
          <h1 className="heading-xl" style={{color:'var(--success)'}}>Booking Confirmed!</h1>
          <p style={{color:'var(--text-secondary)', marginTop:'0.75rem', fontSize:'1rem'}}>
            Your equipment booking request has been successfully placed.
          </p>
        </div>

        {/* Booking ID Card */}
        <div style={{
          background:'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(234,88,12,0.05))',
          border:'1.5px solid var(--border-amber)',
          borderRadius:'var(--radius-lg)',
          padding:'1.75rem',
          marginBottom:'1.5rem',
          textAlign:'center'
        }}>
          <div style={{fontSize:'0.75rem', fontWeight:'700', letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text-muted)', marginBottom:'0.5rem'}}>Booking Reference</div>
          <div style={{fontSize:'1.5rem', fontWeight:'800', color:'var(--amber)', letterSpacing:'0.05em', fontFamily:'monospace'}}>
            {booking.id.toUpperCase()}
          </div>
          <div style={{fontSize:'0.8rem', color:'var(--text-muted)', marginTop:'0.5rem'}}>
            Placed on {fmt(booking.createdAt)}
          </div>
        </div>

        {/* Details Card */}
        <div style={{background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'1.75rem', marginBottom:'1.5rem'}}>
          <h3 style={{fontSize:'1rem', fontWeight:'700', marginBottom:'1.5rem', paddingBottom:'0.75rem', borderBottom:'1px solid var(--border)'}}>📋 Booking Details</h3>

          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.25rem'}}>
            {[
              { label:'Equipment', value: equipment.name },
              { label:'Type', value: equipment.type },
              { label:'Location', value: equipment.location },
              { label:'Operator', value: equipment.operatorIncluded ? '✅ Included' : '❌ Not included' },
              { label:'Check-in', value: fmt(booking.startDate) },
              { label:'Check-out', value: fmt(booking.endDate) },
              { label:'Duration', value: `${booking.totalDays} day${booking.totalDays > 1 ? 's' : ''}` },
              { label:'Total Amount', value: `₹${booking.totalPrice?.toLocaleString('en-IN')}` },
            ].map(item => (
              <div key={item.label}>
                <div style={{fontSize:'0.75rem', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.05em', fontWeight:'700', marginBottom:'0.3rem'}}>{item.label}</div>
                <div style={{fontSize:'0.9rem', fontWeight:'600', color: item.label==='Total Amount' ? 'var(--amber)' : 'var(--text-primary)'}}>{item.value}</div>
              </div>
            ))}
          </div>

          <div className="divider" />

          <h4 style={{fontSize:'0.875rem', fontWeight:'700', color:'var(--text-secondary)', marginBottom:'1rem'}}>CUSTOMER INFORMATION</h4>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem'}}>
            <div>
              <div style={{fontSize:'0.75rem', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.05em', fontWeight:'700', marginBottom:'0.3rem'}}>Name</div>
              <div style={{fontSize:'0.9rem', fontWeight:'600'}}>{booking.customerName}</div>
            </div>
            <div>
              <div style={{fontSize:'0.75rem', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.05em', fontWeight:'700', marginBottom:'0.3rem'}}>Phone</div>
              <div style={{fontSize:'0.9rem', fontWeight:'600'}}>{booking.customerPhone}</div>
            </div>
            <div style={{gridColumn:'1 / -1'}}>
              <div style={{fontSize:'0.75rem', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.05em', fontWeight:'700', marginBottom:'0.3rem'}}>Site Address</div>
              <div style={{fontSize:'0.9rem', fontWeight:'600'}}>{booking.customerAddress}</div>
            </div>
            {booking.projectDescription && (
              <div style={{gridColumn:'1 / -1'}}>
                <div style={{fontSize:'0.75rem', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.05em', fontWeight:'700', marginBottom:'0.3rem'}}>Project Description</div>
                <div style={{fontSize:'0.875rem', color:'var(--text-secondary)', lineHeight:'1.6'}}>{booking.projectDescription}</div>
              </div>
            )}
          </div>
        </div>

        {/* Owner Contact */}
        {owner && (
          <div style={{background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'1.75rem', marginBottom:'1.5rem'}}>
            <h3 style={{fontSize:'1rem', fontWeight:'700', marginBottom:'1.25rem'}}>📞 Contact the Owner</h3>
            <div style={{display:'flex', alignItems:'center', gap:'1rem', marginBottom:'1.25rem'}}>
              <div style={{width:'48px',height:'48px',borderRadius:'50%',background:'linear-gradient(135deg,var(--amber),var(--orange))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.2rem',fontWeight:'800',color:'white',flexShrink:0}}>{owner.avatar}</div>
              <div>
                <div style={{fontWeight:'700'}}>{owner.name}</div>
                <div style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>📍 {owner.location}</div>
              </div>
            </div>
            <div style={{display:'flex', gap:'0.75rem', flexWrap:'wrap'}}>
              <a
                href={`https://wa.me/${owner.whatsapp}?text=Hi! I've booked your ${equipment.name}. My booking ID is ${booking.id.toUpperCase()}. Please confirm.`}
                target="_blank"
                rel="noopener noreferrer"
                style={{background:'#25d366', color:'white', display:'inline-flex', alignItems:'center', gap:'0.5rem', padding:'0.75rem 1.25rem', borderRadius:'var(--radius-md)', fontWeight:'600', fontSize:'0.9rem', flex:1, justifyContent:'center'}}
                id="confirmation-whatsapp-btn"
              >
                📱 WhatsApp Owner
              </a>
              <a
                href={`tel:${owner.phone}`}
                className="btn btn-ghost"
                style={{flex:1, justifyContent:'center'}}
                id="confirmation-call-btn"
              >
                📞 Call Owner
              </a>
            </div>
          </div>
        )}

        {/* What's Next */}
        <div style={{background:'rgba(99,102,241,0.08)', border:'1px solid rgba(99,102,241,0.2)', borderRadius:'var(--radius-lg)', padding:'1.5rem', marginBottom:'2rem'}}>
          <h4 style={{fontSize:'0.9rem', fontWeight:'700', marginBottom:'1rem', color:'#818cf8'}}>📌 What Happens Next?</h4>
          <ol style={{display:'flex', flexDirection:'column', gap:'0.6rem', paddingLeft:'1.25rem'}}>
            {[
              'Contact the owner via WhatsApp or phone to confirm the booking details.',
              'Agree on transport/delivery arrangements for the equipment to your site.',
              'Inspect the equipment upon arrival before use.',
              'Make payment as agreed — cash or bank transfer directly to the owner.',
            ].map((step, i) => (
              <li key={i} style={{fontSize:'0.875rem', color:'var(--text-secondary)', lineHeight:'1.5'}}>{step}</li>
            ))}
          </ol>
        </div>

        {/* Actions */}
        <div style={{display:'flex', gap:'1rem', flexWrap:'wrap'}}>
          <button className="btn btn-primary" onClick={() => navigate('/')} id="go-home-btn">
            🏠 Back to Home
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/browse')} id="browse-more-btn">
            Browse More Equipment
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => window.print()}
            id="print-booking-btn"
          >
            🖨️ Print Booking
          </button>
        </div>
      </div>
    </div>
  );
}
