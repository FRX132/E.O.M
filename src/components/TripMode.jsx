import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useStore } from '../store';
import Globe from 'react-globe.gl';

const GlobeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-globe" viewBox="0 0 16 16">
    <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m7.5-6.923c-.67.204-1.335.82-1.887 1.855A8 8 0 0 0 5.145 4H7.5zM4.09 4a9.3 9.3 0 0 1 .64-1.539 7 7 0 0 1 .597-.933A7.03 7.03 0 0 0 2.255 4zm-.582 3.5c.03-.877.138-1.718.312-2.5H1.674a7 7 0 0 0-.656 2.5zM4.847 5a12.5 12.5 0 0 0-.338 2.5H7.5V5zM8.5 5v2.5h2.99a12.5 12.5 0 0 0-.337-2.5zM4.51 8.5a12.5 12.5 0 0 0 .337 2.5H7.5V8.5zm3.99 0V11h2.653c.187-.765.306-1.608.338-2.5zM5.145 12q.208.58.468 1.068c.552 1.035 1.218 1.65 1.887 1.855V12zm.182 2.472a7 7 0 0 1-.597-.933A9.3 9.3 0 0 1 4.09 12H2.255a7 7 0 0 0 3.072 2.472M3.82 11a13.7 13.7 0 0 1-.312-2.5h-2.49c.062.89.291 1.733.656 2.5zm6.853 3.472A7 7 0 0 0 13.745 12H11.91a9.3 9.3 0 0 1-.64 1.539 7 7 0 0 1-.597.933M8.5 12v2.923c.67-.204 1.335-.82 1.887-1.855q.26-.487.468-1.068zm3.68-1h2.146c.365-.767.594-1.61.656-2.5h-2.49a13.7 13.7 0 0 1-.312 2.5m2.802-3.5a7 7 0 0 0-.656-2.5H12.18c.174.782.282 1.623.312 2.5zM11.27 2.461c.247.464.462.98.64 1.539h1.835a7 7 0 0 0-3.072-2.472c.218.284.418.598.597.933M10.855 4a8 8 0 0 0-.468-1.068C9.835 1.897 9.17 1.282 8.5 1.077V4z" />
  </svg>
);

const PinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
    <path d="M4.146.146A.5.5 0 0 1 4.5 0h7a.5.5 0 0 1 .5.5c0 .68-.59 1.9-1.118 2.665l-.044.062a4.912 4.912 0 0 1-.585.679c-.43.43-1.002.825-1.503 1.139L8.5 6.096v7.404a.5.5 0 0 1-1 0V6.096L7.25 5.045c-.501-.314-1.073-.71-1.503-1.14-.24-.24-.446-.466-.585-.68l-.044-.061C4.59 2.4 4 1.18 4 .5a.5.5 0 0 1 .146-.354zm.63 1.206c.214.654.551 1.405.89 1.884l.034.048c.146.21.36.444.606.69.4.4.922.783 1.343 1.067L8.5 5.5l.85-1.18c.421-.284.943-.667 1.343-1.067.246-.246.46-.48.606-.69l.034-.048c.34-.479.676-1.23.89-1.884H4.776z" />
  </svg>
);

export default function TripMode() {
  const storeTrips = useStore(state => state.trips);
  const trips = useMemo(() => storeTrips || [], [storeTrips]);
  const setTrips = useStore(state => state.setTrips);

  const [newLocation, setNewLocation] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newType, setNewType] = useState('Vacation');
  const [isResolving, setIsResolving] = useState(false);

  const [countries, setCountries] = useState({ features: [] });
  const [globeWidth, setGlobeWidth] = useState(800);
  const containerRef = useRef();

  useEffect(() => {
    // Load country polygons from a raw GeoJSON
    fetch('https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson')
      .then(res => res.json())
      .then(data => setCountries(data));

    // Measure container for globe width
    const measure = () => {
      if (containerRef.current) {
        setGlobeWidth(containerRef.current.clientWidth);
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const visitedLocations = useMemo(() => trips.map(t => (t.resolvedCountry || t.location).toLowerCase()), [trips]);

  const isVisited = (d) => {
    return visitedLocations.some(loc =>
      loc.includes(d.properties.NAME.toLowerCase()) ||
      loc.includes(d.properties.SOV_A3.toLowerCase()) ||
      d.properties.NAME.toLowerCase().includes(loc)
    );
  };

  const handleAddTrip = async (e) => {
    e.preventDefault();
    if (!newLocation.trim()) return;

    setIsResolving(true);
    let finalCountry = newLocation.trim();

    try {
      // Fetch English country name using OpenStreetMap Nominatim
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(newLocation.trim())}&format=json&accept-language=en&addressdetails=1&limit=1`);
      const data = await res.json();
      if (data && data.length > 0 && data[0].address && data[0].address.country) {
        finalCountry = data[0].address.country;
      }
    } catch (err) {
      console.warn("Geocoding failed, using original input:", err);
    }

    const newTrip = {
      id: window.crypto.randomUUID(),
      location: newLocation.trim(),
      resolvedCountry: finalCountry,
      date: newDate || new Date().toISOString().split('T')[0],
      notes: newNotes.trim(),
      type: newType,
      createdAt: new Date().toISOString()
    };

    setTrips([...trips, newTrip]);
    setNewLocation('');
    setNewDate('');
    setNewNotes('');
    setNewType('Vacation');
    setIsResolving(false);
  };

  const handleDelete = (id) => {
    setTrips(trips.filter(t => t.id !== id));
  };

  const getBadgeColor = (type) => {
    switch (type) {
      case 'Vacation': return 'var(--primary)';
      case 'Work': return '#4e79a7';
      case 'Exploration': return '#59a14f';
      case 'Family': return '#f28e2b';
      default: return 'var(--text-muted)';
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '40px' }} ref={containerRef}>
      <div style={{ textAlign: 'center', marginBottom: '20px', animation: 'bodyFadeIn 0.5s ease-out' }}>
        <div style={{
          display: 'inline-flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'rgba(var(--primary-rgb), 0.15)',
          color: 'var(--primary)',
          marginBottom: '15px',
          boxShadow: '0 0 20px rgba(var(--primary-rgb), 0.3)'
        }}>
          <GlobeIcon />
        </div>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '8px', letterSpacing: '-0.5px' }}>Trip Mode</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Your Interactive Travel Globe</p>
      </div>

      {/* 3D GLOBE CONTAINER */}
      <div style={{
        width: '100%',
        height: '450px',
        marginBottom: '40px',
        borderRadius: '20px',
        overflow: 'hidden',
        background: 'radial-gradient(circle at center, #1a1a1f 0%, #0d0d10 100%)',
        border: '1px solid rgba(255,255,255,0.05)',
        boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
        animation: 'bodyFadeIn 0.6s ease-out',
        position: 'relative'
      }}>
        {countries.features.length > 0 && (
          <Globe
            width={globeWidth}
            height={450}
            globeImageUrl="https://unpkg.com/three-globe/example/img/earth-dark.jpg"
            backgroundColor="rgba(0,0,0,0)"
            polygonsData={countries.features}
            polygonAltitude={d => (isVisited(d) ? 0.04 : 0.01)}
            polygonCapColor={d => (isVisited(d) ? 'rgba(255, 140, 0, 0.9)' : '#000000')}
            polygonSideColor={() => 'rgba(0, 0, 0, 0.1)'}
            polygonStrokeColor={() => '#ffffff'}
            polygonLabel={({ properties: d }) => `
              <div style="background: rgba(0,0,0,0.8); padding: 5px 10px; border-radius: 4px; color: white; border: 1px solid rgba(255,140,0,0.5);">
                <b>${d.ADMIN}</b>
              </div>
            `}
            polygonsTransitionDuration={300}
          />
        )}
      </div>

      <div className="notion-block" style={{ marginBottom: '40px', animation: 'bodyFadeIn 0.7s ease-out' }}>
        <div className="notion-header">
          📍 Add New Destination
        </div>
        <form onSubmit={handleAddTrip} style={{ padding: '25px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>Location (Country/City)</label>
              <input
                type="text"
                placeholder="e.g. Japan"
                value={newLocation}
                onChange={e => setNewLocation(e.target.value)}
                style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', padding: '12px', borderRadius: '10px', color: 'var(--text-main)' }}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>Date Visited</label>
              <input
                type="date"
                value={newDate}
                onChange={e => setNewDate(e.target.value)}
                style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', padding: '12px', borderRadius: '10px', color: 'var(--text-main)' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>Type</label>
              <select
                value={newType}
                onChange={e => setNewType(e.target.value)}
                style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', padding: '12px', borderRadius: '10px', color: 'var(--text-main)' }}
              >
                <option>Vacation</option>
                <option>Work</option>
                <option>Exploration</option>
                <option>Family</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>Notes / Memories</label>
            <textarea
              placeholder="What made this trip special?"
              value={newNotes}
              onChange={e => setNewNotes(e.target.value)}
              rows="3"
              style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', padding: '12px', borderRadius: '10px', color: 'var(--text-main)', resize: 'vertical' }}
            />
          </div>

          <button type="submit" disabled={isResolving} className="glass-btn primary" style={{ alignSelf: 'flex-start', padding: '10px 24px', opacity: isResolving ? 0.7 : 1 }}>
            {isResolving ? 'Locating on Map...' : 'Add Memory'}
          </button>
        </form>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {trips.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            No trips logged yet. Start adding your world adventures above to make the globe glow!
          </div>
        ) : (
          trips.sort((a, b) => new Date(b.date) - new Date(a.date)).map((trip, idx) => (
            <div key={trip.id} style={{
              background: 'var(--bg-card)',
              borderRadius: '16px',
              border: '1px solid var(--border-light)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              animation: `bodyFadeIn 0.5s ease-out ${idx * 0.05}s both`,
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'default',
              position: 'relative',
              overflow: 'hidden'
            }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Type Badge */}
              <div style={{ position: 'absolute', top: '20px', right: '20px', background: 'var(--bg-input)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 600, color: getBadgeColor(trip.type), border: `1px solid ${getBadgeColor(trip.type)}40` }}>
                {trip.type}
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginTop: '10px' }}>
                <div style={{ color: 'var(--primary)', marginTop: '2px' }}>
                  <PinIcon />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.2 }}>{trip.location}</h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {new Date(trip.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>
              </div>

              {trip.notes && (
                <div style={{
                  marginTop: '5px',
                  fontSize: '0.9rem',
                  color: 'var(--text-main)',
                  opacity: 0.85,
                  background: 'rgba(255,255,255,0.03)',
                  padding: '12px',
                  borderRadius: '10px',
                  lineHeight: 1.5
                }}>
                  {trip.notes}
                </div>
              )}

              <button
                onClick={() => handleDelete(trip.id)}
                style={{
                  background: 'black',
                  border: 'none',
                  color: 'var(--red-text)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  alignSelf: 'flex-end',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  opacity: 0.7,
                  marginTop: 'auto'
                }}
                onMouseEnter={e => e.target.style.opacity = 1}
                onMouseLeave={e => e.target.style.opacity = 0.7}
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>

      <style>{`
        @keyframes bodyFadeIn {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
