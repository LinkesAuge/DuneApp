import React, { useState, useEffect } from 'react';
import { X, UserPlus, Users, Search, Trash2, Check, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Poi, User, PoiShare } from '../../types';
import { useAuth } from '../auth/AuthProvider';

interface SharePoiModalProps {
  isOpen: boolean;
  onClose: () => void;
  poi: Poi | null;
  onShareAdded?: (share: PoiShare) => void;
  onShareRemoved?: (shareUserId: string) => void;
}

interface AppUser {
  id: string;
  username: string;
  email: string;
}

const SharePoiModal: React.FC<SharePoiModalProps> = ({
  isOpen,
  onClose,
  poi,
  onShareAdded,
  onShareRemoved
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
        .select('id, username, email')
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
      setExistingShares(prev => prev.filter(share => share.shared_with_user_id !== shareUserId));

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
    appUser.email.toLowerCase().includes(searchTerm.toLowerCase())
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

  return (
    <div className="fixed inset-0 bg-night-950/90 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-sand-200">
          <h3 className="text-lg font-semibold text-sand-800">Share POI</h3>
          <button
            onClick={onClose}
            className="text-sand-500 hover:text-sand-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* POI Info */}
        <div className="p-4 border-b border-sand-200 bg-sand-50">
          <div className="flex items-center">
            <div className="flex-1">
              <h4 className="font-medium text-sand-800">{poi.title}</h4>
              <p className="text-sm text-sand-600">
                Map: {poi.map_type === 'hagga_basin' ? 'Hagga Basin' : 'Deep Desert'}
              </p>
            </div>
            <div className="text-xs text-sand-500">
              {poi.privacy_level === 'global' ? 'Public' : 
               poi.privacy_level === 'private' ? 'Private' : 'Shared'}
            </div>
          </div>
        </div>

        {/* Ownership Check */}
        {!isOwner && (
          <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400">
            <div className="flex">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0" />
              <p className="text-yellow-700 text-sm">
                You can only share POIs that you created.
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-400">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Content */}
        {isOwner && (
          <div className="p-6 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-spice-600 mx-auto mb-2"></div>
                <p className="text-sand-600">Loading users...</p>
              </div>
            ) : (
              <>
                {/* Currently Shared With */}
                {sharedUsers.length > 0 && (
                  <div className="mb-6">
                    <h5 className="text-sm font-medium text-sand-700 mb-3">Currently Shared With</h5>
                    <div className="space-y-2">
                      {sharedUsers.map(appUser => (
                        <div key={appUser.id} className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex items-center">
                            <Users className="w-4 h-4 text-green-600 mr-2" />
                            <div>
                              <p className="text-sm font-medium text-sand-800">{appUser.username}</p>
                              <p className="text-xs text-sand-600">{appUser.email}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveShare(appUser.id)}
                            disabled={removing === appUser.id}
                            className="text-red-600 hover:text-red-800 disabled:opacity-50"
                            title="Remove share"
                          >
                            {removing === appUser.id ? (
                              <div className="w-4 h-4 border border-red-600 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Share with New Users */}
                <div>
                  <h5 className="text-sm font-medium text-sand-700 mb-3">Share with Users</h5>
                  
                  {/* Search */}
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-3 text-sand-400" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search users..."
                        className="w-full pl-10 pr-3 py-2 border border-sand-300 rounded-md focus:outline-none focus:ring-2 focus:ring-spice-500"
                      />
                    </div>
                  </div>

                  {/* Available Users */}
                  {availableUsers.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-sand-400 mx-auto mb-4" />
                      <p className="text-sand-600">
                        {searchTerm ? 'No users found matching your search' : 'No users available to share with'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {availableUsers.map(appUser => (
                        <div key={appUser.id} className="flex items-center justify-between bg-sand-50 border border-sand-200 rounded-lg p-3">
                          <div className="flex items-center">
                            <UserPlus className="w-4 h-4 text-sand-500 mr-2" />
                            <div>
                              <p className="text-sm font-medium text-sand-800">{appUser.username}</p>
                              <p className="text-xs text-sand-600">{appUser.email}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleShareWithUser(appUser)}
                            disabled={sharing === appUser.id}
                            className="btn btn-sm btn-primary disabled:opacity-50"
                          >
                            {sharing === appUser.id ? (
                              <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <>
                                <UserPlus className="w-4 h-4 mr-1" />
                                Share
                              </>
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-sand-200 bg-sand-50">
          <div className="text-xs text-sand-500">
            <p>💡 Tip: Users can only see shared POIs when they have access to your map data.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharePoiModal; 