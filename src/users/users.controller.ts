/* eslint-disable prettier/prettier */
import { Controller, Get, Patch, Param, Body, UseGuards, Delete, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from './schemas/user.schema';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@ApiBearerAuth()
@ApiTags('Users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) { }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({ summary: 'Get all users inside the same company' })
  getCompanyUsers(@Req() req: any) {
    return this.usersService.getUsersByCompany(req.user.companyId);
  }

  @Patch(':userId/role')
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({ summary: 'Update user role inside the same company' })
  updateRole(@Param('userId') userId: string, @Body() body: { role: UserRole }, @Req() req) {
    return this.usersService.updateUserRole(userId, body.role, req.user.companyId);
  }


  @Delete(':userId')
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({ summary: 'Delete user inside the company' })
  delete(@Param('userId') userId: string, @Req() req) {
    return this.usersService.deleteUser(userId, req.user.companyId);
  }
}
