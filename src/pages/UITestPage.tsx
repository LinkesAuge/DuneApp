import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Activity, TrendingUp, ArrowLeft, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Upload, Image, Plus, MapPin, Target, ZoomIn, ZoomOut, RotateCcw, Filter, Settings, FolderOpen, Share, Edit, Eye, Lock, Users, HelpCircle, Star, Grid3X3, Mountain, Pyramid, Compass, Database, MessageSquare, Camera, Shield, Zap, Globe, Search, LayoutGrid, List, Edit2, Trash2, ArrowDownUp, SortAsc, SortDesc, XCircle, Calendar, User, ChevronsRightLeft, ArrowRight } from 'lucide-react';
import HexButton from '../components/common/HexButton';
import HexCard from '../components/common/HexCard';
import DiamondIcon from '../components/common/DiamondIcon';
import TrapezoidButton from '../components/common/TrapezoidButton';
import ChevronLink from '../components/common/ChevronLink';
import POIPanel from '../components/common/POIPanel';

// Helper component for showcasing elements
const ShowcaseItem: React.FC<{ title: string; description?: string; children: React.ReactNode }> = ({ title, description, children }) => (
  <div className="mb-8 p-4 border border-night-700 bg-night-900">
    <h3 className="text-lg font-semibold text-sand-100 mb-1">{title}</h3>
    {description && <p className="text-sm text-sand-300 mb-3">{description}</p>}
    <div className="flex flex-wrap gap-4 items-center">{children}</div>
  </div>
);

const UITestPage: React.FC = () => {
  return (
    <div 
      className="min-h-screen p-8 bg-center bg-cover bg-no-repeat"
      style={{
        backgroundImage: 'url(/images/main-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <header className="mb-12">
        <h1 className="text-4xl font-bold text-sand-50 mb-2">UI Elements Test Page</h1>
        <p className="text-sand-300">
          This page demonstrates various UI elements, styles, fonts, and colors used across the application, based on the <code className="bg-night-700 text-sand-200 p-1">docs/ui_summary.md</code> document.
        </p>
        <Link to="/" className="text-spice-400 hover:text-spice-300 font-medium">&larr; Back to Home</Link>
      </header>

      {/* Section: Colors */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-sand-100 mb-6 pb-2 border-b border-night-700">Colors</h2>

        {/* Background Colors */}
        <ShowcaseItem title="Background Colors">
          {/* Light accent colors - kept for specific use cases like callouts or paper textures if ever needed */}
          <div className="flex flex-col items-center">
            <div className="p-3 bg-white border border-sand-200 text-night-900 w-48 text-center"><code>bg-white</code></div>
            <span className="mt-1 text-xs text-sand-400">White (Utility/Accent)</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="p-3 bg-gradient-to-r from-spice-500 to-spice-600 text-white w-48 text-center"><code>Spice Gradient</code></div>
            <span className="mt-1 text-xs text-sand-400">Spice Gradient (Accent)</span>
          </div>
          
          {/* Dark Theme Colors - Primary Palette */}
          <div className="flex flex-col items-center">
            <div className="p-3 bg-night-950 text-white w-48 text-center"><code>bg-night-950</code></div>
            <span className="mt-1 text-xs text-sand-400">Night 950</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="p-3 bg-void-950 text-white w-48 text-center"><code>bg-void-950</code></div>
            <span className="mt-1 text-xs text-sand-400">Void 950</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="p-3 bg-slate-900 text-white w-48 text-center"><code>bg-slate-900</code></div>
            <span className="mt-1 text-xs text-sand-400">Slate 900</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="p-3 bg-slate-800 text-white w-48 text-center"><code>bg-slate-800</code></div>
            <span className="mt-1 text-xs text-sand-400">Slate 800</span>
          </div>
           <div className="flex flex-col items-center">
            <div className="p-3 bg-zinc-900 text-white w-48 text-center"><code>bg-zinc-900</code></div>
            <span className="mt-1 text-xs text-sand-400">Zinc 900</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="p-3 bg-slate-900/60 text-white w-48 text-center"><code>bg-slate-900/60</code></div>
            <span className="mt-1 text-xs text-sand-400">Slate 900/60 (Transparent)</span>
          </div>

          {/* Custom Hex Background Colors */}
          <div className="w-full border-t border-night-700 my-3"></div>
          <p className="w-full text-sm text-sand-300 mb-2">Custom Hex Backgrounds:</p>
          <div className="flex flex-col items-center">
            <div className="p-3 text-white w-48 text-center border border-sand-500/50" style={{ backgroundColor: '#2c3259' }}><code>#2c3259</code></div>
            <span className="mt-1 text-xs text-sand-400">Deep Indigo Night</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="p-3 text-white w-48 text-center border border-sand-500/50" style={{ backgroundColor: '#1b1d41' }}><code>#1b1d41</code></div>
            <span className="mt-1 text-xs text-sand-400">Void Blue Prime</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="p-3 text-white w-48 text-center border border-sand-500/50" style={{ backgroundColor: '#3a2a5b' }}><code>#3a2a5b</code></div>
            <span className="mt-1 text-xs text-sand-400">Mystic Purple Hue</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="p-3 text-white w-48 text-center border border-sand-500/50" style={{ backgroundColor: '#4a4e71' }}><code>#4a4e71</code></div>
            <span className="mt-1 text-xs text-sand-400">Stormy Slate Blue</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="p-3 text-white w-48 text-center border border-sand-500/50" style={{ backgroundColor: '#49466e' }}><code>#49466e</code></div>
            <span className="mt-1 text-xs text-sand-400">Twilight Indigo Grey</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="p-3 text-white w-48 text-center border border-sand-500/50" style={{ backgroundColor: '#2b1f37' }}><code>#2b1f37</code></div>
            <span className="mt-1 text-xs text-sand-400">Shadow Plum Dark</span>
          </div>
        </ShowcaseItem>

        {/* Text Colors - Emphasize text on dark backgrounds, keep some light bg examples for contrast */}
        <ShowcaseItem title="Text Colors (Primary: Light on Dark)">
          <div className="flex flex-col items-center">
            <span className="text-sand-50 bg-night-800 p-1">text-sand-50</span>
            <span className="mt-1 text-xs text-sand-400">Sand 50 (on Night 800)</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-sand-100 bg-night-800 p-1">text-sand-100</span>
            <span className="mt-1 text-xs text-sand-400">Sand 100 (on Night 800)</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-sand-200 bg-night-900 p-1">text-sand-200</span>
            <span className="mt-1 text-xs text-sand-400">Sand 200 (on Night 900)</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-sand-300 bg-night-950 p-1">text-sand-300</span>
            <span className="mt-1 text-xs text-sand-400">Sand 300 (on Night 950)</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-gold-200 bg-void-950 p-1">text-gold-200</span>
            <span className="mt-1 text-xs text-sand-400">Gold 200 (on Void 950)</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-gold-300 bg-night-800 p-1">text-gold-300</span>
            <span className="mt-1 text-xs text-sand-400">Gold 300 (on Night 800)</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-sky-300 bg-slate-900 p-1">text-sky-300</span>
            <span className="mt-1 text-xs text-sand-400">Sky 300 (on Slate 900)</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-amber-300 bg-spice-900 p-1">text-amber-300</span>
            <span className="mt-1 text-xs text-sand-400">Amber 300 (on Spice 900)</span>
          </div>
        </ShowcaseItem>

        {/* Border Colors */}
        <ShowcaseItem title="Border Colors">
          <div className="flex flex-col items-center">
            <div className="p-3 border-2 border-sand-300 text-sand-100 w-48 text-center"><code>border-sand-300</code></div>
            <span className="mt-1 text-xs text-sand-400">Sand 300 Border</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="p-3 border-2 border-amber-300 text-sand-100 w-48 text-center"><code>border-amber-300</code></div>
            <span className="mt-1 text-xs text-sand-400">Amber 300 Border (Lighter Gold)</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="p-3 border-2 border-spice-500 text-sand-100 w-48 text-center"><code>border-spice-500</code></div>
            <span className="mt-1 text-xs text-sand-400">Spice 500 Border</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="p-3 border-2 border-red-500 text-sand-100 w-48 text-center"><code>border-red-500</code></div>
            <span className="mt-1 text-xs text-sand-400">Red 500 Border (Error/Alert)</span>
          </div>

          {/* Custom Hex Border Colors */}
          <div className="w-full border-t border-night-700 my-3"></div>
          <p className="w-full text-sm text-sand-300 mb-2">Custom Hex Borders:</p>
          <div className="flex flex-col items-center">
            <div className="p-3 text-sand-100 w-48 text-center border-2" style={{ borderColor: '#2c3259' }}><code>border: #2c3259</code></div>
            <span className="mt-1 text-xs text-sand-400">Deep Indigo Night Border</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="p-3 text-sand-100 w-48 text-center border-2" style={{ borderColor: '#1b1d41' }}><code>border: #1b1d41</code></div>
            <span className="mt-1 text-xs text-sand-400">Void Blue Prime Border</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="p-3 text-sand-100 w-48 text-center border-2" style={{ borderColor: '#3a2a5b' }}><code>border: #3a2a5b</code></div>
            <span className="mt-1 text-xs text-sand-400">Mystic Purple Hue Border</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="p-3 text-sand-100 w-48 text-center border-2" style={{ borderColor: '#4a4e71' }}><code>border: #4a4e71</code></div>
            <span className="mt-1 text-xs text-sand-400">Stormy Slate Blue Border</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="p-3 text-sand-100 w-48 text-center border-2" style={{ borderColor: '#49466e' }}><code>border: #49466e</code></div>
            <span className="mt-1 text-xs text-sand-400">Twilight Indigo Grey Border</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="p-3 text-sand-100 w-48 text-center border-2" style={{ borderColor: '#2b1f37' }}><code>border: #2b1f37</code></div>
            <span className="mt-1 text-xs text-sand-400">Shadow Plum Dark Border</span>
          </div>
        </ShowcaseItem>
      </section>

      {/* Section: Fonts & Typography */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-sand-100 mb-6 pb-2 border-b border-night-700">Fonts & Typography</h2>
        <ShowcaseItem title="Font Weights">
          <div className="flex flex-col items-start">
            <p className="font-bold text-sand-100">font-bold: Bold text</p>
            <span className="mt-1 text-xs text-sand-400">Font Bold</span>
          </div>
          <div className="flex flex-col items-start">
            <p className="font-semibold text-sand-100">font-semibold: Semi-bold text</p>
            <span className="mt-1 text-xs text-sand-400">Font Semi-bold</span>
          </div>
          <div className="flex flex-col items-start">
            <p className="font-medium text-sand-100">font-medium: Medium text</p>
            <span className="mt-1 text-xs text-sand-400">Font Medium</span>
          </div>
          <div className="flex flex-col items-start">
            <p className="text-sand-100">font-normal (default): Normal text</p>
            <span className="mt-1 text-xs text-sand-400">Font Normal</span>
          </div>
          <div className="flex flex-col items-start">
            <p className="font-light text-sand-100">font-light: Light text (Landing page)</p>
            <span className="mt-1 text-xs text-sand-400">Font Light</span>
          </div>
        </ShowcaseItem>
        <ShowcaseItem title="Text Sizes">
          <div className="flex flex-col items-start">
            <p className="text-xs text-sand-100">text-xs: Extra small</p>
            <span className="mt-1 text-xs text-sand-400">Size XS</span>
          </div>
          <div className="flex flex-col items-start">
            <p className="text-sm text-sand-100">text-sm: Small text</p>
            <span className="mt-1 text-xs text-sand-400">Size SM</span>
          </div>
          <div className="flex flex-col items-start">
            <p className="text-base text-sand-100">text-base (default): Base text</p>
            <span className="mt-1 text-xs text-sand-400">Size BASE</span>
          </div>
          <div className="flex flex-col items-start">
            <p className="text-lg text-sand-100">text-lg: Large text</p>
            <span className="mt-1 text-xs text-sand-400">Size LG</span>
          </div>
          <div className="flex flex-col items-start">
            <p className="text-xl text-sand-100">text-xl: Extra large</p>
            <span className="mt-1 text-xs text-sand-400">Size XL</span>
          </div>
          <div className="flex flex-col items-start">
            <p className="text-2xl text-sand-100">text-2xl: 2x large</p>
            <span className="mt-1 text-xs text-sand-400">Size 2XL</span>
          </div>
          <div className="flex flex-col items-start">
            <p className="text-3xl text-sand-100">text-3xl: 3x large</p>
            <span className="mt-1 text-xs text-sand-400">Size 3XL</span>
          </div>
          <div className="flex flex-col items-start">
            <p className="text-4xl text-sand-100">text-4xl: 4x large</p>
            <span className="mt-1 text-xs text-sand-400">Size 4XL</span>
          </div>
          <div className="flex flex-col items-start">
            <p className="text-5xl text-sand-100">text-5xl: 5x large (Landing)</p>
            <span className="mt-1 text-xs text-sand-400">Size 5XL</span>
          </div>
          <div className="flex flex-col items-start">
            <p className="text-6xl text-sand-100">text-6xl: 6x large (Landing)</p>
            <span className="mt-1 text-xs text-sand-400">Size 6XL</span>
          </div>
        </ShowcaseItem>
        <ShowcaseItem title="Special Fonts (Landing Page)">
          <div className="flex flex-col items-start">
            <p style={{ fontFamily: "'Trebuchet MS', 'Lucida Grande', 'Lucida Sans Unicode', 'Lucida Sans', Tahoma, sans-serif" }} className="text-sand-100">
              'Trebuchet MS', ... (Landing Page Specific)
            </p>
            <span className="mt-1 text-xs text-sand-400">Trebuchet MS Font</span>
          </div>
        </ShowcaseItem>
         <ShowcaseItem title="Text Styling (Landing Page)">
          <div className="flex flex-col items-start">
            <p className="leading-relaxed text-sand-100">leading-relaxed</p>
            <span className="mt-1 text-xs text-sand-400">Leading Relaxed</span>
          </div>
          <div className="flex flex-col items-start">
            <p className="tracking-wide text-sand-100">tracking-wide</p>
            <span className="mt-1 text-xs text-sand-400">Tracking Wide</span>
          </div>
          <div className="flex flex-col items-start">
            <p className="tracking-[0.15em] text-sand-100">tracking-[0.15em]</p>
            <span className="mt-1 text-xs text-sand-400">Tracking 0.15em</span>
          </div>
          <div className="flex flex-col items-start">
            <p className="tracking-[0.1em] text-sand-100">tracking-[0.1em]</p>
            <span className="mt-1 text-xs text-sand-400">Tracking 0.1em</span>
          </div>
          <div className="flex flex-col items-start">
            <p className="uppercase text-sand-100">uppercase</p>
            <span className="mt-1 text-xs text-sand-400">Uppercase</span>
          </div>
        </ShowcaseItem>
      </section>

      {/* Section: Layout & Styles */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-sand-100 mb-6 pb-2 border-b border-night-700">Layout & General Styles</h2>
        <ShowcaseItem title="Rounding (REMOVED - All elements should have sharp corners)">
           <p className="text-sand-300 text-sm">All <code>rounded-*</code> classes have been removed. Elements will now have sharp corners.</p>
        </ShowcaseItem>
        <ShowcaseItem title="Shadows (REMOVED - Style relies on sharp lines and color contrast)">
          <p className="text-sand-300 text-sm">All <code>shadow-*</code> and <code>drop-shadow-*</code> classes have been removed.</p>
        </ShowcaseItem>
        <ShowcaseItem title="Spacing (Examples - Margin & Padding)">
          <div className="flex flex-col items-center">
            <div className="bg-spice-800/30 p-2 text-sand-100"><code>p-2</code></div>
            <span className="mt-1 text-xs text-sand-400">Padding 2</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-spice-800/30 p-3 text-sand-100"><code>p-3</code></div>
            <span className="mt-1 text-xs text-sand-400">Padding 3</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-spice-800/30 p-4 text-sand-100"><code>p-4</code></div>
            <span className="mt-1 text-xs text-sand-400">Padding 4</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-spice-800/30 p-6 text-sand-100"><code>p-6</code></div>
            <span className="mt-1 text-xs text-sand-400">Padding 6</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-spice-800/30 p-8 text-sand-100"><code>p-8</code></div>
            <span className="mt-1 text-xs text-sand-400">Padding 8</span>
          </div>
          <div className="w-full h-4 md:w-4 md:h-auto" /> {/* Spacer for flex-wrap */} 
          <div className="flex flex-col items-center">
            <div className="bg-indigo-800/30 mb-2 p-1 text-sand-100"><code>mb-2</code></div>
            <span className="mt-1 text-xs text-sand-400">Margin Bottom 2</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-indigo-800/30 mb-4 p-1 text-sand-100"><code>mb-4</code></div>
            <span className="mt-1 text-xs text-sand-400">Margin Bottom 4</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-indigo-800/30 mb-6 p-1 text-sand-100"><code>mb-6</code></div>
            <span className="mt-1 text-xs text-sand-400">Margin Bottom 6</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-indigo-800/30 mb-8 p-1 text-sand-100"><code>mb-8</code></div>
            <span className="mt-1 text-xs text-sand-400">Margin Bottom 8</span>
          </div>
        </ShowcaseItem>
         <ShowcaseItem title="Flexbox & Grid (Conceptual)">
          <div className="w-full">
            <p className="text-sm text-sand-300 mb-1"><code>flex items-center justify-between gap-2</code>: Commonly used for horizontal alignment.</p>
            <div className="flex items-center justify-between gap-2 p-2 bg-night-800 text-sand-100">
              <div className="flex flex-col items-center"><div className="bg-night-600 p-1">Item 1</div><span className="mt-1 text-xs text-sand-400">Flex Item 1</span></div>
              <div className="flex flex-col items-center"><div className="bg-night-600 p-1">Item 2</div><span className="mt-1 text-xs text-sand-400">Flex Item 2</span></div>
              <div className="flex flex-col items-center"><div className="bg-night-600 p-1">Item 3</div><span className="mt-1 text-xs text-sand-400">Flex Item 3</span></div>
            </div>
            <span className="mt-1 text-xs text-sand-400 self-start">Flexbox Example</span>
          </div>
          <div className="w-full mt-4">
            <p className="text-sm text-sand-300 mb-1"><code>grid grid-cols-3 gap-4</code>: Commonly used for card layouts.</p>
            <div className="grid grid-cols-3 gap-4 p-2 bg-night-800 text-sand-100">
              <div className="flex flex-col items-center"><div className="bg-night-700 p-2">Card 1</div><span className="mt-1 text-xs text-sand-400">Grid Card 1</span></div>
              <div className="flex flex-col items-center"><div className="bg-night-700 p-2">Card 2</div><span className="mt-1 text-xs text-sand-400">Grid Card 2</span></div>
              <div className="flex flex-col items-center"><div className="bg-night-700 p-2">Card 3</div><span className="mt-1 text-xs text-sand-400">Grid Card 3</span></div>
            </div>
            <span className="mt-1 text-xs text-sand-400 self-start">Grid Example</span>
          </div>
        </ShowcaseItem>
        <ShowcaseItem title="Transitions & Animations">
          <div className="flex flex-col items-center">
            <button className="p-2 bg-amber-700 text-sand-100 hover:bg-amber-600 transition-colors"><code>transition-colors</code></button>
            <span className="mt-1 text-xs text-sand-400">Transition Colors (Amber)</span>
          </div>
          <div className="flex flex-col items-center">
            <button className="p-2 bg-purple-700 text-sand-100 hover:bg-purple-800 transition-all duration-300"><code>transition-all duration-300</code></button>
            <span className="mt-1 text-xs text-sand-400">Transition All (Purple)</span>
          </div>
          <div className="flex flex-col items-center">
            <div 
              className="w-12 h-12 animate-spin bg-amber-400"
              style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}
            ></div>
            <span className="mt-1 text-xs text-sand-400">Animate Spin (Triangle)</span>
          </div>
        </ShowcaseItem>
      </section>

      {/* Section: UI Elements (Lucide Icons & Custom) */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-sand-100 mb-6 pb-2 border-b border-night-700">UI Elements (Lucide Icons & Custom)</h2>
        <ShowcaseItem title="Lucide Icons (Sample - Colors should align with theme)">
          <div className="flex flex-col items-center">
            <BarChart3 size={24} className="text-spice-400" />
            <span className="mt-1 text-xs text-sand-400">BarChart3</span>
          </div>
          <div className="flex flex-col items-center">
            <Activity size={24} className="text-sky-400" />
            <span className="mt-1 text-xs text-sand-400">Activity</span>
          </div>
          <div className="flex flex-col items-center">
            <TrendingUp size={24} className="text-green-400" />
            <span className="mt-1 text-xs text-sand-400">TrendingUp</span>
          </div>
          <div className="flex flex-col items-center">
            <ArrowLeft size={24} className="text-sand-300" />
            <span className="mt-1 text-xs text-sand-400">ArrowLeft</span>
          </div>
          <div className="flex flex-col items-center">
            <Plus size={24} className="text-sand-300" />
            <span className="mt-1 text-xs text-sand-400">Plus</span>
          </div>
          <div className="flex flex-col items-center">
            <Filter size={24} className="text-sand-300" />
            <span className="mt-1 text-xs text-sand-400">Filter</span>
          </div>
          <div className="flex flex-col items-center">
            <Settings size={24} className="text-sand-300" />
            <span className="mt-1 text-xs text-sand-400">Settings</span>
          </div>
          <div className="flex flex-col items-center">
            <Eye size={24} className="text-sand-300" />
            <span className="mt-1 text-xs text-sand-400">Eye</span>
          </div>
          <div className="flex flex-col items-center">
            <Users size={24} className="text-sand-300" />
            <span className="mt-1 text-xs text-sand-400">Users</span>
          </div>
          <div className="flex flex-col items-center">
            <Star size={24} className="text-gold-400" />
            <span className="mt-1 text-xs text-sand-400">Star (Gold)</span>
          </div>
          <div className="flex flex-col items-center">
            <Search size={24} className="text-sand-300"/>
            <span className="mt-1 text-xs text-sand-400">Search</span>
          </div>
          <p className="text-xs text-sand-400 self-center">Many more used, see specific page summaries.</p>
        </ShowcaseItem>

        <ShowcaseItem title="Custom Components (Landing Page - Already Geometric)">
          <div className="flex flex-col items-center">
            <HexButton to="#" icon={<Pyramid size={18} />} size="md" variant="primary">HexButton Primary</HexButton>
            <span className="mt-1 text-xs text-sand-400">HexButton Primary</span>
          </div>
          <div className="flex flex-col items-center">
            <HexButton to="#" icon={<MapPin size={18} />} size="md" variant="secondary">HexButton Secondary</HexButton>
            <span className="mt-1 text-xs text-sand-400">HexButton Secondary</span>
          </div>
          <div className="w-full md:w-1/4 flex flex-col items-center">
             <HexCard variant="feature" size="sm" icon={<Globe size={20}/>} title="HexCard Feature" subtitle="A subtitle for card" />
             <span className="mt-1 text-xs text-sand-400">HexCard Feature</span>
          </div>
          <div className="flex flex-col items-center">
            <DiamondIcon 
              icon={<Star size={18} />} 
              size="sm" 
              bgColor="bg-void-950" 
              actualBorderColor="bg-gold-300" 
              iconColor="text-gold-300"
              borderThickness={1}
            />
            <span className="mt-1 text-xs text-sand-400">Diamond (Landing Style)</span>
          </div>
        </ShowcaseItem>
        
        <ShowcaseItem title="Diamond Icon Variations (Already Geometric)">
          <div className="flex flex-col items-center">
            <DiamondIcon icon={<Star size={18} />} size="sm" bgColor="bg-void-950" actualBorderColor="bg-gold-300" iconColor="text-gold-300" borderThickness={1}/>
            <span className="mt-1 text-xs text-sand-400">Void Star</span>
          </div>
          <div className="flex flex-col items-center">
            <DiamondIcon icon={<Shield size={18} />} size="sm" bgColor="bg-indigo-950" actualBorderColor="bg-gold-300" iconColor="text-gold-300" borderThickness={1}/>
            <span className="mt-1 text-xs text-sand-400">Indigo Shield</span>
          </div>
          <div className="flex flex-col items-center">
            <DiamondIcon icon={<Zap size={18} />} size="sm" bgColor="bg-slate-950" actualBorderColor="bg-gold-300" iconColor="text-gold-300" borderThickness={1}/>
            <span className="mt-1 text-xs text-sand-400">Slate Zap</span>
          </div>
          <div className="flex flex-col items-center">
            <DiamondIcon icon={<Pyramid size={18} />} size="sm" bgColor="bg-indigo-800" actualBorderColor="bg-gold-300" iconColor="text-gold-300" borderThickness={1}/>
            <span className="mt-1 text-xs text-sand-400">Indigo800 Pyramid</span>
          </div>
          <div className="flex flex-col items-center">
            <DiamondIcon icon={<Globe size={18} />} size="sm" bgColor="bg-blue-950" actualBorderColor="bg-gold-300" iconColor="text-gold-300" borderThickness={1}/>
            <span className="mt-1 text-xs text-sand-400">Blue Globe</span>
          </div>
          <div className="flex flex-col items-center">
            <DiamondIcon icon={<Compass size={18} />} size="sm" bgColor="bg-indigo-900" actualBorderColor="bg-gold-300" iconColor="text-gold-300" borderThickness={1}/>
            <span className="mt-1 text-xs text-sand-400">Indigo900 Compass</span>
          </div>
          <div className="flex flex-col items-center">
            <DiamondIcon icon={<Target size={18} />} size="sm" bgColor="bg-slate-900" actualBorderColor="bg-gold-300" iconColor="text-gold-300" borderThickness={1}/>
            <span className="mt-1 text-xs text-sand-400">Slate900 Target</span>
          </div>
          <div className="flex flex-col items-center">
            <DiamondIcon icon={<Settings size={18} />} size="sm" bgColor="bg-sky-950" actualBorderColor="bg-gold-300" iconColor="text-gold-300" borderThickness={1}/>
            <span className="mt-1 text-xs text-sand-400">Sky Settings</span>
          </div>
          <div className="flex flex-col items-center">
            <DiamondIcon icon={<Grid3X3 size={18} />} size="sm" bgColor="bg-slate-800" actualBorderColor="bg-gold-300" iconColor="text-gold-300" borderThickness={1}/>
            <span className="mt-1 text-xs text-sand-400">Slate800 Grid3X3</span>
          </div>
          <div className="flex flex-col items-center">
            <DiamondIcon icon={<Mountain size={18} />} size="sm" bgColor="bg-zinc-950" actualBorderColor="bg-gold-300" iconColor="text-gold-300" borderThickness={1}/>
            <span className="mt-1 text-xs text-sand-400">Zinc Mountain</span>
          </div>
          <div className="flex flex-col items-center">
            <DiamondIcon icon={<Activity size={18} />} size="sm" bgColor="bg-neutral-950" actualBorderColor="bg-gold-300" iconColor="text-gold-300" borderThickness={1}/>
            <span className="mt-1 text-xs text-sand-400">Neutral Activity</span>
          </div>
          <div className="flex flex-col items-center">
            <DiamondIcon icon={<TrendingUp size={18} />} size="sm" bgColor="bg-sky-900" actualBorderColor="bg-gold-300" iconColor="text-gold-300" borderThickness={1}/>
            <span className="mt-1 text-xs text-sand-400">Sky900 TrendingUp</span>
          </div>
        </ShowcaseItem>
        
        <ShowcaseItem title="New Geometric Components (Already Geometric)">
          <div className="flex flex-col items-center">
            <TrapezoidButton skew="left" variant="primary" icon={<ChevronsRightLeft size={16}/>}>Skew Left Primary</TrapezoidButton>
            <span className="mt-1 text-xs text-sand-400">Trapezoid Left Primary</span>
          </div>
          <div className="flex flex-col items-center">
            <TrapezoidButton skew="right" variant="secondary" icon={<ChevronsRightLeft size={16}/>}>Skew Right Secondary</TrapezoidButton>
            <span className="mt-1 text-xs text-sand-400">Trapezoid Right Secondary</span>
          </div>
          <div className="flex flex-col items-center">
            <TrapezoidButton skew="none" variant="outline">No Skew Outline</TrapezoidButton>
            <span className="mt-1 text-xs text-sand-400">Trapezoid NoSkew Outline</span>
          </div>
          
          <div className="w-full my-4 border-t border-night-700"></div>

          <div className="flex flex-col items-center">
            <ChevronLink to="#" variant="primary" size="default" applyChevronShape={true}>
              Primary Chevron Link (Right)
            </ChevronLink>
            <span className="mt-1 text-xs text-sand-400">Chevron Primary Right</span>
          </div>
          <div className="flex flex-col items-center">
            <ChevronLink to="#" variant="secondary" size="sm" direction="left" applyChevronShape={true}>
              Secondary Small Chevron (Left)
            </ChevronLink>
            <span className="mt-1 text-xs text-sand-400">Chevron Secondary Left SM</span>
          </div>
          <div className="flex flex-col items-center">
            <ChevronLink to="#" variant="ghost" size="lg" applyChevronShape={false} icon={<ArrowRight size={20}/>}>
              Ghost Large Link (No Chevron Shape)
            </ChevronLink>
            <span className="mt-1 text-xs text-sand-400">Chevron Ghost LG NoShape</span>
          </div>
          <div className="flex flex-col items-center">
            <ChevronLink to="#" variant="primary" size="default" direction="left" applyChevronShape={true} icon={<ArrowLeft size={20}/>}>
              Go Back (Left Chevron)
            </ChevronLink>
            <span className="mt-1 text-xs text-sand-400">Chevron Primary Left Icon</span>
          </div>
        </ShowcaseItem>

        <ShowcaseItem title="Buttons (General Styles - Sharp Edges)">
            <div className="flex flex-col items-center">
              <button className="btn btn-primary"><code>btn btn-primary</code></button>
              <span className="mt-1 text-xs text-sand-400">Button Primary</span>
            </div>
            <div className="flex flex-col items-center">
              <button className="btn btn-secondary"><code>btn btn-secondary</code></button>
              <span className="mt-1 text-xs text-sand-400">Button Secondary</span>
            </div>
            <div className="flex flex-col items-center">
              <button className="btn btn-outline"><code>btn btn-outline</code></button>
              <span className="mt-1 text-xs text-sand-400">Button Outline</span>
            </div>
            <div className="flex flex-col items-center">
              <button className="btn btn-ghost"><code>btn btn-ghost</code></button>
              <span className="mt-1 text-xs text-sand-400">Button Ghost</span>
            </div>
            <div className="flex flex-col items-center">
              <button className="btn btn-link"><code>btn btn-link</code></button>
              <span className="mt-1 text-xs text-sand-400">Button Link</span>
            </div>
            <div className="flex flex-col items-center">
              <button className="btn btn-sm"><code>btn btn-sm</code></button>
              <span className="mt-1 text-xs text-sand-400">Button SM</span>
            </div>
            <div className="flex flex-col items-center">
              <button className="btn btn-lg"><code>btn btn-lg</code></button>
              <span className="mt-1 text-xs text-sand-400">Button LG</span>
            </div>
            <div className="flex flex-col items-center">
              <button className="btn btn-disabled" disabled><code>btn btn-disabled</code></button>
              <span className="mt-1 text-xs text-sand-400">Button Disabled</span>
            </div>
        </ShowcaseItem>

        <ShowcaseItem title="Form Elements (Sharp Edges & Dark Theme)">
            <div className="flex flex-col items-start gap-2 w-full md:w-1/3">
                <label htmlFor="test-input" className="text-sm font-medium text-sand-300">Label for Input</label>
                <input 
                  type="text" 
                  id="test-input" 
                  placeholder="Placeholder..." 
                  className="w-full px-3 py-2 border border-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-400 bg-slate-800 text-sand-100 placeholder-sand-500" 
                  style={{ colorScheme: 'dark' }} 
                />
                <p className="text-xs text-sand-400">Helper text or error message.</p>
                <span className="mt-1 text-xs text-sand-400 self-center">Text Input Example</span>
            </div>
            <div className="flex flex-col items-start gap-2 w-full md:w-1/3">
                <label htmlFor="test-select" className="text-sm font-medium text-sand-300">Label for Select</label>
                <select 
                  id="test-select" 
                  className="w-full px-3 py-2 border border-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-400 bg-slate-800 text-sand-100 [&>option]:bg-slate-800 [&>option]:text-sand-100" 
                  style={{ colorScheme: 'dark' }}
                > 
                    <option>Option 1</option>
                    <option>Option 2</option>
                </select>
                <span className="mt-1 text-xs text-sand-400 self-center">Select Example</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="test-checkbox" 
                    className="appearance-none w-4 h-4 border border-sand-500 bg-night-700 focus:outline-none focus:ring-1 focus:ring-amber-400 checked:bg-amber-600 checked:border-transparent"
                  />
                  <label htmlFor="test-checkbox" className="text-sm text-sand-300">Checkbox</label>
              </div>
              <span className="mt-1 text-xs text-sand-400">Checkbox Example</span>
            </div>
        </ShowcaseItem>
      </section>

      {/* Section: Custom POI Panels (Already Geometric) */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-sand-100 mb-6 pb-2 border-b border-night-700">Custom POI Panels</h2>
        <ShowcaseItem title="POI Panel Examples (Already Geometric)">
          <div className="flex flex-col items-center">
            <POIPanel 
              headerTitle="DATA CACHE"
              headerSubtitle="Encrypted Fremen Archive"
              imageUrl="/images/placeholder-datapad.png"
              imageAlt="Datapad with encrypted files"
              description={<>
                <p>A heavily encrypted datapad recovered from desert wreckage. Contains Fremen star charts.</p>
              </>}
              bundleTitle="Contents:"
              bundleItems={["Stellar Cartography Data", "Water Conservation Notes", "Litany Against Fear (Fragment)"]}
              bodyBgColor="bg-void-950"
              descriptionBgColor="bg-transparent"
              descriptionInlineStyle={{ backgroundColor: '#1b1d41' }}
              bundleBgColor="bg-transparent"
              bundleInlineStyle={{ backgroundColor: '#1b1d41' }}
              accentColor="text-gold-400"
              textColor="text-sand-300"
              bundleTitleColor="text-gold-300"
            />
            <span className="mt-2 text-xs text-sand-400">Data Cache Panel (Void Blue Prime Theme)</span>
          </div>

          <div className="flex flex-col items-center">
            <POIPanel 
              headerTitle="LOCATION DATA"
              headerSubtitle="Hidden Sietch Entrance"
              imagePlaceholderIcon={<MapPin size={48} className="text-amber-500"/>}
              description={<>
                <p>Coordinates point to a narrow fissure, possibly leading to an uncharted Fremen Sietch.</p>
              </>}
              accentColor="text-gold-400" 
              bodyBgColor="bg-night-900"
              textColor="text-sand-200"
            />
            <span className="mt-2 text-xs text-sand-400">Location Panel (Slate Zap Theme)</span>
          </div>

          <div className="flex flex-col items-center">
            <POIPanel 
              headerTitle="SPICE HOARD"
              headerSubtitle="Rich Vein Discovery"
              imagePlaceholderIcon={<Pyramid size={48} className="text-amber-400"/>}
              description={<>
                <p>A newly discovered, unusually rich pocket of Spice Melange. High risk, high reward.</p>
              </>}
              bundleTitle="Estimated Yield:"
              bundleItems={["Approx. 500kg Melange", "Minor Contaminants", "High Fremen Activity"]}
              bodyBgColor="bg-night-800"
              accentColor="text-gold-400"
              textColor="text-sand-200"
              bundleTitleColor="text-amber-300"
            />
            <span className="mt-2 text-xs text-sand-400">Spice Hoard Panel (Slate900 Target Header Theme)</span>
          </div>

        </ShowcaseItem>
      </section>

      <footer className="mt-12 text-center">
        <p className="text-sm text-sand-500">
          This test page is for development and QA purposes.
        </p>
      </footer>
    </div>
  );
};

export default UITestPage; 