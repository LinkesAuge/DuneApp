import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Award, 
  Plus, 
  Pencil, 
  Trash2, 
  Save, 
  X, 
  ArrowUp, 
  ArrowDown,
  RefreshCw,
  AlertCircle 
} from 'lucide-react';
import { Rank, RankCreateData, RankUpdateData } from '../../types/profile';

interface RankManagementProps {
  onError: (error: string) => void;
  onSuccess: (message: string) => void;
}

const RankManagement: React.FC<RankManagementProps> = ({ onError, onSuccess }) => {
  const [ranks, setRanks] = useState<Rank[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingRank, setEditingRank] = useState<Rank | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newRank, setNewRank] = useState<RankCreateData>({
    name: '',
    description: '',
    color: '#3B82F6',
    text_color: '#FFFFFF',
    display_order: 0
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
    fetchRanks();
  }, []);

  const fetchRanks = async () => {
    try {
      setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  const handleCreateRank = async () => {
    try {
      if (!newRank.name.trim()) {
        onError('Rank name is required');
        return;
      }

      // Auto-assign display order if not set
      const maxOrder = Math.max(...ranks.map(r => r.display_order), 0);
      const rankData = {
        ...newRank,
        display_order: newRank.display_order || maxOrder + 100
      };

      const { data, error } = await supabase
        .from('ranks')
        .insert([rankData])
        .select()
        .single();

      if (error) throw error;

      setRanks([...ranks, data]);
      setIsCreating(false);
      setNewRank({
        name: '',
        description: '',
        color: '#3B82F6',
        text_color: '#FFFFFF',
        display_order: 0
      });
      onSuccess('Rank created successfully');
    } catch (error: any) {
      console.error('Error creating rank:', error);
      onError('Failed to create rank: ' + error.message);
    }
  };

  const handleUpdateRank = async (rank: Rank) => {
    try {
      const { error } = await supabase
        .from('ranks')
        .update({
          name: rank.name,
          description: rank.description,
          color: rank.color,
          text_color: rank.text_color,
          display_order: rank.display_order
        })
        .eq('id', rank.id);

      if (error) throw error;

      setRanks(ranks.map(r => r.id === rank.id ? rank : r));
      setEditingRank(null);
      onSuccess('Rank updated successfully');
    } catch (error: any) {
      console.error('Error updating rank:', error);
      onError('Failed to update rank: ' + error.message);
    }
  };

  const handleDeleteRank = async (rankId: string, rankName: string) => {
    if (!confirm(`Are you sure you want to delete the "${rankName}" rank? Users with this rank will have their rank removed.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('ranks')
        .delete()
        .eq('id', rankId);

      if (error) throw error;

      setRanks(ranks.filter(r => r.id !== rankId));
      onSuccess(`Rank "${rankName}" deleted successfully`);
    } catch (error: any) {
      console.error('Error deleting rank:', error);
      onError('Failed to delete rank: ' + error.message);
    }
  };

  const moveRank = async (rankId: string, direction: 'up' | 'down') => {
    const sortedRanks = [...ranks].sort((a, b) => a.display_order - b.display_order);
    const currentIndex = sortedRanks.findIndex(r => r.id === rankId);
    
    if (currentIndex === -1) return;
    if (direction === 'up' && currentIndex === 0) return;
    if (direction === 'down' && currentIndex === sortedRanks.length - 1) return;

    const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const currentRank = sortedRanks[currentIndex];
    const swapRank = sortedRanks[swapIndex];

    // Swap display orders
    const tempOrder = currentRank.display_order;
    currentRank.display_order = swapRank.display_order;
    swapRank.display_order = tempOrder;

    try {
      // Update both ranks in database
      const { error: error1 } = await supabase
        .from('ranks')
        .update({ display_order: currentRank.display_order })
        .eq('id', currentRank.id);

      const { error: error2 } = await supabase
        .from('ranks')
        .update({ display_order: swapRank.display_order })
        .eq('id', swapRank.id);

      if (error1 || error2) throw error1 || error2;

      setRanks(ranks.map(r => {
        if (r.id === currentRank.id) return currentRank;
        if (r.id === swapRank.id) return swapRank;
        return r;
      }));
    } catch (error: any) {
      console.error('Error reordering ranks:', error);
      onError('Failed to reorder ranks: ' + error.message);
    }
  };

  const RankBadge: React.FC<{ rank: Rank; className?: string }> = ({ rank, className = '' }) => (
    <span 
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${className}`}
      style={{ 
        backgroundColor: rank.color, 
        color: rank.text_color,
        border: `1px solid ${rank.color}40`
      }}
    >
      {rank.name}
    </span>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block p-4 rounded-full border border-gold-300/50 mb-6"
               style={{ backgroundColor: 'rgba(42, 36, 56, 0.8)' }}>
            <Award className="text-gold-300" size={24} />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-300 mx-auto mb-4"></div>
          <p className="text-gold-300 font-light tracking-wide"
             style={{ fontFamily: "'Trebuchet MS', sans-serif" }}>
            Loading ranks...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-light text-gold-300 flex items-center"
            style={{ fontFamily: "'Trebuchet MS', sans-serif" }}>
          <Award className="mr-4 text-amber-200" size={28} />
          RANK MANAGEMENT
          <span className="ml-4 text-lg text-amber-200/70">({ranks.length} ranks)</span>
        </h3>
        <div className="flex gap-3">
          <button
            onClick={fetchRanks}
            className="text-gold-300 hover:text-amber-200 transition-all duration-300 p-2 rounded-md border border-gold-300/30 hover:border-amber-200/40 hover:bg-amber-200/10"
            title="Refresh ranks"
          >
            <RefreshCw size={18} />
          </button>
          <button
            onClick={() => setIsCreating(true)}
            className="bg-gold-300/90 hover:bg-gold-300 text-void-950 px-4 py-2 rounded-md transition-all duration-300 flex items-center font-medium tracking-wide"
            style={{ fontFamily: "'Trebuchet MS', sans-serif" }}
          >
            <Plus size={18} className="mr-2" />
            Create Rank
          </button>
        </div>
      </div>

      {/* Create New Rank Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-void-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-void-900/95 border border-gold-300/30 rounded-lg p-6 max-w-md w-full backdrop-blur-sm"
               style={{ backgroundColor: 'rgba(42, 36, 56, 0.95)' }}>
            <h3 className="text-xl font-light text-gold-300 mb-6 flex items-center"
                style={{ fontFamily: "'Trebuchet MS', sans-serif" }}>
              <Plus className="mr-3 text-amber-200" size={20} />
              CREATE RANK
            </h3>

            <div className="space-y-4">
              {/* Rank Name */}
              <div>
                <label className="block text-sm font-medium text-gold-300 mb-2">Rank Name</label>
                <input
                  type="text"
                  value={newRank.name}
                  onChange={(e) => setNewRank(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-void-950/60 border border-gold-300/30 rounded-md text-amber-200 focus:outline-none focus:ring-2 focus:ring-gold-300/50"
                  placeholder="e.g., Elite Explorer"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gold-300 mb-2">Description (Optional)</label>
                <input
                  type="text"
                  value={newRank.description}
                  onChange={(e) => setNewRank(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 bg-void-950/60 border border-gold-300/30 rounded-md text-amber-200 focus:outline-none focus:ring-2 focus:ring-gold-300/50"
                  placeholder="Rank description"
                />
              </div>

              {/* Color Presets */}
              <div>
                <label className="block text-sm font-medium text-gold-300 mb-2">Color</label>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {colorPresets.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => setNewRank(prev => ({ 
                        ...prev, 
                        color: preset.bg, 
                        text_color: preset.text 
                      }))}
                      className={`p-2 rounded-md border-2 transition-all ${
                        newRank.color === preset.bg 
                          ? 'border-gold-300' 
                          : 'border-transparent hover:border-gold-300/50'
                      }`}
                      style={{ backgroundColor: preset.bg, color: preset.text }}
                      title={preset.name}
                    >
                      Sample
                    </button>
                  ))}
                </div>
                
                {/* Custom Color Inputs */}
                <div className="flex gap-2">
                  <div className="flex-1">
                    <input
                      type="color"
                      value={newRank.color}
                      onChange={(e) => setNewRank(prev => ({ ...prev, color: e.target.value }))}
                      className="w-full h-10 rounded border border-gold-300/30"
                    />
                    <label className="text-xs text-amber-200/60">Background</label>
                  </div>
                  <div className="flex-1">
                    <input
                      type="color"
                      value={newRank.text_color}
                      onChange={(e) => setNewRank(prev => ({ ...prev, text_color: e.target.value }))}
                      className="w-full h-10 rounded border border-gold-300/30"
                    />
                    <label className="text-xs text-amber-200/60">Text</label>
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div>
                <label className="block text-sm font-medium text-gold-300 mb-2">Preview</label>
                <div className="p-3 bg-void-950/40 rounded-md border border-gold-300/20">
                  {newRank.name && (
                    <span 
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                      style={{ 
                        backgroundColor: newRank.color, 
                        color: newRank.text_color 
                      }}
                    >
                      {newRank.name}
                    </span>
                  )}
                </div>
              </div>

              {/* Display Order */}
              <div>
                <label className="block text-sm font-medium text-gold-300 mb-2">Display Order</label>
                <input
                  type="number"
                  value={newRank.display_order}
                  onChange={(e) => setNewRank(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 bg-void-950/60 border border-gold-300/30 rounded-md text-amber-200 focus:outline-none focus:ring-2 focus:ring-gold-300/50"
                  placeholder="0 (auto-assign)"
                />
                <p className="text-xs text-amber-200/60 mt-1">Lower numbers appear first. Leave 0 for auto-assign.</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 text-amber-200/70 hover:text-amber-200 transition-all duration-300 border border-amber-200/30 hover:border-amber-200/50 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRank}
                className="px-4 py-2 bg-gold-300/90 hover:bg-gold-300 text-void-950 font-medium rounded-md transition-all duration-300 flex items-center"
              >
                <Save size={16} className="mr-2" />
                Create Rank
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ranks List */}
      <div className="border border-gold-300/30 rounded-lg overflow-hidden"
           style={{ backgroundColor: 'rgba(42, 36, 56, 0.6)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: 'rgba(42, 36, 56, 0.8)' }}>
              <tr className="border-b border-gold-300/20">
                <th className="px-6 py-4 text-left text-sm font-light text-gold-300 uppercase tracking-[0.1em]">
                  Order
                </th>
                <th className="px-6 py-4 text-left text-sm font-light text-gold-300 uppercase tracking-[0.1em]">
                  Rank
                </th>
                <th className="px-6 py-4 text-left text-sm font-light text-gold-300 uppercase tracking-[0.1em]">
                  Description
                </th>
                <th className="px-6 py-4 text-right text-sm font-light text-gold-300 uppercase tracking-[0.1em]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {ranks.sort((a, b) => a.display_order - b.display_order).map((rank, index) => (
                <tr key={rank.id} className="hover:bg-gold-300/5 transition-colors duration-300">
                  <td className="px-6 py-4 text-amber-200 font-light">
                    <div className="flex items-center gap-2">
                      <span>{rank.display_order}</span>
                      <div className="flex flex-col">
                        <button
                          onClick={() => moveRank(rank.id, 'up')}
                          disabled={index === 0}
                          className="text-amber-200/60 hover:text-amber-200 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ArrowUp size={12} />
                        </button>
                        <button
                          onClick={() => moveRank(rank.id, 'down')}
                          disabled={index === ranks.length - 1}
                          className="text-amber-200/60 hover:text-amber-200 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ArrowDown size={12} />
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <RankBadge rank={rank} />
                  </td>
                  <td className="px-6 py-4 text-amber-200/70 font-light">
                    {rank.description || 'No description'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditingRank(rank)}
                        className="text-amber-200 hover:text-gold-300 transition-all duration-300 p-2 rounded-md border border-amber-200/30 hover:border-gold-300/40 hover:bg-gold-300/10"
                        title="Edit rank"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteRank(rank.id, rank.name)}
                        className="text-red-400 hover:text-red-300 transition-all duration-300 p-2 rounded-md border border-red-400/30 hover:border-red-300/40 hover:bg-red-300/10"
                        title="Delete rank"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {ranks.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-block p-4 rounded-full border border-amber-200/50 mb-4"
                 style={{ backgroundColor: 'rgba(42, 36, 56, 0.8)' }}>
              <Award className="text-amber-200" size={24} />
            </div>
            <p className="text-amber-200/70 font-light tracking-wide"
               style={{ fontFamily: "'Trebuchet MS', sans-serif" }}>
              No ranks created yet
            </p>
          </div>
        )}
      </div>

      {/* Edit Rank Modal */}
      {editingRank && (
        <div className="fixed inset-0 bg-void-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-void-900/95 border border-gold-300/30 rounded-lg p-6 max-w-md w-full backdrop-blur-sm"
               style={{ backgroundColor: 'rgba(42, 36, 56, 0.95)' }}>
            <h3 className="text-xl font-light text-gold-300 mb-6 flex items-center"
                style={{ fontFamily: "'Trebuchet MS', sans-serif" }}>
              <Pencil className="mr-3 text-amber-200" size={20} />
              EDIT RANK
            </h3>

            <div className="space-y-4">
              {/* Similar form structure as create, but with editingRank values */}
              <div>
                <label className="block text-sm font-medium text-gold-300 mb-2">Rank Name</label>
                <input
                  type="text"
                  value={editingRank.name}
                  onChange={(e) => setEditingRank(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
                  className="w-full px-3 py-2 bg-void-950/60 border border-gold-300/30 rounded-md text-amber-200 focus:outline-none focus:ring-2 focus:ring-gold-300/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gold-300 mb-2">Description</label>
                <input
                  type="text"
                  value={editingRank.description || ''}
                  onChange={(e) => setEditingRank(prev => prev ? ({ ...prev, description: e.target.value }) : null)}
                  className="w-full px-3 py-2 bg-void-950/60 border border-gold-300/30 rounded-md text-amber-200 focus:outline-none focus:ring-2 focus:ring-gold-300/50"
                />
              </div>

              {/* Color controls */}
              <div>
                <label className="block text-sm font-medium text-gold-300 mb-2">Colors</label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <input
                      type="color"
                      value={editingRank.color}
                      onChange={(e) => setEditingRank(prev => prev ? ({ ...prev, color: e.target.value }) : null)}
                      className="w-full h-10 rounded border border-gold-300/30"
                    />
                    <label className="text-xs text-amber-200/60">Background</label>
                  </div>
                  <div className="flex-1">
                    <input
                      type="color"
                      value={editingRank.text_color}
                      onChange={(e) => setEditingRank(prev => prev ? ({ ...prev, text_color: e.target.value }) : null)}
                      className="w-full h-10 rounded border border-gold-300/30"
                    />
                    <label className="text-xs text-amber-200/60">Text</label>
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div>
                <label className="block text-sm font-medium text-gold-300 mb-2">Preview</label>
                <div className="p-3 bg-void-950/40 rounded-md border border-gold-300/20">
                  <RankBadge rank={editingRank} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gold-300 mb-2">Display Order</label>
                <input
                  type="number"
                  value={editingRank.display_order}
                  onChange={(e) => setEditingRank(prev => prev ? ({ ...prev, display_order: parseInt(e.target.value) || 0 }) : null)}
                  className="w-full px-3 py-2 bg-void-950/60 border border-gold-300/30 rounded-md text-amber-200 focus:outline-none focus:ring-2 focus:ring-gold-300/50"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setEditingRank(null)}
                className="px-4 py-2 text-amber-200/70 hover:text-amber-200 transition-all duration-300 border border-amber-200/30 hover:border-amber-200/50 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={() => editingRank && handleUpdateRank(editingRank)}
                className="px-4 py-2 bg-gold-300/90 hover:bg-gold-300 text-void-950 font-medium rounded-md transition-all duration-300 flex items-center"
              >
                <Save size={16} className="mr-2" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RankManagement; 