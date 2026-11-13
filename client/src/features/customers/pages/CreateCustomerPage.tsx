import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { createCustomer } from "../services/customerService";

import type {
  PossibleDuplicateCustomer,
  PossibleDuplicateResponse,
} from "../types/customer.types";

export default function CreateCustomerPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [duplicates, setDuplicates] = useState<PossibleDuplicateCustomer[]>([]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
    confirmDuplicate = false,
  ) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");
      setDuplicates([]);

      await createCustomer({
        ...formData,
        confirmDuplicate,
      });

      navigate("/manager/customers");
    } catch (err: unknown) {
      const response = (
        err as {
          response?: {
            data?: PossibleDuplicateResponse & { message?: string };
          };
        }
      ).response?.data;

      if (response?.code === "POSSIBLE_DUPLICATE") {
        setDuplicates(response.matches || []);
      } else {
        setError(
          response?.message || "Failed to create customer. Please try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Add New Customer</h1>

        <p className="mt-1 text-sm text-slate-500">
          Register a new customer in AutoCare Manager.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border border-slate-200 bg-white p-6"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-medium text-slate-700">
              Full Name *
            </label>

            <input
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              maxLength={100}
              placeholder="Enter customer name"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Phone Number *
            </label>

            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="0771234567"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Email Address
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="customer@example.com"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500"
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-medium text-slate-700">
              Address
            </label>

            <input
              name="address"
              value={formData.address}
              onChange={handleChange}
              maxLength={300}
              placeholder="Enter customer address"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500"
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-medium text-slate-700">Notes</label>

            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              maxLength={500}
              rows={4}
              placeholder="Additional information about the customer..."
              className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500"
            />
          </div>
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </p>
        )}

        {duplicates.length > 0 && (
          <div className="space-y-4 rounded-lg border border-amber-300 bg-amber-50 p-4">
            <div>
              <h3 className="font-semibold text-amber-900">
                Possible Duplicate Customers
              </h3>

              <p className="mt-1 text-sm text-amber-800">
                We found existing customers with matching phone numbers or email
                addresses. Please review them before continuing.
              </p>
            </div>

            <div className="space-y-3">
              {duplicates.map((customer) => (
                <div
                  key={customer._id}
                  className="rounded-lg border border-amber-200 bg-white p-3"
                >
                  <p className="font-medium text-slate-900">
                    {customer.fullName}
                  </p>

                  <p className="text-sm text-slate-600">
                    Customer Code: {customer.customerCode}
                  </p>

                  <p className="text-sm text-slate-600">
                    Phone: {customer.phone}
                  </p>

                  {customer.email && (
                    <p className="text-sm text-slate-600">
                      Email: {customer.email}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <p className="text-sm text-amber-900">
              If this is a different customer, you can continue creating the
              record.
            </p>

            <button
              type="button"
              disabled={loading}
              onClick={(event) => {
                void handleSubmit(
                  event as unknown as React.FormEvent<HTMLFormElement>,
                  true,
                );
              }}
              className="rounded-lg bg-amber-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-800 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Anyway"}
            </button>
          </div>
        )}

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
          <button
            type="button"
            onClick={() => navigate("/manager/customers")}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Customer"}
          </button>
        </div>
      </form>
    </div>
  );
}
