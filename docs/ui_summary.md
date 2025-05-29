# UI Element Summary

This document summarizes the fonts, colors, styles, and UI elements used across different pages of the application.

## `src/pages/Dashboard.tsx`

### Fonts
-   **Primary:** System default (implied by Tailwind's default configuration)
-   **Weights:** `font-bold`, `font-semibold`, `font-medium`, `font-normal` (implied)

### Colors
-   **Backgrounds:**
    -   `bg-sand-50` (page background)
    -   `bg-gradient-to-r from-spice-500 to-spice-600` (header icon background)
    -   `bg-white` (card backgrounds)
    -   `bg-sand-50` (link background)
    -   `bg-blue-50` (link background - Hagga Basin)
    -   `bg-spice-50` (link background - Admin)
-   **Text:**
    -   `text-white`
    -   `text-night-900` (headings)
    -   `text-sand-600` (paragraph text)
    -   `text-spice-600` (icon color)
    -   `text-night-800` (link text)
    -   `text-sand-500` (link arrow, footer text)
    -   `text-blue-500` (link arrow - Hagga Basin)
    -   `text-spice-800` (link text - Admin)
    -   `text-spice-500` (link arrow - Admin)
-   **Borders:**
    -   `border-sand-200` (cards)

### Styles & Layout
-   **General:** `min-h-screen`, `max-w-7xl mx-auto px-4 py-8`
-   **Flexbox:** `flex`, `items-center`, `gap-3`, `gap-2`, `justify-between`
-   **Grid:** `grid`, `grid-cols-1`, `lg:grid-cols-3`, `lg:col-span-2`
-   **Spacing:** `mb-8`, `mb-2`, `mb-6`, `mt-12`, `p-3`, `p-6`, `space-y-6`, `space-y-3`
-   **Rounding:** `rounded-lg`
-   **Shadows:** `shadow-sm`
-   **Sizing:** `text-3xl`, `text-xl`, `text-lg`, `text-sm`, `text-xs`
-   **Transitions:** `transition-colors` (on links)
-   **Hover States:** `hover:bg-sand-100`, `hover:bg-blue-100`, `hover:bg-spice-100`

### UI Elements
-   **Icons:** `lucide-react` (BarChart3, Activity, TrendingUp)
-   **Links:** `react-router-dom` (`Link`)
-   **Custom Components:**
    -   `EnhancedStatisticsCards`
    -   `ActivityFeed`
    -   `ExplorationProgress`
    -   `CommunityStats`
-   **Page Structure:** Header, Statistics Cards section, Activity Feed & Quick Info Panel (Exploration Progress, Quick Actions, Community Stats), Footer.

---

## `src/pages/Auth.tsx`

### Fonts
-   **Primary:** System default
-   **Weights:** `font-bold`

### Colors
-   **Backgrounds:**
    -   `bg-sand-100` (page background)
-   **Text:**
    -   `text-night-950` (main heading)
    -   `text-night-700` (sub-heading)
    -   `text-night-600` (loading text, footer text)
-   **Borders:**
    -   `border-spice-600` (spinner)

### Styles & Layout
-   **General:** `min-h-screen flex flex-col items-center justify-center p-4`
-   **Sizing:** `w-full max-w-md`, `text-3xl`, `text-sm`
-   **Spacing:** `mb-8`, `mb-2`, `mt-4`, `mt-8`, `p-8` (card)
-   **Flexbox:** `flex`, `flex-col`, `items-center`, `justify-center`
-   **Text Alignment:** `text-center`
-   **Animations:** `animate-spin` (spinner)
-   **Rounding:** `rounded-full` (spinner)

### UI Elements
-   **Navigation:** `react-router-dom` (`Navigate`)
-   **Custom Components:**
    -   `AuthTabs`
-   **Structure:** Welcome message, Loading spinner (conditional), AuthTabs, Footer agreement text.
-   **Card:** Implied `card` class for loading section.

---

## `src/pages/GridPage.tsx` (Partial Summary - File is Large)

*Note: This is a summary of the initial 250 lines and an outline of the rest. A full analysis would be extensive.*

### Fonts
-   **Primary:** System default

### Colors (Observed in initial part)
-   **Text:** (Likely extensive, depends on nested components)
    -   `text-sand-500` (filter tags, panel toggle button)
    -   `text-night-700` (help tooltip)
    -   `text-white` (buttons, e.g., "Add POI to this Grid Square")
    -   `text-spice-500` (upload button)
    -   `text-red-500` (error messages, delete buttons)
    -   `text-green-500` (success messages)
    -   `text-blue-500` (info messages)
-   **Backgrounds:**
    -   `bg-sand-50` (page background)
    -   `bg-sand-100` (sidebar)
    -   `bg-sand-200` (sidebar sections)
    -   `bg-white` (main content area, modals)
    -   `bg-night-950/90` (modal backdrop)
    -   `bg-spice-500` (primary buttons)
    -   `bg-sand-700` (secondary buttons)
    -   `bg-red-600` (delete buttons)
-   **Borders:**
    -   `border-sand-200` (sidebar, sections)
    -   `border-sand-300` (inputs, buttons)
    -   `border-transparent` (buttons)

### Styles & Layout (Observed in initial part)
-   **General:** `flex`, `h-screen`, `overflow-hidden`
-   **Layout:** Three-column structure (Left Panel, Main Content, Right Panel), with toggleable sidebars.
-   **Flexbox & Grid:** Extensively used for structuring panels and content.
-   **Spacing:** `p-2`, `p-3`, `p-4`, `p-6`, `gap-2`, `gap-3`, `gap-4`, `space-y-2`, `space-y-4`
-   **Rounding:** `rounded-md`, `rounded-lg`, `rounded-full`
-   **Shadows:** `shadow-md`, `shadow-lg`
-   **Sizing (Text & Elements):** Various sizes (`text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, etc.)
-   **Transitions:** `transition-all`, `duration-300`
-   **Z-Index:** Used for layering modals and panels (e.g., `z-10`, `z-20`, `z-30`, `z-40`, `z-50`)

### UI Elements (Observed in initial part)
-   **Icons:** `lucide-react` (ArrowLeft, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Upload, Image, Plus, MapPin, Target, ZoomIn, ZoomOut, RotateCcw, Filter, Settings, FolderOpen, Share, Edit, Eye, Lock, Users, HelpCircle, etc.)
-   **Modals:**
    -   `POIPlacementModal`
    -   `POIEditModal`
    -   `CollectionModal`
    -   `CustomPoiTypeModal`
    -   `SharePoiModal`
    -   `ImageCropModal`
-   **Gallery:** `GridGallery`
-   **Panels:** `POIPanel`
-   **Map Interaction:** `react-zoom-pan-pinch` (`TransformWrapper`, `TransformComponent`)
-   **Forms:** Inputs for search, file uploads.
-   **Buttons:** Primary, secondary, icon buttons for various actions (upload, place marker, zoom, filter, etc.).
-   **Tooltips:** For help icons and actions.
-   **Navigation:** Grid navigation arrows, back button.
-   **Filters:** Dropdowns, checkboxes, search input for filtering POIs.
-   **Tabs:** For organizing sidebar content (Filters, Customization, Layers).

---

## `src/pages/Landing.tsx`

### Fonts
-   **Primary:** `'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif` (explicitly set for specific text sections)
-   **Default:** System default (for other text)
-   **Weights:** `font-light`, `font-normal` (implied)

### Colors
-   **Backgrounds:**
    -   `bg-cover bg-center bg-no-repeat` with `url(/images/main-bg.jpg)` (hero section)
    -   `radial-gradient(ellipse at center, rgba(15, 23, 42, 0.7) 0%, rgba(15, 23, 42, 0.5) 35%, rgba(15, 23, 42, 0.2) 55%, transparent 75%)` (hero description box)
    -   `bg-void-950` (DiamondIcon background)
    -   `bg-gradient-to-br from-slate-900/60 to-slate-800/40` (mock dashboard stat cards)
-   **Text:**
    -   `text-amber-200` (hero description, feature description)
    -   `text-yellow-300` (section titles, feature titles, mock dashboard titles)
    -   `text-gold-300` (DiamondIcon icon color)
    -   `text-violet-400`, `text-green-400`, `text-blue-400` (mock dashboard stat values)
    -   `text-slate-400` (mock dashboard stat labels)
-   **Borders:**
    -   `bg-gold-300` (DiamondIcon border)
    -   `bg-gold-300/70` (DiamondIcon border - feature list)
    -   `border-slate-700/20` (mock dashboard stat cards)

### Styles & Layout
-   **General:** `min-h-screen`, `relative`, `overflow-hidden`
-   **Sizing (Text & Elements):** `text-lg`, `text-xl`, `text-2xl`, `text-4xl`, `text-5xl`, `text-6xl`, `h-24`, `md:h-32`, `lg:h-40`
-   **Spacing:** `px-6`, `py-24`, `lg:py-32`, `mb-8`, `mb-12`, `mb-16`, `gap-6`, `gap-12`, `py-20`
-   **Flexbox:** `flex`, `flex-col`, `sm:flex-row`, `justify-center`, `items-center`, `gap-3`, `gap-6`
-   **Grid:** `grid`, `grid-cols-2`, `md:grid-cols-4`, `lg:grid-cols-2`
-   **Positioning:** `absolute`, `inset-0`, `top-16`, `left-1/2`, `transform -translate-x-1/2`
-   **Rounding:** `rounded-3xl`, `rounded-lg`
-   **Shadows:** `drop-shadow-lg`
-   **Opacity:** `opacity-60`
-   **Text Styling:** `text-center`, `leading-relaxed`, `font-light`, `tracking-wide`, `tracking-[0.15em]`, `tracking-[0.1em]`, `uppercase`
-   **Hover States:** `group-hover:scale-110`
-   **Transitions:** `transition-transform duration-300`

### UI Elements
-   **Images:**
    -   `/images/main-bg.jpg`
    -   `/images/landing_top.png`
    -   `/images/dune-log.png`
-   **Icons:** `lucide-react` (Map, Compass, Database, Users, ArrowRight, BarChart3, Activity, TrendingUp, Eye, MessageSquare, Camera, Shield, Zap, Star, Grid3X3, Mountain, Pyramid, Settings, Heart, Share, Image, Upload, Filter, Search, Layers, Globe)
-   **Custom Components:**
    -   `HexButton`
    -   `HexCard`
    -   `DiamondIcon`
-   **Structure:** Hero section (background image, logo, title, buttons, description), Key Features Preview, Advanced Features Section (icon list, mock dashboard preview), Community/Call to Action, Footer.

---

## `src/pages/HaggaBasinPage.tsx` (Partial Summary - File is Large)

*Note: This is a summary of the initial 250 lines and an outline of the rest. A full analysis would be extensive.*

### Fonts
-   **Primary:** System default

### Colors (Observed in initial part)
-   **Text:** (Likely extensive, depends on nested components and theme)
    -   `text-sand-500` / `text-night-400` (panel toggle button)
    -   `text-white` (buttons, active tab)
    -   `text-night-700` / `text-sand-300` (tab text)
    -   `text-red-500` (error messages)
-   **Backgrounds:**
    -   `bg-sand-50` / `dark:bg-night-950` (page background)
    -   `bg-sand-100` / `dark:bg-night-900` (sidebar)
    -   `bg-white` / `dark:bg-night-800` (main content area, modals, popovers)
    -   `bg-night-950/90` (modal backdrop)
    -   `bg-spice-500` / `dark:bg-spice-600` (primary buttons)
    -   `hover:bg-spice-600` / `dark:hover:bg-spice-500`
    -   `bg-sand-700` / `dark:bg-night-700` (secondary buttons)
    -   `hover:bg-sand-600` / `dark:hover:bg-night-600`
-   **Borders:**
    -   `border-sand-200` / `dark:border-night-700` (sidebar, panels)
    -   `border-sand-300` / `dark:border-night-600` (inputs, buttons)
    -   `border-transparent` (buttons)

### Styles & Layout (Observed in initial part)
-   **General:** `flex`, `h-screen`, `overflow-hidden`
-   **Layout:** Main content area with a toggleable sidebar on the left and a toggleable POI panel on the right.
-   **Flexbox & Grid:** Extensively used for layout.
-   **Spacing:** `p-1`, `p-2`, `p-3`, `p-4`, `space-x-2`, `space-y-2`, `space-y-4`, `gap-2`, `gap-4`
-   **Rounding:** `rounded-md`, `rounded-lg`, `rounded-full`
-   **Shadows:** `shadow-md`, `shadow-lg`
-   **Sizing (Text & Elements):** Various sizes (`text-xs`, `text-sm`, `text-base`, `text-lg`, etc.)
-   **Transitions:** `transition-all`, `duration-300`
-   **Z-Index:** For modals, popovers, sidebars (e.g., `z-10`, `z-20`, `z-30`, `z-40`, `z-50`).

### UI Elements (Observed in initial part)
-   **Icons:** `lucide-react` (MapPin, Filter, Settings, Plus, FolderOpen, Share, Image, Edit, Eye, Lock, Users, ChevronLeft, ChevronRight, HelpCircle, etc.)
-   **Map:** `InteractiveMap` component.
-   **Modals:**
    -   `CollectionModal`
    -   `CustomPoiTypeModal`
    -   `SharePoiModal`
    -   `POIEditModal`
-   **Gallery:** `GridGallery`
-   **Panels:** `POIPanel` (for displaying selected POI details)
-   **Sidebar:**
    -   Tabs (Filters, Customization, Overlays)
    -   Filter controls (search, category toggles, type toggles, privacy filter)
    -   Overlay toggles
    -   Buttons for creating custom POI types and collections.
-   **Buttons:** For toggling sidebar, placement mode, opening modals, etc.
-   **Tooltips:** Help tooltips.
-   **Loading/Error States:** Spinners, error messages.

---

## `src/pages/Pois.tsx` (Partial Summary - File is Large)

*Note: This is a summary of the initial 250 lines and an outline of the rest. A full analysis would be extensive.*

### Fonts
-   **Primary:** System default

### Colors (Observed in initial part and likely throughout)
-   **Text:**
    -   `text-night-900` / `dark:text-sand-50` (headings, primary text)
    -   `text-sand-600` / `dark:text-sand-300` (secondary text, descriptions)
    -   `text-sand-500` / `dark:text-sand-400` (filter tags, metadata)
    -   `text-spice-600` / `dark:text-spice-400` (active filters, links)
    -   `text-white` (buttons)
    -   `text-red-500` (delete actions)
-   **Backgrounds:**
    -   `bg-sand-50` / `dark:bg-night-950` (page background)
    -   `bg-white` / `dark:bg-night-900` (cards, filter section, modals)
    -   `bg-sand-100` / `dark:bg-night-800` (hover states, selected items)
    -   `bg-spice-500` / `dark:bg-spice-600` (primary buttons)
    -   `bg-sand-200` / `dark:bg-night-700` (input fields, inactive filters)
-   **Borders:**
    -   `border-sand-200` / `dark:border-night-700` (cards, sections)
    -   `border-sand-300` / `dark:border-night-600` (inputs, buttons)
    -   `border-spice-500` (focused inputs)

### Styles & Layout (Observed in initial part)
-   **General:** `container mx-auto p-4 sm:p-6 lg:p-8`
-   **Layout:** Header/Toolbar (Search, Filters, Display Mode, Sort), Main content area (Grid or List of POIs).
-   **Flexbox:** Extensively used for toolbar, card layouts, list item layouts. `flex`, `items-center`, `justify-between`, `gap-2`, `gap-4`.
-   **Grid:** `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4` (for card display)
-   **Spacing:** `py-6`, `mb-4`, `mb-6`, `p-3`, `p-4`
-   **Rounding:** `rounded-lg`, `rounded-md`, `rounded-full`
-   **Shadows:** `shadow-md`, `shadow-lg` (cards)
-   **Sizing (Text & Elements):** `text-2xl`, `text-xl`, `text-lg`, `text-sm`, `text-xs`. Responsive sizing for columns.
-   **Transitions:** `transition-colors`, `transition-opacity`
-   **Hover States:** For cards, list items, buttons.

### UI Elements (Observed in initial part)
-   **Icons:** `lucide-react` (Search, Compass, LayoutGrid, List, Edit2, Trash2, ArrowDownUp, SortAsc, SortDesc, Filter, XCircle, Calendar, User, MapPinIcon for map type)
-   **Cards:** `PoiCard` (for grid view)
-   **List Items:** `PoiListItem` (for list view)
-   **Modals:**
    -   `GridGallery` (for viewing POI screenshots)
    -   `POIEditModal`
-   **Toolbar/Header:**
    -   Search bar (collapsible/expandable) with advanced fields (Grid Coordinate, User, Date Range)
    -   Filter button opening a tag-based filter panel/modal.
    -   Display mode toggle (Grid/List)
    -   Sort dropdown.
-   **Filters:**
    -   Main search input.
    -   Tag-based filters for Categories, POI Types, Grid Coordinates.
    -   Map Type filter (All, Deep Desert, Hagga Basin).
-   **Buttons:** For actions like edit, delete, view gallery.
-   **Dropdowns:** For sorting.
-   **Loading/Error States:** Spinners, error messages.
-   **Pagination/Infinite Scroll:** (Not explicitly seen in first 250 lines, but common for such lists). 