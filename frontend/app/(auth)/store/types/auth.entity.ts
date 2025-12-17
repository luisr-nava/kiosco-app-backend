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

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  projectId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setAuth: (data: {
    user: User;
    token: string;
    refreshToken?: string;
    projectId: string;
  }) => void;
  setUser: (user: User) => void;
  setProjectId: (projectId: string) => void;
  clearAuth: () => void;
  checkAuth: () => void;
  hydrate: () => void;
}
