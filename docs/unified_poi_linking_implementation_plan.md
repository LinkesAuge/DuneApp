# Unified POI Linking System - Implementation Plan

## Overview
Replace the current separate POI linking workflows with a unified, bidirectional system that allows users to select multiple POIs and multiple items/schematics and create bulk links efficiently.

## Key Requirements
- **Replace** (not add to) the current `/pois/:id/link-items` page
- **Side-by-side layout**: POI panel (wider) | Items/Schematics panel
- **Selection summary** header showing current selections from both sides
- **Multiple entry points**: All existing chain link icons + new Database dropdown
- **Full filtering**: POI filters (like map pages) + Item/Schematic filters (like items/schematics page)
- **Map integration**: Keep both Hagga Basin and Deep Desert map views
- **Simplified linking**: Only "found_here" link type
- **Free-form selection**: Users can select from both sides in any order
- **Confirmation modal**: Shows all pending links, user confirms/cancels
- **Keep current design language**: Adapt existing styling to new layout

---

## Phase 1: Infrastructure & Navigation Setup

### Step 1: Create Database Dropdown in Navbar
**Goal:** Add dropdown menu to Database nav item  
**Outcome:** Users can access both Database Management and POI Linking from navbar  
**Tasks:**
- Modify `Navbar.tsx` to convert "Database" to dropdown
- Add "Database Management" (default click) and "POI Linking" options
- Style dropdown to match existing navbar design
- Ensure dropdown closes on selection

**Files to modify:**
- `src/components/common/Navbar.tsx`

### Step 2: Update Routing Structure
**Goal:** Extend current routing to support new unified page  
**Outcome:** URL routing works for all entry points with pre-selection  
**Tasks:**
- Keep `/pois/:id/link-items` route but make it redirect to new unified route
- Create new `/linking` route with optional query params for pre-selection
- Add query param support: `?poi_ids=xxx&item_ids=xxx&schematic_ids=xxx`
- Update all existing chain link buttons to use new routing

**Files to modify:**
- `src/App.tsx`
- `src/components/common/POICard.tsx`
- `src/components/common/POIPreviewCard.tsx`
- `src/components/items-schematics/LinkPoisButton.tsx`

---

## Phase 2: Layout & Component Structure

### Step 3: Create New Unified Linking Page Layout
**Goal:** Establish the core page structure  
**Outcome:** Basic layout with resizable panels is functional  
**Tasks:**
- Create `UnifiedLinkingPage.tsx` component
- Implement side-by-side layout (70% POI panel, 30% Items panel)
- Add selection summary header
- Add action bar at bottom with link creation button
- Style to match existing design language

**Files to create:**
- `src/pages/UnifiedLinkingPage.tsx`
- `src/components/linking/LinkingLayout.tsx`
- `src/components/linking/SelectionSummary.tsx`
- `src/components/linking/LinkingActionBar.tsx`

### Step 4: Create POI Selection Panel Component
**Goal:** Build enhanced POI selection with full filtering  
**Outcome:** Users can filter and select POIs with map integration  
**Tasks:**
- Create `PoiSelectionPanel.tsx` component
- Port existing POI filtering from map pages (search, type filters, categories)
- Add map toggle (Hagga Basin / Deep Desert grid)
- Implement multi-selection with checkboxes
- Add "Select All Filtered" option
- Show selection count and clear selection option

**Files to create:**
- `src/components/linking/PoiSelectionPanel.tsx`
- `src/components/linking/PoiFilterControls.tsx`
- `src/components/linking/PoiMapView.tsx`
- `src/components/linking/PoiListView.tsx`

### Step 5: Create Items/Schematics Selection Panel
**Goal:** Build enhanced items/schematics selection with filtering  
**Outcome:** Users can filter and select items/schematics efficiently  
**Tasks:**
- Create `ItemSchematicSelectionPanel.tsx` component
- Port filtering from existing items/schematics page (categories, types, tiers, search)
- Add view mode toggle (grid/list)
- Implement multi-selection with checkboxes
- Add tab switching between Items and Schematics
- Show selection count per type

**Files to create:**
- `src/components/linking/ItemSchematicSelectionPanel.tsx`
- `src/components/linking/ItemSchematicFilterControls.tsx`
- `src/components/linking/ItemSchematicGridView.tsx`
- `src/components/linking/ItemSchematicListView.tsx`

---

## Phase 3: Selection Management & State

### Step 6: Implement Global Selection State
**Goal:** Manage selections across both panels  
**Outcome:** Selections persist and sync across components  
**Tasks:**
- Create `useLinkingState` hook for state management
- Track selected POI IDs, item IDs, schematic IDs
- Handle pre-selection from URL params
- Implement selection/deselection logic
- Add validation (at least one from each side required)

**Files to create:**
- `src/hooks/useLinkingState.ts`
- `src/lib/linkingUtils.ts`

### Step 7: Build Selection Summary Component
**Goal:** Display current selections clearly  
**Outcome:** Users always know what they've selected  
**Tasks:**
- Create `SelectionSummary.tsx` component
- Show counts: "X POIs, Y Items, Z Schematics selected"
- Add clear all selections option
- Show validation status (ready to create links or not)
- Add expand/collapse for detailed selection list

**Files to enhance:**
- `src/components/linking/SelectionSummary.tsx` (from Step 3)

---

## Phase 4: Filtering & Search Enhancement

### Step 8: Implement POI Filtering System
**Goal:** Comprehensive POI filtering matching map pages  
**Outcome:** Users can efficiently find and select relevant POIs  
**Tasks:**
- Port search functionality from existing map pages
- Add POI type filtering with category grouping
- Add region filtering (Hagga Basin / Deep Desert)
- Add privacy level filtering (if applicable)
- Implement filter persistence and clear filters option

**Files to enhance:**
- `src/components/linking/PoiFilterControls.tsx` (from Step 4)

### Step 9: Implement Items/Schematics Filtering
**Goal:** Comprehensive item/schematic filtering  
**Outcome:** Users can efficiently find relevant items/schematics  
**Tasks:**
- Port category hierarchy filtering
- Add type and tier filtering
- Add search by name and description
- Add creator filtering
- Implement filter persistence and URL sync

**Files to enhance:**
- `src/components/linking/ItemSchematicFilterControls.tsx` (from Step 5)

---

## Phase 5: Map Integration & Visualization

### Step 10: Integrate Map Views
**Goal:** Maintain map functionality within POI panel  
**Outcome:** Users can select POIs visually from maps  
**Tasks:**
- Integrate `InteractiveMap` component for Hagga Basin
- Integrate `DeepDesertSelectionMode` for grid navigation
- Add map/list view toggle
- Implement POI selection directly from map clicks
- Show selected POIs with different visual styling

**Files to enhance:**
- `src/components/linking/PoiMapView.tsx` (from Step 4)

### Step 11: Add Visual Selection Indicators
**Goal:** Clear visual feedback for selections  
**Outcome:** Selected items are obviously marked across all views  
**Tasks:**
- Add selection checkboxes to all POI cards/markers
- Add selection checkboxes to all item/schematic cards
- Implement selected state styling (borders, backgrounds)
- Add batch selection tools (select all visible, select none)

**Files to enhance:**
- `src/components/linking/PoiListView.tsx` (from Step 4)
- `src/components/linking/ItemSchematicGridView.tsx` (from Step 5)
- `src/components/linking/ItemSchematicListView.tsx` (from Step 5)

---

## Phase 6: Link Creation & Validation

### Step 12: Verify Link Type Simplification
**Goal:** Ensure only "found_here" link type is used  
**Outcome:** Simplified linking without relationship type complexity  
**Tasks:**
- Check current `poiItemLinks.ts` implementation
- Update API calls to default to "found_here"
- Remove relationship type selection UI
- Update database migration if needed

**Files to check/modify:**
- `src/lib/api/poiItemLinks.ts`
- Any existing POI linking components

### Step 13: Build Link Creation Logic
**Goal:** Generate and validate potential links  
**Outcome:** System can create bulk links efficiently  
**Tasks:**
- Create link generation logic (cartesian product of selections)
- Add duplicate link detection and handling
- Implement batch link creation API calls
- Add error handling for failed link creation
- Create rollback mechanism for partial failures

**Files to create:**
- `src/lib/bulkLinkingUtils.ts`
- `src/hooks/useBulkLinking.ts`

---

## Phase 7: Confirmation & User Experience

### Step 14: Create Link Confirmation Modal
**Goal:** User confirmation before creating links  
**Outcome:** Users review and confirm all links before creation  
**Tasks:**
- Create `LinkConfirmationModal.tsx` component
- Display all pending links in organized table/list
- Show POI → Item/Schematic relationships clearly
- Add estimated link count and summary
- Implement confirm/cancel actions
- Add loading state during link creation

**Files to create:**
- `src/components/linking/LinkConfirmationModal.tsx`

### Step 15: Implement Success/Error Handling
**Goal:** Proper feedback after link creation  
**Outcome:** Users know the result of their actions  
**Tasks:**
- Add success notification with link count created
- Handle and display partial failure scenarios
- Clear selections after successful creation
- Add option to create more links or navigate away
- Log errors for debugging

**Files to enhance:**
- `src/components/linking/LinkConfirmationModal.tsx` (from Step 14)
- `src/hooks/useBulkLinking.ts` (from Step 13)

---

## Phase 8: Entry Point Integration

### Step 16: Update All Chain Link Icons
**Goal:** Route all existing link actions to new system  
**Outcome:** Consistent linking experience across the app  
**Tasks:**
- Update POI card chain link buttons
- Update POI preview card chain link buttons
- Update item/schematic detail page link buttons
- Add pre-selection logic for each entry point
- Test all navigation paths

**Files to modify:**
- `src/components/common/POICard.tsx`
- `src/components/common/POIPreviewCard.tsx`
- `src/components/items-schematics/LinkPoisButton.tsx`
- `src/pages/ItemDetailPage.tsx`
- `src/pages/SchematicDetailPage.tsx`

### Step 17: Replace Current Link Page
**Goal:** Complete migration from old to new system  
**Outcome:** No broken links or missing functionality  
**Tasks:**
- Remove old `PoiLinkingPage.tsx` component
- Update routing to redirect old URLs to new system
- Remove unused components and API calls
- Update any remaining references in documentation

**Files to remove:**
- `src/pages/PoiLinkingPage.tsx`
- Any related linking components that become obsolete

**Files to update:**
- `src/App.tsx` (routing)

---

## Phase 9: Testing & Polish

### Step 18: Comprehensive Testing
**Goal:** Ensure all functionality works correctly  
**Outcome:** Robust, bug-free linking system  
**Tasks:**
- Test all entry points and pre-selection scenarios
- Verify filtering works correctly on both sides
- Test bulk link creation with various combinations
- Validate error handling and edge cases
- Test performance with large selections

### Step 19: UI/UX Polish
**Goal:** Smooth, intuitive user experience  
**Outcome:** Professional, polished linking interface  
**Tasks:**
- Refine responsive design for different screen sizes
- Add loading states and smooth transitions
- Implement keyboard shortcuts for power users
- Add tooltips and help text where needed
- Final visual polish and consistency check

---

## Success Metrics
- ✅ Single unified page replaces all linking workflows
- ✅ Users can link multiple items/schematics to multiple POIs in one session
- ✅ All existing entry points work with pre-selection
- ✅ Filtering matches or exceeds current functionality
- ✅ Map integration maintained and enhanced
- ✅ Confirmation process prevents accidental bulk actions

## Technical Considerations
- **Performance**: Efficient handling of large datasets in both panels
- **State Management**: Clean separation of concerns between global and local state
- **API Optimization**: Batch operations to minimize network requests
- **Error Handling**: Graceful degradation and clear error messages
- **Accessibility**: Keyboard navigation and screen reader support
- **Mobile Responsiveness**: Collapsible panels for smaller screens

## Dependencies
- Existing POI filtering logic from map pages
- Existing item/schematic filtering from items/schematics page
- Current `InteractiveMap` and `DeepDesertSelectionMode` components
- `poiItemLinks.ts` API functions
- Current design system and styling patterns 