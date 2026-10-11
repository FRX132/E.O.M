import React, { useMemo } from 'react';
import { useStore } from '../../store';
import { SKILL_DEF } from '../../constants';

export default function LifeBalanceRadar({ mode = 'skills', dimensions: customDimensions, width = 260, height = 260 }) {
  const skills = useStore((state) => state.skills || []);
  const habits = useStore((state) => state.habits || []);
  const expenses = useStore((state) => state.expenses || []);
  const assets = useStore((state) => state.assets || []);
  const books = useStore((state) => state.books || []);
  const workouts = useStore((state) => state.workouts || []);
  const timetableBlocks = useStore((state) => state.timetableBlocks || []);
  const profile = useStore((state) => state.profile || {});

  const radarDimensions = useMemo(() => {
    if (customDimensions && Array.isArray(customDimensions)) {
      return customDimensions;
    }

    if (mode === 'skills') {
      const branches = ['Health', 'Mental', 'Spirit', 'Social', 'Career'];
      const dims = branches.map((cat) => {
        const catSkills = SKILL_DEF.filter((s) => s.category === cat);
        const unlockedCount = catSkills.filter((s) => skills.includes(s.id)).length;
        const rawPct = catSkills.length > 0 ? (unlockedCount / catSkills.length) * 100 : 0;
        // Floor at 15 for visual aesthetics so the polygon has shape
        const visualValue = Math.min(100, Math.max(15, Math.round(rawPct)));
        return {
          label: cat,
          value: visualValue,
          rawPct: Math.round(rawPct),
          count: `${unlockedCount}/${catSkills.length}`
        };
      });

      // 6th dimension: Total Skill Mastery
      const totalUnlocked = skills.length;
      const totalSkills = SKILL_DEF.length;
      const totalPct = Math.round((totalUnlocked / totalSkills) * 100);
      dims.push({
        label: 'Mastery',
        value: Math.min(100, Math.max(15, totalPct)),
        rawPct: totalPct,
        count: `${totalUnlocked}/${totalSkills}`
      });

      return dims;
    }

    // Default Overview mode
    const today = new Date().toISOString().split('T')[0];
    const todayHabitDay = habits.find((d) => d.id === today);
    const habitTotal = todayHabitDay?.habits?.length || 0;
    const habitDone = todayHabitDay?.habits?.filter((h) => h.done)?.length || 0;
    const habitPct = habitTotal > 0 ? (habitDone / habitTotal) * 100 : 30;

    const netWorth = (assets || []).reduce((acc, a) => acc + (Number(a.value) || 0), 0) -
      (expenses || []).reduce((acc, e) => acc + (Number(e.amount) || 0), 0);

    const completedBlocks = (timetableBlocks || []).filter((b) => b.completed).length;

    return [
      { label: 'Health', value: Math.min(100, Math.max(20, Math.round(habitPct))) },
      { label: 'Wealth', value: Math.min(100, Math.max(15, Math.round((netWorth / 5000) * 100))) },
      { label: 'Mind', value: Math.min(100, Math.max(20, (books.length * 20) + 15)) },
      { label: 'Focus', value: Math.min(100, Math.max(25, (completedBlocks * 20) + 20)) },
      { label: 'Fitness', value: Math.min(100, Math.max(20, (workouts.length * 15) + 20)) },
      { label: 'Agency', value: Math.min(100, Math.max(20, Math.round(((profile.xp || 0) / 10000) * 100))) }
    ];
  }, [mode, customDimensions, skills, habits, expenses, assets, books, workouts, timetableBlocks, profile.xp]);

  const cx = width / 2;
  const cy = height / 2;
  const maxR = (Math.min(width, height) / 2) - 45;
  const totalPoints = radarDimensions.length;

  const getCoord = (value, idx) => {
    const angle = (Math.PI * 2 / totalPoints) * idx - Math.PI / 2;
    const r = (value / 100) * maxR;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle)
    };
  };

  const polygonPoints = radarDimensions
    .map((d, i) => {
      const { x, y } = getCoord(d.value, i);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="life-balance-radar-wrap" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <svg viewBox={`0 0 ${width} ${height}`} className="radar-svg" style={{ maxWidth: `${width}px` }}>
        {/* Web circles / concentric grid */}
        {[0.25, 0.5, 0.75, 1].map((scale, sIdx) => {
          const pts = Array.from({ length: totalPoints }).map((_, i) => {
            const angle = (Math.PI * 2 / totalPoints) * i - Math.PI / 2;
            const r = maxR * scale;
            return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
          }).join(' ');
          return <polygon key={sIdx} points={pts} className="radar-web-circle" />;
        })}

        {/* Axis radial lines */}
        {Array.from({ length: totalPoints }).map((_, i) => {
          const angle = (Math.PI * 2 / totalPoints) * i - Math.PI / 2;
          const x2 = cx + maxR * Math.cos(angle);
          const y2 = cy + maxR * Math.sin(angle);
          return <line key={i} x1={cx} y1={cy} x2={x2} y2={y2} className="radar-axis-line" />;
        })}

        {/* Data polygon */}
        <polygon points={polygonPoints} className="radar-data-polygon" />

        {/* Dimension data vertices */}
        {radarDimensions.map((d, i) => {
          const { x, y } = getCoord(d.value, i);
          return (
            <circle
              key={`dot-${i}`}
              cx={x}
              cy={y}
              r="3.5"
              fill="#6366f1"
              stroke="#ffffff"
              strokeWidth="1.5"
            />
          );
        })}

        {/* Outer text labels */}
        {radarDimensions.map((d, i) => {
          const angle = (Math.PI * 2 / totalPoints) * i - Math.PI / 2;
          const labelR = maxR + 20;
          const lx = cx + labelR * Math.cos(angle);
          const ly = cy + labelR * Math.sin(angle) + 4;
          return (
            <text key={i} x={lx} y={ly} className="radar-label-text">
              {d.label}
            </text>
          );
        })}
      </svg>

      {/* Legend / Breakdown Pills */}
      {mode === 'skills' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '6px',
          width: '100%',
          marginTop: '10px'
        }}>
          {radarDimensions.map((d) => (
            <div
              key={d.label}
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))',
                borderRadius: '8px',
                padding: '6px 8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center'
              }}
            >
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                {d.label}
              </span>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#6366f1' }}>
                {d.rawPct}%
              </span>
              {d.count && (
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                  {d.count}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
