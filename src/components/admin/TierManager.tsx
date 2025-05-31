import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Save, X, AlertTriangle, BarChart3, ArrowUp, ArrowDown } from 'lucide-react';
import DiamondIcon from '../common/DiamondIcon';
import { ImageSelector } from '../shared/ImageSelector';
import { ImagePreview } from '../shared/ImagePreview';
import { ConfirmationModal } from '../shared/ConfirmationModal';
import { useAuth } from '../auth/AuthProvider';
import {
  fetchTiers,
  createTier as createTierAPI,
  updateTier as updateTierAPI,
  deleteTier as deleteTierAPI
} from '../../lib/itemsSchematicsCrud';
import type { Tier } from '../../types';

interface TierManagerProps {
  onError: (error: string) => void;
  onSuccess: (message: string) => void;
}

interface TierFormData {
  name: string;
  level: number;
  color: string;
  description: string;
}

interface TierEditData extends TierFormData {
  id: string;
}

const TierManager: React.FC<TierManagerProps> = ({ onError, onSuccess }) => {
  const { user } = useAuth();

  // State Management
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI State
  const [isCreating, setIsCreating] = useState(false);
  const [editingTier, setEditingTier] = useState<Tier | null>(null);

  // Form State
  const [createForm, setCreateForm] = useState<TierFormData>({
    name: '',
    level: 1,
    color: '#fbbf24', // Default amber color
    description: ''
  });

  const [editForm, setEditForm] = useState<TierEditData>({
    id: '',
    name: '',
    level: 1,
    color: '#fbbf24',
    description: ''
  });

  // Modal State
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    type: 'success' | 'error';
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });

  // Show success feedback
  const showSuccess = (title: string, message: string) => {
    setConfirmationModal({
      isOpen: true,
      type: 'success',
      title,
      message
    });
  };

  // Show error feedback
  const showError = (title: string, message: string) => {
    setConfirmationModal({
      isOpen: true,
      type: 'error',
      title,
      message
    });
  };

  // Close confirmation modal
  const closeConfirmationModal = () => {
    setConfirmationModal(prev => ({ ...prev, isOpen: false }));
  };

  // Reset forms
  const resetCreateForm = () => {
    setCreateForm({
      name: '',
      level: getNextLevel(),
      color: '#fbbf24',
      description: ''
    });
  };

  const resetEditForm = () => {
    setEditForm({
      id: '',
      name: '',
      level: 1,
      color: '#fbbf24',
      description: ''
    });
  };

  // Get next available level
  const getNextLevel = () => {
    if (tiers.length === 0) return 0; // Start with level 0 if no tiers exist
    return Math.max(...tiers.map(t => t.level)) + 1;
  };

  // Load tiers data
  const loadTiers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchTiers(user);

      if (!result.success) {
        throw new Error(result.error || 'Failed to load tiers');
      }

      const tiersData = result.data || [];
      
      // Sort by level
      tiersData.sort((a, b) => a.level - b.level);
      
      setTiers(tiersData);
    } catch (err) {
      console.error('Error loading tiers:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load tiers';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadTiers();
  }, [loadTiers]);

  // Handle create tier
  const handleCreateClick = () => {
    resetCreateForm();
    setIsCreating(true);
  };

  const handleCreateSubmit = async () => {
    if (!user) return;

    // Validation
    if (!createForm.name.trim()) {
      showError('Validation Error', 'Tier name is required');
      return;
    }

    if (createForm.level < 0) {
      showError('Validation Error', 'Tier level must be at least 0');
      return;
    }

    // Check for level conflicts
    if (tiers.some(t => t.level === createForm.level)) {
      showError('Validation Error', `Level ${createForm.level} is already in use`);
      return;
    }

    try {
      const tierData = {
        name: createForm.name.trim(),
        level: createForm.level,
        color: createForm.color,
        description: createForm.description.trim() || null
      };

      const result = await createTierAPI(user, tierData);

      if (!result.success) {
        throw new Error(result.error || 'Failed to create tier');
      }

      showSuccess('Tier Created', `Successfully created tier "${createForm.name}"`);
      resetCreateForm();
      setIsCreating(false);
      await loadTiers();
    } catch (err) {
      console.error('Error creating tier:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create tier';
      showError('Creation Failed', errorMessage);
    }
  };

  // Handle edit tier
  const handleEditClick = (tier: Tier) => {
    setEditForm({
      id: tier.id,
      name: tier.name,
      level: tier.level,
      color: tier.color,
      description: tier.description || ''
    });
    setEditingTier(tier);
  };

  const handleEditSubmit = async () => {
    if (!user || !editingTier) return;

    // Validation
    if (!editForm.name.trim()) {
      showError('Validation Error', 'Tier name is required');
      return;
    }

    if (editForm.level < 0) {
      showError('Validation Error', 'Tier level must be at least 0');
      return;
    }

    // Check for level conflicts (excluding current tier)
    if (tiers.some(t => t.id !== editingTier.id && t.level === editForm.level)) {
      showError('Validation Error', `Level ${editForm.level} is already in use`);
      return;
    }

    try {
      const updates = {
        name: editForm.name.trim(),
        level: editForm.level,
        color: editForm.color,
        description: editForm.description.trim() || null
      };

      const result = await updateTierAPI(user, editingTier.id, updates);

      if (!result.success) {
        throw new Error(result.error || 'Failed to update tier');
      }

      showSuccess('Tier Updated', `Successfully updated tier "${editForm.name}"`);
      setEditingTier(null);
      resetEditForm();
      await loadTiers();
    } catch (err) {
      console.error('Error updating tier:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update tier';
      showError('Update Failed', errorMessage);
    }
  };

  // Handle delete tier
  const handleDelete = async (tier: Tier) => {
    if (!user) return;

    if (!confirm(`Delete tier "${tier.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const result = await deleteTierAPI(user, tier.id);

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete tier');
      }

      showSuccess('Tier Deleted', `Successfully deleted tier "${tier.name}"`);
      await loadTiers();
    } catch (err) {
      console.error('Error deleting tier:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete tier';
      showError('Deletion Failed', errorMessage);
    }
  };

  // Handle level reordering
  const handleMoveUp = async (tier: Tier) => {
    if (!user || tier.level === 0) return; // Can't move up from level 0

    const targetLevel = tier.level - 1;
    const conflictingTier = tiers.find(t => t.level === targetLevel);

    if (conflictingTier) {
      // Use a temporary level to avoid constraint violations during swap
      try {
        // Step 1: Move the conflicting tier to a temporary high level
        const tempLevel = Math.max(...tiers.map(t => t.level)) + 1000;
        await updateTierAPI(user, conflictingTier.id, { level: tempLevel });
        
        // Step 2: Move our tier to the target level
        await updateTierAPI(user, tier.id, { level: targetLevel });
        
        // Step 3: Move the conflicting tier to our old level
        await updateTierAPI(user, conflictingTier.id, { level: tier.level });
        
        await loadTiers();
      } catch (err) {
        console.error('Error reordering tiers:', err);
        showError('Reorder Failed', 'Failed to reorder tiers');
        // Reload to ensure UI is in sync with database
        await loadTiers();
      }
    }
  };

  const handleMoveDown = async (tier: Tier) => {
    if (!user) return;

    const maxLevel = Math.max(...tiers.map(t => t.level));
    if (tier.level === maxLevel) return;

    const targetLevel = tier.level + 1;
    const conflictingTier = tiers.find(t => t.level === targetLevel);

    if (conflictingTier) {
      // Use a temporary level to avoid constraint violations during swap
      try {
        // Step 1: Move the conflicting tier to a temporary high level
        const tempLevel = Math.max(...tiers.map(t => t.level)) + 1000;
        await updateTierAPI(user, conflictingTier.id, { level: tempLevel });
        
        // Step 2: Move our tier to the target level
        await updateTierAPI(user, tier.id, { level: targetLevel });
        
        // Step 3: Move the conflicting tier to our old level
        await updateTierAPI(user, conflictingTier.id, { level: tier.level });
        
        await loadTiers();
      } catch (err) {
        console.error('Error reordering tiers:', err);
        showError('Reorder Failed', 'Failed to reorder tiers');
        // Reload to ensure UI is in sync with database
        await loadTiers();
      }
    }
  };

  // Render tier form
  const renderTierForm = (data: TierFormData, isEdit: boolean = false) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-light text-amber-300 mb-2" style={{ fontFamily: 'Trebuchet MS, sans-serif' }}>
            Name *
          </label>
          <input
            type="text"
            value={data.name}
            onChange={(e) => {
              if (isEdit) {
                setEditForm(prev => ({ ...prev, name: e.target.value }));
              } else {
                setCreateForm(prev => ({ ...prev, name: e.target.value }));
              }
            }}
            placeholder="Enter tier name"
            className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-300/60 focus:ring-1 focus:ring-amber-300/30 font-light"
            style={{ fontFamily: 'Trebuchet MS, sans-serif' }}
          />
        </div>

        <div>
          <label className="block text-sm font-light text-amber-300 mb-2" style={{ fontFamily: 'Trebuchet MS, sans-serif' }}>
            Level *
          </label>
          <input
            type="number"
            min="0"
            value={data.level}
            onChange={(e) => {
              const level = parseInt(e.target.value) || 0;
              if (isEdit) {
                setEditForm(prev => ({ ...prev, level }));
              } else {
                setCreateForm(prev => ({ ...prev, level }));
              }
            }}
            className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded text-slate-100 focus:outline-none focus:border-amber-300/60 focus:ring-1 focus:ring-amber-300/30 font-light"
            style={{ fontFamily: 'Trebuchet MS, sans-serif' }}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-light text-amber-300 mb-2" style={{ fontFamily: 'Trebuchet MS, sans-serif' }}>
          Color *
        </label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={data.color}
            onChange={(e) => {
              if (isEdit) {
                setEditForm(prev => ({ ...prev, color: e.target.value }));
              } else {
                setCreateForm(prev => ({ ...prev, color: e.target.value }));
              }
            }}
            className="w-16 h-10 border border-slate-600/50 rounded cursor-pointer"
          />
          <input
            type="text"
            value={data.color}
            onChange={(e) => {
              if (isEdit) {
                setEditForm(prev => ({ ...prev, color: e.target.value }));
              } else {
                setCreateForm(prev => ({ ...prev, color: e.target.value }));
              }
            }}
            placeholder="#fbbf24"
            className="flex-1 px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-300/60 focus:ring-1 focus:ring-amber-300/30 font-light"
            style={{ fontFamily: 'Trebuchet MS, sans-serif' }}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-light text-amber-300 mb-2" style={{ fontFamily: 'Trebuchet MS, sans-serif' }}>
          Description
        </label>
        <textarea
          value={data.description}
          onChange={(e) => {
            if (isEdit) {
              setEditForm(prev => ({ ...prev, description: e.target.value }));
            } else {
              setCreateForm(prev => ({ ...prev, description: e.target.value }));
            }
          }}
          placeholder="Optional description..."
          rows={3}
          className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-300/60 focus:ring-1 focus:ring-amber-300/30 resize-none font-light"
          style={{ fontFamily: 'Trebuchet MS, sans-serif' }}
        />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-800/30 rounded"></div>
          <div className="h-64 bg-slate-800/30 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-3">
          <DiamondIcon
            icon={<AlertTriangle size={24} />}
            size="lg"
            bgColor="bg-red-600"
            iconColor="text-white"
          />
          <p className="text-red-300 font-light" style={{ fontFamily: 'Trebuchet MS, sans-serif' }}>
            {error}
          </p>
          <button
            onClick={loadTiers}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600/20 border border-amber-300/30 rounded text-amber-300 hover:bg-amber-600/30 hover:border-amber-300/50 transition-all duration-200 font-light"
            style={{ fontFamily: 'Trebuchet MS, sans-serif' }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <DiamondIcon
            icon={<BarChart3 size={20} />}
            size="md"
            bgColor="bg-void-950"
            actualBorderColor="bg-amber-300"
            borderThickness={2}
            iconColor="text-amber-300"
          />
          <h2 className="text-xl font-light text-amber-300" style={{ fontFamily: 'Trebuchet MS, sans-serif' }}>
            Tier Management
          </h2>
        </div>

        <button
          onClick={handleCreateClick}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600/20 border border-amber-300/30 rounded text-amber-300 hover:bg-amber-600/30 hover:border-amber-300/50 transition-all duration-200 font-light"
          style={{ fontFamily: 'Trebuchet MS, sans-serif' }}
        >
          <Plus size={16} />
          Create Tier
        </button>
      </div>

      {/* Create Tier Form */}
      {isCreating && (
        <div className="bg-slate-800/50 border border-slate-600/50 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <DiamondIcon
              icon={<Plus size={16} />}
              size="md"
              bgColor="bg-amber-600"
              iconColor="text-slate-900"
            />
            <h3 className="text-lg font-light text-slate-100" style={{ fontFamily: 'Trebuchet MS, sans-serif' }}>
              Create New Tier
            </h3>
          </div>

          {renderTierForm(createForm)}

          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={handleCreateSubmit}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600/20 border border-amber-300/30 rounded text-amber-300 hover:bg-amber-600/30 hover:border-amber-300/50 transition-all duration-200 font-light"
              style={{ fontFamily: 'Trebuchet MS, sans-serif' }}
            >
              <Save size={16} />
              Create Tier
            </button>
            <button
              onClick={() => {
                setIsCreating(false);
                resetCreateForm();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-slate-100 rounded hover:bg-slate-500 transition-colors font-light"
              style={{ fontFamily: 'Trebuchet MS, sans-serif' }}
            >
              <X size={16} />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Tiers List */}
      <div className="space-y-3">
        {tiers.length === 0 ? (
          <div className="text-center py-12">
            <DiamondIcon
              icon={<BarChart3 size={48} />}
              size="xl"
              bgColor="bg-slate-800"
              iconColor="text-slate-400"
              className="mx-auto mb-4"
            />
            <p className="text-slate-400 font-light" style={{ fontFamily: 'Trebuchet MS, sans-serif' }}>
              No tiers created yet
            </p>
            <p className="text-sm text-slate-500 font-light" style={{ fontFamily: 'Trebuchet MS, sans-serif' }}>
              Create your first tier to get started
            </p>
          </div>
        ) : (
          tiers.map((tier) => (
            <div
              key={tier.id}
              className="bg-slate-800/50 border border-slate-600/50 rounded-lg p-4"
            >
              {editingTier?.id === tier.id ? (
                /* Edit Mode */
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <DiamondIcon
                      icon={<Edit2 size={16} />}
                      size="md"
                      bgColor="bg-amber-600"
                      iconColor="text-slate-900"
                    />
                    <h3 className="text-lg font-light text-slate-100" style={{ fontFamily: 'Trebuchet MS, sans-serif' }}>
                      Edit Tier
                    </h3>
                  </div>

                  {renderTierForm(editForm, true)}

                  <div className="flex items-center gap-3 mt-6">
                    <button
                      onClick={handleEditSubmit}
                      className="flex items-center gap-2 px-4 py-2 bg-amber-600/20 border border-amber-300/30 rounded text-amber-300 hover:bg-amber-600/30 hover:border-amber-300/50 transition-all duration-200 font-light"
                      style={{ fontFamily: 'Trebuchet MS, sans-serif' }}
                    >
                      <Save size={16} />
                      Save Changes
                    </button>
                    <button
                      onClick={() => {
                        setEditingTier(null);
                        resetEditForm();
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-slate-100 rounded hover:bg-slate-500 transition-colors font-light"
                      style={{ fontFamily: 'Trebuchet MS, sans-serif' }}
                    >
                      <X size={16} />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* Display Mode */
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-6 h-6 rounded border-2 border-slate-400"
                        style={{ backgroundColor: tier.color }}
                      />
                      <div>
                        <h3 className="text-lg font-light text-slate-100" style={{ fontFamily: 'Trebuchet MS, sans-serif' }}>
                          {tier.name}
                        </h3>
                        <p className="text-sm text-slate-400 font-light" style={{ fontFamily: 'Trebuchet MS, sans-serif' }}>
                          Level {tier.level}
                          {tier.description && ` • ${tier.description}`}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleMoveUp(tier)}
                      disabled={tier.level === 0}
                      className="p-2 text-slate-400 hover:text-amber-300 hover:bg-amber-600/10 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="Move up"
                    >
                      <ArrowUp size={16} />
                    </button>
                    <button
                      onClick={() => handleMoveDown(tier)}
                      disabled={tier.level === Math.max(...tiers.map(t => t.level))}
                      className="p-2 text-slate-400 hover:text-amber-300 hover:bg-amber-600/10 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="Move down"
                    >
                      <ArrowDown size={16} />
                    </button>
                    <button
                      onClick={() => handleEditClick(tier)}
                      className="p-2 text-slate-400 hover:text-amber-300 hover:bg-amber-600/10 rounded transition-colors"
                      title="Edit tier"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(tier)}
                      className="p-2 text-slate-400 hover:text-red-300 hover:bg-red-600/10 rounded transition-colors"
                      title="Delete tier"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={closeConfirmationModal}
        type={confirmationModal.type}
        title={confirmationModal.title}
        message={confirmationModal.message}
      />
    </div>
  );
};

export default TierManager; 