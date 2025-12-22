import { PlanName as Plan } from '../../auth-client/interfaces/jwt-payload.interface';

export enum PlanFeature {
  CREATE_SHOP = 'create_shop',
  CREATE_EMPLOYEE = 'create_employee',
  ADVANCED_REPORTS = 'advanced_reports',
}

export type PlanLimitKey = 'shops' | 'employees';

export const PLAN_FEATURES: Record<Plan, PlanFeature[]> = {
  FREE: [PlanFeature.CREATE_SHOP],
  PRO: [
    PlanFeature.CREATE_SHOP,
    PlanFeature.CREATE_EMPLOYEE,
    PlanFeature.ADVANCED_REPORTS,
  ],
  BUSINESS: [
    PlanFeature.CREATE_SHOP,
    PlanFeature.CREATE_EMPLOYEE,
    PlanFeature.ADVANCED_REPORTS,
  ],
};

export const PLAN_LIMITS: Record<Plan, Record<PlanLimitKey, number>> = {
  FREE: {
    shops: 1,
    employees: 1,
  },
  PRO: {
    shops: 3,
    employees: 10,
  },
  BUSINESS: {
    shops: 50,
    employees: 200,
  },
};
