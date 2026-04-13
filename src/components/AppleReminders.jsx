import React, { useState, useEffect } from 'react';

export default function AppleReminders() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReminders = async () => {
    setLoading(true);
    setError(null);
    try {
      const isElectron = window.electronAPI !== undefined;
      let data;
      
      if (isElectron) {
        const rawOutput = await window.electronAPI.getAppleReminders();
        data = JSON.parse(rawOutput);
      } else {
        setReminders([{ list: 'System', name: 'Please run via standard Desktop App mode to sync iCloud.' }]);
        setLoading(false);
        return;
      }

      if (data.error) {
        setError(data.error === "permission_denied" 
          ? "Missing Apple Events permission. Please allow 'antigravity-agents' to control 'Reminders' in macOS Settings > Privacy & Security > Automation."
          : data.details);
        setLoading(false);
        return;
      }

      // Group reminders by list
      const grouped = data.reduce((acc, curr) => {
        if (!acc[curr.list]) acc[curr.list] = [];
        acc[curr.list].push(curr);
        return acc;
      }, {});

      setReminders(grouped);
    } catch (err) {
      setError("Could not connect to the local Reminders bridge. Ensure the server is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Apple Reminders (LiveSync)</h1>
        <p style={{ color: 'var(--text-muted)' }}>Directly synced from your Mac via iCloud.</p>
        <button 
          onClick={fetchReminders}
          style={{ background: 'var(--blue-text)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', marginTop: '15px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {loading ? 'Syncing...' : 'Force Sync Now'}
        </button>
      </div>

      <div className="notion-block" style={{ padding: '30px' }}>
        {error && (
          <div style={{ background: 'rgba(255, 50, 50, 0.1)', border: '1px solid var(--red-text)', padding: '20px', borderRadius: '10px', color: 'var(--red-text)' }}>
            <strong>Action Required:</strong> {error}
          </div>
        )}

        {!loading && !error && Object.keys(reminders).length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No uncompleted reminders found!</div>
        )}

        {!loading && !error && Object.keys(reminders).map(listName => (
          <div key={listName} style={{ marginBottom: '30px' }}>
            <h3 style={{ color: 'var(--orange-text)', fontSize: '1.1rem', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
              {listName}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {reminders[listName].map(r => (
                <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.02)', padding: '10px 15px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid var(--text-muted)' }}></div>
                  <span style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>{r.name}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
