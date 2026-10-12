import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AdminLayout } from './layouts/AdminLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { ApkManagement } from './pages/ApkManagement';
import { Notifications } from './pages/Notifications';
import { DownloaderMonitor } from './pages/DownloaderMonitor';
import { AnalyticsInstallations } from './pages/AnalyticsInstallations';
import { ErrorReports } from './pages/ErrorReports';
import { RemoteConfig } from './pages/RemoteConfig';
import { MaintenanceMode } from './pages/MaintenanceMode';
import { AdminUsers } from './pages/AdminUsers';
import { AuditLogs } from './pages/AuditLogs';
import { Settings } from './pages/Settings';
import { Profile } from './pages/Profile';

const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-dark-950 text-white">
        <div className="w-10 h-10 border-4 border-electric-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-mono text-slate-400">Verifying Admin Authentication...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Protected Admin Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="releases" element={<ApkManagement />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="downloader" element={<DownloaderMonitor />} />
            <Route path="analytics" element={<AnalyticsInstallations />} />
            <Route path="installations" element={<AnalyticsInstallations />} />
            <Route path="errors" element={<ErrorReports />} />
            <Route path="config" element={<RemoteConfig />} />
            <Route path="maintenance" element={<MaintenanceMode />} />
            <Route path="admins" element={<AdminUsers />} />
            <Route path="audit-logs" element={<AuditLogs />} />
            <Route path="settings" element={<Settings />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
