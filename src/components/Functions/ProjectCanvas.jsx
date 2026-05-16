import React, { useMemo, useCallback, useEffect, useState } from 'react';
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

// Custom Node für Kategorien
const CategoryNode = ({ data }) => {
  return (
    <div style={{
      background: 'var(--bg-card)',
      padding: '15px 30px',
      borderRadius: '12px',
      border: `2px solid ${data.color || 'var(--primary)'}`,
      color: 'var(--text-main)',
      fontSize: '1.2rem',
      fontWeight: 'bold',
      boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
      textAlign: 'center',
      minWidth: '150px'
    }}>
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      {data.label}
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Left} style={{ opacity: 0 }} />
    </div>
  );
};

// Custom Node für Items (Bücher, Trips, Ziele)
const ItemNode = ({ data }) => {
  return (
    <div style={{
      background: 'var(--bg-main)',
      padding: '15px',
      borderRadius: '8px',
      border: '1px solid var(--border-light)',
      color: 'var(--text-main)',
      width: '220px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
      fontSize: '0.85rem'
    }}>
      <Handle type="target" position={Position.Top} style={{ background: '#555' }} />

      {data.img && (
        <div style={{ width: '100%', height: '100px', backgroundImage: `url(${data.img})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '4px', marginBottom: '10px' }}></div>
      )}

      <strong style={{ display: 'block', fontSize: '1rem', marginBottom: '5px' }}>{data.title}</strong>
      {data.subtitle && <div style={{ color: 'var(--text-muted)', marginBottom: '5px' }}>{data.subtitle}</div>}

      {data.tags && (
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '8px' }}>
          {data.tags.map(t => <span key={t} style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem' }}>{t}</span>)}
        </div>
      )}

      <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} />
    </div>
  );
};

// Sticky Note Node
const StickyNode = ({ id, data }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div className="nodrag" 
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
      background: data.color || '#fef08a',
      padding: '10px',
      borderRadius: '4px',
      width: data.color === 'transparent' ? 'auto' : '200px',
      minWidth: '100px',
      minHeight: data.color === 'transparent' ? 'auto' : '200px',
      boxShadow: data.color === 'transparent' ? 'none' : '4px 4px 10px rgba(0,0,0,0.3)',
      color: data.color === 'transparent' ? '#fff' : '#000',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative'
    }}>
      {hovered && (
        <div style={{ position: 'absolute', top: '-35px', left: 0, background: 'var(--bg-card)', padding: '5px', borderRadius: '6px', display: 'flex', gap: '5px', boxShadow: '0 4px 10px rgba(0,0,0,0.5)', zIndex: 10, alignItems: 'center' }}>
          {/* Colors */}
          {['#fef08a', '#bbf7d0', '#bfdbfe', '#fbcfe8', 'transparent'].map(c => (
             <div key={c} onClick={() => data.onChangeStyle && data.onChangeStyle(id, { color: c })} style={{ width: 16, height: 16, borderRadius: '50%', background: c === 'transparent' ? '#333' : c, border: c === 'transparent' ? '1px dashed #fff' : 'none', cursor: 'pointer' }} title={c === 'transparent' ? 'Transparent (Heading)' : 'Color'} />
          ))}
          <div style={{ width: 1, height: '16px', background: '#555', margin: '0 5px' }} />
          {/* Sizes */}
          {['0.9rem', '1.2rem', '1.8rem', '2.5rem'].map((s, i) => (
             <button key={s} onClick={() => data.onChangeStyle && data.onChangeStyle(id, { fontSize: s })} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '0 4px', fontSize: '0.8rem' }} title={`Size ${['S', 'M', 'L', 'XL'][i]}`}>{['S', 'M', 'L', 'XL'][i]}</button>
          ))}
          <div style={{ width: 1, height: '16px', background: '#555', margin: '0 5px' }} />
          {/* Bold */}
          <button onClick={() => data.onChangeStyle && data.onChangeStyle(id, { fontWeight: data.fontWeight === 'bold' ? 'normal' : 'bold' })} style={{ background: 'transparent', border: 'none', color: data.fontWeight === 'bold' ? 'var(--primary)' : '#fff', cursor: 'pointer', padding: '0 4px', fontWeight: 'bold' }} title="Bold">B</button>
          <div style={{ width: 1, height: '16px', background: '#555', margin: '0 5px' }} />
          {/* Delete */}
          <button onClick={() => data.onDelete && data.onDelete(id)} style={{ background: 'transparent', border: 'none', color: 'var(--red-text)', cursor: 'pointer', padding: '0 4px' }} title="Delete">🗑️</button>
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
        placeholder={data.color === 'transparent' ? "Heading..." : "Type note here..."}
      />
      <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} />
    </div>
  );
};

const nodeTypes = {
  category: CategoryNode,
  item: ItemNode,
  sticky: StickyNode
};

export default function ProjectCanvas() {
  const store = useStore();

  const generateDefaultLayout = useCallback(() => {
    const nodes = [];
    const edges = [];

    nodes.push({ id: 'root', type: 'category', position: { x: 0, y: 0 }, data: { label: 'Life Planner OS', color: '#fff' } });

    const createRing = (items, categoryId, centerX, centerY, radius, color, mapItem) => {
      if (!items || items.length === 0) return;

      nodes.push({ id: categoryId, type: 'category', position: { x: centerX, y: centerY }, data: { label: categoryId.toUpperCase(), color: color } });
      edges.push({ id: `e-root-${categoryId}`, source: 'root', target: categoryId, animated: true, style: { stroke: color, strokeWidth: 2 } });

      const angleStep = (2 * Math.PI) / items.length;
      items.forEach((item, index) => {
        const itemAngle = index * angleStep;
        const itemX = centerX + Math.cos(itemAngle) * radius;
        const itemY = centerY + Math.sin(itemAngle) * radius;
        const nodeId = `${categoryId}-${index}`;

        nodes.push({ id: nodeId, type: 'item', position: { x: itemX, y: itemY }, data: mapItem(item) });
        edges.push({ id: `e-${categoryId}-${nodeId}`, source: categoryId, target: nodeId, style: { stroke: '#555', strokeWidth: 1 } });
      });
    };

    createRing(store.trips, 'trips', 800, -500, 400, 'var(--primary)', (t) => ({
      title: t.location, subtitle: new Date(t.date).toLocaleDateString(), tags: [t.type, t.resolvedCountry].filter(Boolean)
    }));

    createRing(store.books, 'books', 800, 500, 400, '#e74c3c', (b) => ({
      title: b.title, subtitle: b.subtitle, img: b.img, tags: [b.status, `${b.rating} Stars`]
    }));

    const allGoals = [...(store.goals?.year || []), ...(store.goals?.month || []), ...(store.goals?.week || [])];
    createRing(allGoals, 'goals', -800, 500, 400, '#2ecc71', (g) => ({
      title: g.text, subtitle: g.status, tags: [g.category]
    }));

    createRing(store.activeQuests, 'quests', -800, -500, 300, '#9b59b6', (q) => ({
      title: q.skillId.replace(/-/g, ' ').toUpperCase(), subtitle: `Progress: ${q.progress}/${q.total}`, tags: ['Active Quest']
    }));

    return { nodes, edges };
  }, [store]);

  // Determine initial nodes from store or generation
  const initialData = useMemo(() => {
    if (store.canvasNodes && store.canvasNodes.length > 0) {
      // Re-inject the onChange handler for sticky notes because functions can't be stored in JSON
      const restoredNodes = store.canvasNodes.map(node => {
        if (node.type === 'sticky') {
          return { 
            ...node, 
            data: { 
              ...node.data, 
              onChange: (id, val) => handleStickyChange(id, val),
              onChangeStyle: (id, style) => handleStickyStyleChange(id, style),
              onDelete: (id) => handleDeleteNode(id)
            } 
          };
        }
        return node;
      });
      return { nodes: restoredNodes, edges: store.canvasEdges || [] };
    }
    return generateDefaultLayout();
  }, [store.canvasNodes, store.canvasEdges, generateDefaultLayout]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialData.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialData.edges);

  // Sync to store when nodes/edges structurally change or stop dragging
  const saveLayout = useCallback(() => {
    // Strip functions before saving
    const cleanNodes = nodes.map(n => {
      if (n.type === 'sticky') {
        const { onChange, onChangeStyle, onDelete, ...cleanData } = n.data;
        return { ...n, data: cleanData };
      }
      return n;
    });
    useStore.getState().setCanvasNodes(cleanNodes);
    useStore.getState().setCanvasEdges(edges);
  }, [nodes, edges]);

  // Auto-save debounced
  useEffect(() => {
    const timeout = setTimeout(() => {
      saveLayout();
    }, 1000);
    return () => clearTimeout(timeout);
  }, [nodes, edges, saveLayout]);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  // Handler for Sticky Note text changes
  const handleStickyChange = useCallback((id, newText) => {
    setNodes((nds) => nds.map(n => n.id === id ? { ...n, data: { ...n.data, text: newText } } : n));
  }, [setNodes]);

  const handleStickyStyleChange = useCallback((id, styleUpdates) => {
    setNodes((nds) => nds.map(n => n.id === id ? { ...n, data: { ...n.data, ...styleUpdates } } : n));
  }, [setNodes]);

  const handleDeleteNode = useCallback((id) => {
    if (window.confirm("Delete this node?")) {
      setNodes((nds) => nds.filter(n => n.id !== id));
      setEdges((eds) => eds.filter(e => e.source !== id && e.target !== id));
    }
  }, [setNodes, setEdges]);

  // Make sure existing sticky nodes have the handler if they were generated
  useEffect(() => {
    setNodes((nds) => nds.map(n => {
      if (n.type === 'sticky' && !n.data.onChangeStyle) {
        return { 
          ...n, 
          data: { 
            ...n.data, 
            onChange: handleStickyChange,
            onChangeStyle: handleStickyStyleChange,
            onDelete: handleDeleteNode
          } 
        };
      }
      return n;
    }));
  }, [handleStickyChange, handleStickyStyleChange, handleDeleteNode, setNodes]);

  const addStickyNote = () => {
    const newNode = {
      id: `sticky-${Date.now()}`,
      type: 'sticky',
      position: { x: 0, y: 0 },
      data: { text: '', color: '#fef08a', fontSize: '0.9rem', fontWeight: 'normal', onChange: handleStickyChange, onChangeStyle: handleStickyStyleChange, onDelete: handleDeleteNode },
      dragHandle: '.custom-drag-handle'
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const addOSItem = () => {
    const type = window.prompt("Type: 'book', 'trip', 'goal', 'quest', 'fridge'");
    if (!type) return;

    let title = window.prompt(`Enter title for ${type}:`);
    if (!title) return;

    const newNode = {
      id: `item-${Date.now()}`,
      type: 'item',
      position: { x: 0, y: 0 },
      data: { title, subtitle: `Custom ${type}`, tags: [type] }
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const resetCanvas = () => {
    if (window.confirm("Are you sure you want to completely reset your canvas layout? All custom notes will be lost!")) {
      const defaultLayout = generateDefaultLayout();
      useStore.getState().setCanvasNodes(null);
      useStore.getState().setCanvasEdges(null);
      setNodes(defaultLayout.nodes);
      setEdges(defaultLayout.edges);
    }
  };

  return (
    <div style={{ width: '100%', height: 'calc(100vh - 60px)', background: 'var(--bg-body)' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.1}
      >
        <Background color="var(--border-color)" gap={30} size={1} />
        <Controls style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }} />
        <MiniMap
          nodeColor={(n) => {
             if (n.type === 'category') return 'var(--primary)';
             if (n.type === 'sticky') return '#fef08a';
             return 'var(--border-color)';
          }}
          maskColor="rgba(0,0,0,0.5)"
          style={{ background: 'var(--bg-main)' }}
        />

        <Panel position="top-left" style={{ background: 'rgba(0,0,0,0.5)', padding: '10px 20px', borderRadius: '10px', color: '#fff', backdropFilter: 'blur(10px)' }}>
          <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Canvas</h2>
          <p style={{ margin: '5px 0 0 0', fontSize: '0.8rem', color: '#bbb' }}>Select & press Backspace to delete.</p>
        </Panel>

        <Panel position="top-right" style={{ display: 'flex', gap: '10px', background: 'rgba(0,0,0,0.6)', padding: '10px', borderRadius: '10px', backdropFilter: 'blur(10px)' }}>
          <button 
            className="notion-button secondary" 
            onClick={addStickyNote}
            style={{ margin: 0, padding: '6px 12px', fontSize: '0.85rem' }}
          >
            ➕ Sticky Note
          </button>
          <button 
            className="notion-button secondary" 
            onClick={addOSItem}
            style={{ margin: 0, padding: '6px 12px', fontSize: '0.85rem' }}
          >
            ➕ Custom OS Item
          </button>
          <button 
            className="notion-button secondary" 
            onClick={resetCanvas}
            style={{ margin: 0, padding: '6px 12px', fontSize: '0.85rem', color: 'var(--red-text)' }}
          >
            🗑️ Reset Layout
          </button>
        </Panel>
      </ReactFlow>
    </div>
  );
}
