/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Body, Req, UseGuards, Param } from '@nestjs/common';
import { ChoosePlanDto } from './dto/choose-plan.dto';
import { BillingService } from './billing.service';
import { PaymobService } from 'src/paymob/paymob.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { UserRole } from 'src/users/schemas/user.schema';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('billing')
export class BillingController {
    constructor(private billingService: BillingService,
        private paymob: PaymobService

    ) { }

    // 1) Get company subscription info
    @Get('subscription')
    getMySubscription(@Req() req: any) {
        return this.billingService.getSubscription(req.user.companyId);
    }

    // 2) Start checkout (pay for plan)
    @Post('subscribe')
    async subscribe(
        @Req() req: any,
        @Body() dto: ChoosePlanDto
    ) {
        return this.billingService.startCheckout(
            req.user.companyId,
            dto.plan
        );
    }


    @Get('checkout/:plan')
    @UseGuards(JwtAuthGuard)
    @Roles(UserRole.OWNER)
    async createCheckout(
        @Param('plan') plan: string,
        @Req() req: any
    ) {
        const companyId = req.user.companyId;

        const amount = plan === 'basic' ? 200 :
            plan === 'pro' ? 500 :
                1000;

        const { merchantOrderId, orderId } = await this.paymob.createOrder(companyId, plan, amount);

        const paymentKey = await this.paymob.getPaymentKey(orderId, amount, {
            email: req.user.email,
            firstName: req.user.firstName,
            lastName: req.user.lastName,
            phone: req.user.phone
        });

        return {
            iframe_url: `https://accept.paymob.com/api/acceptance/iframes/${process.env.PAYMOB_IFRAME_ID}?payment_token=${paymentKey}`,
            merchantOrderId,
            orderId
        };
    }



}
