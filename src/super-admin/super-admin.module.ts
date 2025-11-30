/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { SuperAdminService } from './super-admin.service';
import { SuperAdminController } from './super-admin.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Company, CompanySchema } from 'src/company/schemas/company.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Company.name, schema: CompanySchema }])
    ],
    controllers: [SuperAdminController],
    providers: [SuperAdminService],
})
export class SuperAdminModule { }
