/* eslint-disable prettier/prettier */
import { IsEnum } from 'class-validator';
import { SubscriptionPlan } from 'src/super-admin/dto/subscription.dto';

export class ChoosePlanDto {
    @IsEnum(SubscriptionPlan)
    plan: SubscriptionPlan;
}
