# Phase 2: System Builder Tools - Detailed Implementation Guide

## **📋 PHASE OVERVIEW**
**Duration**: 3-4 weeks  
**Effort**: 120-160 hours  
**Priority**: High  
**Dependencies**: Phase 1 Complete

**Purpose**: Build comprehensive admin interfaces for managing the Items & Schematics system foundation. This includes category/type management, dynamic field definition tools, permission management UI, and advanced configuration features. System Builders will use these tools to configure the database structure that users interact with.

---

## **🏗️ STEP 1: ADMIN INTERFACE FOUNDATION (Week 1)**

### **Step 1.1: System Builder Layout Component** ⏱️ 6-8 hours
**Purpose**: Create the main layout for all System Builder interfaces

**Technical Implementation**:
**File**: `src/components/admin/SystemBuilderLayout.tsx`
```typescript
interface SystemBuilderLayoutProps {
  activeTab: 'categories' | 'types' | 'fields' | 'tiers' | 'defaults';
  onTabChange: (tab: string) => void;
  children: React.ReactNode;
}

const SystemBuilderLayout: React.FC<SystemBuilderLayoutProps> = ({
  activeTab,
  onTabChange,
  children
}) => {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-8 px-6">
          {tabs.map(tab => (
            <TabButton 
              key={tab.id}
              active={activeTab === tab.id}
              onClick={() => onTabChange(tab.id)}
              icon={tab.icon}
            >
              {tab.label}
            </TabButton>
          ))}
        </nav>
      </div>
      
      {/* Main Content Area */}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};
```

**Features Required**:
- Tab navigation between management sections
- Breadcrumb navigation for hierarchical editing
- Permission-based tab visibility
- Responsive design for admin workflows

### **Step 1.2: Category Management Interface** ⏱️ 8-10 hours
**Purpose**: Allow admins to create/edit/delete categories and manage their properties

**Technical Implementation**:
**File**: `src/components/admin/CategoryManager.tsx`
```typescript
const CategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className="space-y-6">
      {/* Category Creation */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Category Management</h2>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Category
        </button>
      </div>

      {/* Categories List */}
      <div className="grid gap-4">
        {categories.map(category => (
          <CategoryCard
            key={category.id}
            category={category}
            onEdit={setEditingCategory}
            onDelete={handleDeleteCategory}
          />
        ))}
      </div>

      {/* Create/Edit Modal */}
      <CategoryModal
        isOpen={showCreateModal || !!editingCategory}
        category={editingCategory}
        onClose={() => {
          setShowCreateModal(false);
          setEditingCategory(null);
        }}
        onSave={handleSaveCategory}
      />
    </div>
  );
};
```

**UI Components Required**:
- Category creation form with validation
- Inline editing for category properties
- Icon selection interface
- "Applies To" selector (items/schematics/both)
- Bulk operations for multiple categories

### **Step 1.3: Type and SubType Management** ⏱️ 10-12 hours
**Purpose**: Hierarchical management of types within categories

**Technical Implementation**:
**File**: `src/components/admin/TypeManager.tsx`
```typescript
const TypeManager: React.FC = () => {
  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Categories Sidebar */}
      <div className="space-y-2">
        <h3 className="font-semibold">Categories</h3>
        {categories.map(category => (
          <CategoryTreeItem
            key={category.id}
            category={category}
            selectedCategory={selectedCategory}
            onSelect={setSelectedCategory}
          />
        ))}
      </div>

      {/* Types Management */}
      <div className="col-span-2">
        <TypeHierarchyManager
          category={selectedCategory}
          onTypeCreate={handleCreateType}
          onTypeEdit={handleEditType}
          onSubTypeCreate={handleCreateSubType}
        />
      </div>
    </div>
  );
};
```

**Features Required**:
- Hierarchical tree view of categories → types → subtypes
- Drag-and-drop reordering
- Inline editing with validation
- Bulk operations and hierarchy restructuring
- Validation to prevent circular references

---

## **🔧 STEP 2: DYNAMIC FIELD SYSTEM (Week 2)**

### **Step 2.1: Field Definition Manager** ⏱️ 12-15 hours
**Purpose**: Interface for creating and managing dynamic field definitions with inheritance

**Technical Implementation**:
**File**: `src/components/admin/FieldDefinitionManager.tsx`
```typescript
const FieldDefinitionManager: React.FC = () => {
  const [selectedScope, setSelectedScope] = useState<FieldScope>('global');
  const [inheritancePreview, setInheritancePreview] = useState<FieldDefinition[]>([]);

  const handleCreateField = async (fieldData: CreateFieldData) => {
    // Validate field definition
    const validation = await validateFieldDefinition(fieldData);
    if (!validation.valid) {
      showErrors(validation.errors);
      return;
    }

    // Create field with inheritance check
    await createFieldDefinition(fieldData);
    refreshFieldDefinitions();
    updateInheritancePreview();
  };

  return (
    <div className="grid grid-cols-4 gap-6">
      {/* Scope Selection */}
      <div className="space-y-4">
        <ScopeSelector
          selected={selectedScope}
          onSelect={setSelectedScope}
        />
        
        {/* Hierarchical Scope Tree */}
        <ScopeHierarchy
          scope={selectedScope}
          onScopeChange={setSelectedScope}
        />
      </div>

      {/* Field Definitions */}
      <div className="col-span-2">
        <FieldDefinitionList
          scope={selectedScope}
          onEdit={handleEditField}
          onDelete={handleDeleteField}
          onReorder={handleReorderFields}
        />
        
        <CreateFieldForm
          scope={selectedScope}
          onSubmit={handleCreateField}
        />
      </div>

      {/* Inheritance Preview */}
      <div>
        <InheritancePreview
          scope={selectedScope}
          inheritedFields={inheritancePreview}
        />
      </div>
    </div>
  );
};
```

**Key Features**:
- Three-level scope management (Global → Category → Type)
- Real-time inheritance preview
- Field type selection (text, number, dropdown)
- Display order management with drag-and-drop
- Validation rules configuration
- Field versioning and migration warnings

### **Step 2.2: Dropdown Management System** ⏱️ 8-10 hours
**Purpose**: Manage dropdown groups and options for dropdown fields

**Technical Implementation**:
**File**: `src/components/admin/DropdownManager.tsx`
```typescript
const DropdownManager: React.FC = () => {
  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Dropdown Groups */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Dropdown Groups</h3>
        
        <DropdownGroupList
          groups={dropdownGroups}
          selectedGroup={selectedGroup}
          onSelect={setSelectedGroup}
          onEdit={handleEditGroup}
          onDelete={handleDeleteGroup}
        />
        
        <CreateDropdownGroupForm
          onSubmit={handleCreateGroup}
        />
      </div>

      {/* Options Management */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          Options for: {selectedGroup?.name}
        </h3>
        
        {selectedGroup && (
          <>
            <DropdownOptionsList
              groupId={selectedGroup.id}
              options={selectedGroup.options}
              onReorder={handleReorderOptions}
              onEdit={handleEditOption}
              onDelete={handleDeleteOption}
              onToggleActive={handleToggleOption}
            />
            
            <CreateOptionForm
              groupId={selectedGroup.id}
              onSubmit={handleCreateOption}
            />
          </>
        )}
      </div>
    </div>
  );
};
```

**Features Required**:
- Dropdown group CRUD operations
- Option management with sort ordering
- Active/inactive option toggles
- Bulk import/export of options
- Usage tracking (which fields use which groups)

### **Step 2.3: Field Inheritance Engine** ⏱️ 6-8 hours
**Purpose**: Core logic for resolving field inheritance chains

**Technical Implementation**:
**File**: `src/lib/field-inheritance.ts`
```typescript
export class FieldInheritanceResolver {
  static async resolveFieldsForEntity(
    entityType: 'item' | 'schematic',
    categoryId?: string,
    typeId?: string
  ): Promise<ResolvedField[]> {
    const fields: FieldDefinition[] = [];
    
    // 1. Get global fields
    const globalFields = await this.getGlobalFields();
    fields.push(...globalFields);
    
    // 2. Get category fields if category specified
    if (categoryId) {
      const categoryFields = await this.getCategoryFields(categoryId);
      fields.push(...categoryFields);
    }
    
    // 3. Get type fields if type specified
    if (typeId) {
      const typeFields = await this.getTypeFields(typeId);
      fields.push(...typeFields);
    }
    
    // 4. Resolve conflicts and merge
    return this.mergeAndResolveFields(fields);
  }

  private static mergeAndResolveFields(fields: FieldDefinition[]): ResolvedField[] {
    // Complex logic for:
    // - Removing duplicates (type overrides category overrides global)
    // - Sorting by display_order
    // - Validating field compatibility
    // - Resolving dropdown references
  }
}
```

---

## **👥 STEP 3: PERMISSION MANAGEMENT UI (Week 2-3)**

### **Step 3.1: User Permission Interface** ⏱️ 10-12 hours
**Purpose**: UI for granting/revoking granular permissions to users

**Technical Implementation**:
**File**: `src/components/admin/UserPermissionManager.tsx`
```typescript
const UserPermissionManager: React.FC = () => {
  const [users, setUsers] = useState<UserWithPermissions[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [permissionMatrix, setPermissionMatrix] = useState<PermissionMatrix>({});

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Users List */}
      <div className="space-y-4">
        <UserSearchAndFilter
          onUsersChange={setUsers}
          filters={userFilters}
        />
        
        <UserList
          users={users}
          selectedUser={selectedUser}
          onSelect={setSelectedUser}
        />
      </div>

      {/* Permission Matrix */}
      <div className="col-span-2">
        {selectedUser && (
          <PermissionMatrix
            user={selectedUser}
            permissions={permissionMatrix}
            onPermissionChange={handlePermissionChange}
            onBulkChange={handleBulkPermissionChange}
          />
        )}
      </div>
    </div>
  );
};

const PermissionMatrix: React.FC<PermissionMatrixProps> = ({
  user,
  permissions,
  onPermissionChange
}) => {
  return (
    <div className="space-y-6">
      {/* System Builder Role */}
      <PermissionSection title="System Administration">
        <PermissionCheckbox
          permission="system_builder"
          checked={permissions.system_builder}
          onChange={onPermissionChange}
          description="Access to manage categories, types, fields, and system configuration"
        />
      </PermissionSection>

      {/* Items Permissions */}
      <PermissionSection title="Items Management">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2">Own Items</h4>
            <PermissionCheckbox permission="add_own_items" ... />
            <PermissionCheckbox permission="edit_own_items" ... />
            <PermissionCheckbox permission="delete_own_items" ... />
          </div>
          <div>
            <h4 className="font-medium mb-2">All Items</h4>
            <PermissionCheckbox permission="add_all_items" ... />
            <PermissionCheckbox permission="edit_all_items" ... />
            <PermissionCheckbox permission="delete_all_items" ... />
          </div>
        </div>
      </PermissionSection>

      {/* Schematics Permissions - Similar structure */}
    </div>
  );
};
```

**Features Required**:
- User search and filtering
- Permission matrix with checkboxes
- Bulk permission operations
- Permission inheritance visualization
- Audit log of permission changes

### **Step 3.2: Role Management System** ⏱️ 6-8 hours
**Purpose**: Predefined role templates and "System Builder" role management

**Technical Implementation**:
**File**: `src/components/admin/RoleManager.tsx`
```typescript
const predefinedRoles = {
  'Items Contributor': {
    permissions: ['add_own_items', 'edit_own_items'],
    description: 'Can create and edit their own items'
  },
  'Items Moderator': {
    permissions: ['add_all_items', 'edit_all_items', 'delete_own_items'],
    description: 'Can manage all items but not system configuration'
  },
  'System Builder': {
    permissions: ['system_builder', 'add_all_items', 'edit_all_items'],
    description: 'Can configure system structure and manage content'
  }
};

const RoleManager: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Predefined Role Templates */}
      <RoleTemplates
        roles={predefinedRoles}
        onApplyRole={handleApplyRoleToUser}
      />
      
      {/* Custom Role Creation */}
      <CustomRoleCreator
        onCreateRole={handleCreateCustomRole}
      />
      
      {/* Role Assignment Interface */}
      <BulkRoleAssignment
        users={users}
        roles={availableRoles}
        onAssignRoles={handleBulkRoleAssignment}
      />
    </div>
  );
};
```

---

## **🎯 STEP 4: TIER MANAGEMENT SYSTEM (Week 3)**

### **Step 4.1: Tier Configuration Interface** ⏱️ 6-8 hours
**Purpose**: Manage tech levels with visual customization

**Technical Implementation**:
**File**: `src/components/admin/TierManager.tsx`
```typescript
const TierManager: React.FC = () => {
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [draggedTier, setDraggedTier] = useState<Tier | null>(null);

  return (
    <div className="space-y-6">
      {/* Tier Hierarchy */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Tier Hierarchy</h3>
        
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="tiers">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {tiers
                  .sort((a, b) => a.level - b.level)
                  .map((tier, index) => (
                    <TierItem
                      key={tier.id}
                      tier={tier}
                      index={index}
                      onEdit={handleEditTier}
                      onDelete={handleDeleteTier}
                    />
                  ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {/* Tier Creation */}
      <TierCreationForm
        existingTiers={tiers}
        onSubmit={handleCreateTier}
      />

      {/* Tier Preview */}
      <TierPreview
        tiers={tiers}
        showUsageStats={true}
      />
    </div>
  );
};
```

**Features Required**:
- Drag-and-drop tier reordering
- Color picker for tier visualization
- Level validation (no gaps, no duplicates)
- Usage statistics (how many items use each tier)
- Tier migration tools when levels change

---

## **🔗 STEP 5: DEFAULT ASSIGNMENT SYSTEM (Week 3-4)**

### **Step 5.1: POI Type Default Rules** ⏱️ 8-10 hours
**Purpose**: Configure which items/schematics are automatically assigned to POI types

**Technical Implementation**:
**File**: `src/components/admin/DefaultAssignmentManager.tsx`
```typescript
const DefaultAssignmentManager: React.FC = () => {
  const [selectedPoiType, setSelectedPoiType] = useState<PoiType | null>(null);
  const [defaultItems, setDefaultItems] = useState<DefaultAssignment[]>([]);
  const [defaultSchematics, setDefaultSchematics] = useState<DefaultAssignment[]>([]);

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* POI Type Selection */}
      <div>
        <PoiTypeSelector
          poiTypes={poiTypes}
          selectedType={selectedPoiType}
          onSelect={setSelectedPoiType}
        />
      </div>

      {/* Default Items */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Default Items</h3>
        
        <DefaultItemsList
          poiTypeId={selectedPoiType?.id}
          assignments={defaultItems}
          onAdd={handleAddDefaultItem}
          onRemove={handleRemoveDefaultItem}
          onUpdateQuantity={handleUpdateQuantity}
        />
        
        <ItemSelector
          excludeAssigned={defaultItems.map(a => a.item_id)}
          onSelect={handleAddDefaultItem}
        />
      </div>

      {/* Default Schematics */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Default Schematics</h3>
        
        <DefaultSchematicsList
          poiTypeId={selectedPoiType?.id}
          assignments={defaultSchematics}
          onAdd={handleAddDefaultSchematic}
          onRemove={handleRemoveDefaultSchematic}
        />
        
        <SchematicSelector
          excludeAssigned={defaultSchematics.map(a => a.schematic_id)}
          onSelect={handleAddDefaultSchematic}
        />
      </div>
    </div>
  );
};
```

### **Step 5.2: Retroactive Application System** ⏱️ 6-8 hours
**Purpose**: Apply default rule changes to existing POIs with user confirmation

**Technical Implementation**:
**File**: `src/components/admin/RetroactiveUpdater.tsx`
```typescript
const RetroactiveUpdater: React.FC<RetroactiveUpdaterProps> = ({
  changedRules,
  onApply,
  onCancel
}) => {
  const [affectedPois, setAffectedPois] = useState<PoiUpdatePreview[]>([]);
  const [updateStrategy, setUpdateStrategy] = useState<UpdateStrategy>('add_only');

  useEffect(() => {
    // Calculate what POIs would be affected
    calculateAffectedPois(changedRules).then(setAffectedPois);
  }, [changedRules]);

  return (
    <div className="space-y-6">
      {/* Update Strategy Selection */}
      <UpdateStrategySelector
        strategy={updateStrategy}
        onStrategyChange={setUpdateStrategy}
        options={[
          { value: 'add_only', label: 'Add new defaults only' },
          { value: 'remove_obsolete', label: 'Remove obsolete defaults' },
          { value: 'full_sync', label: 'Full synchronization' }
        ]}
      />

      {/* Impact Preview */}
      <ImpactPreview
        affectedPois={affectedPois}
        strategy={updateStrategy}
      />

      {/* Confirmation */}
      <ConfirmationPanel
        changesCount={affectedPois.length}
        onConfirm={() => onApply(updateStrategy)}
        onCancel={onCancel}
      />
    </div>
  );
};
```

---

## **✅ PHASE 2 COMPLETION CRITERIA**

### **Admin Interface Functionality**
- [ ] Category management with full CRUD operations
- [ ] Type/SubType hierarchical management
- [ ] Drag-and-drop reordering working smoothly
- [ ] Icon selection integrated with existing system

### **Dynamic Field System**
- [ ] Field definitions created with inheritance preview
- [ ] Dropdown management fully operational
- [ ] Field inheritance engine resolving correctly
- [ ] Validation preventing invalid configurations

### **Permission Management**
- [ ] User permission matrix functional
- [ ] Role templates and custom roles working
- [ ] System Builder role properly restricts access
- [ ] Permission changes logged and auditable

### **Configuration Systems**
- [ ] Tier management with level validation
- [ ] Default assignment rules configurable
- [ ] Retroactive updates working safely
- [ ] All changes properly validated before application

---

## **🚀 HANDOFF TO PHASE 3**

**Deliverables for Phase 3**:
1. **Complete Admin Interface**: All configuration tools operational
2. **Field System**: Dynamic fields configurable and inheritance working
3. **Permission Framework**: All access controls operational
4. **Configuration Database**: Tiers, categories, types, fields all manageable

**Phase 3 Dependencies Met**:
- Items & Schematics creation can use configured fields
- User interfaces can respect permission settings
- Dynamic forms can be generated from field definitions
- All entity types and hierarchies available for user interfaces 