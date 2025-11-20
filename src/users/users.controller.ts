/* eslint-disable prettier/prettier */
import { Controller, Get, Patch, Param, Body, UseGuards, Delete } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
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

  //  Get all users
  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all registered users (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'List of all users',
    schema: {
      example: [
        {
          _id: '6737ac2f6a52b41...',
          name: 'Eslam Aboudesheesh',
          email: 'eslam@gmail.com',
          role: 'ADMIN',
          createdAt: '2025-11-07T21:10:00.000Z',
          userId: 123
        },
        {
          _id: '6737ac2f6a52b42...',
          name: 'Omar Hassan',
          email: 'omar@gmail.com',
          role: 'EMPLOYEE',
          createdAt: '2025-11-07T21:15:00.000Z',
          userId: 124
        },
      ],
    },
  })
  @ApiResponse({ status: 403, description: 'Forbidden. Only Admins can access this route.' })
  getAllUsers() {
    return this.usersService.getAllUsers();
  }

  //  Update user role
  @Patch(':userId/role')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a user role (Admin only)' })
  @ApiParam({
    name: 'userId',
    description: 'User ID',
    example: '6737ac2f6a52b41...',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        role: {
          type: 'string',
          enum: ['ADMIN', 'MANAGER', 'EMPLOYEE'],
          example: 'MANAGER',
          description: 'New role for the user',
        },
      },
      required: ['role'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'User role updated successfully',
    schema: {
      example: {
        message: 'Role updated successfully',
        user: {
          _id: '6737ac2f6a52b41...',
          name: 'Omar Hassan',
          email: 'omar@gmail.com',
          role: 'MANAGER',
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Forbidden. Only Admins can change roles.' })
  updateUserRole(@Param('userId') userId: number, @Body() body: { role: UserRole }) {
    return this.usersService.updateUserRole(userId, body.role);
  }

  @Delete(':userId')
  deleteUser(@Param('userId') userId: number) {
    return this.usersService.deleteUser(userId);
  }

}
