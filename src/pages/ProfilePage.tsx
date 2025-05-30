import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/auth/AuthProvider';
import { supabase } from '../lib/supabase';
import { EnhancedProfile, Rank, ProfileUpdateData } from '../types/profile';
import DiamondIcon from '../components/common/DiamondIcon';
import AvatarUpload from '../components/profile/AvatarUpload';
import { User, Save, Upload, Award, Mail, Calendar, Shield, Check, X, MessageCircle } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState<EnhancedProfile | null>(null);
  const [rank, setRank] = useState<Rank | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    display_name: '',
    bio: '',
    use_discord_avatar: true
  });

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;

      try {
        setIsLoading(true);
        
        // Fetch profile with rank information
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select(`
            *,
            rank:ranks(*)
          `)
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;

        setProfile(profileData);
        setRank(profileData.rank || null);
        
        // Set form data with current values
        setFormData({
          display_name: profileData.display_name || '',
          bio: profileData.bio || '',
          use_discord_avatar: profileData.discord_avatar_url ? (profileData.use_discord_avatar ?? true) : false
        });
      } catch (err: any) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user?.id]);

  const handleSave = async () => {
    if (!user?.id) return;

    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);

      const updateData: ProfileUpdateData = {
        display_name: formData.display_name.trim() || null,
        bio: formData.bio.trim() || null,
        use_discord_avatar: formData.use_discord_avatar
      };

      const { error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Refresh profile data
      const { data: updatedProfile, error: fetchError } = await supabase
        .from('profiles')
        .select(`
          *,
          rank:ranks(*)
        `)
        .eq('id', user.id)
        .single();

      if (fetchError) throw fetchError;

      setProfile(updatedProfile);
      setSuccess('Profile updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);

      // Refresh user state
      refreshUser();
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const getDisplayAvatar = () => {
    if (profile?.use_discord_avatar && profile?.discord_avatar_url) {
      return profile.discord_avatar_url;
    }
    if (profile?.custom_avatar_url) {
      return profile.custom_avatar_url;
    }
    return null;
  };

  const getDisplayName = () => {
    return profile?.display_name || profile?.username || 'Unknown User';
  };

  // Refresh profile after avatar change
  const handleAvatarChange = async (newAvatarUrl: string | null) => {
    // Refresh profile data to get latest avatar info
    if (!user?.id) return;
    
    try {
      const { data: updatedProfile, error: fetchError } = await supabase
        .from('profiles')
        .select(`
          *,
          rank:ranks(*)
        `)
        .eq('id', user.id)
        .single();

      if (fetchError) throw fetchError;
      setProfile(updatedProfile);
      setSuccess('Avatar updated successfully!');
      setTimeout(() => setSuccess(null), 3000);

      // Refresh user state
      refreshUser();
    } catch (err: any) {
      console.error('Error refreshing profile after avatar change:', err);
      setError('Avatar updated but failed to refresh profile data');
    }
  };

  const handleUploadStart = () => {
    setIsUploading(true);
    setError(null);
  };

  const handleUploadComplete = () => {
    setIsUploading(false);
  };

  const handleUploadError = (errorMessage: string) => {
    setIsUploading(false);
    setError(errorMessage);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div 
          className="fixed inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(/images/main-bg.jpg)` }}
        />
        <div className="relative z-10 backdrop-blur-sm bg-slate-950/20">
          <div className="container mx-auto px-6 py-8">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-300 mx-auto mb-4"></div>
                <p className="text-gold-300 font-light tracking-wide"
                   style={{ fontFamily: "'Trebuchet MS', sans-serif" }}>
                  Loading profile...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Main background image */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(/images/main-bg.jpg)` }}
      />
      
      {/* Content with backdrop blur for readability */}
      <div className="relative z-10 backdrop-blur-sm bg-slate-950/20">
        <div className="container mx-auto px-6 py-8 max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <DiamondIcon
                icon={<User size={20} strokeWidth={1.5} />}
                size="lg"
                bgColor="bg-void-950"
                actualBorderColor="bg-gold-300"
                borderThickness={2}
                iconColor="text-gold-300"
              />
              <div>
                <h1 className="text-4xl font-light tracking-[0.2em] text-amber-200 mb-2"
                    style={{ fontFamily: "'Trebuchet MS', sans-serif" }}>
                  PROFILE MANAGEMENT
                </h1>
                <p className="text-amber-300/80 font-light tracking-wide">
                  Customize your identity and preferences within the Dune Awakening community.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Overview Card */}
            <div className="lg:col-span-1">
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-lg" />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-800/40 to-slate-900/60 rounded-lg" />
                <div className="relative p-6 rounded-lg border border-amber-400/20">
                  <h3 className="text-lg font-light tracking-wide text-amber-200 mb-6 flex items-center gap-2"
                      style={{ fontFamily: "'Trebuchet MS', sans-serif" }}>
                    <User size={16} className="text-gold-300" />
                    Profile Overview
                  </h3>

                  {/* Avatar Display */}
                  <div className="text-center mb-6">
                    <div className="relative inline-block">
                      {getDisplayAvatar() ? (
                        <img
                          src={getDisplayAvatar()!}
                          alt="Profile Avatar"
                          className="w-24 h-24 rounded-full border-2 border-gold-300/50 object-cover"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-void-950 border-2 border-gold-300/50 flex items-center justify-center">
                          <User size={32} className="text-gold-300/70" />
                        </div>
                      )}
                    </div>
                    <h4 className="text-xl font-light text-amber-200 mt-3"
                        style={{ fontFamily: "'Trebuchet MS', sans-serif" }}>
                      {getDisplayName()}
                    </h4>
                    {profile?.discord_username ? (
                      <div className="flex items-center justify-center gap-2 text-amber-300/70 text-sm">
                        <MessageCircle size={14} className="text-blue-400" />
                        <span>{profile.discord_username}</span>
                      </div>
                    ) : (
                      <p className="text-amber-300/70 text-sm">@{profile?.username}</p>
                    )}
                  </div>

                  {/* Profile Info */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail size={14} className="text-gold-300/70" />
                      <span className="text-amber-300/80 text-sm">{profile?.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Shield size={14} className="text-gold-300/70" />
                      <span className="text-amber-300/80 text-sm capitalize">{profile?.role}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar size={14} className="text-gold-300/70" />
                      <span className="text-amber-300/80 text-sm">
                        Joined {profile?.join_date ? new Date(profile.join_date).toLocaleDateString() : 'Unknown'}
                      </span>
                    </div>
                    {rank && (
                      <div className="flex items-center gap-3">
                        <Award size={14} className="text-gold-300/70" />
                        <span 
                          className="text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1"
                          style={{ 
                            backgroundColor: rank.color, 
                            color: rank.text_color,
                            border: `1px solid ${rank.color}40`
                          }}
                        >
                          <Award size={12} />
                          {rank.name}
                        </span>
                      </div>
                    )}
                  </div>

                  {profile?.bio && (
                    <div className="mt-6 pt-4 border-t border-amber-400/20">
                      <p className="text-amber-300/80 text-sm italic">{profile.bio}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Settings Form */}
            <div className="lg:col-span-2">
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-lg" />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-800/40 to-slate-900/60 rounded-lg" />
                <div className="relative p-6 rounded-lg border border-amber-400/20">
                  <h3 className="text-lg font-light tracking-wide text-amber-200 mb-6 flex items-center gap-2"
                      style={{ fontFamily: "'Trebuchet MS', sans-serif" }}>
                    <Save size={16} className="text-gold-300" />
                    Profile Settings
                  </h3>

                  {/* Error/Success Messages */}
                  {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-900/20 border border-red-500/30 flex items-center gap-2">
                      <X size={16} className="text-red-400" />
                      <span className="text-red-300 text-sm">{error}</span>
                    </div>
                  )}
                  
                  {success && (
                    <div className="mb-4 p-3 rounded-lg bg-green-900/20 border border-green-500/30 flex items-center gap-2">
                      <Check size={16} className="text-green-400" />
                      <span className="text-green-300 text-sm">{success}</span>
                    </div>
                  )}

                  <div className="space-y-6">
                    {/* Display Name */}
                    <div>
                      <label className="block text-amber-200 text-sm font-light mb-2"
                             style={{ fontFamily: "'Trebuchet MS', sans-serif" }}>
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={formData.display_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                        placeholder="Enter your preferred display name"
                        className="w-full px-4 py-3 bg-void-950/60 border border-gold-300/30 rounded-lg 
                                 text-amber-200 placeholder-amber-300/50 focus:ring-2 focus:ring-gold-300/50 
                                 focus:outline-none transition-all duration-300"
                        style={{ fontFamily: "'Trebuchet MS', sans-serif" }}
                      />
                      <p className="text-amber-300/60 text-xs mt-1">
                        This name will be displayed throughout the application
                      </p>
                    </div>

                    {/* Bio */}
                    <div>
                      <label className="block text-amber-200 text-sm font-light mb-2"
                             style={{ fontFamily: "'Trebuchet MS', sans-serif" }}>
                        Bio
                      </label>
                      <textarea
                        value={formData.bio}
                        onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder="Tell others about yourself..."
                        rows={4}
                        className="w-full px-4 py-3 bg-void-950/60 border border-gold-300/30 rounded-lg 
                                 text-amber-200 placeholder-amber-300/50 focus:ring-2 focus:ring-gold-300/50 
                                 focus:outline-none resize-none transition-all duration-300"
                        style={{ fontFamily: "'Trebuchet MS', sans-serif" }}
                      />
                      <p className="text-amber-300/60 text-xs mt-1">
                        Optional description that appears on your profile
                      </p>
                    </div>

                    {/* Avatar Settings */}
                    <div>
                      <label className="block text-amber-200 text-sm font-light mb-4"
                             style={{ fontFamily: "'Trebuchet MS', sans-serif" }}>
                        Avatar Settings
                      </label>
                      
                      <div className="space-y-4 mb-6">
                        {/* Discord Avatar Option - Only show if user has Discord avatar */}
                        {profile?.discord_avatar_url ? (
                          <label className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="avatar_source"
                              checked={formData.use_discord_avatar}
                              onChange={() => setFormData(prev => ({ ...prev, use_discord_avatar: true }))}
                              className="text-gold-300 focus:ring-gold-300/50"
                            />
                            <span className="text-amber-300 text-sm">Use Discord Avatar</span>
                            <img
                              src={profile.discord_avatar_url}
                              alt="Discord Avatar"
                              className="w-6 h-6 rounded-full border border-gold-300/30"
                            />
                          </label>
                        ) : (
                          <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                            <p className="text-blue-300 text-sm">
                              <strong>Discord Avatar Not Available</strong> - You signed up with email/password. 
                              To use a Discord avatar, you would need to link your Discord account.
                            </p>
                          </div>
                        )}
                        
                        {/* Custom Avatar Option */}
                        <label className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="avatar_source"
                            checked={!formData.use_discord_avatar || !profile?.discord_avatar_url}
                            onChange={() => setFormData(prev => ({ ...prev, use_discord_avatar: false }))}
                            className="text-gold-300 focus:ring-gold-300/50"
                          />
                          <span className="text-amber-300 text-sm">
                            {profile?.custom_avatar_url ? 'Use Custom Avatar' : 'Upload Custom Avatar'}
                          </span>
                          {profile?.custom_avatar_url && (
                            <img
                              src={profile.custom_avatar_url}
                              alt="Custom Avatar"
                              className="w-6 h-6 rounded-full border border-gold-300/30"
                            />
                          )}
                        </label>
                      </div>

                      {/* Custom Avatar Upload - Show when custom avatar is selected OR when no Discord avatar available */}
                      {(!formData.use_discord_avatar || !profile?.discord_avatar_url) && (
                        <div className="mt-4 p-4 bg-void-950/30 rounded-lg border border-gold-300/20">
                          <AvatarUpload
                            currentAvatarUrl={profile?.custom_avatar_url}
                            onAvatarChange={handleAvatarChange}
                            isUploading={isUploading}
                            onUploadStart={handleUploadStart}
                            onUploadComplete={handleUploadComplete}
                            onError={handleUploadError}
                          />
                        </div>
                      )}
                      
                      <p className="text-amber-300/60 text-xs mt-2">
                        {profile?.discord_avatar_url 
                          ? "Choose between your Discord avatar or upload a custom one."
                          : "Upload a custom avatar to personalize your profile."
                        }
                      </p>
                    </div>

                    {/* Save Button */}
                    <div className="pt-4">
                      <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="w-full px-6 py-3 bg-gradient-to-r from-gold-600 to-gold-500 
                                 text-void-950 font-medium rounded-lg transition-all duration-300 
                                 hover:from-gold-500 hover:to-gold-400 disabled:opacity-50 
                                 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        style={{ fontFamily: "'Trebuchet MS', sans-serif" }}
                      >
                        {isSaving ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-void-950"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save size={16} />
                            Save Profile
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 