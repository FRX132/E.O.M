import React, { useMemo, useEffect } from 'react';
import { ReactFlow, Background, Controls, Handle, Position, useNodesState, useEdgesState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useStore } from '../store';
import dagre from 'dagre';
import { SKILL_DEF } from '../constants';

const TreeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
    <path d="M8.416.223a.5.5 0 0 0-.832 0l-3 4.5A.5.5 0 0 0 5 5.5h.098L3.076 8.735A.5.5 0 0 0 3.5 9.5h.191l-1.638 3.276a.5.5 0 0 0 .447.724H7V16h2v-2.5h4.5a.5.5 0 0 0 .447-.724L12.31 9.5h.191a.5.5 0 0 0 .424-.765L10.902 5.5H11a.5.5 0 0 0 .416-.777l-3-4.5zM6.437 4.758A1.5 1.5 0 0 0 5 5.5h-.01L8 1.01l3.01 4.49H11a1.5 1.5 0 0 0-1.437-.742l-3.126.5z"/>
  </svg>
);

const CATEGORY_COLORS = {
  Core: '#ffffff',
  Health: '#B8B062',
  Spirit: '#6B5B95',
  Social: '#9B4444',
  Career: '#2E5C3A',
  Mental: '#3B7A85'
};

const CustomSkillNode = ({ data }) => {
  const { node, isUnlocked, canUnlock, handleNodeClick, theme } = data;
  
  const unlockedState = isUnlocked(node.id);
  const color = CATEGORY_COLORS[node.category] || '#777';
  const isDark = theme === 'dark';

  const nodeBg = unlockedState 
    ? (isDark ? 'rgba(30, 30, 30, 0.98)' : 'rgba(255, 255, 255, 1)') 
    : (isDark ? 'rgba(20, 20, 20, 0.4)' : 'rgba(240, 240, 240, 0.3)');
  
  const nodeText = unlockedState
    ? (isDark ? '#fff' : '#1a1a1b')
    : (isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.4)');

  const nodeBorder = unlockedState
    ? color
    : (isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)');

  if (node.id === 'core') {
     return (
      <div
        onClick={() => handleNodeClick(node)}
        style={{
          border: `2px solid ${color}`, 
          background: isDark ? 'rgba(20,20,20,0.9)' : '#1a1a1b', 
          padding: '12px 24px', 
          borderRadius: '12px',
          cursor: 'pointer', 
          color: '#fff', 
          fontSize: '1rem', 
          fontWeight: 'bold', 
          boxShadow: isDark ? `0 0 20px ${color}40` : '0 10px 30px rgba(0,0,0,0.2)',
          transition: 'transform 0.2s ease',
        }}
        className="skill-node-core"
        title="Life Tree - Your core"
      >
        <Handle type="source" position={Position.Top} id="s-top" style={{visibility: 'hidden'}} />
        <Handle type="source" position={Position.Right} id="s-right" style={{visibility: 'hidden'}} />
        <Handle type="source" position={Position.Bottom} id="s-bottom" style={{visibility: 'hidden'}} />
        <Handle type="source" position={Position.Left} id="s-left" style={{visibility: 'hidden'}} />
        <span>{node.icon} {node.name}</span>
      </div>
     );
  }

  return (
    <div
      onClick={() => handleNodeClick(node)}
      style={{
        border: `1.5px solid ${nodeBorder}`,
        background: nodeBg,
        padding: '8px 16px',
        borderRadius: '10px',
        cursor: 'pointer',
        opacity: unlockedState ? 1 : 1, // Keep opacity high but use text color for state
        color: nodeText,
        fontSize: '0.9rem',
        fontWeight: unlockedState ? 600 : 500,
        whiteSpace: 'nowrap',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        boxShadow: unlockedState ? (isDark ? `0 0 15px ${color}30` : `0 4px 12px ${color}20`) : 'none',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        backdropFilter: 'blur(8px)',
      }}
      title="View Details"
      className="custom-skill-node"
    >
      <Handle type="target" position={data.targetPos} style={{ visibility: 'hidden' }} />
      <span style={{ 
        fontSize: '1.2rem', 
        filter: unlockedState ? 'none' : 'grayscale(100%) brightness(0.8)',
        opacity: unlockedState ? 1 : 0.6
      }}>{node.icon}</span>
      <span>{node.name}</span>
      <Handle type="source" position={data.sourcePos} style={{ visibility: 'hidden' }} />
    </div>
  );
};

const nodeTypes = { customSkill: CustomSkillNode };

export default function SkillTree() {
  const [selectedNode, setSelectedNode] = React.useState(null);
  const theme = useStore(state => state.theme);
  const unlocked = useStore(state => state.skills);
  
  const xp = useStore(state => state.profile.xp || 0);
  const activeQuests = useStore(state => state.activeQuests || []);
  const startQuest = useStore(state => state.startQuest);

  const isUnlocked = React.useCallback((id) => unlocked.includes(id), [unlocked]);
  const canUnlock = React.useCallback((node) => {
    if (isUnlocked(node.id)) return false;
    return node.reqs.every(reqId => isUnlocked(reqId));
  }, [isUnlocked]);

  const handleNodeClick = (node) => {
    setSelectedNode(node);
  };

  const handleStartQuest = (node) => {
    if (isUnlocked(node.id)) return;
    if (activeQuests.some(q => q.skillId === node.id)) return;
    
    if (canUnlock(node) && xp >= (node.xpReq || 0)) {
      startQuest(node.id, node.duration || 1);
      setSelectedNode(null);
    }
  };

  const getActiveQuest = (id) => activeQuests.find(q => q.skillId === id);

  // 1. Calculate static layout in useMemo
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

    const coreNode = SKILL_DEF.find(n => n.id === 'core');
    finalNodes.push({
      id: 'core',
      type: 'customSkill',
      data: { node: coreNode, isUnlocked, canUnlock, handleNodeClick, theme },
      position: { x: 0, y: 0 }
    });

    SKILL_DEF.forEach(node => {
      if (node.id === 'core') return;
      
      const branch = branches[node.category];
      if (branch) branch.nodes.push(node);
      
      node.reqs.forEach(reqId => {
        const isCompleted = isUnlocked(node.id);
        const isAvailable = canUnlock(node) || isCompleted;
        const edge = {
          id: `e-${reqId}-${node.id}`,
          source: reqId,
          target: node.id,
          animated: !isCompleted && isAvailable,
          style: {
            stroke: isCompleted ? CATEGORY_COLORS[node.category] : (theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'),
            strokeWidth: isCompleted ? 3 : 1.5,
            opacity: isCompleted || isAvailable ? 1 : 0.3
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

    Object.keys(branches).forEach(cat => {
      const branch = branches[cat];
      const g = new dagre.graphlib.Graph();
      g.setDefaultEdgeLabel(() => ({}));
      g.setGraph({ rankdir: branch.dir, ranksep: 100, nodesep: 20 }); 

      branch.nodes.forEach(n => g.setNode(n.id, { width: 140, height: 35 }));
      branch.edges.forEach(e => g.setEdge(e.source, e.target));
      dagre.layout(g);

      let minX = 0, minY = 0, maxX = 0, maxY = 0;
      branch.nodes.forEach((n, i) => {
        const pos = g.node(n.id);
        if (i === 0) { minX = pos.x; minY = pos.y; maxX = pos.x; maxY = pos.y; }
        minX = Math.min(minX, pos.x); minY = Math.min(minY, pos.y);
        maxX = Math.max(maxX, pos.x); maxY = Math.max(maxY, pos.y);
      });

      branch.nodes.forEach(n => {
        const pos = g.node(n.id);
        let finalX = pos.x;
        let finalY = pos.y;
        const offsetDist = 130;
        
        if (branch.dir === 'LR') {
           finalX = pos.x - minX + offsetDist; 
           finalY = pos.y - (minY + maxY)/2;
           if (cat === 'Career') finalY += 120;
           if (cat === 'Social') finalY -= 120;
        } else if (branch.dir === 'RL') {
           finalX = pos.x - maxX - offsetDist;
           finalY = pos.y - (minY + maxY)/2;
        } else if (branch.dir === 'BT') {
           finalY = pos.y - maxY - offsetDist;
           finalX = pos.x - (minX + maxX)/2;
        } else if (branch.dir === 'TB') {
           finalY = pos.y - minY + offsetDist;
           finalX = pos.x - (minX + maxX)/2;
        }
        
        finalNodes.push({
          id: n.id,
          type: 'customSkill',
          data: { node: n, isUnlocked, canUnlock, handleNodeClick, targetPos: branch.targetPos, sourcePos: branch.sourcePos, theme },
          position: { x: finalX, y: finalY }
        });
      });
      branch.edges.forEach(e => finalEdges.push(e));
    });

    return { layoutedNodes: finalNodes, layoutedEdges: finalEdges };
  }, [isUnlocked, canUnlock, theme]); // Dependency tracks unlocked for data sync

  // 2. Map Layout into ReactFlow state hooks to allow dragging
  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  // 3. Keep data (colors, borders, clicks) synced without resetting X/Y positions
  useEffect(() => {
    setNodes((nds) => nds.map((n) => {
      const freshNode = layoutedNodes.find((ln) => ln.id === n.id);
      return freshNode ? { ...n, data: freshNode.data } : n;
    }));

    setEdges((eds) => eds.map((e) => {
      const freshEdge = layoutedEdges.find((le) => le.id === e.id);
      return freshEdge ? { ...freshEdge } : e;
    }));
  }, [layoutedNodes, layoutedEdges, setNodes, setEdges]);

  const [isSnapEnabled, setIsSnapEnabled] = React.useState(true);
  const gridColor = theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.1)';

  return (
    <div className="premium-container" style={{ maxWidth: '1200px', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="premium-header-container" style={{ position: 'relative' }}>
        <div className="premium-icon-wrapper">
          <TreeIcon />
        </div>
        <h1 className="premium-title">Skill Progression</h1>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '8px' }}>
          <p className="premium-subtitle" style={{ margin: 0 }}>Unlock your potential. Prerequisites must be completed first.</p>
          <button 
            onClick={() => setIsSnapEnabled(!isSnapEnabled)}
            style={{
              padding: '4px 12px',
              fontSize: '0.7rem',
              borderRadius: '20px',
              border: `1px solid ${isSnapEnabled ? 'var(--primary)' : 'var(--border-color)'}`,
              background: isSnapEnabled ? 'var(--primary)' : 'transparent',
              color: isSnapEnabled ? '#fff' : 'var(--text-muted)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              textTransform: 'uppercase',
              fontWeight: 600,
              letterSpacing: '0.5px'
            }}
          >
            Grid Snap: {isSnapEnabled ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      <div className="notion-block" style={{ flex: 1, padding: 0, height: '80vh', width: '100%', overflow: 'hidden' }}>
        <ReactFlow 
          nodes={nodes} 
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          minZoom={0.2}
          maxZoom={2}
          proOptions={{ hideAttribution: true }}
          snapToGrid={isSnapEnabled}
          snapGrid={[30, 30]}
        >
          <Background variant="lines" color={gridColor} gap={30} size={1} />
          <Controls style={{ display: 'flex', flexDirection: 'row' }} />
        </ReactFlow>
      </div>

      {selectedNode && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }} onClick={() => setSelectedNode(null)}>
          <div style={{
            background: 'var(--bg-card)', border: `1px solid ${CATEGORY_COLORS[selectedNode.category] || 'var(--border-color)'}`,
            padding: '30px', borderRadius: '12px', maxWidth: '400px', width: '90%',
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
            display: 'flex', flexDirection: 'column', gap: '16px'
          }} onClick={e => e.stopPropagation()}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div style={{ fontSize: '2rem' }}>{selectedNode.icon}</div>
               <div style={{ fontSize: '0.8rem', color: CATEGORY_COLORS[selectedNode.category] || 'var(--text-main)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>{selectedNode.category}</div>
             </div>
             <div>
               <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{selectedNode.name}</h2>
               <p style={{ color: 'var(--text-muted)', lineHeight: 1.5, fontSize: '0.9rem' }}>{selectedNode.desc}</p>
             </div>
             
              {selectedNode.habit && (
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px', marginTop: '8px' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Core Habit</div>
                  <div style={{ fontWeight: 600 }}>{selectedNode.habit}</div>
                </div>
              )}

              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px', marginTop: '8px' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Requirements</div>
                <div style={{ display: 'flex', gap: '15px', fontSize: '0.85rem' }}>
                  <div style={{ color: xp >= (selectedNode.xpReq || 0) ? 'var(--green-text)' : 'var(--red-text)' }}>
                    {selectedNode.xpReq || 0} XP
                  </div>
                  {selectedNode.duration && (
                    <div style={{ color: 'var(--blue-text)' }}>
                      {selectedNode.duration} Days
                    </div>
                  )}
                </div>
                {selectedNode.quest && (
                  <div style={{ marginTop: '8px', fontSize: '0.85rem', color: 'var(--text-main)', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '8px' }}>
                    <b>Quest:</b> {selectedNode.quest}
                  </div>
                )}
              </div>

              {getActiveQuest(selectedNode.id) && (
                <div style={{ marginTop: '8px' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                     <span>Progression</span>
                     <span>{getActiveQuest(selectedNode.id).progress} / {getActiveQuest(selectedNode.id).total} Days</span>
                   </div>
                   <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ 
                        width: `${(getActiveQuest(selectedNode.id).progress / getActiveQuest(selectedNode.id).total) * 100}%`, 
                        height: '100%', 
                        background: 'var(--primary)',
                        transition: 'width 0.3s'
                      }} />
                   </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                {isUnlocked(selectedNode.id) ? (
                  <button className="notion-btn" disabled style={{ flex: 1, opacity: 0.5 }}>Skill Unlocked</button>
                ) : getActiveQuest(selectedNode.id) ? (
                   <button className="notion-btn" disabled style={{ flex: 1, border: '1px solid var(--primary)', color: 'var(--primary)', background: 'transparent' }}>Quest in Progress</button>
                ) : canUnlock(selectedNode) ? (
                  <button 
                    className="notion-btn" 
                    style={{ 
                      flex: 1, 
                      background: xp >= (selectedNode.xpReq || 0) ? (CATEGORY_COLORS[selectedNode.category] || 'var(--primary)') : 'var(--border-color)', 
                      color: '#fff', 
                      border: 'none', 
                      boxShadow: xp >= (selectedNode.xpReq || 0) ? `0 0 10px ${CATEGORY_COLORS[selectedNode.category]}40` : 'none',
                      cursor: xp >= (selectedNode.xpReq || 0) ? 'pointer' : 'not-allowed'
                    }} 
                    onClick={() => xp >= (selectedNode.xpReq || 0) && handleStartQuest(selectedNode)}
                  >
                    {xp >= (selectedNode.xpReq || 0) ? 'Start Unlock Quest' : 'Not enough XP'}
                  </button>
                ) : (
                  <button className="notion-btn" disabled style={{ flex: 1, opacity: 0.5 }}>Prerequisites not met</button>
                )}
                <button className="notion-btn secondary" onClick={() => setSelectedNode(null)}>Close</button>
              </div>
          </div>
        </div>
      )}
    </div>
  );
}
