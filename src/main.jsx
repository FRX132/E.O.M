import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'

import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import App from './App.jsx';
import ErrorBoundary from './components/Functions/ErrorBoundary.jsx';
import { registerSW } from 'virtual:pwa-register';

// Automatically register and update PWA Service Worker
registerSW({ immediate: true });

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <HashRouter>
        <App />
      </HashRouter>
    </ErrorBoundary>
  </StrictMode>,
)
