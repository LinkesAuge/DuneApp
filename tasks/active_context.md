# Active Context

**Date**: January 30, 2025  
**Current Focus**: POI Link Manager - Tree View Implementation  
**Status**: Day 1 Complete ✅ - Day 2 Ready for Implementation  

## 🎯 **Current Development Priority**

### **POI Link Manager - Tree View Implementation** 
- **Progress**: 40% Complete - Days 1-2 Foundation & Main Structure ✅ Complete  
- **Timeline**: 5 development days (Days 1-2 ✅ | Days 3-5 📋 Pending)
- **Focus**: Management interface for existing POI-Entity links with tree view, bulk operations, and cross-page selection

**Day 1 ✅ COMPLETED:**
1. ✅ **Foundation Setup Complete**: Database hooks and POI links data fetching operational
2. ✅ **Type Definitions**: Comprehensive TypeScript interfaces in `src/types/poi-link-manager.ts`
3. ✅ **usePOILinks Hook**: Full CRUD operations, pagination, filtering, sorting implemented
4. ✅ **Build Verification**: TypeScript compilation successful, no errors
5. ✅ **Test Component**: Created POILinksTest for foundation validation at `/test/poi-links`

**Day 2 ✅ COMPLETED:**
1. ✅ **Main Page Structure**: POILinkManagerPage layout with two-panel design implemented
2. ✅ **Route Integration**: `/poi-link-manager` route added to App.tsx routing
3. ✅ **Navbar Integration**: "POI Link Manager" added to Database dropdown menu
4. ✅ **Tree View Foundation**: Tree view panel with POI/Entity nodes, selection mode, expand/collapse
5. ✅ **Entity Icon Integration**: ImagePreview component integration following existing patterns

**Day 3 📋 NEXT PRIORITY:**
1. 📋 **Filters Panel Implementation**: Build POI Link specific filters (POI types, entity categories, date ranges)
2. 📋 **Tree View Enhancement**: Complete tree functionality with proper data binding
3. 📋 **Selection State Management**: Implement cross-page selection persistence
4. 📋 **Bulk Operations**: Delete confirmation modals and bulk delete implementation

**Current Status:**
- ✅ **Database Integration**: POI links data fetching with manual approach working (bypassed JOIN issues)
- ✅ **Data Transformation**: Tree structure conversion from flat database results functional
- ✅ **State Management**: Pagination, sorting, filtering state management complete
- ✅ **TypeScript Safety**: All interfaces and types properly defined
- ✅ **UI Components**: Main page structure and tree view foundation implemented
- ✅ **Navigation**: Route and navbar integration complete
- 📋 **Filters Panel**: Ready to implement POI Link specific filtering
- 📋 **Advanced Tree Features**: Selection persistence and bulk operations pending

---

## 🔄 **Secondary Projects**

### **POI Entity Linking System - Map View Integration**
**Status**: 📋 **ON HOLD** - Deprioritized for POI Link Manager  
**Progress**: 33% Complete - Phases 1-2 complete, Phase 3 planned  
**Note**: This enhances the existing POI linking page with map view functionality. Will resume after POI Link Manager completion.

---

## 📋 **Technical Implementation Details**

### **Day 1 Foundation Architecture:**

**Core Files Created:**
- `src/types/poi-link-manager.ts`: Complete type definitions
- `src/hooks/usePOILinks.ts`: Database operations hook 
- `src/components/test/POILinksTest.tsx`: Foundation validation

**Database Query Structure:**
```sql
-- JOIN query fetches POI + Entity + Link data in single operation
SELECT poi_item_links.*, pois.*, entities.*
FROM poi_item_links
JOIN pois ON poi_item_links.poi_id = pois.id  
JOIN entities ON poi_item_links.entity_id = entities.id
ORDER BY pois.created_at DESC
```

**Tree Transformation Logic:**
- Raw query results → POI-grouped structure
- Default POI expansion state: `true`
- Entity sorting: Alphabetical within each POI
- Pagination: 50 links per page with cross-page selection support

### **Day 2 Implementation Plan:**

**Main Components to Build:**
1. `src/pages/POILinkManagerPage.tsx`: Primary page layout
2. `src/components/poi-link-manager/POILinkFiltersPanel.tsx`: Specialized filters
3. Route integration: `/poi-link-manager` with navbar dropdown

**Layout Strategy:**
- **Left Panel**: Filters (reuse existing FiltersPanel patterns)
- **Right Panel**: Tree view (build custom tree components)
- **Panel Widths**: Match Hagga Basin page panel proportions
- **Responsive**: Desktop-only as per project requirements

---

## 🎯 **Next Steps**

### **Immediate Actions for Day 2:**
1. **Create POILinkManagerPage.tsx**: Two-panel layout with filters integration
2. **Add Route Configuration**: `/poi-link-manager` in App.tsx routing
3. **Navbar Integration**: Add "POI Link Manager" to Database dropdown
4. **Test Layout**: Verify panel proportions and filter functionality

### **Success Criteria for Day 2:**
- ✅ Page accessible at `/poi-link-manager` route
- ✅ Two-panel layout operational 
- ✅ Filters panel integrated and functional
- ✅ Basic tree view placeholder implemented
- ✅ Navigation from navbar working

---

## 💡 **Key Implementation Insights**

### **Day 1 Lessons Learned:**
1. **Import Path Strategy**: Relative imports work better than alias imports for build consistency
2. **Data Transformation**: Grouping flat database results into tree structure requires careful POI deduplication
3. **Hook Architecture**: Comprehensive state management in single hook reduces component complexity  
4. **TypeScript Benefits**: Extensive interface definitions catch integration issues early

### **User Requirements Integration:**
- ✅ **Cross-page Selection**: Foundation supports persistent selection state
- ✅ **Bulk Operations**: Delete operations for individual links and POI groups
- ✅ **Edit Workflow**: Navigation to POI linking page with preselection parameters
- ✅ **Tree Structure**: POI parent → Entity children with expand/collapse capabilities

**Key Implementation Goals:**
1. 📋 **Phase 1 NEXT**: Database & Hooks - Foundation setup with POI links data fetching
2. 📋 **Phase 2**: Main Page Structure - Layout with filters panel and tree view
3. 📋 **Phase 3**: Tree View Components - POI nodes with expandable entity children
4. 📋 **Phase 4**: State Management & Actions - Selection persistence and bulk operations
5. 📋 **Phase 5**: Integration & Polish - Edit workflow and confirmation modals

## 🗂️ **POI Link Manager Specifications**

### **Core Feature Overview**
- **Purpose**: Management interface for viewing, editing, and deleting existing POI-Entity links
- **Route**: `/poi-link-manager` (Database dropdown menu)
- **View**: Tree structure with POIs as parent nodes, linked entities as children
- **Operations**: Individual/bulk delete, edit workflow, cross-page selection persistence

### **User Interface Requirements**
- **Tree Structure**: POIs collapsible/expandable with persist state, visual hierarchy with indentation + icons
- **Default State**: POIs expanded by default, collapse/expand all buttons available
- **Selection Modes**: Normal view + "Select Mode" for bulk operations
- **Pagination**: Traditional pagination (50 items default), selection persists across pages
- **Visual Indicators**: "X items selected across Y pages" banner when cross-page selections active

### **Implementation Plan - 5 Days**

#### **Day 1: Foundation Setup**
```typescript
// New hook: src/hooks/usePOILinks.ts
interface UsePOILinksReturn {
  poiLinks: POILinkTreeNode[];
  loading: boolean;
  pagination: PaginationState;
  sorting: SortingState;
  totalCount: number;
  
  // Actions
  deleteLink: (linkId: string) => Promise<void>;
  bulkDeleteLinks: (linkIds: string[]) => Promise<void>;
  refreshData: () => void;
}

// Query structure
const fetchPOILinksQuery = `
  SELECT 
    poi_item_links.*,
    pois.id as poi_id, pois.title, pois.created_at as poi_created_at,
    entities.id as entity_id, entities.name as entity_name, entities.icon
  FROM poi_item_links
  JOIN pois ON poi_item_links.poi_id = pois.id  
  JOIN entities ON poi_item_links.entity_id = entities.id
  ORDER BY pois.created_at DESC
`;
```

#### **Day 2: Main Page Structure**
```typescript
// src/pages/POILinkManagerPage.tsx
const POILinkManagerPage = () => {
  return (
    <div className="flex h-screen" style={{ height: 'calc(100vh - 4rem)' }}>
      {/* Left Panel - Filters (reuse existing) */}
      <POILinkFiltersPanel />
      
      {/* Right Panel - Tree View */}
      <POILinkTreePanel />
    </div>
  );
};
```

#### **Day 3: Tree View Components**
- **POILinkTreeView**: Main tree container with selection mode, expanded state management
- **POITreeNode**: Individual POI with entity children, expand/collapse functionality
- **EntityTreeNode**: Individual entity links with edit/delete actions
- **SelectionBanner**: Cross-page selection indicator and bulk actions

#### **Day 4: State Management & Actions**
- **Tree Selection State**: Cross-page persistent selection with `useTreeSelection` hook
- **Edit Navigation**: Redirect to POI linking page with preselected POI + all entities
- **Delete Operations**: Individual confirmation + bulk delete with summary modal

#### **Day 5: Integration & Polish**
- **Preselection Integration**: Enhance POI linking page with URL params (`?poi=123&entities=456,789`)
- **Confirmation Modals**: Reuse styled ConfirmationModal with deletion summaries
- **Final Testing**: Cross-page selection, filter integration, state persistence

### **Technical Requirements**
- **Sorting**: Default by POI link creation date (latest first), entities alphabetically within POIs
- **Filter Integration**: Reuse existing FiltersPanel logic adapted for link-specific filtering
- **Selection Persistence**: Maintain selections across pagination and filter changes (keep valid selections)
- **Edit Workflow**: Navigate to existing POI linking page with preselection of POI + all linked entities
- **Bulk Operations**: Select entire POIs (all entities) or individual entity links, mixed selection supported

### **Data Structures**
```typescript
interface POILinkTreeNode {
  poi: POI;
  entities: Array<{
    entity: Entity;
    linkId: string;
    quantity?: number;
    notes?: string;
    created_at: string;
  }>;
  expanded: boolean;
  totalLinks: number;
}

interface POILinkFilters {
  search: string;
  mapType: 'hagga_basin' | 'deep_desert' | 'both';
  poiCategories: string[];
  entityTypes: string[];
  dateRange: [Date, Date] | null;
  createdBy: string[];
}
```

## 📂 **Key Files for Implementation**

### **New Components (To Create)**
```
src/pages/POILinkManagerPage.tsx                     # NEW - Main page
src/components/poi-link-manager/POILinkFiltersPanel.tsx    # NEW - Filter adaptation
src/components/poi-link-manager/POILinkTreeView.tsx        # NEW - Tree container
src/components/poi-link-manager/POITreeNode.tsx           # NEW - POI tree nodes
src/components/poi-link-manager/EntityTreeNode.tsx        # NEW - Entity children
src/components/poi-link-manager/SelectionBanner.tsx       # NEW - Cross-page selection UI
src/hooks/usePOILinks.ts                                  # NEW - Data fetching
src/hooks/useTreeSelection.ts                             # NEW - Selection state
src/types/poi-link-manager.ts                            # NEW - Type definitions
```

### **Enhanced Components (To Update)**
```
src/pages/POIEntityLinkingPage.tsx                   # Add URL param preselection
src/components/common/Navbar.tsx                     # Add POI Link Manager menu item
```

### **Reused Components**
- FiltersPanel logic (adapted for POI link filtering)
- ConfirmationModal (existing styled modal)
- Pagination controls (existing pattern)

## 🎨 **Design & UX Specifications**

### **Tree View Structure**
```
📍 POI: Abandoned Facility A-7 (3 links)               [🗑️ Delete All] [✏️ Edit All] [➕ Add Item]
├── 🔫 Assault Rifle (Qty: 2)                         [✏️ Edit] [🗑️ Delete]
├── 🛡️ Combat Armor (Qty: 1)                          [✏️ Edit] [🗑️ Delete]
└── 💊 Medical Kit (Qty: 5)                           [✏️ Edit] [🗑️ Delete]

📍 POI: Military Outpost B-3 (2 links)
├── 🔫 Pistol (Qty: 3)                                [✏️ Edit] [🗑️ Delete]
└── 📦 Ammo Crate (Qty: 8)                            [✏️ Edit] [🗑️ Delete]
```

### **Selection Mode UI**
- **Normal Mode**: Individual edit/delete buttons visible
- **Select Mode**: Checkboxes appear, bulk actions bar at top
- **Cross-Page Banner**: "15 items selected across 3 pages" with clear and bulk delete options
- **Mixed Selection**: Support selecting entire POIs or individual entity links

### **Edit Workflow**
1. User clicks "Edit" on POI or "Edit All" → Navigate to `/poi-linking?poi=123&entities=456,789`
2. POI linking page preselects the POI + all currently linked entities
3. User can modify links and save changes
4. Return to POI Link Manager to see updates

## 🔄 **Relationship to Existing Systems**

### **POI Entity Linking System (Secondary Priority)**
- **Current Status**: 33% Complete (Phases 1-2 done, Phase 3 map view planned)
- **Relationship**: POI Link Manager manages what POI Entity Linking creates
- **Integration**: Edit workflow navigates from manager to linking page
- **Priority**: On hold until POI Link Manager complete

### **Component Reuse Strategy**
- **Filters**: Adapt existing FiltersPanel for POI link filtering
- **Modals**: Reuse ConfirmationModal with deletion summaries
- **Pagination**: Use existing pagination patterns and controls
- **Styling**: Maintain Dune theming throughout tree interface

## 📈 **Success Metrics**

### **POI Link Manager Completion Criteria**
- [ ] 🎯 Tree view displays POI-entity relationships correctly
- [ ] 🎯 Cross-page selection persists and shows accurate counts
- [ ] 🎯 Bulk delete operations work with confirmation summaries
- [ ] 🎯 Edit workflow navigates to POI linking with proper preselection
- [ ] 🎯 Filter integration works with existing patterns
- [ ] 🎯 Expand/collapse state persists during navigation
- [ ] 🎯 Performance acceptable with large datasets (1000+ links)

### **Integration Success**
- POI Link Manager and POI Entity Linking work seamlessly together
- Navigation between management and creation interfaces feels natural
- Data consistency maintained across both interfaces
- Dune theming consistent throughout new components

**Next Review**: After POI Link Manager Day 2 implementation - evaluate tree view foundation and adjust timeline if needed. 