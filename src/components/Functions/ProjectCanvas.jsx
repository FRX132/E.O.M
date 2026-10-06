import React, { useMemo, useCallback, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  Panel,
  addEdge
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useStore } from '../../store';
import MarkdownViewer from './MarkdownViewer';

// ---------------------------------------------------------------------------
// CUSTOM NODE: Category Hub (Central or Module Hubs)
// ---------------------------------------------------------------------------
const CategoryNode = ({ data }) => {
  const color = data.color || 'var(--primary, #38bdf8)';
  return (
    <div style={{
      background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95))',
      padding: '14px 26px',
      borderRadius: '16px',
      border: `2px solid ${color}`,
      color: '#ffffff',
      fontSize: '1.1rem',
      fontWeight: 'bold',
      boxShadow: `0 0 25px ${color}33, 0 10px 30px rgba(0,0,0,0.6)`,
      textAlign: 'center',
      minWidth: '160px',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '4px'
    }}>
      <Handle type="target" position={Position.Top} style={{ background: color, width: 8, height: 8 }} />
      <Handle type="target" position={Position.Left} style={{ background: color, width: 8, height: 8 }} />
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {data.icon && <span style={{ fontSize: '1.3rem' }}>{data.icon}</span>}
        <span>{data.label}</span>
      </div>

      {data.count !== undefined && (
        <span style={{
          background: `${color}22`,
          color: color,
          padding: '2px 8px',
          borderRadius: '10px',
          fontSize: '0.72rem',
          fontWeight: '700',
          border: `1px solid ${color}44`
        }}>
          {data.count} {data.count === 1 ? 'Item' : 'Items'}
        </span>
      )}

      <Handle type="source" position={Position.Bottom} style={{ background: color, width: 8, height: 8 }} />
      <Handle type="source" position={Position.Right} style={{ background: color, width: 8, height: 8 }} />
    </div>
  );
};

// ---------------------------------------------------------------------------
// CUSTOM NODE: Editor Document (Markdown Notes & Guides)
// ---------------------------------------------------------------------------
const DocumentNode = ({ id, data }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const wordCount = useMemo(() => {
    if (!data.content) return 0;
    return data.content.trim().split(/\s+/).filter(Boolean).length;
  }, [data.content]);

  const previewSnippet = useMemo(() => {
    if (!data.content) return '';
    return data.content.slice(0, 160) + (data.content.length > 160 ? '...' : '');
  }, [data.content]);

  return (
    <div
      className="nodrag"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.92))',
        border: isHovered ? '2px solid #38bdf8' : '1px solid rgba(56, 189, 248, 0.45)',
        borderRadius: '12px',
        padding: '12px 14px',
        width: isExpanded ? '360px' : '260px',
        color: '#f8fafc',
        boxShadow: isHovered ? '0 12px 35px rgba(56, 189, 248, 0.3)' : '0 8px 24px rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(12px)',
        fontSize: '0.85rem',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: '#38bdf8', width: 8, height: 8 }} />
      <Handle type="target" position={Position.Left} style={{ background: '#38bdf8', width: 8, height: 8 }} />

      <div
        className="custom-drag-handle"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'grab',
          paddingBottom: '6px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
          <span style={{ fontSize: '1.1rem' }}>📄</span>
          <span style={{
            fontWeight: 'bold',
            fontSize: '0.88rem',
            color: '#38bdf8',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '140px'
          }}>
            {data.name || 'untitled.md'}
          </span>
        </div>
        <span style={{
          background: 'rgba(56, 189, 248, 0.15)',
          color: '#7dd3fc',
          padding: '2px 7px',
          borderRadius: '10px',
          fontSize: '0.68rem',
          fontWeight: '600',
          border: '1px solid rgba(56, 189, 248, 0.3)'
        }}>
          📁 {data.folder || 'Inbox'}
        </span>
      </div>

      <div style={{
        background: 'rgba(0, 0, 0, 0.3)',
        padding: '8px 10px',
        borderRadius: '6px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        maxHeight: isExpanded ? '240px' : '90px',
        overflowY: 'auto',
        fontSize: '0.78rem',
        lineHeight: '1.4',
        color: '#cbd5e1'
      }}>
        {data.content ? (
          <MarkdownViewer content={isExpanded ? data.content : previewSnippet} />
        ) : (
          <span style={{ color: '#64748b', fontStyle: 'italic' }}>Empty document...</span>
        )}
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '2px',
        fontSize: '0.72rem',
        color: '#94a3b8'
      }}>
        <span>📝 {wordCount} words</span>
        <div style={{ display: 'flex', gap: '5px' }}>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '4px',
              color: '#e2e8f0',
              padding: '3px 6px',
              fontSize: '0.7rem',
              cursor: 'pointer'
            }}
          >
            {isExpanded ? '🔼 Less' : '👁️ View'}
          </button>
          <button
            onClick={() => data.onNavigate && data.onNavigate('/editor', { activeFileId: data.id })}
            style={{
              background: 'linear-gradient(135deg, #0284c7, #0369a1)',
              border: 'none',
              borderRadius: '4px',
              color: '#ffffff',
              padding: '3px 8px',
              fontSize: '0.7rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '2px'
            }}
          >
            ✏️ Editor ↗
          </button>
          {data.onDeleteNode && (
            <button
              onClick={() => data.onDeleteNode(id)}
              style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px 4px', fontSize: '0.75rem' }}
            >
              🗑️
            </button>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} style={{ background: '#38bdf8', width: 8, height: 8 }} />
      <Handle type="source" position={Position.Right} style={{ background: '#38bdf8', width: 8, height: 8 }} />
    </div>
  );
};

// ---------------------------------------------------------------------------
// CUSTOM NODE: Target & Goal Node
// ---------------------------------------------------------------------------
const TargetGoalNode = ({ data }) => {
  const [hovered, setHovered] = useState(false);
  const progress = data.progress !== undefined ? data.progress : (data.completed ? 100 : 0);
  const isTarget = data.isTarget;

  return (
    <div
      className="nodrag"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.95), rgba(20, 35, 25, 0.95))',
        border: hovered ? '2px solid #10b981' : '1px solid rgba(16, 185, 129, 0.4)',
        borderRadius: '12px',
        padding: '12px 14px',
        width: '240px',
        color: '#f8fafc',
        boxShadow: hovered ? '0 10px 30px rgba(16, 185, 129, 0.3)' : '0 6px 20px rgba(0,0,0,0.4)',
        backdropFilter: 'blur(10px)',
        fontSize: '0.85rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: '#10b981', width: 8, height: 8 }} />
      <Handle type="target" position={Position.Left} style={{ background: '#10b981', width: 8, height: 8 }} />

      <div className="custom-drag-handle" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'grab' }}>
        <span style={{ fontSize: '1rem' }}>{isTarget ? '🏆' : '🎯'}</span>
        <span style={{
          background: data.completed || progress >= 100 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
          color: data.completed || progress >= 100 ? '#34d399' : '#fbbf24',
          padding: '2px 7px',
          borderRadius: '10px',
          fontSize: '0.68rem',
          fontWeight: 'bold',
          border: `1px solid ${data.completed || progress >= 100 ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`
        }}>
          {data.category || (isTarget ? 'Big Target' : 'Goal')}
        </span>
      </div>

      <strong style={{ fontSize: '0.9rem', color: '#fff', lineHeight: '1.3' }}>{data.title}</strong>
      {data.deadline && <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>📅 Due {data.deadline}</div>}

      {/* Progress bar */}
      <div style={{ width: '100%', background: 'rgba(255,255,255,0.1)', height: '6px', borderRadius: '3px', overflow: 'hidden', marginTop: '2px' }}>
        <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, #10b981, #34d399)', transition: 'width 0.3s' }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: '#cbd5e1', paddingTop: '2px' }}>
        <span>{progress}% completed</span>
        <button
          onClick={() => data.onNavigate && data.onNavigate(isTarget ? '/targets' : '/goals')}
          style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '4px', color: '#34d399', padding: '2px 6px', fontSize: '0.7rem', cursor: 'pointer' }}
        >
          Open ↗
        </button>
      </div>

      <Handle type="source" position={Position.Bottom} style={{ background: '#10b981', width: 8, height: 8 }} />
      <Handle type="source" position={Position.Right} style={{ background: '#10b981', width: 8, height: 8 }} />
    </div>
  );
};

// ---------------------------------------------------------------------------
// CUSTOM NODE: Habit Node
// ---------------------------------------------------------------------------
const HabitNode = ({ data }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="nodrag"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.95), rgba(35, 20, 50, 0.95))',
        border: hovered ? '2px solid #a855f7' : '1px solid rgba(168, 85, 247, 0.4)',
        borderRadius: '12px',
        padding: '12px 14px',
        width: '230px',
        color: '#f8fafc',
        boxShadow: hovered ? '0 10px 30px rgba(168, 85, 247, 0.3)' : '0 6px 20px rgba(0,0,0,0.4)',
        backdropFilter: 'blur(10px)',
        fontSize: '0.85rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: '#a855f7', width: 8, height: 8 }} />
      <Handle type="target" position={Position.Left} style={{ background: '#a855f7', width: 8, height: 8 }} />

      <div className="custom-drag-handle" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'grab' }}>
        <span style={{ fontSize: '1rem' }}>⚡</span>
        <span style={{
          background: 'rgba(168, 85, 247, 0.2)',
          color: '#c084fc',
          padding: '2px 7px',
          borderRadius: '10px',
          fontSize: '0.68rem',
          fontWeight: 'bold',
          border: '1px solid rgba(168, 85, 247, 0.4)'
        }}>
          {data.repeat || 'Daily'}
        </span>
      </div>

      <strong style={{ fontSize: '0.9rem', color: '#fff' }}>{data.title}</strong>
      {data.category && <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>📂 {data.category}</div>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: '#cbd5e1', paddingTop: '4px' }}>
        <span style={{ color: data.isDoneToday ? '#34d399' : '#f59e0b' }}>
          {data.isDoneToday ? '✅ Done Today' : '⏳ Pending'}
        </span>
        <button
          onClick={() => data.onNavigate && data.onNavigate('/habits')}
          style={{ background: 'rgba(168, 85, 247, 0.2)', border: '1px solid rgba(168, 85, 247, 0.4)', borderRadius: '4px', color: '#c084fc', padding: '2px 6px', fontSize: '0.7rem', cursor: 'pointer' }}
        >
          Habits ↗
        </button>
      </div>

      <Handle type="source" position={Position.Bottom} style={{ background: '#a855f7', width: 8, height: 8 }} />
      <Handle type="source" position={Position.Right} style={{ background: '#a855f7', width: 8, height: 8 }} />
    </div>
  );
};

// ---------------------------------------------------------------------------
// CUSTOM NODE: Workout Node
// ---------------------------------------------------------------------------
const WorkoutNode = ({ data }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="nodrag"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.95), rgba(45, 15, 25, 0.95))',
        border: hovered ? '2px solid #f43f5e' : '1px solid rgba(244, 63, 94, 0.4)',
        borderRadius: '12px',
        padding: '12px 14px',
        width: '230px',
        color: '#f8fafc',
        boxShadow: hovered ? '0 10px 30px rgba(244, 63, 94, 0.3)' : '0 6px 20px rgba(0,0,0,0.4)',
        backdropFilter: 'blur(10px)',
        fontSize: '0.85rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: '#f43f5e', width: 8, height: 8 }} />
      <Handle type="target" position={Position.Left} style={{ background: '#f43f5e', width: 8, height: 8 }} />

      <div className="custom-drag-handle" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'grab' }}>
        <span style={{ fontSize: '1rem' }}>🏋️</span>
        <span style={{
          background: 'rgba(244, 63, 94, 0.2)',
          color: '#fb7185',
          padding: '2px 7px',
          borderRadius: '10px',
          fontSize: '0.68rem',
          fontWeight: 'bold',
          border: '1px solid rgba(244, 63, 94, 0.4)'
        }}>
          {data.duration || 'Session'}
        </span>
      </div>

      <strong style={{ fontSize: '0.9rem', color: '#fff' }}>{data.title}</strong>
      {data.date && <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>📅 {data.date}</div>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: '#cbd5e1', paddingTop: '2px' }}>
        <span>{data.exercisesCount ? `${data.exercisesCount} exercises` : 'Workout Log'}</span>
        <button
          onClick={() => data.onNavigate && data.onNavigate('/sport')}
          style={{ background: 'rgba(244, 63, 94, 0.2)', border: '1px solid rgba(244, 63, 94, 0.4)', borderRadius: '4px', color: '#fb7185', padding: '2px 6px', fontSize: '0.7rem', cursor: 'pointer' }}
        >
          Sport Hub ↗
        </button>
      </div>

      <Handle type="source" position={Position.Bottom} style={{ background: '#f43f5e', width: 8, height: 8 }} />
      <Handle type="source" position={Position.Right} style={{ background: '#f43f5e', width: 8, height: 8 }} />
    </div>
  );
};

// ---------------------------------------------------------------------------
// CUSTOM NODE: Journal & Reflection Node
// ---------------------------------------------------------------------------
const JournalNode = ({ data }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="nodrag"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.95), rgba(25, 20, 50, 0.95))',
        border: hovered ? '2px solid #6366f1' : '1px solid rgba(99, 102, 241, 0.4)',
        borderRadius: '12px',
        padding: '12px 14px',
        width: '240px',
        color: '#f8fafc',
        boxShadow: hovered ? '0 10px 30px rgba(99, 102, 241, 0.3)' : '0 6px 20px rgba(0,0,0,0.4)',
        backdropFilter: 'blur(10px)',
        fontSize: '0.85rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: '#6366f1', width: 8, height: 8 }} />
      <Handle type="target" position={Position.Left} style={{ background: '#6366f1', width: 8, height: 8 }} />

      <div className="custom-drag-handle" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'grab' }}>
        <span style={{ fontSize: '1rem' }}>📔</span>
        <span style={{
          background: 'rgba(99, 102, 241, 0.2)',
          color: '#818cf8',
          padding: '2px 7px',
          borderRadius: '10px',
          fontSize: '0.68rem',
          fontWeight: 'bold',
          border: '1px solid rgba(99, 102, 241, 0.4)'
        }}>
          {data.mood || 'Reflection'}
        </span>
      </div>

      <strong style={{ fontSize: '0.9rem', color: '#fff' }}>{data.title}</strong>
      {data.date && <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>📅 {data.date}</div>}
      {data.excerpt && <div style={{ fontSize: '0.75rem', color: '#cbd5e1', fontStyle: 'italic', maxHeight: '40px', overflow: 'hidden' }}>"{data.excerpt}"</div>}

      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '2px' }}>
        <button
          onClick={() => data.onNavigate && data.onNavigate('/journal')}
          style={{ background: 'rgba(99, 102, 241, 0.2)', border: '1px solid rgba(99, 102, 241, 0.4)', borderRadius: '4px', color: '#818cf8', padding: '2px 6px', fontSize: '0.7rem', cursor: 'pointer' }}
        >
          Journal ↗
        </button>
      </div>

      <Handle type="source" position={Position.Bottom} style={{ background: '#6366f1', width: 8, height: 8 }} />
      <Handle type="source" position={Position.Right} style={{ background: '#6366f1', width: 8, height: 8 }} />
    </div>
  );
};

// ---------------------------------------------------------------------------
// CUSTOM NODE: Finance Expense Node
// ---------------------------------------------------------------------------
const FinanceNode = ({ data }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="nodrag"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.95), rgba(45, 35, 15, 0.95))',
        border: hovered ? '2px solid #f59e0b' : '1px solid rgba(245, 158, 11, 0.4)',
        borderRadius: '12px',
        padding: '12px 14px',
        width: '220px',
        color: '#f8fafc',
        boxShadow: hovered ? '0 10px 30px rgba(245, 158, 11, 0.3)' : '0 6px 20px rgba(0,0,0,0.4)',
        backdropFilter: 'blur(10px)',
        fontSize: '0.85rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: '#f59e0b', width: 8, height: 8 }} />
      <Handle type="target" position={Position.Left} style={{ background: '#f59e0b', width: 8, height: 8 }} />

      <div className="custom-drag-handle" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'grab' }}>
        <span style={{ fontSize: '1rem' }}>💰</span>
        <span style={{
          background: 'rgba(239, 68, 68, 0.2)',
          color: '#f87171',
          padding: '2px 7px',
          borderRadius: '10px',
          fontSize: '0.75rem',
          fontWeight: 'bold',
          border: '1px solid rgba(239, 68, 68, 0.4)'
        }}>
          {data.amount}
        </span>
      </div>

      <strong style={{ fontSize: '0.9rem', color: '#fff' }}>{data.title}</strong>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: '#94a3b8' }}>
        <span>📂 {data.category}</span>
        {data.date && <span>{data.date}</span>}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '2px' }}>
        <button
          onClick={() => data.onNavigate && data.onNavigate('/expenses')}
          style={{ background: 'rgba(245, 158, 11, 0.2)', border: '1px solid rgba(245, 158, 11, 0.4)', borderRadius: '4px', color: '#fbbf24', padding: '2px 6px', fontSize: '0.7rem', cursor: 'pointer' }}
        >
          Expenses ↗
        </button>
      </div>

      <Handle type="source" position={Position.Bottom} style={{ background: '#f59e0b', width: 8, height: 8 }} />
      <Handle type="source" position={Position.Right} style={{ background: '#f59e0b', width: 8, height: 8 }} />
    </div>
  );
};

// ---------------------------------------------------------------------------
// CUSTOM NODE: Media Node (Books, Movies, Trips)
// ---------------------------------------------------------------------------
const MediaNode = ({ data }) => {
  const [hovered, setHovered] = useState(false);
  const color = data.color || '#ec4899';

  return (
    <div
      className="nodrag"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))',
        border: hovered ? `2px solid ${color}` : `1px solid ${color}55`,
        borderRadius: '12px',
        padding: '12px',
        width: '230px',
        color: '#f8fafc',
        boxShadow: hovered ? `0 10px 30px ${color}33` : '0 6px 20px rgba(0,0,0,0.4)',
        backdropFilter: 'blur(10px)',
        fontSize: '0.85rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: color, width: 8, height: 8 }} />
      <Handle type="target" position={Position.Left} style={{ background: color, width: 8, height: 8 }} />

      {data.img && (
        <div style={{
          width: '100%',
          height: '110px',
          backgroundImage: `url(${data.img})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: '8px',
          marginBottom: '4px'
        }} />
      )}

      <div className="custom-drag-handle" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'grab' }}>
        <span style={{ fontSize: '1rem' }}>{data.icon || '📌'}</span>
        {data.badge && (
          <span style={{
            background: `${color}22`,
            color: color,
            padding: '2px 7px',
            borderRadius: '10px',
            fontSize: '0.68rem',
            fontWeight: 'bold',
            border: `1px solid ${color}44`
          }}>
            {data.badge}
          </span>
        )}
      </div>

      <strong style={{ fontSize: '0.9rem', color: '#fff', lineHeight: '1.3' }}>{data.title}</strong>
      {data.subtitle && <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{data.subtitle}</div>}

      {data.tags && data.tags.length > 0 && (
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '2px' }}>
          {data.tags.map(t => (
            <span key={t} style={{ background: 'rgba(255,255,255,0.08)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.68rem', color: '#cbd5e1' }}>
              {t}
            </span>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '4px' }}>
        {data.targetRoute && (
          <button
            onClick={() => data.onNavigate && data.onNavigate(data.targetRoute)}
            style={{ background: `${color}22`, border: `1px solid ${color}44`, borderRadius: '4px', color: color, padding: '2px 6px', fontSize: '0.7rem', cursor: 'pointer' }}
          >
            Open ↗
          </button>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} style={{ background: color, width: 8, height: 8 }} />
      <Handle type="source" position={Position.Right} style={{ background: color, width: 8, height: 8 }} />
    </div>
  );
};

// ---------------------------------------------------------------------------
// CUSTOM NODE: Skill Tree / Quest Node
// ---------------------------------------------------------------------------
const SkillQuestNode = ({ data }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="nodrag"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.95), rgba(20, 25, 55, 0.95))',
        border: hovered ? '2px solid #3b82f6' : '1px solid rgba(59, 130, 246, 0.4)',
        borderRadius: '12px',
        padding: '12px 14px',
        width: '230px',
        color: '#f8fafc',
        boxShadow: hovered ? '0 10px 30px rgba(59, 130, 246, 0.3)' : '0 6px 20px rgba(0,0,0,0.4)',
        backdropFilter: 'blur(10px)',
        fontSize: '0.85rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: '#3b82f6', width: 8, height: 8 }} />
      <Handle type="target" position={Position.Left} style={{ background: '#3b82f6', width: 8, height: 8 }} />

      <div className="custom-drag-handle" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'grab' }}>
        <span style={{ fontSize: '1rem' }}>🛡️</span>
        <span style={{
          background: 'rgba(59, 130, 246, 0.2)',
          color: '#60a5fa',
          padding: '2px 7px',
          borderRadius: '10px',
          fontSize: '0.68rem',
          fontWeight: 'bold',
          border: '1px solid rgba(59, 130, 246, 0.4)'
        }}>
          {data.isQuest ? 'Active Quest' : 'Unlocked Skill'}
        </span>
      </div>

      <strong style={{ fontSize: '0.9rem', color: '#fff' }}>{data.title}</strong>
      {data.subtitle && <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{data.subtitle}</div>}

      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '2px' }}>
        <button
          onClick={() => data.onNavigate && data.onNavigate('/skills')}
          style={{ background: 'rgba(59, 130, 246, 0.2)', border: '1px solid rgba(59, 130, 246, 0.4)', borderRadius: '4px', color: '#60a5fa', padding: '2px 6px', fontSize: '0.7rem', cursor: 'pointer' }}
        >
          Skill Tree ↗
        </button>
      </div>

      <Handle type="source" position={Position.Bottom} style={{ background: '#3b82f6', width: 8, height: 8 }} />
      <Handle type="source" position={Position.Right} style={{ background: '#3b82f6', width: 8, height: 8 }} />
    </div>
  );
};

// ---------------------------------------------------------------------------
// CUSTOM NODE: Timetable Block Node
// ---------------------------------------------------------------------------
const TimetableNode = ({ data }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="nodrag"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.95), rgba(15, 45, 40, 0.95))',
        border: hovered ? '2px solid #14b8a6' : '1px solid rgba(20, 184, 166, 0.4)',
        borderRadius: '12px',
        padding: '12px 14px',
        width: '220px',
        color: '#f8fafc',
        boxShadow: hovered ? '0 10px 30px rgba(20, 184, 166, 0.3)' : '0 6px 20px rgba(0,0,0,0.4)',
        backdropFilter: 'blur(10px)',
        fontSize: '0.85rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: '#14b8a6', width: 8, height: 8 }} />
      <Handle type="target" position={Position.Left} style={{ background: '#14b8a6', width: 8, height: 8 }} />

      <div className="custom-drag-handle" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'grab' }}>
        <span style={{ fontSize: '1rem' }}>📅</span>
        <span style={{
          background: 'rgba(20, 184, 166, 0.2)',
          color: '#2dd4bf',
          padding: '2px 7px',
          borderRadius: '10px',
          fontSize: '0.68rem',
          fontWeight: 'bold',
          border: '1px solid rgba(20, 184, 166, 0.4)'
        }}>
          {data.day || 'Routine'}
        </span>
      </div>

      <strong style={{ fontSize: '0.9rem', color: '#fff' }}>{data.title}</strong>
      {data.time && <div style={{ fontSize: '0.72rem', color: '#2dd4bf', fontWeight: 'bold' }}>⏰ {data.time}</div>}

      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '2px' }}>
        <button
          onClick={() => data.onNavigate && data.onNavigate('/timetable')}
          style={{ background: 'rgba(20, 184, 166, 0.2)', border: '1px solid rgba(20, 184, 166, 0.4)', borderRadius: '4px', color: '#2dd4bf', padding: '2px 6px', fontSize: '0.7rem', cursor: 'pointer' }}
        >
          Timetable ↗
        </button>
      </div>

      <Handle type="source" position={Position.Bottom} style={{ background: '#14b8a6', width: 8, height: 8 }} />
      <Handle type="source" position={Position.Right} style={{ background: '#14b8a6', width: 8, height: 8 }} />
    </div>
  );
};

// ---------------------------------------------------------------------------
// CUSTOM NODE: Sticky Note Node
// ---------------------------------------------------------------------------
const StickyNode = ({ id, data }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div className="nodrag"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: data.color || '#fef08a',
        padding: '10px',
        borderRadius: '6px',
        width: data.color === 'transparent' ? 'auto' : '200px',
        minWidth: '100px',
        minHeight: data.color === 'transparent' ? 'auto' : '200px',
        boxShadow: data.color === 'transparent' ? 'none' : '4px 4px 15px rgba(0,0,0,0.35)',
        color: data.color === 'transparent' ? '#fff' : '#000',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}>
      {hovered && (
        <div style={{ position: 'absolute', top: '-35px', left: 0, background: 'var(--bg-card, #1e293b)', padding: '5px', borderRadius: '6px', display: 'flex', gap: '5px', boxShadow: '0 4px 10px rgba(0,0,0,0.5)', zIndex: 10, alignItems: 'center' }}>
          {['#fef08a', '#bbf7d0', '#bfdbfe', '#fbcfe8', 'transparent'].map(c => (
            <div key={c} onClick={() => data.onChangeStyle && data.onChangeStyle(id, { color: c })} style={{ width: 16, height: 16, borderRadius: '50%', background: c === 'transparent' ? '#333' : c, border: c === 'transparent' ? '1px dashed #fff' : 'none', cursor: 'pointer' }} title={c === 'transparent' ? 'Transparent' : 'Farbe'} />
          ))}
          <div style={{ width: 1, height: '16px', background: '#555', margin: '0 5px' }} />
          {['0.9rem', '1.2rem', '1.8rem', '2.5rem'].map((s, i) => (
            <button key={s} onClick={() => data.onChangeStyle && data.onChangeStyle(id, { fontSize: s })} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '0 4px', fontSize: '0.8rem' }}>{['S', 'M', 'L', 'XL'][i]}</button>
          ))}
          <div style={{ width: 1, height: '16px', background: '#555', margin: '0 5px' }} />
          <button onClick={() => data.onChangeStyle && data.onChangeStyle(id, { fontWeight: data.fontWeight === 'bold' ? 'normal' : 'bold' })} style={{ background: 'transparent', border: 'none', color: data.fontWeight === 'bold' ? 'var(--primary, #38bdf8)' : '#fff', cursor: 'pointer', padding: '0 4px', fontWeight: 'bold' }}>B</button>
          <div style={{ width: 1, height: '16px', background: '#555', margin: '0 5px' }} />
          <button onClick={() => data.onDelete && data.onDelete(id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0 4px' }}>🗑️</button>
        </div>
      )}
      <div className="custom-drag-handle" style={{ height: '20px', cursor: 'grab', background: data.color === 'transparent' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', marginBottom: '5px', borderRadius: '2px' }}></div>
      <Handle type="target" position={Position.Top} style={{ background: '#555' }} />
      <textarea
        defaultValue={data.text}
        onChange={(e) => data.onChange && data.onChange(id, e.target.value)}
        style={{
          flex: 1,
          width: '100%',
          border: 'none',
          background: 'transparent',
          resize: 'both',
          outline: 'none',
          color: data.color === 'transparent' ? '#fff' : '#000',
          fontFamily: data.color === 'transparent' ? 'var(--font-heading, sans-serif)' : 'monospace',
          fontSize: data.fontSize || '0.9rem',
          fontWeight: data.fontWeight || 'normal'
        }}
        placeholder={data.color === 'transparent' ? "Heading..." : "Notiz hier..."}
      />
      <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} />
    </div>
  );
};

// Registered Node Types
const nodeTypes = {
  category: CategoryNode,
  document: DocumentNode,
  targetGoal: TargetGoalNode,
  habit: HabitNode,
  workout: WorkoutNode,
  journal: JournalNode,
  finance: FinanceNode,
  media: MediaNode,
  skillQuest: SkillQuestNode,
  timetable: TimetableNode,
  sticky: StickyNode
};

// ---------------------------------------------------------------------------
// MAIN PROJECT CANVAS COMPONENT
// ---------------------------------------------------------------------------
export default function ProjectCanvas() {
  const store = useStore();
  const navigate = useNavigate();
  const handlersRef = useRef({});
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Comprehensive OS Solar Constellation Layout Generator
  const generateDefaultLayout = useCallback(() => {
    const nodes = [];
    const edges = [];

    // Central Core
    nodes.push({
      id: 'root',
      type: 'category',
      position: { x: 0, y: 0 },
      data: { label: 'Life Planner OS', icon: '🌌', color: '#ffffff' }
    });

    const createCategoryCluster = (categoryId, label, icon, color, posX, posY, items, mapItemFn) => {
      if (!items || items.length === 0) return;

      // Add Category Hub Node
      nodes.push({
        id: categoryId,
        type: 'category',
        position: { x: posX, y: posY },
        data: { label, icon, color, count: items.length }
      });

      // Connect to Core Root
      edges.push({
        id: `e-root-${categoryId}`,
        source: 'root',
        target: categoryId,
        animated: true,
        style: { stroke: color, strokeWidth: 2 }
      });

      // Arrange items in orbit around category hub
      const radius = Math.max(340, Math.min(650, items.length * 60));
      const angleStep = (2 * Math.PI) / items.length;

      items.forEach((item, index) => {
        const angle = index * angleStep - Math.PI / 2;
        const itemX = posX + Math.cos(angle) * radius;
        const itemY = posY + Math.sin(angle) * radius;
        const mapped = mapItemFn(item, index);
        const nodeId = mapped.id || `${categoryId}-${index}`;

        nodes.push({
          id: nodeId,
          type: mapped.type || 'media',
          position: { x: itemX, y: itemY },
          data: {
            ...mapped.data,
            onNavigate: (path, stateData) => handlersRef.current.handleNavigate?.(path, stateData),
            onDeleteNode: (id) => handlersRef.current.handleDeleteNode?.(id)
          }
        });

        edges.push({
          id: `e-${categoryId}-${nodeId}`,
          source: categoryId,
          target: nodeId,
          style: { stroke: color, strokeWidth: 1.5, strokeDasharray: '4 4' }
        });
      });
    };

    // 1. 📄 DOCUMENTS (Editor Markdown Notes)
    createCategoryCluster('documents', 'DOCUMENTS', '📄', '#38bdf8', 0, -850, store.editorFiles || [], (f) => ({
      id: `doc-${f.id}`,
      type: 'document',
      data: { id: f.id, name: f.name, folder: f.folder, content: f.content, timestamp: f.timestamp }
    }));

    // 2. 🎯 TARGETS & GOALS
    const allGoalsList = [
      ...(store.targets || []).map(t => ({ ...t, isTarget: true, title: t.title, progress: t.progress || 0 })),
      ...(store.goals?.year || []).map(g => ({ ...g, isTarget: false, title: g.text, category: 'Year Goal' })),
      ...(store.goals?.month || []).map(g => ({ ...g, isTarget: false, title: g.text, category: 'Month Goal' })),
      ...(store.goals?.week || []).map(g => ({ ...g, isTarget: false, title: g.text, category: 'Week Goal' }))
    ];
    createCategoryCluster('targets', 'TARGETS & GOALS', '🎯', '#10b981', 850, -550, allGoalsList, (g, i) => ({
      id: `target-${g.id || i}`,
      type: 'targetGoal',
      data: { title: g.title, progress: g.progress, isTarget: g.isTarget, completed: g.completed, category: g.category, deadline: g.deadline }
    }));

    // 3. ⚡ HABITS & ROUTINES
    const habitList = store.customHabitTemplates || [];
    createCategoryCluster('habits', 'HABITS', '⚡', '#a855f7', -850, -550, habitList, (h, i) => ({
      id: `habit-${h.id || i}`,
      type: 'habit',
      data: { title: h.name, repeat: h.repeat, category: h.category }
    }));

    // 4. 🏋️ WORKOUTS & FITNESS
    createCategoryCluster('workouts', 'WORKOUTS', '🏋️', '#f43f5e', -950, 200, store.workouts || [], (w, i) => ({
      id: `workout-${w.id || i}`,
      type: 'workout',
      data: { title: w.name || 'Workout', date: w.date, duration: w.duration, exercisesCount: w.exercises?.length }
    }));

    // 5. 📔 JOURNAL & MINDSET
    createCategoryCluster('journal', 'JOURNAL', '📔', '#6366f1', -550, 850, store.journal || [], (j, i) => ({
      id: `journal-${j.id || i}`,
      type: 'journal',
      data: { title: j.title || 'Entry', date: j.date, mood: j.mood, excerpt: j.content?.slice(0, 80) }
    }));

    // 6. 💰 EXPENSES & FINANCE
    createCategoryCluster('finance', 'FINANCES', '💰', '#f59e0b', 550, 850, (store.expenses || []).slice(-15), (e, i) => ({
      id: `expense-${e.id || i}`,
      type: 'finance',
      data: { title: e.note || e.category, amount: `${e.amount} ${store.profile?.currencySymbol || '€'}`, category: e.category, date: e.date }
    }));

    // 7. 📚 LIBRARY (Books)
    createCategoryCluster('books', 'LIBRARY', '📚', '#ec4899', 950, 200, store.books || [], (b, i) => ({
      id: `book-${b.id || i}`,
      type: 'media',
      data: {
        title: b.title,
        subtitle: b.subtitle,
        img: b.img,
        color: '#ec4899',
        icon: '📖',
        badge: `${b.rating || 5} ★`,
        tags: [b.status].filter(Boolean),
        targetRoute: '/books'
      }
    }));

    // 8. 🎬 CINEMA (Movies)
    createCategoryCluster('movies', 'CINEMA', '🎬', '#8b5cf6', 850, 600, store.movies || [], (m, i) => ({
      id: `movie-${m.id || i}`,
      type: 'media',
      data: {
        title: m.title,
        subtitle: m.genre,
        img: m.poster,
        color: '#8b5cf6',
        icon: '🎬',
        badge: m.status || 'Watched',
        tags: [m.rating ? `${m.rating} ★` : null].filter(Boolean),
        targetRoute: '/movies'
      }
    }));

    // 9. ✈️ TRIPS & TRAVEL
    createCategoryCluster('trips', 'TRIP MODE', '✈️', '#06b6d4', -850, 600, store.trips || [], (t, i) => ({
      id: `trip-${t.id || i}`,
      type: 'media',
      data: {
        title: t.location,
        subtitle: t.date ? new Date(t.date).toLocaleDateString() : '',
        color: '#06b6d4',
        icon: '✈️',
        badge: t.type || 'Trip',
        tags: [t.resolvedCountry].filter(Boolean),
        targetRoute: '/trips'
      }
    }));

    // 10. 🛡️ SKILLS & QUESTS
    const skillList = [
      ...(store.skills || []).map(s => ({ title: s.toUpperCase(), isQuest: false })),
      ...(store.activeQuests || []).map(q => ({ title: q.skillId?.replace(/-/g, ' ').toUpperCase(), subtitle: `Progress: ${q.progress}/${q.total}`, isQuest: true }))
    ];
    createCategoryCluster('skills', 'SKILL TREE', '🛡️', '#3b82f6', -450, -850, skillList, (s, i) => ({
      id: `skill-${i}`,
      type: 'skillQuest',
      data: { title: s.title, subtitle: s.subtitle, isQuest: s.isQuest }
    }));

    // 11. 📅 TIMETABLE
    createCategoryCluster('timetable', 'TIMETABLE', '📅', '#14b8a6', 450, -850, store.timetableBlocks || [], (tb, i) => ({
      id: `tb-${tb.id || i}`,
      type: 'timetable',
      data: { title: tb.title || tb.activity, day: tb.day, time: `${tb.startTime || ''} - ${tb.endTime || ''}` }
    }));

    return { nodes, edges };
  }, [store]);

  // Initial Data
  const initialData = useMemo(() => {
    if (store.canvasNodes && store.canvasNodes.length > 0) {
      const restoredNodes = store.canvasNodes.map(node => {
        if (node.type === 'sticky') {
          return {
            ...node,
            data: {
              ...node.data,
              onChange: (id, val) => handlersRef.current.handleStickyChange?.(id, val),
              onChangeStyle: (id, style) => handlersRef.current.handleStickyStyleChange?.(id, style),
              onDelete: (id) => handlersRef.current.handleDeleteNode?.(id)
            }
          };
        }
        return {
          ...node,
          data: {
            ...node.data,
            onNavigate: (path, stateData) => handlersRef.current.handleNavigate?.(path, stateData),
            onDeleteNode: (id) => handlersRef.current.handleDeleteNode?.(id)
          }
        };
      });
      return { nodes: restoredNodes, edges: store.canvasEdges || [] };
    }
    return generateDefaultLayout();
  }, [store.canvasNodes, store.canvasEdges, generateDefaultLayout]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialData.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialData.edges);

  // Sticky Handlers & Actions
  const handleStickyChange = useCallback((id, newText) => {
    setNodes((nds) => nds.map(n => n.id === id ? { ...n, data: { ...n.data, text: newText } } : n));
  }, [setNodes]);

  const handleStickyStyleChange = useCallback((id, styleUpdates) => {
    setNodes((nds) => nds.map(n => n.id === id ? { ...n, data: { ...n.data, ...styleUpdates } } : n));
  }, [setNodes]);

  const handleDeleteNode = useCallback((id) => {
    if (window.confirm("Remove this element from the canvas?")) {
      setNodes((nds) => nds.filter(n => n.id !== id));
      setEdges((eds) => eds.filter(e => e.source !== id && e.target !== id));
    }
  }, [setNodes, setEdges]);

  const handleNavigate = useCallback((path, stateData) => {
    navigate(path, { state: stateData });
  }, [navigate]);

  useEffect(() => {
    handlersRef.current = { handleStickyChange, handleStickyStyleChange, handleDeleteNode, handleNavigate };
  }, [handleStickyChange, handleStickyStyleChange, handleDeleteNode, handleNavigate]);

  // Save layout debounced
  const saveLayout = useCallback(() => {
    const cleanNodes = nodes.map(n => {
      const { onChange: _o, onChangeStyle: _s, onDelete: _d, onNavigate: _nav, onDeleteNode: _del, ...cleanData } = n.data || {};
      return { ...n, data: cleanData };
    });
    useStore.getState().setCanvasNodes(cleanNodes);
    useStore.getState().setCanvasEdges(edges);
  }, [nodes, edges]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      saveLayout();
    }, 1200);
    return () => clearTimeout(timeout);
  }, [nodes, edges, saveLayout]);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  // REAL-TIME AUTO-SYNCHRONIZATION FOR ALL OS MODULES
  useEffect(() => {
    setNodes((currentNodes) => {
      const existingNodeIds = new Set(currentNodes.map(n => n.id));
      let hasChanges = false;
      const newNodes = [...currentNodes];
      const newEdges = [];

      // Helper to check and inject missing element
      const syncCluster = (categoryId, label, icon, color, posX, posY, items, mapFn) => {
        if (!items || items.length === 0) return;

        // Ensure Category Node
        if (!existingNodeIds.has(categoryId)) {
          newNodes.push({
            id: categoryId,
            type: 'category',
            position: { x: posX, y: posY },
            data: { label, icon, color, count: items.length }
          });
          existingNodeIds.add(categoryId);
          newEdges.push({ id: `e-root-${categoryId}`, source: 'root', target: categoryId, animated: true, style: { stroke: color, strokeWidth: 2 } });
          hasChanges = true;
        }

        items.forEach((item, idx) => {
          const mapped = mapFn(item, idx);
          const nodeId = mapped.id || `${categoryId}-${idx}`;

          if (!existingNodeIds.has(nodeId)) {
            const angle = (idx / Math.max(1, items.length)) * Math.PI * 2 - Math.PI / 2;
            const radius = Math.max(340, Math.min(650, items.length * 60));
            newNodes.push({
              id: nodeId,
              type: mapped.type,
              position: { x: posX + Math.cos(angle) * radius, y: posY + Math.sin(angle) * radius },
              data: { ...mapped.data, onNavigate: handleNavigate, onDeleteNode: handleDeleteNode }
            });
            existingNodeIds.add(nodeId);
            newEdges.push({ id: `e-${categoryId}-${nodeId}`, source: categoryId, target: nodeId, style: { stroke: color, strokeWidth: 1.5, strokeDasharray: '4 4' } });
            hasChanges = true;
          } else {
            // Keep content and details updated
            const nodeIndex = newNodes.findIndex(n => n.id === nodeId);
            if (nodeIndex !== -1) {
              newNodes[nodeIndex] = {
                ...newNodes[nodeIndex],
                data: {
                  ...newNodes[nodeIndex].data,
                  ...mapped.data,
                  onNavigate: handleNavigate,
                  onDeleteNode: handleDeleteNode
                }
              };
            }
          }
        });
      };

      // 1. Documents
      syncCluster('documents', 'DOCUMENTS', '📄', '#38bdf8', 0, -850, store.editorFiles || [], (f) => ({
        id: `doc-${f.id}`,
        type: 'document',
        data: { id: f.id, name: f.name, folder: f.folder, content: f.content, timestamp: f.timestamp }
      }));

      // 2. Targets & Goals
      const allGoalsList = [
        ...(store.targets || []).map(t => ({ ...t, isTarget: true, title: t.title, progress: t.progress || 0 })),
        ...(store.goals?.year || []).map(g => ({ ...g, isTarget: false, title: g.text, category: 'Year Goal' })),
        ...(store.goals?.month || []).map(g => ({ ...g, isTarget: false, title: g.text, category: 'Month Goal' })),
        ...(store.goals?.week || []).map(g => ({ ...g, isTarget: false, title: g.text, category: 'Week Goal' }))
      ];
      syncCluster('targets', 'TARGETS & GOALS', '🎯', '#10b981', 850, -550, allGoalsList, (g, i) => ({
        id: `target-${g.id || i}`,
        type: 'targetGoal',
        data: { title: g.title, progress: g.progress, isTarget: g.isTarget, completed: g.completed, category: g.category, deadline: g.deadline }
      }));

      // 3. Habits
      syncCluster('habits', 'HABITS', '⚡', '#a855f7', -850, -550, store.customHabitTemplates || [], (h, i) => ({
        id: `habit-${h.id || i}`,
        type: 'habit',
        data: { title: h.name, repeat: h.repeat, category: h.category }
      }));

      // 4. Workouts
      syncCluster('workouts', 'WORKOUTS', '🏋️', '#f43f5e', -950, 200, store.workouts || [], (w, i) => ({
        id: `workout-${w.id || i}`,
        type: 'workout',
        data: { title: w.name || 'Workout', date: w.date, duration: w.duration, exercisesCount: w.exercises?.length }
      }));

      // 5. Journal
      syncCluster('journal', 'JOURNAL', '📔', '#6366f1', -550, 850, store.journal || [], (j, i) => ({
        id: `journal-${j.id || i}`,
        type: 'journal',
        data: { title: j.title || 'Entry', date: j.date, mood: j.mood, excerpt: j.content?.slice(0, 80) }
      }));

      // 6. Finances
      syncCluster('finance', 'FINANCES', '💰', '#f59e0b', 550, 850, (store.expenses || []).slice(-15), (e, i) => ({
        id: `expense-${e.id || i}`,
        type: 'finance',
        data: { title: e.note || e.category, amount: `${e.amount} ${store.profile?.currencySymbol || '€'}`, category: e.category, date: e.date }
      }));

      // 7. Books
      syncCluster('books', 'LIBRARY', '📚', '#ec4899', 950, 200, store.books || [], (b, i) => ({
        id: `book-${b.id || i}`,
        type: 'media',
        data: { title: b.title, subtitle: b.subtitle, img: b.img, color: '#ec4899', icon: '📖', badge: `${b.rating || 5} ★`, tags: [b.status].filter(Boolean), targetRoute: '/books' }
      }));

      // 8. Movies
      syncCluster('movies', 'CINEMA', '🎬', '#8b5cf6', 850, 600, store.movies || [], (m, i) => ({
        id: `movie-${m.id || i}`,
        type: 'media',
        data: { title: m.title, subtitle: m.genre, img: m.poster, color: '#8b5cf6', icon: '🎬', badge: m.status || 'Watched', tags: [m.rating ? `${m.rating} ★` : null].filter(Boolean), targetRoute: '/movies' }
      }));

      // 9. Trips
      syncCluster('trips', 'TRIP MODE', '✈️', '#06b6d4', -850, 600, store.trips || [], (t, i) => ({
        id: `trip-${t.id || i}`,
        type: 'media',
        data: { title: t.location, subtitle: t.date ? new Date(t.date).toLocaleDateString() : '', color: '#06b6d4', icon: '✈️', badge: t.type || 'Trip', tags: [t.resolvedCountry].filter(Boolean), targetRoute: '/trips' }
      }));

      // 10. Timetable
      syncCluster('timetable', 'TIMETABLE', '📅', '#14b8a6', 450, -850, store.timetableBlocks || [], (tb, i) => ({
        id: `tb-${tb.id || i}`,
        type: 'timetable',
        data: { title: tb.title || tb.activity, day: tb.day, time: `${tb.startTime || ''} - ${tb.endTime || ''}` }
      }));

      if (newEdges.length > 0) {
        setEdges(eds => {
          const edgeSet = new Set(eds.map(e => e.id));
          return [...eds, ...newEdges.filter(e => !edgeSet.has(e.id))];
        });
      }

      return hasChanges ? newNodes : currentNodes;
    });
  }, [store, handleNavigate, handleDeleteNode, setEdges, setNodes]);

  // Quick Add Methods
  const addDocumentNote = () => {
    const title = window.prompt("Titel des Dokuments (z.B. 'Research.md'):", "Neue Notiz.md");
    if (!title) return;
    const newFile = {
      id: Date.now(),
      name: title.endsWith('.md') ? title : `${title}.md`,
      folder: 'Inbox',
      content: `# ${title.replace('.md', '')}\n\nErstellt im Canvas.`,
      timestamp: Date.now()
    };
    useStore.getState().setEditorFiles(prev => [newFile, ...(prev || [])]);
  };

  const addStickyNote = () => {
    const newNode = {
      id: `sticky-${Date.now()}`,
      type: 'sticky',
      position: { x: 50, y: 50 },
      data: {
        text: '',
        color: '#fef08a',
        fontSize: '0.9rem',
        fontWeight: 'normal',
        onChange: (id, val) => handlersRef.current.handleStickyChange?.(id, val),
        onChangeStyle: (id, style) => handlersRef.current.handleStickyStyleChange?.(id, style),
        onDelete: (id) => handlersRef.current.handleDeleteNode?.(id)
      },
      dragHandle: '.custom-drag-handle'
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const resetCanvas = () => {
    if (window.confirm("Do you want to reset the entire canvas to the complete OS Solar Constellation? All elements from all modules will be freshly arranged radially.")) {
      const defaultLayout = generateDefaultLayout();
      useStore.getState().setCanvasNodes(null);
      useStore.getState().setCanvasEdges(null);
      setNodes(defaultLayout.nodes);
      setEdges(defaultLayout.edges);
    }
  };

  // Filtered nodes for visibility
  const displayedNodes = useMemo(() => {
    return nodes.map(node => {
      let isVisible = true;
      if (activeFilter !== 'all') {
        if (node.id === 'root') {
          isVisible = true;
        } else if (node.id === activeFilter || node.id.startsWith(`${activeFilter}-`)) {
          isVisible = true;
        } else {
          isVisible = false;
        }
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const text = `${node.data?.label || ''} ${node.data?.title || ''} ${node.data?.name || ''} ${node.data?.content || ''}`.toLowerCase();
        if (!text.includes(q) && node.id !== 'root') {
          isVisible = false;
        }
      }

      return {
        ...node,
        style: {
          ...node.style,
          opacity: isVisible ? 1 : 0.15,
          pointerEvents: isVisible ? 'all' : 'none',
          transition: 'opacity 0.25s ease'
        }
      };
    });
  }, [nodes, activeFilter, searchQuery]);

  const totalCount = nodes.filter(n => n.id !== 'root' && n.type !== 'category').length;

  return (
    <div style={{ width: '100%', height: 'calc(100vh - 60px)', background: 'var(--bg-body, #0a0f1d)', position: 'relative' }}>
      <ReactFlow
        nodes={displayedNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.08}
        maxZoom={2.5}
      >
        <Background color="var(--border-color, #334155)" gap={32} size={1} />
        <Controls style={{ background: 'var(--bg-card, #1e293b)', border: '1px solid var(--border-color, #334155)' }} />
        <MiniMap
          nodeColor={(n) => {
            if (n.type === 'category') return n.data?.color || '#38bdf8';
            if (n.type === 'document') return '#38bdf8';
            if (n.type === 'targetGoal') return '#10b981';
            if (n.type === 'habit') return '#a855f7';
            if (n.type === 'workout') return '#f43f5e';
            if (n.type === 'journal') return '#6366f1';
            if (n.type === 'finance') return '#f59e0b';
            if (n.type === 'sticky') return '#fef08a';
            return '#475569';
          }}
          maskColor="rgba(0,0,0,0.6)"
          style={{ background: 'var(--bg-main, #0f172a)' }}
        />

        {/* Top Left Title & Total OS Status */}
        <Panel position="top-left" style={{ background: 'rgba(15, 23, 42, 0.85)', padding: '12px 18px', borderRadius: '14px', color: '#fff', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.4rem' }}>🌌</span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ margin: 0, fontSize: '1.15rem', color: '#fff' }}>E.O.M OS Master Canvas</h2>
                <span style={{ background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', padding: '2px 8px', borderRadius: '10px', fontSize: '0.72rem', fontWeight: 'bold', border: '1px solid rgba(56, 189, 248, 0.4)' }}>
                  {totalCount} OS Elements
                </span>
              </div>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>Full interactive mindmap across all OS modules.</p>
            </div>
          </div>
        </Panel>

        {/* Top Right Action Buttons */}
        <Panel position="top-right" style={{ display: 'flex', gap: '8px', background: 'rgba(15, 23, 42, 0.85)', padding: '8px 12px', borderRadius: '14px', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }}>
          <input
            type="text"
            placeholder="🔍 Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'rgba(0,0,0,0.4)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '8px',
              padding: '4px 10px',
              color: '#fff',
              fontSize: '0.8rem',
              outline: 'none',
              width: '120px'
            }}
          />
          <button
            className="notion-button"
            onClick={addDocumentNote}
            style={{ margin: 0, padding: '6px 12px', fontSize: '0.8rem', background: 'linear-gradient(135deg, #0284c7, #0369a1)', color: '#fff', border: 'none', fontWeight: '600' }}
          >
            📄 + Note
          </button>
          <button
            className="notion-button secondary"
            onClick={addStickyNote}
            style={{ margin: 0, padding: '6px 12px', fontSize: '0.8rem' }}
          >
            ➕ Sticky
          </button>
          <button
            className="notion-button secondary"
            onClick={resetCanvas}
            style={{ margin: 0, padding: '6px 12px', fontSize: '0.8rem', color: '#ef4444' }}
            title="Reset to default solar constellation layout"
          >
            🔄 Reset
          </button>
        </Panel>

        {/* Bottom Filter Strip for OS Modules */}
        <Panel position="bottom-center" style={{ display: 'flex', gap: '6px', background: 'rgba(15, 23, 42, 0.9)', padding: '6px 10px', borderRadius: '30px', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 10px 40px rgba(0,0,0,0.6)', overflowX: 'auto', maxWidth: '90vw' }}>
          {[
            { id: 'all', label: '🌟 All' },
            { id: 'documents', label: '📄 Docs' },
            { id: 'targets', label: '🎯 Targets' },
            { id: 'habits', label: '⚡ Habits' },
            { id: 'workouts', label: '🏋️ Sport' },
            { id: 'journal', label: '📔 Journal' },
            { id: 'finance', label: '💰 Finance' },
            { id: 'books', label: '📚 Library' },
            { id: 'movies', label: '🎬 Cinema' },
            { id: 'trips', label: '✈️ Trips' },
            { id: 'skills', label: '🛡️ Skills' },
            { id: 'timetable', label: '📅 Routine' }
          ].map(filter => {
            const isActive = activeFilter === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                style={{
                  background: isActive ? 'linear-gradient(135deg, #38bdf8, #0284c7)' : 'transparent',
                  color: isActive ? '#ffffff' : '#94a3b8',
                  border: 'none',
                  borderRadius: '20px',
                  padding: '4px 12px',
                  fontSize: '0.75rem',
                  fontWeight: isActive ? '700' : '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                {filter.label}
              </button>
            );
          })}
        </Panel>
      </ReactFlow>
    </div>
  );
}
