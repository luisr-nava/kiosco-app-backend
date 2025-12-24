import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type {
  JwtPayload,
  PlanName,
  SubscriptionStatus,
} from '../../auth-client/interfaces/jwt-payload.interface';
import { PrismaService } from '../../prisma/prisma.service';
import {
  PLAN_FEATURES,
  PLAN_LIMITS,
  PlanFeature,
  PlanLimitKey,
} from './plan.constants';

@Injectable()
export class PlanValidationService {
  constructor(private readonly prisma: PrismaService) {}

  ensureAppKey(user: JwtPayload) {
    if (user.appKey !== 'kiosco') {
      throw new UnauthorizedException('Invalid app key');
    }
  }

  ensureActiveSubscription(status?: SubscriptionStatus) {
    if ((status ?? '').toString().toLowerCase() !== 'active') {
      throw new ForbiddenException('Subscription is not active');
    }
  }

  ensurePlanAllows(plan: PlanName, features: PlanFeature[]) {
    const allowed = PLAN_FEATURES[plan] ?? [];
    const missing = features.filter((feature) => !allowed.includes(feature));
    if (missing.length) {
      throw new ForbiddenException('Plan does not allow this action');
    }
  }

  async ensureWithinLimit(
    plan: PlanName,
    limit: PlanLimitKey,
    user: JwtPayload,
  ) {
    const ownerId = this.resolveOwnerId(user);
    const limits = PLAN_LIMITS[plan];
    if (!limits) {
      throw new ForbiddenException('Plan limits not configured');
    }

    const current = await this.countForLimit(limit, ownerId);
    if (current >= limits[limit]) {
      throw new ForbiddenException(
        `Plan limit reached for ${limit}: ${limits[limit]}`,
      );
    }
  }

  resolvePlan(user: JwtPayload): PlanName {
    const plan = user.plan?.toUpperCase() as PlanName | undefined;
    if (!plan || !(plan in PLAN_FEATURES)) {
      throw new ForbiddenException('Plan not provided or not supported');
    }
    return plan;
  }

  private resolveOwnerId(user: JwtPayload): string {
    if (user.role === 'OWNER') return user.id;
    if (user.ownerId) return user.ownerId;
    throw new ForbiddenException('Owner context required for plan checks');
  }

  private async countForLimit(limit: PlanLimitKey, ownerId: string) {
    if (limit === 'shops') {
      return this.prisma.shop.count({ where: { ownerId } });
    }
    if (limit === 'employees') {
      return this.prisma.employee.count({
        where: {
          employeeShops: {
            some: {
              shop: { ownerId },
            },
          },
        },
      });
    }
    return 0;
  }
}
