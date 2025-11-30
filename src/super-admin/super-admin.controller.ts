/* eslint-disable prettier/prettier */
import { Controller, Get, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { SuperAdminService } from './super-admin.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UserRole } from 'src/users/schemas/user.schema';
import { UpdateCompanyStatusDto } from './dto/update-company-status.dto';
import { UpdateSubscriptionDto } from './dto/subscription.dto';

@Controller('super-admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SuperAdminController {
    constructor(private superAdminService: SuperAdminService) { }

    @Get('companies')
    @Roles(UserRole.SUPER_ADMIN)
    getAll() {
        return this.superAdminService.getAll();
    }

    @Patch('company/:id/status')
    @Roles(UserRole.SUPER_ADMIN)
    updateStatus(
        @Param('id') id: string,
        @Body() dto: UpdateCompanyStatusDto,
    ) {
        return this.superAdminService.setCompanyStatus(id, dto.isActive);
    }


    @Patch('company/:id/subscription')
    @Roles(UserRole.SUPER_ADMIN)
    updateSubscription(
        @Param('id') id: string,
        @Body() dto: UpdateSubscriptionDto,
    ) {
        return this.superAdminService.setSubscription(
            id,
            dto.plan,
            dto.expiresAt ? new Date(dto.expiresAt) : null,
        );
    }

}
