import React, { useMemo, useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  Panel
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useStore } from '../store';

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

const nodeTypes = {
  category: CategoryNode,
  item: ItemNode,
};

export default function ProjectCanvas() {
  const store = useStore();

  // Initialisiere die Nodes und Edges basierend auf dem Store-Zustand
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes = [];
    const edges = [];

    // 1. Central Node
    nodes.push({
      id: 'root',
      type: 'category',
      position: { x: 0, y: 0 },
      data: { label: 'Life Planner OS', color: '#fff' },
    });

    // Hilfsfunktion zum Generieren eines Rings
    const createRing = (items, categoryId, centerX, centerY, radius, color, mapItem) => {
      if (!items || items.length === 0) return;

      // Category Node
      nodes.push({
        id: categoryId,
        type: 'category',
        position: { x: centerX, y: centerY },
        data: { label: categoryId.toUpperCase(), color: color },
      });

      // Edge from root to category
      edges.push({
        id: `e-root-${categoryId}`,
        source: 'root',
        target: categoryId,
        animated: true,
        style: { stroke: color, strokeWidth: 2 }
      });

      // Items im Kreis anordnen
      const angleStep = (2 * Math.PI) / items.length;
      items.forEach((item, index) => {
        const itemAngle = index * angleStep;
        const itemX = centerX + Math.cos(itemAngle) * radius;
        const itemY = centerY + Math.sin(itemAngle) * radius;
        const nodeId = `${categoryId}-${index}`;

        nodes.push({
          id: nodeId,
          type: 'item',
          position: { x: itemX, y: itemY },
          data: mapItem(item),
        });

        edges.push({
          id: `e-${categoryId}-${nodeId}`,
          source: categoryId,
          target: nodeId,
          style: { stroke: '#555', strokeWidth: 1 }
        });
      });
    };

    // Daten aggregieren und im Kreis positionieren
    // Tripps oben rechts
    createRing(store.trips, 'trips', 800, -500, 400, 'var(--primary)', (t) => ({
      title: t.location,
      subtitle: new Date(t.date).toLocaleDateString(),
      tags: [t.type, t.resolvedCountry].filter(Boolean)
    }));

    // Books unten rechts
    createRing(store.books, 'books', 800, 500, 400, '#e74c3c', (b) => ({
      title: b.title,
      subtitle: b.subtitle,
      img: b.img,
      tags: [b.status, `${b.rating} Stars`]
    }));

    // Goals unten links
    const allGoals = [...(store.goals?.year || []), ...(store.goals?.month || []), ...(store.goals?.week || [])];
    createRing(allGoals, 'goals', -800, 500, 400, '#2ecc71', (g) => ({
      title: g.text,
      subtitle: g.status,
      tags: [g.category]
    }));

    // Quests / Skills oben links
    createRing(store.activeQuests, 'quests', -800, -500, 300, '#9b59b6', (q) => ({
      title: q.skillId.replace(/-/g, ' ').toUpperCase(),
      subtitle: `Progress: ${q.progress}/${q.total}`,
      tags: ['Active Quest']
    }));

    return { initialNodes: nodes, initialEdges: edges };
  }, [store]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes wenn sich der store ändert (optional, falls Live-Updates gewünscht sind)
  // Hier halten wir es simpel: Einmaliges Laden beim Mounten, danach frei verschiebbar.

  return (
    <div style={{ width: '100%', height: 'calc(100vh - 60px)', background: 'var(--bg-body)' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.1}
      >
        <Background color="var(--border-color)" gap={30} size={1} />
        <Controls style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }} />
        <MiniMap 
          nodeColor={(n) => {
            if (n.type === 'category') return 'var(--primary)';
            return 'var(--border-color)';
          }} 
          maskColor="rgba(0,0,0,0.5)"
          style={{ background: 'var(--bg-main)' }}
        />
        
        <Panel position="top-left" style={{ background: 'rgba(0,0,0,0.5)', padding: '10px 20px', borderRadius: '10px', color: '#fff', backdropFilter: 'blur(10px)' }}>
          <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Obsidian Canvas</h2>
          <p style={{ margin: '5px 0 0 0', fontSize: '0.8rem', color: '#bbb' }}>Zoom and drag to explore your entire life plan.</p>
        </Panel>
      </ReactFlow>
    </div>
  );
}
