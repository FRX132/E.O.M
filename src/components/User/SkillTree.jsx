import React, { useMemo, useEffect, useState, useCallback } from 'react';
import { ReactFlow, Background, Controls, Handle, Position, useNodesState, useEdgesState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useStore } from '../../store';
import dagre from 'dagre';
import { SKILL_DEF } from '../../constants';
import { calculateRank } from '../../services/rankingService';
import SkillQuestDrawer from './SkillQuestDrawer';
import RankRoadmapModal from './RankRoadmapModal';
import LifeBalanceRadar from '../UI/LifeBalanceRadar';

const TreeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
    <path d="M8.416.223a.5.5 0 0 0-.832 0l-3 4.5A.5.5 0 0 0 5 5.5h.098L3.076 8.735A.5.5 0 0 0 3.5 9.5h.191l-1.638 3.276a.5.5 0 0 0 .447.724H7V16h2v-2.5h4.5a.5.5 0 0 0 .447-.724L12.31 9.5h.191a.5.5 0 0 0 .424-.765L10.902 5.5H11a.5.5 0 0 0 .416-.777l-3-4.5zM6.437 4.758A1.5 1.5 0 0 0 5 5.5h-.01L8 1.01l3.01 4.49H11a1.5 1.5 0 0 0-1.437-.742l-3.126.5z" />
  </svg>
);

const CATEGORY_COLORS = {
  Core: '#ffffff',
  Health: '#10b981', // Emerald
  Mental: '#06b6d4', // Cyan
  Spirit: '#a855f7', // Purple
  Social: '#ec4899', // Rose / Pink
  Career: '#f59e0b', // Amber / Gold
};

const CustomSkillNode = ({ data }) => {
  const { node, isUnlocked, canUnlock, activeQuest, handleNodeClick, theme, isDimmed, isHighlighted } = data;

  const unlockedState = isUnlocked(node.id);
  const color = CATEGORY_COLORS[node.category] || '#777';
  const isDark = theme === 'dark';
  const inProgress = !!activeQuest;
  const available = canUnlock(node) && !unlockedState && !inProgress;

  if (node.id === 'core') {
    return (
      <div
        onClick={() => handleNodeClick(node)}
        style={{
          border: `2px solid ${color}`,
          background: isDark ? 'rgba(20,20,24,0.95)' : '#1a1a1b',
          padding: '0 20px',
          height: '52px',
          width: '210px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '14px',
          cursor: 'pointer',
          color: '#fff',
          fontSize: '1rem',
          fontWeight: 800,
          boxShadow: isDark ? `0 0 25px ${color}50` : '0 10px 30px rgba(0,0,0,0.25)',
          transition: 'all 0.25s ease',
          opacity: isDimmed ? 0.2 : 1
        }}
        className="skill-node-core"
        title="Life Tree - Central Nexus"
      >
        <Handle type="source" position={Position.Top} id="s-top" style={{ visibility: 'hidden' }} />
        <Handle type="source" position={Position.Right} id="s-right" style={{ visibility: 'hidden' }} />
        <Handle type="source" position={Position.Bottom} id="s-bottom" style={{ visibility: 'hidden' }} />
        <Handle type="source" position={Position.Left} id="s-left" style={{ visibility: 'hidden' }} />
        <span>🌳 {node.name}</span>
      </div>
    );
  }

  // Border & Background styling
  let borderStyle = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';
  let bgStyle = isDark ? 'rgba(20, 20, 24, 0.45)' : 'rgba(240, 240, 240, 0.4)';
  let glowStyle = 'none';

  if (unlockedState) {
    borderStyle = color;
    bgStyle = isDark ? 'rgba(26, 26, 32, 0.95)' : '#ffffff';
    glowStyle = `0 0 16px ${color}35`;
  } else if (inProgress) {
    borderStyle = '#f59e0b';
    bgStyle = isDark ? 'rgba(30, 25, 18, 0.9)' : 'rgba(254, 243, 199, 0.9)';
    glowStyle = '0 0 14px rgba(245, 158, 11, 0.35)';
  } else if (available) {
    borderStyle = `${color}90`;
    bgStyle = isDark ? 'rgba(26, 26, 34, 0.75)' : 'rgba(245, 245, 250, 0.85)';
    glowStyle = `0 0 10px ${color}20`;
  }

  if (isHighlighted) {
    glowStyle = `0 0 20px #ffffff`;
    borderStyle = '#ffffff';
  }

  return (
    <div
      onClick={() => handleNodeClick(node)}
      style={{
        border: `1.5px solid ${borderStyle}`,
        background: bgStyle,
        padding: '0 10px',
        width: '184px',
        height: '46px',
        borderRadius: '11px',
        cursor: 'pointer',
        opacity: isDimmed ? 0.15 : 1,
        color: unlockedState ? (isDark ? '#fff' : '#111') : (isDark ? '#a1a1aa' : '#555'),
        fontSize: '0.86rem',
        fontWeight: unlockedState ? 700 : 500,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        boxShadow: glowStyle,
        transition: 'all 0.25s ease',
        backdropFilter: 'blur(10px)',
        position: 'relative',
        overflow: 'hidden'
      }}
      title={`${node.name} (${node.category})`}
      className={`custom-skill-node ${unlockedState ? 'unlocked' : ''} ${available ? 'available' : ''} ${inProgress ? 'in-progress' : ''}`}
    >
      <Handle type="target" position={data.targetPos} style={{ visibility: 'hidden' }} />
      
      {/* Icon */}
      <span style={{
        fontSize: '1.25rem',
        filter: unlockedState ? 'none' : (inProgress || available ? 'none' : 'grayscale(100%) opacity(0.6)'),
        flexShrink: 0
      }}>
        {node.icon}
      </span>

      {/* Name */}
      <span style={{
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        flex: 1
      }}>
        {node.name}
      </span>

      {/* Status indicator badge */}
      {unlockedState && (
        <span style={{ fontSize: '0.75rem', color: color, flexShrink: 0 }} title="Unlocked">
          ✓
        </span>
      )}
      {inProgress && (
        <span style={{ fontSize: '0.7rem', color: '#f59e0b', fontWeight: 800, flexShrink: 0 }} title="Quest In Progress">
          ⏳
        </span>
      )}
      {available && (
        <span style={{ fontSize: '0.7rem', color: color, fontWeight: 700, flexShrink: 0 }} title="Ready to Unlock">
          🔓
        </span>
      )}

      {/* Quest progress mini-bar */}
      {inProgress && activeQuest && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'rgba(255,255,255,0.1)'
        }}>
          <div style={{
            height: '100%',
            width: `${Math.min((activeQuest.progress / activeQuest.total) * 100, 100)}%`,
            background: '#f59e0b',
            transition: 'width 0.3s'
          }} />
        </div>
      )}

      <Handle type="source" position={data.sourcePos} style={{ visibility: 'hidden' }} />
    </div>
  );
};

const nodeTypes = { customSkill: CustomSkillNode };

export default function SkillTree() {
  const [selectedNode, setSelectedNode] = useState(null);
  const [isQuestDrawerOpen, setIsQuestDrawerOpen] = useState(false);
  const [isRankModalOpen, setIsRankModalOpen] = useState(false);
  const [isRadarModalOpen, setIsRadarModalOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSnapEnabled, setIsSnapEnabled] = useState(true);

  const theme = useStore((state) => state.theme);
  const unlocked = useStore((state) => state.skills || []);
  const xp = useStore((state) => state.profile?.xp || 0);
  const activeQuests = useStore((state) => state.activeQuests || []);
  const startQuest = useStore((state) => state.startQuest);
  const updateQuestProgress = useStore((state) => state.updateQuestProgress);
  const completeQuest = useStore((state) => state.completeQuest);
  const addXP = useStore((state) => state.addXP);

  const rankStats = useMemo(() => calculateRank(xp), [xp]);

  const isUnlocked = useCallback((id) => unlocked.includes(id), [unlocked]);
  const canUnlock = useCallback((node) => {
    if (isUnlocked(node.id)) return false;
    return (node.reqs || []).every((reqId) => isUnlocked(reqId));
  }, [isUnlocked]);

  const getActiveQuest = useCallback(
    (id) => activeQuests.find((q) => q.skillId === id),
    [activeQuests]
  );

  const handleNodeClick = (node) => {
    setSelectedNode(node);
  };

  const handleStartQuest = (node) => {
    if (isUnlocked(node.id)) return;
    if (activeQuests.some((q) => q.skillId === node.id)) return;

    if (canUnlock(node) && xp >= (node.xpReq || 0)) {
      startQuest(node.id, node.duration || 1);
      setSelectedNode(null);
    }
  };

  const handleAdvanceQuestInModal = (nodeId) => {
    updateQuestProgress(nodeId);
    addXP(100);
  };

  const handleCompleteQuestInModal = (nodeId) => {
    completeQuest(nodeId);
    addXP(250);
    setSelectedNode(null);
  };

  // Branch statistics
  const branchStats = useMemo(() => {
    const cats = ['Health', 'Mental', 'Spirit', 'Social', 'Career'];
    const stats = {};
    cats.forEach((cat) => {
      const skillsInCat = SKILL_DEF.filter((s) => s.category === cat);
      const unlockedCount = skillsInCat.filter((s) => isUnlocked(s.id)).length;
      stats[cat] = {
        total: skillsInCat.length,
        unlocked: unlockedCount,
        pct: skillsInCat.length > 0 ? Math.round((unlockedCount / skillsInCat.length) * 100) : 0
      };
    });
    return stats;
  }, [isUnlocked]);

  // Layout calculation in useMemo
  const { layoutedNodes, layoutedEdges } = useMemo(() => {
    const branches = {
      Health: { dir: 'RL', targetPos: Position.Right, sourcePos: Position.Left, nodes: [], edges: [] },
      Spirit: { dir: 'BT', targetPos: Position.Bottom, sourcePos: Position.Top, nodes: [], edges: [] },
      Social: { dir: 'LR', targetPos: Position.Left, sourcePos: Position.Right, nodes: [], edges: [] },
      Career: { dir: 'LR', targetPos: Position.Left, sourcePos: Position.Right, nodes: [], edges: [] },
      Mental: { dir: 'TB', targetPos: Position.Top, sourcePos: Position.Bottom, nodes: [], edges: [] },
    };

    const finalNodes = [];
    const finalEdges = [];

    const coreNode = SKILL_DEF.find((n) => n.id === 'core');
    finalNodes.push({
      id: 'core',
      type: 'customSkill',
      data: {
        node: coreNode,
        isUnlocked,
        canUnlock,
        activeQuest: null,
        handleNodeClick,
        theme,
        isDimmed: categoryFilter !== 'All',
        isHighlighted: false
      },
      position: { x: 0, y: 0 }
    });

    SKILL_DEF.forEach((node) => {
      if (node.id === 'core') return;

      const branch = branches[node.category];
      if (branch) branch.nodes.push(node);

      (node.reqs || []).forEach((reqId) => {
        const isCompleted = isUnlocked(node.id);
        const isAvailable = canUnlock(node) || isCompleted;
        const edge = {
          id: `e-${reqId}-${node.id}`,
          source: reqId,
          target: node.id,
          animated: !isCompleted && isAvailable,
          style: {
            stroke: isCompleted
              ? CATEGORY_COLORS[node.category]
              : theme === 'dark'
              ? 'rgba(255,255,255,0.12)'
              : 'rgba(0,0,0,0.12)',
            strokeWidth: isCompleted ? 2.5 : 1.5,
            opacity: isCompleted || isAvailable ? 1 : 0.35
          }
        };

        if (reqId === 'core') {
          if (node.category === 'Health') edge.sourceHandle = 's-left';
          else if (node.category === 'Spirit') edge.sourceHandle = 's-top';
          else if (node.category === 'Social') edge.sourceHandle = 's-right';
          else if (node.category === 'Career') edge.sourceHandle = 's-right';
          else if (node.category === 'Mental') edge.sourceHandle = 's-bottom';
          finalEdges.push(edge);
        } else {
          if (branch) branch.edges.push(edge);
        }
      });
    });

    Object.keys(branches).forEach((cat) => {
      const branch = branches[cat];
      const g = new dagre.graphlib.Graph();
      g.setDefaultEdgeLabel(() => ({}));
      g.setGraph({ rankdir: branch.dir, ranksep: 110, nodesep: 38 });

      branch.nodes.forEach((n) => g.setNode(n.id, { width: 184, height: 46 }));
      branch.edges.forEach((e) => g.setEdge(e.source, e.target));
      dagre.layout(g);

      let minX = 0, minY = 0, maxX = 0, maxY = 0;
      branch.nodes.forEach((n, i) => {
        const pos = g.node(n.id);
        if (i === 0) { minX = pos.x; minY = pos.y; maxX = pos.x; maxY = pos.y; }
        minX = Math.min(minX, pos.x); minY = Math.min(minY, pos.y);
        maxX = Math.max(maxX, pos.x); maxY = Math.max(maxY, pos.y);
      });

      branch.nodes.forEach((n) => {
        const pos = g.node(n.id);
        let finalX = pos.x;
        let finalY = pos.y;
        const offsetDist = 150;

        if (branch.dir === 'LR') {
          finalX = pos.x - minX + offsetDist + 30;
          if (cat === 'Social') {
            finalY = pos.y - (minY + maxY) / 2 - 260;
          } else if (cat === 'Career') {
            finalY = pos.y - (minY + maxY) / 2 + 260;
          }
        } else if (branch.dir === 'RL') {
          finalX = pos.x - maxX - offsetDist - 30;
          finalY = pos.y - (minY + maxY) / 2;
        } else if (branch.dir === 'BT') {
          finalY = pos.y - maxY - offsetDist - 30;
          finalX = pos.x - (minX + maxX) / 2;
        } else if (branch.dir === 'TB') {
          finalY = pos.y - minY + offsetDist + 30;
          finalX = pos.x - (minX + maxX) / 2;
        }

        // Filtering logic
        const qMatches = searchQuery.trim() === '' ||
          n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (n.habit && n.habit.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (n.desc && n.desc.toLowerCase().includes(searchQuery.toLowerCase()));

        const catMatches = categoryFilter === 'All' || n.category === categoryFilter;

        const isUnl = isUnlocked(n.id);
        const isProg = !!getActiveQuest(n.id);
        const isAvail = canUnlock(n) && !isUnl && !isProg;

        let statusMatches = true;
        if (statusFilter === 'Unlocked') statusMatches = isUnl;
        else if (statusFilter === 'InProgress') statusMatches = isProg;
        else if (statusFilter === 'Available') statusMatches = isAvail;
        else if (statusFilter === 'Locked') statusMatches = !isUnl && !isAvail && !isProg;

        const isMatch = qMatches && catMatches && statusMatches;
        const isDimmed = !isMatch && (searchQuery.trim() !== '' || categoryFilter !== 'All' || statusFilter !== 'All');
        const isHighlighted = searchQuery.trim() !== '' && qMatches;

        finalNodes.push({
          id: n.id,
          type: 'customSkill',
          data: {
            node: n,
            isUnlocked,
            canUnlock,
            activeQuest: getActiveQuest(n.id),
            handleNodeClick,
            targetPos: branch.targetPos,
            sourcePos: branch.sourcePos,
            theme,
            isDimmed,
            isHighlighted
          },
          position: { x: finalX, y: finalY }
        });
      });

      branch.edges.forEach((e) => finalEdges.push(e));
    });

    return { layoutedNodes: finalNodes, layoutedEdges: finalEdges };
  }, [isUnlocked, canUnlock, getActiveQuest, theme, categoryFilter, statusFilter, searchQuery]);

  // ReactFlow state hooks
  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  useEffect(() => {
    setNodes((nds) =>
      nds.map((n) => {
        const freshNode = layoutedNodes.find((ln) => ln.id === n.id);
        return freshNode ? { ...n, data: freshNode.data } : n;
      })
    );
    setEdges((eds) =>
      eds.map((e) => {
        const freshEdge = layoutedEdges.find((le) => le.id === e.id);
        return freshEdge ? { ...freshEdge } : e;
      })
    );
  }, [layoutedNodes, layoutedEdges, setNodes, setEdges]);

  const resetLayout = () => {
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  };

  const gridColor = theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.08)';

  return (
    <div className="premium-container skilltree-full-container" style={{ maxWidth: '1400px', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header */}
      <div className="skilltree-header">
        <div className="skilltree-header-top">
          <div className="skilltree-title-group">
            <div className="premium-icon-wrapper">
              <TreeIcon />
            </div>
            <div>
              <h1 className="premium-title" style={{ fontSize: '1.4rem', margin: 0 }}>
                Life Tree & Skill Mastery
              </h1>
              <p className="premium-subtitle" style={{ fontSize: '0.8rem', margin: 0 }}>
                {unlocked.length} of {SKILL_DEF.length} skills mastered ({Math.round((unlocked.length / SKILL_DEF.length) * 100)}%)
              </p>
            </div>
          </div>

          {/* Header Action Shortcuts */}
          <div className="skilltree-actions-group">
            {/* Rank Button */}
            <button
              className="skill-rank-btn"
              onClick={() => setIsRankModalOpen(true)}
              style={{ borderColor: rankStats.currentRank.color }}
              title="Inspect Rank Hierarchy"
            >
              <span>{rankStats.currentRank.badge}</span>
              <span className="skill-rank-btn-text">
                RANK {rankStats.currentRank.rank} • {rankStats.currentRank.title}
              </span>
            </button>

            {/* Quest Log Button */}
            <button
              className="skill-quest-btn"
              onClick={() => setIsQuestDrawerOpen(true)}
              title="Open Active Quests"
            >
              <span>📜</span>
              <span>Quest Log</span>
              {activeQuests.length > 0 && (
                <span className="skill-quest-badge">{activeQuests.length}</span>
              )}
            </button>

            {/* Life Radar Button */}
            <button
              className="skill-radar-btn"
              onClick={() => setIsRadarModalOpen(true)}
              title="Open Life Balance Radar"
            >
              <span>🕸️</span>
              <span>Life Radar</span>
            </button>

            {/* Reset & Snap */}
            <button className="skilltree-tool-btn" onClick={resetLayout} title="Reset Diagram Layout">
              🔄 Reset
            </button>
            <button
              className={`skilltree-tool-btn ${isSnapEnabled ? 'active' : ''}`}
              onClick={() => setIsSnapEnabled(!isSnapEnabled)}
            >
              Grid: {isSnapEnabled ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        {/* Branch Completion Bar */}
        <div className="skilltree-branch-strip">
          {Object.entries(branchStats).map(([cat, stats]) => (
            <div
              key={cat}
              className={`branch-strip-item ${categoryFilter === cat ? 'active' : ''}`}
              onClick={() => setCategoryFilter(categoryFilter === cat ? 'All' : cat)}
            >
              <div className="branch-strip-label">
                <span style={{ color: CATEGORY_COLORS[cat] }}>●</span>
                <span>{cat}</span>
                <span className="branch-strip-count">{stats.unlocked}/{stats.total}</span>
              </div>
              <div className="branch-strip-bar">
                <div
                  className="branch-strip-fill"
                  style={{ width: `${stats.pct}%`, background: CATEGORY_COLORS[cat] }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Controls / Filter Bar */}
        <div className="skilltree-filter-bar">
          {/* Category Tabs */}
          <div className="skilltree-tabs">
            {['All', 'Health', 'Mental', 'Spirit', 'Social', 'Career'].map((cat) => (
              <button
                key={cat}
                className={`skill-tab-btn ${categoryFilter === cat ? 'active' : ''}`}
                onClick={() => setCategoryFilter(cat)}
                style={{
                  '--cat-color': CATEGORY_COLORS[cat] || 'var(--primary)'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="skilltree-status-pills">
            {[
              { id: 'All', label: 'All Status' },
              { id: 'Unlocked', label: '✓ Unlocked' },
              { id: 'InProgress', label: '⏳ In Progress' },
              { id: 'Available', label: '🔓 Ready' },
              { id: 'Locked', label: '🔒 Locked' }
            ].map((st) => (
              <button
                key={st.id}
                className={`skill-status-pill ${statusFilter === st.id ? 'active' : ''}`}
                onClick={() => setStatusFilter(st.id)}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="skilltree-search-wrap">
            <input
              type="text"
              placeholder="Search skills, habits, perks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="skilltree-search-input"
            />
            {searchQuery && (
              <button className="skilltree-search-clear" onClick={() => setSearchQuery('')}>
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ReactFlow Canvas */}
      <div className="notion-block" style={{ flex: 1, padding: 0, height: '70vh', width: '100%', overflow: 'hidden' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.15}
          maxZoom={2.2}
          proOptions={{ hideAttribution: true }}
          snapToGrid={isSnapEnabled}
          snapGrid={[30, 30]}
        >
          <Background variant="lines" color={gridColor} gap={30} size={1} />
          <Controls style={{ display: 'flex', flexDirection: 'row' }} />
        </ReactFlow>
      </div>

      {/* Selected Skill Modal */}
      {selectedNode && (
        <div className="skill-modal-overlay" onClick={() => setSelectedNode(null)}>
          <div
            className="skill-modal-card"
            style={{
              borderColor: CATEGORY_COLORS[selectedNode.category] || 'var(--border-color)',
              '--modal-cat-color': CATEGORY_COLORS[selectedNode.category] || 'var(--primary)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="skill-modal-header">
              <div className="skill-modal-icon">{selectedNode.icon}</div>
              <div className="skill-modal-titles">
                <span className="skill-modal-cat-tag" style={{ color: CATEGORY_COLORS[selectedNode.category] }}>
                  {selectedNode.category} DOMAIN
                </span>
                <h2>{selectedNode.name}</h2>
              </div>
              <button className="skill-modal-close" onClick={() => setSelectedNode(null)}>
                ✕
              </button>
            </div>

            <p className="skill-modal-desc">{selectedNode.desc || 'No description available.'}</p>

            {/* Core Habit */}
            {selectedNode.habit && (
              <div className="skill-modal-section">
                <div className="skill-modal-sec-title">AUTOMATED CORE HABIT</div>
                <div className="skill-habit-row">
                  <span style={{ fontSize: '1.1rem' }}>⚡</span>
                  <div>
                    <b>{selectedNode.habit}</b>
                    <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Automatically synced to daily habits upon skill unlock
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Perk / Passive Buff */}
            {selectedNode.perk && (
              <div className="skill-modal-section">
                <div className="skill-modal-sec-title">PASSIVE RANK PERK</div>
                <div className="skill-perk-row">
                  <span>✨</span>
                  <span>{selectedNode.perk}</span>
                </div>
              </div>
            )}

            {/* Requirements & Quest */}
            <div className="skill-modal-section">
              <div className="skill-modal-sec-title">UNLOCK CRITERIA</div>
              <div className="skill-reqs-grid">
                <div className={`skill-req-pill ${xp >= (selectedNode.xpReq || 0) ? 'met' : 'unmet'}`}>
                  <span>{xp >= (selectedNode.xpReq || 0) ? '✓' : '✗'}</span>
                  <span>XP: {(selectedNode.xpReq || 0).toLocaleString()} (Have {xp.toLocaleString()})</span>
                </div>
                {selectedNode.duration && (
                  <div className="skill-req-pill met">
                    <span>⏱️</span>
                    <span>Quest Duration: {selectedNode.duration} Days</span>
                  </div>
                )}
              </div>

              {/* Prerequisite skills */}
              {selectedNode.reqs && selectedNode.reqs.length > 0 && selectedNode.id !== 'core' && (
                <div className="skill-prereqs-list">
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Prerequisites:</span>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                    {selectedNode.reqs.map((reqId) => {
                      const reqSkill = SKILL_DEF.find((s) => s.id === reqId);
                      const met = isUnlocked(reqId);
                      return (
                        <span key={reqId} className={`prereq-tag ${met ? 'met' : 'unmet'}`}>
                          {met ? '✓' : '🔒'} {reqSkill ? reqSkill.name : reqId}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {selectedNode.quest && (
                <div className="skill-quest-obj">
                  <b>Quest Task:</b> {selectedNode.quest}
                </div>
              )}
            </div>

            {/* Active Quest Status */}
            {getActiveQuest(selectedNode.id) && (
              <div className="skill-modal-section active-quest-box">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700 }}>
                  <span>Quest In Progress</span>
                  <span>{getActiveQuest(selectedNode.id).progress} / {getActiveQuest(selectedNode.id).total} Days</span>
                </div>
                <div className="quest-progress-track" style={{ marginTop: '6px' }}>
                  <div
                    className="quest-progress-fill"
                    style={{
                      width: `${Math.min((getActiveQuest(selectedNode.id).progress / getActiveQuest(selectedNode.id).total) * 100, 100)}%`,
                      background: '#f59e0b'
                    }}
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="skill-modal-actions">
              {isUnlocked(selectedNode.id) ? (
                <button className="notion-btn" disabled style={{ flex: 1, opacity: 0.6 }}>
                  ✓ Skill Mastered
                </button>
              ) : getActiveQuest(selectedNode.id) ? (
                <>
                  <button
                    className="notion-btn"
                    style={{ flex: 1, background: '#f59e0b', color: '#000', fontWeight: 800 }}
                    onClick={() => handleAdvanceQuestInModal(selectedNode.id)}
                  >
                    +1 Day Progress (+100 XP)
                  </button>
                  <button
                    className="notion-btn"
                    style={{ background: '#22c55e', color: '#fff', fontWeight: 800 }}
                    onClick={() => handleCompleteQuestInModal(selectedNode.id)}
                  >
                    Instant Unlock
                  </button>
                </>
              ) : canUnlock(selectedNode) ? (
                <button
                  className="notion-btn"
                  style={{
                    flex: 1,
                    background: xp >= (selectedNode.xpReq || 0) ? (CATEGORY_COLORS[selectedNode.category] || 'var(--primary)') : 'var(--border-color)',
                    color: '#fff',
                    fontWeight: 800,
                    cursor: xp >= (selectedNode.xpReq || 0) ? 'pointer' : 'not-allowed'
                  }}
                  onClick={() => xp >= (selectedNode.xpReq || 0) && handleStartQuest(selectedNode)}
                >
                  {xp >= (selectedNode.xpReq || 0) ? 'Initiate Unlock Quest' : 'Requires More XP'}
                </button>
              ) : (
                <button className="notion-btn" disabled style={{ flex: 1, opacity: 0.5 }}>
                  Prerequisites Locked
                </button>
              )}
              <button className="notion-btn secondary" onClick={() => setSelectedNode(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quest Drawer */}
      <SkillQuestDrawer
        isOpen={isQuestDrawerOpen}
        onClose={() => setIsQuestDrawerOpen(false)}
        onSelectSkill={(skill) => setSelectedNode(skill)}
      />

      {/* Rank Roadmap Modal */}
      <RankRoadmapModal
        isOpen={isRankModalOpen}
        onClose={() => setIsRankModalOpen(false)}
      />

      {/* Life Balance Radar Modal */}
      {isRadarModalOpen && (
        <div className="skill-modal-overlay" onClick={() => setIsRadarModalOpen(false)}>
          <div
            className="skill-modal-card"
            style={{ maxWidth: '440px', borderColor: '#6366f1', '--modal-cat-color': '#6366f1' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="skill-modal-header">
              <div className="skill-modal-icon">🕸️</div>
              <div className="skill-modal-titles">
                <span className="skill-modal-cat-tag" style={{ color: '#6366f1' }}>
                  HOLISTIC MASTERY RADAR
                </span>
                <h2>Life Balance Radar</h2>
              </div>
              <button className="skill-modal-close" onClick={() => setIsRadarModalOpen(false)}>
                ✕
              </button>
            </div>

            <p className="skill-modal-desc">
              Visual overview of your unlocked skills and progression balance across all 5 branches plus overall mastery.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0' }}>
              <LifeBalanceRadar mode="skills" width={320} height={320} />
            </div>

            <div className="skill-modal-actions">
              <button
                className="notion-btn"
                style={{ flex: 1, background: '#6366f1', color: '#fff', fontWeight: 800 }}
                onClick={() => setIsRadarModalOpen(false)}
              >
                Close Radar
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .skilltree-full-container {
          padding: 12px 20px 20px;
        }

        .skilltree-header {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 12px;
        }

        .skilltree-header-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }

        .skilltree-title-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .skilltree-actions-group {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .skill-rank-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          border-radius: 20px;
          border: 1.5px solid;
          background: rgba(255, 255, 255, 0.04);
          color: var(--text-main);
          font-size: 0.76rem;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s;
        }
        .skill-rank-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-1px);
        }

        .skill-quest-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 20px;
          border: 1px solid var(--border-color);
          background: rgba(255, 255, 255, 0.04);
          color: var(--text-main);
          font-size: 0.76rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }
        .skill-quest-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .skill-quest-badge {
          background: #f59e0b;
          color: #000;
          border-radius: 10px;
          padding: 1px 6px;
          font-size: 0.68rem;
          font-weight: 900;
        }

        .skill-radar-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 20px;
          border: 1px solid rgba(99, 102, 241, 0.4);
          background: rgba(99, 102, 241, 0.12);
          color: #a5b4fc;
          font-size: 0.76rem;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s;
        }
        .skill-radar-btn:hover {
          background: rgba(99, 102, 241, 0.25);
          border-color: #6366f1;
          color: #fff;
          transform: translateY(-1px);
        }

        .skilltree-tool-btn {
          padding: 6px 12px;
          font-size: 0.72rem;
          border-radius: 20px;
          border: 1px solid var(--border-color);
          background: rgba(255, 255, 255, 0.04);
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.2s;
          font-weight: 700;
          text-transform: uppercase;
        }
        .skilltree-tool-btn:hover {
          color: var(--text-main);
          background: rgba(255, 255, 255, 0.08);
        }
        .skilltree-tool-btn.active {
          background: var(--primary);
          color: #fff;
          border-color: var(--primary);
        }

        .skilltree-branch-strip {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 8px;
        }

        .branch-strip-item {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
          border-radius: 8px;
          padding: 6px 10px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .branch-strip-item:hover, .branch-strip-item.active {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .branch-strip-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.72rem;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .branch-strip-count {
          margin-left: auto;
          color: var(--text-muted);
          font-size: 0.7rem;
        }

        .branch-strip-bar {
          height: 4px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 2px;
          overflow: hidden;
        }

        .branch-strip-fill {
          height: 100%;
          border-radius: 2px;
          transition: width 0.3s;
        }

        .skilltree-filter-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          padding: 6px 0;
        }

        .skilltree-tabs {
          display: flex;
          gap: 6px;
          overflow-x: auto;
        }

        .skill-tab-btn {
          padding: 5px 12px;
          border-radius: 16px;
          font-size: 0.74rem;
          font-weight: 700;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.2s;
        }
        .skill-tab-btn:hover {
          color: var(--text-main);
          border-color: rgba(255, 255, 255, 0.2);
        }
        .skill-tab-btn.active {
          background: var(--cat-color);
          color: #fff;
          border-color: var(--cat-color);
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
        }

        .skilltree-status-pills {
          display: flex;
          gap: 5px;
        }

        .skill-status-pill {
          padding: 4px 10px;
          border-radius: 14px;
          font-size: 0.7rem;
          font-weight: 600;
          background: transparent;
          border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.2s;
        }
        .skill-status-pill:hover {
          color: var(--text-main);
        }
        .skill-status-pill.active {
          background: rgba(255, 255, 255, 0.12);
          color: #fff;
          border-color: rgba(255, 255, 255, 0.25);
        }

        .skilltree-search-wrap {
          position: relative;
          min-width: 220px;
        }

        .skilltree-search-input {
          width: 100%;
          padding: 6px 28px 6px 12px;
          border-radius: 20px;
          border: 1px solid var(--border-color);
          background: rgba(255, 255, 255, 0.04);
          color: var(--text-main);
          font-size: 0.78rem;
          outline: none;
        }
        .skilltree-search-input:focus {
          border-color: var(--primary);
          background: rgba(255, 255, 255, 0.08);
        }

        .skilltree-search-clear {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          font-size: 0.75rem;
        }

        /* Modal styling */
        .skill-modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: 20px;
          animation: modalFadeIn 0.2s ease-out;
        }

        @keyframes modalFadeIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }

        .skill-modal-card {
          background: var(--bg-card, #121215);
          border: 1.5px solid;
          border-radius: 16px;
          padding: 28px;
          max-width: 440px;
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 14px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7);
          color: var(--text-main);
        }

        .skill-modal-header {
          display: flex;
          align-items: center;
          gap: 14px;
          position: relative;
        }

        .skill-modal-icon {
          font-size: 2.2rem;
        }

        .skill-modal-titles {
          flex: 1;
        }

        .skill-modal-cat-tag {
          font-size: 0.68rem;
          font-weight: 800;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .skill-modal-titles h2 {
          margin: 2px 0 0;
          font-size: 1.25rem;
          font-weight: 800;
        }

        .skill-modal-close {
          background: transparent;
          border: none;
          color: var(--text-muted);
          font-size: 1.1rem;
          cursor: pointer;
        }
        .skill-modal-close:hover {
          color: #fff;
        }

        .skill-modal-desc {
          margin: 0;
          font-size: 0.88rem;
          color: var(--text-muted);
          line-height: 1.5;
        }

        .skill-modal-section {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 10px;
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .skill-modal-sec-title {
          font-size: 0.68rem;
          font-weight: 800;
          letter-spacing: 0.8px;
          color: var(--text-muted);
        }

        .skill-habit-row {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .skill-perk-row {
          display: flex;
          gap: 8px;
          align-items: center;
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--modal-cat-color);
        }

        .skill-reqs-grid {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .skill-req-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.78rem;
          padding: 4px 10px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.04);
        }
        .skill-req-pill.met {
          color: #22c55e;
        }
        .skill-req-pill.unmet {
          color: #ef4444;
        }

        .skill-prereqs-list {
          margin-top: 4px;
        }

        .prereq-tag {
          font-size: 0.72rem;
          padding: 2px 8px;
          border-radius: 10px;
          border: 1px solid;
        }
        .prereq-tag.met {
          border-color: rgba(34, 197, 94, 0.4);
          color: #22c55e;
          background: rgba(34, 197, 94, 0.1);
        }
        .prereq-tag.unmet {
          border-color: rgba(239, 68, 68, 0.4);
          color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
        }

        .skill-quest-obj {
          margin-top: 6px;
          padding-top: 6px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          font-size: 0.8rem;
          color: #d4d4d8;
        }

        .skill-modal-actions {
          display: flex;
          gap: 10px;
          margin-top: 6px;
        }

        @media (max-width: 900px) {
          .skilltree-header-top {
            flex-direction: column;
            align-items: flex-start;
          }
          .skilltree-filter-bar {
            flex-direction: column;
            align-items: stretch;
          }
          .skilltree-search-wrap {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
