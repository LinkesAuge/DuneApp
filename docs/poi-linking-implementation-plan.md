# POI Entity Linking System - Implementation Plan

**Project**: Dune Awakening Deep Desert Tracker - POI Entity Linking Interface
**Date**: January 30, 2025
**Status**: Planning Phase - Ready for Implementation

## Executive Summary

### 🎯 Project Overview
Implementation of a comprehensive POI-Entity linking system that allows users to create, manage, and track relationships between Points of Interest (POIs) and game entities (items/schematics). The system features a modern 4-panel collapsible interface optimized for desktop use.

### 🔑 Key Features
- **4-Panel Collapsible Interface**: Filters, POIs, Entities, Selection Summary
- **Advanced Filtering**: Dual-tab filters for POIs and Entities with real-time counters
- **Multi-Selection Workflow**: Checkbox-based selection with bulk operations
- **Real-time Link Management**: Create, edit, delete links with duplicate detection
- **Link History & Audit Trail**: Comprehensive tracking and management
- **Access Control**: Creator permissions with admin/editor overrides

---

## Architecture Overview

### 🏗️ Component Structure
```
src/components/poi-linking/
├── POIEntityLinkingPage.tsx          # Main page container
├── panels/
│   ├── FiltersPanel.tsx              # Left panel - POI/Entity filters
│   ├── POIsPanel.tsx                 # Middle-left panel - POI selection
│   ├── EntitiesPanel.tsx             # Middle-right panel - Entity selection  
│   └── SelectionSummaryPanel.tsx     # Right panel - Summary & actions
├── components/
│   ├── POICard.tsx                   # Individual POI display
│   ├── EntityCard.tsx                # Individual entity display
│   ├── CollapsiblePanel.tsx          # Reusable panel wrapper
│   ├── FilterSection.tsx             # Filter groups
│   └── BulkActionMenu.tsx            # Bulk operations
├── modals/
│   ├── LinkConfirmationModal.tsx     # Confirm link creation
│   ├── LinkHistoryModal.tsx          # View/manage link history
│   └── BulkEditModal.tsx             # Bulk link management
└── hooks/
    ├── usePOIEntityLinks.ts          # Link management state
    ├── useFilterState.ts             # Filter state management
    └── useSelectionState.ts          # Selection state management
```

### 🛢️ Database Schema
```sql
-- Existing table (already implemented)
poi_entity_links (
    poi_id uuid REFERENCES pois(id),
    entity_id uuid REFERENCES entities(id),
    quantity integer DEFAULT 1,
    notes text,
    added_by uuid REFERENCES profiles(id),
    added_at timestamp DEFAULT now(),
    updated_by uuid REFERENCES profiles(id),
    updated_at timestamp DEFAULT now(),
    PRIMARY KEY (poi_id, entity_id)
);

-- Link history tracking
poi_entity_link_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    poi_id uuid REFERENCES pois(id),
    entity_id uuid REFERENCES entities(id),
    action_type text CHECK (action_type IN ('created', 'updated', 'deleted')),
    old_values jsonb,
    new_values jsonb,
    performed_by uuid REFERENCES profiles(id),
    performed_at timestamp DEFAULT now()
);
```

---

## Phase 1: Core Infrastructure (Days 1-2)

### 🎯 Objectives
1. Set up routing and basic page structure
2. Implement collapsible panel system
3. Create base components and hooks
4. Establish state management patterns

### Step 1.1: Page Setup & Routing
**Files**: 
- `src/App.tsx` - Add route
- `src/components/common/Navbar.tsx` - Add navigation link

**Route Configuration**:
```tsx
// In App.tsx
<Route path="/poi-linking" element={
  <ProtectedRoute>
    <POIEntityLinkingPage />
  </ProtectedRoute>
} />
```

**Navigation**:
```tsx
// Desktop navigation
<Link to="/poi-linking" className="nav-link">
  🔗 POI Linking
</Link>

// Mobile navigation  
<Link to="/poi-linking" className="mobile-nav-link">
  🔗 Linking
</Link>
```

### Step 1.2: Collapsible Panel System
**File**: `src/components/poi-linking/components/CollapsiblePanel.tsx`

**Features**:
- **Panel States**: Expanded, collapsed, hidden
- **Smooth Animations**: CSS transitions for expand/collapse
- **Responsive Widths**: Dynamic width allocation when panels collapse
- **Keyboard Navigation**: Arrow keys for panel focus
- **State Persistence**: Remember panel states in localStorage

**Props Interface**:
```tsx
interface CollapsiblePanelProps {
  id: string;
  title: string;
  icon: string;
  isCollapsed: boolean;
  onToggle: () => void;
  width: string; // "w-80", "flex-1", etc.
  collapsedWidth?: string; // "w-8" default
  children: React.ReactNode;
  headerActions?: React.ReactNode;
}
```

### Step 1.3: State Management Setup
**Files**:
- `src/components/poi-linking/hooks/useFilterState.ts`
- `src/components/poi-linking/hooks/useSelectionState.ts`
- `src/components/poi-linking/hooks/usePanelState.ts`

**State Structure**:
```tsx
// Filter state
interface FilterState {
  poi: {
    search: string;
    mapType: 'hagga_basin' | 'deep_desert' | 'all';
    privacyLevel: string[];
    categories: string[];
    gridLocation?: string;
  };
  entity: {
    search: string;
    type: ('item' | 'schematic')[];
    categories: string[];
    tiers: number[];
    scope: ('global' | 'custom')[];
  };
}

// Selection state
interface SelectionState {
  pois: Set<string>;
  entities: Set<string>;
  actions: {
    addPOI: (id: string) => void;
    removePOI: (id: string) => void;
    addEntity: (id: string) => void;
    removeEntity: (id: string) => void;
    clearAll: () => void;
    selectAllFiltered: (type: 'pois' | 'entities') => void;
  };
}
```

---

## Phase 2: Filter System Implementation (Days 3-4)

### 🎯 Objectives
1. Implement dual-tab filter interface
2. Add real-time filter counters
3. Create advanced search functionality
4. Build filter presets and quick actions

### Step 2.1: Filter Panel Structure
**File**: `src/components/poi-linking/panels/FiltersPanel.tsx`

**Tab System**:
```tsx
const FilterTabs = {
  POI: 'poi',
  ENTITY: 'entity'
} as const;

interface FiltersPanel {
  activeTab: FilterTabs;
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  resultCounts: {
    pois: number;
    entities: number;
  };
}
```

### Step 2.2: POI Filter Implementation
**Features**:
- **Search Input**: Real-time search with debouncing
- **Map Type Toggle**: Hagga Basin, Deep Desert, All
- **Privacy Level**: Public, Private, Shared checkboxes
- **Category Filters**: Hierarchical category selection
- **Grid Location**: Dropdown for Deep Desert grids
- **Creator Filter**: My POIs, All POIs toggle

**Filter Logic**:
```tsx
const filterPOIs = (pois: POI[], filters: POIFilters) => {
  return pois.filter(poi => {
    // Search filter
    if (filters.search && !poi.title.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    
    // Map type filter
    if (filters.mapType !== 'all' && poi.map_type !== filters.mapType) {
      return false;
    }
    
    // Privacy level filter
    if (filters.privacyLevel.length > 0 && !filters.privacyLevel.includes(poi.privacy_level)) {
      return false;
    }
    
    // Category filter
    if (filters.categories.length > 0 && !filters.categories.includes(poi.poi_type_id)) {
      return false;
    }
    
    return true;
  });
};
```

### Step 2.3: Entity Filter Implementation
**Features**:
- **Search Input**: Name and description search
- **Type Toggle**: Items, Schematics, Both
- **Category Hierarchy**: Category → Type → Subtype selection
- **Tier Selection**: Multi-select tier buttons (T1-T7)
- **Scope Filter**: Global entities, Custom entities

**Advanced Features**:
- **Quick Filters**: Weapons, Armor, Resources, Buildings
- **Recent Entities**: Last 10 entities user worked with
- **Favorites**: Starred entities for quick access

---

## Phase 3: Selection Panels (Days 5-6)

### 🎯 Objectives
1. Implement POI selection interface
2. Build entity selection interface  
3. Add multi-selection capabilities
4. Create view mode toggles (List, Grid, Map)

### Step 3.1: POI Panel Implementation
**File**: `src/components/poi-linking/panels/POIsPanel.tsx`

**View Modes**:
- **List View**: Detailed cards with checkboxes
- **Grid View**: Compact grid layout
- **Map View**: Mini-map with selectable POIs

**POI Card Features**:
```tsx
interface POICardProps {
  poi: POI;
  isSelected: boolean;
  onToggle: (id: string) => void;
  existingLinks: number;
  canEdit: boolean;
}
```

**Card Display**:
- **Icon & Title**: POI type icon and name
- **Privacy Badge**: Public/Private/Shared indicator
- **Location Info**: Map type and grid/coordinates
- **Creator Info**: Username and creation date
- **Link Count**: Number of existing entity links
- **Quick Actions**: View details, edit (if permissions)

### Step 3.2: Entity Panel Implementation
**File**: `src/components/poi-linking/panels/EntitiesPanel.tsx`

**Entity Card Features**:
```tsx
interface EntityCardProps {
  entity: Entity;
  isSelected: boolean;
  onToggle: (id: string) => void;
  linkedPOIs: number;
  tier: Tier;
}
```

**Card Display**:
- **Icon & Name**: Entity icon and display name
- **Tier Badge**: Color-coded tier indicator
- **Category Info**: Category and type labels
- **Description**: Brief entity description
- **Link Count**: Number of POIs already linked
- **Quick Info**: Crafting requirements, uses, etc.

### Step 3.3: Bulk Operations
**Features**:
- **Select All Filtered**: Select all items matching current filters
- **Clear Selection**: Deselect all items
- **Invert Selection**: Toggle selection state
- **Save Selection**: Save current selection as preset
- **Load Preset**: Quick selection restoration

---

## Phase 4: Selection Summary & Actions (Days 7-8)

### 🎯 Objectives
1. Implement selection summary panel
2. Build link creation workflow
3. Add duplicate detection and preview
4. Create bulk action capabilities

### Step 4.1: Selection Summary Panel
**File**: `src/components/poi-linking/panels/SelectionSummaryPanel.tsx`

**Summary Display**:
- **Selected POIs**: List with remove buttons
- **Selected Entities**: List with remove buttons  
- **Link Preview**: Statistics and duplicate detection
- **Quick Actions**: Manage links, link history

**Preview Calculations**:
```tsx
interface LinkPreview {
  newLinks: number;          // Links to be created
  duplicates: number;        // Existing links that would be skipped
  totalAfterLinking: number; // Final total link count
  estimatedTime: string;     // Time estimate for bulk operation
}
```

### Step 4.2: Link Creation Workflow
**Process**:
1. **Validation**: Check permissions and data integrity
2. **Duplicate Detection**: Identify existing links
3. **Preview Modal**: Show user what will be created
4. **Batch Processing**: Create links with progress indication
5. **Result Summary**: Success/failure report

**Confirmation Modal**:
- **Summary Statistics**: New links, duplicates, totals
- **Detailed Preview**: List of specific links to create
- **Options**: Skip duplicates, update quantities, add notes
- **Progress Tracking**: Real-time creation progress

### Step 4.3: Link Management Features
**Quick Actions**:
- **Manage Links**: Open link management interface
- **Link History**: View creation/modification history
- **Export Links**: Download link data as CSV
- **Templates**: Save/load common link patterns

---

## Phase 5: Link History & Management (Days 9-10)

### 🎯 Objectives
1. Implement comprehensive link history tracking
2. Build link management interface
3. Add audit trail functionality
4. Create reporting and analytics

### Step 5.1: History Tracking System
**Database Triggers**:
```sql
-- Automatic history tracking
CREATE OR REPLACE FUNCTION track_poi_entity_link_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO poi_entity_link_history (
            poi_id, entity_id, action_type, new_values, performed_by
        ) VALUES (
            NEW.poi_id, NEW.entity_id, 'created', 
            to_jsonb(NEW), NEW.added_by
        );
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO poi_entity_link_history (
            poi_id, entity_id, action_type, old_values, new_values, performed_by
        ) VALUES (
            NEW.poi_id, NEW.entity_id, 'updated',
            to_jsonb(OLD), to_jsonb(NEW), NEW.updated_by
        );
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO poi_entity_link_history (
            poi_id, entity_id, action_type, old_values, performed_by
        ) VALUES (
            OLD.poi_id, OLD.entity_id, 'deleted',
            to_jsonb(OLD), auth.uid()
        );
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;
```

### Step 5.2: Link Management Interface
**File**: `src/components/poi-linking/modals/LinkHistoryModal.tsx`

**Features**:
- **History Timeline**: Chronological view of all changes
- **Filter Options**: By user, date range, action type
- **Search**: Find specific POIs or entities
- **Bulk Operations**: Delete multiple links, update quantities
- **Export**: Download history as CSV/JSON

**History Entry Display**:
```tsx
interface HistoryEntry {
  id: string;
  poiName: string;
  entityName: string;
  actionType: 'created' | 'updated' | 'deleted';
  performedBy: string;
  performedAt: Date;
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
}
```

---

## Phase 6: Advanced Features & Polish (Days 11-12)

### 🎯 Objectives
1. Add advanced filtering and search
2. Implement keyboard shortcuts
3. Add data export/import capabilities
4. Performance optimization and polish

### Step 6.1: Advanced Search
**Features**:
- **Fuzzy Search**: Typo-tolerant search with scoring
- **Boolean Operators**: AND, OR, NOT support
- **Field-Specific Search**: Search within specific fields
- **Saved Searches**: Store and recall complex queries

**Search Syntax**:
```
Basic: "water reclaimer"
Field: title:"spice" category:"resource"
Boolean: (weapons OR armor) AND tier:3
Exclusion: resources NOT rare
```

### Step 6.2: Keyboard Shortcuts
**Navigation**:
- `Ctrl+1/2/3/4`: Focus panels (Filters/POIs/Entities/Summary)
- `Tab`: Navigate between focusable elements
- `Space`: Toggle selection on focused items
- `Ctrl+A`: Select all filtered items
- `Escape`: Clear selection or close modals

**Actions**:
- `Ctrl+Enter`: Create links (from summary panel)
- `Ctrl+H`: Open history modal
- `Ctrl+F`: Focus search input
- `Ctrl+S`: Save current selection as preset

### Step 6.3: Data Import/Export
**Export Formats**:
- **CSV**: Compatible with Excel/Google Sheets
- **JSON**: For backup/restore or API integration
- **PDF Report**: Formatted link summary for sharing

**Import Capabilities**:
- **CSV Import**: Bulk link creation from spreadsheet
- **Validation**: Check for valid POI/Entity IDs
- **Preview**: Show import results before committing
- **Error Handling**: Clear feedback for invalid data

---

## Performance Considerations

### 🚀 Optimization Strategies

#### Database Optimization
- **Indexed Queries**: Proper indexes on foreign keys and search fields
- **Pagination**: Server-side pagination for large datasets
- **Caching**: Redis cache for frequently accessed data
- **Batch Operations**: Bulk inserts/updates for link creation

#### Frontend Optimization  
- **Virtual Scrolling**: Handle large lists efficiently
- **Debounced Search**: Prevent excessive API calls
- **Memoization**: Cache expensive calculations
- **Code Splitting**: Lazy load modals and heavy components

#### API Design
- **GraphQL/REST Hybrid**: Efficient data fetching
- **Response Caching**: Cache stable data (entities, categories)
- **Optimistic Updates**: Immediate UI feedback
- **Error Boundaries**: Graceful error handling

---

## Testing Strategy

### 🧪 Test Coverage

#### Unit Tests
- **Filter Logic**: Test all filter combinations
- **Selection State**: Verify state management
- **Link Validation**: Test permission and data checks
- **Utility Functions**: Search, formatting, calculations

#### Integration Tests  
- **API Integration**: Test all CRUD operations
- **Component Integration**: Test panel interactions
- **State Synchronization**: Verify cross-panel updates
- **Permission System**: Test access control

#### E2E Tests
- **Complete Workflow**: POI → Entity → Link creation
- **Error Scenarios**: Network failures, permission errors
- **Performance**: Large dataset handling
- **Browser Compatibility**: Chrome, Firefox, Safari, Edge

---

## Risk Assessment & Mitigation

### 🚨 High Risk Items

#### Performance with Large Datasets
- **Risk**: Slow response with 1000+ POIs/Entities
- **Mitigation**: Implement virtual scrolling, pagination, server-side filtering

#### Complex Permission System
- **Risk**: Users editing links they shouldn't access
- **Mitigation**: Server-side permission validation, clear UI indicators

#### Data Consistency
- **Risk**: Links to deleted POIs/Entities
- **Mitigation**: Cascading deletes, orphan cleanup jobs

### 🔧 Medium Risk Items

#### Browser Compatibility
- **Risk**: Features not working in older browsers
- **Mitigation**: Progressive enhancement, polyfills, testing matrix

#### Mobile Responsiveness
- **Risk**: Poor experience on tablets/mobile
- **Mitigation**: Responsive design testing, touch-friendly controls

---

## Timeline & Milestones

| Phase | Duration | Key Deliverables | Dependencies |
|-------|----------|------------------|--------------|
| **Phase 1** | 2 days | Page setup, collapsible panels, base state management | None |
| **Phase 2** | 2 days | Complete filter system with real-time counters | Phase 1 |
| **Phase 3** | 2 days | POI/Entity selection panels with multi-selection | Phase 1-2 |
| **Phase 4** | 2 days | Selection summary, link creation, duplicate detection | Phase 1-3 |
| **Phase 5** | 2 days | Link history, management interface, audit trail | Phase 4 |
| **Phase 6** | 2 days | Advanced features, keyboard shortcuts, polish | All previous |

**Total Estimated Time**: 12 development days
**Critical Path**: Phase 1 → Phase 2 → Phase 3 → Phase 4
**Parallel Work Possible**: Phase 5 can start after Phase 4, Phase 6 polish ongoing

---

## Success Criteria

### ✅ Functional Requirements
- [ ] All 4 panels collapse/expand correctly
- [ ] Filters work with real-time counters
- [ ] Multi-selection with bulk operations
- [ ] Link creation with duplicate detection
- [ ] History tracking and management
- [ ] Permission system enforced
- [ ] Performance acceptable with large datasets

### ✅ Technical Requirements
- [ ] TypeScript compilation without errors
- [ ] 95%+ test coverage for critical paths
- [ ] Responsive design down to 1024px width
- [ ] Keyboard navigation fully functional
- [ ] Error handling with user feedback
- [ ] Data export/import working

### ✅ User Experience Requirements
- [ ] Intuitive interface requiring minimal training
- [ ] Fast response times (<2s for most operations)
- [ ] Clear visual feedback for all actions
- [ ] Consistent with existing app design
- [ ] Accessible to users with disabilities

---

## Implementation Notes

### 🔧 Technical Decisions

#### State Management
- **Choice**: React Context + useReducer
- **Rationale**: Complex state with multiple panels, avoid Redux overhead
- **Alternative**: Zustand for simpler global state

#### Styling Approach
- **Choice**: Tailwind CSS + existing design system
- **Rationale**: Consistency with current app, rapid development
- **Components**: Reuse existing POI card patterns

#### Data Fetching
- **Choice**: React Query for caching and synchronization
- **Rationale**: Optimistic updates, background refetching, cache management
- **Fallback**: Custom hooks with fetch if React Query adds complexity

### 📋 Development Standards
- **Code Style**: ESLint + Prettier configuration
- **Component Pattern**: Functional components with hooks
- **File Organization**: Feature-based folder structure
- **Documentation**: JSDoc comments for complex functions
- **Git Workflow**: Feature branches with PR reviews

This comprehensive plan provides a roadmap for implementing a production-ready POI Entity Linking system that matches the quality and functionality of the existing Dune Awakening tracker application. 