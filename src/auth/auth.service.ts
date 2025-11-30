/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { CompanySignupDto } from './dto/company-signup.dto';
import { CompanyService } from 'src/company/company.service';
import { UserRole } from 'src/users/schemas/user.schema';
import { TenantUserSignupDto } from './dto/tenant-user-signup.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private companyService: CompanyService,
  ) { }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    return this.generateToken(user);
  }

  private generateToken(user: any) {
    const payload = {
      sub: user._id,
      email: user.email,
      role: user.role,
      companyId: user.company,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: user.company.toString(),
      },
    };
  }

  // Create Company + Owner
  async companySignup(dto: CompanySignupDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new BadRequestException('Email already in use');

    const company = await this.companyService.createCompany(dto.companyName);

    const hashed = await bcrypt.hash(dto.password, 10);

    const user = await this.usersService.createUser({
      name: dto.name,
      email: dto.email,
      password: hashed,
      role: UserRole.OWNER,
      company: company._id.toString(),
    });

    const payload = {
      sub: user._id,
      email: user.email,
      role: user.role,
      companyId: company._id,
      subdomain: company.subdomain,
    };

    return {
      message: 'Company created successfully',
      company,
      user,
      access_token: this.jwtService.sign(payload),
      loginUrl: `https://${company.subdomain}.life-medical.com/login`,
    };
  }

  // Employee Signup
  async tenantUserSignup(dto: TenantUserSignupDto, companyFromReq?: string) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new BadRequestException('Email already in use');

    const subdomain = dto.companySubdomain || companyFromReq;
    if (!subdomain)
      throw new BadRequestException('Company subdomain is required');

    const company = await this.companyService.findBySubdomain(subdomain);
    if (!company) throw new BadRequestException('Company not found');

    const hashed = await bcrypt.hash(dto.password, 10);

    const user = await this.usersService.createUser({
      name: dto.name,
      email: dto.email,
      password: hashed,
      role: UserRole.EMPLOYEE,
      company: company._id.toString(),
    });

    const payload = {
      sub: user._id,
      email: user.email,
      role: user.role,
      companyId: company._id,
      subdomain: company.subdomain,
    };

    return {
      message: 'User created successfully',
      company,
      user,
      access_token: this.jwtService.sign(payload),
    };
  }
}
