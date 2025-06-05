# Remove Subtypes: Comprehensive Migration Guide

This guide covers the complete removal of subtypes from the Dune Awakening Deep Desert Tracker application. This is a major structural change that affects database schema, TypeScript interfaces, and numerous components.

## ⚠️ **WARNING: BREAKING CHANGE**
This migration will break the application until ALL steps are completed. Plan for downtime during the migration.

## 🗂️ **Overview of Changes**

### Database Changes
- ✅ Drop `subtypes` table entirely
- ✅ Remove `subtype_id` column from `entities` table
- ✅ Updated migration script handles these changes

### Code Changes Required
- Remove subtype interfaces and types
- Update all entity-related components
- Remove subtype management from admin panels
- Update filtering and search logic
- Remove subtype references from forms and displays

---

## 📋 **Step-by-Step Migration Plan**

### Phase 1: Database Migration (✅ Ready)
```bash
# 1. Backup current database (CRITICAL!)
python backup_entities_before_reset.py

# 2. Run the updated reset script
python reset_entities_from_csv.py
```

### Phase 2: TypeScript Interface Updates

#### 2.1 Update `src/types/unified-entities.ts`
**REMOVE these interfaces entirely:**
```typescript
// DELETE: Subtype interface
export interface Subtype {
  id: number;
  name: string;
  type_id: number;
  icon?: string;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}
```

**UPDATE EntityWithRelations:**
```typescript
// BEFORE:
export interface EntityWithRelations extends Entity {
  category?: Category;
  type?: Type;
  subtype?: Subtype;  // ❌ REMOVE THIS LINE
}

// AFTER:
export interface EntityWithRelations extends Entity {
  category?: Category;
  type?: Type;
}
```

**UPDATE Entity interface:**
```typescript
// REMOVE this field from Entity interface:
subtype_id?: number | null;  // ❌ REMOVE THIS LINE
```

**UPDATE EntityFilters:**
```typescript
// REMOVE these fields:
subtype_id?: number;        // ❌ REMOVE
subtype_ids?: number[];     // ❌ REMOVE
```

#### 2.2 Update `src/types/index.ts`
Search for and remove all subtype-related interfaces and references.

### Phase 3: API Layer Updates

#### 3.1 Files to Update:
- `src/lib/api/entities.ts` - Remove subtype filtering
- `src/lib/api/entities-normalized.ts` - Remove subtype logic
- `src/hooks/useEntityAPI.ts` - Remove subtype operations
- `src/hooks/useItemsSchematics.ts` - Remove subtype references

**Remove from API calls:**
- Any subtype CRUD operations
- Subtype filtering parameters
- Subtype joins in queries

### Phase 4: Component Updates

#### 4.1 Admin Components
**Files to update:**
- `src/components/admin/` - Remove any SubtypeManager components
- `src/components/items-schematics/SystemBuilder.tsx` - Remove subtype management
- `src/components/items-schematics/CategoryHierarchyNav.tsx` - Remove subtype navigation

#### 4.2 Form Components
**Update entity creation/editing forms:**
- Remove subtype selection dropdowns
- Remove subtype validation logic
- Update form submission to exclude subtype_id

#### 4.3 Display Components
**Files to update:**
- `src/components/items-schematics/ItemsSchematicsContent.tsx`
- `src/components/items-schematics/EntityCard.tsx`
- `src/components/poi-linking/` - All components using entity display

**Changes needed:**
- Remove subtype from entity display cards
- Remove subtype from entity details
- Remove subtype from breadcrumbs/navigation

#### 4.4 Filter Components
**Files to update:**
- `src/components/filters/EntityFilters.tsx`
- `src/hooks/useFilterState.ts`
- `src/components/items-schematics/FiltersPanel.tsx`

**Changes:**
- Remove subtype filter controls
- Remove subtype from filter state
- Update filter application logic

### Phase 5: Search and Navigation

#### 5.1 Search Components
**Update search logic to remove:**
- Subtype search parameters
- Subtype results grouping
- Subtype-based sorting

#### 5.2 Navigation Components
**Update hierarchy navigation:**
- Remove subtype levels from breadcrumbs
- Update category → type navigation (skip subtype level)
- Update URL routing to exclude subtype paths

---

## 🔍 **Files Requiring Updates**

### High Priority (Application Breaking)
1. `src/types/unified-entities.ts` ⚠️ **CRITICAL**
2. `src/types/index.ts` ⚠️ **CRITICAL**
3. `src/lib/api/entities.ts` ⚠️ **CRITICAL**
4. `src/hooks/useEntityAPI.ts` ⚠️ **CRITICAL**

### Medium Priority (Feature Breaking)
1. `src/components/items-schematics/SystemBuilder.tsx`
2. `src/components/items-schematics/CategoryHierarchyNav.tsx`
3. `src/components/items-schematics/ItemsSchematicsContent.tsx`
4. `src/components/filters/EntityFilters.tsx`
5. `src/hooks/useFilterState.ts`

### Low Priority (Display Issues)
1. Entity display components
2. POI linking components
3. Search result components
4. Navigation breadcrumbs

---

## 🔨 **Search Commands for Finding References**

Use these commands to find all subtype references:

```bash
# Find all subtype references
grep -r "subtype" src/ --include="*.ts" --include="*.tsx"

# Find specific patterns
grep -r "subtype_id" src/ --include="*.ts" --include="*.tsx"
grep -r "Subtype" src/ --include="*.ts" --include="*.tsx"
grep -r "subtypes" src/ --include="*.ts" --include="*.tsx"

# Find interface definitions
grep -r "interface.*Subtype" src/ --include="*.ts"
```

---

## ✅ **Validation Checklist**

After completing all changes:

### Database Validation
- [ ] `subtypes` table no longer exists
- [ ] `entities` table has no `subtype_id` column
- [ ] All entities imported successfully
- [ ] Foreign key constraints still work

### TypeScript Validation
- [ ] No TypeScript compilation errors
- [ ] All subtype interfaces removed
- [ ] No references to subtype_id in Entity interface
- [ ] EntityWithRelations has no subtype property

### Application Validation
- [ ] Entity creation/editing works without subtypes
- [ ] Filtering works without subtype options
- [ ] Search works without subtype parameters
- [ ] Navigation works without subtype levels
- [ ] POI entity linking works
- [ ] Admin panels work without subtype management

### User Interface Validation
- [ ] No broken subtype dropdowns
- [ ] No subtype references in entity displays
- [ ] Category → Type navigation works smoothly
- [ ] Breadcrumbs show correct hierarchy
- [ ] Filter panels don't show subtype options

---

## 🚨 **Troubleshooting**

### Common Issues

**TypeScript Errors:**
- Look for remaining subtype interface references
- Check for subtype_id property access
- Verify all imports are updated

**Runtime Errors:**
- Check for API calls still including subtype parameters
- Verify database queries don't reference subtypes table
- Check for subtype filtering in components

**Display Issues:**
- Look for components still trying to display subtype information
- Check breadcrumb/navigation components
- Verify entity cards don't reference subtype properties

### Emergency Rollback
If critical issues occur, use the backup restore script:
```bash
python restore_from_backup_[timestamp].py
```

---

## 📞 **Implementation Support**

1. **Start with Database Migration** - Run the updated reset script first
2. **Fix TypeScript Interfaces** - This will reveal most breaking changes
3. **Update API Layer** - Fix data flow issues
4. **Update Components** - Fix UI and user experience
5. **Test Thoroughly** - Validate all functionality works

**Remember:** This is a breaking change that affects the core data model. Plan accordingly and ensure you have reliable backups before starting. 