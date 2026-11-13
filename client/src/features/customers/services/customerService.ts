import api from "@/lib/axios";

import type {
  Customer,
  CreateCustomerData,
  UpdateCustomerData,
  CustomerListResponse,
  CustomerStatusFilter,
} from "../types/customer.types";

interface CustomerQueryParams {
  search?: string;
  page?: number;
  limit?: number;
  status?: CustomerStatusFilter;
}

interface CustomerResponse {
  customer: Customer;
  message?: string;
}

export const getCustomers = async (
  params: CustomerQueryParams = {},
): Promise<CustomerListResponse> => {
  const response = await api.get<CustomerListResponse>("/customers", {
    params,
  });

  return response.data;
};

export const getCustomerById = async (
  id: string,
): Promise<CustomerResponse> => {
  const response = await api.get<CustomerResponse>(`/customers/${id}`);

  return response.data;
};

export const createCustomer = async (
  data: CreateCustomerData,
): Promise<CustomerResponse> => {
  const response = await api.post<CustomerResponse>("/customers", data);

  return response.data;
};

export const updateCustomer = async (
  id: string,
  data: UpdateCustomerData,
): Promise<CustomerResponse> => {
  const response = await api.put<CustomerResponse>(`/customers/${id}`, data);

  return response.data;
};

export const updateCustomerStatus = async (
  id: string,
  isActive: boolean,
): Promise<CustomerResponse> => {
  const response = await api.patch<CustomerResponse>(
    `/customers/${id}/status`,
    { isActive },
  );

  return response.data;
};
