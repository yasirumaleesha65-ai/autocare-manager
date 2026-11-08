import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserRound,
  Car,
  CalendarDays,
  Wrench,
  Package,
  Receipt,
  BarChart3,
  Settings,
  LogOut,
  Gauge,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";

const navigation = [
  {
    title: "Overview",
    path: "/manager",
    icon: LayoutDashboard,
  },
  {
    title: "Staff Management",
    path: "/manager/staff",
    icon: Users,
  },
  {
    title: "Customers",
    path: "/manager/customers",
    icon: UserRound,
  },
  {
    title: "Vehicles",
    path: "/manager/vehicles",
    icon: Car,
  },
  {
    title: "Appointments",
    path: "/manager/appointments",
    icon: CalendarDays,
  },
  {
    title: "Service Jobs",
    path: "/manager/service-jobs",
    icon: Wrench,
  },
  {
    title: "Inventory",
    path: "/manager/inventory",
    icon: Package,
  },
  {
    title: "Invoices & Payments",
    path: "/manager/invoices",
    icon: Receipt,
  },
  {
    title: "Reports",
    path: "/manager/reports",
    icon: BarChart3,
  },
];

export function ManagerSidebar() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      {/* Branding */}
      <div className="flex h-20 items-center gap-3 border-b border-slate-200 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
          <Gauge size={22} />
        </div>

        <div>
          <h1 className="text-lg font-bold text-slate-900">AutoCare</h1>
          <p className="text-xs text-slate-500">Management System</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Management
        </p>

        {navigation.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/manager"}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`
              }
            >
              <Icon size={19} />
              <span>{item.title}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-slate-200 p-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={19} />
          Logout
        </button>
      </div>
    </aside>
  );
}
