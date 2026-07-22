import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleExportBackup = async () => {
    try {
      const request = indexedDB.open('eom_db', 1);
      request.onsuccess = (e) => {
        const db = e.target.result;
        const transaction = db.transaction('store', 'readonly');
        const store = transaction.objectStore('store');
        const getReq = store.get('life_os_storage');
        getReq.onsuccess = () => {
          let dataStr = "";
          if (getReq.result) {
            dataStr = typeof getReq.result === 'string' ? getReq.result : JSON.stringify(getReq.result);
          } else {
            dataStr = localStorage.getItem('life_os_storage') || "";
          }

          if (!dataStr) {
            try {
              dataStr = JSON.stringify(window.__EOM_STORE_STATE__ || {});
            } catch {
              void 0;
            }
          }

          this.triggerDownload(dataStr || "{}");
        };
        getReq.onerror = () => {
          this.fallbackDownload();
        };
      };
      request.onerror = () => {
        this.fallbackDownload();
      };
    } catch {
      this.fallbackDownload();
    }
  };

  fallbackDownload = () => {
    let dataStr = localStorage.getItem('life_os_storage') || "{}";
    this.triggerDownload(dataStr);
  };

  triggerDownload = (text) => {
    try {
      const blob = new Blob([text], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `eom_emergency_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("Failed to export backup: " + e.message);
    }
  };

  handleFactoryReset = () => {
    if (confirm("⚠️ WARNING: This will permanently delete ALL E.O.M data and reset the app. Are you sure you want to proceed?")) {
      try {
        localStorage.clear();
        const req = indexedDB.deleteDatabase('eom_db');
        req.onsuccess = () => {
          alert("App data reset successfully.");
          window.location.reload();
        };
        req.onerror = () => {
          alert("Failed to delete database. App will reload.");
          window.location.reload();
        };
      } catch {
        window.location.reload();
      }
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #121214 0%, #1e1e24 100%)',
          color: '#e2e2e9',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          padding: '24px',
          boxSizing: 'border-box'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '40px',
            maxWidth: '650px',
            width: '100%',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '3rem',
              marginBottom: '16px'
            }}>🧠</div>
            <h1 style={{
              fontSize: '1.8rem',
              fontWeight: 700,
              margin: '0 0 12px 0',
              color: '#d48f48'
            }}>E.O.M Recovery Console</h1>
            <p style={{
              fontSize: '0.95rem',
              lineHeight: 1.5,
              color: '#a0a0a8',
              margin: '0 0 24px 0'
            }}>
              An unexpected crash was intercepted. The Life Planner engine has been paused to prevent data corruption.
            </p>

            <div style={{
              textAlign: 'left',
              background: '#0a0a0c',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '24px',
              maxHeight: '200px',
              overflowY: 'auto'
            }}>
              <strong style={{ display: 'block', color: '#ff6b6b', fontSize: '0.85rem', marginBottom: '8px' }}>
                Error: {this.state.error?.toString()}
              </strong>
              <pre style={{
                margin: 0,
                fontSize: '0.75rem',
                fontFamily: 'monospace',
                color: '#8b8b93',
                whiteSpace: 'pre-wrap'
              }}>
                {this.state.errorInfo?.componentStack}
              </pre>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={this.handleReload}
                  style={{
                    flex: 1,
                    background: '#d48f48',
                    color: '#121214',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'opacity 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = 0.9}
                  onMouseLeave={e => e.currentTarget.style.opacity = 1}
                >
                  🔄 Reload E.O.M
                </button>
                <button
                  onClick={this.handleExportBackup}
                  style={{
                    flex: 1,
                    background: 'rgba(255,255,255,0.05)',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    padding: '12px',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                >
                  📥 Export Data Backup
                </button>
              </div>
              
              <button
                onClick={this.handleFactoryReset}
                style={{
                  background: 'transparent',
                  color: '#ff6b6b',
                  border: 'none',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  opacity: 0.7,
                  marginTop: '12px'
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = 1}
                onMouseLeave={e => e.currentTarget.style.opacity = 0.7}
              >
                Factory Reset App (Deletes all local data)
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
