import { Outlet } from "react-router-dom";

import { ManagerSidebar } from "@/components/layout/ManagerSidebar";
import { ManagerHeader } from "@/components/layout/ManagerHeader";

export function ManagerLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <ManagerSidebar />

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <ManagerHeader
          title="Manager Dashboard"
          description="Welcome to your management workspace."
        />

        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
