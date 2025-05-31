import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import DiamondIcon from '../common/DiamondIcon';
import { Settings, Plus, Edit2, Trash2, RefreshCw, AlertTriangle, Check, X, ChevronUp, ChevronDown, Filter, Search } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { useAuth } from '../auth/AuthProvider';
import { supabase } from '../../lib/supabase';
import { ConfirmationModal } from '../shared/ConfirmationModal';
import { PoiType, Item, Schematic, Category, Type, Tier } from '../../types/index';

interface DefaultAssignmentManagerProps {
  onError: (error: string) => void;
  onSuccess: (message: string) => void;
}

interface PoiTypeDefaultItem {
  id: string;
  poi_type_id: string;
  item_id: string;
  default_quantity: number;
  is_required: boolean;
  display_order: number;
  created_at: string;
  is_active: boolean;
  created_by: string | null;
  item?: Item;
}

interface PoiTypeDefaultSchematic {
  id: string;
  poi_type_id: string;
  schematic_id: string;
  is_required: boolean;
  display_order: number;
  created_at: string;
  is_active: boolean;
  created_by: string | null;
  schematic?: Schematic;
}

interface DefaultRuleForm {
  item_id: string | null;
  schematic_id: string | null;
  default_quantity: number;
  is_required: boolean;
  rule_type: 'item' | 'schematic';
}

interface EditRuleForm extends DefaultRuleForm {
  id: string;
  display_order: number;
}

interface FilterState {
  search: string;
  category: string;
  type: string;
  showOnlyWithRules: boolean;
}

const DefaultAssignmentManager: React.FC<DefaultAssignmentManagerProps> = ({
  onError,
  onSuccess
}) => {
  const { user } = useAuth();
  const [selectedPoiType, setSelectedPoiType] = useState<PoiType | null>(null);
  const [poiTypes, setPoiTypes] = useState<PoiType[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [schematics, setSchematics] = useState<Schematic[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [types, setTypes] = useState<Type[]>([]);
  const [tiers, setTiers] = useState<Tier[]>([]);
  
  const [showCreateRuleModal, setShowCreateRuleModal] = useState(false);
  const [showEditRuleModal, setShowEditRuleModal] = useState(false);
  const [ruleForm, setRuleForm] = useState<DefaultRuleForm>({
    item_id: null,
    schematic_id: null,
    default_quantity: 1,
    is_required: false,
    rule_type: 'item'
  });
  const [editRuleForm, setEditRuleForm] = useState<EditRuleForm | null>(null);
  
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: '',
    type: '',
    showOnlyWithRules: false
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    type: 'success' | 'error';
    title: string;
    message: string;
  }>({ show: false, type: 'success', title: '', message: '' });

  // Get all rules for all POI types (for display in cards)
  const [allPoiTypeRules, setAllPoiTypeRules] = useState<{
    [poiTypeId: string]: {
      items: PoiTypeDefaultItem[];
      schematics: PoiTypeDefaultSchematic[];
    }
  }>({});

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (poiTypes.length > 0) {
      loadAllPoiTypeRules();
    }
  }, [poiTypes]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load POI types
      const { data: poiTypesData, error: poiTypesError } = await supabase
        .from('poi_types')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (poiTypesError) throw poiTypesError;

      // Load items
      const { data: itemsData, error: itemsError } = await supabase
        .from('items')
        .select(`
          *,
          category:categories(name),
          type:types(name),
          tier:tiers(name, color)
        `)
        .order('name', { ascending: true });

      if (itemsError) throw itemsError;

      // Load schematics
      const { data: schematicsData, error: schematicsError } = await supabase
        .from('schematics')
        .select(`
          *,
          category:categories(name),
          type:types(name),
          tier:tiers(name, color)
        `)
        .order('name', { ascending: true });

      if (schematicsError) throw schematicsError;

      // Load categories, types, tiers for filtering
      const [categoriesRes, typesRes, tiersRes] = await Promise.all([
        supabase.from('categories').select('*').order('name'),
        supabase.from('types').select('*').order('name'),
        supabase.from('tiers').select('*').order('level')
      ]);

      setPoiTypes(poiTypesData || []);
      setItems(itemsData || []);
      setSchematics(schematicsData || []);
      setCategories(categoriesRes.data || []);
      setTypes(typesRes.data || []);
      setTiers(tiersRes.data || []);

    } catch (error) {
      console.error('Error loading data:', error);
      showError('Data Loading Error', 'Failed to load data. Please refresh the page.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAllPoiTypeRules = async () => {
    try {
      // Load all default items with display_order
      const { data: allItemRules, error: itemError } = await supabase
        .from('poi_type_default_items')
        .select(`
          *,
          item:items(id, name)
        `)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (itemError) throw itemError;

      // Load all default schematics with display_order
      const { data: allSchematicRules, error: schematicError } = await supabase
        .from('poi_type_default_schematics')
        .select(`
          *,
          schematic:schematics(id, name)
        `)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (schematicError) throw schematicError;

      // Group by POI type
      const rulesByPoiType: { [poiTypeId: string]: { items: PoiTypeDefaultItem[]; schematics: PoiTypeDefaultSchematic[] } } = {};
      
      poiTypes.forEach(poiType => {
        rulesByPoiType[poiType.id] = {
          items: (allItemRules || []).filter(rule => rule.poi_type_id === poiType.id),
          schematics: (allSchematicRules || []).filter(rule => rule.poi_type_id === poiType.id)
        };
      });

      setAllPoiTypeRules(rulesByPoiType);

    } catch (error) {
      console.error('Error loading all POI type rules:', error);
    }
  };

  const showSuccess = (title: string, message: string) => {
    setConfirmModal({ show: true, type: 'success', title, message });
  };

  const showError = (title: string, message: string) => {
    setConfirmModal({ show: true, type: 'error', title, message });
  };

  const closeConfirmationModal = () => {
    setConfirmModal({ show: false, type: 'success', title: '', message: '' });
  };

  const handleCreateRule = async () => {
    if (!selectedPoiType || !user) return;

    try {
      setIsLoading(true);

      if (ruleForm.rule_type === 'item') {
        if (!ruleForm.item_id) {
          showError('Validation Error', 'Please select an item.');
          return;
        }

        // Get next display order
        const { data: nextOrder } = await supabase
          .rpc('get_next_item_display_order', { poi_type_uuid: selectedPoiType.id });

        const { error } = await supabase
          .from('poi_type_default_items')
          .insert({
            poi_type_id: selectedPoiType.id,
            item_id: ruleForm.item_id,
            default_quantity: ruleForm.default_quantity,
            is_required: ruleForm.is_required,
            display_order: nextOrder || 0,
            created_by: user.id
          });

        if (error) throw error;
      } else {
        if (!ruleForm.schematic_id) {
          showError('Validation Error', 'Please select a schematic.');
          return;
        }

        // Get next display order
        const { data: nextOrder } = await supabase
          .rpc('get_next_schematic_display_order', { poi_type_uuid: selectedPoiType.id });

        const { error } = await supabase
          .from('poi_type_default_schematics')
          .insert({
            poi_type_id: selectedPoiType.id,
            schematic_id: ruleForm.schematic_id,
            is_required: ruleForm.is_required,
            display_order: nextOrder || 0,
            created_by: user.id
          });

        if (error) throw error;
      }

      showSuccess('Rule Created', `Default ${ruleForm.rule_type} rule created successfully.`);
      setShowCreateRuleModal(false);
      setRuleForm({
        item_id: null,
        schematic_id: null,
        default_quantity: 1,
        is_required: false,
        rule_type: 'item'
      });
      loadAllPoiTypeRules(); // Refresh the card summaries

    } catch (error) {
      console.error('Error creating rule:', error);
      showError('Creation Error', 'Failed to create default assignment rule.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditRule = (rule: PoiTypeDefaultItem | PoiTypeDefaultSchematic, ruleType: 'item' | 'schematic') => {
    if (ruleType === 'item') {
      const itemRule = rule as PoiTypeDefaultItem;
      setEditRuleForm({
        id: itemRule.id,
        item_id: itemRule.item_id,
        schematic_id: null,
        default_quantity: itemRule.default_quantity,
        is_required: itemRule.is_required,
        display_order: itemRule.display_order,
        rule_type: 'item'
      });
    } else {
      const schematicRule = rule as PoiTypeDefaultSchematic;
      setEditRuleForm({
        id: schematicRule.id,
        item_id: null,
        schematic_id: schematicRule.schematic_id,
        default_quantity: 1,
        is_required: schematicRule.is_required,
        display_order: schematicRule.display_order,
        rule_type: 'schematic'
      });
    }
    setShowEditRuleModal(true);
  };

  const handleUpdateRule = async () => {
    if (!editRuleForm || !user) return;

    try {
      setIsLoading(true);

      if (editRuleForm.rule_type === 'item') {
        const { error } = await supabase
          .from('poi_type_default_items')
          .update({
            item_id: editRuleForm.item_id,
            default_quantity: editRuleForm.default_quantity,
            is_required: editRuleForm.is_required
          })
          .eq('id', editRuleForm.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('poi_type_default_schematics')
          .update({
            schematic_id: editRuleForm.schematic_id,
            is_required: editRuleForm.is_required
          })
          .eq('id', editRuleForm.id);

        if (error) throw error;
      }

      showSuccess('Rule Updated', `Default ${editRuleForm.rule_type} rule updated successfully.`);
      setShowEditRuleModal(false);
      setEditRuleForm(null);
      loadAllPoiTypeRules(); // Refresh the card summaries

    } catch (error) {
      console.error('Error updating rule:', error);
      showError('Update Error', 'Failed to update default assignment rule.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRule = async (ruleId: string, ruleType: 'item' | 'schematic') => {
    if (!user) return;

    try {
      setIsLoading(true);

      const table = ruleType === 'item' ? 'poi_type_default_items' : 'poi_type_default_schematics';
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', ruleId);

      if (error) throw error;

      showSuccess('Rule Deleted', `Default ${ruleType} rule deleted successfully.`);
      loadAllPoiTypeRules(); // Refresh the card summaries

    } catch (error) {
      console.error('Error deleting rule:', error);
      showError('Deletion Error', 'Failed to delete default assignment rule.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReorderRule = async (ruleId: string, direction: 'up' | 'down', ruleType: 'item' | 'schematic', poiTypeId: string) => {
    if (!user) return;

    try {
      setIsLoading(true);

      const rules = ruleType === 'item' 
        ? allPoiTypeRules[poiTypeId]?.items || []
        : allPoiTypeRules[poiTypeId]?.schematics || [];

      const currentIndex = rules.findIndex(rule => rule.id === ruleId);
      if (currentIndex === -1) return;

      let newOrder;
      if (direction === 'up' && currentIndex > 0) {
        newOrder = rules[currentIndex - 1].display_order;
      } else if (direction === 'down' && currentIndex < rules.length - 1) {
        newOrder = rules[currentIndex + 1].display_order;
      } else {
        return; // Cannot move further
      }

      const functionName = ruleType === 'item' ? 'reorder_default_items' : 'reorder_default_schematics';
      const { error } = await supabase
        .rpc(functionName, {
          rule_uuid: ruleId,
          new_order: newOrder,
          poi_type_uuid: poiTypeId
        });

      if (error) throw error;

      loadAllPoiTypeRules(); // Refresh the display

    } catch (error) {
      console.error('Error reordering rule:', error);
      showError('Reorder Error', 'Failed to reorder rule.');
    } finally {
      setIsLoading(false);
    }
  };

  const getEntityDisplay = (entity: any) => {
    if (!entity) return 'Unknown';
    
    const parts = [entity.name];
    if (entity.category?.name) parts.push(`(${entity.category.name})`);
    if (entity.tier?.name) parts.push(`[${entity.tier.name}]`);
    
    return parts.join(' ');
  };

  const isIconUrl = (icon: string): boolean => {
    return icon.startsWith('http://') || icon.startsWith('https://');
  };

  const renderPoiTypeIcon = (poiType: PoiType) => {
    if (isIconUrl(poiType.icon)) {
      return (
        <img 
          src={poiType.icon} 
          alt={poiType.name}
          className="w-6 h-6 object-contain"
        />
      );
    } else {
      // Handle emoji or text icons
      return (
        <span className="text-lg leading-none">{poiType.icon}</span>
      );
    }
  };

  // Filter POI types based on current filters
  const filteredPoiTypes = poiTypes.filter(poiType => {
    // Search filter
    if (filters.search && !poiType.name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    
    // Category filter
    if (filters.category && poiType.category !== filters.category) {
      return false;
    }
    
    // Show only with rules filter
    if (filters.showOnlyWithRules) {
      const rules = allPoiTypeRules[poiType.id];
      const hasRules = rules && (rules.items.length > 0 || rules.schematics.length > 0);
      if (!hasRules) return false;
    }
    
    return true;
  });

  // Get unique categories from POI types
  const poiCategories = Array.from(new Set(poiTypes.map(poi => poi.category))).sort();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <DiamondIcon
          icon={<Settings size={18} strokeWidth={1.5} />}
          size="md"
          bgColor="bg-void-950"
          actualBorderColor="bg-gold-300"
          borderThickness={2}
          iconColor="text-gold-300"
        />
        <div>
          <h3 className="text-lg font-light text-gold-300"
              style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
            DEFAULT ASSIGNMENT RULES
          </h3>
          <p className="text-amber-200/70 text-sm font-light"
             style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
            Configure automatic POI item/schematic assignments
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-slate-800 border border-slate-600/50 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search POI types..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-200 placeholder-slate-400 focus:border-amber-300/50 focus:outline-none"
              />
            </div>
          </div>
          
          {/* Category Filter */}
          <div className="w-full sm:w-48">
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="w-full py-2 px-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-200 focus:border-amber-300/50 focus:outline-none"
            >
              <option value="">All Categories</option>
              {poiCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          {/* Show Only With Rules Toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="show-only-with-rules"
              checked={filters.showOnlyWithRules}
              onChange={(e) => setFilters(prev => ({ ...prev, showOnlyWithRules: e.target.checked }))}
              className="w-4 h-4 text-amber-500 rounded"
            />
            <label htmlFor="show-only-with-rules" className="text-slate-200 text-sm whitespace-nowrap">
              Only with rules
            </label>
          </div>
        </div>
      </div>

      {/* POI Types with Editable Rules - Two Column Layout */}
      <div className="bg-slate-800 border border-slate-600/50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-amber-300 font-medium"
              style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }}>
            POI Type Assignment Rules ({filteredPoiTypes.length})
          </h4>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredPoiTypes.map((poiType) => {
            const poiRules = allPoiTypeRules[poiType.id];
            const itemRules = poiRules?.items || [];
            const schematicRules = poiRules?.schematics || [];
            const totalRules = itemRules.length + schematicRules.length;
            
            return (
              <div
                key={poiType.id}
                className="border border-slate-600/50 bg-slate-700/30 rounded-lg p-4"
              >
                {/* POI Type Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                      {renderPoiTypeIcon(poiType)}
                    </div>
                    <div>
                      <div className="font-medium text-slate-200">{poiType.name}</div>
                      <div className="text-xs text-slate-400">{poiType.category}</div>
                    </div>
                    {totalRules > 0 && (
                      <div className="bg-amber-600/20 border border-amber-300/30 rounded-full px-2 py-1 text-xs text-amber-300">
                        {totalRules} rule{totalRules !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setSelectedPoiType(poiType);
                      setShowCreateRuleModal(true);
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-amber-600/20 border border-amber-300/30 rounded-lg text-amber-300 hover:bg-amber-600/30 transition-colors text-sm"
                  >
                    <Plus size={14} />
                    Add Rule
                  </button>
                </div>

                {/* Rules Display */}
                {totalRules > 0 ? (
                  <div className="space-y-3">
                    {/* Item Rules */}
                    {itemRules.length > 0 && (
                      <div>
                        <h6 className="text-slate-300 text-sm font-medium mb-2 flex items-center gap-2">
                          Items
                          <span className="text-xs bg-slate-600 px-2 py-0.5 rounded text-slate-400">
                            {itemRules.length}
                          </span>
                        </h6>
                        <div className="space-y-2">
                          {itemRules.map((rule, index) => (
                            <div key={rule.id} className="flex items-center justify-between p-2 bg-slate-600/50 rounded border border-slate-500/30">
                              <div className="flex items-center gap-2">
                                <div className="text-slate-200 text-sm">{getEntityDisplay(rule.item)}</div>
                                <div className="flex items-center gap-2 text-xs">
                                  <span className="text-slate-400">Qty: {rule.default_quantity}</span>
                                  <span className={`px-1.5 py-0.5 rounded text-xs ${
                                    rule.is_required 
                                      ? 'bg-red-600/20 text-red-300 border border-red-500/30' 
                                      : 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                                  }`}>
                                    {rule.is_required ? 'Required' : 'Optional'}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                {/* Reorder buttons */}
                                <button
                                  onClick={() => handleReorderRule(rule.id, 'up', 'item', poiType.id)}
                                  disabled={index === 0}
                                  className="p-1 text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                  <ChevronUp size={12} />
                                </button>
                                <button
                                  onClick={() => handleReorderRule(rule.id, 'down', 'item', poiType.id)}
                                  disabled={index === itemRules.length - 1}
                                  className="p-1 text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                  <ChevronDown size={12} />
                                </button>
                                {/* Edit button */}
                                <button
                                  onClick={() => handleEditRule(rule, 'item')}
                                  className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded transition-colors"
                                >
                                  <Edit2 size={12} />
                                </button>
                                {/* Delete button */}
                                <button
                                  onClick={() => handleDeleteRule(rule.id, 'item')}
                                  className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Schematic Rules */}
                    {schematicRules.length > 0 && (
                      <div>
                        <h6 className="text-slate-300 text-sm font-medium mb-2 flex items-center gap-2">
                          Schematics
                          <span className="text-xs bg-slate-600 px-2 py-0.5 rounded text-slate-400">
                            {schematicRules.length}
                          </span>
                        </h6>
                        <div className="space-y-2">
                          {schematicRules.map((rule, index) => (
                            <div key={rule.id} className="flex items-center justify-between p-2 bg-slate-600/50 rounded border border-slate-500/30">
                              <div className="flex items-center gap-2">
                                <div className="text-slate-200 text-sm">{getEntityDisplay(rule.schematic)}</div>
                                <span className={`px-1.5 py-0.5 rounded text-xs ${
                                  rule.is_required 
                                    ? 'bg-red-600/20 text-red-300 border border-red-500/30' 
                                    : 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                                }`}>
                                  {rule.is_required ? 'Required' : 'Optional'}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                {/* Reorder buttons */}
                                <button
                                  onClick={() => handleReorderRule(rule.id, 'up', 'schematic', poiType.id)}
                                  disabled={index === 0}
                                  className="p-1 text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                  <ChevronUp size={12} />
                                </button>
                                <button
                                  onClick={() => handleReorderRule(rule.id, 'down', 'schematic', poiType.id)}
                                  disabled={index === schematicRules.length - 1}
                                  className="p-1 text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                  <ChevronDown size={12} />
                                </button>
                                {/* Edit button */}
                                <button
                                  onClick={() => handleEditRule(rule, 'schematic')}
                                  className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded transition-colors"
                                >
                                  <Edit2 size={12} />
                                </button>
                                {/* Delete button */}
                                <button
                                  onClick={() => handleDeleteRule(rule.id, 'schematic')}
                                  className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-slate-500 text-sm italic py-3 text-center border border-slate-600/30 rounded bg-slate-600/10">
                    No assignment rules configured
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Rule Modal - Using Portal */}
      {showCreateRuleModal && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-slate-800 border border-amber-300/30 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-amber-300 text-lg font-medium mb-4">
              Add Default Assignment Rule
            </h3>

            <div className="space-y-4">
              {/* Rule Type */}
              <div>
                <label className="block text-slate-200 text-sm font-medium mb-2">
                  Rule Type
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={ruleForm.rule_type === 'item'}
                      onChange={() => setRuleForm(prev => ({ ...prev, rule_type: 'item' }))}
                      className="text-amber-500"
                    />
                    <span className="text-slate-200">Item</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={ruleForm.rule_type === 'schematic'}
                      onChange={() => setRuleForm(prev => ({ ...prev, rule_type: 'schematic' }))}
                      className="text-amber-500"
                    />
                    <span className="text-slate-200">Schematic</span>
                  </label>
                </div>
              </div>

              {/* Entity Selection */}
              <div>
                <label className="block text-slate-200 text-sm font-medium mb-2">
                  {ruleForm.rule_type === 'item' ? 'Select Item' : 'Select Schematic'}
                </label>
                <select
                  value={ruleForm.rule_type === 'item' ? (ruleForm.item_id || '') : (ruleForm.schematic_id || '')}
                  onChange={(e) => setRuleForm(prev => ({
                    ...prev,
                    [ruleForm.rule_type === 'item' ? 'item_id' : 'schematic_id']: e.target.value || null
                  }))}
                  className="w-full p-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-slate-200 focus:border-amber-300/50 focus:outline-none"
                >
                  <option value="">Select {ruleForm.rule_type}...</option>
                  {(ruleForm.rule_type === 'item' ? items : schematics).map((entity) => (
                    <option key={entity.id} value={entity.id}>
                      {getEntityDisplay(entity)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity (for items only) */}
              {ruleForm.rule_type === 'item' && (
                <div>
                  <label className="block text-slate-200 text-sm font-medium mb-2">
                    Default Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={ruleForm.default_quantity}
                    onChange={(e) => setRuleForm(prev => ({ ...prev, default_quantity: parseInt(e.target.value) || 1 }))}
                    className="w-full p-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-slate-200 focus:border-amber-300/50 focus:outline-none"
                  />
                </div>
              )}

              {/* Required */}
              <div>
                <label className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={ruleForm.is_required}
                    onChange={(e) => setRuleForm(prev => ({ ...prev, is_required: e.target.checked }))}
                    className="text-amber-500 mt-0.5"
                  />
                  <div>
                    <span className="text-slate-200">Required {ruleForm.rule_type}</span>
                    <div className="text-xs text-slate-400 mt-1">
                      {ruleForm.is_required 
                        ? `Always assigned to new POIs and cannot be removed by users`
                        : `Assigned by default but users can remove it when creating POIs`
                      }
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreateRule}
                disabled={isLoading}
                className="flex-1 py-2 px-4 bg-amber-600/20 border border-amber-300/30 rounded-lg text-amber-300 hover:bg-amber-600/30 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Creating...' : 'Create Rule'}
              </button>
              <button
                onClick={() => setShowCreateRuleModal(false)}
                className="flex-1 py-2 px-4 bg-slate-700 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Edit Rule Modal - Using Portal */}
      {showEditRuleModal && editRuleForm && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-slate-800 border border-amber-300/30 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-amber-300 text-lg font-medium mb-4">
              Edit Default Assignment Rule
            </h3>

            <div className="space-y-4">
              {/* Entity Selection */}
              <div>
                <label className="block text-slate-200 text-sm font-medium mb-2">
                  {editRuleForm.rule_type === 'item' ? 'Select Item' : 'Select Schematic'}
                </label>
                <select
                  value={editRuleForm.rule_type === 'item' ? (editRuleForm.item_id || '') : (editRuleForm.schematic_id || '')}
                  onChange={(e) => setEditRuleForm(prev => prev ? ({
                    ...prev,
                    [editRuleForm.rule_type === 'item' ? 'item_id' : 'schematic_id']: e.target.value || null
                  }) : null)}
                  className="w-full p-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-slate-200 focus:border-amber-300/50 focus:outline-none"
                >
                  <option value="">Select {editRuleForm.rule_type}...</option>
                  {(editRuleForm.rule_type === 'item' ? items : schematics).map((entity) => (
                    <option key={entity.id} value={entity.id}>
                      {getEntityDisplay(entity)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity (for items only) */}
              {editRuleForm.rule_type === 'item' && (
                <div>
                  <label className="block text-slate-200 text-sm font-medium mb-2">
                    Default Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editRuleForm.default_quantity}
                    onChange={(e) => setEditRuleForm(prev => prev ? ({ ...prev, default_quantity: parseInt(e.target.value) || 1 }) : null)}
                    className="w-full p-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-slate-200 focus:border-amber-300/50 focus:outline-none"
                  />
                </div>
              )}

              {/* Required */}
              <div>
                <label className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={editRuleForm.is_required}
                    onChange={(e) => setEditRuleForm(prev => prev ? ({ ...prev, is_required: e.target.checked }) : null)}
                    className="text-amber-500 mt-0.5"
                  />
                  <div>
                    <span className="text-slate-200">Required {editRuleForm.rule_type}</span>
                    <div className="text-xs text-slate-400 mt-1">
                      {editRuleForm.is_required 
                        ? `Always assigned to new POIs and cannot be removed by users`
                        : `Assigned by default but users can remove it when creating POIs`
                      }
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleUpdateRule}
                disabled={isLoading}
                className="flex-1 py-2 px-4 bg-amber-600/20 border border-amber-300/30 rounded-lg text-amber-300 hover:bg-amber-600/30 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Updating...' : 'Update Rule'}
              </button>
              <button
                onClick={() => {
                  setShowEditRuleModal(false);
                  setEditRuleForm(null);
                }}
                className="flex-1 py-2 px-4 bg-slate-700 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Confirmation Modal */}
      {confirmModal.show && (
        <ConfirmationModal
          isOpen={confirmModal.show}
          type={confirmModal.type}
          title={confirmModal.title}
          message={confirmModal.message}
          onClose={closeConfirmationModal}
        />
      )}
    </div>
  );
};

export default DefaultAssignmentManager; 