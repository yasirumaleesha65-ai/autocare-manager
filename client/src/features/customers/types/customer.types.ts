export interface CustomerCreator {
  _id: string;
  name: string;
  email: string;
}

export interface Customer {
  _id: string;
  customerCode: string;
  fullName: string;
  phone: string;
  email: string | null;
  address: string;
  notes: string;
  isActive: boolean;
  createdBy: string | CustomerCreator;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerData {
  fullName: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
  confirmDuplicate?: boolean;
}

export interface UpdateCustomerData {
  fullName?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
}

export interface CustomerPagination {
  currentPage: number;
  pageSize: number;
  totalCustomers: number;
  totalPages: number;
}

export interface CustomerListResponse {
  customers: Customer[];
  pagination: CustomerPagination;
}

export type CustomerStatusFilter = "all" | "active" | "inactive";

export interface PossibleDuplicateCustomer {
  _id: string;
  customerCode: string;
  fullName: string;
  phone: string;
  email: string | null;
}

export interface PossibleDuplicateResponse {
  code: "POSSIBLE_DUPLICATE";
  message: string;
  matches: PossibleDuplicateCustomer[];
}
