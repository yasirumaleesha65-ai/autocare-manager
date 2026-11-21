import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getVehicleById, updateVehicle } from "../services/vehicleService";

import type { Vehicle, VehicleType } from "../types/vehicle.types";

export default function EditVehiclePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    registrationNumber: "",
    vehicleType: "CAR" as VehicleType,
    make: "",
    model: "",
    manufacturingYear: "",
    color: "",
    vin: "",
    notes: "",
  });
  useEffect(() => {
    const fetchVehicle = async () => {
      if (!id) {
        setError("Vehicle ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await getVehicleById(id);
        const existingVehicle = response.vehicle;

        setVehicle(existingVehicle);

        setFormData({
          registrationNumber: existingVehicle.registrationNumber,
          vehicleType: existingVehicle.vehicleType,
          make: existingVehicle.make,
          model: existingVehicle.model,
          manufacturingYear: existingVehicle.manufacturingYear
            ? String(existingVehicle.manufacturingYear)
            : "",
          color: existingVehicle.color || "",
          vin: existingVehicle.vin || "",
          notes: existingVehicle.notes || "",
        });
      } catch {
        setError("Failed to load vehicle information. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();
  }, [id]);
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

    if (!id) {
      setError("Vehicle ID is missing.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await updateVehicle(id, {
        registrationNumber: formData.registrationNumber.trim().toUpperCase(),
        vehicleType: formData.vehicleType,
        make: formData.make.trim(),
        model: formData.model.trim(),
        manufacturingYear: formData.manufacturingYear
          ? Number(formData.manufacturingYear)
          : undefined,
        color: formData.color.trim(),
        vin: formData.vin.trim().toUpperCase(),
        notes: formData.notes.trim(),
      });

      navigate(`/manager/vehicles/${id}`);
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })
        .response?.data?.message;

      setError(message || "Failed to update vehicle. Please try again.");
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
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Page Header */}
      <div>
        <button
          type="button"
          onClick={() => navigate(`/manager/vehicles/${id}`)}
          className="mb-3 text-sm font-medium text-slate-500 hover:text-slate-800"
        >
          ← Back to Vehicle Details
        </button>

        <h1 className="text-2xl font-bold text-slate-900">Edit Vehicle</h1>

        <p className="mt-1 text-sm text-slate-500">
          Update the registered vehicle information.
        </p>
      </div>

      {/* Edit Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border border-slate-200 bg-white p-6"
      >
        {/* Vehicle Information */}
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Vehicle Information
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Update the basic vehicle details.
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
                required
                maxLength={20}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm uppercase outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
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
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
              >
                <option value="CAR">Car</option>
                <option value="VAN">Van</option>
                <option value="MOTORCYCLE">Motorcycle</option>
                <option value="OTHER">Other</option>
              </select>
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
                required
                maxLength={50}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
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
                required
                maxLength={50}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
              />
            </div>
          </div>
        </div>
        {/* Additional Vehicle Details */}
        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
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
              min="1900"
              max={new Date().getFullYear() + 1}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
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
              maxLength={30}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
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
              maxLength={50}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm uppercase outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
            />
          </div>

          {/* Notes */}
          <div className="sm:col-span-2">
            <label
              htmlFor="notes"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Notes
            </label>

            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              maxLength={500}
              className="w-full resize-y rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
            />
          </div>
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
            disabled={submitting}
            className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Saving Changes..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
