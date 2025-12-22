export type UserRole = 'EMPLOYEE' | 'OWNER' | 'MANAGER';
export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'trialing';
export type PlanName = 'FREE' | 'PRO' | 'BUSINESS';

export interface JwtPayload {
  id: string;
  role: UserRole;
  projectId: string;
  appKey?: string;
  ownerId?: string;
  plan?: PlanName;
  subscriptionStatus?: SubscriptionStatus;
  iat?: number;
  exp?: number;
  email?: string;
}
