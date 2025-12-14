import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Post,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { StripeService } from './stripe.service';
import { AuthClientService } from '../auth-client/auth-client.service';
import { JwtAuthGuard } from '../auth-client/guards/jwt-auth.guard';
import { GetUser } from '../auth-client/decorators/get-user.decorator';
import type { JwtPayload } from '../auth-client/interfaces/jwt-payload.interface';

type CheckoutPlan = 'premium' | 'pro';

@Controller('billing')
@UseGuards(JwtAuthGuard)
export class BillingController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly authClientService: AuthClientService,
  ) {}

  @Post('checkout-session')
  async createCheckoutSession(
    @Req() req,
    @Body('plan') plan: CheckoutPlan,
    @GetUser() user: JwtPayload,
  ) {
    if (!['premium', 'pro'].includes(plan)) {
      throw new BadRequestException('Plan de suscripción inválido');
    }

    const token = this.extractBearerToken(req);
    const fullUser = await this.authClientService.validateToken(token);

    if (!fullUser || fullUser.role !== 'OWNER') {
      throw new ForbiddenException(
        'Solo el propietario puede gestionar la facturación',
      );
    }

    let stripeCustomerId = fullUser.stripeCustomerId;

    if (!stripeCustomerId) {
      // Crear el cliente en Stripe y persistirlo en el microservicio de auth
      const customer = await this.stripeService.stripe.customers.create({
        email: fullUser.email,
        name: fullUser.fullName ?? fullUser.name,
        metadata: {
          ownerId: fullUser.id ?? user.id,
          projectId: user.projectId,
        },
      });

      stripeCustomerId = customer.id;
      await this.authClientService.updateUser(fullUser.id ?? user.id, {
        stripeCustomerId,
      });
    }

    const priceId =
      plan === 'premium'
        ? 'price_1Sd1IACTG6UDElXuO25nEcoW'
        : 'price_1SdJOWCTG6UDElXuqzVb2zqJ';

    const session = await this.stripeService.stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: stripeCustomerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/billing/cancel`,
      metadata: {
        ownerId: user.id,
        projectId: user.projectId,
        plan,
      },
    });

    return { url: session.url };
  }

  private extractBearerToken(req: any): string {
    const authHeader = req.headers?.authorization;
    if (!authHeader) {
      throw new BadRequestException('Falta el token de autorización');
    }
    const [, token] = authHeader.split(' ');
    if (!token) {
      throw new BadRequestException('Token de autorización inválido');
    }
    return token;
  }
}
