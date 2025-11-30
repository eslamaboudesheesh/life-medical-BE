/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Company } from 'src/company/schemas/company.schema';
import { Model } from 'mongoose';

@Injectable()
export class SuperAdminService {
    constructor(
        @InjectModel(Company.name) private companyModel: Model<Company>,
    ) { }

    getAll() {
        return this.companyModel.find().sort({ createdAt: -1 });
    }

    async setCompanyStatus(id: string, isActive: boolean) {
        const company = await this.companyModel.findById(id);
        if (!company) throw new NotFoundException('Company not found');

        company.isActive = isActive;
        return company.save();
    }

    async setSubscription(id: string, plan: string, expiresAt: Date | null) {
        const company = await this.companyModel.findById(id);
        if (!company) throw new NotFoundException('Company not found');

        const isValid = expiresAt && new Date(expiresAt) > new Date();

        company.subscription = {
            plan,
            expiresAt,
            isActive: isValid,   
        };

        company.isActive = isValid;  

        return company.save();
    }

}
