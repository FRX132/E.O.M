import React from 'react';
import { useStore } from '../../store';
import { SKILL_DEF } from '../../constants';

export default function SkillQuestDrawer({ isOpen, onClose, onSelectSkill }) {
  const activeQuests = useStore((state) => state.activeQuests || []);
  const updateQuestProgress = useStore((state) => state.updateQuestProgress);
  const completeQuest = useStore((state) => state.completeQuest);
  const addXP = useStore((state) => state.addXP);
  const unlockedSkills = useStore((state) => state.skills || []);

  if (!isOpen) return null;

  const handleAdvanceQuest = (skillId) => {
    updateQuestProgress(skillId);
    addXP(100);
  };

  const handleInstantComplete = (skillId) => {
    completeQuest(skillId);
    addXP(250);
  };

  return (
    <div className="quest-drawer-overlay" onClick={onClose}>
      <div className="quest-drawer-content" onClick={(e) => e.stopPropagation()}>
        <div className="quest-drawer-header">
          <div className="quest-drawer-title-wrap">
            <span style={{ fontSize: '1.4rem' }}>📜</span>
            <div>
              <h3>Active Hunter Quests</h3>
              <p>{activeQuests.length} {activeQuests.length === 1 ? 'quest' : 'quests'} in progress</p>
            </div>
          </div>
          <button className="quest-drawer-close" onClick={onClose} aria-label="Close Quest Log">
            ✕
          </button>
        </div>

        {/* Quest List */}
        <div className="quest-drawer-body">
          {activeQuests.length === 0 ? (
            <div className="quest-drawer-empty">
              <span className="quest-empty-icon">🎯</span>
              <h4>No Active Quests</h4>
              <p>Click on any available skill in the tree with fulfilled prerequisites to initiate an unlock quest!</p>
              <div className="quest-stats-badge">
                Mastered Skills: <b>{unlockedSkills.length}</b> / {SKILL_DEF.length}
              </div>
            </div>
          ) : (
            <div className="quest-list">
              {activeQuests.map((q) => {
                const skill = SKILL_DEF.find((s) => s.id === q.skillId);
                if (!skill) return null;

                const progressPct = Math.min(Math.round((q.progress / q.total) * 100), 100);
                const isReady = q.progress >= q.total;

                return (
                  <div key={q.skillId} className="quest-card">
                    <div className="quest-card-top">
                      <div className="quest-card-icon">{skill.icon}</div>
                      <div className="quest-card-info">
                        <div className="quest-card-cat">{skill.category}</div>
                        <h4
                          className="quest-card-name"
                          onClick={() => {
                            if (onSelectSkill) onSelectSkill(skill);
                            onClose();
                          }}
                          title="View on Skill Tree"
                        >
                          {skill.name} ❯
                        </h4>
                      </div>
                      <div className="quest-card-days">
                        {q.progress} / {q.total} Days
                      </div>
                    </div>

                    <div className="quest-card-desc">
                      <b>Objective:</b> {skill.quest || skill.habit}
                    </div>

                    {/* Progress Bar */}
                    <div className="quest-progress-track">
                      <div
                        className="quest-progress-fill"
                        style={{ width: `${progressPct}%`, background: isReady ? '#22c55e' : 'var(--primary)' }}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="quest-card-actions">
                      <button
                        className="quest-action-btn advance"
                        onClick={() => handleAdvanceQuest(q.skillId)}
                        disabled={isReady}
                      >
                        +1 Day Progress (+100 XP)
                      </button>

                      {isReady ? (
                        <button
                          className="quest-action-btn complete-ready"
                          onClick={() => handleInstantComplete(q.skillId)}
                        >
                          🎉 Claim Unlock!
                        </button>
                      ) : (
                        <button
                          className="quest-action-btn complete-quick"
                          onClick={() => handleInstantComplete(q.skillId)}
                          title="Instant completion with bonus XP"
                        >
                          Instant Finish
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="quest-drawer-footer">
          <div className="quest-footer-tip">
            💡 Completing quests unlocks linked automated daily habits and grants substantial rank XP.
          </div>
        </div>
      </div>

      <style>{`
        .quest-drawer-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(6px);
          z-index: 10000;
          display: flex;
          justify-content: flex-end;
          animation: drawerFade 0.2s ease-out;
        }

        @keyframes drawerFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .quest-drawer-content {
          background: var(--bg-card, #121215);
          border-left: 1px solid var(--border-color, rgba(255, 255, 255, 0.12));
          width: 440px;
          max-width: 90vw;
          height: 100vh;
          display: flex;
          flex-direction: column;
          box-shadow: -10px 0 40px rgba(0, 0, 0, 0.7);
          animation: drawerSlide 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          color: var(--text-main, #f4f4f5);
        }

        @keyframes drawerSlide {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }

        .quest-drawer-header {
          padding: 22px 24px;
          border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .quest-drawer-title-wrap {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .quest-drawer-title-wrap h3 {
          margin: 0;
          font-size: 1.15rem;
          font-weight: 800;
        }

        .quest-drawer-title-wrap p {
          margin: 2px 0 0;
          font-size: 0.75rem;
          color: var(--text-muted, #a1a1aa);
        }

        .quest-drawer-close {
          background: transparent;
          border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
          color: var(--text-muted, #a1a1aa);
          width: 32px;
          height: 32px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .quest-drawer-close:hover {
          color: #fff;
          border-color: #fff;
          background: rgba(255, 255, 255, 0.08);
        }

        .quest-drawer-body {
          flex: 1;
          padding: 20px 24px;
          overflow-y: auto;
        }

        .quest-drawer-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 60px 20px;
          gap: 12px;
        }

        .quest-empty-icon {
          font-size: 3rem;
          opacity: 0.8;
        }

        .quest-drawer-empty h4 {
          margin: 0;
          font-size: 1.2rem;
          font-weight: 700;
        }

        .quest-drawer-empty p {
          margin: 0;
          font-size: 0.85rem;
          color: var(--text-muted, #a1a1aa);
          line-height: 1.5;
        }

        .quest-stats-badge {
          margin-top: 16px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 0.8rem;
          color: var(--text-muted, #a1a1aa);
        }

        .quest-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .quest-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
          border-radius: 12px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          transition: all 0.2s;
        }

        .quest-card:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.15);
        }

        .quest-card-top {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .quest-card-icon {
          font-size: 1.6rem;
        }

        .quest-card-info {
          flex: 1;
        }

        .quest-card-cat {
          font-size: 0.68rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          color: var(--primary);
        }

        .quest-card-name {
          margin: 2px 0 0;
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          transition: color 0.2s;
        }
        .quest-card-name:hover {
          color: var(--primary);
        }

        .quest-card-days {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-muted, #a1a1aa);
        }

        .quest-card-desc {
          font-size: 0.82rem;
          color: var(--text-muted, #d4d4d8);
          line-height: 1.4;
        }

        .quest-progress-track {
          height: 6px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 4px;
          overflow: hidden;
        }

        .quest-progress-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .quest-card-actions {
          display: flex;
          gap: 8px;
          margin-top: 4px;
        }

        .quest-action-btn {
          flex: 1;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 0.78rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .quest-action-btn.advance {
          background: rgba(255, 255, 255, 0.08);
          color: #fff;
          border: 1px solid rgba(255, 255, 255, 0.12);
        }
        .quest-action-btn.advance:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.15);
        }
        .quest-action-btn.advance:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .quest-action-btn.complete-ready {
          background: #22c55e;
          color: #fff;
          box-shadow: 0 0 12px rgba(34, 197, 94, 0.4);
        }
        .quest-action-btn.complete-ready:hover {
          filter: brightness(1.15);
        }

        .quest-action-btn.complete-quick {
          background: transparent;
          border: 1px solid var(--border-color, rgba(255, 255, 255, 0.12));
          color: var(--text-muted, #a1a1aa);
          flex: 0.6;
        }
        .quest-action-btn.complete-quick:hover {
          color: #fff;
          border-color: #fff;
        }

        .quest-drawer-footer {
          padding: 16px 24px;
          border-top: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
          background: rgba(0, 0, 0, 0.2);
        }

        .quest-footer-tip {
          font-size: 0.76rem;
          color: var(--text-muted, #71717a);
          line-height: 1.4;
        }
      `}</style>
    </div>
  );
}
