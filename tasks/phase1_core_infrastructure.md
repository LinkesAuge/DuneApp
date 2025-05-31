# Phase 1: Core Infrastructure - Detailed Implementation Guide

## **📋 PHASE OVERVIEW**
**Duration**: 4-5 weeks  
**Effort**: 160-200 hours  
**Priority**: Immediate  
**Dependencies**: None

**Purpose**: Establish the foundational database schema, TypeScript interfaces, permission systems, and core CRUD operations for the Items & Schematics system. This phase creates the technical foundation that all subsequent phases will build upon.

---

## **🗄️ STEP 1: DATABASE SCHEMA IMPLEMENTATION (Week 1-2)**

### **Step 1.1: Tier System Table** ⏱️ 2-3 hours
**Purpose**: Create the tech level system (Makeshift, Copper, Iron, Steel, etc.)

**Technical Implementation**:
```sql
-- Create tiers table
CREATE TABLE tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  level integer NOT NULL UNIQUE,
  color text DEFAULT '#6B7280',
  description text,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS Policies
ALTER TABLE tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON tiers 
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create" ON tiers 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own or admins can update all" ON tiers 
  FOR UPDATE USING (
    created_by = auth.uid() OR 
    EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Indexes
CREATE INDEX idx_tiers_level ON tiers(level);
CREATE INDEX idx_tiers_created_by ON tiers(created_by);

-- Triggers
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON tiers 
  FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);
```

**Required Data**:
```sql
INSERT INTO tiers (name, level, color, description) VALUES
('Makeshift', 1, '#8B5CF6', 'Basic crafted items'),
('Copper', 2, '#F59E0B', 'Copper-tier equipment'),
('Iron', 3, '#6B7280', 'Iron-tier equipment'),
('Steel', 4, '#374151', 'Steel-tier equipment'),
('Alloy', 5, '#1E40AF', 'Advanced alloy items');
```

### **Step 1.2: Categories Table** ⏱️ 2-3 hours
**Purpose**: Create shared categories for both items and schematics

**Technical Implementation**:
```sql
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  icon text,
  applies_to text[] NOT NULL DEFAULT '{"items", "schematics"}',
  description text,
  created_by uuid REFERENCES profiles(id),
  is_global boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_applies_to CHECK (
    applies_to <@ ARRAY['items', 'schematics'] AND
    array_length(applies_to, 1) > 0
  )
);

-- RLS and indexes similar to tiers table
-- ... (following same pattern)
```

### **Step 1.3: Types and SubTypes Tables** ⏱️ 3-4 hours
**Purpose**: Create hierarchical organization within categories

**Technical Implementation**:
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
  
  UNIQUE(name, category_id)
);

CREATE TABLE subtypes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type_id uuid NOT NULL REFERENCES types(id) ON DELETE CASCADE,
  description text,
  created_by uuid REFERENCES profiles(id),
  is_global boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(name, type_id)
);
```

### **Step 1.4: Dynamic Field System** ⏱️ 6-8 hours
**Purpose**: Create flexible field definition system with inheritance

**Technical Implementation**:
```sql
CREATE TABLE field_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  display_name text NOT NULL,
  field_type text NOT NULL CHECK (field_type IN ('text', 'number', 'dropdown')),
  
  -- Scope definition (flexible inheritance)
  scope_type text NOT NULL CHECK (scope_type IN ('global', 'category', 'type')),
  scope_id uuid,
  
  -- Field properties
  is_required boolean DEFAULT false,
  default_visible boolean DEFAULT true,
  display_order integer DEFAULT 0,
  
  -- Dropdown configuration
  dropdown_group_id uuid REFERENCES dropdown_groups(id),
  
  -- Validation rules
  validation_rules jsonb DEFAULT '{}',
  
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
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

CREATE TABLE dropdown_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE dropdown_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES dropdown_groups(id) ON DELETE CASCADE,
  value text NOT NULL,
  display_text text NOT NULL,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  
  UNIQUE(group_id, value)
);
```

### **Step 1.5: Core Items and Schematics Tables** ⏱️ 4-5 hours
**Purpose**: Create main entity tables for items and schematics

**Technical Implementation**:
```sql
CREATE TABLE items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  
  -- Hierarchical references
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
  
  -- Validation constraints
  CHECK (category_id IS NOT NULL),
  CHECK (
    (type_id IS NULL AND subtype_id IS NULL) OR
    (type_id IS NOT NULL)
  )
);

-- Case-insensitive unique name constraint
CREATE UNIQUE INDEX items_name_unique ON items (LOWER(name));

-- Similar structure for schematics table
CREATE TABLE schematics (
  -- Identical structure to items table
  -- ... (same schema)
);
```

---

## **🔧 STEP 2: TYPESCRIPT INFRASTRUCTURE (Week 2)**

### **Step 2.1: Core Type Definitions** ⏱️ 4-6 hours
**Purpose**: Create TypeScript interfaces for all new entities

**File**: `src/types/items-schematics.ts`
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

// ... (continue with all interfaces)
```

### **Step 2.2: Validation Schemas** ⏱️ 6-8 hours
**Purpose**: Create Zod schemas for runtime validation

**File**: `src/lib/validation/items-schematics.ts`
```typescript
import { z } from 'zod';

export const TierSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(50),
  level: z.number().int().min(1),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  description: z.string().max(500).optional(),
  // ... continue
});

export const CreateTierSchema = TierSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  created_by: true
});

// ... (schemas for all entities)
```

---

## **🔐 STEP 3: PERMISSION SYSTEM (Week 3)**

### **Step 3.1: Permission Database Schema** ⏱️ 3-4 hours
**Purpose**: Implement granular permission system

**Technical Implementation**:
```sql
CREATE TABLE user_permissions (
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  permission_type text NOT NULL,
  granted boolean DEFAULT false,
  granted_by uuid REFERENCES profiles(id),
  granted_at timestamptz DEFAULT now(),
  revoked_at timestamptz,
  
  PRIMARY KEY (user_id, permission_type)
);

-- Permission types enumeration
CREATE TYPE permission_types AS ENUM (
  'system_builder',
  'add_own_items', 'edit_own_items', 'delete_own_items',
  'add_all_items', 'edit_all_items', 'delete_all_items',
  'add_own_schematics', 'edit_own_schematics', 'delete_own_schematics',
  'add_all_schematics', 'edit_all_schematics', 'delete_all_schematics'
);
```

### **Step 3.2: Permission Checking Functions** ⏱️ 6-8 hours
**Purpose**: Create utility functions for permission validation

**File**: `src/lib/permissions/items-schematics.ts`
```typescript
export const ItemsSchematicsPermissions = {
  // Permission checking functions
  canCreateItems: (user: User) => boolean,
  canEditItem: (user: User, item: Item) => boolean,
  canDeleteItem: (user: User, item: Item) => boolean,
  // ... continue
} as const;
```

---

## **📡 STEP 4: CORE CRUD OPERATIONS (Week 3-4)**

### **Step 4.1: Database Service Layer** ⏱️ 8-10 hours
**Purpose**: Create service functions for database operations

**File**: `src/lib/services/items-service.ts`
```typescript
export class ItemsService {
  static async createItem(data: CreateItemData): Promise<Item> {
    // Validation, permission checking, database insertion
  }
  
  static async getItems(filters?: ItemFilters): Promise<Item[]> {
    // Complex query with joins, filtering, pagination
  }
  
  static async updateItem(id: string, data: UpdateItemData): Promise<Item> {
    // Update with validation and permission checking
  }
  
  static async deleteItem(id: string): Promise<void> {
    // Delete with cascade handling and permission checking
  }
}
```

### **Step 4.2: API Endpoint Creation** ⏱️ 6-8 hours
**Purpose**: Create RESTful API endpoints with proper validation

**Supabase Edge Functions**:
- `items/create`
- `items/read` 
- `items/update`
- `items/delete`
- Similar for schematics, categories, types, etc.

---

## **🔄 STEP 5: INTEGRATION PREPARATION (Week 4-5)**

### **Step 5.1: Database Migration Scripts** ⏱️ 4-6 hours
**Purpose**: Create production-ready migration scripts

**File**: `migrations/create_items_schematics_system.sql`
```sql
-- Complete migration script with:
-- 1. Table creation in correct order
-- 2. Index creation
-- 3. RLS policies
-- 4. Triggers
-- 5. Initial data seeding
-- 6. Rollback procedures
```

### **Step 5.2: Testing Infrastructure** ⏱️ 6-8 hours
**Purpose**: Create comprehensive test suites

**Files**:
- `tests/database/items-schematics.test.sql` - Database tests
- `tests/services/items-service.test.ts` - Service layer tests
- `tests/permissions/items-permissions.test.ts` - Permission tests

---

## **✅ PHASE 1 COMPLETION CRITERIA**

### **Database Readiness**
- [ ] All 15+ tables created with proper constraints
- [ ] RLS policies implemented and tested
- [ ] Performance indexes created
- [ ] Migration scripts tested in development

### **TypeScript Infrastructure** 
- [ ] All interfaces defined and exported
- [ ] Zod validation schemas complete
- [ ] Type guards implemented
- [ ] No TypeScript compilation errors

### **Permission System**
- [ ] Permission checking functions working
- [ ] Database permission schema implemented
- [ ] Admin interface can grant/revoke permissions
- [ ] Permission middleware protects all endpoints

### **Core Operations**
- [ ] CRUD operations for all entities working
- [ ] Validation logic prevents data corruption
- [ ] Error handling provides meaningful feedback
- [ ] Performance meets requirements (<100ms for basic operations)

---

## **🚀 HANDOFF TO PHASE 2**

**Deliverables for Phase 2**:
1. **Database**: Fully functional with all tables and relationships
2. **APIs**: Core CRUD endpoints operational and secured
3. **Types**: Complete TypeScript definition library
4. **Permissions**: Working permission system ready for UI integration
5. **Documentation**: Database schema documentation and API reference

**Phase 2 Dependencies Met**:
- System Builder interfaces can be built on permission system
- Admin UI can use CRUD operations and validation
- Field definition system ready for dynamic form generation
- All entities available for management interface creation 