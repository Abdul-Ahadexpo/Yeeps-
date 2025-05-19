import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Button } from '../ui/Button';
import { Menu, LogOut, Sun, Moon, Menu as MenuIcon } from 'lucide-react';

interface NavbarProps {
  onMenuClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };
  
  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-gray-800 shadow-sm">
      <div className="px-4 md:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <button
            id="sidebar-toggle"
            onClick={onMenuClick}
            className="lg:hidden p-2 mr-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-700"
            aria-label="Open sidebar"
          >
            <MenuIcon size={24} />
          </button>
          
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            <span className="text-primary-600">Notes</span> & Questions
          </h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-700"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          {user && (
            <div className="flex items-center">
              <div className="hidden md:flex items-center">
                <img
                  src={user.photoURL || ''}
                  alt={user.displayName || 'User'}
                  className="h-8 w-8 rounded-full mr-2"
                />
                <span className="font-medium text-gray-800 dark:text-gray-200 mr-4">
                  {user.displayName?.split(' ')[0]}
                </span>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<LogOut size={18} />}
                onClick={handleSignOut}
                className="text-gray-600 dark:text-gray-400"
              >
                <span className="sr-only md:not-sr-only">Sign Out</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;