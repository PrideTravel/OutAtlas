/* ============================================================================
   SETTINGS ICON COMPONENT
   Gear icon button to open the Settings modal
   Shows accessibility badge when features are enabled
   ============================================================================ */

import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import './SettingsIcon.css';

/**
 * SettingsIcon Component
 *
 * A fixed-position gear icon button that opens the Settings modal.
 * Displays a small "A11y" badge when accessibility features are enabled.
 *
 * Features:
 * - Keyboard accessible (Enter/Space to open)
 * - Shows accessibility badge when reduce-motion or high-contrast is enabled
 * - Beautiful SVG gear icon
 * - Respects prefers-reduced-motion for animations
 * - Proper focus management for accessibility
 * - Positioned top-right with high z-index
 *
 * @param {Object} props - Component props
 * @param {function} props.onOpenModal - Callback to open the settings modal
 * @returns {React.ReactElement} Settings icon button component
 *
 * @example
 * import { SettingsIcon } from './components/SettingsIcon';
 *
 * function App() {
 *   return (
 *     <>
 *       <SettingsIcon onOpenModal={() => setSettingsOpen(true)} />
 *       {/* Rest of app */}
 *     </>
 *   );
 * }
 */
export const SettingsIcon = ({ onOpenModal }) => {
  // Get accessibility state from context
  const { reducedMotion, highContrast } = useTheme();

  // Determine if accessibility badge should show
  const showA11yBadge = reducedMotion || highContrast;

  // Handle keyboard interaction
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpenModal();
    }
  };

  const ariaLabel = 'Open Settings';
  const ariaDescription = showA11yBadge
    ? 'Open Settings. Accessibility features enabled.'
    : 'Open Settings';

  return (
    <div className="settings-icon-container">
      <button
        onClick={onOpenModal}
        onKeyDown={handleKeyDown}
        className="settings-icon"
        aria-label={ariaLabel}
        title={ariaLabel}
        type="button"
        role="button"
        tabIndex={0}
        aria-describedby={showA11yBadge ? 'a11y-badge-desc' : undefined}
      >
        {/* Gear SVG Icon */}
        <svg
          className="settings-icon-svg"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <style>{`
              .gear-stroke { stroke: currentColor; stroke-width: 2; }
              .gear-fill { fill: none; }
            `}</style>
          </defs>
          {/* Main gear circle */}
          <circle cx="12" cy="12" r="3" className="gear-stroke gear-fill" />

          {/* Gear teeth (outer gear shape) */}
          <g className="gear-teeth">
            {/* Top tooth */}
            <rect x="11" y="1" width="2" height="3" className="gear-stroke gear-fill" />
            {/* Top-right tooth */}
            <path
              d="M 18.66 5.34 L 16.55 7.45"
              className="gear-stroke gear-fill"
            />
            {/* Right tooth */}
            <rect x="20" y="11" width="3" height="2" className="gear-stroke gear-fill" />
            {/* Bottom-right tooth */}
            <path
              d="M 18.66 18.66 L 16.55 16.55"
              className="gear-stroke gear-fill"
            />
            {/* Bottom tooth */}
            <rect x="11" y="20" width="2" height="3" className="gear-stroke gear-fill" />
            {/* Bottom-left tooth */}
            <path
              d="M 5.34 18.66 L 7.45 16.55"
              className="gear-stroke gear-fill"
            />
            {/* Left tooth */}
            <rect x="1" y="11" width="3" height="2" className="gear-stroke gear-fill" />
            {/* Top-left tooth */}
            <path
              d="M 5.34 5.34 L 7.45 7.45"
              className="gear-stroke gear-fill"
            />
          </g>
        </svg>

        {/* A11y Badge - shows when accessibility features are enabled */}
        {showA11yBadge && (
          <span className="a11y-badge" aria-hidden="true">
            A11y
          </span>
        )}
      </button>

      {/* Screen reader description for A11y badge */}
      {showA11yBadge && (
        <span id="a11y-badge-desc" className="sr-only">
          Accessibility features are enabled
        </span>
      )}
    </div>
  );
};

export default SettingsIcon;
