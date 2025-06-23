import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Shield, 
  Plus, 
  Pencil, 
  Trash2, 
  Save, 
  X, 
  ArrowUp, 
  ArrowDown,
  RefreshCw,
  AlertCircle,
  Users,
  Crown,
  Star
} from 'lucide-react';
import { Guild, GuildCreateRequest, GuildUpdateRequest } from '../../types/profile';

interface GuildManagementProps {
  onError: (error: string) => void;
  onSuccess: (message: string) => void;
}

const GuildManagement: React.FC<GuildManagementProps> = ({ onError, onSuccess }) => {
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingGuild, setEditingGuild] = useState<Guild | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newGuild, setNewGuild] = useState<GuildCreateRequest>({
    name: '',
    description: '',
    tag_color: '#3B82F6',
    tag_text_color: '#FFFFFF',
    display_order: 0,
    is_active: true
  });

  // Default colors for quick selection
  const colorPresets = [
    { bg: '#6B7280', text: '#FFFFFF', name: 'Gray' },
    { bg: '#10B981', text: '#FFFFFF', name: 'Green' },
    { bg: '#3B82F6', text: '#FFFFFF', name: 'Blue' },
    { bg: '#8B5CF6', text: '#FFFFFF', name: 'Purple' },
    { bg: '#F59E0B', text: '#000000', name: 'Yellow' },
    { bg: '#EF4444', text: '#FFFFFF', name: 'Red' },
    { bg: '#EC4899', text: '#FFFFFF', name: 'Pink' },
    { bg: '#06B6D4', text: '#FFFFFF', name: 'Cyan' }
  ];

  useEffect(() => {
    fetchGuilds();
  }, []);

  const fetchGuilds = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('guilds')
        .select(`
          *,
          member_count:profiles(count)
        `)
        .order('display_order', { ascending: true });

      if (error) throw error;
      
      // Process the data to get member counts
      const processedGuilds = (data || []).map(guild => ({
        ...guild,
        member_count: guild.member_count?.[0]?.count || 0
      }));
      
      setGuilds(processedGuilds);
    } catch (error: any) {
      console.error('Error fetching guilds:', error);
      onError('Failed to load guilds: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGuild = async () => {
    try {
      if (!newGuild.name.trim()) {
        onError('Guild name is required');
        return;
      }

      // Auto-assign display order if not set
      const maxOrder = Math.max(...guilds.map(g => g.display_order), 0);
      const guildData = {
        ...newGuild,
        display_order: newGuild.display_order || maxOrder + 100
      };

      const { data, error } = await supabase
        .from('guilds')
        .insert([guildData])
        .select()
        .single();

      if (error) throw error;

      setGuilds([...guilds, { ...data, member_count: 0 }]);
      setIsCreating(false);
      setNewGuild({
        name: '',
        description: '',
        tag_color: '#3B82F6',
        tag_text_color: '#FFFFFF',
        display_order: 0,
        is_active: true
      });
      onSuccess('Guild created successfully');
    } catch (error: any) {
      console.error('Error creating guild:', error);
      onError('Failed to create guild: ' + error.message);
    }
  };

  const handleUpdateGuild = async (guild: Guild) => {
    try {
      const { error } = await supabase
        .from('guilds')
        .update({
          name: guild.name,
          description: guild.description,
          tag_color: guild.tag_color,
          tag_text_color: guild.tag_text_color,
          display_order: guild.display_order,
          is_active: guild.is_active
        })
        .eq('id', guild.id);

      if (error) throw error;

      setGuilds(guilds.map(g => g.id === guild.id ? guild : g));
      setEditingGuild(null);
      onSuccess('Guild updated successfully');
    } catch (error: any) {
      console.error('Error updating guild:', error);
      onError('Failed to update guild: ' + error.message);
    }
  };

  const handleDeleteGuild = async (guildId: string, guildName: string) => {
    // Prevent deletion of Unassigned guild
    if (guildId === '00000000-0000-0000-0000-000000000000') {
      onError('Cannot delete the default "Unassigned" guild');
      return;
    }

    if (!confirm(`Are you sure you want to delete the "${guildName}" guild? Members will be moved to "Unassigned".`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('guilds')
        .delete()
        .eq('id', guildId);

      if (error) throw error;

      setGuilds(guilds.filter(g => g.id !== guildId));
      onSuccess(`Guild "${guildName}" deleted successfully`);
    } catch (error: any) {
      console.error('Error deleting guild:', error);
      onError('Failed to delete guild: ' + error.message);
    }
  };

  const moveGuild = async (guildId: string, direction: 'up' | 'down') => {
    const sortedGuilds = [...guilds].sort((a, b) => a.display_order - b.display_order);
    const currentIndex = sortedGuilds.findIndex(g => g.id === guildId);
    
    if (currentIndex === -1) return;
    if (direction === 'up' && currentIndex === 0) return;
    if (direction === 'down' && currentIndex === sortedGuilds.length - 1) return;

    const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const currentGuild = sortedGuilds[currentIndex];
    const swapGuild = sortedGuilds[swapIndex];

    // Swap display orders
    const tempOrder = currentGuild.display_order;
    currentGuild.display_order = swapGuild.display_order;
    swapGuild.display_order = tempOrder;

    try {
      // Update both guilds in database
      const { error: error1 } = await supabase
        .from('guilds')
        .update({ display_order: currentGuild.display_order })
        .eq('id', currentGuild.id);

      const { error: error2 } = await supabase
        .from('guilds')
        .update({ display_order: swapGuild.display_order })
        .eq('id', swapGuild.id);

      if (error1 || error2) throw error1 || error2;

      setGuilds(guilds.map(g => {
        if (g.id === currentGuild.id) return currentGuild;
        if (g.id === swapGuild.id) return swapGuild;
        return g;
      }));
    } catch (error: any) {
      console.error('Error reordering guilds:', error);
      onError('Failed to reorder guilds: ' + error.message);
    }
  };

  const GuildTag: React.FC<{ guild: Guild; className?: string }> = ({ guild, className = '' }) => (
    <span 
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${className}`}
      style={{ 
        backgroundColor: guild.tag_color, 
        color: guild.tag_text_color,
        border: `1px solid ${guild.tag_color}40`
      }}
    >
      <Shield size={14} className="mr-1" />
      {guild.name}
    </span>
  );

  const ColorPicker: React.FC<{
    value: string;
    onChange: (color: string) => void;
    label: string;
  }> = ({ value, onChange, label }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gold-300">{label}</label>
      <div className="flex items-center space-x-3">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-8 rounded border border-gold-300/30 bg-transparent cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 bg-void-950/50 border border-gold-300/30 rounded text-gold-300 placeholder-amber-200/50"
          placeholder="#000000"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {colorPresets.map((preset) => (
          <button
            key={preset.name}
            onClick={() => onChange(preset.bg)}
            className="w-6 h-6 rounded border border-gold-300/30 hover:scale-110 transition-transform"
            style={{ backgroundColor: preset.bg }}
            title={preset.name}
          />
        ))}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-3 text-gold-300">
          <RefreshCw className="animate-spin" size={20} />
          <span>Loading guilds...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Shield className="text-gold-300" size={24} />
          <h2 className="text-xl font-light text-gold-300 tracking-wide"
              style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
            GUILD MANAGEMENT
          </h2>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchGuilds}
            className="flex items-center space-x-2 px-4 py-2 bg-void-950/50 border border-gold-300/30 rounded text-gold-300 hover:bg-gold-300/10 transition-colors"
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gold-300/20 border border-gold-300/50 rounded text-gold-300 hover:bg-gold-300/30 transition-colors"
          >
            <Plus size={16} />
            <span>Create Guild</span>
          </button>
        </div>
      </div>

      {/* Create New Guild Form */}
      {isCreating && (
        <div className="p-6 bg-void-950/30 border border-gold-300/30 rounded-lg">
          <h3 className="text-lg font-medium text-gold-300 mb-4">Create New Guild</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gold-300 mb-2">Guild Name</label>
                <input
                  type="text"
                  value={newGuild.name}
                  onChange={(e) => setNewGuild({ ...newGuild, name: e.target.value })}
                  className="w-full px-3 py-2 bg-void-950/50 border border-gold-300/30 rounded text-gold-300 placeholder-amber-200/50"
                  placeholder="Enter guild name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gold-300 mb-2">Description</label>
                <textarea
                  value={newGuild.description || ''}
                  onChange={(e) => setNewGuild({ ...newGuild, description: e.target.value })}
                  className="w-full px-3 py-2 bg-void-950/50 border border-gold-300/30 rounded text-gold-300 placeholder-amber-200/50"
                  placeholder="Enter guild description"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gold-300 mb-2">Display Order</label>
                <input
                  type="number"
                  value={newGuild.display_order}
                  onChange={(e) => setNewGuild({ ...newGuild, display_order: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-void-950/50 border border-gold-300/30 rounded text-gold-300"
                  placeholder="Display order"
                />
              </div>
            </div>
            <div className="space-y-4">
              <ColorPicker
                value={newGuild.tag_color}
                onChange={(color) => setNewGuild({ ...newGuild, tag_color: color })}
                label="Tag Background Color"
              />
              <ColorPicker
                value={newGuild.tag_text_color}
                onChange={(color) => setNewGuild({ ...newGuild, tag_text_color: color })}
                label="Tag Text Color"
              />
              <div className="pt-4">
                <label className="block text-sm font-medium text-gold-300 mb-2">Preview</label>
                <GuildTag guild={newGuild as Guild} />
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => setIsCreating(false)}
              className="flex items-center space-x-2 px-4 py-2 bg-void-950/50 border border-gold-300/30 rounded text-gold-300 hover:bg-red-500/10 transition-colors"
            >
              <X size={16} />
              <span>Cancel</span>
            </button>
            <button
              onClick={handleCreateGuild}
              className="flex items-center space-x-2 px-4 py-2 bg-gold-300/20 border border-gold-300/50 rounded text-gold-300 hover:bg-gold-300/30 transition-colors"
            >
              <Save size={16} />
              <span>Create Guild</span>
            </button>
          </div>
        </div>
      )}

      {/* Guilds List */}
      <div className="space-y-4">
        {guilds.map((guild) => (
          <div
            key={guild.id}
            className="p-4 bg-void-950/30 border border-gold-300/30 rounded-lg"
          >
            {editingGuild?.id === guild.id ? (
              /* Edit Form */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gold-300 mb-2">Guild Name</label>
                    <input
                      type="text"
                      value={editingGuild.name}
                      onChange={(e) => setEditingGuild({ ...editingGuild, name: e.target.value })}
                      className="w-full px-3 py-2 bg-void-950/50 border border-gold-300/30 rounded text-gold-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gold-300 mb-2">Description</label>
                    <textarea
                      value={editingGuild.description || ''}
                      onChange={(e) => setEditingGuild({ ...editingGuild, description: e.target.value })}
                      className="w-full px-3 py-2 bg-void-950/50 border border-gold-300/30 rounded text-gold-300"
                      rows={3}
                    />
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gold-300 mb-2">Display Order</label>
                      <input
                        type="number"
                        value={editingGuild.display_order}
                        onChange={(e) => setEditingGuild({ ...editingGuild, display_order: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 bg-void-950/50 border border-gold-300/30 rounded text-gold-300"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={editingGuild.is_active}
                        onChange={(e) => setEditingGuild({ ...editingGuild, is_active: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <label className="text-sm text-gold-300">Active</label>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <ColorPicker
                    value={editingGuild.tag_color}
                    onChange={(color) => setEditingGuild({ ...editingGuild, tag_color: color })}
                    label="Tag Background Color"
                  />
                  <ColorPicker
                    value={editingGuild.tag_text_color}
                    onChange={(color) => setEditingGuild({ ...editingGuild, tag_text_color: color })}
                    label="Tag Text Color"
                  />
                  <div className="pt-4">
                    <label className="block text-sm font-medium text-gold-300 mb-2">Preview</label>
                    <GuildTag guild={editingGuild} />
                  </div>
                </div>
                <div className="md:col-span-2 flex justify-end space-x-3 mt-4">
                  <button
                    onClick={() => setEditingGuild(null)}
                    className="flex items-center space-x-2 px-4 py-2 bg-void-950/50 border border-gold-300/30 rounded text-gold-300 hover:bg-red-500/10 transition-colors"
                  >
                    <X size={16} />
                    <span>Cancel</span>
                  </button>
                  <button
                    onClick={() => handleUpdateGuild(editingGuild)}
                    className="flex items-center space-x-2 px-4 py-2 bg-gold-300/20 border border-gold-300/50 rounded text-gold-300 hover:bg-gold-300/30 transition-colors"
                  >
                    <Save size={16} />
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Display Mode */
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <GuildTag guild={guild} />
                  <div>
                    <h3 className="text-lg font-medium text-gold-300">{guild.name}</h3>
                    {guild.description && (
                      <p className="text-sm text-amber-200/70">{guild.description}</p>
                    )}
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-xs text-amber-200/60">
                        <Users size={12} className="inline mr-1" />
                        {guild.member_count || 0} members
                      </span>
                      <span className="text-xs text-amber-200/60">
                        Order: {guild.display_order}
                      </span>
                      {!guild.is_active && (
                        <span className="text-xs text-red-400">Inactive</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => moveGuild(guild.id, 'up')}
                    className="p-2 text-gold-300 hover:bg-gold-300/10 rounded transition-colors"
                    title="Move up"
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button
                    onClick={() => moveGuild(guild.id, 'down')}
                    className="p-2 text-gold-300 hover:bg-gold-300/10 rounded transition-colors"
                    title="Move down"
                  >
                    <ArrowDown size={16} />
                  </button>
                  <button
                    onClick={() => setEditingGuild(guild)}
                    className="p-2 text-gold-300 hover:bg-gold-300/10 rounded transition-colors"
                    title="Edit guild"
                  >
                    <Pencil size={16} />
                  </button>
                  {guild.id !== '00000000-0000-0000-0000-000000000000' && (
                    <button
                      onClick={() => handleDeleteGuild(guild.id, guild.name)}
                      className="p-2 text-red-400 hover:bg-red-500/10 rounded transition-colors"
                      title="Delete guild"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {guilds.length === 0 && (
        <div className="text-center py-12">
          <AlertCircle className="mx-auto text-amber-200/50 mb-4" size={48} />
          <p className="text-amber-200/70">No guilds found</p>
        </div>
      )}
    </div>
  );
};

export default GuildManagement; 