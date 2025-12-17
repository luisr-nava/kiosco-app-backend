export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
  projectId: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  isVerify: boolean;
  failedLoginAttempts: number;
  twoFactorEnabled: boolean;
  planType?: string;
  subscriptionPlan?: string;
  subscriptionType?: string;
}

export interface RegisterResponse {
  message: string;
  projectId: string;
}
