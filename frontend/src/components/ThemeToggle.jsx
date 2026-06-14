import { useState, useRef, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const getThemeIcon = (t) => {
    switch (t) {
      case "light":
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="4"></circle>
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path>
          </svg>
        );
      case "dark":
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
          </svg>
        );
      case "system":
      default:
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="14" x="2" y="3" rx="2"></rect>
            <line x1="8" x2="16" y1="21" y2="21"></line>
            <line x1="12" x2="12" y1="17" y2="21"></line>
          </svg>
        );
    }
  };

  return (
    <div className="theme-toggle-container" ref={dropdownRef}>
      <button 
        type="button"
        className="theme-toggle-btn" 
        onClick={() => setIsOpen(!isOpen)}
        title={`Theme: ${theme}`}
        aria-label="Toggle theme selection"
      >
        {getThemeIcon(theme)}
      </button>

      {isOpen && (
        <div className="theme-dropdown-menu">
          <button 
            type="button" 
            className={`theme-dropdown-item ${theme === "light" ? "active" : ""}`}
            onClick={() => { setTheme("light"); setIsOpen(false); }}
          >
            {getThemeIcon("light")}
            <span>Light</span>
          </button>
          <button 
            type="button" 
            className={`theme-dropdown-item ${theme === "dark" ? "active" : ""}`}
            onClick={() => { setTheme("dark"); setIsOpen(false); }}
          >
            {getThemeIcon("dark")}
            <span>Dark</span>
          </button>
          <button 
            type="button" 
            className={`theme-dropdown-item ${theme === "system" ? "active" : ""}`}
            onClick={() => { setTheme("system"); setIsOpen(false); }}
          >
            {getThemeIcon("system")}
            <span>System</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default ThemeToggle;
