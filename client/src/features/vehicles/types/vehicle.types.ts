export interface VehicleCustomer {
  _id: string;
  customerCode: string;
  fullName: string;
  phone: string;
  email?: string | null;
  address?: string;
}

export interface VehicleCreator {
  _id: string;
  name: string;
  email: string;
}

export type VehicleType = "CAR" | "VAN" | "MOTORCYCLE" | "OTHER";

export interface VehicleOwnershipHistory {
  customer: VehicleCustomer;
  transferredAt: string;
  notes: string;
}

export interface Vehicle {
  _id: string;
  registrationNumber: string;
  vehicleType: VehicleType;
  make: string;
  model: string;
  manufacturingYear: number | null;
  color: string;
  vin: string | null;
  currentOwner: VehicleCustomer;
  ownershipHistory: VehicleOwnershipHistory[];
  notes: string;
  isActive: boolean;
  createdBy: VehicleCreator;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVehicleData {
  registrationNumber: string;
  vehicleType: VehicleType;
  make: string;
  model: string;
  manufacturingYear?: number | null;
  color?: string;
  vin?: string;
  currentOwner: string;
  notes?: string;
}

export interface UpdateVehicleData {
  registrationNumber?: string;
  vehicleType?: VehicleType;
  make?: string;
  model?: string;
  manufacturingYear?: number | null;
  color?: string;
  vin?: string | null;
  notes?: string;
}

export interface TransferVehicleOwnershipData {
  newOwner: string;
  notes?: string;
}

export interface VehiclePagination {
  currentPage: number;
  pageSize: number;
  totalVehicles: number;
  totalPages: number;
}

export interface VehicleListResponse {
  vehicles: Vehicle[];
  pagination: VehiclePagination;
}

export type VehicleStatusFilter = "all" | "active" | "inactive";
