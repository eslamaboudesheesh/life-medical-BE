/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { Company, CompanySchema } from 'src/company/schemas/company.schema';
import { UsersModule } from 'src/users/users.module'; 
import { PaymobModule } from 'src/paymob/paymob.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Company.name, schema: CompanySchema },
        ]),
        UsersModule, 
        PaymobModule
    ],
    controllers: [BillingController],
    providers: [BillingService],
    exports: [BillingService],
})
export class BillingModule { }
