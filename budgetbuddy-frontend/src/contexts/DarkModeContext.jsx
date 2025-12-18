import { createContext, useContext, useState, useEffect } from 'react';

/**
 * Dark Mode Context
 *
 * Purpose: Manage dark mode state across the entire application
 *
 * Why Context API?
 * - Global state needed (theme affects all components)
 * - Avoid prop drilling (passing darkMode through every component)
 * - Single source of truth for theme state
 * - Easy to consume with useContext hook
 *
 * How it works:
 * 1. Context provides darkMode boolean and toggleDarkMode function
 * 2. State persisted in localStorage (survives page refresh)
 * 3. HTML document class updated ('dark' class on <html>)
 * 4. Tailwind CSS dark: variants activate when 'dark' class present
 */

// Create context with default values
const DarkModeContext = createContext({
  darkMode: false,
  toggleDarkMode: () => {},
});

/**
 * Custom hook to access dark mode context
 *
 * Usage in components:
 * ```javascript
 * const { darkMode, toggleDarkMode } = useDarkMode();
 * ```
 *
 * Why custom hook?
 * - Cleaner API (useDarkMode vs useContext(DarkModeContext))
 * - Type safety (throws error if used outside provider)
 * - Encapsulation (internal implementation can change)
 */
export const useDarkMode = () => {
  const context = useContext(DarkModeContext);
  if (!context) {
    throw new Error('useDarkMode must be used within DarkModeProvider');
  }
  return context;
};

/**
 * Dark Mode Provider Component
 *
 * Wraps the app and provides dark mode state to all children
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - App components
 *
 * State Management:
 * - Reads initial state from localStorage ('dark-mode' key)
 * - Falls back to system preference if no localStorage value
 * - Updates localStorage on every toggle
 * - Updates document.documentElement.classList ('dark' class)
 *
 * Why localStorage?
 * - Persists user preference across sessions
 * - Fast (synchronous, no network request)
 * - Simple API (setItem/getItem)
 * - Supported in all modern browsers
 *
 * Why document.documentElement.classList?
 * - Tailwind CSS dark mode requires 'dark' class on root element
 * - document.documentElement = <html> tag
 * - Adding/removing class triggers CSS changes immediately
 * - No re-render needed (CSS handles visual updates)
 */
export const DarkModeProvider = ({ children }) => {
  /**
   * Initialize dark mode state
   *
   * Priority:
   * 1. Check localStorage for saved preference
   * 2. If no saved preference, check system preference
   * 3. Default to false (light mode)
   *
   * window.matchMedia('(prefers-color-scheme: dark)'):
   * - Checks OS-level dark mode setting
   * - Returns MediaQueryList object
   * - .matches is true if dark mode preferred
   *
   * Why check system preference?
   * - Respects user's OS settings on first visit
   * - Better UX (no flash of wrong theme)
   * - Follows platform conventions
   */
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage first
    const saved = localStorage.getItem('dark-mode');
    if (saved !== null) {
      return saved === 'true'; // Convert string to boolean
    }

    // Fall back to system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  /**
   * Effect: Update DOM and localStorage when darkMode changes
   *
   * This runs:
   * - On component mount (initial setup)
   * - Whenever darkMode state changes (toggle)
   *
   * Actions:
   * 1. Add or remove 'dark' class from <html> element
   * 2. Save preference to localStorage
   *
   * Why useEffect?
   * - Side effects (DOM manipulation, localStorage) must be in useEffect
   * - Can't be in render (would cause inconsistencies)
   * - Dependency array [darkMode] ensures it runs on changes
   */
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Persist to localStorage
    localStorage.setItem('dark-mode', darkMode.toString());
  }, [darkMode]);

  /**
   * Toggle dark mode function
   *
   * Called by toggle button in header
   * Flips boolean state (true → false, false → true)
   *
   * Why not setDarkMode(!darkMode)?
   * - Functional update is more reliable
   * - Handles stale closures in event handlers
   * - Ensures state update based on latest value
   */
  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  // Provide state and toggle function to all children
  return (
    <DarkModeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
};
