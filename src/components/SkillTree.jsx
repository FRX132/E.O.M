import React, { useMemo, useEffect } from 'react';
import { ReactFlow, Background, Controls, Handle, Position, useNodesState, useEdgesState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useStore } from '../store';
import dagre from 'dagre';
import { SKILL_DEF } from '../constants';

const CATEGORY_COLORS = {
  Core: '#ffffff',
  Health: '#B8B062',
  Spirit: '#6B5B95',
  Social: '#9B4444',
  Career: '#2E5C3A',
  Mental: '#3B7A85'
};

const CustomSkillNode = ({ data }) => {
  const { node, isUnlocked, canUnlock, handleNodeClick } = data;
  
  const unlockedState = isUnlocked(node.id);
  const availableState = canUnlock(node) || unlockedState;
  const color = CATEGORY_COLORS[node.category] || '#777';

  if (node.id === 'core') {
     return (
      <div
        onClick={() => handleNodeClick(node)}
        style={{
          border: `2px solid ${color}`, background: 'rgba(20,20,20,0.9)', padding: '12px 24px', borderRadius: '8px',
          cursor: 'pointer', color: 'var(--text-main)', fontSize: '1rem', fontWeight: 'bold', boxShadow: `0 0 20px ${color}60`
        }}
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
        border: `1px solid ${unlockedState ? color : 'var(--border-color)'}`,
        background: unlockedState ? 'rgba(20,20,20,0.95)' : 'var(--bg-main)',
        padding: '6px 14px',
        borderRadius: '6px',
        cursor: 'pointer',
        opacity: unlockedState ? 1 : (availableState ? 0.7 : 0.3),
        color: unlockedState ? 'var(--text-main)' : 'var(--text-muted)',
        fontSize: '0.8rem',
        whiteSpace: 'nowrap',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        boxShadow: unlockedState ? `0 0 10px ${color}40` : 'none',
        transition: 'all 0.2s',
      }}
      title="View Details"
      className="custom-node-hover"
    >
      <Handle type="target" position={data.targetPos} style={{ visibility: 'hidden' }} />
      <span style={{ fontSize: '1rem' }}>{node.icon}</span>
      <span>{node.name}</span>
      <Handle type="source" position={data.sourcePos} style={{ visibility: 'hidden' }} />
    </div>
  );
};

const nodeTypes = { customSkill: CustomSkillNode };

export default function SkillTree() {
  const [selectedNode, setSelectedNode] = React.useState(null);

  const unlocked = useStore(state => state.skills);
  const setUnlocked = useStore(state => state.setSkills);
  
  const habitsDays = useStore(state => state.habits);
  const setHabitsDays = useStore(state => state.setHabits);

  const isUnlocked = React.useCallback((id) => unlocked.includes(id), [unlocked]);
  const canUnlock = React.useCallback((node) => {
    if (isUnlocked(node.id)) return false;
    return node.reqs.every(reqId => isUnlocked(reqId));
  }, [isUnlocked]);

  const handleNodeClick = (node) => {
    setSelectedNode(node);
  };

  const handleUnlockSkill = (node) => {
    if (isUnlocked(node.id)) return;
    if (canUnlock(node)) {
      setUnlocked([...unlocked, node.id]);
      
      if (node.habit) {
         const newHabit = { id: `h-${node.id}`, name: node.habit, done: false };
         const updatedDays = habitsDays.map(day => {
            if (day.habits.find(h => h.id === newHabit.id)) return day;
            return { ...day, habits: [...day.habits, newHabit] };
         });
         setHabitsDays(updatedDays);
      }
      setSelectedNode(null);
    }
  };

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
      data: { node: coreNode, isUnlocked, canUnlock, handleNodeClick },
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
            stroke: isCompleted ? CATEGORY_COLORS[node.category] : 'var(--text-muted)',
            strokeWidth: isCompleted ? 2.5 : 1.5,
            opacity: isCompleted || isAvailable ? 1 : 0.2
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
          data: { node: n, isUnlocked, canUnlock, handleNodeClick, targetPos: branch.targetPos, sourcePos: branch.sourcePos },
          position: { x: finalX, y: finalY }
        });
      });
      branch.edges.forEach(e => finalEdges.push(e));
    });

    return { layoutedNodes: finalNodes, layoutedEdges: finalEdges };
  }, [isUnlocked, canUnlock]); // Dependency tracks unlocked for data sync

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

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Skill Progression</h1>
        <p style={{ color: 'var(--text-muted)' }}>Unlock your potential. Prerequisites must be completed first.</p>
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
        >
          <Background color="rgba(255,255,255,0.05)" gap={30} size={2} />
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
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Daily Routine Needed</div>
                  <div style={{ fontWeight: 600 }}>{selectedNode.habit}</div>
               </div>
             )}

             <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
               {isUnlocked(selectedNode.id) ? (
                 <button className="notion-btn" disabled style={{ flex: 1, opacity: 0.5 }}>Already Unlocked</button>
               ) : canUnlock(selectedNode) ? (
                 <button className="notion-btn" style={{ flex: 1, background: CATEGORY_COLORS[selectedNode.category] || 'var(--primary)', color: '#fff', border: 'none', boxShadow: `0 0 10px ${CATEGORY_COLORS[selectedNode.category]}40` }} onClick={() => handleUnlockSkill(selectedNode)}>
                   Unlock Skill
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
