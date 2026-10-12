import React, { useEffect } from 'react';
import { useStore } from '../../store';
import { playLevelUpSound } from '../../services/soundService';

export default function RankUpCelebrationModal() {
  const recentRankUp = useStore((state) => state.recentRankUp);
  const dismissRankUp = useStore((state) => state.dismissRankUp);

  useEffect(() => {
    if (recentRankUp) {
      playLevelUpSound();
    }
  }, [recentRankUp]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && recentRankUp) {
        dismissRankUp();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [recentRankUp, dismissRankUp]);

  if (!recentRankUp) return null;

  const { oldRank, newRank } = recentRankUp;

  return (
    <div className="rank-up-overlay" onClick={dismissRankUp}>
      <div className="rank-up-card" onClick={(e) => e.stopPropagation()} style={{ '--rank-color': newRank.color, '--rank-glow': newRank.glowColor }}>
        {/* Glow halo */}
        <div className="rank-up-glow-halo" />

        <div className="rank-up-badge-top">
          <span className="rank-up-pulsing-icon">{newRank.badge}</span>
        </div>

        <div className="rank-up-tag">RANK ASCENSION ACHIEVED</div>
        <h1 className="rank-up-title">
          RANK {newRank.rank}
        </h1>
        <h2 className="rank-up-name">{newRank.title}</h2>
        <p className="rank-up-subtitle">{newRank.subtitle}</p>

        {/* Transition Pills */}
        <div className="rank-up-transition-row">
          <div className="rank-transition-chip old">
            <span className="chip-label">Previous</span>
            <span className="chip-val">Rank {oldRank.rank}</span>
          </div>
          <div className="rank-transition-arrow">➔</div>
          <div className="rank-transition-chip new" style={{ borderColor: newRank.color, color: newRank.color }}>
            <span className="chip-label">New Standing</span>
            <span className="chip-val">Rank {newRank.rank}</span>
          </div>
        </div>

        {/* Unlocked Perks */}
        <div className="rank-up-perks-box">
          <div className="rank-up-perk-header">🌟 UNLOCKED RANK PERKS</div>
          <div className="rank-up-perk-content">
            <div className="rank-up-perk-row">
              <span className="perk-bullet">⚡</span>
              <span>XP Multiplier upgraded to <b>{newRank.multiplier}x</b> on all completed habits & quests</span>
            </div>
            <div className="rank-up-perk-row">
              <span className="perk-bullet">🛡️</span>
              <span>Perk: <b>{newRank.perk}</b></span>
            </div>
          </div>
        </div>

        <div className="rank-up-lore">"{newRank.lore}"</div>

        <button className="rank-up-confirm-btn" onClick={dismissRankUp} style={{ background: newRank.color, boxShadow: `0 0 20px ${newRank.glowColor}` }}>
          Claim Ascension & Continue
        </button>
      </div>

      <style>{`
        .rank-up-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.82);
          backdrop-filter: blur(12px);
          z-index: 10001;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: rankUpPop 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        @keyframes rankUpPop {
          from { opacity: 0; transform: scale(0.85); }
          to { opacity: 1; transform: scale(1); }
        }

        .rank-up-card {
          position: relative;
          background: var(--bg-card, #121215);
          border: 2px solid var(--rank-color, #d48f48);
          border-radius: 20px;
          padding: 36px 32px 30px;
          max-width: 480px;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          box-shadow: 0 0 50px var(--rank-glow, rgba(212, 143, 72, 0.4)), 0 25px 70px rgba(0, 0, 0, 0.8);
          overflow: hidden;
          color: #fff;
        }

        .rank-up-glow-halo {
          position: absolute;
          top: -80px;
          left: 50%;
          transform: translateX(-50%);
          width: 260px;
          height: 260px;
          background: radial-gradient(circle, var(--rank-glow, rgba(212, 143, 72, 0.35)) 0%, transparent 70%);
          pointer-events: none;
        }

        .rank-up-badge-top {
          margin-bottom: 12px;
        }

        .rank-up-pulsing-icon {
          font-size: 3.5rem;
          display: inline-block;
          animation: rankPulse 2s infinite ease-in-out;
        }

        @keyframes rankPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); filter: drop-shadow(0 0 15px var(--rank-color)); }
        }

        .rank-up-tag {
          font-size: 0.72rem;
          letter-spacing: 2.5px;
          font-weight: 800;
          color: var(--rank-color);
          text-transform: uppercase;
        }

        .rank-up-title {
          margin: 6px 0 2px;
          font-size: 2.8rem;
          font-weight: 900;
          letter-spacing: 2px;
          text-shadow: 0 0 20px var(--rank-color);
        }

        .rank-up-name {
          margin: 0;
          font-size: 1.4rem;
          font-weight: 800;
          color: #fff;
        }

        .rank-up-subtitle {
          margin: 4px 0 16px;
          color: #a1a1aa;
          font-size: 0.9rem;
        }

        .rank-up-transition-row {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 18px;
        }

        .rank-transition-chip {
          display: flex;
          flex-direction: column;
          padding: 6px 14px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.15);
          background: rgba(255, 255, 255, 0.04);
        }

        .rank-transition-chip.old {
          opacity: 0.6;
        }

        .chip-label {
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #a1a1aa;
        }

        .chip-val {
          font-size: 0.95rem;
          font-weight: 800;
        }

        .rank-transition-arrow {
          color: var(--rank-color);
          font-size: 1.2rem;
          font-weight: bold;
        }

        .rank-up-perks-box {
          width: 100%;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 14px 16px;
          margin-bottom: 16px;
          text-align: left;
        }

        .rank-up-perk-header {
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 1px;
          color: var(--rank-color);
          margin-bottom: 8px;
        }

        .rank-up-perk-content {
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 0.85rem;
          color: #e4e4e7;
        }

        .rank-up-perk-row {
          display: flex;
          gap: 8px;
          align-items: flex-start;
        }

        .perk-bullet {
          flex-shrink: 0;
        }

        .rank-up-lore {
          font-style: italic;
          font-size: 0.8rem;
          color: #71717a;
          margin-bottom: 20px;
          line-height: 1.4;
        }

        .rank-up-confirm-btn {
          width: 100%;
          padding: 14px 20px;
          border-radius: 12px;
          border: none;
          color: #fff;
          font-size: 1rem;
          font-weight: 800;
          letter-spacing: 0.5px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .rank-up-confirm-btn:hover {
          filter: brightness(1.15);
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
}
