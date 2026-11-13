import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getCustomerById } from "../services/customerService";
import type { Customer } from "../types/customer.types";
import { useAuth } from "@/context/AuthContext";

import { updateCustomerStatus } from "../services/customerService";

export default function CustomerDetailsPage() {
  const { id } = useParams<{ id: string }>();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();

  const [statusUpdating, setStatusUpdating] = useState(false);
  const [showStatusConfirmation, setShowStatusConfirmation] = useState(false);
  const [statusError, setStatusError] = useState("");

  useEffect(() => {
    const fetchCustomer = async () => {
      if (!id) {
        setError("Invalid customer ID.");
        setLoading(false);
        return;
      }

      try {
        const response = await getCustomerById(id);
        setCustomer(response.customer);
      } catch {
        setError("Failed to load customer details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    void fetchCustomer();
  }, [id]);
  const handleStatusChange = async () => {
    if (!id || !customer || user?.role !== "MANAGER") return;

    try {
      setStatusUpdating(true);
      setStatusError("");

      const response = await updateCustomerStatus(id, !customer.isActive);

      setCustomer(response.customer);
      setShowStatusConfirmation(false);
    } catch (err: unknown) {
      const message =
        (
          err as {
            response?: { data?: { message?: string } };
          }
        ).response?.data?.message || "Failed to update customer status.";

      setStatusError(message);
    } finally {
      setStatusUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-sm text-slate-500">
        Loading customer details...
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="space-y-4">
        <p className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error || "Customer not found."}
        </p>

        <Link
          to="/manager/customers"
          className="text-sm font-medium text-slate-700 hover:underline"
        >
          Back to Customers
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link
          to="/manager/customers"
          className="text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          ← Back to Customers
        </Link>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {customer.fullName}
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Customer Code: {customer.customerCode}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${
                customer.isActive
                  ? "bg-green-100 text-green-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {customer.isActive ? "Active" : "Inactive"}
            </span>

            <Link
              to={`/manager/customers/${customer._id}/edit`}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Edit Customer
            </Link>
            {user?.role === "MANAGER" && (
              <button
                type="button"
                onClick={() => setShowStatusConfirmation(true)}
                className={`rounded-lg px-4 py-2 text-sm font-medium ${
                  customer.isActive
                    ? "border border-red-200 text-red-600 hover:bg-red-50"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                {customer.isActive ? "Deactivate" : "Activate"}
              </button>
            )}
          </div>
        </div>
      </div>
      {statusError && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {statusError}
        </p>
      )}

      {showStatusConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-900">
              {customer.isActive
                ? "Deactivate Customer?"
                : "Activate Customer?"}
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              {customer.isActive
                ? "Are you sure you want to deactivate this customer? Their existing records and service history will be preserved."
                : "Are you sure you want to activate this customer again?"}
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={statusUpdating}
                onClick={() => setShowStatusConfirmation(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={statusUpdating}
                onClick={handleStatusChange}
                className={`rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50 ${
                  customer.isActive
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {statusUpdating
                  ? "Updating..."
                  : customer.isActive
                    ? "Yes, Deactivate"
                    : "Yes, Activate"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Customer Information
        </h2>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-sm text-slate-500">Full Name</p>
            <p className="mt-1 font-medium text-slate-900">
              {customer.fullName}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">Phone Number</p>
            <p className="mt-1 font-medium text-slate-900">{customer.phone}</p>
          </div>

          <div>
            <p className="text-sm text-slate-500">Email Address</p>
            <p className="mt-1 font-medium text-slate-900">
              {customer.email || "Not provided"}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">Address</p>
            <p className="mt-1 font-medium text-slate-900">
              {customer.address || "Not provided"}
            </p>
          </div>

          <div className="sm:col-span-2">
            <p className="text-sm text-slate-500">Notes</p>
            <p className="mt-1 whitespace-pre-wrap font-medium text-slate-900">
              {customer.notes || "No additional notes"}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Account Information
        </h2>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <p className="text-sm text-slate-500">Created Date</p>
            <p className="mt-1 font-medium text-slate-900">
              {new Date(customer.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">Last Updated</p>
            <p className="mt-1 font-medium text-slate-900">
              {new Date(customer.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Vehicles and Service History
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Customer vehicles and previous service records will appear here once
          those modules are implemented.
        </p>
      </div>
    </div>
  );
}
