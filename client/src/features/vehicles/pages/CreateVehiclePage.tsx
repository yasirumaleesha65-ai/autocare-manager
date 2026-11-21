import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getCustomers } from "@/features/customers/services/customerService";
import { createVehicle } from "../services/vehicleService";

import type { Customer } from "@/features/customers/types/customer.types";
import type { VehicleType } from "../types/vehicle.types";

export default function CreateVehiclePage() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [customerSearch, setCustomerSearch] = useState("");
  const [showCustomerResults, setShowCustomerResults] = useState(false);
  const [formData, setFormData] = useState({
    registrationNumber: "",
    vehicleType: "CAR" as VehicleType,
    make: "",
    model: "",
    manufacturingYear: "",
    color: "",
    vin: "",
    currentOwner: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      try {
        setLoadingCustomers(true);
        setError("");

        const response = await getCustomers({
          page: 1,
          limit: 10,
          search: customerSearch,
          status: "active",
        });

        setCustomers(response.customers);
      } catch {
        setError("Failed to load customers. Please try again.");
      } finally {
        setLoadingCustomers(false);
      }
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [customerSearch]);
  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      await createVehicle({
        ...formData,
        registrationNumber: formData.registrationNumber.trim().toUpperCase(),
        make: formData.make.trim(),
        model: formData.model.trim(),
        manufacturingYear: formData.manufacturingYear
          ? Number(formData.manufacturingYear)
          : null,
        color: formData.color.trim(),
        vin: formData.vin.trim(),
        notes: formData.notes.trim(),
      });

      navigate("/manager/vehicles");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "Failed to register vehicle. Please try again.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Register Vehicle
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Add a vehicle to an existing customer record.
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Vehicle Information */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Vehicle Information
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Enter the basic details of the vehicle.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* Registration Number */}
            <div>
              <label
                htmlFor="registrationNumber"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Registration Number *
              </label>
              <input
                id="registrationNumber"
                name="registrationNumber"
                value={formData.registrationNumber}
                onChange={handleChange}
                placeholder="e.g. ABC-1234"
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            {/* Vehicle Type */}
            <div>
              <label
                htmlFor="vehicleType"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Vehicle Type *
              </label>
              <select
                id="vehicleType"
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              >
                <option value="CAR">Car</option>
                <option value="VAN">Van</option>
                <option value="MOTORCYCLE">Motorcycle</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>
          {/* Make */}
          <div>
            <label
              htmlFor="make"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Make *
            </label>
            <input
              id="make"
              name="make"
              value={formData.make}
              onChange={handleChange}
              placeholder="e.g. Toyota"
              required
              maxLength={50}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          {/* Model */}
          <div>
            <label
              htmlFor="model"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Model *
            </label>
            <input
              id="model"
              name="model"
              value={formData.model}
              onChange={handleChange}
              placeholder="e.g. Corolla"
              required
              maxLength={50}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
          </div>
          {/* Manufacturing Year */}
          <div>
            <label
              htmlFor="manufacturingYear"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Manufacturing Year
            </label>
            <input
              id="manufacturingYear"
              name="manufacturingYear"
              type="number"
              value={formData.manufacturingYear}
              onChange={handleChange}
              placeholder="e.g. 2022"
              min={1900}
              max={new Date().getFullYear() + 1}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          {/* Color */}
          <div>
            <label
              htmlFor="color"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Color
            </label>
            <input
              id="color"
              name="color"
              value={formData.color}
              onChange={handleChange}
              placeholder="e.g. White"
              maxLength={30}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
          </div>
          {/* VIN */}
          <div className="sm:col-span-2">
            <label
              htmlFor="vin"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Vehicle Identification Number (VIN)
            </label>
            <input
              id="vin"
              name="vin"
              value={formData.vin}
              onChange={handleChange}
              placeholder="Enter VIN (optional)"
              maxLength={50}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
            <p className="mt-1 text-xs text-slate-500">
              The VIN is optional but can help identify the vehicle uniquely.
            </p>
          </div>
        </div>
        {/* Notes */}
        <div className="mt-5">
          <label
            htmlFor="notes"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Additional Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Enter any additional vehicle information..."
            rows={3}
            maxLength={500}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </div>
        {/* Owner Information */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Owner Information
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Select the customer who currently owns this vehicle.
          </p>

          <div className="relative mt-6">
            <label
              htmlFor="customerSearch"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Vehicle Owner *
            </label>

            <input
              id="customerSearch"
              type="text"
              value={customerSearch}
              onChange={(event) => {
                setCustomerSearch(event.target.value);
                setShowCustomerResults(true);

                setFormData((previous) => ({
                  ...previous,
                  currentOwner: "",
                }));
              }}
              onFocus={() => setShowCustomerResults(true)}
              placeholder="Search by customer name, phone, or code..."
              autoComplete="off"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />

            {showCustomerResults && (
              <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-60 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
                {loadingCustomers ? (
                  <p className="p-4 text-sm text-slate-500">
                    Searching customers...
                  </p>
                ) : customers.length === 0 ? (
                  <p className="p-4 text-sm text-slate-500">
                    No matching customers found.
                  </p>
                ) : (
                  customers.map((customer) => (
                    <button
                      key={customer._id}
                      type="button"
                      onClick={() => {
                        setFormData((previous) => ({
                          ...previous,
                          currentOwner: customer._id,
                        }));

                        setCustomerSearch(
                          `${customer.fullName} (${customer.customerCode})`,
                        );

                        setShowCustomerResults(false);
                      }}
                      className="w-full border-b border-slate-100 px-4 py-3 text-left transition last:border-0 hover:bg-slate-50"
                    >
                      <p className="text-sm font-medium text-slate-800">
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

            <p className="mt-2 text-xs text-slate-500">
              Search and select the customer who currently owns this vehicle.
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Form Actions */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => navigate("/manager/vehicles")}
            disabled={loading}
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading || loadingCustomers || customers.length === 0}
            className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Registering..." : "Register Vehicle"}
          </button>
        </div>
      </form>
    </div>
  );
}
