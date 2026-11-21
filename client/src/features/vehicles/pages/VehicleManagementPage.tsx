import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getVehicles } from "../services/vehicleService";

import type { Vehicle, VehicleStatusFilter } from "../types/vehicle.types";

export default function VehicleManagementPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<VehicleStatusFilter>("active");
  const [type, setType] = useState("all");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getVehicles({
        search,
        page,
        limit: 10,
        type,
        status,
      });

      setVehicles(response.vehicles);
      setTotalPages(response.pagination.totalPages);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "Failed to load vehicles.";

      setError(message);
    } finally {
      setLoading(false);
    }
  }, [search, page, type, status]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Vehicle Management
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage registered vehicles and their ownership information.
          </p>
        </div>

        <Link
          to="/manager/vehicles/new"
          className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Register Vehicle
        </Link>
      </div>

      {/* Search */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="max-w-md">
          <label
            htmlFor="vehicle-search"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Search vehicles
          </label>

          <input
            id="vehicle-search"
            type="text"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search registration, make, model, or customer..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-end">
        <div className="w-full sm:max-w-xs">
          <label
            htmlFor="vehicle-type"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Vehicle Type
          </label>

          <select
            id="vehicle-type"
            value={type}
            onChange={(event) => {
              setType(event.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          >
            <option value="all">All Types</option>
            <option value="CAR">Car</option>
            <option value="VAN">Van</option>
            <option value="MOTORCYCLE">Motorcycle</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div className="w-full sm:max-w-xs">
          <label
            htmlFor="vehicle-status"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Status
          </label>

          <select
            id="vehicle-status"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as VehicleStatusFilter);
              setPage(1);
            }}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="all">All Statuses</option>
          </select>
        </div>
      </div>

      {/* Vehicles Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-10 text-center text-sm text-slate-500">
            Loading vehicles...
          </div>
        ) : error ? (
          <div className="p-10 text-center text-sm text-red-600">{error}</div>
        ) : vehicles.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm font-medium text-slate-700">
              No vehicles found
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Try changing your search or filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">Vehicle</th>
                  <th className="px-6 py-4 font-semibold">Type</th>
                  <th className="px-6 py-4 font-semibold">Owner</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {vehicles.map((vehicle) => (
                  <tr key={vehicle._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">
                        {vehicle.registrationNumber}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {vehicle.make} {vehicle.model}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {vehicle.vehicleType.replace("_", " ")}
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-800">
                        {vehicle.currentOwner.fullName}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {vehicle.currentOwner.customerCode}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          vehicle.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {vehicle.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/manager/vehicles/${vehicle._id}`}
                        className="font-medium text-slate-700 hover:text-slate-950"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && !error && totalPages > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Page <span className="font-medium text-slate-700">{page}</span> of{" "}
            <span className="font-medium text-slate-700">{totalPages}</span>
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((previous) => previous - 1)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((previous) => previous + 1)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
