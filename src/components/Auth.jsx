import React, { useState } from 'react';
import { useStore } from '../store';
import { Card, Button, Container } from 'react-bootstrap';
import './Auth.css';

const Auth = () => {
  const profile = useStore((state) => state.profile);
  const login = useStore((state) => state.login);
  const register = useStore((state) => state.register);
  const theme = useStore((state) => state.theme);
  const toggleTheme = useStore((state) => state.toggleTheme);

  const hasAccount = Boolean(profile.username);
  const [phase, setPhase] = useState('welcome'); // welcome -> options -> form
  const [isLoginMode, setIsLoginMode] = useState(hasAccount);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    password: '',
    age: '',
    weight: '',
    height: '',
    education: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleForgotPassword = () => {
    if (!formData.name) {
      setError('Please enter your name first to retrieve your password.');
      return;
    }

    if (profile.username && profile.username.toLowerCase() === formData.name.toLowerCase()) {
      if (window.confirm(`Found account for "${profile.username}". Do you want to reveal your backup password on screen?`)) {
        alert(`Your E.O.M Backup Password is:\n\n${profile.password}\n\nPlease keep it in a safe place!`);
        setError('Password revealed successfully!');
      }
    } else {
      setError('Account not found with this name.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isLoginMode) {
      if (!formData.name || !formData.password) {
        setError('Please fill in your name and password');
        return;
      }

      if (profile.username === formData.name && profile.password === formData.password) {
        login(formData.name, formData.password);
        setError('');
      } else {
        setError('Invalid name or password');
      }
    } else {
      // Registration
      if (!formData.name || !formData.password || !formData.age || !formData.weight || !formData.height || !formData.education) {
        setError('Please fill in all fields');
        return;
      }

      register({
        username: formData.name,
        password: formData.password,
        age: formData.age,
        weight: formData.weight,
        height: formData.height,
        education: formData.education
      });
      setError('');
    }
  };

  return (
    <div className="auth-container">
      {/* Theme Toggle Button */}
      <button 
        onClick={toggleTheme}
        style={{
          position: 'absolute', top: '20px', right: '20px',
          background: 'var(--bg-card)', color: 'var(--text-main)',
          border: '1px solid var(--border-color)', borderRadius: '50%',
          width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', zIndex: 1001, boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>

      {phase === 'welcome' && (
        <Container className="d-flex flex-column justify-content-center align-items-center h-100">
          <Button 
            variant={theme === 'dark' ? 'light' : 'dark'}
            size="lg" 
            className="px-5 py-3 rounded-pill shadow-lg"
            style={{ fontSize: '1.5rem', fontWeight: 600, background: theme === 'dark' ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,1)', color: theme === 'dark' ? '#000' : '#fff', backdropFilter: 'blur(10px)', transition: 'all 0.3s ease' }}
            onClick={() => setPhase('options')}
          >
            Welcome
          </Button>
        </Container>
      )}

      {phase === 'options' && (
        <Container className="d-flex justify-content-center align-items-center h-100">
          <Card className="auth-card border-0 text-center shadow-lg" style={{ maxWidth: '400px', width: '100%', background: theme === 'dark' ? 'rgba(20, 20, 24, 0.75)' : 'rgba(255, 255, 255, 0.95)' }}>
            <Card.Body className="p-4 d-flex flex-column gap-3">
              <Card.Title as="h2" className="mb-4" style={{ color: 'var(--text-main)' }}>Select Option</Card.Title>
              <Button 
                variant={theme === 'dark' ? 'light' : 'dark'}
                size="lg" 
                onClick={() => { setIsLoginMode(true); setPhase('form'); }}
              >
                Login
              </Button>
              <Button 
                variant={theme === 'dark' ? 'outline-light' : 'outline-dark'}
                size="lg" 
                onClick={() => { setIsLoginMode(true); setPhase('forgot_shortcut'); }}
              >
                Forgot Password
              </Button>
              <div className="mt-3">
                <hr className="border-secondary" />
                <Button 
                  variant="link" 
                  className="text-decoration-none"
                  style={{ color: 'var(--text-main)' }}
                  onClick={() => { setIsLoginMode(false); setPhase('form'); }}
                >
                  Need an account? Register
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Container>
      )}

      {phase === 'forgot_shortcut' && (
        <Container className="d-flex justify-content-center align-items-center h-100">
          <Card className="auth-card border-0" style={{ maxWidth: '400px', width: '100%', background: theme === 'dark' ? 'rgba(20, 20, 24, 0.75)' : 'rgba(255, 255, 255, 0.95)' }}>
            <Card.Body className="p-4">
              <Card.Title as="h3" className="mb-3 text-center" style={{ color: 'var(--text-main)' }}>Recover Password</Card.Title>
              {error && <div className="auth-error mb-3">{error}</div>}
              <div className="auth-input-group mb-4">
                <label>Enter your Username</label>
                <input
                  name="name"
                  type="text"
                  placeholder="e.g. Creator"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-2"
                />
              </div>
              <div className="d-grid gap-2">
                <Button variant={theme === 'dark' ? 'light' : 'dark'} onClick={handleForgotPassword}>Download Password</Button>
                <Button variant={theme === 'dark' ? 'outline-light' : 'outline-dark'} onClick={() => { setError(''); setPhase('options'); }}>Back</Button>
              </div>
            </Card.Body>
          </Card>
        </Container>
      )}

      {phase === 'form' && (
        <Card className="auth-card border-0 mx-auto" style={{ maxWidth: !isLoginMode ? '600px' : '420px', background: theme === 'dark' ? 'rgba(20, 20, 24, 0.75)' : 'rgba(255, 255, 255, 0.95)' }}>
          <Card.Body className="p-4 p-sm-5 py-sm-4">
            <div className="auth-header">
              <div className="auth-logo" style={{ color: 'var(--text-main)', background: theme === 'dark' ? undefined : 'var(--bg-main)' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M4 11H2v3h2zm5-4H7v7h2zm5-5v12h-2V2zm-2-1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM6 7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1zm-5 4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1z" />
                </svg>
              </div>
              <h1 style={{ color: 'var(--text-main)' }}>{isLoginMode ? 'Welcome Back' : 'Create an Account'}</h1>
              <p style={{ color: 'var(--text-muted)' }}>{isLoginMode ? 'Enter your credentials to access your OS.' : 'Start managing your life with E.O.M.'}</p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              {error && <div className="auth-error" style={{ color: error.includes('success') ? 'var(--green-text)' : 'var(--red-text)', backgroundColor: error.includes('success') ? 'rgba(74, 222, 128, 0.1)' : 'rgba(239, 68, 68, 0.1)', borderColor: error.includes('success') ? 'rgba(74, 222, 128, 0.2)' : 'rgba(239, 68, 68, 0.2)' }}>{error}</div>}

              <div className="auth-input-group mb-3">
                <label>Username</label>
                <input
                  name="name"
                  type="text"
                  placeholder="e.g. Creator"
                  value={formData.name}
                  onChange={handleChange}
                  style={{ background: 'var(--bg-card-alt)', color: 'var(--text-main)' }}
                />
              </div>

              {!isLoginMode && (
                <>
                  <div className="row g-3 mb-3">
                    <div className="col-4 auth-input-group">
                      <label>Age <small className="text-muted">(years)</small></label>
                      <input
                        name="age"
                        type="number"
                        placeholder="25"
                        value={formData.age}
                        onChange={handleChange}
                        style={{ background: 'var(--bg-card-alt)', color: 'var(--text-main)' }}
                      />
                    </div>
                    <div className="col-4 auth-input-group">
                      <label>Weight <small className="text-muted">(in k.g)</small></label>
                      <input
                        name="weight"
                        type="number"
                        placeholder="70"
                        value={formData.weight}
                        onChange={handleChange}
                        style={{ background: 'var(--bg-card-alt)', color: 'var(--text-main)' }}
                      />
                    </div>
                    <div className="col-4 auth-input-group">
                      <label>Height <small className="text-muted">(in cm)</small></label>
                      <input
                        name="height"
                        type="number"
                        placeholder="180"
                        value={formData.height}
                        onChange={handleChange}
                        style={{ background: 'var(--bg-card-alt)', color: 'var(--text-main)' }}
                      />
                    </div>
                  </div>
                  <div className="auth-input-group mb-3">
                    <label>Education / Title</label>
                    <input
                      name="education"
                      type="text"
                      placeholder="e.g. BSc Computer Science"
                      value={formData.education}
                      onChange={handleChange}
                      style={{ background: 'var(--bg-card-alt)', color: 'var(--text-main)' }}
                    />
                  </div>
                </>
              )}

              <div className="auth-input-group mb-4">
                <label>Secure Vault Password</label>
                <input
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  style={{ background: theme === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)', color: 'var(--text-main)' }}
                />
              </div>

              {isLoginMode && (
                <div style={{ textAlign: 'right', marginTop: '-0.5rem' }}>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline' }}
                    onMouseOver={(e) => e.target.style.color = 'var(--text-main)'}
                    onMouseOut={(e) => e.target.style.color = 'var(--text-muted)'}
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              <button type="submit" className="auth-button" style={{ background: theme === 'dark' ? '#fff' : '#000', color: theme === 'dark' ? '#000' : '#fff' }}>
                {isLoginMode ? 'Sign In' : 'Register'}
              </button>
            </form>

            <div className="auth-footer mt-4">
              <span style={{ color: 'var(--text-muted)' }}>
                {isLoginMode ? "Don't have an account? " : "Already have an account? "}
              </span>
              <button
                type="button"
                className="auth-switch-btn"
                style={{ color: 'var(--text-main)' }}
                onClick={() => {
                  setIsLoginMode(!isLoginMode);
                  setError('');
                }}
              >
                {isLoginMode ? 'Register' : 'Sign In'}
              </button>
              <br/>
              <button 
                type="button" 
                className="auth-switch-btn mt-2"
                style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 500 }}
                onClick={() => setPhase('options')}
              >
                ← Back to Options
              </button>
            </div>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default Auth;
