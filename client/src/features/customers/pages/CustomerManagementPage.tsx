import { useEffect, useState } from "react";
import { getCustomers } from "../services/customerService";
import type { Customer, CustomerStatusFilter } from "../types/customer.types";
import { Link } from "react-router-dom";

export default function CustomerManagementPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<CustomerStatusFilter>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getCustomers({
          search,
          page,
          limit: 10,
          status,
        });

        setCustomers(response.customers);
        setTotalPages(response.pagination.totalPages);
      } catch {
        setError("Failed to load customers. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [search, page, status]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusChange = (value: CustomerStatusFilter) => {
    setStatus(value);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Customer Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage customer records and contact information.
          </p>
        </div>
        <div>
          <Link
            to="/manager/customers/new"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
          >
            Add Customer
          </Link>
        </div>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={search}
          onChange={(event) => handleSearch(event.target.value)}
          placeholder="Search by name, phone, email or customer code..."
          className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-500 sm:flex-1"
        />

        <select
          value={status}
          onChange={(event) =>
            handleStatusChange(event.target.value as CustomerStatusFilter)
          }
          className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-slate-500"
        >
          <option value="all">All Customers</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Customer table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Loading customers...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-sm text-red-600">{error}</div>
        ) : customers.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No customers found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-4">Customer</th>
                  <th className="px-5 py-4">Phone</th>
                  <th className="px-5 py-4">Email</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 ">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {customers.map((customer) => (
                  <tr key={customer._id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-900">
                        {customer.fullName}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {customer.customerCode}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {customer.phone}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {customer.email || "—"}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          customer.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {customer.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/manager/customers/${customer._id}`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800"
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
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Page {page} of {totalPages}
        </p>

        <div className="flex gap-2">
          <button
            onClick={() => setPage((current) => current - 1)}
            disabled={page <= 1 || loading}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>

          <button
            onClick={() => setPage((current) => current + 1)}
            disabled={page >= totalPages || loading}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
