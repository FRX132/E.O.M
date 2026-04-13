import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useCloudSync } from './hooks/useCloudSync';
import { useStore } from './store';
import './App.css';

// Components
import ExpenseTracker from './components/ExpenseTracker';
import GoalPlanner from './components/GoalPlanner';
import HabitTracker from './components/HabitTracker';
import FridgeStock from './components/FridgeStock';
import BigTargets from './components/BigTargets';
import ProfileSettings from './components/ProfileSettings';
import SkillTree from './components/SkillTree';
import Overview from './components/Overview';
import AppleReminders from './components/AppleReminders';

const BeakerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-beaker" viewBox="0 0 16 16">
    <path d="M9.5 3a.5.5 0 0 0 0 1H13V3zm2 2a.5.5 0 0 0 0 1H13V5zm-2 2a.5.5 0 0 0 0 1H13V7zm2 2a.5.5 0 0 0 0 1H13V9zm-2 2a.5.5 0 0 0 0 1H13v-1zm2 2a.5.5 0 0 0 0 1H13v-1z"/>
    <path d="M.5 0a.5.5 0 0 0-.354.854l.122.12A2.5 2.5 0 0 1 1 2.744V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V2.743a2.5 2.5 0 0 1 .732-1.768l.122-.121A.5.5 0 0 0 15.5 0zM2 2.743A3.5 3.5 0 0 0 1.535 1h12.93A3.5 3.5 0 0 0 14 2.743V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1z"/>
  </svg>
);

const BarChartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-bar-chart" viewBox="0 0 16 16">
    <path d="M4 11H2v3h2zm5-4H7v7h2zm5-5v12h-2V2zm-2-1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM6 7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1zm-5 4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1z"/>
  </svg>
);

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Connect to Zustand Global Store
  const profile = useStore((state) => state.profile);

  const { token, isSyncing, initSync, logout } = useCloudSync();

  const loginWithGoogle = useGoogleLogin({
    onSuccess: (codeResponse) => {
      initSync(codeResponse.access_token);
    },
    onError: (error) => console.log('Login Failed:', error),
    scope: 'https://www.googleapis.com/auth/drive.file',
  });

  const getActiveTabProps = (path) => {
    // Treat "/" as overview, otherwise match exactly
    const isActive = location.pathname === path || (path === '/overview' && location.pathname === '/');
    return isActive ? 'active' : '';
  };

  const navItemsOS = [
    { path: '/expenses', label: 'Expense Tracker', icon: '💸' },
    { path: '/goals', label: 'Goal Planner', icon: '📍' },
    { path: '/habits', label: 'Habit Tracker', icon: '📝' },
    { path: '/fridge', label: 'Fridge Stock', icon: '🍏' },
    { path: '/targets', label: 'Big Targets', icon: '🎯' },
    { path: '/reminders', label: 'Apple Reminders', icon: '🍎' },
  ];

  const navItemsAccount = [
    { path: '/overview', label: 'Overview', icon: '🏠' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
    { path: '/skills', label: 'Skill Tree', icon: <BeakerIcon /> },
  ];


  const backgroundStyle = profile.backgroundImage 
    ? { 
        backgroundImage: `url(${profile.backgroundImage})`, 
        backgroundSize: 'cover', 
        backgroundPosition: 'center', 
        backgroundAttachment: 'fixed' 
      }
    : {};

  return (
    <div className="app-container" style={backgroundStyle}>
      <div className={`sidebar ${!isSidebarOpen ? 'collapsed' : ''}`} style={profile.backgroundImage ? { backdropFilter: 'blur(20px)', background: 'rgba(10,10,12,0.85)' } : {}}>
        <div className="app-title">
          <div className="app-logo" style={{ background: 'transparent', color: 'var(--text-main)', padding: 0 }}>
            <BarChartIcon />
          </div>
          Life Planner OS
        </div>

        <div className="user-profile" style={profile.backgroundImage ? { background: 'rgba(255,255,255,0.05)' } : {}}>
          {profile.profilePicture ? (
            <img src={profile.profilePicture} alt="Profile" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div className="avatar-circle">{profile.username ? profile.username.charAt(1).toUpperCase() : 'U'}</div>
          )}
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{profile.username || 'My Workspace'}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pro Plan</div>
          </div>
        </div>

        <div className="nav-menu">
          <div className="nav-label">My Account</div>
          {navItemsAccount.map(item => (
             <button
              key={item.path}
              className={`nav-item ${getActiveTabProps(item.path)}`}
              onClick={() => navigate(item.path)}
             >
               <span className="nav-icon">{item.icon}</span>
               {item.label}
             </button>
          ))}
        </div>

        <div className="nav-menu">
          <div className="nav-label">Databases</div>
          {navItemsOS.map(item => (
             <button
              key={item.path}
              className={`nav-item ${getActiveTabProps(item.path)}`}
              onClick={() => navigate(item.path)}
             >
               <span className="nav-icon">{item.icon}</span>
               {item.label}
             </button>
          ))}
        </div>
        
        <div className="sidebar-footer" style={{ padding: '0 24px 24px', marginTop: 'auto' }}>
          <div style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
              Cloud Sync
            </div>
            {!token ? (
              <button 
                 onClick={() => loginWithGoogle()}
                 style={{ width: '100%', padding: '8px', background: '#fff', color: '#000', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer', border: 'none' }}>
                Sign in with Google
              </button>
            ) : (
              <div>
                 <div style={{ fontSize: '0.8rem', color: isSyncing ? 'var(--blue-text)' : 'var(--green-text)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                   <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isSyncing ? 'var(--blue-text)' : 'var(--green-text)', animation: isSyncing ? 'blink 1s infinite' : 'none' }}></div>
                   {isSyncing ? 'Syncing...' : 'Synced to Drive'}
                 </div>
                 <button 
                   onClick={logout}
                   style={{ padding: '4px 8px', background: 'transparent', color: 'var(--red-text)', border: '1px solid var(--red-text)', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}>
                   Disconnect
                 </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="dashboard-content" style={{ position: 'relative', ...(profile.backgroundImage ? { backdropFilter: 'blur(10px)', background: 'rgba(10,10,12,0.65)' } : {}) }}>
        
        {/* Toggle Button */}
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          style={{ 
            position: 'absolute', 
            top: '20px', 
            left: '20px', 
            background: 'rgba(255,255,255,0.08)', 
            border: 'none', 
            color: 'var(--text-main)', 
            padding: '8px', 
            borderRadius: '6px', 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100
          }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/>
          </svg>
        </button>

        <div className="view-transition" style={{ paddingTop: '20px' }}>
          <Routes>
            <Route path="/" element={<Overview navigate={navigate} />} />
            <Route path="/overview" element={<Overview navigate={navigate} />} />
            <Route path="/settings" element={<ProfileSettings />} />
            <Route path="/skills" element={<SkillTree />} />
            <Route path="/expenses" element={<ExpenseTracker />} />
            <Route path="/goals" element={<GoalPlanner />} />
            <Route path="/habits" element={<HabitTracker />} />
            <Route path="/fridge" element={<FridgeStock />} />
            <Route path="/targets" element={<BigTargets />} />
            <Route path="/reminders" element={<AppleReminders />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;

