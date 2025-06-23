import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, Pencil, Trash2, RefreshCw, Shield, AlertCircle, ArrowUpDown, ArrowUp, ArrowDown, Layers3 } from 'lucide-react';
import { Profile, UserRole } from '../../types/admin';
import { Rank, EnhancedProfile, Guild } from '../../types/profile';
import UserAvatar from '../common/UserAvatar';
import RankBadge from '../common/RankBadge';

interface UserManagementProps {
  profiles: Profile[];
  guilds: Guild[];
  isLoading: boolean;
  error: string | null;
  onRefreshProfiles: () => void;
  onError: (error: string) => void;
  onSuccess: (message: string) => void;
  assignUserToGuild: (userId: string, guildId: string | null, guildRole?: 'leader' | 'officer' | 'member') => Promise<void>;
}

type SortField = 'name' | 'email' | 'guild' | 'joinDate' | 'role' | 'rank';
type SortDirection = 'asc' | 'desc';

// UserProfileCard Component
interface UserProfileCardProps {
  profile: EnhancedProfile;
  ranks: Rank[];
  guilds: Guild[];
  isDeletingUser: string | null;
  onRoleChange: (profileId: string, newRole: UserRole) => void;
  onRankAssignment: (userId: string, rankId: string | null) => void;
  onGuildAssignment: (userId: string, guildId: string | null, guildRole?: 'leader' | 'officer' | 'member') => void;
  onDeleteUser: (userId: string, username: string) => void;
  formatDate: (dateString: string | null | undefined) => string;
  GuildTag: React.FC<{ guild: Guild | null }>;
}

const UserProfileCard: React.FC<UserProfileCardProps> = ({
  profile,
  ranks,
  guilds,
  isDeletingUser,
  onRoleChange,
  onRankAssignment,
  onGuildAssignment,
  onDeleteUser,
  formatDate,
  GuildTag
}) => {
  return (
    <div className="group relative">
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
                    Joined {formatDate(profile.actual_join_date || profile.updated_at)}
                  </span>
                </div>
                
                {/* Role and Rank badges inline */}
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium tracking-wide border ${
                    profile.role === 'admin' 
                      ? 'border-red-400/30 bg-red-400/10 text-red-300' 
                      : profile.role === 'editor'
                      ? 'border-yellow-400/30 bg-yellow-400/10 text-yellow-300'
                      : profile.role === 'pending'
                      ? 'border-orange-400/30 bg-orange-400/10 text-orange-300'
                      : 'border-blue-400/30 bg-blue-400/10 text-blue-300'
                  }`}
                        style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                    <Shield size={12} className="mr-1" />
                    {profile.role.toUpperCase()}
                  </span>
                  
                  {profile.rank && (
                    <RankBadge rank={profile.rank} size="xxs" />
                  )}

                  {profile.guilds && (
                    <GuildTag guild={profile.guilds} />
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
                  onChange={(e) => onRoleChange(profile.id, e.target.value as UserRole)}
                  className="px-3 py-2 bg-void-950/60 border border-gold-300/30 rounded text-amber-200 
                           focus:outline-none focus:ring-2 focus:ring-gold-300/50 focus:border-gold-300/60
                           transition-all duration-300 text-sm min-w-[100px]"
                  style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                >
                  <option value="pending" className="bg-void-950 text-orange-200">Pending</option>
                  <option value="member" className="bg-void-950 text-amber-200">Member</option>
                  <option value="editor" className="bg-void-950 text-amber-200">Editor</option>
                  <option value="admin" className="bg-void-950 text-amber-200">Admin</option>
                </select>
              </div>

              {/* Rank Dropdown */}
              <div className="flex flex-col space-y-1">
                <label className="text-xs text-gold-300/70 font-light">Rank</label>
                <select
                  value={profile.rank?.id || ''}
                  onChange={(e) => onRankAssignment(profile.id, e.target.value || null)}
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

              {/* Guild Dropdown */}
              <div className="flex flex-col space-y-1">
                <label className="text-xs text-gold-300/70 font-light">Guild</label>
                <select
                  value={profile.guild_id || ''}
                  onChange={(e) => onGuildAssignment(profile.id, e.target.value || null)}
                  className="px-3 py-2 bg-void-950/60 border border-gold-300/30 rounded text-amber-200 
                           focus:outline-none focus:ring-2 focus:ring-gold-300/50 focus:border-gold-300/60
                           transition-all duration-300 text-sm min-w-[140px]"
                  style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                >
                  {guilds.map(guild => (
                    <option key={guild.id} value={guild.id} className="bg-void-950 text-amber-200">
                      {guild.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Delete Button */}
              <div className="flex flex-col justify-end">
                <button
                  onClick={() => onDeleteUser(profile.id, profile.username)}
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
  );
};

const UserManagement: React.FC<UserManagementProps> = ({
  profiles,
  guilds,
  isLoading,
  error,
  onRefreshProfiles,
  onError,
  onSuccess,
  assignUserToGuild
}) => {
  // State
  const [enhancedProfiles, setEnhancedProfiles] = useState<EnhancedProfile[]>([]);
  const [ranks, setRanks] = useState<Rank[]>([]);
  const [isLoadingRanks, setIsLoadingRanks] = useState(true);
  const [isDeletingUser, setIsDeletingUser] = useState<string | null>(null);
  
  // Sorting and Grouping State
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [groupByGuild, setGroupByGuild] = useState(false);

  // Sorting and Grouping Logic
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown size={14} className="opacity-50" />;
    return sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
  };

  const sortedAndGroupedProfiles = useMemo(() => {
    let sorted = [...enhancedProfiles];

    // Sort profiles
    sorted.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'name':
          aValue = a.username?.toLowerCase() || '';
          bValue = b.username?.toLowerCase() || '';
          break;
        case 'email':
          aValue = a.email?.toLowerCase() || '';
          bValue = b.email?.toLowerCase() || '';
          break;
        case 'guild':
          aValue = a.guilds?.name?.toLowerCase() || 'zzz_unassigned';
          bValue = b.guilds?.name?.toLowerCase() || 'zzz_unassigned';
          break;
        case 'joinDate':
          aValue = new Date(a.actual_join_date || a.updated_at || '');
          bValue = new Date(b.actual_join_date || b.updated_at || '');
          break;
        case 'role':
          const roleOrder = { admin: 0, editor: 1, member: 2, pending: 3 };
          aValue = roleOrder[a.role as keyof typeof roleOrder] ?? 4;
          bValue = roleOrder[b.role as keyof typeof roleOrder] ?? 4;
          break;
        case 'rank':
          aValue = a.rank?.display_order ?? 999;
          bValue = b.rank?.display_order ?? 999;
          break;
        default:
          aValue = '';
          bValue = '';
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    // Group by guild if enabled
    if (groupByGuild) {
      const grouped: { [key: string]: EnhancedProfile[] } = {};
      
      sorted.forEach(profile => {
        const guildName = profile.guilds?.name || 'Unassigned';
        if (!grouped[guildName]) {
          grouped[guildName] = [];
        }
        grouped[guildName].push(profile);
      });

      return grouped;
    }

    return sorted;
  }, [enhancedProfiles, sortField, sortDirection, groupByGuild]);

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
        
        // Notify all connected clients that user permissions have changed
        // This will cause affected users to refresh their auth state
        window.dispatchEvent(new CustomEvent('user-role-updated', { 
          detail: { userId: profileId, newRole } 
        }));
        
        onSuccess(`User role updated to ${newRole}. New permissions will take effect immediately for active users.`);
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
  
      const { data, error } = await supabase.functions.invoke('delete-user', {
        body: { userIdToDelete: userId }
      });

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

  // Handle guild assignment
  const handleGuildAssignment = async (userId: string, guildId: string | null, guildRole: 'leader' | 'officer' | 'member' = 'member') => {
    try {
      await assignUserToGuild(userId, guildId, guildRole);
      onSuccess?.(`Guild ${guildId ? 'assigned' : 'removed'} successfully`);
    } catch (error: any) {
      console.error('Error updating guild:', error);
      onError?.(`Failed to update guild: ${error.message}`);
    }
  };

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) {
      return 'Unknown';
    }

    try {
      const date = new Date(dateString);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Unknown';
      }

      // Format as a simple date without time for user join dates
      const formattedDate = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC'
      }).format(date);
  
      return formattedDate;
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
      case 'pending':
        return 'bg-orange-900/50 text-orange-200 border border-orange-600/40';
      default:
        return 'bg-green-900/50 text-green-200 border border-green-600/40';
    }
  };

  // Get guild display component
  const GuildTag: React.FC<{ guild: Guild | null }> = ({ guild }) => {
    if (!guild) return null;
    
    return (
      <span 
        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
        style={{ 
          backgroundColor: guild.tag_color, 
          color: guild.tag_text_color,
          border: `1px solid ${guild.tag_color}40`
        }}
      >
        <Shield size={10} className="mr-1" />
        {guild.name}
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

      {/* Sorting and Grouping Controls */}
      <div className="mb-6 p-4 rounded-lg border border-gold-300/20 bg-void-950/40">
        <div className="flex items-center justify-between">
          {/* Sort Controls */}
          <div className="flex items-center space-x-4">
            <span className="text-gold-300 font-medium text-sm"
                  style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
              Sort by:
            </span>
            <div className="flex items-center space-x-2">
              {[
                { field: 'name' as SortField, label: 'Name' },
                { field: 'email' as SortField, label: 'Email' },
                { field: 'guild' as SortField, label: 'Guild' },
                { field: 'joinDate' as SortField, label: 'Join Date' },
                { field: 'role' as SortField, label: 'Role' },
                { field: 'rank' as SortField, label: 'Rank' }
              ].map(({ field, label }) => (
                <button
                  key={field}
                  onClick={() => handleSort(field)}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-xs font-medium transition-all duration-300 ${
                    sortField === field
                      ? 'bg-gold-300/20 text-gold-200 border border-gold-300/40'
                      : 'bg-void-950/60 text-amber-200/70 border border-gold-300/20 hover:bg-gold-300/10 hover:text-gold-200'
                  }`}
                  style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                >
                  <span>{label}</span>
                  {getSortIcon(field)}
                </button>
              ))}
            </div>
          </div>

          {/* Group by Guild Toggle */}
          <div className="flex items-center space-x-3">
            <span className="text-gold-300 font-medium text-sm"
                  style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
              Group by Guild:
            </span>
            <button
              onClick={() => setGroupByGuild(!groupByGuild)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                groupByGuild
                  ? 'bg-purple-500/20 text-purple-200 border border-purple-400/40'
                  : 'bg-void-950/60 text-amber-200/70 border border-gold-300/20 hover:bg-purple-500/10 hover:text-purple-200'
              }`}
              style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
            >
              <Layers3 size={16} />
              <span>{groupByGuild ? 'Grouped' : 'List View'}</span>
            </button>
          </div>
        </div>
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
          {groupByGuild ? (
            // Grouped by Guild Display
            Object.entries(sortedAndGroupedProfiles as { [key: string]: EnhancedProfile[] }).map(([guildName, guildProfiles]) => {
              const guild = guilds.find(g => g.name === guildName);
              return (
                <div key={guildName} className="space-y-3">
                  {/* Guild Header */}
                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-purple-300/30 bg-purple-500/10">
                    <div className="flex items-center space-x-2">
                      <Shield size={16} className="text-purple-300" />
                      <h4 className="text-lg font-medium text-purple-200 tracking-wide"
                          style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                        {guildName}
                      </h4>
                      <span className="text-purple-300/70 text-sm">
                        ({guildProfiles.length} member{guildProfiles.length !== 1 ? 's' : ''})
                      </span>
                    </div>
                    {guild && guild.name !== 'Unassigned' && (
                      <div 
                        className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{ 
                          backgroundColor: guild.tag_color, 
                          color: guild.tag_text_color,
                          border: `1px solid ${guild.tag_color}40`
                        }}
                      >
                        {guild.name}
                      </div>
                    )}
                  </div>

                  {/* Guild Members */}
                  <div className="ml-4 space-y-3">
                    {guildProfiles.map((profile) => (
                      <UserProfileCard
                        key={profile.id}
                        profile={profile}
                        ranks={ranks}
                        guilds={guilds}
                        isDeletingUser={isDeletingUser}
                        onRoleChange={handleRoleChange}
                        onRankAssignment={handleRankAssignment}
                        onGuildAssignment={handleGuildAssignment}
                        onDeleteUser={handleDeleteUser}
                        formatDate={formatDate}
                        GuildTag={GuildTag}
                      />
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            // Regular List Display
            (sortedAndGroupedProfiles as EnhancedProfile[]).map((profile) => (
              <UserProfileCard
                key={profile.id}
                profile={profile}
                ranks={ranks}
                guilds={guilds}
                isDeletingUser={isDeletingUser}
                onRoleChange={handleRoleChange}
                onRankAssignment={handleRankAssignment}
                onGuildAssignment={handleGuildAssignment}
                onDeleteUser={handleDeleteUser}
                formatDate={formatDate}
                GuildTag={GuildTag}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default UserManagement;