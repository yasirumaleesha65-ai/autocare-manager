import { Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "@/components/common/ProtectedRoute";
import ManagerRoute from "@/components/common/ManagerRoute";

import { ManagerLayout } from "@/components/layout/ManagerLayout";
import ManagerDashboard from "@/pages/manager/ManagerDashboard";
import StaffManagementPage from "@/pages/manager/staff/StaffManagementPage";
import CreateStaffPage from "@/pages/manager/staff/CreateStaffPage";
import VerifyStaffOTPPage from "@/pages/manager/staff/VerifyStaffOTPPage";
import SetStaffPasswordPage from "@/pages/manager/staff/SetStaffPasswordPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import VerifyResetOTPPage from "@/pages/auth/VerifyResetOTPPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";
import { useAuth } from "@/context/AuthContext";
import CustomerManagementPage from "@/features/customers/pages/CustomerManagementPage";
import CreateCustomerPage from "@/features/customers/pages/CreateCustomerPage";
import CustomerDetailsPage from "@/features/customers/pages/CustomerDetailsPage";
import EditCustomerPage from "@/features/customers/pages/EditCustomerPage";
import CustomerAccessRoute from "@/components/common/CustomerAccessRoute";
import VehicleManagementPage from "@/features/vehicles/pages/VehicleManagementPage";
import CreateVehiclePage from "@/features/vehicles/pages/CreateVehiclePage";
import VehicleDetailsPage from "@/features/vehicles/pages/VehicleDetailsPage";
import EditVehiclePage from "@/features/vehicles/pages/EditVehiclePage";
import TransferVehicleOwnershipPage from "@/features/vehicles/pages/TransferVehicleOwnershipPage";
// Keep your existing login page
import LoginPage from "@/pages/LoginPage";
import { LogOut } from "lucide-react";

function EmployeeDashboard() {
  const { logout, user } = useAuth();
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-900">Employee Dashboard</h1>
      <p className="mt-2 text-slate-500">Welcome to AutoCare {user?.name}.</p>
      <button
        className={
          "flex gap-3 text-red-600 border border-red-300 p-3 rounded-md cursor-pointer"
        }
        onClick={async () => await logout()}
      >
        <LogOut size={20} />
        Logout
      </button>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/verify-reset-otp" element={<VerifyResetOTPPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Authenticated routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<EmployeeDashboard />} />

        {/* Manager-only routes */}
        <Route element={<ManagerRoute />}>
          <Route path="/manager" element={<ManagerLayout />}>
            <Route index element={<ManagerDashboard />} />
            <Route path="staff" element={<StaffManagementPage />} />
            <Route path="staff/new" element={<CreateStaffPage />} />
            <Route path="staff/verify-otp" element={<VerifyStaffOTPPage />} />
            <Route
              path="staff/set-password"
              element={<SetStaffPasswordPage />}
            />
          </Route>
        </Route>

        {/* Manager and Receptionist routes */}
        <Route element={<CustomerAccessRoute />}>
          <Route path="/manager" element={<ManagerLayout />}>
            <Route path="customers" element={<CustomerManagementPage />} />
            <Route path="customers/new" element={<CreateCustomerPage />} />
            <Route path="customers/:id" element={<CustomerDetailsPage />} />
            <Route path="customers/:id/edit" element={<EditCustomerPage />} />
            <Route path="vehicles" element={<VehicleManagementPage />} />
            <Route path="vehicles/new" element={<CreateVehiclePage />} />
            <Route path="vehicles/:id" element={<VehicleDetailsPage />} />
            <Route path="vehicles/:id/edit" element={<EditVehiclePage />} />
            <Route
              path="vehicles/:id/transfer"
              element={<TransferVehicleOwnershipPage />}
            />
          </Route>
        </Route>
      </Route>

      {/* Default route */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Unknown routes */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
