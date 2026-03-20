export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  role: string;
}

export interface LoginStepOneResponse {
  requiresTwoFactor: boolean;
  email: string;
  message: string;
  accessToken?: string;
  refreshToken?: string;
  role?: string;
  userId?: number;
  trustedDeviceToken?: string;
}

export interface FullAuthResponse {
  accessToken: string;
  refreshToken: string;
  email: string;
  role: string;
  userId: number;
  trustedDeviceToken?: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  role: string;
}