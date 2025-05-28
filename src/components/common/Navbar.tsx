import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { Menu, X, User, LogOut, Shield, LayoutDashboard, Mountain, MapPin, Pyramid } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleProfile = () => setIsProfileOpen(!isProfileOpen);

  const NavButton: React.FC<{
    to: string;
    children: React.ReactNode;
    icon: React.ReactNode;
    isActive: boolean;
    onClick?: () => void;
    className?: string;
  }> = ({ to, children, icon, isActive, onClick, className = '' }) => (
    <Link
      to={to}
      onClick={onClick}
      className={`
        relative px-4 py-2.5 rounded-full text-sm font-bold transition-all duration-300 transform
        ${isActive 
          ? 'bg-gradient-to-r from-spice-500 to-spice-700 text-white shadow-xl shadow-spice-600/40 scale-105 border-2 border-spice-400' 
          : 'text-sand-100 hover:text-white hover:bg-gradient-to-r hover:from-spice-500/70 hover:to-spice-600/70 hover:scale-105 hover:shadow-lg border-2 border-transparent hover:border-spice-400/40'
        }
        backdrop-blur-md ${className}
      `}
    >
      <div className="flex items-center space-x-2">
        <span className={`transition-all duration-300 ${isActive ? 'text-white' : 'text-sand-300 group-hover:text-white'}`}>
          {icon}
        </span>
        <span className="font-bold">{children}</span>
      </div>
      {isActive && (
        <>
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-spice-400 via-spice-600 to-spice-800 opacity-90 -z-10 animate-pulse"></div>
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-spice-300 to-spice-700 opacity-20 blur-sm -z-20"></div>
        </>
      )}
    </Link>
  );

  const MobileNavButton: React.FC<{
    to: string;
    children: React.ReactNode;
    icon: React.ReactNode;
    isActive: boolean;
    onClick?: () => void;
  }> = ({ to, children, icon, isActive, onClick }) => (
    <Link
      to={to}
      onClick={onClick}
      className={`
        block px-4 py-3 rounded-xl text-base font-bold transition-all duration-300 transform
        ${isActive 
          ? 'bg-gradient-to-r from-spice-500 to-spice-700 text-white shadow-lg mx-3 scale-105' 
          : 'text-sand-100 hover:text-white hover:bg-gradient-to-r hover:from-spice-500/70 hover:to-spice-600/70 hover:translate-x-2 hover:scale-105 mx-3'
        }
        backdrop-blur-sm border-2 border-transparent hover:border-spice-400/40
      `}
    >
      <div className="flex items-center space-x-3">
        <span className={`transition-all duration-300 ${isActive ? 'text-white' : 'text-sand-300'}`}>
          {icon}
        </span>
        <span>{children}</span>
      </div>
    </Link>
  );

  return (
    <nav className="relative z-50 text-white overflow-hidden">
      {/* Enhanced Background with Patterns */}
      <div className="absolute inset-0 bg-gradient-to-r from-night-950 via-night-900 to-night-950"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-night-800/20 to-night-950/40"></div>
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(214, 158, 86, 0.3) 0%, transparent 25%), 
                           radial-gradient(circle at 75% 75%, rgba(215, 100, 64, 0.2) 0%, transparent 25%),
                           radial-gradient(circle at 50% 50%, rgba(138, 177, 219, 0.1) 0%, transparent 50%)`,
          backgroundSize: '400px 400px, 300px 300px, 200px 200px',
          backgroundPosition: '0 0, 100px 100px, 200px 0'
        }}
      ></div>
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 2px,
            rgba(214, 158, 86, 0.1) 2px,
            rgba(214, 158, 86, 0.1) 4px
          )`
        }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-r from-spice-500/5 via-transparent to-sand-500/5"></div>
      
      {/* Content */}
      <div className="relative border-b-2 border-gradient-to-r from-night-800/50 via-spice-500/30 to-night-800/50 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Sleeker Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center group">
                <div className="relative">
                  <span className="font-display text-2xl font-bold bg-gradient-to-r from-spice-400 via-spice-500 to-spice-600 bg-clip-text text-transparent">
                    DUNE
                  </span>
                  <span className="font-display text-lg font-medium ml-2 text-sand-100 group-hover:text-sand-50 transition-colors duration-300">
                    TRACKER
                  </span>
                  <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-spice-400 to-spice-600 group-hover:w-full transition-all duration-500 rounded-full"></div>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="flex items-center space-x-4">
                {user && (
                  <>
                    <NavButton
                      to="/dashboard"
                      icon={<LayoutDashboard size={16} />}
                      isActive={location.pathname === '/dashboard'}
                    >
                      Dashboard
                    </NavButton>
                    <NavButton
                      to="/deep-desert"
                      icon={<Pyramid size={16} />}
                      isActive={location.pathname.startsWith('/deep-desert')}
                    >
                      Deep Desert
                    </NavButton>
                    <NavButton
                      to="/hagga-basin"
                      icon={<Mountain size={16} />}
                      isActive={location.pathname === '/hagga-basin'}
                    >
                      Hagga Basin
                    </NavButton>
                    <NavButton
                      to="/pois"
                      icon={<MapPin size={16} />}
                      isActive={location.pathname === '/pois'}
                    >
                      Points of Interest
                    </NavButton>
                    {user.role === 'admin' && (
                      <NavButton
                        to="/admin"
                        icon={<Shield size={16} />}
                        isActive={location.pathname === '/admin'}
                        className="bg-gradient-to-r from-amber-600/20 to-amber-500/20 border-amber-400/40"
                      >
                        Admin
                      </NavButton>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Enhanced Profile Section */}
            <div className="hidden md:block">
              <div className="ml-6 flex items-center">
                {user ? (
                  <div className="relative">
                    <button
                      onClick={toggleProfile}
                      className="flex items-center px-4 py-2 rounded-full text-sm font-semibold text-sand-100 hover:text-white hover:bg-gradient-to-r hover:from-night-700/80 hover:to-night-600/80 hover:scale-105 transition-all duration-300 border-2 border-transparent hover:border-sand-400/30 backdrop-blur-md group shadow-md"
                    >
                      <span className="mr-2 group-hover:text-sand-50 transition-colors duration-300">{user.username}</span>
                      <User size={18} className="text-sand-300 group-hover:text-sand-100 transition-colors duration-300" />
                    </button>
                    
                    {isProfileOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-40"
                          onClick={() => setIsProfileOpen(false)}
                        ></div>
                        <div className="absolute right-0 mt-3 w-56 rounded-2xl shadow-2xl bg-white/95 backdrop-blur-md ring-1 ring-black/5 z-50 border border-sand-200/50 transform transition-all duration-300 animate-in slide-in-from-top-5">
                          <div className="py-2">
                            <div className="px-4 py-3 bg-gradient-to-r from-sand-50 to-sand-100 rounded-t-2xl border-b border-sand-200">
                              <p className="font-semibold text-night-800">{user.username}</p>
                              <p className="text-xs text-sand-600 flex items-center">
                                <span className="mr-1">Role:</span>
                                <span className="px-2 py-0.5 bg-spice-100 text-spice-700 rounded-full text-xs font-medium">
                                  {user.role}
                                </span>
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                signOut();
                                setIsProfileOpen(false);
                              }}
                              className="flex items-center w-full text-left px-4 py-3 text-sm text-night-700 hover:bg-sand-50 hover:text-night-900 transition-all duration-200 group rounded-b-2xl"
                            >
                              <LogOut size={16} className="mr-3 text-sand-500 group-hover:text-spice-600 transition-colors duration-200" />
                              <span className="font-medium">Sign Out</span>
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <Link
                    to="/auth"
                    className="px-6 py-2.5 rounded-full text-sm font-bold bg-gradient-to-r from-spice-600 to-spice-700 text-white hover:from-spice-500 hover:to-spice-600 hover:scale-105 transition-all duration-300 shadow-lg shadow-spice-600/30 border border-spice-500/50"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>

            {/* Enhanced Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-xl text-sand-300 hover:text-white hover:bg-gradient-to-r hover:from-night-700/60 hover:to-night-600/60 transition-all duration-300 transform hover:scale-110 border-2 border-transparent hover:border-sand-400/30 backdrop-blur-md"
              >
                <div className="relative w-6 h-6">
                  <Menu 
                    size={24} 
                    className={`absolute inset-0 transition-all duration-300 ${isMenuOpen ? 'opacity-0 rotate-180 scale-75' : 'opacity-100 rotate-0 scale-100'}`} 
                  />
                  <X 
                    size={24} 
                    className={`absolute inset-0 transition-all duration-300 ${isMenuOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-180 scale-75'}`} 
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Mobile menu */}
      <div className={`md:hidden relative transition-all duration-700 transform ${isMenuOpen ? 'max-h-screen opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-8'} overflow-hidden`}>
        {/* Mobile Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-night-800 via-night-900 to-night-950"></div>
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 30% 30%, rgba(214, 158, 86, 0.4) 0%, transparent 40%)`,
            backgroundSize: '300px 300px'
          }}
        ></div>
        <div className="absolute inset-0 border-t-2 border-gradient-to-r from-spice-500/30 via-sand-400/30 to-spice-500/30"></div>
        
        <div className="relative px-4 pt-4 pb-6 space-y-2">
          {user ? (
            <>
              <MobileNavButton
                to="/dashboard"
                icon={<LayoutDashboard size={18} />}
                isActive={location.pathname === '/dashboard'}
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </MobileNavButton>
              <MobileNavButton
                to="/deep-desert"
                icon={<Pyramid size={18} />}
                isActive={location.pathname.startsWith('/deep-desert')}
                onClick={() => setIsMenuOpen(false)}
              >
                Deep Desert
              </MobileNavButton>
              <MobileNavButton
                to="/hagga-basin"
                icon={<Mountain size={18} />}
                isActive={location.pathname === '/hagga-basin'}
                onClick={() => setIsMenuOpen(false)}
              >
                Hagga Basin
              </MobileNavButton>
              <MobileNavButton
                to="/pois"
                icon={<MapPin size={18} />}
                isActive={location.pathname === '/pois'}
                onClick={() => setIsMenuOpen(false)}
              >
                Points of Interest
              </MobileNavButton>
              {user.role === 'admin' && (
                <MobileNavButton
                  to="/admin"
                  icon={<Shield size={18} />}
                  isActive={location.pathname === '/admin'}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Admin Panel
                </MobileNavButton>
              )}
              
              {/* Mobile Profile Section */}
              <div className="border-t border-night-800/50 pt-4 mt-4 mx-2">
                <div className="px-4 py-3 bg-gradient-to-r from-night-800/50 to-night-700/50 rounded-xl backdrop-blur-sm border border-night-700/50">
                  <p className="font-semibold text-sand-100 text-base">{user.username}</p>
                  <p className="text-xs text-sand-400 flex items-center mt-1">
                    <span className="mr-2">Role:</span>
                    <span className="px-2 py-0.5 bg-spice-600/20 text-spice-300 rounded-full text-xs font-medium border border-spice-500/30">
                      {user.role}
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => {
                    signOut();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center w-full text-left px-4 py-3 mt-2 text-base font-medium text-sand-200 hover:text-white hover:bg-spice-500/40 transition-all duration-300 rounded-xl mx-2 group border border-transparent hover:border-spice-400/30"
                >
                  <LogOut size={18} className="mr-3 text-sand-400 group-hover:text-spice-300 transition-colors duration-300" />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          ) : (
            <Link
              to="/auth"
              className="block mx-2 px-6 py-3 rounded-xl text-base font-medium bg-gradient-to-r from-spice-600 to-spice-700 text-white hover:from-spice-500 hover:to-spice-600 transition-all duration-300 text-center shadow-lg"
              onClick={() => setIsMenuOpen(false)}
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;