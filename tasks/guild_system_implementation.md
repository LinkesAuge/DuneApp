# Guild System Implementation Plan

**Date**: January 30, 2025  
**Status**: 📋 **PLANNING** - Ready for implementation  
**Estimated Timeline**: 3-4 weeks  
**Priority**: High - User-requested feature enhancement

## 🎯 **Project Overview**

Implement a comprehensive guild system for the Dune Awakening Deep Desert Tracker to enhance community organization and user management capabilities.

### **Guild System Features:**
- **Guild Management**: Create, edit, delete guilds with customizable styling
- **User Organization**: Assign users to guilds with hierarchical roles (Leader, Officer, Member)
- **Visual Integration**: Display guild tags next to usernames throughout the application
- **Self-Assignment**: Users can join/leave guilds autonomously
- **Admin Control**: Full guild management + guild leader permissions for their own guild

### **Simplified Requirements (Final):**
1. **Guild Leadership Transfer**: Admin-only (no complex transfer logic)
2. **Guild Deletion**: Members become unassigned (SET NULL cascade)
3. **One Guild Per User**: Simple data model (no multiple guild memberships)
4. **No Recruitment System**: Clean, direct join/leave functionality

---

## 🗃️ **Database Schema Implementation**

### **Phase 1A: Fix Joined Date Issue** ⚡
**Priority**: Critical Bug Fix  
**Estimated Time**: 2 hours

**Problem**: UserManagement.tsx displays `created_at` (which updates when profiles change) instead of immutable join date.

**Database Changes:**
```sql
-- Create immutable join date field
ALTER TABLE profiles ADD COLUMN actual_join_date TIMESTAMPTZ;

-- Backfill with current created_at values for existing users  
UPDATE profiles SET actual_join_date = created_at WHERE actual_join_date IS NULL;

-- Make field required for future records
ALTER TABLE profiles ALTER COLUMN actual_join_date SET NOT NULL;
ALTER TABLE profiles ALTER COLUMN actual_join_date SET DEFAULT NOW();
```

**Frontend Changes:**
- Update `UserManagement.tsx` line 339: `created_at` → `actual_join_date`
- Update `ProfilePage.tsx` to ensure consistency

### **Phase 1B: Guild System Database Schema**
**Estimated Time**: 4 hours

**New Tables:**
```sql
-- Guilds table with customizable styling
CREATE TABLE guilds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  tag_color VARCHAR(7) DEFAULT '#3B82F6', -- Background color for guild tag
  tag_text_color VARCHAR(7) DEFAULT '#FFFFFF', -- Text color for contrast
  display_order INTEGER DEFAULT 0, -- Admin ordering for guild lists
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX idx_guilds_display_order ON guilds(display_order);
CREATE INDEX idx_guilds_name ON guilds(name);
```

**Profile Table Extensions:**
```sql
-- Add guild membership fields to profiles
ALTER TABLE profiles ADD COLUMN guild_id UUID REFERENCES guilds(id) ON DELETE SET NULL;
ALTER TABLE profiles ADD COLUMN guild_role VARCHAR(20) CHECK (guild_role IN ('leader', 'officer', 'member'));
ALTER TABLE profiles ADD COLUMN guild_joined_at TIMESTAMPTZ;

-- Indexes for guild-related queries
CREATE INDEX idx_profiles_guild_id ON profiles(guild_id);
CREATE INDEX idx_profiles_guild_role ON profiles(guild_role);
```

**RLS Policies:**
```sql
-- Guild table policies
CREATE POLICY "Public read access to guilds" ON guilds FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage all guilds" ON guilds FOR ALL TO authenticated USING (
  auth.jwt() ->> 'role' = 'admin'
);
CREATE POLICY "Guild leaders can update their own guild" ON guilds FOR UPDATE TO authenticated USING (
  id IN (
    SELECT guild_id FROM profiles 
    WHERE id = auth.uid() AND guild_role = 'leader'
  )
);

-- Profile guild field policies  
CREATE POLICY "Users can read guild assignments" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update their own guild assignment" ON profiles FOR UPDATE TO authenticated USING (id = auth.uid());
CREATE POLICY "Admins can update any guild assignment" ON profiles FOR UPDATE TO authenticated USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Guild leaders can update their guild members" ON profiles FOR UPDATE TO authenticated USING (
  guild_id IN (
    SELECT guild_id FROM profiles 
    WHERE id = auth.uid() AND guild_role = 'leader'
  )
);
```

---

## 🧩 **TypeScript Interface Updates**

### **Phase 2A: Core Type Definitions**
**Estimated Time**: 2 hours

**File**: `src/types/profile.ts`
```typescript
// Guild role hierarchy
export type GuildRole = 'leader' | 'officer' | 'member';

// Guild entity interface
export interface Guild {
  id: string;
  name: string;
  description?: string;
  tag_color: string; // Hex color for guild tag background
  tag_text_color: string; // Hex color for guild tag text
  display_order: number;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
}

// Guild CRUD operation interfaces
export interface GuildCreateData {
  name: string;
  description?: string;
  tag_color: string;
  tag_text_color: string;
  display_order?: number;
}

export interface GuildUpdateData extends Partial<GuildCreateData> {
  id: string;
}

// Extended profile interface with guild fields
export interface EnhancedProfile {
  // ... existing fields
  guild_id?: string | null;
  guild?: Guild | null; // Populated via join
  guild_role?: GuildRole | null;
  guild_joined_at?: string | null;
  actual_join_date: string; // Fixed joined date field
}

// Guild management permissions
export interface GuildPermissions {
  canCreateGuilds: boolean;
  canEditGuild: (guildId: string) => boolean;
  canDeleteGuild: (guildId: string) => boolean;
  canAssignMembers: (guildId: string) => boolean;
  canManageGuildRoles: (guildId: string) => boolean;
}
```

### **Phase 2B: User Display Interface Updates**
**Estimated Time**: 1 hour

**File**: `src/types/index.ts`
```typescript
// Update User interface to include guild information
export interface User {
  // ... existing fields
  guild_id?: string | null;
  guild?: Guild | null;
  guild_role?: GuildRole | null;
}

// Enhanced user display for components throughout app
export interface UserDisplayInfo {
  id: string;
  displayName: string; // Computed: display_name || username
  avatarUrl: string; // Computed: custom or discord avatar
  rank?: Rank | null;
  guild?: Guild | null;
  role: 'admin' | 'editor' | 'member' | 'pending';
}
```

---

## 🔧 **Backend API Implementation**

### **Phase 3A: Guild CRUD API**
**Estimated Time**: 4 hours

**File**: `src/lib/api/guilds.ts`
```typescript
// Complete guild management API
export const guildsApi = {
  // Fetch all guilds with member counts
  async getGuilds(): Promise<Guild[]> {
    const { data, error } = await supabase
      .from('guilds')
      .select(`
        *,
        member_count:profiles(count)
      `)
      .order('display_order', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  // Create new guild
  async createGuild(guildData: GuildCreateData): Promise<Guild> {
    const { data, error } = await supabase
      .from('guilds')
      .insert([guildData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update existing guild
  async updateGuild(id: string, updates: Partial<GuildUpdateData>): Promise<Guild> {
    const { data, error } = await supabase
      .from('guilds')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete guild (members become unassigned)
  async deleteGuild(id: string): Promise<void> {
    const { error } = await supabase
      .from('guilds')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Get guild members with profiles
  async getGuildMembers(guildId: string): Promise<EnhancedProfile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        guild:guilds(*),
        rank:ranks(*)
      `)
      .eq('guild_id', guildId)
      .order('guild_role', { ascending: true })
      .order('username', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }
};
```

### **Phase 3B: User Guild Assignment API**
**Estimated Time**: 2 hours

**File**: `src/lib/api/userGuilds.ts`
```typescript
export const userGuildsApi = {
  // Assign user to guild with role
  async assignUserToGuild(userId: string, guildId: string | null, role: GuildRole | null = 'member'): Promise<void> {
    const updates: any = {
      guild_id: guildId,
      guild_role: guildId ? role : null,
      guild_joined_at: guildId ? new Date().toISOString() : null
    };

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);
    
    if (error) throw error;
  },

  // Update user's guild role
  async updateUserGuildRole(userId: string, role: GuildRole): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({ guild_role: role })
      .eq('id', userId);
    
    if (error) throw error;
  },

  // Remove user from guild
  async removeUserFromGuild(userId: string): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({
        guild_id: null,
        guild_role: null,
        guild_joined_at: null
      })
      .eq('id', userId);
    
    if (error) throw error;
  }
};
```

---

## 🎨 **Frontend Component Implementation**

### **Phase 4A: Ranks & Guilds Admin Interface**
**Estimated Time**: 8 hours

**Component**: Rename `RankManagement.tsx` → `RanksAndGuildsManagement.tsx`

**Features:**
- **Tab Navigation**: Switch between "Ranks" and "Guilds" sections
- **Guild CRUD Interface**: Create, edit, delete guilds with color picker
- **Guild Member Management**: View and manage guild members (for guild leaders)
- **Guild Styling Preview**: Live preview of guild tags with chosen colors

**Key Components:**
1. **GuildManagement Section**:
   ```tsx
   // Guild creation form with color picker
   // Guild list with member counts
   // Edit/delete actions with permissions
   ```

2. **GuildMemberManagement Section**:
   ```tsx
   // List of guild members for guild leaders
   // Role assignment (leader/officer/member)
   // Remove member functionality
   ```

3. **Color Picker Integration**:
   ```tsx
   // Reuse existing color presets from RankManagement
   // Live preview of guild tag styling
   // Contrast validation for text/background colors
   ```

### **Phase 4B: User Management Guild Integration**
**Estimated Time**: 6 hours

**Component**: Update `UserManagement.tsx`

**New Features:**
1. **Guild Assignment Interface**:
   ```tsx
   // Guild dropdown in user rows
   // Guild role dropdown (leader/officer/member)
   // Permission checks for guild assignment
   ```

2. **Guild Filtering & Sorting**:
   ```tsx
   // Filter users by guild
   // Sort users by guild name
   // "Unassigned" users filter option
   ```

3. **Visual Guild Display**:
   ```tsx
   // Guild tags in user rows
   // Guild member count in guild dropdowns
   // Color-coded guild badges
   ```

### **Phase 4C: Profile Page Guild Self-Assignment**
**Estimated Time**: 4 hours

**Component**: Update `ProfilePage.tsx`

**New Features:**
1. **Current Guild Display**:
   ```tsx
   // Show current guild with styled tag
   // Display guild role (Leader/Officer/Member)
   // Join date within guild
   ```

2. **Guild Self-Assignment Interface**:
   ```tsx
   // Dropdown of available guilds
   // "Leave Guild" option
   // Confirmation dialogs for guild changes
   ```

### **Phase 4D: Username Display Component**
**Estimated Time**: 6 hours

**Component**: Create `UserDisplayName.tsx` + update ~15 existing components

**New Component:**
```tsx
interface UserDisplayNameProps {
  username: string;
  displayName?: string;
  guild?: Guild | null;
  showGuild?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const UserDisplayName: React.FC<UserDisplayNameProps> = ({ 
  username, 
  displayName, 
  guild, 
  showGuild = true,
  size = 'md'
}) => {
  const name = displayName || username;
  
  return (
    <span className="inline-flex items-center gap-2">
      <span className={getNameSizeClass(size)}>{name}</span>
      {showGuild && guild && (
        <span 
          className={`px-2 py-1 rounded text-xs font-medium ${getTagSizeClass(size)}`}
          style={{ 
            backgroundColor: guild.tag_color, 
            color: guild.tag_text_color 
          }}
        >
          {guild.name}
        </span>
      )}
    </span>
  );
};
```

**Components to Update** (15+ locations):
- `POICard.tsx`, `HaggaBasinPoiCard.tsx` - POI creator display
- `CommentItem.tsx` - Comment author display  
- `SharePoiModal.tsx` - User selection lists
- `POIPlacementModal.tsx` - User assignment
- `UserManagement.tsx` - Admin user lists
- `ActivityFeed.tsx` - Activity user references
- `Pois.tsx` - POI creator filtering/display
- And 8+ other components with username display

---

## 🧪 **Testing & Quality Assurance**

### **Phase 5A: Component Testing**
**Estimated Time**: 4 hours

**Test Coverage:**
1. **Guild CRUD Operations**: Create, read, update, delete guilds
2. **User Assignment**: Join/leave guilds, role changes
3. **Permission System**: Guild leader vs admin permissions
4. **UI Integration**: Guild tags display correctly throughout app

### **Phase 5B: Database Integrity Testing**
**Estimated Time**: 2 hours

**Test Scenarios:**
1. **Guild Deletion**: Verify members become unassigned (guild_id = NULL)
2. **User Deletion**: Verify guild membership cleanup
3. **Permission Boundaries**: Guild leaders can only manage their guild
4. **Joined Date Fix**: Verify immutable join dates

---

## 📊 **Migration & Deployment Strategy**

### **Phase 6A: Database Migration Script**
**Estimated Time**: 2 hours

**Migration Order:**
```sql
-- Step 1: Fix joined date issue (no downtime)
ALTER TABLE profiles ADD COLUMN actual_join_date TIMESTAMPTZ;
UPDATE profiles SET actual_join_date = created_at WHERE actual_join_date IS NULL;

-- Step 2: Create guilds table
CREATE TABLE guilds (...);

-- Step 3: Add guild fields to profiles
ALTER TABLE profiles ADD COLUMN guild_id UUID REFERENCES guilds(id) ON DELETE SET NULL;
ALTER TABLE profiles ADD COLUMN guild_role VARCHAR(20) CHECK (...);
ALTER TABLE profiles ADD COLUMN guild_joined_at TIMESTAMPTZ;

-- Step 4: Create indexes and policies
CREATE INDEX ...;
CREATE POLICY ...;
```

### **Phase 6B: Frontend Deployment**
**Estimated Time**: 2 hours

**Deployment Steps:**
1. **TypeScript Compilation**: Verify all interfaces updated
2. **Component Integration**: Ensure no broken imports/references
3. **Styling Verification**: Guild tags display correctly
4. **Permission Testing**: Admin and guild leader permissions work

---

## 📈 **Success Metrics**

### **Functional Requirements Satisfied:**
- ✅ Guild creation/management with custom styling
- ✅ User guild assignment (admin + self-assignment)
- ✅ Guild hierarchy (Leader/Officer/Member roles)
- ✅ Username display with guild tags throughout app
- ✅ Guild filtering and sorting in user management
- ✅ Joined date issue resolved

### **Technical Standards:**
- ✅ TypeScript safety maintained
- ✅ Database integrity with proper foreign keys
- ✅ RLS security policies implemented
- ✅ Component reusability with UserDisplayName
- ✅ Performance optimized with proper indexing

### **User Experience:**
- ✅ Intuitive guild management interface
- ✅ Self-service guild assignment
- ✅ Visual guild identification throughout app
- ✅ Professional admin controls

---

## 🎯 **Implementation Timeline**

### **Week 1**: Foundation & Database
- **Day 1-2**: Phase 1A (Joined date fix) + Phase 1B (Database schema)
- **Day 3-4**: Phase 2A-B (TypeScript interfaces)
- **Day 5**: Phase 3A (Guild CRUD API)

### **Week 2**: Backend & Admin Interface  
- **Day 1**: Phase 3B (User guild assignment API)
- **Day 2-4**: Phase 4A (Ranks & Guilds admin interface)
- **Day 5**: Phase 4B (User management updates)

### **Week 3**: User Interface & Integration
- **Day 1-2**: Phase 4C (Profile page guild assignment)
- **Day 3-5**: Phase 4D (Username display component + integration)

### **Week 4**: Testing & Deployment
- **Day 1-2**: Phase 5A-B (Testing & QA)
- **Day 3-4**: Phase 6A-B (Migration & deployment)
- **Day 5**: Documentation & polish

---

## 🚀 **Ready for Implementation**

**Status**: ✅ **COMPREHENSIVE PLAN COMPLETE**  
**Dependencies**: None - can start immediately  
**Risk Level**: Low - well-defined requirements and simplified architecture  

**Next Step**: Begin Phase 1A (Joined date fix) as immediate quick win, then proceed with full guild system implementation. 