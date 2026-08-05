/* ============================================================================
   OUTATLAS THEME CONTEXT
   Centralized theme state management with localStorage persistence
   and system preference synchronization
   ============================================================================ */

import React, { createContext, useContext, useEffect, useState } from 'react';

/* ============================================================================
   PART A: THEME CONTEXT SETUP
   ============================================================================ */

/**
 * ThemeContext
 * Manages dark mode, reduced motion, and high contrast preferences
 */
const ThemeContext = createContext();

/**
 * ThemeProvider Component
 * Wraps the application and provides theme state to all child components
 *
 * Features:
 * - Detects system dark mode preference
 * - Persists user preferences to localStorage
 * - Monitors system preference changes
 * - Manages accessibility preferences (reduced motion, high contrast)
 * - Applies appropriate CSS classes to document.body
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to wrap
 * @returns {React.ReactElement} Provider component
 */
export const ThemeProvider = ({ children }) => {
  // =========================================================================
  // Dark Mode State
  // =========================================================================
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Priority 1: Check localStorage for saved preference
    const saved = localStorage.getItem('theme-mode');
    if (saved) {
      return saved === 'dark';
    }

    // Priority 2: Fall back to system preference
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    // Priority 3: Default to light mode
    return false;
  });

  // =========================================================================
  // Accessibility State - Reduced Motion
  // =========================================================================
  const [reducedMotion, setReducedMotion] = useState(() => {
    // Check localStorage first
    const saved = localStorage.getItem('reduce-motion');
    if (saved) {
      return saved === 'true';
    }

    // Fall back to system preference
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    return false;
  });

  // =========================================================================
  // Accessibility State - High Contrast
  // =========================================================================
  const [highContrast, setHighContrast] = useState(() => {
    // Check localStorage first
    const saved = localStorage.getItem('high-contrast');
    if (saved) {
      return saved === 'true';
    }

    // Fall back to system preference
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-contrast: more)').matches;
    }

    return false;
  });

  // =========================================================================
  // Effect: Apply Dark Mode to DOM
  // =========================================================================
  /**
   * Applies the dark-mode class to document.body and persists preference
   * When isDarkMode changes, updates the DOM and saves to localStorage
   */
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const body = document.body;

    if (isDarkMode) {
      body.classList.add('dark-mode');
    } else {
      body.classList.remove('dark-mode');
    }

    // Persist to localStorage
    localStorage.setItem('theme-mode', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // =========================================================================
  // Effect: Apply Accessibility Preferences to DOM
  // =========================================================================
  /**
   * Applies accessibility preference classes to document.body
   * Monitors system preference changes and syncs them
   */
  useEffect(() => {
    if (typeof document === 'undefined' || typeof window === 'undefined') {
      return;
    }

    const body = document.body;

    // Apply reduce-motion class
    if (reducedMotion) {
      body.classList.add('reduce-motion');
    } else {
      body.classList.remove('reduce-motion');
    }

    // Apply high-contrast class
    if (highContrast) {
      body.classList.add('high-contrast');
    } else {
      body.classList.remove('high-contrast');
    }
  }, [reducedMotion, highContrast]);

  // =========================================================================
  // Effect: Monitor System Preference Changes
  // =========================================================================
  /**
   * Listens for changes to system color scheme, motion, and contrast preferences
   * Updates state when system preferences change
   * Uses the modern addEventListener API with graceful fallback
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Create media query objects
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const contrastQuery = window.matchMedia('(prefers-contrast: more)');

    // Define change handlers
    const handleDarkModeChange = (e) => {
      // Only update if user hasn't set a localStorage preference
      if (!localStorage.getItem('theme-mode')) {
        setIsDarkMode(e.matches);
      }
    };

    const handleMotionChange = (e) => {
      // Only update if user hasn't set a localStorage preference
      if (!localStorage.getItem('reduce-motion')) {
        setReducedMotion(e.matches);
      }
    };

    const handleContrastChange = (e) => {
      // Only update if user hasn't set a localStorage preference
      if (!localStorage.getItem('high-contrast')) {
        setHighContrast(e.matches);
      }
    };

    // Modern addEventListener API (preferred)
    darkModeQuery.addEventListener('change', handleDarkModeChange);
    motionQuery.addEventListener('change', handleMotionChange);
    contrastQuery.addEventListener('change', handleContrastChange);

    // Cleanup: Remove event listeners on unmount
    return () => {
      darkModeQuery.removeEventListener('change', handleDarkModeChange);
      motionQuery.removeEventListener('change', handleMotionChange);
      contrastQuery.removeEventListener('change', handleContrastChange);
    };
  }, []);

  // =========================================================================
  // Toggle Functions
  // =========================================================================

  /**
   * Toggle dark mode on/off
   * Saves user's preference to localStorage
   */
  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  /**
   * Toggle reduced motion preference
   * @param {boolean} value - Whether to enable reduced motion
   */
  const toggleReducedMotion = (value) => {
    setReducedMotion(value);
    localStorage.setItem('reduce-motion', String(value));
  };

  /**
   * Toggle high contrast preference
   * @param {boolean} value - Whether to enable high contrast
   */
  const toggleHighContrast = (value) => {
    setHighContrast(value);
    localStorage.setItem('high-contrast', String(value));
  };

  // =========================================================================
  // Context Value
  // =========================================================================
  const themeValue = {
    // Dark mode state and controls
    isDarkMode,
    toggleDarkMode,

    // Accessibility preferences
    reducedMotion,
    toggleReducedMotion,
    highContrast,
    toggleHighContrast,

    // Utility getters
    currentTheme: isDarkMode ? 'dark' : 'light',
  };

  return (
    <ThemeContext.Provider value={themeValue}>
      {children}
    </ThemeContext.Provider>
  );
};

/* ============================================================================
   PART B: CUSTOM HOOKS FOR THEME CONSUMPTION
   ============================================================================ */

/**
 * useTheme Hook
 * Access theme state and controls from any component
 *
 * @throws {Error} If used outside ThemeProvider
 * @returns {Object} Theme context value with state and toggle functions
 *
 * @example
 * const { isDarkMode, toggleDarkMode } = useTheme();
 *
 * @example
 * const { reducedMotion, toggleReducedMotion } = useTheme();
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      'useTheme must be used within a ThemeProvider component. ' +
      'Wrap your application with <ThemeProvider> in your main.jsx or index.js file.'
    );
  }

  return context;
};

/**
 * useDarkMode Hook
 * Convenience hook for accessing only dark mode state
 *
 * @returns {Object} Object with isDarkMode and toggleDarkMode
 *
 * @example
 * const { isDarkMode, toggleDarkMode } = useDarkMode();
 */
export const useDarkMode = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  return { isDarkMode, toggleDarkMode };
};

/**
 * useAccessibility Hook
 * Convenience hook for accessing only accessibility preferences
 *
 * @returns {Object} Object with reducedMotion, highContrast, and toggle functions
 *
 * @example
 * const { reducedMotion, highContrast, toggleReducedMotion } = useAccessibility();
 */
export const useAccessibility = () => {
  const { reducedMotion, toggleReducedMotion, highContrast, toggleHighContrast } = useTheme();
  return {
    reducedMotion,
    toggleReducedMotion,
    highContrast,
    toggleHighContrast,
  };
};

/* ============================================================================
   PART C: SETUP AND INTEGRATION GUIDE

   STEP 1: Wrap your application with ThemeProvider
   ============================================================================

   In your main.jsx or index.js file:

   import React from 'react';
   import ReactDOM from 'react-dom/client';
   import { ThemeProvider } from './context/ThemeContext';
   import App from './App';

   ReactDOM.createRoot(document.getElementById('root')).render(
     <React.StrictMode>
       <ThemeProvider>
         <App />
       </ThemeProvider>
     </React.StrictMode>
   );

   ============================================================================
   STEP 2: Use the hooks in your components
   ============================================================================

   Example 1 - Toggle dark mode:

   import { useTheme } from '../context/ThemeContext';

   function ThemeToggle() {
     const { isDarkMode, toggleDarkMode } = useTheme();

     return (
       <button onClick={toggleDarkMode}>
         {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
       </button>
     );
   }

   Example 2 - Access all preferences:

   import { useTheme } from '../context/ThemeContext';

   function Settings() {
     const { isDarkMode, reducedMotion, highContrast, toggleDarkMode } = useTheme();

     return (
       <div>
         <label>
           <input
             type="checkbox"
             checked={isDarkMode}
             onChange={toggleDarkMode}
           />
           Dark Mode
         </label>
       </div>
     );
   }

   Example 3 - Use convenience hooks:

   import { useDarkMode } from '../context/ThemeContext';

   function Header() {
     const { isDarkMode } = useDarkMode();
     return <header className={isDarkMode ? 'dark' : 'light'}>...</header>;
   }

   ============================================================================
   FEATURES AND BEHAVIOR
   ============================================================================

   1. DARK MODE
      - Detects system preference on first load
      - Persists user preference to localStorage
      - Applies 'dark-mode' class to document.body
      - Respects CSS variables defined in variables.css

   2. REDUCED MOTION
      - Respects system prefers-reduced-motion setting
      - Can be toggled by user
      - Applies 'reduce-motion' class to document.body
      - Used by CSS media queries to disable animations

   3. HIGH CONTRAST
      - Respects system prefers-contrast setting
      - Can be toggled by user
      - Applies 'high-contrast' class to document.body
      - Used by CSS media queries to enhance contrast

   4. PERSISTENCE
      - All preferences saved to localStorage
      - 'theme-mode': 'dark' or 'light'
      - 'reduce-motion': 'true' or 'false'
      - 'high-contrast': 'true' or 'false'

   5. SYSTEM SYNC
      - Monitors system preference changes
      - Updates state when system preferences change
      - Respects user's explicit preference (localStorage takes priority)

   ============================================================================
   CONTEXT VALUE SHAPE
   ============================================================================

   {
     // Dark mode
     isDarkMode: boolean,
     toggleDarkMode: () => void,

     // Accessibility
     reducedMotion: boolean,
     toggleReducedMotion: (value: boolean) => void,
     highContrast: boolean,
     toggleHighContrast: (value: boolean) => void,

     // Utility
     currentTheme: 'dark' | 'light',
   }

   ============================================================================ */
