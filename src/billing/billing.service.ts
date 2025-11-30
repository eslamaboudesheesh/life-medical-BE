/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Company } from 'src/company/schemas/company.schema';
import { Model } from 'mongoose';
import { SubscriptionPlan } from 'src/super-admin/dto/subscription.dto';
import axios from 'axios';

@Injectable()
export class BillingService {
    constructor(
        @InjectModel(Company.name) private companyModel: Model<Company>
    ) { }

    async getSubscription(companyId: string) {
        const company = await this.companyModel.findById(companyId);
        if (!company) throw new NotFoundException('Company not found');
        return company.subscription;
    }

    async startCheckout(companyId: string, plan: SubscriptionPlan) {
        // 👇 هنا هتربط Stripe / Paymob / Tap / Fawry إلخ
        // return session_url → الشركة تدفع

        const priceMap = {
            free: 0,
            basic: 100,
            pro: 300,
            enterprise: 1000,
        };

        const amount = priceMap[plan];

        return {
            message: 'Checkout session created',
            amount,
            plan,
            paymentUrl: `https://example.com/pay?companyId=${companyId}&plan=${plan}`
        };
    }

    // هذا endpoint يتم استدعاؤه من webhook بعد الدفع
    async activatePlan(companyId: string, plan: SubscriptionPlan, months: number = 1) {
        const company = await this.companyModel.findById(companyId);
        if (!company) throw new NotFoundException('Company not found');

        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + months);

        const isValid = expiresAt && new Date(expiresAt) > new Date();

        company.subscription = {
            plan,
            expiresAt,
            isActive: isValid,
        };

        company.isActive = isValid;  

      

        return company.save();
    }


    async createCheckoutSession(companyId: string, plan: string, months: number, user: any) {
        const priceMap = {
            basic: 200,
            pro: 500,
            enterprise: 1000,
        };

        const amount = priceMap[plan];
        if (!amount) {
            throw new Error(`Invalid plan: ${plan}`);
        }
  // 1) Create Order
  const order = await axios.post(
    'https://accept.paymob.com/api/ecommerce/orders',
    {
      auth_token: process.env.PAYMOB_API_KEY,
      delivery_needed: false,
      amount_cents: amount * 100,
      merchant_order_id: `${companyId}-${plan}-${months}`
    }
  );

  const orderId = order.data.id;

  // 2) Create Payment Key
  const paymentKey = await axios.post(
    'https://accept.paymob.com/api/acceptance/payment_keys',
    {
      auth_token: process.env.PAYMOB_API_KEY,
      amount_cents: amount * 100,
      expiration: 3600,
      order_id: orderId,
      billing_data: {
          first_name: user.firstName || "User",
          last_name: user.lastName || "Subscription",
          email: user.email || "no-email@domain.com",
          phone_number: user.phone || "01000000000",
      },
      integration_id: process.env.PAYMOB_INTEGRATION_ID_CARD
    }
  );

  const token = paymentKey.data.token;

  // 3) Return iframe URL
  return {
    iframe: `${process.env.PAYMOB_IFRAME_URL}?payment_token=${token}`
  };
}



}
