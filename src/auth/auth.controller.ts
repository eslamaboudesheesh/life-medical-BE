/* eslint-disable prettier/prettier */
import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { signInDto } from './dto/signIn.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CompanySignupDto } from './dto/company-signup.dto';
import { TenantUserSignupDto } from './dto/tenant-user-signup.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  // LOGIN
  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  login(@Body() body: signInDto) {
    return this.authService.login(body.email, body.password);
  }

  // COMPANY SIGNUP  (Owner)
  @Post('company-signup')
  @ApiOperation({ summary: 'Create new company + owner account' })
  companySignup(@Body() dto: CompanySignupDto) {
    return this.authService.companySignup(dto);
  }

  // TENANT SIGNUP (Employee)
  @Post('tenant-signup')
  @ApiOperation({ summary: 'Signup user inside specific company' })
  tenantSignup(@Body() dto: TenantUserSignupDto, @Req() req: any) {

   // TODO :  get company from subdomain header host
    
    const companyFromReq = req.headers['x-company-subdomain'];
    return this.authService.tenantUserSignup(dto, companyFromReq);
  }

  // PROFILE
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('profile')
  getProfile(@Req() req) {
    return req.user;
  }
}
