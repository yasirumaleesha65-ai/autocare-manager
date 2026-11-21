import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getVehicleById,
  updateVehicleStatus,
} from "../services/vehicleService";
import { useAuth } from "@/context/AuthContext";
import type { Vehicle } from "../types/vehicle.types";

export default function VehicleDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isManager = user?.role === "MANAGER";

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

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
        setVehicle(response.vehicle);
      } catch (error) {
        setError("Failed to load vehicle details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();
  }, [id]);
  const handleStatusChange = async () => {
    if (!vehicle) return;

    const newStatus = !vehicle.isActive;

    const confirmed = window.confirm(
      `Are you sure you want to ${
        newStatus ? "activate" : "deactivate"
      } this vehicle?`,
    );

    if (!confirmed) return;

    try {
      setUpdatingStatus(true);
      setError("");

      const response = await updateVehicleStatus(vehicle._id, newStatus);

      setVehicle(response.vehicle);
    } catch (error) {
      setError("Failed to update vehicle status. Please try again.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-slate-500">Loading vehicle details...</p>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <p className="text-sm text-red-600">{error || "Vehicle not found."}</p>

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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <button
            type="button"
            onClick={() => navigate("/manager/vehicles")}
            className="mb-3 text-sm font-medium text-slate-500 hover:text-slate-800"
          >
            ← Back to Vehicles
          </button>

          <h1 className="text-2xl font-bold text-slate-900">
            {vehicle.registrationNumber}
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            {vehicle.make} {vehicle.model}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate(`/manager/vehicles/${vehicle._id}/edit`)}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Edit Vehicle
          </button>
        </div>
      </div>
      {/* Vehicle Information */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-slate-900">
            Vehicle Information
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            General information about this vehicle.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-sm text-slate-500">Registration Number</p>
            <p className="mt-1 font-medium text-slate-900">
              {vehicle.registrationNumber}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">Vehicle Type</p>
            <p className="mt-1 font-medium text-slate-900">
              {vehicle.vehicleType}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">Make</p>
            <p className="mt-1 font-medium text-slate-900">{vehicle.make}</p>
          </div>

          <div>
            <p className="text-sm text-slate-500">Model</p>
            <p className="mt-1 font-medium text-slate-900">{vehicle.model}</p>
          </div>

          <div>
            <p className="text-sm text-slate-500">Manufacturing Year</p>
            <p className="mt-1 font-medium text-slate-900">
              {vehicle.manufacturingYear || "Not provided"}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">Color</p>
            <p className="mt-1 font-medium text-slate-900">
              {vehicle.color || "Not provided"}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">VIN</p>
            <p className="mt-1 font-medium text-slate-900">
              {vehicle.vin || "Not provided"}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">Status</p>
            <p
              className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                vehicle.isActive
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {vehicle.isActive ? "Active" : "Inactive"}
            </p>
          </div>
        </div>

        {vehicle.notes && (
          <div className="mt-6 border-t border-slate-100 pt-5">
            <p className="text-sm text-slate-500">Notes</p>
            <p className="mt-1 text-sm text-slate-900">{vehicle.notes}</p>
          </div>
        )}
      </div>
      {/* Current Owner */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-slate-900">
            Current Owner
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Customer currently associated with this vehicle.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <p className="text-sm text-slate-500">Customer Name</p>
            <p className="mt-1 font-medium text-slate-900">
              {typeof vehicle.currentOwner === "object"
                ? vehicle.currentOwner.fullName
                : "Customer information unavailable"}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">Customer Code</p>
            <p className="mt-1 font-medium text-slate-900">
              {typeof vehicle.currentOwner === "object"
                ? vehicle.currentOwner.customerCode
                : "—"}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">Phone Number</p>
            <p className="mt-1 font-medium text-slate-900">
              {typeof vehicle.currentOwner === "object"
                ? vehicle.currentOwner.phone
                : "—"}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">Email</p>
            <p className="mt-1 font-medium text-slate-900">
              {typeof vehicle.currentOwner === "object"
                ? vehicle.currentOwner.email || "Not provided"
                : "—"}
            </p>
          </div>
        </div>
      </div>
      {/* Ownership History */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-slate-900">
            Ownership History
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Previous ownership records for this vehicle.
          </p>
        </div>

        {vehicle.ownershipHistory.length === 0 ? (
          <div className="rounded-lg bg-slate-50 p-6 text-center">
            <p className="text-sm text-slate-500">
              No ownership transfers have been recorded.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {vehicle.ownershipHistory.map((history, index) => (
              <div
                key={index}
                className="rounded-lg border border-slate-200 p-4"
              >
                <p className="font-medium text-slate-900">
                  {typeof history.customer === "object"
                    ? history.customer.fullName
                    : "Customer information unavailable"}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {new Date(history.transferredAt).toLocaleDateString()}
                </p>

                {history.notes && (
                  <p className="mt-2 text-sm text-slate-600">{history.notes}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Vehicle Actions */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Vehicle Actions
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Manage ownership and vehicle records.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() =>
              navigate(`/manager/vehicles/${vehicle._id}/transfer`)
            }
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Transfer Ownership
          </button>
        </div>
      </div>
      {isManager && (
        <button
          type="button"
          onClick={handleStatusChange}
          disabled={updatingStatus}
          className={`rounded-lg px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50 ${
            vehicle.isActive
              ? "bg-red-600 hover:bg-red-700"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {updatingStatus
            ? "Updating..."
            : vehicle.isActive
              ? "Deactivate Vehicle"
              : "Activate Vehicle"}
        </button>
      )}
    </div>
  );
}
