import React, { useMemo } from 'react';

// Helper to format bytes cleanly (e.g., 45.8 MB)
const formatBytes = (bytes) => {
  if (!bytes || isNaN(bytes) || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export default function LoadingScreen({
  progress = null,
  title = "AGENT HUNTER // INITIALISIERUNG",
  subtitle = "Lade neuronales KI-Modell und System-Komponenten...",
  mode = "embedded", // 'embedded' | 'fullscreen' | 'banner'
  onSwitchCloud = null,
  icon = "⚡"
}) {
  // Calculate percentage (0 to 100)
  const percent = useMemo(() => {
    if (progress === null || progress === undefined) return 0;
    if (typeof progress === 'number') {
      return Math.min(100, Math.max(0, Math.round(progress)));
    }
    if (typeof progress === 'object') {
      if (progress.progress !== undefined) {
        const val = typeof progress.progress === 'number' ? progress.progress : parseFloat(progress.progress);
        if (!isNaN(val)) {
          // If value is between 0 and 1, multiply by 100
          return Math.min(100, Math.max(0, Math.round(val <= 1 ? val * 100 : val)));
        }
      }
      if (progress.loaded && progress.total && progress.total > 0) {
        return Math.min(100, Math.max(0, Math.round((progress.loaded / progress.total) * 100)));
      }
    }
    return 0;
  }, [progress]);

  const fileName = useMemo(() => {
    if (progress && typeof progress === 'object') {
      if (progress.file) return progress.file.split('/').pop();
      if (progress.name) return progress.name;
    }
    return null;
  }, [progress]);

  const byteInfo = useMemo(() => {
    if (progress && typeof progress === 'object' && progress.loaded) {
      if (progress.total) {
        return `${formatBytes(progress.loaded)} / ${formatBytes(progress.total)}`;
      }
      return `${formatBytes(progress.loaded)} geladen`;
    }
    return null;
  }, [progress]);

  const isFullscreen = mode === 'fullscreen';
  const isBanner = mode === 'banner';

  if (isBanner) {
    return (
      <div style={{
        background: 'linear-gradient(90deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))',
        border: '1px solid rgba(56, 189, 248, 0.4)',
        borderRadius: '10px',
        padding: '10px 16px',
        margin: '10px 0',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        animation: 'fadeIn 0.3s ease'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontWeight: 600 }}>
            <span style={{ animation: 'spin 1.5s linear infinite', display: 'inline-block' }}>⚡</span>
            <span>{title}</span>
            {fileName && <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>({fileName})</span>}
          </div>
          <span style={{ color: '#38bdf8', fontWeight: 700 }}>{percent}%</span>
        </div>
        <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{
            width: `${percent}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #38bdf8, #818cf8, #a855f7)',
            transition: 'width 0.25s ease-out',
            boxShadow: '0 0 10px rgba(56, 189, 248, 0.6)'
          }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: isFullscreen ? 'fixed' : 'relative',
      top: isFullscreen ? 0 : 'auto',
      left: isFullscreen ? 0 : 'auto',
      right: isFullscreen ? 0 : 'auto',
      bottom: isFullscreen ? 0 : 'auto',
      width: '100%',
      minHeight: isFullscreen ? '100vh' : '380px',
      zIndex: isFullscreen ? 9999 : 10,
      background: isFullscreen ? 'rgba(8, 12, 22, 0.92)' : 'linear-gradient(145deg, rgba(15, 23, 42, 0.85), rgba(11, 15, 26, 0.95))',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '30px 20px',
      borderRadius: isFullscreen ? 0 : '16px',
      border: isFullscreen ? 'none' : '1px solid rgba(56, 189, 248, 0.3)',
      boxShadow: isFullscreen ? 'none' : '0 12px 40px rgba(0, 0, 0, 0.6)',
      animation: 'fadeIn 0.3s ease-out'
    }}>
      {/* Outer Cyber Radar Glow Circle */}
      <div style={{ position: 'relative', width: '90px', height: '90px', marginBottom: '20px' }}>
        {/* Radar Spinner Ring */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          border: '3px solid transparent',
          borderTopColor: '#38bdf8',
          borderRightColor: '#818cf8',
          animation: 'spin 1.4s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite'
        }} />
        {/* Pulsing Core */}
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          width: '66px',
          height: '66px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.25) 0%, rgba(15, 23, 42, 0.8) 100%)',
          border: '1px solid rgba(56, 189, 248, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.8rem',
          boxShadow: '0 0 25px rgba(56, 189, 248, 0.4)',
          animation: 'pulse 2s ease-in-out infinite'
        }}>
          {icon}
        </div>
      </div>

      {/* Main Title */}
      <h3 style={{
        margin: '0 0 6px 0',
        fontSize: '1.15rem',
        fontWeight: 800,
        letterSpacing: '1px',
        color: '#ffffff',
        textAlign: 'center',
        textShadow: '0 0 15px rgba(56, 189, 248, 0.4)'
      }}>
        {title}
      </h3>

      {/* Subtitle */}
      <p style={{
        margin: '0 0 20px 0',
        fontSize: '0.82rem',
        color: '#94a3b8',
        textAlign: 'center',
        maxWidth: '440px',
        lineHeight: 1.5
      }}>
        {subtitle}
      </p>

      {/* Progress Box & Percentage */}
      <div style={{
        width: '100%',
        maxWidth: '460px',
        background: 'rgba(0, 0, 0, 0.4)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: 600 }}>
            {fileName ? `📦 ${fileName}` : '⚡ Lade Pipeline & Modellgewichte...'}
          </span>
          <span style={{
            fontSize: '1.2rem',
            fontWeight: 800,
            color: '#38bdf8',
            fontFamily: 'monospace',
            textShadow: '0 0 10px rgba(56, 189, 248, 0.6)'
          }}>
            {percent}%
          </span>
        </div>

        {/* The Animated Progress Bar */}
        <div style={{
          width: '100%',
          height: '10px',
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '6px',
          overflow: 'hidden',
          position: 'relative',
          padding: '1px'
        }}>
          <div style={{
            width: `${Math.max(4, percent)}%`,
            height: '100%',
            borderRadius: '5px',
            background: 'linear-gradient(90deg, #0284c7, #38bdf8, #818cf8, #c084fc)',
            backgroundSize: '200% 100%',
            transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 0 16px rgba(56, 189, 248, 0.75)',
            animation: 'shimmer 2.5s linear infinite'
          }} />
        </div>

        {/* Byte Info & Status details */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: '#94a3b8' }}>
          <span>{byteInfo || 'Local In-Browser WASM Execution'}</span>
          <span style={{ color: percent >= 100 ? '#34d399' : '#38bdf8' }}>
            {percent >= 100 ? '✅ Fast fertig...' : '⏳ Einmaliger Download (Cache)'}
          </span>
        </div>
      </div>

      {/* Cloud Switcher Option */}
      {onSwitchCloud && (
        <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Dauert es zu lange?</span>
          <button
            type="button"
            onClick={onSwitchCloud}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '6px',
              color: '#e2e8f0',
              padding: '6px 14px',
              fontSize: '0.76rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            ☁️ Auf Cloud-Modell (OpenAI/Claude) wechseln
          </button>
        </div>
      )}

      {/* Keyframe Animations injected inline */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.06); opacity: 1; }
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
