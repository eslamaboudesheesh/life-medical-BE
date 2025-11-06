/* eslint-disable prettier/prettier */
import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from './schemas/user.schema';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  //  Only Admin can view all users
  @Get()
  @Roles(UserRole.ADMIN)
  getAllUsers() {
    return this.usersService.getAllUsers();
  }

  //  Only Admin can assign roles
  @Patch(':id/role')
  @Roles(UserRole.ADMIN)
  updateUserRole(@Param('id') id: string, @Body() body: { role: UserRole }) {
    return this.usersService.updateUserRole(id, body.role);
  }
}
