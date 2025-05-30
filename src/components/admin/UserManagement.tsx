import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, Pencil, Trash2, RefreshCw, Shield, AlertCircle, Award } from 'lucide-react';
import { Profile, UserRole } from '../../types/admin';
import { Rank } from '../../types/profile';
import UserAvatar from '../common/UserAvatar';

interface UserManagementProps {
  profiles: Profile[];
  isLoading: boolean;
  error: string | null;
  onRefreshProfiles: () => void;
  onError: (error: string) => void;
  onSuccess: (message: string) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({
  profiles,
  isLoading,
  error,
  onRefreshProfiles,
  onError,
  onSuccess
}) => {
  // State
  const [enhancedProfiles, setEnhancedProfiles] = useState<EnhancedProfile[]>([]);
  const [ranks, setRanks] = useState<Rank[]>([]);
  const [isLoadingRanks, setIsLoadingRanks] = useState(true);
  const [isDeletingUser, setIsDeletingUser] = useState<string | null>(null);

  // Fetch ranks on component mount
  useEffect(() => {
    const fetchRanks = async () => {
      try {
        setIsLoadingRanks(true);
        const { data, error } = await supabase
          .from('ranks')
          .select('*')
          .order('display_order', { ascending: true });

        if (error) throw error;
        setRanks(data || []);
      } catch (error: any) {
        console.error('Error fetching ranks:', error);
        onError('Failed to load ranks: ' + error.message);
      } finally {
        setIsLoadingRanks(false);
      }
    };

    fetchRanks();
  }, [onError]);

  // Enhance profiles with rank information
  useEffect(() => {
    const enhanceProfilesWithRanks = async () => {
      if (!profiles.length || !ranks.length) {
        setEnhancedProfiles(profiles.map(p => ({ ...p, rank: null })));
        return;
      }

      try {
        // Fetch enhanced profiles with rank information
        const { data: enhancedData, error } = await supabase
          .from('profiles')
          .select(`
            *,
            rank:ranks(*)
          `)
          .in('id', profiles.map(p => p.id));

        if (error) throw error;

        // Merge the enhanced data with the existing profiles
        const enhanced = profiles.map(profile => {
          const enhancedProfile = enhancedData?.find(ep => ep.id === profile.id);
          return {
            ...profile,
            rank: enhancedProfile?.rank || null
          };
        });

        setEnhancedProfiles(enhanced);
      } catch (error: any) {
        console.error('Error enhancing profiles with ranks:', error);
        setEnhancedProfiles(profiles.map(p => ({ ...p, rank: null })));
      }
    };

    enhanceProfilesWithRanks();
  }, [profiles, ranks]);

  const handleRoleChange = async (profileId: string, newRole: UserRole) => {
    try {
      const { data, error } = await supabase.functions.invoke('update-user', {
        body: {
          userId: profileId,
          role: newRole
        }
      });

      if (error) throw error;

      if (data?.success) {
        onRefreshProfiles();
        onSuccess(`User role updated to ${newRole}`);
      } else {
        throw new Error(data?.error || 'Role update failed');
      }
    } catch (error: any) {
      console.error('Role change error:', error);
      onError('Failed to update user role: ' + (error.message || 'Unknown error'));
    }
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    if (!confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone. Their POIs and screenshots will be preserved but marked as "Deleted User".`)) {
      return;
    }

    setIsDeletingUser(userId);
    try {
      console.log('Attempting to delete user:', userId);
      const { data, error } = await supabase.functions.invoke('delete-user', {
        body: { userIdToDelete: userId }
      });

      console.log('Delete function response:', { data, error });

      if (error) {
        console.error('Supabase function invoke error:', error);
        throw error;
      }

      if (data?.success) {
        onRefreshProfiles();
        onSuccess(`User "${username}" has been deleted. Their contributions have been preserved.`);
      } else {
        console.error('Function returned non-success response:', data);
        throw new Error(data?.error || 'Delete failed');
      }
    } catch (error: any) {
      console.error('Delete user error:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        statusText: error.statusText,
        body: error.body
      });
      onError('Failed to delete user: ' + (error.message || 'Unknown error'));
    } finally {
      setIsDeletingUser(null);
    }
  };

  // Handle rank assignment
  const handleRankAssignment = async (userId: string, rankId: string | null) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ rank_id: rankId })
        .eq('id', userId);

      if (error) throw error;

      // Update local state
      setEnhancedProfiles(prev => prev.map(profile => 
        profile.id === userId 
          ? { ...profile, rank: rankId ? ranks.find(r => r.id === rankId) || null : null }
          : profile
      ));

      onSuccess?.(`Rank ${rankId ? 'assigned' : 'removed'} successfully`);
    } catch (error: any) {
      console.error('Error updating rank:', error);
      onError?.(`Failed to update rank: ${error.message}`);
    }
  };

  const formatDate = (dateString: string | null | undefined): string => {

    
    if (!dateString) {
      console.warn('Date string is null or undefined:', dateString);
      return 'Unknown';
    }

    try {
      const date = new Date(dateString);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date:', dateString);
        return 'Unknown';
      }

      // Check if this is a recent placeholder date (within last few seconds)
      const now = new Date();
      const timeDiff = Math.abs(now.getTime() - date.getTime());
      if (timeDiff < 10000) { // Within 10 seconds - likely a placeholder
        return 'Recently joined';
      }

      // European format with Berlin time
      const berlinTime = new Intl.DateTimeFormat('de-DE', {
        timeZone: 'Europe/Berlin',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
      
  
      return `${berlinTime} (Berlin Time)`;
    } catch (error) {
      console.error('Date formatting error:', error, 'for input:', dateString);
      return 'Unknown';
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-red-900/50 text-red-200 border border-red-600/40';
      case 'editor':
        return 'bg-amber-900/50 text-amber-200 border border-amber-600/40';
      default:
        return 'bg-green-900/50 text-green-200 border border-green-600/40';
    }
  };

  // Rank Badge Component
  const RankBadge: React.FC<{ rank?: Rank | null; className?: string }> = ({ rank, className = '' }) => {
    if (!rank) {
      return (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-900/50 text-gray-400 border border-gray-600/40 ${className}`}>
          No rank
        </span>
      );
    }

    return (
      <span 
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${className}`}
        style={{ 
          backgroundColor: rank.color, 
          color: rank.text_color,
          border: `1px solid ${rank.color}40`
        }}
      >
        <Award className="w-3 h-3 mr-1" />
        {rank.name}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block p-4 rounded-full border border-gold-300/50 mb-6"
               style={{ backgroundColor: 'rgba(42, 36, 56, 0.8)' }}>
            <Users className="text-gold-300" size={24} />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-300 mx-auto mb-4"></div>
          <p className="text-gold-300 font-light tracking-wide"
             style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
            Loading user data...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="inline-block p-4 rounded-full border border-red-400/50 mb-6"
             style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
          <AlertCircle className="text-red-400" size={24} />
        </div>
        <p className="text-red-300 font-light tracking-wide"
           style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
          Error loading users: {error}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header Section */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-light text-gold-300 flex items-center"
            style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
          <Users className="mr-4 text-amber-200" size={28} />
          User Management
          <span className="ml-4 text-lg text-amber-200/70">({enhancedProfiles.length} users)</span>
        </h3>
        <button
          onClick={onRefreshProfiles}
          disabled={isLoading}
          className="text-purple-300 hover:text-purple-200 transition-all duration-300 p-3 rounded-md 
                   border border-purple-300/30 hover:border-purple-200/40 hover:bg-purple-200/10 
                   flex items-center disabled:opacity-50"
        >
          <RefreshCw size={18} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          <span className="text-sm font-light tracking-wide"
                style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
            Refresh
          </span>
        </button>
      </div>

      {error && (
        <div className="relative p-4 rounded-lg border border-red-400/40 backdrop-blur-md"
             style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
          <div className="flex items-center gap-3">
            <AlertCircle size={20} className="text-red-400" />
            <span className="text-red-300 font-light tracking-wide"
                  style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
              {error}
            </span>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block p-4 rounded-full border border-gold-300/50 mb-6"
               style={{ backgroundColor: 'rgba(42, 36, 56, 0.8)' }}>
            <Users className="text-gold-300" size={24} />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-300 mx-auto mb-4"></div>
          <p className="text-gold-300 font-light tracking-wide"
             style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
            Loading user data...
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {enhancedProfiles.map((profile) => (
            <div key={profile.id} className="group relative">
              <div className="relative p-4 rounded-lg border border-gold-300/20 bg-void-950/40 hover:bg-gold-300/5 transition-all duration-300">
                {/* Purple hover overlay */}
                <div 
                  className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none"
                  style={{
                    background: 'radial-gradient(ellipse at center top, rgba(139, 92, 246, 0.15) 0%, rgba(124, 58, 237, 0.08) 40%, transparent 70%)'
                  }}
                />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    {/* Left side - User info in inline layout */}
                    <div className="flex items-center space-x-4 flex-1">
                      <UserAvatar profile={profile} size="md" />
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <h4 className="text-lg font-medium text-amber-200 tracking-wide"
                              style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                            {profile.username}
                          </h4>
                          <span className="text-amber-200/70 text-sm"
                                style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                            {profile.email}
                          </span>
                          <span className="text-amber-200/50 text-xs"
                                style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                            Joined {new Date(profile.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        
                        {/* Role and Rank badges inline */}
                        <div className="flex items-center space-x-3">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium tracking-wide border ${
                            profile.role === 'admin' 
                              ? 'border-red-400/30 bg-red-400/10 text-red-300' 
                              : profile.role === 'moderator'
                              ? 'border-yellow-400/30 bg-yellow-400/10 text-yellow-300'
                              : 'border-blue-400/30 bg-blue-400/10 text-blue-300'
                          }`}
                                style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                            <Shield size={12} className="mr-1" />
                            {profile.role.toUpperCase()}
                          </span>
                          
                          {profile.rank && (
                            <div className="flex items-center space-x-2 px-3 py-1 rounded-full border border-purple-300/30 bg-purple-300/10">
                              <Award size={12} className="text-purple-300" />
                              <span className="text-xs font-light text-purple-200 tracking-wide"
                                    style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                                {profile.rank.name}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right side - Controls */}
                    <div className="flex items-center space-x-3">
                      {/* Role Dropdown */}
                      <div className="flex flex-col space-y-1">
                        <label className="text-xs text-gold-300/70 font-light">Role</label>
                        <select
                          value={profile.role}
                          onChange={(e) => handleRoleChange(profile.id, e.target.value as UserRole)}
                          className="px-3 py-2 bg-void-950/60 border border-gold-300/30 rounded text-amber-200 
                                   focus:outline-none focus:ring-2 focus:ring-gold-300/50 focus:border-gold-300/60
                                   transition-all duration-300 text-sm min-w-[100px]"
                          style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                        >
                          <option value="member" className="bg-void-950 text-amber-200">Member</option>
                          <option value="moderator" className="bg-void-950 text-amber-200">Moderator</option>
                          <option value="admin" className="bg-void-950 text-amber-200">Admin</option>
                        </select>
                      </div>

                      {/* Rank Dropdown */}
                      <div className="flex flex-col space-y-1">
                        <label className="text-xs text-gold-300/70 font-light">Rank</label>
                        <select
                          value={profile.rank?.id || ''}
                          onChange={(e) => handleRankAssignment(profile.id, e.target.value || null)}
                          className="px-3 py-2 bg-void-950/60 border border-gold-300/30 rounded text-amber-200 
                                   focus:outline-none focus:ring-2 focus:ring-gold-300/50 focus:border-gold-300/60
                                   transition-all duration-300 text-sm min-w-[120px]"
                          style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                        >
                          <option value="" className="bg-void-950 text-amber-200">No rank</option>
                          {ranks.map(rank => (
                            <option key={rank.id} value={rank.id} className="bg-void-950 text-amber-200">
                              {rank.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Delete Button */}
                      <div className="flex flex-col justify-end">
                        <button
                          onClick={() => handleDeleteUser(profile.id, profile.username)}
                          disabled={isDeletingUser === profile.id}
                          className="p-2 text-red-400 hover:text-red-300 transition-colors duration-300 rounded
                                   disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete user"
                        >
                          {isDeletingUser === profile.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400"></div>
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {enhancedProfiles.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="inline-block p-4 rounded-full border border-amber-200/50 mb-4"
               style={{ backgroundColor: 'rgba(42, 36, 56, 0.8)' }}>
            <Users className="text-amber-200" size={24} />
          </div>
          <p className="text-amber-200/70 font-light tracking-wide"
             style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
            No users found in the system.
          </p>
        </div>
      )}
    </div>
  );
};

export default UserManagement; 