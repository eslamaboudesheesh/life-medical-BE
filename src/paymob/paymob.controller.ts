/* eslint-disable prettier/prettier */
import { Controller, Post, Body, Headers, UnauthorizedException } from '@nestjs/common';
import { PaymobService } from './paymob.service';

@Controller('webhooks')
export class PaymobController {
    constructor(private paymob: PaymobService) { }

    @Post('paymob')
    async handleWebhook(
        @Body() body: any,
        @Headers('hmac') hmac: string,
    ) {
        if (!this.paymob.verifyHmac(body, hmac)) {
            throw new UnauthorizedException('Invalid HMAC signature');
        }

        if (body.obj?.success === true) {
            const merchantOrderId = body.obj.order.merchant_order_id;

            const parts = merchantOrderId.split('-');
            const companyId = parts[1];
            const plan = parts[2];

            await this.paymob.applySubscription(companyId, plan);
        }

        return { message: 'Webhook processed' };
    }

}
