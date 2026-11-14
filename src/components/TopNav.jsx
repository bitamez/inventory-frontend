import React from 'react';
import { Menu, Bell, User, LogOut, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import GlobalSearch from './GlobalSearch';
import { useTheme } from '../context/ThemeContext';

const TopNav = ({ title, onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="h-16 sm:h-20 bg-surface border-b border-border flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-30 print:hidden">
      {/* Left: hamburger + title */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg hover:bg-surfaceHighlight text-textMuted hover:text-textMain transition-colors lg:hidden"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-base sm:text-xl font-semibold text-textMain truncate max-w-[140px] sm:max-w-none">{title}</h2>
      </div>

      {/* Right: search + actions */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Search hidden on very small screens */}
        <GlobalSearch />

        {/* Bell */}
        <button className="relative p-2 rounded-full hover:bg-surfaceHighlight text-textMuted hover:text-textMain transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-warning rounded-full border-2 border-surface"></span>
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-2 rounded-full hover:bg-surfaceHighlight text-textMuted hover:text-textMain transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* User info — hidden name on small screens */}
        <div className="flex items-center space-x-2 sm:space-x-3 p-1.5 sm:pr-3 rounded-full hover:bg-surfaceHighlight transition-colors cursor-default">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-sm shrink-0">
            {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-textMain leading-none">{user?.full_name || 'User'}</p>
            <p className="text-xs text-textMuted mt-1">{user?.role_name || 'Staff'}</p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          title="Logout"
          className="p-2 rounded-full hover:bg-danger/10 text-textMuted hover:text-danger transition-colors"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

export default TopNav;
