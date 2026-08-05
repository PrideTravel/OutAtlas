/* ============================================================================
   SETTINGS MODAL COMPONENT
   Modal for controlling theme and accessibility settings
   Includes appearance and accessibility sections with toggles
   ============================================================================ */

import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import './SettingsModal.css';

/**
 * SettingsModal Component
 *
 * A modal dialog that provides controls for:
 * - Theme selection (Light/Dark mode)
 * - Accessibility preferences (Reduced Motion, High Contrast)
 *
 * Features:
 * - Close on Escape key
 * - Close on backdrop click
 * - Focus trap (Tab stays within modal)
 * - All settings persist to localStorage
 * - Updates body classes for CSS theme management
 * - Accessible with proper ARIA attributes
 * - Smooth animations (respecting reduce-motion)
 * - Keyboard accessible toggle switches
 *
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {function} props.onClose - Callback to close the modal
 * @returns {React.ReactElement} Settings modal component
 *
 * @example
 * import { SettingsModal } from './components/SettingsModal';
 * import { useState } from 'react';
 *
 * function App() {
 *   const [settingsOpen, setSettingsOpen] = useState(false);
 *
 *   return (
 *     <>
 *       <button onClick={() => setSettingsOpen(true)}>Settings</button>
 *       <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
 *     </>
 *   );
 * }
 */
export const SettingsModal = ({ isOpen, onClose }) => {
  // Get all theme and accessibility settings from context
  const {
    isDarkMode,
    toggleDarkMode,
    reducedMotion,
    toggleReducedMotion,
    highContrast,
    toggleHighContrast,
  } = useTheme();

  // Refs for focus management and focus trap
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);
  const firstFocusableRef = useRef(null);
  const lastFocusableRef = useRef(null);

  // Effect: Handle keyboard interactions (Escape to close, focus trap)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      // Close modal on Escape key
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      // Focus trap: Keep focus within modal
      if (e.key === 'Tab') {
        const focusableElements = modalRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (!focusableElements || focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        const activeElement = document.activeElement;

        if (e.shiftKey) {
          // Shift + Tab (backward)
          if (activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab (forward)
          if (activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Set initial focus to close button
    if (closeButtonRef.current) {
      closeButtonRef.current.focus();
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Effect: Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle backdrop click to close
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle toggle changes
  const handleDarkModeToggle = () => {
    toggleDarkMode();
  };

  const handleReducedMotionToggle = () => {
    toggleReducedMotion(!reducedMotion);
  };

  const handleHighContrastToggle = () => {
    toggleHighContrast(!highContrast);
  };

  if (!isOpen) return null;

  return (
    <div
      className="settings-modal-overlay"
      onClick={handleBackdropClick}
      role="presentation"
      aria-hidden={!isOpen}
    >
      <div
        className="settings-modal-content"
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-modal-title"
      >
        {/* Modal Header */}
        <div className="settings-modal-header">
          <h2 id="settings-modal-title" className="settings-modal-title">
            Settings
          </h2>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="settings-modal-close"
            aria-label="Close Settings"
            title="Close Settings (Escape)"
            type="button"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="settings-modal-body">
          {/* ================================================================ */}
          {/* APPEARANCE SECTION */}
          {/* ================================================================ */}
          <section className="settings-section">
            <h3 className="settings-section-title">Appearance</h3>

            <div className="settings-option">
              <div className="settings-toggle-wrapper">
                <input
                  type="checkbox"
                  id="dark-mode-toggle"
                  className="settings-toggle-input"
                  checked={isDarkMode}
                  onChange={handleDarkModeToggle}
                  ref={firstFocusableRef}
                />
                <label htmlFor="dark-mode-toggle" className="settings-toggle-label">
                  <span className="toggle-switch"></span>
                </label>
              </div>

              <div className="settings-option-text">
                <label htmlFor="dark-mode-toggle" className="settings-option-label">
                  Dark Mode
                </label>
                <p className="settings-option-description">
                  Switch between light and dark themes for comfortable viewing
                  {isDarkMode ? ' (currently enabled)' : ' (currently disabled)'}
                </p>
              </div>
            </div>
          </section>

          {/* Divider */}
          <div className="settings-divider"></div>

          {/* ================================================================ */}
          {/* ACCESSIBILITY SECTION */}
          {/* ================================================================ */}
          <section className="settings-section">
            <h3 className="settings-section-title">Accessibility</h3>

            {/* Reduce Motion Toggle */}
            <div className="settings-option">
              <div className="settings-toggle-wrapper">
                <input
                  type="checkbox"
                  id="reduce-motion-toggle"
                  className="settings-toggle-input"
                  checked={reducedMotion}
                  onChange={handleReducedMotionToggle}
                />
                <label htmlFor="reduce-motion-toggle" className="settings-toggle-label">
                  <span className="toggle-switch"></span>
                </label>
              </div>

              <div className="settings-option-text">
                <label htmlFor="reduce-motion-toggle" className="settings-option-label">
                  Reduce Motion
                </label>
                <p className="settings-option-description">
                  Minimize animations and transitions for a calmer browsing experience
                  {reducedMotion ? ' (currently enabled)' : ' (currently disabled)'}
                </p>
              </div>
            </div>

            {/* High Contrast Toggle */}
            <div className="settings-option">
              <div className="settings-toggle-wrapper">
                <input
                  type="checkbox"
                  id="high-contrast-toggle"
                  className="settings-toggle-input"
                  checked={highContrast}
                  onChange={handleHighContrastToggle}
                  ref={lastFocusableRef}
                />
                <label htmlFor="high-contrast-toggle" className="settings-toggle-label">
                  <span className="toggle-switch"></span>
                </label>
              </div>

              <div className="settings-option-text">
                <label htmlFor="high-contrast-toggle" className="settings-option-label">
                  High Contrast
                </label>
                <p className="settings-option-description">
                  Enhance color contrast and borders for better readability and visibility
                  {highContrast ? ' (currently enabled)' : ' (currently disabled)'}
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Modal Footer - Info Message */}
        <div className="settings-modal-footer">
          <p className="settings-info-text">
            Your preferences are automatically saved and will persist across sessions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
