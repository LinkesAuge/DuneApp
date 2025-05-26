import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/auth/AuthProvider';
import Navbar from './components/common/Navbar';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import GridContainer from './components/grid/GridContainer';
import PoisPage from './pages/Pois';
import AdminPanel from './components/admin/AdminPanel';
import { useAuth } from './components/auth/AuthProvider';
import { AlertTriangle } from 'lucide-react';

const PendingApprovalMessage: React.FC = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="text-center max-w-lg mx-auto p-8">
      <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-night-800 mb-3">Pending Approval</h2>
      <p className="text-night-600 mb-2">
        Your account is currently pending approval from an administrator.
      </p>
      <p className="text-night-500 text-sm">
        You'll gain full access to all features once your account is approved.
      </p>
    </div>
  </div>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spice-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
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
    <Routes future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={<Auth />} />
      <Route 
        path="/grid" 
        element={
          <ProtectedRoute>
            <GridContainer />
          </ProtectedRoute>
        } 
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
        path="/admin" 
        element={
          <AdminRoute>
            <AdminPanel />
          </AdminRoute>
        } 
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-sand-100">
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