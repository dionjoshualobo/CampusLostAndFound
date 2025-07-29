import React, { useState, useEffect } from 'react';

const ThemeSelector = () => {
  const [currentTheme, setCurrentTheme] = useState('light');
  
  const themes = [
    { name: 'light', displayName: 'Light' },
    { name: 'dark', displayName: 'Dark' },
    { name: 'cupcake', displayName: 'Cupcake' },
    { name: 'bumblebee', displayName: 'Bumblebee' },
    { name: 'emerald', displayName: 'Emerald' },
    { name: 'corporate', displayName: 'Corporate' },
    { name: 'synthwave', displayName: 'Synthwave' },
    { name: 'retro', displayName: 'Retro' },
    { name: 'cyberpunk', displayName: 'Cyberpunk' },
    { name: 'valentine', displayName: 'Valentine' },
    { name: 'halloween', displayName: 'Halloween' },
    { name: 'garden', displayName: 'Garden' },
    { name: 'forest', displayName: 'Forest' },
    { name: 'aqua', displayName: 'Aqua' },
    { name: 'lofi', displayName: 'Lo-Fi' },
    { name: 'pastel', displayName: 'Pastel' },
    { name: 'fantasy', displayName: 'Fantasy' },
    { name: 'wireframe', displayName: 'Wireframe' },
    { name: 'black', displayName: 'Black' },
    { name: 'luxury', displayName: 'Luxury' },
    { name: 'dracula', displayName: 'Dracula' },
    { name: 'cmyk', displayName: 'CMYK' },
    { name: 'autumn', displayName: 'Autumn' },
    { name: 'business', displayName: 'Business' },
    { name: 'acid', displayName: 'Acid' },
    { name: 'lemonade', displayName: 'Lemonade' },
    { name: 'night', displayName: 'Night' },
    { name: 'coffee', displayName: 'Coffee' },
    { name: 'winter', displayName: 'Winter' },
    { name: 'dim', displayName: 'Dim' },
    { name: 'nord', displayName: 'Nord' },
    { name: 'sunset', displayName: 'Sunset' }
  ];

  useEffect(() => {
    // Load saved theme or default to light
    const savedTheme = localStorage.getItem('daisyui-theme') || 'light';
    setCurrentTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const changeTheme = (themeName) => {
    setCurrentTheme(themeName);
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem('daisyui-theme', themeName);
  };

  const getCurrentThemeDisplay = () => {
    const theme = themes.find(t => t.name === currentTheme);
    return theme ? theme.displayName : 'Light';
  };

  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-ghost">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-5 h-5 stroke-current">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a4 4 0 004-4V5z"></path>
        </svg>
        <span className="hidden sm:inline">{getCurrentThemeDisplay()}</span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-4 h-4 stroke-current ml-1">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </div>
      <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 max-h-96 overflow-y-auto">
        {themes.map((theme) => (
          <li key={theme.name}>
            <button
              onClick={() => changeTheme(theme.name)}
              className={`theme-option flex items-center ${currentTheme === theme.name ? 'active bg-base-200' : ''}`}
            >
              <span className={`theme-preview ${theme.name}`}></span>
              {theme.displayName}
              {currentTheme === theme.name && (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-4 h-4 stroke-current ml-auto">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ThemeSelector;
