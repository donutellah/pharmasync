import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import AdminInventory from './pages/AdminInventory';
import ExpiryAlerts from './pages/ExpiryAlerts';
import FinancialReport from './pages/FinancialReport';
import AuditLogs from './pages/AuditLogs';
import UserManagement from './pages/UserManagement';
import Settings from './pages/Settings';
import AIAssistant from './pages/AIAssistant';
import POSIntegration from './pages/POSIntegration';
import OfflineSync from './pages/OfflineSync';
import PharmacistDashboard from './pages/PharmacistDashboard';
import PharmacistSales from './pages/PharmacistSales';
import PharmacistInventory from './pages/PharmacistInventory';
import PharmacistExpiry from './pages/PharmacistExpiry';
import PharmacistAudit from './pages/PharmacistAudit';
import PharmacistSettings from './pages/PharmacistSettings';

function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (!token) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Admin */}
        <Route path="/dashboard" element={
          <ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>
        } />
        <Route path="/inventory" element={
          <ProtectedRoute role="admin"><AdminInventory /></ProtectedRoute>
        } />
        <Route path="/expiry" element={
          <ProtectedRoute role="admin"><ExpiryAlerts /></ProtectedRoute>
        } />
        <Route path="/financial" element={
          <ProtectedRoute role="admin"><FinancialReport /></ProtectedRoute>
        } />
        <Route path="/audit" element={
          <ProtectedRoute role="admin"><AuditLogs /></ProtectedRoute>
        } />
        <Route path="/users" element={
          <ProtectedRoute role="admin"><UserManagement /></ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute role="admin"><Settings /></ProtectedRoute>
        } />
        <Route path="/ai" element={
          <ProtectedRoute role="admin"><AIAssistant /></ProtectedRoute>
        } />
        <Route path="/pos" element={
          <ProtectedRoute role="admin"><POSIntegration /></ProtectedRoute>
        } />
        <Route path="/sync" element={
          <ProtectedRoute role="admin"><OfflineSync /></ProtectedRoute>
        } />

        {/* Pharmacist */}
        <Route path="/pharmacist-dashboard" element={
          <ProtectedRoute role="pharmacist"><PharmacistDashboard /></ProtectedRoute>
        } />
        <Route path="/pharmacist-sales" element={
          <ProtectedRoute role="pharmacist"><PharmacistSales /></ProtectedRoute>
        } />
        <Route path="/pharmacist-inventory" element={
          <ProtectedRoute role="pharmacist"><PharmacistInventory /></ProtectedRoute>
        } />
        <Route path="/pharmacist-expiry" element={
          <ProtectedRoute role="pharmacist"><PharmacistExpiry /></ProtectedRoute>
        } />
        <Route path="/pharmacist-audit" element={
          <ProtectedRoute role="pharmacist"><PharmacistAudit /></ProtectedRoute>
        } />
        <Route path="/pharmacist-settings" element={
          <ProtectedRoute role="pharmacist"><PharmacistSettings /></ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
