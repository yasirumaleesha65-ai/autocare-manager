import { Bell, UserCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface ManagerHeaderProps {
  title: string;
  description?: string;
}

export function ManagerHeader({ title, description }: ManagerHeaderProps) {
  const { user } = useAuth();

  return (
    <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-8">
      {/* Page information */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>

        {description && (
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        )}
      </div>

      {/* Manager information */}
      <div className="flex items-center gap-5">
        <button
          className="relative rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100"
          aria-label="Notifications"
        >
          <Bell size={20} />
        </button>

        <div className="flex items-center gap-3 border-l border-slate-200 pl-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700">
            <UserCircle size={24} />
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
            <p className="text-xs text-slate-500">Manager</p>
          </div>
        </div>
      </div>
    </header>
  );
}
