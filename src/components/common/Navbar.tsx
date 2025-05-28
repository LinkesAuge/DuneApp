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
  }> = ({ to, children, icon, isActive, onClick }) => (
    <Link
      to={to}
      onClick={onClick}
      className="group relative flex items-center h-16 px-4 min-w-[140px] justify-center transition-all duration-300"
    >
      {/* Button background image */}
      <div 
        className="absolute inset-0 bg-center bg-cover bg-no-repeat"
        style={{
          backgroundImage: 'url(/images/bg-button.png)',
          backgroundSize: 'cover'
        }}
      />
      
      {/* Advanced purple overlay - fades from top, to sides and bottom */}
      <div className={`
        absolute inset-0 transition-all duration-300
        ${isActive 
          ? 'bg-gradient-to-b from-violet-600/50 via-violet-700/30 to-transparent' 
          : 'bg-gradient-to-b from-violet-600/0 via-violet-700/0 to-transparent group-hover:from-violet-600/40 group-hover:via-violet-700/20'
        }
      `} />
      
      {/* Radial fade overlay for sides */}
      <div className={`
        absolute inset-0 transition-all duration-300
        ${isActive 
          ? 'bg-gradient-radial from-violet-500/20 via-violet-600/10 to-transparent' 
          : 'bg-gradient-radial from-transparent via-transparent to-transparent group-hover:from-violet-500/15 group-hover:via-violet-600/8'
        }
      `} 
      style={{
        background: isActive 
          ? 'radial-gradient(ellipse at center top, rgba(139, 92, 246, 0.2) 0%, rgba(124, 58, 237, 0.1) 40%, transparent 70%)'
          : undefined
      }}
      />
      
      {/* Content */}
      <div className="relative z-10 flex items-center space-x-2">
        <span className={`
          transition-all duration-300
          ${isActive ? 'text-amber-200 drop-shadow-lg' : 'text-amber-300 group-hover:text-amber-100 group-hover:drop-shadow-lg'}
        `}
        style={{
          textShadow: isActive ? '0 0 8px rgba(251, 191, 36, 0.6)' : undefined
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.textShadow = '0 0 12px rgba(251, 191, 36, 0.8)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.textShadow = 'none';
          }
        }}
        >
          {icon}
        </span>
        <span className={`
          font-light text-xs uppercase tracking-widest transition-all duration-300 whitespace-nowrap
          ${isActive ? 'text-amber-100 drop-shadow-lg' : 'text-amber-200 group-hover:text-amber-50 group-hover:drop-shadow-lg'}
        `}
        style={{
          textShadow: isActive ? '0 0 8px rgba(251, 191, 36, 0.6)' : undefined
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.textShadow = '0 0 12px rgba(251, 191, 36, 0.8)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.textShadow = 'none';
          }
        }}
        >
          {children}
        </span>
      </div>
      
      {/* Sleek expanding underline */}
      <div className={`
        absolute bottom-1 left-0 transition-all duration-700 ease-out h-0.5 bg-gradient-to-r from-transparent to-transparent
        ${isActive 
          ? 'w-full via-yellow-300 shadow-md shadow-yellow-300/60' 
          : 'w-0 via-violet-400 group-hover:w-full group-hover:shadow-md group-hover:shadow-violet-400/50'
        }
      `} />
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
      className="group relative flex items-center px-4 py-4 mx-4 mb-2 transition-all duration-300"
    >
      {/* Mobile button background image */}
      <div 
        className="absolute inset-0 bg-center bg-cover bg-no-repeat opacity-70"
        style={{
          backgroundImage: 'url(/images/bg-button.png)',
          backgroundSize: 'cover'
        }}
      />
      
      {/* Purple overlay with advanced fading */}
      <div className={`
        absolute inset-0 transition-all duration-300
        ${isActive 
          ? 'bg-gradient-to-b from-violet-600/40 via-violet-700/20 to-transparent' 
          : 'bg-gradient-to-b from-violet-600/0 via-violet-700/0 to-transparent group-hover:from-violet-600/30 group-hover:via-violet-700/15'
        }
      `} />
      
      {/* Content */}
      <div className="relative z-10 flex items-center space-x-3">
        <span className={`
          transition-all duration-300
          ${isActive ? 'text-amber-200 drop-shadow-lg' : 'text-amber-300 group-hover:text-amber-100 group-hover:drop-shadow-lg'}
        `}
        style={{
          textShadow: isActive ? '0 0 8px rgba(251, 191, 36, 0.6)' : undefined
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.textShadow = '0 0 12px rgba(251, 191, 36, 0.8)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.textShadow = 'none';
          }
        }}
        >
          {icon}
        </span>
        <span className={`
          font-light text-sm uppercase tracking-wide transition-all duration-300
          ${isActive ? 'text-amber-100 drop-shadow-lg' : 'text-amber-200 group-hover:text-amber-50 group-hover:drop-shadow-lg'}
        `}
        style={{
          textShadow: isActive ? '0 0 8px rgba(251, 191, 36, 0.6)' : undefined
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.textShadow = '0 0 12px rgba(251, 191, 36, 0.8)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.textShadow = 'none';
          }
        }}
        >
          {children}
        </span>
      </div>
      
      {/* Sleek expanding underline for mobile */}
      <div className={`
        absolute bottom-0 left-0 transition-all duration-700 ease-out h-0.5 bg-gradient-to-r from-transparent to-transparent
        ${isActive 
          ? 'w-full via-yellow-300 shadow-sm shadow-yellow-300/60' 
          : 'w-0 via-violet-400 group-hover:w-full group-hover:shadow-sm group-hover:shadow-violet-400/50'
        }
      `} />
    </Link>
  );

  return (
    <nav className="relative z-50 border-b border-slate-700/30">
      {/* Navbar background image */}
      <div 
        className="absolute inset-0 bg-center bg-cover bg-no-repeat"
        style={{
          backgroundImage: 'url(/images/navbar-color.png?v=' + Date.now() + ')',
          backgroundSize: 'cover'
        }}
      />
      
      {/* Subtle texture overlay */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(234, 179, 8, 0.05) 0%, transparent 50%)
          `
        }}
      />
      
      {/* Main content */}
      <div className="relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center h-16">
            
            {/* Expanded Logo Section - takes much more space with separation */}
            <div className="flex-1 max-w-lg mr-12">
              <Link to="/" className="group relative flex items-center h-16 px-8 transition-all duration-300">
                {/* Logo button background image */}
                <div 
                  className="absolute inset-0 bg-center bg-cover bg-no-repeat"
                  style={{
                    backgroundImage: 'url(/images/bg-button.png)',
                    backgroundSize: 'cover'
                  }}
                />
                
                {/* Logo hover gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/0 via-yellow-500/0 to-yellow-600/0 group-hover:from-yellow-600/15 group-hover:via-yellow-500/10 group-hover:to-yellow-600/15 transition-all duration-300" />
                
                <div className="relative z-10 flex items-center justify-center">
                  <img 
                    src={`/images/dune-log.png?v=${Date.now()}`}
                    alt="Dune Awakening Tracker" 
                    className="h-10 w-auto object-contain transition-all duration-300 group-hover:scale-105 drop-shadow-sm"
                    style={{ 
                      filter: 'brightness(1.1) contrast(1.05)',
                      maxWidth: '200px'
                    }}
                  />
                </div>
                
                {/* Sleek logo underline */}
                <div className="absolute bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-transparent via-yellow-300/90 to-transparent group-hover:w-full transition-all duration-700 ease-out shadow-md shadow-yellow-300/50" />
              </Link>
            </div>

            {/* Desktop Navigation - centered with separation */}
            <div className="hidden md:flex flex-1 justify-center max-w-2xl">
              <div className="flex items-center space-x-1">
                {user && (
                  <>
                    <NavButton
                      to="/dashboard"
                      icon={<LayoutDashboard size={14} strokeWidth={1.5} />}
                      isActive={location.pathname === '/dashboard'}
                    >
                      Dashboard
                    </NavButton>
                    <NavButton
                      to="/deep-desert"
                      icon={<Pyramid size={14} strokeWidth={1.5} />}
                      isActive={location.pathname.startsWith('/deep-desert')}
                    >
                      Deep Desert
                    </NavButton>
                    <NavButton
                      to="/hagga-basin"
                      icon={<Mountain size={14} strokeWidth={1.5} />}
                      isActive={location.pathname === '/hagga-basin'}
                    >
                      Hagga Basin
                    </NavButton>
                    <NavButton
                      to="/pois"
                      icon={<MapPin size={14} strokeWidth={1.5} />}
                      isActive={location.pathname === '/pois'}
                    >
                      Points of Interest
                    </NavButton>
                    {user.role === 'admin' && (
                      <NavButton
                        to="/admin"
                        icon={<Shield size={14} strokeWidth={1.5} />}
                        isActive={location.pathname === '/admin'}
                      >
                        Admin
                      </NavButton>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Profile Section - right aligned with separation */}
            <div className="hidden md:flex flex-1 justify-end max-w-xs ml-12">
              <div className="flex items-center">
                {user ? (
                  <div className="relative">
                    <button
                      onClick={toggleProfile}
                      className="group relative flex items-center h-16 px-4 min-w-[120px] justify-center transition-all duration-300"
                    >
                      {/* Profile button background image */}
                      <div 
                        className="absolute inset-0 bg-center bg-cover bg-no-repeat"
                        style={{
                          backgroundImage: 'url(/images/bg-button.png)',
                          backgroundSize: 'cover'
                        }}
                      />
                      
                      {/* Enhanced purple hover overlay with advanced fading */}
                      <div 
                        className="absolute inset-0 bg-gradient-to-b from-violet-700/0 via-violet-600/0 to-transparent group-hover:from-violet-700/30 group-hover:via-violet-600/15 transition-all duration-300"
                        style={{
                          background: 'radial-gradient(ellipse at center top, rgba(139, 92, 246, 0) 0%, rgba(124, 58, 237, 0) 40%, transparent 70%)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'radial-gradient(ellipse at center top, rgba(139, 92, 246, 0.15) 0%, rgba(124, 58, 237, 0.08) 40%, transparent 70%)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'radial-gradient(ellipse at center top, rgba(139, 92, 246, 0) 0%, rgba(124, 58, 237, 0) 40%, transparent 70%)';
                        }}
                      />
                      
                      <span className="relative z-10 mr-3 text-amber-200 group-hover:text-amber-50 transition-all duration-300 font-light tracking-wide text-xs group-hover:drop-shadow-lg"
                      style={{
                        textShadow: 'none'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.textShadow = '0 0 12px rgba(251, 191, 36, 0.8)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.textShadow = 'none';
                      }}
                      >
                        {user.username}
                      </span>
                      <User size={14} strokeWidth={1.5} className="relative z-10 text-amber-300 group-hover:text-amber-100 transition-all duration-300 group-hover:drop-shadow-lg" />
                      
                      {/* Sleek expanding underline */}
                      <div className="absolute bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-transparent via-violet-400 to-transparent group-hover:w-full transition-all duration-700 ease-out shadow-md shadow-violet-400/50" />
                    </button>
                    
                    {isProfileOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-40"
                          onClick={() => setIsProfileOpen(false)}
                        />
                        <div className="absolute right-0 mt-2 w-56 bg-gradient-to-b from-slate-950 to-slate-900 border border-slate-600/30 shadow-2xl z-50 backdrop-blur-sm">
                          
                          {/* Header with gradient */}
                          <div className="px-4 py-3 border-b border-slate-600/20 bg-gradient-to-r from-amber-600/10 via-amber-500/5 to-amber-600/10">
                            <p className="font-light text-amber-100 tracking-wide text-sm">{user.username}</p>
                            <div className="flex items-center mt-1">
                              <span className="text-xs text-amber-200 mr-2 font-light">Role:</span>
                              <span className="px-2 py-1 text-xs font-light text-slate-900 bg-gradient-to-r from-amber-200 to-amber-300 tracking-wide">
                                {user.role}
                              </span>
                            </div>
                          </div>
                          
                          {/* Sign Out */}
                          <button
                            onClick={() => {
                              signOut();
                              setIsProfileOpen(false);
                            }}
                            className="group relative flex items-center w-full text-left px-4 py-3 text-amber-200 hover:text-amber-50 transition-all duration-300"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-violet-800/0 to-violet-700/0 group-hover:from-violet-800/20 group-hover:to-violet-700/20 transition-all duration-300" />
                            
                            <LogOut size={14} strokeWidth={1.5} className="relative z-10 mr-3 text-amber-300 group-hover:text-amber-100 transition-all duration-300 group-hover:drop-shadow-lg" />
                            <span className="relative z-10 font-light tracking-wide text-sm group-hover:drop-shadow-lg"
                            onMouseEnter={(e) => {
                              e.currentTarget.style.textShadow = '0 0 12px rgba(251, 191, 36, 0.8)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.textShadow = 'none';
                            }}
                            >Sign Out</span>
                            
                            {/* Sleek expanding underline */}
                            <div className="absolute bottom-0 left-0 w-0 h-px bg-gradient-to-r from-transparent via-violet-400 to-transparent group-hover:w-full transition-all duration-700 ease-out shadow-sm shadow-violet-400/40" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <Link
                    to="/auth"
                    className="group relative flex items-center mx-4 px-6 py-3 text-center font-light text-amber-200 hover:text-amber-50 transition-all duration-300 tracking-wide"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-800/40 via-slate-700/20 to-slate-800/40" />
                    
                    {/* Purple hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-700/0 via-violet-600/0 to-violet-700/0 group-hover:from-violet-700/30 group-hover:via-violet-600/20 group-hover:to-violet-700/30 transition-all duration-300" />
                    
                    <span className="relative z-10 tracking-widest uppercase text-sm">Sign In</span>
                    
                    {/* Sleek expanding underline */}
                    <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-transparent via-violet-400 to-transparent group-hover:w-full transition-all duration-700 ease-out shadow-sm shadow-violet-400/50" />
                  </Link>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={toggleMenu}
                className="group relative flex items-center h-16 p-2 transition-all duration-300"
              >
                {/* Mobile menu button background image */}
                <div 
                  className="absolute inset-0 bg-center bg-cover bg-no-repeat"
                  style={{
                    backgroundImage: 'url(/images/bg-button.png)',
                    backgroundSize: 'cover'
                  }}
                />
                
                {/* Purple hover overlay with advanced fading */}
                <div 
                  className="absolute inset-0 transition-all duration-300"
                  style={{
                    background: 'radial-gradient(ellipse at center top, rgba(139, 92, 246, 0) 0%, rgba(124, 58, 237, 0) 40%, transparent 70%)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'radial-gradient(ellipse at center top, rgba(139, 92, 246, 0.2) 0%, rgba(124, 58, 237, 0.1) 40%, transparent 70%)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'radial-gradient(ellipse at center top, rgba(139, 92, 246, 0) 0%, rgba(124, 58, 237, 0) 40%, transparent 70%)';
                  }}
                />
                
                <div className="relative z-10">
                  <Menu 
                    size={16} 
                    strokeWidth={1.5}
                    className={`text-amber-200 group-hover:text-amber-50 transition-all duration-300 group-hover:drop-shadow-lg ${isMenuOpen ? 'opacity-0 rotate-90' : 'opacity-100 rotate-0'}`} 
                  />
                  <X 
                    size={16} 
                    strokeWidth={1.5}
                    className={`absolute inset-0 text-amber-200 group-hover:text-amber-50 transition-all duration-300 group-hover:drop-shadow-lg ${isMenuOpen ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'}`} 
                  />
                </div>
                
                {/* Sleek expanding underline */}
                <div className="absolute bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-transparent via-violet-400 to-transparent group-hover:w-full transition-all duration-700 ease-out shadow-md shadow-violet-400/50" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden transition-all duration-500 ${isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
        <div className="bg-gradient-to-b from-slate-950 to-slate-900 border-t border-slate-600/20">
          <div className="py-4">
            {user ? (
              <>
                <MobileNavButton
                  to="/dashboard"
                  icon={<LayoutDashboard size={15} strokeWidth={1.5} />}
                  isActive={location.pathname === '/dashboard'}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </MobileNavButton>
                <MobileNavButton
                  to="/deep-desert"
                  icon={<Pyramid size={15} strokeWidth={1.5} />}
                  isActive={location.pathname.startsWith('/deep-desert')}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Deep Desert
                </MobileNavButton>
                <MobileNavButton
                  to="/hagga-basin"
                  icon={<Mountain size={15} strokeWidth={1.5} />}
                  isActive={location.pathname === '/hagga-basin'}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Hagga Basin
                </MobileNavButton>
                <MobileNavButton
                  to="/pois"
                  icon={<MapPin size={15} strokeWidth={1.5} />}
                  isActive={location.pathname === '/pois'}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Points of Interest
                </MobileNavButton>
                {user.role === 'admin' && (
                  <MobileNavButton
                    to="/admin"
                    icon={<Shield size={15} strokeWidth={1.5} />}
                    isActive={location.pathname === '/admin'}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Admin Panel
                  </MobileNavButton>
                )}
                
                {/* Mobile Profile */}
                <div className="mt-6 pt-4 border-t border-slate-600/20">
                  <div className="mx-4 p-3 bg-gradient-to-r from-amber-600/8 via-amber-500/4 to-amber-600/8 border border-slate-600/30">
                    <p className="font-light text-amber-100 tracking-wide text-sm">{user.username}</p>
                    <div className="flex items-center mt-1">
                      <span className="text-xs text-amber-200 mr-2 font-light">Role:</span>
                      <span className="px-2 py-1 text-xs font-light text-slate-900 bg-gradient-to-r from-amber-200 to-amber-300 tracking-wide">
                        {user.role}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      signOut();
                      setIsMenuOpen(false);
                    }}
                    className="group relative flex items-center w-full text-left px-4 py-3 mt-2 mx-4 text-amber-200 hover:text-amber-50 transition-all duration-300"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-800/0 to-violet-700/0 group-hover:from-violet-800/20 group-hover:to-violet-700/20 transition-all duration-300" />
                    
                    <LogOut size={15} strokeWidth={1.5} className="relative z-10 mr-3 text-amber-300 group-hover:text-amber-100" />
                    <span className="relative z-10 font-light tracking-wide text-sm">Sign Out</span>
                    
                    {/* Sleek expanding underline */}
                    <div className="absolute bottom-0 left-0 w-0 h-px bg-gradient-to-r from-transparent via-violet-400 to-transparent group-hover:w-full transition-all duration-700 ease-out shadow-sm shadow-violet-400/40" />
                  </button>
                </div>
              </>
            ) : (
              <Link
                to="/auth"
                className="group relative flex items-center mx-4 px-6 py-3 text-center font-light text-amber-200 hover:text-amber-50 transition-all duration-300 tracking-wide"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-slate-800/40 via-slate-700/20 to-slate-800/40" />
                
                {/* Purple hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-violet-700/0 via-violet-600/0 to-violet-700/0 group-hover:from-violet-700/30 group-hover:via-violet-600/20 group-hover:to-violet-700/30 transition-all duration-300" />
                
                <span className="relative z-10 tracking-widest uppercase text-sm">Sign In</span>
                
                {/* Sleek expanding underline */}
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-transparent via-violet-400 to-transparent group-hover:w-full transition-all duration-700 ease-out shadow-sm shadow-violet-400/50" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;