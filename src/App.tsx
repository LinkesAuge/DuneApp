import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './components/auth/AuthProvider';
import Navbar from './components/common/Navbar';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import GridContainer from './components/grid/GridContainer';
import PoisPage from './pages/Pois';
import HaggaBasinPage from './pages/HaggaBasinPage';
import AdminPanel from './components/admin/AdminPanel';
import GridPage from './pages/GridPage';
import UITestPage from './pages/UITestPage';
import ProfilePage from './pages/ProfilePage';
import ItemsSchematicsPage from './pages/ItemsSchematicsPage';
import PoiLinkingPage from './pages/PoiLinkingPage';
import UnifiedPoiLinkingPage from './pages/UnifiedPoiLinkingPage';
import { SharedImagesTest } from './pages/SharedImagesTest';
import { useAuth } from './components/auth/AuthProvider';
import { AlertTriangle } from 'lucide-react';
import ItemDetailPage from './pages/ItemDetailPage';
import SchematicDetailPage from './pages/SchematicDetailPage';

const PendingApprovalMessage: React.FC = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="text-center max-w-lg mx-auto p-8">
      <AlertTriangle className="w-16 h-16 text-gold-500 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-gold-100 mb-3">Pending Approval</h2>
      <p className="text-gold-200 mb-2">
        Your account is currently pending approval from an administrator.
      </p>
      <p className="text-gold-300 text-sm">
        You'll gain full access to all features once your account is approved.
      </p>
    </div>
  </div>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spice-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (user.role === 'pending') {
    return <PendingApprovalMessage />;
  }

  return <>{children}</>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spice-600"></div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/auth/callback" element={<Auth />} />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/deep-desert" 
        element={
          <ProtectedRoute>
            <GridContainer />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/deep-desert/grid/:gridId" 
        element={
          <ProtectedRoute>
            <GridPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/grid" 
        element={<Navigate to="/deep-desert" replace />}
      />
      <Route 
        path="/pois" 
        element={
          <ProtectedRoute>
            <PoisPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/hagga-basin" 
        element={
          <ProtectedRoute>
            <HaggaBasinPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/database" 
        element={
          <AdminRoute>
            <ItemsSchematicsPage />
          </AdminRoute>
        } 
      />
      <Route 
        path="/poi-linking" 
        element={
          <AdminRoute>
            <UnifiedPoiLinkingPage />
          </AdminRoute>
        } 
      />
      <Route 
        path="/items/:entityId/link-pois" 
        element={
          <ProtectedRoute>
            <PoiLinkingPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/schematics/:entityId/link-pois" 
        element={
          <ProtectedRoute>
            <PoiLinkingPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/pois/:poiId/link-items" 
        element={
          <ProtectedRoute>
            <PoiLinkingPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/items/:itemId" 
        element={
          <ProtectedRoute>
            <ItemDetailPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/schematics/:schematicId" 
        element={
          <ProtectedRoute>
            <SchematicDetailPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin" 
        element={
          <AdminRoute>
            <AdminPanel />
          </AdminRoute>
        } 
      />
      <Route 
        path="/ui-test" 
        element={<UITestPage />}
      />
      <Route 
        path="/shared-images-test" 
        element={
          <ProtectedRoute>
            <SharedImagesTest />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div 
          className="min-h-screen flex flex-col bg-center bg-cover bg-no-repeat"
          style={{
            backgroundImage: 'url(/images/main-bg.webp)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        >
          <Navbar />
          <main className="flex-1">
            <AppRoutes />
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;