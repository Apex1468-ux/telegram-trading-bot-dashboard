import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authStore from '../stores/authStore';
import { LogOut, Menu } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = authStore();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/dashboard" className="text-2xl font-bold text-blue-400">
            MONSTER BOT
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex gap-6 items-center">
            <Link to="/dashboard" className="text-gray-300 hover:text-white transition">
              Dashboard
            </Link>
            <Link to="/trades" className="text-gray-300 hover:text-white transition">
              Trades
            </Link>
            <Link to="/settings" className="text-gray-300 hover:text-white transition">
              Settings
            </Link>
            <div className="flex items-center gap-4 ml-6 pl-6 border-l border-gray-700">
              <span className="text-gray-300 text-sm">{user?.username}</span>
              <button
                onClick={handleLogout}
                className="text-red-400 hover:text-red-300 transition flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            <span className="text-gray-300 text-sm">{user?.username}</span>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-gray-300 hover:text-white"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden pb-4">
            <Link to="/dashboard" className="block text-gray-300 hover:text-white py-2">
              Dashboard
            </Link>
            <Link to="/trades" className="block text-gray-300 hover:text-white py-2">
              Trades
            </Link>
            <Link to="/settings" className="block text-gray-300 hover:text-white py-2">
              Settings
            </Link>
            <button
              onClick={handleLogout}
              className="block w-full text-left text-red-400 hover:text-red-300 py-2 mt-2 pt-2 border-t border-gray-700"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
