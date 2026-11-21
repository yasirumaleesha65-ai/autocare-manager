import api from "@/lib/axios";

import type {
  Vehicle,
  CreateVehicleData,
  UpdateVehicleData,
  TransferVehicleOwnershipData,
  VehicleListResponse,
} from "../types/vehicle.types";

interface VehicleResponse {
  message?: string;
  vehicle: Vehicle;
}

interface VehicleListParams {
  search?: string;
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
}

export const getVehicles = async (
  params: VehicleListParams = {},
): Promise<VehicleListResponse> => {
  const response = await api.get<VehicleListResponse>("/vehicles", {
    params,
  });

  return response.data;
};

export const getVehicleById = async (id: string): Promise<VehicleResponse> => {
  const response = await api.get<VehicleResponse>(`/vehicles/${id}`);

  return response.data;
};

export const createVehicle = async (
  data: CreateVehicleData,
): Promise<VehicleResponse> => {
  const response = await api.post<VehicleResponse>("/vehicles", data);

  return response.data;
};

export const updateVehicle = async (
  id: string,
  data: UpdateVehicleData,
): Promise<VehicleResponse> => {
  const response = await api.put<VehicleResponse>(`/vehicles/${id}`, data);

  return response.data;
};

export const transferVehicleOwnership = async (
  id: string,
  data: TransferVehicleOwnershipData,
): Promise<VehicleResponse> => {
  const response = await api.patch<VehicleResponse>(
    `/vehicles/${id}/transfer`,
    data,
  );

  return response.data;
};

export const updateVehicleStatus = async (
  id: string,
  isActive: boolean,
): Promise<VehicleResponse> => {
  const response = await api.patch<VehicleResponse>(`/vehicles/${id}/status`, {
    isActive,
  });

  return response.data;
};
