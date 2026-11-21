import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getVehicleById,
  transferVehicleOwnership,
} from "../services/vehicleService";
import { getCustomers } from "@/features/customers/services/customerService";

import type { Vehicle } from "../types/vehicle.types";
import type { Customer } from "@/features/customers/types/customer.types";

export default function TransferVehicleOwnershipPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [transferNotes, setTransferNotes] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [showCustomerResults, setShowCustomerResults] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError("Vehicle ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const [vehicleResponse, customerResponse] = await Promise.all([
          getVehicleById(id),
          getCustomers({
            page: 1,
            limit: 10,
            status: "active",
          }),
        ]);

        setVehicle(vehicleResponse.vehicle);
        setCustomers(customerResponse.customers);
      } catch {
        setError("Failed to load vehicle and customer information.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      try {
        const response = await getCustomers({
          page: 1,
          limit: 10,
          search: customerSearch,
          status: "active",
        });

        setCustomers(response.customers);
      } catch {
        setError("Failed to search customers. Please try again.");
      }
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [customerSearch]);
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!id || !selectedCustomer) {
      setError("Please select a new owner.");
      return;
    }

    if (vehicle && selectedCustomer === vehicle.currentOwner._id) {
      setError("The selected customer is already the current owner.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await transferVehicleOwnership(id, {
        newOwner: selectedCustomer,
        notes: transferNotes.trim(),
      });

      navigate(`/manager/vehicles/${id}`);
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })
        .response?.data?.message;

      setError(
        message || "Failed to transfer vehicle ownership. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-slate-500">Loading vehicle information...</p>
      </div>
    );
  }

  if (error && !vehicle) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <p className="text-sm text-red-600">{error}</p>

        <button
          type="button"
          onClick={() => navigate("/manager/vehicles")}
          className="mt-4 text-sm font-medium text-slate-700 hover:underline"
        >
          Back to Vehicles
        </button>
      </div>
    );
  }

  if (!vehicle) {
    return null;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Page Header */}
      <div>
        <button
          type="button"
          onClick={() => navigate(`/manager/vehicles/${id}`)}
          className="mb-3 text-sm font-medium text-slate-500 hover:text-slate-800"
        >
          ← Back to Vehicle Details
        </button>

        <h1 className="text-2xl font-bold text-slate-900">
          Transfer Vehicle Ownership
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Transfer this vehicle to another registered customer.
        </p>
      </div>

      {/* Vehicle Information */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Vehicle Information
        </h2>

        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <p className="text-sm text-slate-500">Registration Number</p>
            <p className="mt-1 font-medium text-slate-900">
              {vehicle.registrationNumber}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">Vehicle</p>
            <p className="mt-1 font-medium text-slate-900">
              {vehicle.make} {vehicle.model}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">Current Owner</p>
            <p className="mt-1 font-medium text-slate-900">
              {vehicle.currentOwner.fullName}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">Customer Code</p>
            <p className="mt-1 font-medium text-slate-900">
              {vehicle.currentOwner.customerCode}
            </p>
          </div>
        </div>
      </div>

      {/* Transfer Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border border-slate-200 bg-white p-6"
      >
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            New Owner Information
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Search and select the customer who will become the new owner.
          </p>
        </div>

        {/* Customer Search */}
        <div>
          <label
            htmlFor="customerSearch"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Select New Owner *
          </label>

          <div className="relative">
            <input
              id="customerSearch"
              type="text"
              value={customerSearch}
              onChange={(event) => {
                setCustomerSearch(event.target.value);
                setSelectedCustomer("");
                setShowCustomerResults(true);
              }}
              onFocus={() => setShowCustomerResults(true)}
              placeholder="Search by customer name, phone, or code..."
              autoComplete="off"
              required={!selectedCustomer}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
            />

            {showCustomerResults && (
              <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-60 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
                {customers.length === 0 ? (
                  <p className="p-4 text-sm text-slate-500">
                    No customers found.
                  </p>
                ) : (
                  customers
                    .filter(
                      (customer) => customer._id !== vehicle.currentOwner._id,
                    )
                    .map((customer) => (
                      <button
                        key={customer._id}
                        type="button"
                        onClick={() => {
                          setSelectedCustomer(customer._id);
                          setCustomerSearch(
                            `${customer.fullName} (${customer.customerCode})`,
                          );
                          setShowCustomerResults(false);
                        }}
                        className="w-full border-b border-slate-100 px-4 py-3 text-left last:border-0 hover:bg-slate-50"
                      >
                        <p className="text-sm font-medium text-slate-900">
                          {customer.fullName}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {customer.customerCode} · {customer.phone}
                        </p>
                      </button>
                    ))
                )}
              </div>
            )}
          </div>

          <p className="mt-2 text-xs text-slate-500">
            Only active customers can be selected.
          </p>
        </div>

        {/* Transfer Notes */}
        <div>
          <label
            htmlFor="transferNotes"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Transfer Notes (Optional)
          </label>

          <textarea
            id="transferNotes"
            value={transferNotes}
            onChange={(event) => setTransferNotes(event.target.value)}
            rows={3}
            maxLength={500}
            placeholder="Enter any relevant ownership transfer details..."
            className="w-full resize-y rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
          />
        </div>
        {/* Transfer Warning */}
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-800">
            Important: Ownership Transfer
          </p>

          <p className="mt-1 text-sm text-amber-700">
            This action will change the vehicle's current owner. The previous
            ownership record will be preserved in the vehicle's ownership
            history.
          </p>
        </div>

        {/* Form Error */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex flex-col-reverse justify-end gap-3 border-t border-slate-100 pt-5 sm:flex-row">
          <button
            type="button"
            onClick={() => navigate(`/manager/vehicles/${id}`)}
            disabled={submitting}
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting || !selectedCustomer}
            className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Transferring..." : "Transfer Ownership"}
          </button>
        </div>
      </form>
    </div>
  );
}
