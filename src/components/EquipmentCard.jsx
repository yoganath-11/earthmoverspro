import { useNavigate } from 'react-router-dom';
import './EquipmentCard.css';

export default function EquipmentCard({ equipment }) {
  const navigate = useNavigate();
  const { id, name, type, location, pricePerDay, operatorIncluded, photos, rating, reviewCount } = equipment;

  return (
    <div className="card equipment-card" onClick={() => navigate(`/equipment/${id}`)}>
      <div className="equipment-card-img">
        <img
          src={photos?.[0] || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80'}
          alt={name}
          loading="lazy"
          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80'; }}
        />
        <div className="equipment-card-img-overlay" />
        <span className="equipment-card-badge badge badge-amber">{type}</span>
        {operatorIncluded && (
          <span className="equipment-card-op badge badge-green">👷 Operator</span>
        )}
      </div>
      <div className="equipment-card-body">
        <h3 className="equipment-card-title">{name}</h3>
        <div className="equipment-card-loc">
          <span>📍</span>
          <span>{location}</span>
        </div>
        <div className="equipment-card-meta">
          <div className="equipment-card-price">
            <span className="amount">₹{pricePerDay.toLocaleString('en-IN')}</span>
            <span className="per">/ day</span>
          </div>
          <div className="equipment-card-rating">
            <span className="star">★</span>
            <span style={{fontWeight:'600'}}>{rating || '—'}</span>
            <span style={{color:'var(--text-muted)'}}>({reviewCount})</span>
          </div>
        </div>
      </div>
    </div>
  );
}
