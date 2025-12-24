import { SetMetadata } from '@nestjs/common';
import { PlanFeature, PlanLimitKey } from './plan.constants';

export const SKIP_SUBSCRIPTION_KEY = 'plan:skip-check';
export const REQUIRED_FEATURES_KEY = 'plan:features';
export const LIMIT_KEY = 'plan:limit';

export const SkipSubscriptionCheck = () =>
  SetMetadata(SKIP_SUBSCRIPTION_KEY, true);
export const RequirePlanFeatures = (...features: PlanFeature[]) =>
  SetMetadata(REQUIRED_FEATURES_KEY, features);
export const RequirePlanLimit = (limit: PlanLimitKey) =>
  SetMetadata(LIMIT_KEY, limit);
