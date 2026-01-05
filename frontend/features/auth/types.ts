export interface LoginResponse {
  token: string;
  user: User;
  ownerId: string;
  plan: string;
  subscriptionStatus: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  lastLogin: string;
  isVerify: boolean;
  failedLoginAttempts: number;
}

export interface RegisterResponse {
  message: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  ownerId?: string;
  plan: string;
  subscriptionStatus: string;
  isLoading: boolean;

  // Actions
  setAuth: (data: {
    user: User;
    token: string;
    ownerId?: string;
    plan: string;
    subscriptionStatus: string;
  }) => void;
  setUser: (user: User) => void;
  clearAuth: () => void;
  checkAuth: () => void;
  hydrate: () => void;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}
export interface RegisterFormData {
  fullName: string;
  email: string;
  password: string;
  role?: string;
}

export interface RegisterActionPayload extends RegisterFormData {
  verifyPassword: string;
}

