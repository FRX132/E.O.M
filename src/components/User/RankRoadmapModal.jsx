import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../../store';
import { RANK_TIERS, calculateRank } from '../../services/rankingService';
import { calculatePerformanceState } from '../../services/aiAgentService';

export default function RankRoadmapModal({ isOpen, onClose }) {
  const xp = useStore((state) => state.profile?.xp || 0);
  const fullStoreState = useStore();
  const [selectedTier, setSelectedTier] = useState(null);

  const rankStats = useMemo(() => calculateRank(xp), [xp]);
  const perfState = useMemo(() => {
    try {
      return calculatePerformanceState(fullStoreState);
    } catch {
      return null;
    }
  }, [fullStoreState]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentTier = rankStats.currentRank;
  const nextTier = rankStats.nextRank;
  const activeDetailTier = selectedTier || currentTier;

  return (
    <div className="rank-roadmap-overlay" onClick={onClose}>
      <div className="rank-roadmap-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="rank-modal-header">
          <div className="rank-modal-header-left">
            <span className="rank-header-badge" style={{ borderColor: currentTier.color, boxShadow: `0 0 15px ${currentTier.glowColor}` }}>
              {currentTier.badge}
            </span>
            <div>
              <div className="rank-modal-tag">HUNTER PROGRESSION SYSTEM</div>
              <h2 className="rank-modal-title">
                Rank {currentTier.rank} <span style={{ color: currentTier.color }}>• {currentTier.title}</span>
              </h2>
            </div>
          </div>
          <button className="rank-modal-close-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {/* Current Status Hero */}
        <div className="rank-hero-card" style={{ borderColor: `${currentTier.color}40` }}>
          <div className="rank-hero-top">
            <div className="rank-hero-avatar-wrap">
              <div
                className="rank-hero-emblem"
                style={{
                  color: currentTier.color,
                  borderColor: currentTier.color,
                  boxShadow: `0 0 25px ${currentTier.glowColor}`
                }}
              >
                {currentTier.rank}
              </div>
              <div className="rank-hero-subbadge">{currentTier.badge}</div>
            </div>

            <div className="rank-hero-info">
              <div className="rank-hero-title-row">
                <h3>{currentTier.title}</h3>
                <span className="rank-tier-pill" style={{ background: `${currentTier.color}20`, color: currentTier.color, borderColor: currentTier.color }}>
                  Tier {rankStats.rankIndex + 1} of {RANK_TIERS.length}
                </span>
              </div>
              <p className="rank-hero-subtitle">{currentTier.subtitle}</p>
              <div className="rank-hero-lore">"{currentTier.lore}"</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="rank-progress-block">
            <div className="rank-progress-labels">
              <span>Current Mastery: <b>{xp.toLocaleString()} XP</b></span>
              <span>
                {nextTier ? (
                  <>Next Rank ({nextTier.rank}): <b>{nextTier.minXp.toLocaleString()} XP</b></>
                ) : (
                  <b>Apex Standing (Max Rank)</b>
                )}
              </span>
            </div>
            <div className="rank-progress-track">
              <div
                className="rank-progress-fill"
                style={{
                  width: `${rankStats.progress}%`,
                  background: `linear-gradient(90deg, ${currentTier.color}, ${nextTier ? nextTier.color : currentTier.color})`,
                  boxShadow: `0 0 12px ${currentTier.color}`
                }}
              />
            </div>
            <div className="rank-progress-subtext">
              {nextTier ? (
                <>
                  <span><b>{rankStats.progress.toFixed(1)}%</b> completed</span>
                  <span>{(nextTier.minXp - xp).toLocaleString()} XP needed for <b>Rank {nextTier.rank} ({nextTier.title})</b></span>
                </>
              ) : (
                <span>Transcendent Status Achieved — Absolute Sovereign</span>
              )}
            </div>
          </div>

          {/* Quick Perks Bar */}
          <div className="rank-perks-grid">
            <div className="rank-perk-item">
              <div className="rank-perk-icon">⚡</div>
              <div>
                <div className="rank-perk-label">Active Multiplier</div>
                <div className="rank-perk-value" style={{ color: currentTier.color }}>{currentTier.multiplier}x All XP</div>
              </div>
            </div>
            <div className="rank-perk-item">
              <div className="rank-perk-icon">🛡️</div>
              <div>
                <div className="rank-perk-label">Rank Perk</div>
                <div className="rank-perk-value">{currentTier.perk}</div>
              </div>
            </div>
            {perfState && (
              <div className="rank-perk-item">
                <div className="rank-perk-icon">🎯</div>
                <div>
                  <div className="rank-perk-label">Daily Execution Index</div>
                  <div className="rank-perk-value" style={{ color: perfState.tierColor }}>
                    {perfState.score} / 10 ({perfState.rankLabel})
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Selected Tier Inspector (if inspecting another tier) */}
        {activeDetailTier && activeDetailTier.rank !== currentTier.rank && (
          <div className="tier-inspector-card" style={{ borderColor: `${activeDetailTier.color}40` }}>
            <div className="tier-inspector-header">
              <span style={{ fontSize: '1.4rem' }}>{activeDetailTier.badge}</span>
              <div>
                <span className="inspector-badge" style={{ color: activeDetailTier.color }}>
                  PREVIEW: RANK {activeDetailTier.rank} • {activeDetailTier.title}
                </span>
                <p className="inspector-subtitle">{activeDetailTier.subtitle}</p>
              </div>
              <span className="inspector-xp-req">Req: {activeDetailTier.minXp.toLocaleString()} XP</span>
            </div>
            <div className="inspector-perk-row">
              <span><b>Perk:</b> {activeDetailTier.perk} ({activeDetailTier.multiplier}x Multiplier)</span>
            </div>
            <p className="inspector-lore">"{activeDetailTier.lore}"</p>
          </div>
        )}

        {/* Full Rank Ladder */}
        <div className="rank-ladder-section">
          <div className="rank-ladder-header">
            <h4>Complete Hunter Hierarchy</h4>
            <span className="rank-ladder-hint">Click any tier to inspect requirements & lore</span>
          </div>

          <div className="rank-ladder-list">
            {RANK_TIERS.map((tier, index) => {
              const isCurrent = tier.rank === currentTier.rank;
              const isUnlocked = xp >= tier.minXp;
              const isSelected = activeDetailTier?.rank === tier.rank;

              return (
                <div
                  key={tier.rank}
                  className={`rank-tier-row ${isCurrent ? 'current' : ''} ${isUnlocked ? 'unlocked' : 'locked'} ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedTier(tier)}
                  style={{
                    '--tier-color': tier.color,
                    borderColor: isCurrent ? tier.color : undefined
                  }}
                >
                  <div className="tier-row-left">
                    <span className="tier-row-index">#{index + 1}</span>
                    <div
                      className="tier-row-badge"
                      style={{
                        color: isUnlocked ? tier.color : 'var(--text-muted)',
                        borderColor: isUnlocked ? tier.color : 'var(--border-color)',
                        background: isCurrent ? `${tier.color}25` : undefined
                      }}
                    >
                      {tier.rank}
                    </div>
                    <div className="tier-row-titles">
                      <div className="tier-row-name">
                        <span>{tier.badge}</span>
                        <span className="tier-row-title-text">{tier.title}</span>
                      </div>
                      <span className="tier-row-subtitle">{tier.subtitle}</span>
                    </div>
                  </div>

                  <div className="tier-row-middle">
                    <span className="tier-row-perk-badge" style={{ color: isUnlocked ? tier.color : 'var(--text-muted)' }}>
                      {tier.multiplier}x XP
                    </span>
                    <span className="tier-row-perk-desc">{tier.perk}</span>
                  </div>

                  <div className="tier-row-right">
                    <div className="tier-row-xp">{tier.minXp.toLocaleString()} XP</div>
                    {isCurrent ? (
                      <span className="tier-status-pill current" style={{ background: tier.color, color: '#fff' }}>
                        ACTIVE
                      </span>
                    ) : isUnlocked ? (
                      <span className="tier-status-pill unlocked">UNLOCKED</span>
                    ) : (
                      <span className="tier-status-pill locked">LOCKED</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="rank-modal-footer">
          <div className="rank-footer-stats">
            <span>Overall Hunter Level: <b>{Math.floor(xp / 10000) + 1}</b></span>
            <span>Total XP: <b>{xp.toLocaleString()}</b></span>
          </div>
          <button className="notion-btn" onClick={onClose} style={{ minWidth: '120px' }}>
            Close
          </button>
        </div>
      </div>

      <style>{`
        .rank-roadmap-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(8px);
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: rankFadeIn 0.25s ease-out;
        }

        @keyframes rankFadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }

        .rank-roadmap-modal {
          background: var(--bg-card, #121214);
          border: 1px solid var(--border-color, rgba(255, 255, 255, 0.12));
          border-radius: 16px;
          max-width: 860px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.7);
          display: flex;
          flex-direction: column;
          color: var(--text-main, #f4f4f5);
        }

        .rank-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 28px 20px;
          border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
        }

        .rank-modal-header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .rank-header-badge {
          font-size: 1.8rem;
          width: 50px;
          height: 50px;
          border-radius: 12px;
          border: 2px solid;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.04);
        }

        .rank-modal-tag {
          font-size: 0.7rem;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: var(--text-muted, #71717a);
          font-weight: 700;
        }

        .rank-modal-title {
          margin: 4px 0 0 0;
          font-size: 1.4rem;
          font-weight: 800;
        }

        .rank-modal-close-btn {
          background: transparent;
          border: 1px solid var(--border-color, rgba(255,255,255,0.1));
          color: var(--text-muted, #a1a1aa);
          width: 36px;
          height: 36px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .rank-modal-close-btn:hover {
          color: #fff;
          border-color: #fff;
          background: rgba(255, 255, 255, 0.1);
        }

        .rank-hero-card {
          margin: 20px 28px 12px;
          padding: 22px;
          border-radius: 14px;
          border: 1px solid;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.03), rgba(0, 0, 0, 0.2));
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .rank-hero-top {
          display: flex;
          gap: 20px;
          align-items: center;
        }

        .rank-hero-avatar-wrap {
          position: relative;
        }

        .rank-hero-emblem {
          width: 72px;
          height: 72px;
          border-radius: 16px;
          border: 2.5px solid;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.2rem;
          font-weight: 900;
          background: rgba(0, 0, 0, 0.4);
        }

        .rank-hero-subbadge {
          position: absolute;
          bottom: -6px;
          right: -6px;
          font-size: 1.1rem;
          background: var(--bg-card, #18181b);
          border-radius: 50%;
          width: 26px;
          height: 26px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--border-color, rgba(255,255,255,0.2));
        }

        .rank-hero-info {
          flex: 1;
        }

        .rank-hero-title-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .rank-hero-title-row h3 {
          margin: 0;
          font-size: 1.35rem;
          font-weight: 800;
        }

        .rank-tier-pill {
          font-size: 0.72rem;
          padding: 2px 10px;
          border-radius: 20px;
          border: 1px solid;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .rank-hero-subtitle {
          margin: 4px 0 6px 0;
          color: var(--text-muted, #a1a1aa);
          font-size: 0.88rem;
        }

        .rank-hero-lore {
          font-style: italic;
          color: var(--text-muted, #71717a);
          font-size: 0.82rem;
          line-height: 1.4;
        }

        .rank-progress-block {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .rank-progress-labels {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          color: var(--text-muted, #a1a1aa);
        }

        .rank-progress-track {
          height: 9px;
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.08);
          overflow: hidden;
        }

        .rank-progress-fill {
          height: 100%;
          border-radius: 6px;
          transition: width 0.4s ease;
        }

        .rank-progress-subtext {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: var(--text-muted, #71717a);
        }

        .rank-perks-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
          gap: 12px;
          padding-top: 6px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }

        .rank-perk-item {
          display: flex;
          gap: 10px;
          align-items: center;
          background: rgba(255, 255, 255, 0.03);
          padding: 8px 12px;
          border-radius: 8px;
        }

        .rank-perk-icon {
          font-size: 1.2rem;
        }

        .rank-perk-label {
          font-size: 0.7rem;
          text-transform: uppercase;
          color: var(--text-muted, #71717a);
          letter-spacing: 0.5px;
          font-weight: 600;
        }

        .rank-perk-value {
          font-size: 0.82rem;
          font-weight: 700;
        }

        .tier-inspector-card {
          margin: 0 28px 12px;
          padding: 14px 18px;
          border-radius: 10px;
          border: 1px solid;
          background: rgba(255, 255, 255, 0.02);
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .tier-inspector-header {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .inspector-badge {
          font-size: 0.78rem;
          font-weight: 800;
          letter-spacing: 0.8px;
        }

        .inspector-subtitle {
          margin: 2px 0 0;
          font-size: 0.78rem;
          color: var(--text-muted, #a1a1aa);
        }

        .inspector-xp-req {
          margin-left: auto;
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-muted, #a1a1aa);
        }

        .inspector-perk-row {
          font-size: 0.82rem;
        }

        .inspector-lore {
          margin: 0;
          font-style: italic;
          font-size: 0.78rem;
          color: var(--text-muted, #71717a);
        }

        .rank-ladder-section {
          padding: 8px 28px 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .rank-ladder-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .rank-ladder-header h4 {
          margin: 0;
          font-size: 1rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .rank-ladder-hint {
          font-size: 0.75rem;
          color: var(--text-muted, #71717a);
        }

        .rank-ladder-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-height: 380px;
          overflow-y: auto;
          padding-right: 4px;
        }

        .rank-tier-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          border-radius: 10px;
          border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
          background: rgba(255, 255, 255, 0.02);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .rank-tier-row:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .rank-tier-row.current {
          background: rgba(255, 255, 255, 0.05);
          box-shadow: 0 0 15px rgba(255, 255, 255, 0.05);
        }

        .rank-tier-row.selected {
          border-color: var(--tier-color);
        }

        .rank-tier-row.locked {
          opacity: 0.7;
        }

        .tier-row-left {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 220px;
        }

        .tier-row-index {
          font-size: 0.75rem;
          color: var(--text-muted, #71717a);
          font-weight: 700;
          width: 24px;
        }

        .tier-row-badge {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          border: 1.5px solid;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 1rem;
        }

        .tier-row-titles {
          display: flex;
          flex-direction: column;
        }

        .tier-row-name {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.9rem;
          font-weight: 700;
        }

        .tier-row-subtitle {
          font-size: 0.72rem;
          color: var(--text-muted, #71717a);
        }

        .tier-row-middle {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          flex: 1;
          padding: 0 16px;
        }

        .tier-row-perk-badge {
          font-size: 0.76rem;
          font-weight: 800;
          letter-spacing: 0.5px;
        }

        .tier-row-perk-desc {
          font-size: 0.72rem;
          color: var(--text-muted, #a1a1aa);
        }

        .tier-row-right {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .tier-row-xp {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-muted, #a1a1aa);
        }

        .tier-status-pill {
          font-size: 0.68rem;
          font-weight: 800;
          padding: 3px 8px;
          border-radius: 12px;
          letter-spacing: 0.5px;
        }

        .tier-status-pill.unlocked {
          background: rgba(34, 197, 94, 0.15);
          color: #22c55e;
          border: 1px solid rgba(34, 197, 94, 0.3);
        }

        .tier-status-pill.locked {
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-muted, #71717a);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .rank-modal-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 28px;
          border-top: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
          background: rgba(0, 0, 0, 0.2);
        }

        .rank-footer-stats {
          display: flex;
          gap: 20px;
          font-size: 0.85rem;
          color: var(--text-muted, #a1a1aa);
        }

        @media (max-width: 768px) {
          .tier-row-middle {
            display: none;
          }
          .rank-perks-grid {
            grid-template-columns: 1fr;
          }
          .rank-modal-header {
            padding: 16px 20px;
          }
          .rank-hero-card {
            margin: 16px 20px;
          }
          .rank-ladder-section {
            padding: 8px 20px 16px;
          }
        }
      `}</style>
    </div>
  );
}
