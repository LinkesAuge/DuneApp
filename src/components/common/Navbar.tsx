import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { getDisplayName } from '../../lib/utils';
import UserAvatar from './UserAvatar';
import { Menu, X, User, LogOut, Shield, LayoutDashboard, Mountain, MapPin, Pyramid, Database, ChevronDown, Link as LinkIcon, Network } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDatabaseDropdownOpen, setIsDatabaseDropdownOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleProfile = () => setIsProfileOpen(!isProfileOpen);
  const toggleDatabaseDropdown = () => setIsDatabaseDropdownOpen(!isDatabaseDropdownOpen);

  // Check if any database route is active
  const isDatabaseActive = location.pathname === '/database';

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
      className="group relative flex items-center h-16 px-3 min-w-[130px] justify-center transition-all duration-300"
    >
      {/* Button background image - Consistent with ui_aesthetics.md */}
      <div 
        className="absolute inset-0 bg-center bg-cover bg-no-repeat"
        style={{
          backgroundImage: 'url(/images/bg-button.webp)',
          backgroundSize: 'cover'
        }}
      />
      
      {/* Advanced purple overlay - Aligned with Landsraad Purple System from ui_aesthetics.md */}
      <div className={`
        absolute inset-0 transition-all duration-300
        ${isActive 
          ? 'bg-gradient-to-b from-violet-600/50 via-violet-700/30 to-transparent' // Active state
          : 'bg-gradient-to-b from-violet-600/0 via-violet-700/0 to-transparent group-hover:from-violet-600/40 group-hover:via-violet-700/20' // Hover state
        }
      `} />
      
      {/* Radial fade overlay for sides - Aligned with Landsraad Purple System */}
      <div className={`
        absolute inset-0 transition-all duration-300
        ${isActive 
          ? 'bg-gradient-radial from-violet-500/20 via-violet-600/10 to-transparent' // Active state
          : 'bg-gradient-radial from-transparent via-transparent to-transparent group-hover:from-violet-500/15 group-hover:via-violet-600/8' // Hover state
        }
      `} 
      style={{
        background: isActive 
          ? 'radial-gradient(ellipse at center top, rgba(139, 92, 246, 0.2) 0%, rgba(124, 58, 237, 0.1) 40%, transparent 70%)' // More explicit purple for active
          : undefined
      }}
      />
      
      {/* Content - Font and color alignment check */}
      <div className="relative z-10 flex items-center space-x-2">
        <span className={`
          transition-all duration-300
          ${isActive ? 'text-amber-200 drop-shadow-lg' : 'text-amber-300 group-hover:text-amber-100 group-hover:drop-shadow-lg'}
        `}
        style={{
          textShadow: isActive ? '0 0 8px rgba(251, 191, 36, 0.6)' : undefined, // amber-200 is yellow-300 family
          fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" // Ensuring font
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
          textShadow: isActive ? '0 0 8px rgba(251, 191, 36, 0.6)' : undefined, // amber-100, amber-200 are yellow-300 family
          fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" // Ensuring font and style as per guide (Nav Labels)
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
      
      {/* Sleek expanding underline - Color check against Dune Gold/Bronze and Landsraad Purple */}
      <div className={`
        absolute bottom-1 left-0 transition-all duration-700 ease-out h-0.5 bg-gradient-to-r from-transparent to-transparent
        ${isActive 
          ? 'w-full via-yellow-300 shadow-md shadow-yellow-300/60' // Active: yellow-300 (Dune Gold)
          : 'w-0 via-violet-400 group-hover:w-full group-hover:shadow-md group-hover:shadow-violet-400/50' // Hover: violet-400 (Landsraad Purple)
        }
      `} />
    </Link>
  );

  // Database dropdown button component
  const DatabaseDropdownButton: React.FC = () => (
    <div className="relative">
      <button
        onClick={toggleDatabaseDropdown}
        className="group relative flex items-center h-16 px-3 min-w-[130px] justify-center transition-all duration-300"
      >
        {/* Button background image */}
        <div 
          className="absolute inset-0 bg-center bg-cover bg-no-repeat"
          style={{
            backgroundImage: 'url(/images/bg-button.webp)',
            backgroundSize: 'cover'
          }}
        />
        
        {/* Advanced purple overlay */}
        <div className={`
          absolute inset-0 transition-all duration-300
          ${isDatabaseActive 
            ? 'bg-gradient-to-b from-violet-600/50 via-violet-700/30 to-transparent' // Active state
            : 'bg-gradient-to-b from-violet-600/0 via-violet-700/0 to-transparent group-hover:from-violet-600/40 group-hover:via-violet-700/20' // Hover state
          }
        `} />
        
        {/* Content */}
        <div className="relative z-10 flex items-center space-x-2">
          <span className={`
            transition-all duration-300
            ${isDatabaseActive ? 'text-amber-200 drop-shadow-lg' : 'text-amber-300 group-hover:text-amber-100 group-hover:drop-shadow-lg'}
          `}
          style={{
            textShadow: isDatabaseActive ? '0 0 8px rgba(251, 191, 36, 0.6)' : undefined,
            fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif"
          }}
          >
            <Database size={14} strokeWidth={1.5} />
          </span>
          <span className={`
            font-light text-xs uppercase tracking-widest transition-all duration-300 whitespace-nowrap
            ${isDatabaseActive ? 'text-amber-100 drop-shadow-lg' : 'text-amber-200 group-hover:text-amber-50 group-hover:drop-shadow-lg'}
          `}
          style={{
            textShadow: isDatabaseActive ? '0 0 8px rgba(251, 191, 36, 0.6)' : undefined,
            fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif"
          }}
          >
            Database
          </span>
          <ChevronDown 
            size={12} 
            strokeWidth={1.5} 
            className={`
              transition-all duration-300
              ${isDatabaseActive ? 'text-amber-200 drop-shadow-lg' : 'text-amber-300 group-hover:text-amber-100 group-hover:drop-shadow-lg'}
              ${isDatabaseDropdownOpen ? 'rotate-180' : 'rotate-0'}
            `}
          />
        </div>
        
        {/* Sleek expanding underline */}
        <div className={`
          absolute bottom-1 left-0 transition-all duration-700 ease-out h-0.5 bg-gradient-to-r from-transparent to-transparent
          ${isDatabaseActive 
            ? 'w-full via-yellow-300 shadow-md shadow-yellow-300/60'
            : 'w-0 via-violet-400 group-hover:w-full group-hover:shadow-md group-hover:shadow-violet-400/50'
          }
        `} />
      </button>

      {/* Dropdown menu */}
      {isDatabaseDropdownOpen && (
        <>
          {/* Backdrop to close dropdown */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsDatabaseDropdownOpen(false)}
          />
          
          {/* Dropdown content */}
          <div className="absolute top-full left-0 mt-1 w-56 bg-gradient-to-b from-slate-950 to-slate-900 border border-slate-600/30 shadow-2xl z-50 backdrop-blur-sm">
            <Link
              to="/database"
              onClick={() => setIsDatabaseDropdownOpen(false)}
              className="group relative flex items-center px-4 py-3 hover:bg-violet-600/20 transition-all duration-200"
            >
              <Database size={14} strokeWidth={1.5} className="mr-3 text-amber-300 group-hover:text-amber-100" />
              <span className="text-amber-200 group-hover:text-amber-50 font-light text-sm">Database Management</span>
            </Link>
            <Link
              to="/poi-linking"
              onClick={() => setIsDatabaseDropdownOpen(false)}
              className="group relative flex items-center px-4 py-3 hover:bg-violet-600/20 transition-all duration-200"
            >
              <LinkIcon size={14} strokeWidth={1.5} className="mr-3 text-amber-300 group-hover:text-amber-100" />
              <span className="text-amber-200 group-hover:text-amber-50 font-light text-sm">POI Entity Linking</span>
            </Link>
            <Link
              to="/poi-link-manager"
              onClick={() => setIsDatabaseDropdownOpen(false)}
              className="group relative flex items-center px-4 py-3 hover:bg-violet-600/20 transition-all duration-200"
            >
              <Network size={14} strokeWidth={1.5} className="mr-3 text-amber-300 group-hover:text-amber-100" />
              <span className="text-amber-200 group-hover:text-amber-50 font-light text-sm">POI Link Manager</span>
            </Link>

          </div>
        </>
      )}
    </div>
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
          backgroundImage: 'url(/images/bg-button.webp)',
          backgroundSize: 'cover'
        }}
      />
      
      {/* Purple overlay with advanced fading - Aligned with Landsraad Purple System */}
      <div className={`
        absolute inset-0 transition-all duration-300
        ${isActive 
          ? 'bg-gradient-to-b from-violet-600/40 via-violet-700/20 to-transparent' // Active state
          : 'bg-gradient-to-b from-violet-600/0 via-violet-700/0 to-transparent group-hover:from-violet-600/30 group-hover:via-violet-700/15' // Hover state
        }
      `} />
      
      {/* Content - Font and color alignment check */}
      <div className="relative z-10 flex items-center space-x-3">
        <span className={`
          transition-all duration-300
          ${isActive ? 'text-amber-200 drop-shadow-lg' : 'text-amber-300 group-hover:text-amber-100 group-hover:drop-shadow-lg'}
        `}
        style={{
          textShadow: isActive ? '0 0 8px rgba(251, 191, 36, 0.6)' : undefined, // amber-200 is yellow-300 family
          fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" // Ensuring font
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
          textShadow: isActive ? '0 0 8px rgba(251, 191, 36, 0.6)' : undefined, // amber-100, amber-200 are yellow-300 family
          fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" // Ensuring font and style as per guide
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
      
      {/* Sleek expanding underline for mobile - Color check against Dune Gold/Bronze and Landsraad Purple */}
      <div className={`
        absolute bottom-0 left-0 transition-all duration-700 ease-out h-0.5 bg-gradient-to-r from-transparent to-transparent
        ${isActive 
          ? 'w-full via-yellow-300 shadow-sm shadow-yellow-300/60' // Active: yellow-300 (Dune Gold)
          : 'w-0 via-violet-400 group-hover:w-full group-hover:shadow-sm group-hover:shadow-violet-400/50' // Hover: violet-400 (Landsraad Purple)
        }
      `} />
    </Link>
  );

  return (
    <nav className="relative z-50 border-b border-slate-700/30">
      {/* Navbar background image - Ensure this aligns with the three-layer gradient system if possible, or is a deliberate choice */}
                  {/* Consider if navbar-color.webp is the "Base Layer" or "Depth Layer" from ui_aesthetics.md */}
      <div 
        className="absolute inset-0 bg-center bg-cover bg-no-repeat"
        style={{
                      // backgroundImage: 'url(/images/navbar-color.webp?v=' + Date.now() + ')', // Retaining for now, but verify its role
                      // Applying slate gradient as a base, potentially overlaid by navbar-color.webp if it acts as a texture/detail layer
          background: 'linear-gradient(to right, var(--slate-900), var(--slate-800), var(--slate-900))', // Base Layer from guide
        }}
      />
                {/* Secondary overlay, potentially the navbar-color.webp or a deeper slate gradient */}
      <div 
                  className="absolute inset-0 bg-center bg-cover bg-no-repeat opacity-80" // Adjusted opacity if navbar-color.webp is used as a detail layer
        style={{
          backgroundImage: 'url(/images/navbar-color.webp?v=' + Date.now() + ')', // Depth Layer or detail
          // background: 'linear-gradient(to bottom, var(--slate-950-90), var(--slate-900-80), var(--slate-800-60))', // Alternative Depth Layer
        }}
      />
      
      {/* Subtle texture overlay - This aligns with guide's interactive/detail layers */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(139, 92, 246, 0.1) 0%, transparent 50%), // Landsraad Purple hint
            radial-gradient(circle at 75% 75%, rgba(254, 240, 138, 0.05) 0%, transparent 50%) // Dune Gold/Bronze hint (using yellow-200 as proxy for amber/gold)
          `
        }}
      />
      
      {/* Main content */}
      <div className="relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center h-16">
            
            {/* Expanded Logo Section - Use Trebuchet MS as per guide */}
            <div className="flex-1 max-w-md mr-16">
              <Link to="/" className="group relative flex items-center h-16 px-6 transition-all duration-300" style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                {/* Logo button background image - Should align with NavButton styling */}
                <div 
                  className="absolute inset-0 bg-center bg-cover bg-no-repeat"
                  style={{
                    backgroundImage: 'url(/images/bg-button.webp)', // Consistent with NavButton
                    backgroundSize: 'cover'
                  }}
                />
                
                {/* Logo hover gradient - Using Gold/Bronze accent */}
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/0 via-yellow-400/0 to-yellow-500/0 group-hover:from-yellow-500/15 group-hover:via-yellow-400/10 group-hover:to-yellow-500/15 transition-all duration-300" />
                
                <div className="relative z-10 flex items-center justify-center">
                  {/* Apply typography for "DUNE" part of the logo if it's text, or ensure image matches */}
                  {/* Assuming dune-log.webp is the full visual logo */}
                  <img 
                    src={`/images/dune-log.webp?v=${Date.now()}`}
                    alt="DUNE AWAKENING TRACKER" 
                    className="h-14 w-auto object-contain transition-all duration-300 group-hover:scale-105 drop-shadow-sm"
                    style={{ 
                      filter: 'brightness(1.1) contrast(1.05)',
                      maxWidth: '280px'
                    }}
                  />
                  {/* If "DUNE AWAKENING TRACKER" text is separate and needs styling: */}
                  {/* <span className="font-light text-2xl text-amber-200 tracking-[0.4em]" style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>DUNE</span> */}
                  {/* <span className="font-thin text-sm text-amber-300 tracking-[0.1em] ml-2" style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>AWAKENING TRACKER</span> */}
                </div>
                
                {/* Sleek expanding underline for logo - similar to NavButton */}
                <div className={`
                  absolute bottom-1 left-0 transition-all duration-700 ease-out h-0.5 bg-gradient-to-r from-transparent to-transparent
                  w-0 via-yellow-400 group-hover:w-full group-hover:shadow-md group-hover:shadow-yellow-400/50
                `} />
              </Link>
            </div>

            {/* Desktop Navigation - centered with separation */}
            <div className="hidden md:flex flex-1 justify-center max-w-4xl">
              <div className="flex items-center space-x-0.5">
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
                    <DatabaseDropdownButton />
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
            <div className="hidden md:flex flex-1 justify-end max-w-sm ml-6">
              <div className="flex items-center">
                {user ? (
                  <div className="relative">
                    <button
                      onClick={toggleProfile}
                      className="group relative flex items-center mx-4 px-4 py-3 min-w-[120px] justify-center transition-all duration-300"
                    >
                      {/* Profile button background image */}
                      <div 
                        className="absolute inset-0 bg-center bg-cover bg-no-repeat"
                        style={{
                          backgroundImage: 'url(/images/bg-button.webp)',
                          backgroundSize: 'cover'
                        }}
                      />
                      
                      {/* Purple hover overlay */}
                      <div className="absolute inset-0 bg-gradient-to-b from-violet-600/0 via-violet-700/0 to-transparent group-hover:from-violet-600/30 group-hover:via-violet-700/15 transition-all duration-300" />
                      
                      {/* Avatar */}
                      <div className="relative z-10 mr-3">
                        <UserAvatar user={user} size="sm" />
                      </div>
                      
                      <span className="relative z-10 mr-2 text-amber-200 group-hover:text-amber-50 transition-all duration-300 font-light tracking-wide text-xs group-hover:drop-shadow-lg"
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
                        {getDisplayName(user)}
                      </span>
                      
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
                            <div className="flex items-center gap-3">
                              {/* Avatar */}
                              <div className="flex-shrink-0">
                                <UserAvatar user={user} size="sm" />
                              </div>
                              
                              {/* User Info */}
                              <div className="flex-grow">
                                <p className="font-light text-amber-100 tracking-wide text-sm">{getDisplayName(user)}</p>
                                <div className="flex items-center mt-1">
                                  <span className="text-xs text-amber-200 mr-2 font-light">Role:</span>
                                  <span className="px-2 py-1 text-xs font-light text-slate-900 bg-gradient-to-r from-amber-200 to-amber-300 tracking-wide">
                                    {user.role}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Profile Management */}
                          <Link
                            to="/profile"
                            onClick={() => setIsProfileOpen(false)}
                            className="group relative flex items-center w-full text-left px-4 py-3 text-amber-200 hover:text-amber-50 transition-all duration-300"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-violet-800/0 to-violet-700/0 group-hover:from-violet-800/20 group-hover:to-violet-700/20 transition-all duration-300" />
                            
                            <User size={14} strokeWidth={1.5} className="relative z-10 mr-3 text-amber-300 group-hover:text-amber-100 transition-all duration-300 group-hover:drop-shadow-lg" />
                            <span className="relative z-10 font-light tracking-wide text-sm group-hover:drop-shadow-lg"
                            onMouseEnter={(e) => {
                              e.currentTarget.style.textShadow = '0 0 12px rgba(251, 191, 36, 0.8)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.textShadow = 'none';
                            }}
                            >Profile Settings</span>
                            
                            {/* Sleek expanding underline */}
                            <div className="absolute bottom-0 left-0 w-0 h-px bg-gradient-to-r from-transparent via-violet-400 to-transparent group-hover:w-full transition-all duration-700 ease-out shadow-sm shadow-violet-400/40" />
                          </Link>

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
                    backgroundImage: 'url(/images/bg-button.webp)',
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
                <MobileNavButton
                  to="/profile"
                  icon={<User size={15} strokeWidth={1.5} />}
                  isActive={location.pathname === '/profile'}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile Settings
                </MobileNavButton>
                <MobileNavButton
                  to="/database"
                  icon={<Database size={15} strokeWidth={1.5} />}
                  isActive={location.pathname === '/database'}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Database Management
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
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        <UserAvatar user={user} size="sm" />
                      </div>
                      
                      {/* User Info */}
                      <div className="flex-grow">
                        <p className="font-light text-amber-100 tracking-wide text-sm">{getDisplayName(user)}</p>
                        <div className="flex items-center mt-1">
                          <span className="text-xs text-amber-200 mr-2 font-light">Role:</span>
                          <span className="px-2 py-1 text-xs font-light text-slate-900 bg-gradient-to-r from-amber-200 to-amber-300 tracking-wide">
                            {user.role}
                          </span>
                        </div>
                      </div>
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