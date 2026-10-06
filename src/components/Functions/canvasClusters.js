// Cluster configuration for the Project Canvas mindmap.
// Single source of truth for which OS modules appear on the canvas, where their hubs sit,
// and how each store item is turned into a node. Used by both the initial layout and the
// live sync with store data, so a module only has to be defined once.

export const ROOT_NODE_ID = 'root';

const MIN_ORBIT_RADIUS = 340;
const MAX_ORBIT_RADIUS = 650;
const ORBIT_RADIUS_PER_ITEM = 60;
const MAX_VISIBLE_EXPENSES = 15;

// ---------------------------------------------------------------------------
// Node & edge factories
// ---------------------------------------------------------------------------

export const createRootNode = () => ({
  id: ROOT_NODE_ID,
  type: 'category',
  position: { x: 0, y: 0 },
  data: { label: 'Life Planner OS', icon: '🌌', color: '#ffffff' }
});

export const createHubNode = (cluster) => ({
  id: cluster.id,
  type: 'category',
  position: cluster.position,
  data: { label: cluster.label, icon: cluster.icon, color: cluster.color, count: cluster.items.length }
});

export const createHubEdge = (cluster) => ({
  id: `e-root-${cluster.id}`,
  source: ROOT_NODE_ID,
  target: cluster.id,
  animated: true,
  style: { stroke: cluster.color, strokeWidth: 2 }
});

export const createItemEdge = (cluster, nodeId) => ({
  id: `e-${cluster.id}-${nodeId}`,
  source: cluster.id,
  target: nodeId,
  style: { stroke: cluster.color, strokeWidth: 1.5, strokeDasharray: '4 4' }
});

/** Places item `index` of `total` on a circle around the cluster hub, starting at 12 o'clock. */
export const getOrbitPosition = (center, index, total) => {
  const radius = Math.max(MIN_ORBIT_RADIUS, Math.min(MAX_ORBIT_RADIUS, total * ORBIT_RADIUS_PER_ITEM));
  const angle = (index / Math.max(1, total)) * 2 * Math.PI - Math.PI / 2;
  return {
    x: center.x + Math.cos(angle) * radius,
    y: center.y + Math.sin(angle) * radius
  };
};

// ---------------------------------------------------------------------------
// Cluster definitions
// ---------------------------------------------------------------------------

/**
 * Returns all canvas clusters derived from the current store state.
 * Each cluster: { id, label, icon, color, position, items, toNode(item, index) => { id, type, data } }
 */
export const buildClusters = (store) => {
  const currencySymbol = store.profile?.currencySymbol || '€';

  const goalsAndTargets = [
    ...(store.targets || []).map(t => ({ ...t, isTarget: true, title: t.title, progress: t.progress || 0 })),
    ...(store.goals?.year || []).map(g => ({ ...g, isTarget: false, title: g.text, category: 'Year Goal' })),
    ...(store.goals?.month || []).map(g => ({ ...g, isTarget: false, title: g.text, category: 'Month Goal' })),
    ...(store.goals?.week || []).map(g => ({ ...g, isTarget: false, title: g.text, category: 'Week Goal' }))
  ];

  const skillsAndQuests = [
    ...(store.skills || []).map(s => ({ title: s.toUpperCase(), isQuest: false })),
    ...(store.activeQuests || []).map(q => ({
      title: q.skillId?.replace(/-/g, ' ').toUpperCase(),
      subtitle: `Progress: ${q.progress}/${q.total}`,
      isQuest: true
    }))
  ];

  return [
    {
      id: 'documents', label: 'DOCUMENTS', icon: '📄', color: '#38bdf8',
      position: { x: 0, y: -850 },
      items: store.editorFiles || [],
      toNode: (f) => ({
        id: `doc-${f.id}`,
        type: 'document',
        data: { id: f.id, name: f.name, folder: f.folder, content: f.content, timestamp: f.timestamp }
      })
    },
    {
      id: 'targets', label: 'TARGETS & GOALS', icon: '🎯', color: '#10b981',
      position: { x: 850, y: -550 },
      items: goalsAndTargets,
      toNode: (g, i) => ({
        id: `target-${g.id || i}`,
        type: 'targetGoal',
        data: { title: g.title, progress: g.progress, isTarget: g.isTarget, completed: g.completed, category: g.category, deadline: g.deadline }
      })
    },
    {
      id: 'habits', label: 'HABITS', icon: '⚡', color: '#a855f7',
      position: { x: -850, y: -550 },
      items: store.customHabitTemplates || [],
      toNode: (h, i) => ({
        id: `habit-${h.id || i}`,
        type: 'habit',
        data: { title: h.name, repeat: h.repeat, category: h.category }
      })
    },
    {
      id: 'workouts', label: 'WORKOUTS', icon: '🏋️', color: '#f43f5e',
      position: { x: -950, y: 200 },
      items: store.workouts || [],
      toNode: (w, i) => ({
        id: `workout-${w.id || i}`,
        type: 'workout',
        data: { title: w.name || 'Workout', date: w.date, duration: w.duration, exercisesCount: w.exercises?.length }
      })
    },
    {
      id: 'journal', label: 'JOURNAL', icon: '📔', color: '#6366f1',
      position: { x: -550, y: 850 },
      items: store.journal || [],
      toNode: (j, i) => ({
        id: `journal-${j.id || i}`,
        type: 'journal',
        data: { title: j.title || 'Entry', date: j.date, mood: j.mood, excerpt: j.content?.slice(0, 80) }
      })
    },
    {
      id: 'finance', label: 'FINANCES', icon: '💰', color: '#f59e0b',
      position: { x: 550, y: 850 },
      items: (store.expenses || []).slice(-MAX_VISIBLE_EXPENSES),
      toNode: (e, i) => ({
        id: `expense-${e.id || i}`,
        type: 'finance',
        data: { title: e.note || e.category, amount: `${e.amount} ${currencySymbol}`, category: e.category, date: e.date }
      })
    },
    {
      id: 'books', label: 'LIBRARY', icon: '📚', color: '#ec4899',
      position: { x: 950, y: 200 },
      items: store.books || [],
      toNode: (b, i) => ({
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
      })
    },
    {
      id: 'movies', label: 'CINEMA', icon: '🎬', color: '#8b5cf6',
      position: { x: 850, y: 600 },
      items: store.movies || [],
      toNode: (m, i) => ({
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
      })
    },
    {
      id: 'trips', label: 'TRIP MODE', icon: '✈️', color: '#06b6d4',
      position: { x: -850, y: 600 },
      items: store.trips || [],
      toNode: (t, i) => ({
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
      })
    },
    {
      id: 'skills', label: 'SKILL TREE', icon: '🛡️', color: '#3b82f6',
      position: { x: -450, y: -850 },
      items: skillsAndQuests,
      toNode: (s, i) => ({
        id: `skill-${i}`,
        type: 'skillQuest',
        data: { title: s.title, subtitle: s.subtitle, isQuest: s.isQuest }
      })
    },
    {
      id: 'timetable', label: 'TIMETABLE', icon: '📅', color: '#14b8a6',
      position: { x: 450, y: -850 },
      items: store.timetableBlocks || [],
      toNode: (tb, i) => ({
        id: `tb-${tb.id || i}`,
        type: 'timetable',
        data: { title: tb.title || tb.activity, day: tb.day, time: `${tb.startTime || ''} - ${tb.endTime || ''}` }
      })
    }
  ];
};

// ---------------------------------------------------------------------------
// Layout builders
// ---------------------------------------------------------------------------

/** Builds the full default "solar constellation" layout from scratch. */
export const buildDefaultLayout = (store) => {
  const nodes = [createRootNode()];
  const edges = [];

  buildClusters(store).forEach((cluster) => {
    if (cluster.items.length === 0) return;

    nodes.push(createHubNode(cluster));
    edges.push(createHubEdge(cluster));

    cluster.items.forEach((item, index) => {
      const { id, type, data } = cluster.toNode(item, index);
      nodes.push({ id, type, data, position: getOrbitPosition(cluster.position, index, cluster.items.length) });
      edges.push(createItemEdge(cluster, id));
    });
  });

  return { nodes, edges };
};

/**
 * Merges current store data into an existing canvas without touching user-arranged positions.
 * - Missing hubs/items are added on their orbit.
 * - Existing items get their data refreshed, but only committed when new nodes were added.
 *   Returning the same `currentNodes` reference otherwise is intentional: the canvas saves
 *   itself into the store, so always returning a new array would cause a save → sync loop.
 * Returns `nodes` and the new edges to append.
 */
export const syncLayoutWithStore = (currentNodes, store) => {
  const nodeIndexById = new Map(currentNodes.map((n, i) => [n.id, i]));
  const nodes = [...currentNodes];
  const newEdges = [];
  let hasNewNodes = false;

  const addNode = (node) => {
    nodeIndexById.set(node.id, nodes.length);
    nodes.push(node);
    hasNewNodes = true;
  };

  buildClusters(store).forEach((cluster) => {
    if (cluster.items.length === 0) return;

    if (!nodeIndexById.has(cluster.id)) {
      addNode(createHubNode(cluster));
      newEdges.push(createHubEdge(cluster));
    }

    cluster.items.forEach((item, index) => {
      const { id, type, data } = cluster.toNode(item, index);
      const existingIndex = nodeIndexById.get(id);

      if (existingIndex === undefined) {
        addNode({ id, type, data, position: getOrbitPosition(cluster.position, index, cluster.items.length) });
        newEdges.push(createItemEdge(cluster, id));
      } else {
        const existing = nodes[existingIndex];
        nodes[existingIndex] = { ...existing, data: { ...existing.data, ...data } };
      }
    });
  });

  return { nodes: hasNewNodes ? nodes : currentNodes, newEdges };
};
