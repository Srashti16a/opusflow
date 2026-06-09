import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import VerifyEmail from "../pages/VerifyEmail";
import Dashboard from "../pages/Dashboard";
import AdminDashboard from "../pages/AdminDashboard";
import DepartmentMaster from "../pages/DepartmentMaster";
import SkillsMaster from "../pages/SkillsMaster";
import EmployeeList from "../pages/EmployeeList";
import EmployeeForm from "../pages/EmployeeForm";
import SQLJoinsView from "../pages/SQLJoinsView";
import LeavePanel from "../pages/LeavePanel";
import AssetPanel from "../pages/AssetPanel";
import ReportsPanel from "../pages/ReportsPanel";
import AuditLogPanel from "../pages/AuditLogPanel";
import ProtectedRoute from "../components/ProtectedRoute";

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/verify/:token" element={<VerifyEmail />} />

      {/* Protected Routes (Authenticated Users Only) */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/departments"
        element={
          <ProtectedRoute>
            <DepartmentMaster />
          </ProtectedRoute>
        }
      />

      <Route
        path="/skills"
        element={
          <ProtectedRoute>
            <SkillsMaster />
          </ProtectedRoute>
        }
      />

      <Route
        path="/employees"
        element={
          <ProtectedRoute>
            <EmployeeList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/employees/create"
        element={
          <ProtectedRoute>
            <EmployeeForm />
          </ProtectedRoute>
        }
      />

      <Route
        path="/employees/edit/:id"
        element={
          <ProtectedRoute>
            <EmployeeForm />
          </ProtectedRoute>
        }
      />

      <Route
        path="/joins"
        element={
          <ProtectedRoute>
            <SQLJoinsView />
          </ProtectedRoute>
        }
      />

      <Route
        path="/leaves"
        element={
          <ProtectedRoute>
            <LeavePanel />
          </ProtectedRoute>
        }
      />

      <Route
        path="/assets"
        element={
          <ProtectedRoute>
            <AssetPanel />
          </ProtectedRoute>
        }
      />

      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <ReportsPanel />
          </ProtectedRoute>
        }
      />

      <Route
        path="/audit-logs"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AuditLogPanel />
          </ProtectedRoute>
        }
      />

      {/* Admin-only Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Catch-all Redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
