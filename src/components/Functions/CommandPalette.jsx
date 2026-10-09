import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import { playCyberClick, playSuccess, isSoundEnabled, setSoundEnabled } from '../../services/soundService';
import '../Styles/CommandPalette.css';

export default function CommandPalette({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const overviewSettings = useStore(state => state.overviewSettings) || {};
  const setOverviewSettings = useStore(state => state.setOverviewSettings);
  const addXP = useStore(state => state.addXP);
  const profile = useStore(state => state.profile) || {};
  const setProfile = useStore(state => state.setProfile);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const commands = useMemo(() => {
    const list = [
      // Quick Navigation
      { category: 'Navigation', id: 'nav-overview', title: 'Home', subtitle: 'Main Command Center & Timetable', icon: '🏠', shortcut: 'G H', action: () => navigate('/') },
      { category: 'Navigation', id: 'nav-timetable', title: 'Timetable & Routine', subtitle: 'Daily schedule & time blocks', icon: '📅', shortcut: 'G T', action: () => navigate('/timetable') },
      { category: 'Navigation', id: 'nav-habits', title: 'Habit Tracker', subtitle: 'Daily discipline & streak system', icon: '✨', shortcut: 'G D', action: () => navigate('/habits') },
      { category: 'Navigation', id: 'nav-sport', title: 'Sport & Workouts', subtitle: 'Biomechanics, logs & routines', icon: '🏋️', shortcut: 'G W', action: () => navigate('/sport') },
      { category: 'Navigation', id: 'nav-expenses', title: 'Finance & Wallet', subtitle: 'Budgeting, transactions & assets', icon: '💳', shortcut: 'G F', action: () => navigate('/expenses') },
      { category: 'Navigation', id: 'nav-trading', title: 'Trading Terminal', subtitle: 'Crypto, stocks & market watchlist', icon: '📈', shortcut: 'G M', action: () => navigate('/trading') },
      { category: 'Navigation', id: 'nav-goals', title: 'Goal Planner', subtitle: 'Weekly, monthly & annual goals', icon: '🎯', shortcut: 'G G', action: () => navigate('/goals') },
      { category: 'Navigation', id: 'nav-targets', title: 'Big Targets', subtitle: 'Major life milestones & achievements', icon: '🏆', shortcut: 'G B', action: () => navigate('/targets') },
      { category: 'Navigation', id: 'nav-fridge', title: 'Fridge Nutrition', subtitle: 'Ingredient inventory & recipes', icon: '🥗', shortcut: 'G N', action: () => navigate('/fridge') },
      { category: 'Navigation', id: 'nav-assistant', title: 'AI Assistant', subtitle: 'Local AI chat & neural routing', icon: '🤖', shortcut: 'G A', action: () => navigate('/assistant') },
      { category: 'Navigation', id: 'nav-canvas', title: 'Project Canvas', subtitle: 'Infinite node graph & mind mapping', icon: '🗺️', shortcut: 'G C', action: () => navigate('/canvas') },
      { category: 'Navigation', id: 'nav-journal', title: 'Daily Journal', subtitle: 'Reflections & private logs', icon: '📝', shortcut: 'G J', action: () => navigate('/journal') },
      { category: 'Navigation', id: 'nav-books', title: 'Library & Books', subtitle: 'Reading tracker & summaries', icon: '📚', shortcut: 'G L', action: () => navigate('/books') },
      { category: 'Navigation', id: 'nav-movies', title: 'Cinema & Media', subtitle: 'Movies, anime & series watchlist', icon: '🎬', shortcut: 'G S', action: () => navigate('/movies') },
      { category: 'Navigation', id: 'nav-skills', title: 'RPG Skill Tree', subtitle: 'Character development & stats', icon: '🛡️', shortcut: 'G K', action: () => navigate('/skills') },
      { category: 'Navigation', id: 'nav-profile', title: 'System Settings', subtitle: 'Profile, credentials & sync options', icon: '⚙️', shortcut: 'G P', action: () => navigate('/profile') },

      // Quick Actions
      {
        category: 'Quick Actions',
        id: 'act-privacy',
        title: overviewSettings?.isPrivacyMode ? 'Disable Privacy Mode' : 'Enable Privacy Mode',
        subtitle: 'Mask financial amounts with bullet dots (•••• €)',
        icon: '👁️',
        shortcut: 'Cmd+P',
        action: () => {
          setOverviewSettings({ ...overviewSettings, isPrivacyMode: !overviewSettings?.isPrivacyMode });
          playCyberClick();
        }
      },
      {
        category: 'Quick Actions',
        id: 'act-home-layout',
        title: 'Home Dashboard & Layout Studio',
        subtitle: 'Configure widgets, columns, themes & HUD in Settings',
        icon: '📐',
        action: () => {
          navigate('/settings?tab=layout');
          playCyberClick();
        }
      },
      {
        category: 'Quick Actions',
        id: 'act-sound',
        title: isSoundEnabled() ? 'Mute Sound FX' : 'Enable Sound FX',
        subtitle: 'Toggle procedural cyberpunk synthesizer audio',
        icon: isSoundEnabled() ? '🔊' : '🔇',
        shortcut: 'Alt+S',
        action: () => {
          const next = !isSoundEnabled();
          setSoundEnabled(next);
          playCyberClick();
        }
      },
      {
        category: 'Quick Actions',
        id: 'act-preset-focus',
        title: 'Switch to Deep Work Preset',
        subtitle: 'Timetable, Pomodoro, Notes & Goals focus',
        icon: '🎯',
        action: () => {
          setOverviewSettings({ ...overviewSettings, activePreset: 'focus' });
          navigate('/');
          playCyberClick();
        }
      },
      {
        category: 'Quick Actions',
        id: 'act-preset-all',
        title: 'Switch to All-in-One Preset',
        subtitle: 'Show all enabled widgets on dashboard',
        icon: '🌟',
        action: () => {
          setOverviewSettings({ ...overviewSettings, activePreset: 'all' });
          navigate('/');
          playCyberClick();
        }
      },
      {
        category: 'Quick Actions',
        id: 'act-backup',
        title: 'Export Local Data Backup',
        subtitle: 'Download complete offline JSON backup',
        icon: '📥',
        action: () => {
          const state = useStore.getState();
          const backupData = JSON.stringify(state, null, 2);
          const blob = new Blob([backupData], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `EOM_Backup_${new Date().toISOString().split('T')[0]}.json`;
          a.click();
          URL.revokeObjectURL(url);
          playCyberClick();
        }
      }
    ];

    return list;
  }, [navigate, overviewSettings, setOverviewSettings]);

  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.subtitle.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q)
    );
  }, [commands, query]);

  // Handle keyboard arrows and Enter
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % (filtered.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + (filtered.length || 1)) % (filtered.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
        onClose();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  // Scroll selected into view
  useEffect(() => {
    if (listRef.current) {
      const selectedEl = listRef.current.querySelector('.command-item.selected');
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="command-palette-overlay" onClick={onClose}>
      <div className="command-palette-modal" onClick={e => e.stopPropagation()}>
        <div className="command-search-box">
          <span className="command-search-icon">⚡</span>
          <input
            ref={inputRef}
            type="text"
            className="command-search-input"
            placeholder="Type a command, module name, or action..."
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
          />
          <span className="command-esc-badge">ESC</span>
        </div>

        <div className="command-results-list" ref={listRef}>
          {filtered.map((item, idx) => (
            <div
              key={item.id}
              className={`command-item ${idx === selectedIndex ? 'selected' : ''}`}
              onClick={() => {
                item.action();
                onClose();
              }}
              onMouseEnter={() => setSelectedIndex(idx)}
            >
              <div className="command-item-left">
                <span className="command-item-icon">{item.icon}</span>
                <div>
                  <div className="command-item-title">{item.title}</div>
                  <div className="command-item-subtitle">{item.subtitle}</div>
                </div>
              </div>
              {item.shortcut && <span className="command-item-shortcut">{item.shortcut}</span>}
            </div>
          ))}

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No matching commands or actions found for "{query}".
            </div>
          )}
        </div>

        <div className="command-palette-footer">
          <div className="command-footer-keys">
            <span className="command-footer-key"><kbd>↑</kbd><kbd>↓</kbd> Navigate</span>
            <span className="command-footer-key"><kbd>↵</kbd> Select</span>
            <span className="command-footer-key"><kbd>esc</kbd> Close</span>
          </div>
          <div>E.O.M Cyber Command</div>
        </div>
      </div>
    </div>
  );
}
