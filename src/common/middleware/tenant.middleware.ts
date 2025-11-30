/* eslint-disable prettier/prettier */
import { Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
import { CompanyService } from 'src/company/company.service';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
    constructor(private readonly companyService: CompanyService) { }

    async use(req: any, res: any, next: () => void) {
        const host = req.headers.host; // pharmacy1.life-medical.com OR localhost:3000

        // Extract subdomain
        const subdomain = host.split('.')[0];

        // If running on localhost → skip tenancy
        if (host.includes('localhost')) {
            req.companyId = null;
            return next();
        }

        // If hitting main domain (public pages)
        if (subdomain === 'life-medical-store') {
            req.companyId = null;
            return next();
        }

        // Otherwise: This is a company tenant request
        const company = await this.companyService.findBySubdomain(subdomain);

        if (!company) {
            throw new NotFoundException(`Company (${subdomain}) not found`);
        }

        req.companyId = company._id.toString();
        req.subdomain = company.subdomain;

        next();
    }
}
