# Items & Schematics System - Technical Specification

## 🎯 **System Overview**

The Items & Schematics system is a comprehensive extension to the Dune Awakening Deep Desert Tracker that transforms the platform from a simple POI tracker into a sophisticated game database management system. This system enables users to create, manage, and organize detailed item and schematic databases with flexible categorization, dynamic field definitions, and seamless POI integration.

## 🏗️ **Database Architecture**

### **Core Entity Tables**

#### **Tiers Management (Tech Levels)**
```sql
CREATE TABLE tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE, -- "Makeshift", "Copper", "Iron"
  level integer NOT NULL UNIQUE, -- For ordering (1, 2, 3...)
  color text, -- Hex color for UI display
  description text,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS Policies
-- Public read, admin/system_builder write
```

#### **Categories (Shared Between Items & Schematics)**
```sql
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  icon text, -- Icon identifier or URL
  applies_to text[] DEFAULT ARRAY['items', 'schematics'], -- ['items'], ['schematics'], or both
  description text,
  created_by uuid REFERENCES profiles(id),
  is_global boolean DEFAULT false, -- Global vs user-created
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Validation: name must be unique within applies_to scope
  UNIQUE(name, applies_to)
);
```

#### **Types (Within Categories)**
```sql
CREATE TABLE types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  description text,
  created_by uuid REFERENCES profiles(id),
  is_global boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Validation: name must be unique within category
  UNIQUE(name, category_id)
);
```

#### **SubTypes (Optional Within Types)**
```sql
CREATE TABLE subtypes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type_id uuid NOT NULL REFERENCES types(id) ON DELETE CASCADE,
  description text,
  created_by uuid REFERENCES profiles(id),
  is_global boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Validation: name must be unique within type
  UNIQUE(name, type_id)
);
```

### **Dynamic Field System**

#### **Field Definitions (Inheritance-Based)**
```sql
CREATE TABLE field_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL, -- Internal name: "weapon_damage"
  display_name text NOT NULL, -- User-facing: "Weapon Damage"
  field_type text NOT NULL CHECK (field_type IN ('text', 'number', 'dropdown')),
  
  -- Scope definition (flexible inheritance)
  scope_type text NOT NULL CHECK (scope_type IN ('global', 'category', 'type')),
  scope_id uuid, -- NULL for global, category_id for category, type_id for type
  
  -- Field properties
  is_required boolean DEFAULT false,
  default_visible boolean DEFAULT true,
  display_order integer DEFAULT 0, -- For UI ordering (lower = higher priority)
  
  -- Dropdown configuration
  dropdown_group_id uuid REFERENCES dropdown_groups(id),
  
  -- Validation rules
  validation_rules jsonb DEFAULT '{}', -- {"min_length": 3, "max_value": 100}
  
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraints
  UNIQUE(name, scope_type, scope_id),
  CHECK (
    (scope_type = 'global' AND scope_id IS NULL) OR
    (scope_type IN ('category', 'type') AND scope_id IS NOT NULL)
  ),
  CHECK (
    (field_type = 'dropdown' AND dropdown_group_id IS NOT NULL) OR
    (field_type != 'dropdown' AND dropdown_group_id IS NULL)
  )
);
```

#### **Dropdown System**
```sql
CREATE TABLE dropdown_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE, -- "Weapon Types"
  description text,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE dropdown_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES dropdown_groups(id) ON DELETE CASCADE,
  value text NOT NULL, -- "sidearm" (internal value)
  display_text text NOT NULL, -- "Sidearm" (user-facing)
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  
  UNIQUE(group_id, value)
);
```

### **Core Items & Schematics Tables**

#### **Items**
```sql
CREATE TABLE items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  
  -- Hierarchical references (category required, others optional)
  category_id uuid NOT NULL REFERENCES categories(id),
  type_id uuid REFERENCES types(id),
  subtype_id uuid REFERENCES subtypes(id),
  tier_id uuid REFERENCES tiers(id),
  
  -- Icon system integration
  icon_url text, -- Custom icon or from shared pool
  
  -- Dynamic field values
  field_values jsonb DEFAULT '{}', -- {"weapon_damage": 15, "weapon_type": "sidearm"}
  
  -- Metadata
  created_by uuid REFERENCES profiles(id),
  is_global boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Validation constraints
  CHECK (category_id IS NOT NULL), -- Category is required
  CHECK (
    (type_id IS NULL AND subtype_id IS NULL) OR
    (type_id IS NOT NULL) -- If subtype exists, type must exist
  )
);

-- Case-insensitive unique name constraint
CREATE UNIQUE INDEX items_name_unique ON items (LOWER(name));
```

#### **Schematics**
```sql
CREATE TABLE schematics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  
  -- Hierarchical references (same structure as items)
  category_id uuid NOT NULL REFERENCES categories(id),
  type_id uuid REFERENCES types(id),
  subtype_id uuid REFERENCES subtypes(id),
  tier_id uuid REFERENCES tiers(id),
  
  -- Icon system integration
  icon_url text,
  
  -- Dynamic field values
  field_values jsonb DEFAULT '{}',
  
  -- Metadata
  created_by uuid REFERENCES profiles(id),
  is_global boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Same validation constraints as items
  CHECK (category_id IS NOT NULL),
  CHECK (
    (type_id IS NULL AND subtype_id IS NULL) OR
    (type_id IS NOT NULL)
  )
);

-- Case-insensitive unique name constraint
CREATE UNIQUE INDEX schematics_name_unique ON schematics (LOWER(name));
```

### **Screenshot System**

#### **Item Screenshots**
```sql
CREATE TABLE item_screenshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  url text NOT NULL,
  original_url text, -- For crop functionality
  crop_details jsonb, -- Crop information from react-image-crop
  uploaded_by uuid REFERENCES profiles(id),
  upload_date timestamptz DEFAULT now(),
  sort_order integer DEFAULT 0,
  file_size integer,
  file_name text
);

CREATE TABLE schematic_screenshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  schematic_id uuid NOT NULL REFERENCES schematics(id) ON DELETE CASCADE,
  url text NOT NULL,
  original_url text,
  crop_details jsonb,
  uploaded_by uuid REFERENCES profiles(id),
  upload_date timestamptz DEFAULT now(),
  sort_order integer DEFAULT 0,
  file_size integer,
  file_name text
);
```

### **POI Integration System**

#### **POI-Item Relationships**
```sql
CREATE TABLE poi_items (
  poi_id uuid NOT NULL REFERENCES pois(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  quantity integer DEFAULT 1,
  notes text,
  assignment_source text NOT NULL CHECK (assignment_source IN ('default', 'manual')),
  assigned_by_rule_id uuid REFERENCES poi_type_default_items(id), -- For tracking default rules
  added_by uuid REFERENCES profiles(id),
  added_at timestamptz DEFAULT now(),
  
  PRIMARY KEY (poi_id, item_id)
);

CREATE TABLE poi_schematics (
  poi_id uuid NOT NULL REFERENCES pois(id) ON DELETE CASCADE,
  schematic_id uuid NOT NULL REFERENCES schematics(id) ON DELETE CASCADE,
  notes text,
  assignment_source text NOT NULL CHECK (assignment_source IN ('default', 'manual')),
  assigned_by_rule_id uuid REFERENCES poi_type_default_schematics(id),
  added_by uuid REFERENCES profiles(id),
  added_at timestamptz DEFAULT now(),
  
  PRIMARY KEY (poi_id, schematic_id)
);
```

#### **Default Assignment Rules**
```sql
CREATE TABLE poi_type_default_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poi_type_id uuid NOT NULL REFERENCES poi_types(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  default_quantity integer DEFAULT 1,
  is_required boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true, -- For rule versioning
  
  UNIQUE(poi_type_id, item_id, is_active) -- Only one active rule per combination
);

CREATE TABLE poi_type_default_schematics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poi_type_id uuid NOT NULL REFERENCES poi_types(id) ON DELETE CASCADE,
  schematic_id uuid NOT NULL REFERENCES schematics(id) ON DELETE CASCADE,
  is_required boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  
  UNIQUE(poi_type_id, schematic_id, is_active)
);
```

### **Enhanced Permission System**

#### **User Permissions**
```sql
CREATE TABLE user_permissions (
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  permission_type text NOT NULL,
  granted boolean DEFAULT false,
  granted_by uuid REFERENCES profiles(id),
  granted_at timestamptz DEFAULT now(),
  revoked_at timestamptz,
  
  PRIMARY KEY (user_id, permission_type),
  
  -- Constraint: Only admins can grant permissions
  CHECK (granted_by IN (SELECT id FROM profiles WHERE role = 'admin'))
);

-- Permission types:
-- 'system_builder' - Access to field definitions, tiers, categories, types
-- 'add_own_items', 'edit_own_items', 'delete_own_items'
-- 'add_all_items', 'edit_all_items', 'delete_all_items'
-- 'add_own_schematics', 'edit_own_schematics', 'delete_own_schematics'
-- 'add_all_schematics', 'edit_all_schematics', 'delete_all_schematics'
```

## 🎨 **TypeScript Interface Definitions**

### **Core Entities**
```typescript
// Tier system
export interface Tier {
  id: string;
  name: string;
  level: number;
  color?: string;
  description?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Hierarchical organization
export interface Category {
  id: string;
  name: string;
  icon?: string;
  applies_to: ('items' | 'schematics')[];
  description?: string;
  created_by: string;
  is_global: boolean;
  created_at: string;
  updated_at: string;
}

export interface Type {
  id: string;
  name: string;
  category_id: string;
  description?: string;
  created_by: string;
  is_global: boolean;
  created_at: string;
  updated_at: string;
  category?: Category; // For joins
}

export interface SubType {
  id: string;
  name: string;
  type_id: string;
  description?: string;
  created_by: string;
  is_global: boolean;
  created_at: string;
  updated_at: string;
  type?: Type; // For joins
}

// Dynamic field system
export interface FieldDefinition {
  id: string;
  name: string;
  display_name: string;
  field_type: 'text' | 'number' | 'dropdown';
  scope_type: 'global' | 'category' | 'type';
  scope_id?: string;
  is_required: boolean;
  default_visible: boolean;
  display_order: number;
  dropdown_group_id?: string;
  validation_rules: Record<string, any>;
  created_by: string;
  created_at: string;
  updated_at: string;
  dropdown_group?: DropdownGroup; // For joins
}

export interface DropdownGroup {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  options?: DropdownOption[];
}

export interface DropdownOption {
  id: string;
  group_id: string;
  value: string;
  display_text: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

// Core entities
export interface Item {
  id: string;
  name: string;
  description?: string;
  category_id: string;
  type_id?: string;
  subtype_id?: string;
  tier_id?: string;
  icon_url?: string;
  field_values: Record<string, any>;
  created_by: string;
  is_global: boolean;
  created_at: string;
  updated_at: string;
  
  // Joined data
  category?: Category;
  type?: Type;
  subtype?: SubType;
  tier?: Tier;
  screenshots?: ItemScreenshot[];
}

export interface Schematic {
  id: string;
  name: string;
  description?: string;
  category_id: string;
  type_id?: string;
  subtype_id?: string;
  tier_id?: string;
  icon_url?: string;
  field_values: Record<string, any>;
  created_by: string;
  is_global: boolean;
  created_at: string;
  updated_at: string;
  
  // Joined data
  category?: Category;
  type?: Type;
  subtype?: SubType;
  tier?: Tier;
  screenshots?: SchematicScreenshot[];
}

// Screenshot interfaces
export interface ItemScreenshot {
  id: string;
  item_id: string;
  url: string;
  original_url?: string;
  crop_details?: PixelCrop;
  uploaded_by: string;
  upload_date: string;
  sort_order: number;
  file_size?: number;
  file_name?: string;
}

export interface SchematicScreenshot {
  id: string;
  schematic_id: string;
  url: string;
  original_url?: string;
  crop_details?: PixelCrop;
  uploaded_by: string;
  upload_date: string;
  sort_order: number;
  file_size?: number;
  file_name?: string;
}

// POI integration
export interface PoiItem {
  poi_id: string;
  item_id: string;
  quantity: number;
  notes?: string;
  assignment_source: 'default' | 'manual';
  assigned_by_rule_id?: string;
  added_by: string;
  added_at: string;
  item?: Item; // For joins
}

export interface PoiSchematic {
  poi_id: string;
  schematic_id: string;
  notes?: string;
  assignment_source: 'default' | 'manual';
  assigned_by_rule_id?: string;
  added_by: string;
  added_at: string;
  schematic?: Schematic; // For joins
}

// Default assignment rules
export interface PoiTypeDefaultItem {
  id: string;
  poi_type_id: string;
  item_id: string;
  default_quantity: number;
  is_required: boolean;
  created_at: string;
  is_active: boolean;
  item?: Item;
}

export interface PoiTypeDefaultSchematic {
  id: string;
  poi_type_id: string;
  schematic_id: string;
  is_required: boolean;
  created_at: string;
  is_active: boolean;
  schematic?: Schematic;
}

// Permission system
export interface UserPermission {
  user_id: string;
  permission_type: string;
  granted: boolean;
  granted_by: string;
  granted_at: string;
  revoked_at?: string;
}

export type PermissionType = 
  | 'system_builder'
  | 'add_own_items' | 'edit_own_items' | 'delete_own_items'
  | 'add_all_items' | 'edit_all_items' | 'delete_all_items'
  | 'add_own_schematics' | 'edit_own_schematics' | 'delete_own_schematics'
  | 'add_all_schematics' | 'edit_all_schematics' | 'delete_all_schematics';
```

## 🎛️ **UI/UX Specifications**

### **Items & Schematics Page Layout**
```
┌─────────────────────────────────────────────────────────────┐
│ Items & Schematics                                          │
├─────────────────────────────────────────────────────────────┤
│ [Items Tab] [Schematics Tab]                               │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────┐ ┌─────────────────────────────────────┐ │
│ │ Hierarchical    │ │ [Search: ____________] [+ Add Item] │ │
│ │ Tree View       │ │                                     │ │
│ │                 │ │ Filters:                            │ │
│ │ ├── Weapons     │ │ [Category ▼] [Type ▼] [Tier ▼]     │ │
│ │ │   ├── Sidearms│ │                                     │ │
│ │ │   └── Rifles  │ │ View: [Grid] [List]                 │ │
│ │ ├── Armor       │ │                                     │ │
│ │ │   ├── Light   │ │ ┌─────────────────────────────────┐ │ │
│ │ │   └── Heavy   │ │ │ Item Grid/List View             │ │ │
│ │ └── Tools       │ │ │                                 │ │ │
│ │                 │ │ │ [Item Cards with details]       │ │ │
│ │                 │ │ │                                 │ │ │
│ └─────────────────┘ │ └─────────────────────────────────┘ │ │
└─────────────────────┴─────────────────────────────────────┘
```

### **Admin System Builder Interface**
```
┌─────────────────────────────────────────────────────────────┐
│ Admin Panel > System Builder                                │
├─────────────────────────────────────────────────────────────┤
│ [Categories] [Types] [Field Definitions] [Tiers] [Defaults] │
├─────────────────────────────────────────────────────────────┤
│ Field Definitions Management:                               │
│                                                             │
│ Global Fields:                                              │
│ ☑ Name (text, required)                                     │
│ ☑ Description (text, optional)                             │
│ ☑ Icon (dropdown, optional)                                │
│                                                             │
│ Category-Specific Fields (Weapons):                        │
│ ☑ Damage (number, required)                                │
│ ☑ Weapon Type (dropdown: Weapon Types, required)           │
│                                                             │
│ [+ Add Field Definition]                                    │
└─────────────────────────────────────────────────────────────┘
```

### **POI Integration Interface**
```
┌─────────────────────────────────────────────────────────────┐
│ POI Modal > Items & Schematics Tab                         │
├─────────────────────────────────────────────────────────────┤
│ Items:                                                      │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Components (x5) [Default] [Edit] [Remove]               │ │
│ │ Iron Ore (x3) [Manual] [Edit] [Remove]                 │ │
│ │ [+ Add Item]                                            │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Schematics:                                                 │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Iron Sword Blueprint [Default] [View] [Remove]          │ │
│ │ [+ Add Schematic]                                       │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### **Map Visualization Enhancements**
```typescript
// POI marker with item/schematic indicators
interface EnhancedPOIMarker {
  // Existing POI data
  poi: Poi;
  
  // New indicators
  hasItems: boolean;
  hasSchematics: boolean;
  schematicCount: number; // For badge display
  
  // Visual elements
  schematicBadge?: ReactElement; // Blueprint icon overlay
  itemIndicator?: ReactElement; // Subtle item count
}

// Map filter controls extension
interface MapFilters {
  // Existing filters
  selectedPoiTypes: string[];
  
  // New filters
  showSchematicIndicators: boolean;
  showItemIndicators: boolean;
  filterByTier?: string[];
}
```

## 🔧 **Implementation Phases**

### **Phase 1: Core Infrastructure (4-5 weeks)**

#### **Database Implementation**
- Create all database tables with constraints
- Implement RLS policies for all tables
- Set up database functions for validation
- Create indexes for performance

#### **TypeScript Interfaces**
- Define all interfaces in `src/types/index.ts`
- Create utility types for API responses
- Set up validation schemas with Zod

#### **Basic Permission System**
- Implement permission checking functions
- Create permission management hooks
- Set up middleware for API protection

#### **Core CRUD Operations**
- Basic create/read/update/delete for all entities
- Validation logic for duplicates and hierarchy
- Error handling and user feedback

### **Phase 2: System Builder Tools (3-4 weeks)**

#### **Admin Interface Components**
- Category/Type/SubType management
- Field definition management interface
- Dropdown group management
- Tier management system

#### **Dynamic Field System**
- Field inheritance resolution logic
- Dynamic form generation
- Field validation and rendering
- Data migration utilities

#### **Permission Management UI**
- User permission assignment interface
- Permission checking throughout admin panel
- System Builder role implementation

### **Phase 3: Items & Schematics Interface (5-6 weeks)**

#### **Main Page Development**
- Hierarchical tree view component
- Grid and list view toggle
- Search and filtering functionality
- Item/Schematic creation modals

#### **Dynamic Form Implementation**
- Inherited field rendering system
- Custom field value editing
- Screenshot upload integration
- Validation and error handling

#### **Icon Management Integration**
- Shared icon pool system
- Icon upload and management
- Icon selection interface

### **Phase 4: POI Integration (3-4 weeks)**

#### **POI-Item/Schematic Relationships**
- Association management interface
- Quantity and notes editing
- Manual vs default assignment tracking

#### **Default Assignment System**
- Rule definition interface
- Retroactive update logic
- Assignment conflict resolution

#### **Map Visualization**
- Schematic indicator badges
- Item count indicators
- Toggle controls for visibility
- Enhanced POI tooltips

### **Phase 5: Polish & Optimization (2-3 weeks)**

#### **Performance Optimization**
- Query optimization for complex joins
- Component memoization
- Lazy loading for large datasets

#### **Data Migration & Validation**
- Field update warning system
- Bulk validation utilities
- Data integrity checks

#### **Final Integration Testing**
- End-to-end workflow testing
- Permission system validation
- Cross-component integration

## 🔗 **Integration Points with Existing System**

### **Database Extensions**
```sql
-- Extend existing POI interface
ALTER TABLE pois ADD COLUMN has_items boolean DEFAULT false;
ALTER TABLE pois ADD COLUMN has_schematics boolean DEFAULT false;

-- Update triggers to maintain flags
CREATE OR REPLACE FUNCTION update_poi_flags()
RETURNS TRIGGER AS $$
BEGIN
  -- Update has_items flag
  UPDATE pois SET has_items = EXISTS(
    SELECT 1 FROM poi_items WHERE poi_id = NEW.poi_id
  ) WHERE id = NEW.poi_id;
  
  -- Update has_schematics flag
  UPDATE pois SET has_schematics = EXISTS(
    SELECT 1 FROM poi_schematics WHERE poi_id = NEW.poi_id  
  ) WHERE id = NEW.poi_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### **Component Extensions**
```typescript
// Extend existing POI interfaces
interface ExtendedPoi extends Poi {
  has_items: boolean;
  has_schematics: boolean;
  items?: PoiItem[];
  schematics?: PoiSchematic[];
}

// Extend MapPOIMarker component
const MapPOIMarker: React.FC<MapPOIMarkerProps> = ({
  poi,
  showSchematicIndicators,
  showItemIndicators
}) => {
  return (
    <div className="relative">
      {/* Existing POI marker */}
      <POIMarker poi={poi} />
      
      {/* Schematic indicator */}
      {showSchematicIndicators && poi.has_schematics && (
        <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-1">
          <Blueprint className="w-3 h-3 text-white" />
        </div>
      )}
      
      {/* Item indicator */}
      {showItemIndicators && poi.has_items && (
        <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full w-4 h-4 text-xs text-white flex items-center justify-center">
          {poi.items?.length || 0}
        </div>
      )}
    </div>
  );
};
```

### **Router Extensions**
```typescript
// Add new routes to existing routing system
const AppRoutes = () => {
  return (
    <Routes>
      {/* Existing routes */}
      <Route path="/" element={<Dashboard />} />
      <Route path="/grid" element={<GridPage />} />
      <Route path="/hagga-basin" element={<HaggaBasinPage />} />
      <Route path="/pois" element={<PoisPage />} />
      
      {/* New routes */}
      <Route path="/items-schematics" element={<ItemsSchematicsPage />} />
      <Route path="/admin/system-builder" element={<SystemBuilderPage />} />
      
      {/* Existing admin routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="users" element={<UserManagement />} />
        <Route path="database" element={<DatabaseManagement />} />
        {/* New admin routes */}
        <Route path="permissions" element={<PermissionManagement />} />
      </Route>
    </Routes>
  );
};
```

## 📊 **Performance Considerations**

### **Database Optimization**
```sql
-- Key indexes for performance
CREATE INDEX CONCURRENTLY idx_items_category_type ON items(category_id, type_id);
CREATE INDEX CONCURRENTLY idx_items_tier ON items(tier_id);
CREATE INDEX CONCURRENTLY idx_items_created_by ON items(created_by);
CREATE INDEX CONCURRENTLY idx_field_values_gin ON items USING GIN(field_values);

CREATE INDEX CONCURRENTLY idx_poi_items_poi ON poi_items(poi_id);
CREATE INDEX CONCURRENTLY idx_poi_items_item ON poi_items(item_id);
CREATE INDEX CONCURRENTLY idx_poi_items_source ON poi_items(assignment_source);

-- Materialized view for complex queries
CREATE MATERIALIZED VIEW item_hierarchy_view AS
SELECT 
  i.id,
  i.name,
  i.description,
  c.name as category_name,
  t.name as type_name,
  st.name as subtype_name,
  ti.name as tier_name,
  ti.level as tier_level,
  i.created_by,
  i.is_global,
  i.created_at
FROM items i
LEFT JOIN categories c ON i.category_id = c.id
LEFT JOIN types t ON i.type_id = t.id  
LEFT JOIN subtypes st ON i.subtype_id = st.id
LEFT JOIN tiers ti ON i.tier_id = ti.id;

-- Refresh function
CREATE OR REPLACE FUNCTION refresh_item_hierarchy() 
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY item_hierarchy_view;
END;
$$ LANGUAGE plpgsql;
```

### **React Optimization**
```typescript
// Memoization for complex components
const ItemCard = React.memo<ItemCardProps>(({ item, fields }) => {
  const dynamicFields = useMemo(() => 
    resolveInheritedFields(item, fields),
    [item, fields]
  );
  
  return (
    <div className="item-card">
      {/* Render item with dynamic fields */}
    </div>
  );
});

// Virtual scrolling for large lists
const ItemList: React.FC<ItemListProps> = ({ items }) => {
  const { virtualItems, totalSize, containerRef } = useVirtualizer({
    count: items.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => 100,
  });
  
  return (
    <div ref={containerRef} style={{ height: '600px', overflow: 'auto' }}>
      <div style={{ height: totalSize }}>
        {virtualItems.map(virtualItem => (
          <ItemCard
            key={virtualItem.key}
            item={items[virtualItem.index]}
            style={{
              position: 'absolute',
              top: virtualItem.start,
              left: 0,
              width: '100%',
              height: virtualItem.size,
            }}
          />
        ))}
      </div>
    </div>
  );
};
```

## 🚀 **Deployment Considerations**

### **Database Migration Strategy**
```sql
-- Create migration scripts for each phase
-- Phase 1: Core infrastructure
-- 001_create_tiers_table.sql
-- 002_create_categories_table.sql
-- 003_create_types_table.sql
-- etc.

-- Rollback procedures for each migration
-- rollback_001_drop_tiers_table.sql
```

### **Feature Flags**
```typescript
// Gradual rollout with feature flags
interface FeatureFlags {
  items_schematics_enabled: boolean;
  system_builder_enabled: boolean;
  map_indicators_enabled: boolean;
  dynamic_fields_enabled: boolean;
}

const useFeatureFlag = (flag: keyof FeatureFlags): boolean => {
  const { user } = useAuth();
  const flags = useFeatureFlags(user);
  return flags[flag];
};
```

### **Documentation Updates**
- Update user manual with new features
- Create admin guide for System Builder
- Update API documentation
- Create video tutorials for complex workflows

## 📈 **Success Metrics**

### **Adoption Metrics**
- Number of items/schematics created
- Number of POI-item/schematic associations
- Usage of custom fields and categories
- User engagement with hierarchical organization

### **Performance Metrics**
- Page load times for Items & Schematics page
- Database query performance
- Search and filter response times
- Mobile usability scores

### **User Satisfaction**
- Feature usage analytics
- User feedback and ratings
- Support ticket reduction
- Community growth metrics

---

## 🎯 **Conclusion**

This Items & Schematics system represents a major evolution of the Dune Awakening Deep Desert Tracker, transforming it from a simple POI tracking tool into a comprehensive game database management platform. The system maintains consistency with existing architecture while introducing sophisticated new capabilities that will significantly enhance user engagement and platform value.

The modular implementation approach allows for gradual rollout and validation of features, ensuring stability and user satisfaction throughout the development process.

**Estimated Timeline**: 4-6 months
**Estimated Effort**: 1,200-1,500 development hours
**Business Value**: High - transforms platform into unique community database tool 