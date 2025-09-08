import React from 'react';
import { UserProfile } from '../types';
import { ICONS } from '../constants';

interface HeaderProps {
  user: UserProfile | null;
  onLogout: () => void;
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, toggleSidebar }) => {
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <header className="bg-white shadow-sm p-4 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center">
        <button onClick={toggleSidebar} className="text-gray-600 mr-4 lg:hidden">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex items-center">
         <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
        </svg>
        <h1 className="text-xl font-bold text-gray-800">Professional Portal</h1>
       </div>
      </div>
      <div className="relative">
        {user && (
          <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center space-x-2">
            <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
              {user.email.charAt(0).toUpperCase()}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-semibold text-gray-700">{user.email}</p>
              <p className="text-xs text-gray-500 capitalize">{user.role.replace('_', ' ')}</p>
            </div>
          </button>
        )}
        {menuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-40">
            <button
              onClick={onLogout}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            >
              {ICONS.LOGOUT}
              <span className="ml-2">Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
