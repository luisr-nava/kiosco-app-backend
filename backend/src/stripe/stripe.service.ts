import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { envs } from '../config/envs';

@Injectable()
export class StripeService {
  public stripe: Stripe;
  constructor() {
    this.stripe = new Stripe(envs.stripeScretKey);
  }
}
