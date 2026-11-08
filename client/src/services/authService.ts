import api from "@/lib/axios";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "MANAGER" | "RECEPTIONIST" | "MECHANIC" | "INVENTORY";
}

interface LoginResponse {
  message: string;
  user: AuthUser;
}
export interface CreateStaffData {
  name: string;
  email: string;
  role: "RECEPTIONIST" | "MECHANIC" | "INVENTORY";
}

export interface CreateStaffResponse {
  message: string;
  userId: string;
}
export interface VerifyRegistrationOTPData {
  userId: string;
  otp: string;
}

export interface VerifyRegistrationOTPResponse {
  message: string;
  registrationToken: string;
}
export interface SetStaffPasswordData {
  password: string;
  registrationToken: string;
}
export interface ResetPasswordData {
  password: string;
  resetToken: string;
}

export const loginUser = async (
  credentials: LoginCredentials,
): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>("/auth/login", credentials);

  return response.data;
};

export const getCurrentUser = async (): Promise<AuthUser> => {
  const response = await api.get<{ user: AuthUser }>("/auth/me");
  return response.data.user;
};

export const logoutUser = async (): Promise<void> => {
  await api.post("/auth/logout");
};

export const createStaffUser = async (
  staffData: CreateStaffData,
): Promise<CreateStaffResponse> => {
  const response = await api.post<CreateStaffResponse>(
    "/auth/register",
    staffData,
  );

  return response.data;
};

export const verifyRegistrationOTP = async (
  data: VerifyRegistrationOTPData,
): Promise<VerifyRegistrationOTPResponse> => {
  const response = await api.post<VerifyRegistrationOTPResponse>(
    "/auth/verify-registration",
    data,
  );

  return response.data;
};

export const setStaffPassword = async (
  data: SetStaffPasswordData,
): Promise<{ message: string }> => {
  const response = await api.post<{ message: string }>(
    "/auth/set-password",
    { password: data.password },
    {
      headers: {
        Authorization: `Bearer ${data.registrationToken}`,
      },
    },
  );

  return response.data;
};

export interface ForgotPasswordResponse {
  message: string;
}

export const forgotPassword = async (
  email: string,
): Promise<ForgotPasswordResponse> => {
  const response = await api.post<ForgotPasswordResponse>(
    "/auth/forgot-password",
    { email },
  );

  return response.data;
};

export interface VerifyResetOTPData {
  email: string;
  otp: string;
}

export interface VerifyResetOTPResponse {
  message: string;
  resetToken: string;
}

export const verifyResetOTP = async (
  data: VerifyResetOTPData,
): Promise<VerifyResetOTPResponse> => {
  const response = await api.post<VerifyResetOTPResponse>(
    "/auth/verify-reset-otp",
    data,
  );

  return response.data;
};

export const resetPassword = async (
  data: ResetPasswordData,
): Promise<{ message: string }> => {
  const response = await api.post<{ message: string }>(
    "/auth/reset-password",
    { password: data.password },
    {
      headers: {
        Authorization: `Bearer ${data.resetToken}`,
      },
    },
  );

  return response.data;
};
