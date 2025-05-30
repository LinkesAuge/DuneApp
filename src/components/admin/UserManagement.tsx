import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, Pencil, Trash2, RefreshCw, Shield, AlertCircle } from 'lucide-react';
import { Profile, UserRole } from '../../types/admin';

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
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeletingUser, setIsDeletingUser] = useState<string | null>(null);
  const [editUserData, setEditUserData] = useState({
    username: '',
    email: '',
    role: 'member' as UserRole
  });

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
    if (!confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
      return;
    }

    setIsDeletingUser(userId);
    try {
      const { data, error } = await supabase.functions.invoke('delete-user', {
        body: { userId }
      });

      if (error) throw error;

      if (data?.success) {
        onRefreshProfiles();
        onSuccess(`User "${username}" has been deleted`);
      } else {
        throw new Error(data?.error || 'Delete failed');
      }
    } catch (error: any) {
      console.error('Delete user error:', error);
      onError('Failed to delete user: ' + (error.message || 'Unknown error'));
    } finally {
      setIsDeletingUser(null);
    }
  };

  const handleOpenEditModal = (profile: Profile) => {
    setEditingUser(profile);
    setEditUserData({
      username: profile.username,
      email: profile.email,
      role: profile.role
    });
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingUser(null);
    setEditUserData({
      username: '',
      email: '',
      role: 'member'
    });
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    try {
      const { data, error } = await supabase.functions.invoke('update-user', {
        body: {
          userId: editingUser.id,
          username: editUserData.username,
          email: editUserData.email,
          role: editUserData.role
        }
      });

      if (error) throw error;

      if (data?.success) {
        onRefreshProfiles();
        handleCloseEditModal();
        onSuccess('User updated successfully');
      } else {
        throw new Error(data?.error || 'Update failed');
      }
    } catch (error: any) {
      console.error('Update user error:', error);
      onError('Failed to update user: ' + (error.message || 'Unknown error'));
    }
  };

  const formatDate = (dateString: string | null | undefined): string => {
    console.log('formatDate called with:', dateString, typeof dateString); // Debug log
    
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
      
      console.log('Formatted date result:', berlinTime); // Debug log
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-light tracking-[0.15em] text-gold-300 flex items-center"
            style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
          <Users className="mr-4 text-amber-200" size={28} />
          U S E R  M A N A G E M E N T
          <span className="ml-4 text-lg text-amber-200/70">({profiles.length} users)</span>
        </h3>
        <button
          onClick={onRefreshProfiles}
          className="text-gold-300 hover:text-amber-200 transition-all duration-300 p-2 rounded-md border border-gold-300/30 hover:border-amber-200/40 hover:bg-amber-200/10"
          title="Refresh users"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Users Table */}
      <div className="relative rounded-lg border border-gold-300/30 backdrop-blur-md overflow-hidden"
           style={{ backgroundColor: 'rgba(42, 36, 56, 0.6)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: 'rgba(42, 36, 56, 0.8)' }}>
              <tr className="border-b border-gold-300/20">
                <th className="px-6 py-4 text-left text-sm font-light text-gold-300 uppercase tracking-[0.1em]"
                    style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                  User
                </th>
                <th className="px-6 py-4 text-left text-sm font-light text-gold-300 uppercase tracking-[0.1em]"
                    style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                  Role
                </th>
                <th className="px-6 py-4 text-left text-sm font-light text-gold-300 uppercase tracking-[0.1em]"
                    style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                  Joined
                </th>
                <th className="px-6 py-4 text-right text-sm font-light text-gold-300 uppercase tracking-[0.1em]"
                    style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold-300/10">
              {profiles.map((profile) => (
                <tr key={profile.id} className="hover:bg-gold-300/5 transition-colors duration-300">
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-light text-amber-200"
                           style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                        {profile.username}
                      </div>
                      <div className="text-sm text-amber-200/60 font-light">
                        {profile.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <select
                      value={profile.role}
                      onChange={(e) => handleRoleChange(profile.id, e.target.value as UserRole)}
                      className={`text-xs rounded-full px-3 py-1 font-medium ${getRoleBadgeColor(profile.role)} 
                                bg-transparent focus:ring-2 focus:ring-gold-300/50 focus:outline-none cursor-pointer
                                transition-all duration-300 hover:bg-opacity-80`}
                      style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                    >
                      <option value="member">Member</option>
                      <option value="editor">Editor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm text-amber-200/70 font-light"
                      style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                    {formatDate(profile.created_at)}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-3">
                      <button
                        onClick={() => handleOpenEditModal(profile)}
                        className="text-amber-200 hover:text-gold-300 transition-all duration-300 p-2 rounded-md border border-amber-200/30 hover:border-gold-300/40 hover:bg-gold-300/10"
                        title="Edit user"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(profile.id, profile.username)}
                        disabled={isDeletingUser === profile.id}
                        className="text-red-400 hover:text-red-300 transition-all duration-300 p-2 rounded-md border border-red-400/30 hover:border-red-300/40 hover:bg-red-300/10 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete user"
                      >
                        {isDeletingUser === profile.id ? (
                          <RefreshCw size={16} className="animate-spin" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {profiles.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-block p-4 rounded-full border border-amber-200/50 mb-4"
                 style={{ backgroundColor: 'rgba(42, 36, 56, 0.8)' }}>
              <Users className="text-amber-200" size={24} />
            </div>
            <p className="text-amber-200/70 font-light tracking-wide"
               style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
              No users found
            </p>
          </div>
        )}
      </div>

      {/* Enhanced Edit User Modal */}
      {isEditModalOpen && editingUser && (
        <div className="fixed inset-0 bg-void-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="relative max-w-md w-full p-8 rounded-lg border border-gold-300/30 backdrop-blur-md"
               style={{ backgroundColor: 'rgba(42, 36, 56, 0.95)' }}>
            <h3 className="text-xl font-light text-gold-300 mb-6 flex items-center tracking-[0.1em]"
                style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
              <Pencil className="mr-3 text-amber-200" size={20} />
              E D I T  U S E R
            </h3>
            <p className="text-amber-200/70 text-sm mb-6 font-light"
               style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
              Editing: {editingUser.username}
            </p>

            <div className="space-y-6">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gold-300 mb-2 tracking-wide"
                       style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                  Username
                </label>
                <input
                  type="text"
                  value={editUserData.username}
                  onChange={(e) => setEditUserData(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full px-4 py-3 bg-void-950/60 border border-gold-300/30 rounded-md 
                           text-amber-200 placeholder-amber-200/40 backdrop-blur-sm
                           focus:outline-none focus:ring-2 focus:ring-gold-300/50 focus:border-gold-300/60
                           transition-all duration-300"
                  style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gold-300 mb-2 tracking-wide"
                       style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                  Email
                </label>
                <input
                  type="email"
                  value={editUserData.email}
                  onChange={(e) => setEditUserData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 bg-void-950/60 border border-gold-300/30 rounded-md 
                           text-amber-200 placeholder-amber-200/40 backdrop-blur-sm
                           focus:outline-none focus:ring-2 focus:ring-gold-300/50 focus:border-gold-300/60
                           transition-all duration-300"
                  style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gold-300 mb-2 tracking-wide"
                       style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                  Role
                </label>
                <select
                  value={editUserData.role}
                  onChange={(e) => setEditUserData(prev => ({ ...prev, role: e.target.value as UserRole }))}
                  className="w-full px-4 py-3 bg-void-950/60 border border-gold-300/30 rounded-md 
                           text-amber-200 backdrop-blur-sm
                           focus:outline-none focus:ring-2 focus:ring-gold-300/50 focus:border-gold-300/60
                           transition-all duration-300"
                  style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                >
                  <option value="member">Member</option>
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t border-gold-300/20">
              <button
                onClick={handleCloseEditModal}
                className="px-6 py-3 text-amber-200/70 hover:text-amber-200 transition-all duration-300 
                         border border-amber-200/30 hover:border-amber-200/50 rounded-md font-light tracking-wide
                         hover:bg-amber-200/5"
                style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateUser}
                className="px-6 py-3 bg-gold-300/90 hover:bg-gold-300 text-void-950 font-medium rounded-md 
                         transition-all duration-300 flex items-center tracking-wide"
                style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement; 