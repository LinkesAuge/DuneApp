# Unified Entities System Implementation Plan

**Project**: Dune Awakening Deep Desert Tracker - Unified Items & Schematics System
**Date**: January 30, 2025
**Status**: Phase 1 Complete, Moving to Phase 2

## Executive Summary

### ✅ Phase 1 Completed: Database Migration & Data Import
- **Successfully migrated** from complex 15-table system to unified entities architecture
- **Imported 934 entities** (711 Items + 223 Schematics) from Excel data
- **Resolved all data quality issues** including null names, "nan" values, and constraint violations
- **Created comprehensive migration tools** with UPSERT capabilities
- **Established foundation** for recipe system and POI integration

### 🎯 Next Steps: Frontend Integration & Core Functionality
- Update TypeScript interfaces and API endpoints
- Implement POI-to-entity linking system
- Integrate Supabase storage for entity icons
- Build comprehensive user interface

---

## Architecture Overview

### Database Schema (✅ Completed)
```sql
entities (934 records)           -- Unified items and schematics
├── id (uuid, PK)
├── item_id (text, unique)
├── name, description, icon
├── category, type, subtype
├── tier_number (0-7)
├── is_schematic (boolean)
└── field_values (jsonb)

tiers (8 records)                -- Tier system
├── tier_number (0-7)
└── tier_name (Makeshift → Plastanium)

recipes                          -- Crafting system
recipe_ingredients
recipe_outputs

poi_entity_links                 -- POI integration
├── poi_id → pois(id)
├── entity_id → entities(id)
├── quantity, notes
└── assignment_source
```

### Technology Stack
- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **State Management**: React hooks + Context
- **UI Components**: Existing POI card patterns
- **Storage**: Supabase Storage for entity icons

---

## Phase 2: Frontend Foundation (🚧 In Progress)

**Priority**: HIGH | **Estimated Effort**: 2-3 days | **Dependencies**: Phase 1 Complete

### Objectives
1. Update TypeScript interfaces for unified entities
2. Create/update API endpoints for CRUD operations
3. Implement basic entity browsing and management
4. Establish foundation for POI integration

### Step 2.1: TypeScript Interfaces Update
**File**: `src/types/unified-entities.ts`

**Deliverables**:
```typescript
// Core entity interfaces
interface Entity {
  id: string;
  item_id: string;
  name: string;
  description?: string;
  icon?: string;
  category: string;
  type: string;
  subtype?: string;
  tier_number: number;
  is_global: boolean;
  is_schematic: boolean;
  field_values: Record<string, any>;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

interface Tier {
  tier_number: number;
  tier_name: string;
}

interface Recipe {
  recipe_id: string;
  produces_item_id: string;
  crafting_time?: number;
  water_amount?: number;
}

interface POIEntityLink {
  poi_id: string;
  entity_id: string;
  quantity: number;
  notes?: string;
  assignment_source?: string;
  added_by?: string;
  added_at?: string;
}
```

**Acceptance Criteria**:
- [ ] All interfaces compile without TypeScript errors
- [ ] Interfaces match database schema exactly
- [ ] Export all interfaces from main types file
- [ ] Update existing imports throughout codebase

### Step 2.2: API Layer Implementation
**File**: `src/lib/api/entities.ts`

**Deliverables**:
```typescript
// Entity CRUD operations
export const entitiesAPI = {
  // Read operations
  getAll: (filters?: EntityFilters) => Promise<Entity[]>,
  getById: (id: string) => Promise<Entity>,
  getByItemId: (itemId: string) => Promise<Entity>,
  
  // Write operations
  create: (entity: Partial<Entity>) => Promise<Entity>,
  update: (id: string, updates: Partial<Entity>) => Promise<Entity>,
  delete: (id: string) => Promise<void>,
  
  // Filtering and search
  search: (query: string) => Promise<Entity[]>,
  getByCategory: (category: string) => Promise<Entity[]>,
  getByTier: (tierNumber: number) => Promise<Entity[]>,
  
  // Utility functions
  getTiers: () => Promise<Tier[]>,
  getCategories: () => Promise<string[]>,
  getTypes: (category?: string) => Promise<string[]>
};
```

**Acceptance Criteria**:
- [ ] All CRUD operations work with unified entities table
- [ ] Proper error handling and TypeScript safety
- [ ] Filtering and search functionality implemented
- [ ] Performance optimized with appropriate indexing
- [ ] Integration tests passing

### Step 2.3: Core Components Update
**Files**: 
- `src/components/items-schematics/ItemsSchematicsContent.tsx`
- `src/components/items-schematics/EntityCard.tsx` (new)
- `src/components/items-schematics/EntityList.tsx` (new)

**Deliverables**:
1. **EntityCard Component**: Display individual entity with icon, name, category, tier
2. **EntityList Component**: Grid/list view of entities with filtering
3. **EntityModal Component**: Add/edit entity functionality
4. **Updated ItemsSchematicsContent**: Integrate with new unified API

**Acceptance Criteria**:
- [ ] Entity cards display all relevant information
- [ ] Filtering by category, type, tier works correctly
- [ ] Add/edit functionality saves to unified entities table
- [ ] Icons display properly (fallback to placeholder if missing)
- [ ] Responsive design matches existing POI card styling

---

## Phase 3: Icon System Integration (🔄 Medium Priority)

**Priority**: MEDIUM | **Estimated Effort**: 1-2 days | **Dependencies**: Phase 2 Complete

### Objectives
1. Set up Supabase storage for entity icons
2. Implement icon upload and management
3. Update entity display to show custom icons
4. Migrate existing icons to Supabase storage

### Step 3.1: Supabase Storage Setup
**Deliverables**:
- Storage bucket: `screenshots/entity-icons/`
- RLS policies for public read access
- Upload policies for authenticated users

**Implementation**:
```sql
-- Storage policies
INSERT INTO storage.buckets (id, name, public) VALUES ('screenshots', 'screenshots', true);

-- RLS policies for entity icons
CREATE POLICY "Public read access" ON storage.objects 
FOR SELECT USING (bucket_id = 'screenshots' AND (storage.foldername(name))[1] = 'entity-icons');

CREATE POLICY "Authenticated upload" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'screenshots' AND (storage.foldername(name))[1] = 'entity-icons');
```

### Step 3.2: Icon Management Interface
**File**: `src/components/admin/EntityIconManager.tsx`

**Features**:
- Upload new entity icons
- Preview uploaded icons
- Assign icons to entities
- Bulk icon operations

**Acceptance Criteria**:
- [ ] Admin can upload .webp, .png, .jpg files
- [ ] Icons are automatically resized and optimized
- [ ] Icon assignment updates entity records
- [ ] Preview functionality works correctly

### Step 3.3: Icon Display Integration
**Updates**: Entity display components to show Supabase-hosted icons

**Icon URL Pattern**: `https://[supabase-url]/storage/v1/object/public/screenshots/entity-icons/[filename]`

**Acceptance Criteria**:
- [ ] Entity cards show custom icons when available
- [ ] Fallback to default icon for missing images
- [ ] Icons load efficiently with proper caching
- [ ] Responsive sizing across different screen sizes

---

## Phase 4: POI Integration System (🎯 High Priority)

**Priority**: HIGH | **Estimated Effort**: 2-3 days | **Dependencies**: Phase 2 Complete

### Objectives
1. Implement POI-to-entity linking functionality
2. Create UI for managing POI-entity relationships
3. Display linked entities in POI views
4. Enable bulk operations and advanced filtering

### Step 4.1: POI-Entity Linking API
**File**: `src/lib/api/poi-entity-links.ts`

**Deliverables**:
```typescript
export const poiEntityLinksAPI = {
  // Link management
  addLink: (poiId: string, entityId: string, quantity: number, notes?: string) => Promise<POIEntityLink>,
  removeLink: (poiId: string, entityId: string) => Promise<void>,
  updateLink: (poiId: string, entityId: string, updates: Partial<POIEntityLink>) => Promise<POIEntityLink>,
  
  // Query operations
  getLinksForPOI: (poiId: string) => Promise<POIEntityLink[]>,
  getLinksForEntity: (entityId: string) => Promise<POIEntityLink[]>,
  
  // Bulk operations
  addMultipleLinks: (poiId: string, links: Array<{entityId: string, quantity: number}>) => Promise<POIEntityLink[]>,
  importFromCSV: (file: File) => Promise<POIEntityLink[]>
};
```

### Step 4.2: POI-Entity Linking Interface
**Files**:
- `src/components/poi-linking/POIEntityLinker.tsx`
- `src/components/poi-linking/EntitySearchModal.tsx`
- `src/components/poi-linking/LinkedEntitiesList.tsx`

**Features**:
1. **Entity Search Modal**: Search and select entities to link
2. **Linked Entities List**: Display linked entities with quantities
3. **Quick Actions**: Common entity shortcuts (weapons, armor, resources)
4. **Bulk Import**: CSV import for mass linking

**Acceptance Criteria**:
- [ ] Search entities by name, category, type
- [ ] Add/remove entity links with quantity
- [ ] Display linked entities in POI modals
- [ ] Edit quantities and notes inline
- [ ] Bulk operations work efficiently

### Step 4.3: POI View Updates
**Files**: Update existing POI components to show linked entities

**Updates**:
- `src/components/hagga-basin/POIEditModal.tsx`
- `src/components/hagga-basin/HaggaBasinPoiCard.tsx`
- `src/components/poi/PoiCard.tsx`
- `src/components/grid/GridSquareModal.tsx`

**Features**:
- Display linked entities in POI cards
- Show entity icons and quantities
- Quick access to entity details
- Filter POIs by linked entities

**Acceptance Criteria**:
- [ ] POI cards show linked entity icons
- [ ] Entity quantities display correctly
- [ ] Click entity icons to view details
- [ ] POI search includes linked entities
- [ ] Performance optimized for many links

---

## Phase 5: Recipe System Implementation (🔄 Medium Priority)

**Priority**: MEDIUM | **Estimated Effort**: 3-4 days | **Dependencies**: Phase 2 Complete

### Objectives
1. Populate recipe data from Excel/game sources
2. Implement crafting interface and recipe browser
3. Show crafting requirements and outputs
4. Integrate with POI system for material sourcing

### Step 5.1: Recipe Data Population
**Process**:
1. Analyze recipe data sources (Excel files, game data)
2. Create recipe import scripts
3. Populate recipes, recipe_ingredients, recipe_outputs tables
4. Validate data integrity and relationships

**Deliverables**:
- Recipe import scripts
- Validated recipe data in database
- Recipe relationship verification

### Step 5.2: Recipe Interface Components
**Files**:
- `src/components/recipes/RecipeBrowser.tsx`
- `src/components/recipes/RecipeCard.tsx`
- `src/components/recipes/CraftingCalculator.tsx`

**Features**:
1. **Recipe Browser**: Search and filter recipes
2. **Recipe Details**: Show ingredients, outputs, crafting time
3. **Crafting Calculator**: Calculate material requirements
4. **Material Sourcing**: Link to POIs where materials can be found

### Step 5.3: Integration with Entity System
**Features**:
- Show recipes that produce selected entity
- Show recipes that require selected entity as ingredient
- Calculate crafting chains and material requirements
- Optimize crafting routes based on available materials

**Acceptance Criteria**:
- [ ] Recipe browser works efficiently
- [ ] Crafting calculations are accurate
- [ ] POI integration shows material sources
- [ ] Performance optimized for complex recipes

---

## Phase 6: UI/UX Polish & Advanced Features (🎨 Low Priority)

**Priority**: LOW | **Estimated Effort**: 2-3 days | **Dependencies**: Phases 2-4 Complete

### Objectives
1. Enhance filtering and search capabilities
2. Implement advanced user features
3. Optimize performance and user experience
4. Add data export and import capabilities

### Step 6.1: Advanced Filtering
**Features**:
- Multi-criteria filtering (category + tier + type)
- Saved filter presets
- Quick filter buttons
- Advanced search with operators

### Step 6.2: User Experience Enhancements
**Features**:
- Favorites system for entities
- Recent items history
- Bulk operations interface
- Keyboard shortcuts

### Step 6.3: Performance Optimizations
**Improvements**:
- Virtual scrolling for large entity lists
- Image lazy loading and caching
- Debounced search inputs
- Optimized database queries

### Step 6.4: Data Management
**Features**:
- Export entities to CSV/JSON
- Import custom entity data
- Backup and restore functionality
- Data validation and cleanup tools

---

## Risk Assessment & Mitigation

### High Risk Items
1. **Database Performance**: Large entity dataset may impact query performance
   - **Mitigation**: Implement proper indexing, pagination, and caching
   
2. **Icon Storage Costs**: Many entity icons could increase storage costs
   - **Mitigation**: Optimize image sizes, implement CDN caching
   
3. **Complex POI-Entity Relationships**: Many-to-many relationships may be complex
   - **Mitigation**: Careful API design, proper data validation

### Medium Risk Items
1. **User Interface Complexity**: Many features could overwhelm users
   - **Mitigation**: Progressive disclosure, clear navigation, user testing
   
2. **Data Migration Issues**: Existing POI data may conflict with new system
   - **Mitigation**: Comprehensive testing, rollback procedures

## Timeline Estimates

| Phase | Duration | Start After | Key Deliverables |
|-------|----------|-------------|------------------|
| Phase 1 | ✅ Complete | N/A | Database migration, data import |
| Phase 2 | 2-3 days | Phase 1 | TypeScript interfaces, API layer, core components |
| Phase 3 | 1-2 days | Phase 2 | Icon system, Supabase storage setup |
| Phase 4 | 2-3 days | Phase 2 | POI-entity linking, interface updates |
| Phase 5 | 3-4 days | Phase 2 | Recipe system, crafting interface |
| Phase 6 | 2-3 days | Phases 2-4 | UI polish, advanced features |

**Total Estimated Time**: 10-15 development days
**Critical Path**: Phase 1 → Phase 2 → Phase 4 (POI Integration)

## Success Criteria

### Phase 2 Success
- [ ] All entity CRUD operations work correctly
- [ ] Entity browsing interface is functional
- [ ] TypeScript compilation without errors
- [ ] Basic filtering and search implemented

### Phase 4 Success  
- [ ] POI-entity linking works seamlessly
- [ ] POI views show linked entities
- [ ] Bulk operations are efficient
- [ ] User can manage entity relationships easily

### Overall Project Success
- [ ] Users can browse and manage 934+ entities efficiently
- [ ] POI-entity relationships enhance user workflow
- [ ] System performance is acceptable with large datasets
- [ ] UI/UX matches existing application standards
- [ ] All data migration completed without loss

## Next Immediate Actions

1. **Start Phase 2**: Update TypeScript interfaces (`src/types/unified-entities.ts`)
2. **Create API layer**: Implement `src/lib/api/entities.ts`
3. **Update components**: Begin with `EntityCard` and `EntityList` components
4. **Test thoroughly**: Ensure API integration works with real data
5. **Document progress**: Update this plan as we complete each step

---

## Technical Notes

### Database Considerations
- **Indexing**: Ensure proper indexes on frequently queried fields (category, type, tier_number)
- **Full-text Search**: Consider PostgreSQL full-text search for entity names/descriptions
- **Archival**: Plan for soft deletes and entity versioning if needed

### Performance Considerations
- **Pagination**: Implement server-side pagination for large entity lists
- **Caching**: Use React Query or similar for API response caching
- **Image Optimization**: Implement progressive loading for entity icons

### Security Considerations
- **RLS Policies**: Ensure proper Row Level Security for entity modifications
- **Input Validation**: Validate all entity data on both client and server
- **File Upload Security**: Secure icon upload with proper validation

This implementation plan provides a comprehensive roadmap for completing the unified entities system. Each phase builds upon the previous one, with clear deliverables and acceptance criteria to ensure successful implementation. 