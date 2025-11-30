/* eslint-disable prettier/prettier */
import { Injectable} from '@nestjs/common';
import axios from 'axios';
import { CompanyService } from 'src/company/company.service';
import { PaymobHmacUtil } from './utils/hmac.util';

@Injectable()
export class PaymobService {
    constructor(private companyService: CompanyService) { }

    PAYMOB_API_KEY = process.env.PAYMOB_API_KEY;
    PAYMOB_INTEGRATION_ID = process.env.PAYMOB_INTEGRATION_ID;
    HMAC_SECRET = process.env.PAYMOB_HMAC_KEY;
    FRAME_ID = process.env.PAYMOB_IFRAME_ID;

    // 1) AUTH TOKEN
    async getAuthToken() {
        const res = await axios.post(
            'https://accept.paymob.com/api/auth/tokens',
            { api_key: this.PAYMOB_API_KEY }
        );
        return res.data.token;
    }

    // 2) CREATE ORDER
    async createOrder(companyId: string, plan: string, amount: number) {
        const token = await this.getAuthToken();

        const merchantOrderId = `company-${companyId}-${plan}-${Date.now()}`;

        const res = await axios.post(
            'https://accept.paymob.com/api/ecommerce/orders',
            {
                auth_token: token,
                delivery_needed: false,
                merchant_order_id: merchantOrderId,
                amount_cents: amount * 100,
                currency: 'EGP',
                items: [],
            }
        );

        return { orderId: res.data.id, merchantOrderId };
    }

    // 3) PAYMENT KEY
    async getPaymentKey(orderId: number, amount: number, user: any) {
        const token = await this.getAuthToken();

        const res = await axios.post(
            'https://accept.paymob.com/api/acceptance/payment_keys',
            {
                auth_token: token,
                amount_cents: amount * 100,
                expiration: 3600,
                order_id: orderId,
                billing_data: {
                    first_name: user.firstName || "User",
                    last_name: user.lastName || "Subscription",
                    email: user.email || "no-email@domain.com",
                    phone_number: user.phone || "01000000000",
                    country: 'EG',
                },
                currency: 'EGP',
                integration_id: Number(this.PAYMOB_INTEGRATION_ID),
            }
        );

        return res.data.token;
    }

    // 4) VERIFY HMAC
    verifyHmac(body: any, receivedHmac: string): boolean {
        return PaymobHmacUtil.verify(body, receivedHmac, this.HMAC_SECRET);
    }

    // 5) Calculate expiry date based on plan
    calculateExpiry(plan: string) {
        const date = new Date();
        if (plan === 'basic') date.setMonth(date.getMonth() + 1);
        if (plan === 'pro') date.setMonth(date.getMonth() + 3);
        if (plan === 'enterprise') date.setFullYear(date.getFullYear() + 1);
        return date;
    }

    // 6) Handle successful payment → upgrade company
    async applySubscription(companyId: string, plan: string) {
        const expiresAt = this.calculateExpiry(plan);
        return this.companyService.updateSubscription(companyId, plan, expiresAt);
    }
}
