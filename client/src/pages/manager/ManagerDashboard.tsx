import { Link } from "react-router-dom";
import { Users, Car, CalendarDays, Wrench, ArrowUpRight } from "lucide-react";

import { useAuth } from "@/context/AuthContext";

const summaryCards = [
  {
    title: "Total Staff",
    value: "—",
    description: "Registered staff members",
    icon: Users,
  },
  {
    title: "Total Vehicles",
    value: "—",
    description: "Vehicles registered",
    icon: Car,
  },
  {
    title: "Appointments",
    value: "—",
    description: "Scheduled appointments",
    icon: CalendarDays,
  },
  {
    title: "Active Service Jobs",
    value: "—",
    description: "Jobs currently in progress",
    icon: Wrench,
  },
];

export default function ManagerDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <section>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {user?.name}!
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Here's an overview of your vehicle service center.
        </p>
      </section>

      {/* Summary cards */}
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">
                  {card.title}
                </p>

                <div className="rounded-lg bg-slate-100 p-2.5 text-slate-700">
                  <Icon size={20} />
                </div>
              </div>

              <h2 className="mt-4 text-3xl font-bold text-slate-900">
                {card.value}
              </h2>

              <p className="mt-1 text-xs text-slate-500">{card.description}</p>
            </div>
          );
        })}
      </section>

      {/* Quick actions */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>

        <p className="mt-1 text-sm text-slate-500">Common management tasks.</p>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link
            to="/manager/staff"
            className="flex items-center justify-between rounded-lg border border-slate-200 p-4 transition-colors hover:border-slate-400 hover:bg-slate-50"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-slate-100 p-3 text-slate-700">
                <Users size={20} />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Manage Staff
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Create and manage staff accounts.
                </p>
              </div>
            </div>

            <ArrowUpRight size={18} className="text-slate-400" />
          </Link>
        </div>
      </section>

      {/* Future activity section */}
      <section className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
        <h2 className="font-semibold text-slate-800">Recent Activity</h2>

        <p className="mt-2 text-sm text-slate-500">
          Recent service center activities will appear here.
        </p>
      </section>
    </div>
  );
}
