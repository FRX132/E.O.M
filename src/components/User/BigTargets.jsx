import React, { useState } from 'react';
import { useStore } from '../../store';
import BigTargetModal from './BigTargetModal';

const TrophyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-trophy" viewBox="0 0 16 16">
    <path d="M2.5.5A.5.5 0 0 1 3 0h10a.5.5 0 0 1 .5.5q0 .807-.034 1.536a3 3 0 1 1-1.133 5.89c-.79 1.865-1.878 2.777-2.833 3.011v2.173l1.425.356c.194.048.377.135.537.255L13.3 15.1a.5.5 0 0 1-.3.9H3a.5.5 0 0 1-.3-.9l1.838-1.379c.16-.12.343-.207.537-.255L6.5 13.11v-2.173c-.955-.234-2.043-1.146-2.833-3.012a3 3 0 1 1-1.132-5.89A33 33 0 0 1 2.5.5m.099 2.54a2 2 0 0 0 .72 3.935c-.333-1.05-.588-2.346-.72-3.935m10.083 3.935a2 2 0 0 0 .72-3.935c-.133 1.59-.388 2.885-.72 3.935M3.504 1q.01.775.056 1.469c.13 2.028.457 3.546.87 4.667C5.294 9.48 6.484 10 7 10a.5.5 0 0 1 .5.5v2.61a1 1 0 0 1-.757.97l-1.426.356a.5.5 0 0 0-.179.085L4.5 15h7l-.638-.479a.5.5 0 0 0-.18-.085l-1.425-.356a1 1 0 0 1-.757-.97V10.5A.5.5 0 0 1 9 10c.516 0 1.706-.52 2.57-2.864.413-1.12.74-2.64.87-4.667q.045-.694.056-1.469z" />
  </svg>
);

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const openAddModal = () => {
    setEditingProject(null);
    setIsModalOpen(true);
  };

  const openEditModal = (project) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleSaveProject = (data) => {
    if (editingProject) {
      setProjects(projects.map(p => p.id === editingProject.id ? { ...p, ...data } : p));
    } else {
      const newId = Date.now();
      setProjects([...projects, {
        id: newId,
        ...data
      }]);
    }
    setEditingProject(null);
  };

  const filteredProjects = activeTab === 'All'
    ? projects
    : projects.filter(p => activeTab === 'Active' ? p.status === 'In progress' : p.status === 'Not started');

  return (
    <div className="premium-container">
      <div className="premium-header-container">
        <div className="premium-icon-wrapper">
          <TrophyIcon />
        </div>
        <h1 className="premium-title">Big Targets</h1>
        <p className="premium-subtitle">Plan and manage long-term goals without losing focus.<br />Break big ideas into clear projects and track progress.</p>
      </div>

      <div className="notion-block">
        <div className="notion-header" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: 'var(--primary)', display: 'inline-flex', transform: 'scale(0.8)' }}><TrophyIcon /></span>
          Projects
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
          <button style={{ marginLeft: 'auto', background: 'var(--blue-bg)', color: 'var(--blue-text)', padding: '4px 12px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }} onClick={openAddModal}>
            New +
          </button>
        </div>

        <div className="premium-grid" style={{ padding: '0 20px 20px' }}>

          {filteredProjects.map((project) => (
            <div
              key={project.id}
              onClick={() => openEditModal(project)}
              className="premium-card"
              style={{ padding: 0 }}
            >
              <div style={{ width: '100%', height: '140px', backgroundImage: `url(${project.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
              <div style={{ padding: '16px' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '16px', lineHeight: 1.3 }}>{project.title}</h3>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                  <span className={`pill ${PILL_COLORS[project.category] || 'blue'}`}>{project.category}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>{project.date}</span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const nextStatus = project.status === 'Not started' ? 'In progress' : (project.status === 'In progress' ? 'Completed' : 'Not started');
                    setProjects(projects.map(p => p.id === project.id ? { ...p, status: nextStatus } : p));
                  }}
                  className={`pill ${PILL_COLORS[project.status]}`}
                  style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}
                >
                  {project.status}
                </button>
              </div>
            </div>
          ))}

          <div
            onClick={openAddModal}
            className="premium-card"
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '200px',
              borderStyle: 'dashed',
              background: 'transparent',
              color: 'var(--text-muted)',
              cursor: 'pointer'
            }}
          >
            + New page
          </div>

        </div>
      </div>
      <BigTargetModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProject(null);
        }}
        onSave={handleSaveProject}
        initialData={editingProject}
      />
    </div>
  );
}
