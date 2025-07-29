import React from 'react';

const DarkModeToggle = ({ isDarkMode, toggleDarkMode }) => {
  return (
    <button
      className="dark-mode-toggle"
      onClick={toggleDarkMode}
      title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className="dark-mode-icon">
        {isDarkMode ? '☀️' : '🌙'}
      </span>
      <span className="d-none d-md-inline">
        {isDarkMode ? 'Light' : 'Dark'}
      </span>
    </button>
  );
};

export default DarkModeToggle;
