import React, { useState } from 'react';
import { useStore } from '../store';

const PILL_COLORS = {
  'Personal': 'purple',
  'Work': 'orange',
  'Financial': 'green',
  'In progress': 'orange',
  'Not started': 'blue',
  'Completed': 'green'
};

export default function BigTargets() {
  const projects = useStore(state => state.targets);
  const setProjects = useStore(state => state.setTargets);

  const [activeTab, setActiveTab] = useState('All');

  const toggleStatus = (id) => {
    setProjects(projects.map(p => {
      if (p.id !== id) return p;
      const nextStatus = p.status === 'Not started' ? 'In progress' : (p.status === 'In progress' ? 'Completed' : 'Not started');
      return { ...p, status: nextStatus };
    }));
  };

  const addProject = () => {
    const title = prompt('Project title:');
    if (!title) return;
    const newId = Date.now();
    setProjects([...projects, {
      id: newId,
      title,
      category: 'Work',
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      status: 'Not started',
      img: `https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400&h=300&fit=crop&q=${newId}`
    }]);
  };

  const filteredProjects = activeTab === 'All'
    ? projects
    : projects.filter(p => activeTab === 'Active' ? p.status === 'In progress' : p.status === 'Not started');

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Big Targets</h1>
        <p style={{ color: 'var(--text-muted)' }}>Plan and manage long-term goals without losing focus.<br />Break big ideas into clear projects and track progress.</p>
      </div>

      <div className="notion-block">
        <div className="notion-header">
          🎯 Projects
        </div>

        <div className="notion-tabs">
          {['All', 'Active', 'On hold'].map(tab => (
            <button
              key={tab}
              className={`notion-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
          <button style={{ marginLeft: 'auto', background: 'var(--blue-bg)', color: 'var(--blue-text)', padding: '4px 12px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }} onClick={addProject}>
            New +
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px', padding: '0 20px 20px' }}>

          {filteredProjects.map((project) => (
            <div key={project.id} style={{
              background: 'var(--bg-main)',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              border: '1px solid var(--border-light)'
            }}>
              <div style={{ width: '100%', height: '140px', backgroundImage: `url(${project.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
              <div style={{ padding: '16px' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '16px', lineHeight: 1.3 }}>{project.title}</h3>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                  <span className={`pill ${PILL_COLORS[project.category] || 'blue'}`}>{project.category}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>{project.date}</span>
                </div>

                <button
                  onClick={() => toggleStatus(project.id)}
                  className={`pill ${PILL_COLORS[project.status]}`}
                  style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}
                >
                  {project.status}
                </button>
              </div>
            </div>
          ))}

          <div
            onClick={addProject}
            style={{
              borderRadius: '8px',
              border: '1px dashed var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '200px',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              transition: 'background var(--transition-fast)'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
          >
            + New page
          </div>

        </div>
      </div>
    </div>
  );
}
