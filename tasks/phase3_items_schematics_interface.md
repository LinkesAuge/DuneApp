# Phase 3: Items & Schematics Interface - Detailed Implementation Guide

## **🎉 PHASE 3 STATUS: 90% COMPLETE** ✅
**Date Updated**: January 30, 2025  
**Status**: **MAJOR FUNCTIONALITY OPERATIONAL** ✅  
**Completion**: All core user interface functionality complete, advanced features remain for future enhancement

**Recent Changes**:
- ✅ **Export/Import Functionality Removed**: Simplified system per user requirements
- ✅ **POI Integration Foundation Complete**: Full POI-Item linking system operational
- ✅ **CRUD Operations Complete**: Create, read, update, delete functionality operational
- ✅ **Dynamic Form System Complete**: Field generation based on Phase 2 definitions

## **📋 PHASE OVERVIEW**
**Duration**: 5-6 weeks  
**Effort**: 200-240 hours  
**Priority**: High  
**Dependencies**: Phase 2 Complete

**Purpose**: Build the main user-facing interface for the Items & Schematics system. This includes the primary navigation page, hierarchical browsing, dynamic form generation, search/filtering systems, and comprehensive CRUD interfaces. This phase creates the core user experience that community members will interact with daily.

---

## **🎨 STEP 1: MAIN PAGE ARCHITECTURE (Week 1)**

### **Step 1.1: Items & Schematics Layout Component** ⏱️ 8-10 hours
**Purpose**: Create the main layout framework for the Items & Schematics page

**Technical Implementation**:
**File**: `src/pages/ItemsSchematicsPage.tsx`
```typescript
const ItemsSchematicsPage: React.FC = () => {
  const [activeView, setActiveView] = useState<'items' | 'schematics'>('items');
  const [viewMode, setViewMode] = useState<'tree' | 'grid' | 'list'>('tree');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<ItemSchematicFilters>({});

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header with Navigation */}
      <ItemsSchematicsHeader
        activeView={activeView}
        onViewChange={setActiveView}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Left Sidebar - Categories & Filters */}
        <div className="w-80 border-r border-slate-200 bg-white">
          <CategoryHierarchyNav
            activeView={activeView}
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
            filters={filters}
            onFiltersChange={setFilters}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden">
          <ItemsSchematicsContent
            activeView={activeView}
            viewMode={viewMode}
            selectedCategory={selectedCategory}
            searchTerm={searchTerm}
            filters={filters}
          />
        </div>

        {/* Right Sidebar - Details Panel */}
        <div className="w-96 border-l border-slate-200 bg-white">
          <DetailsPanel
            activeView={activeView}
            selectedItem={selectedItem}
          />
        </div>
      </div>
    </div>
  );
};
```

**Features Required**:
- Three-panel layout with responsive design
- View toggle between items and schematics
- Display mode switching (tree, grid, list)
- Integrated search and filtering
- Collapsible sidebars for focus mode

### **Step 1.2: Header Component with Navigation** ⏱️ 6-8 hours
**Purpose**: Create the main navigation header with view controls and search

**Technical Implementation**:
**File**: `src/components/items-schematics/ItemsSchematicsHeader.tsx`
```typescript
const ItemsSchematicsHeader: React.FC<ItemsSchematicsHeaderProps> = ({
  activeView,
  onViewChange,
  viewMode,
  onViewModeChange,
  searchTerm,
  onSearchChange
}) => {
  const { user } = useAuth();
  const permissions = useItemsSchematicsPermissions(user);

  return (
    <div className="h-16 bg-white border-b border-slate-200 px-6">
      <div className="flex items-center justify-between h-full">
        {/* Left Side - View Toggle */}
        <div className="flex items-center space-x-6">
          <h1 className="text-xl font-bold text-slate-900">
            Items & Schematics
          </h1>
          
          <div className="flex bg-slate-100 rounded-lg p-1">
            <ViewToggleButton
              active={activeView === 'items'}
              onClick={() => onViewChange('items')}
              icon={Package}
            >
              Items ({itemCount})
            </ViewToggleButton>
            <ViewToggleButton
              active={activeView === 'schematics'}
              onClick={() => onViewChange('schematics')}
              icon={FileText}
            >
              Schematics ({schematicCount})
            </ViewToggleButton>
          </div>
        </div>

        {/* Center - Search */}
        <div className="flex-1 max-w-md mx-8">
          <SearchInput
            value={searchTerm}
            onChange={onSearchChange}
            placeholder={`Search ${activeView}...`}
            icon={Search}
          />
        </div>

        {/* Right Side - View Mode & Actions */}
        <div className="flex items-center space-x-4">
          <ViewModeSelector
            mode={viewMode}
            onModeChange={onViewModeChange}
            options={['tree', 'grid', 'list']}
          />
          
          {permissions.canCreate && (
            <CreateButton
              activeView={activeView}
              onClick={handleCreateNew}
            />
          )}
          
          <SettingsButton onClick={openSettings} />
        </div>
      </div>
    </div>
  );
};
```

**Features Required**:
- Items/Schematics view toggle with counts
- Integrated search with type-ahead suggestions
- View mode selector (tree/grid/list)
- Permission-based create button
- Settings access for preferences

---

## **🌳 STEP 2: HIERARCHICAL NAVIGATION SYSTEM (Week 1-2)**

### **Step 2.1: Category Hierarchy Component** ⏱️ 10-12 hours
**Purpose**: Create the left sidebar hierarchical navigation system

**Technical Implementation**:
**File**: `src/components/items-schematics/CategoryHierarchyNav.tsx`
```typescript
const CategoryHierarchyNav: React.FC<CategoryHierarchyNavProps> = ({
  activeView,
  selectedCategory,
  onCategorySelect,
  filters,
  onFiltersChange
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [categories] = useCategories(activeView);
  const [showFilters, setShowFilters] = useState(true);

  return (
    <div className="h-full flex flex-col">
      {/* Navigation Header */}
      <div className="p-4 border-b border-slate-200">
        <h3 className="font-semibold text-slate-900">Categories</h3>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          {showFilters ? 'Hide' : 'Show'} Filters
        </button>
      </div>

      {/* Category Tree */}
      <div className="flex-1 overflow-y-auto p-4">
        <CategoryTree
          categories={categories}
          selectedCategory={selectedCategory}
          onCategorySelect={onCategorySelect}
          expandedCategories={expandedCategories}
          onToggleExpanded={(categoryId) => {
            const newExpanded = new Set(expandedCategories);
            if (newExpanded.has(categoryId)) {
              newExpanded.delete(categoryId);
            } else {
              newExpanded.add(categoryId);
            }
            setExpandedCategories(newExpanded);
          }}
        />
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="border-t border-slate-200 p-4">
          <AdvancedFilters
            activeView={activeView}
            filters={filters}
            onFiltersChange={onFiltersChange}
          />
        </div>
      )}
    </div>
  );
};

const CategoryTree: React.FC<CategoryTreeProps> = ({
  categories,
  selectedCategory,
  onCategorySelect,
  expandedCategories,
  onToggleExpanded
}) => {
  return (
    <div className="space-y-1">
      {categories.map(category => (
        <CategoryTreeNode
          key={category.id}
          category={category}
          selected={selectedCategory?.id === category.id}
          expanded={expandedCategories.has(category.id)}
          onSelect={onCategorySelect}
          onToggleExpanded={onToggleExpanded}
        />
      ))}
    </div>
  );
};
```

**Features Required**:
- Expandable/collapsible category tree
- Visual indicators for item/schematic counts
- Drag-and-drop for organization (if permitted)
- Context menus for admin functions
- Keyboard navigation support

### **Step 2.2: Advanced Filtering System** ⏱️ 8-10 hours
**Purpose**: Create comprehensive filtering controls for items and schematics

**Technical Implementation**:
**File**: `src/components/items-schematics/AdvancedFilters.tsx`
```typescript
const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  activeView,
  filters,
  onFiltersChange
}) => {
  const [tiers] = useTiers();
  const [creators] = useCreators();
  const [fieldDefinitions] = useFieldDefinitions();

  const updateFilter = (key: string, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-slate-900">Filters</h4>

      {/* Tier Filter */}
      <FilterSection title="Tier">
        <TierSelector
          selectedTiers={filters.tiers || []}
          onSelectionChange={(tiers) => updateFilter('tiers', tiers)}
          tiers={tiers}
        />
      </FilterSection>

      {/* Creator Filter */}
      <FilterSection title="Created By">
        <CreatorSelector
          selectedCreators={filters.creators || []}
          onSelectionChange={(creators) => updateFilter('creators', creators)}
          creators={creators}
        />
      </FilterSection>

      {/* Date Range Filter */}
      <FilterSection title="Date Range">
        <DateRangeSelector
          startDate={filters.startDate}
          endDate={filters.endDate}
          onDateChange={(start, end) => {
            updateFilter('startDate', start);
            updateFilter('endDate', end);
          }}
        />
      </FilterSection>

      {/* Dynamic Field Filters */}
      {fieldDefinitions
        .filter(field => field.filterable)
        .map(field => (
          <FilterSection key={field.id} title={field.display_name}>
            <DynamicFieldFilter
              field={field}
              value={filters.dynamicFields?.[field.name]}
              onChange={(value) => updateFilter(`dynamicFields.${field.name}`, value)}
            />
          </FilterSection>
        ))}

      {/* Filter Actions */}
      <div className="pt-4 border-t border-slate-200">
        <button
          onClick={() => onFiltersChange({})}
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          Clear All Filters
        </button>
      </div>
    </div>
  );
};
```

---

## **📋 STEP 3: DYNAMIC FORM SYSTEM (Week 2-3)**

### **Step 3.1: Item/Schematic Creation Modal** ⏱️ 12-15 hours
**Purpose**: Create comprehensive forms for adding new items and schematics

**Technical Implementation**:
**File**: `src/components/items-schematics/CreateItemSchematicModal.tsx`
```typescript
const CreateItemSchematicModal: React.FC<CreateModalProps> = ({
  isOpen,
  entityType,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState<CreateFormData>({});
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedType, setSelectedType] = useState<Type | null>(null);
  const [resolvedFields, setResolvedFields] = useState<ResolvedField[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  // Resolve fields when category/type changes
  useEffect(() => {
    if (selectedCategory) {
      FieldInheritanceResolver
        .resolveFieldsForEntity(entityType, selectedCategory.id, selectedType?.id)
        .then(setResolvedFields);
    }
  }, [selectedCategory, selectedType, entityType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate form data
      const validation = await validateEntityData(formData, resolvedFields);
      if (!validation.valid) {
        setValidationErrors(validation.errors);
        return;
      }

      // Create entity
      const newEntity = await createEntity(entityType, {
        ...formData,
        category_id: selectedCategory!.id,
        type_id: selectedType?.id,
        field_values: extractFieldValues(formData, resolvedFields)
      });

      onSuccess(newEntity);
      onClose();
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="large">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="border-b border-slate-200 pb-4">
          <h2 className="text-xl font-bold">
            Create New {entityType === 'item' ? 'Item' : 'Schematic'}
          </h2>
        </div>

        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-900">Basic Information</h3>
          
          <FormField
            label="Name"
            required
            error={validationErrors.name}
          >
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="form-input"
            />
          </FormField>

          <FormField label="Description">
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="form-textarea"
              rows={3}
            />
          </FormField>
        </div>

        {/* Hierarchy Selection */}
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-900">Classification</h3>
          
          <HierarchySelector
            entityType={entityType}
            selectedCategory={selectedCategory}
            selectedType={selectedType}
            onCategoryChange={setSelectedCategory}
            onTypeChange={setSelectedType}
          />
        </div>

        {/* Dynamic Fields */}
        {selectedCategory && (
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900">Properties</h3>
            
            <DynamicFieldsRenderer
              fields={resolvedFields}
              values={formData}
              onChange={setFormData}
              errors={validationErrors}
            />
          </div>
        )}

        {/* Icon Selection */}
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-900">Icon</h3>
          
          <IconSelector
            selectedIcon={formData.icon_url}
            onIconSelect={(iconUrl) => setFormData({ ...formData, icon_url: iconUrl })}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!selectedCategory}
          >
            Create {entityType === 'item' ? 'Item' : 'Schematic'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
```

### **Step 3.2: Dynamic Fields Renderer** ⏱️ 10-12 hours
**Purpose**: Create a system for rendering forms based on inherited field definitions

**Technical Implementation**:
**File**: `src/components/items-schematics/DynamicFieldsRenderer.tsx`
```typescript
const DynamicFieldsRenderer: React.FC<DynamicFieldsRendererProps> = ({
  fields,
  values,
  onChange,
  errors,
  readonly = false
}) => {
  const updateFieldValue = (fieldName: string, value: any) => {
    onChange({
      ...values,
      [fieldName]: value
    });
  };

  const renderField = (field: ResolvedField) => {
    const fieldValue = values[field.name];
    const fieldError = errors[field.name];

    switch (field.field_type) {
      case 'text':
        return (
          <TextFieldRenderer
            field={field}
            value={fieldValue}
            onChange={(value) => updateFieldValue(field.name, value)}
            error={fieldError}
            readonly={readonly}
          />
        );

      case 'number':
        return (
          <NumberFieldRenderer
            field={field}
            value={fieldValue}
            onChange={(value) => updateFieldValue(field.name, value)}
            error={fieldError}
            readonly={readonly}
          />
        );

      case 'dropdown':
        return (
          <DropdownFieldRenderer
            field={field}
            value={fieldValue}
            onChange={(value) => updateFieldValue(field.name, value)}
            error={fieldError}
            readonly={readonly}
          />
        );

      default:
        return null;
    }
  };

  // Group fields by their inheritance source for better UX
  const fieldGroups = groupFieldsBySource(fields);

  return (
    <div className="space-y-6">
      {fieldGroups.map(group => (
        <FieldGroup
          key={group.source}
          title={group.title}
          description={group.description}
          fields={group.fields}
          renderField={renderField}
        />
      ))}
    </div>
  );
};

const TextFieldRenderer: React.FC<FieldRendererProps> = ({
  field,
  value,
  onChange,
  error,
  readonly
}) => {
  return (
    <FormField
      label={field.display_name}
      required={field.is_required}
      error={error}
      description={field.description}
    >
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className={`form-input ${error ? 'border-red-500' : ''}`}
        disabled={readonly}
        placeholder={field.placeholder}
      />
    </FormField>
  );
};

const DropdownFieldRenderer: React.FC<FieldRendererProps> = ({
  field,
  value,
  onChange,
  error,
  readonly
}) => {
  const [options] = useDropdownOptions(field.dropdown_group_id);

  return (
    <FormField
      label={field.display_name}
      required={field.is_required}
      error={error}
      description={field.description}
    >
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className={`form-select ${error ? 'border-red-500' : ''}`}
        disabled={readonly}
      >
        <option value="">Select {field.display_name}</option>
        {options
          .filter(opt => opt.is_active)
          .sort((a, b) => a.sort_order - b.sort_order)
          .map(option => (
            <option key={option.value} value={option.value}>
              {option.display_text}
            </option>
          ))}
      </select>
    </FormField>
  );
};
```

---

## **📊 STEP 4: CONTENT DISPLAY SYSTEMS (Week 3-4)**

### **Step 4.1: Grid/List View Components** ⏱️ 8-10 hours
**Purpose**: Create different view modes for browsing items and schematics

**Technical Implementation**:
**File**: `src/components/items-schematics/ItemsSchematicsContent.tsx`
```typescript
const ItemsSchematicsContent: React.FC<ContentProps> = ({
  activeView,
  viewMode,
  selectedCategory,
  searchTerm,
  filters
}) => {
  const [items, loading, error] = useFilteredEntities(
    activeView,
    selectedCategory,
    searchTerm,
    filters
  );

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  switch (viewMode) {
    case 'tree':
      return (
        <TreeView
          entities={items}
          activeView={activeView}
          selectedCategory={selectedCategory}
        />
      );

    case 'grid':
      return (
        <GridView
          entities={items}
          activeView={activeView}
        />
      );

    case 'list':
      return (
        <ListView
          entities={items}
          activeView={activeView}
        />
      );

    default:
      return null;
  }
};

const GridView: React.FC<ViewProps> = ({ entities, activeView }) => {
  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {entities.map(entity => (
          <EntityCard
            key={entity.id}
            entity={entity}
            type={activeView}
            onClick={handleEntityClick}
            onEdit={handleEntityEdit}
            onDelete={handleEntityDelete}
          />
        ))}
      </div>
    </div>
  );
};

const EntityCard: React.FC<EntityCardProps> = ({
  entity,
  type,
  onClick,
  onEdit,
  onDelete
}) => {
  const permissions = useEntityPermissions(entity);

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow">
      {/* Entity Icon */}
      <div className="flex items-center justify-center h-16 mb-3">
        <EntityIcon
          iconUrl={entity.icon_url}
          entityType={type}
          size="large"
        />
      </div>

      {/* Entity Info */}
      <div className="text-center mb-3">
        <h3 className="font-semibold text-slate-900 truncate">
          {entity.name}
        </h3>
        <p className="text-sm text-slate-500 truncate">
          {entity.category?.name} {entity.type ? `• ${entity.type.name}` : ''}
        </p>
        {entity.tier && (
          <div className="mt-1">
            <TierBadge tier={entity.tier} size="small" />
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex justify-center space-x-2">
        <IconButton
          icon={Eye}
          onClick={() => onClick(entity)}
          title="View Details"
        />
        {permissions.canEdit && (
          <IconButton
            icon={Edit}
            onClick={() => onEdit(entity)}
            title="Edit"
          />
        )}
        {permissions.canDelete && (
          <IconButton
            icon={Trash}
            onClick={() => onDelete(entity)}
            title="Delete"
            variant="danger"
          />
        )}
      </div>
    </div>
  );
};
```

### **Step 4.2: Tree View Component** ⏱️ 10-12 hours
**Purpose**: Create hierarchical tree view for browsing by category structure

**Technical Implementation**:
**File**: `src/components/items-schematics/TreeView.tsx`
```typescript
const TreeView: React.FC<TreeViewProps> = ({
  entities,
  activeView,
  selectedCategory
}) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const treeData = buildTreeStructure(entities, selectedCategory);

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg border border-slate-200">
        <TreeNode
          node={treeData}
          expanded={expandedNodes}
          onToggle={toggleNode}
          level={0}
        />
      </div>
    </div>
  );
};

const TreeNode: React.FC<TreeNodeProps> = ({
  node,
  expanded,
  onToggle,
  level
}) => {
  const isExpanded = expanded.has(node.id);
  const hasChildren = node.children.length > 0;

  return (
    <div>
      {/* Node Header */}
      <div
        className={`flex items-center p-3 hover:bg-slate-50 cursor-pointer`}
        style={{ paddingLeft: `${level * 1.5 + 0.75}rem` }}
        onClick={() => hasChildren && onToggle(node.id)}
      >
        {/* Expand/Collapse Icon */}
        <div className="w-4 h-4 mr-2 flex items-center justify-center">
          {hasChildren && (
            <ChevronRight
              className={`w-3 h-3 text-slate-400 transition-transform ${
                isExpanded ? 'rotate-90' : ''
              }`}
            />
          )}
        </div>

        {/* Node Icon */}
        <div className="w-6 h-6 mr-3 flex items-center justify-center">
          <NodeIcon node={node} />
        </div>

        {/* Node Label */}
        <div className="flex-1">
          <span className="font-medium text-slate-900">{node.name}</span>
          <span className="ml-2 text-sm text-slate-500">
            ({node.entityCount})
          </span>
        </div>

        {/* Node Actions */}
        {node.type === 'entity' && (
          <EntityActions entity={node.entity} />
        )}
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {node.children.map(child => (
            <TreeNode
              key={child.id}
              node={child}
              expanded={expanded}
              onToggle={onToggle}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};
```

---

## **🔍 STEP 5: SEARCH & FILTERING ENGINE (Week 4-5)**

### **Step 5.1: Advanced Search System** ⏱️ 8-10 hours
**Purpose**: Create powerful search functionality with type-ahead and filtering

**Note**: Export/Import functionality has been removed from the system per user requirements to simplify the interface and focus on core functionality.

**Technical Implementation**:
**File**: `src/lib/search/entity-search.ts`
```typescript
export class EntitySearchEngine {
  static async searchEntities(
    query: string,
    entityType: 'items' | 'schematics',
    filters: SearchFilters = {},
    options: SearchOptions = {}
  ): Promise<SearchResults> {
    const {
      categories,
      types,
      tiers,
      creators,
      dateRange,
      dynamicFields
    } = filters;

    const {
      limit = 50,
      offset = 0,
      sortBy = 'relevance',
      sortDirection = 'desc'
    } = options;

    // Build complex query with full-text search
    let queryBuilder = supabase
      .from(entityType)
      .select(`
        *,
        category:categories(id, name, icon),
        type:types(id, name),
        subtype:subtypes(id, name),
        tier:tiers(id, name, level, color),
        creator:profiles!created_by(id, username, avatar_url)
      `);

    // Apply text search
    if (query.trim()) {
      queryBuilder = queryBuilder.or(`
        name.ilike.%${query}%,
        description.ilike.%${query}%,
        field_values->>name.ilike.%${query}%
      `);
    }

    // Apply filters
    if (categories?.length) {
      queryBuilder = queryBuilder.in('category_id', categories);
    }

    if (types?.length) {
      queryBuilder = queryBuilder.in('type_id', types);
    }

    if (tiers?.length) {
      queryBuilder = queryBuilder.in('tier_id', tiers);
    }

    if (creators?.length) {
      queryBuilder = queryBuilder.in('created_by', creators);
    }

    if (dateRange?.start) {
      queryBuilder = queryBuilder.gte('created_at', dateRange.start);
    }

    if (dateRange?.end) {
      queryBuilder = queryBuilder.lte('created_at', dateRange.end);
    }

    // Apply dynamic field filters
    if (dynamicFields) {
      Object.entries(dynamicFields).forEach(([fieldName, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          queryBuilder = queryBuilder.eq(`field_values->>>${fieldName}`, value);
        }
      });
    }

    // Apply sorting
    switch (sortBy) {
      case 'name':
        queryBuilder = queryBuilder.order('name', { ascending: sortDirection === 'asc' });
        break;
      case 'created_at':
        queryBuilder = queryBuilder.order('created_at', { ascending: sortDirection === 'asc' });
        break;
      case 'tier':
        queryBuilder = queryBuilder.order('tier.level', { ascending: sortDirection === 'asc' });
        break;
      default:
        // Relevance-based sorting would require additional ranking logic
        queryBuilder = queryBuilder.order('updated_at', { ascending: false });
    }

    // Apply pagination
    queryBuilder = queryBuilder.range(offset, offset + limit - 1);

    const { data, error, count } = await queryBuilder;

    if (error) throw error;

    return {
      entities: data || [],
      totalCount: count || 0,
      hasMore: (count || 0) > offset + limit
    };
  }

  static async getSearchSuggestions(
    query: string,
    entityType: 'items' | 'schematics'
  ): Promise<SearchSuggestion[]> {
    if (query.length < 2) return [];

    const { data } = await supabase
      .from(entityType)
      .select('name, category:categories(name)')
      .ilike('name', `${query}%`)
      .limit(10);

    return (data || []).map(item => ({
      text: item.name,
      category: item.category?.name,
      type: 'entity'
    }));
  }
}
```

### **Step 5.2: Filter Persistence System** ⏱️ 4-6 hours
**Purpose**: Save and restore user filter preferences

**Technical Implementation**:
**File**: `src/hooks/useFilterPersistence.ts`
```typescript
export const useFilterPersistence = (entityType: 'items' | 'schematics') => {
  const { user } = useAuth();
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);

  const saveFilterPreset = async (name: string, filters: SearchFilters) => {
    const preset: SavedFilter = {
      id: crypto.randomUUID(),
      name,
      filters,
      entity_type: entityType,
      user_id: user?.id,
      created_at: new Date().toISOString()
    };

    // Save to local storage and optionally to database
    const existing = JSON.parse(localStorage.getItem('filter-presets') || '[]');
    const updated = [...existing, preset];
    localStorage.setItem('filter-presets', JSON.stringify(updated));
    
    setSavedFilters(updated.filter(f => f.entity_type === entityType));
  };

  const loadFilterPreset = (presetId: string): SearchFilters | null => {
    const preset = savedFilters.find(f => f.id === presetId);
    return preset?.filters || null;
  };

  const deleteFilterPreset = (presetId: string) => {
    const existing = JSON.parse(localStorage.getItem('filter-presets') || '[]');
    const updated = existing.filter((f: SavedFilter) => f.id !== presetId);
    localStorage.setItem('filter-presets', JSON.stringify(updated));
    setSavedFilters(updated.filter(f => f.entity_type === entityType));
  };

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('filter-presets') || '[]');
    setSavedFilters(stored.filter((f: SavedFilter) => f.entity_type === entityType));
  }, [entityType]);

  return {
    savedFilters,
    saveFilterPreset,
    loadFilterPreset,
    deleteFilterPreset
  };
};
```

---

## **✅ PHASE 3 COMPLETION CRITERIA**

### **User Interface Functionality** ✅ COMPLETE
- [x] Main page layout with three-panel design operational
- [x] Items/Schematics view toggle working smoothly
- [x] All view modes (tree, grid, list) implemented and functional
- [x] Search functionality with basic filtering working

### **Hierarchical Navigation** ✅ COMPLETE
- [x] Category tree navigation fully functional
- [x] Expand/collapse states persisted correctly
- [x] Category selection updates content properly
- [x] Visual indicators showing entity counts accurate

### **Dynamic Form System** ✅ COMPLETE
- [x] Item/Schematic creation modal working with validation
- [x] Dynamic fields rendering correctly based on inheritance
- [x] All field types (text, number, dropdown) functional
- [x] Form validation preventing invalid submissions

### **Content Display** ✅ COMPLETE
- [x] Grid view displaying entities with proper formatting
- [x] List view showing entities in organized rows
- [x] Tree view hierarchically organizing content
- [x] Entity cards showing all relevant information

### **Search & Filtering** ⏳ PARTIAL
- [x] Basic search and filtering operational
- [x] Real-time filtering updating results immediately
- [ ] Advanced search with type-ahead suggestions (Future enhancement)
- [ ] Filter presets saving and loading (Future enhancement)

### **CRUD Operations** ✅ COMPLETE
- [x] Create new items/schematics with dynamic forms
- [x] Edit existing entities with pre-populated forms
- [x] Delete entities with confirmation dialogs
- [x] Real-time UI updates after all operations

### **POI Integration Foundation** ✅ COMPLETE
- [x] POI-Item linking system operational
- [x] Professional linking modal with relationship types
- [x] Database schema and API layer complete
- [x] UI integration with Items & Schematics interface

---

## **🚀 HANDOFF TO PHASE 4**

**Deliverables for Phase 4**:
1. **Complete User Interface**: All main browsing and management interfaces operational
2. **Dynamic Forms**: Field inheritance system working with creation/editing
3. **Search System**: Advanced search and filtering fully functional
4. **View Management**: All view modes implemented with user preferences

**Phase 4 Dependencies Met**:
- POI integration can reference existing items/schematics
- User interfaces support POI association workflows
- All entity management workflows operational
- Permission system integrated throughout user interface 