/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsISO8601, IsOptional } from 'class-validator';

export enum SubscriptionPlan {
    FREE = 'free',
    BASIC = 'basic',
    PRO = 'pro',
    ENTERPRISE = 'enterprise',
}

export class UpdateSubscriptionDto {
    @ApiProperty({
        example: 'pro',
        enum: SubscriptionPlan,
        description: 'Subscription plan (free, basic, pro, enterprise)',
    })
    @IsEnum(SubscriptionPlan, {
        message: 'plan must be one of: free, basic, pro, enterprise'
    })
    plan: SubscriptionPlan;

    @ApiProperty({
        example: '2025-12-31T23:59:59.000Z',
        required: false,
        description: 'Expiration date (ISO format), optional',
    })
    @IsOptional()
    @IsISO8601({}, { message: 'expiresAt must be a valid ISO date string' })
    expiresAt?: string;   // date as string (ISO)
}
