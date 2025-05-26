import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { Menu, X, User, LogOut } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleProfile = () => setIsProfileOpen(!isProfileOpen);

  return (
    <nav className="bg-night-950 text-white relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="font-display text-xl font-bold text-spice-500">DUNE</span>
              <span className="font-display text-lg ml-1">TRACKER</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              {user && (
                <>
                  <Link
                    to="/dashboard"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      location.pathname === '/dashboard'
                        ? 'bg-night-800 text-white'
                        : 'text-sand-300 hover:bg-night-800 hover:text-white'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/grid"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      location.pathname === '/grid'
                        ? 'bg-night-800 text-white'
                        : 'text-sand-300 hover:bg-night-800 hover:text-white'
                    }`}
                  >
                    Grid Map
                  </Link>
                  <Link
                    to="/pois"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      location.pathname === '/pois'
                        ? 'bg-night-800 text-white'
                        : 'text-sand-300 hover:bg-night-800 hover:text-white'
                    }`}
                  >
                    Points of Interest
                  </Link>
                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        location.pathname === '/admin'
                          ? 'bg-night-800 text-white'
                          : 'text-sand-300 hover:bg-night-800 hover:text-white'
                      }`}
                    >
                      Admin
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="hidden md:block">
            <div className="ml-4 flex items-center">
              {user ? (
                <div className="relative">
                  <button
                    onClick={toggleProfile}
                    className="flex items-center text-sm px-3 py-2 rounded-md text-sand-300 hover:bg-night-800 hover:text-white focus:outline-none"
                  >
                    <span className="mr-2">{user.username}</span>
                    <User size={16} />
                  </button>
                  
                  {isProfileOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-40"
                        onClick={() => setIsProfileOpen(false)}
                      ></div>
                      <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                        <div className="py-1">
                          <div className="px-4 py-2 text-sm text-night-700 border-b border-sand-200">
                            <p className="font-medium">{user.username}</p>
                            <p className="text-xs text-sand-600">Role: {user.role}</p>
                          </div>
                          <button
                            onClick={() => {
                              signOut();
                              setIsProfileOpen(false);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-night-700 hover:bg-sand-100"
                          >
                            <div className="flex items-center">
                              <LogOut size={16} className="mr-2" />
                              Sign Out
                            </div>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Link
                  to="/auth"
                  className="text-sand-300 hover:bg-night-800 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-sand-400 hover:text-white hover:bg-night-800 focus:outline-none"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-night-900">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    location.pathname === '/dashboard'
                      ? 'bg-night-800 text-white'
                      : 'text-sand-300 hover:bg-night-800 hover:text-white'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/grid"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    location.pathname === '/grid'
                      ? 'bg-night-800 text-white'
                      : 'text-sand-300 hover:bg-night-800 hover:text-white'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Grid Map
                </Link>
                <Link
                  to="/pois"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    location.pathname === '/pois'
                      ? 'bg-night-800 text-white'
                      : 'text-sand-300 hover:bg-night-800 hover:text-white'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Points of Interest
                </Link>
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      location.pathname === '/admin'
                        ? 'bg-night-800 text-white'
                        : 'text-sand-300 hover:bg-night-800 hover:text-white'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Admin
                  </Link>
                )}
                <div className="border-t border-night-800 pt-2 mt-2">
                  <div className="px-3 py-2 text-sand-400 text-sm">
                    <p className="font-medium">{user.username}</p>
                    <p className="text-xs">Role: {user.role}</p>
                  </div>
                  <button
                    onClick={() => {
                      signOut();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center w-full text-left px-3 py-2 text-base font-medium text-sand-300 hover:bg-night-800 hover:text-white rounded-md"
                  >
                    <LogOut size={16} className="mr-2" />
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <Link
                to="/auth"
                className="block px-3 py-2 rounded-md text-base font-medium text-sand-300 hover:bg-night-800 hover:text-white"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;