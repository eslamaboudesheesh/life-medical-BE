/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { PaymobService } from './paymob.service';
import { PaymobController } from './paymob.controller';
import { CompanyModule } from 'src/company/company.module';

@Module({
    imports: [CompanyModule],
    controllers: [PaymobController],
    providers: [PaymobService],
    exports: [PaymobService],
})
export class PaymobModule { }
