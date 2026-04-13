import React from 'react';
import { useStore } from '../store';

const SKILL_DEF = [
  { id: 'fit1', name: 'Athletics Base', desc: 'Consistency in physical activity', icon: '🏃', reqs: [], category: 'Physical' },
  { id: 'fit2', name: 'Marathoner', desc: 'Endurance training', icon: '👟', reqs: ['fit1'], category: 'Physical' },
  { id: 'fit3', name: 'Iron Body', desc: 'Heavy strength training', icon: '💪', reqs: ['fit1'], category: 'Physical' },
  
  { id: 'mind1', name: 'Mindfulness', desc: 'Daily 10min meditation', icon: '🧘', reqs: [], category: 'Mental' },
  { id: 'mind2', name: 'Unbreakable Focus', desc: 'Deep work for 2+ hours', icon: '🧠', reqs: ['mind1'], category: 'Mental' },
  
  { id: 'tech1', name: 'Code Initiate', desc: 'Understand basics of JS/React', icon: '💻', reqs: [], category: 'Career' },
  { id: 'tech2', name: 'System Architect', desc: 'Build complex fullstack apps', icon: '⚙️', reqs: ['tech1', 'mind2'], category: 'Career' }
];

export default function SkillTree() {
  const unlocked = useStore(state => state.skills);
  const setUnlocked = useStore(state => state.setSkills);

  const isUnlocked = (id) => unlocked.includes(id);

  const canUnlock = (node) => {
    if (isUnlocked(node.id)) return false;
    // Check if ALL requirements are unlocked
    return node.reqs.every(reqId => isUnlocked(reqId));
  };

  const handleNodeClick = (node) => {
    if (isUnlocked(node.id)) {
      // Opt to lock node and children - complex logic, skipping for simple mockup.
      alert('This skill is already unlocked!');
      return;
    }
    if (canUnlock(node)) {
      setUnlocked([...unlocked, node.id]);
    } else {
      alert('You have not met the prerequisites to unlock this skill.');
    }
  };

  const renderNode = (node) => {
    const unlockedState = isUnlocked(node.id);
    const availableState = canUnlock(node);
    
    let borderCol = 'var(--border-color)';
    let bg = 'var(--bg-card)';
    let textOpacity = 1;

    if (unlockedState) {
      borderCol = 'var(--primary)';
      bg = 'rgba(212, 143, 72, 0.1)';
    } else if (availableState) {
      borderCol = 'var(--text-muted)';
      bg = 'rgba(255,255,255,0.05)';
    } else {
      borderCol = 'var(--bg-main)';
      textOpacity = 0.4;
    }

    return (
      <div 
        key={node.id}
        onClick={() => handleNodeClick(node)}
        style={{
          border: `2px solid ${borderCol}`,
          background: bg,
          padding: '16px',
          borderRadius: '8px',
          cursor: availableState ? 'pointer' : (unlockedState ? 'default' : 'not-allowed'),
          opacity: textOpacity,
          transition: 'all var(--transition-fast)',
          width: '240px',
          boxShadow: unlockedState ? '0 0 15px rgba(212, 143, 72, 0.15)' : 'none',
          position: 'relative'
        }}
        onMouseOver={e => availableState && (e.currentTarget.style.transform = 'translateY(-2px)')}
        onMouseOut={e => availableState && (e.currentTarget.style.transform = 'translateY(0)')}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{ fontSize: '1.5rem', background: 'rgba(0,0,0,0.3)', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }}>
            {node.icon}
          </div>
          <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem', lineHeight: 1.2 }}>{node.name}</div>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{node.desc}</div>
        
        {/* Requirements Tag */}
        {node.reqs.length > 0 && !unlockedState && (
           <div style={{ marginTop: '12px', fontSize: '0.7rem', color: availableState ? 'var(--blue-text)' : 'var(--red-text)' }}>
             Reqs: {node.reqs.map(rId => SKILL_DEF.find(s => s.id === rId).name).join(', ')}
           </div>
        )}
      </div>
    );
  };

  const tiers = [[], [], []];
  SKILL_DEF.forEach(node => {
     if (node.reqs.length === 0) tiers[0].push(node);
     else if (node.reqs.length === 1 && SKILL_DEF.find(n => n.id === node.reqs[0]).reqs.length === 0) tiers[1].push(node);
     else tiers[2].push(node);
  });

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Skill Progression</h1>
        <p style={{ color: 'var(--text-muted)' }}>Unlock your potential. Prerequisites must be completed first.</p>
      </div>

      <div className="notion-block" style={{ overflowX: 'auto', padding: '40px' }}>
        <div style={{ display: 'flex', gap: '60px', minWidth: '800px' }}>
          
          {/* Column Tiers */}
          {tiers.map((tierNodes, idx) => (
             <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '30px', alignItems: 'center', position: 'relative' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '20px' }}>
                  Hierarchy Level {idx + 1}
                </div>
                {tierNodes.map(node => renderNode(node))}
             </div>
          ))}

        </div>
      </div>
    </div>
  );
}
