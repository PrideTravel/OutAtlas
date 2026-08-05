/* ============================================================================
   APP COMPONENT - ROOT APPLICATION SCAFFOLD
   Main entry point for the OutAtlas application
   Wraps entire app with ThemeProvider and includes basic layout structure
   ============================================================================ */

import React, { useState } from 'react';
import { ThemeProvider } from '../context/ThemeContext';
import { ThemeToggle } from './ThemeToggle';
import { SettingsIcon } from './SettingsIcon';
import { SettingsModal } from './SettingsModal';
import { Search } from './Search';
import { Bookmarks } from './Bookmarks';
import { Messages } from './Messages';
import '../styles/global.css';
import './App.css';

/**
 * App Component
 *
 * Root component of the OutAtlas application. This component:
 * - Wraps the entire app with ThemeProvider for theme management
 * - Provides the basic layout structure (header, main, footer)
 * - Integrates the ThemeToggle button for theme switching
 * - Imports global and component-specific styles
 * - Implements responsive design
 *
 * The ThemeProvider at the top level ensures that:
 * - All child components have access to the useTheme hook
 * - Dark mode class is applied to document.body
 * - Theme state is persisted to localStorage
 * - System preference changes are monitored
 *
 * Structure:
 * ```
 * <ThemeProvider>
 *   <div className="app">
 *     <header className="app-header">
 *       - Branding (OutAtlas logo/name)
 *       - ThemeToggle button
 *       - Rainbow bar
 *     </header>
 *     <main className="app-main">
 *       - Hero section with call-to-action
 *       - Main content will go here
 *     </main>
 *     <footer className="app-footer">
 *       - Copyright and footer links
 *     </footer>
 *   </div>
 * </ThemeProvider>
 * ```
 *
 * @returns {React.ReactElement} The App component with theme provider and layout
 *
 * @example
 * // In main.jsx or index.js
 * import React from 'react';
 * import ReactDOM from 'react-dom/client';
 * import App from './components/App';
 *
 * ReactDOM.createRoot(document.getElementById('root')).render(
 *   <React.StrictMode>
 *     <App />
 *   </React.StrictMode>
 * );
 */
function App() {
  const currentYear = new Date().getFullYear();
  const [currentPage, setCurrentPage] = useState('home');
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <ThemeProvider>
      <div className="app">
        {/* ================================================================== */}
        {/* HEADER SECTION */}
        {/* ================================================================== */}
        <header className="app-header" role="banner">
          <div className="header-content">
            {/* Branding */}
            <div className="header-brand">
              <h1 className="app-title">OutAtlas</h1>
              <p className="app-subtitle">LGBTQ+ Travel Experiences</p>
            </div>

            {/* Header Actions (Theme Toggle, Settings Icon, etc.) */}
            <div className="header-actions">
              <SettingsIcon onOpenModal={() => setSettingsOpen(true)} />
              <ThemeToggle />
            </div>
          </div>

          {/* Rainbow Brand Bar */}
          <div className="rainbow-bar" aria-hidden="true"></div>
        </header>

        {/* ================================================================== */}
        {/* SETTINGS MODAL */}
        {/* ================================================================== */}
        <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />

        {/* ================================================================== */}
        {/* MAIN CONTENT SECTION */}
        {/* ================================================================== */}
        <main className="app-main" role="main">
          {currentPage === 'home' && (
            <>
              {/* Hero Section */}
              <section className="hero" aria-labelledby="hero-heading">
                <h2 id="hero-heading" className="hero-title">
                  Plan Your Journey
                </h2>
                <p className="hero-subtitle">
                  Discover LGBTQ+ friendly travel experiences around the world
                </p>
                <button
                  className="btn btn-primary hero-cta"
                  onClick={() => setCurrentPage('search')}
                >
                  Get Started
                </button>
              </section>

              {/* Navigation Section */}
              <section className="content-section" aria-labelledby="content-heading">
                <h2 id="content-heading">Explore OutAtlas</h2>
                <div className="nav-buttons">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setCurrentPage('search')}
                  >
                    Search Destinations
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setCurrentPage('bookmarks')}
                  >
                    My Bookmarks
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setCurrentPage('messages')}
                  >
                    Travel Notes
                  </button>
                </div>
              </section>
            </>
          )}

          {currentPage === 'search' && (
            <button
              className="btn btn-secondary back-btn"
              onClick={() => setCurrentPage('home')}
              style={{ margin: '1rem', display: 'block' }}
            >
              ← Back to Home
            </button>
          )}
          {currentPage === 'search' && <Search />}

          {currentPage === 'bookmarks' && (
            <button
              className="btn btn-secondary back-btn"
              onClick={() => setCurrentPage('home')}
              style={{ margin: '1rem', display: 'block' }}
            >
              ← Back to Home
            </button>
          )}
          {currentPage === 'bookmarks' && <Bookmarks />}

          {currentPage === 'messages' && (
            <button
              className="btn btn-secondary back-btn"
              onClick={() => setCurrentPage('home')}
              style={{ margin: '1rem', display: 'block' }}
            >
              ← Back to Home
            </button>
          )}
          {currentPage === 'messages' && <Messages />}
        </main>

        {/* ================================================================== */}
        {/* FOOTER SECTION */}
        {/* ================================================================== */}
        <footer className="app-footer" role="contentinfo">
          <div className="footer-content">
            <p className="footer-copyright">
              &copy; {currentYear} OutAtlas. All rights reserved.
            </p>
            <p className="footer-tagline">
              Celebrating diversity in travel and hospitality.
            </p>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  );
}

export default App;
