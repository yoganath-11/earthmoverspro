import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAllEquipment } from '../data/store';
import { EQUIPMENT_TYPES, LOCATIONS } from '../data/mockData';
import EquipmentCard from '../components/EquipmentCard';
import './Browse.css';

const SORT_OPTIONS = [
  { value: 'rating', label: 'Top Rated' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest First' },
];

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [all, setAll] = useState([]);
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [type, setType] = useState(searchParams.get('type') || 'All');
  const [location, setLocation] = useState('All Locations');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [operatorOnly, setOperatorOnly] = useState(false);
  const [sort, setSort] = useState('rating');

  useEffect(() => {
    setAll(getAllEquipment());
  }, []);

  useEffect(() => {
    const t = searchParams.get('type');
    if (t && t !== type) setType(t);
    const q = searchParams.get('q');
    if (q && q !== query) setQuery(q);
    // eslint-disable-next-line
  }, [searchParams]);

  function resetFilters() {
    setQuery(''); setType('All'); setLocation('All Locations');
    setMinPrice(''); setMaxPrice(''); setOperatorOnly(false); setSort('rating');
    setSearchParams({});
  }

  const filtered = all
    .filter(e => {
      if (!e.available) return false;
      if (query && !e.name.toLowerCase().includes(query.toLowerCase()) && !e.type.toLowerCase().includes(query.toLowerCase()) && !e.location.toLowerCase().includes(query.toLowerCase()) && !e.brand.toLowerCase().includes(query.toLowerCase())) return false;
      if (type && type !== 'All' && e.type !== type) return false;
      if (location && location !== 'All Locations' && e.location !== location) return false;
      if (minPrice && e.pricePerDay < Number(minPrice)) return false;
      if (maxPrice && e.pricePerDay > Number(maxPrice)) return false;
      if (operatorOnly && !e.operatorIncluded) return false;
      return true;
    })
    .sort((a, b) => {
      if (sort === 'price_asc') return a.pricePerDay - b.pricePerDay;
      if (sort === 'price_desc') return b.pricePerDay - a.pricePerDay;
      if (sort === 'rating') return (b.rating || 0) - (a.rating || 0);
      return 0;
    });

  return (
    <div className="page-content" style={{background:'var(--bg-primary)'}}>
      <div className="container" style={{paddingTop:'2rem', paddingBottom:'4rem'}}>
        {/* Page Header */}
        <div style={{marginBottom:'2rem'}}>
          <h1 className="heading-xl">Browse Equipment</h1>
          <p style={{color:'var(--text-secondary)', marginTop:'0.5rem'}}>
            Find the right machine for your project — filter by type, location, and budget.
          </p>
        </div>

        <div className="browse-layout">
          {/* Sidebar */}
          <aside className="browse-sidebar">
            <h3>
              Filters
              <button className="btn btn-ghost btn-sm" onClick={resetFilters}>Reset</button>
            </h3>

            <div className="filter-section">
              <h4>Equipment Type</h4>
              {EQUIPMENT_TYPES.map(t => (
                <label key={t} style={{display:'flex',alignItems:'center',gap:'0.6rem',cursor:'pointer'}}>
                  <input
                    type="radio"
                    name="type"
                    value={t}
                    checked={type === t}
                    onChange={() => setType(t)}
                    style={{accentColor:'var(--amber)'}}
                  />
                  <span style={{fontSize:'0.875rem',color: type === t ? 'var(--amber)' : 'var(--text-secondary)'}}>
                    {t}
                  </span>
                </label>
              ))}
            </div>

            <div className="divider" style={{margin:'0'}} />

            <div className="filter-section">
              <h4>Location</h4>
              <select className="form-select form-input" value={location} onChange={e => setLocation(e.target.value)} style={{padding:'0.5rem 0.75rem',fontSize:'0.875rem'}}>
                {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            <div className="filter-section">
              <h4>Price Range (₹/day)</h4>
              <div className="price-range">
                <input type="number" placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
                <span style={{color:'var(--text-muted)'}}>–</span>
                <input type="number" placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
              </div>
            </div>

            <div className="filter-section">
              <h4>Operator</h4>
              <label className="operator-toggle" onClick={() => setOperatorOnly(o => !o)}>
                <div className={`toggle-track ${operatorOnly ? 'on' : ''}`}>
                  <div className="toggle-thumb" />
                </div>
                <span className="toggle-label">Operator Included Only</span>
              </label>
            </div>
          </aside>

          {/* Main */}
          <div className="browse-main">
            <div className="browse-toolbar">
              <div className="browse-search">
                <i className="browse-search-icon">🔍</i>
                <input
                  type="text"
                  placeholder="Search by name, brand, city..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  id="browse-search-input"
                />
              </div>
              <span className="browse-count">{filtered.length} results</span>
              <select className="sort-select" value={sort} onChange={e => setSort(e.target.value)}>
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            {filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🔎</div>
                <h3>No equipment found</h3>
                <p>Try adjusting your filters or search terms.</p>
                <button className="btn btn-secondary" style={{marginTop:'1rem'}} onClick={resetFilters}>Clear All Filters</button>
              </div>
            ) : (
              <div className="equipment-grid">
                {filtered.map(eq => <EquipmentCard key={eq.id} equipment={eq} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
