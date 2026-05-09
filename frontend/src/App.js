import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProjectProvider } from './contexts/ProjectContext';
import { useAuth } from './contexts/AuthContext';
import PrivateRoute from './components/shared/PrivateRoute';
import AppLayout from './components/shared/AppLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import MyTasksPage from './pages/MyTasksPage';
import MembersPage from './pages/MembersPage';

// Shows login/register pages always.
// If already logged in, shows the page with an "already logged in" UX
// handled inside LoginPage itself (it calls navigate after login anyway).
// We do NOT auto-redirect away — that's what caused /login to be unreachable.

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes — always reachable */}
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected routes */}
      <Route element={<PrivateRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/"              element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard"     element={<DashboardPage />} />
          <Route path="/projects"      element={<ProjectsPage />} />
          <Route path="/projects/:id"  element={<ProjectDetailPage />} />
          <Route path="/my-tasks"      element={<MyTasksPage />} />
          <Route path="/members"       element={<MembersPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ProjectProvider>
        <AppRoutes />
      </ProjectProvider>
    </AuthProvider>
  );
}
