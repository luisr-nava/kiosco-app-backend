import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Observable } from 'rxjs';
import { JwtPayload } from '../../auth-client/interfaces/jwt-payload.interface';
import {
  LIMIT_KEY,
  REQUIRED_FEATURES_KEY,
  SKIP_SUBSCRIPTION_KEY,
} from './plan.decorators';
import { PlanValidationService } from './plan-validation.service';

@Injectable()
export class SubscriptionInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly planValidator: PlanValidationService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const skip = this.reflector.getAllAndOverride<boolean>(
      SKIP_SUBSCRIPTION_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (skip) {
      return next.handle();
    }

    const request = context
      .switchToHttp()
      .getRequest<{ user?: JwtPayload }>();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Auth token required');
    }

    this.planValidator.ensureAppKey(user);
    this.planValidator.ensureActiveSubscription(user.subscriptionStatus);
    const plan = this.planValidator.resolvePlan(user);

    const features =
      this.reflector.getAllAndOverride(REQUIRED_FEATURES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) || [];
    if (features.length) {
      this.planValidator.ensurePlanAllows(plan, features);
    }

    const limitKey = this.reflector.getAllAndOverride(LIMIT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (limitKey) {
      await this.planValidator.ensureWithinLimit(plan, limitKey, user);
    }

    return next.handle();
  }
}
