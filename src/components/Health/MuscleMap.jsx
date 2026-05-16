import React, { useState } from 'react';
import { useStore } from '../../store';
import maleAnatomy from '../../data/male_anatomy.json';
import femaleAnatomy from '../../data/female_anatomy.json';

export default function MuscleMap({ onSelectMuscle, selectedMuscle }) {
  const profile = useStore(state => state.profile);
  const [view, setView] = useState('front'); // 'front' or 'back'

  // Set gender based on profile, defaulting to male if 'Other' or undefined
  const [gender, setGender] = useState(() =>
    profile.gender?.toLowerCase() === 'female' ? 'female' : 'male'
  );

  // Sync with profile gender if it changes externally (e.g. from Settings)
  // This pattern is recommended by React docs for adjusting state when props change
  const [prevProfileGender, setPrevProfileGender] = useState(profile.gender);
  if (profile.gender !== prevProfileGender) {
    setGender(profile.gender?.toLowerCase() === 'female' ? 'female' : 'male');
    setPrevProfileGender(profile.gender);
  }

  const anatomyData = gender === 'female' ? femaleAnatomy : maleAnatomy;

  const MusclePath = ({ slug, paths, label }) => {
    const isSelected = selectedMuscle === slug;

    // Flatten paths with their respective transforms
    const allPaths = [];
    if (paths.common) {
      allPaths.push(...paths.common.map(d => ({ d, transform: paths.transform?.common })));
    }
    if (paths.left) {
      allPaths.push(...paths.left.map(d => ({ d, transform: paths.transform?.left })));
    }
    if (paths.right) {
      allPaths.push(...paths.right.map(d => ({ d, transform: paths.transform?.right })));
    }

    return (
      <g
        id={slug}
        className="muscle-group"
        onClick={() => onSelectMuscle(slug)}
        style={{
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          filter: isSelected ? 'drop-shadow(0 0 12px var(--primary))' : 'none',
        }}
      >
        <title>{label || slug}</title>
        {allPaths.map((item, idx) => (
          <path
            key={idx}
            d={item.d}
            transform={item.transform || ''}
            fill={isSelected ? 'var(--primary)' : 'rgba(230, 60, 60, 0.15)'}
            stroke={isSelected ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.1)'}
            strokeWidth="0.8"
            className="muscle-path"
            style={{ pointerEvents: 'all' }}
          />
        ))}
      </g>
    );
  };

  return (
    <div className="muscle-map-container" style={{ position: 'relative', width: '100%', maxWidth: '800px', margin: '0 auto' }}>

      {/* View & Gender Toggles */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '15px',
        marginBottom: '30px'
      }}>
        {/* Gender Toggle */}
        <div style={{
          display: 'flex',
          background: 'rgba(255,255,255,0.03)',
          padding: '4px',
          borderRadius: '14px',
          border: '1px solid var(--border-color)',
          backdropFilter: 'blur(10px)'
        }}>
          {['male', 'female'].map(g => (
            <button
              key={g}
              onClick={() => setGender(g)}
              style={{
                padding: '8px 20px',
                borderRadius: '11px',
                border: 'none',
                background: gender === g ? 'var(--primary)' : 'transparent',
                color: gender === g ? '#fff' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textTransform: 'capitalize'
              }}
            >
              {g} Structure
            </button>
          ))}
        </div>

        {/* View Toggle */}
        <div style={{
          display: 'flex',
          gap: '6px',
          background: 'rgba(255,255,255,0.03)',
          padding: '4px',
          borderRadius: '14px',
          border: '1px solid var(--border-color)',
          backdropFilter: 'blur(10px)'
        }}>
          <button
            onClick={() => setView('front')}
            style={{
              padding: '10px 30px',
              borderRadius: '11px',
              border: 'none',
              background: view === 'front' ? 'var(--primary)' : 'transparent',
              color: view === 'front' ? '#fff' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: view === 'front' ? '0 4px 15px rgba(var(--primary-rgb), 0.4)' : 'none'
            }}
          >Anatomy Front</button>
          <button
            onClick={() => setView('back')}
            style={{
              padding: '10px 30px',
              borderRadius: '11px',
              border: 'none',
              background: view === 'back' ? 'var(--primary)' : 'transparent',
              color: view === 'back' ? '#fff' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: view === 'back' ? '0 4px 15px rgba(var(--primary-rgb), 0.4)' : 'none'
            }}
          >Anatomy Back</button>
        </div>
      </div>

      {/* The Map */}
      <div style={{
        position: 'relative',
        background: 'radial-gradient(circle at center, rgba(var(--primary-rgb, 230, 30, 30), 0.05) 0%, transparent 80%)',
        borderRadius: '40px',
        padding: '30px',
        border: '1px solid rgba(255,255,255,0.02)',
        boxShadow: 'inset 0 0 50px rgba(0,0,0,0.2)'
      }}>
        <svg
          viewBox={gender === 'female'
            ? (view === 'front' ? "100 200 600 1200" : "800 200 600 1200")
            : (view === 'front' ? "50 50 650 1350" : "780 50 620 1350")
          }
          style={{ width: '100%', height: 'auto', overflow: 'visible' }}
        >
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Render Paths from JSON */}
          <g filter="url(#glow)">
            {(view === 'front' ? anatomyData.front : anatomyData.back).map((muscle) => (
              <MusclePath
                key={`${gender}-${view}-${muscle.slug}`}
                slug={muscle.slug}
                paths={muscle.path}
                label={muscle.slug.charAt(0).toUpperCase() + muscle.slug.slice(1).replace('-', ' ')}
              />
            ))}
          </g>
        </svg>
      </div>

      <style>{`
        .muscle-group:hover .muscle-path {
          fill: rgba(var(--primary-rgb, 230, 30, 30), 0.7) !important;
          stroke: rgba(255, 255, 255, 0.6) !important;
          filter: drop-shadow(0 0 15px rgba(var(--primary-rgb, 230, 30, 30), 0.5)) !important;
        }
        .muscle-map-container {
          animation: bodyFadeIn 0.8s ease-out;
        }
        @keyframes bodyFadeIn {
          from { opacity: 0; transform: scale(0.98) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
