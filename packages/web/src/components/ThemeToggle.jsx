/* ============================================================================
   THEME TOGGLE COMPONENT
   Beautiful, accessible button to switch between light and dark modes
   Uses ThemeContext for state management
   ============================================================================ */

import React from 'react';
import { useTheme } from '../context/ThemeContext';
import './ThemeToggle.css';

/**
 * ThemeToggle Component
 *
 * A fixed-position button that allows users to toggle between light and dark modes.
 * Integrates with ThemeContext to manage the theme state globally.
 *
 * Features:
 * - Accessible with aria-label and title attributes
 * - Beautiful emoji icons (☀️ for light, 🌙 for dark)
 * - Smooth transitions and hover effects
 * - Respects prefers-reduced-motion for accessibility
 * - Positioned in the top-right corner with high z-index
 * - Keyboard accessible with focus-visible styles
 *
 * @returns {React.ReactElement} Theme toggle button component
 *
 * @example
 * import { ThemeToggle } from './components/ThemeToggle';
 *
 * function App() {
 *   return (
 *     <>
 *       <ThemeToggle />
 *       {/* Rest of app */}
 *     </>
 *   );
 * }
 */
export const ThemeToggle = () => {
  // Get dark mode state and toggle function from context
  const { isDarkMode, toggleDarkMode } = useTheme();

  // Determine display text based on current mode
  const modeLabel = isDarkMode ? 'light' : 'dark';
  const ariaLabel = `Switch to ${modeLabel} mode`;
  const emoji = isDarkMode ? '☀️' : '🌙';

  return (
    <button
      onClick={toggleDarkMode}
      className="theme-toggle"
      aria-label={ariaLabel}
      title={ariaLabel}
      type="button"
    >
      <span className="theme-toggle-icon" aria-hidden="true">
        {emoji}
      </span>
    </button>
  );
};

export default ThemeToggle;
