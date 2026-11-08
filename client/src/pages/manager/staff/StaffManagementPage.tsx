import { Link } from "react-router-dom";
import { Plus, Users } from "lucide-react";

export default function StaffManagementPage() {
  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Staff Management
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Create and manage your vehicle service center staff.
          </p>
        </div>

        <Link
          to="/manager/staff/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-700"
        >
          <Plus size={18} />
          Create Staff
        </Link>
      </div>

      {/* Staff content */}
      <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-600">
          <Users size={26} />
        </div>

        <h2 className="mt-4 text-lg font-semibold text-slate-900">
          Staff Accounts
        </h2>

        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
          Your registered staff members will appear here. You will be able to
          view and manage their accounts.
        </p>
      </div>
    </div>
  );
}
