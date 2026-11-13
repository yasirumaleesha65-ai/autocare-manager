import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { getCustomerById, updateCustomer } from "../services/customerService";

import type { Customer } from "../types/customer.types";

export default function EditCustomerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState<Customer | null>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCustomer = async () => {
      if (!id) {
        setError("Invalid customer ID.");
        setLoading(false);
        return;
      }

      try {
        const response = await getCustomerById(id);
        const existingCustomer = response.customer;

        setCustomer(existingCustomer);

        setFormData({
          fullName: existingCustomer.fullName,
          phone: existingCustomer.phone,
          email: existingCustomer.email || "",
          address: existingCustomer.address || "",
          notes: existingCustomer.notes || "",
        });
      } catch {
        setError("Failed to load customer information.");
      } finally {
        setLoading(false);
      }
    };

    void fetchCustomer();
  }, [id]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!id) return;

    try {
      setSaving(true);
      setError("");

      await updateCustomer(id, formData);

      navigate(`/manager/customers/${id}`);
    } catch (err: unknown) {
      const message =
        (
          err as {
            response?: { data?: { message?: string } };
          }
        ).response?.data?.message ||
        "Failed to update customer. Please try again.";

      setError(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-sm text-slate-500">
        Loading customer information...
      </div>
    );
  }

  if (!customer) {
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
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          to={`/manager/customers/${id}`}
          className="text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          ← Back to Customer Details
        </Link>

        <h1 className="mt-4 text-2xl font-bold text-slate-900">
          Edit Customer
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Update information for {customer.fullName}.
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
              className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500"
            />
          </div>
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
          <button
            type="button"
            onClick={() => navigate(`/manager/customers/${id}`)}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
