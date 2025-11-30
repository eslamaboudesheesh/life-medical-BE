/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Company } from './schemas/company.schema';
import { Model } from 'mongoose';

@Injectable()
export class CompanyService {
    constructor(
        @InjectModel(Company.name) private companyModel: Model<Company>,
    ) { }

    generateSubdomain(name: string): string {
        return name
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');
    }

    async createCompany(name: string) {
        const subdomain = this.generateSubdomain(name);

        return this.companyModel.create({
            name,
            subdomain,
            isActive: true,
            subscription: {
                name: 'free',
                expiresAt: null,
            }
        });
    }

    async findBySubdomain(subdomain: string) {
        return this.companyModel.findOne({ subdomain });
    }

    async findById(id: string) {
        return this.companyModel.findById(id);
    }

    // SUPER ADMIN — Get All Companies
    async getAllCompanies() {
        return this.companyModel.find().sort({ createdAt: -1 });
    }

    // SUPER ADMIN — Activate / Deactivate Company
    async updateActiveStatus(id: string, isActive: boolean) {
        const company = await this.companyModel.findById(id);
        if (!company) throw new NotFoundException('Company not found');

        company.isActive = isActive;
        return company.save();
    }

    // SUPER ADMIN — Update Subscription
    async updateSubscription(id: string, plan: string, expiresAt: Date | null) {
        const company = await this.companyModel.findById(id);
        if (!company) throw new NotFoundException('Company not found');

        company.subscription.plan = plan;
        company.subscription.expiresAt = expiresAt;

        return company.save();
    }

}
