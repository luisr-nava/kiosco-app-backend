export type UserRole = 'EMPLOYEE' | 'OWNER';

export interface JwtPayload {
  id: string;
  role: UserRole;
  projectId: string;
  iat?: number;
  exp?: number;
  email?: string;
}
