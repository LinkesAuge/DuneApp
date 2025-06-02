import React, { useState, useEffect } from 'react';
import { X, UserPlus, Users, Search, Trash2, Check, AlertCircle, Share2, Eye, Lock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Poi, User, PoiShare, PrivacyLevel } from '../../types';
import { useAuth } from '../auth/AuthProvider';
import UserAvatar from '../common/UserAvatar';

// Using a simpler AppUser interface for this component
interface AppUser {
  id: string;
  username: string;
  email: string;
  display_name?: string | null;
  discord_username?: string | null;
  custom_avatar_url?: string | null;
  discord_avatar_url?: string | null;
  use_discord_avatar?: boolean;
}

interface SharePoiModalProps {
  isOpen: boolean;
  onClose: () => void;
  poi: Poi | null;
  onShareAdded?: (share: PoiShare) => void;
  onShareRemoved?: (shareUserId: string) => void;
  onPrivacyLevelChanged?: (poiId: string, newPrivacyLevel: PrivacyLevel) => void;
}

const SharePoiModal: React.FC<SharePoiModalProps> = ({
  isOpen,
  onClose,
  poi,
  onShareAdded,
  onShareRemoved,
  onPrivacyLevelChanged
}) => {
  const { user } = useAuth();
  
  // State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [allUsers, setAllUsers] = useState<AppUser[]>([]);
  const [existingShares, setExistingShares] = useState<PoiShare[]>([]);
  const [sharing, setSharing] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const [updatingPrivacy, setUpdatingPrivacy] = useState(false);

  // Load data when modal opens
  useEffect(() => {
    if (isOpen && poi) {
      loadData();
    }
  }, [isOpen, poi]);

  const loadData = async () => {
    if (!poi || !user) return;

    setLoading(true);
    setError(null);

    try {
      // Load all users except current user
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id, username, email, display_name, discord_username, custom_avatar_url, discord_avatar_url, use_discord_avatar')
        .neq('id', user.id)
        .order('username');

      if (usersError) throw usersError;

      // Load existing shares for this POI
      const { data: sharesData, error: sharesError } = await supabase
        .from('poi_shares')
        .select('*')
        .eq('poi_id', poi.id);

      if (sharesError) throw sharesError;

      setAllUsers(usersData || []);
      setExistingShares(sharesData || []);
    } catch (err) {
      console.error('Error loading sharing data:', err);
      setError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to update POI privacy level
  const updatePoiPrivacyLevel = async (newPrivacyLevel: PrivacyLevel) => {
    if (!poi || !user) return;

    setUpdatingPrivacy(true);
    try {
      const { error } = await supabase
        .from('pois')
        .update({ privacy_level: newPrivacyLevel })
        .eq('id', poi.id);

      if (error) throw error;

      // Call callback to update parent state
      if (onPrivacyLevelChanged) {
        onPrivacyLevelChanged(poi.id, newPrivacyLevel);
      }

    } catch (err) {
      console.error('Error updating privacy level:', err);
      throw err;
    } finally {
      setUpdatingPrivacy(false);
    }
  };

  const handleShareWithUser = async (targetUser: AppUser) => {
    if (!poi || !user) return;

    // Check if already shared
    const existingShare = existingShares.find(share => share.shared_with_user_id === targetUser.id);
    if (existingShare) {
      setError('POI is already shared with this user');
      return;
    }

    setSharing(targetUser.id);
    setError(null);

    try {
      // Add the share
      const { data, error } = await supabase
        .from('poi_shares')
        .insert({
          poi_id: poi.id,
          shared_with_user_id: targetUser.id,
          shared_by_user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setExistingShares(prev => [...prev, data]);

      // Auto-convert privacy level from 'private' to 'shared' when first user is added
      if (poi.privacy_level === 'private' && existingShares.length === 0) {
        await updatePoiPrivacyLevel('shared');
      }

      // Call callback
      if (onShareAdded) {
        onShareAdded(data);
      }

    } catch (err) {
      console.error('Error sharing POI:', err);
      setError('Failed to share POI. Please try again.');
    } finally {
      setSharing(null);
    }
  };

  const handleRemoveShare = async (shareUserId: string) => {
    if (!poi || !user) return;

    setRemoving(shareUserId);
    setError(null);

    try {
      const { error } = await supabase
        .from('poi_shares')
        .delete()
        .eq('poi_id', poi.id)
        .eq('shared_with_user_id', shareUserId);

      if (error) throw error;

      // Update local state
      const updatedShares = existingShares.filter(share => share.shared_with_user_id !== shareUserId);
      setExistingShares(updatedShares);

      // Auto-convert privacy level from 'shared' to 'private' when last user is removed
      if (poi.privacy_level === 'shared' && updatedShares.length === 0) {
        await updatePoiPrivacyLevel('private');
      }

      // Call callback
      if (onShareRemoved) {
        onShareRemoved(shareUserId);
      }

    } catch (err) {
      console.error('Error removing share:', err);
      setError('Failed to remove share. Please try again.');
    } finally {
      setRemoving(null);
    }
  };

  // Filter users based on search
  const filteredUsers = allUsers.filter(appUser =>
    appUser.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appUser.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (appUser.display_name && appUser.display_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Users already shared with
  const sharedUsers = allUsers.filter(appUser =>
    existingShares.some(share => share.shared_with_user_id === appUser.id)
  );

  // Users available to share with
  const availableUsers = filteredUsers.filter(appUser =>
    !existingShares.some(share => share.shared_with_user_id === appUser.id)
  );

  if (!isOpen || !poi) return null;

  // Check if user is the owner
  const isOwner = poi.created_by === user?.id;

  // Don't show sharing for global POIs
  if (poi.privacy_level === 'global') {
    return (
      <div className="fixed inset-0 bg-black/60 z-[55] flex items-center justify-center p-4">
        <div 
          className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-slate-800/50 px-4 py-3 border-b border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-700 border border-slate-600 flex items-center justify-center">
                <Eye className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="text-lg font-bold text-amber-200" 
                  style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                Public POI
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-amber-300 hover:bg-slate-700/50 rounded transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 text-center">
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <Eye className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div className="text-left">
                  <p className="text-green-300 font-medium mb-1">This POI is Public</p>
                  <p className="text-green-200/80 text-sm">
                    Public POIs are visible to all users automatically. No individual sharing is needed.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 mb-4">
              <h4 className="text-amber-200 font-medium mb-1"
                  style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                {poi.title}
              </h4>
              <p className="text-sm text-slate-400">
                Map: {poi.map_type === 'hagga_basin' ? 'Hagga Basin' : 'Deep Desert'}
              </p>
            </div>

            <button
              onClick={onClose}
              className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg transition-colors"
              style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-[55] flex items-center justify-center p-4">
      <div 
        className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-800/50 px-4 py-3 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-700 border border-slate-600 flex items-center justify-center">
              <Share2 className="w-5 h-5 text-amber-300" />
            </div>
            <h3 className="text-lg font-bold text-amber-200" 
                style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
              Share POI
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-amber-300 hover:bg-slate-700/50 rounded transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* POI Info */}
        <div className="p-4 border-b border-slate-700">
          <div className="bg-slate-800 border border-slate-600 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="text-amber-200 font-medium mb-1"
                    style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                  {poi.title}
                </h4>
                <p className="text-sm text-slate-400">
                  Map: {poi.map_type === 'hagga_basin' ? 'Hagga Basin' : 'Deep Desert'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${
                  poi.privacy_level === 'private' 
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                }`}>
                  {poi.privacy_level === 'private' ? (
                    <>
                      <Lock className="w-3 h-3" />
                      <span>Private</span>
                    </>
                  ) : (
                    <>
                      <Users className="w-3 h-3" />
                      <span>Shared</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ownership Check */}
        {!isOwner && (
          <div className="p-4">
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <p className="text-yellow-300 text-sm">
                  You can only share POIs that you created.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4">
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400 mx-auto mb-4"></div>
              <p className="text-slate-400">Loading users...</p>
            </div>
          ) : (
            <>
              {/* Currently Shared With */}
              {isOwner && sharedUsers.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-amber-200 mb-3 flex items-center gap-2"
                      style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                    <Users className="w-4 h-4" />
                    Currently Shared With ({sharedUsers.length})
                  </h4>
                  <div className="space-y-2">
                    {sharedUsers.map(sharedUser => (
                      <div key={sharedUser.id} className="bg-slate-800 border border-slate-600 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <UserAvatar
                              user={sharedUser}
                              size="sm"
                              className="w-8 h-8"
                            />
                            <div>
                              <p className="text-amber-200 font-medium"
                                 style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                                {sharedUser.display_name || sharedUser.username}
                              </p>
                              <p className="text-slate-400 text-xs">{sharedUser.email}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveShare(sharedUser.id)}
                            disabled={removing === sharedUser.id || updatingPrivacy}
                            className="p-1.5 text-red-300 hover:text-red-100 hover:bg-slate-700/50 rounded transition-colors disabled:opacity-50"
                            title="Remove access"
                          >
                            {removing === sharedUser.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-300" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Share with new users */}
              {isOwner && (
                <div>
                  <h4 className="text-sm font-medium text-amber-200 mb-3 flex items-center gap-2"
                      style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                    <UserPlus className="w-4 h-4" />
                    Share with Users
                  </h4>
                  
                  {/* Search input */}
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search users by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:border-amber-400 transition-colors"
                      style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                    />
                  </div>

                  {/* Available users */}
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {availableUsers.length === 0 ? (
                      <div className="text-center py-8">
                        <Users className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                        <p className="text-slate-300 mb-2"
                           style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                          {searchTerm ? 'No users found matching your search' : 'No more users to share with'}
                        </p>
                        <p className="text-slate-400 text-sm">
                          {searchTerm ? 'Try adjusting your search terms' : 'All available users have already been shared with'}
                        </p>
                      </div>
                    ) : (
                      availableUsers.map(availableUser => (
                        <div key={availableUser.id} className="bg-slate-800 border border-slate-600 rounded-lg p-3 hover:border-slate-500 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <UserAvatar
                                user={availableUser}
                                size="sm"
                                className="w-8 h-8"
                              />
                              <div>
                                <p className="text-amber-200 font-medium"
                                   style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
                                  {availableUser.display_name || availableUser.username}
                                </p>
                                <p className="text-slate-400 text-xs">{availableUser.email}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleShareWithUser(availableUser)}
                              disabled={sharing === availableUser.id || updatingPrivacy}
                              className="bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded text-sm transition-colors disabled:opacity-50 flex items-center gap-2"
                              style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}
                            >
                              {sharing === availableUser.id ? (
                                <>
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
                                  <span>Sharing...</span>
                                </>
                              ) : (
                                <>
                                  <UserPlus className="w-3 h-3" />
                                  <span>Share</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700">
          <div className="bg-slate-800 border border-slate-600 rounded-lg p-3">
            <div className="text-xs text-slate-400"
                 style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
              💡 Tip: Privacy level automatically changes between Private and Shared based on share list.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharePoiModal; 