import React, { useState } from 'react';
import { useStore } from '../store';
import './Auth.css';

const Auth = () => {
  const profile = useStore((state) => state.profile);
  const login = useStore((state) => state.login);
  const register = useStore((state) => state.register);

  const hasAccount = Boolean(profile.username);
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
      const passwordContent = `Your Life Planner OS Password is: ${profile.password}\nPlease keep this file safe.`;
      const blob = new Blob([passwordContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${formData.name}_password.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setError('Password file downloaded successfully!');
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
      <div className="auth-card" style={!isLoginMode ? { maxWidth: '520px' } : {}}>
        <div className="auth-header">
          <div className="auth-logo">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
              <path d="M4 11H2v3h2zm5-4H7v7h2zm5-5v12h-2V2zm-2-1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM6 7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1zm-5 4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1z" />
            </svg>
          </div>
          <h1>{isLoginMode ? 'Welcome Back' : 'Create an Account'}</h1>
          <p>{isLoginMode ? 'Enter your credentials to access your OS.' : 'Start managing your life with Life Planner OS.'}</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="auth-error" style={{ color: error.includes('success') ? '#4ade80' : '#ef4444', backgroundColor: error.includes('success') ? 'rgba(74, 222, 128, 0.1)' : 'rgba(239, 68, 68, 0.1)', borderColor: error.includes('success') ? 'rgba(74, 222, 128, 0.2)' : 'rgba(239, 68, 68, 0.2)' }}>{error}</div>}

          <div className="auth-input-group">
            <label>Name</label>
            <input
              name="name"
              type="text"
              placeholder="e.g. Creator"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          {!isLoginMode && (
            <>
              <div className="auth-grid">
                <div className="auth-input-group">
                  <label>Age</label>
                  <input
                    name="age"
                    type="number"
                    placeholder="e.g. 25"
                    value={formData.age}
                    onChange={handleChange}
                  />
                </div>
                <div className="auth-input-group">
                  <label>Education</label>
                  <input
                    name="education"
                    type="text"
                    placeholder="e.g. BSc Computer Science"
                    value={formData.education}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="auth-grid">
                <div className="auth-input-group">
                  <label>Weight (kg)</label>
                  <input
                    name="weight"
                    type="number"
                    placeholder="e.g. 70"
                    value={formData.weight}
                    onChange={handleChange}
                  />
                </div>
                <div className="auth-input-group">
                  <label>Height (cm)</label>
                  <input
                    name="height"
                    type="number"
                    placeholder="e.g. 180"
                    value={formData.height}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </>
          )}

          <div className="auth-input-group">
            <label>Password</label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          {isLoginMode && (
            <div style={{ textAlign: 'right', marginTop: '-0.5rem' }}>
              <button
                type="button"
                onClick={handleForgotPassword}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline' }}
                onMouseOver={(e) => e.target.style.color = '#fff'}
                onMouseOut={(e) => e.target.style.color = 'rgba(255,255,255,0.6)'}
              >
                Forgot Password?
              </button>
            </div>
          )}

          <button type="submit" className="auth-button">
            {isLoginMode ? 'Sign In' : 'Register'}
          </button>
        </form>

        <div className="auth-footer">
          {isLoginMode ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            className="auth-switch-btn"
            onClick={() => {
              setIsLoginMode(!isLoginMode);
              setError('');
            }}
          >
            {isLoginMode ? 'Register' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
